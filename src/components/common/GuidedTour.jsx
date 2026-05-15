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
    placement: "bottom",
  },
  {
    id: "log",
    title: "Daily Log",
    description: "Tap here every day to log your symptoms, mood, vitals, and more. Your data builds the foundation for all clinical insights.",
    target: "tour-log",
    placement: "top",
  },
  {
    id: "insights",
    title: "Insights",
    description: "See your symptom patterns visualized over time. Track PMDD indicators, phase comparisons, and generate clinical-grade reports for your doctor.",
    target: "tour-insights",
    placement: "top",
  },
  {
    id: "resources",
    title: "Resources",
    description: "Access evidence-based articles, guides, and tools curated by our clinical team to help you understand your reproductive health.",
    target: "tour-resources",
    placement: "top",
  },
  {
    id: "profile",
    title: "Profile & Settings",
    description: "Manage your cycle mode (menstrual, pregnancy, postpartum, menopause), personal details, and app preferences here.",
    target: "tour-profile",
    placement: "top",
  },
  {
    id: "luna",
    title: "Meet Luna 🌙",
    description: "Tap the Luna button anytime to chat with your AI companion — she can answer questions, validate your feelings, and help you understand your cycle.",
    target: "tour-luna",
    placement: "top",
  },
];

function getTargetRect(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  return el.getBoundingClientRect();
}

export default function GuidedTour() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [rect, setRect] = useState(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const done = localStorage.getItem(TOUR_KEY);
    if (!done) {
      // Small delay so layout fully renders
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const current = STEPS[step];
    const update = () => setRect(getTargetRect(current.target));
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

  // Tooltip positioning
  let tooltipStyle = {};
  const PAD = 12;
  const TT_W = 300;

  if (rect) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (current.placement === "top") {
      tooltipStyle = {
        bottom: vh - rect.top + PAD,
        left: Math.min(Math.max(rect.left + rect.width / 2 - TT_W / 2, 12), vw - TT_W - 12),
      };
    } else {
      tooltipStyle = {
        top: rect.bottom + PAD,
        left: Math.min(Math.max(rect.left + rect.width / 2 - TT_W / 2, 12), vw - TT_W - 12),
      };
    }
  } else {
    // Fallback: center of screen
    tooltipStyle = { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  }

  return (
    <>
      {/* Dimmed overlay with cutout */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9998] pointer-events-none"
        style={{
          background: rect
            ? `radial-gradient(ellipse ${rect.width + 24}px ${rect.height + 24}px at ${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px, transparent 40%, rgba(0,0,0,0.55) 70%)`
            : "rgba(0,0,0,0.55)",
        }}
      />

      {/* Click-blocker overlay */}
      <div className="fixed inset-0 z-[9998]" onClick={() => {}} />

      {/* Highlight ring around target */}
      {rect && (
        <div
          className="fixed z-[9999] rounded-2xl ring-2 ring-teal-400 ring-offset-2 ring-offset-transparent pointer-events-none transition-all duration-300"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        className="fixed z-[10000] w-[300px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-teal-200 dark:border-teal-800 p-5 space-y-3"
        style={tooltipStyle}
      >
        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Progress dots */}
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-4 bg-teal-600" : "w-1.5 bg-teal-200 dark:bg-teal-800"
              }`}
            />
          ))}
        </div>

        <div>
          <p className="font-semibold text-sm text-foreground">{current.title}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{current.description}</p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={dismiss}
            className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
          >
            Skip tour
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button size="sm" variant="outline" onClick={prev} className="h-8 px-3 text-xs gap-1">
                <ChevronLeft className="w-3 h-3" /> Back
              </Button>
            )}
            <Button size="sm" onClick={next} className="h-8 px-3 text-xs gap-1 bg-teal-600 hover:bg-teal-700 text-white">
              {isLast ? "Done!" : <>Next <ChevronRight className="w-3 h-3" /></>}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}