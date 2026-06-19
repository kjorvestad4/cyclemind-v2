/**
 * CycleProfileSummary — read-only card showing the user's cycle profile data
 * (the same fields managed by the Cycle Profile Settings page).
 *
 * Used on:
 *   - Profile page (replaces the old CurrentCycleDetails section)
 *   - Dashboard (compact, under the cycle phase section)
 *
 * Data source: `user` entity fields (cycle_length, menstruation_length,
 * luteal_phase_length, ovulation_day, cycle_regularity, pmdd_window_days).
 * These are the same fields the Cycle Profile page reads/writes, so all
 * parts of the app stay in sync.
 */
import { useNavigate } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import { CalendarDays, Edit, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCycleDay } from "@/lib/symptoms";
import { REGULARITY_VARIANCE } from "@/lib/cycleProfileConfig";

export default function CycleProfileSummary({
  user,
  latestCycle,
  cycleType,
  cycles,
  compact = false,
  onEditCycleRecord,
}) {
  const navigate = useNavigate();

  // Hide in Pregnancy and Menopause modes
  if (cycleType === "pregnancy" || cycleType === "menopause") return null;

  // Profile fields (same defaults as CycleProfileSettings DEFAULT_PROFILE)
  const cycleLength = user?.cycle_length || 28;
  const periodLength = user?.menstruation_length || 5;
  const lutealLength = user?.luteal_phase_length || 14;
  const ovulationDay = user?.ovulation_day || (cycleLength ? cycleLength - 14 : 14);
  const cycleRegularity = user?.cycle_regularity || "regular";
  const pmddWindowDays = user?.pmdd_window_days || 10;

  const isMenstrual = !["pregnancy", "postpartum", "menopause", "perimenopause"].includes(cycleType);
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const cycleDay = isMenstrual ? getCycleDay(todayStr, cycles) : null;

  const regularityInfo = REGULARITY_VARIANCE[cycleRegularity] || REGULARITY_VARIANCE.regular;

  const goToProfileSettings = () => navigate("/cycle-profile");

  // ── Mode-specific cycle-record info (pregnancy week, HRT, postpartum day) ──
  const renderModeSpecific = () => {
    if (!latestCycle) return null;

    if (cycleType === "pregnancy") {
      const pregnancyWeek = latestCycle.pregnancy_week
        || (latestCycle.last_menstrual_period
          ? Math.floor(differenceInDays(new Date(), new Date(latestCycle.last_menstrual_period)) / 7)
          : null);
      const trimester = pregnancyWeek
        ? (pregnancyWeek <= 13 ? "First" : pregnancyWeek <= 26 ? "Second" : "Third")
        : null;
      return (
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Pregnancy Week" value={pregnancyWeek ? `Week ${pregnancyWeek}` : "—"} />
          <Stat label="Trimester" value={trimester || "—"} />
          {latestCycle.estimated_due_date && (
            <Stat label="Due Date" value={format(new Date(latestCycle.estimated_due_date), "MMM d, yyyy")} />
          )}
        </div>
      );
    }

    if (cycleType === "postpartum") {
      const ppDay = latestCycle.start_date
        ? Math.max(1, differenceInDays(new Date(), new Date(latestCycle.start_date)) + 1)
        : null;
      return (
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Postpartum Day" value={ppDay || "—"} />
          <Stat label="Delivery Date" value={format(new Date(latestCycle.start_date), "MMM d, yyyy")} />
        </div>
      );
    }

    if (cycleType === "menopause" || cycleType === "perimenopause") {
      return (
        <div className="grid grid-cols-2 gap-2">
          <Stat label="HRT Type" value={latestCycle.hrt_type || "Not set"} />
          {latestCycle.last_menstrual_period && (
            <Stat label="Last Period" value={format(new Date(latestCycle.last_menstrual_period), "MMM d, yyyy")} />
          )}
        </div>
      );
    }

    return null;
  };

  const modeSection = renderModeSpecific();

  // ── Compact variant (Dashboard) ──
  if (compact) {
    return (
      <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Cycle Profile</h3>
          </div>
          <button
            onClick={goToProfileSettings}
            className="text-[11px] text-primary font-medium hover:underline flex items-center gap-0.5"
          >
            Edit <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Cycle" value={`${cycleLength}d`} compact />
          <Stat label="Period" value={`${periodLength}d`} compact />
          <Stat label="Luteal" value={`${lutealLength}d`} compact />
          <Stat label="Ovulation" value={`Day ${ovulationDay}`} compact />
          <Stat label="PMDD Window" value={`${pmddWindowDays}d`} compact />
          <Stat label="Regularity" value={regularityInfo.text} compact />
        </div>
        {cycleDay && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
              Cycle Day {cycleDay}
            </span>
          </div>
        )}
      </div>
    );
  }

  // ── Full variant (Profile page) ──
  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <div className="px-4 py-3.5 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Cycle Profile</h3>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={goToProfileSettings}>
          <Edit className="w-3.5 h-3.5" /> Edit
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {!latestCycle && (
          <p className="text-sm text-muted-foreground text-center py-3">
            No cycle recorded yet. Log a cycle from the Dashboard.
          </p>
        )}

        {/* Profile fields grid */}
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Cycle Length" value={`${cycleLength}d`} />
          <Stat label="Period Length" value={`${periodLength}d`} />
          <Stat label="Luteal Phase" value={`${lutealLength}d`} />
          <Stat label="Ovulation Day" value={`Day ${ovulationDay}`} />
          <Stat label="PMDD Window" value={`${pmddWindowDays}d`} />
          <Stat label="Regularity" value={regularityInfo.text} />
        </div>

        {/* Cycle day badge for menstrual mode */}
        {isMenstrual && cycleDay && (
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">
              Current Cycle Day: {cycleDay}
            </span>
          </div>
        )}

        {/* Mode-specific cycle record data + edit */}
        {modeSection && (
          <div className="pt-3 border-t border-border/40 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Cycle Details</p>
            {modeSection}
            {onEditCycleRecord && (
              <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => onEditCycleRecord(cycleType)}>
                <Edit className="w-4 h-4" /> Edit Cycle Details
              </Button>
            )}
          </div>
        )}

        {/* Quick link to full settings */}
        <button
          onClick={goToProfileSettings}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">Open Cycle Profile Settings</p>
              <p className="text-[11px] text-muted-foreground">Edit luteal phase, PMDD window, visual editor & more</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-primary shrink-0" />
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, compact }) {
  return (
    <div className={`rounded-xl ${compact ? "bg-muted/30 p-2" : "bg-muted/40 p-3"}`}>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={`${compact ? "text-sm" : "text-lg"} font-bold text-foreground mt-0.5`}>{value}</p>
    </div>
  );
}