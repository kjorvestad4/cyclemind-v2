import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar, Heart } from "lucide-react";
import { calculateEDD, getPregnancyWeek } from "@/lib/eddCalculation";
import { format } from "date-fns";

const MODE_SETUP = {
  menstrual: {
    title: "Track your menstrual cycle",
    subtitle: "Help us understand your pattern",
    fields: ["lmp", "cycle_length", "track_ovulation"],
  },
  pregnancy: {
    title: "Support your pregnancy",
    subtitle: "Let's calculate your due date",
    fields: ["lmp", "ovulation"],
  },
  postpartum: {
    title: "Track your postpartum recovery",
    subtitle: "When was baby born?",
    fields: ["birth_date"],
  },
  perimenopause: {
    title: "Navigate perimenopause",
    subtitle: "Track your hormonal changes",
    fields: ["lmp", "hrt_type"],
  },
  menopause: {
    title: "Manage your menopause",
    subtitle: "Optional: track HRT",
    fields: ["lmp", "hrt_type"],
  },
};

export default function Step2CycleSetup({ selectedMode, formData, onUpdate }) {
  const config = MODE_SETUP[selectedMode];
  
  const handleInputChange = (field, value) => {
    onUpdate({ ...formData, [field]: value });
  };

  // Live EDD calculation for pregnancy mode
  const pregnancyPreview = useMemo(() => {
    if (selectedMode !== "pregnancy") return null;
    if (!formData.lmp && !formData.ovulation_date) return null;
    const eddData = calculateEDD(formData.ovulation_date ? new Date(formData.ovulation_date) : undefined, formData.lmp);
    const week = getPregnancyWeek(formData.ovulation_date || formData.lmp, new Date(format(new Date(), "yyyy-MM-dd")));
    const trimester = week <= 12 ? "first" : week <= 27 ? "second" : "third";
    return { edd: eddData.edd, week, trimester, method: eddData.method };
  }, [selectedMode, formData.lmp, formData.ovulation_date]);

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-serif font-bold">{config.title}</h2>
        <p className="text-sm text-muted-foreground">{config.subtitle}</p>
      </div>

      <div className="space-y-4 flex-1">
        {/* LMP */}
        {config.fields.includes("lmp") && (
          <div className="space-y-2.5">
            <Label className="text-sm font-semibold">Last Menstrual Period (LMP)</Label>
            <Input
              type="date"
              value={formData.lmp || ""}
              onChange={(e) => handleInputChange("lmp", e.target.value)}
              className="h-12 text-base"
            />
            <p className="text-xs text-muted-foreground">
              {selectedMode === "pregnancy" ? "Helps calculate your due date accurately" : "This helps us track your cycle"}
            </p>
          </div>
        )}

        {/* Cycle Length */}
        {config.fields.includes("cycle_length") && (
          <div className="space-y-2.5">
            <Label className="text-sm font-semibold">Average Cycle Length (days)</Label>
            <Input
              type="number"
              min={20}
              max={60}
              value={formData.cycle_length || 28}
              onChange={(e) => handleInputChange("cycle_length", parseInt(e.target.value) || 28)}
              className="h-12 text-base"
            />
            <p className="text-xs text-muted-foreground">Usually 21–35 days. It's okay if it varies.</p>
          </div>
        )}

        {/* Ovulation Tracking Preference */}
        {config.fields.includes("track_ovulation") && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Track ovulation?</Label>
            <RadioGroup value={formData.track_ovulation || "yes"} onValueChange={(v) => handleInputChange("track_ovulation", v)}>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="yes" id="ov-yes" />
                <Label htmlFor="ov-yes" className="flex-1 text-sm cursor-pointer font-medium">Yes, I'll track ovulation tests</Label>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="no" id="ov-no" />
                <Label htmlFor="ov-no" className="flex-1 text-sm cursor-pointer font-medium">Skip ovulation tracking</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Ovulation Date - for pregnancy */}
        {config.fields.includes("ovulation") && (
          <div className="space-y-2.5">
            <Label className="text-sm font-semibold">Ovulation date (optional)</Label>
            <Input
              type="date"
              value={formData.ovulation_date || ""}
              onChange={(e) => handleInputChange("ovulation_date", e.target.value)}
              className="h-12 text-base"
            />
            <p className="text-xs text-muted-foreground">If known, gives a more precise due date</p>
          </div>
        )}

        {/* Birth Date - postpartum */}
        {config.fields.includes("birth_date") && (
          <div className="space-y-2.5">
            <Label className="text-sm font-semibold">Baby's birth date</Label>
            <Input
              type="date"
              value={formData.birth_date || ""}
              onChange={(e) => handleInputChange("birth_date", e.target.value)}
              className="h-12 text-base"
            />
            <p className="text-xs text-muted-foreground">Helps track your postpartum recovery timeline</p>
          </div>
        )}

        {/* HRT - menopause/perimenopause */}
        {config.fields.includes("hrt_type") && (
          <div className="space-y-2.5">
            <Label className="text-sm font-semibold">HRT type (optional)</Label>
            <Input
              placeholder="e.g., Estrogen patch, Oral combined HRT"
              value={formData.hrt_type || ""}
              onChange={(e) => handleInputChange("hrt_type", e.target.value)}
              className="h-12 text-base"
            />
            <p className="text-xs text-muted-foreground">Leave blank if not using HRT — we'll track symptoms either way</p>
          </div>
        )}

        {/* Live EDD Preview for Pregnancy */}
        {pregnancyPreview && (
          <div className="rounded-2xl border-2 border-pink-200 dark:border-pink-800 bg-pink-50 dark:bg-pink-950/30 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-pink-600 dark:text-pink-300" />
              <p className="text-xs font-semibold text-pink-700 dark:text-pink-300">ESTIMATED DUE DATE</p>
            </div>
            <p className="text-lg font-bold text-pink-700 dark:text-pink-200">{format(new Date(pregnancyPreview.edd), "MMMM d, yyyy")}</p>
            <p className="text-xs text-pink-600 dark:text-pink-400">
              Week {pregnancyPreview.week} · {pregnancyPreview.trimester.charAt(0).toUpperCase() + pregnancyPreview.trimester.slice(1)} trimester
            </p>
            <p className="text-[10px] text-pink-500 italic">({pregnancyPreview.method === "ovulation" ? "from ovulation" : "from LMP"})</p>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center italic">Why we ask: Accurate dates help us track your health and flag important milestones.</p>
    </div>
  );
}