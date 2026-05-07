import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

const SUGGESTED_MEDS = [
  "Antidepressants (SSRI/SNRI)",
  "Hormonal Birth Control",
  "HRT",
  "NSAIDs/Pain Relief",
  "Calcium/Vitamin B6",
  "Magnesium",
  "Vitamin D",
  "Melatonin",
  "Spironolactone",
  "Other Supplement",
];

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

  const customEntries = value.filter((m) => !SUGGESTED_MEDS.includes(m));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_MEDS.map((med) => (
          <button
            key={med}
            onClick={() => toggle(med)}
            className={`px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all active:scale-95 ${
              value.includes(med)
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {med}
          </button>
        ))}
      </div>

      {customEntries.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {customEntries.map((med) => (
            <span key={med} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-primary text-primary-foreground">
              {med}
              <button onClick={() => toggle(med)} className="hover:opacity-70"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="Add custom medication..."
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCustom()}
          className="h-10 text-sm"
        />
        <button
          onClick={addCustom}
          className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}