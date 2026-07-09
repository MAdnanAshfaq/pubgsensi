'use client';

import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('gamingsensi_cookie_consent');
      if (!consent) {
        setShowBanner(true);
      }
    } catch {
      setShowBanner(true);
    }
  }, []);

  const acceptConsent = () => {
    try {
      localStorage.setItem('gamingsensi_cookie_consent', 'accepted');
    } catch {}
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:max-w-md bg-[#0a0f14] border border-[#384b5c]/50 p-4 rounded-xl shadow-2xl z-50 animate-fade-in font-body text-white">
      <h3 className="text-md font-bold text-primary-yellow mb-1 uppercase tracking-wider">Cookie Consent</h3>
      <p className="text-xs text-[#cbdbe6] leading-relaxed mb-3">
        We use cookies to personalize content, ads, and analyze traffic in compliance with Google AdSense policies. By using our site, you agree to our privacy policy.
      </p>
      <div className="flex justify-end gap-3 text-xs">
        <a href="/privacy-policy" className="text-[#a0b0c0] hover:text-white transition-colors self-center">
          Read Policy
        </a>
        <button
          onClick={acceptConsent}
          className="bg-primary-yellow text-[#05080c] px-4 py-2 rounded font-bold hover:bg-yellow-400 transition-colors uppercase tracking-widest"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
