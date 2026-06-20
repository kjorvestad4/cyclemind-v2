import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ALL_SYMPTOMS } from "@/lib/symptoms";
import { TrendingUp, TrendingDown, Minus, Download, Activity, Brain, Heart, Droplet } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ReferenceArea, ReferenceLine, BarChart, Bar } from "recharts";
import { format, differenceInDays } from "date-fns";

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 10,
    fontSize: 11,
    color: "hsl(var(--foreground))",
  },
};

const MOOD_KEYS = ["s_depressed", "s_anxious", "s_mood_swings", "s_angry", "s_hopeless", "s_sensitive", "s_overwhelmed", "s_out_of_control"];
const PHYSICAL_KEYS = ["s_breast_tender", "s_bloating", "s_headache", "s_pain", "s_insomnia", "s_hypersomnia", "s_appetite"];

export default function TrendsTab({ entries, cycles, isPerinatal, analysis }) {
  const moodTrend = computeMoodTrend(entries, cycles);
  const screeningTrend = analysis.screeningTrend || [];
  const bleedingTimeline = computeBleedingTimeline(entries, cycles);

  // Calculate trend indicators
  const trendIndicators = calculateTrendIndicators(moodTrend);

  return (
    <div className="space-y-4">
      {/* Section 1: Daily Symptom Trends */}
      <Accordion type="single" collapsible defaultValue="daily-trends" className="w-full">
        <AccordionItem value="daily-trends" className="border-border/50">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-lg bg-chart-1/10 flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4 text-chart-1" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Daily Symptom Trends</p>
                <p className="text-[10px] text-muted-foreground">Mood vs Physical symptoms over time</p>
              </div>
              {trendIndicators.moodTrend && (
                <TrendIndicator trend={trendIndicators.moodTrend} />
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            {moodTrend.length > 2 ? (
              <div className="relative">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={moodTrend} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 8 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10 }} domain={[0, 6]} />
                    <Tooltip {...CHART_TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    
                    {/* Phase overlays */}
                    {cycles.length >= 2 && (
                      <>
                        {cycles.slice(0, 2).map((cycle, idx) => {
                          const cycleLen = cycle.cycle_length || 28;
                          const lutealStart = cycleLen - 13;
                          return (
                            <ReferenceArea
                              key={idx}
                              x1={format(new Date(cycle.start_date), "M/d")}
                              x2={format(new Date(new Date(cycle.start_date).setDate(new Date(cycle.start_date).getDate() + lutealStart)), "M/d")}
                              fill="hsl(var(--primary))"
                              fillOpacity={0.05}
                              label={{ value: `Cycle ${idx + 1}`, fontSize: 9 }}
                            />
                          );
                        })}
                      </>
                    )}
                    
                    {/* Severity reference lines */}
                    <ReferenceLine y={3} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 2" label={{ value: "Moderate", fontSize: 9 }} />
                    <ReferenceLine y={5} stroke="hsl(var(--destructive))" strokeDasharray="3 2" label={{ value: "Severe", fontSize: 9 }} />
                    
                    <Line type="monotone" dataKey="mood" stroke="hsl(var(--chart-1))" strokeWidth={2.5} dot={false} name="Mood (avg)" />
                    <Line type="monotone" dataKey="physical" stroke="hsl(var(--chart-2))" strokeWidth={2.5} dot={false} name="Physical (avg)" />
                    <Line type="monotone" dataKey="total" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} dot={false} name="Total" strokeDasharray="4 2" />
                  </LineChart>
                </ResponsiveContainer>
                
                {/* Phase legend */}
                {cycles.length >= 2 && (
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground justify-center">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-sm bg-primary/10 border border-primary/20" />
                      <span>Follicular phase</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-sm bg-primary/20 border border-primary/30" />
                      <span>Luteal phase (higher symptoms expected)</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Not enough data yet. Keep logging!</p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Section 2: Screening Scores */}
      <Accordion type="single" collapsible defaultValue="screening" className="w-full">
        <AccordionItem value="screening" className="border-border/50">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-lg bg-chart-3/10 flex items-center justify-center shrink-0">
                <Brain className="w-4 h-4 text-chart-3" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {isPerinatal ? "EPDS & GAD-7 Screening" : "PHQ-9 & GAD-7 Screening"}
                </p>
                <p className="text-[10px] text-muted-foreground">Clinical depression & anxiety scores</p>
              </div>
              {trendIndicators.screeningTrend && (
                <TrendIndicator trend={trendIndicators.screeningTrend} />
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            {screeningTrend.length > 0 ? (
              <div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={screeningTrend} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 8 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10 }} domain={[0, isPerinatal ? 30 : 27]} />
                    <Tooltip {...CHART_TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    
                    {/* Clinical threshold lines */}
                    <ReferenceLine y={10} stroke="hsl(var(--destructive))" strokeDasharray="3 2" label={{ value: "Moderate", position: "right", fontSize: 9 }} />
                    <ReferenceLine y={15} stroke="hsl(var(--destructive))" strokeDasharray="3 2" label={{ value: "Severe", position: "right", fontSize: 9 }} />
                    
                    {/* Severity zones */}
                    <ReferenceArea y1={15} y2={isPerinatal ? 30 : 27} fill="hsl(var(--destructive))" fillOpacity={0.08} label={{ value: "Severe Zone", fontSize: 9 }} />
                    <ReferenceArea y1={10} y2={15} fill="hsl(var(--destructive))" fillOpacity={0.05} />
                    
                    {isPerinatal ? (
                      <>
                        <Line type="monotone" dataKey="epds" stroke="hsl(var(--chart-3))" strokeWidth={2.5} dot={{ r: 3 }} name="EPDS" connectNulls={false} />
                        <Line type="monotone" dataKey="gad7" stroke="hsl(var(--chart-5))" strokeWidth={2.5} dot={{ r: 3 }} name="GAD-7" connectNulls={false} />
                      </>
                    ) : (
                      <>
                        <Line type="monotone" dataKey="phq9" stroke="hsl(var(--chart-1))" strokeWidth={2.5} dot={{ r: 3 }} name="PHQ-9" connectNulls={false} />
                        <Line type="monotone" dataKey="gad7" stroke="hsl(var(--chart-5))" strokeWidth={2.5} dot={{ r: 3 }} name="GAD-7" connectNulls={false} />
                      </>
                    )}
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-muted-foreground mt-2 text-center">
                  {isPerinatal
                    ? "EPDS ≥10 suggests possible perinatal depression. Complete EPDS on Log page."
                    : "Scores ≥10 indicate moderate symptoms. Complete PHQ-9/GAD-7 on Log page to populate."}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No screening scores logged yet. Complete PHQ-9/GAD-7/EPDS on the Log page.</p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Section 3: Cycle Metrics */}
      <Accordion type="single" collapsible defaultValue="cycle-metrics" className="w-full">
        <AccordionItem value="cycle-metrics" className="border-border/50">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-lg bg-chart-3/10 flex items-center justify-center shrink-0">
                <Droplet className="w-4 h-4 text-chart-3" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Cycle Metrics</p>
                <p className="text-[10px] text-muted-foreground">Bleeding patterns & flow intensity</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            {bleedingTimeline.length > 0 ? (
              <div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={bleedingTimeline} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 8 }} interval="preserveStartEnd" />
                    <YAxis 
                      tick={{ fontSize: 9 }} 
                      domain={[0, 4]} 
                      tickFormatter={(v) => ["", "Spot", "Light", "Med", "Heavy"][v] || ""} 
                      width={42} 
                    />
                    <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(v) => [["None", "Spotting", "Light", "Medium", "Heavy"][v] || v, "Flow"]} />
                    <ReferenceLine y={3} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 2" label={{ value: "Heavy", fontSize: 9 }} />
                    <Bar dataKey="intensity" fill="hsl(var(--chart-3))" radius={[3, 3, 0, 0]} name="Flow Intensity" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground">
                  <span>{bleedingTimeline.length} bleeding days logged</span>
                  <span>Max intensity: {Math.max(...bleedingTimeline.map(b => b.intensity)) === 4 ? "Heavy" : Math.max(...bleedingTimeline.map(b => b.intensity)) === 3 ? "Medium" : "Light"}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No bleeding data logged yet.</p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Export Button */}
      <div className="flex justify-center pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportTrendsToImage()}
          className="gap-2 text-xs"
        >
          <Download className="w-3.5 h-3.5" />
          Export Trends as Image
        </Button>
      </div>
    </div>
  );
}

function TrendIndicator({ trend }) {
  const { direction, percent } = trend;
  
  if (direction === "up") {
    return (
      <div className="flex items-center gap-1 text-xs font-semibold text-destructive bg-destructive/10 px-2 py-1 rounded-full">
        <TrendingUp className="w-3.5 h-3.5" />
        <span>+{percent}%</span>
      </div>
    );
  }
  
  if (direction === "down") {
    return (
      <div className="flex items-center gap-1 text-xs font-semibold text-chart-2 bg-chart-2/10 px-2 py-1 rounded-full">
        <TrendingDown className="w-3.5 h-3.5" />
        <span>-{percent}%</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-full">
      <Minus className="w-3.5 h-3.5" />
      <span>Stable</span>
    </div>
  );
}

function computeMoodTrend(entries, cycles) {
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

function calculateTrendIndicators(data) {
  if (data.length < 10) return {};

  // Split into first half and second half
  const mid = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, mid);
  const secondHalf = data.slice(mid);

  const avgFirst = firstHalf.reduce((s, d) => s + d.mood, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((s, d) => s + d.mood, 0) / secondHalf.length;
  
  const percentChange = Math.round(((avgSecond - avgFirst) / avgFirst) * 100);
  
  const trend = {
    direction: percentChange > 5 ? "up" : percentChange < -5 ? "down" : "stable",
    percent: Math.abs(percentChange),
  };

  // Screening trend (simplified - would need screening data)
  const screeningTrend = null;

  return { moodTrend: trend, screeningTrend };
}

function calculateDayTotal(entry) {
  if (!entry) return 0;
  return ALL_SYMPTOMS.reduce((sum, s) => sum + (entry[s.key] || 0), 0);
}

function exportTrendsToImage() {
  // Simple implementation - in production would use html2canvas
  alert("Export feature: This would capture the trend charts as a PNG image for sharing with your doctor.");
}