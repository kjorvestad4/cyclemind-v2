import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

export default function Welcome() {
  return (
    <div 
      className="min-h-screen bg-background flex flex-col items-center justify-center p-6"
      style={{ paddingTop: "max(1.5rem, env(safe-area-inset-top))", paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex flex-col items-center space-y-8 text-center max-w-md w-full">
        <div className="space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto">
            <span className="text-4xl">🌙</span>
          </div>
          <h1 className="font-serif text-3xl font-semibold text-foreground">Welcome to CycleMind</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The app that supports your full hormonal journey — from PMDD to pregnancy to menopause.
          </p>
        </div>

        <div className="w-full space-y-3">
          <Button
            onClick={() => base44.auth.redirectToLogin("/start")}
            className="w-full h-12 rounded-2xl font-semibold text-base"
          >
            Get Started
          </Button>
          <Button
            onClick={() => base44.auth.redirectToLogin("/")}
            variant="outline"
            className="w-full h-12 rounded-2xl font-semibold text-base"
          >
            I already have an account
          </Button>
          <p className="text-xs text-muted-foreground pt-1">
            Free to use · Private by design · No ads
          </p>
        </div>
      </div>
    </div>
  );
}