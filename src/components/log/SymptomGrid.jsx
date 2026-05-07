const SEVERITY_LABELS = ["", "Not at all", "Minimal", "Mild", "Moderate", "Severe", "Extreme"];
const SEVERITY_BG = [
  "",
  "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200",
  "bg-lime-100 text-lime-800 border-lime-300 dark:bg-lime-950 dark:text-lime-200",
  "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-200",
  "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-200",
  "bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-200",
  "bg-red-200 text-red-900 border-red-500 dark:bg-red-900 dark:text-red-100",
];

function SymptomCard({ symptom, value, onChange }) {
  const active = value > 0;
  return (
    <div className={`rounded-2xl border-2 p-3 transition-all ${active ? SEVERITY_BG[value] : "bg-card border-border"}`}>
      <p className="text-xs font-semibold leading-tight mb-3 min-h-[2.5rem]">{symptom.shortLabel || symptom.label}</p>
      <div className="grid grid-cols-6 gap-1">
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <button
            key={s}
            onClick={() => onChange(symptom.key, value === s ? 0 : s)}
            className={`h-8 rounded-lg text-xs font-bold border-2 transition-all active:scale-90 ${
              value === s ? SEVERITY_BG[s] + " scale-105 shadow-sm" : "bg-background border-border/50 text-muted-foreground hover:bg-muted"
            }`}
            title={SEVERITY_LABELS[s]}
          >
            {s}
          </button>
        ))}
      </div>
      {active && (
        <p className="text-[10px] mt-1.5 font-medium opacity-70 text-center">{SEVERITY_LABELS[value]}</p>
      )}
    </div>
  );
}

export default function SymptomGrid({ categories, scores, onChange }) {
  return (
    <div className="space-y-5">
      {categories.map((cat) => (
        <div key={cat.label} className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{cat.label}</span>
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">
              {cat.symptoms.filter((s) => scores[s.key] > 0).length}/{cat.symptoms.length}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {cat.symptoms.map((s) => (
              <SymptomCard key={s.key} symptom={s} value={scores[s.key] || 0} onChange={onChange} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}