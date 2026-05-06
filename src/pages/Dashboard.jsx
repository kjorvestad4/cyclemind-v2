import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { PenLine, TrendingUp, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import CycleHeader from "@/components/dashboard/CycleHeader";
import CalendarView from "@/components/dashboard/CalendarView";
import { ALL_SYMPTOMS, calculateDayTotal } from "@/lib/symptoms";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: cycles = [] } = useQuery({
    queryKey: ["cycles"],
    queryFn: () => base44.entities.Cycle.list("-start_date", 50),
  });

  const { data: entries = [] } = useQuery({
    queryKey: ["entries"],
    queryFn: () => base44.entities.DailyEntry.list("-date", 100),
  });

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayEntry = entries.find((e) => e.date === todayStr);
  const todayTotal = calculateDayTotal(todayEntry);
  const todayFilledCount = todayEntry
    ? ALL_SYMPTOMS.filter((s) => todayEntry[s.key] > 0).length
    : 0;

  const cycleLength = user?.cycle_length || 28;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="font-serif text-2xl font-semibold text-foreground">
          {getGreeting()}{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          You've got this — tracking helps. 💜
        </p>
      </div>

      {/* Cycle Status */}
      <CycleHeader cycles={cycles} cycleLength={cycleLength} />

      {/* Quick Log Button */}
      <Button
        onClick={() => navigate(`/log?date=${todayStr}`)}
        className="w-full h-14 rounded-2xl text-base font-semibold gap-3 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
      >
        <PenLine className="w-5 h-5" />
        {todayEntry ? `Continue Today's Log (${todayFilledCount}/27)` : "Log Today's Symptoms"}
      </Button>

      {/* Today's Summary */}
      {todayEntry && (
        <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Today's Summary</p>
            <span className="text-lg font-bold text-foreground">{todayTotal}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-400 transition-all"
              style={{ width: `${Math.min(100, (todayTotal / (27 * 6)) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            {todayFilledCount} of 27 symptoms rated • Total score: {todayTotal} / {27 * 6}
          </p>
        </div>
      )}

      {/* Calendar */}
      <div className="bg-card rounded-2xl border border-border/50 p-4">
        <CalendarView
          entries={entries}
          cycles={cycles}
          onDayClick={(date) => navigate(`/log?date=${date}`)}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/insights"
          className="bg-card rounded-2xl border border-border/50 p-4 hover:bg-muted/30 transition-colors"
        >
          <TrendingUp className="w-5 h-5 text-primary mb-2" />
          <p className="text-sm font-semibold">Insights</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {cycles.length >= 2 ? "View your analysis" : "Log 2 cycles to unlock"}
          </p>
        </Link>
        <Link
          to="/resources"
          className="bg-card rounded-2xl border border-border/50 p-4 hover:bg-muted/30 transition-colors"
        >
          <Heart className="w-5 h-5 text-accent-foreground mb-2" />
          <p className="text-sm font-semibold">Resources</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Learn about PMDD & PMS</p>
        </Link>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}