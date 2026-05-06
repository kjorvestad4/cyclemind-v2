import { useState } from "react";
import { ChevronDown } from "lucide-react";
import SymptomSlider from "./SymptomSlider";

export default function SymptomCategory({ category, scores, onChange }) {
  const [open, setOpen] = useState(true);
  const filled = category.symptoms.filter((s) => scores[s.key] > 0).length;
  const total = category.symptoms.length;

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">{category.label}</h3>
          <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-2 py-0.5">
            {filled}/{total}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-3 divide-y divide-border/40">
          {category.symptoms.map((symptom) => (
            <SymptomSlider
              key={symptom.key}
              symptom={symptom}
              value={scores[symptom.key] || 0}
              onChange={onChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}