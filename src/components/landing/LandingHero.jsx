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

      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
        <button
          onClick={() => navigate('/welcome')}
          className="px-10 py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-3xl text-lg transition-all flex items-center justify-center gap-3 active:scale-[0.985]"
        >
          Join the Private Beta <ArrowRight className="w-5 h-5" />
        </button>
        <button
          onClick={() => scrollTo('testimonials')}
          className="px-8 py-4 border border-gray-300 hover:bg-gray-50 font-semibold rounded-3xl text-lg transition-colors flex items-center justify-center"
        >
          See real stories
        </button>
      </div>

      <div className="mt-8 text-sm text-gray-400 flex items-center justify-center gap-2">
        <Shield className="w-4 h-4" />
        <span>Private by design · No data selling · HIPAA-conscious</span>
      </div>
    </div>
  );
}