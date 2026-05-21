import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const TOUR_KEY = "cyclemind_tour_v2_done";

const STEPS = [
  {
    title: "Welcome to CycleMind! 🌙",
    description: "This is your Dashboard — your daily home base. It shows your current cycle phase, today's symptom severity, and personalized insights.",
    target: "tour-dashboard",
  },
  {
    title: "📅 Calendar View",
    description: "Tap this button to open the full calendar. Browse past cycle days, view symptom severity by day, and log events like bleeding, ovulation, or intimacy.",
    target: "tour-calendar",
  },
  {
    title: "🔄 Switch Tracking Mode",
    description: "Tap 'Switch' to change your active tracking mode — Menstrual / PMDD, Pregnancy, Postpartum, or Menopause. Each mode unlocks different symptom tracking fields.",
    target: "tour-switch",
  },
  {
    title: "📝 Daily Log",
    description: "Tap here every day to log your symptoms, mood, vitals, and more. Your data builds the foundation for all clinical insights.",
    target: "tour-log",
  },
  {
    title: "📊 Insights",
    description: "See your symptom patterns visualized over time. Track PMDD indicators, phase comparisons, and generate clinical-grade reports to share with your doctor.",
    target: "tour-insights",
  },
  {
    title: "📚 Resources",
    description: "Access evidence-based articles, guides, and tools curated by our clinical team to help you understand your reproductive health.",
    target: "tour-resources",
  },
  {
    title: "⚙️ Profile & Settings",
    description: "Manage your cycle mode, personal details, and app preferences here.",
    target: "tour-profile",
  },
  {
    title: "Meet Luna 🌙",
    description: "This is your Luna AI button — tap it anytime to open Luna. She can answer questions, validate your feelings, and support you through your cycle.",
    target: "tour-luna-button",
  },
  {
    title: "Luna Chat 💬",
    description: "Inside Luna, the Chat tab lets you have a real conversation. Ask about your symptoms, get coping tips, or simply talk through how you're feeling.",
    target: "tour-luna-button",
  },
  {
    title: "Luna Notifications 🔔",
    description: "The Notifications tab inside Luna shows personalized health alerts — like luteal phase warnings, pattern insights, and positive progress updates.",
    target: "tour-luna-button",
  },
];

export default function GuidedTour() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [highlightRect, setHighlightRect] = useState(null);

  useEffect(() => {
    const done = localStorage.getItem(TOUR_KEY);
    if (!done) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const update = () => {
      const target = STEPS[step].target;
      const el = target ? document.getElementById(target) : null;
      if (el) {
        setHighlightRect(el.getBoundingClientRect());
      } else {
        setHighlightRect(null);
      }
    };
    // Small delay to let layout settle after step change
    const t = setTimeout(update, 80);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [step, visible]);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(TOUR_KEY, "1");
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else dismiss();
  };

  const prev = () => setStep(s => s - 1);

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <>
      {/* Semi-transparent backdrop — pointer-events-none so nothing is blocked */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 9998, background: "rgba(0,0,0,0.5)" }}
      />

      {/* Highlight cutout ring — pointer-events-none */}
      {highlightRect && (
        <div
          className="fixed pointer-events-none transition-all duration-300"
          style={{
            zIndex: 9999,
            top: highlightRect.top - 5,
            left: highlightRect.left - 5,
            width: highlightRect.width + 10,
            height: highlightRect.height + 10,
            borderRadius: 14,
            boxShadow: "0 0 0 3px #14b8a6, 0 0 0 5000px rgba(0,0,0,0.45)",
            background: "transparent",
          }}
        />
      )}

      {/* Tooltip — positions above the highlight when element is in bottom half */}
      <div
        className="fixed left-4 right-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-teal-300 dark:border-teal-700 p-5"
        style={{
          zIndex: 10000,
          ...(highlightRect && highlightRect.top > window.innerHeight / 2
            ? { bottom: window.innerHeight - highlightRect.top + 16 }
            : { bottom: 90 })
        }}
      >
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground p-1"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step dots */}
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-5 bg-teal-600" : "w-1.5 bg-teal-200 dark:bg-teal-700"
              }`}
            />
          ))}
        </div>

        <p className="font-semibold text-sm text-foreground mb-1">{current.title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">{current.description}</p>

        <div className="flex items-center justify-between">
          <button
            onClick={dismiss}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
          >
            Skip tour
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button size="sm" variant="outline" onClick={prev} className="h-8 px-3 text-xs">
                <ChevronLeft className="w-3 h-3 mr-1" /> Back
              </Button>
            )}
            <Button
              size="sm"
              onClick={next}
              className="h-8 px-4 text-xs bg-teal-600 hover:bg-teal-700 text-white"
            >
              {isLast ? "Done! 🎉" : <>Next <ChevronRight className="w-3 h-3 ml-1" /></>}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}