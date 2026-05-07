import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function Step2CycleSetup({
  selectedMode,
  formData,
  onUpdate,
}) {
  const handleInputChange = (field, value) => {
    onUpdate({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-serif font-bold">Cycle setup</h2>
        <p className="text-muted-foreground">Help us understand your cycle</p>
      </div>

      <div className="space-y-4">
        {/* LMP - for menstrual, perimenopause, pregnancy, menopause */}
        {["menstrual", "perimenopause", "pregnancy", "menopause"].includes(selectedMode) && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Last Menstrual Period (LMP)</Label>
            <Input
              type="date"
              value={formData.lmp || ""}
              onChange={(e) => handleInputChange("lmp", e.target.value)}
              className="h-12"
            />
            <p className="text-xs text-muted-foreground">This helps us track your cycle</p>
          </div>
        )}

        {/* Cycle Length - for menstrual, perimenopause */}
        {["menstrual", "perimenopause"].includes(selectedMode) && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Average Cycle Length (days)</Label>
            <Input
              type="number"
              min={20}
              max={60}
              value={formData.cycle_length || 28}
              onChange={(e) => handleInputChange("cycle_length", parseInt(e.target.value) || 28)}
              className="h-12"
            />
            <p className="text-xs text-muted-foreground">Usually 21-35 days</p>
          </div>
        )}

        {/* Ovulation Tracking Preference - for menstrual, perimenopause */}
        {["menstrual", "perimenopause"].includes(selectedMode) && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Track ovulation?</Label>
            <RadioGroup value={formData.track_ovulation || "yes"} onValueChange={(v) => handleInputChange("track_ovulation", v)}>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50">
                <RadioGroupItem value="yes" id="ov-yes" />
                <Label htmlFor="ov-yes" className="flex-1 text-sm cursor-pointer">Yes, track ovulation tests & timing</Label>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50">
                <RadioGroupItem value="no" id="ov-no" />
                <Label htmlFor="ov-no" className="flex-1 text-sm cursor-pointer">Skip ovulation tracking</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Ovulation Date - for pregnancy */}
        {selectedMode === "pregnancy" && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Ovulation date (optional)</Label>
            <Input
              type="date"
              value={formData.ovulation_date || ""}
              onChange={(e) => handleInputChange("ovulation_date", e.target.value)}
              className="h-12"
            />
            <p className="text-xs text-muted-foreground">If known, helps calculate due date more accurately</p>
          </div>
        )}

        {/* Birth Date - for postpartum */}
        {selectedMode === "postpartum" && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Baby's birth date</Label>
            <Input
              type="date"
              value={formData.birth_date || ""}
              onChange={(e) => handleInputChange("birth_date", e.target.value)}
              className="h-12"
            />
            <p className="text-xs text-muted-foreground">Helps track your postpartum recovery</p>
          </div>
        )}

        {/* HRT - for menopause, perimenopause */}
        {["menopause", "perimenopause"].includes(selectedMode) && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold">HRT type (optional)</Label>
            <Input
              placeholder="e.g., Estrogen patch, Oral combined HRT"
              value={formData.hrt_type || ""}
              onChange={(e) => handleInputChange("hrt_type", e.target.value)}
              className="h-12"
            />
            <p className="text-xs text-muted-foreground">Leave blank if not using HRT</p>
          </div>
        )}
      </div>
    </div>
  );
}