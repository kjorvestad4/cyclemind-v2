import { Check } from "lucide-react";

const MODES = [
  { id: "menstrual", emoji: "🌙", label: "Menstrual / PMDD", description: "Track your cycle and mood" },
  { id: "pregnancy", emoji: "🤰", label: "Pregnancy", description: "Monitor your pregnancy journey" },
  { id: "postpartum", emoji: "🍼", label: "Postpartum", description: "Track recovery and wellbeing" },
  { id: "perimenopause", emoji: "🌊", label: "Perimenopause", description: "Navigate the transition" },
  { id: "menopause", emoji: "🔥", label: "Menopause", description: "Manage symptoms and health" },
];

export default function Step1ModeSelection({ selectedMode, onSelect }) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-serif font-bold">Let's get started</h2>
        <p className="text-muted-foreground">What stage of your hormonal lifecycle are you in?</p>
      </div>

      <div className="space-y-3">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onSelect(mode.id)}
            className={`w-full p-4 rounded-2xl border-2 transition-all active:scale-95 text-left ${
              selectedMode === mode.id
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <span className="text-3xl">{mode.emoji}</span>
                <div>
                  <p className="font-bold text-foreground">{mode.label}</p>
                  <p className="text-sm text-muted-foreground">{mode.description}</p>
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
    </div>
  );
}