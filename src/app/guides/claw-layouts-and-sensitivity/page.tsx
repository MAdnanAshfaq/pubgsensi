import type { Metadata } from 'next';
import AdUnit from '@/components/AdUnit';
import Image from 'next/image';

export const metadata: Metadata = {
  title: "Claw Layouts and Sensitivity Guide — PUBG Mobile & BGMI",
  description: "A deep dive into 2-finger, 3-finger, 4-finger, and 5-finger claw layouts for PUBG Mobile, detailing how layouts dictate your camera and ADS sensitivity requirements.",
  openGraph: {
    title: "Claw Layouts and Sensitivity Guide — PUBG Mobile & BGMI",
    description: "A deep dive into 2-finger, 3-finger, 4-finger, and 5-finger claw layouts for PUBG Mobile, detailing how layouts dictate your camera and ADS sensitivity requirements.",
  },
};

export default function ClawLayoutsGuide() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 text-white">
      <h1 className="text-3xl md:text-5xl font-headline font-black text-primary-yellow mb-6 uppercase tracking-wider leading-tight">
        Claw Layouts & Sensitivity: The Definitive 2, 3, 4, and 5-Finger Tuning Guide
      </h1>
      <div className="text-sm font-technical text-text-muted mb-10 uppercase tracking-widest">
        Updated: 2026 • 12 Min Read
      </div>

      <div className="space-y-6 text-[#cbdbe6] leading-relaxed text-lg font-body">
        <p>
          Your physical control setup is the foundation of your aim. When playing competitive mobile shooters like Battlegrounds Mobile India (BGMI) or PUBG Mobile, understanding the correlation between **claw layouts and sensitivity** is critical. A common mistake among players is utilizing high-sensitivity sliders designed for 4-finger layouts on standard 2-finger thumb setups, leading to inaccurate aim, floaty tracking, and uncontrollable recoil.
        </p>

        <p>
          Your layout determines how many fingers are dedicated to moving the camera, controlling recoil, and pressing tactical buttons. In this guide, we will analyze 2-finger, 3-finger, 4-finger, and 5-finger setups, and detail how your sensitivity values must change to match your layout's physical constraints.
        </p>

        <div className="relative w-full h-[350px] my-8 rounded-xl overflow-hidden border border-[#384b5c]/30">
          <Image
            src="/images/four_finger_claw_triggers.png"
            alt="PUBG Mobile Claw Layout Diagram"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </div>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">1. The Two-Finger (Thumbs) Layout</h2>
        <p>
          The two-finger thumb layout is the default starting point. You hold the phone with both hands and use only your left and right thumbs to execute every action.
        </p>
        <p>
          * **Action Allocation:** Left thumb handles movement (joystick). Right thumb handles looking, aiming, scope triggers, crouching, firing, jumping, and reloading.
        </p>
        <p>
          **Sensitivity Strategy:** Because your right thumb has to handle aiming and firing concurrently, you have very little physical screen space to drag and pull down for recoil. Therefore, 2-finger players must play with a **higher Camera and ADS sensitivity**. If your sensitivity is too low, you will run out of screen space when tracking moving targets, causing your tracking to halt.
        </p>

        <AdUnit slot="1234567890" format="auto" className="my-8" />

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">2. The Three-Finger Claw Layout</h2>
        <p>
          The three-finger claw offloads weapon firing to your left index finger, keeping your thumbs dedicated to movement and aiming.
        </p>
        <p>
          * **Action Allocation:** Left thumb moves, left index finger fires. Right thumb handles camera rotation, scoping, crouching, and reloading.
        </p>
        <p>
          **Sensitivity Strategy:** Since firing is controlled by your left hand, your right thumb can focus entirely on tracking targets. This allows you to **lower your ADS sensitivity by 10% to 15%** compared to a 2-finger setup. Lower ADS sensitivity makes your sprays far more stable, especially at mid-ranges (50m - 100m).
        </p>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">3. The Four-Finger Claw Layout (Recommended)</h2>
        <p>
          The four-finger claw is the setup used by most semi-professional and professional players. It splits movement, aiming, firing, and scoping across four separate digits.
        </p>
        <p>
          * **Action Allocation:** Left index finger fires, left thumb moves. Right index finger scopes/crouches, right thumb aims and rotates the camera.
        </p>
        <p>
          **Sensitivity Strategy:** This is the most balanced layout. Aim rotation is completely isolated from all button triggers. Because of this structural isolation, 4-finger claw players can lower their **Camera and ADS settings significantly** for maximum precision. 
        </p>
        <p>
          To move fast, 4-finger players can run a high **3rd Person No-Scope** (to turn 180 degrees instantly), while keeping scope sensitivities low and stable for zero-recoil sprays.
        </p>

        <AdUnit slot="0987654321" format="rectangle" className="my-8" />

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">4. The Five-Finger Claw Layout</h2>
        <p>
          The five-finger claw is an advanced layout designed to maximize action speeds. 
        </p>
        <p>
          * **Action Allocation:** Typically, left index and middle fingers handle firing and peeking, left thumb moves, right index scopes, and right thumb aims.
        </p>
        <p>
          **Sensitivity Strategy:** Because five fingers are placed on the screen, your available swiping area is extremely limited. If you play 5-finger claw, you **must rely on Always-On Gyroscope**. The physical gyroscope handles 80% of your camera rotation and recoil control, allowing your thumbs to focus entirely on button taps and micro-aim adjustments.
        </p>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">5. Summary Tuning Guide for Layout Transitions</h2>
        <p>
          If you are transitioning to a new layout, follow these guidelines:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Going from 2-Finger to 3-Finger:</strong> Reduce your Red Dot and 3x ADS sensitivity by **5% to 8%** since you have more finger control.
          </li>
          <li>
            <strong>Going from 3-Finger to 4-Finger:</strong> Keep your Camera settings the same, but lower your scope ADS settings to increase spray accuracy.
          </li>
          <li>
            <strong>Switching to 5-Finger:</strong> Max out your Gyroscope values (300%-400%) and lower your Touch ADS values to below 30% to prevent fingers from shaking your aim.
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">6. Conclusion</h2>
        <p>
          Your layout determines your physical capabilities. Do not blindly copy sensitivity codes. Analyze your finger configurations, align them with your device specs, and choose the correct camera, ADS, and gyroscope settings to master the battlefield.
        </p>
      </div>
    </main>
  );
}
