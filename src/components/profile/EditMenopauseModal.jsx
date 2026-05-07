import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

export default function EditMenopauseModal({ cycle, cycleType, onClose, onSuccess }) {
  const queryClient = useQueryClient();
  const [lmp, setLmp] = useState(cycle?.last_menstrual_period || "");
  const [hrtType, setHrtType] = useState(cycle?.hrt_type || "");
  const [hrtStartDate, setHrtStartDate] = useState(cycle?.hrt_start_date || "");

  const saveMutation = useMutation({
    mutationFn: async () => {
      const updates = {
        last_menstrual_period: lmp || undefined,
        hrt_type: hrtType || undefined,
        hrt_start_date: hrtStartDate || undefined,
      };
      await base44.entities.Cycle.update(cycle.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cycles"] });
      const modeLabel = cycleType === "perimenopause" ? "Perimenopause" : "Menopause";
      toast.success(`${modeLabel} details updated 🔥`);
      onSuccess?.();
      onClose();
    },
    onError: () => {
      toast.error("Failed to save details");
    },
  });

  const modeLabel = cycleType === "perimenopause" ? "Perimenopause" : "Menopause";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-background rounded-t-3xl border-t border-border shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold">Edit {modeLabel} Details</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Last Menstrual Period (for perimenopause tracking) */}
          {cycleType === "perimenopause" && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Last Menstrual Period</Label>
              <Input type="date" value={lmp} onChange={(e) => setLmp(e.target.value)} />
              <p className="text-[11px] text-muted-foreground">Date of your last period (optional)</p>
            </div>
          )}

          {/* HRT Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">HRT Type (Optional)</Label>
            <Input
              placeholder="e.g., Estrogen patch, Oral HRT, Tibolone, Progesterone gel..."
              value={hrtType}
              onChange={(e) => setHrtType(e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground">Your current hormone replacement therapy type</p>
          </div>

          {/* HRT Start Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">HRT Start Date (Optional)</Label>
            <Input type="date" value={hrtStartDate} onChange={(e) => setHrtStartDate(e.target.value)} />
            <p className="text-[11px] text-muted-foreground">When you started HRT</p>
          </div>

          {/* Info */}
          <div className="bg-muted/40 rounded-xl p-3 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Tracking Tips</p>
            <p className="text-xs text-muted-foreground">
              Log your hot flashes, night sweats, mood, and sleep patterns to see how your symptoms respond to HRT or lifestyle changes.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 pt-4 border-t border-border/40">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="flex-1 gap-2">
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}