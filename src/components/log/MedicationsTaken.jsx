import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

const COMMON_MEDS = ["SSRI", "Birth Control", "Ibuprofen", "Magnesium", "Vitamin D", "Melatonin", "Antidepressant", "Spironolactone"];

export default function MedicationsTaken({ value = [], onChange }) {
  const [custom, setCustom] = useState("");

  const toggle = (med) => {
    if (value.includes(med)) {
      onChange(value.filter((m) => m !== med));
    } else {
      onChange([...value, med]);
    }
  };

  const addCustom = () => {
    const trimmed = custom.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setCustom("");
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Medications Taken Today</p>
      <div className="flex flex-wrap gap-2">
        {COMMON_MEDS.map((med) => (
          <button
            key={med}
            onClick={() => toggle(med)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              value.includes(med)
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {med}
          </button>
        ))}
      </div>
      {value.filter((m) => !COMMON_MEDS.includes(m)).map((med) => (
        <span key={med} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-primary text-primary-foreground mr-2">
          {med}
          <button onClick={() => toggle(med)}><X className="w-3 h-3" /></button>
        </span>
      ))}
      <div className="flex gap-2">
        <Input
          placeholder="Add medication..."
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCustom()}
          className="h-9 text-sm"
        />
        <button
          onClick={addCustom}
          className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}