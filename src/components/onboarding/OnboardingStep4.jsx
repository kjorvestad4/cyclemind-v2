import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OnboardingStep4({
  onGetStarted,
  saving,
}) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 space-y-8 text-center max-w-md mx-auto">
      <div className="space-y-3">
        <div className="text-7xl">🎉</div>

        <p className="text-lg font-semibold text-foreground mt-2">
          Your cycle tracking is ready! Let's get started!
        </p>
      </div>

      <div className="bg-primary/5 rounded-2xl border border-primary/20 p-5 text-left w-full space-y-2">
        <p className="text-xs font-bold text-primary uppercase">✓ All set</p>
        <ul className="space-y-1.5 text-sm text-foreground">
          <li>✓ Cycle details configured</li>
          <li>✓ Preferences saved</li>
          <li>✓ Ready to log</li>
        </ul>
      </div>

      <Button
        onClick={onGetStarted}
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
            Get Started
          </>
        )}
      </Button>
    </div>
  );
}