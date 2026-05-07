const LEVELS = [
  { value: 0, label: "None", color: "bg-muted text-muted-foreground border-border" },
  { value: 1, label: "Spotting", color: "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-300" },
  { value: 2, label: "Light", color: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300" },
  { value: 3, label: "Medium", color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300" },
  { value: 4, label: "Heavy", color: "bg-red-200 text-red-900 border-red-400 dark:bg-red-900 dark:text-red-100" },
];

export default function BleedingPicker({ value, onChange }) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Bleeding Intensity</p>
      <div className="grid grid-cols-5 gap-2">
        {LEVELS.map((l) => (
          <button
            key={l.value}
            onClick={() => onChange(value === l.value ? null : l.value)}
            className={`rounded-xl border-2 py-3 text-xs font-semibold transition-all active:scale-95 ${
              value === l.value ? l.color + " ring-2 ring-offset-1 ring-primary" : "bg-card border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}