import { Link } from "react-router-dom";
import { format, subDays, addDays, differenceInDays } from "date-fns";
import { TrendingUp, Heart, Flame } from "lucide-react";
import { calculateDayTotal, ALL_SYMPTOMS } from "@/lib/symptoms";

// Logging streak
export function StreakWidget({ entries }) {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 400; i++) {
    const d = format(subDays(today, i), "yyyy-MM-dd");
    if (entries.find((e) => e.date === d)) streak++;else
    break;
  }

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-4 flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center shrink-0">
        <Flame className="w-6 h-6 text-amber-500" />
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-foreground">{streak}</span>
          <span className="text-sm text-muted-foreground">day streak</span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {streak === 0 ? "Start your streak by logging today!" : streak < 3 ? "Great start — keep going!" : streak < 7 ? "Building momentum 💪" : "Amazing consistency! 🔥"}
        </p>
      </div>
    </div>);

}

// Export streak calculation so it can be reused
export function calculateStreak(entries) {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 400; i++) {
    const d = format(subDays(today, i), "yyyy-MM-dd");
    if (entries.find((e) => e.date === d)) streak++;else
    break;
  }
  return streak;
}

// Last 7 days severity bar chart
export function RecentInsightsWidget({ entries }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
    const entry = entries.find((e) => e.date === d);
    const total = entry ? calculateDayTotal(entry) : null;
    return { date: d, total, label: format(new Date(d.split("-").map(Number).reduce((acc, v, i) => {if (i === 0) acc.setFullYear(v);else if (i === 1) acc.setMonth(v - 1);else acc.setDate(v);return acc;}, new Date())), "EEE") };
  });

  const max = Math.max(...days.map((d) => d.total || 0), 1);

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-3 hidden">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Last 7 Days</p>
        <Link to="/insights" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
          Full insights <TrendingUp className="w-3 h-3" />
        </Link>
      </div>
      <div className="flex items-end gap-1.5 h-16">
        {days.map((d) => {
          const pct = d.total !== null ? Math.max(8, d.total / max * 100) : 0;
          const isToday = d.date === format(new Date(), "yyyy-MM-dd");
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-sm relative" style={{ height: "48px" }}>
                {d.total !== null ?
                <div
                  className={`absolute bottom-0 w-full rounded-sm transition-all ${isToday ? "bg-primary" : "bg-primary/40"}`}
                  style={{ height: `${pct}%` }} /> :


                <div className="absolute bottom-0 w-full h-1 rounded-sm bg-muted" />
                }
              </div>
              <span className={`text-[9px] font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>{d.label}</span>
            </div>);

        })}
      </div>
    </div>);

}

// Next milestone card
export function NextMilestoneWidget({ cycleType, latestCycle, cycleLength = 28 }) {
  const today = format(new Date(), "yyyy-MM-dd");

  let label = null;
  let sublabel = null;
  let daysAway = null;
  let emoji = "📅";

  if (cycleType === "pregnancy") {
    const pregnancyWeek = latestCycle?.pregnancy_week || (
    latestCycle?.last_menstrual_period ?
    Math.floor(differenceInDays(new Date(), new Date(latestCycle.last_menstrual_period)) / 7) :
    null);
    if (latestCycle?.estimated_due_date) {
      daysAway = differenceInDays(new Date(latestCycle.estimated_due_date), new Date());
      label = "Estimated Due Date";
      sublabel = format(new Date(latestCycle.estimated_due_date), "MMMM d, yyyy");
      emoji = "🍼";
    } else if (pregnancyWeek) {
      const nextMilestoneWeeks = [12, 20, 28, 40].find((w) => w > pregnancyWeek);
      if (nextMilestoneWeeks) {
        daysAway = (nextMilestoneWeeks - pregnancyWeek) * 7;
        label = nextMilestoneWeeks === 40 ? "Due Date" : `Week ${nextMilestoneWeeks} Milestone`;
        sublabel = `~${daysAway} days away`;
        emoji = "🤰";
      }
    }
  } else if (cycleType === "postpartum" && latestCycle?.start_date) {
    const day = differenceInDays(new Date(), new Date(latestCycle.start_date));
    if (day < 42) {
      daysAway = 42 - day;
      label = "6-Week Postnatal Check";
      sublabel = `In ${daysAway} days`;
      emoji = "🏥";
    }
  } else if (cycleType === "menstrual" || !cycleType) {
    // Predict next period from latest cycle
    const latestStart = latestCycle?.start_date;
    if (latestStart) {
      const nextPeriod = addDays(new Date(latestStart), cycleLength);
      daysAway = differenceInDays(nextPeriod, new Date());
      if (daysAway >= 0 && daysAway <= 60) {
        label = "Next Expected Period";
        sublabel = format(nextPeriod, "MMMM d, yyyy");
        emoji = "🔴";
      }
    }
  }

  if (!label) return null;

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-4 flex items-center gap-4 hidden">
      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center shrink-0 text-2xl">
        {emoji}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-sm font-bold text-foreground mt-0.5">{sublabel}</p>
        {daysAway !== null && daysAway >= 0 &&
        <p className="text-[11px] text-primary mt-0.5 font-medium">
            {daysAway === 0 ? "Today!" : daysAway === 1 ? "Tomorrow" : `In ${daysAway} days`}
          </p>
        }
      </div>
    </div>);

}

export function QuickLinksRow() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Link to="/insights" className="bg-card rounded-2xl border border-border/50 p-4 hover:bg-muted/30 transition-colors hidden">
        <TrendingUp className="w-5 h-5 text-primary mb-2" />
        <p className="text-sm font-semibold">Insights</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">Patterns & clinical analysis</p>
      </Link>
      <Link to="/resources" className="bg-card rounded-2xl border border-border/50 p-4 hover:bg-muted/30 transition-colors hidden">
        <Heart className="w-5 h-5 text-accent-foreground mb-2" />
        <p className="text-sm font-semibold">Resources</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">Evidence-based support</p>
      </Link>
    </div>);

}