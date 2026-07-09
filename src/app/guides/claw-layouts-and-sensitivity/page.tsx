import type { Metadata } from 'next';
import AdUnit from '@/components/AdUnit';

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
        Claw Layouts & Sensitivity: 2, 3, 4, and 5-Finger Setup Guide
      </h1>
      <div className="text-sm font-technical text-text-muted mb-10 uppercase tracking-widest">
        Updated: 2026 • 6 Min Read
      </div>

      <div className="space-y-6 text-[#cbdbe6] leading-relaxed text-lg font-body">
        <p>
          In competitive mobile shooter games like PUBG Mobile and BGMI, your control layout dictates how fast you can execute actions like crouching, scoping, and firing. But one major concept many players overlook is how your physical finger layout directly impacts your sensitivity requirements.
        </p>

        <p>
          Your layout determines how many fingers are dedicated to controlling the camera versus executing actions. Let's break down the most popular configurations and explain how your sensitivity must adjust to fit your layout.
        </p>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">1. The Two-Finger (Thumbs) Layout</h2>
        <p>
          The two-finger setup is where almost every mobile gamer starts. Using only your left and right thumbs, you handle movement, camera rotation, scoping, crouching, jump shots, and recoil control.
        </p>
        <p>
          <strong>Sensitivity Impact:</strong> Because your right thumb is doing multiple jobs (scoping, aiming, and firing), you have limited screen real estate for continuous swiping. Therefore, 2-finger players generally need a <strong>higher Camera and ADS sensitivity</strong>. If your sensitivity is too low, you will run out of screen space when tracking moving targets or pulling down to control recoil while shooting.
        </p>

        <AdUnit slot="1234567890" format="auto" className="my-8" />

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">2. The Three-Finger Claw Layout</h2>
        <p>
          The three-finger claw layout is the bridge between beginner and competitive setups. Typically, your left index finger is introduced to handle the fire button at the top-left of the screen, while your left thumb controls movement. Your right thumb remains in charge of camera rotation, scoping, crouching, and reloading.
        </p>
        <p>
          <strong>Sensitivity Impact:</strong> By offloading the firing action to your left index finger, your right thumb is freed up purely to track targets. Since you are not trying to press the fire button and swipe at the same time, you can afford to <strong>slightly lower your ADS sensitivity</strong>. This yields massive benefits for mid-to-long-range recoil control, making sprays more stable.
        </p>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">3. The Four-Finger Claw Layout (Recommended)</h2>
        <p>
          The four-finger claw is the golden standard for competitive play. Your left index finger fires the weapon (top-left), and your right index finger opens scopes and crouches (top-right). Your left thumb handles joystick movement, and your right thumb is purely dedicated to looking around and tracking.
        </p>
        <p>
          <strong>Sensitivity Impact:</strong> Since aim control is isolated entirely from button triggers, you achieve maximum aiming stability. Four-finger claw players can lower their <strong>Camera and ADS sensitivity significantly</strong> for extreme precision. 
        </p>
        <p>
          Furthermore, because you can instantly transition between hip-fire and scoping, your 3rd Person No-Scope and 1st Person No-Scope sensitivities can be set higher for quick 180-degree turns, while keeping ADS scope sensitivities low and stable.
        </p>

        <AdUnit slot="0987654321" format="rectangle" className="my-8" />

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">4. The Five-Finger Claw Layout</h2>
        <p>
          For players seeking absolute speed, the five-finger claw adds an additional finger (usually the left middle finger) to handle map updates, peek buttons, or jump triggers.
        </p>
        <p>
          <strong>Sensitivity Impact:</strong> This layout is highly intensive and crowded. Because your fingers cover a large portion of the screen, your available swiping area is minimized. If you play 5-finger claw, you almost certainly must rely on <strong>Always-On Gyroscope</strong>. The physical gyroscope handles 80% of your camera rotation and recoil control, allowing your thumbs to focus entirely on button prompts and micro-adjustments.
        </p>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">Summary: Matching Layout to Sensitivity</h2>
        <p>
          As a rule of thumb: the fewer fingers you use, the higher your touch sensitivity must be to compensate for shared screen actions. As you add more fingers (claw layouts), you can lower touch sensitivity to gain precision, offsetting the speed difference by learning gyroscope controls.
        </p>
        <p>
          If you are transitioning layouts, remember to use an interactive configurator tool to calculate a new baseline tailored specifically to your hardware constraints.
        </p>
      </div>
    </main>
  );
}
