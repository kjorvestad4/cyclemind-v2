import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { SYMPTOM_CATEGORIES, ALL_SYMPTOMS } from "@/lib/symptoms";
import { Activity, Brain, Heart, Moon, Utensils, Zap, TrendingUp, BarChart3 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell } from "recharts";

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

const CATEGORY_COLORS = {
  "Mood & Emotional": "hsl(var(--chart-1))",
  "Behavioral & Cognitive": "hsl(var(--chart-2))",
  "Appetite & Sleep": "hsl(var(--chart-3))",
  "Physical": "hsl(var(--chart-4))",
  "Functional Impact": "hsl(var(--chart-5))",
  "Additional Items": "hsl(var(--muted-foreground))",
};

export default function SymptomAccordions({ entries, cycles, heatmapData, cycleType }) {
  if (!entries.length) return null;

  // Calculate symptom data by category
  const symptomsByCategory = SYMPTOM_CATEGORIES.map((cat) => {
    const symptomData = cat.symptoms.map((s) => {
      const vals = entries.map((e) => e[s.key] || 0);
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      const daysLogged = vals.filter((v) => v > 0).length;
      return { 
        name: s.shortLabel || s.label, 
        key: s.key,
        avg: parseFloat(avg.toFixed(2)),
        daysLogged,
      };
    });
    return {
      category: cat.label,
      symptoms: symptomData.filter((s) => s.avg > 0).sort((a, b) => b.avg - a.avg),
    };
  });

  // Calculate category averages for overview
  const categoryAverages = symptomsByCategory.map((cat) => ({
    category: cat.category.split(" ")[0],
    avg: parseFloat((cat.symptoms.reduce((sum, s) => sum + s.avg, 0) / (cat.symptoms.length || 1)).toFixed(2)),
    symptomCount: cat.symptoms.length,
  }));

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">Symptom Analysis</p>

      {/* Category Overview Chart */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold">Category Severity Overview</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={categoryAverages}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="category" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} domain={[0, 6]} />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Avg Severity" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Individual Category Accordions */}
      {symptomsByCategory.filter((cat) => cat.symptoms.length > 0).map((catData) => {
        const Icon = CATEGORY_ICONS[catData.category];
        const color = CATEGORY_COLORS[catData.category];
        
        return (
          <Accordion type="single" collapsible key={catData.category} className="w-full">
            <AccordionItem value={catData.category} className="border-border/50">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{catData.category}</p>
                    <p className="text-[10px] text-muted-foreground">{catData.symptoms.length} symptoms tracked</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                {/* Top Symptoms Bar Chart */}
                {catData.symptoms.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Top Symptoms (Avg Severity)</p>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={catData.symptoms.slice(0, 5)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
                        <XAxis type="number" tick={{ fontSize: 9 }} domain={[0, 6]} />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 9 }} />
                        <Tooltip {...CHART_TOOLTIP_STYLE} />
                        <Bar dataKey="avg" fill={color} radius={[0, 4, 4, 0]} name="Avg Severity" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Symptom Frequency Pie Chart (if enough data) */}
                {catData.symptoms.filter((s) => s.daysLogged > 0).length >= 3 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Symptom Frequency Distribution</p>
                    <div className="flex items-center gap-4">
                      <ResponsiveContainer width="50%" height={160}>
                        <PieChart>
                          <Pie
                            data={catData.symptoms.slice(0, 5).filter((s) => s.daysLogged > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
                            paddingAngle={2}
                            dataKey="daysLogged"
                            nameKey="name"
                            label={false}
                          >
                            {catData.symptoms.slice(0, 5).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={[color, `${color}cc`, `${color}99`, `${color}66`, `${color}33`][index % 5]} />
                            ))}
                          </Pie>
                          <Tooltip {...CHART_TOOLTIP_STYLE} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex-1 space-y-1.5">
                        {catData.symptoms.slice(0, 4).map((symptom, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: [color, `${color}cc`, `${color}99`, `${color}66`][idx % 4] }} />
                              <span className="text-muted-foreground">{symptom.name}</span>
                            </div>
                            <span className="font-semibold text-foreground">{symptom.daysLogged}d</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Severity trend area chart (if enough entries) */}
                {entries.length >= 14 && catData.symptoms.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">14-Day Severity Trend</p>
                    <ResponsiveContainer width="100%" height={140}>
                      <AreaChart data={calculateTrendData(entries, catData.symptoms.slice(0, 3).map((s) => s.key))}>
                        <defs>
                          <linearGradient id={`gradient-${catData.category}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="day" tick={{ fontSize: 8 }} />
                        <YAxis tick={{ fontSize: 9 }} domain={[0, 6]} />
                        <Tooltip {...CHART_TOOLTIP_STYLE} />
                        <Area type="monotone" dataKey="avg" stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#gradient-${catData.category})`} name="Avg Severity" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Stats summary */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-[10px] text-muted-foreground">Avg Severity</p>
                    <p className="text-sm font-semibold" style={{ color }}>{(catData.symptoms.reduce((sum, s) => sum + s.avg, 0) / catData.symptoms.length).toFixed(2)}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-[10px] text-muted-foreground">Active Symptoms</p>
                    <p className="text-sm font-semibold" style={{ color }}>{catData.symptoms.filter((s) => s.avg >= 2).length}</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      })}
    </div>
  );
}

function calculateTrendData(entries, symptomKeys) {
  const last14 = entries.slice(-14);
  return last14.map((e, idx) => {
    const vals = symptomKeys.map((k) => e[k] || 0);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return {
      day: idx + 1,
      avg: parseFloat(avg.toFixed(2)),
    };
  });
}