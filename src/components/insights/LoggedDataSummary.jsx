import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { Activity, Heart, Droplet, Pill, Sparkles, Wind } from "lucide-react";

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 10,
    fontSize: 11,
    color: "hsl(var(--foreground))",
  },
};

export default function LoggedDataSummary({ entries, cycles }) {
  if (!entries.length) return null;

  // Vitals tracking
  const vitalsData = entries
    .filter((e) => e.heart_rate || e.systolic_bp || e.diastolic_bp || e.basal_body_temp || e.weight)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30)
    .map((e) => ({
      date: e.date.slice(5), // MM-DD
      hr: e.heart_rate || null,
      bbt: e.basal_body_temp || null,
      weight: e.weight || null,
    }));

  // Intimacy days
  const intimacyDays = entries.filter((e) => e.intimacy_logged).length;
  const unprotectedDays = entries.filter((e) => e.intimacy_logged && e.intimacy_protected === false).length;

  // Menstrual flow distribution
  const flowCounts = {
    H: entries.filter((e) => e.menstrual_flow === "H").length,
    M: entries.filter((e) => e.menstrual_flow === "M").length,
    L: entries.filter((e) => e.menstrual_flow === "L").length,
  };
  const flowData = [
    { name: "Heavy", count: flowCounts.H },
    { name: "Medium", count: flowCounts.M },
    { name: "Light", count: flowCounts.L },
  ].filter((f) => f.count > 0);

  // Medications tracked
  const medsSet = new Set();
  entries.forEach((e) => {
    if (e.medications_taken) {
      e.medications_taken.forEach((m) => medsSet.add(m));
    }
  });
  const medsList = Array.from(medsSet);
  const medsFrequency = {};
  entries.forEach((e) => {
    if (e.medications_taken) {
      e.medications_taken.forEach((m) => {
        medsFrequency[m] = (medsFrequency[m] || 0) + 1;
      });
    }
  });

  // Ovulation testing results
  const ovulationResults = {
    positive: entries.filter((e) => e.ovulation_test === "Positive").length,
    lhSurge: entries.filter((e) => e.ovulation_test === "LH Surge").length,
    negative: entries.filter((e) => e.ovulation_test === "Negative").length,
  };
  const totalOvTests = ovulationResults.positive + ovulationResults.lhSurge + ovulationResults.negative;

  // Cervical mucus logged
  const cervicalMucusEntries = entries.filter((e) => e.cervical_mucus).length;
  const cervicalMuculusSamples = {};
  entries.forEach((e) => {
    if (e.cervical_mucus) {
      cervicalMuculusSamples[e.cervical_mucus] = (cervicalMuculusSamples[e.cervical_mucus] || 0) + 1;
    }
  });

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">Logged Data Summary</p>

      {/* Vitals Trends */}
      {vitalsData.length > 2 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-chart-2" />
              Vitals Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={vitalsData} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 8 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 9 }} yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} />
                <Tooltip {...CHART_TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {vitalsData.some((d) => d.hr) && (
                  <Line yAxisId="left" type="monotone" dataKey="hr" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} name="HR (bpm)" connectNulls={true} />
                )}
                {vitalsData.some((d) => d.bbt) && (
                  <Line yAxisId="right" type="monotone" dataKey="bbt" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} name="BBT (°F)" connectNulls={true} />
                )}
                {vitalsData.some((d) => d.weight) && (
                  <Line yAxisId="right" type="monotone" dataKey="weight" stroke="hsl(var(--chart-5))" strokeWidth={2} dot={false} name="Weight" connectNulls={true} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Intimacy & Menstrual Flow */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Heart className="w-4 h-4 text-chart-3" />
              Intimacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-2xl font-bold text-foreground">{intimacyDays}</p>
              <p className="text-[10px] text-muted-foreground">days logged</p>
            </div>
            {unprotectedDays > 0 && (
              <p className="text-[11px] text-orange-600 dark:text-orange-400">
                ⚠️ {unprotectedDays} unprotected day{unprotectedDays > 1 ? "s" : ""}
              </p>
            )}
          </CardContent>
        </Card>

        {flowData.length > 0 && (
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Droplet className="w-4 h-4 text-red-500" />
                Menstrual Flow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={flowData} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} width={24} />
                  <Tooltip {...CHART_TOOLTIP_STYLE} />
                  <Bar dataKey="count" fill="hsl(var(--chart-3))" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Medications */}
      {medsList.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Pill className="w-4 h-4 text-chart-5" />
              Medications & Supplements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {medsList
                .sort((a, b) => medsFrequency[b] - medsFrequency[a])
                .slice(0, 8)
                .map((med) => (
                  <div key={med} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{med}</span>
                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      {medsFrequency[med]} time{medsFrequency[med] > 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ovulation Testing */}
      {totalOvTests > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Ovulation Testing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {ovulationResults.positive > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Positive</span>
                  <span className="font-semibold text-chart-1">{ovulationResults.positive}</span>
                </div>
              )}
              {ovulationResults.lhSurge > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-foreground">LH Surge</span>
                  <span className="font-semibold text-chart-1">{ovulationResults.lhSurge}</span>
                </div>
              )}
              {ovulationResults.negative > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Negative</span>
                  <span className="text-muted-foreground">{ovulationResults.negative}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cervical Mucus */}
      {cervicalMucusEntries > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Wind className="w-4 h-4 text-cyan-500" />
              Cervical Mucus Observations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground text-[10px] mb-2">{cervicalMucusEntries} observations logged</p>
              {Object.entries(cervicalMuculusSamples)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-foreground text-xs">{type}</span>
                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}