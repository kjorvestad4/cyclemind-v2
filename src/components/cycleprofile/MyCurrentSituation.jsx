/**
 * MyCurrentSituation — Large selectable cards for the user's current tracking context.
 * Shown at the top of the Cycle Profile screen, before the Basic/Advanced tabs.
 */
const SITUATIONS = [
  {
    id: "on_hormonal_bc",
    emoji: "💊",
    title: "On hormonal contraception / IUD",
    subtitle: "No natural periods to track",
  },
  {
    id: "stopped_contraception",
    emoji: "🔄",
    title: "Recently stopped contraception",
    subtitle: "Tracking return of my cycle",
  },
  {
    id: "natural_ttc",
    emoji: "🌱",
    title: "Natural cycles / TTC",
    subtitle: "Regular cycle tracking",
  },
  {
    id: "pregnancy_postpartum",
    emoji: "🤰",
    title: "Postpartum",
    subtitle: "Tracking pregnancy or recovery",
  },
  {
    id: "perimenopause_menopause",
    emoji: "🌡️",
    title: "Perimenopause",
    subtitle: "Tracking the transition",
  },
  {
    id: "other",
    emoji: "📝",
    title: "Other",
    subtitle: "Custom tracking context",
  },
];

export default function MyCurrentSituation({ value, onChange }) {
  const selected = value || "none";

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-foreground">My Current Situation</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Selecting this helps Luna tailor predictions, alerts, and your timeline.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {SITUATIONS.map(sit => {
          const isSelected = selected === sit.id;

          return (
            <button
              key={sit.id}
              onClick={() => onChange(sit.id)}
              className={`relative flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all active:scale-[0.98] ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border/50 bg-card hover:border-primary/30 hover:bg-muted/30"
              }`}
            >
              <span className="text-2xl shrink-0 leading-none mt-0.5">{sit.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold leading-tight ${isSelected ? "text-foreground" : "text-foreground/90"}`}>
                  {sit.title}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{sit.subtitle}</p>
              </div>
              {isSelected && (
                <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}

            </button>
          );
        })}
      </div>
    </div>
  );
}