import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { PenLine, Check, Calendar as CalendarIcon, RefreshCw, Plus, ChevronRight, Flame } from "lucide-react";
import { toast } from "sonner";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { Button } from "@/components/ui/button";
import { calculateDayTotal, ALL_SYMPTOMS, getCycleDay } from "@/lib/symptoms";
import { getUserTier, canAccessMode, TIERS } from "@/lib/freemium";
import UpgradeBanner from "@/components/common/UpgradeBanner";
import PremiumBanner from "@/components/common/PremiumBanner";
import ModeBanner from "@/components/dashboard/ModeBanner";
import ModeContent from "@/components/dashboard/ModeContent";
import CycleProfileSummary from "@/components/cycleprofile/CycleProfileSummary";
import QuickModeSwitcher from "@/components/log/QuickModeSwitcher";
import CalendarPopup from "@/components/dashboard/CalendarPopup";
import TodaySeverityCard from "@/components/dashboard/TodaySeverityCard";
import { StreakWidget, RecentInsightsWidget, NextMilestoneWidget, QuickLinksRow, calculateStreak } from "@/components/dashboard/UniversalWidgets";
import StreakBadges from "@/components/dashboard/StreakBadges";
import OnboardingNudge from "@/components/dashboard/OnboardingNudge";
import ProfileCompletionBanner from "@/components/dashboard/ProfileCompletionBanner";
import CycleBanners from "@/components/dashboard/CycleBanners";
import CycleSettingsModal from "@/components/dashboard/CycleSettingsModal";
import NewCycleModal from "@/components/dashboard/NewCycleModal";


function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const SUBCOPIES_BY_PHASE = {
  menstrual: [
    "Every log tells your story. 💜",
    "Your body, your data.",
    "Tracking today helps Luna understand you better.",
    "Small steps, big insights.",
  ],
  follicular: [
    "Energy rising — a great time to log. ✨",
    "Your body is rebuilding. Keep tracking.",
    "Follicular phase: you've got this.",
    "New cycle, new data. Let's go.",
  ],
  ovulatory: [
    "Peak week — don't forget to log. 🌟",
    "Ovulation window: every detail counts.",
    "Your most energetic phase. Log it!",
    "Track your fertile window with confidence.",
  ],
  luteal: [
    "Luteal phase ahead — let's track it. 🌙",
    "Be gentle with yourself. Log how you feel.",
    "Your luteal data builds your PMDD picture.",
    "Luna is watching for patterns. Keep logging.",
  ],
  pregnancy: [
    "Every week is a milestone. 🤰",
    "You and your baby, tracked with care.",
    "Log today — your journey matters.",
    "Your pregnancy story, one day at a time.",
  ],
  postpartum: [
    "Recovery takes time. You're doing great. 🍼",
    "Log how you feel — every entry helps.",
    "Your postpartum journey, tracked with love.",
    "One day at a time. We're here with you.",
  ],
  perimenopause: [
    "Tracking your transition with care. 🌊",
    "Your data helps Luna spot patterns.",
    "Every symptom logged is insight gained.",
    "You're not alone in this. Keep tracking.",
  ],
  menopause: [
    "Your health, your terms. 🔥",
    "Log today's experience — it matters.",
    "Every entry adds to your health story.",
    "Tracking menopause, one day at a time.",
  ],
};

function getRotatingSubcopy(cycleType, cyclePhase) {
  const phase = cyclePhase || cycleType || "menstrual";
  const options = SUBCOPIES_BY_PHASE[phase] || SUBCOPIES_BY_PHASE.menstrual;
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return options[dayOfYear % options.length];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showModeSwitcher, setShowModeSwitcher] = useState(false);
  const [showCycleSettings, setShowCycleSettings] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [logNewCycle, setLogNewCycle] = useState(false);
  const [dismissedPregnancyStatus, setDismissedPregnancyStatus] = useState(() => {
    try { return localStorage.getItem("dismissed-pregnancy-status") === "true"; } catch { return false; }
  });
  const [dismissedPeriodEndReminder, setDismissedPeriodEndReminder] = useState(() => {
    try { return localStorage.getItem("dismissed-period-end-reminder") || ""; } catch { return ""; }
  });

  const handlePullRefresh = async () => {
    await queryClient.refetchQueries({ queryKey: ["cycles"] });
    await queryClient.refetchQueries({ queryKey: ["entries"] });
  };

  const { containerRef, isPulling, pullProgress } = usePullToRefresh(handlePullRefresh);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
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
    const t = setTimeout(() => base44.auth.me().then(setUser).catch(() => {}), 2000);
    const handleOpenModal = () => setLogNewCycle(true);
    window.addEventListener("open-new-cycle-modal", handleOpenModal);
    return () => {
      clearTimeout(t);
      window.removeEventListener("open-new-cycle-modal", handleOpenModal);
    };
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
      return base44.entities.DailyEntry.filter({ created_by: user.email }, "-date", 400);
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
  const streak = calculateStreak(entries);

  const userTier = getUserTier(user);
  const isFreeUser = userTier === TIERS.FREE;
  const isModeRestricted = isFreeUser && cycleType !== 'menstrual';

  const activeCycles = cycles.filter(c => !c.end_date && c.cycle_type === 'menstrual');
  const showPeriodEndReminder = activeCycles.length > 0 && dismissedPeriodEndReminder !== activeCycles[0]?.id;

  return (
    <div className="space-y-5 relative">
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
          cycleLength={cycleLength}
          ovulationDay={user?.ovulation_day || Math.max(1, (latestCycle?.cycle_length || cycleLength) - 14)}
          menstruationLength={user?.menstruation_length || 5}
        />

        {/* Greeting */}
        <div className="flex items-start justify-between gap-3 pt-1">
          <div className="flex-1">
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              {getGreeting()}{(user?.display_name || user?.full_name) ? `, ${(user.display_name || user.full_name).split(" ")[0]}` : ""}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{getRotatingSubcopy(cycleType, latestCycle?.phase)}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0 mt-1">
            <button
              onClick={() => document.getElementById("streak-section")?.scrollIntoView({ behavior: "smooth", block: "center" })}
              className="flex items-center gap-1 h-11 px-3 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors"
              aria-label={`${streak} day streak`}
            >
              <Flame className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{streak}</span>
            </button>
            <Button
              id="tour-calendar"
              variant="default"
              size="icon"
              className="h-11 w-11 rounded-xl shadow-md"
              onClick={() => setShowCalendar(true)}
            >
              <CalendarIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Profile Completion Banner */}
        <ProfileCompletionBanner user={user} latestCycle={latestCycle} />

        {/* Premium Banner for Free Users */}
        {user && getUserTier(user) === TIERS.FREE && <PremiumBanner />}

        {/* Upgrade Banner for Restricted Mode */}
        {isModeRestricted && (
          <UpgradeBanner feature={`${cycleType.charAt(0).toUpperCase() + cycleType.slice(1)} Tracking`} />
        )}



        {/* Cycle-aware smart banners — includes period-end reminder */}
        <CycleBanners
          user={user}
          cycles={cycles}
          entries={entries}
          cycleType={cycleType}
          cycleDay={cycleDay}
          transitionMode={user?.current_situation === "stopped_contraception"}
          showPmddNudge={isMenstrual && cycles.length < 2 && entries.length > 0}
          periodEndCycle={showPeriodEndReminder && activeCycles.length > 0 ? activeCycles[0] : null}
          onDismissPeriodEnd={() => setDismissedPeriodEndReminder(activeCycles[0]?.id)}
        />

        {showCycleSettings && (
          <CycleSettingsModal
            latestCycle={latestCycle}
            user={user}
            onClose={() => {
              setShowCycleSettings(false);
              queryClient.invalidateQueries({ queryKey: ["cycles"] });
            }}
          />
        )}

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

        {/* Daily Health Log CTA — Hero */}
        <button
          onClick={() => navigate("/log")}
          className="w-full rounded-3xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all p-5 text-left relative overflow-hidden"
        >
          <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-8 -right-2 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />

          <div className="flex items-center justify-between gap-3 relative">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 shadow-sm">
                {todayEntry ? <Check className="w-6 h-6 text-white" /> : <PenLine className="w-6 h-6 text-white" />}
              </div>
              <div>
                <p className="text-base font-bold text-white">
                  {todayEntry ? "Update Today's Log" : "Log Today's Health"}
                </p>
                <p className="text-sm text-white/75 mt-0.5">
                  {todayEntry
                    ? `${filledCount} symptom${filledCount !== 1 ? "s" : ""} rated — tap to update`
                    : `Record symptoms${isMenstrual && cycleDay ? `, cycle day ${cycleDay}` : ""}, flow & more`}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/70 shrink-0" />
          </div>

          <div className="mt-3.5 flex gap-2 flex-wrap relative">
            {isMenstrual && cycleDay && (
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/20 text-white font-semibold">Day {cycleDay}</span>
            )}
            {cycleType === "pregnancy" && (
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/20 text-white font-semibold">🤰 Pregnancy</span>
            )}
            {cycleType === "postpartum" && (
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/20 text-white font-semibold">🍼 Postpartum</span>
            )}
            {todayEntry
              ? <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/20 text-white font-semibold">✓ Logged today</span>
              : <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/20 text-white font-semibold">Not logged yet</span>
            }
          </div>

          {cycleType === "pregnancy" && latestCycle && !dismissedPregnancyStatus && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDismissedPregnancyStatus(true);
                localStorage.setItem("dismissed-pregnancy-status", "true");
              }}
              className="mt-2 text-[10px] text-white/50 hover:text-white/80 underline"
            >
              Dismiss pregnancy status
            </button>
          )}
        </button>

        {/* Cycle Profile summary */}
        <CycleProfileSummary
          user={user}
          latestCycle={latestCycle}
          cycleType={cycleType}
          cycles={cycles}
          compact
        />

        {/* Cycle Phase — just below Cycle Profile */}
        <ModeBanner
          latestCycle={latestCycle}
          cycleDay={cycleDay}
          onSwitchMode={() => setShowModeSwitcher(true)}
          onCycleSettings={() => setShowCycleSettings(true)}
        />

        {/* Today's Severity Card */}
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
        <div id="streak-section">
          <StreakWidget entries={entries} />
        </div>
        <StreakBadges entries={entries} />
        <RecentInsightsWidget entries={entries} />
        <NextMilestoneWidget cycleType={cycleType} latestCycle={latestCycle} cycleLength={cycleLength} />
        <QuickLinksRow />

        <p className="text-[10px] text-muted-foreground text-center">
          ⚕️ CycleMind is not a substitute for professional medical advice.
        </p>
      </div>
    </div>
  );
}