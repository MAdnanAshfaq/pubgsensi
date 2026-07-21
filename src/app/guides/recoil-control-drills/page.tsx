import type { Metadata } from 'next';
import AdUnit from '@/components/AdUnit';
import Image from 'next/image';

export const metadata: Metadata = {
  title: "Gear Recoil Control Drills — PUBG Mobile & BGMI Guide (2026)",
  description: "Master vertical & horizontal recoil control in PUBG Mobile and BGMI with these pro training ground routines, attachment tier lists, and sensitivity fixes.",
  alternates: {
    canonical: "https://www.gamingsensi.site/guides/recoil-control-drills",
  },
  openGraph: {
    title: "Gear Recoil Control Drills — PUBG Mobile & BGMI Guide (2026)",
    description: "Master vertical & horizontal recoil control in PUBG Mobile and BGMI with these pro training ground routines, attachment tier lists, and sensitivity fixes.",
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
    <main className="max-w-4xl mx-auto px-4 py-12 text-[#cbdbe6] font-body text-sm leading-relaxed">
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
                "acceptedAnswer": { "@type": "Answer", "text": "Recoil control in PUBG Mobile is the technique of keeping your crosshair on target during automatic fire. It relies on gyroscope tilt, ADS thumb drag, and optimal muzzle/grip attachments." }
              },
              {
                "@type": "Question",
                "name": "How to properly control recoil in PUBG Mobile?",
                "acceptedAnswer": { "@type": "Answer", "text": "Enable Always-On Gyroscope at 300–350%, equip a Compensator and Vertical Foregrip on your M416, and practice forward wrist tilting at 30m target walls in the Training Ground." }
              }
            ]
          })
        }}
      />

      {/* Header */}
      <div className="border-b border-[#384b5c]/40 pb-6 mb-8">
        <p className="text-xs font-technical uppercase tracking-widest text-[#ffd700] mb-2">
          AimSync Training Guide · Spray Calibration &amp; Recoil Drills
        </p>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-white uppercase tracking-wider leading-tight mb-4">
          Mastering Recoil Control: Training Drills &amp; Setup Manual (2026)
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-xs font-technical text-[#a0b0c0] uppercase tracking-widest">
          <span>By <strong className="text-white">Adnan Ashfaq</strong> (Hardware Specialist)</span>
          <span>•</span>
          <span>Updated: July 21, 2026</span>
          <span>•</span>
          <span>12 Min Read</span>
        </div>
      </div>

      {/* AEO Quick Answer Block */}
      <div className="bg-[#0d1a1f] border-l-4 border-[#ffd700] rounded-r-xl p-5 mb-10 shadow-lg">
        <p className="text-[10px] font-technical uppercase tracking-widest text-[#ffd700] mb-1">Quick Answer &amp; Training Summary</p>
        <p className="text-sm text-[#cbdbe6] leading-relaxed">
          <strong className="text-white">Recoil control in PUBG Mobile and BGMI</strong> is achieved by combining{' '}
          <strong className="text-[#ffd700]">Always-On Gyroscope (300-350%)</strong> with forward wrist tilting and thumb pull-down. To flatten your M416 spray, use a{' '}
          <strong className="text-[#ffd700]">Compensator + Vertical Foregrip</strong> (reduces vertical kick by ~25%) and practice 30m wall sprays daily in 5% sensitivity adjustment increments.
        </p>
      </div>

      <div className="space-y-8 text-base leading-relaxed font-body">

        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-headline font-black text-[#ffd700] uppercase tracking-wide">
            1. Understanding Recoil Mechanics: Vertical vs Horizontal Climb
          </h2>
          <p>
            When holding down the fire button on an automatic assault rifle (AR) or SMG, the in-game camera experiences two distinct recoil vectors:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <div className="bg-[#0d1a1f] border border-[#384b5c]/40 p-4 rounded-xl space-y-2">
              <h3 className="font-bold text-white uppercase text-sm">A. Vertical Recoil (Predictable)</h3>
              <p className="text-xs text-[#a0b0c0]">
                The constant upward climb caused by successive bullet shots. Because it rises in a near-linear direction, vertical recoil can be 100% neutralized through consistent downward thumb drag or gyroscope forward wrist tilt.
              </p>
            </div>
            <div className="bg-[#0d1a1f] border border-[#384b5c]/40 p-4 rounded-xl space-y-2">
              <h3 className="font-bold text-white uppercase text-sm">B. Horizontal Recoil (Random)</h3>
              <p className="text-xs text-[#a0b0c0]">
                The unpredictable side-to-side jitter during automatic sprays. Horizontal recoil cannot be fully predicted by muscle memory and must be dampened using attachments (Compensators, Half Grips) and real-time micro-gyroscope tracking.
              </p>
            </div>
          </div>

          <div className="relative w-full h-[320px] my-6 rounded-xl overflow-hidden border border-[#384b5c]/40">
            <Image
              src="/images/recoil_spread_comparison.png"
              alt="PUBG Mobile Recoil Spread Comparison Target"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
        </section>

        {/* Section 2: Weapon Attachment Efficiency Matrix */}
        <section className="space-y-4">
          <h2 className="text-2xl font-headline font-black text-[#ffd700] uppercase tracking-wide">
            2. Weapon Attachment Recoil Reduction Tier List
          </h2>
          <p>
            Combining optimal sensitivity with top-tier attachments drastically reduces the physical tilt angle needed for zero recoil:
          </p>

          <div className="bg-[#0d1a1f] border border-[#384b5c]/40 rounded-xl overflow-hidden my-4">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#111d24] border-b border-[#384b5c]/40 text-[#ffd700] font-technical uppercase">
                <tr>
                  <th className="px-4 py-3">Attachment Category</th>
                  <th className="px-4 py-3">Top Choice</th>
                  <th className="px-4 py-3">Vertical Reduction</th>
                  <th className="px-4 py-3">Horizontal Reduction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#384b5c]/20">
                <tr>
                  <td className="px-4 py-3 font-bold text-white">Muzzle (AR)</td>
                  <td className="px-4 py-3 text-[#ffd700] font-bold">Compensator</td>
                  <td className="px-4 py-3 text-[#cbdbe6] font-mono">-15%</td>
                  <td className="px-4 py-3 text-[#cbdbe6] font-mono">-10%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold text-white">Foregrip (Long Range Spray)</td>
                  <td className="px-4 py-3 text-[#ffd700] font-bold">Vertical Foregrip</td>
                  <td className="px-4 py-3 text-[#cbdbe6] font-mono">-15%</td>
                  <td className="px-4 py-3 text-[#a0b0c0] font-mono">0%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold text-white">Foregrip (Close/Mid Hybrid)</td>
                  <td className="px-4 py-3 text-[#cbdbe6]">Half Grip</td>
                  <td className="px-4 py-3 text-[#cbdbe6] font-mono">-8%</td>
                  <td className="px-4 py-3 text-[#cbdbe6] font-mono">-8%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold text-white">Foregrip (Hipfire CQC)</td>
                  <td className="px-4 py-3 text-[#cbdbe6]">Laser Sight</td>
                  <td className="px-4 py-3 text-[#a0b0c0] font-mono">0%</td>
                  <td className="px-4 py-3 text-[#ffd700] font-mono">-30% Hipfire Spread</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: 4 Essential Training Drills */}
        <section className="space-y-4">
          <h2 className="text-2xl font-headline font-black text-[#ffd700] uppercase tracking-wide">
            3. The 4 Essential Training Ground Recoil Drills
          </h2>
          <div className="space-y-4">
            {[
              {
                num: "Drill 1",
                title: "30-Meter Naked Wall Spray Calibration",
                desc: "Equip an M416 with NO muzzle or grip attachments. Stand 30m from a flat wall. Fire a full 30-round mag while pulling down. Adjust your Gyro / ADS sensitivity in 5% increments until the bullet cluster forms a tight vertical line."
              },
              {
                num: "Drill 2",
                title: "Target Transfer Rapid Sweeps",
                desc: "Set 3 targets at 20m, 40m, and 60m. Fire 10 rounds into target 1, then sweep your wrist to target 2 without releasing the fire button, firing 10 rounds, then finish on target 3. Builds recoil compensation during lateral movement."
              },
              {
                num: "Drill 3",
                title: "Crouch-Peek Recoil Suppression",
                desc: "Stand behind cover, peek left/right, drop into a crouch (which inherently reduces recoil by ~20%), and fire a 15-bullet laser burst before resetting. Essential for high-tier rank lobbies."
              },
              {
                num: "Drill 4",
                title: "7.62mm Heavy Recoil Adjustment (AKM / Beryl)",
                desc: "Switch to a Beryl M762 with 3x scope. Because 7.62mm rounds have 20% higher vertical climb than 5.56mm rounds, increase your 3x Gyro ADS by +10% over your M416 baseline."
              }
            ].map((drill) => (
              <div key={drill.num} className="bg-[#0d1a1f] border border-[#384b5c]/40 p-4 rounded-xl">
                <span className="text-xs font-technical text-[#ffd700] uppercase tracking-widest">{drill.num}</span>
                <h3 className="font-headline font-bold text-white text-lg mt-1 mb-2">{drill.title}</h3>
                <p className="text-xs text-[#cbdbe6] leading-relaxed">{drill.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="bg-[#0d1a1f] border border-[#ffd700]/30 rounded-2xl p-6 text-center my-8 shadow-xl">
          <h3 className="font-headline text-xl font-black text-white uppercase mb-2">
            Calculate Your Custom Zero Recoil Profile
          </h3>
          <p className="text-xs text-[#a0b0c0] mb-4 max-w-md mx-auto">
            Generate hardware-specific sensitivity parameters optimized for zero recoil sprays on your phone or tablet.
          </p>
          <a
            href="/"
            className="inline-block bg-[#ffd700] text-black font-headline font-black text-xs uppercase px-6 py-3 rounded-lg hover:bg-[#ffd700]/90 transition-all shadow-md"
          >
            Generate Recoil Profile →
          </a>
        </div>

      </div>
    </main>
  );
}
