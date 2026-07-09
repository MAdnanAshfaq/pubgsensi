import type { Metadata } from 'next';
import AdUnit from '@/components/AdUnit';
import Image from 'next/image';

export const metadata: Metadata = {
  title: "Best PUBG Mobile Sensitivity Settings (2026 Guide)",
  description: "Find the absolute best PUBG Mobile sensitivity settings for zero recoil. Comprehensive guide on camera, ADS, and gyroscope settings.",
  openGraph: {
    title: "Best PUBG Mobile Sensitivity Settings (2026 Guide)",
    description: "Find the absolute best PUBG Mobile sensitivity settings for zero recoil. Comprehensive guide on camera, ADS, and gyroscope settings.",
  },
};

export default function Guide1() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 text-white">
      <h1 className="text-3xl md:text-5xl font-headline font-black text-primary-yellow mb-6 uppercase tracking-wider leading-tight">
        The Best PUBG Mobile Sensitivity Settings: Complete 2026 Tuning Manual
      </h1>
      <div className="text-sm font-technical text-text-muted mb-10 uppercase tracking-widest">
        Updated: 2026 • 12 Min Read
      </div>

      <div className="space-y-6 text-[#cbdbe6] leading-relaxed text-lg font-body">
        <p>
          Mastering your close-range tracking and long-range sprays requires finding the perfect **PUBG Mobile sensitivity settings**. In mobile battle royale gaming, having slightly miscalibrated sliders can make the difference between securing a chicken dinner and returning to the lobby. While many players copy configuration codes directly from professional esports athletes, they quickly discover that those settings fail to deliver the same precision on their own devices.
        </p>

        <p>
          The truth is that optimal sensitivity is highly dependent on your specific hardware specifications, display size, and control layout. In this comprehensive guide, we will analyze every component of the setting sliders, provide mathematical tuning formulas, detail recoil control tips, and provide optimized baseline configurations to help you establish a zero-recoil profile.
        </p>

        <div className="relative w-full h-[350px] my-8 rounded-xl overflow-hidden border border-[#384b5c]/30">
          <Image
            src="/images/sensi_chart_comparison.png"
            alt="PUBG Mobile Sensitivity Settings Chart"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </div>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">1. Understanding the Sensitivity Layers</h2>
        <p>
          Before adjusting your settings, you must understand the distinction between the three primary sensitivity categories inside PUBG Mobile and BGMI:
        </p>

        <h3 className="text-xl font-bold text-primary-yellow mt-6 mb-2">A. Camera Sensitivity (Screen Swipe / Free Look)</h3>
        <p>
          This controls how fast your camera turns when you swipe the screen without firing your weapon. It determines your target acquisition speed. If this is too low, you will struggle to turn 180 degrees when attacked from behind. If it is too high, you will overshoot your targets while scanning.
        </p>

        <h3 className="text-xl font-bold text-primary-yellow mt-6 mb-2">B. ADS (Aim Down Sights) Sensitivity</h3>
        <p>
          This controls the speed of your camera *while you are shooting* with your fingers. This is the primary mechanic non-gyroscope players use to drag down and control vertical recoil. It is only active during active firing sequences.
        </p>

        <h3 className="text-xl font-bold text-primary-yellow mt-6 mb-2">C. Gyroscope Sensitivity</h3>
        <p>
          This controls the camera rotation when you tilt your device physically. Gyroscope aiming utilizes internal sensors (the mobile accelerometer and gyro) to track movement, allowing you to control recoil and track enemies by tilting your wrists, leaving your fingers free to crouch, scope, and jump.
        </p>

        <AdUnit slot="1234567890" format="auto" className="my-8" />

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">2. The Best No-Gyro Sensitivity Configurations</h2>
        <p>
          If you play with the gyroscope completely disabled, your fingers must handle all camera and recoil controls. Since your thumbs have a limited physical space to swipe, you need higher overall values.
        </p>

        <h3 className="text-lg font-bold text-white mt-6 mb-2">Camera Sensitivity (Standard View)</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>3rd Person No Scope: 120% - 135%</li>
          <li>1st Person No Scope: 110% - 125%</li>
          <li>Red Dot, Holographic, Aim Assist: 50% - 60%</li>
          <li>2x Scope: 30% - 40%</li>
          <li>3x Scope: 20% - 25%</li>
          <li>4x Scope: 15% - 18%</li>
          <li>6x Scope: 10% - 12%</li>
          <li>8x Scope: 8% - 10%</li>
        </ul>

        <h3 className="text-lg font-bold text-white mt-6 mb-2">ADS Sensitivity (Recoil Correction)</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>3rd Person No Scope: 125% - 140%</li>
          <li>1st Person No Scope: 115% - 130%</li>
          <li>Red Dot, Holographic, Aim Assist: 55% - 65%</li>
          <li>2x Scope: 35% - 45%</li>
          <li>3x Scope: 25% - 30%</li>
          <li>4x Scope: 18% - 22%</li>
          <li>6x Scope: 12% - 15%</li>
          <li>8x Scope: 10% - 12%</li>
        </ul>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">3. The Best Gyroscope Sensitivity Settings (Always-On)</h2>
        <p>
          Always-On Gyroscope is highly recommended for competitive PUBG Mobile sensitivity settings. By using wrist tilts for micro-aiming, your overall spray accuracy doubles.
        </p>

        <h3 className="text-lg font-bold text-white mt-6 mb-2">Camera & ADS Gyroscope Settings</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>3rd Person No Scope: 300% - 350%</li>
          <li>1st Person No Scope: 280% - 320%</li>
          <li>Red Dot, Holographic, Aim Assist: 300% - 350%</li>
          <li>2x Scope: 250% - 300%</li>
          <li>3x Scope: 180% - 240%</li>
          <li>4x Scope: 160% - 200%</li>
          <li>6x Scope: 90% - 120%</li>
          <li>8x Scope: 60% - 85%</li>
        </ul>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">4. Device Specific Calibrations (Damping Formulas)</h2>
        <p>
          Why do these baselines need further adjustments? It comes down to screen density and digitizer latency. We use specific calibration rules to adjust these settings:
        </p>
        <p>
          * **High-End Flagships (e.g., iPhone 15 Pro, ROG Phone):** These screens support 240Hz+ touch sampling rates. Aiming is highly responsive, allowing you to decrease your sensitivities by **5% to 10%** for tighter groupings.
        </p>
        <p>
          * **Budget Devices (e.g., under $250):** Lower processing speeds introduce touch latency. Swipes feel delayed. To compensate, you must increase camera and ADS values by **10% to 15%** to make the controls react quicker.
        </p>

        <AdUnit slot="0987654321" format="rectangle" className="my-8" />

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">5. Step-by-Step Training Ground Tuning Routine</h2>
        <p>
          To fine-tune your configuration, dedicate 10 minutes to this routine daily:
        </p>
        <ol className="list-decimal pl-6 space-y-3">
          <li>
            <strong>Adjust 3rd Person No-Scope:</strong> Stand at the center of the training grounds. Rapidly flick your crosshair between two targets located 10 meters away. If your crosshair lands past the target, reduce your sensitivity by 5%. If it stops short, increase it by 5%.
          </li>
          <li>
            <strong>Tune Your 3x Scope (Rifle sprays):</strong> Equip an M416 with only a 3x scope (no attachments). Shoot at a 50m target board. Adjust your ADS or Gyroscope sensitivity until the horizontal bullet bounce is minimized and you can easily drag down.
          </li>
          <li>
            <strong>Sniper Tuning:</strong> Equip an AWM with an 8x scope. Try to quick-scope target boards at 150m. Since sniper scopes require extreme precision, keep your 8x gyroscope sensitivity below 85% to prevent breathing movements from shaking your crosshair.
          </li>
        </ol>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">6. Conclusion</h2>
        <p>
          Establishing optimal PUBG Mobile sensitivity settings is a continuous process of calibration. Instead of copying codes that don't match your device, understand how touch latency and layout dictate your sliders. Start with the baseline settings provided above, run the training ground routine, and enjoy zero-recoil performance.
        </p>
      </div>
    </main>
  );
}
