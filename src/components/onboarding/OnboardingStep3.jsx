import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Shield } from "lucide-react";

export default function OnboardingStep3({
  reminderTime,
  setReminderTime,
  unitSystem,
  setUnitSystem,
}) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 space-y-6 text-center max-w-md mx-auto">
      <div className="space-y-2">
        <h2 className="font-serif text-2xl font-semibold text-foreground">
          Quick Preferences
        </h2>
        <p className="text-sm text-muted-foreground">
          Personalize your CycleMind experience
        </p>
      </div>

      <div className="w-full space-y-5">
        {/* Daily Log Reminder */}
        <div className="space-y-2 text-left">
          <Label className="text-sm font-semibold">Daily Log Reminder Time</Label>
          <Input
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="h-10 text-base"
          />
          <p className="text-xs text-muted-foreground italic">
            We'll gently remind you each day at this time
          </p>
        </div>

        {/* Unit System */}
        <div className="space-y-3 text-left">
          <Label className="text-sm font-semibold">Preferred Units</Label>
          <div className="space-y-2">
            <button
              onClick={() => setUnitSystem("imperial")}
              className={`w-full rounded-xl border-2 p-3 text-left transition-all ${
                unitSystem === "imperial"
                  ? "border-primary bg-primary/10"
                  : "border-border/60 hover:bg-muted/30"
              }`}
            >
              <p className="font-medium text-sm">Imperial (US)</p>
              <p className="text-xs text-muted-foreground">lbs, inches, °F</p>
            </button>
            <button
              onClick={() => setUnitSystem("metric")}
              className={`w-full rounded-xl border-2 p-3 text-left transition-all ${
                unitSystem === "metric"
                  ? "border-primary bg-primary/10"
                  : "border-border/60 hover:bg-muted/30"
              }`}
            >
              <p className="font-medium text-sm">Metric</p>
              <p className="text-xs text-muted-foreground">kg, cm, °C</p>
            </button>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
          <div className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="text-xs font-semibold text-primary mb-1">Your Data Is Yours</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All your health data stays private and encrypted. Export anytime for your psychiatrist or doctor. No ads. No selling.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}