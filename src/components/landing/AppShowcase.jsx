import { useState } from 'react';
import { Moon, BarChart3, FileText, Heart, Activity, MessageCircle, ChevronRight } from 'lucide-react';

const SCREENS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Activity className="w-4 h-4" />,
    headline: 'Your cycle, at a glance',
    desc: 'See your current phase, today\'s severity score, upcoming predictions, and personalized insights — all on one clean dashboard.',
    color: 'teal',
    mockup: (
      <div className="flex-1 bg-gradient-to-b from-teal-50 to-white p-4 space-y-3 overflow-hidden">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-[10px] text-gray-400">Monday, May 18</p>
            <p className="font-serif font-bold text-teal-800 text-sm">Good morning ✨</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold">S</div>
        </div>
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-3 text-white">
          <p className="text-[9px] opacity-80 uppercase tracking-wide">Cycle Day 18 · Luteal Phase</p>
          <p className="text-sm font-bold mt-0.5">Period in ~10 days</p>
          <div className="flex gap-1 mt-2">
            {[1,2,3,4,5,6,7].map(d => (
              <div key={d} className={`flex-1 h-1.5 rounded-full ${d <= 4 ? 'bg-white' : 'bg-white/30'}`} />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[['Mood Score', '3.2/6', 'text-amber-600'], ['Anxiety', '2.8/6', 'text-purple-600']].map(([l, v, c]) => (
            <div key={l} className="bg-white rounded-xl p-2.5 shadow-sm border border-gray-100">
              <p className="text-[9px] text-gray-400">{l}</p>
              <p className={`font-bold text-sm ${c}`}>{v}</p>
            </div>
          ))}
        </div>
        <div className="bg-purple-50 rounded-xl p-2.5 flex items-center gap-2 border border-purple-100">
          <Moon className="w-3.5 h-3.5 text-purple-600 shrink-0" />
          <p className="text-[9px] text-purple-700 font-medium">Luna sees a luteal pattern — tap to chat</p>
        </div>
        <div className="bg-white rounded-xl p-2.5 shadow-sm border border-gray-100">
          <p className="text-[9px] text-gray-400 mb-1.5">Today's Symptoms</p>
          {['Mood Swings', 'Bloating', 'Fatigue'].map((s, i) => (
            <div key={s} className="flex items-center justify-between mb-1">
              <p className="text-[9px] text-gray-600">{s}</p>
              <div className="flex gap-0.5">
                {[1,2,3,4,5,6].map(n => (
                  <div key={n} className={`w-2 h-2 rounded-sm ${n <= [4,3,5][i] ? 'bg-teal-500' : 'bg-gray-100'}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'luna',
    label: 'Luna AI',
    icon: <Moon className="w-4 h-4" />,
    headline: 'Your AI companion, Luna 🌙',
    desc: 'Luna is trained by board-certified Maternal Mental Health Psychiatrists. She listens, supports, and helps you understand your patterns — 24/7, without judgment.',
    color: 'purple',
    mockup: (
      <div className="flex-1 bg-gradient-to-b from-purple-50 to-white p-4 flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-purple-100">
          <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center">
            <Moon className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-purple-800">Luna</p>
            <p className="text-[8px] text-purple-400">AI Companion · Online</p>
          </div>
        </div>
        <div className="space-y-2 flex-1 overflow-hidden">
          <div className="bg-purple-100 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%]">
            <p className="text-[9px] text-purple-800 leading-relaxed">Hi! I'm Luna 🌙 — I see you're in your luteal phase, day 18. How are you feeling today?</p>
          </div>
          <div className="bg-teal-600 rounded-2xl rounded-tr-sm px-3 py-2 max-w-[85%] ml-auto">
            <p className="text-[9px] text-white leading-relaxed">I feel really anxious and irritable. Is this normal?</p>
          </div>
          <div className="bg-purple-100 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%]">
            <p className="text-[9px] text-purple-800 leading-relaxed">You are not overreacting. This is the very real effect of PMDD hormones on your brain chemistry. Progesterone drops trigger anxiety in many women. You're doing great by noticing it. 💙</p>
          </div>
          <div className="bg-purple-100 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%]">
            <p className="text-[9px] text-purple-800 leading-relaxed">This is not a substitute for professional medical advice. Please consult your doctor.</p>
          </div>
        </div>
        <div className="mt-2 flex gap-1.5 flex-wrap">
          {['Log symptoms', 'Coping tips', 'Talk to me'].map(a => (
            <span key={a} className="text-[8px] bg-white border border-purple-200 text-purple-700 rounded-full px-2 py-0.5 font-medium">{a}</span>
          ))}
        </div>
        <div className="mt-2 bg-white rounded-2xl border border-gray-200 px-3 py-2 flex items-center justify-between">
          <p className="text-[9px] text-gray-400">Message Luna...</p>
          <div className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center">
            <ChevronRight className="w-3 h-3 text-white" />
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'tracking',
    label: 'Daily Log',
    icon: <Heart className="w-4 h-4" />,
    headline: 'Log in under 2 minutes',
    desc: 'Validated clinical scales (DRSP, PHQ-9, GAD-7, EPDS) adapted for daily use. Track mood, physical symptoms, medications, vitals, and journal entries — all in one place.',
    color: 'rose',
    mockup: (
      <div className="flex-1 bg-gradient-to-b from-rose-50 to-white p-4 space-y-3 overflow-hidden">
        <div className="flex items-center justify-between mb-1">
          <p className="font-bold text-sm text-gray-800">Daily Log</p>
          <span className="text-[9px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">May 18</span>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 space-y-2">
          <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Mood & Emotional</p>
          {['Mood Swings', 'Irritability', 'Anxiety', 'Depression'].map((s, i) => (
            <div key={s} className="flex items-center justify-between">
              <p className="text-[9px] text-gray-700">{s}</p>
              <div className="flex gap-0.5">
                {[1,2,3,4,5,6].map(n => (
                  <div key={n} className={`w-3 h-3 rounded-sm cursor-pointer ${n <= [4,3,2,1][i] ? 'bg-rose-400' : 'bg-gray-100'}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 space-y-2">
          <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Physical</p>
          {['Bloating', 'Breast Tenderness', 'Headache'].map((s, i) => (
            <div key={s} className="flex items-center justify-between">
              <p className="text-[9px] text-gray-700">{s}</p>
              <div className="flex gap-0.5">
                {[1,2,3,4,5,6].map(n => (
                  <div key={n} className={`w-3 h-3 rounded-sm ${n <= [3,4,2][i] ? 'bg-teal-500' : 'bg-gray-100'}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="bg-teal-600 rounded-2xl py-2.5 text-center">
          <p className="text-white text-[10px] font-semibold">Save Today's Log ✓</p>
        </div>
      </div>
    )
  },
  {
    id: 'insights',
    label: 'Insights',
    icon: <BarChart3 className="w-4 h-4" />,
    headline: 'See your patterns over time',
    desc: 'CycleMind analyzes months of data to surface PMDD risk scores, luteal severity trends, and personalized insights your doctor can actually use.',
    color: 'blue',
    mockup: (
      <div className="flex-1 bg-gradient-to-b from-blue-50 to-white p-4 space-y-3 overflow-hidden">
        <p className="font-bold text-sm text-gray-800 mb-1">Your Insights</p>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <p className="text-[9px] text-gray-400 mb-1">PMDD Risk Score — Last 3 Cycles</p>
          <div className="flex items-end gap-1.5 h-12">
            {[60, 75, 45, 80, 55, 70, 40].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: h > 65 ? '#0d9488' : '#99f6e4' }} />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <p className="text-[8px] text-gray-400">Jan</p>
            <p className="text-[8px] text-gray-400">Mar</p>
            <p className="text-[8px] text-gray-400">May</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-2.5">
            <p className="text-[8px] text-amber-600 font-semibold uppercase">Avg Luteal</p>
            <p className="text-sm font-bold text-amber-700 mt-0.5">3.8/6</p>
            <p className="text-[8px] text-amber-500">Moderate severity</p>
          </div>
          <div className="bg-teal-50 border border-teal-100 rounded-xl p-2.5">
            <p className="text-[8px] text-teal-600 font-semibold uppercase">Cycle Length</p>
            <p className="text-sm font-bold text-teal-700 mt-0.5">28.3d</p>
            <p className="text-[8px] text-teal-500">Very consistent</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <p className="text-[9px] font-semibold text-gray-700 mb-1">🔍 Luna's Pattern Insight</p>
          <p className="text-[9px] text-gray-500 leading-relaxed">Anxiety peaks 8–10 days before your period. Your top triggers: poor sleep + high stress. Mood rebounds within 2 days of period start.</p>
        </div>
      </div>
    )
  },
  {
    id: 'report',
    label: 'Doctor Report',
    icon: <FileText className="w-4 h-4" />,
    headline: 'Clinical reports for your doctor',
    desc: 'Generate a DRSP-based clinical PDF or a secure shareable link. Arrive at every appointment with 90 days of objective, structured data your provider can act on.',
    color: 'teal',
    mockup: (
      <div className="flex-1 bg-gradient-to-b from-teal-50 to-white p-4 space-y-3 overflow-hidden">
        <p className="font-bold text-sm text-gray-800 mb-1">Doctor Report</p>
        <div className="bg-white rounded-xl border border-teal-200 p-3 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-600" />
            <p className="text-xs font-semibold text-gray-800">90-Day Clinical Summary</p>
          </div>
          <p className="text-[9px] text-gray-500">DRSP scores · PHQ-9 · GAD-7 · Cycle analysis · Symptom trends</p>
          <div className="flex gap-2 pt-1">
            <div className="flex-1 bg-teal-600 rounded-xl py-2 text-center">
              <p className="text-[9px] text-white font-semibold">Download PDF</p>
            </div>
            <div className="flex-1 bg-teal-50 border border-teal-200 rounded-xl py-2 text-center">
              <p className="text-[9px] text-teal-700 font-semibold">Share Link</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm space-y-2">
          <p className="text-[9px] font-semibold text-gray-600 uppercase tracking-wide">Active Shares</p>
          <div className="flex items-center justify-between py-1 border-b border-gray-50">
            <div>
              <p className="text-[9px] font-medium text-gray-800">Dr. Sarah Chen</p>
              <p className="text-[8px] text-gray-400">Expires Jun 12 · 2 views</p>
            </div>
            <span className="text-[8px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full font-medium">Active</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-[9px] font-medium text-gray-800">Dr. Mark Rivera</p>
              <p className="text-[8px] text-gray-400">Expires Jul 1 · 1 view</p>
            </div>
            <span className="text-[8px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full font-medium">Active</span>
          </div>
        </div>
      </div>
    )
  },
];

const COLOR_MAP = {
  teal: { tab: 'bg-teal-600 text-white', border: 'border-teal-200', ring: 'ring-teal-200' },
  purple: { tab: 'bg-purple-600 text-white', border: 'border-purple-200', ring: 'ring-purple-200' },
  rose: { tab: 'bg-rose-500 text-white', border: 'border-rose-200', ring: 'ring-rose-200' },
  blue: { tab: 'bg-blue-600 text-white', border: 'border-blue-200', ring: 'ring-blue-200' },
};

export default function AppShowcase() {
  const [active, setActive] = useState(0);
  const screen = SCREENS[active];
  const colors = COLOR_MAP[screen.color];

  return (
    <section className="py-24 px-5 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14 space-y-3">
          <span className="text-teal-600 font-semibold text-sm uppercase tracking-widest">See it in Action</span>
          <h2 className="font-serif text-4xl font-bold text-gray-900">Every feature built with clinical precision</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">Explore the app that's changing how women track and understand their hormonal health.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-center">
          {/* Left: tabs + description */}
          <div className="flex-1 space-y-6 w-full">
            {/* Tab pills */}
            <div className="flex flex-wrap gap-2">
              {SCREENS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setActive(i)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-semibold transition-all ${
                    i === active ? colors.tab + ' shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-300 hover:text-teal-700'
                  }`}
                >
                  {s.icon}
                  {s.label}
                </button>
              ))}
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="font-serif text-3xl font-bold text-gray-900">{screen.headline}</h3>
              <p className="text-gray-500 text-lg leading-relaxed">{screen.desc}</p>
            </div>

            {/* Feature bullets */}
            <div className="space-y-2">
              {screen.id === 'dashboard' && ['Real-time cycle phase & day tracking', 'Severity scores updated daily', 'Personalized Luna AI insights', 'Predictive period & ovulation windows'].map(b => (
                <div key={b} className="flex items-center gap-2 text-sm text-gray-600"><span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />{b}</div>
              ))}
              {screen.id === 'luna' && ['Available 24/7, no appointment needed', 'Trained by board-certified psychiatrists', 'Crisis-aware with 988 escalation', 'Remembers your patterns over time'].map(b => (
                <div key={b} className="flex items-center gap-2 text-sm text-gray-600"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />{b}</div>
              ))}
              {screen.id === 'tracking' && ['DRSP (gold standard for PMDD)', 'PHQ-9, GAD-7, EPDS validated scales', 'Voice-to-symptom logging', 'Medication & custom symptom tracking'].map(b => (
                <div key={b} className="flex items-center gap-2 text-sm text-gray-600"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />{b}</div>
              ))}
              {screen.id === 'insights' && ['PMDD risk scores across cycles', 'Luteal vs follicular severity comparison', 'Top symptom triggers identified', 'Pattern analysis powered by AI'].map(b => (
                <div key={b} className="flex items-center gap-2 text-sm text-gray-600"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />{b}</div>
              ))}
              {screen.id === 'report' && ['90-day structured clinical PDF', 'Shareable secure links with expiry', 'DRSP, PHQ-9, GAD-7, EPDS included', 'Access controls & anonymization'].map(b => (
                <div key={b} className="flex items-center gap-2 text-sm text-gray-600"><span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />{b}</div>
              ))}
            </div>
          </div>

          {/* Right: phone mockup */}
          <div className="shrink-0 flex justify-center">
            <div className={`relative w-64 h-[520px] bg-gray-900 rounded-[44px] shadow-2xl overflow-hidden border-4 border-gray-800 flex flex-col ring-4 transition-all duration-300 ${colors.ring}`}>
              {/* Status bar */}
              <div className="h-7 bg-gray-900 flex items-center justify-between px-5 shrink-0">
                <span className="text-white text-[9px]">9:41</span>
                <div className="flex gap-1">
                  <div className="w-3 h-1.5 bg-white rounded-sm opacity-60" />
                  <div className="w-3 h-1.5 bg-white rounded-sm opacity-60" />
                </div>
              </div>
              {/* Screen content */}
              {screen.mockup}
              {/* Home bar */}
              <div className="h-5 bg-white flex items-center justify-center shrink-0">
                <div className="w-16 h-1 bg-gray-300 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-10">
          {SCREENS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-2 rounded-full transition-all ${i === active ? 'bg-teal-600 w-6' : 'bg-gray-300 w-2 hover:bg-gray-400'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}