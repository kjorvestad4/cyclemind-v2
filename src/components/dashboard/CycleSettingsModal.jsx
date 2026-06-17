import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CycleSettingsModal({ latestCycle, user, onClose }) {
  const queryClient = useQueryClient();
  const [cycleLength, setCycleLength] = useState(latestCycle?.cycle_length || user?.cycle_length || 28);
  const [periodLength, setPeriodLength] = useState(user?.menstruation_length || 5);
  const [ovulationDay, setOvulationDay] = useState(user?.ovulation_day || Math.max(1, (latestCycle?.cycle_length || 28) - 14));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update user preferences
      await base44.auth.updateMe({
        cycle_length: cycleLength || 28,
        menstruation_length: periodLength || 5,
        ovulation_day: ovulationDay || 14,
      });
      // Also update the latest cycle record if it exists
      if (latestCycle?.id) {
        await base44.entities.Cycle.update(latestCycle.id, {
          cycle_length: cycleLength || 28,
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["cycles"] });
      toast.success("Cycle settings saved!");
      onClose();
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm bg-background rounded-2xl border border-border shadow-2xl p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-semibold">Cycle Settings</h3>
            <p className="text-xs text-muted-foreground">Adjust your cycle parameters</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Cycle Length (days)</Label>
            <Input
              type="number"
              min={20}
              max={60}
              value={cycleLength}
              onChange={(e) => {
                const v = parseInt(e.target.value) || 28;
                setCycleLength(v);
                setOvulationDay(Math.max(1, v - 14));
              }}
            />
            <p className="text-[11px] text-muted-foreground">Typical: 21–35 days</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Period Length (days)</Label>
            <Input
              type="number"
              min={1}
              max={14}
              value={periodLength}
              onChange={(e) => setPeriodLength(parseInt(e.target.value) || 5)}
            />
            <p className="text-[11px] text-muted-foreground">Typical: 3–7 days</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Ovulation Day</Label>
            <Input
              type="number"
              min={1}
              max={cycleLength - 1}
              value={ovulationDay}
              onChange={(e) => setOvulationDay(parseInt(e.target.value) || 14)}
            />
            <p className="text-[11px] text-muted-foreground">Usually cycle length minus 14 days</p>
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-border/40">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1 gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}