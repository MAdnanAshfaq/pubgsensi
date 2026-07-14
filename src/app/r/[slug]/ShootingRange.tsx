'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Target, RefreshCw, X, Smartphone, ChevronRight } from 'lucide-react';
import { UserInputs } from '@/utils/ruleEngine';

// Polyfill for CanvasRenderingContext2D.prototype.roundRect for older devices/browsers
if (typeof window !== 'undefined' && typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (
    this: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    radii?: number | number[]
  ) {
    let r = [0, 0, 0, 0];
    if (typeof radii === 'number') {
      r = [radii, radii, radii, radii];
    } else if (Array.isArray(radii)) {
      if (radii.length === 1) {
        r = [radii[0], radii[0], radii[0], radii[0]];
      } else if (radii.length === 2) {
        r = [radii[0], radii[1], radii[0], radii[1]];
      } else if (radii.length === 3) {
        r = [radii[0], radii[1], radii[2], radii[1]];
      } else if (radii.length >= 4) {
        r = [radii[0], radii[1], radii[2], radii[3]];
      }
    }
    this.moveTo(x + r[0], y);
    this.lineTo(x + w - r[1], y);
    this.quadraticCurveTo(x + w, y, x + w, y + r[1]);
    this.lineTo(x + w, y + h - r[2]);
    this.quadraticCurveTo(x + w, y + h, x + w - r[2], y + h);
    this.lineTo(x + r[3], y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r[3]);
    this.lineTo(x, y + r[0]);
    this.quadraticCurveTo(x, y, x + r[0], y);
    return this;
  };
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface ScopeState {
  no_scope_3rd: number;
  no_scope_1st: number;
  red_dot: number;
  scope_2x: number;
  scope_3x: number;
  scope_4x: number;
  scope_6x: number;
  scope_8x: number;
}

interface ShootingRangeProps {
  sensValues: {
    camera: ScopeState;
    ads: ScopeState;
    gyro: ScopeState | null;
    adsGyro: ScopeState | null;
  };
  playerInputs?: Partial<UserInputs>;
}

type GearType = 'm416' | 'akm' | 'awm' | 'uzi';
type OpticType = 'no_scope' | 'red_dot' | 'scope_3x' | 'scope_4x' | 'scope_6x';
type RangeMode = 'cqb' | 'standard' | 'mid' | 'long' | 'spray';

interface Hit {
  x: number;
  y: number;
  score: number;
  region: 'head' | 'body' | 'miss';
  timestamp: number;
}

interface WorldTarget {
  worldX: number;   // position in virtual world space (centered at 0)
  worldY: number;
  scale: number;    // size relative to base (1.0 = 10m standard)
  moving: boolean;
  moveDir: number;  // 1 or -1 for left/right drift
  moveSpeed: number;
}

// ─── Gear definitions ─────────────────────────────────────────────────────────
const GEARS: Record<GearType, { name: string; magSize: number; fireRate: number; vKick: number; hJitter: number; spread: number }> = {
  m416: { name: 'M416', magSize: 30, fireRate: 95,   vKick: 9,   hJitter: 3.5, spread: 3 },
  akm:  { name: 'AKM',  magSize: 30, fireRate: 115,  vKick: 14,  hJitter: 6,   spread: 5 },
  uzi:  { name: 'UZI',  magSize: 25, fireRate: 65,   vKick: 5.5, hJitter: 4.5, spread: 7 },
  awm:  { name: 'AWM',  magSize: 5,  fireRate: 1500, vKick: 55,  hJitter: 1,   spread: 1 },
};

// ─── Range mode configs ───────────────────────────────────────────────────────
const RANGE_CONFIGS: Record<RangeMode, {
  label: string;
  desc: string;
  defaultOptic: OpticType;
  targets: WorldTarget[];
  defaultGear: GearType;
  showMoving: boolean;
}> = {
  cqb: {
    label: 'CQB 5m',
    desc: 'Close-quarters hipfire. No scope. Fast flicks.',
    defaultOptic: 'no_scope',
    defaultGear: 'uzi',
    showMoving: false,
    targets: [
      { worldX: 0,   worldY: 0, scale: 1.8, moving: false, moveDir: 1, moveSpeed: 0 },
      { worldX: 260, worldY: 0, scale: 1.8, moving: false, moveDir: 1, moveSpeed: 0 },
      { worldX:-260, worldY: 0, scale: 1.8, moving: false, moveDir: 1, moveSpeed: 0 },
    ],
  },
  standard: {
    label: 'Mid 15m',
    desc: 'Red-Dot standard. Aim transfer practice.',
    defaultOptic: 'red_dot',
    defaultGear: 'm416',
    showMoving: true,
    targets: [
      { worldX: 0,   worldY: 0, scale: 1.2, moving: false, moveDir: 1, moveSpeed: 0 },
      { worldX: 300, worldY: 0, scale: 1.1, moving: true,  moveDir: 1, moveSpeed: 0.9 },
      { worldX:-300, worldY: 0, scale: 1.1, moving: true,  moveDir:-1, moveSpeed: 0.9 },
    ],
  },
  mid: {
    label: '3x Spray',
    desc: '3x scope M416 spray. Test recoil control.',
    defaultOptic: 'scope_3x',
    defaultGear: 'm416',
    showMoving: false,
    targets: [
      { worldX:  0,   worldY: 0, scale: 0.85, moving: false, moveDir: 1, moveSpeed: 0 },
      { worldX: 380,  worldY: 0, scale: 0.82, moving: false, moveDir: 1, moveSpeed: 0 },
    ],
  },
  long: {
    label: '6x Long',
    desc: '6x scope precision. Small head zones.',
    defaultOptic: 'scope_6x',
    defaultGear: 'awm',
    showMoving: true,
    targets: [
      { worldX:  0,   worldY: 0, scale: 0.55, moving: false, moveDir: 1, moveSpeed: 0 },
      { worldX: 500,  worldY: 0, scale: 0.50, moving: true,  moveDir: 1, moveSpeed: 0.45 },
    ],
  },
  spray: {
    label: 'Recoil Wall',
    desc: 'Full mag spray. Track bullet grouping.',
    defaultOptic: 'red_dot',
    defaultGear: 'akm',
    showMoving: false,
    targets: [
      { worldX: 0, worldY: 0, scale: 2.5, moving: false, moveDir: 1, moveSpeed: 0 },
    ],
  },
};

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function ShootingRange({ sensValues, playerInputs }: ShootingRangeProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [gear, setGear] = useState<GearType>('m416');
  const [optic, setOptic] = useState<OpticType>('red_dot');
  const [rangeMode, setRangeMode] = useState<RangeMode>('standard');
  const containerRef = useRef<HTMLDivElement>(null);

  // Pre-select default gear/optic based on player's playstyle
  useEffect(() => {
    if (!playerInputs?.playstyle) return;
    if (playerInputs.playstyle === 'rusher') {
      setRangeMode('cqb'); setGear('uzi'); setOptic('no_scope');
    } else if (playerInputs.playstyle === 'sniper') {
      setRangeMode('long'); setGear('awm'); setOptic('scope_6x');
    } else if (playerInputs.playstyle === 'assaulter') {
      setRangeMode('mid'); setGear('m416'); setOptic('scope_3x');
    }
  }, [playerInputs?.playstyle]);

  useEffect(() => {
    const check = () => setIsPortrait(window.innerHeight > window.innerWidth);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const enterFullscreen = async () => {
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const perm = await (DeviceOrientationEvent as any).requestPermission();
        if (perm !== 'granted') alert('Gyroscope permission denied. Swipe to aim instead.');
      }
      setIsFullscreen(true);
      const el = document.documentElement;
      if (el.requestFullscreen) await el.requestFullscreen();
      else if ((el as any).webkitRequestFullscreen) await (el as any).webkitRequestFullscreen();
    } catch {
      setIsFullscreen(true);
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if ((document as any).webkitFullscreenElement) await (document as any).webkitExitFullscreen();
    } catch {}
    setIsFullscreen(false);
  };

  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
    };
  }, []);

  const handleModeChange = (mode: RangeMode) => {
    setRangeMode(mode);
    const cfg = RANGE_CONFIGS[mode];
    setOptic(cfg.defaultOptic);
    setGear(cfg.defaultGear);
  };

  return (
    <div className="bg-[#1b2836]/75 border border-[#384b5c]/40 rounded-sm p-5 space-y-4">
      <div className="flex justify-between items-center border-b border-[#384b5c]/30 pb-2">
        <h3 className="font-headline text-base font-extrabold text-[#9cd8ff] tracking-wide uppercase flex items-center gap-2 select-none">
          <Target className="w-5 h-5 text-primary-yellow animate-pulse" />
          IMMERSIVE SHOOTING RANGE
        </h3>
        <span className="text-[9px] font-technical text-primary-yellow/60 uppercase tracking-widest">PUBG Training Grounds Simulator</span>
      </div>

      <p className="text-xs text-[#cbdbe6] leading-relaxed">
        Test your sensitivity with real recoil simulation. Gyro pull-down counteracts recoil — tilt your phone DOWN while firing. Swipe anywhere on canvas to aim.
      </p>

      {/* Range Mode Selector */}
      <div className="space-y-2">
        <div className="text-[10px] font-technical text-primary-yellow uppercase tracking-widest">SELECT RANGE MODE:</div>
        <div className="grid grid-cols-5 gap-1">
          {(Object.entries(RANGE_CONFIGS) as [RangeMode, typeof RANGE_CONFIGS[RangeMode]][]).map(([mode, cfg]) => (
            <button
              key={mode}
              onClick={() => handleModeChange(mode)}
              className={`py-2 px-1 rounded text-center text-[9px] font-headline font-black uppercase transition-all ${
                rangeMode === mode
                  ? 'bg-primary-yellow text-black shadow-[0_0_8px_rgba(255,215,0,0.3)]'
                  : 'bg-black/40 text-white/60 hover:bg-white/10 border border-white/10'
              }`}
            >
              {cfg.label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-white/40 font-technical">{RANGE_CONFIGS[rangeMode].desc}</p>
      </div>

      <button
        onClick={enterFullscreen}
        className="w-full bg-primary-yellow text-background font-headline font-bold py-4 rounded-xl shadow-[0_4px_16px_rgba(255,215,0,0.25)] hover:bg-white active:scale-95 transition-all uppercase tracking-wide border border-primary-yellow/20 cursor-pointer flex items-center justify-center gap-2"
      >
        ENTER SHOOTING RANGE
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="bg-black/20 border border-white/5 rounded-lg p-3 text-[10px] font-technical text-white/40 space-y-1">
        <div className="text-primary-yellow/60 font-black uppercase tracking-widest text-[9px]">How to use:</div>
        <div>• <span className="text-white/60">Swipe anywhere</span> to aim (full canvas)</div>
        <div>• <span className="text-white/60">Tap FIRE</span> to shoot — hold for auto-fire</div>
        {playerInputs?.gyroMode !== 'off' && (
          <div>• <span className="text-white/60">Tilt phone DOWN</span> while firing to counteract recoil (gyro)</div>
        )}
        <div>• <span className="text-white/60">Rotate landscape</span> for dual-thumb experience</div>
      </div>

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div
          ref={containerRef}
          className="fixed inset-0 z-50 bg-[#0c0e10] flex items-center justify-center overflow-hidden touch-none"
        >
          {isPortrait ? (
            <div className="text-center space-y-4 p-6 flex flex-col items-center">
              <Smartphone className="w-16 h-16 text-primary-yellow animate-pulse -rotate-90" />
              <h2 className="text-2xl font-headline font-black text-white uppercase tracking-widest">Rotate Your Device</h2>
              <p className="text-text-muted text-sm font-technical">Landscape mode for accurate dual-thumb control</p>
              <button onClick={exitFullscreen} className="mt-4 px-6 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10">
                Exit Range
              </button>
            </div>
          ) : (
            <GameInstance
              sensValues={sensValues}
              playerInputs={playerInputs}
              gear={gear}
              setGear={setGear}
              optic={optic}
              setOptic={setOptic}
              rangeMode={rangeMode}
              setRangeMode={handleModeChange}
              onExit={exitFullscreen}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Game Instance ────────────────────────────────────────────────────────────

function GameInstance({
  sensValues,
  playerInputs,
  gear,
  setGear,
  optic,
  setOptic,
  rangeMode,
  setRangeMode,
  onExit,
}: {
  sensValues: ShootingRangeProps['sensValues'];
  playerInputs?: Partial<UserInputs>;
  gear: GearType;
  setGear: (g: GearType) => void;
  optic: OpticType;
  setOptic: (o: OpticType) => void;
  rangeMode: RangeMode;
  setRangeMode: (m: RangeMode) => void;
  onExit: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [bulletsLeft, setBulletsLeft] = useState(GEARS[gear].magSize);
  const [isFiring, setIsFiring] = useState(false);
  const [hits, setHits] = useState<Hit[]>([]);
  const [scoreSummary, setScoreSummary] = useState<any>(null);

  // Fire button position (draggable)
  const [fireBtnPos, setFireBtnPos] = useState({ x: 60, y: typeof window !== 'undefined' ? window.innerHeight - 170 : 200 });
  const isDraggingFireBtnRef = useRef(false);

  // World position of crosshair center
  const posRef = useRef({ x: 0, y: 0 });

  // Active aim touch tracking
  const aimTouchRef = useRef<{ active: boolean; lastX: number; lastY: number; id: number }>({
    active: false, lastX: 0, lastY: 0, id: -1,
  });

  // Fire button touch id (separate from aim touch)
  const fireTouchIdRef = useRef<number>(-1);

  // Gyro
  const lastGyroRef = useRef<{ alpha: number; beta: number; gamma: number } | null>(null);

  // Game loop
  const gameLoopRef = useRef<number>(0);
  const lastFireTimeRef = useRef<number>(0);
  const isFiringRef = useRef(false);

  // Moving target state
  const targetPosRef = useRef<{ x: number; dir: number; speed: number }[]>(
    RANGE_CONFIGS[rangeMode].targets.map(t => ({ x: t.worldX, dir: t.moveDir, speed: t.moveSpeed }))
  );

  // Reset on range mode change
  useEffect(() => {
    setBulletsLeft(GEARS[gear].magSize);
    setHits([]);
    posRef.current = { x: 0, y: 0 };
    setScoreSummary(null);
    targetPosRef.current = RANGE_CONFIGS[rangeMode].targets.map(t => ({
      x: t.worldX, dir: t.moveDir, speed: t.moveSpeed,
    }));
  }, [rangeMode]);

  // Reset on gear change
  useEffect(() => {
    setBulletsLeft(GEARS[gear].magSize);
    setHits([]);
    posRef.current = { x: 0, y: 0 };
    setScoreSummary(null);
  }, [gear]);

  // ── Optic utilities ──────────────────────────────────────────────────────────
  const getOpticKey = useCallback((): keyof ScopeState => {
    switch (optic) {
      case 'no_scope': return 'no_scope_3rd';
      case 'red_dot':  return 'red_dot';
      case 'scope_3x': return 'scope_3x';
      case 'scope_4x': return 'scope_4x';
      case 'scope_6x': return 'scope_6x';
      default:         return 'red_dot';
    }
  }, [optic]);

  const getOpticZoom = useCallback(() => {
    switch (optic) {
      case 'no_scope': return 1.0;
      case 'red_dot':  return 1.25;
      case 'scope_3x': return 0.72;
      case 'scope_4x': return 0.54;
      case 'scope_6x': return 0.36;
      default:         return 1.0;
    }
  }, [optic]);

  // ── GYRO — device orientation for recoil pull-down ──────────────────────────
  useEffect(() => {
    if (!playerInputs?.gyroMode || playerInputs.gyroMode === 'off') return;

    const handle = (e: DeviceOrientationEvent) => {
      if (e.alpha === null || e.beta === null || e.gamma === null) return;
      const current = { alpha: e.alpha, beta: e.beta, gamma: e.gamma };

      if (lastGyroRef.current) {
        let dBeta  = current.beta  - lastGyroRef.current.beta;
        let dGamma = current.gamma - lastGyroRef.current.gamma;
        let dAlpha = current.alpha - lastGyroRef.current.alpha;

        if (dBeta  > 180) dBeta  -= 360; else if (dBeta  < -180) dBeta  += 360;
        if (dGamma > 180) dGamma -= 360; else if (dGamma < -180) dGamma += 360;
        if (dAlpha > 180) dAlpha -= 360; else if (dAlpha < -180) dAlpha += 360;

        // Ignore massive jumps
        if (Math.abs(dBeta) > 30 || Math.abs(dGamma) > 30 || Math.abs(dAlpha) > 30) {
          lastGyroRef.current = current;
          return;
        }

        const opticKey = getOpticKey();

        // Use adsGyro when firing (recoil compensation), free gyro otherwise
        const gyroSens = isFiringRef.current
          ? (sensValues.adsGyro?.[opticKey] ?? 0)
          : (sensValues.gyro?.[opticKey] ?? 0);

        if (gyroSens > 0) {
          // Scale: gyro value 200 = moderately sensitive. 400 = very sensitive.
          // We need ~200 to move about 15px per degree. Calibrated: scale = gyroSens / 1400
          const gyroScale = (gyroSens / 1400) * (1 / getOpticZoom());

          // Landscape: alpha = horizontal yaw, gamma = vertical pitch (tilt forward/back)
          const dX = dAlpha + dBeta * 0.3;
          const dY = dGamma;

          posRef.current.x += dX * gyroScale * 60; // *60 ≈ normalizing to 60fps
          posRef.current.y += dY * gyroScale * 60;

          posRef.current.x = Math.max(-1200, Math.min(1200, posRef.current.x));
          posRef.current.y = Math.max(-800,  Math.min(800,  posRef.current.y));
        }
      }

      lastGyroRef.current = current;
    };

    window.addEventListener('deviceorientation', handle);
    return () => window.removeEventListener('deviceorientation', handle);
  }, [sensValues, optic, playerInputs?.gyroMode, getOpticKey, getOpticZoom]);

  // ── TOUCH — full canvas aim tracking ────────────────────────────────────────
  // Unlike before, the entire canvas is the aim zone. The fire button
  // captures its own touches via stopPropagation, leaving canvas for aiming.

  const handleCanvasTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if ('touches' in e) {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        // Skip if this is already the fire button touch
        if (t.identifier === fireTouchIdRef.current) continue;
        // Track first untracked touch as aim
        if (!aimTouchRef.current.active) {
          aimTouchRef.current = { active: true, lastX: t.clientX, lastY: t.clientY, id: t.identifier };
          break;
        }
      }
    } else {
      const m = e as React.MouseEvent;
      aimTouchRef.current = { active: true, lastX: m.clientX, lastY: m.clientY, id: 0 };
    }
  }, []);

  const handleCanvasTouchMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!aimTouchRef.current.active) return;

    let clientX = 0, clientY = 0;
    if ('touches' in e) {
      const t = Array.from(e.changedTouches).find(t => t.identifier === aimTouchRef.current.id);
      if (!t) return;
      clientX = t.clientX;
      clientY = t.clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const dx = clientX - aimTouchRef.current.lastX;
    const dy = clientY - aimTouchRef.current.lastY;
    aimTouchRef.current.lastX = clientX;
    aimTouchRef.current.lastY = clientY;

    const opticKey = getOpticKey();
    // Use ADS sensitivity while firing, camera sensitivity otherwise
    const rawSens = isFiringRef.current ? sensValues.ads[opticKey] : sensValues.camera[opticKey];

    // FIXED scaling: sens value maps directly to in-game feel.
    // At sens=100, 1mm of swipe = ~0.6px world movement.
    // At sens=50, 1mm of swipe = ~0.3px world movement.
    // Scale calibrated to match real PUBG feel at 60fps mid device.
    const swipeScale = (rawSens / 100) * 0.65 * (1 / getOpticZoom());

    posRef.current.x += dx * swipeScale;
    posRef.current.y += dy * swipeScale;

    posRef.current.x = Math.max(-1200, Math.min(1200, posRef.current.x));
    posRef.current.y = Math.max(-800,  Math.min(800,  posRef.current.y));
  }, [sensValues, getOpticKey, getOpticZoom]);

  const handleCanvasTouchEnd = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if ('touches' in e) {
      const t = Array.from(e.changedTouches).find(t => t.identifier === aimTouchRef.current.id);
      if (t) aimTouchRef.current.active = false;
    } else {
      aimTouchRef.current.active = false;
    }
  }, []);

  // ── FIRE BUTTON — captures its own touch, does NOT propagate to canvas ──────

  const startFiring = useCallback((e?: React.TouchEvent | React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      if (e.cancelable) e.preventDefault();
      if ('touches' in e && e.changedTouches.length > 0) {
        fireTouchIdRef.current = e.changedTouches[0].identifier;
      }
    }
    if (bulletsLeft <= 0 || scoreSummary) return;
    setIsFiring(true);
    isFiringRef.current = true;
    lastFireTimeRef.current = performance.now();
    fireBullet();
  }, [bulletsLeft, scoreSummary]);

  const stopFiring = useCallback((e?: React.TouchEvent | React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      if (e.cancelable) e.preventDefault();
      fireTouchIdRef.current = -1;
    }
    setIsFiring(false);
    isFiringRef.current = false;
  }, []);

  // ── BULLET LOGIC ─────────────────────────────────────────────────────────────

  const fireBullet = useCallback(() => {
    setBulletsLeft(prev => {
      if (prev <= 0) return 0;

      const specs = GEARS[gear];
      const zoom  = getOpticZoom();
      const rangeCfg = RANGE_CONFIGS[rangeMode];
      const opticKey = getOpticKey();

      // Get current ADS sensitivity for recoil compensation calculation
      const adsSens    = sensValues.ads[opticKey];
      const adsGyroSens = sensValues.adsGyro?.[opticKey] ?? 0;

      // Effective gyro sensitivity reduces the perceived recoil kick:
      // Higher ADS-Gyro = player can tilt more efficiently = less net visual kick
      const gyroEnabled = (playerInputs?.gyroMode !== 'off') && adsGyroSens > 0;
      const gyroCompFactor = gyroEnabled ? Math.min(0.65, adsGyroSens / 420) : 0;

      // Raw recoil kick — adjusted by zoom (scoped = less physical movement)
      const rawKick = specs.vKick * (1 / zoom);
      // Effective kick shown in simulator = raw kick minus what gyro neutralizes
      const effectiveKick = rawKick * (1 - gyroCompFactor);

      // Bullet spread adjusted for zoom and weapon
      const spreadX = (Math.random() - 0.5) * specs.spread * 4 * (1 / zoom);
      const spreadY = (Math.random() - 0.5) * specs.spread * 3 * (1 / zoom);

      // Check hit on ALL targets in range
      const newHits: Hit[] = [];
      for (let ti = 0; ti < rangeCfg.targets.length; ti++) {
        const targetCfg = rangeCfg.targets[ti];
        const movX = targetPosRef.current[ti]?.x ?? targetCfg.worldX;

        const scale = targetCfg.scale * zoom;
        const headRadius = 22 * scale;
        const bodyWidth  = 55 * scale;
        const bodyHeight = 110 * scale;
        const headYOffset = -bodyHeight / 2 - headRadius + 8 * scale;

        // Hit position in world (crosshair pos + spread, relative to this target)
        const relX = -posRef.current.x - (movX - targetCfg.worldX) + spreadX;
        const relY = -posRef.current.y + targetCfg.worldY + spreadY;

        let region: 'head' | 'body' | 'miss' = 'miss';
        let score = 0;

        if (Math.hypot(relX, relY - headYOffset) <= headRadius) {
          region = 'head'; score = 10;
        } else if (relX >= -bodyWidth/2 && relX <= bodyWidth/2 && relY >= -bodyHeight/2 && relY <= bodyHeight/2) {
          region = 'body'; score = 5;
        }

        if (score > 0) {
          newHits.push({ x: relX, y: relY, score, region, timestamp: performance.now() });
        }
      }

      if (newHits.length === 0) {
        // Miss — still record for accuracy
        newHits.push({ x: spreadX, y: spreadY, score: 0, region: 'miss', timestamp: performance.now() });
      }

      setHits(h => {
        const updated = [...h, ...newHits];
        if (prev - 1 === 0) finishMag(updated);
        return updated;
      });

      // Apply recoil — vertical kick (world moves DOWN = crosshair rises)
      const jitterX = (Math.random() - 0.5) * specs.hJitter * 2.0 * (1 / zoom);
      posRef.current.x += jitterX;
      posRef.current.y -= effectiveKick; // Kick UP (y decreases = world moves down)

      return prev - 1;
    });
  }, [gear, optic, rangeMode, sensValues, playerInputs?.gyroMode, getOpticKey, getOpticZoom]);

  const finishMag = (finalHits: Hit[]) => {
    stopFiring();
    const onTarget  = finalHits.filter(h => h.score > 0).length;
    const headshots = finalHits.filter(h => h.region === 'head').length;
    const accuracy  = Math.round((onTarget / Math.max(1, finalHits.length)) * 100);
    const avgDist   = finalHits.reduce((acc, h) => acc + Math.sqrt(h.x*h.x + h.y*h.y), 0) / Math.max(1, finalHits.length);

    let grade = 'D';
    let advice = 'Missed most bullets — crosshair lifted too high. Increase Gyro 3x/4x by 10, or pull down harder with your finger during spray.';

    if (accuracy >= 85 && avgDist < 35) {
      grade = 'SSS'; advice = '🔥 Elite spray control! Your sensitivity is perfectly dialed in. Keep it consistent.';
    } else if (accuracy >= 70 && avgDist < 60) {
      grade = 'S';   advice = 'Excellent control. Tiny horizontal jitter left — try reducing H-recoil by 1-2.';
    } else if (accuracy >= 55 && avgDist < 90) {
      grade = 'A';   advice = 'Good grouping. Slight vertical climb — increase Gyro 3x/4x by 5-10.';
    } else if (accuracy >= 38 && avgDist < 130) {
      grade = 'B';   advice = 'Moderate drift. Increase ADS-Gyro by 10-15 and practice tilt pull-down.';
    } else if (accuracy >= 20) {
      grade = 'C';   advice = 'Heavy recoil climb. Lower your Camera No-Scope by 5 and increase Gyro 2x/3x by 15-20.';
    }

    setScoreSummary({ show: true, grade, accuracy, avgDist: Math.round(avgDist), headshots, advice });
  };

  const resetTarget = () => {
    setBulletsLeft(GEARS[gear].magSize);
    setHits([]);
    posRef.current = { x: 0, y: 0 };
    setScoreSummary(null);
    targetPosRef.current = RANGE_CONFIGS[rangeMode].targets.map(t => ({
      x: t.worldX, dir: t.moveDir, speed: t.moveSpeed,
    }));
  };

  // ── RENDER LOOP ──────────────────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = (time: number) => {
      // Auto-fire
      if (isFiringRef.current && gear !== 'awm') {
        if (time - lastFireTimeRef.current > GEARS[gear].fireRate) {
          fireBullet();
          lastFireTimeRef.current = time;
        }
      }

      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2;

      // ── Background sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#1a2030');
      sky.addColorStop(0.6, '#1e2a35');
      sky.addColorStop(1, '#28343c');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // ── Training Ground grid (floor)
      const groundY = cy + posRef.current.y + 200;
      ctx.fillStyle = '#2a3540';
      ctx.fillRect(0, groundY, W, H - groundY);

      // Grid lines on floor
      ctx.strokeStyle = '#344050';
      ctx.lineWidth = 0.5;
      for (let gx = (posRef.current.x % 80); gx < W; gx += 80) {
        ctx.beginPath(); ctx.moveTo(gx, groundY); ctx.lineTo(gx - 60, H); ctx.stroke();
      }

      const zoom = getOpticZoom();
      const rangeCfg = RANGE_CONFIGS[rangeMode];

      // ── Update moving targets
      for (let ti = 0; ti < rangeCfg.targets.length; ti++) {
        const tcfg = rangeCfg.targets[ti];
        if (!tcfg.moving) continue;
        const tp = targetPosRef.current[ti];
        tp.x += tp.dir * tp.speed;
        const bound = 200;
        if (tp.x > tcfg.worldX + bound || tp.x < tcfg.worldX - bound) tp.dir *= -1;
      }

      // ── Draw each target
      for (let ti = 0; ti < rangeCfg.targets.length; ti++) {
        const tcfg = rangeCfg.targets[ti];
        const tp   = targetPosRef.current[ti];

        const tWorldX = tp.x;
        const tWorldY = tcfg.worldY;

        // Target screen position = screen center + world pos + camera offset
        const tScreenX = cx + posRef.current.x + tWorldX;
        const tScreenY = cy + posRef.current.y + tWorldY;

        const scale      = tcfg.scale * zoom;
        const headR      = 22 * scale;
        const bodyW      = 55 * scale;
        const bodyH      = 110 * scale;
        const headYOff   = -bodyH / 2 - headR + 8 * scale;

        // Target shadow
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(tScreenX, tScreenY + bodyH/2 + 6, bodyW * 0.7, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Body
        ctx.fillStyle = '#4a6070';
        ctx.strokeStyle = '#5a7088';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(tScreenX - bodyW/2, tScreenY - bodyH/2, bodyW, bodyH, 8 * scale);
        ctx.fill(); ctx.stroke();

        // Body detail (PUBG target coloring)
        const bodyGrad = ctx.createLinearGradient(tScreenX - bodyW/2, 0, tScreenX + bodyW/2, 0);
        bodyGrad.addColorStop(0, 'rgba(100,140,160,0.3)');
        bodyGrad.addColorStop(1, 'rgba(60,90,110,0.1)');
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.roundRect(tScreenX - bodyW/2, tScreenY - bodyH/2, bodyW, bodyH, 8 * scale);
        ctx.fill();

        // Head
        ctx.fillStyle = '#4a6070';
        ctx.strokeStyle = '#5a7088';
        ctx.beginPath();
        ctx.arc(tScreenX, tScreenY + headYOff, headR, 0, 2 * Math.PI);
        ctx.fill(); ctx.stroke();

        // Head zone indicator (subtle red outline for headshot zone)
        ctx.strokeStyle = 'rgba(239,68,68,0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(tScreenX, tScreenY + headYOff, headR, 0, 2 * Math.PI);
        ctx.stroke();

        // Moving target indicator
        if (tcfg.moving) {
          ctx.fillStyle = 'rgba(255,215,0,0.6)';
          ctx.font = `bold ${Math.round(9 * scale)}px monospace`;
          ctx.textAlign = 'center';
          ctx.fillText('◄ MOVING ►', tScreenX, tScreenY - bodyH/2 - headR * 2 - 4);
        }
      }

      // ── Draw hits (fixed to respective targets)
      hits.forEach(hit => {
        if (hit.region === 'miss') return;
        // Hits are stored relative to world center for the primary target
        const hScreenX = cx + posRef.current.x + hit.x;
        const hScreenY = cy + posRef.current.y + hit.y;
        const age = time - hit.timestamp;
        const alpha = Math.max(0, 1 - age / 8000);
        ctx.beginPath();
        ctx.arc(hScreenX, hScreenY, 3.5, 0, 2 * Math.PI);
        ctx.fillStyle = hit.region === 'head' ? `rgba(239,68,68,${alpha})` : `rgba(255,255,255,${alpha})`;
        ctx.fill();
        // Bullet hole ring
        ctx.strokeStyle = hit.region === 'head' ? `rgba(239,68,68,${alpha * 0.5})` : `rgba(200,200,200,${alpha * 0.4})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(hScreenX, hScreenY, 5, 0, 2 * Math.PI);
        ctx.stroke();
      });

      // ── Scope overlay
      if (optic !== 'no_scope' && optic !== 'red_dot') {
        const vignette = ctx.createRadialGradient(cx, cy, cy * 0.55, cx, cy, cy * 1.15);
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.97)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, W, H);
        // Scope circle
        ctx.beginPath();
        ctx.arc(cx, cy, cy * 0.88, 0, 2 * Math.PI);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 50;
        ctx.stroke();
        // Reticle lines
        ctx.strokeStyle = 'rgba(200,200,200,0.5)';
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(cx - cy * 0.8, cy); ctx.lineTo(cx + cy * 0.8, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy - cy * 0.8); ctx.lineTo(cx, cy + cy * 0.8); ctx.stroke();
      }

      // ── Crosshair (always centered)
      const chColor = isFiringRef.current ? '#ff6b35' : '#22c55e';
      ctx.strokeStyle = chColor;
      ctx.lineWidth = 1.5;
      const gap = optic === 'no_scope' ? 5 : 8;
      const len = optic === 'no_scope' ? 12 : 10;
      ctx.beginPath(); ctx.moveTo(cx - gap - len, cy); ctx.lineTo(cx - gap, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + gap, cy); ctx.lineTo(cx + gap + len, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - gap - len); ctx.lineTo(cx, cy - gap); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy + gap); ctx.lineTo(cx, cy + gap + len); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, 1.5, 0, 2 * Math.PI); ctx.fillStyle = chColor; ctx.fill();

      // ── Hit marker
      const recentHit = hits.length > 0 ? hits[hits.length - 1] : null;
      if (recentHit && recentHit.region !== 'miss') {
        const age = time - recentHit.timestamp;
        if (age < 280) {
          const alpha = 1 - age / 280;
          ctx.strokeStyle = recentHit.region === 'head' ? `rgba(239,68,68,${alpha})` : `rgba(255,255,255,${alpha})`;
          ctx.lineWidth = 2;
          const m = 8, d = 16;
          ctx.beginPath();
          ctx.moveTo(cx-m, cy-m); ctx.lineTo(cx-d, cy-d);
          ctx.moveTo(cx+m, cy+m); ctx.lineTo(cx+d, cy+d);
          ctx.moveTo(cx-m, cy+m); ctx.lineTo(cx-d, cy+d);
          ctx.moveTo(cx+m, cy-m); ctx.lineTo(cx+d, cy-d);
          ctx.stroke();
        }
      }

      // ── Gyro recoil pull indicator (shows direction to tilt for recoil control)
      if (playerInputs?.gyroMode !== 'off' && isFiringRef.current) {
        ctx.fillStyle = 'rgba(255,215,0,0.7)';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('↓ TILT DOWN to counter recoil', cx, H - 80);
      }

      gameLoopRef.current = requestAnimationFrame(render);
    };

    gameLoopRef.current = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(gameLoopRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [optic, gear, hits, rangeMode, playerInputs?.gyroMode, fireBullet, getOpticZoom]);

  // ── UI ───────────────────────────────────────────────────────────────────────

  return (
    <div className="w-full h-full relative font-headline select-none touch-none">
      {/* Canvas — full-screen aim zone */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 touch-none"
        onMouseDown={handleCanvasTouchStart}
        onMouseMove={handleCanvasTouchMove}
        onMouseUp={handleCanvasTouchEnd}
        onMouseLeave={handleCanvasTouchEnd}
        onTouchStart={handleCanvasTouchStart}
        onTouchMove={handleCanvasTouchMove}
        onTouchEnd={handleCanvasTouchEnd}
        onTouchCancel={handleCanvasTouchEnd}
      />

      {/* HUD Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none p-3">

        {/* Top bar */}
        <div className="flex justify-between items-start pointer-events-auto">
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => { posRef.current = { x: 0, y: 0 }; }}
              className="px-3 py-1.5 bg-black/60 text-white border border-white/20 hover:bg-white/10 rounded font-bold uppercase text-xs tracking-wider"
            >
              CENTER AIM
            </button>
          </div>
          <button onClick={onExit} className="bg-red-500/80 text-white p-2 rounded font-bold hover:bg-red-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode selector (bottom left) */}
        <div className="absolute bottom-4 left-3 pointer-events-auto">
          <div className="bg-black/70 border border-white/10 rounded-lg p-2 backdrop-blur space-y-1.5">
            <div className="text-[8px] text-primary-yellow font-black uppercase tracking-widest">Mode</div>
            <div className="flex flex-col gap-1">
              {(Object.entries(RANGE_CONFIGS) as [RangeMode, any][]).map(([mode, cfg]) => (
                <button
                  key={mode}
                  onClick={() => setRangeMode(mode)}
                  className={`px-3 py-1 rounded text-[9px] font-black uppercase transition-colors ${
                    rangeMode === mode ? 'bg-primary-yellow text-black' : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Optic + Gear + Ammo (bottom right) */}
        <div className="absolute bottom-4 right-3 pointer-events-auto flex flex-col items-end gap-2">
          <div className="bg-black/70 p-2 rounded-lg border border-white/10 backdrop-blur flex flex-col items-end gap-1">
            <div className="text-[8px] text-primary-yellow tracking-widest uppercase">Optic</div>
            <div className="flex gap-1">
              {(['no_scope','red_dot','scope_3x','scope_4x','scope_6x'] as OpticType[]).map(o => (
                <button key={o} onClick={() => setOptic(o)}
                  className={`px-2 py-1.5 rounded text-[9px] font-black uppercase transition-colors ${optic === o ? 'bg-primary-yellow text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  {o.replace('scope_','').replace('_',' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-black/70 p-2 rounded-lg border border-white/10 backdrop-blur flex flex-col items-end gap-1">
            <div className="text-[8px] text-primary-yellow tracking-widest uppercase">Gear</div>
            <div className="flex gap-1">
              {(['m416','akm','uzi','awm'] as GearType[]).map(w => (
                <button key={w} onClick={() => setGear(w)}
                  className={`px-2 py-1.5 rounded text-[9px] font-black uppercase transition-colors ${gear === w ? 'bg-primary-yellow text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  {GEARS[w].name}
                </button>
              ))}
            </div>
            <div className="text-[9px] text-white/60">{bulletsLeft} / {GEARS[gear].magSize}</div>
          </div>

          {/* Reload */}
          {bulletsLeft <= 0 && !scoreSummary && (
            <button onClick={resetTarget}
              className="bg-primary-yellow text-black px-4 py-2 rounded-full font-black animate-pulse shadow-[0_0_20px_rgba(255,215,0,0.5)] flex items-center gap-1.5 text-sm"
            >
              <RefreshCw className="w-4 h-4" /> RELOAD
            </button>
          )}
        </div>

        {/* Aim hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/25 text-[10px] tracking-[0.15em] pointer-events-none text-center">
          SWIPE ANYWHERE TO AIM
        </div>
      </div>

      {/* Draggable Fire Button */}
      <div
        className="absolute z-20 pointer-events-auto"
        style={{ left: fireBtnPos.x, top: fireBtnPos.y }}
      >
        {/* Drag handle */}
        <div
          className="w-16 h-4 bg-white/20 rounded-full cursor-move flex items-center justify-center mb-1"
          onPointerDown={e => {
            e.currentTarget.setPointerCapture(e.pointerId);
            isDraggingFireBtnRef.current = true;
          }}
          onPointerMove={e => {
            if (!isDraggingFireBtnRef.current) return;
            setFireBtnPos(p => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
          }}
          onPointerUp={e => {
            isDraggingFireBtnRef.current = false;
            e.currentTarget.releasePointerCapture(e.pointerId);
          }}
        >
          <span className="text-[7px] text-white/50 font-black">DRAG</span>
        </div>

        <button
          onTouchStart={startFiring}
          onTouchEnd={stopFiring}
          onTouchCancel={stopFiring}
          onMouseDown={startFiring}
          onMouseUp={stopFiring}
          onMouseLeave={stopFiring}
          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 flex items-center justify-center font-black text-lg transition-all shadow-xl select-none touch-none ${
            bulletsLeft <= 0
              ? 'bg-zinc-800 border-zinc-600 text-zinc-500'
              : isFiring
              ? 'bg-red-500 border-red-300 text-white scale-95'
              : 'bg-white/25 border-white text-white hover:bg-white/35'
          }`}
          style={{ backdropFilter: 'blur(4px)', WebkitUserSelect: 'none' }}
        >
          FIRE
        </button>
      </div>

      {/* Score Modal */}
      {scoreSummary?.show && (
        <div className="absolute inset-0 z-50 bg-black/85 flex items-center justify-center pointer-events-auto backdrop-blur-sm">
          <div className="bg-[#1b2836] border border-primary-yellow/50 rounded-2xl p-6 max-w-sm w-[90%] text-center space-y-4">
            <div>
              <div className="text-primary-yellow text-xs font-black tracking-widest uppercase mb-1">Spray Analysis</div>
              <div className={`text-5xl font-black ${scoreSummary.grade === 'SSS' ? 'text-primary-yellow' : scoreSummary.grade === 'S' ? 'text-green-400' : scoreSummary.grade === 'A' ? 'text-blue-400' : 'text-white'}`}>
                {scoreSummary.grade}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-left bg-black/30 p-3 rounded-xl">
              <div>
                <div className="text-white/40 text-[10px]">ACCURACY</div>
                <div className="text-white font-bold text-lg">{scoreSummary.accuracy}%</div>
              </div>
              <div>
                <div className="text-white/40 text-[10px]">DRIFT</div>
                <div className="text-white font-bold text-lg">{scoreSummary.avgDist}px</div>
              </div>
              <div>
                <div className="text-white/40 text-[10px]">HEADSHOTS</div>
                <div className="text-yellow-400 font-bold text-lg">{scoreSummary.headshots}</div>
              </div>
            </div>

            <p className="text-white/70 text-xs leading-relaxed">{scoreSummary.advice}</p>

            <div className="flex gap-2">
              <button onClick={resetTarget} className="flex-1 bg-primary-yellow text-black font-black py-3 rounded-xl hover:bg-white transition-colors text-sm">
                PRACTICE AGAIN
              </button>
              <button onClick={onExit} className="px-4 py-3 border border-white/20 text-white/60 rounded-xl hover:bg-white/10 text-sm">
                EXIT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
