/**
 * CycleBanners — All alerts condensed into a single "Cycle Insights" card
 * with colored left accent bars instead of separate floating boxes.
 */
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { differenceInDays, addDays, format } from "date-fns";
import { Bell, AlertCircle, Sparkles, ChevronRight } from "lucide-react";
import CycleSettingsModal from "@/components/dashboard/CycleSettingsModal";

const parseLocalDate = (str) => { const [y, m, d] = str.split("-").map(Number); return new Date(y, m - 1, d); };
function todayLocal() { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), now.getDate()); }

function isInLutealPhase(cycleDay, cycleLength) {
  if (!cycleDay || !cycleLength) return false;
  return cycleDay >= Math.round(cycleLength - 14) && cycleDay <= cycleLength;
}

function predictOvulation(cycles, entries) {
  if (!cycles?.length) return null;
  const sorted = [...cycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
  const latest = sorted[0];
  const cycleLength = latest.cycle_length || 28;
  const today = todayLocal();
  const recentLH = entries?.filter(e => {
    const daysAgo = differenceInDays(todayLocal(), parseLocalDate(e.date));
    return daysAgo <= 7 && (e.ovulation_test === "Positive" || e.ovulation_test === "LH Surge");
  }) || [];
  if (recentLH.length > 0) return null;
  const refDate = latest.last_menstrual_period || latest.start_date;
  const cycleStart = parseLocalDate(refDate);
  const predictedOvDate = addDays(cycleStart, Math.max(10, cycleLength - 14) - 1);
  const daysUntilOv = differenceInDays(predictedOvDate, today);
  if (daysUntilOv >= 0 && daysUntilOv <= 4) {
    return { date: format(predictedOvDate, "MMM d"), daysUntil: daysUntilOv };
  }
  return null;
}

function checkMissedPeriod(cycles) {
  if (!cycles?.length) return false;
  const sorted = [...cycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
  const latest = sorted[0];
  if (latest.cycle_type !== "menstrual" && latest.cycle_type !== "perimenopause") return false;
  const cycleLength = latest.cycle_length || 28;
  const refDate = latest.last_menstrual_period || latest.start_date;
  const expectedNextPeriod = addDays(parseLocalDate(refDate), cycleLength);
  const daysLate = differenceInDays(todayLocal(), expectedNextPeriod);
  return daysLate >= 5 ? { daysLate } : false;
}

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

// Single alert row with a colored left accent bar
function AlertRow({ icon: Icon, iconColor, accentColor, title, body, action }) {
  return (
    <div className={`flex items-start gap-3 pl-3 border-l-2 ${accentColor} py-0.5`}>
      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground leading-snug">{title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{body}</p>
        {action && (
          <button
            onClick={action.onClick}
            className={`mt-1.5 text-[11px] font-semibold flex items-center gap-0.5 hover:underline ${action.color}`}
          >
            {action.label}
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

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

  const hasAny = lutealActive || ovulationPrediction || missedPeriod || longPeriod;
  if (!hasAny) return null;

  return (
    <>
      {showCycleSettings && (
        <CycleSettingsModal
          latestCycle={latestCycle}
          user={user}
          onClose={() => setShowCycleSettings(false)}
        />
      )}

      {/* Single unified card */}
      <div className="bg-card border border-border/50 rounded-2xl px-4 py-3.5 space-y-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Cycle Insights</p>

        {lutealActive && (
          <AlertRow
            icon={Bell}
            iconColor="text-primary"
            accentColor="border-primary"
            title="Luteal Phase — Medication Check"
            body={`Day ${cycleDay} of ${cycleLength}. If you take luteal-phase medications, this is a gentle reminder to stay consistent.`}
            action={{ label: "View your log", color: "text-primary", onClick: () => navigate("/log") }}
          />
        )}

        {ovulationPrediction && (
          <AlertRow
            icon={Sparkles}
            iconColor="text-purple-500 dark:text-purple-400"
            accentColor="border-purple-400 dark:border-purple-600"
            title="Approaching Ovulation Window"
            body={`Ovulation predicted around ${ovulationPrediction.date} (${ovulationPrediction.daysUntil === 0 ? "today" : ovulationPrediction.daysUntil === 1 ? "tomorrow" : `in ${ovulationPrediction.daysUntil} days`}). Log an ovulation test to confirm.`}
            action={{ label: "Log ovulation test", color: "text-purple-600 dark:text-purple-400", onClick: () => navigate("/log") }}
          />
        )}

        {missedPeriod && (
          <AlertRow
            icon={AlertCircle}
            iconColor="text-amber-500 dark:text-amber-400"
            accentColor="border-amber-400 dark:border-amber-600"
            title={`Period ${missedPeriod.daysLate} day${missedPeriod.daysLate !== 1 ? "s" : ""} late`}
            body={`Based on your ${cycleLength}-day cycle. If your cycles have changed, consider updating your average cycle length.`}
            action={{ label: "Update cycle length", color: "text-amber-600 dark:text-amber-400", onClick: () => setShowCycleSettings(true) }}
          />
        )}

        {longPeriod && (
          <AlertRow
            icon={AlertCircle}
            iconColor="text-rose-500 dark:text-rose-400"
            accentColor="border-rose-400 dark:border-rose-600"
            title={`Bleeding ${longPeriod.daysBeyond} day${longPeriod.daysBeyond !== 1 ? "s" : ""} beyond expected`}
            body={`Your average period length is ${longPeriod.periodLength} days. If this is your new normal, update your period length.`}
            action={{ label: "Update period length", color: "text-rose-600 dark:text-rose-400", onClick: () => setShowCycleSettings(true) }}
          />
        )}
      </div>
    </>
  );
}