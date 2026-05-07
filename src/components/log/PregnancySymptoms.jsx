import { Baby, Heart } from "lucide-react";

const PREGNANCY_SYMPTOMS = [
  { key: "p_nausea", label: "Nausea / Morning Sickness", shortLabel: "Nausea" },
  { key: "p_vomiting", label: "Vomiting", shortLabel: "Vomiting" },
  { key: "p_fatigue", label: "Fatigue / Exhaustion", shortLabel: "Fatigue" },
  { key: "p_mood_changes", label: "Mood Changes / Emotional", shortLabel: "Mood Changes" },
  { key: "p_sleep_issues", label: "Sleep Disturbances", shortLabel: "Sleep Issues" },
  { key: "p_back_pain", label: "Back / Pelvic Pain", shortLabel: "Back Pain" },
  { key: "p_braxton_hicks", label: "Braxton Hicks Contractions", shortLabel: "Braxton Hicks" },
  { key: "p_heartburn", label: "Heartburn / Acid Reflux", shortLabel: "Heartburn" },
  { key: "p_swelling", label: "Swelling / Edema", shortLabel: "Swelling" },
  { key: "p_breast_changes", label: "Breast Tenderness / Changes", shortLabel: "Breast Changes" },
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

const TRIMESTER_PROMPTS = {
  first: "Nausea and fatigue are very common in the first trimester — be gentle with yourself.",
  second: "The second trimester often brings more energy. Back pain and heartburn may increase.",
  third: "Third trimester: Braxton Hicks, swelling, and sleep disruption are common. Rest when you can.",
  postpartum: "Postpartum: Track recovery, mood, and sleep. You're doing amazingly.",
};

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

export default function PregnancySymptoms({ scores, onChange, trimester, pregnancyWeek, fetalMovementFelt, fetalMovementCount, onFetalChange }) {
  const tip = TRIMESTER_PROMPTS[trimester] || "";

  return (
    <div className="space-y-4">
      {/* Trimester banner */}
      {tip && (
        <div className="bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-900 rounded-xl p-3 flex gap-2 items-start">
          <Baby className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
          <p className="text-xs text-pink-800 dark:text-pink-200">{tip}</p>
        </div>
      )}

      {/* Symptom grid */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Pregnancy Symptoms · 1 = Not at all · 6 = Severe</p>
        <div className="grid grid-cols-1 gap-2.5">
          {PREGNANCY_SYMPTOMS.map((s) => (
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

      {/* Fetal movement — only show from week 16+ or third trimester */}
      {(pregnancyWeek >= 16 || trimester === "third" || trimester === "second") && (
        <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-semibold">Fetal Movement</span>
            {pregnancyWeek && <span className="text-xs text-muted-foreground">Week {pregnancyWeek}</span>}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onFetalChange("felt", !fetalMovementFelt)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all active:scale-95 ${
                fetalMovementFelt
                  ? "bg-pink-100 border-pink-400 text-pink-800 dark:bg-pink-950 dark:text-pink-200"
                  : "bg-card border-border text-muted-foreground"
              }`}
            >
              {fetalMovementFelt ? "💓 Felt movement" : "Felt movement today?"}
            </button>
          </div>
          {fetalMovementFelt && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Approximate kick count</p>
              <div className="flex gap-2 flex-wrap">
                {[0, 5, 10, 15, 20, 25, 30].map((n) => (
                  <button
                    key={n}
                    onClick={() => onFetalChange("count", n)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                      fetalMovementCount === n
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {n === 0 ? "—" : `${n}+`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}