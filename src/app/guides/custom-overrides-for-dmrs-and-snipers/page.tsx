import type { Metadata } from 'next';
import AdUnit from '@/components/AdUnit';
import Image from 'next/image';

export const metadata: Metadata = {
  title: "Custom Sensitivity Overrides for DMRs and Snipers (Guide)",
  description: "Learn how to configure custom sensitivity overrides for designated marksman rifles (DMRs) and bolt-action sniper rifles to maximize accuracy without affecting your automatic sprays.",
  alternates: {
    canonical: "https://www.gamingsensi.site/guides/custom-overrides-for-dmrs-and-snipers",
  },
  openGraph: {
    title: "Custom Sensitivity Overrides for DMRs and Snipers (Guide)",
    description: "Learn how to configure custom sensitivity overrides for designated marksman rifles (DMRs) and bolt-action sniper rifles to maximize accuracy without affecting your automatic sprays.",
  },
};

export default function Guide7() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": "Custom Sensitivity Overrides for DMRs and Snipers (Guide)",
    "description": "Learn how to configure custom sensitivity overrides for designated marksman rifles (DMRs) and bolt-action sniper rifles to maximize accuracy without affecting your automatic sprays.",
    "image": "https://www.gamingsensi.site/images/custom_overrides_hud.png",
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
    "datePublished": "2026-07-10",
    "dateModified": "2026-07-21",
    "url": "https://www.gamingsensi.site/guides/custom-overrides-for-dmrs-and-snipers",
    "keywords": "DMR sensitivity PUBG Mobile, sniper sensitivity BGMI, custom gear sensitivity overrides, SKS sensitivity PUBG, AWM sensitivity settings"
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
                "name": "What sensitivity should I use for snipers in PUBG Mobile?",
                "acceptedAnswer": { "@type": "Answer", "text": "For bolt-action snipers (AWM, M24) in PUBG Mobile: 6x ADS 10–18%, 8x ADS 8–15%, Gyro 6x 40–60%, Gyro 8x 28–45%. These low values prevent hand tremors and small movements from shaking your scope at long range. Enable Custom Gear Sensitivity in your settings to apply these values specifically to bolt-actions without affecting your AR spray settings." }
              },
              {
                "@type": "Question",
                "name": "What is the best sensitivity for DMRs (SKS, Mini-14) in PUBG Mobile?",
                "acceptedAnswer": { "@type": "Answer", "text": "For DMRs (SKS, Mini-14, MK14) in PUBG Mobile: 3x ADS 22–32%, 4x ADS 16–26%, 6x ADS 12–20%, Gyro 3x 110–150%, Gyro 4x 75–110%. DMRs are semi-auto, so you do not need drag-down recoil control. Focus on stability: lower gyro values allow precise single-shot tracking without accidental drift between shots." }
              },
              {
                "@type": "Question",
                "name": "How do I set custom gear sensitivity in PUBG Mobile?",
                "acceptedAnswer": { "@type": "Answer", "text": "To set Custom Gear Sensitivity in PUBG Mobile: Settings → Sensitivity → scroll to Custom Weapon Sensitivity → enable the toggle for each weapon you want to override. Then set individual ADS and Gyroscope values for that specific weapon. This lets you have high Gyro settings for M416 sprays and low settings for AWM sniping without changing your global profile." }
              },
              {
                "@type": "Question",
                "name": "Should snipers use gyroscope in PUBG Mobile?",
                "acceptedAnswer": { "@type": "Answer", "text": "Yes, but with very low gyroscope values for high-magnification scopes. For 6x and 8x scopes, set Gyro to 40–60% and 28–45% respectively. This gives just enough gyro response to make fine tracking adjustments during a target's movement without shaking the crosshair at long range. Use Custom Gear Sensitivity to keep high Gyro for ARs while having low Gyro for bolt-actions." }
              }
            ]
          })
        }}
      />
      <h1 className="text-3xl md:text-5xl font-headline font-black text-primary-yellow mb-6 uppercase tracking-wider leading-tight">
        Custom Overrides for DMRs & Snipers
      </h1>

      <div className="flex flex-wrap items-center gap-3 text-xs font-technical text-text-muted mb-6 uppercase tracking-widest border-b border-[#384b5c]/25 pb-4">
        <span>By <strong className="text-white">Adnan Ashfaq</strong> (Hardware Specialist)</span>
        <span>•</span>
        <span>Published: July 10, 2026</span>
        <span>•</span>
        <span>9 Min Read</span>
      </div>

      {/* AEO Quick Answer Block */}
      <div className="bg-[#0d1a1f] border-l-4 border-[#ffd700] rounded-r-xl p-4 mb-8">
        <p className="text-[10px] font-technical uppercase tracking-widest text-[#ffd700] mb-1">Quick Answer</p>
        <p className="text-sm text-[#cbdbe6] leading-relaxed">
          <strong className="text-white">Sniper sensitivity in PUBG Mobile</strong>: AWM/M24 6x ADS{' '}
          <strong className="text-[#ffd700]">10–18%</strong>, 8x ADS{' '}
          <strong className="text-[#ffd700]">8–15%</strong>, Gyro 8x{' '}
          <strong className="text-[#ffd700]">28–45%</strong>. Use Custom Gear Sensitivity to set these per weapon without changing your AR profile. Use{' '}
          <a href="/" className="underline text-[#ffd700]">AimSync</a> to generate custom overrides per weapon category.
        </p>
      </div>

      <div className="space-y-6 text-[#cbdbe6] leading-relaxed text-lg font-body">
        <p>
          One of the biggest mistakes in mobile shooter gameplay is relying entirely on global sensitivity configurations. While a high 4x or 6x gyroscope sensitivity is ideal for control sprays with automatic gears like the M416, utilizing those same values on a Bolt-Action Sniper Rifle or a Designated Marksman Rifle (DMR) will make precise crosshair adjustments near impossible. The slightest hand twitch will throw your crosshair off target at long ranges.
        </p>

        <p>
          Fortunately, the advanced settings engine allows you to specify custom sensitivity overrides for individual gear setups. In this guide, we will analyze the technical mechanics of single-tap recoil stabilization, explore zoom scroll ratios, and provide the exact setup configurations for DMRs and Bolt-Action snipers. For official gear updates and community setups, check the <a href="https://www.pubgmobile.com" target="_blank" rel="noopener noreferrer" className="text-primary-yellow hover:underline">Official PUBG Mobile Site</a>.
        </p>

        <div className="relative w-full h-[350px] my-8 rounded-xl overflow-hidden border border-[#384b5c]/30">
          <Image
            src="/images/custom_overrides_hud.png"
            alt="Custom Sensitivity Overrides Calibration UI"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </div>

        <h2 className="text-2xl font-headline font-black uppercase text-white tracking-tight mt-10 mb-4 border-b border-[#384b5c]/20 pb-2">
          1. The Physics of Single-Tap Stabilization
        </h2>
        <p>
          When you fire an automatic gear, recoil control is about continuous, consistent drag adjustments. However, when firing a DMR (such as the Mini14 or SLR), recoil control is about rapid reset alignment. Every time you tap the fire button, the camera jumps vertically and horizontally, and you must wait for the reticle to return to its original position before firing the next shot.
        </p>
        <p>
          If your DMR sensitivity is too high, your manual resetting adjustments will overcorrect, resulting in a zigzag pattern around the target head. Ideally, you want your DMR sensitivity to be **20% to 30% lower** than your automatic spray settings for matching scopes. This lower sensitivity stabilizes the reticle, allowing for extremely fast, consistent tapping.
        </p>

        <AdUnit slot="1234567890" format="auto" className="my-8" />

        <h2 className="text-2xl font-headline font-black uppercase text-white tracking-tight mt-10 mb-4 border-b border-[#384b5c]/20 pb-2">
          2. Bolt-Action Sniping: The Micro-Adjustments Threshold
        </h2>
        <p>
          With Bolt-Action Sniper Rifles (like the M24 or AWM), you only have one shot to secure a knock. Because targets at 150+ meters occupy very few pixels on your screen, aim tracking is all about microscopic movements.
        </p>
        <p>
          For these long-range precision shots, a lower sensitivity profile is mandatory. When using high-zoom optics (e.g. 8x scope), your Gyroscope sensitivity should be calibrated between **60% and 85%**. This prevents your natural breathing twitches or heartbeat from throwing off your target acquisition, while giving you just enough range of motion to trace moving targets.
        </p>

        <h2 className="text-2xl font-headline font-black uppercase text-white tracking-tight mt-10 mb-4 border-b border-[#384b5c]/20 pb-2">
          3. Dynamic Scope Zoom Ratios
        </h2>
        <p>
          Many players adjust their scopes dynamically during match play (e.g., scrolling a 6x scope down to 3x, or an 8x scope down to 4x). The engine handles sensitivity adjustments for adjusted scopes as follows:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Adjusted Zoom Sensitivity:</strong> When you adjust a 6x scope down to 3x, the game does *not* apply your 6x sensitivity values. Instead, it dynamically switches to your **3x sensitivity configuration**.
          </li>
          <li>
            <strong>Calibration Advantage:</strong> You can exploit this mechanic by keeping your global 3x sensitivity high for automatic rifle sprays, while keeping your custom 6x override low for DMR single-taps. If you need to spray with a 6x, simply scroll it down to 3x to access your high-speed spray settings instantly.
          </li>
        </ul>

        <AdUnit slot="0987654321" format="rectangle" className="my-8" />

        <h2 className="text-2xl font-headline font-black uppercase text-white tracking-tight mt-10 mb-4 border-b border-[#384b5c]/20 pb-2">
          4. Recommended Custom Override Profiles
        </h2>
        <p>
          To configure your custom gear profiles, go to Settings ➔ Sensitivity ➔ Custom, select the specific gear, and apply these baseline offsets:
        </p>
        
        <div className="overflow-x-auto my-6 border border-[#384b5c]/25 rounded-xl bg-surface-card">
          <table className="min-w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#384b5c]/35 bg-surface-hover font-headline text-xs text-primary-yellow uppercase tracking-wider">
                <th className="p-3">Gear Type</th>
                <th className="p-3">Scope Group</th>
                <th className="p-3">Camera Sensitivity</th>
                <th className="p-3">Gyroscope Sensitivity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#384b5c]/15 text-[#cbdbe6]">
              <tr>
                <td className="p-3 font-semibold text-white">M416 / Scar-L (Spray)</td>
                <td className="p-3">3x / 4x</td>
                <td className="p-3">Default (100%)</td>
                <td className="p-3">Default (100%)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Mini14 / SLR (DMR)</td>
                <td className="p-3">4x / 6x</td>
                <td className="p-3">Reduce by 25%</td>
                <td className="p-3">Reduce by 30%</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">M24 / AWM (Sniper)</td>
                <td className="p-3">8x</td>
                <td className="p-3">Reduce by 40%</td>
                <td className="p-3">Reduce by 45%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          By locking in these specialized overrides, you ensure that your muscle memory can stay consistent when transitioning between close-quarters automatic engagements and long-range tactical sniper fights.
        </p>
      </div>
    </main>
  );
}
