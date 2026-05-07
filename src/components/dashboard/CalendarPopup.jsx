import { useState } from "react";
import { format, getDaysInMonth, startOfMonth, getDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { calculateDayTotal } from "@/lib/symptoms";

export default function CalendarPopup({ isOpen, onClose, entries, cycles, cycleType }) {
  const [viewMonth, setViewMonth] = useState(new Date());

  if (!isOpen) return null;

  const now = new Date();
  const currentMonth = viewMonth.getMonth();
  const currentYear = viewMonth.getFullYear();
  const daysInMonth = getDaysInMonth(viewMonth);
  const firstDay = getDay(startOfMonth(viewMonth));

  // Map entries to dates for severity lookup
  const entryMap = {};
  entries.forEach((e) => {
    entryMap[e.date] = e;
  });

  // Calculate severity for a date based on cycle type
  const getSeverity = (dateStr) => {
    const entry = entryMap[dateStr];
    if (!entry) return null;

    if (cycleType === "postpartum") {
      return entry.epds_score ? Math.min(100, entry.epds_score / 30 * 100) : null;
    } else if (cycleType === "pregnancy") {
      const pregnancySymptoms = ["p_nausea", "p_vomiting", "p_fatigue", "p_mood_changes", "p_sleep_issues"];
      const avg = pregnancySymptoms.reduce((sum, key) => sum + (entry[key] || 0), 0) / pregnancySymptoms.length;
      return avg > 0 ? (avg / 6) * 100 : null;
    } else if (["perimenopause", "menopause"].includes(cycleType)) {
      const menopauseSymptoms = ["m_hot_flashes", "m_night_sweats", "m_vaginal_dryness", "m_mood_swings", "m_brain_fog"];
      const avg = menopauseSymptoms.reduce((sum, key) => sum + (entry[key] || 0), 0) / menopauseSymptoms.length;
      return avg > 0 ? (avg / 6) * 100 : null;
    } else {
      // Menstrual: use DRSP average
      return calculateDayTotal(entry) / 6 * 100;
    }
  };

  const getSeverityColor = (severity) => {
    if (!severity) return "bg-muted text-muted-foreground";
    if (severity < 25) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
    if (severity < 50) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300";
    if (severity < 75) return "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300";
    return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";
  };

  // Get phase info for menstrual cycle
  const getPhaseColor = (dateStr) => {
    const latestCycle = [...cycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date))[0];
    if (!latestCycle || cycleType !== "menstrual") return null;

    const cycleStart = new Date(latestCycle.start_date);
    const dateObj = new Date(dateStr);
    const dayInCycle = Math.floor((dateObj - cycleStart) / 86400000) + 1;
    const cycleLength = latestCycle.cycle_length || 28;

    if (dayInCycle < 1 || dayInCycle > cycleLength) return null;

    if (dayInCycle <= 5) return "🌙"; // Menstrual
    if (dayInCycle <= 12) return "🌱"; // Follicular
    if (dayInCycle >= 12 && dayInCycle <= 16) return "💜"; // Ovulatory
    return "🌊"; // Luteal
  };

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const title = cycleType === "postpartum" ? "View History" : cycleType === "pregnancy" ? "View History" : "Cycle Calendar";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-background rounded-t-3xl border-t border-border shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setViewMonth(new Date(currentYear, currentMonth - 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <p className="text-sm font-semibold">{format(viewMonth, "MMMM yyyy")}</p>
          <Button variant="ghost" size="icon" onClick={() => setViewMonth(new Date(currentYear, currentMonth + 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground uppercase">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              if (!day) return <div key={idx} className="aspect-square" />;

              const dateStr = format(new Date(currentYear, currentMonth, day), "yyyy-MM-dd");
              const severity = getSeverity(dateStr);
              const phaseEmoji = getPhaseColor(dateStr);
              const severityColor = getSeverityColor(severity);

              return (
                <button
                  key={idx}
                  onClick={() => {
                    window.location.href = `/log?date=${dateStr}`;
                  }}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-all active:scale-95 cursor-pointer ${
                    severityColor || "bg-card border border-border hover:border-primary"
                  }`}
                  title={`${dateStr}${severity ? ` · Severity ${Math.round(severity)}%` : ""}`}
                >
                  <span className="text-[10px]">{day}</span>
                  {phaseEmoji && <span className="text-xs leading-none">{phaseEmoji}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-muted/40 rounded-xl p-3 space-y-2 text-[10px]">
          <p className="font-semibold text-foreground">Severity Legend:</p>
          <div className="grid grid-cols-2 gap-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-100 dark:bg-emerald-950" />
              <span>Minimal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-100 dark:bg-yellow-950" />
              <span>Mild</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-100 dark:bg-orange-950" />
              <span>Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-950" />
              <span>Severe</span>
            </div>
          </div>
          {cycleType === "menstrual" && (
            <div className="pt-2 border-t border-border/40 space-y-1">
              <p className="font-semibold text-foreground">Cycle Phase:</p>
              <div className="grid grid-cols-2 gap-1">
                <span>🌙 Menstrual</span>
                <span>🌱 Follicular</span>
                <span>💜 Ovulatory</span>
                <span>🌊 Luteal</span>
              </div>
            </div>
          )}
        </div>

        <Button variant="outline" onClick={onClose} className="w-full">
          Close
        </Button>
      </div>
    </div>
  );
}