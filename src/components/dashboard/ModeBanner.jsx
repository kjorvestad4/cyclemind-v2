import { Settings } from "lucide-react";
import { format } from "date-fns";

const parseLocal = (str) => {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const PHASE_LABELS = {
  menstrual: "Menstrual Phase",
  follicular: "Follicular Phase",
  ovulatory: "Ovulatory Phase",
  luteal: "Luteal Phase",
};

function getPhase(cycleDay) {
  if (!cycleDay) return null;
  if (cycleDay <= 5) return "menstrual";
  if (cycleDay <= 13) return "follicular";
  if (cycleDay === 14) return "ovulatory";
  return "luteal";
}

export default function ModeBanner({ latestCycle, cycleDay, onSwitchMode }) {
  const cycleType = latestCycle?.cycle_type || "menstrual";
  const isPregnancy = cycleType === "pregnancy";
  const isPostpartum = cycleType === "postpartum";
  const isMenopause = cycleType === "menopause" || cycleType === "perimenopause";
  const isMenstrual = !isPregnancy && !isPostpartum && !isMenopause;

  const today = new Date(); today.setHours(0, 0, 0, 0);

  const pregnancyWeek = latestCycle?.pregnancy_week
    || (latestCycle?.last_menstrual_period
      ? Math.floor((today - parseLocal(latestCycle.last_menstrual_period)) / (1000 * 60 * 60 * 24 * 7))
      : null);

  const postpartumDay = isPostpartum && latestCycle?.start_date
    ? Math.max(1, Math.round((today - parseLocal(latestCycle.start_date)) / (1000 * 60 * 60 * 24)) + 1)
    : null;

  const phase = isMenstrual ? getPhase(cycleDay) : null;

  const config = {
    menstrual: { emoji: "🌙", label: "Menstrual / PMDD", sub: cycleDay ? `Cycle Day ${cycleDay}${phase ? ` · ${PHASE_LABELS[phase]}` : ""}` : "Tracking active", border: "border-primary/20", bg: "bg-primary/5", badge: "bg-primary/10 text-primary" },
    pregnancy: { emoji: "🤰", label: "Pregnancy", sub: pregnancyWeek ? `Week ${pregnancyWeek}` : "Tracking active", border: "border-pink-200 dark:border-pink-900", bg: "bg-pink-50 dark:bg-pink-950/30", badge: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300" },
    postpartum: { emoji: "🍼", label: "Postpartum", sub: postpartumDay ? `Day ${postpartumDay}` : "Tracking active", border: "border-purple-200 dark:border-purple-900", bg: "bg-purple-50 dark:bg-purple-950/30", badge: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
    perimenopause: { emoji: "🌊", label: "Perimenopause", sub: latestCycle?.hrt_type ? `HRT: ${latestCycle.hrt_type}` : "Tracking active", border: "border-amber-200 dark:border-amber-900", bg: "bg-amber-50 dark:bg-amber-950/30", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
    menopause: { emoji: "🔥", label: "Menopause", sub: latestCycle?.hrt_type ? `HRT: ${latestCycle.hrt_type}` : "Tracking active", border: "border-orange-200 dark:border-orange-900", bg: "bg-orange-50 dark:bg-orange-950/30", badge: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
  }[cycleType] || config?.menstrual;

  return (
    <div className={`rounded-2xl border-2 p-4 flex items-center justify-between gap-3 ${config.border} ${config.bg}`}>
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-3xl leading-none shrink-0">{config.emoji}</span>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-bold text-foreground">{config.label}</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${config.badge}`}>{config.sub}</span>
          </div>
          {isPregnancy && pregnancyWeek && (
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {pregnancyWeek <= 12 ? "1st trimester" : pregnancyWeek <= 27 ? "2nd trimester" : "3rd trimester"}
              {latestCycle?.estimated_due_date ? ` · Due ${format(parseLocal(latestCycle.estimated_due_date), "MMM d, yyyy")}` : ""}
            </p>
          )}
          {isMenstrual && phase && (
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {phase === "luteal" ? "PMDD symptoms often peak in the luteal phase" : phase === "follicular" ? "Energy typically improves in the follicular phase" : ""}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={onSwitchMode}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-background border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all shrink-0"
      >
        <Settings className="w-3.5 h-3.5" />
        Switch
      </button>
    </div>
  );
}