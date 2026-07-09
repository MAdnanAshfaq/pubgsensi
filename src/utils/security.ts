import { UserInputs } from './ruleEngine';

// ─────────────────────────────────────────────────────────────────────────────
// Schema Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface DeviceLookupBody {
  deviceModel: string;
}

export interface FeedbackBody {
  slug: string;
  score: 'too_slow' | 'perfect' | 'too_fast';
}

export interface GenerateBody extends UserInputs {
  deviceModel?: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation & Sanitization Methods
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates and sanitizes device-lookup request bodies.
 * Rejects unexpected properties, checks type constraints, and strips HTML tags.
 */
export function validateDeviceLookup(body: any): ValidationResult<DeviceLookupBody> {
  if (typeof body !== 'object' || body === null) {
    return { success: false, error: 'Invalid request body structure.' };
  }

  const allowedKeys = ['deviceModel'];
  const bodyKeys = Object.keys(body);
  const unexpectedKeys = bodyKeys.filter((k) => !allowedKeys.includes(k));
  if (unexpectedKeys.length > 0) {
    return { success: false, error: `Unexpected parameters: ${unexpectedKeys.join(', ')}` };
  }

  const { deviceModel } = body;

  if (typeof deviceModel !== 'string') {
    return { success: false, error: 'deviceModel must be a string.' };
  }

  const trimmed = deviceModel.trim();
  if (trimmed.length < 2 || trimmed.length > 100) {
    return { success: false, error: 'deviceModel must be between 2 and 100 characters.' };
  }

  // XSS prevention: strip HTML tags
  const sanitized = trimmed.replace(/<[^>]*>/g, '');

  return {
    success: true,
    data: { deviceModel: sanitized }
  };
}

/**
 * Validates and sanitizes feedback submission request bodies.
 * Restricts slug formats and forces known score enums.
 */
export function validateFeedback(body: any): ValidationResult<FeedbackBody> {
  if (typeof body !== 'object' || body === null) {
    return { success: false, error: 'Invalid request body structure.' };
  }

  const allowedKeys = ['slug', 'score'];
  const bodyKeys = Object.keys(body);
  const unexpectedKeys = bodyKeys.filter((k) => !allowedKeys.includes(k));
  if (unexpectedKeys.length > 0) {
    return { success: false, error: `Unexpected parameters: ${unexpectedKeys.join(', ')}` };
  }

  const { slug, score } = body;

  if (typeof slug !== 'string') {
    return { success: false, error: 'slug must be a string.' };
  }

  if (!/^[a-f0-9]{8}$/i.test(slug)) {
    return { success: false, error: 'slug format is invalid.' };
  }

  const allowedScores = ['too_slow', 'perfect', 'too_fast'];
  if (typeof score !== 'string' || !allowedScores.includes(score)) {
    return { success: false, error: 'score must be either too_slow, perfect, or too_fast.' };
  }

  return {
    success: true,
    data: { slug, score: score as any }
  };
}

/**
 * Validates and sanitizes profile generation request bodies.
 * Restricts parameters to exact game values, sizes, and enums.
 */
export function validateGenerate(body: any): ValidationResult<GenerateBody> {
  if (typeof body !== 'object' || body === null) {
    return { success: false, error: 'Invalid request body structure.' };
  }

  const allowedKeys = [
    'deviceTier', 'fps', 'gyroMode', 'fingerCount', 'playstyle',
    'primaryProblem', 'measuredSwipeSpeed', 'measuredLatencyMs',
    'gyroStabilityScore', 'deviceModel', 'deviceInput'
  ];
  const bodyKeys = Object.keys(body);
  const unexpectedKeys = bodyKeys.filter((k) => !allowedKeys.includes(k));
  if (unexpectedKeys.length > 0) {
    return { success: false, error: `Unexpected parameters: ${unexpectedKeys.join(', ')}` };
  }

  const {
    deviceTier, fps, gyroMode, fingerCount, playstyle, primaryProblem,
    measuredSwipeSpeed, measuredLatencyMs, gyroStabilityScore, deviceModel, deviceInput
  } = body;

  const allowedTiers = ['budget', 'mid', 'flagship'];
  if (deviceTier !== undefined && (!allowedTiers.includes(deviceTier) || typeof deviceTier !== 'string')) {
    return { success: false, error: 'deviceTier must be either budget, mid, or flagship.' };
  }

  const allowedFps = [40, 60, 90, 120];
  const fpsNum = Number(fps);
  if (fps !== undefined && (!allowedFps.includes(fpsNum) || isNaN(fpsNum))) {
    return { success: false, error: 'fps must be 40, 60, 90, or 120.' };
  }

  const allowedGyroModes = ['always_on', 'scope_on', 'off'];
  if (gyroMode !== undefined && (!allowedGyroModes.includes(gyroMode) || typeof gyroMode !== 'string')) {
    return { success: false, error: 'gyroMode must be always_on, scope_on, or off.' };
  }

  const fingerCountNum = Number(fingerCount);
  if (fingerCount !== undefined && (isNaN(fingerCountNum) || fingerCountNum < 2 || fingerCountNum > 6)) {
    return { success: false, error: 'fingerCount must be an integer between 2 and 6.' };
  }

  const allowedPlaystyles = ['rusher', 'sniper', 'assaulter', 'balanced'];
  if (playstyle !== undefined && (!allowedPlaystyles.includes(playstyle) || typeof playstyle !== 'string')) {
    return { success: false, error: 'playstyle must be rusher, sniper, assaulter, or balanced.' };
  }

  const allowedProblems = ['recoil', 'aim', 'transfer', 'close', 'long', 'all'];
  if (primaryProblem !== undefined && (!allowedProblems.includes(primaryProblem) || typeof primaryProblem !== 'string')) {
    return { success: false, error: 'primaryProblem must be recoil, aim, transfer, close, long, or all.' };
  }

  if (measuredSwipeSpeed !== undefined) {
    const s = Number(measuredSwipeSpeed);
    if (isNaN(s) || s < 0.1 || s > 5.0) {
      return { success: false, error: 'measuredSwipeSpeed must be a number between 0.1 and 5.0.' };
    }
  }

  if (measuredLatencyMs !== undefined) {
    const l = Number(measuredLatencyMs);
    if (isNaN(l) || l < 1 || l > 1000) {
      return { success: false, error: 'measuredLatencyMs must be an integer between 1 and 1000.' };
    }
  }

  if (gyroStabilityScore !== undefined) {
    const g = Number(gyroStabilityScore);
    if (isNaN(g) || g < 0.0 || g > 1.0) {
      return { success: false, error: 'gyroStabilityScore must be a float between 0.0 and 1.0.' };
    }
  }

  const rawModel = deviceModel || deviceInput;
  let sanitizedModel: string | undefined;
  if (rawModel !== undefined) {
    if (typeof rawModel !== 'string') {
      return { success: false, error: 'deviceModel/deviceInput must be a string.' };
    }
    const trimmed = rawModel.trim();
    if (trimmed.length > 100) {
      return { success: false, error: 'deviceModel/deviceInput length cannot exceed 100 characters.' };
    }
    sanitizedModel = trimmed.replace(/<[^>]*>/g, '');
  }

  return {
    success: true,
    data: {
      deviceTier: deviceTier || 'mid',
      fps: (fpsNum as any) || 60,
      gyroMode: gyroMode || 'always_on',
      fingerCount: fingerCountNum || 4,
      playstyle: playstyle || 'balanced',
      primaryProblem: primaryProblem || 'recoil',
      measuredSwipeSpeed: measuredSwipeSpeed !== undefined ? Number(measuredSwipeSpeed) : undefined,
      measuredLatencyMs: measuredLatencyMs !== undefined ? Number(measuredLatencyMs) : undefined,
      gyroStabilityScore: gyroStabilityScore !== undefined ? Number(gyroStabilityScore) : undefined,
      deviceModel: sanitizedModel
    }
  };
}
