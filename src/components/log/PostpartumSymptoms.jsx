const PP_SYMPTOMS = [
  { key: "pp_fatigue", label: "Exhaustion / Fatigue", emoji: "😴" },
  { key: "pp_sleepWithBaby", label: "Sleep disruption from baby", emoji: "🌙" },
  { key: "pp_moodChanges", label: "Mood changes / Baby blues", emoji: "🌊" },
  { key: "pp_anxietyAboutBaby", label: "Anxiety about baby", emoji: "💭" },
  { key: "pp_bondingDifficulties", label: "Difficulty bonding", emoji: "🤱" },
  { key: "pp_lochiaBleeding", label: "Lochia / Vaginal bleeding", emoji: "🩸" },
  { key: "pp_perinealPain", label: "Perineal pain / soreness", emoji: "⚡" },
  { key: "pp_incisionPain", label: "C-section incision pain", emoji: "🩹" },
  { key: "pp_breastEngorgement", label: "Breast engorgement", emoji: "🤱" },
  { key: "pp_mastitisSymptoms", label: "Mastitis symptoms", emoji: "🔴" },
  { key: "pp_urinaryIncontinence", label: "Urinary leakage", emoji: "💧" },
  { key: "pp_constipation", label: "Constipation / Bowel issues", emoji: "🫀" },
];

const SEVERITY_COLORS = [
  "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700",
  "bg-lime-100 text-lime-700 border-lime-300 dark:bg-lime-950 dark:text-lime-300 dark:border-lime-700",
  "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-700",
  "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-700",
  "bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-700",
  "bg-rose-200 text-rose-800 border-rose-400 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-700",
];

function SymptomButton({ symptom, value, onChange }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-base">{symptom.emoji}</span>
        <span className="text-xs font-semibold text-foreground">{symptom.label}</span>
        {value > 0 && (
          <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border ${SEVERITY_COLORS[value - 1]}`}>{value}</span>
        )}
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5, 6].map((v) => (
          <button
            key={v}
            onClick={() => onChange(symptom.key, value === v ? 0 : v)}
            className={`flex-1 h-9 rounded-xl text-xs font-bold border-2 transition-all active:scale-95 ${
              value === v ? SEVERITY_COLORS[v - 1] : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PostpartumSymptoms({ scores, onChange, postpartumDay }) {
  return (
    <div className="space-y-5">
      {postpartumDay && (
        <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-3 text-xs text-muted-foreground">
          <strong className="text-foreground">Postpartum Day {postpartumDay}</strong> — Recovery is different for everyone. Rate 1 (barely noticeable) to 6 (severe). Skip anything not relevant.
        </div>
      )}

      <div className="space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Physical Recovery</p>
        {PP_SYMPTOMS.filter(s => ["pp_lochiaBleeding","pp_perinealPain","pp_incisionPain","pp_breastEngorgement","pp_mastitisSymptoms","pp_urinaryIncontinence","pp_constipation"].includes(s.key)).map((s) => (
          <SymptomButton key={s.key} symptom={s} value={scores[s.key] || 0} onChange={onChange} />
        ))}
      </div>

      <div className="border-t border-border/40 pt-4 space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Emotional Wellbeing</p>
        {PP_SYMPTOMS.filter(s => ["pp_fatigue","pp_sleepWithBaby","pp_moodChanges","pp_anxietyAboutBaby","pp_bondingDifficulties"].includes(s.key)).map((s) => (
          <SymptomButton key={s.key} symptom={s} value={scores[s.key] || 0} onChange={onChange} />
        ))}
      </div>
    </div>
  );
}

export const PP_SYMPTOM_KEYS = PP_SYMPTOMS.map(s => s.key);