import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { differenceInDays, format } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend, ReferenceLine,
} from "recharts";
import { AlertTriangle, CheckCircle, Info, TrendingUp, Activity, Brain, Heart, Filter, X, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { ALL_SYMPTOMS, SYMPTOM_CATEGORIES, calculateDayTotal } from "@/lib/symptoms";
import { getUserTier, TIERS } from "@/lib/freemium";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PremiumBanner from "@/components/common/PremiumBanner";
import PdfReportButton from "@/components/insights/PdfReportButton";
import ShareWithDoctor from "@/components/insights/ShareWithDoctor";
import LoggedDataSummary from "@/components/insights/LoggedDataSummary";
import AdminActionsPanel from "@/components/insights/AdminActionsPanel";
import DateRangePresets from "@/components/insights/DateRangePresets";
import ProgressCelebration from "@/components/insights/ProgressCelebration";
import InsightCard from "@/components/insights/InsightCard";
import DRSPPhaseComparison from "@/components/insights/DRSPPhaseComparison";
import SymptomAccordions from "@/components/insights/SymptomAccordions";
import TrendsTab from "@/components/insights/TrendsTab";

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 10,
    fontSize: 11,
    color: "hsl(var(--foreground))",
  },
};

export default function Insights() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedCycles, setSelectedCycles] = useState(3);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const hasDateFilter = dateFrom || dateTo;

  const handlePresetChange = (from, to) => {
    setDateFrom(from);
    setDateTo(to);
  };

  const handleClearDates = () => {
    setDateFrom("");
    setDateTo("");
  };

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: allCycles = [] } = useQuery({
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
      return base44.entities.DailyEntry.filter({ created_by: user.email }, "-date", 500);
    },
  });

  const cycles = useMemo(() => {
    let sorted = [...allCycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
    if (hasDateFilter) {
      sorted = sorted.filter((c) => {
        if (dateFrom && c.start_date < dateFrom) return false;
        if (dateTo && c.start_date > dateTo) return false;
        return true;
      });
    } else {
      sorted = sorted.slice(0, selectedCycles);
    }
    return sorted;
  }, [allCycles, selectedCycles, dateFrom, dateTo, hasDateFilter]);

  const filteredEntries = useMemo(() => {
    if (!hasDateFilter) return entries;
    return entries.filter((e) => {
      if (dateFrom && e.date < dateFrom) return false;
      if (dateTo && e.date > dateTo) return false;
      return true;
    });
  }, [entries, dateFrom, dateTo, hasDateFilter]);

  const latestCycle = useMemo(() => {
    if (!allCycles.length) return null;
    return [...allCycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date))[0];
  }, [allCycles]);

  const isPerinatal = latestCycle?.cycle_type === "pregnancy" || latestCycle?.cycle_type === "postpartum";

  const analysis = useMemo(() => computeAnalysis(cycles, filteredEntries), [cycles, filteredEntries]);
  const moodTrend = useMemo(() => computeMoodTrend(filteredEntries, cycles), [filteredEntries, cycles]);
  const bleedingTimeline = useMemo(() => computeBleedingTimeline(filteredEntries, cycles), [filteredEntries, cycles]);
  const heatmapData = useMemo(() => computeHeatmap(filteredEntries, cycles), [filteredEntries, cycles]);

  const hasData = cycles.length >= 1 && filteredEntries.length > 0;

  return (
    <div className="space-y-6 pb-10">
      {/* Premium Banner for Free Users */}
      {user && getUserTier(user) === TIERS.FREE && (
        <PremiumBanner />
      )}

      {/* Header */}
      <div className="space-y-3">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 rounded-3xl border border-primary/20 p-5 space-y-3">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground">Your Insights</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Pattern analysis from your tracked data</p>
            </div>
            {hasData && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground font-medium">Last:</span>
                {[1, 2, 3, 6].map((n) => (
                  <button
                    key={n}
                    onClick={() => setSelectedCycles(n)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      selectedCycles === n
                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                        : "bg-card/50 border-border/50 text-muted-foreground hover:bg-muted/60"
                    }`}
                  >
                    {n} cycle{n > 1 ? "s" : ""}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Range Filter - Compact */}
          {hasData && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-primary/10">
              <Filter className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-xs text-muted-foreground font-medium">Custom range:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-7 px-2 text-xs rounded-lg border border-input bg-background text-foreground"
              />
              <span className="text-xs text-muted-foreground">→</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-7 px-2 text-xs rounded-lg border border-input bg-background text-foreground"
              />
              {hasDateFilter && (
                <button
                  onClick={() => { setDateFrom(""); setDateTo(""); }}
                  className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 font-medium"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
              {hasDateFilter && (
                <span className="text-[10px] text-muted-foreground ml-auto bg-primary/10 px-2 py-0.5 rounded-full font-medium">
                  {cycles.length} cycle{cycles.length !== 1 ? "s" : ""} · {filteredEntries.length} entries
                </span>
              )}
            </div>
          )}
        </div>

      {hasData && (
          user && getUserTier(user) === TIERS.FREE ? (
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-4">
              <p className="text-sm font-semibold text-foreground">Want a clinical report?</p>
              <p className="text-xs text-muted-foreground mt-0.5">Upgrade to Premium to generate and download PDF reports.</p>
              <button onClick={() => window.location.href = '/billing'} className="mt-3 px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Upgrade Now
              </button>
            </div>
          ) : (
            <PdfReportButton cycles={cycles} entries={entries} analysis={analysis} user={user} />
          )
        )}
      </div>

      {/* 2-cycle guidance banner */}
      {hasData && cycles.length < 2 && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex gap-3 items-start">
          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">Keep logging for full PMDD analysis</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">DSM-5 requires 2+ full cycles of prospective daily data to identify PMDD patterns. You're on cycle 1 — great start!</p>
          </div>
        </div>
      )}

      {!hasData && (
        <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl border border-primary/20 p-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Info className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="font-serif text-xl font-bold text-foreground">Start Your Tracking Journey</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Log your first symptoms to unlock personalized insights, pattern detection, and clinical reports you can share with your healthcare provider.
            </p>
          </div>
          <button
            onClick={() => navigate('/log')}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            Log Today's Symptoms →
          </button>
        </div>
      )}

      {/* TABBED INTERFACE TO REDUCE SCROLLING */}
      {hasData && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="history" className="hidden lg:flex">History</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB - Key metrics & insights */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                icon={<Brain className="w-4 h-4" />}
                label="Avg Luteal Severity"
                value={analysis.avgLutealSeverity !== null ? analysis.avgLutealSeverity.toFixed(1) : "—"}
                sub={analysis.avgLutealSeverity !== null ? severityLabel(analysis.avgLutealSeverity) : "Not enough data"}
                highlight={analysis.avgLutealSeverity >= 4}
                gradient="from-primary/10 to-primary/5"
              />
              <MetricCard
                icon={<Activity className="w-4 h-4" />}
                label="Avg Cycle Length"
                value={analysis.avgCycleLength ? `${analysis.avgCycleLength}d` : "—"}
                sub={analysis.cycleLengthVariance ? `±${analysis.cycleLengthVariance}d variance` : "Recording…"}
                highlight={false}
                gradient="from-chart-2/10 to-chart-2/5"
              />
              <MetricCard
                icon={<Heart className="w-4 h-4" />}
                label="Avg PHQ-9 (Luteal)"
                value={analysis.avgPHQ9Luteal !== null ? analysis.avgPHQ9Luteal.toFixed(0) : "—"}
                sub={analysis.avgPHQ9Luteal !== null ? phq9Label(analysis.avgPHQ9Luteal) : "Complete PHQ-9 to track"}
                highlight={analysis.avgPHQ9Luteal >= 10}
                gradient="from-chart-3/10 to-chart-3/5"
              />
              <MetricCard
                icon={<TrendingUp className="w-4 h-4" />}
                label="Avg GAD-7 (Luteal)"
                value={analysis.avgGAD7Luteal !== null ? analysis.avgGAD7Luteal.toFixed(0) : "—"}
                sub={analysis.avgGAD7Luteal !== null ? gad7Label(analysis.avgGAD7Luteal) : "Complete GAD-7 to track"}
                highlight={analysis.avgGAD7Luteal >= 10}
                gradient="from-chart-5/10 to-chart-5/5"
              />
            </div>

            {/* PATTERN INSIGHTS */}
            {cycles.length >= 2 && analysis.insights.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">Pattern Insights</p>
                {analysis.insights.map((ins, i) => (
                  <InsightCard key={i} insight={ins} />
                ))}
              </div>
            )}

            {/* DIAGNOSTIC FLAGS */}
            {cycles.length >= 2 && <DiagnosticFlags analysis={analysis} />}
          </TabsContent>

          {/* PATTERNS TAB - Phase comparison */}
          <TabsContent value="patterns" className="space-y-4">
            {cycles.length < 2 ? (
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <Info className="w-8 h-8 text-muted-foreground mx-auto" />
                    <p className="text-sm font-semibold text-foreground">Need 2+ cycles for phase analysis</p>
                    <p className="text-xs text-muted-foreground">Keep logging to see luteal vs follicular phase comparisons</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* ENHANCED DRSP PHASE COMPARISON */}
                {analysis.phaseComparison && analysis.phaseComparison.length > 0 ? (
                  <DRSPPhaseComparison phaseComparison={analysis.phaseComparison} />
                ) : (
                  <Card className="border-border/50">
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground text-center">No phase comparison data available yet. Keep logging!</p>
                    </CardContent>
                  </Card>
                )}

                {/* TOP SYMPTOMS BAR */}
                {analysis.topSymptoms && analysis.topSymptoms.length > 0 && (
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold">Most Severe Symptoms (Luteal Phase Avg)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={analysis.topSymptoms.slice(0, 10)} layout="vertical" margin={{ left: 4, right: 28, top: 4, bottom: 4 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                          <XAxis type="number" domain={[0, 6]} tick={{ fontSize: 10 }} tickCount={7} />
                          <YAxis type="category" dataKey="short" tick={{ fontSize: 9 }} width={104} />
                          <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(v) => [v.toFixed(1), "Avg"]} />
                          <ReferenceLine x={3} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 2" />
                          <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} name="Luteal avg" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* SYMPTOMS TAB - Accordion organization */}
          <TabsContent value="symptoms" className="space-y-4">
            <SymptomAccordions entries={filteredEntries} cycles={cycles} cycleType={latestCycle?.cycle_type || "menstrual"} />
          </TabsContent>

          {/* TRENDS TAB - Enhanced accordion organization */}
          <TabsContent value="trends" className="space-y-4">
            <TrendsTab
              moodTrend={moodTrend}
              screeningTrend={analysis.screeningTrend || []}
              bleedingTimeline={bleedingTimeline}
              isPerinatal={isPerinatal}
              cycles={cycles}
            />
          </TabsContent>

          {/* HISTORY TAB - Full data summary (desktop only) */}
          <TabsContent value="history" className="space-y-4 hidden lg:block">
            <LoggedDataSummary entries={filteredEntries} cycles={cycles} cycleType={latestCycle?.cycle_type || "menstrual"} />
          </TabsContent>
        </Tabs>
      )}

      {/* SHARE WITH DOCTOR */}
      {hasData && (
        user && getUserTier(user) === TIERS.FREE ? (
          <Card className="border-primary/20 bg-primary/3">
            <CardContent className="pt-5 pb-5">
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-foreground">Share with your doctor?</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Create shareable links and send your data securely to your healthcare provider.</p>
                </div>
                <button onClick={() => window.location.href = '/billing'} className="px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  Upgrade to Premium
                </button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-primary/20 bg-primary/3">
            <CardContent className="pt-5 pb-5">
              <ShareWithDoctor cycles={cycles} entries={filteredEntries} analysis={analysis} />
            </CardContent>
          </Card>
        )
      )}

      {/* Admin Actions Panel */}
      {user?.role === "admin" && (
        <AdminActionsPanel entries={filteredEntries} />
      )}

      <Disclaimer />
    </div>
  );
}

function MetricCard({ icon, label, value, sub, highlight, gradient }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-4 space-y-1.5 transition-all hover:shadow-md ${
      highlight 
        ? "border-orange-200 dark:border-orange-900 bg-gradient-to-br from-orange-50/80 to-orange-100/40 dark:from-orange-950/40 dark:to-orange-900/20" 
        : `border-border/50 bg-gradient-to-br ${gradient || "from-card/80 to-card/40"}`
    }`}>
      <div className="flex items-center gap-1.5">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${highlight ? "bg-orange-100 dark:bg-orange-900" : "bg-primary/10"}`}>
          {icon}
        </div>
        <span className="text-[11px] text-muted-foreground font-medium leading-tight">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
      <p className="text-[10px] text-muted-foreground leading-tight">{sub}</p>
    </div>
  );
}

function DiagnosticFlags({ analysis }) {
  const { mensesDayTotal, highLutealItems, percentGreater, meetsThreshold } = analysis;
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">DRSP Diagnostic Indicators</p>
      {mensesDayTotal !== null && (
        <FlagCard
          ok={mensesDayTotal >= 50}
          title={`Day 1 Menses Total: ${mensesDayTotal}`}
          note={mensesDayTotal >= 50 ? "Score ≥ 50 — consistent with PMS/PMDD pattern" : "Score < 50 — consider discussing other diagnoses with your doctor"}
        />
      )}
      {highLutealItems !== null && (
        <FlagCard
          ok={highLutealItems > 3}
          title={`${highLutealItems} symptoms avg above mild (>3) in luteal phase`}
          note={highLutealItems > 3 ? "Elevated symptom burden meets severity threshold" : "3 or fewer items averaged above mild"}
        />
      )}
      {percentGreater !== null && (
        <FlagCard
          ok={meetsThreshold}
          title={`Luteal is ${percentGreater.toFixed(0)}% greater than follicular`}
          note={meetsThreshold ? "≥ 30% luteal increase — pattern consistent with PMS/PMDD. Discuss with your provider." : "< 30% phase difference"}
        />
      )}
    </div>
  );
}

function FlagCard({ ok, title, note }) {
  return (
    <div className={`rounded-xl border p-3.5 flex gap-3 items-start ${ok ? "border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/40" : "border-border/40 bg-card"}`}>
      {ok ? <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" /> : <CheckCircle className="w-4 h-4 text-chart-2 shrink-0 mt-0.5" />}
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{note}</p>
      </div>
    </div>
  );
}

function SymptomHeatmap({ data }) {
  const days = [...new Set(data.map((d) => d.day))].sort((a, b) => a - b);
  const symptoms = [...new Set(data.map((d) => d.symptom))];
  const lookup = {};
  data.forEach((d) => { lookup[`${d.day}-${d.symptom}`] = d.avg; });

  const cellColor = (v) => {
    if (!v || v < 0.5) return "bg-muted/30";
    if (v < 1.5) return "bg-emerald-200/60 dark:bg-emerald-900/40";
    if (v < 2.5) return "bg-yellow-200/60 dark:bg-yellow-900/40";
    if (v < 3.5) return "bg-orange-200/60 dark:bg-orange-900/40";
    return "bg-red-300/60 dark:bg-red-900/50";
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        <div className="flex gap-0.5 mb-1 ml-20">
          {days.map((d) => (
            <div key={d} className="w-6 text-center text-[9px] text-muted-foreground font-medium">{d}</div>
          ))}
        </div>
        {symptoms.slice(0, 12).map((sym) => (
          <div key={sym} className="flex items-center gap-0.5 mb-0.5">
            <div className="w-20 text-[9px] text-muted-foreground truncate text-right pr-1 shrink-0">{sym}</div>
            {days.map((d) => {
              const v = lookup[`${d}-${sym}`];
              return (
                <div key={d} className={`w-6 h-5 rounded-sm ${cellColor(v)}`} title={`Day ${d} · ${sym}: ${v ? v.toFixed(1) : "—"}`} />
              );
            })}
          </div>
        ))}
        <div className="flex items-center gap-2 mt-3 justify-end text-[10px] text-muted-foreground flex-wrap">
          {[["bg-muted/30", "None"], ["bg-emerald-200/60", "Low"], ["bg-yellow-200/60", "Mild"], ["bg-orange-200/60", "Moderate"], ["bg-red-300/60", "Severe"]].map(([cls, lbl]) => (
            <span key={lbl} className="flex items-center gap-1">
              <span className={`w-4 h-4 rounded-sm ${cls} inline-block border border-border/30`} />
              {lbl}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Disclaimer() {
  return (
    <div className="bg-muted/40 rounded-xl p-4 text-center">
      <p className="text-[10px] text-muted-foreground leading-relaxed">
        ⚕️ Based on the Daily Record of Severity of Problems (DRSP) — Endicott, Nee & Harrison (2006).
        This tool provides informational insights only. <strong>Not a diagnostic tool.</strong> Always consult a qualified healthcare provider.
      </p>
    </div>
  );
}

function severityLabel(v) {
  if (v < 1.5) return "Minimal";
  if (v < 2.5) return "Mild";
  if (v < 3.5) return "Moderate";
  if (v < 4.5) return "Severe";
  return "Extreme";
}
function phq9Label(v) {
  if (v < 5) return "Minimal depression";
  if (v < 10) return "Mild depression";
  if (v < 15) return "Moderate depression";
  if (v < 20) return "Moderately severe";
  return "Severe depression";
}
function gad7Label(v) {
  if (v < 5) return "Minimal anxiety";
  if (v < 10) return "Mild anxiety";
  if (v < 15) return "Moderate anxiety";
  return "Severe anxiety";
}

function computeAnalysis(cycles, entries) {
  const result = {
    mensesDayTotal: null,
    highLutealItems: null,
    percentGreater: null,
    meetsThreshold: false,
    phaseComparison: null,
    topSymptoms: null,
    avgLutealSeverity: null,
    avgCycleLength: null,
    cycleLengthVariance: null,
    avgPHQ9Luteal: null,
    avgGAD7Luteal: null,
    screeningTrend: [],
    insights: [],
  };

  if (entries.length === 0) return result;

  const sortedCycles = [...cycles].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

  if (sortedCycles.length >= 2) {
    const lengths = [];
    for (let i = 0; i < sortedCycles.length - 1; i++) {
      const len = differenceInDays(new Date(sortedCycles[i + 1].start_date), new Date(sortedCycles[i].start_date));
      if (len > 14 && len < 60) lengths.push(len);
    }
    if (lengths.length > 0) {
      result.avgCycleLength = Math.round(lengths.reduce((a, b) => a + b) / lengths.length);
      result.cycleLengthVariance = Math.round(Math.max(...lengths) - Math.min(...lengths));
    }
  }

  const entryMap = {};
  entries.forEach((e) => { entryMap[e.date] = e; });

  if (sortedCycles.length > 0) {
    const latestStart = sortedCycles[sortedCycles.length - 1].start_date;
    const day1 = entryMap[latestStart];
    if (day1) result.mensesDayTotal = calculateDayTotal(day1);
  }

  if (sortedCycles.length < 2) {
    result.screeningTrend = entries
      .filter((e) => e.phq9_score > 0 || e.gad7_score > 0 || e.epds_score > 0)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((e) => ({ date: format(new Date(e.date), "M/d"), phq9: e.phq9_score || null, gad7: e.gad7_score || null, epds: e.epds_score || null }));
    return result;
  }

  const lutealEntries = [];
  const follicularEntries = [];

  for (let i = 0; i < sortedCycles.length; i++) {
    const cycleStart = new Date(sortedCycles[i].start_date);
    const nextStart = sortedCycles[i + 1] ? new Date(sortedCycles[i + 1].start_date) : null;
    const cycleLen = nextStart ? differenceInDays(nextStart, cycleStart) : (sortedCycles[i].cycle_length || 28);
    const lutealStart = Math.max(1, cycleLen - 13);

    entries.forEach((entry) => {
      const d = new Date(entry.date);
      const dayNum = differenceInDays(d, cycleStart) + 1;
      if (dayNum >= 1 && dayNum <= cycleLen) {
        if (dayNum >= lutealStart) lutealEntries.push(entry);
        else follicularEntries.push(entry);
      }
    });
  }

  if (lutealEntries.length === 0) return result;

  const lutealAvgs = {};
  const follicularAvgs = {};
  ALL_SYMPTOMS.forEach((s) => {
    const ls = lutealEntries.map((e) => e[s.key] || 0);
    const fs = follicularEntries.length > 0 ? follicularEntries.map((e) => e[s.key] || 0) : [0];
    lutealAvgs[s.key] = ls.reduce((a, b) => a + b, 0) / ls.length;
    follicularAvgs[s.key] = fs.reduce((a, b) => a + b, 0) / fs.length;
  });

  result.highLutealItems = ALL_SYMPTOMS.filter((s) => lutealAvgs[s.key] > 3).length;
  result.avgLutealSeverity = Object.values(lutealAvgs).reduce((a, b) => a + b, 0) / ALL_SYMPTOMS.length;

  result.topSymptoms = ALL_SYMPTOMS
    .map((s) => ({ ...s, avg: parseFloat(lutealAvgs[s.key].toFixed(2)), short: s.shortLabel || s.label.slice(0, 22) }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 12);

  const lutTotal = Object.values(lutealAvgs).reduce((a, b) => a + b, 0);
  const folTotal = Object.values(follicularAvgs).reduce((a, b) => a + b, 0);
  if (folTotal > 0) {
    result.percentGreater = ((lutTotal - folTotal) / folTotal) * 100;
    result.meetsThreshold = result.percentGreater >= 30;
  }

  result.phaseComparison = result.topSymptoms.slice(0, 8).map((s) => ({
    name: s.short,
    luteal: parseFloat(lutealAvgs[s.key].toFixed(1)),
    follicular: parseFloat(follicularAvgs[s.key].toFixed(1)),
  }));

  const phqLuteal = lutealEntries.filter((e) => e.phq9_score > 0).map((e) => e.phq9_score);
  const gadLuteal = lutealEntries.filter((e) => e.gad7_score > 0).map((e) => e.gad7_score);
  if (phqLuteal.length > 0) result.avgPHQ9Luteal = phqLuteal.reduce((a, b) => a + b) / phqLuteal.length;
  if (gadLuteal.length > 0) result.avgGAD7Luteal = gadLuteal.reduce((a, b) => a + b) / gadLuteal.length;

  result.screeningTrend = entries
    .filter((e) => e.phq9_score > 0 || e.gad7_score > 0 || e.epds_score > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({ date: format(new Date(e.date), "M/d"), phq9: e.phq9_score || null, gad7: e.gad7_score || null, epds: e.epds_score || null }));

  const insights = [];
  if (result.meetsThreshold && result.highLutealItems > 3) {
    insights.push({
      emoji: "🔴",
      type: "alert",
      title: "Strong PMDD/PMS pattern detected",
      detail: `Symptoms are ${result.percentGreater.toFixed(0)}% higher in the luteal phase with ${result.highLutealItems} symptoms above mild. Recommend sharing with your psychiatrist or gynecologist.`,
    });
  }
  if (result.avgPHQ9Luteal !== null && result.avgPHQ9Luteal >= 10) {
    insights.push({
      emoji: "🧠",
      type: "warning",
      title: `Luteal phase PHQ-9 avg = ${result.avgPHQ9Luteal.toFixed(0)} (${phq9Label(result.avgPHQ9Luteal)})`,
      detail: "PHQ-9 in the moderate-to-severe range during the luteal phase may indicate PMDD-related depressive episodes. A 2-cycle review is recommended for formal clinical assessment.",
    });
  }
  if (result.avgGAD7Luteal !== null && result.avgGAD7Luteal >= 10) {
    insights.push({
      emoji: "💛",
      type: "warning",
      title: `Luteal phase GAD-7 avg = ${result.avgGAD7Luteal.toFixed(0)} (${gad7Label(result.avgGAD7Luteal)})`,
      detail: "Moderate-to-severe anxiety during the luteal phase. Consider discussing anxiolytic approaches with your provider.",
    });
  }
  if (result.cycleLengthVariance !== null && result.cycleLengthVariance > 7) {
    insights.push({
      emoji: "📅",
      type: "info",
      title: `Cycle length varies by ${result.cycleLengthVariance} days`,
      detail: "High variability can affect symptom predictability. Tracking consistently helps identify your personal luteal window.",
    });
  }
  if (insights.length === 0 && lutealEntries.length >= 7) {
    insights.push({
      emoji: "✅",
      type: "info",
      title: "No strong PMDD pattern detected yet",
      detail: "Continue logging for more cycles to build a reliable picture. Insights improve with 2–3 full cycles of data.",
    });
  }
  result.insights = insights;

  return result;
}

function computeMoodTrend(entries, cycles) {
  const MOOD_KEYS = ["s_depressed", "s_anxious", "s_mood_swings", "s_angry", "s_hopeless", "s_sensitive", "s_overwhelmed", "s_out_of_control"];
  const PHYSICAL_KEYS = ["s_breast_tender", "s_bloating", "s_headache", "s_pain", "s_insomnia", "s_hypersomnia", "s_appetite"];

  if (!cycles.length) return [];
  const firstStart = new Date(Math.min(...cycles.map((c) => new Date(c.start_date).getTime())));

  return [...entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .filter((e) => new Date(e.date) >= firstStart)
    .slice(-60)
    .map((e) => ({
      date: format(new Date(e.date), "M/d"),
      mood: parseFloat((MOOD_KEYS.reduce((s, k) => s + (e[k] || 0), 0) / MOOD_KEYS.length).toFixed(1)),
      physical: parseFloat((PHYSICAL_KEYS.reduce((s, k) => s + (e[k] || 0), 0) / PHYSICAL_KEYS.length).toFixed(1)),
      total: parseFloat((calculateDayTotal(e) / ALL_SYMPTOMS.length).toFixed(1)),
    }));
}

function computeBleedingTimeline(entries, cycles) {
  if (!cycles.length) return [];
  const firstStart = new Date(Math.min(...cycles.map((c) => new Date(c.start_date).getTime())));
  return [...entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .filter((e) => new Date(e.date) >= firstStart && e.bleeding_intensity != null && e.bleeding_intensity > 0)
    .map((e) => ({ date: format(new Date(e.date), "M/d"), intensity: e.bleeding_intensity }));
}

function computeHeatmap(entries, cycles) {
  if (cycles.length < 1) return [];
  const sortedCycles = [...cycles].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
  const byDay = {};

  sortedCycles.forEach((cycle, i) => {
    const start = new Date(cycle.start_date);
    const next = sortedCycles[i + 1] ? new Date(sortedCycles[i + 1].start_date) : null;
    const len = next ? differenceInDays(next, start) : (cycle.cycle_length || 28);

    entries.forEach((entry) => {
      const d = new Date(entry.date);
      const dayNum = differenceInDays(d, start) + 1;
      if (dayNum >= 1 && dayNum <= Math.min(len, 35)) {
        if (!byDay[dayNum]) byDay[dayNum] = {};
        ALL_SYMPTOMS.slice(0, 12).forEach((s) => {
          if (!byDay[dayNum][s.shortLabel]) byDay[dayNum][s.shortLabel] = [];
          byDay[dayNum][s.shortLabel].push(entry[s.key] || 0);
        });
      }
    });
  });

  const result = [];
  Object.keys(byDay).forEach((day) => {
    Object.keys(byDay[day]).forEach((sym) => {
      const vals = byDay[day][sym];
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      result.push({ day: parseInt(day), symptom: sym, avg: parseFloat(avg.toFixed(1)) });
    });
  });
  return result;
}