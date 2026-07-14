import { useState } from "react";
import { format } from "date-fns";
import { Eye, EyeOff, Pencil, Check, X, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Cycle History Table — list of past cycles with edit/omit toggle.
 * "Exclude from averages" toggle per cycle.
 * Inline editing of start date, cycle length, and notes.
 */
export default function CycleHistoryTable({ cycles, onToggleExclude, excludedIds }) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  if (!cycles || cycles.length === 0) {
    return (
      <div className="text-center py-8 space-y-2">
        <p className="text-sm text-muted-foreground">No cycles logged yet.</p>
        <p className="text-[11px] text-muted-foreground">Log your first cycle from the Dashboard to see it here.</p>
      </div>
    );
  }

  const sorted = [...cycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

  const handleEdit = (cycle) => {
    setEditingId(cycle.id);
    setEditValues({
      start_date: cycle.start_date || "",
      cycle_length: cycle.cycle_length || "",
      notes: cycle.notes || "",
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleSave = async (cycleId) => {
    setSaving(true);
    try {
      const updates = {
        start_date: editValues.start_date || undefined,
        cycle_length: editValues.cycle_length ? parseInt(editValues.cycle_length) : undefined,
        notes: editValues.notes || undefined,
      };
      await base44.entities.Cycle.update(cycleId, updates);
      await queryClient.invalidateQueries({ queryKey: ["cycles"] });
      toast.success("Cycle updated");
      setEditingId(null);
      setEditValues({});
    } catch (err) {
      toast.error("Failed to update cycle");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cycle) => {
    setDeletingId(null);
    const snapshot = {
      cycle_type: cycle.cycle_type || "menstrual",
      start_date: cycle.start_date,
      cycle_length: cycle.cycle_length,
      end_date: cycle.end_date || undefined,
      notes: cycle.notes || undefined,
      last_menstrual_period: cycle.last_menstrual_period || undefined,
      estimated_due_date: cycle.estimated_due_date || undefined,
    };
    try {
      await base44.entities.Cycle.delete(cycle.id);
      await queryClient.invalidateQueries({ queryKey: ["cycles"] });
      toast.success("Cycle deleted", {
        duration: 6000,
        action: {
          label: "Undo",
          onClick: async () => {
            try {
              await base44.entities.Cycle.create(snapshot);
              await queryClient.invalidateQueries({ queryKey: ["cycles"] });
              toast.success("Cycle restored");
            } catch {
              toast.error("Could not restore cycle");
            }
          },
        },
      });
    } catch {
      toast.error("Failed to delete cycle");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-muted-foreground">{sorted.length} cycles recorded</p>
        <p className="text-[10px] text-muted-foreground">Toggle eye to exclude · Click ✏️ to edit</p>
      </div>
      <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1">
        {sorted.map((cycle) => {
          const excluded = excludedIds.includes(cycle.id);
          const isEditing = editingId === cycle.id;

          if (isEditing) {
            return (
              <div
                key={cycle.id}
                className="p-3 rounded-xl border-2 border-primary bg-card space-y-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">Editing cycle</p>
                  <button
                    onClick={handleCancel}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                    title="Cancel (revert changes)"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div>
                    <Label className="text-xs font-medium">Start Date</Label>
                    <Input
                      type="date"
                      value={editValues.start_date}
                      onChange={(e) => setEditValues(prev => ({ ...prev, start_date: e.target.value }))}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Cycle Length (days)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={60}
                      value={editValues.cycle_length}
                      onChange={(e) => setEditValues(prev => ({ ...prev, cycle_length: e.target.value }))}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Notes</Label>
                    <Textarea
                      value={editValues.notes}
                      onChange={(e) => setEditValues(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Add notes..."
                      className="min-h-[60px] text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    className="flex-1"
                    disabled={saving}
                  >
                    Revert
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSave(cycle.id)}
                    disabled={saving}
                    className="flex-1 gap-1.5"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Save
                  </Button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={cycle.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${excluded ? "border-border/30 bg-muted/20 opacity-60" : "border-border/50 bg-card"}`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggleExclude(cycle.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                  title={excluded ? "Include in averages" : "Exclude from averages"}
                >
                  {excluded
                    ? <EyeOff className="w-4 h-4 text-muted-foreground" />
                    : <Eye className="w-4 h-4 text-primary" />}
                </button>
                <div>
                  <p className="text-sm font-medium text-foreground">{format(new Date(cycle.start_date), "MMM d, yyyy")}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {(cycle.cycle_type || "menstrual")} · {cycle.cycle_length ? `${cycle.cycle_length}d` : "length unknown"}
                    {excluded && " · excluded"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEdit(cycle)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                  title="Edit cycle details"
                >
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                {deletingId === cycle.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(cycle)}
                      className="px-2 h-7 rounded-lg bg-destructive text-destructive-foreground text-[10px] font-semibold hover:bg-destructive/90 transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setDeletingId(null)}
                      className="px-2 h-7 rounded-lg bg-muted text-muted-foreground text-[10px] font-semibold hover:bg-muted/80 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeletingId(cycle.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-destructive/10 transition-colors"
                    title="Delete cycle"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}