import { useState, useEffect, useRef } from "react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const TOUR_KEY = "cyclemind_tour_v1_done";

const STEPS = [
  {
    id: "dashboard",
    title: "Welcome to CycleMind! 🌙",
    description: "This is your Dashboard — your daily home base. It shows your current cycle phase, today's symptom severity, and personalized insights.",
    target: "tour-dashboard",
  },
  {
    id: "log",
    title: "Daily Log 📝",
    description: "Tap here every day to log your symptoms, mood, vitals, and more. Your data builds the foundation for all clinical insights.",
    target: "tour-log",
  },
  {
    id: "insights",
    title: "Insights 📊",
    description: "See your symptom patterns visualized over time. Track PMDD indicators, phase comparisons, and generate clinical-grade reports for your doctor.",
    target: "tour-insights",
  },
  {
    id: "resources",
    title: "Resources 📚",
    description: "Access evidence-based articles, guides, and tools curated by our clinical team to help you understand your reproductive health.",
    target: "tour-resources",
  },
  {
    id: "profile",
    title: "Profile & Settings ⚙️",
    description: "Manage your cycle mode (menstrual, pregnancy, postpartum, menopause), personal details, and app preferences here.",
    target: "tour-profile",
  },
  {
    id: "luna",
    title: "Meet Luna 🌙",
    description: "Tap the Luna button anytime to chat with your AI companion — she can answer questions, validate your feelings, and help you understand your cycle.",
    target: "tour-luna",
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
      const el = document.getElementById(STEPS[step].target);
      if (el) {
        setHighlightRect(el.getBoundingClientRect());
      } else {
        setHighlightRect(null);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
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
        className="fixed inset-0 bg-black/50 pointer-events-none"
        style={{ zIndex: 9998 }}
      />

      {/* Highlight ring — pointer-events-none */}
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
            boxShadow: "0 0 0 3px #14b8a6, 0 0 0 5000px rgba(0,0,0,0.5)",
            background: "transparent",
          }}
        />
      )}

      {/* Tooltip — anchored to bottom of screen, always fully visible */}
      <div
        className="fixed left-4 right-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-teal-300 dark:border-teal-700 p-5"
        style={{ zIndex: 10000, bottom: 90 }}
      >
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground p-1"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step indicator */}
        <div className="flex gap-1.5 mb-3">
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