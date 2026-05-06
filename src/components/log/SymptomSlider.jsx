import { SEVERITY_LABELS, SEVERITY_COLORS } from "@/lib/symptoms";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function SymptomSlider({ symptom, value, onChange }) {
  return (
    <div className="space-y-2 py-3">
      <div className="flex items-start gap-2">
        <p className="text-sm text-foreground leading-snug flex-1">{symptom.label}</p>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5">
                <Info className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-[200px]">
              <p className="text-xs">Rate 1–6: 1 = not at all, 6 = extreme</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5, 6].map((score) => (
          <button
            key={score}
            onClick={() => onChange(symptom.key, score === value ? 0 : score)}
            className={`
              flex-1 py-2 rounded-lg text-xs font-semibold border transition-all flex flex-col items-center gap-0.5
              ${value === score
                ? SEVERITY_COLORS[score]
                : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
              }
            `}
          >
            <span>{score}</span>
            <span className="text-[8px] font-normal leading-tight text-center">{SEVERITY_LABELS[score]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}