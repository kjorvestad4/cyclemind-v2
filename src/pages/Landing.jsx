import LandingNav from '@/components/landing/LandingNav';
import LandingHero from '@/components/landing/LandingHero';
import TrustBar from '@/components/landing/TrustBar';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import BetaCTA from '@/components/landing/BetaCTA';
import LandingFooter from '@/components/landing/LandingFooter';
import { useNavigate } from 'react-router-dom';
import {
  Brain, Heart, BarChart3, Shield, Users,
  CheckCircle, ArrowRight, Moon, Activity, FileText,
  Stethoscope, Award, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Landing() {
  const navigate = useNavigate();

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">

      <LandingNav />
      <LandingHero />
      <TrustBar />

      {/* ── WHY CYCLEMIND ── */}
      <section id="about" className="py-24 px-5 bg-white">
        <div className="max-w-7xl mx-auto space-y-20">

          {/* Value props */}
          <div>
            <div className="text-center mb-14 space-y-3">
              <span className="text-teal-600 font-semibold text-sm uppercase tracking-widest">Why CycleMind?</span>
              <h2 className="font-serif text-4xl font-bold text-gray-900">Built for how hormones actually affect your mind</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Hormonal changes don't just affect your body — they profoundly shape your emotions, cognition, and mental wellbeing.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: <Brain className="w-7 h-7" />, title: "See Your Patterns", desc: "Understand how your cycle drives your emotions and symptoms before your next appointment — with validated clinical tools like the DRSP, PHQ-9, GAD-7, and EPDS.", color: "teal" },
                { icon: <MessageCircle className="w-7 h-7" />, title: "Better Conversations with Your Provider", desc: "Arrive at appointments with objective, clinical-grade data instead of trying to recall weeks of symptoms. Your doctor sees the full picture.", color: "purple" },
                { icon: <Heart className="w-7 h-7" />, title: "Finally Feel Understood", desc: "Your experience is real, measurable, and documented. CycleMind validates what you've been living through — across every reproductive stage.", color: "rose" }
              ].map(({ icon, title, desc, color }) => (
                <div key={title} className={`rounded-3xl p-8 space-y-4 border ${color === 'teal' ? 'bg-teal-50 border-teal-100' : color === 'purple' ? 'bg-purple-50 border-purple-100' : 'bg-rose-50 border-rose-100'}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color === 'teal' ? 'bg-teal-600 text-white' : color === 'purple' ? 'bg-purple-600 text-white' : 'bg-rose-500 text-white'}`}>{icon}</div>
                  <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                  <p className="text-gray-600 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Evidence */}
          <div className="bg-teal-50 border border-teal-100 rounded-3xl p-10 space-y-6">
            <div className="text-center space-y-2">
              <span className="text-teal-600 font-semibold text-sm uppercase tracking-widest">Built on Clinical Evidence</span>
              <h3 className="font-serif text-3xl font-bold text-gray-900">The same tools your psychiatrist uses</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { abbr: "DRSP", full: "Daily Record of Severity of Problems", note: "Gold standard for PMDD diagnosis per DSM-5 (Endicott, Nee & Harrison, 2006)" },
                { abbr: "PHQ-9", full: "Patient Health Questionnaire", note: "Validated depression screening (Kroenke & Spitzer, 2001)" },
                { abbr: "GAD-7", full: "Generalized Anxiety Disorder Scale", note: "Gold-standard anxiety screening (Spitzer et al., 2006)" },
                { abbr: "EPDS", full: "Edinburgh Postnatal Depression Scale", note: "Standard perinatal depression screening (Cox et al., 1987)" },
              ].map(({ abbr, full, note }) => (
                <div key={abbr} className="bg-white rounded-2xl border border-teal-100 p-5 space-y-2">
                  <span className="text-2xl font-bold text-teal-700">{abbr}</span>
                  <p className="text-sm font-semibold text-gray-800">{full}</p>
                  <p className="text-xs text-gray-500">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-5 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <span className="text-teal-600 font-semibold text-sm uppercase tracking-widest">How it Works</span>
            <h2 className="font-serif text-4xl font-bold text-gray-900">From daily log to doctor visit — in four steps</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { step: "1", icon: <Activity className="w-6 h-6" />, title: "Track Daily", desc: "Log symptoms, mood, and vitals in under 2 minutes using validated clinical scales." },
              { step: "2", icon: <TrendingUpIcon />, title: "See Your Patterns", desc: "CycleMind surfaces insights — PMDD patterns, luteal severity, and personalized trends." },
              { step: "3", icon: <FileText className="w-6 h-6" />, title: "Generate a Report", desc: "Create a clinical-grade PDF or shareable link ready to hand to your provider." },
              { step: "4", icon: <Users className="w-6 h-6" />, title: "Have Better Appointments", desc: "Arrive with objective data. Feel heard. Get the diagnosis and treatment you deserve." },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4 text-center">
                <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold text-lg flex items-center justify-center mx-auto">{step}</div>
                <div className="text-teal-600 flex justify-center">{icon}</div>
                <h3 className="font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── KEY FEATURES ── */}
      <section className="py-24 px-5 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <span className="text-teal-600 font-semibold text-sm uppercase tracking-widest">Key Features</span>
            <h2 className="font-serif text-4xl font-bold text-gray-900">Everything you need. Nothing you don't.</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Stethoscope className="w-6 h-6" />, badge: "Founding Team", title: "Designed by Psychiatrists", desc: "CycleMind isn't a wellness app — it's a clinical tool built by the doctors who treat these conditions.", color: "teal" },
              { icon: <BarChart3 className="w-6 h-6" />, badge: "Validated Scales", title: "Evidence-Based Psychometrics", desc: "Uses DRSP (the gold standard for PMDD), EPDS, PHQ-9, and GAD-7 — the same tools your psychiatrist uses.", color: "purple" },
              { icon: <FileText className="w-6 h-6" />, badge: "Share with Your Doctor", title: "Clinical-Grade Reports", desc: "Generate a detailed PDF or shareable link your provider can actually use to inform your care.", color: "blue" },
              { icon: <Award className="w-6 h-6" />, badge: "First of Its Kind", title: "The Only PMDD App Using DRSP", desc: "Designed by physicians for both patients and clinicians. No other app tracks PMDD with this rigor.", color: "amber" },
              { icon: <Activity className="w-6 h-6" />, badge: "5 Modes", title: "Full Reproductive Lifecycle", desc: "PMDD/Menstrual, Pregnancy, Postpartum, Perimenopause, and Menopause — seamlessly switch as your life changes.", color: "rose" },
              { icon: <Moon className="w-6 h-6" />, badge: "Premium", title: "Luna — AI Companion", desc: "An empathetic AI chatbot trained under the guidance of Maternal Mental Health Psychiatrists to support you between appointments.", color: "violet" },
            ].map(({ icon, badge, title, desc, color }) => (
              <div key={title} className="group bg-white rounded-3xl border border-gray-100 shadow-sm p-7 space-y-4 hover:shadow-md hover:border-teal-200 transition-all">
                <div className="flex items-start justify-between">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                    color === 'teal' ? 'bg-teal-100 text-teal-700' :
                    color === 'purple' ? 'bg-purple-100 text-purple-700' :
                    color === 'blue' ? 'bg-blue-100 text-blue-700' :
                    color === 'amber' ? 'bg-amber-100 text-amber-700' :
                    color === 'rose' ? 'bg-rose-100 text-rose-700' :
                    'bg-violet-100 text-violet-700'
                  }`}>{icon}</div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                    color === 'teal' ? 'bg-teal-50 text-teal-600' :
                    color === 'purple' ? 'bg-purple-50 text-purple-600' :
                    color === 'blue' ? 'bg-blue-50 text-blue-600' :
                    color === 'amber' ? 'bg-amber-50 text-amber-600' :
                    color === 'rose' ? 'bg-rose-50 text-rose-600' :
                    'bg-violet-50 text-violet-600'
                  }`}>{badge}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO IT'S FOR ── */}
      <section className="py-24 px-5 bg-gradient-to-br from-teal-700 to-teal-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <span className="text-teal-300 font-semibold text-sm uppercase tracking-widest">Built for Real Life</span>
            <h2 className="font-serif text-4xl font-bold">Who CycleMind is for</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { emoji: "🌙", title: "PMDD & Menstrual Health", points: ["DRSP daily tracking", "Luteal vs follicular analysis", "PMDD pattern detection", "Doctor-ready reports"] },
              { emoji: "🤰", title: "Pregnancy", points: ["Trimester-specific symptoms", "EPDS screening", "Fetal movement tracking", "PHQ-9 & GAD-7"] },
              { emoji: "🌸", title: "Postpartum", points: ["Recovery symptom tracking", "Postpartum depression screening", "Sleep & fatigue logging", "Clinical summaries"] },
              { emoji: "🔥", title: "Perimenopause & Menopause", points: ["Hot flash tracking", "HRT monitoring", "Brain fog & mood trends", "Mental health screening"] },
            ].map(({ emoji, title, points }) => (
              <div key={title} className="bg-white/10 backdrop-blur rounded-3xl border border-white/10 p-6 space-y-4 hover:bg-white/15 transition-colors">
                <span className="text-3xl">{emoji}</span>
                <h3 className="font-bold text-white text-lg">{title}</h3>
                <ul className="space-y-2">
                  {points.map(p => (
                    <li key={p} className="flex items-start gap-2 text-sm text-teal-200">
                      <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section id="team" className="py-24 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <span className="text-teal-600 font-semibold text-sm uppercase tracking-widest">Our Team</span>
            <h2 className="font-serif text-4xl font-bold text-gray-900">Developed by Women's Mental Health Psychiatrists</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              CycleMind was co-created by three board-certified physicians who have spent their careers treating the exact conditions this app addresses.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { initials: "E.B.", role: "Psychiatrist & Co-Founder", specialty: "Women's Mental Health Psychiatrist", bio: "Psychiatrist with specialized training in perinatal mental health, PMDD, and hormonal mood disorders across the reproductive lifecycle." },
              { initials: "M.R.", role: "Psychiatrist & Co-Founder", specialty: "Women's Mental Health Psychiatrist", bio: "Expert in postpartum depression, pregnancy-related anxiety, and complex psychiatric care for women navigating major hormonal transitions." },
              { initials: "T.K.", role: "Physician & Co-Founder", specialty: "Internal Medicine & Psychiatry", bio: "Dual-trained physician in Internal Medicine and Psychiatry, bringing an integrative clinical perspective to CycleMind's methodology and patient care approach." },
            ].map(({ initials, role, specialty, bio }) => (
              <div key={initials} className="rounded-3xl border border-gray-100 bg-gray-50 p-8 space-y-4 text-center">
                <div className="w-20 h-20 rounded-full bg-teal-600 flex items-center justify-center mx-auto text-white font-bold text-xl font-serif shadow-md">{initials}</div>
                <div>
                  <p className="font-bold text-gray-900">{role}</p>
                  <p className="text-teal-700 text-sm font-semibold mt-0.5">{specialty}</p>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{bio}</p>
                <span className="inline-block bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full">✓ Board Certified</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <div id="testimonials">
        <TestimonialsSection />
      </div>

      {/* ── PRICING ── */}
      <section className="py-24 px-5 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <span className="text-teal-600 font-semibold text-sm uppercase tracking-widest">Plans</span>
            <h2 className="font-serif text-4xl font-bold text-gray-900">Free vs Founder's Plan</h2>
            <p className="text-gray-600">Start free. Lock in founder's pricing for life.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-gray-200 p-8 space-y-5">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Free</h3>
                <p className="text-gray-500 text-sm mt-1">Everything you need to get started</p>
              </div>
              <ul className="space-y-3">
                {["Daily symptom logging (mood, vitals)", "Menstrual mode tracking", "Interactive cycle calendar", "Basic insights & trends", "Medication & journal logging"].map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" onClick={() => navigate('/welcome')} className="w-full border-teal-600 text-teal-700 hover:bg-teal-50">Start Free</Button>
            </div>
            <div className="rounded-3xl border-2 border-teal-500 bg-gradient-to-br from-teal-50 to-purple-50 p-8 space-y-5 relative">
              <span className="absolute -top-3 left-6 bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Founders: First 100 only</span>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Founder's Plan</h3>
                <p className="text-gray-500 text-sm mt-1">3 months free, then $6.99/mo locked for life</p>
              </div>
              <ul className="space-y-3">
                {["Everything in Free", "All 5 lifecycle modes", "DRSP symptom tracking (clinical-grade)", "Luna AI Companion", "Clinical-grade PDF reports", "Shareable doctor links", "EPDS postpartum screening", "Advanced PMDD pattern analysis", "Unlimited history & trends"].map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-teal-600 fill-teal-100 flex-shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
              <Button onClick={() => navigate('/billing')} className="w-full bg-teal-600 hover:bg-teal-700 text-white">Claim Founder's Pricing →</Button>
            </div>
          </div>
        </div>
      </section>

      <BetaCTA />
      <LandingFooter />
    </div>
  );
}

function TrendingUpIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}