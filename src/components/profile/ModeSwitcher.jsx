import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";

const MODES = [
  {
    id: "menstrual",
    emoji: "🌙",
    label: "Menstrual / PMDD",
    description: "Track your cycle, DRSP symptoms, and PMS/PMDD patterns across phases.",
    color: "border-primary/40 bg-primary/5",
    activeColor: "border-primary bg-primary/10",
    fields: [],
  },
  {
    id: "pregnancy",
    emoji: "🤰",
    label: "Pregnancy",
    description: "Pregnancy-specific symptoms, fetal movement, trimester info and prenatal mood.",
    color: "border-pink-200 bg-pink-50/50 dark:border-pink-900 dark:bg-pink-950/20",
    activeColor: "border-pink-400 bg-pink-50 dark:border-pink-600 dark:bg-pink-950/40",
    fields: ["lmp", "edd"],
  },
  {
    id: "postpartum",
    emoji: "🍼",
    label: "Postpartum",
    description: "Track recovery, mood, and postpartum wellbeing after birth.",
    color: "border-purple-200 bg-purple-50/50 dark:border-purple-900 dark:bg-purple-950/20",
    activeColor: "border-purple-400 bg-purple-50 dark:border-purple-600 dark:bg-purple-950/40",
    fields: ["birth_date"],
  },
  {
    id: "perimenopause",
    emoji: "🌡️",
    label: "Perimenopause",
    description: "Irregular cycles, hormone fluctuations, hot flashes and mood changes.",
    color: "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20",
    activeColor: "border-amber-400 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/40",
    fields: ["hrt_type"],
  },
  {
    id: "menopause",
    emoji: "☀️",
    label: "Menopause",
    description: "Post-menopausal symptom tracking, HRT monitoring and sleep/mood logs.",
    color: "border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/20",
    activeColor: "border-orange-400 bg-orange-50 dark:border-orange-600 dark:bg-orange-950/40",
    fields: ["hrt_type", "hrt_start_date"],
  },
];

export default function ModeSwitcher({ currentCycleType, latestCycle }) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(currentCycleType || "menstrual");
  const [lmp, setLmp] = useState(latestCycle?.last_menstrual_period || "");
  const [edd, setEdd] = useState(latestCycle?.estimated_due_date || "");
  const [birthDate, setBirthDate] = useState("");
  const [hrtType, setHrtType] = useState(latestCycle?.hrt_type || "");
  const [hrtStartDate, setHrtStartDate] = useState(latestCycle?.hrt_start_date || "");
  const [saving, setSaving] = useState(false);

  const selectedMode = MODES.find((m) => m.id === selected);

  const handleSave = async () => {
    setSaving(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");

      // Build cycle payload
      const cycleData = {
        start_date: latestCycle?.start_date || today,
        cycle_type: selected,
        last_menstrual_period: selected === "pregnancy" ? lmp || undefined : undefined,
        estimated_due_date: selected === "pregnancy" ? edd || undefined : undefined,
        hrt_type: (selected === "perimenopause" || selected === "menopause") ? hrtType || undefined : undefined,
        hrt_start_date: selected === "menopause" ? hrtStartDate || undefined : undefined,
        // legacy flags
        is_pregnancy_mode: selected === "pregnancy" || selected === "postpartum",
        is_menopause_mode: selected === "menopause" || selected === "perimenopause",
      };

      if (latestCycle?.id) {
        await base44.entities.Cycle.update(latestCycle.id, cycleData);
      } else {
        await base44.entities.Cycle.create(cycleData);
      }

      queryClient.invalidateQueries({ queryKey: ["cycles"] });
      toast.success(`Switched to ${selectedMode.label} mode 💜`);
    } catch (e) {
      toast.error("Failed to save mode. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Select the mode that matches your current life stage. You can change this anytime.</p>

      <div className="grid grid-cols-1 gap-3">
        {MODES.map((mode) => {
          const isActive = selected === mode.id;
          const isCurrent = currentCycleType === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setSelected(mode.id)}
              className={`w-full text-left rounded-2xl border-2 p-4 transition-all active:scale-[0.99] ${
                isActive ? mode.activeColor : mode.color + " hover:opacity-80"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl leading-none mt-0.5">{mode.emoji}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{mode.label}</span>
                      {isCurrent && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-semibold">Active</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{mode.description}</p>
                  </div>
                </div>
                {isActive && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </div>

              {/* Extra fields shown inline when selected */}
              {isActive && mode.fields.length > 0 && (
                <div className="mt-4 space-y-3 border-t border-border/40 pt-3" onClick={(e) => e.stopPropagation()}>
                  {mode.fields.includes("lmp") && (
                    <div className="space-y-1">
                      <Label className="text-xs">Last Menstrual Period (LMP)</Label>
                      <Input type="date" value={lmp} onChange={(e) => setLmp(e.target.value)} className="h-9 bg-background" />
                      <p className="text-[10px] text-muted-foreground">Used to calculate gestational age & due date</p>
                    </div>
                  )}
                  {mode.fields.includes("edd") && (
                    <div className="space-y-1">
                      <Label className="text-xs">Estimated Due Date (EDD)</Label>
                      <Input type="date" value={edd} onChange={(e) => setEdd(e.target.value)} className="h-9 bg-background" />
                    </div>
                  )}
                  {mode.fields.includes("birth_date") && (
                    <div className="space-y-1">
                      <Label className="text-xs">Birth / Delivery Date</Label>
                      <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="h-9 bg-background" />
                    </div>
                  )}
                  {mode.fields.includes("hrt_type") && (
                    <div className="space-y-1">
                      <Label className="text-xs">HRT Type (optional)</Label>
                      <Input
                        placeholder="e.g. Estrogen patch, Oral combined HRT…"
                        value={hrtType}
                        onChange={(e) => setHrtType(e.target.value)}
                        className="h-9 bg-background"
                      />
                    </div>
                  )}
                  {mode.fields.includes("hrt_start_date") && (
                    <div className="space-y-1">
                      <Label className="text-xs">HRT Start Date (optional)</Label>
                      <Input type="date" value={hrtStartDate} onChange={(e) => setHrtStartDate(e.target.value)} className="h-9 bg-background" />
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <Button
        onClick={handleSave}
        disabled={saving || selected === currentCycleType}
        className="w-full h-12 rounded-2xl font-semibold text-base gap-2"
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
        {selected === currentCycleType ? "Current Mode" : `Switch to ${selectedMode?.label}`}
      </Button>
    </div>
  );
}