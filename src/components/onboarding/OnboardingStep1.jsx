import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const MODES = [
{ id: "menstrual", emoji: "🌙", label: "Menstrual / PMDD", description: "Track cycles and PMDD symptoms" },
{ id: "pregnancy", emoji: "🤰", label: "Pregnancy", description: "Monitor your pregnancy journey" },
{ id: "postpartum", emoji: "🍼", label: "Postpartum", description: "Support your recovery" },
{ id: "perimenopause", emoji: "🌊", label: "Perimenopause", description: "Navigate the transition" },
{ id: "menopause", emoji: "🔥", label: "Menopause", description: "Manage your menopause" }];


export default function OnboardingStep1({ selectedMode, onSelect, onNext, onSkip }) {
  return (
    <div className="flex flex-col items-center space-y-8 text-center max-w-md mx-auto w-full">
      <div className="space-y-3">
        <h1 className="font-serif text-3xl font-semibold text-foreground">
          Welcome to CycleMind
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">The app that supports your full hormonal journey from PMDD to pregnancy to menopause.

        </p>
      </div>

      <div className="w-full space-y-2">
        {MODES.map((mode) => {
          const isSelected = selectedMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onSelect(mode.id)}
              className={`w-full rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.98] ${
              isSelected ?
              "border-primary bg-primary/10" :
              "border-border/60 hover:border-border hover:bg-muted/30"}`
              }>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{mode.emoji}</span>
                  <div>
                    <p className="font-semibold text-sm">{mode.label}</p>
                    <p className="text-xs text-muted-foreground">{mode.description}</p>
                  </div>
                </div>
                {isSelected &&
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                }
              </div>
            </button>);

        })}
      </div>

      <button
        onClick={onNext}
        className="text-sm text-muted-foreground hover:text-foreground underline">
        
        I'll choose later
      </button>
    </div>);

}