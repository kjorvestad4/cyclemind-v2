import { Settings, SlidersHorizontal, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

const MODE_CONFIGS = {
  menstrual: {
    emoji: "🌙",
    label: "Menstrual / PMDD",
    gradient: "from-teal-700 to-teal-500",
  },
  pregnancy: {
    emoji: "🤰",
    label: "Pregnancy",
    gradient: "from-pink-600 to-rose-400",
  },
  postpartum: {
    emoji: "🍼",
    label: "Postpartum",
    gradient: "from-purple-600 to-violet-400",
  },
  perimenopause: {
    emoji: "🌡️",
    label: "Perimenopause",
    gradient: "from-amber-600 to-yellow-400",
  },
  menopause: {
    emoji: "☀️",
    label: "Postmenopause",
    gradient: "from-orange-600 to-amber-400",
  },
};

export default function ModeBanner({ latestCycle, cycleDay, onSwitchMode, onCycleSettings }) {
  const navigate = useNavigate();
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

  const subLabel = isPregnancy
    ? (pregnancyWeek ? `Week ${pregnancyWeek}` : "Tracking active")
    : isPostpartum
    ? (postpartumDay ? `Day ${postpartumDay}` : "Tracking active")
    : (isMenopause && latestCycle?.hrt_type)
    ? `HRT: ${latestCycle.hrt_type}`
    : cycleDay
    ? `Day ${cycleDay}${phase ? ` · ${PHASE_LABELS[phase]}` : ""}`
    : "Tracking active";

  const detailLine = isPregnancy && pregnancyWeek
    ? `${pregnancyWeek <= 12 ? "1st trimester" : pregnancyWeek <= 27 ? "2nd trimester" : "3rd trimester"}${latestCycle?.estimated_due_date ? ` · Due ${format(parseLocal(latestCycle.estimated_due_date), "MMM d, yyyy")}` : ""}`
    : isMenstrual && phase === "luteal"
    ? "PMDD symptoms often peak in the luteal phase"
    : isMenstrual && phase === "follicular"
    ? "Energy typically improves in the follicular phase"
    : null;

  const cfg = MODE_CONFIGS[cycleType] || MODE_CONFIGS.menstrual;

  return (
    <div className={`w-full rounded-3xl bg-gradient-to-br ${cfg.gradient} text-white shadow-lg p-5 relative overflow-hidden`}>
      {/* Decorative circles */}
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-8 -right-2 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />

      <div className="flex items-start justify-between gap-3 relative">
        {/* Left: info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 shadow-sm text-2xl leading-none">
            {cfg.emoji}
          </div>
          <div>
            <p className="text-base font-bold text-white">{cfg.label}</p>
            <p className="text-sm text-white/75 mt-0.5">{subLabel}</p>
            {detailLine && (
              <p className="text-[11px] text-white/60 mt-0.5">{detailLine}</p>
            )}
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <button
            id="tour-switch"
            onClick={onSwitchMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-semibold text-white transition-all"
          >
            <Settings className="w-3.5 h-3.5" />
            Switch
          </button>
          {isMenstrual && (
            <button
              onClick={() => navigate("/cycle-profile")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-semibold text-white transition-all"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Settings
            </button>
          )}
        </div>
      </div>
    </div>
  );
}