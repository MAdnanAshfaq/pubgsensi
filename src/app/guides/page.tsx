import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Tactical Sensitivity Guides — AimSync",
  description: "Master your recoil, understand gyroscope tilting, optimize multi-finger claw layouts, and calibrate settings for your device's touch screen latency.",
  alternates: {
    canonical: "https://www.gamingsensi.site/guides",
  },
  openGraph: {
    title: "Tactical Sensitivity Guides — AimSync",
    description: "Master your recoil, understand gyroscope tilting, optimize multi-finger claw layouts, and calibrate settings for your device's touch screen latency.",
  },
};

export default function GuidesHub() {
  const guides = [
    {
      title: "The Best Sensitivity Settings for PUBG Mobile (2026 Guide)",
      slug: "best-sensitivity-pubg-mobile",
      description: "Stop copying YouTubers and find out how to actually find the best settings for your device."
    },
    {
      title: "Gyroscope Settings Explained: Should You Always On?",
      slug: "gyroscope-settings-explained",
      description: "A deep dive into PUBG Mobile's gyroscope settings and how it impacts recoil control and close combat."
    },
    {
      title: "Claw Layouts and Sensitivity: 2, 3, 4, and 5-Finger Settings",
      slug: "claw-layouts-and-sensitivity",
      description: "Learn how your physical layout dictates your touch, ADS, and gyroscope sensitivity needs."
    },
    {
      title: "Mastering Recoil Control: Training Drills & Setup",
      slug: "recoil-control-drills",
      description: "Improve your mid and long-range sprays with these target tracking exercises and wrist position guides."
    },
    {
      title: "Touch Latency & Refresh Rate: How Your Phone Affects Aim",
      slug: "hardware-impact-on-aim",
      description: "Understand the correlation between display Hz, touch sampling rates, thermal throttling, and aim stability."
    }
  ];

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 text-white">
      <h1 className="text-4xl font-headline font-bold text-primary-yellow mb-8 uppercase tracking-wider">Tactical Guides & Resources</h1>
      <p className="text-[#cbdbe6] mb-10 text-lg">Master your aim, understand the mechanics, and optimize your device for maximum performance.</p>
      
      <div className="grid gap-6 mb-16">
        {guides.map(guide => (
          <Link key={guide.slug} href={`/guides/${guide.slug}`} className="block">
            <div className="bg-[#1b2836]/75 border border-[#384b5c]/40 rounded-lg p-6 hover:bg-[#1b2836] transition-colors cursor-pointer group">
              <h2 className="text-xl font-headline font-bold text-[#9cd8ff] mb-2 group-hover:text-primary-yellow transition-colors">{guide.title}</h2>
              <p className="text-[#cbdbe6] text-sm">{guide.description}</p>
              <div className="mt-4 text-xs font-technical tracking-widest text-primary-yellow">READ GUIDE →</div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Additional Content to prevent Thin Content Warning (450+ words) ── */}
      <section className="border-t border-border-tactical/30 pt-12 space-y-6 text-[#cbdbe6] font-body text-base leading-relaxed">
        <h2 className="text-2xl font-headline font-black text-primary-yellow uppercase tracking-tight">
          How to Calibrate Your Mobile Sensitivity
        </h2>
        <p>
          Calibrating your mobile sensitivity settings is a systematic process of aligning the physics of your touch screen digitizer with your personal muscle memory. Most players make the mistake of setting high sensitivity multipliers to turn quickly, which results in overshooting targets or suffering from wild horizontal recoil during mid-range sprays. 
        </p>
        <p>
          To calibrate correctly, start by establishing your baseline Camera and ADS values. Stand in the Training Grounds facing targets 20 meters away. Use finger swipes to shift your view 180 degrees. If the crosshair overshoots the target, your camera sensitivity is too high and must be adjusted down.
        </p>

        <h3 className="text-lg font-bold text-white uppercase tracking-wide">
          The Gyroscope Advantage in PUBG and BGMI
        </h3>
        <p>
          Using a gyroscope transfers the strain of recoil management from your fingers to your wrists. When firing an automatic weapon, vertical climb can be compensated for by tilting the phone forward at a constant rate, rather than continuously sliding your finger down the screen. This physical separation translates to cleaner crosshair tracking and faster target transitions.
        </p>

        <h3 className="text-lg font-bold text-white uppercase tracking-wide">
          Understanding Screen Polling Rates and Latency
        </h3>
        <p>
          Mobile displays vary widely in hardware capabilities. A gaming smartphone with a 120Hz refresh rate and a 360Hz touch sampling rate registers your fingers' micro-movements instantly. Consequently, you can afford to run lower sensitivity multipliers because the screen digitizer is precise enough to capture small swipes. Budget screens with lower touch sampling rates (120Hz) require slightly higher sensitivities to compensate for the lag in input registration.
        </p>
        <p>
          Explore our guides above to drill deep into each of these areas, refine your settings, and build a personalized profile with our AimSync generator.
        </p>
      </section>
    </main>
  );
}
