import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CalendarView({ entries, cycles, onDayClick, lastPeriodDate, ovulationDate, ovulationEstimated }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const entryMap = {};
  (entries || []).forEach((e) => {
    entryMap[e.date] = e;
  });

  const cycleStartDates = new Set((cycles || []).map((c) => c.start_date));
  const lastPeriodStr = lastPeriodDate || null;
  const ovulationStr = ovulationDate || null;

  const getDaySeverity = (dateStr) => {
    const entry = entryMap[dateStr];
    if (!entry) return null;
    const keys = Object.keys(entry).filter((k) => k.startsWith("s_"));
    const scores = keys.map((k) => entry[k] || 0).filter((v) => v > 0);
    if (scores.length === 0) return null;
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avg <= 1.5) return "low";
    if (avg <= 3) return "medium";
    if (avg <= 4.5) return "high";
    return "extreme";
  };

  const severityStyle = {
    low: "bg-emerald-200/50 text-emerald-800",
    medium: "bg-yellow-200/50 text-yellow-800",
    high: "bg-orange-200/50 text-orange-800",
    extreme: "bg-red-200/50 text-red-800",
  };

  const days = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className="font-semibold text-sm">{format(currentMonth, "MMMM yyyy")}</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-center text-[10px] text-muted-foreground font-medium py-1">
            {d}
          </div>
        ))}
        {days.map((d) => {
          const dateStr = format(d, "yyyy-MM-dd");
          const inMonth = isSameMonth(d, currentMonth);
          const today = isToday(d);
          const isCycleStart = cycleStartDates.has(dateStr);
          const isLastPeriod = lastPeriodStr === dateStr;
          const isOvulation = ovulationStr === dateStr;
          const severity = getDaySeverity(dateStr);
          const hasEntry = !!entryMap[dateStr];

          return (
            <button
              key={dateStr}
              onClick={() => onDayClick?.(dateStr)}
              className={`
                relative aspect-square rounded-lg text-xs font-medium flex items-center justify-center transition-all
                ${!inMonth ? "opacity-30" : ""}
                ${today ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""}
                ${severity ? severityStyle[severity] : isLastPeriod ? "bg-rose-200/60 text-rose-800" : isOvulation ? "bg-purple-200/60 text-purple-800" : "hover:bg-muted"}
                ${isCycleStart ? "border-2 border-accent-foreground" : ""}
              `}
            >
              {format(d, "d")}
              {hasEntry && !severity && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
              {isCycleStart && (
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent-foreground" />
              )}
              {isLastPeriod && !isCycleStart && (
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500" />
              )}
              {isOvulation && (
                <div className="absolute -top-0.5 -left-0.5 w-2 h-2 rounded-full bg-purple-500" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground justify-center pt-1">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-200/50 border border-emerald-200" /> Mild
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-yellow-200/50 border border-yellow-200" /> Moderate
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-orange-200/50 border border-orange-200" /> Severe
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm border-2 border-accent-foreground" /> Period Start
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-200/60 border border-rose-300" /> Last Period
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-200/60 border border-purple-300" />
          {ovulationEstimated ? "Expected Ovulation" : "Ovulation"}
        </span>
      </div>
    </div>
  );
}