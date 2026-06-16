import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { PenLine, Check, Calendar as CalendarIcon, RefreshCw, Plus } from "lucide-react";
import { toast } from "sonner";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { Button } from "@/components/ui/button";
import { calculateDayTotal, ALL_SYMPTOMS, getCycleDay } from "@/lib/symptoms";
import { getUserTier, canAccessMode, TIERS } from "@/lib/freemium";
import UpgradeBanner from "@/components/common/UpgradeBanner";
import PremiumBanner from "@/components/common/PremiumBanner";
import ModeBanner from "@/components/dashboard/ModeBanner";
import ModeContent from "@/components/dashboard/ModeContent";
import QuickModeSwitcher from "@/components/log/QuickModeSwitcher";
import CalendarPopup from "@/components/dashboard/CalendarPopup";
import TodaySeverityCard from "@/components/dashboard/TodaySeverityCard";
import { StreakWidget, RecentInsightsWidget, NextMilestoneWidget, QuickLinksRow } from "@/components/dashboard/UniversalWidgets";
import OnboardingNudge from "@/components/dashboard/OnboardingNudge";
import ProfileCompletionBanner from "@/components/dashboard/ProfileCompletionBanner";
import CycleBanners from "@/components/dashboard/CycleBanners";
import NewCycleModal from "@/components/dashboard/NewCycleModal";
import CycleDetailModal from "@/components/dashboard/CycleDetailModal";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showModeSwitcher, setShowModeSwitcher] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [logNewCycle, setLogNewCycle] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState(null);

  const handlePullRefresh = async () => {
    await queryClient.refetchQueries({ queryKey: ["cycles"] });
    await queryClient.refetchQueries({ queryKey: ["entries"] });
  };

  const { containerRef, isPulling, pullProgress } = usePullToRefresh(handlePullRefresh);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      // Enforce menstrual mode for free users with restricted cycle type
      if (u && getUserTier(u) === TIERS.FREE) {
        base44.entities.Cycle.list("-start_date", 1).then((cycles) => {
          if (cycles.length > 0) {
            const latest = cycles[0];
            if (latest.cycle_type && latest.cycle_type !== "menstrual") {
              base44.entities.Cycle.update(latest.id, { cycle_type: "menstrual" }).then(() => {
                  queryClient.invalidateQueries({ queryKey: ["cycles"] });
                  toast.info("Switched to Menstrual mode — upgrade to Premium to unlock all lifecycle modes.");
                });
            }
          }
        });
      }
    }).catch(() => {});
    // Re-fetch after a short delay to pick up any AuthContext sync (e.g. onboarding data)
    const t = setTimeout(() => base44.auth.me().then(setUser).catch(() => {}), 2000);
    return () => clearTimeout(t);
  }, [queryClient]);



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

  const parseLocal = (str) => { if (!str) return null; const [y, m, d] = str.split("-").map(Number); return new Date(y, m - 1, d); };

  const latestCycle = cycles.length > 0
    ? [...cycles].sort((a, b) => parseLocal(b.start_date) - parseLocal(a.start_date))[0]
    : null;

  const cycleType = latestCycle?.cycle_type
    || (latestCycle?.is_pregnancy_mode ? "pregnancy" : latestCycle?.is_menopause_mode ? "menopause" : "menstrual");

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayEntry = entries.find((e) => e.date === todayStr);

  const isMenstrual = !["pregnancy", "postpartum", "menopause", "perimenopause"].includes(cycleType);
  const cycleDay = isMenstrual ? getCycleDay(todayStr, cycles) : null;
  const cycleLength = latestCycle?.cycle_length || user?.cycle_length || 28;

  const filledCount = todayEntry ? ALL_SYMPTOMS.filter((s) => (todayEntry[s.key] || 0) > 0).length : 0;
  
  const userTier = getUserTier(user);
  const isFreeUser = userTier === TIERS.FREE;
  const isModeRestricted = isFreeUser && cycleType !== 'menstrual';

  return (
    <div className="space-y-5 relative">
      {/* Pull-to-refresh indicator */}
      {isPulling && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all">
          <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg">
            <RefreshCw className={`h-4 w-4 ${pullProgress >= 1 ? "animate-spin" : ""}`} />
            <span className="text-xs font-medium">{pullProgress >= 1 ? "Refreshing..." : "Pull to refresh"}</span>
          </div>
        </div>
      )}
      
      <div className="space-y-5 pb-24">
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
          id="tour-calendar"
          variant="default"
          size="icon"
          className="h-11 w-11 rounded-xl shrink-0 mt-1 shadow-md"
          onClick={() => setShowCalendar(true)}
        >
          <CalendarIcon className="w-5 h-5" />
        </Button>
        </div>

        {/* Profile Completion Banner */}
        <ProfileCompletionBanner user={user} latestCycle={latestCycle} />

        {/* Premium Banner for Free Users */}
        {user && getUserTier(user) === TIERS.FREE && (
          <PremiumBanner />
        )}

        {/* Upgrade Banner for Restricted Mode */}
        {isModeRestricted && (
          <UpgradeBanner feature={`${cycleType.charAt(0).toUpperCase() + cycleType.slice(1)} Tracking`} />
        )}

        {/* PMDD 2-cycle educational nudge */}
        {isMenstrual && cycles.length < 2 && entries.length > 0 && (
          <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-2xl p-4 flex gap-3 items-start">
            <span className="text-lg shrink-0">📋</span>
            <div>
              <p className="text-sm font-semibold text-teal-800 dark:text-teal-200">Keep logging — PMDD analysis needs 2 cycles</p>
              <p className="text-xs text-teal-600 dark:text-teal-400 mt-0.5">DSM-5 requires prospective daily tracking across 2 full cycles for a PMDD pattern. You're building your first — great start!</p>
            </div>
          </div>
        )}

        {/* Cycle-aware smart banners */}
        <CycleBanners
          user={user}
          cycles={cycles}
          entries={entries}
          cycleType={cycleType}
          cycleDay={cycleDay}
        />

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
        <TodaySeverityCard entries={entries} cycleType={cycleType} isFreeUser={isFreeUser} />

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

        {/* Cycle History Widget */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Cycle History</p>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1 rounded-xl"
              onClick={() => setLogNewCycle(true)}
            >
              <Plus className="w-3.5 h-3.5" /> Log Cycle
            </Button>
          </div>
          {cycles.length > 0 ? (
            <div className="space-y-2">
              {[...cycles]
                .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
                .slice(0, 4)
                .map((cycle, i) => {
                  const labels = ['Current / latest', 'Last cycle', '2 cycles ago', '3 cycles ago'];
                  const label = labels[i] || `${i + 1} cycles ago`;
                  return (
                    <button
                      key={cycle.id}
                      onClick={() => setSelectedCycle({ cycle, label })}
                      className="w-full flex items-center justify-between text-sm py-1.5 hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors"
                    >
                      <div className="flex flex-col items-start">
                        <span className="text-muted-foreground text-xs">{label}</span>
                        <span className="text-xs text-muted-foreground/70">
                          {cycle.start_date ? cycle.start_date : ''}
                          {cycle.cycle_type && cycle.cycle_type !== 'menstrual' ? ` · ${cycle.cycle_type}` : ''}
                        </span>
                      </div>
                      <span className="font-semibold text-foreground flex items-center gap-1">
                        {cycle.cycle_length ? `${cycle.cycle_length} days` : '–'}
                        <span className="text-muted-foreground text-xs">›</span>
                      </span>
                    </button>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-3 space-y-2">
              <p className="text-xs text-muted-foreground">No cycles logged yet</p>
              <Button
                size="sm"
                className="h-8 text-xs gap-1 rounded-xl"
                onClick={() => setLogNewCycle(true)}
              >
                <Plus className="w-3.5 h-3.5" /> Add Your First Cycle Entry
              </Button>
            </div>
          )}
        </div>

        {/* Cycle Detail Modal */}
        {selectedCycle && (
          <CycleDetailModal
            cycle={selectedCycle.cycle}
            label={selectedCycle.label}
            onClose={() => setSelectedCycle(null)}
          />
        )}

        {/* New Cycle Entry Modal */}
        {logNewCycle && (
          <NewCycleModal
            onClose={() => {
              setLogNewCycle(false);
              queryClient.invalidateQueries({ queryKey: ["cycles"] });
            }}
          />
        )}

        {/* Universal widgets */}
        <StreakWidget entries={entries} />
        <RecentInsightsWidget entries={entries} />
        <NextMilestoneWidget cycleType={cycleType} latestCycle={latestCycle} cycleLength={cycleLength} />
        <QuickLinksRow />

        <p className="text-[10px] text-muted-foreground text-center">
          CycleMind is not a substitute for professional medical advice.
        </p>
        </div>
        </div>
        );
        }