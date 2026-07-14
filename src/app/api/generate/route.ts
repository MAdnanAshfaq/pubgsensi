import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { calculateSensitivity, UserInputs, SensitivityProfile } from '@/utils/ruleEngine';
import { getFallbackExplanations, FallbackExplanations } from '@/utils/fallbacks';
import { saveResult } from '@/utils/db';
import { rateLimit } from '@/utils/rateLimit';
import { validateGenerate } from '@/utils/security';

export const runtime = 'edge';

// Gemini timeout
const LLM_TIMEOUT_MS = 22000;

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
// callGeminiExpert – the core AI sensitivity generation
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
      // Lowered from 0.7 to 0.25 — sensitivity generation is a math problem,
      // not a creative task. Less hallucination, tighter accuracy.
      temperature: 0.25,
    },
  });

  const calibrationContext  = buildCalibrationContext(inputs);
  const deviceAnchor        = buildDeviceAnchor(inputs, deviceName);
  const gyroActive          = inputs.gyroMode !== 'off';

  const prompt = `
You are a professional PUBG Mobile / BGMI esports coach and sensitivity specialist.
You have spent 10,000+ hours testing sensitivities across hundreds of phone models.
You know the exact relationship between sensitivity numbers and real in-game feel.

Your job: Generate REAL, WORKING, TESTED sensitivity values for this player. These numbers
will be applied directly in-game and tested in a shooting range simulator.

⚠️ CRITICAL RULES — BREAK ANY OF THESE AND THE CONFIG WILL FEEL TERRIBLE:

RULE 1: ADS sensitivity MUST be equal to or LOWER than camera sensitivity for EVERY scope.
  Camera no-scope=105 → ADS no-scope must be ≤105 (typically 90-100)

RULE 2: ADS-Gyro no-scope should be approximately 20% HIGHER than the camera no-scope value.
  Reason: Your reaction ADS-gyro needs to be faster than camera to compensate for response lag.
  Camera no-scope=105 → ADS-Gyro no-scope ≈ 120-130 (but within valid gyro range)

RULE 3: Each scope tier should be roughly 65-70% of the previous tier.
  Camera: no-scope=105 → red_dot≈50 → 2x≈35 → 3x≈28 → 4x≈22 → 6x≈15 → 8x≈10
  NEVER let scope tiers be close to each other (e.g., 3x=28 and 4x=27 is WRONG)

RULE 4: ADS 4x must NEVER exceed 28. Pro players NEVER go above 28 on 4x ADS.
  Reason: 4x is for mid-range sprays. Too high = crosshair flies off target.

RULE 5: Gyro ADS-Gyro values must ALWAYS be 10-20% LOWER than Gyro for each scope.
  Reason: ADS-Gyro fires with weapon; lower = better spray stability ("control first 7 bullets")

RULE 6: Gyro no-scope (TPP) baseline = 70-120 for budget, 120-200 for mid, 180-280 for flagship.
  FPP gyro ≈ TPP gyro + 10%. (The game reports same no_scope for both; use TPP as base)

════════════════════════════════════════════════════════════════
METHODOLOGY — HOW PROS ACTUALLY SET SENSITIVITY
════════════════════════════════════════════════════════════════

METHOD 1: CAMERA CALIBRATION (180° Swipe Test)
  Goal: One natural swipe across right half of screen = 180° horizontal turn.
  If aim OVERSHOOTS: decrease camera by 2-5 per test iteration.
  If aim UNDERSHOOTS: increase camera by 2-5 per test iteration.
  This means camera no-scope range for most players: 85-130.

METHOD 2: ADS CALIBRATION
  Keep ADS values CLOSE to camera values (within 10-15 difference per scope).
  Exception: 4x and higher scopes where precision matters more — ADS should be 8-12 LOWER than camera.
  For semi-auto/sniper rifles: ADS at 1-4x can be lowered by 3-5 extra for pinpoint shots.
  For moving vehicles tracking: camera no-scope + 4% is good practice.

METHOD 3: GYRO CALIBRATION
  Adjust in 5-10% increments.
  Start with a baseline of 80 for TPP no-scope, 90 for FPP no-scope.
  Gyro should feel like it naturally counteracts recoil when you tilt DOWN slightly.
  If gyro makes aim drift sideways = too high. If recoil still climbs = too low.

METHOD 4: ADS-GYRO CALIBRATION  
  ADS-Gyro no-scope should be ~20% HIGHER than camera no-scope.
  Reason: reacting faster during ADS-firing requires snappier gyro response.
  But ADS-Gyro must still be lower than Gyro by 10-15% for stability during sprays.
  Focus: the ADS-Gyro values must control the first 7 bullets of a clip consistently.

════════════════════════════════════════════════════════════════
PLAYER + HARDWARE PROFILE
════════════════════════════════════════════════════════════════

Device:          ${deviceName ? `"${deviceName}"` : `(Unknown – use ${inputs.deviceTier} tier defaults)`}
Device Tier:     ${inputs.deviceTier.toUpperCase()} – ${deviceTierDescription(inputs.deviceTier)}
Target FPS:      ${inputs.fps} FPS
Gyroscope Mode:  ${inputs.gyroMode === 'always_on' ? 'ALWAYS ON – gyro controls camera + recoil' : inputs.gyroMode === 'scope_on' ? 'SCOPE ONLY – gyro activates on ADS' : 'DISABLED – 100% finger control'}
Finger Layout:   ${inputs.fingerCount}-finger ${inputs.fingerCount >= 5 ? 'claw (fast scope access, higher sens viable)' : inputs.fingerCount <= 2 ? 'thumb (deliberate swipes, lower sens needed)' : 'hybrid claw'}
Combat Role:     ${inputs.playstyle.toUpperCase()} – ${playstyleDescription(inputs.playstyle)}
Primary Problem: ${inputs.primaryProblem === 'all' ? 'ALL – full recoil control + aim improvement' : inputs.primaryProblem.toUpperCase()}

${calibrationContext}

════════════════════════════════════════════════════════════════
DEVICE-SPECIFIC STARTING POINT (apply your expertise from here)
════════════════════════════════════════════════════════════════
${deviceAnchor}

════════════════════════════════════════════════════════════════
FPS ADJUSTMENTS (apply to all baselines)
════════════════════════════════════════════════════════════════
${inputs.fps === 40  ? '40fps → subtract 8-12 from camera baseline, subtract 5-8 from ADS baseline, subtract 15-25 from gyro baseline' : ''}
${inputs.fps === 60  ? '60fps → no adjustment needed (baseline is calibrated at 60fps)' : ''}
${inputs.fps === 90  ? '90fps → add 5-8 to camera, add 3-5 to ADS, add 10-15 to gyro' : ''}
${inputs.fps === 120 ? '120fps → add 10-15 to camera, add 5-8 to ADS, add 20-30 to gyro' : ''}

════════════════════════════════════════════════════════════════
PLAYSTYLE ADJUSTMENTS (apply AFTER FPS adjustments)
════════════════════════════════════════════════════════════════
${inputs.playstyle === 'rusher'    ? 'RUSHER: camera no-scope +8-15, red_dot +5, gyro no-scope +15-20. Rushers need fast rotation.' : ''}
${inputs.playstyle === 'sniper'    ? 'SNIPER: camera 6x/8x -12-18, ADS 4x/6x/8x -8-12. Snipers need extreme long-range precision.' : ''}
${inputs.playstyle === 'assaulter' ? 'ASSAULTER: camera +3-5 overall, ADS 3x/4x -3-5 for spray discipline.' : ''}
${inputs.playstyle === 'balanced'  ? 'BALANCED: use reference values. Minor +2-3 adjustments only.' : ''}

════════════════════════════════════════════════════════════════
PRIMARY PROBLEM CORRECTIONS
════════════════════════════════════════════════════════════════
${inputs.primaryProblem === 'recoil' ? 'RECOIL FIX: reduce ADS 3x and 4x by 3-5. Increase gyro 3x/4x by 10-20 for wrist pull-down.' : ''}
${inputs.primaryProblem === 'transfer' ? 'TRANSFER FIX: reduce ADS -5 across all scopes. Increase gyro no-scope/red-dot by +10 for fast lateral movement.' : ''}
${inputs.primaryProblem === 'close' ? 'CLOSE RANGE FIX: increase camera no-scope/red-dot by +8-12. Increase ADS no-scope by +5.' : ''}
${inputs.primaryProblem === 'long' ? 'LONG RANGE FIX: reduce camera 6x/8x by -3-5. Reduce ADS 6x/8x by -2-4 for precision. Increase gyro 6x/8x by +5.' : ''}
${inputs.primaryProblem === 'aim' ? 'AIM TRACKING FIX: increase camera red-dot and no-scope by +5-8 for faster target tracking.' : ''}
${inputs.primaryProblem === 'all' ? 'FULL CALIBRATION: Apply moderate versions of all corrections above simultaneously.' : ''}

════════════════════════════════════════════════════════════════
VALID IN-GAME RANGES – HARD LIMITS (clamp everything to these)
════════════════════════════════════════════════════════════════
Camera:  No Scope 85–150 | Red Dot 30–65 | 2x 25–50 | 3x 20–50 | 4x 15–32 | 6x 10–25 | 8x 6–18
ADS:     No Scope 80–130 | Red Dot 30–80 | 2x 25–60 | 3x 20–50 | 4x 15–28  | 6x 8–22  | 8x 5–16
Gyro:    No Scope 40–420 | Red Dot 40–380| 2x 35–340| 3x 30–300| 4x 25–260 | 6x 15–220| 8x 10–180
ADS-Gyro: Same ranges as Gyro above

════════════════════════════════════════════════════════════════
SELF-VALIDATION CHECKLIST (verify before outputting)
════════════════════════════════════════════════════════════════
□ ADS[scope] ≤ Camera[scope] for every scope? YES/FIX
□ ADS 4x ≤ 28? YES/FIX
□ Each scope tier ~65-70% of previous? YES/FIX
□ Gyro no-scope in appropriate tier range? YES/FIX  
□ ADS-Gyro[scope] < Gyro[scope] for every scope? YES/FIX
□ ADS-Gyro no-scope ≈ Camera no-scope * 1.15-1.25? YES/FIX
□ All values within hard limits above? YES/FIX

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
    "camera_explanation": "<2-3 sentences: why these specific camera values for THIS device at ${inputs.fps}fps with ${inputs.fingerCount} fingers. Mention the 180° swipe calibration standard and how FPS affects the feel.>",
    "ads_explanation": "<2-3 sentences: how these ADS values directly fix their ${inputs.primaryProblem} problem. Explain why 4x ADS was set to the chosen value and how it controls the first 7 bullets of a spray.>",
    "gyro_explanation": "${gyroActive ? '<2-3 sentences: how these gyro values work with this device. Explain the wrist pull-down technique — tilt the phone down during spray to counter recoil climb. Mention the TPP/FPP baseline and why these values prevent drift.>' : 'Gyroscope is disabled for this player. All recoil control is finger-based — pull down with your aim finger during sprays.'}",
    "ads_gyro_explanation": "${gyroActive ? '<2-3 sentences: how ADS-Gyro values complement ADS during active sprays. Explain the 20% faster response rule and how to combine wrist tilt with finger drag for maximum recoil compensation on the first 7 bullets.>' : 'Gyroscope is disabled for this player.'}"
  }
}
  `.trim();

  const result = await model.generateContent(prompt);
  const text   = result.response.text();
  const clean  = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
  const parsed: GeminiFullResponse = JSON.parse(clean);

  // Safety clamp + validation
  parsed.sensitivity = clampAndValidateSensitivity(parsed.sensitivity, gyroActive);

  return parsed;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a device-specific numerical starting anchor so Gemini has a concrete
 * base to adjust FROM, preventing it from defaulting to the middle of every range.
 * Baselines derived from community resources and pro player config sheets.
 * Calibrated using the YouTube 180°-swipe-test methodology.
 */
function buildDeviceAnchor(inputs: UserInputs, deviceName: string): string {
  // [cam_ns, cam_rd, cam_2x, cam_3x, cam_4x, cam_6x, cam_8x,
  //  ads_ns, ads_rd, ads_2x, ads_3x, ads_4x, ads_6x, ads_8x,
  //  g_ns,  g_rd,   g_2x,   g_3x,   g_4x,   g_6x,   g_8x,
  //  ag_ns, ag_rd,  ag_2x,  ag_3x,  ag_4x,  ag_6x,  ag_8x]
  // Gyro baselines: TPP no-scope. ADS-Gyro no-scope ≈ Camera no-scope * 1.20
  const tbl: Record<string, Record<string, number[]>> = {
    flagship: {
      '120': [128,52,40,32,24,16,11,  112,50,38,30,22,14,10,  260,240,210,175,140,100,70,  155,145,125,105,85,60,42],
      '90':  [118,48,38,30,22,15,10,  104,46,36,28,20,13, 9,  235,218,190,158,125, 90,63,  142,132,115, 95,75,54,38],
      '60':  [108,44,35,28,21,14, 9,   96,42,33,26,19,12, 8,  212,196,170,142,112, 80,56,  130,120,105, 85,68,48,34],
      '40':  [ 98,40,32,25,19,13, 8,   87,38,30,24,17,11, 7,  188,174,152,126, 99, 71,50,  118,108, 92, 76,60,43,30],
    },
    mid: {
      '120': [118,48,38,30,22,15,10,  104,46,36,28,20,13, 9,  235,215,185,155,122, 87,61,  142,132,110, 92,73,52,37],
      '90':  [110,44,35,28,20,14, 9,   97,42,33,26,19,12, 8,  212,195,168,140,110, 78,55,  132,122,101, 85,66,47,33],
      '60':  [102,41,32,26,19,13, 8,   90,39,30,24,18,11, 7,  192,175,152,126, 98, 70,49,  122,112, 92, 76,60,42,30],
      '40':  [ 92,37,29,23,17,12, 7,   81,35,27,22,16,10, 6,  170,155,135,112, 87, 62,44,  110,100, 82, 68,54,38,27],
    },
    budget: {
      '120': [108,44,35,28,20,14, 9,   95,42,33,26,18,12, 8,  205,187,160,133, 104, 74,52,  130,120, 96, 80,62,44,31],
      '90':  [100,41,32,25,18,13, 8,   88,39,30,24,17,11, 7,  185,169,145,120,  93, 66,46,  120,110, 88, 72,56,40,28],
      '60':  [ 92,38,29,23,17,12, 7,   81,36,27,22,16,10, 6,  168,153,130,108,  84, 59,42,  110,100, 80, 64,50,36,25],
      '40':  [ 83,34,26,21,15,11, 6,   73,32,24,20,14, 9, 5,  148,135,115, 95,  74, 53,37,   99, 90, 72, 58,45,32,23],
    },
  };

  const tier = inputs.deviceTier in tbl ? inputs.deviceTier : 'mid';
  const fps  = String(inputs.fps) in tbl[tier] ? String(inputs.fps) : '60';
  const v    = tbl[tier][fps];

  const deviceLabel = deviceName
    ? `Based on "${deviceName}" (${tier} · ${fps}fps), here are the BASELINE values (calibrated using 180° swipe test):`
    : `Based on ${tier.toUpperCase()} device at ${fps}fps, here are the BASELINE values:`;

  return `${deviceLabel}

Camera baseline:   No-Scope=${v[0]} | Red-Dot=${v[1]} | 2x=${v[2]} | 3x=${v[3]} | 4x=${v[4]} | 6x=${v[5]} | 8x=${v[6]}
ADS baseline:      No-Scope=${v[7]} | Red-Dot=${v[8]} | 2x=${v[9]} | 3x=${v[10]} | 4x=${v[11]} | 6x=${v[12]} | 8x=${v[13]}
Gyro baseline:     No-Scope=${v[14]} | Red-Dot=${v[15]} | 2x=${v[16]} | 3x=${v[17]} | 4x=${v[18]} | 6x=${v[19]} | 8x=${v[20]}
ADS-Gyro baseline: No-Scope=${v[21]} | Red-Dot=${v[22]} | 2x=${v[23]} | 3x=${v[24]} | 4x=${v[25]} | 6x=${v[26]} | 8x=${v[27]}

Notice: ADS-Gyro no-scope (${v[21]}) is ~${Math.round((v[21]/v[0]-1)*100)}% higher than camera no-scope (${v[0]}). This is correct per methodology.
Apply ALL playstyle/FPS/problem adjustments above to shift these baselines. Do NOT just copy these numbers.`;
}

function buildCalibrationContext(inputs: UserInputs): string {
  const lines: string[] = ['Hardware Calibration (measured on this specific device):'];
  let hasData = false;

  if (inputs.measuredSwipeSpeed !== undefined) {
    hasData = true;
    const swipeImpact = inputs.measuredSwipeSpeed < 0.85
      ? `SLOW/HIGH-FRICTION SCREEN → INCREASE camera by ${Math.round((1 - inputs.measuredSwipeSpeed) * 25)} | INCREASE ADS by ${Math.round((1 - inputs.measuredSwipeSpeed) * 15)}. Reason: undershooting targets, need more sensitivity.`
      : inputs.measuredSwipeSpeed > 1.15
      ? `FAST/LOW-FRICTION SCREEN → DECREASE camera by ${Math.round((inputs.measuredSwipeSpeed - 1) * 25)} | DECREASE ADS by ${Math.round((inputs.measuredSwipeSpeed - 1) * 15)}. Reason: overshooting targets.`
      : 'NORMAL SCREEN → no correction needed';
    lines.push(`  Swipe Speed: ${inputs.measuredSwipeSpeed.toFixed(3)}× (${swipeImpact})`);
  }

  if (inputs.measuredLatencyMs !== undefined) {
    hasData = true;
    const latImpact = inputs.measuredLatencyMs > 130
      ? `HIGH LATENCY ${inputs.measuredLatencyMs}ms → reduce all ADS by 5-8 to compensate for delayed touch response`
      : inputs.measuredLatencyMs < 70
      ? `ULTRA-LOW LATENCY ${inputs.measuredLatencyMs}ms → very responsive device, can safely maintain or slightly reduce values`
      : `NORMAL LATENCY ${inputs.measuredLatencyMs}ms → no major correction needed`;
    lines.push(`  Touch Latency: ${inputs.measuredLatencyMs}ms (${latImpact})`);
  }

  if (inputs.gyroStabilityScore !== undefined) {
    hasData = true;
    const gyroImpact = inputs.gyroStabilityScore < 0.55
      ? `POOR GYRO (${Math.round(inputs.gyroStabilityScore * 100)}%) → reduce Gyro/ADS-Gyro by 40-60 to prevent drift. Player will feel gyro jitter.`
      : inputs.gyroStabilityScore < 0.75
      ? `MODERATE GYRO (${Math.round(inputs.gyroStabilityScore * 100)}%) → reduce Gyro/ADS-Gyro by 20-30. Small noise reduction recommended.`
      : inputs.gyroStabilityScore > 0.88
      ? `EXCELLENT GYRO (${Math.round(inputs.gyroStabilityScore * 100)}%) → sensor is clean and precise, can safely push gyro values higher.`
      : `GOOD GYRO (${Math.round(inputs.gyroStabilityScore * 100)}%) → no correction needed`;
    lines.push(`  Gyro Stability: ${(inputs.gyroStabilityScore * 100).toFixed(0)}% (${gyroImpact})`);
  }

  if (!hasData) {
    return 'Hardware Calibration: Not performed – device specs not scanned. Use tier defaults without hardware correction.';
  }
  return lines.join('\n');
}

function deviceTierDescription(tier: string): string {
  switch (tier) {
    case 'flagship': return 'flagship processor (SD8/Dimensity9000+/A-series), stable high-FPS, precise low-noise gyro sensor';
    case 'mid':      return 'mid-range processor (SD7xx/D8xx), consistent 60fps, decent gyro accuracy';
    case 'budget':   return 'budget processor, possible frame drops, noisy gyro sensor, higher touch latency (100-150ms typical)';
    default:         return tier;
  }
}

function playstyleDescription(playstyle: string): string {
  switch (playstyle) {
    case 'rusher':    return 'aggressive entry, CQB hipfire, fast 180° rotations, sprays at 10-20m';
    case 'sniper':    return 'long-range precision, bolt-action snaps, slow methodical scanning at 100-400m';
    case 'assaulter': return 'mid-range hybrid, M416/AKM spray control, compound-clearing role at 20-80m';
    case 'balanced':  return 'all-around utility – adapts between CQB and long-range depending on zone';
    default:          return playstyle;
  }
}

/**
 * Clamps Gemini output to valid PUBG Mobile in-game ranges AND enforces
 * internal consistency rules (ADS ≤ Camera, ADS-Gyro ≤ Gyro, etc.)
 */
function clampAndValidateSensitivity(
  s: GeminiFullResponse['sensitivity'],
  gyroActive: boolean,
): GeminiFullResponse['sensitivity'] {
  const ranges = {
    camera:  { no_scope:[85,150], red_dot:[30,65], scope_2x:[25,50], scope_3x:[20,50], scope_4x:[15,32], scope_6x:[10,25], scope_8x:[6,18]  },
    ads:     { no_scope:[80,130], red_dot:[30,80], scope_2x:[25,60], scope_3x:[20,50], scope_4x:[15,28], scope_6x:[8,22],  scope_8x:[5,16]  },
    gyro:    { no_scope:[40,420], red_dot:[40,380], scope_2x:[35,340], scope_3x:[30,300], scope_4x:[25,260], scope_6x:[15,220], scope_8x:[10,180] },
  } as const;

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, Math.round(v)));
  const scopes = ['no_scope','red_dot','scope_2x','scope_3x','scope_4x','scope_6x','scope_8x'] as const;

  for (const sc of scopes) {
    // Clamp to hard limits
    const [cMin, cMax] = ranges.camera[sc]; s.camera[sc] = clamp(s.camera[sc], cMin, cMax);
    const [aMin, aMax] = ranges.ads[sc];    s.ads[sc]    = clamp(s.ads[sc],    aMin, aMax);

    // Enforce: ADS ≤ Camera
    if (s.ads[sc] > s.camera[sc]) s.ads[sc] = s.camera[sc];

    if (gyroActive && s.gyro && s.adsGyro) {
      const [gMin, gMax] = ranges.gyro[sc];
      s.gyro[sc]    = clamp(s.gyro[sc],    gMin, gMax);
      s.adsGyro[sc] = clamp(s.adsGyro[sc], gMin, gMax);
      // Enforce: ADS-Gyro ≤ Gyro
      if (s.adsGyro[sc] > s.gyro[sc]) s.adsGyro[sc] = Math.round(s.gyro[sc] * 0.88);
    }
  }

  // Enforce scope tier ordering (each tier must be lower than previous, min 5% drop)
  const camScopes = ['no_scope','red_dot','scope_2x','scope_3x','scope_4x','scope_6x','scope_8x'] as const;
  for (let i = 1; i < camScopes.length; i++) {
    const prev = camScopes[i-1];
    const curr = camScopes[i];
    if (s.camera[curr] >= s.camera[prev]) {
      s.camera[curr] = Math.max(ranges.camera[curr][0], Math.round(s.camera[prev] * 0.68));
    }
    if (s.ads[curr] >= s.ads[prev]) {
      s.ads[curr] = Math.max(ranges.ads[curr][0], Math.round(s.ads[prev] * 0.68));
    }
  }

  return s;
}
