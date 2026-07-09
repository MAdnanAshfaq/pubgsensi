import type { Metadata } from 'next';
import AdUnit from '@/components/AdUnit';

export const metadata: Metadata = {
  title: "Weapon Recoil Control Drills — PUBG Mobile & BGMI Guide",
  description: "Improve your mid and long-range sprays in PUBG Mobile and BGMI with these aim and recoil control training drills, sensitivity adjustments, and gyroscope tips.",
};

export default function RecoilControlDrills() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 text-white">
      <h1 className="text-3xl md:text-5xl font-headline font-black text-primary-yellow mb-6 uppercase tracking-wider leading-tight">
        Mastering Recoil Control: Training Drills & Setup
      </h1>
      <div className="text-sm font-technical text-text-muted mb-10 uppercase tracking-widest">
        Updated: 2026 • 6 Min Read
      </div>

      <div className="space-y-6 text-[#cbdbe6] leading-relaxed text-lg font-body">
        <p>
          Recoil control is the ultimate differentiator between a casual player and a conqueror in PUBG Mobile and BGMI. Having a great sensitivity configuration is only half the battle; the other half is building the motor skills and muscle memory to pull down on the screen or tilt your phone accurately during intense combat.
        </p>

        <p>
          In this guide, we will cover the science behind recoil control and share the top drills used by professional players in the Training Grounds to achieve laser-like sprays.
        </p>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">Understanding Vertical vs. Horizontal Recoil</h2>
        <p>
          Before practicing, you must understand what you are fighting:
        </p>
        <ul className="list-disc pl-6 space-y-3">
          <li>
            <strong>Vertical Recoil:</strong> This is the upward kick of your weapon when holding down the fire button. It is completely constant and predictable. You control it by dragging your firing finger down or tilting your phone forward (gyroscope).
          </li>
          <li>
            <strong>Horizontal Recoil:</strong> This is the left-to-right bounce. Unlike vertical recoil, horizontal recoil is random. You cannot perfectly predict it, so you minimize it using weapon attachments (like the half grip or angled foregrip) and micro-adjustments.
          </li>
        </ul>

        <AdUnit slot="1234567890" format="auto" className="my-8" />

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">Drill 1: The 20m Target Trace (Hip-fire)</h2>
        <p>
          Go to the Training Grounds and stand in front of the moving targets at the 20-meter range.
        </p>
        <p>
          Without scoping, fire in hip-fire mode and try to keep your crosshair locked strictly on the head of the moving target. Keep your character moving left and right (strafing) while doing this. This drill builds your base camera sensitivity tracking, which is essential for close-quarters combat (CQC).
        </p>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">Drill 2: The Target Transition (100m Spray)</h2>
        <p>
          Equip an M416 with a 4x or 6x scope (adjusted down to 3x). Stand at the shooting benches and locate the stationary boards placed at 50m, 100m, and 150m.
        </p>
        <p>
          Practice firing a 10-bullet burst on the 50m target, then instantly scope out, scope back in, and fire a 10-bullet burst on the 100m target. Do this rapidly. This forces your brain to register the "swipe distance" needed to move your crosshair between targets while fighting the weapon's initial recoil kick.
        </p>

        <AdUnit slot="0987654321" format="rectangle" className="my-8" />

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">Drill 3: The Gyroscope Pull-Down Test</h2>
        <p>
          If you play with Always-On Gyroscope, stand facing a flat wall in the training area. Scope in and fire a full 40-round magazine without touching the screen with your fingers. Use *only* the tilt of your wrist to keep the bullet grouping as tight as possible.
        </p>
        <p>
          If the gun climbs upward and you cannot tilt your phone fast enough, your <strong>ADS Gyroscope Sensitivity is too low</strong>. If the crosshair shakes violently or dips downward, your sensitivity is too high.
        </p>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">Pro Tips for Recoil Stabilization</h2>
        <ul className="list-disc pl-6 space-y-3">
          <li>
            <strong>Crouch Before Spraying:</strong> Crouching reduces your weapon's recoil by roughly 20-30%. Always crouch before initiating a mid-to-long-range spray transfer.
          </li>
          <li>
            <strong>First 5 Bullets Rule:</strong> The first 5 bullets of any spray have the lowest horizontal deviance. If you cannot hit your target in the first 10 bullets, stop firing, scope out, scope in, and reset your spray.
          </li>
          <li>
            <strong>Wrist Position:</strong> When using gyro, keep your elbows resting on a table or your knees (if sitting). Floating elbows create micro-shakes that translate directly into aiming instability.
          </li>
        </ul>

        <p>
          Consistent practice for just 15 minutes a day before jumping into classic matches will do more for your recoil control than copying 100 different sensitivity codes. Start slow, dial in your unique settings, and keep practicing!
        </p>
      </div>
    </main>
  );
}
