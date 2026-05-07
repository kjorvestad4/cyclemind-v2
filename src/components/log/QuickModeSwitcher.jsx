import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, Loader2, X } from "lucide-react";
import { calculateEDD, getPregnancyWeek } from "@/lib/eddCalculation";

const MODES = [
  { id: "menstrual", emoji: "🌙", label: "Menstrual / PMDD", color: "border-primary/40 bg-primary/5", activeColor: "border-primary bg-primary/10", fields: ["lmp", "cycle_length"] },
  { id: "pregnancy", emoji: "🤰", label: "Pregnancy", color: "border-pink-200 bg-pink-50/50 dark:border-pink-900 dark:bg-pink-950/20", activeColor: "border-pink-400 bg-pink-50 dark:border-pink-600 dark:bg-pink-950/40", fields: ["lmp", "ovulation"] },
  { id: "postpartum", emoji: "🍼", label: "Postpartum", color: "border-purple-200 bg-purple-50/50 dark:border-purple-900 dark:bg-purple-950/20", activeColor: "border-purple-400 bg-purple-50 dark:border-purple-600 dark:bg-purple-950/40", fields: ["birth_date"] },
  { id: "perimenopause", emoji: "🌊", label: "Perimenopause", color: "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20", activeColor: "border-amber-400 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/40", fields: ["lmp", "hrt_type"] },
  { id: "menopause", emoji: "🔥", label: "Menopause", color: "border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/20", activeColor: "border-orange-400 bg-orange-50 dark:border-orange-600 dark:bg-orange-950/40", fields: ["lmp", "hrt_type"] },
];

export default function QuickModeSwitcher({ currentCycleType, latestCycle, onClose }) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(currentCycleType || "menstrual");
  const [lmp, setLmp] = useState(latestCycle?.last_menstrual_period || "");
  const [ovulationDate, setOvulationDate] = useState(latestCycle?.ovulation_date || "");
  const [cycleLength, setCycleLength] = useState(latestCycle?.cycle_length || 28);
  const [birthDate, setBirthDate] = useState("");
  const [hrtType, setHrtType] = useState(latestCycle?.hrt_type || "");
  const [saving, setSaving] = useState(false);

  const selectedMode = MODES.find((m) => m.id === selected);

  // Live EDD calculation for pregnancy mode (ovulation priority)
  const pregnancyCalcs = useMemo(() => {
    if (selected !== "pregnancy") return null;
    if (!lmp && !ovulationDate) return null;
    
    const eddData = calculateEDD(ovulationDate, lmp);
    const baselineDate = ovulationDate || lmp;
    const week = getPregnancyWeek(baselineDate, new Date(format(new Date(), "yyyy-MM-dd")));
    const trimester = week <= 13 ? "First" : week <= 26 ? "Second" : "Third";
    return { eddData, week, trimester };
  }, [selected, lmp, ovulationDate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const isModeChange = selected !== currentCycleType;
      
      // Calculate EDD for pregnancy mode (ovulation priority)
      let eddData = null;
      let pregnancyWeek = undefined;
      if (selected === "pregnancy" && (lmp || ovulationDate)) {
        eddData = calculateEDD(ovulationDate, lmp);
        const baselineDate = ovulationDate || lmp;
        pregnancyWeek = getPregnancyWeek(baselineDate, new Date(today));
      }
      
      const cycleData = {
        start_date: selected === "menstrual" || selected === "perimenopause" ? (lmp || today) : (latestCycle?.start_date || today),
        cycle_type: selected,
        cycle_length: selected === "menstrual" ? cycleLength || 28 : undefined,
        last_menstrual_period: (selected === "pregnancy" || selected === "menopause" || selected === "perimenopause" || selected === "menstrual") ? lmp || null : undefined,
        ovulation_date: selected === "pregnancy" ? ovulationDate || undefined : undefined,
        estimated_due_date: selected === "pregnancy" ? eddData?.edd : undefined,
        pregnancy_week: selected === "pregnancy" ? pregnancyWeek : undefined,
        hrt_type: (selected === "perimenopause" || selected === "menopause") ? hrtType || undefined : undefined,
        is_pregnancy_mode: selected === "pregnancy" || selected === "postpartum",
        is_menopause_mode: selected === "menopause" || selected === "perimenopause",
      };
      if (latestCycle?.id) {
        await base44.entities.Cycle.update(latestCycle.id, cycleData);
      } else {
        await base44.entities.Cycle.create(cycleData);
      }
      queryClient.invalidateQueries({ queryKey: ["cycles"] });
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      
      if (isModeChange) {
        if (selected === "pregnancy" && eddData) {
          toast.success(`🤰 Switched to Pregnancy! EDD: ${format(new Date(eddData.edd), "MMM d, yyyy")}`);
        } else {
          toast.success(`Switched to ${selectedMode.label} 💜`);
        }
      } else {
        // Same mode update
        const lmpDisplay = lmp ? format(new Date(lmp), "MMM d, yyyy") : "(cleared)";
        toast.success(`Saved LMP: ${lmpDisplay} ✓`);
      }
      onClose();
    } catch {
      toast.error("Failed to update cycle. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleClearLmp = () => {
    setLmp("");
    toast.info("LMP cleared — ready to save");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-background rounded-t-3xl border-t border-border shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-semibold">Switch Tracking Mode</h3>
            <p className="text-xs text-muted-foreground">Choose your current life stage</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{mode.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{mode.label}</span>
                        {isCurrent && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-semibold">Active</span>}
                      </div>
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                  )}
                </div>

                {isActive && mode.fields.length > 0 && (
                  <div className="mt-2 space-y-1 border-t border-border/40 pt-2" onClick={(e) => e.stopPropagation()}>
                    {mode.fields.includes("lmp") && (
                      <div className="space-y-0.5">
                        <Label className="text-xs font-medium">Last Menstrual Period</Label>
                        <div className="flex items-center gap-1.5">
                          <Input type="date" value={lmp} onChange={(e) => setLmp(e.target.value)} className="h-8 text-sm bg-background max-w-[140px]" />
                          {lmp && (
                            <button
                              onClick={handleClearLmp}
                              className="h-8 px-2 rounded text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    {mode.fields.includes("ovulation") && (
                      <div className="space-y-0.5">
                        <Label className="text-xs font-medium">Ovulation Date (optional)</Label>
                        <Input type="date" value={ovulationDate} onChange={(e) => setOvulationDate(e.target.value)} className="h-8 text-sm bg-background max-w-[140px]" />
                        <p className="text-[10px] text-muted-foreground">Takes priority over LMP for EDD</p>
                      </div>
                    )}
                    {mode.fields.includes("cycle_length") && (
                       <div className="space-y-0.5">
                         <Label className="text-xs font-medium">Cycle Length (days)</Label>
                         <Input type="number" min={20} max={60} value={cycleLength} onChange={(e) => setCycleLength(parseInt(e.target.value) || 28)} className="h-8 text-sm bg-background" />
                       </div>
                     )}
                     {mode.fields.includes("birth_date") && (
                      <div className="space-y-0.5">
                        <Label className="text-xs font-medium">Birth / Delivery Date</Label>
                        <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="h-8 text-sm bg-background" />
                      </div>
                    )}
                    {mode.fields.includes("hrt_type") && (
                      <div className="space-y-0.5">
                        <Label className="text-xs font-medium">HRT Type (optional)</Label>
                        <Input placeholder="e.g. Estrogen patch…" value={hrtType} onChange={(e) => setHrtType(e.target.value)} className="h-8 text-sm bg-background" />
                      </div>
                    )}

                    {/* Live EDD Display for Pregnancy */}
                    {selected === "pregnancy" && pregnancyCalcs && (
                      <div className="mt-1.5 pt-1.5 border-t border-border/30 space-y-1">
                        <div className="text-xs font-medium text-foreground">Estimated Due Date</div>
                        <div className="bg-pink-50 dark:bg-pink-950/30 rounded-lg p-2 space-y-0.5">
                          <p className="text-sm font-bold text-pink-700 dark:text-pink-300">
                            {format(new Date(pregnancyCalcs.eddData.edd), "MMM d, yyyy")}
                          </p>
                          <p className="text-[11px] text-pink-600 dark:text-pink-400">
                            Week {pregnancyCalcs.week} · {pregnancyCalcs.trimester} trimester
                          </p>
                          <p className="text-[10px] text-pink-500">({pregnancyCalcs.eddData.method === "ovulation" ? "from ovulation" : "from LMP"})</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          {selected === currentCycleType && (
            <p className="text-xs text-muted-foreground text-center italic">You're already in this mode — updating fields below</p>
          )}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-12 rounded-2xl font-semibold text-base gap-2"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            {selected === currentCycleType ? `Update ${selectedMode?.label}` : `Switch to ${selectedMode?.label}`}
          </Button>
        </div>
      </div>
    </div>
  );
}