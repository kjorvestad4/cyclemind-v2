/**
 * CycleBanners — smart, adaptive banners for:
 *   1. Luteal phase medication reminder
 *   2. Missed period notification (with Update Cycle Length CTA)
 *   3. Predicted ovulation window
 *   4. Period running longer than expected (with Update Period Length CTA)
 *
 * All banners respect tier gating and user preferences.
 * v2 — 2026-06-17
 */
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { differenceInDays, addDays, format } from "date-fns";
import { Bell, AlertCircle, Sparkles, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserTier, TIERS } from "@/lib/freemium";
import CycleSettingsModal from "@/components/dashboard/CycleSettingsModal";

// ── Luteal phase detection ────────────────────────────────────────────────────
function isInLutealPhase(cycleDay, cycleLength) {
  if (!cycleDay || !cycleLength) return false;
  const ovulationDay = Math.round(cycleLength - 14);
  return cycleDay >= ovulationDay && cycleDay <= cycleLength;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const parseLocalDate = (str) => { const [y, m, d] = str.split("-").map(Number); return new Date(y, m - 1, d); };

function todayLocal() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// ── Predict ovulation from history ───────────────────────────────────────────
function predictOvulation(cycles, entries) {
  if (!cycles || cycles.length === 0) return null;

  const sorted = [...cycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
  const latest = sorted[0];
  const cycleLength = latest.cycle_length || 28;
  const today = todayLocal();

  // Check if there's a logged LH surge or positive ovulation test recently
  const recentEntries = entries?.filter(e => {
    const daysAgo = differenceInDays(todayLocal(), parseLocalDate(e.date));
    return daysAgo <= 7 && (e.ovulation_test === "Positive" || e.ovulation_test === "LH Surge");
  }) || [];
  if (recentEntries.length > 0) return null;

  const refDate = latest.last_menstrual_period || latest.start_date;
  const cycleStart = parseLocalDate(refDate);
  const ovulationDayNum = Math.max(10, cycleLength - 14);
  const predictedOvDate = addDays(cycleStart, ovulationDayNum - 1);
  const daysUntilOv = differenceInDays(predictedOvDate, today);

  if (daysUntilOv >= 0 && daysUntilOv <= 4) {
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
  const daysLate = differenceInDays(todayLocal(), expectedNextPeriod);

  return daysLate >= 5 ? { daysLate } : false;
}

// ── Long menstruation detection ───────────────────────────────────────────────
function checkLongPeriod(entries, user, latestCycle) {
  if (!entries || !latestCycle) return false;
  if (latestCycle.cycle_type !== "menstrual" && latestCycle.cycle_type !== "perimenopause") return false;

  const periodLength = user?.menstruation_length || 5;
  const cycleStart = latestCycle.last_menstrual_period || latestCycle.start_date;
  if (!cycleStart) return false;

  const today = todayLocal();
  const periodEndDate = addDays(parseLocalDate(cycleStart), periodLength);
  const extraBleedingDays = entries.filter(e => {
    if (!e.date || !e.menstrual_flow || e.menstrual_flow === "") return false;
    const entryDate = parseLocalDate(e.date);
    return entryDate >= periodEndDate && entryDate <= today;
  });

  if (extraBleedingDays.length === 0) return false;

  const daysBeyond = differenceInDays(today, periodEndDate);
  return daysBeyond >= 1 ? { daysBeyond, periodLength } : false;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CycleBanners({ user, cycles, entries, cycleType, cycleDay }) {
  const navigate = useNavigate();
  const [showCycleSettings, setShowCycleSettings] = useState(false);
  const isMenstrual = cycleType === "menstrual";
  const isPeri = cycleType === "perimenopause";

  const latestCycle = useMemo(() => {
    if (!cycles?.length) return null;
    return [...cycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date))[0];
  }, [cycles]);

  const cycleLength = latestCycle?.cycle_length || user?.cycle_length || 28;
  const lutealActive = (isMenstrual || isPeri) && user?.luteal_med_reminder && isInLutealPhase(cycleDay, cycleLength);
  const ovulationPrediction = (isMenstrual || isPeri || !cycleType) ? predictOvulation(cycles, entries) : null;
  const missedPeriod = (isMenstrual || isPeri) ? checkMissedPeriod(cycles) : null;
  const longPeriod = (isMenstrual || isPeri) ? checkLongPeriod(entries, user, latestCycle) : null;

  if (!lutealActive && !ovulationPrediction && !missedPeriod && !longPeriod) return null;

  return (
    <>
      {showCycleSettings && (
        <CycleSettingsModal
          latestCycle={latestCycle}
          user={user}
          onClose={() => setShowCycleSettings(false)}
        />
      )}
      <div className="space-y-2">
        {/* Luteal Phase Medication Reminder */}
        {lutealActive && (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3.5 flex items-start gap-3">
            <Bell className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">💊 Luteal Phase — Medication Reminder</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                You're currently in your luteal phase (day {cycleDay}/{cycleLength}). If you take luteal-phase medications, this is a reminder to stay consistent. Consult your healthcare provider before changing doses.
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
                You may be approaching ovulation — predicted around{" "}
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
                <strong>{missedPeriod.daysLate} day{missedPeriod.daysLate !== 1 ? "s" : ""} late</strong> based on your logged cycle length ({cycleLength} days). If your cycles have changed, you can update your average cycle length.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 h-7 text-xs gap-1.5 border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950"
                onClick={() => setShowCycleSettings(true)}
              >
                <Settings className="w-3 h-3" />
                Update Cycle Length
              </Button>
            </div>
          </div>
        )}

        {/* Period Running Longer Than Expected */}
        {longPeriod && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30 p-3.5 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">🩸 Period Running Longer Than Expected</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                You've logged bleeding <strong>{longPeriod.daysBeyond} day{longPeriod.daysBeyond !== 1 ? "s" : ""} beyond</strong> your average period length ({longPeriod.periodLength} days). If this is a new normal for you, you can update your average period length.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 h-7 text-xs gap-1.5 border-rose-300 text-rose-800 hover:bg-rose-100 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-950"
                onClick={() => setShowCycleSettings(true)}
              >
                <Settings className="w-3 h-3" />
                Update Period Length
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}