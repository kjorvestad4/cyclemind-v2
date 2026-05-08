import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import LMPPicker from "@/components/common/LMPPicker";

export default function EditMenstrualModal({ cycle, onClose, onSuccess }) {
  const queryClient = useQueryClient();
  const [lmp, setLmp] = useState(cycle?.last_menstrual_period || "");
  const [cycleLength, setCycleLength] = useState(cycle?.cycle_length || 28);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const updates = {
        last_menstrual_period: lmp || undefined,
        cycle_length: cycleLength || 28,
      };
      await base44.entities.Cycle.update(cycle.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cycles"] });
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      toast.success("Cycle details updated successfully");
      onSuccess?.();
      onClose();
    },
    onError: () => {
      toast.error("Failed to save cycle details");
    },
  });

  const handleClearLmp = () => {
    setLmp("");
    toast.info("LMP cleared");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-background rounded-t-3xl border-t border-border shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold">Edit Cycle Details</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* LMP */}
          <div>
            <LMPPicker value={lmp} onChange={setLmp} />
            <p className="text-[11px] text-muted-foreground mt-2">First day of your menstrual period</p>
          </div>

          {/* Cycle Length */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Cycle Length (days)</Label>
            <Input
              type="number"
              min={20}
              max={60}
              value={cycleLength}
              onChange={(e) => setCycleLength(parseInt(e.target.value) || 28)}
            />
            <p className="text-[11px] text-muted-foreground">Typical cycle length in days (e.g., 28, 30, 35)</p>
          </div>

          {/* Info */}
          <div className="bg-muted/40 rounded-xl p-3 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase">How this works</p>
            <p className="text-xs text-muted-foreground">
              Your current cycle day, phase, and patterns are calculated from your LMP and cycle length. Update these to track your menstrual cycle accurately.
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