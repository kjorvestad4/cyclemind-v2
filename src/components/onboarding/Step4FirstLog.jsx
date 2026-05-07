import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-serif font-bold">You're all set!</h2>
        <p className="text-muted-foreground">Ready to log your first day?</p>
      </div>

      <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-6 space-y-4 text-center">
        <div className="text-5xl">{EMOJIS[selectedMode]}</div>
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Tracking Mode</p>
          <p className="text-xl font-bold">{LABELS[selectedMode]}</p>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Ready to log</span>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-foreground">
          Let's log your first entry for <span className="font-semibold">{format(new Date(), "EEEE, MMMM d")}</span>
        </p>
        <p className="text-xs text-muted-foreground">You can update it anytime. Be as detailed or minimal as you want.</p>
      </div>

      <div className="space-y-2 pt-4">
        <Button onClick={onStart} className="w-full h-12 text-base font-semibold rounded-2xl gap-2">
          Start Logging
          <ArrowRight className="w-5 h-5" />
        </Button>
        <Button onClick={onSkip} variant="outline" className="w-full h-12 text-base font-semibold rounded-2xl">
          Skip for now
        </Button>
      </div>

      <p className="text-[10px] text-muted-foreground text-center italic">
        You'll see this modal whenever you start a new tracking mode.
      </p>
    </div>
  );
}