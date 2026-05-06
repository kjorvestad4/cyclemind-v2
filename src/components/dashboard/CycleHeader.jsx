import { format, differenceInDays } from "date-fns";
import { Moon, Sun, Droplets } from "lucide-react";

export default function CycleHeader({ cycles, cycleLength = 28, lastPeriodDate }) {
  // Only show cycle info when the user has explicitly entered a period date
  const latestCycle = cycles && cycles.length > 0
    ? [...cycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date))[0]
    : null;

  const resolvedStartDateStr = lastPeriodDate || null;

  if (!resolvedStartDateStr) {
    return (
      <div className="bg-gradient-to-br from-primary/10 via-accent/20 to-secondary rounded-2xl p-6 text-center">
        <p className="text-muted-foreground text-sm">Welcome to CycleMind 🌙</p>
        <p className="text-foreground font-medium mt-1">
          Please enter your last period date below to see cycle information.
        </p>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(resolvedStartDateStr);
  startDate.setHours(0, 0, 0, 0);
  const daysSinceStart = differenceInDays(today, startDate);
  const effectiveCycleLength = (latestCycle?.cycle_length) || cycleLength;
  const currentDay = (daysSinceStart % effectiveCycleLength) + 1;
  const lutealStart = Math.max(1, effectiveCycleLength - 13);
  const isLuteal = currentDay >= lutealStart;
  const daysUntilPeriod = isLuteal ? Math.max(0, effectiveCycleLength - currentDay + 1) : null;
  const phase = isLuteal ? "Luteal Phase" : "Follicular Phase";
  const progress = Math.min(100, (currentDay / effectiveCycleLength) * 100);

  return (
    <div className="bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/30 rounded-2xl p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Current Cycle</p>
          <p className="text-3xl font-bold text-foreground mt-1">Day {currentDay}</p>
          <div className="flex items-center gap-1.5 mt-1">
            {isLuteal ? (
              <Moon className="w-3.5 h-3.5 text-primary" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-chart-2" />
            )}
            <span className="text-sm text-muted-foreground">{phase}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Started</p>
          <p className="text-sm font-medium">{format(startDate, "MMM d")}</p>
          {daysUntilPeriod !== null && (
            <div className="flex items-center gap-1 mt-1.5">
              <Droplets className="w-3 h-3 text-accent-foreground" />
              <span className="text-xs text-accent-foreground font-medium">
                ~{daysUntilPeriod}d until period
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="h-2 bg-background/60 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-chart-2 via-primary to-accent-foreground"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Day 1</span>
          <span>Day {lutealStart} (Luteal)</span>
          <span>Day {effectiveCycleLength}</span>
        </div>
      </div>
    </div>
  );
}