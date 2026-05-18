import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield } from 'lucide-react';

export default function LandingHero() {
  const navigate = useNavigate();
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
      {/* Beta badge */}
      <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
        <span className="w-2 h-2 bg-teal-600 rounded-full animate-pulse" />
        PRIVATE BETA NOW OPEN
      </div>

      <h1 className="font-serif text-6xl md:text-7xl font-bold tracking-tight leading-none mb-6 text-gray-900">
        For cycles that have<br />a mind of their own.
      </h1>

      <p className="max-w-2xl mx-auto text-2xl text-gray-500 font-light leading-snug">
        A private, science-based daily symptom tracker{' '}
        <span className="font-semibold text-gray-900">built by psychiatrists</span>{' '}
        to help you understand PMDD, PMS, pregnancy, postpartum, and menopause.
      </p>

      {/* Primary CTA */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
        <button
          onClick={() => navigate('/welcome')}
          className="px-10 py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-3xl text-lg transition-all flex items-center justify-center gap-3 active:scale-[0.985]"
        >
          Join the Private Beta <ArrowRight className="w-5 h-5" />
        </button>
        <button
          onClick={() => scrollTo('showcase')}
          className="px-8 py-4 border border-gray-300 hover:bg-gray-50 font-semibold rounded-3xl text-lg transition-colors flex items-center justify-center"
        >
          See the app
        </button>
      </div>

      {/* App Store Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
        {/* App Store */}
        <a
          href="https://apps.apple.com"
          target="_blank"
          rel="noopener noreferrer"
          className="relative inline-flex items-center gap-3 bg-black text-white rounded-2xl px-5 py-3 hover:bg-gray-900 transition-colors border border-gray-700"
        >
          {/* Apple logo SVG */}
          <svg className="w-6 h-6 fill-white shrink-0" viewBox="0 0 814 1000">
            <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-36.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.1 269-317.1 71 0 130.5 46.4 174.9 46.4 42.7 0 109.2-49 192.5-49 30.5 0 111 2.6 169.3 96.3zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
          </svg>
          <div className="text-left">
            <div className="text-[10px] opacity-70 leading-none">Download on the</div>
            <div className="text-sm font-semibold leading-tight">App Store</div>
          </div>
          <span className="absolute -top-2 -right-2 bg-amber-400 text-black text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Soon</span>
        </a>

        {/* Google Play */}
        <a
          href="https://play.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="relative inline-flex items-center gap-3 bg-black text-white rounded-2xl px-5 py-3 hover:bg-gray-900 transition-colors border border-gray-700"
        >
          {/* Google Play logo SVG */}
          <svg className="w-6 h-6 shrink-0" viewBox="0 0 512 512">
            <path fill="#4CAF50" d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1z"/>
            <path fill="#FF5252" d="M85.1 0C56.4 3.6 37.7 21.8 37.7 50v411.6c0 28.2 18.7 46.4 47.4 50l248.6-255.7L85.1 0z"/>
            <path fill="#FFC107" d="M408.8 236.9L349.3 272l60.5 60.5L472.3 296c20.3-11.7 20.3-30.8 0-42.5l-63.5-16.6z"/>
            <path fill="#3F51B5" d="M104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
          </svg>
          <div className="text-left">
            <div className="text-[10px] opacity-70 leading-none">Get it on</div>
            <div className="text-sm font-semibold leading-tight">Google Play</div>
          </div>
          <span className="absolute -top-2 -right-2 bg-amber-400 text-black text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Soon</span>
        </a>
      </div>

      <div className="mt-6 text-sm text-gray-400 flex items-center justify-center gap-2">
        <Shield className="w-4 h-4" />
        <span>Private by design · No data selling · HIPAA-conscious</span>
      </div>
    </div>
  );
}