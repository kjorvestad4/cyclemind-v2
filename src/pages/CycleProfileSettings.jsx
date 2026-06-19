import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, Save, X, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getUserTier, TIERS } from "@/lib/freemium";
import { getCycleDay } from "@/lib/symptoms";
import { calculatePhases } from "@/lib/cycleProfileConfig";
import CycleTimelinePreview from "@/components/cycleprofile/CycleTimelinePreview";
import BasicTab from "@/components/cycleprofile/BasicTab";
import AdvancedTab from "@/components/cycleprofile/AdvancedTab";
import CycleHistoryTable from "@/components/cycleprofile/CycleHistoryTable";

const DEFAULT_PROFILE = {
  cycleLength: 28,
  periodLength: 5,
  lutealLength: 14,
  ovulationDay: 14,
  cycleRegularity: "regular",
  pmddWindowDays: 10,
  track_ovulation_opk: false,
  track_ovulation_bbt: false,
  track_ovulation_mucus: false,
  track_ovulation_pain: false,
  add_mark_ovulation_button: false,
};

export default function CycleProfileSettings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [originalProfile, setOriginalProfile] = useState(DEFAULT_PROFILE);
  const [excludedIds, setExcludedIds] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Luna deep-link: ?action=customize_cycle opens Advanced tab
  useEffect(() => {
    if (searchParams.get("action") === "customize_cycle") {
      setActiveTab("advanced");
    }
  }, [searchParams]);

  // Load user + cycle data
  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      const loaded = {
        ...DEFAULT_PROFILE,
        cycleLength: u?.cycle_length || 28,
        periodLength: u?.menstruation_length || 5,
        lutealLength: u?.luteal_phase_length || 14,
        ovulationDay: u?.ovulation_day || (u?.cycle_length ? u.cycle_length - 14 : 14),
        cycleRegularity: u?.cycle_regularity || "regular",
        pmddWindowDays: u?.pmdd_window_days || 10,
        track_ovulation_opk: !!u?.track_ovulation_opk,
        track_ovulation_bbt: !!u?.track_ovulation_bbt,
        track_ovulation_mucus: !!u?.track_ovulation_mucus,
        track_ovulation_pain: !!u?.track_ovulation_pain,
        add_mark_ovulation_button: !!u?.add_mark_ovulation_button,
      };
      setProfile(loaded);
      setOriginalProfile(loaded);
    }).catch(() => {});
  }, []);

  const { data: cycles = [] } = useQuery({
    queryKey: ["cycles"],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.Cycle.filter({ created_by: u.email }, "-start_date", 50);
    },
  });

  const { data: entries = [] } = useQuery({
    queryKey: ["entries"],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.DailyEntry.filter({ created_by: u.email }, "-date", 400);
    },
  });

  const userTier = getUserTier(user);
  const isPremium = userTier === TIERS.PREMIUM || userTier === TIERS.PREMIUM_PLUS;

  // Learned cycle length from last 6 cycles
  const learnedCycleLength = useMemo(() => {
    const menstrualCycles = cycles
      .filter(c => (c.cycle_type || "menstrual") === "menstrual" && c.cycle_length)
      .slice(0, 6);
    if (menstrualCycles.length === 0) return null;
    const avg = menstrualCycles.reduce((s, c) => s + c.cycle_length, 0) / menstrualCycles.length;
    return Math.round(avg);
  }, [cycles]);

  // Current cycle day for preview marker
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const isMenstrual = cycles.length > 0
    ? (cycles[0]?.cycle_type || "menstrual") === "menstrual"
    : true;
  const currentDay = isMenstrual ? getCycleDay(todayStr, cycles) : null;

  const hasChanges = JSON.stringify(profile) !== JSON.stringify(originalProfile);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        cycle_length: profile.cycleLength,
        menstruation_length: profile.periodLength,
        luteal_phase_length: profile.lutealLength,
        ovulation_day: profile.ovulationDay,
        cycle_regularity: profile.cycleRegularity,
        pmdd_window_days: profile.pmddWindowDays,
        track_ovulation_opk: profile.track_ovulation_opk,
        track_ovulation_bbt: profile.track_ovulation_bbt,
        track_ovulation_mucus: profile.track_ovulation_mucus,
        track_ovulation_pain: profile.track_ovulation_pain,
        add_mark_ovulation_button: profile.add_mark_ovulation_button,
      });

      // Update latest cycle record with new cycle_length
      if (cycles.length > 0 && cycles[0]?.id) {
        await base44.entities.Cycle.update(cycles[0].id, {
          cycle_length: profile.cycleLength,
        });
      }

      await queryClient.invalidateQueries({ queryKey: ["cycles"] });
      setOriginalProfile(profile);
      toast.success("Cycle profile saved!");
    } catch (err) {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      setProfile(originalProfile);
      toast.info("Changes discarded.");
    }
    navigate(-1);
  };

  const handleImprovePredictions = async () => {
    setAnalyzing(true);
    try {
      // Use LLM to analyze cycle patterns
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this user's cycle history and suggest improvements. Cycle lengths from recent cycles: ${JSON.stringify(cycles.filter(c => c.cycle_length).map(c => ({ date: c.start_date, length: c.cycle_length, type: c.cycle_type })))}. User's current settings: cycleLength=${profile.cycleLength}, periodLength=${profile.periodLength}, regularity=${profile.cycleRegularity}. Provide a brief (2-3 sentence) insight about their cycle patterns and whether their current averages seem accurate based on the data. Be warm and friendly.`,
        response_json_schema: {
          type: "object",
          properties: {
            insight: { type: "string" },
            suggested_cycle_length: { type: "number" },
            confidence: { type: "string" },
          },
        },
      });

      if (result?.data) {
        toast.success(result.data.insight || "Analysis complete!", { duration: 6000 });
        if (result.data.suggested_cycle_length && result.data.suggested_cycle_length !== profile.cycleLength) {
          setProfile(prev => ({
            ...prev,
            cycleLength: result.data.suggested_cycle_length,
            ovulationDay: result.data.suggested_cycle_length - prev.lutealLength,
          }));
          toast.info(`Updated cycle length to ${result.data.suggested_cycle_length}d based on your logs.`);
        }
      }
    } catch {
      toast.error("Could not analyze your logs right now.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    if (learnedCycleLength) {
      setProfile(prev => ({
        ...prev,
        cycleLength: learnedCycleLength,
        ovulationDay: learnedCycleLength - prev.lutealLength,
      }));
      toast.success("Reset to learned averages from your logs.");
    } else {
      setProfile(DEFAULT_PROFILE);
      toast.info("Reset to default values (no logged cycles to learn from yet).");
    }
  };

  const handlePreviewReport = () => {
    navigate("/insights");
    toast.info("Your luteal phase settings will appear in the Cycle Summary section of your next clinical report.");
  };

  const handleToggleExclude = (id) => {
    setExcludedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-5xl mx-auto px-4 pt-4 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="font-serif text-xl font-semibold text-foreground">Cycle Profile</h1>
              <p className="text-xs text-muted-foreground">Edit your personal cycle details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel} className="gap-1.5">
              <X className="w-4 h-4" /> Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving || !hasChanges} className="gap-1.5">
              {saving ? <Save className="w-4 h-4 animate-pulse" /> : <Save className="w-4 h-4" />}
              Save
            </Button>
          </div>
        </div>

        {/* Layout: tabs + content on left, preview on right */}
        <div className="grid lg:grid-cols-[1fr_340px] gap-5">
          {/* Left column: tabs + content */}
          <div className="space-y-4">
            {/* Tab bar */}
            <div className="flex gap-1 p-1 rounded-xl bg-muted/50">
              <button
                onClick={() => setActiveTab("basic")}
                className={`flex-1 h-10 rounded-lg text-sm font-medium transition-colors ${activeTab === "basic" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Basic
              </button>
              <button
                onClick={() => setActiveTab("advanced")}
                className={`flex-1 h-10 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${activeTab === "advanced" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Advanced PMDD Power
                {!isPremium && <Sparkles className="w-3 h-3 text-amber-500" />}
              </button>
            </div>

            {/* Tab content */}
            <div className="bg-card rounded-2xl border border-border/50 p-5">
              {activeTab === "basic" ? (
                <BasicTab
                  profile={profile}
                  setProfile={setProfile}
                  learnedCycleLength={learnedCycleLength}
                  onImprovePredictions={handleImprovePredictions}
                  onViewHistory={() => setShowHistory(!showHistory)}
                />
              ) : (
                <AdvancedTab
                  profile={profile}
                  setProfile={setProfile}
                  isPremium={isPremium}
                  onPreviewReport={handlePreviewReport}
                  onReset={handleReset}
                  cycles={cycles}
                  excludedIds={excludedIds}
                  onToggleExclude={handleToggleExclude}
                />
              )}
            </div>

            {/* Cycle history table (collapsible) */}
            {(showHistory || activeTab === "basic") && showHistory && (
              <div className="bg-card rounded-2xl border border-border/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground">Cycle History</h3>
                  <button onClick={() => setShowHistory(false)} className="text-[11px] text-muted-foreground hover:text-foreground">
                    Close
                  </button>
                </div>
                <CycleHistoryTable
                  cycles={cycles}
                  excludedIds={excludedIds}
                  onToggleExclude={handleToggleExclude}
                />
              </div>
            )}
          </div>

          {/* Right column: live preview */}
          <div className="lg:sticky lg:top-4 lg:self-start space-y-4">
            <CycleTimelinePreview profile={profile} currentDay={currentDay} />

            {/* Quick stats */}
            <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Summary</p>
              <div className="space-y-1.5 text-xs">
                <Row label="Cycle length" value={`${profile.cycleLength}d`} />
                <Row label="Period length" value={`${profile.periodLength}d`} />
                <Row label="Luteal phase" value={`${profile.lutealLength}d`} highlight={isPremium} />
                <Row label="PMDD window" value={`${profile.pmddWindowDays}d`} highlight={isPremium} />
                <Row label="Ovulation day" value={`Day ${profile.ovulationDay}`} />
              </div>
              {hasChanges && (
                <div className="flex items-center gap-1.5 pt-2 border-t border-border/40">
                  <Check className="w-3 h-3 text-amber-500" />
                  <p className="text-[10px] text-muted-foreground">Unsaved changes — tap Save to persist</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-bold ${highlight ? "text-primary" : "text-foreground"}`}>{value}</span>
    </div>
  );
}