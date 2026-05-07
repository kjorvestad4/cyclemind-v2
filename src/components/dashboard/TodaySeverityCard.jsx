import { useNavigate } from "react-router-dom";
import { format, subDays } from "date-fns";
import { TrendingUp, TrendingDown, Minus, PenLine } from "lucide-react";

// ── Per-mode score calculators ────────────────────────────────────────────────

const PREG_KEYS = ["p_nausea","p_vomiting","p_fatigue","p_mood_changes","p_sleep_issues","p_back_pain","p_braxton_hicks","p_heartburn","p_swelling","p_breast_changes"];
const MENO_KEYS = ["m_hot_flashes","m_night_sweats","m_vaginal_dryness","m_mood_swings","m_brain_fog","m_joint_pain","m_sleep_disturbance","m_fatigue","m_anxiety","m_depression","m_libido_changes","m_urinary_symptoms"];
const PP_KEYS   = ["pp_lochiaBleeding","pp_perinealPain","pp_incisionPain","pp_breastEngorgement","pp_mastitisSymptoms","pp_urinaryIncontinence","pp_constipation","pp_fatigue","pp_sleepWithBaby","pp_bondingDifficulties","pp_anxietyAboutBaby","pp_moodChanges"];
const DRSP_KEYS = ["s_mood_swings","s_irritability","s_anxiety","s_depression","s_overwhelmed","s_less_interest","s_concentration","s_lethargic","s_appetite","s_breast_tender","s_bloating","s_headache","s_pain","s_cramping"];

function avgOf(entry, keys) {
  if (!entry) return null;
  const vals = keys.map((k) => entry[k] || 0).filter((v) => v > 0);
  if (!vals.length) return null;
  return parseFloat((vals.reduce((a, b) => a + b, 0) / keys.length).toFixed(1));
}

function scoreForMode(entry, cycleType) {
  if (!entry) return { score: null, max: null, label: null };

  switch (cycleType) {
    case "pregnancy": {
      const avg = avgOf(entry, PREG_KEYS);
      return { score: avg, max: 6, label: "Pregnancy Symptoms", unit: "avg /6" };
    }
    case "postpartum": {
      // Prefer EPDS score if available, else pp average
      if (entry.epds_score != null && entry.epds_score > 0) {
        return { score: entry.epds_score, max: 30, label: "EPDS", unit: "/30" };
      }
      const avg = avgOf(entry, PP_KEYS);
      return { score: avg, max: 6, label: "Postpartum Symptoms", unit: "avg /6" };
    }
    case "perimenopause":
    case "menopause": {
      const avg = avgOf(entry, MENO_KEYS);
      return { score: avg, max: 6, label: "Menopause Symptoms", unit: "avg /6" };
    }
    default: {
      // Menstrual / PMDD — DRSP average
      const avg = avgOf(entry, DRSP_KEYS);
      return { score: avg, max: 6, label: "DRSP Today", unit: "avg /6" };
    }
  }
}

// ── Clinical severity thresholds ──────────────────────────────────────────────

function getSeverity(score, max, cycleType) {
  if (score === null) return null;

  if (cycleType === "postpartum" && max === 30) {
    // EPDS: <10 minimal, 10-12 mild, 13-14 moderate, ≥15 clinical concern
    if (score < 10) return { label: "Minimal", color: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-400" };
    if (score < 13) return { label: "Mild", color: "text-yellow-600 dark:text-yellow-400", bar: "bg-yellow-400" };
    if (score < 15) return { label: "Moderate", color: "text-orange-600 dark:text-orange-400", bar: "bg-orange-400" };
    return { label: "Clinical Concern", color: "text-red-600 dark:text-red-400", bar: "bg-red-500" };
  }

  // avg /6 scale
  const pct = score / 6;
  if (pct < 0.25) return { label: "Mild",     color: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-400" };
  if (pct < 0.50) return { label: "Moderate", color: "text-yellow-600 dark:text-yellow-400",  bar: "bg-yellow-400" };
  if (pct < 0.75) return { label: "Severe",   color: "text-orange-600 dark:text-orange-400",  bar: "bg-orange-400" };
  return              { label: "Extreme",  color: "text-red-600 dark:text-red-400",     bar: "bg-red-500" };
}

// ── Mini sparkline (last 3 days) ──────────────────────────────────────────────

function Sparkline({ entries, cycleType }) {
  const days = Array.from({ length: 3 }, (_, i) => {
    const d = format(subDays(new Date(), 2 - i), "yyyy-MM-dd");
    const entry = entries.find((e) => e.date === d);
    const { score, max } = scoreForMode(entry, cycleType);
    return { d, score, max };
  });

  const maxVal = Math.max(...days.map((d) => d.score || 0), 1);

  const trend = (() => {
    const valid = days.filter((d) => d.score !== null);
    if (valid.length < 2) return null;
    const diff = valid[valid.length - 1].score - valid[0].score;
    if (diff > 0.3) return "up";
    if (diff < -0.3) return "down";
    return "flat";
  })();

  return (
    <div className="flex items-end gap-1.5">
      {days.map((d, i) => {
        const isToday = i === 2;
        const pct = d.score !== null ? Math.max(15, (d.score / maxVal) * 100) : 0;
        return (
          <div key={d.d} className="flex flex-col items-center gap-0.5">
            <div className="w-5 rounded-sm relative" style={{ height: "24px" }}>
              {d.score !== null ? (
                <div
                  className={`absolute bottom-0 w-full rounded-sm ${isToday ? "bg-primary" : "bg-primary/30"}`}
                  style={{ height: `${pct}%` }}
                />
              ) : (
                <div className="absolute bottom-0 w-full h-1 bg-muted rounded-sm" />
              )}
            </div>
            <span className="text-[8px] text-muted-foreground">{["2d", "1d", "Now"][i]}</span>
          </div>
        );
      })}
      {trend && (
        <div className="ml-1 mb-4">
          {trend === "up"   && <TrendingUp className="w-3.5 h-3.5 text-orange-500" />}
          {trend === "down" && <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />}
          {trend === "flat" && <Minus className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
      )}
    </div>
  );
}

// ── Main card ─────────────────────────────────────────────────────────────────

export default function TodaySeverityCard({ entries, cycleType }) {
  const navigate = useNavigate();
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayEntry = entries.find((e) => e.date === todayStr);

  const { score, max, label, unit } = scoreForMode(todayEntry, cycleType);
  const severity = getSeverity(score, max, cycleType);
  const hasData = score !== null;
  const barPct = hasData ? Math.min(100, (score / max) * 100) : 0;

  return (
    <button
      onClick={() => navigate(`/log?date=${todayStr}`)}
      className="w-full text-left bg-card rounded-2xl border border-border/60 p-4 hover:bg-muted/20 active:scale-[0.99] transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Score block */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            {label || "Today's Score"}
          </p>

          {hasData ? (
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-4xl font-bold text-foreground">{score}</span>
              <span className="text-sm text-muted-foreground">{unit}</span>
              {severity && (
                <span className={`text-sm font-semibold ${severity.color}`}>• {severity.label}</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-1">
              <PenLine className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Not logged yet — tap to log</span>
            </div>
          )}

          {hasData && (
            <div className="mt-3 space-y-1">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${severity?.bar || "bg-primary"}`}
                  style={{ width: `${barPct}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                {cycleType === "postpartum" && max === 30
                  ? `EPDS scale: 0–30 · ≥13 warrants clinical review`
                  : `Scale: 1–6 per symptom (DRSP / clinical average)`}
              </p>
            </div>
          )}
        </div>

        {/* Sparkline */}
        {entries.length >= 2 && (
          <div className="shrink-0 pt-1">
            <Sparkline entries={entries} cycleType={cycleType} />
          </div>
        )}
      </div>

      {/* Tap hint */}
      <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          {hasData ? "Tap to update today's log" : "Tap to log today's symptoms"}
        </span>
        <span className="text-[11px] text-primary font-semibold group-hover:underline">Open log →</span>
      </div>
    </button>
  );
}