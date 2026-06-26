import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, PenLine, BarChart3, BookOpen, User, LogOut, ChevronLeft, Flame } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { getCycleDay } from "@/lib/symptoms";
import { calculateEDD, getPregnancyWeek } from "@/lib/eddCalculation";
import { format, subDays } from "date-fns";
import LunaButton from "@/components/luna/LunaButton";
import { useAuth } from "@/lib/AuthContext";
import GuidedTour from "@/components/common/GuidedTour";

const NAV_ITEMS = [
{ path: "/dashboard", icon: LayoutDashboard, label: "Dashboard", tourId: "tour-dashboard" },
{ path: "/log", icon: PenLine, label: "Log", tourId: "tour-log" },
{ path: "/insights", icon: BarChart3, label: "Insights", tourId: "tour-insights" },
{ path: "/resources", icon: BookOpen, label: "Resources", tourId: "tour-resources" },
{ path: "/profile", icon: User, label: "Profile", tourId: "tour-profile" }];


const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/log": "Daily Log",
  "/insights": "Insights",
  "/resources": "Resources",
  "/profile": "Profile"
};

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useScrollPosition(location.pathname);
  const { user } = useAuth();
  const [cycleData, setCycleData] = useState({ mode: 'menstrual', day: null, edd: null, phase: null, fertilityMode: false, menopauseStage: null });
  const [streak, setStreak] = useState(0);

  const isTopLevel = Object.keys(PAGE_TITLES).includes(location.pathname);
  const pageTitle = PAGE_TITLES[location.pathname] || "CycleMind";

  useEffect(() => {
    if (!user) return;
    const loadCycleData = async () => {
      try {
        const cycles = await base44.entities.Cycle.filter({ created_by: user.email }, "-start_date", 5);
        if (cycles.length > 0) {
          const latestCycle = cycles[0];
          const cycleDay = getCycleDay(format(new Date(), "yyyy-MM-dd"), cycles);
          const cycleType = latestCycle.cycle_type || 'menstrual';

          // Derive phase from cycle day using user's cycle profile settings
          let phase = latestCycle.phase || null;
          if (!phase && cycleDay && (cycleType === 'menstrual' || cycleType === 'perimenopause')) {
            const userPeriodLength = user?.menstruation_length || 5;
            const userCycleLength = user?.cycle_length || latestCycle.cycle_length || 28;
            const userLutealLength = user?.luteal_phase_length || 14;
            const userOvulationDay = user?.ovulation_day || (userCycleLength - userLutealLength);
            if (cycleDay <= userPeriodLength) phase = 'menstrual';
            else if (cycleDay < userOvulationDay) phase = 'follicular';
            else if (cycleDay === userOvulationDay) phase = 'ovulatory';
            else phase = 'luteal';
          }

          // Build proper eddInfo object for pregnancy mode
          let eddInfo = null;
          if (cycleType === 'pregnancy') {
            const eddCalc = calculateEDD(latestCycle.ovulation_date, latestCycle.last_menstrual_period);
            const edd = eddCalc?.edd || latestCycle.estimated_due_date;
            if (edd) {
              const baselineDate = eddCalc?.baselineDate || latestCycle.last_menstrual_period;
              const week = getPregnancyWeek(baselineDate) ?? latestCycle.pregnancy_week ?? 0;
              let trimester = 'first';
              if (week >= 27) trimester = 'third';
              else if (week >= 13) trimester = 'second';
              eddInfo = { edd, week, trimester };
            }
          }

          // Derive menopause stage and fertility flag
          const menopauseStage = (cycleType === 'menopause' || cycleType === 'perimenopause') ? cycleType : null;
          const fertilityMode = cycleType === 'fertility';

          setCycleData({
            mode: cycleType,
            day: cycleDay || null,
            edd: eddInfo,
            phase,
            fertilityMode,
            menopauseStage,
          });
        }
      } catch (err) {
        console.error('Failed to load cycle data for Luna:', err);
      }
    };
    loadCycleData();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    base44.entities.DailyEntry.filter({ created_by: user.email }, "-date", 400).then((entries) => {
      let s = 0;
      const today = new Date();
      // Allow today to be unlogged without breaking the streak
      const todayStr = format(today, "yyyy-MM-dd");
      const startDay = entries.find((e) => e.date === todayStr) ? 0 : 1;
      for (let i = startDay; i < 400; i++) {
        const d = format(subDays(today, i), "yyyy-MM-dd");
        if (entries.find((e) => e.date === d)) s++; else break;
      }
      setStreak(s);
    }).catch(() => {});
  }, [user]);

  return (
    <div className="bg-background flex flex-col overflow-hidden" style={{ height: '100dvh', maxHeight: '100dvh' }}>
      {/* Header */}
      <header
        className="shrink-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50"
        style={{ paddingTop: "env(safe-area-inset-top)" }}>
        
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          {isTopLevel ? (
          /* Brand logo on top-level pages */
          <>
              <Link to="/dashboard" className="flex items-center gap-2 py-1 px-1 -mx-1 rounded-lg min-w-0">
                <img
                src="https://media.base44.com/images/public/69fb50354d2f1f828f13182f/1f6e3c73e_generated_image.png"
                alt="CycleMind"
                className="w-8 h-8 rounded-xl object-cover shrink-0" />
              
                <h1 className="font-serif text-lg font-semibold text-foreground">CycleMind</h1>
              </Link>
              <div className="flex items-center gap-2 shrink-0">
                <p className="text-[10px] text-muted-foreground max-w-[100px] text-right leading-tight hidden sm:block">
                  Not medical advice. Always consult your doctor.
                </p>
                <button
                onClick={() => base44.auth.logout("/welcome")}
                className="flex flex-col items-center gap-0.5 hover:bg-muted rounded-xl px-2 py-1 transition-colors"
                aria-label="Sign out">
                
                  <LogOut className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground font-medium">Sign out</span>
                </button>
              </div>
            </>) : (

          /* Back button + page title on child paths */
          <>
              






            
              <h1 className="font-serif text-base font-semibold text-foreground absolute left-1/2 -translate-x-1/2">{pageTitle}</h1>
              <div className="w-16" /> {/* spacer to balance the back button */}
            </>)
          }
        </div>
      </header>

      {/* Main Content */}
      <main
        ref={mainRef}
        className="flex-1 min-h-0 overflow-y-auto"
        style={{ overscrollBehavior: "none" }}>
        
        <div className="max-w-2xl mx-auto w-full px-4 py-6 pb-6">
          <Outlet />
        </div>
      </main>

      {/* Luna AI Button */}
      <LunaButton user={user} cycleMode={cycleData.mode} cycleDay={cycleData.day} cyclePhase={cycleData.phase} eddInfo={cycleData.edd} fertilityMode={cycleData.fertilityMode} menopauseStage={cycleData.menopauseStage} />
      <GuidedTour />

      {/* Bottom Navigation */}
      <nav
        className="shrink-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border/50 shadow-lg"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        
        <div className="max-w-lg mx-auto flex justify-around py-2 px-2">
          {NAV_ITEMS.map(({ path, icon: Icon, label, tourId }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                id={tourId}
                onClick={() => {
                  if (isActive) {
                    // Re-click on active tab: scroll to top
                    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                  } else {
                    navigate(path);
                  }
                }}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                isActive ?
                "text-primary bg-primary/10" :
                "text-muted-foreground hover:text-foreground"}`
                }>
                
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium">{label}</span>
              </button>);

          })}
        </div>
      </nav>
    </div>);

}