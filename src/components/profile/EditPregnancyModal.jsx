import { useState, useMemo } from "react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { calculateEDD, getPregnancyWeek } from "@/lib/eddCalculation";

export default function EditPregnancyModal({ cycle, onClose, onSuccess }) {
  const queryClient = useQueryClient();
  const [lmp, setLmp] = useState(cycle?.last_menstrual_period || "");
  const [ovulationDate, setOvulationDate] = useState(cycle?.ovulation_date || "");
  const [eddOverride, setEddOverride] = useState(cycle?.estimated_due_date || "");
  const [notes, setNotes] = useState(cycle?.notes || "");
  const [useManualEdd, setUseManualEdd] = useState(!!cycle?.estimated_due_date && !cycle?.last_menstrual_period && !cycle?.ovulation_date);

  // Live EDD calculation
  const pregnancyCalcs = useMemo(() => {
    if (!lmp && !ovulationDate) return null;
    const eddData = calculateEDD(ovulationDate, lmp);
    const baselineDate = ovulationDate || lmp;
    const week = getPregnancyWeek(baselineDate, new Date(format(new Date(), "yyyy-MM-dd")));
    const trimester = week <= 13 ? "First" : week <= 26 ? "Second" : "Third";
    return { eddData, week, trimester };
  }, [lmp, ovulationDate]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      let finalEdd = eddOverride;
      if (!useManualEdd && pregnancyCalcs) {
        finalEdd = pregnancyCalcs.eddData.edd;
      }

      const pregnancyWeek = pregnancyCalcs ? pregnancyCalcs.week : (cycle?.pregnancy_week || null);

      const updates = {
        last_menstrual_period: lmp || undefined,
        ovulation_date: ovulationDate || undefined,
        estimated_due_date: finalEdd || undefined,
        pregnancy_week: pregnancyWeek || undefined,
        notes: notes || undefined,
      };

      await base44.entities.Cycle.update(cycle.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cycles"] });
      toast.success("Pregnancy details updated 🤰");
      onSuccess?.();
      onClose();
    },
    onError: () => {
      toast.error("Failed to save pregnancy details");
    },
  });

  const handleClearLmp = () => {
    setLmp("");
    if (ovulationDate) {
      toast.success("LMP cleared — using ovulation date");
    }
  };

  const displayEdd = useManualEdd ? eddOverride : (pregnancyCalcs?.eddData.edd || "");
  const displayWeek = pregnancyCalcs?.week;
  const displayTrimester = pregnancyCalcs?.trimester;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-background rounded-t-3xl border-t border-border shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold">Edit Pregnancy Details</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* LMP */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Last Menstrual Period</Label>
            <div className="flex items-center gap-2">
              <Input type="date" value={lmp} onChange={(e) => setLmp(e.target.value)} className="flex-1" />
              {lmp && (
                <Button variant="outline" size="sm" onClick={handleClearLmp} className="px-3">
                  Clear
                </Button>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">Used to calculate: 280-day gestation</p>
          </div>

          {/* Ovulation Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Ovulation Date (Optional)</Label>
            <Input type="date" value={ovulationDate} onChange={(e) => setOvulationDate(e.target.value)} />
            <p className="text-[11px] text-muted-foreground">If known, takes priority for EDD: 266-day gestation</p>
          </div>

          {/* Live EDD Preview */}
          {pregnancyCalcs && (
            <div className="bg-pink-50 dark:bg-pink-950/30 rounded-xl p-3 border border-pink-200 dark:border-pink-900 space-y-1.5">
              <p className="text-xs font-semibold text-pink-700 dark:text-pink-400 uppercase">Live EDD Preview</p>
              <p className="text-xl font-bold text-pink-700 dark:text-pink-300">{format(new Date(displayEdd), "MMM d, yyyy")}</p>
              <p className="text-xs text-pink-600 dark:text-pink-400">
                Week {displayWeek} · {displayTrimester} trimester · {pregnancyCalcs.eddData.method === "ovulation" ? "from ovulation" : "from LMP"}
              </p>
            </div>
          )}

          {/* Manual EDD Override */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="manualEdd"
                checked={useManualEdd}
                onChange={(e) => setUseManualEdd(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <Label htmlFor="manualEdd" className="text-sm font-medium cursor-pointer">
                Override with manual EDD
              </Label>
            </div>
            {useManualEdd && (
              <Input type="date" value={eddOverride} onChange={(e) => setEddOverride(e.target.value)} placeholder="Select manual EDD" />
            )}
            {!useManualEdd && (
              <p className="text-[11px] text-muted-foreground italic">EDD is auto-calculated from LMP or ovulation date</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Pregnancy Notes</Label>
            <Textarea
              placeholder="Any additional notes about your pregnancy (e.g., multiple pregnancy, ART, concerns)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 pt-4 border-t border-border/40">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || (!lmp && !ovulationDate)}
            className="flex-1 gap-2"
          >
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}