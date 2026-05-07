import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { PenLine, Check, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateDayTotal, ALL_SYMPTOMS, getCycleDay } from "@/lib/symptoms";
import ModeBanner from "@/components/dashboard/ModeBanner";
import ModeContent from "@/components/dashboard/ModeContent";
import QuickModeSwitcher from "@/components/log/QuickModeSwitcher";
import CalendarPopup from "@/components/dashboard/CalendarPopup";
import TodaySeverityCard from "@/components/dashboard/TodaySeverityCard";
import { StreakWidget, RecentInsightsWidget, NextMilestoneWidget, QuickLinksRow } from "@/components/dashboard/UniversalWidgets";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showModeSwitcher, setShowModeSwitcher] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

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

  const latestCycle = cycles.length > 0
    ? [...cycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date))[0]
    : null;

  const cycleType = latestCycle?.cycle_type
    || (latestCycle?.is_pregnancy_mode ? "pregnancy" : latestCycle?.is_menopause_mode ? "menopause" : "menstrual");

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayEntry = entries.find((e) => e.date === todayStr);

  const isMenstrual = !["pregnancy", "postpartum", "menopause", "perimenopause"].includes(cycleType);
  const cycleDay = isMenstrual ? getCycleDay(todayStr, cycles) : null;
  const cycleLength = latestCycle?.cycle_length || user?.cycle_length || 28;

  const filledCount = todayEntry ? ALL_SYMPTOMS.filter((s) => (todayEntry[s.key] || 0) > 0).length : 0;

  return (
    <div className="space-y-4 pb-24">
      <CalendarPopup
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        entries={entries}
        cycles={cycles}
        cycleType={cycleType}
      />
      {/* Greeting with Calendar */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h2 className="font-serif text-2xl font-semibold text-foreground">
            {getGreeting()}{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">You've got this — tracking helps. 💜</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-muted shrink-0 mt-1"
          onClick={() => setShowCalendar(true)}
        >
          <CalendarIcon className="w-5 h-5 text-primary" />
        </Button>
      </div>

      {/* Mode Banner */}
      <ModeBanner
        latestCycle={latestCycle}
        cycleDay={cycleDay}
        onSwitchMode={() => setShowModeSwitcher(true)}
      />

      {showModeSwitcher && (
        <QuickModeSwitcher
          currentCycleType={cycleType}
          latestCycle={latestCycle}
          onClose={() => {
            setShowModeSwitcher(false);
            queryClient.invalidateQueries({ queryKey: ["cycles"] });
          }}
        />
      )}

      {/* Today's Severity Card — primary CTA, clickable to /log */}
      <TodaySeverityCard entries={entries} cycleType={cycleType} />

      {/* Secondary log button */}
      <Button
        onClick={() => navigate(`/log?date=${todayStr}`)}
        variant={todayEntry ? "outline" : "default"}
        className={`w-full h-12 rounded-2xl text-sm font-semibold gap-2 ${!todayEntry ? "shadow-lg shadow-primary/20" : ""}`}
      >
        {todayEntry ? <Check className="w-4 h-4" /> : <PenLine className="w-4 h-4" />}
        {todayEntry
          ? `Update Log · ${filledCount} symptoms rated`
          : "Log Today's Symptoms"}
      </Button>

      {/* Mode-specific content */}
      <ModeContent
        cycleType={cycleType}
        latestCycle={latestCycle}
        entries={entries}
        cycleDay={cycleDay}
      />

      {/* Universal widgets */}
      <StreakWidget entries={entries} />
      <RecentInsightsWidget entries={entries} />
      <NextMilestoneWidget cycleType={cycleType} latestCycle={latestCycle} cycleLength={cycleLength} />
      <QuickLinksRow />

      <p className="text-[10px] text-muted-foreground text-center">
        CycleMind is not a substitute for professional medical advice.
      </p>
    </div>
  );
}