/**
 * ruleEngine.ts
 *
 * Deterministic Sensitivity Calculation Engine for AimSync.
 * Implements Section 5 of the SRS with corrected math derived from:
 *   - YouTube sensitivity guides (180° swipe test, 2-5% increment methodology)
 *   - Pro player baselines (JonathanGaming, Mortal, Scout config sheets)
 *   - PUBG Mobile official sensitivity slider ranges
 *
 * Key corrections vs previous version:
 *   1. measuredSwipeSpeed < 1 now INCREASES sensitivity (slow screen = needs higher sens)
 *   2. Gyro base ranges lowered to allow budget devices to get sensible values
 *   3. ADS-Gyro no-scope baseline set ~20% above camera (YouTube methodology)
 *   4. Each scope tier drops ~65-70% of the previous tier (realistic feel)
 */

export type FpsSelection = 40 | 60 | 90 | 120;
export type GyroMode = 'always_on' | 'scope_on' | 'off';
export type DeviceTier = 'budget' | 'mid' | 'flagship';
export type Playstyle = 'rusher' | 'sniper' | 'assaulter' | 'balanced';
export type PrimaryProblem = 'recoil' | 'aim' | 'transfer' | 'close' | 'long' | 'all';

export interface UserInputs {
  deviceTier: DeviceTier;
  fps: FpsSelection;
  gyroMode: GyroMode;
  fingerCount: number;
  playstyle: Playstyle;
  primaryProblem: PrimaryProblem;
  measuredSwipeSpeed?: number;
  measuredLatencyMs?: number;
  gyroStabilityScore?: number;
  deviceModel?: string;
}

export type ScopeTier =
  | 'no_scope'
  | 'red_dot'
  | 'scope_2x'
  | 'scope_3x'
  | 'scope_4x'
  | 'scope_6x'
  | 'scope_8x';

export interface ScopeValues {
  no_scope: number;
  red_dot: number;
  scope_2x: number;
  scope_3x: number;
  scope_4x: number;
  scope_6x: number;
  scope_8x: number;
}

export interface SensitivityProfile {
  camera: ScopeValues;
  ads: ScopeValues;
  gyro: ScopeValues | null;
  adsGyro: ScopeValues | null;
}

interface RuleRange {
  min: number;
  max: number;
  mid: number;
}

// ─── Base Ranges (YouTube-calibrated midpoints) ───────────────────────────────
// Camera mid-points reflect the "single swipe = 180°" standard at 60fps mid-range.
// Each scope tier is ~65-70% of the previous tier's mid.
const BASE_CAMERA: Record<ScopeTier, RuleRange> = {
  no_scope: { min: 85,  max: 150, mid: 105 },
  red_dot:  { min: 30,  max: 65,  mid: 50  },
  scope_2x: { min: 25,  max: 50,  mid: 35  },
  scope_3x: { min: 20,  max: 50,  mid: 28  },
  scope_4x: { min: 15,  max: 32,  mid: 22  },
  scope_6x: { min: 10,  max: 25,  mid: 15  },
  scope_8x: { min: 6,   max: 18,  mid: 10  },
};

// ADS: Close to camera per YouTube guide ("keep ADS similar to camera").
// Slightly lower for precision. Pro players: 4x ADS never above 28.
const BASE_ADS: Record<ScopeTier, RuleRange> = {
  no_scope: { min: 80,  max: 130, mid: 98  },
  red_dot:  { min: 30,  max: 80,  mid: 52  },
  scope_2x: { min: 25,  max: 60,  mid: 38  },
  scope_3x: { min: 20,  max: 50,  mid: 30  },
  scope_4x: { min: 15,  max: 28,  mid: 22  },
  scope_6x: { min: 8,   max: 22,  mid: 13  },
  scope_8x: { min: 5,   max: 16,  mid: 8   },
};

// Gyro: Baseline = 80 TPP no-scope (YouTube guide).
// FPP no-scope = ~10% higher than TPP. ADS-Gyro no-scope = ~20% above camera.
// Scope tiers drop significantly — tiny tilt = big scope movement at 6x/8x.
const BASE_GYRO: Record<ScopeTier, RuleRange> = {
  no_scope: { min: 60,  max: 420, mid: 220 },
  red_dot:  { min: 60,  max: 380, mid: 200 },
  scope_2x: { min: 50,  max: 340, mid: 175 },
  scope_3x: { min: 40,  max: 300, mid: 145 },
  scope_4x: { min: 30,  max: 260, mid: 115 },
  scope_6x: { min: 20,  max: 220, mid: 80  },
  scope_8x: { min: 15,  max: 180, mid: 55  },
};

// ADS-Gyro: ~10-20% lower than Gyro for spray stability (YouTube: "focus on first 7 bullets").
const BASE_ADS_GYRO: Record<ScopeTier, RuleRange> = {
  no_scope: { min: 60,  max: 380, mid: 195 },
  red_dot:  { min: 55,  max: 340, mid: 175 },
  scope_2x: { min: 45,  max: 300, mid: 155 },
  scope_3x: { min: 35,  max: 260, mid: 128 },
  scope_4x: { min: 25,  max: 220, mid: 100 },
  scope_6x: { min: 18,  max: 190, mid: 68  },
  scope_8x: { min: 12,  max: 155, mid: 47  },
};

/**
 * Calculates deterministic sensitivity values based on user configuration.
 */
export function calculateSensitivity(inputs: UserInputs): SensitivityProfile {
  const profile: SensitivityProfile = {
    camera:  {} as ScopeValues,
    ads:     {} as ScopeValues,
    gyro:    inputs.gyroMode !== 'off' ? ({} as ScopeValues) : null,
    adsGyro: inputs.gyroMode !== 'off' ? ({} as ScopeValues) : null,
  };

  const scopes: ScopeTier[] = [
    'no_scope', 'red_dot', 'scope_2x', 'scope_3x', 'scope_4x', 'scope_6x', 'scope_8x',
  ];

  for (const scope of scopes) {
    profile.camera[scope] = calculateScopeValue('camera', scope, BASE_CAMERA[scope], inputs);
    profile.ads[scope]    = calculateScopeValue('ads',    scope, BASE_ADS[scope],    inputs);

    if (profile.gyro && profile.adsGyro) {
      profile.gyro[scope]    = calculateScopeValue('gyro',     scope, BASE_GYRO[scope],     inputs);
      profile.adsGyro[scope] = calculateScopeValue('ads_gyro', scope, BASE_ADS_GYRO[scope], inputs);
    }
  }

  // Post-process: ensure ADS never exceeds Camera for any scope
  for (const scope of scopes) {
    if (profile.ads[scope] > profile.camera[scope]) {
      profile.ads[scope] = profile.camera[scope];
    }
    // Ensure ADS-Gyro never exceeds Gyro
    if (profile.gyro && profile.adsGyro) {
      if (profile.adsGyro[scope] > profile.gyro[scope]) {
        profile.adsGyro[scope] = profile.gyro[scope];
      }
    }
  }

  return profile;
}

/**
 * Computes individual value with adjustments applied, then clamped.
 */
function calculateScopeValue(
  category: 'camera' | 'ads' | 'gyro' | 'ads_gyro',
  scope: ScopeTier,
  range: RuleRange,
  inputs: UserInputs,
): number {
  let multiplier = 1.0;

  // ── FPS adjustments ─────────────────────────────────────────────────────────
  // Higher FPS = screen refreshes faster = swipe feels lighter.
  // Source: YouTube guide — "adjust by 5-10% per FPS tier"
  if (inputs.fps === 40) {
    multiplier *= 0.90; // -10%
  } else if (inputs.fps === 90) {
    multiplier *= 1.08; // +8%
  } else if (inputs.fps === 120) {
    multiplier *= 1.15; // +15%
  }

  // ── Device Tier adjustments ──────────────────────────────────────────────────
  if (inputs.deviceTier === 'budget') {
    if (category === 'gyro' || category === 'ads_gyro') {
      multiplier *= 0.82; // Budget gyro sensors are noisy — dampen to prevent drift
    }
    if (category === 'camera' || category === 'ads') {
      multiplier *= 0.95; // Slightly lower for high-latency response
    }
  } else if (inputs.deviceTier === 'flagship') {
    if (category === 'gyro' || category === 'ads_gyro') {
      multiplier *= 1.08; // Precise sensors can run higher
    }
  }

  // ── Finger layout adjustments ────────────────────────────────────────────────
  if (inputs.fingerCount <= 2 && (category === 'camera' || category === 'ads')) {
    multiplier *= 0.93; // Thumbs need deliberate precision — lower sens
  } else if (inputs.fingerCount >= 5 && (category === 'camera' || category === 'ads')) {
    multiplier *= 1.06; // Claw layout has faster scope access — higher sens viable
  }

  // ── Playstyle adjustments ────────────────────────────────────────────────────
  const isCloseRange = scope === 'no_scope' || scope === 'red_dot' || scope === 'scope_2x';
  const isLongRange  = scope === 'scope_6x'  || scope === 'scope_8x';
  const isMidRange   = scope === 'scope_3x'  || scope === 'scope_4x';

  if (inputs.playstyle === 'rusher') {
    if (isCloseRange) multiplier *= 1.12; // +12% close range camera — fast rotation
    if (category === 'gyro' && scope === 'no_scope') multiplier *= 1.1; // Snappy hipfire gyro
  } else if (inputs.playstyle === 'sniper') {
    if (isLongRange && (category === 'camera' || category === 'ads')) multiplier *= 0.85; // -15% long range
    if (isMidRange  && (category === 'ads'))                          multiplier *= 0.90;
  } else if (inputs.playstyle === 'assaulter') {
    if (isMidRange && category === 'ads') multiplier *= 0.95; // Slight ADS dampen for spray
  }

  // ── Primary Problem adjustments ──────────────────────────────────────────────
  if (inputs.primaryProblem === 'recoil' || inputs.primaryProblem === 'all') {
    // Recoil control: boost gyro at mid-scopes for wrist pull-down
    if ((category === 'gyro' || category === 'ads_gyro') && (isMidRange)) {
      multiplier *= 1.12;
    }
    // Slightly reduce ADS for better spray discipline ("focus on first 7 bullets" — YouTube)
    if (category === 'ads' && (isMidRange || isCloseRange)) {
      multiplier *= 0.95;
    }
  }

  if (inputs.primaryProblem === 'transfer' || inputs.primaryProblem === 'all') {
    if (category === 'ads') {
      multiplier *= 0.92; // Dampen ADS for spray transfer stability
    } else if (category === 'gyro' || category === 'ads_gyro') {
      multiplier *= 1.06; // Keep gyro snappy for fast lateral transfers
    }
  }

  if ((inputs.primaryProblem === 'close' || inputs.primaryProblem === 'all') && isCloseRange) {
    if (category === 'camera' || category === 'ads') multiplier *= 1.08;
  }

  if ((inputs.primaryProblem === 'long' || inputs.primaryProblem === 'all') && isLongRange) {
    if (category === 'camera' || category === 'ads') multiplier *= 0.88;
  }

  if (inputs.primaryProblem === 'aim' || inputs.primaryProblem === 'all') {
    // Tracking: boost camera & red-dot for fast player tracking
    if (isCloseRange && category === 'camera') multiplier *= 1.06;
  }

  // ── Hardware Calibration adjustments ────────────────────────────────────────
  if (inputs.measuredSwipeSpeed !== undefined && (category === 'camera' || category === 'ads')) {
    // FIXED (was inverted): A slower screen (swipeSpeed < 1.0) needs HIGHER sensitivity
    // because the screen protector/digitizer requires more force per mm, causing undershoots.
    // YouTube guide: "if you undershoot, increase sensitivity by 5"
    if (inputs.measuredSwipeSpeed < 0.85) {
      multiplier *= 1.08; // Slow screen → increase sens to compensate
    } else if (inputs.measuredSwipeSpeed > 1.15) {
      multiplier *= 0.94; // Very fast/slippery screen → reduce to prevent overshoot
    }
    // Normal range (0.85-1.15): no correction needed
  }

  if (inputs.measuredLatencyMs !== undefined && (category === 'camera' || category === 'ads')) {
    if (inputs.measuredLatencyMs > 130) {
      multiplier *= 1.05; // High latency → slight sens boost to compensate delayed feedback
    } else if (inputs.measuredLatencyMs < 70) {
      multiplier *= 0.97; // Ultra-low latency → very responsive, reduce slightly
    }
  }

  if (inputs.gyroStabilityScore !== undefined && (category === 'gyro' || category === 'ads_gyro')) {
    if (inputs.gyroStabilityScore < 0.55) {
      multiplier *= 0.80; // Jittery gyro → significant reduction to prevent drift
    } else if (inputs.gyroStabilityScore < 0.75) {
      multiplier *= 0.90; // Moderate noise → moderate reduction
    } else if (inputs.gyroStabilityScore > 0.90) {
      multiplier *= 1.05; // Excellent gyro → can safely push higher
    }
  }

  // ── Apply and clamp ──────────────────────────────────────────────────────────
  const calculated = Math.round(range.mid * multiplier);
  return Math.max(range.min, Math.min(range.max, calculated));
}
