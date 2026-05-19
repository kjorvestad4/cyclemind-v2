import { useState, useEffect, useCallback } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: "Sarah T., 34",
    context: "PMDD Patient",
    quote: "CycleMind finally connected the dots on my PMDD. The daily symptom tracker revealed patterns I'd suspected for years. Sharing clean reports with my psychiatrist made every session more productive — I feel seen, understood, and in control for the first time."
  },
  {
    name: "Jessica P., 29",
    context: "First-Time Mom",
    quote: "From pregnancy through postpartum recovery, CycleMind tracked every physical and emotional shift. The privacy focus gave me confidence to log sensitive symptoms, and the insights helped me communicate clearly with my OB and therapist when things felt overwhelming."
  },
  {
    name: "Linda M., 48",
    context: "Perimenopause",
    quote: "Perimenopause threw my cycles and mood into chaos. CycleMind's menopause-specific tracking and pattern insights gave me clarity and confidence. It feels like the app was built by psychiatrists who actually understand this transition."
  },
  {
    name: "Rachel K., 31",
    context: "Marketing Manager",
    quote: "Private, intuitive, and genuinely science-based. I love how quickly I can log symptoms yet still get powerful weekly insights into my PMS and mental health. CycleMind turned my 'cycles that have a mind of their own' into something I can actually manage."
  },
  {
    name: "Amanda L., 35",
    context: "Postpartum",
    quote: "Postpartum anxiety hit hard, but CycleMind's recovery tracking showed me the hormonal patterns and that it was temporary. Logging took seconds even on tough days, and the data helped my care team adjust support in real time."
  },
  {
    name: "Megan F., 40",
    context: "Cycle Tracker",
    quote: "Finally an app that covers every stage — menstrual, pregnancy planning, postpartum, and now perimenopause — without selling my data. The mental-health focus sets CycleMind apart. It's like having a psychiatrist's insight in my pocket."
  },
  {
    name: "Karen W., 37",
    context: "PMDD Patient",
    quote: "After years of being dismissed, CycleMind's detailed tracking helped me secure an official PMDD diagnosis. The patterns it uncovers are spot-on and the privacy is unmatched. This app is changing lives."
  },
  {
    name: "Patricia M., 52",
    context: "Menopause",
    quote: "Menopause was exhausting until CycleMind. The comprehensive tracking across life stages, combined with clear science-backed insights, has restored my sense of control. I've already sent the link to every friend in the same boat."
  },
];

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback((index) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 300);
  }, [animating]);

  const prev = () => goTo((current - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = useCallback(() => goTo((current + 1) % TESTIMONIALS.length), [current, goTo]);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  // Show 3 cards: prev, current, next
  const indices = [
    (current - 1 + TESTIMONIALS.length) % TESTIMONIALS.length,
    current,
    (current + 1) % TESTIMONIALS.length,
  ];

  return (
    <section className="py-24 px-5 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14 space-y-3">
          <span className="text-teal-600 font-semibold text-sm uppercase tracking-widest">User Stories</span>
          <h2 className="font-serif text-4xl font-bold text-gray-900">What women are saying</h2>
          <p className="text-gray-500 text-sm">Real experiences from women across every reproductive stage.</p>
        </div>

        {/* Cards */}
        <div className="relative flex items-center gap-4">
          <button
            onClick={prev}
            className="shrink-0 w-10 h-10 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center hover:bg-teal-50 hover:border-teal-300 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex-1 grid sm:grid-cols-3 gap-4 overflow-hidden">
            {indices.map((idx, pos) => {
              const t = TESTIMONIALS[idx];
              const isCenter = pos === 1;
              return (
                <div
                  key={idx}
                  className={`bg-white rounded-3xl border shadow-sm p-6 space-y-4 transition-all duration-300 ${
                    isCenter
                      ? 'border-teal-200 shadow-md scale-100 opacity-100'
                      : 'border-gray-100 scale-95 opacity-50 hidden sm:block'
                  } ${animating ? 'opacity-0 translate-y-2' : ''}`}
                >
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed text-sm">"{t.quote}"</p>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-teal-600 font-medium">{t.context}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={next}
            className="shrink-0 w-10 h-10 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center hover:bg-teal-50 hover:border-teal-300 transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-teal-600 w-5' : 'bg-gray-300 hover:bg-gray-400'}`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}