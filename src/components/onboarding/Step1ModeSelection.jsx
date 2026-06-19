import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const MODES = [
  { id: "menstrual", emoji: "🌙", label: "Menstrual / PMDD", description: "Track cycle phases, mood & symptoms" },
  { id: "pregnancy", emoji: "🤰", label: "Pregnancy", description: "Support your full pregnancy journey", highlight: true },
  { id: "postpartum", emoji: "🍼", label: "Postpartum", description: "Track recovery, bonding & mental health" },
  { id: "perimenopause", emoji: "🌊", label: "Perimenopause", description: "Navigate hormonal transitions" },
  { id: "menopause", emoji: "🔥", label: "Postmenopause", description: "Manage symptoms & HRT tracking" },
];

export default function Step1ModeSelection({ selectedMode, onSelect, onSkip }) {
  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-serif font-bold">Welcome to CycleMind</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Built with 3 perinatal psychiatrists to support your full hormonal journey — from cycles to pregnancy to motherhood.
        </p>
      </div>

      <div className="space-y-2.5 flex-1">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onSelect(mode.id)}
            className={`w-full p-4 rounded-2xl border-2 transition-all active:scale-[0.98] text-left ${
              selectedMode === mode.id
                ? mode.highlight
                  ? "border-pink-400 bg-pink-50 dark:bg-pink-950/30 dark:border-pink-600"
                  : "border-primary bg-primary/10"
                : mode.highlight
                ? "border-pink-200 dark:border-pink-800 hover:border-pink-300 dark:hover:border-pink-700"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <span className="text-4xl">{mode.emoji}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-foreground">{mode.label}</p>
                    {mode.highlight && <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 font-semibold">Popular</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{mode.description}</p>
                </div>
              </div>
              {selectedMode === mode.id && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {!selectedMode && (
        <p className="text-xs text-muted-foreground text-center">Pick one to get started. You can change anytime.</p>
      )}
    </div>
  );
}