import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEO_DEVICES, getDeviceBySlug } from '@/data/seoDevices';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return SEO_DEVICES.map((device) => ({
    slug: device.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const device = getDeviceBySlug(slug);

  if (!device) {
    return { title: 'Device Not Found' };
  }

  const title = `${device.name} Zero Recoil Sensitivity Code & Settings (2026)`;
  const description = `The best BGMI and PUBG Mobile sensitivity settings for ${device.name} (${device.chipset}). Zero recoil code, gyroscope settings, and hardware touch latency analysis.`;

  return {
    title,
    description,
    alternates: { canonical: `https://www.gamingsensi.site/devices/${device.slug}` },
    keywords: [
      `${device.name} sensitivity code`,
      `${device.name} zero recoil PUBG`,
      `${device.name} BGMI sensitivity`,
      `${device.name} gyroscope settings`,
      `best sensitivity for ${device.name}`,
    ],
    openGraph: {
      title,
      description,
      url: `https://www.gamingsensi.site/devices/${device.slug}`,
      siteName: 'AimSync',
    },
  };
}

export default async function DeviceSeoPage({ params }: Props) {
  const { slug } = await params;
  const device = getDeviceBySlug(slug);

  if (!device) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-[#cbdbe6] font-body text-sm leading-relaxed">

      {/* Structured Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: `${device.name} Zero Recoil Sensitivity Settings & Code (2026)`,
            description: `Hardware-calibrated PUBG Mobile & BGMI zero recoil sensitivity settings for ${device.name}.`,
            author: { '@type': 'Organization', name: 'AimSync', url: 'https://www.gamingsensi.site' },
            publisher: { '@type': 'Organization', name: 'AimSync', url: 'https://www.gamingsensi.site' },
            datePublished: '2026-07-21',
            dateModified: '2026-07-21',
            mainEntityOfPage: { '@type': 'WebPage', '@id': `https://www.gamingsensi.site/devices/${device.slug}` },
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
                name: `What is the best sensitivity for ${device.name} in BGMI?`,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: `The best BGMI sensitivity for ${device.name} (${device.chipset}) uses TPP No-Scope at ${device.tppNoScope}, Red Dot ADS at ${device.redDotAds}, 3x ADS at ${device.scope3xAds}, and Always-On Gyroscope at ${device.gyroNoScope}.`,
                },
              },
              {
                '@type': 'Question',
                name: `What zero recoil code works on ${device.name}?`,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: `Import code ${device.shareCode} in BGMI Settings → Sensitivity → Import for a hardware-calibrated zero recoil baseline on ${device.name}.`,
                },
              },
            ],
          }),
        }}
      />

      {/* Header */}
      <header className="mb-8 border-b border-[#384b5c]/40 pb-6">
        <p className="text-xs font-technical uppercase tracking-widest text-[#ffd700] mb-2">
          AimSync Hardware Profile · {device.brand} Series
        </p>
        <h1 className="font-headline text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-3">
          {device.name} Zero Recoil Sensitivity &amp; Code (2026)
        </h1>
        <p className="text-sm text-[#a0b0c0]">
          Hardware Spec: {device.chipset} · Display: {device.screenSize} · Target FPS: {device.fps} FPS · Gyro Sensor: {device.gyroQuality}
        </p>
      </header>

      {/* Quick Answer */}
      <div className="bg-[#0d1a1f] border-l-4 border-[#ffd700] rounded-r-xl p-5 mb-8">
        <p className="text-[10px] font-technical uppercase tracking-widest text-[#ffd700] mb-1">Quick Answer &amp; Code</p>
        <p className="text-sm text-[#cbdbe6] leading-relaxed">
          The optimal <strong className="text-white">BGMI &amp; PUBG Mobile sensitivity for {device.name}</strong> is{' '}
          <strong className="text-[#ffd700]">Gyro No-Scope: {device.gyroNoScope}</strong>,{' '}
          <strong className="text-[#ffd700]">Gyro 3x: {device.gyro3x}</strong>, and{' '}
          <strong className="text-[#ffd700]">Red Dot ADS: {device.redDotAds}</strong>. Import share code:{' '}
          <span className="font-mono text-[#ffd700] font-bold">{device.shareCode}</span>.
        </p>
      </div>

      {/* Device Table */}
      <section className="space-y-6">
        <h2 className="text-xl font-headline font-black text-[#ffd700] uppercase tracking-wide">
          {device.name} Calibrated Sensitivity Parameters
        </h2>
        <div className="bg-[#0d1a1f] border border-[#384b5c]/40 rounded-xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#111d24] border-b border-[#384b5c]/40 text-[#ffd700] font-technical uppercase">
              <tr>
                <th className="px-4 py-3">Setting</th>
                <th className="px-4 py-3">Recommended Value</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#384b5c]/20">
              <tr>
                <td className="px-4 py-3 font-bold text-white">TPP No-Scope Camera</td>
                <td className="px-4 py-3 text-[#ffd700] font-bold">{device.tppNoScope}</td>
                <td className="px-4 py-3 text-[#a0b0c0]">Balanced for {device.screenSize}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-bold text-white">Red Dot / Holo ADS</td>
                <td className="px-4 py-3 text-[#ffd700] font-bold">{device.redDotAds}</td>
                <td className="px-4 py-3 text-[#a0b0c0]">Optimized for close-range pull-down</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-bold text-white">3x Scope ADS</td>
                <td className="px-4 py-3 text-[#ffd700] font-bold">{device.scope3xAds}</td>
                <td className="px-4 py-3 text-[#a0b0c0]">M416 mid-range spray control</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-bold text-white">Gyroscope TPP No-Scope</td>
                <td className="px-4 py-3 text-[#ffd700] font-bold">{device.gyroNoScope}</td>
                <td className="px-4 py-3 text-[#a0b0c0]">{device.gyroQuality} gyro sensor threshold</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-bold text-white">Gyroscope 3x Scope</td>
                <td className="px-4 py-3 text-[#ffd700] font-bold">{device.gyro3x}</td>
                <td className="px-4 py-3 text-[#a0b0c0]">Forward wrist tilt angle for flat spray</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA to Interactive Generator */}
      <div className="bg-[#0d1a1f] border border-[#ffd700]/30 rounded-2xl p-6 text-center my-10 shadow-xl">
        <h3 className="font-headline text-xl font-black text-white uppercase mb-2">
          Want To Auto-Calculate Your Exact {device.name} Profile?
        </h3>
        <p className="text-xs text-[#a0b0c0] mb-4 max-w-md mx-auto">
          Our AI generator incorporates your exact FPS, claw finger layout, and combat role to produce an instantly copyable zero recoil profile.
        </p>
        <a
          href="/"
          className="inline-block bg-[#ffd700] text-black font-headline font-black text-xs uppercase px-6 py-3 rounded-lg hover:bg-[#ffd700]/90 transition-all shadow-md"
        >
          Auto-Calculate For {device.name} →
        </a>
      </div>

    </div>
  );
}
