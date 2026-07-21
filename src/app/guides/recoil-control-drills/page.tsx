import type { Metadata } from 'next';
import AdUnit from '@/components/AdUnit';
import Image from 'next/image';

export const metadata: Metadata = {
  title: "Gear Recoil Control Drills — PUBG Mobile & BGMI Guide",
  description: "Improve your mid and long-range sprays in PUBG Mobile and BGMI with these aim and recoil control training drills, sensitivity adjustments, and gyroscope tips.",
  alternates: {
    canonical: "https://www.gamingsensi.site/guides/recoil-control-drills",
  },
  openGraph: {
    title: "Gear Recoil Control Drills — PUBG Mobile & BGMI Guide",
    description: "Improve your mid and long-range sprays in PUBG Mobile and BGMI with these aim and recoil control training drills, sensitivity adjustments, and gyroscope tips.",
  },
};

export default function RecoilControlDrills() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": "Gear Recoil Control Drills — PUBG Mobile & BGMI Guide",
    "description": "Improve your mid and long-range sprays in PUBG Mobile and BGMI with these aim and recoil control training drills, sensitivity adjustments, and gyroscope tips.",
    "image": "https://www.gamingsensi.site/images/recoil_spread_comparison.png",
    "author": {
      "@type": "Organization",
      "name": "AimSync"
    },
    "publisher": {
      "@type": "Organization",
      "name": "AimSync",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.gamingsensi.site/icon.svg"
      }
    },
    "datePublished": "2026-07-09",
    "dateModified": "2026-07-21",
    "url": "https://www.gamingsensi.site/guides/recoil-control-drills",
    "keywords": "recoil control PUBG, how to control recoil PUBG Mobile, BGMI recoil drills, zero recoil training, spray control PUBG"
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is recoil control in PUBG Mobile?",
                "acceptedAnswer": { "@type": "Answer", "text": "Recoil control in PUBG Mobile is the technique of keeping your crosshair on target during automatic fire. Every weapon has a predictable spray pattern — mostly vertical climb. Recoil control uses gyroscope wrist tilt, ADS thumb drag-down, and weapon attachments to cancel this vertical rise and keep the crosshair flat." }
              },
              {
                "@type": "Question",
                "name": "How to properly control recoil in PUBG Mobile?",
                "acceptedAnswer": { "@type": "Answer", "text": "To properly control recoil: (1) Enable Always-On Gyroscope at 300–350%. (2) Equip Compensator + Vertical Foregrip on M416. (3) In Training Ground, spray at a wall 30m away while tilting your wrist forward. (4) Observe the bullet pattern — if it climbs, increase Gyro by 10%. If it drops, decrease by 10%. (5) Adjust in 5% steps until the spray is a vertical flat line." }
              },
              {
                "@type": "Question",
                "name": "How to get 0 recoil in PUBG Mobile?",
                "acceptedAnswer": { "@type": "Answer", "text": "Zero recoil in PUBG Mobile requires: Always-On Gyroscope at 300–350%, Compensator + Vertical Foregrip attachments, and daily Training Ground practice for 15 minutes. Spray at a 30m wall, tilt wrist forward while firing, and adjust Gyro sensitivity in 5% steps until the pattern is flat. 7.62mm rifles (AKM, Beryl) need 8–12% more Gyro than 5.56mm rifles." }
              },
              {
                "@type": "Question",
                "name": "How to get 0 recoil in Warzone or PUBG without gyroscope?",
                "acceptedAnswer": { "@type": "Answer", "text": "Without gyroscope, control recoil by: setting ADS sensitivity 10–15% lower than Camera values, using 4F claw layout so index fingers handle fire triggers while thumbs focus on pull-down drag, equipping Compensator + Vertical Foregrip, and practicing the pull-down drag at 30m targets daily. AimSync generates recoil-optimized sensitivity without gyroscope if you select the Disabled Gyro option." }
              },
              {
                "@type": "Question",
                "name": "Which weapon has the most recoil in PUBG Mobile?",
                "acceptedAnswer": { "@type": "Answer", "text": "The Beryl M762 has the highest recoil of all ARs in PUBG Mobile, followed by the AKM. Both are 7.62mm caliber and require 8–15% higher Gyro and ADS values than the M416 baseline. The M416 and SCAR-L (5.56mm) have the most manageable recoil and are the standard calibration weapons for Training Ground drills." }
              }
            ]
          })
        }}
      />
      <h1 className="text-3xl md:text-5xl font-headline font-black text-primary-yellow mb-6 uppercase tracking-wider leading-tight">
        Mastering Recoil Control: Training Drills & Setup Manual
      </h1>
      <div className="flex flex-wrap items-center gap-3 text-xs font-technical text-text-muted mb-6 uppercase tracking-widest border-b border-[#384b5c]/25 pb-4">
        <span>By <strong className="text-white">Adnan Ashfaq</strong> (Hardware Specialist)</span>
        <span>•</span>
        <span>Published: July 9, 2026</span>
        <span>•</span>
        <span>12 Min Read</span>
      </div>

      {/* AEO Quick Answer Block */}
      <div className="bg-[#0d1a1f] border-l-4 border-[#ffd700] rounded-r-xl p-4 mb-8">
        <p className="text-[10px] font-technical uppercase tracking-widest text-[#ffd700] mb-1">Quick Answer</p>
        <p className="text-sm text-[#cbdbe6] leading-relaxed">
          <strong className="text-white">How to control recoil in PUBG Mobile</strong>: Enable{' '}
          <strong className="text-[#ffd700]">Always-On Gyroscope at 300–350%</strong>. Spray M416 at 30m in Training Ground while tilting wrist forward. Adjust in 5% steps until flat. 7.62mm rifles (AKM, Beryl) need{' '}
          <strong className="text-[#ffd700]">+8–12% more Gyro</strong>. Use Compensator + Vertical Foregrip on all ARs. Use{' '}
          <a href="/" className="underline text-[#ffd700]">AimSync</a> to auto-generate recoil-optimized values.
        </p>
      </div>

      <div className="space-y-6 text-[#cbdbe6] leading-relaxed text-lg font-body">
        <p>
          Recoil control is the primary differentiator between casual players and top-tier conquerors in PUBG Mobile and BGMI. While having an optimized sensitivity layout is critical, it is only half of the equation. The other half is developing the muscle memory and motor skills needed to drag your fingers or tilt your phone at the exact speed required to cancel out gear recoil.
        </p>

        <p>
          In this comprehensive guide, we will analyze the mechanics of vertical and horizontal gear climb, provide detailed training ground **recoil control drills** used by professional players, and explain how to troubleshoot your sensitivity settings based on your spray patterns. Watch competitive tournament highlights and matches on the official <a href="https://www.youtube.com/@PUBGMOBILEEsports" target="_blank" rel="noopener noreferrer" className="text-primary-yellow hover:underline">PUBG Mobile Esports Channel</a>.
        </p>

        <div className="relative w-full h-[350px] my-8 rounded-xl overflow-hidden border border-[#384b5c]/30">
          <Image
            src="/images/recoil_spread_comparison.png"
            alt="PUBG Mobile Recoil Control Drills Target"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </div>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">1. Understanding Recoil Mechanics</h2>
        <p>
          Before practicing, you must understand what you are fighting when you hold down the fire button:
        </p>

        <h3 className="text-xl font-bold text-primary-yellow mt-6 mb-2">A. Vertical Recoil (Predictable)</h3>
        <p>
          This is the upward kick of your gear when firing. It climbs at a relatively constant rate. You control it by dragging your finger down on the screen or tilting your phone forward (using gyroscope). Because it is predictable, you can train your muscle memory to neutralize it completely.
        </p>

        <h3 className="text-xl font-bold text-primary-yellow mt-6 mb-2">B. Horizontal Recoil (Random)</h3>
        <p>
          This is the random left-to-right bounce. Unlike vertical recoil, horizontal recoil is random and cannot be fully predicted. You minimize it by choosing correct gear attachments (like the Half Grip or Compensator) and performing rapid micro-adjustments with your gyroscope.
        </p>

        <AdUnit slot="1234567890" format="auto" className="my-8" />

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">2. The 3 Essential Recoil Control Drills</h2>
        <p>
          Spend 10 minutes in the Training Grounds practicing these routines before jumping into classic matches:
        </p>

        <h3 className="text-xl font-bold text-primary-yellow mt-6 mb-2">Drill 1: The 50m Target Lock (Spray Control)</h3>
        <p>
          Equip an M416 with a 3x or 4x scope. Stand at the shooting benches facing the stationary targets at 50 meters.
        </p>
        <p>
          Fire a full 40-round magazine and try to keep all bullets clustered within the center ring of the target. If the gear climbs upward, increase your ADS/Gyro scope sensitivity by **5%**. If the gear dips downward, reduce it by **5%**. Repeat this until you can keep 90% of the bullets in the inner circle.
        </p>

        <h3 className="text-xl font-bold text-primary-yellow mt-6 mb-2">Drill 2: The Target Transition (Spray Transfer)</h3>
        <p>
          Set up three targets at 50m, 75m, and 100m.
        </p>
        <p>
          Open your scope, fire a 10-bullet burst on the first target, then instantly swipe or tilt to the second target without scoping out, and fire another 10-bullet burst. Finally, transfer to the third target. This drill trains your transition speed and teaches your muscles how much physical distance is required to move the crosshair while fighting active recoil.
        </p>

        <h3 className="text-xl font-bold text-primary-yellow mt-6 mb-2">Drill 3: The Crouch-Peak Stability Test</h3>
        <p>
          Find a wall or cover in the training area. Practice peeking out, crouching, opening your scope, firing a 15-bullet burst, and peeking back into cover. Crouching reduces your gear's recoil by roughly **20% to 30%**, and peeking helps minimize exposure to return fire.
        </p>

        <AdUnit slot="0987654321" format="rectangle" className="my-8" />

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">3. Troubleshooting Your Recoil</h2>
        <p>
          If your sprays are shaky, look at your bullet holes on the wall and apply these settings adjustments:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Horizontal Shaking:</strong> If the bullets bounce wildly from left to right, your sensitivity is likely too high, or you need to equip an Angled Grip/Half Grip. Reduce your scope sensitivity by **3% to 5%**.
          </li>
          <li>
            <strong>Vertical Climbing:</strong> If you run out of screen space or find yourself tilting your wrist to an uncomfortable angle, increase your ADS or Gyroscope sensitivity by **8% to 10%**.
          </li>
          <li>
            <strong>Shaky Start:</strong> If the first 5 bullets are stable but the rest climb uncontrollably, make sure you are crouched and tap-firing instead of holding down the trigger for too long.
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-white mt-10 mb-4">4. Conclusion</h2>
        <p>
          Recoil control is a physical skill that requires regular practice. By understanding the mechanical differences between vertical and horizontal dispersion, adjusting your settings based on target patterns, and practicing transitions daily, you can achieve laser-like sprays and dominate your matches.
        </p>
      </div>
    </main>
  );
}
