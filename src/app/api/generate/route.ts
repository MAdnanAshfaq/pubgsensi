import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { calculateSensitivity, UserInputs, SensitivityProfile } from '@/utils/ruleEngine';
import { getFallbackExplanations, FallbackExplanations } from '@/utils/fallbacks';
import { saveResult } from '@/utils/db';
import { rateLimit } from '@/utils/rateLimit';
import { validateGenerate } from '@/utils/security';

export const runtime = 'edge';

// Gemini timeout
const LLM_TIMEOUT_MS = 20000;

// ─────────────────────────────────────────────────────────────────────────────
// Type that Gemini must return
// ─────────────────────────────────────────────────────────────────────────────
interface GeminiFullResponse {
  sensitivity: {
    camera: {
      no_scope: number; red_dot: number; scope_2x: number;
      scope_3x: number; scope_4x: number; scope_6x: number; scope_8x: number;
    };
    ads: {
      no_scope: number; red_dot: number; scope_2x: number;
      scope_3x: number; scope_4x: number; scope_6x: number; scope_8x: number;
    };
    gyro: {
      no_scope: number; red_dot: number; scope_2x: number;
      scope_3x: number; scope_4x: number; scope_6x: number; scope_8x: number;
    } | null;
    adsGyro: {
      no_scope: number; red_dot: number; scope_2x: number;
      scope_3x: number; scope_4x: number; scope_6x: number; scope_8x: number;
    } | null;
  };
  explanations: {
    camera_explanation: string;
    ads_explanation: string;
    gyro_explanation: string;
    ads_gyro_explanation: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/generate
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // ── 1. Rate Limiting (IP-based, 5 requests per minute) ───────────────────
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const limitRes = rateLimit(ip, 5, 60 * 1000);

    const headers = {
      'X-RateLimit-Limit': limitRes.limit.toString(),
      'X-RateLimit-Remaining': limitRes.remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(limitRes.reset / 1000).toString(),
    };

    if (!limitRes.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again in 1 minute.' },
        {
          status: 429,
          headers: {
            ...headers,
            'Retry-After': Math.ceil((limitRes.reset - Date.now()) / 1000).toString(),
          }
        }
      );
    }

    // ── 2. Strict Input Validation & Sanitization ───────────────────────────
    const body = await req.json();
    const validation = validateGenerate(body);

    if (!validation.success || !validation.data) {
      return NextResponse.json(
        { success: false, error: validation.error || 'Invalid request body.' },
        { status: 400, headers }
      );
    }

    const validatedData = validation.data;
    const inputs: UserInputs = {
      deviceTier:          validatedData.deviceTier,
      fps:                 validatedData.fps,
      gyroMode:            validatedData.gyroMode,
      fingerCount:         validatedData.fingerCount,
      playstyle:           validatedData.playstyle,
      primaryProblem:      validatedData.primaryProblem,
      measuredSwipeSpeed:  validatedData.measuredSwipeSpeed,
      measuredLatencyMs:   validatedData.measuredLatencyMs,
      gyroStabilityScore:  validatedData.gyroStabilityScore,
      deviceModel:         validatedData.deviceModel,
    };

    const deviceName = validatedData.deviceModel || '';
    const apiKey = process.env.GEMINI_API_KEY;

    let sensitivity: SensitivityProfile;
    let explanations: FallbackExplanations;

    if (!apiKey) {
      console.warn('[AimSync] No GEMINI_API_KEY – using rule engine + fallback templates.');
      sensitivity   = calculateSensitivity(inputs);
      explanations  = getFallbackExplanations(inputs.playstyle, inputs.primaryProblem, inputs.fingerCount);
    } else {
      try {
        const geminiResult = await Promise.race([
          callGeminiExpert(apiKey, inputs, deviceName),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Gemini timed out')), LLM_TIMEOUT_MS)
          ),
        ]);

        sensitivity  = geminiResult.sensitivity as SensitivityProfile;
        explanations = geminiResult.explanations;

      } catch (err) {
        console.error('[AimSync] Gemini call failed, falling back to rule engine:', err);
        sensitivity  = calculateSensitivity(inputs);
        explanations = getFallbackExplanations(inputs.playstyle, inputs.primaryProblem, inputs.fingerCount);
      }
    }

    const randomArray = new Uint8Array(4);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(randomArray);
    } else {
      for (let i = 0; i < 4; i++) {
        randomArray[i] = Math.floor(Math.random() * 256);
      }
    }
    const slug = Array.from(randomArray, (b) => b.toString(16).padStart(2, '0')).join('');
    const saved = await saveResult(slug, inputs, sensitivity, explanations);

    return NextResponse.json({ success: true, slug: saved.slug, result: saved }, { headers });

  } catch (error: any) {
    console.error('[AimSync] Fatal error in /api/generate:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// callGeminiExpert
// ─────────────────────────────────────────────────────────────────────────────
async function callGeminiExpert(
  apiKey: string,
  inputs: UserInputs,
  deviceName: string,
): Promise<GeminiFullResponse> {

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.7,   // Enough variation to differ per device, but not hallucinate
    },
  });

  const calibrationContext  = buildCalibrationContext(inputs);
  const deviceAnchor        = buildDeviceAnchor(inputs, deviceName);
  const gyroActive          = inputs.gyroMode !== 'off';

  const prompt = `
You are a professional PUBG Mobile / BGMI esports analyst with years of competitive coaching experience.
You have spent thousands of hours testing sensitivities on specific phone hardware and you know exactly
how different chipsets, refresh rates, touch digitizers, and gyroscopes affect in-game feel.

Your job: Generate a REAL, WORKING, UNIQUE sensitivity config for this SPECIFIC player on this SPECIFIC device.

⚠️ CRITICAL: Do NOT produce generic or average values. Every input below uniquely shifts the numbers.
   A OnePlus 12 at 120fps feels COMPLETELY different from a Redmi Note 12 at 60fps.
   Your output must reflect these real hardware differences.

════════════════════════════════════════════════════════════════
PLAYER + HARDWARE PROFILE
════════════════════════════════════════════════════════════════

Device:          ${deviceName ? `"${deviceName}"` : `(Unknown – use ${inputs.deviceTier} tier defaults)`}
Device Tier:     ${inputs.deviceTier.toUpperCase()} – ${deviceTierDescription(inputs.deviceTier)}
Target FPS:      ${inputs.fps} FPS
Gyroscope Mode:  ${inputs.gyroMode === 'always_on' ? 'ALWAYS ON – gyro controls camera + recoil' : inputs.gyroMode === 'scope_on' ? 'SCOPE ONLY – gyro activates on ADS' : 'DISABLED – 100% finger control'}
Finger Layout:   ${inputs.fingerCount}-finger ${inputs.fingerCount >= 5 ? 'claw (fast scope access, higher sens viable)' : inputs.fingerCount <= 2 ? 'thumb (deliberate swipes, lower sens needed)' : 'hybrid'}
Combat Role:     ${inputs.playstyle.toUpperCase()} – ${playstyleDescription(inputs.playstyle)}
Primary Problem: ${inputs.primaryProblem === 'all' ? 'ALL – full recoil control + aim improvement' : inputs.primaryProblem.toUpperCase()}

${calibrationContext}

════════════════════════════════════════════════════════════════
DEVICE-SPECIFIC STARTING POINT (apply your expertise from here)
════════════════════════════════════════════════════════════════
${deviceAnchor}

════════════════════════════════════════════════════════════════
HOW TO PRODUCE REAL IN-GAME VALUES (follow this logic strictly)
════════════════════════════════════════════════════════════════

CAMERA sensitivity (free-look / swipe):
- Higher FPS → Camera No-Scope can be HIGHER (screen refreshes faster, swipe feels lighter)
- Budget/high-latency devices need LOWER Camera to avoid overshooting
- Rushers need higher No-Scope camera (fast rotation), Snipers need low Camera values
- 2x–8x should DROP significantly each tier: roughly 60% → 45% → 35% → 25% → 18% → 12% of No-Scope

ADS sensitivity (aim-down-sight):
- Must be lower than camera at every scope – ADS is for precision
- Recoil problems → slightly LOWER ADS values for better spray control
- Gyro users can run LOWER ADS (gyro handles fine-tuning)
- Non-gyro users need slightly HIGHER ADS (finger alone must control everything)
- Budget + high latency → reduce ADS across all scopes by 10-15%
- 4x and beyond: values must be conservative – pro players NEVER go above 30 on 4x ADS

GYRO sensitivity (physical tilt / recoil pull-down):
- ONLY for gyroMode != "off"
- Flagship + low latency + high gyro stability → can run higher gyro (more wrist control)
- Budget + low stability → lower gyro to prevent wild drift
- Gyro always_on: No-Scope gyro = ~200–350 | Scope-on only: No-Scope gyro = 180–280
- 6x and 8x gyro should be MUCH lower than No-Scope (tiny physical tilt = big scope movement)
- IMPORTANT: adsGyro values should be 10–25% LOWER than gyro for spray stability

PLAYSTYLE adjustments (shift all values by these offsets):
- Rusher:    Camera +10 to +15 | ADS +5 | Gyro No-Scope +20
- Sniper:    Camera -10 to -20 | ADS -8 to -12 | Gyro 6x/8x -20
- Assaulter: Camera +5  | ADS moderate | Gyro moderate
- Balanced:  Use reference values without major offset

FPS adjustments:
- 40fps:  Camera -10 to -15  | ADS -5  | Gyro -15 to -20
- 60fps:  No adjustment (baseline)
- 90fps:  Camera +5  | ADS +3  | Gyro +10
- 120fps: Camera +10 | ADS +5  | Gyro +20 to +30

════════════════════════════════════════════════════════════════
VALID IN-GAME RANGES (PUBG Mobile / BGMI) – HARD LIMITS
════════════════════════════════════════════════════════════════
Camera:  No Scope 85–150 | Red Dot 30–65 | 2x 25–50 | 3x 20–50 | 4x 15–32 | 6x 10–25 | 8x 6–18
ADS:     No Scope 80–130 | Red Dot 30–80 | 2x 25–60 | 3x 20–50 | 4x 15–40 | 6x 8–40   | 8x 5–26
Gyro:    No Scope 100–420| Red Dot 80–400 | 2x 80–360| 3x 60–320| 4x 50–290| 6x 30–250 | 8x 20–200
ADS-Gyro: Same as Gyro above

════════════════════════════════════════════════════════════════
OUTPUT FORMAT — RESPOND WITH ONLY THIS JSON, NO OTHER TEXT
════════════════════════════════════════════════════════════════
{
  "sensitivity": {
    "camera": {
      "no_scope": <integer>,
      "red_dot":  <integer>,
      "scope_2x": <integer>,
      "scope_3x": <integer>,
      "scope_4x": <integer>,
      "scope_6x": <integer>,
      "scope_8x": <integer>
    },
    "ads": {
      "no_scope": <integer>,
      "red_dot":  <integer>,
      "scope_2x": <integer>,
      "scope_3x": <integer>,
      "scope_4x": <integer>,
      "scope_6x": <integer>,
      "scope_8x": <integer>
    },
    "gyro": ${gyroActive ? `{
      "no_scope": <integer>,
      "red_dot":  <integer>,
      "scope_2x": <integer>,
      "scope_3x": <integer>,
      "scope_4x": <integer>,
      "scope_6x": <integer>,
      "scope_8x": <integer>
    }` : 'null'},
    "adsGyro": ${gyroActive ? `{
      "no_scope": <integer>,
      "red_dot":  <integer>,
      "scope_2x": <integer>,
      "scope_3x": <integer>,
      "scope_4x": <integer>,
      "scope_6x": <integer>,
      "scope_8x": <integer>
    }` : 'null'}
  },
  "explanations": {
    "camera_explanation": "<2-3 sentences: why exactly these camera values for THIS device at ${inputs.fps}fps with ${inputs.fingerCount} fingers. Name the device if known. Mention the FPS/latency impact.>",
    "ads_explanation": "<2-3 sentences: how these ADS values directly fix their ${inputs.primaryProblem} problem and suit ${inputs.playstyle} combat. Be specific about scope tiers.>",
    "gyro_explanation": "${gyroActive ? '<2-3 sentences: how these gyro values work with this device gyro sensor quality and stability score. Explain the wrist pull-down technique these values are designed for.>' : 'Gyroscope is disabled for this player. All sensitivity control is finger-based.'}",
    "ads_gyro_explanation": "${gyroActive ? '<2-3 sentences: how ADS-Gyro values complement ADS during active sprays. Explain when to combine wrist tilt with finger drag for maximum recoil compensation.>' : 'Gyroscope is disabled for this player.'}"
  }
}

FINAL REMINDER:
- Every number must be DIFFERENT from a generic device at different specs – that is the whole point.
- Do NOT use round numbers like 100, 200, 300 unless the logic genuinely leads there.
- The values must feel like they were crafted specifically for this device + player combination.
- Stay strictly within the valid ranges above.
  `.trim();

  const result = await model.generateContent(prompt);
  const text   = result.response.text();
  const clean  = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
  const parsed: GeminiFullResponse = JSON.parse(clean);

  // Safety clamp – catches any drift
  parsed.sensitivity = clampSensitivityProfile(parsed.sensitivity, gyroActive);

  return parsed;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a device-specific numerical starting anchor so Gemini has a concrete
 * base to adjust FROM, preventing it from defaulting to the middle of every range.
 */
function buildDeviceAnchor(inputs: UserInputs, deviceName: string): string {
  // These are realistic, proven baseline values used by pro players as documented
  // in community resources (GamerzClass, JonathanisBoss config sheets, etc.)
  const tbl: Record<string, Record<string, number[]>> = {
    //                         [cam_ns, cam_rd, cam_2x, cam_3x, cam_4x, cam_6x, cam_8x,
    //                          ads_ns, ads_rd, ads_2x, ads_3x, ads_4x, ads_6x, ads_8x,
    //                          g_ns,  g_rd,   g_2x,   g_3x,   g_4x,   g_6x,   g_8x]
    flagship: {
      '120': [130,52,42,35,25,18,12, 105,52,42,32,24,18,12, 300,280,240,200,170,120,85],
      '90':  [120,48,40,32,23,17,11, 100,48,40,30,22,17,11, 280,260,220,185,155,110,75],
      '60':  [110,44,37,30,22,16,10, 95, 44,37,28,21,16,10, 260,240,200,170,140, 95,65],
      '40':  [100,40,34,28,20,15, 9, 90, 40,34,26,20,15, 9, 230,210,180,150,120, 80,55],
    },
    mid: {
      '120': [120,48,40,32,23,17,11, 95, 48,40,30,22,17,11, 270,250,210,175,145,100,70],
      '90':  [112,44,37,30,22,16,10, 90, 44,37,28,21,16,10, 250,230,195,160,130, 90,62],
      '60':  [105,41,34,28,21,15, 9, 85, 41,34,26,20,15, 9, 230,210,175,145,118, 80,55],
      '40':  [ 95,38,32,26,19,14, 8, 80, 38,32,24,18,14, 8, 205,190,155,130,105, 70,48],
    },
    budget: {
      '120': [110,44,37,30,22,16,10, 88, 44,37,28,21,16,10, 235,215,180,150,122, 84,58],
      '90':  [103,41,34,28,20,15, 9, 83, 41,34,26,20,15, 9, 215,198,165,138,112, 76,52],
      '60':  [ 96,38,32,26,19,14, 8, 78, 38,32,24,18,14, 8, 198,180,150,125,102, 69,47],
      '40':  [ 88,35,29,24,17,13, 7, 72, 35,29,22,17,13, 7, 178,162,135,112, 90, 61,42],
    },
  };

  const tier  = inputs.deviceTier in tbl ? inputs.deviceTier : 'mid';
  const fps   = String(inputs.fps) in tbl[tier] ? String(inputs.fps) : '60';
  const v     = tbl[tier][fps];

  const deviceLabel = deviceName
    ? `Based on "${deviceName}" (${tier} · ${fps}fps), here are the BASELINE values to start from:`
    : `Based on ${tier.toUpperCase()} device at ${fps}fps, here are the BASELINE values to start from:`;

  return `${deviceLabel}

Camera baseline:  No-Scope=${v[0]} | Red-Dot=${v[1]} | 2x=${v[2]} | 3x=${v[3]} | 4x=${v[4]} | 6x=${v[5]} | 8x=${v[6]}
ADS baseline:     No-Scope=${v[7]} | Red-Dot=${v[8]} | 2x=${v[9]} | 3x=${v[10]} | 4x=${v[11]} | 6x=${v[12]} | 8x=${v[13]}
Gyro baseline:    No-Scope=${v[14]}| Red-Dot=${v[15]} | 2x=${v[16]} | 3x=${v[17]} | 4x=${v[18]} | 6x=${v[19]} | 8x=${v[20]}

NOW apply all adjustments above (playstyle, problem area, calibration data, finger count) to shift
these baselines up or down. Your final output should reflect those shifts – NOT just copy these numbers.
If the device name is known, factor in its specific chipset, touch latency, and gyro sensor quality.`;
}

function buildCalibrationContext(inputs: UserInputs): string {
  const lines: string[] = ['Hardware Calibration (measured on this specific device):'];
  let hasData = false;

  if (inputs.measuredSwipeSpeed !== undefined) {
    hasData = true;
    const swipeImpact = inputs.measuredSwipeSpeed < 0.9
      ? `SLOW SCREEN → reduce Camera No-Scope by ${Math.round((1 - inputs.measuredSwipeSpeed) * 30)} | reduce ADS No-Scope by ${Math.round((1 - inputs.measuredSwipeSpeed) * 20)}`
      : inputs.measuredSwipeSpeed > 1.1
      ? `FAST SCREEN → increase Camera No-Scope by ${Math.round((inputs.measuredSwipeSpeed - 1) * 30)} | increase ADS No-Scope by ${Math.round((inputs.measuredSwipeSpeed - 1) * 20)}`
      : 'NORMAL SCREEN → no correction needed';
    lines.push(`  Swipe Speed: ${inputs.measuredSwipeSpeed.toFixed(3)}× (${swipeImpact})`);
  }

  if (inputs.measuredLatencyMs !== undefined) {
    hasData = true;
    const latImpact = inputs.measuredLatencyMs > 130
      ? `HIGH LATENCY ${inputs.measuredLatencyMs}ms → reduce all ADS values by 8-12 to compensate for delayed response`
      : inputs.measuredLatencyMs < 70
      ? `ULTRA-LOW LATENCY ${inputs.measuredLatencyMs}ms → device is very responsive, can afford higher values`
      : `NORMAL LATENCY ${inputs.measuredLatencyMs}ms → no major correction needed`;
    lines.push(`  Touch Latency: ${inputs.measuredLatencyMs}ms (${latImpact})`);
  }

  if (inputs.gyroStabilityScore !== undefined) {
    hasData = true;
    const gyroImpact = inputs.gyroStabilityScore < 0.6
      ? `POOR GYRO (${Math.round(inputs.gyroStabilityScore * 100)}%) → reduce Gyro/ADS-Gyro by 30–50 to prevent drift`
      : inputs.gyroStabilityScore > 0.88
      ? `EXCELLENT GYRO (${Math.round(inputs.gyroStabilityScore * 100)}%) → gyro sensor is clean, can safely increase Gyro values`
      : `MODERATE GYRO (${Math.round(inputs.gyroStabilityScore * 100)}%) → small noise reduction on Gyro No-Scope recommended`;
    lines.push(`  Gyro Stability: ${(inputs.gyroStabilityScore * 100).toFixed(0)}% (${gyroImpact})`);
  }

  if (!hasData) {
    return 'Hardware Calibration: Not performed – device specs not scanned. Use tier defaults.';
  }
  return lines.join('\n');
}

function deviceTierDescription(tier: string): string {
  switch (tier) {
    case 'flagship': return 'flagship processor (SD8/Dimensity9000+/A-series), stable high-FPS, precise gyro';
    case 'mid':      return 'mid-range processor (SD7xx/D8xx), consistent 60fps, decent gyro accuracy';
    case 'budget':   return 'budget processor, possible frame drops, noisy gyro sensor, higher touch latency';
    default:         return tier;
  }
}

function playstyleDescription(playstyle: string): string {
  switch (playstyle) {
    case 'rusher':    return 'aggressive close-range, fast rotation, hipfire CQB specialist';
    case 'sniper':    return 'long-range precision, bolt-action snaps, methodical slow scanning';
    case 'assaulter': return 'mid-range hybrid, M416/AKM spray control, compound holder';
    case 'balanced':  return 'all-around utility – adapts between ranges';
    default:          return playstyle;
  }
}

// Clamp Gemini output to valid PUBG Mobile in-game ranges
function clampSensitivityProfile(s: GeminiFullResponse['sensitivity'], gyroActive: boolean): GeminiFullResponse['sensitivity'] {
  const ranges = {
    camera:  { no_scope:[85,150], red_dot:[30,65], scope_2x:[25,50], scope_3x:[20,50], scope_4x:[15,32], scope_6x:[10,25], scope_8x:[6,18]  },
    ads:     { no_scope:[80,130], red_dot:[30,80], scope_2x:[25,60], scope_3x:[20,50], scope_4x:[15,40], scope_6x:[8,40],  scope_8x:[5,26]  },
    gyro:    { no_scope:[100,420],red_dot:[80,400], scope_2x:[80,360],scope_3x:[60,320],scope_4x:[50,290],scope_6x:[30,250],scope_8x:[20,200]},
  } as const;

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, Math.round(v)));
  const scopes = ['no_scope','red_dot','scope_2x','scope_3x','scope_4x','scope_6x','scope_8x'] as const;

  for (const sc of scopes) {
    const [cMin, cMax] = ranges.camera[sc]; s.camera[sc] = clamp(s.camera[sc], cMin, cMax);
    const [aMin, aMax] = ranges.ads[sc];    s.ads[sc]    = clamp(s.ads[sc],    aMin, aMax);
    if (gyroActive && s.gyro && s.adsGyro) {
      const [gMin, gMax] = ranges.gyro[sc];
      s.gyro[sc]    = clamp(s.gyro[sc],    gMin, gMax);
      s.adsGyro[sc] = clamp(s.adsGyro[sc], gMin, gMax);
    }
  }
  return s;
}
