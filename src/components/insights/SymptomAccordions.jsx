import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SYMPTOM_CATEGORIES, ALL_SYMPTOMS } from "@/lib/symptoms";
import { Activity, Brain, Heart, Moon, Utensils, Zap, TrendingUp } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 10,
    fontSize: 11,
    color: "hsl(var(--foreground))",
  },
};

const CATEGORY_ICONS = {
  "Mood & Emotional": Brain,
  "Behavioral & Cognitive": Zap,
  "Appetite & Sleep": Moon,
  "Physical": Heart,
  "Functional Impact": TrendingUp,
  "Additional Items": Activity,
};

export default function SymptomAccordions({ entries, cycles, heatmapData, cycleType }) {
  if (!entries.length) return null;

  // Calculate average severity by category
  const categoryAverages = SYMPTOM_CATEGORIES.map((cat) => {
    const symptoms = cat.symptoms;
    const total = symptoms.reduce((sum, s) => {
      const vals = entries.map((e) => e[s.key] || 0);
      return sum + vals.reduce((a, b) => a + b, 0);
    }, 0);
    const avg = total / (symptoms.length * entries.length);
    return {
      category: cat.label,
      avg: parseFloat(avg.toFixed(2)),
      symptomCount: symptoms.length,
    };
  });

  // Get top 3 symptoms per category
  const topSymptomsByCategory = SYMPTOM_CATEGORIES.map((cat) => {
    const symptomAvgs = cat.symptoms.map((s) => {
      const vals = entries.map((e) => e[s.key] || 0);
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      return { ...s, avg: parseFloat(avg.toFixed(2)) };
    });
    return {
      category: cat.label,
      topSymptoms: symptomAvgs.sort((a, b) => b.avg - a.avg).slice(0, 3),
    };
  });

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">Symptom Analysis</p>

      {/* Category Severity Overview */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Severity by Category (Average)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryAverages} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="category" tick={{ fontSize: 8 }} angle={-15} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 9 }} domain={[0, 6]} width={32} />
              <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(v) => [v.toFixed(2), "Avg Severity"]} />
              <ReferenceLine y={3} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 2" label={{ value: "Moderate", fontSize: 9 }} />
              <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Accordion Sections by Category */}
      <Accordion type="single" collapsible defaultValue="category-0" className="w-full">
        {SYMPTOM_CATEGORIES.map((cat, idx) => {
          const Icon = CATEGORY_ICONS[cat.label] || Activity;
          const catData = topSymptomsByCategory.find((c) => c.category === cat.label);
          const catAvg = categoryAverages.find((c) => c.category === cat.label);

          return (
            <AccordionItem key={cat.label} value={`category-${idx}`} className="border-border/50">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{cat.label}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Avg: {catAvg?.avg.toFixed(2)} · {catData?.topSymptoms.filter((s) => s.avg > 0).length} symptoms tracked
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                {/* Top symptoms in this category */}
                {catData?.topSymptoms && catData.topSymptoms.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Top Symptoms:</p>
                    {catData.topSymptoms
                      .filter((s) => s.avg > 0)
                      .map((sym) => (
                        <div key={sym.key} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                          <span className="text-xs text-foreground">{sym.label}</span>
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              sym.avg >= 4
                                ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                                : sym.avg >= 2.5
                                ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                            }`}
                          >
                            {sym.avg.toFixed(2)} avg
                          </span>
                        </div>
                      ))}
                  </div>
                )}

                {/* Heatmap for this category's symptoms */}
                {heatmapData && heatmapData.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Cycle Day Pattern:</p>
                    <SymptomCategoryHeatmap
                      heatmapData={heatmapData}
                      categorySymptoms={cat.symptoms.map((s) => s.shortLabel)}
                    />
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Logged Data Summary - Also in accordion format */}
      <LoggedDataAccordions entries={entries} cycles={cycles} cycleType={cycleType} />
    </div>
  );
}

function SymptomCategoryHeatmap({ heatmapData, categorySymptoms }) {
  const days = [...new Set(heatmapData.map((d) => d.day))].sort((a, b) => a - b);
  const filteredData = heatmapData.filter((d) => categorySymptoms.includes(d.symptom));

  if (!filteredData.length) return null;

  const lookup = {};
  filteredData.forEach((d) => {
    lookup[`${d.day}-${d.symptom}`] = d.avg;
  });

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
        <div className="flex gap-0.5 mb-1 ml-24">
          {days.slice(0, 14).map((d) => (
            <div key={d} className="w-5 text-center text-[9px] text-muted-foreground font-medium">{d}</div>
          ))}
        </div>
        {categorySymptoms.slice(0, 6).map((sym) => (
          <div key={sym} className="flex items-center gap-0.5 mb-0.5">
            <div className="w-24 text-[9px] text-muted-foreground truncate text-right pr-1 shrink-0">{sym}</div>
            {days.slice(0, 14).map((d) => {
              const v = lookup[`${d}-${sym}`];
              return (
                <div key={d} className={`w-5 h-4 rounded-sm ${cellColor(v)}`} title={`Day ${d} · ${sym}: ${v ? v.toFixed(1) : "—"}`} />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function LoggedDataAccordions({ entries, cycles, cycleType }) {
  const intimacyDays = entries.filter((e) => e.intimacy_logged).length;
  const flowCounts = {
    H: entries.filter((e) => e.menstrual_flow === "H").length,
    M: entries.filter((e) => e.menstrual_flow === "M").length,
    L: entries.filter((e) => e.menstrual_flow === "L").length,
  };

  return (
    <div className="mt-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1 mb-3">Additional Tracking</p>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="intimacy" className="border-border/50">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-lg bg-chart-3/10 flex items-center justify-center shrink-0">
                <Heart className="w-4 h-4 text-chart-3" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Intimacy & Cycle Data</p>
                <p className="text-[10px] text-muted-foreground">{intimacyDays} days logged</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-border/50">
                <CardContent className="pt-4">
                  <p className="text-2xl font-bold text-foreground">{intimacyDays}</p>
                  <p className="text-[10px] text-muted-foreground">intimacy days</p>
                </CardContent>
              </Card>
              {Object.entries(flowCounts).some(([, count]) => count > 0) && (
                <Card className="border-border/50">
                  <CardContent className="pt-4">
                    <div className="space-y-1">
                      {Object.entries(flowCounts).filter(([, count]) => count > 0).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{type === "H" ? "Heavy" : type === "M" ? "Medium" : "Light"}</span>
                          <span className="font-semibold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="meds" className="border-border/50">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-lg bg-chart-5/10 flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4 text-chart-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Medications & Vitals</p>
                <p className="text-[10px] text-muted-foreground">Tracked supplements and health metrics</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-xs text-muted-foreground py-4">Medications, vitals, and other tracking data available in full report</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}