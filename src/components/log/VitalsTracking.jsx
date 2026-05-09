import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const VITAL_FIELDS = [
  { key: "heart_rate", label: "Heart Rate", unit: "bpm", range: "60–100", placeholder: "e.g. 72" },
  { key: "systolic_bp", label: "Systolic BP", unit: "mmHg", range: "< 120", placeholder: "e.g. 115" },
  { key: "diastolic_bp", label: "Diastolic BP", unit: "mmHg", range: "< 80", placeholder: "e.g. 75" },
  { key: "respiratory_rate", label: "Respiratory Rate", unit: "breaths/min", range: "12–20", placeholder: "e.g. 16" },
  { key: "basal_body_temp", label: "Basal Body Temperature", unit: "°F / °C", range: "96.3–97.6°F", placeholder: "e.g. 97.2" },
  { key: "weight", label: "Weight", unit: "lbs / kg", range: "varies", placeholder: "e.g. 150" },
  { key: "height", label: "Height", unit: "in / cm", range: "once", placeholder: "e.g. 65" },
];

export default function VitalsTracking({ values = {}, onChange }) {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (key, value) => {
    onChange({ ...values, [key]: value ? parseFloat(value) : null });
  };

  const calculateBMI = () => {
    const weight = values.weight;
    const height = values.height;
    if (!weight || !height) return null;
    // Rough approximation: BMI = (weight in lbs / (height in inches)^2) * 703
    // or (weight in kg / (height in cm)^2) * 10000 for metric
    // Assuming lbs/inches for now, but user can adjust
    const bmi = (weight / (height * height)) * 703;
    return Math.round(bmi * 10) / 10;
  };

  const bmi = calculateBMI();
  const filledCount = VITAL_FIELDS.filter((f) => values[f.key]).length;

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 transition-colors"
      >
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Vitals & Measurements</span>
            {filledCount > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                {filledCount} logged
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Heart rate, BP, weight, height</p>
        </div>
        {expanded ? <span className="text-muted-foreground">−</span> : <span className="text-muted-foreground">+</span>}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/40 pt-3">
          <p className="text-xs text-muted-foreground italic">Leave blank if not measured today.</p>

          <div className="grid grid-cols-2 gap-3">
            {VITAL_FIELDS.map((field) => (
              <div key={field.key} className="space-y-1">
                <Label className="text-xs font-medium">
                  {field.label}
                  <span className="text-[10px] text-muted-foreground ml-1">({field.unit})</span>
                </Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder={field.placeholder}
                  value={values[field.key] || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="h-10 text-sm"
                  step="0.1"
                />
                <p className="text-[10px] text-muted-foreground">Range: {field.range}</p>
              </div>
            ))}
          </div>

          {bmi && (
            <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border/40">
              <p className="text-xs font-semibold text-foreground">
                Calculated BMI: <span className="text-primary font-bold">{bmi}</span>
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {bmi < 18.5
                  ? "Underweight"
                  : bmi < 25
                  ? "Normal weight"
                  : bmi < 30
                  ? "Overweight"
                  : "Obese"}{" "}
                — share with your care team if relevant.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}