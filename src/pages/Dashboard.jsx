import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, addDays } from "date-fns";
import { PenLine, TrendingUp, Heart, CalendarDays, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import CycleHeader from "@/components/dashboard/CycleHeader";
import CalendarView from "@/components/dashboard/CalendarView";
import { ALL_SYMPTOMS, calculateDayTotal } from "@/lib/symptoms";

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [cycleLength, setCycleLength] = useState(28);
  const [ovulationDay, setOvulationDay] = useState(14);
  const [lastPeriodDate, setLastPeriodDate] = useState("");
  const [lastOvulationDate, setLastOvulationDate] = useState("");
  const [newPeriodDate, setNewPeriodDate] = useState("");

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      if (u?.cycle_length) setCycleLength(u.cycle_length);
      if (u?.ovulation_day) setOvulationDay(u.ovulation_day);
      
    }).catch(() => {});
  }, []);

  const { data: cycles = [] } = useQuery({
    queryKey: ["cycles"],
    queryFn: () => base44.entities.Cycle.list("-start_date", 50),
  });

  const { data: entries = [] } = useQuery({
    queryKey: ["entries"],
    queryFn: () => base44.entities.DailyEntry.list("-date", 100),
  });

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      await base44.auth.updateMe({
        cycle_length: cycleLength,
        ovulation_day: ovulationDay,
        last_period_date: lastPeriodDate,
        last_ovulation_date: lastOvulationDate,
      });
    },
    onSuccess: () => toast.success("Settings saved!"),
  });

  const addCycleMutation = useMutation({
    mutationFn: async () => {
      if (cycles.length > 0) {
        const prevCycle = cycles[0];
        const prevStart = new Date(prevCycle.start_date);
        const newStart = new Date(newPeriodDate);
        const daysDiff = Math.round((newStart - prevStart) / (1000 * 60 * 60 * 24));
        if (daysDiff > 0) {
          await base44.entities.Cycle.update(prevCycle.id, { cycle_length: daysDiff });
        }
      }
      await base44.entities.Cycle.create({ start_date: newPeriodDate });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cycles"] });
      toast.success("Period start date recorded! 🩸");
    },
  });

  const parseLocalDate = (str) => { const [y, m, d] = str.split("-").map(Number); return new Date(y, m - 1, d); };
  // Resolve the active period date: typed value OR latest saved cycle
  const activePeriodDate = lastPeriodDate || (cycles.length > 0 ? cycles[0].start_date : null);
  // Only compute ovulation when the user has explicitly typed a period date
  const isOvulationEstimated = !lastOvulationDate && !!lastPeriodDate;
  const computedOvulationDate = lastOvulationDate
    ? lastOvulationDate
    : lastPeriodDate
      ? format(addDays(parseLocalDate(lastPeriodDate), ovulationDay - 1), "yyyy-MM-dd")
      : null;

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayEntry = entries.find((e) => e.date === todayStr);
  const todayTotal = calculateDayTotal(todayEntry);
  const todayFilledCount = todayEntry
    ? ALL_SYMPTOMS.filter((s) => todayEntry[s.key] > 0).length
    : 0;

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
      <CycleHeader cycles={cycles} cycleLength={cycleLength} lastPeriodDate={activePeriodDate} />

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
          lastPeriodDate={lastPeriodDate || null}
          ovulationDate={computedOvulationDate}
          ovulationEstimated={isOvulationEstimated}
        />
      </div>

      {/* Cycle Settings */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            Cycle Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Cycle Length (days)</Label>
              <Input
                type="number"
                min={20}
                max={60}
                value={cycleLength}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 28;
                  setCycleLength(val);
                  setOvulationDay(Math.max(1, val - 14));
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Ovulation Day</Label>
              <Input
                type="number"
                min={1}
                max={cycleLength - 1}
                value={ovulationDay}
                onChange={(e) => setOvulationDay(parseInt(e.target.value) || 14)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Date of Last Period</Label>
                {lastPeriodDate && <button type="button" onClick={() => setLastPeriodDate("")} className="text-[10px] text-muted-foreground hover:text-destructive underline">Clear</button>}
              </div>
              <Input type="date" value={lastPeriodDate} onChange={(e) => setLastPeriodDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Date of Last Ovulation</Label>
                {lastOvulationDate && <button type="button" onClick={() => setLastOvulationDate("")} className="text-[10px] text-muted-foreground hover:text-destructive underline">Clear</button>}
              </div>
              <Input type="date" value={lastOvulationDate} onChange={(e) => setLastOvulationDate(e.target.value)} />
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => updateProfileMutation.mutate()} disabled={updateProfileMutation.isPending} className="w-full">
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Mark Period Start */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4 text-accent-foreground" />
            Mark Period Start (Day 1)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">First day of menstrual flow</Label>
              {newPeriodDate && <button type="button" onClick={() => setNewPeriodDate("")} className="text-[10px] text-muted-foreground hover:text-destructive underline">Clear</button>}
            </div>
            <Input type="date" value={newPeriodDate} onChange={(e) => setNewPeriodDate(e.target.value)} />
          </div>
          <Button onClick={() => addCycleMutation.mutate()} disabled={addCycleMutation.isPending || !newPeriodDate} className="w-full">
            Record Period Start
          </Button>
        </CardContent>
      </Card>

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