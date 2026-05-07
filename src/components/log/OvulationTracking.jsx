import { useState } from "react";
import { Droplet, Calendar, ChevronDown, ChevronUp } from "lucide-react";
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
}) {
  const [expanded, setExpanded] = useState(false);

  const handleTestChange = (value) => {
    onChange("ovulation_test", value);
  };

  const handleMucusChange = (value) => {
    onChange("cervical_mucus", value === cervicalMucus ? "" : value);
  };

  const handleDateChange = (date) => {
    onChange("ovulation_date", date);
  };

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
          {ovulationTest || cervicalMucus ? (
            <p className="text-xs text-muted-foreground mt-0.5">
              {ovulationTest && `Test: ${TEST_OPTIONS.find((o) => o.value === ovulationTest)?.emoji} ${ovulationTest}`}
              {ovulationTest && cervicalMucus && " · "}
              {cervicalMucus && `Mucus: ${cervicalMucus}`}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-0.5">LH tests, cervical mucus, ovulation date</p>
          )}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-2 space-y-4 border-t border-border/40">
          {/* LH Test */}
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

          {/* Cervical Mucus */}
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