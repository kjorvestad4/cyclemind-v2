import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { differenceInDays, format } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend, ReferenceLine,
} from "recharts";
import { AlertTriangle, CheckCircle, Info, TrendingUp, Activity, Brain, Heart } from "lucide-react";
import { ALL_SYMPTOMS, SYMPTOM_CATEGORIES, calculateDayTotal } from "@/lib/symptoms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PdfReportButton from "@/components/insights/PdfReportButton";
import ShareWithDoctor from "@/components/insights/ShareWithDoctor";
import LoggedDataSummary from "@/components/insights/LoggedDataSummary";

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
    const sorted = [...allCycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
    return sorted.slice(0, selectedCycles);
  }, [allCycles, selectedCycles]);

  const latestCycle = useMemo(() => {
    if (!allCycles.length) return null;
    return [...allCycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date))[0];
  }, [allCycles]);

  const isPerinatal = latestCycle?.cycle_type === "pregnancy" || latestCycle?.cycle_type === "postpartum";

  const analysis = useMemo(() => computeAnalysis(cycles, entries), [cycles, entries]);
  const moodTrend = useMemo(() => computeMoodTrend(entries, cycles), [entries, cycles]);
  const bleedingTimeline = useMemo(() => computeBleedingTimeline(entries, cycles), [entries, cycles]);
  const heatmapData = useMemo(() => computeHeatmap(entries, cycles), [entries, cycles]);

  const hasData = cycles.length >= 1 && entries.length > 0;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-serif text-2xl font-semibold">Insights</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Based on your tracked data — for clinical discussion only</p>
          </div>
          {hasData && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Show last:</span>
              {[1, 2, 3, 6].map((n) => (
                <button
                  key={n}
                  onClick={() => setSelectedCycles(n)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    selectedCycles === n
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {n} cycle{n > 1 ? "s" : ""}
                </button>
              ))}
            </div>
          )}
        </div>

        {hasData && (
          <PdfReportButton cycles={cycles} entries={entries} analysis={analysis} user={user} />
        )}
      </div>

      {!hasData && (
        <div className="bg-card rounded-2xl border border-border/50 p-10 text-center space-y-3">
          <Info className="w-10 h-10 text-primary mx-auto" />
          <p className="font-semibold text-lg">No Data Yet</p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Start logging daily symptoms to unlock insights and clinical-grade reports.
          </p>
        </div>
      )}

      {/* KEY METRICS */}
      {hasData && (
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            icon={<Brain className="w-4 h-4 text-primary" />}
            label="Avg Luteal Severity"
            value={analysis.avgLutealSeverity !== null ? analysis.avgLutealSeverity.toFixed(1) : "—"}
            sub={analysis.avgLutealSeverity !== null ? severityLabel(analysis.avgLutealSeverity) : "Not enough data"}
            highlight={analysis.avgLutealSeverity >= 4}
          />
          <MetricCard
            icon={<Activity className="w-4 h-4 text-chart-2" />}
            label="Avg Cycle Length"
            value={analysis.avgCycleLength ? `${analysis.avgCycleLength}d` : "—"}
            sub={analysis.cycleLengthVariance ? `±${analysis.cycleLengthVariance}d variance` : "Recording…"}
            highlight={false}
          />
          <MetricCard
            icon={<Heart className="w-4 h-4 text-chart-3" />}
            label="Avg PHQ-9 (Luteal)"
            value={analysis.avgPHQ9Luteal !== null ? analysis.avgPHQ9Luteal.toFixed(0) : "—"}
            sub={analysis.avgPHQ9Luteal !== null ? phq9Label(analysis.avgPHQ9Luteal) : "Complete PHQ-9 to track"}
            highlight={analysis.avgPHQ9Luteal >= 10}
          />
          <MetricCard
            icon={<TrendingUp className="w-4 h-4 text-chart-5" />}
            label="Avg GAD-7 (Luteal)"
            value={analysis.avgGAD7Luteal !== null ? analysis.avgGAD7Luteal.toFixed(0) : "—"}
            sub={analysis.avgGAD7Luteal !== null ? gad7Label(analysis.avgGAD7Luteal) : "Complete GAD-7 to track"}
            highlight={analysis.avgGAD7Luteal >= 10}
          />
        </div>
      )}

      {/* PATTERN INSIGHTS */}
      {cycles.length >= 2 && analysis.insights.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">Pattern Insights</p>
          {analysis.insights.map((ins, i) => (
            <div
              key={i}
              className={`rounded-2xl border p-4 flex gap-3 items-start ${
                ins.type === "alert"
                  ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40"
                  : ins.type === "warning"
                  ? "border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/40"
                  : "border-border/50 bg-card"
              }`}
            >
              <span className="text-lg shrink-0">{ins.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-foreground">{ins.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{ins.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DIAGNOSTIC FLAGS */}
      {cycles.length >= 2 && <DiagnosticFlags analysis={analysis} />}

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

      {/* PHASE COMPARISON */}
      {analysis.phaseComparison && analysis.phaseComparison.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Luteal vs Follicular — Top Symptoms</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={analysis.phaseComparison} layout="vertical" margin={{ left: 4, right: 24, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 6]} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={104} />
                <Tooltip {...CHART_TOOLTIP_STYLE} />
                <Bar dataKey="luteal" fill="hsl(var(--chart-1))" name="Luteal" radius={[0, 4, 4, 0]} />
                <Bar dataKey="follicular" fill="hsl(var(--chart-2))" name="Follicular" radius={[0, 4, 4, 0]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* MOOD / PHYSICAL TREND */}
      {moodTrend.length > 2 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Mood vs Physical Symptoms — Daily Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={moodTrend} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 8 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip {...CHART_TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="mood" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} name="Mood" />
                <Line type="monotone" dataKey="physical" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} name="Physical" />
                <Line type="monotone" dataKey="total" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} dot={false} name="Total" strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Screening Trend — EPDS for perinatal, PHQ-9+GAD-7 otherwise */}
      {analysis.screeningTrend.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              {isPerinatal ? "EPDS & GAD-7 Over Time" : "PHQ-9 & GAD-7 Over Time"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={analysis.screeningTrend} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 8 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip {...CHART_TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine y={10} stroke="hsl(var(--destructive))" strokeDasharray="3 2" label={{ value: "≥10", position: "right", fontSize: 9 }} />
                {isPerinatal ? (
                  <Line type="monotone" dataKey="epds" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={true} name="EPDS" connectNulls={false} />
                ) : (
                  <Line type="monotone" dataKey="phq9" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={true} name="PHQ-9" connectNulls={false} />
                )}
                <Line type="monotone" dataKey="gad7" stroke="hsl(var(--chart-5))" strokeWidth={2} dot={true} name="GAD-7" connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">
              {isPerinatal
                ? "EPDS ≥10 suggests possible depression — discuss with your midwife or OB. Complete EPDS on the Log page."
                : "Dashed red = moderate threshold (≥10). Complete PHQ-9/GAD-7 on the Log page to populate."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* BLEEDING TIMELINE */}
      {bleedingTimeline.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Bleeding Intensity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={bleedingTimeline} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 8 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 9 }} domain={[0, 4]} tickFormatter={(v) => ["", "Spot", "Light", "Med", "Heavy"][v] || ""} width={36} />
                <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(v) => [["None", "Spotting", "Light", "Medium", "Heavy"][v] || v, "Flow"]} />
                <Bar dataKey="intensity" fill="hsl(var(--chart-3))" radius={[3, 3, 0, 0]} name="Bleeding" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* HEATMAP */}
      {heatmapData.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Symptom Heatmap by Cycle Day</CardTitle>
          </CardHeader>
          <CardContent>
            <SymptomHeatmap data={heatmapData} />
          </CardContent>
        </Card>
      )}

      {/* LOGGED DATA SUMMARY — Vitals, Intimacy, Flow, Meds, Ovulation, CM, Custom Symptoms, Mode-Specific Trends */}
      {hasData && <LoggedDataSummary entries={entries} cycles={cycles} cycleType={latestCycle?.cycle_type || "menstrual"} />}

      {/* SHARE WITH DOCTOR */}
      {hasData && (
        <Card className="border-primary/20 bg-primary/3">
          <CardContent className="pt-5 pb-5">
            <ShareWithDoctor cycles={cycles} entries={entries} analysis={analysis} />
          </CardContent>
        </Card>
      )}

      <Disclaimer />
    </div>
  );
}

function MetricCard({ icon, label, value, sub, highlight }) {
  return (
    <div className={`bg-card rounded-2xl border p-4 space-y-1 ${highlight ? "border-orange-200 dark:border-orange-900" : "border-border/50"}`}>
      <div className="flex items-center gap-1.5">{icon}<span className="text-[11px] text-muted-foreground font-medium">{label}</span></div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{sub}</p>
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
    <div className={`rounded-xl border p-3.5 flex gap-3 items-start ${ok ? "border-primary/30 bg-primary/5" : "border-border/40 bg-card"}`}>
      {ok ? <AlertTriangle className="w-4 h-4 text-primary shrink-0 mt-0.5" /> : <CheckCircle className="w-4 h-4 text-chart-2 shrink-0 mt-0.5" />}
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