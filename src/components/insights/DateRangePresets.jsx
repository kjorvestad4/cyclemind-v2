import { format, subDays } from "date-fns";
import { Calendar, Clock, TrendingUp } from "lucide-react";

const PRESETS = [
  { label: "Last 30 days", days: 30 },
  { label: "Last 60 days", days: 60 },
  { label: "Last 90 days", days: 90 },
];

export default function DateRangePresets({ dateFrom, dateTo, onPresetChange, onClear }) {
  const hasFilter = dateFrom || dateTo;

  const handlePresetClick = (days) => {
    const to = format(new Date(), "yyyy-MM-dd");
    const from = format(subDays(new Date(), days), "yyyy-MM-dd");
    onPresetChange(from, to);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-primary/10">
      <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
      <span className="text-xs text-muted-foreground font-medium">Quick select:</span>
      
      {PRESETS.map((preset) => (
        <button
          key={preset.days}
          onClick={() => handlePresetClick(preset.days)}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
            hasFilter && dateFrom === format(subDays(new Date(), preset.days), "yyyy-MM-dd")
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card/50 border-border/50 text-muted-foreground hover:bg-muted/60"
          }`}
        >
          {preset.label}
        </button>
      ))}

      {hasFilter && (
        <>
          <span className="text-xs text-muted-foreground ml-2">or custom:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onPresetChange(e.target.value, dateTo)}
            className="h-7 px-2 text-xs rounded-lg border border-input bg-background text-foreground"
          />
          <span className="text-xs text-muted-foreground">→</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onPresetChange(dateFrom, e.target.value)}
            className="h-7 px-2 text-xs rounded-lg border border-input bg-background text-foreground"
          />
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 font-medium"
          >
            Clear
          </button>
          <span className="text-[10px] text-muted-foreground ml-auto bg-primary/10 px-2 py-0.5 rounded-full font-medium">
            Custom range active
          </span>
        </>
      )}
    </div>
  );
}