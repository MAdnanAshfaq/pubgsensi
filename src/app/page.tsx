'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Rocket, 
  Laptop, 
  Smartphone, 
  Zap, 
  Crosshair, 
  Info, 
  Flame, 
  Target, 
  Eye, 
  CheckCircle2, 
  ArrowDown, 
  TrendingUp, 
  MoveHorizontal, 
  ArrowLeft, 
  ArrowRight, 
  Wrench, 
  Loader2,
  Search,
  Cpu,
  Gauge,
  RotateCw
} from 'lucide-react';

const STORAGE_KEY = 'aimsync_wizard_state';

interface WizardData {
  deviceTier: 'budget' | 'mid' | 'flagship';
  fps: 40 | 60 | 90 | 120;
  gyroMode: 'always_on' | 'scope_on' | 'off';
  fingerCount: number;
  playstyle: 'rusher' | 'sniper' | 'assaulter' | 'balanced';
  primaryProblem: 'recoil' | 'aim' | 'transfer' | 'close' | 'long' | 'all';
  measuredSwipeSpeed?: number;
  measuredLatencyMs?: number;
  gyroStabilityScore?: number;
}

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('CALCULATING BALANCES');
  const [hydrated, setHydrated] = useState(false);

  const [formData, setFormData] = useState<WizardData>({
    deviceTier: 'mid',
    fps: 60,
    gyroMode: 'always_on',
    fingerCount: 4,
    playstyle: 'balanced',
    primaryProblem: 'recoil',
  });

  // ── Device lookup state (Step 7) ────────────────────────────────────────
  const [deviceInput, setDeviceInput] = useState('');
  const [lookupStatus, setLookupStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [lookupResult, setLookupResult] = useState<null | {
    // calibration
    deviceModel: string; brandName: string; chipset: string; displayHz: number;
    touchSamplingHz: number; gyroSensor: string; summary: string;
    deviceTier: 'budget' | 'mid' | 'flagship';
    measuredLatencyMs: number; measuredSwipeSpeed: number; gyroStabilityScore: number;
    // tactical spec card
    displaySpecs: string; chipsetInfo: string; memoryStorageConfig: string;
    cameraSpecs: string; batteryChargingInfo: string; gyroDataDisplay: string;
    samplingRateDisplay: string; latencyDataDisplay: string;
    refreshRate: string; batteryCapacity: string; chargeSpeed: string;
  }>(null);
  const [lookupError, setLookupError] = useState('');

  // ── localStorage persistence (refresh-safe) ──────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { step: savedStep, formData: savedForm, deviceInput: savedDevice, lookupResult: savedLookup } = JSON.parse(saved);
        if (savedStep) setStep(savedStep);
        if (savedForm)  setFormData(savedForm);
        if (savedDevice) setDeviceInput(savedDevice);
        if (savedLookup) setLookupResult(savedLookup);
        if (savedLookup) setLookupStatus('done');
      }
    } catch { /* ignore parse errors */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, formData, deviceInput, lookupResult }));
    } catch { /* ignore storage errors */ }
  }, [step, formData, deviceInput, lookupResult, hydrated]);

  const nextStep = () => setStep((s) => Math.min(s + 1, 7));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const selectOption = <K extends keyof WizardData>(key: K, value: WizardData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // ── Gemini device lookup ─────────────────────────────────────────────────
  const handleDeviceLookup = async () => {
    if (!deviceInput.trim() || lookupStatus === 'loading') return;
    setLookupStatus('loading');
    setLookupError('');
    setLookupResult(null);
    try {
      const res = await fetch('/api/device-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceModel: deviceInput.trim() }),
      });
      const data = await res.json();
      if (data.success && data.device) {
        const d = data.device;
        setLookupResult(d);
        setLookupStatus('done');
        // Auto-apply calibration values + device tier
        setFormData(prev => ({
          ...prev,
          deviceTier: d.deviceTier,
          measuredLatencyMs: d.measuredLatencyMs,
          measuredSwipeSpeed: d.measuredSwipeSpeed,
          gyroStabilityScore: d.gyroStabilityScore,
        }));
      } else {
        setLookupError(data.error || 'Could not identify device.');
        setLookupStatus('error');
      }
    } catch {
      setLookupError('Network error. Please check connection.');
      setLookupStatus('error');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const statuses = [
      'INITIALIZING SCANNER',
      'READING DEVICE SENSOR TIER',
      'MEASURING INTERACTIVE CALIBRATIONS',
      'COMPUTING LATENCY SHIFT FACTORS',
      'CALCULATING FPS FRAME TIME COMPENSATIONS',
      'TAILORING FOR CLAW INDEX LAYOUT',
      'OPTIMIZING MIDPOINTS FOR PLAYSTYLE',
      'RESOLVING AIM CORRECTIONS LAYER',
      'FINALIZING DETAILED PROFILE',
    ];

    let statusIndex = 0;
    const interval = setInterval(() => {
      if (statusIndex < statuses.length - 1) {
        statusIndex++;
        setLoadingStatus(statuses[statusIndex]);
      }
    }, 350);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          // Pass device name so Gemini can research exact hardware specs
          deviceModel: lookupResult?.deviceModel || deviceInput || '',
        }),
      });
      const data = await response.json();
      clearInterval(interval);
      if (data.success && data.slug) {
        // Clear saved wizard state on success so a fresh session starts next time
        try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
        router.push(`/r/${data.slug}`);
      } else {
        alert('Failed to generate sensitivity profile. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error) {
      clearInterval(interval);
      console.error(error);
      alert('Network error. Check connection and retry.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between max-w-lg mx-auto w-full px-4 pt-8 pb-12 bg-background min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border-tactical/30 pb-4">
        <div className="flex items-center gap-2">
          <Shield className="text-primary-yellow animate-pulse w-7 h-7" />
          <div>
            <h1 className="font-headline text-3xl font-extrabold tracking-tighter text-primary-yellow">AIMSYNC</h1>
            <p className="font-technical text-[10px] text-text-muted tracking-widest uppercase">PUBG/BGMI Tactical Configurator</p>
          </div>
        </div>
        <div className="font-technical text-sm text-primary-yellow border border-primary-yellow/30 px-3 py-1 bg-primary-yellow/5 rounded">
          STEP {step}/7
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-surface-dark h-1.5 rounded-full overflow-hidden my-4 border border-border-tactical/10">
        <div
          className="bg-primary-yellow h-full transition-all duration-300"
          style={{ width: `${(step / 7) * 100}%` }}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center py-6">
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-headline text-2xl font-bold uppercase tracking-tight text-foreground">1. DEVICE HARDWARE SPEC</h2>
              <p className="text-sm text-text-muted">Choose your device hardware tier. AimSync adjusts Gyroscope sensitivity thresholds to filter sensor lag and latency.</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                { id: 'flagship', label: 'Flagship tier', desc: 'iPad Pro, iPhone Pro, ROG Phone, Snapdragon 8 Gen 2+. High-precision sensors.', icon: Rocket },
                { id: 'mid', label: 'Mid-range tier', desc: 'OnePlus Nord, Poco X series, Galaxy A. Standard responsive sensors.', icon: Laptop },
                { id: 'budget', label: 'Budget/Entry tier', desc: 'Under $200 devices. Higher gyroscope sensor latency; values are damped by 15%.', icon: Smartphone },
              ].map((opt) => {
                const IconComponent = opt.icon;
                return (
                  <button
                    key={opt.id}
                    onClick={() => selectOption('deviceTier', opt.id as any)}
                    className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all active:scale-[0.99] ${
                      formData.deviceTier === opt.id
                        ? 'bg-olive/10 border-primary-yellow shadow-[0_0_15px_rgba(255,215,0,0.15)]'
                        : 'bg-surface-card border-border-tactical/40 hover:border-text-muted/60'
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg ${formData.deviceTier === opt.id ? 'bg-primary-yellow text-background' : 'bg-surface-hover text-text-muted'}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-headline text-lg font-bold uppercase tracking-wide text-foreground">{opt.label}</h3>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-headline text-2xl font-bold uppercase tracking-tight text-foreground">2. TARGET FRAME RATE</h2>
              <p className="text-sm text-text-muted">Select your in-game framerate (FPS). Higher FPS allows for snappier tracking; lower FPS requires larger swipes.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 40, label: '40 FPS', desc: 'Ultra Settings (Medium)', mult: '-8% speed scale' },
                { id: 60, label: '60 FPS', desc: 'Extreme Settings', mult: 'Standard scale' },
                { id: 90, label: '90 FPS', desc: '90fps Mode', mult: '+10% speed scale' },
                { id: 120, label: '120 FPS', desc: '120fps Mode', mult: '+10% speed scale' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => selectOption('fps', opt.id as any)}
                  className={`flex flex-col justify-between p-4 rounded-xl border text-left h-32 transition-all active:scale-[0.99] ${
                    formData.fps === opt.id
                      ? 'bg-olive/10 border-primary-yellow shadow-[0_0_15px_rgba(255,215,0,0.15)]'
                      : 'bg-surface-card border-border-tactical/40 hover:border-text-muted/60'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-headline text-3xl font-extrabold text-foreground">{opt.id}</span>
                    <Zap className={`w-5 h-5 ${formData.fps === opt.id ? 'text-primary-yellow' : 'text-text-muted'}`} />
                  </div>
                  <div>
                    <h3 className="font-headline text-sm font-bold uppercase tracking-wide text-foreground">{opt.desc}</h3>
                    <p className="text-[10px] font-technical text-primary-yellow mt-1">{opt.mult}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-headline text-2xl font-bold uppercase tracking-tight text-foreground">3. GYROSCOPE PREFERENCE</h2>
              <p className="text-sm text-text-muted">Using Gyroscope is critical for competitive recoil control in PUBG Mobile. Select your configuration.</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                { id: 'always_on', label: 'Always-on Gyroscope', desc: 'Highly Recommended. Gyroscope controls both camera look and weapon recoil tilting.', icon: RotateCw },
                { id: 'scope_on', label: 'Scope-only Gyroscope', desc: 'Gyroscope is only active when aiming down sights (ADS). Good for sniper players.', icon: Crosshair },
                { id: 'off', label: 'Disabled (Swipe only)', desc: 'Recoil is controlled entirely by sliding fingers on screen. Recommended to learn Gyro!', icon: Smartphone },
              ].map((opt) => {
                const IconComponent = opt.icon;
                return (
                  <button
                    key={opt.id}
                    onClick={() => selectOption('gyroMode', opt.id as any)}
                    className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all active:scale-[0.99] ${
                      formData.gyroMode === opt.id
                        ? 'bg-olive/10 border-primary-yellow shadow-[0_0_15px_rgba(255,215,0,0.15)]'
                        : 'bg-surface-card border-border-tactical/40 hover:border-text-muted/60'
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg ${formData.gyroMode === opt.id ? 'bg-primary-yellow text-background' : 'bg-surface-hover text-text-muted'}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-headline text-lg font-bold uppercase tracking-wide text-foreground">{opt.label}</h3>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-headline text-2xl font-bold uppercase tracking-tight text-foreground">4. FINGER LAYOUT CONFIG</h2>
              <p className="text-sm text-text-muted">Select how many fingers you use. Higher layouts (claw) benefit from faster swipe settings; thumbs need high precision.</p>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[2, 3, 4, 5].map((fingers) => (
                <button
                  key={fingers}
                  onClick={() => selectOption('fingerCount', fingers)}
                  className={`flex flex-col justify-between p-4 rounded-xl border text-center h-28 transition-all active:scale-[0.99] ${
                    formData.fingerCount === fingers
                      ? 'bg-olive/10 border-primary-yellow shadow-[0_0_15px_rgba(255,215,0,0.15)]'
                      : 'bg-surface-card border-border-tactical/40 hover:border-text-muted/60'
                  }`}
                >
                  <span className="font-headline text-3xl font-extrabold text-foreground">{fingers}</span>
                  <div className="space-y-1">
                    <span className="font-headline text-xs font-bold text-foreground">FINGERS</span>
                    <p className="text-[9px] font-technical text-text-muted uppercase">
                      {fingers === 2 ? 'Thumbs' : fingers + 'F Claw'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <div className="bg-surface-card border border-border-tactical/20 rounded-xl p-4 flex gap-3 text-xs text-text-muted items-start">
              <Info className="w-5 h-5 text-primary-yellow flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Claw layout setups (4 or 5 fingers) allocate separate buttons for firing and scoping, allowing you to run higher camera rotation limits.
              </p>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-headline text-2xl font-bold uppercase tracking-tight text-foreground">5. PRIMARY COMBAT ROLE</h2>
              <p className="text-sm text-text-muted">Your role dictates the scaling on scope groups. Snipers need stability; rushers need close-quarters speed.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'rusher', label: 'Entry Rusher', desc: 'Aggressive, CQB. Boosts close-range sights (+12%).', icon: Flame },
                { id: 'assaulter', label: 'Mid-Assaulter', desc: 'Rifle sprays, cover fires. Balanced, stable sprays.', icon: Target },
                { id: 'sniper', label: 'Bolt Sniper', desc: 'Long range precision. Lowers high scope speeds (-12%).', icon: Eye },
                { id: 'balanced', label: 'Flex Player', desc: 'Fills gaps. Direct midpoints, versatile.', icon: CheckCircle2 },
              ].map((opt) => {
                const IconComponent = opt.icon;
                return (
                  <button
                    key={opt.id}
                    onClick={() => selectOption('playstyle', opt.id as any)}
                    className={`flex flex-col justify-between p-4 rounded-xl border text-left h-36 transition-all active:scale-[0.99] ${
                      formData.playstyle === opt.id
                        ? 'bg-olive/10 border-primary-yellow shadow-[0_0_15px_rgba(255,215,0,0.15)]'
                        : 'bg-surface-card border-border-tactical/40 hover:border-text-muted/60'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <IconComponent className="w-5 h-5 text-text-muted" />
                      {formData.playstyle === opt.id && <span className="w-2 h-2 rounded-full bg-primary-yellow shadow-[0_0_8px_#ffd700]" />}
                    </div>
                    <div>
                      <h3 className="font-headline text-base font-bold uppercase tracking-wide text-foreground">{opt.label}</h3>
                      <p className="text-[10px] text-text-muted mt-1 leading-normal">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-headline text-2xl font-bold uppercase tracking-tight text-foreground">6. RECOIL OR AIM OBSTACLE</h2>
              <p className="text-sm text-text-muted">Identify your primary aim difficulty. The algorithm applies corrective multipliers to counter these specific issues.</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'recoil', label: 'Sustained Recoil Control', desc: 'Struggling to keep crosshair from rising during spray. Applies +15% boost to Gyro and ADS mid-scopes (3x/4x).', icon: ArrowDown },
                { id: 'aim', label: 'Close Range Tracking', desc: 'Struggling to track players jumping or sliding close. Elevates 3rd person and red-dot speeds.', icon: TrendingUp },
                { id: 'transfer', label: 'Horizontal Spray Transfer', desc: 'Struggling to switch targets while spraying. Dampens ADS by -10% and boosts Gyro by +8%.', icon: MoveHorizontal },
                { id: 'close', label: 'Hipfire Reaction Speed', desc: 'Bullet spread is fine, but target acquisition is too slow. Boosts close range camera speeds.', icon: Zap },
                { id: 'long', label: 'Long Range Precision', desc: 'Struggling to align precise headshots on distant enemies. Dampens high optics.', icon: Crosshair },
                { id: 'all', label: 'Select All / Complete Calibration', desc: 'Apply all aim offset correction filters. Calibrates Close Range, Recoil, Transfer, and Precision simultaneously.', icon: Shield },
              ].map((opt) => {
                const IconComponent = opt.icon;
                return (
                  <button
                    key={opt.id}
                    onClick={() => selectOption('primaryProblem', opt.id as any)}
                    className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all active:scale-[0.99] ${
                      formData.primaryProblem === opt.id
                        ? 'bg-olive/10 border-primary-yellow shadow-[0_0_15px_rgba(255,215,0,0.15)]'
                        : 'bg-surface-card border-border-tactical/40 hover:border-text-muted/60'
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg ${formData.primaryProblem === opt.id ? 'bg-primary-yellow text-background' : 'bg-surface-hover text-text-muted'}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-headline text-base font-bold uppercase tracking-wide text-foreground">{opt.label}</h3>
                      <p className="text-[11px] text-text-muted mt-1 leading-relaxed">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h2 className="font-headline text-2xl font-bold uppercase tracking-tight text-foreground">7. HARDWARE CALIBRATION</h2>
              <p className="text-sm text-text-muted">Enter your exact phone model. AimSync uses AI to research your device's touch latency, gyro sensor, and screen specs — no manual tests needed.</p>
            </div>

            {/* Device Input */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Cpu className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    value={deviceInput}
                    onChange={(e) => setDeviceInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleDeviceLookup()}
                    placeholder="e.g. OnePlus 8 5G, iPhone 13, POCO X5 Pro"
                    className="w-full pl-10 pr-4 py-3 bg-surface-card border border-border-tactical/40 rounded-xl text-sm text-foreground placeholder:text-text-muted/50 focus:outline-none focus:border-primary-yellow/60 focus:bg-surface-hover transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleDeviceLookup}
                  disabled={!deviceInput.trim() || lookupStatus === 'loading'}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary-yellow text-background font-headline font-bold text-sm uppercase tracking-wide disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-yellow/90 transition-all active:scale-95 shrink-0"
                >
                  {lookupStatus === 'loading'
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Search className="w-4 h-4" />}
                  {lookupStatus === 'loading' ? 'SCANNING...' : 'SCAN'}
                </button>
              </div>

              {lookupStatus === 'error' && (
                <p className="text-xs text-red-400 font-technical">{lookupError} — Try a more specific model name.</p>
              )}
            </div>

            {/* Loading state */}
            {lookupStatus === 'loading' && (
              <div className="bg-surface-card border border-border-tactical/25 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 min-h-[180px]">
                <div className="relative w-14 h-14">
                  <div className="absolute inset-0 rounded-full border-2 border-primary-yellow/20 animate-ping" />
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-primary-yellow/50 flex items-center justify-center animate-spin [animation-duration:3s]">
                    <RotateCw className="w-5 h-5 text-primary-yellow" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-technical text-xs text-primary-yellow uppercase tracking-widest animate-pulse">AI RESEARCHING DEVICE SPECS...</p>
                  <p className="text-[10px] text-text-muted mt-1">Analyzing chipset, touch sensors, gyroscope hardware</p>
                </div>
              </div>
            )}

            {/* ── Tactical Edition Results Card ─────────────────────────── */}
            {lookupStatus === 'done' && lookupResult && (
              <div className="overflow-hidden rounded-2xl border border-primary-yellow/25 shadow-[0_0_30px_rgba(255,215,0,0.1)]">

                {/* Hero Header */}
                <div
                  className="relative pt-8 pb-5 px-5 text-center overflow-hidden"
                  style={{
                    background: 'radial-gradient(circle at 50% 50%, rgba(255,215,0,0.05) 0%, transparent 70%), linear-gradient(45deg, #000 25%, #050505 25%, #050505 50%, #000 50%, #000 75%, #050505 75%, #050505 100%)',
                    backgroundSize: '100% 100%, 40px 40px',
                  }}
                >
                  {/* Watermark */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[6rem] font-black italic opacity-[0.04] text-primary-yellow select-none pointer-events-none leading-none">
                    SPEC
                  </div>
                  <div className="relative z-10">
                    <p className="font-headline text-base font-extrabold italic text-white tracking-widest uppercase">
                      {lookupResult.brandName}
                    </p>
                    <h2 className="font-headline text-5xl font-black italic text-primary-yellow leading-tight drop-shadow-md uppercase">
                      {lookupResult.deviceModel.replace(lookupResult.brandName, '').trim()}
                    </h2>
                    <div className="flex justify-center items-center gap-3 mt-1">
                      <div className="h-px w-10 bg-primary-yellow/50" />
                      <span className="text-[10px] font-bold italic tracking-[0.3em] text-primary-yellow">
                        BORN TO PLAY
                      </span>
                      <div className="h-px w-10 bg-primary-yellow/50" />
                    </div>
                  </div>
                  {/* Tier badge */}
                  <span className={`absolute top-4 right-4 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border ${
                    lookupResult.deviceTier === 'flagship' ? 'border-primary-yellow/60 text-primary-yellow bg-primary-yellow/10' :
                    lookupResult.deviceTier === 'mid'      ? 'border-blue-400/50 text-blue-400 bg-blue-400/10' :
                                                            'border-white/20 text-white/50 bg-white/5'
                  }`}>{lookupResult.deviceTier.toUpperCase()}</span>
                </div>

                {/* Spec rows */}
                {([
                  {
                    label: 'DISPLAY',
                    value: lookupResult.displaySpecs,
                    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 20h8M12 18v2"/></svg>,
                  },
                  {
                    label: 'PROCESSOR',
                    value: lookupResult.chipsetInfo,
                    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/></svg>,
                  },
                  {
                    label: 'MEMORY & STORAGE',
                    value: lookupResult.memoryStorageConfig,
                    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12H2"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/><line x1="6" y1="16" x2="6.01" y2="16"/><line x1="10" y1="16" x2="10.01" y2="16"/></svg>,
                  },
                  {
                    label: 'CAMERA SYSTEM',
                    value: lookupResult.cameraSpecs,
                    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
                  },
                  {
                    label: 'BATTERY & POWER',
                    value: lookupResult.batteryChargingInfo,
                    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="13" x2="23" y2="11"/><line x1="13" y1="2" x2="9" y2="7" strokeLinecap="round"/><line x1="9" y1="7" x2="11" y2="7"/><line x1="11" y1="7" x2="7" y2="12" strokeLinecap="round"/></svg>,
                  },
                  {
                    label: 'GYRO QUALITY',
                    value: lookupResult.gyroDataDisplay,
                    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M22 12H2"/><circle cx="12" cy="12" r="9"/></svg>,
                  },
                  {
                    label: 'SWIPE SPEED',
                    value: lookupResult.samplingRateDisplay,
                    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
                  },
                  {
                    label: 'TOUCH LATENCY',
                    value: lookupResult.latencyDataDisplay,
                    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>,
                  },
                ] as { label: string; value: string; icon: React.ReactNode }[]).map(({ label, value, icon }) => (
                  <div
                    key={label}
                    className="flex items-center gap-4 px-4 py-3 border-y border-r border-primary-yellow/10"
                    style={{ borderLeft: '3px solid #FFD700', background: 'linear-gradient(90deg, rgba(255,214,0,0.07) 0%, transparent 100%)' }}
                  >
                    <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center text-primary-yellow opacity-80">
                      {icon}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-primary-yellow text-[10px] font-black tracking-widest font-headline">{label}</p>
                      <p className="text-[12px] leading-tight text-gray-300 font-bold font-headline uppercase truncate">{value}</p>
                    </div>
                  </div>
                ))}

                {/* Footer badges */}
                <div
                  className="relative"
                  style={{ background: 'rgba(10,10,10,0.95)', borderTop: '2px solid rgba(255,215,0,0.2)' }}
                >
                  {/* Hazard stripe */}
                  <div
                    className="h-3 w-full"
                    style={{ background: 'repeating-linear-gradient(-45deg, #FFD700, #FFD700 8px, #000 8px, #000 16px)' }}
                  />
                  <div className="flex justify-around items-center py-3 px-2">
                    {[
                      { top: lookupResult.refreshRate, bottom: 'ULTRA SMOOTH', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg> },
                      { top: lookupResult.batteryCapacity, bottom: 'BATTERY', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="13" x2="23" y2="11"/></svg> },
                      { top: lookupResult.chargeSpeed, bottom: 'CHARGING', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
                      { top: lookupResult.touchSamplingHz + 'Hz', bottom: 'TOUCH RATE', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg> },
                    ].map(({ top, bottom, icon }) => (
                      <div key={bottom} className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 border border-primary-yellow/40 flex items-center justify-center text-primary-yellow rounded-sm opacity-80">
                          {icon}
                        </div>
                        <span className="font-headline text-[9px] text-primary-yellow font-black text-center uppercase leading-none">
                          {top}<br />{bottom}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-primary-yellow py-1.5 text-center">
                    <p className="text-black font-black text-[10px] italic tracking-tighter font-headline uppercase">
                      AIMSYNC · CALIBRATED FOR VICTORY
                    </p>
                  </div>
                </div>

                {/* Expert summary + re-search */}
                <div className="bg-[#050505] px-4 py-3 space-y-2">
                  <p className="text-[10px] text-text-muted leading-relaxed">{lookupResult.summary}</p>
                  <button
                    type="button"
                    onClick={() => { setLookupStatus('idle'); setLookupResult(null); setDeviceInput(''); }}
                    className="text-[10px] font-technical uppercase tracking-wider text-text-muted hover:text-primary-yellow underline transition-colors"
                  >
                    ↩ Search Different Device
                  </button>
                </div>
              </div>
            )}

            {/* Skip option */}
            {lookupStatus === 'idle' && (
              <div className="bg-surface-card border border-border-tactical/20 rounded-xl p-4 flex gap-3 text-xs text-text-muted items-start">
                <Info className="w-4 h-4 text-primary-yellow flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <span className="text-foreground font-semibold">Tip:</span> Type your exact device model for AI-researched calibration. You can also skip this step — AimSync will use standard values for your selected device tier.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Navigation */}
      <footer className="flex justify-between gap-4 border-t border-border-tactical/20 pt-6">
        <button
          onClick={prevStep}
          disabled={step === 1}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-headline font-bold text-base uppercase border transition-all ${
            step === 1
              ? 'border-border-tactical/20 text-text-muted/40 cursor-not-allowed'
              : 'border-border-tactical/50 text-foreground hover:bg-surface-hover active:scale-95'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          BACK
        </button>

        {step < 7 ? (
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-headline font-bold text-base uppercase bg-foreground text-background hover:bg-foreground/90 transition-all active:scale-95 shadow-lg"
          >
            CONTINUE
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-headline font-extrabold text-base uppercase bg-primary-yellow text-background hover:bg-primary-yellow/90 transition-all active:scale-95 shadow-[0_4px_20px_rgba(255,215,0,0.3)] border border-primary-yellow/10"
          >
            GENERATE PROFILE
            <Wrench className="w-4 h-4" />
          </button>
        )}
      </footer>

      {/* Submitting Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="relative w-48 h-48 mb-8 flex items-center justify-center border border-border-tactical/30 rounded-full animate-pulse-glow">
            {/* Radar Scope simulation lines */}
            <div className="absolute w-[95%] h-[95%] border border-dashed border-primary-yellow/20 rounded-full animate-spin [animation-duration:15s]" />
            <div className="absolute w-[70%] h-[70%] border border-primary-yellow/10 rounded-full" />
            
            {/* The pulsing radar hand */}
            <div className="absolute inset-0 w-full h-full animate-scan rounded-full" />

            <Loader2 className="w-12 h-12 text-primary-yellow animate-spin" />
          </div>

          <div className="space-y-3 max-w-sm">
            <h3 className="font-headline text-3xl font-extrabold tracking-tighter text-primary-yellow">TACTICAL RESOLUTION ACTIVE</h3>
            <p className="font-technical text-xs text-primary-yellow border border-primary-yellow/30 px-3 py-1.5 bg-primary-yellow/5 rounded-md inline-block uppercase tracking-wider animate-pulse">
              {loadingStatus}...
            </p>
            <p className="text-xs text-text-muted mt-2 leading-relaxed">
              AimSync is applying customized scale algorithms to construct your perfect sensitivity config profile.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
