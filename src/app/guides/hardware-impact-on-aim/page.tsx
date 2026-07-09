import type { Metadata } from 'next';
import AdUnit from '@/components/AdUnit';

export const metadata: Metadata = {
  title: "How Phone Hardware Affects Aim and Sensitivity — AimSync",
  description: "Learn how display refresh rate (Hz), touch sampling rate, and processor input latency affect your aiming sensitivity in PUBG Mobile & BGMI.",
  openGraph: {
    title: "How Phone Hardware Affects Aim and Sensitivity — AimSync",
    description: "Learn how display refresh rate (Hz), touch sampling rate, and processor input latency affect your aiming sensitivity in PUBG Mobile & BGMI.",
  },
};

export default function HardwareImpactGuide() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 text-white">
      <h1 className="text-3xl md:text-5xl font-headline font-black text-primary-yellow mb-6 uppercase tracking-wider leading-tight">
        Touch Latency & Refresh Rate: How Your Phone Affects Your Aim
      </h1>
      <div className="text-sm font-technical text-text-muted mb-10 uppercase tracking-widest">
        Updated: 2026 • 6 Min Read
      </div>

      <div className="space-y-6 text-[#cbdbe6] leading-relaxed text-lg font-body">
        <p>
          Why does a sensitivity configuration that works perfectly on one device feel sluggish or uncontrollable on another? The answer lies in the hardware specifications of your phone or tablet. Factors like screen refresh rate (Hz), touch sampling rate, and chipset latency heavily influence how your inputs translate into game movement.
        </p>

        <p>
          In this guide, we will break down the exact hardware metrics that dictate your aiming physics in PUBG Mobile and BGMI, helping you calibrate your settings to match your device tier.
        </p>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">1. Screen Refresh Rate (60Hz vs. 90Hz vs. 120Hz)</h2>
        <p>
          Refresh rate represents how many times per second your display updates the image. Most budget phones operate at 60Hz. Mid-range and flagship gaming devices operate at 90Hz or 120Hz.
        </p>
        <p>
          <strong>Aiming Impact:</strong> High refresh rates reduce visual jitter. At 120Hz, movement is twice as smooth as 60Hz. Because your eyes receive visual feedback much faster, your tracking aim feels significantly "snappier". 
        </p>
        <p>
          If you play on 60Hz or lower, you experience slight visual delay. To compensate for this visual lag, you generally need to <strong>increase your camera sensitivity</strong> to allow quick target acquisition, or decrease it if the low framerate makes tracking look too jittery.
        </p>

        <AdUnit slot="1234567890" format="auto" className="my-8" />

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">2. Touch Sampling Rate (Hz)</h2>
        <p>
          Often confused with refresh rate, the touch sampling rate is how many times per second the touchscreen digitizer scans for finger input. For instance, a budget phone might have a 120Hz touch sampling rate, while a gaming flagship (like the Asus ROG or iPad Pro) might boast 360Hz or 720Hz.
        </p>
        <p>
          <strong>Aiming Impact:</strong> A higher touch sampling rate registers minor finger adjustments immediately. With a low touch sampling rate, micro-adjustments are missed, causing your crosshair to feel sticky or make sudden jumps.
        </p>
        <p>
          If your device has a low touch sampling rate, you should <strong>lower your ADS sensitivity</strong>. High sensitivity combined with low polling rates leads to extreme aiming inaccuracy, as the screen fails to capture small finger micro-adjustments smoothly.
        </p>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">3. Processor Latency and Frame Drops</h2>
        <p>
          Your phone's System-on-Chip (SoC) handles the game calculations. When your processor heats up, it throttles performance, leading to frame drops (e.g., dropping from 60 FPS to 45 FPS).
        </p>
        <p>
          <strong>Aiming Impact:</strong> When frames drop, the engine fails to render your movements at a constant speed, making your aiming feel heavy and unresponsive. 
        </p>
        <p>
          If your phone suffers from thermal throttling or frame drops, you should enable gyroscope aim. The gyroscope sensor bypasses some of the display digitizer rendering pathways, which keeps your recoil controls active and functional even during frame spikes.
        </p>

        <AdUnit slot="0987654321" format="rectangle" className="my-8" />

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">How to Calibrate for Your Hardware</h2>
        <p>
          AimSync uses these exact hardware parameters to scale your sensitivity. If you are configuring your settings manually:
        </p>
        <ul className="list-disc pl-6 space-y-3">
          <li>
            <strong>Flagship Tier:</strong> Low touch latency + 120Hz display allows for <strong>lower, more controlled sensitivity profiles</strong>, relying on the screen's high precision for micro-adjustments.
          </li>
          <li>
            <strong>Budget/Entry Tier:</strong> High touch latency + 60Hz display requires <strong>medium-high sensitivity values</strong> with dampening filters on scopes to prevent pixel-skipping.
          </li>
        </ul>

        <p>
          Understanding your hardware ensures you do not waste time practicing drills with a configuration your phone digitizer cannot physically support. Always search your device specs, identify its limits, and calibrate accordingly.
        </p>
      </div>
    </main>
  );
}
