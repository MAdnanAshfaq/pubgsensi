import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEO_PRO_PLAYERS, getProPlayerBySlug } from '@/data/seoProPlayers';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return SEO_PRO_PLAYERS.map((player) => ({
    slug: player.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const player = getProPlayerBySlug(slug);

  if (!player) {
    return { title: 'Player Not Found' };
  }

  const title = `${player.name} BGMI Sensitivity Code & Settings (2026)`;
  const description = `${player.name}'s official BGMI and PUBG Mobile sensitivity code (${player.shareCode}), ${player.clawLayout}, and gyroscope settings for zero recoil sprays.`;

  return {
    title,
    description,
    alternates: { canonical: `https://www.gamingsensi.site/pro-players/${player.slug}` },
    keywords: [
      `${player.name} sensitivity code`,
      `${player.name} BGMI sensitivity`,
      `${player.name} PUBG settings`,
      `${player.name} zero recoil code`,
      `${player.name} claw layout`,
    ],
    openGraph: {
      title,
      description,
      url: `https://www.gamingsensi.site/pro-players/${player.slug}`,
      siteName: 'AimSync',
    },
  };
}

export default async function ProPlayerSeoPage({ params }: Props) {
  const { slug } = await params;
  const player = getProPlayerBySlug(slug);

  if (!player) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-[#cbdbe6] font-body text-sm leading-relaxed">

      {/* Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: `${player.name} BGMI Sensitivity Code & Settings (2026)`,
            description: `${player.name}'s official BGMI sensitivity code (${player.shareCode}) and layout details.`,
            author: { '@type': 'Organization', name: 'AimSync', url: 'https://www.gamingsensi.site' },
            publisher: { '@type': 'Organization', name: 'AimSync', url: 'https://www.gamingsensi.site' },
            datePublished: '2026-07-21',
            dateModified: '2026-07-21',
            mainEntityOfPage: { '@type': 'WebPage', '@id': `https://www.gamingsensi.site/pro-players/${player.slug}` },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: `What is ${player.name}'s BGMI sensitivity code?`,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: `${player.name}'s BGMI sensitivity code is ${player.shareCode}. Enter this code under Settings → Sensitivity → Import.`,
                },
              },
              {
                '@type': 'Question',
                name: `What device and claw layout does ${player.name} use?`,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: `${player.name} plays on an ${player.deviceUsed} using a ${player.clawLayout} setup with ${player.gyroMode}.`,
                },
              },
            ],
          }),
        }}
      />

      {/* Header */}
      <header className="mb-8 border-b border-[#384b5c]/40 pb-6">
        <p className="text-xs font-technical uppercase tracking-widest text-[#ffd700] mb-2">
          Pro Player Esports Profile · {player.team}
        </p>
        <h1 className="font-headline text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-3">
          {player.name} BGMI Sensitivity Code &amp; Settings (2026)
        </h1>
        <p className="text-sm text-[#a0b0c0]">
          Team: <strong className="text-white">{player.team}</strong> · Layout: <strong className="text-white">{player.clawLayout}</strong> · Device: <strong className="text-white">{player.deviceUsed}</strong>
        </p>
      </header>

      {/* Share Code Card */}
      <div className="bg-[#0d1a1f] border-2 border-[#ffd700]/50 rounded-xl p-6 mb-8 text-center shadow-lg">
        <p className="text-[10px] font-technical uppercase tracking-widest text-[#ffd700] mb-1">Official Import Share Code</p>
        <div className="font-mono text-2xl md:text-3xl font-black text-white my-2 tracking-wider">
          {player.shareCode}
        </div>
        <p className="text-xs text-[#a0b0c0]">
          Apply in BGMI/PUBG: Settings → Sensitivity → Share Icon → Import Code
        </p>
      </div>

      {/* Bio */}
      <section className="mb-8">
        <h2 className="text-xl font-headline font-black text-[#ffd700] uppercase tracking-wide mb-3">
          About {player.name}
        </h2>
        <p className="text-base text-[#cbdbe6] leading-relaxed">
          {player.bio}
        </p>
      </section>

      {/* Settings Table */}
      <section className="space-y-6 mb-10">
        <h2 className="text-xl font-headline font-black text-[#ffd700] uppercase tracking-wide">
          {player.name}&apos;s Sensitivity Breakdown
        </h2>
        <div className="bg-[#0d1a1f] border border-[#384b5c]/40 rounded-xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#111d24] border-b border-[#384b5c]/40 text-[#ffd700] font-technical uppercase">
              <tr>
                <th className="px-4 py-3">Setting</th>
                <th className="px-4 py-3">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#384b5c]/20">
              <tr>
                <td className="px-4 py-3 font-bold text-white">TPP No-Scope Camera</td>
                <td className="px-4 py-3 text-[#ffd700] font-bold">{player.tppNoScope}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-bold text-white">Red Dot ADS</td>
                <td className="px-4 py-3 text-[#ffd700] font-bold">{player.redDotAds}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-bold text-white">3x Scope ADS</td>
                <td className="px-4 py-3 text-[#ffd700] font-bold">{player.scope3xAds}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-bold text-white">Gyroscope No-Scope</td>
                <td className="px-4 py-3 text-[#ffd700] font-bold">{player.gyroNoScope}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-bold text-white">Gyroscope 3x Scope</td>
                <td className="px-4 py-3 text-[#ffd700] font-bold">{player.gyro3x}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <div className="bg-[#0d1a1f] border border-[#ffd700]/30 rounded-2xl p-6 text-center shadow-xl">
        <h3 className="font-headline text-xl font-black text-white uppercase mb-2">
          Want To Calibrate {player.name}&apos;s Settings For Your Device?
        </h3>
        <p className="text-xs text-[#a0b0c0] mb-4 max-w-md mx-auto">
          {player.name}&apos;s code is tuned for {player.deviceUsed}. Use AimSync to adjust these values for your phone&apos;s exact touch sampling rate.
        </p>
        <a
          href="/"
          className="inline-block bg-[#ffd700] text-black font-headline font-black text-xs uppercase px-6 py-3 rounded-lg hover:bg-[#ffd700]/90 transition-all shadow-md"
        >
          Calibrate For My Device →
        </a>
      </div>

    </div>
  );
}
