import { useNavigate } from 'react-router-dom';

export default function LandingFooter() {
  const navigate = useNavigate();

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <footer className="bg-gray-900 text-gray-400 py-16">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-y-12">
        {/* Brand */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-2xl flex items-center justify-center">
              <span className="text-teal-600 font-bold text-xl font-serif">C</span>
            </div>
            <span className="text-white font-serif font-bold text-2xl">CycleMind</span>
          </div>
          <p className="max-w-xs text-sm leading-relaxed">
            A psychiatrist-developed tool for understanding the connection between your cycle and your mind.
          </p>
          <p className="text-xs text-gray-500">Developed by 3 Board-Certified Physicians</p>
        </div>

        {/* Links */}
        <div className="md:col-span-3 text-sm space-y-3">
          <p className="font-semibold text-white">Product</p>
          <button onClick={() => scrollTo('how-it-works')} className="block hover:text-white transition-colors">How it Works</button>
          <button onClick={() => scrollTo('team')} className="block hover:text-white transition-colors">Our Team</button>
          <button onClick={() => navigate('/billing')} className="block hover:text-white transition-colors">Pricing</button>
          <button onClick={() => navigate('/privacy')} className="block hover:text-white transition-colors text-left">Privacy Policy</button>
          <button onClick={() => navigate('/terms')} className="block hover:text-white transition-colors text-left">Terms of Use</button>
        </div>

        {/* Contact */}
        <div className="md:col-span-4 text-sm space-y-3">
          <p className="font-semibold text-white">Built with care by</p>
          <p className="leading-relaxed">
            Three psychiatrists who saw too many patients struggle with misunderstood symptoms.
          </p>
          <a href="mailto:hello@cyclemind.app" className="block hover:text-white transition-colors">hello@cyclemind.app</a>
          <p className="text-xs text-gray-500">CycleMind is currently in private beta. Public launch coming soon.</p>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-16 pt-8 max-w-7xl mx-auto px-6 space-y-2 text-xs text-center text-gray-500">
        <p>CycleMind uses validated psychometric tools (DRSP, EPDS, PHQ-9, GAD-7) and follows HIPAA-aligned practices.</p>
        <p>CycleMind is an informational and tracking tool — not medical advice. Always consult a qualified healthcare provider.</p>
        <p className="pt-1">© {new Date().getFullYear()} CycleMind. Private by design.</p>
      </div>
    </footer>
  );
}