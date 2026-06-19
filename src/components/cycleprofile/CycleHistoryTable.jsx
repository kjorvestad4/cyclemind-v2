import { format } from "date-fns";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Cycle History Table — list of past cycles with edit/omit toggle.
 * "Exclude from averages" toggle per cycle.
 */
export default function CycleHistoryTable({ cycles, onToggleExclude, excludedIds }) {
  if (!cycles || cycles.length === 0) {
    return (
      <div className="text-center py-8 space-y-2">
        <p className="text-sm text-muted-foreground">No cycles logged yet.</p>
        <p className="text-[11px] text-muted-foreground">Log your first cycle from the Dashboard to see it here.</p>
      </div>
    );
  }

  const sorted = [...cycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-muted-foreground">{sorted.length} cycles recorded</p>
        <p className="text-[10px] text-muted-foreground">Toggle eye to exclude from averages</p>
      </div>
      <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
        {sorted.map((cycle) => {
          const excluded = excludedIds.includes(cycle.id);
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
            </div>
          );
        })}
      </div>
    </div>
  );
}