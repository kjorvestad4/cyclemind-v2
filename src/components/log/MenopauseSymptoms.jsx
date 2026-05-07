import { useState } from "react";
import { Flame, Plus } from "lucide-react";

const MENOPAUSE_SYMPTOMS = [
  { key: "m_hot_flashes", label: "Hot Flashes / Flushes", shortLabel: "Hot Flashes", tip: "Log severity and frequency helps your doctor optimise HRT." },
  { key: "m_night_sweats", label: "Night Sweats", shortLabel: "Night Sweats" },
  { key: "m_vaginal_dryness", label: "Vaginal Dryness / Discomfort", shortLabel: "Vaginal Dryness" },
  { key: "m_mood_swings", label: "Mood Swings / Irritability", shortLabel: "Mood Swings" },
  { key: "m_brain_fog", label: "Brain Fog / Memory Issues", shortLabel: "Brain Fog" },
  { key: "m_joint_pain", label: "Joint / Muscle Pain", shortLabel: "Joint Pain" },
  { key: "m_sleep_disturbance", label: "Sleep Disturbances", shortLabel: "Sleep Issues" },
  { key: "m_fatigue", label: "Fatigue / Low Energy", shortLabel: "Fatigue" },
  { key: "m_anxiety", label: "Anxiety / Tension", shortLabel: "Anxiety" },
  { key: "m_depression", label: "Low Mood / Depression", shortLabel: "Low Mood" },
  { key: "m_libido_changes", label: "Changes in Libido", shortLabel: "Libido Changes" },
  { key: "m_urinary_symptoms", label: "Urinary Frequency / Urgency", shortLabel: "Urinary Symptoms" },
];

const SEVERITY_BG = [
  "",
  "bg-emerald-100 text-emerald-800 border-emerald-300",
  "bg-lime-100 text-lime-800 border-lime-300",
  "bg-yellow-100 text-yellow-800 border-yellow-300",
  "bg-orange-100 text-orange-800 border-orange-300",
  "bg-red-100 text-red-800 border-red-300",
  "bg-red-200 text-red-900 border-red-500",
];

function SymptomButton({ symKey, value, label, onChange }) {
  const active = value > 0;
  return (
    <div className={`rounded-2xl border-2 p-3 transition-all ${active ? SEVERITY_BG[value] : "bg-card border-border"}`}>
      <p className="text-xs font-semibold mb-2.5">{label}</p>
      <div className="grid grid-cols-6 gap-1">
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <button
            key={s}
            onClick={() => onChange(symKey, value === s ? 0 : s)}
            className={`h-8 rounded-lg text-xs font-bold border-2 transition-all active:scale-90 ${
              value === s ? SEVERITY_BG[s] + " scale-105 shadow-sm" : "bg-background border-border/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function MenopauseSymptoms({ scores, onChange, hrtType, cycleType }) {
  const [showHotFlashCounter, setShowHotFlashCounter] = useState(false);
  const [hotFlashCount, setHotFlashCount] = useState(0);

  const isPeri = cycleType === "perimenopause";

  return (
    <div className="space-y-4">
      {/* Context banner */}
      <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 rounded-xl p-3 flex gap-2 items-start">
        <Flame className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
        <p className="text-xs text-orange-800 dark:text-orange-200">
          {isPeri
            ? "Perimenopause tracking: Irregular cycles and fluctuating hormones are normal. Consistent logging helps your doctor fine-tune treatment."
            : "Menopause tracking: Hot flashes, sleep and mood data are especially valuable for HRT optimisation. Track honestly."}
          {hrtType && <span className="font-semibold"> Current HRT: {hrtType}.</span>}
        </p>
      </div>

      {/* Hot flash quick-counter */}
      <div className="rounded-2xl border border-orange-200 bg-orange-50/50 dark:bg-orange-950/20 dark:border-orange-900 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-semibold">Hot Flash Counter</span>
          </div>
          <button
            onClick={() => setShowHotFlashCounter(!showHotFlashCounter)}
            className="text-xs text-primary underline"
          >
            {showHotFlashCounter ? "Hide" : "Log episodes"}
          </button>
        </div>
        {showHotFlashCounter && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">How many hot flash episodes today?</p>
            <div className="flex gap-2 flex-wrap">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15].map((n) => (
                <button
                  key={n}
                  onClick={() => setHotFlashCount(n)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold border-2 transition-all active:scale-95 ${
                    hotFlashCount === n
                      ? "bg-orange-400 border-orange-500 text-white"
                      : "bg-card border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            {hotFlashCount > 0 && (
              <p className="text-xs text-orange-700 dark:text-orange-300">
                {hotFlashCount >= 10
                  ? "Frequent episodes — worth discussing with your doctor."
                  : hotFlashCount >= 5
                  ? "Moderate frequency. Log severity below."
                  : "Mild frequency. Keep tracking for patterns."}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Symptom grid */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Symptoms · 1 = Not at all · 6 = Severe</p>
        <div className="grid grid-cols-1 gap-2.5">
          {MENOPAUSE_SYMPTOMS.map((s) => (
            <SymptomButton
              key={s.key}
              symKey={s.key}
              value={scores[s.key] || 0}
              label={s.label}
              onChange={onChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}