import { useState } from "react";
import { differenceInDays, format } from "date-fns";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

export default function EditPostpartumModal({ cycle, onClose, onSuccess }) {
  const queryClient = useQueryClient();
  const [deliveryDate, setDeliveryDate] = useState(cycle?.start_date || "");
  const [notes, setNotes] = useState(cycle?.notes || "");

  const ppDay = deliveryDate ? Math.max(1, differenceInDays(new Date(), new Date(deliveryDate)) + 1) : null;

  const saveMutation = useMutation({
    mutationFn: async () => {
      const updates = {
        start_date: deliveryDate || undefined,
        notes: notes || undefined,
      };
      await base44.entities.Cycle.update(cycle.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cycles"] });
      toast.success("Postpartum details updated 🍼");
      onSuccess?.();
      onClose();
    },
    onError: () => {
      toast.error("Failed to save postpartum details");
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-background rounded-2xl border border-border shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold">Edit Postpartum Details</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Delivery Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Birth / Delivery Date</Label>
            <Input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
            <p className="text-[11px] text-muted-foreground">Date of birth or delivery</p>
          </div>

          {/* Postpartum Day Display */}
          {ppDay && (
            <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-3 border border-purple-200 dark:border-purple-800 space-y-1">
              <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase">Current Postpartum Status</p>
              <p className="text-lg font-bold text-purple-700 dark:text-purple-300">Day {ppDay}</p>
              <p className="text-[11px] text-purple-600 dark:text-purple-400">
                {ppDay <= 6 ? "Early postpartum (week 1)" : ppDay <= 42 ? "Postpartum recovery period" : "Extended postpartum"}
              </p>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Recovery & Wellness Notes</Label>
            <Textarea
              placeholder="Log your recovery progress, feeding method, sleep, mood, and any concerns..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {/* Info */}
          <div className="bg-muted/40 rounded-xl p-3 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Postpartum Tracking</p>
            <p className="text-xs text-muted-foreground">
              Your postpartum day is calculated from your delivery date. Daily entries help track your physical and emotional recovery during this critical period.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 pt-4 border-t border-border/40">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !deliveryDate} className="flex-1 gap-2">
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}