import type { Metadata } from 'next';
import AdUnit from '@/components/AdUnit';

export const metadata: Metadata = {
  title: "Contact Us — AimSync PUBG/BGMI Sensitivity Configurator",
  description: "Get in touch with the AimSync development and hardware analysis team. Contact us for inquiries or calibration calibrations support at adnanchy083@gmail.com.",
  alternates: {
    canonical: "https://www.gamingsensi.site/contact",
  },
  openGraph: {
    title: "Contact Us — AimSync PUBG/BGMI Sensitivity Configurator",
    description: "Get in touch with the AimSync development and hardware analysis team. Contact us for inquiries or calibration calibrations support at adnanchy083@gmail.com.",
  },
};

export default function Contact() {
  return (
    <main className="max-w-xl mx-auto px-4 py-16 text-white font-body text-base leading-relaxed space-y-8">
      <div>
        <h1 className="text-4xl font-headline font-black text-primary-yellow uppercase tracking-wider mb-2">
          Contact Us
        </h1>
        <p className="text-xs text-text-muted uppercase tracking-widest font-technical">
          Get in touch with our calibration support team
        </p>
      </div>

      <section className="space-y-4">
        <p>
          Whether you are experiencing tracking latency, need help interpreting your generated profile, or wish to report a verified hardware specification for our device registry database, we are here to help.
        </p>
        <p>
          You can reach us directly via email:
        </p>
        <div className="bg-[#1b2836]/75 border border-[#384b5c]/40 rounded-xl p-6">
          <p className="font-technical uppercase text-xs text-primary-yellow">
            Primary Contact Email
          </p>
          <a 
            href="mailto:adnanchy083@gmail.com" 
            className="text-lg font-bold text-white hover:text-primary-yellow transition-colors block mt-1"
          >
            adnanchy083@gmail.com
          </a>
          <p className="text-xs text-text-muted mt-2">
            Average response time: Within 24-48 hours.
          </p>
        </div>
      </section>

      <section className="space-y-6 pt-6 border-t border-border-tactical/20">
        <h2 className="text-xl font-headline font-black uppercase tracking-tight text-white">
          Send a Calibration Support Ticket
        </h2>
        <form className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-text-muted mb-1 font-technical">Your Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. John Doe"
              className="w-full bg-[#0d161f] border border-[#384b5c]/40 rounded-lg p-3 text-white focus:outline-none focus:border-primary-yellow text-sm"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-text-muted mb-1 font-technical">Email Address</label>
            <input 
              type="email" 
              required
              placeholder="e.g. john@example.com"
              className="w-full bg-[#0d161f] border border-[#384b5c]/40 rounded-lg p-3 text-white focus:outline-none focus:border-primary-yellow text-sm"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-text-muted mb-1 font-technical">Device Model</label>
            <input 
              type="text" 
              required
              placeholder="e.g. iPhone 15 Pro Max"
              className="w-full bg-[#0d161f] border border-[#384b5c]/40 rounded-lg p-3 text-white focus:outline-none focus:border-primary-yellow text-sm"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-text-muted mb-1 font-technical">Message / Query</label>
            <textarea 
              rows={4}
              required
              placeholder="Describe your issue or custom calibration question..."
              className="w-full bg-[#0d161f] border border-[#384b5c]/40 rounded-lg p-3 text-white focus:outline-none focus:border-primary-yellow text-sm resize-none"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-primary-yellow text-background font-headline font-bold uppercase py-3 rounded-lg hover:bg-primary-yellow/90 transition-all text-sm tracking-widest shadow-md shadow-primary-yellow/10 active:scale-95"
          >
            Submit Ticket
          </button>
        </form>
      </section>
      
      <AdUnit slot="8085223740" format="auto" className="mt-8" />
    </main>
  );
}
