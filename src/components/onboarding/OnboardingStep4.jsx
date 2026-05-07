import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const MODE_CONTENT = {
  menstrual: {
    emoji: "🌙",
    title: "Ready to log your cycle?",
    description: "Start tracking your symptoms and we'll help you spot patterns.",
  },
  pregnancy: {
    emoji: "🤰",
    title: "Ready to track your pregnancy?",
    description: "Your first insights will appear after a few logs. Let's get started!",
  },
  postpartum: {
    emoji: "🍼",
    title: "Ready to log your recovery?",
    description: "We'll support you every step of the way. Let's begin.",
  },
  perimenopause: {
    emoji: "🌊",
    title: "Ready to navigate perimenopause?",
    description: "Track your symptoms and take control of your transition.",
  },
  menopause: {
    emoji: "🔥",
    title: "Ready to manage your menopause?",
    description: "Your insights will help guide your wellness journey.",
  },
};

export default function OnboardingStep4({
  selectedMode,
  onLogToday,
  onSkipToDashboard,
  saving,
}) {
  const content = MODE_CONTENT[selectedMode];

  return (
    <div className="flex flex-col items-center justify-center flex-1 space-y-8 text-center max-w-md mx-auto">
      <div className="space-y-4">
        <div className="text-6xl">{content.emoji}</div>
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-semibold text-foreground">
            {content.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {content.description}
          </p>
        </div>
      </div>

      <div className="bg-muted/30 rounded-xl p-4 text-left w-full space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase">
          ✅ You're all set!
        </p>
        <ul className="space-y-1.5 text-sm text-foreground">
          <li>✓ Cycle details saved</li>
          <li>✓ Reminder set for daily logging</li>
          <li>✓ Privacy settings configured</li>
        </ul>
      </div>

      <p className="text-xs text-muted-foreground italic">
        Brain fog? No worries — we'll make logging super simple and quick.
      </p>

      <div className="w-full space-y-2">
        <Button
          onClick={onLogToday}
          disabled={saving}
          className="w-full h-12 rounded-2xl font-semibold text-base gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Setting up...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Log Today
            </>
          )}
        </Button>
        <button
          onClick={onSkipToDashboard}
          disabled={saving}
          className="w-full py-3 rounded-2xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
        >
          Skip to Dashboard
        </button>
      </div>
    </div>
  );
}