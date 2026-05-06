import { Droplets } from "lucide-react";

const FLOW_OPTIONS = [
  { value: "", label: "None", desc: "No bleeding" },
  { value: "L", label: "Light", desc: "Light / spotting" },
  { value: "M", label: "Medium", desc: "Medium flow" },
  { value: "H", label: "Heavy", desc: "Heavy flow" },
];

export default function MenstrualFlowPicker({ value, onChange }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Droplets className="w-4 h-4 text-accent-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Menstrual Flow</h3>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {FLOW_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value === value ? "" : opt.value)}
            className={`
              py-2.5 rounded-lg text-xs font-medium border transition-all text-center
              ${value === opt.value
                ? "bg-accent text-accent-foreground border-accent-foreground/20"
                : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
              }
            `}
          >
            <div className="font-semibold">{opt.label}</div>
            <div className="text-[9px] mt-0.5 opacity-70">{opt.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}