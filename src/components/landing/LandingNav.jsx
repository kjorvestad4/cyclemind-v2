import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingNav() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (id) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src="https://media.base44.com/images/public/69fb50354d2f1f828f13182f/1f6e3c73e_generated_image.png"
              alt="CycleMind"
              className="w-11 h-11 rounded-2xl object-cover"
            />
            <span className="font-serif font-bold text-2xl text-teal-700">CycleMind</span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <button onClick={() => scrollTo('how-it-works')} className="hover:text-teal-700 transition-colors">How it Works</button>
            <button onClick={() => scrollTo('testimonials')} className="hover:text-teal-700 transition-colors">Stories</button>
            <button onClick={() => scrollTo('team')} className="hover:text-teal-700 transition-colors">Our Team</button>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/welcome')} className="border-teal-600 text-teal-700 hover:bg-teal-50">
              Sign In
            </Button>
            <Button size="sm" onClick={() => navigate('/welcome')} className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl">
              Get Early Access
            </Button>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3 text-sm font-medium text-gray-700">
          <button onClick={() => scrollTo('how-it-works')} className="block w-full text-left py-2">How it Works</button>
          <button onClick={() => scrollTo('testimonials')} className="block w-full text-left py-2">Stories</button>
          <button onClick={() => scrollTo('team')} className="block w-full text-left py-2">Our Team</button>
          <Button onClick={() => navigate('/welcome')} className="w-full bg-teal-600 hover:bg-teal-700 text-white mt-2">
            Get Early Access
          </Button>
        </div>
      )}
    </nav>
  );
}