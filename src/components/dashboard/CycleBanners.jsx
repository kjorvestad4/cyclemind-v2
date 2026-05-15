/**
 * CycleBanners — smart, adaptive banners for:
 *   1. Luteal phase medication reminder
 *   2. Missed period notification
 *   3. Predicted ovulation window
 *
 * All banners respect tier gating and user preferences.
 */
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { differenceInDays, addDays, format } from "date-fns";
import { Bell, AlertCircle, Sparkles } from "lucide-react";
import { getUserTier, TIERS } from "@/lib/freemium";
import { getCycleDay } from "@/lib/symptoms";

// ── Luteal phase detection ────────────────────────────────────────────────────
function isInLutealPhase(cycleDay, cycleLength) {
  if (!cycleDay || !cycleLength) return false;
  const ovulationDay = Math.round(cycleLength - 14);
  return cycleDay >= ovulationDay && cycleDay <= cycleLength;
}

// ── Predict ovulation from history ───────────────────────────────────────────
const parseLocalDate = (str) => { const [y, m, d] = str.split("-").map(Number); return new Date(y, m - 1, d); };

function predictOvulation(cycles, entries) {
  if (!cycles || cycles.length === 0) return null;

  const sorted = [...cycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
  const latest = sorted[0];
  const cycleLength = latest.cycle_length || 28;
  const today = new Date();

  // Check if there's a logged LH surge or positive ovulation test recently
  const recentEntries = entries?.filter(e => {
    const daysAgo = differenceInDays(today, parseLocalDate(e.date));
    return daysAgo <= 7 && (e.ovulation_test === "Positive" || e.ovulation_test === "LH Surge");
  }) || [];
  if (recentEntries.length > 0) return null; // Already ovulated/surging — no prediction needed

  // Calculate predicted ovulation day from start_date (use LMP if available)
  const refDate = latest.last_menstrual_period || latest.start_date;
  const cycleStart = parseLocalDate(refDate);
  const ovulationDayNum = Math.max(10, cycleLength - 14);
  const predictedOvDate = addDays(cycleStart, ovulationDayNum - 1);
  const daysUntilOv = differenceInDays(predictedOvDate, today);

  // Show prediction window: 3 days before to day of predicted ovulation
  if (daysUntilOv >= 0 && daysUntilOv <= 3) {
    return {
      date: format(predictedOvDate, "MMM d"),
      daysUntil: daysUntilOv,
    };
  }
  return null;
}

// ── Missed period detection ───────────────────────────────────────────────────
function checkMissedPeriod(cycles) {
  if (!cycles || cycles.length < 1) return false;
  const sorted = [...cycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
  const latest = sorted[0];
  if (latest.cycle_type !== "menstrual" && latest.cycle_type !== "perimenopause") return false;

  const cycleLength = latest.cycle_length || 28;
  const refDate = latest.last_menstrual_period || latest.start_date;
  const cycleStart = parseLocalDate(refDate);
  const expectedNextPeriod = addDays(cycleStart, cycleLength);
  const today = new Date();
  const daysLate = differenceInDays(today, expectedNextPeriod);

  // Show if 5+ days late
  return daysLate >= 5 ? { daysLate } : false;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CycleBanners({ user, cycles, entries, cycleType, cycleDay }) {
  const navigate = useNavigate();
  const isPremium = getUserTier(user) === TIERS.PREMIUM;
  const isMenstrual = cycleType === "menstrual";
  const isPeri = cycleType === "perimenopause";

  const latestCycle = useMemo(() => {
    if (!cycles?.length) return null;
    return [...cycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date))[0];
  }, [cycles]);

  const cycleLength = latestCycle?.cycle_length || user?.cycle_length || 28;
  const lutealActive = (isMenstrual || isPeri) && user?.luteal_med_reminder && isInLutealPhase(cycleDay, cycleLength);
  const ovulationPrediction = (isMenstrual || isPeri) ? predictOvulation(cycles, entries) : null;
  const missedPeriod = (isMenstrual || isPeri) ? checkMissedPeriod(cycles) : null;

  if (!lutealActive && !ovulationPrediction && !missedPeriod) return null;

  return (
    <div className="space-y-2">
      {/* Luteal Phase Medication Reminder */}
      {lutealActive && (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3.5 flex items-start gap-3">
          <Bell className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">💊 Luteal Phase — Medication Reminder</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
              You're currently in your luteal phase (day {cycleDay}/{cycleLength}). If you take luteal-phase medications (antidepressants, other prescription medications, supplements, etc.), this is a reminder to stay consistent. Consult your healthcare provider before changing doses.
            </p>
          </div>
        </div>
      )}

      {/* Predicted Ovulation Window */}
      {ovulationPrediction && (
        <div className="rounded-2xl border border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/30 p-3.5 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">🌸 Approaching Ovulation</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
              You may be approaching ovulation and entering your fertility window — predicted around{" "}
              <strong>{ovulationPrediction.date}</strong> ({ovulationPrediction.daysUntil === 0 ? "today" : ovulationPrediction.daysUntil === 1 ? "tomorrow" : `in ${ovulationPrediction.daysUntil} days`}). Log an ovulation test in your daily log to confirm.
            </p>
            <button
              onClick={() => navigate("/log")}
              className="mt-1.5 text-[11px] font-semibold text-purple-700 dark:text-purple-300 underline"
            >
              Log ovulation test →
            </button>
          </div>
        </div>
      )}

      {/* Missed Period Notification */}
      {missedPeriod && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-3.5 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">📅 Period May Be Late</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
              Your period appears to be{" "}
              <strong>{missedPeriod.daysLate} day{missedPeriod.daysLate !== 1 ? "s" : ""} late</strong> based on your logged cycle length. Consider a pregnancy test if appropriate, and consult your healthcare provider if this continues.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}