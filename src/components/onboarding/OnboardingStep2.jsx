import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DOBPicker from "@/components/common/DOBPicker";

export default function OnboardingStep2({ fullName, setFullName, dateOfBirth, setDateOfBirth }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 space-y-6 text-center max-w-md mx-auto">
      <div className="space-y-2">
        <h2 className="font-serif text-2xl font-semibold text-foreground">
          Tell us about you
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This helps us personalize your experience and show age-appropriate insights.
        </p>
      </div>

      <div className="w-full space-y-5">
        {/* Full Name */}
        <div className="space-y-2 text-left">
          <Label className="text-sm font-semibold">
            👤 Full Name <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            type="text"
            placeholder="Your name"
            className="h-11 text-base"
            value={fullName || ""}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        {/* Date of Birth */}
        <div className="text-left">
          <DOBPicker
            value={dateOfBirth}
            onChange={setDateOfBirth}
            label="🎂 Date of Birth"
            optional={true}
          />
          <p className="text-xs text-muted-foreground italic mt-2">
            Optional — used to calculate your age and show age-appropriate tips
          </p>
        </div>
      </div>

      <div className="w-full pt-2 bg-muted/30 rounded-2xl p-4 text-left space-y-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">After signing in you'll set:</p>
        <p className="text-sm text-foreground">📅 Last menstrual period (LMP)</p>
        <p className="text-sm text-foreground">🔄 Average cycle length</p>
        <p className="text-xs text-muted-foreground mt-1">These live on your Profile page and can be updated any time.</p>
      </div>
    </div>
  );
}