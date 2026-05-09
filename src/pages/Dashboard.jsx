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
import OnboardingNudge from "@/components/dashboard/OnboardingNudge";
import ProfileCompletionBanner from "@/components/dashboard/ProfileCompletionBanner";

function getGreeting() {
  return "Hello";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showModeSwitcher, setShowModeSwitcher] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    // Re-fetch after a short delay to pick up any AuthContext sync (e.g. onboarding data)
    const t = setTimeout(() => base44.auth.me().then(setUser).catch(() => {}), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const forceSyncOnboardingData = async () => {
      try {
        const currentUser = await base44.auth.me();

        const pendingName = localStorage.getItem("onboarding_fullName");
        const pendingDob = localStorage.getItem("onboarding_dob");
        const pendingLmp = localStorage.getItem("onboarding_lmp");
        const pendingCycleLength = localStorage.getItem("onboarding_cycleLength");

        if (pendingName || pendingDob || pendingLmp || pendingCycleLength) {
          // Save profile data via auth API
          const profileUpdate = {};
          if (pendingName) profileUpdate.display_name = pendingName;
          if (pendingDob) profileUpdate.date_of_birth = pendingDob;
          await base44.auth.updateMe(profileUpdate);

          // Upsert cycle data
          const cycles = await base44.entities.Cycle.filter({ created_by: currentUser.email }, '-start_date', 1);
          const cyclePayload = {
            cycle_type: localStorage.getItem("onboarding_mode") || "menstrual",
            last_menstrual_period: pendingLmp || null,
            start_date: pendingLmp || new Date().toISOString().split('T')[0],
            cycle_length: parseInt(pendingCycleLength) || 28,
          };
          if (cycles.length > 0) {
            await base44.entities.Cycle.update(cycles[0].id, cyclePayload);
          } else {
            await base44.entities.Cycle.create(cyclePayload);
          }

          // Clear localStorage
          ["onboarding_fullName", "onboarding_dob", "onboarding_lmp", "onboarding_cycleLength", "onboarding_mode"]
            .forEach(k => localStorage.removeItem(k));

          // Refresh user state and cycle query so banner and mode content update
          const updatedUser = await base44.auth.me();
          setUser(updatedUser);
          queryClient.invalidateQueries({ queryKey: ["cycles"] });
        }
      } catch (e) {
        console.error("Dashboard safety-net sync failed", e);
      }
    };
    forceSyncOnboardingData();
  }, []);

  const { data: cycles = [] } = useQuery({
    queryKey: ["cycles"],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Cycle.filter({ created_by: user.email }, "-start_date", 50);
    },
  });

  const { data: entries = [] } = useQuery({
    queryKey: ["entries"],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.DailyEntry.filter({ created_by: user.email }, "-date", 100);
    },
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
    <div className="space-y-5 pb-40">
      <CalendarPopup
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        entries={entries}
        cycles={cycles}
        cycleType={cycleType}
      />
      {/* Greeting with Calendar */}
      <div className="flex items-start justify-between gap-3 pt-1">
        <div className="flex-1">
          <h2 className="font-serif text-2xl font-semibold text-foreground">
            {getGreeting()}{(user?.display_name || user?.full_name) ? `, ${(user.display_name || user.full_name).split(" ")[0]}` : ""}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">You've got this — tracking helps. 💜</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 rounded-xl hover:bg-muted shrink-0 mt-1"
          onClick={() => setShowCalendar(true)}
        >
          <CalendarIcon className="w-5 h-5 text-primary" />
        </Button>
      </div>

      {/* Profile Completion Banner */}
      <ProfileCompletionBanner user={user} latestCycle={latestCycle} />

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
      {todayEntry && (
        <Button
          onClick={() => navigate(`/log?date=${todayStr}`)}
          variant="outline"
          className="w-full h-11 rounded-2xl text-sm font-medium gap-2"
        >
          <Check className="w-4 h-4" />
          Update Log · {filledCount} symptoms rated
        </Button>
      )}

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