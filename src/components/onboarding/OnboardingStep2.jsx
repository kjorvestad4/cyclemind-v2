import { useMemo } from "react";
import { format, subYears, addDays } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateEDD, getPregnancyWeek } from "@/lib/eddCalculation";

export default function OnboardingStep2({
  selectedMode,
  lmp,
  setLmp,
  ovulationDate,
  setOvulationDate,
  birthDate,
  setBirthDate,
  cycleLength,
  setCycleLength,
  hrtType,
  setHrtType,
  dateOfBirth,
  setDateOfBirth,
  onNext,
}) {
  // Live pregnancy calculations
  const pregnancyCalcs = useMemo(() => {
    if (selectedMode !== "pregnancy") return null;
    if (!lmp && !ovulationDate) return null;
    const eddData = calculateEDD(ovulationDate, lmp);
    const week = getPregnancyWeek(ovulationDate || lmp, new Date());
    return { eddData, week };
  }, [selectedMode, lmp, ovulationDate]);

  const getModeTitle = () => {
    const titles = {
      menstrual: "Track Your Cycle",
      pregnancy: "Your Pregnancy",
      postpartum: "Your Recovery",
      perimenopause: "Your Transition",
      menopause: "Your Menopause",
    };
    return titles[selectedMode];
  };

  const getModeDescription = () => {
    const descriptions = {
      menstrual: "Help us understand your cycle better",
      pregnancy: "We'll calculate your due date and track your weeks",
      postpartum: "So we can support your recovery",
      perimenopause: "To personalize your experience",
      menopause: "To track your HRT and symptoms",
    };
    return descriptions[selectedMode];
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 space-y-6 text-center max-w-md mx-auto">
      <div className="space-y-2">
        <h2 className="font-serif text-2xl font-semibold text-foreground">
          {getModeTitle()}
        </h2>
        <p className="text-sm text-muted-foreground">{getModeDescription()}</p>
      </div>

      <div className="w-full space-y-4">
        {/* Menstrual / Perimenopause / Pregnancy: LMP */}
        {["menstrual", "perimenopause", "pregnancy"].includes(selectedMode) && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Last Menstrual Period</Label>
            <Input
              type="date"
              min={format(subYears(new Date(), 5), "yyyy-MM-dd")}
              max={format(addDays(new Date(), 30), "yyyy-MM-dd")}
              value={lmp || ""}
              onChange={(e) => setLmp(e.target.value)}
              className="h-10 text-base"
            />
            <p className="text-xs text-muted-foreground italic">
              ℹ️ We use this to calculate your cycle phase and pregnancy week
            </p>
          </div>
        )}

        {/* Pregnancy: Ovulation */}
        {selectedMode === "pregnancy" && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Ovulation Date (optional)</Label>
            <Input
              type="date"
              value={ovulationDate || ""}
              onChange={(e) => setOvulationDate(e.target.value)}
              className="h-10 text-base"
            />
            <p className="text-xs text-muted-foreground italic">
              💡 More accurate for due date if you know it
            </p>
          </div>
        )}

        {/* Pregnancy: Live EDD Preview */}
        {selectedMode === "pregnancy" && pregnancyCalcs && (
          <div className="bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-800 rounded-xl p-4 space-y-2">
            <div className="text-sm">
              <p className="font-semibold text-pink-700 dark:text-pink-300">
                Estimated Due Date
              </p>
              <p className="text-lg font-bold text-pink-700 dark:text-pink-200">
                {format(new Date(pregnancyCalcs.eddData.edd), "MMMM d, yyyy")}
              </p>
              <p className="text-xs text-pink-600 dark:text-pink-400 mt-1">
                Week {pregnancyCalcs.week} of pregnancy
              </p>
            </div>
          </div>
        )}

        {/* Menstrual / Perimenopause: Cycle Length */}
        {["menstrual", "perimenopause"].includes(selectedMode) && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Average Cycle Length (days)</Label>
            <Input
              type="number"
              min={20}
              max={60}
              value={cycleLength}
              onChange={(e) => setCycleLength(parseInt(e.target.value) || 28)}
              className="h-10 text-base"
            />
            <p className="text-xs text-muted-foreground italic">
              ℹ️ Most people have a 28-day cycle, but 21–35 days is normal
            </p>
          </div>
        )}

        {/* Postpartum: Birth Date */}
        {selectedMode === "postpartum" && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Birth / Delivery Date</Label>
            <Input
              type="date"
              value={birthDate || ""}
              onChange={(e) => setBirthDate(e.target.value)}
              className="h-10 text-base"
            />
            <p className="text-xs text-muted-foreground italic">
              ℹ️ We'll track your postpartum recovery from this date
            </p>
          </div>
        )}

        {/* Perimenopause / Menopause: HRT Type */}
        {["perimenopause", "menopause"].includes(selectedMode) && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold">HRT Type (optional)</Label>
            <Input
              placeholder="e.g. Estrogen patch, Oral combined HRT…"
              value={hrtType}
              onChange={(e) => setHrtType(e.target.value)}
              className="h-10 text-base"
            />
            <p className="text-xs text-muted-foreground italic">
              💡 Helps us tailor symptom tracking to your treatment
            </p>
          </div>
        )}

        {/* Date of Birth — shared across all modes */}
        <div className="space-y-2 pt-2 border-t border-border/40">
          <Label className="text-sm font-semibold">
            🎂 Date of Birth <span className="text-muted-foreground font-normal">(helps us give better insights)</span>
          </Label>
          <Input
            type="text"
            placeholder="MM/DD/YYYY"
            maxLength={10}
            className="h-10 text-base"
            value={dateOfBirth ? format(new Date(dateOfBirth + "T00:00:00"), "MM/dd/yyyy") : ""}
            onChange={(e) => {
              const val = e.target.value.replace(/[^\d/]/g, "");
              let formatted = val.replace(/\//g, "");
              if (formatted.length > 2) formatted = formatted.slice(0,2) + "/" + formatted.slice(2);
              if (formatted.length > 5) formatted = formatted.slice(0,5) + "/" + formatted.slice(5,9);
              e.target.value = formatted;
              const parts = formatted.split("/");
              if (parts.length === 3 && parts[2].length === 4) {
                const d = new Date(`${parts[2]}-${parts[0].padStart(2,"0")}-${parts[1].padStart(2,"0")}`);
                if (!isNaN(d)) setDateOfBirth(format(d, "yyyy-MM-dd"));
              } else if (formatted === "") {
                setDateOfBirth("");
              }
            }}
          />
          <p className="text-xs text-muted-foreground italic">
            Optional — used to calculate your age and show age-appropriate tips
          </p>
        </div>
      </div>
    </div>
  );
}