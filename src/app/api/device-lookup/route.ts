import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface DeviceLookupResult {
  // ── Calibration (fed into Gemini sensitivity engine) ──────────────────────
  deviceModel: string;
  brandName: string;
  deviceTier: 'budget' | 'mid' | 'flagship';
  measuredLatencyMs: number;
  measuredSwipeSpeed: number;
  gyroStabilityScore: number;
  chipset: string;
  displayHz: number;
  touchSamplingHz: number;
  gyroSensor: string;
  summary: string;
  // ── Tactical spec card fields (fills the Stitch template) ─────────────────
  displaySpecs: string;       // e.g. "6.55" AMOLED, 120Hz, 1080×2400, 800 nits"
  chipsetInfo: string;        // e.g. "Snapdragon 865, 7nm, Adreno 650"
  memoryStorageConfig: string; // e.g. "8GB/12GB RAM · 128GB/256GB UFS 3.1"
  cameraSpecs: string;        // e.g. "48MP + 16MP + 8MP Triple · 4K60fps"
  batteryChargingInfo: string; // e.g. "4510 mAh · 30W Warp Charge"
  gyroDataDisplay: string;    // e.g. "Bosch BMI160 · 96% Stability · Premium"
  samplingRateDisplay: string; // e.g. "240Hz Touch · 1.18× Speed Scale · Fast"
  latencyDataDisplay: string;  // e.g. "65ms Avg Latency · Excellent Response"
  refreshRate: string;         // e.g. "120Hz"
  batteryCapacity: string;     // e.g. "4510mAh"
  chargeSpeed: string;         // e.g. "30W"
}

export async function POST(req: NextRequest) {
  try {
    const { deviceModel } = await req.json();

    if (!deviceModel || typeof deviceModel !== 'string' || deviceModel.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Device model is required.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Gemini API not configured.' }, { status: 500 });
    }

    const result = await lookupDeviceWithGemini(apiKey, deviceModel.trim());
    return NextResponse.json({ success: true, device: result });

  } catch (error: any) {
    console.error('[DeviceLookup] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to look up device.' },
      { status: 500 }
    );
  }
}

async function lookupDeviceWithGemini(apiKey: string, deviceModel: string): Promise<DeviceLookupResult> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  });

  const prompt = `
You are a mobile hardware expert and gaming analyst. Research the device "${deviceModel}" deeply and return comprehensive specs.

Fill ALL fields for a tactical gaming spec card AND calibration values for a PUBG sensitivity system.

CALIBRATION RULES:
- measuredLatencyMs (50–200): Flagship AMOLED 120hz+ → 50–80ms | Mid AMOLED 60-90hz → 80–120ms | Budget LCD → 120–180ms
- measuredSwipeSpeed (0.80–1.25): 240Hz+ touch → 1.10–1.25 | Standard mid → 0.95–1.05 | Budget → 0.80–0.90
- gyroStabilityScore (0.00–1.00): Premium Sony/Bosch → 0.90–0.98 | Mid sensors → 0.70–0.85 | Budget → 0.50–0.65
- deviceTier: "flagship" if SD8 Gen1+/A15+/D9000+ | "mid" if SD7xx/D8xx/Exynos1xxx | "budget" otherwise

SPEC CARD FORMATTING RULES (keep compact, 1-2 lines each):
- displaySpecs: Include size, panel type, resolution, max refresh rate, brightness if known (e.g. '6.55" AMOLED · 120Hz · FHD+ · 800 nits')
- chipsetInfo: Chip name + process node + GPU (e.g. 'Snapdragon 865 · 7nm · Adreno 650')
- memoryStorageConfig: RAM options + storage options + storage type (e.g. '8/12GB RAM · 128/256GB UFS 3.1')
- cameraSpecs: Main sensor + ultra-wide + tele if any + video (e.g. '48MP+16MP+8MP · 4K@60fps')
- batteryChargingInfo: Capacity + wired charging + wireless if any (e.g. '4510mAh · 30W Warp · No Wireless')
- gyroDataDisplay: Sensor brand/model + stability score + quality label (e.g. 'Bosch BMI160 · 96% Stability · Precise')
- samplingRateDisplay: Touch sampling Hz + swipe multiplier + speed label (e.g. '240Hz Touch · 118% Speed · Fast')
- latencyDataDisplay: Latency ms + response label (e.g. '65ms Avg · Excellent Response')
- refreshRate: Just the number + Hz (e.g. '120Hz')
- batteryCapacity: Just capacity (e.g. '4510mAh')
- chargeSpeed: Wired charging wattage (e.g. '30W')

RESPOND WITH EXACTLY THIS JSON (no other text, no markdown):
{
  "deviceModel": "<corrected official model name>",
  "brandName": "<brand only e.g. OnePlus>",
  "deviceTier": "<flagship|mid|budget>",
  "measuredLatencyMs": <integer 50-200>,
  "measuredSwipeSpeed": <float 0.80-1.25>,
  "gyroStabilityScore": <float 0.00-1.00>,
  "chipset": "<chipset name>",
  "displayHz": <integer>,
  "touchSamplingHz": <integer>,
  "gyroSensor": "<sensor model>",
  "summary": "<2-sentence gaming performance summary>",
  "displaySpecs": "<compact display spec>",
  "chipsetInfo": "<compact chipset info>",
  "memoryStorageConfig": "<compact RAM/storage>",
  "cameraSpecs": "<compact camera spec>",
  "batteryChargingInfo": "<compact battery info>",
  "gyroDataDisplay": "<gyro display string>",
  "samplingRateDisplay": "<touch sampling display string>",
  "latencyDataDisplay": "<latency display string>",
  "refreshRate": "<e.g. 120Hz>",
  "batteryCapacity": "<e.g. 4510mAh>",
  "chargeSpeed": "<e.g. 30W>"
}
  `.trim();

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const clean = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
  const parsed: DeviceLookupResult = JSON.parse(clean);

  // Safety clamps for calibration values
  parsed.measuredLatencyMs  = Math.max(40,  Math.min(220,  Math.round(parsed.measuredLatencyMs)));
  parsed.measuredSwipeSpeed = Math.max(0.80, Math.min(1.25, parseFloat(Number(parsed.measuredSwipeSpeed).toFixed(2))));
  parsed.gyroStabilityScore = Math.max(0.0,  Math.min(1.0,  parseFloat(Number(parsed.gyroStabilityScore).toFixed(2))));

  return parsed;
}
