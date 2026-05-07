import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Clock, Ruler, Lock } from "lucide-react";

export default function Step3Preferences({ formData, onUpdate }) {
  const handleInputChange = (field, value) => {
    onUpdate({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-serif font-bold">Your preferences</h2>
        <p className="text-sm text-muted-foreground">Personalize for your needs</p>
      </div>

      <div className="space-y-5 flex-1">
        {/* Daily Reminder */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <Label className="text-sm font-semibold">Daily reminder time</Label>
          </div>
          <Input
            type="time"
            value={formData.notification_time || "09:00"}
            onChange={(e) => handleInputChange("notification_time", e.target.value)}
            className="h-12 text-base"
          />
          <p className="text-xs text-muted-foreground">Get a gentle nudge to log your day</p>
        </div>

        {/* Units */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-muted-foreground" />
            <Label className="text-sm font-semibold">Measurement units</Label>
          </div>
          <RadioGroup value={formData.unit_system || "imperial"} onValueChange={(v) => handleInputChange("unit_system", v)}>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="imperial" id="imperial" />
              <Label htmlFor="imperial" className="flex-1 text-sm cursor-pointer font-medium">Imperial (lbs, inches)</Label>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="metric" id="metric" />
              <Label htmlFor="metric" className="flex-1 text-sm cursor-pointer font-medium">Metric (kg, cm)</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Privacy & Data */}
        <div className="space-y-3 rounded-2xl border border-border/50 bg-muted/30 p-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <Label className="text-sm font-semibold">Your data, your privacy</Label>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your data stays yours. You can export everything anytime — including PHQ-9, GAD-7, and EPDS scores — to share securely with your doctor.
          </p>
          <p className="text-[10px] text-muted-foreground italic">No ads. No selling. No surprises.</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center italic">You can change these settings anytime in your profile.</p>
    </div>
  );
}