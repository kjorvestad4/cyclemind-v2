import { useMemo, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { differenceInDays, format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { AlertTriangle, CheckCircle, Info, TrendingUp } from "lucide-react";
import { ALL_SYMPTOMS, calculateDayTotal } from "@/lib/symptoms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PdfReportButton from "@/components/insights/PdfReportButton";

export default function Insights() {
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
    queryFn: () => base44.entities.DailyEntry.list("-date", 500),
  });

  const analysis = useMemo(() => computeAnalysis(cycles, entries), [cycles, entries]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-serif text-2xl font-semibold">{cycles.length >= 2 ? "Insights & Analysis" : "Insights"}</h2>
        {entries.length > 0 && <PdfReportButton cycles={cycles} entries={entries} analysis={analysis} user={user} />}
      </div>

      {cycles.length < 2 && (
        <div className="bg-card rounded-2xl border border-border/50 p-8 text-center space-y-3">
          <Info className="w-10 h-10 text-primary mx-auto" />
          <p className="font-semibold text-lg">Need More Data</p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Log at least two full cycles to unlock diagnostic insights and phase comparisons.
            Keep tracking — you're doing great! 💜
          </p>
        </div>
      )}

      {/* Diagnostic Flags */}
      {cycles.length >= 2 && <DiagnosticCards analysis={analysis} />}

      {/* Phase Comparison */}
      {cycles.length >= 2 && analysis.phaseComparison && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Luteal vs Follicular Phase</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analysis.phaseComparison} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={90} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
                />
                <Bar dataKey="luteal" fill="hsl(var(--chart-1))" name="Luteal" radius={[0, 4, 4, 0]} />
                <Bar dataKey="follicular" fill="hsl(var(--chart-2))" name="Follicular" radius={[0, 4, 4, 0]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Symptom Trend */}
      <RecentTrendChart entries={entries} />

      {/* Top Symptoms */}
      {cycles.length >= 2 && analysis.topSymptoms && analysis.topSymptoms.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Top Luteal Phase Symptoms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {analysis.topSymptoms.map((s, i) => (
              <div key={s.key} className="flex items-center gap-3">
                <span className="text-xs font-semibold text-muted-foreground w-5">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-xs text-foreground">{s.label}</p>
                  <div className="h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(s.avg / 6) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-semibold">{s.avg.toFixed(1)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Disclaimer />
    </div>
  );
}

function DiagnosticCards({ analysis }) {
  const { mensesDayTotal, highLutealItems, percentGreater, meetsThreshold } = analysis;

  return (
    <div className="space-y-3">
      {/* Menses Day 1 Check */}
      {mensesDayTotal !== null && (
        <div className={`rounded-xl p-4 border ${mensesDayTotal < 50 ? "border-yellow-300 bg-yellow-50" : "border-border/50 bg-card"}`}>
          <div className="flex items-start gap-3">
            {mensesDayTotal < 50 ? (
              <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-semibold">Day 1 Total Score: {mensesDayTotal}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {mensesDayTotal < 50
                  ? "Score < 50 on first day of menses. Consider discussing other diagnoses with your doctor."
                  : "Score ≥ 50 on first day of menses — consistent with PMS/PMDD tracking."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Luteal Items > 3 */}
      {highLutealItems !== null && (
        <div className={`rounded-xl p-4 border ${highLutealItems > 3 ? "border-primary/30 bg-primary/5" : "border-border/50 bg-card"}`}>
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">{highLutealItems} symptoms avg &gt; 3 (mild) in luteal phase</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {highLutealItems > 3
                  ? "More than 3 items averaged above mild — proceeding to phase comparison."
                  : "3 or fewer items averaged above mild in the luteal phase."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 30% Threshold */}
      {percentGreater !== null && (
        <div className={`rounded-xl p-4 border ${meetsThreshold ? "border-accent-foreground/30 bg-accent/50" : "border-border/50 bg-card"}`}>
          <div className="flex items-start gap-3">
            {meetsThreshold ? (
              <AlertTriangle className="w-5 h-5 text-accent-foreground shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="w-5 h-5 text-chart-2 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-semibold">
                Luteal is {percentGreater.toFixed(0)}% greater than follicular
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {meetsThreshold
                  ? "≥30% increase suggests a pattern consistent with PMS/PMDD. Discuss with your healthcare provider."
                  : "< 30% difference between phases."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RecentTrendChart({ entries }) {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
  const data = sorted.map((e) => ({
    date: format(new Date(e.date), "M/d"),
    total: calculateDayTotal(e),
  }));

  if (data.length === 0) return null;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Daily Total Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 9 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
            />
            <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function Disclaimer() {
  return (
    <div className="bg-muted/50 rounded-xl p-4 text-center">
      <p className="text-[10px] text-muted-foreground leading-relaxed">
        ⚕️ This tool is based on the Daily Record of Severity of Problems (DRSP) and provides
        informational insights only. It is <strong>not a diagnostic tool</strong> and is not a substitute
        for professional medical advice, diagnosis, or treatment. Always consult a qualified
        healthcare provider.
      </p>
    </div>
  );
}

function computeAnalysis(cycles, entries) {
  const result = {
    mensesDayTotal: null,
    highLutealItems: null,
    percentGreater: null,
    meetsThreshold: false,
    phaseComparison: null,
    topSymptoms: null,
  };

  if (cycles.length < 2 || entries.length === 0) return result;

  const sortedCycles = [...cycles].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
  const entryMap = {};
  entries.forEach((e) => { entryMap[e.date] = e; });

  // Day 1 of most recent cycle
  const latestStart = sortedCycles[sortedCycles.length - 1].start_date;
  const day1Entry = entryMap[latestStart];
  if (day1Entry) {
    result.mensesDayTotal = calculateDayTotal(day1Entry);
  }

  // Classify entries into luteal / follicular
  const lutealEntries = [];
  const follicularEntries = [];

  for (let i = 0; i < sortedCycles.length; i++) {
    const cycleStart = new Date(sortedCycles[i].start_date);
    const nextCycleStart = i < sortedCycles.length - 1 ? new Date(sortedCycles[i + 1].start_date) : null;
    const cycleLen = nextCycleStart ? differenceInDays(nextCycleStart, cycleStart) : (sortedCycles[i].cycle_length || 28);
    const lutealStart = Math.max(1, cycleLen - 13);

    entries.forEach((entry) => {
      const entryDate = new Date(entry.date);
      const dayInCycle = differenceInDays(entryDate, cycleStart) + 1;
      if (dayInCycle >= 1 && dayInCycle <= cycleLen) {
        if (dayInCycle >= lutealStart) {
          lutealEntries.push(entry);
        } else {
          follicularEntries.push(entry);
        }
      }
    });
  }

  if (lutealEntries.length === 0 || follicularEntries.length === 0) return result;

  // Avg per symptom in each phase
  const lutealAvgs = {};
  const follicularAvgs = {};

  ALL_SYMPTOMS.forEach((s) => {
    const lutScores = lutealEntries.map((e) => e[s.key] || 0);
    const folScores = follicularEntries.map((e) => e[s.key] || 0);
    lutealAvgs[s.key] = lutScores.reduce((a, b) => a + b, 0) / lutScores.length;
    follicularAvgs[s.key] = folScores.reduce((a, b) => a + b, 0) / folScores.length;
  });

  // Items with avg > 3 in luteal
  const highItems = ALL_SYMPTOMS.filter((s) => lutealAvgs[s.key] > 3);
  result.highLutealItems = highItems.length;

  // Top symptoms
  result.topSymptoms = ALL_SYMPTOMS
    .map((s) => ({ ...s, avg: lutealAvgs[s.key] }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 8);

  // Phase comparison
  const lutealTotal = Object.values(lutealAvgs).reduce((a, b) => a + b, 0);
  const follicularTotal = Object.values(follicularAvgs).reduce((a, b) => a + b, 0);

  if (follicularTotal > 0) {
    result.percentGreater = ((lutealTotal - follicularTotal) / follicularTotal) * 100;
    result.meetsThreshold = result.percentGreater >= 30;
  }

  // Bar chart data (top 8 symptoms)
  result.phaseComparison = result.topSymptoms.slice(0, 6).map((s) => ({
    name: s.label.length > 25 ? s.label.slice(0, 25) + "…" : s.label,
    luteal: parseFloat(lutealAvgs[s.key].toFixed(1)),
    follicular: parseFloat(follicularAvgs[s.key].toFixed(1)),
  }));

  return result;
}