import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";

const SEVERITY_COLORS = ["", "bg-emerald-100 text-emerald-700", "bg-lime-100 text-lime-700", "bg-yellow-100 text-yellow-700", "bg-orange-100 text-orange-700", "bg-red-100 text-red-700", "bg-red-200 text-red-900"];

export default function CustomSymptoms({ value = [], onChange }) {
  const [name, setName] = useState("");

  const add = () => {
    const trimmed = name.trim();
    if (trimmed) {
      onChange([...value, { name: trimmed, severity: 1 }]);
      setName("");
    }
  };

  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));

  const setSeverity = (i, sev) => {
    const updated = [...value];
    updated[i] = { ...updated[i], severity: sev };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Custom Symptoms</p>
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
      <div className="flex gap-2">
        <Input
          placeholder="e.g. Back pain, brain fog..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          className="h-9 text-sm"
        />
        <button
          onClick={add}
          className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}