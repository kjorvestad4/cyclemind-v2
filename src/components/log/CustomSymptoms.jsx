import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";

const SEVERITY_COLORS = ["", "bg-emerald-100 text-emerald-700", "bg-lime-100 text-lime-700", "bg-yellow-100 text-yellow-700", "bg-orange-100 text-orange-700", "bg-red-100 text-red-700", "bg-red-200 text-red-900"];

export default function CustomSymptoms({ value = [], onChange, pastSymptoms = [] }) {
  const [name, setName] = useState("");

  const add = (symptomName) => {
    const trimmed = (symptomName || name).trim();
    if (!trimmed) return;
    // Don't add if already in today's list
    if (value.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return;
    onChange([...value, { name: trimmed, severity: 1 }]);
    setName("");
  };

  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));

  const setSeverity = (i, sev) => {
    const updated = [...value];
    updated[i] = { ...updated[i], severity: sev };
    onChange(updated);
  };

  // Past symptoms not already added today
  const suggestions = pastSymptoms.filter(
    (p) => !value.some((s) => s.name.toLowerCase() === p.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Custom Symptoms</p>

      {/* Quick-add buttons from past entries */}
      {suggestions.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Recent — tap to add</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => add(s)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed border-primary/40 bg-primary/5 text-xs text-primary font-medium hover:bg-primary/10 transition-all"
              >
                <Plus className="w-3 h-3" /> {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active symptoms for today */}
      {value.map((sym, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-sm font-medium flex-1 truncate">{sym.name}</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <button
                key={s}
                onClick={() => setSeverity(i, s)}
                className={`w-7 h-7 rounded-lg text-xs font-bold border transition-all ${
                  sym.severity === s ? SEVERITY_COLORS[s] + " border-current" : "bg-muted border-transparent text-muted-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <button onClick={() => remove(i)} className="text-muted-foreground hover:text-destructive">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}

      {/* Manual entry */}
      <div className="flex gap-2">
        <Input
          placeholder="e.g. Back pain, brain fog..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          className="h-9 text-sm"
        />
        <button
          onClick={() => add()}
          className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}