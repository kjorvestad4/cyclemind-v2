import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

export default function Step3Preferences({ formData, onUpdate }) {
  const handleInputChange = (field, value) => {
    onUpdate({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-serif font-bold">Your preferences</h2>
        <p className="text-muted-foreground">Customize your CycleMind experience</p>
      </div>

      <div className="space-y-4">
        {/* Notification Time */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Daily reminder time</Label>
          <Input
            type="time"
            value={formData.notification_time || "09:00"}
            onChange={(e) => handleInputChange("notification_time", e.target.value)}
            className="h-12"
          />
          <p className="text-xs text-muted-foreground">When would you like your daily log reminder?</p>
        </div>

        {/* Unit System */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Measurement units</Label>
          <RadioGroup value={formData.unit_system || "imperial"} onValueChange={(v) => handleInputChange("unit_system", v)}>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50">
              <RadioGroupItem value="imperial" id="imperial" />
              <Label htmlFor="imperial" className="flex-1 text-sm cursor-pointer">Imperial (lbs, inches)</Label>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50">
              <RadioGroupItem value="metric" id="metric" />
              <Label htmlFor="metric" className="flex-1 text-sm cursor-pointer">Metric (kg, cm)</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Privacy & Consent */}
        <div className="space-y-3 bg-muted/40 p-4 rounded-xl">
          <Label className="text-sm font-semibold">Privacy & Reports</Label>
          <div className="flex items-start gap-3">
            <Checkbox
              id="consent-export"
              checked={formData.consent_export || false}
              onCheckedChange={(checked) => handleInputChange("consent_export", checked)}
              className="mt-1"
            />
            <Label htmlFor="consent-export" className="text-xs cursor-pointer leading-relaxed">
              Allow me to export my health data (PHQ-9, GAD-7, EPDS scores) as a PDF for my healthcare provider
            </Label>
          </div>
          <p className="text-[10px] text-muted-foreground italic">Your data is always private. You control what gets shared.</p>
        </div>
      </div>
    </div>
  );
}