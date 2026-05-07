import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { format } from "date-fns";

export default function Step4FirstLog({ selectedMode, onSkip, onStart }) {
  const EMOJIS = {
    menstrual: "🌙",
    pregnancy: "🤰",
    postpartum: "🍼",
    perimenopause: "🌊",
    menopause: "🔥",
  };

  const LABELS = {
    menstrual: "Menstrual / PMDD",
    pregnancy: "Pregnancy",
    postpartum: "Postpartum",
    perimenopause: "Perimenopause",
    menopause: "Menopause",
  };

  const ENCOURAGEMENT = {
    menstrual: "Track your mood, symptoms, and cycle — find patterns that matter to you.",
    pregnancy: "Log pregnancy symptoms, fetal movement, and how you're feeling — your baby and your mental health matter.",
    postpartum: "Track recovery, bonding, and your emotional wellbeing — postpartum mental health is healthcare.",
    perimenopause: "Monitor hot flashes, mood, and sleep — navigate this transition with clarity.",
    menopause: "Log symptoms and HRT response — take control of this new chapter.",
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-serif font-bold">You're all set! 💜</h2>
        <p className="text-sm text-muted-foreground">Your first insights appear after a few logs</p>
      </div>

      <div className="rounded-3xl border-2 border-primary/30 bg-primary/5 p-6 space-y-4 text-center flex-1 flex flex-col justify-center">
        <div className="text-6xl">{EMOJIS[selectedMode]}</div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tracking Mode</p>
          <p className="text-2xl font-bold">{LABELS[selectedMode]}</p>
        </div>
        <p className="text-sm text-foreground leading-relaxed mt-4">{ENCOURAGEMENT[selectedMode]}</p>
        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-600 pt-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>Ready to log</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Log <span className="font-semibold text-foreground">{format(new Date(), "EEEE, MMMM d")}</span> whenever you're ready. Be as detailed or quick as feels right.
          </p>
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <Button onClick={onStart} className="w-full h-12 text-base font-semibold rounded-2xl gap-2 shadow-lg shadow-primary/20">
          <ArrowRight className="w-5 h-5" />
          Start Logging
        </Button>
        <Button onClick={onSkip} variant="outline" className="w-full h-12 text-base font-semibold rounded-2xl">
          Go to Dashboard
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center italic">You can log anytime from the Daily Log tab.</p>
    </div>
  );
}