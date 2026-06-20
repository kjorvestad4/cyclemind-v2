/**
 * DRSP Phase Comparison — Interactive visual comparison of luteal vs follicular symptoms.
 * Uses the professional teal color scheme with clear trend indicators.
 */
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, ReferenceLine, Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const PHASE_COLORS = {
  luteal: "hsl(var(--primary))",
  follicular: "hsl(var(--chart-2))",
};

const SEVERITY_COLORS = {
  low: "hsl(var(--chart-3))",
  moderate: "hsl(var(--chart-4))",
  severe: "hsl(var(--destructive))",
};

export default function DRSPPhaseComparison({ phaseComparison }) {
  if (!phaseComparison || phaseComparison.length === 0) return null;

  const dataWithChange = phaseComparison.map(item => ({
    ...item,
    change: item.follicular > 0 ? ((item.luteal - item.follicular) / item.follicular) * 100 : 0,
    severityColor: item.luteal >= 4 ? SEVERITY_COLORS.severe : item.luteal >= 2.5 ? SEVERITY_COLORS.moderate : SEVERITY_COLORS.low,
  }));

  const avgLuteal = (dataWithChange.reduce((sum, i) => sum + i.luteal, 0) / dataWithChange.length).toFixed(1);
  const avgFollicular = (dataWithChange.reduce((sum, i) => sum + i.follicular, 0) / dataWithChange.length).toFixed(1);
  const overallChange = ((avgLuteal - avgFollicular) / avgFollicular * 100).toFixed(0);

  return (
    <Card className="border-border/50 overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent border-b border-border/30">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <CardTitle className="text-sm font-semibold">DRSP Phase Comparison — Luteal vs Follicular</CardTitle>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          DSM-5 requires ≥30% increase in luteal phase symptoms for PMDD screening
        </p>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Visual Chart */}
        <div className="h-64 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={dataWithChange} 
              layout="vertical" 
              margin={{ left: 4, right: 24, top: 8, bottom: 8 }}
              barGap={2}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                type="number" 
                domain={[0, 6]} 
                tick={{ fontSize: 10 }} 
                tickCount={7}
                label={{ value: "Severity (1-6)", position: "bottom", fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 9 }} 
                width={110}
                tickFormatter={(val) => val.length > 18 ? val.slice(0, 16) + "…" : val}
              />
              <Tooltip 
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 10,
                  fontSize: 11,
                  color: "hsl(var(--foreground))",
                }}
                formatter={(value, name) => {
                  if (name === "Luteal") return [value.toFixed(1), "Luteal Phase"];
                  if (name === "Follicular") return [value.toFixed(1), "Follicular Phase"];
                  if (name === "Change") return [`${value > 0 ? "+" : ""}${value.toFixed(0)}%`, "Change"];
                  return [value, name];
                }}
              />
              <ReferenceLine x={3} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 2" label={{ value: "Moderate", position: "top", fontSize: 9 }} />
              <ReferenceLine x={4.5} stroke="hsl(var(--destructive))" strokeDasharray="3 2" label={{ value: "Severe", position: "top", fontSize: 9 }} />
              
              {/* Luteal Phase Bars with color-coded severity */}
              <Bar dataKey="luteal" name="Luteal" radius={[0, 4, 4, 0]} barSize={14}>
                {dataWithChange.map((entry, index) => (
                  <Cell key={`luteal-${index}`} fill={entry.severityColor} />
                ))}
              </Bar>
              
              {/* Follicular Phase Bars */}
              <Bar dataKey="follicular" name="Follicular" radius={[0, 4, 4, 0]} barSize={14} fill={PHASE_COLORS.follicular} fillOpacity={0.7} />
              
              <Legend 
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                formatter={(value) => <span style={{ color: "hsl(var(--foreground))" }}>{value}</span>}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-primary/5 rounded-xl p-2.5 border border-primary/20 text-center">
            <p className="text-[10px] text-muted-foreground font-medium">Avg Luteal</p>
            <p className="text-lg font-bold text-primary">{avgLuteal}</p>
          </div>
          <div className="bg-chart-2/5 rounded-xl p-2.5 border border-chart-2/20 text-center">
            <p className="text-[10px] text-muted-foreground font-medium">Avg Follicular</p>
            <p className="text-lg font-bold text-chart-2">{avgFollicular}</p>
          </div>
          <div className={`rounded-xl p-2.5 border text-center ${
            overallChange >= 30 
              ? "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900" 
              : "bg-muted/40 border-border/50"
          }`}>
            <p className="text-[10px] text-muted-foreground font-medium">Phase Increase</p>
            <p className={`text-lg font-bold ${
              overallChange >= 30 
                ? "text-orange-600 dark:text-orange-400" 
                : "text-muted-foreground"
            }`}>
              {overallChange}%
            </p>
          </div>
        </div>

        {/* Top Symptoms with ≥30% Increase */}
        {dataWithChange.filter(i => i.change >= 30).length > 0 && (
          <div className="mt-4 pt-3 border-t border-border/50">
            <p className="text-[10px] font-semibold text-muted-foreground mb-2">SYMPTOMS WITH ≥30% LUTEAL INCREASE (DSM-5 CRITERIA)</p>
            <div className="space-y-1.5">
              {dataWithChange
                .filter(i => i.change >= 30)
                .sort((a, b) => b.change - a.change)
                .slice(0, 5)
                .map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-900/50">
                    <span className="font-medium text-foreground">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {item.follicular.toFixed(1)} → {item.luteal.toFixed(1)}
                      </span>
                      <span className="font-semibold text-orange-600 dark:text-orange-400">
                        +{item.change.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}