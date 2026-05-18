import { useNavigate } from 'react-router-dom';

export default function BetaCTA() {
  const navigate = useNavigate();

  return (
    <div id="beta" className="bg-gradient-to-br from-teal-700 to-teal-900 py-20 px-6">
      <div className="max-w-2xl mx-auto text-center text-white">
        <h2 className="font-serif text-5xl font-bold tracking-tight mb-4">
          Ready to take control of your cycle?
        </h2>
        <p className="text-xl text-teal-200 mb-10">
          Join our private beta. Limited spots available for women and clinicians.
        </p>

        <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="you@email.com"
            className="flex-1 px-6 py-4 rounded-3xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button
            onClick={() => navigate('/welcome')}
            className="px-8 py-4 bg-white text-teal-700 font-semibold rounded-3xl hover:bg-gray-100 transition-colors whitespace-nowrap"
          >
            Join Beta
          </button>
        </div>
        <p className="text-xs text-teal-300 mt-4">We respect your inbox. Unsubscribe anytime.</p>
      </div>
    </div>
  );
}