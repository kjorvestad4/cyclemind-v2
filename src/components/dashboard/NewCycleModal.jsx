import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function NewCycleModal({ onClose }) {
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [cycleLength, setCycleLength] = useState(28);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!startDate) { toast.error("Please select a start date"); return; }
    setSaving(true);
    try {
      await base44.entities.Cycle.create({
        start_date: startDate,
        cycle_length: cycleLength || 28,
        cycle_type: "menstrual",
        last_menstrual_period: startDate,
      });
      toast.success("New cycle entry added!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save cycle. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-background rounded-t-3xl border-t border-border shadow-2xl p-5 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-semibold">Log New Period</h3>
            <p className="text-xs text-muted-foreground">Record the start of a new cycle</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Period Start Date</Label>
            <Input
              type="date"
              value={startDate}
              max={format(new Date(), "yyyy-MM-dd")}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Cycle Length (days)</Label>
            <Input
              type="number"
              min={20}
              max={60}
              value={cycleLength}
              onChange={(e) => setCycleLength(parseInt(e.target.value) || 28)}
              className="h-10"
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving || !startDate}
          className="w-full h-12 rounded-2xl font-semibold text-base gap-2"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
          Save Cycle Entry
        </Button>
      </div>
    </div>
  );
}