import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OnboardingStep4({
  onLogToday,
  onSkipToDashboard,
  saving,
}) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 space-y-8 text-center max-w-md mx-auto">
      <div className="space-y-3">
        <div className="text-7xl">🎉</div>
        <h2 className="font-serif text-3xl font-semibold text-foreground">
          Onboarding Complete!
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Your cycle tracking is ready. Let's get started.
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

      <div className="w-full space-y-3">
        <Button
          onClick={onLogToday}
          disabled={saving}
          className="w-full h-12 rounded-2xl font-semibold text-base"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Setting up...
            </>
          ) : (
            "Log Today"
          )}
        </Button>
        <Button
          onClick={onSkipToDashboard}
          disabled={saving}
          variant="outline"
          className="w-full h-12 rounded-2xl font-semibold text-base"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}