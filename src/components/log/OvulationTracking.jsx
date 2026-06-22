import { useState } from "react";
import { Droplet, Calendar, ChevronDown, ChevronUp, Zap, Thermometer, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TEST_OPTIONS = [
  { value: "", label: "Not tested" },
  { value: "Negative", label: "Negative", emoji: "⚪" },
  { value: "Positive", label: "Positive (LH+)", emoji: "🔵" },
  { value: "LH Surge", label: "LH Surge Detected", emoji: "🔴" },
];

const MUCUS_OPTIONS = [
  "Dry or none",
  "Sticky / tacky",
  "Creamy / lotion-like",
  "Egg-white (fertile window)",
  "Watery",
];

export default function OvulationTracking({
  ovulationTest = "",
  ovulationDate = "",
  cervicalMucus = "",
  onChange,
  trackOvulationOpk = false,
  trackOvulationMucus = false,
  trackOvulationPain = false,
  addMarkOvulationButton = false,
  painScore = 0,
  onPainChange,
  onMarkOvulation,
}) {
  const [expanded, setExpanded] = useState(false);

  // If no tracking toggles are on, show all sections (default behavior)
  const hasToggles = trackOvulationOpk || trackOvulationMucus || trackOvulationPain;
  const showLHTest = !hasToggles || trackOvulationOpk;
  const showMucus = !hasToggles || trackOvulationMucus;
  const showPain = trackOvulationPain;

  const handleTestChange = (value) => {
    onChange("ovulation_test", value);
  };

  const handleMucusChange = (value) => {
    onChange("cervical_mucus", value === cervicalMucus ? "" : value);
  };

  const handleDateChange = (date) => {
    onChange("ovulation_date", date);
  };

  // Build subtitle based on what's tracked
  const trackedItems = [];
  if (showLHTest) trackedItems.push("LH tests");
  if (showMucus) trackedItems.push("cervical mucus");
  if (showPain) trackedItems.push("ovulation pain");
  trackedItems.push("ovulation date");
  const subtitle = trackedItems.join(", ");

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 transition-colors"
      >
        <div className="text-left">
          <div className="flex items-center gap-2">
            <Droplet className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold">Ovulation Tracking</p>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-2 space-y-4 border-t border-border/40">
          {/* Mark Ovulation Quick Button */}
          {addMarkOvulationButton && onMarkOvulation && (
            <button
              onClick={onMarkOvulation}
              className="w-full py-3 px-4 rounded-xl bg-primary/10 border-2 border-primary/30 text-primary font-semibold text-sm hover:bg-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Mark Today as Ovulation Day
            </button>
          )}

          {/* LH Test */}
          {showLHTest && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Ovulation Test Result</Label>
              <div className="grid grid-cols-2 gap-2">
                {TEST_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleTestChange(opt.value)}
                    className={`py-3 px-3 rounded-xl text-xs font-medium border-2 transition-all active:scale-95 text-left ${
                      ovulationTest === opt.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {opt.emoji && <span className="mr-1.5">{opt.emoji}</span>}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cervical Mucus */}
          {showMucus && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Cervical Mucus Observation</Label>
              <div className="space-y-1.5">
                {MUCUS_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleMucusChange(option)}
                    className={`w-full text-left py-2.5 px-3 rounded-lg border transition-all text-sm ${
                      cervicalMucus === option
                        ? "bg-primary/10 border-primary text-foreground font-medium"
                        : "bg-card border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ovulation Pain (Mittelschmerz) */}
          {showPain && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-primary" />
                <Label className="text-xs font-semibold">Ovulation Pain (Mittelschmerz)</Label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={6}
                  value={painScore || 0}
                  onChange={(e) => onPainChange?.(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-muted rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: "hsl(var(--primary))" }}
                />
                <span className="text-sm font-bold text-foreground w-8 text-center">{painScore || 0}/6</span>
              </div>
              <p className="text-[10px] text-muted-foreground">0 = none · 1-2 = mild · 3-4 = moderate · 5-6 = severe</p>
            </div>
          )}

          {/* Ovulation Date */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Estimated Ovulation Date</Label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input
                type="date"
                value={ovulationDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="h-9 bg-background"
              />
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground italic bg-muted/40 rounded-lg p-2">
            💡 Track ovulation via LH tests, cervical mucus changes, or symptom observation. This helps predict your fertile window.
          </p>
        </div>
      )}
    </div>
  );
}