import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import CookieConsent from "@/components/CookieConsent";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AimSync — PUBG Mobile & BGMI Sensitivity Generator",
  description: "Get your perfect PUBG Mobile and BGMI sensitivity settings in seconds. AI-powered and personalized for your device, playstyle, and FPS.",
  alternates: {
    canonical: "https://www.gamingsensi.site",
  },
  openGraph: {
    title: "AimSync — PUBG Mobile & BGMI Sensitivity Generator",
    description: "Free AI-powered sensitivity calculator for PUBG Mobile and BGMI.",
    url: "https://www.gamingsensi.site",
    siteName: "AimSync",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
        <meta name="google-site-verification" content="24d6e45a3eb11ffe" />
        <script src="https://quge5.com/88/tag.min.js" data-zone="258251" async data-cfasync="false"></script>
      </head>
      <body className="min-h-full flex flex-col bg-[#070b0e]">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-K46T9B1BKB"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-K46T9B1BKB');
          `}
        </Script>
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6068297962050182"
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />

        {/* Global Navigation Header */}
        <header className="w-full bg-[#070b0e]/90 backdrop-blur-md border-b border-[#384b5c]/25 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
            <a href="/" className="flex items-center gap-2 group">
              <span className="font-headline font-black text-2xl text-primary-yellow tracking-tighter group-hover:text-white transition-colors">AIMSYNC</span>
            </a>
            <nav className="flex items-center gap-6 text-xs font-technical uppercase tracking-wider">
              <a href="/" className="text-[#cbdbe6] hover:text-primary-yellow transition-colors">Home</a>
              <a href="/guides" className="text-[#cbdbe6] hover:text-primary-yellow transition-colors">Guides</a>
              <a href="/about" className="text-[#cbdbe6] hover:text-primary-yellow transition-colors">About</a>
              <a href="/contact" className="text-[#cbdbe6] hover:text-primary-yellow transition-colors">Contact</a>
            </nav>
          </div>
        </header>

        <div className="flex-1">
          {children}
        </div>

        <footer className="w-full bg-[#0a0f14] border-t border-[#384b5c]/30 py-8 mt-auto">
          <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-[#a0b0c0] text-sm text-center md:text-left">
              <p>&copy; {new Date().getFullYear()} AimSync. All rights reserved.</p>
              <p className="text-xs mt-1">Not affiliated with PUBG Mobile, BGMI, Tencent, or Krafton.</p>
              <p className="text-xs mt-1">Contact: adnanchy083@gmail.com</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-sm font-technical uppercase tracking-widest">
              <a href="/guides" className="text-primary-yellow hover:text-white transition-colors">Guides</a>
              <a href="/about" className="text-primary-yellow hover:text-white transition-colors">About</a>
              <a href="/privacy-policy" className="text-primary-yellow hover:text-white transition-colors">Privacy</a>
              <a href="/terms" className="text-primary-yellow hover:text-white transition-colors">Terms</a>
              <a href="/disclaimer" className="text-primary-yellow hover:text-white transition-colors">Disclaimer</a>
              <a href="/contact" className="text-primary-yellow hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </footer>
        <CookieConsent />
      </body>
    </html>
  );
}
