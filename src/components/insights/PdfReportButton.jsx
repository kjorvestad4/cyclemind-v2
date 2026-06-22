import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2, Settings, Calendar, TrendingUp, ClipboardList, X, Activity } from "lucide-react";
import { format, subDays } from "date-fns";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, Legend } from "recharts";

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 8,
    fontSize: 11,
  },
};

export default function PdfReportButton({ cycles = [], entries = [], analysis = {} }) {
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [dateRange, setDateRange] = useState(90);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [opts, setOpts] = useState({ 
    include_journal: false, 
    include_medications: true, 
    include_screening: true,
    include_chart: true,
    include_appointment_prep: true,
  });

  const getStartDate = () => {
    if (useCustom && customStart) return new Date(customStart);
    return subDays(new Date(), dateRange);
  };

  const getEndDate = () => {
    if (useCustom && customEnd) return new Date(customEnd);
    return new Date();
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const startDate = getStartDate();
      const endDate = getEndDate();
      
      console.log('Generating PDF with params:', {
        includeJournal: opts.include_journal,
        includeMedications: opts.include_medications,
        includeScreening: opts.include_screening,
        includeChart: opts.include_chart,
        includeAppointmentPrep: opts.include_appointment_prep,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });
      
      const response = await base44.functions.invoke("generateDoctorReport", {
        includeJournal: opts.include_journal,
        includeMedications: opts.include_medications,
        includeScreening: opts.include_screening,
        includeChart: opts.include_chart,
        includeAppointmentPrep: opts.include_appointment_prep,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });

      // response.data is already the ArrayBuffer from the backend
      const blob = new Blob([response.data], { type: "application/pdf" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = downloadUrl;
      downloadLink.download = `CycleMind_Clinical_Report_${format(new Date(), "yyyy-MM-dd")}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("✓ Clinical report downloaded!");
      setPreviewOpen(false);
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error(`Failed to download: ${err.message || 'Please try again'}`);
    } finally {
      setLoading(false);
    }
  };

  // Calculate progress data
  const progressData = calculateProgressData(entries, dateRange);
  
  // Calculate symptom distribution for pie chart
  const symptomDistribution = calculateSymptomDistribution(entries, dateRange);
  
  // Calculate phase comparison data
  const phaseComparison = calculatePhaseComparison(entries, cycles);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogTrigger asChild>
            <Button className="flex-1 h-12 rounded-2xl text-base font-semibold gap-2 shadow-lg shadow-primary/20">
              <FileDown className="w-5 h-5" />
              Download Clinical Report (PDF)
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
            <DialogHeader className="sticky top-0 bg-background z-10 pb-2 border-b">
              <div className="flex items-center justify-between">
                <DialogTitle className="font-serif text-xl">Clinical Report Preview</DialogTitle>
                <button 
                  onClick={() => setPreviewOpen(false)} 
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-lg"
                  type="button"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* Date Range Selection */}
              <Card>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <p className="text-sm font-semibold">Report Date Range</p>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    {[30, 60, 90, 180].map((days) => (
                      <button
                        key={days}
                        onClick={() => { setUseCustom(false); setDateRange(days); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          !useCustom && dateRange === days
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border hover:bg-muted"
                        }`}
                      >
                        Last {days} days
                      </button>
                    ))}
                    <button
                      onClick={() => setUseCustom(true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        useCustom ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted"
                      }`}
                    >
                      Custom Range
                    </button>
                  </div>

                  {useCustom && (
                    <div className="flex gap-2 items-center">
                      <input
                        type="date"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="h-9 px-3 text-sm rounded-lg border border-input bg-background"
                      />
                      <span className="text-muted-foreground">→</span>
                      <input
                        type="date"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="h-9 px-3 text-sm rounded-lg border border-input bg-background"
                      />
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Selected: {format(getStartDate(), "MMM d, yyyy")} → {format(getEndDate(), "MMM d, yyyy")}
                  </p>
                </CardContent>
              </Card>

              {/* Progress Chart Preview */}
              {progressData.length > 0 && opts.include_chart && (
                <Card>
                  <CardContent className="pt-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-chart-1" />
                      <p className="text-sm font-semibold">Symptom Progress (Last {dateRange} Days)</p>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={progressData}>
                        <defs>
                          <linearGradient id="colorSeverity" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 9 }} domain={[0, 6]} />
                        <Tooltip {...CHART_TOOLTIP_STYLE} />
                        <Area type="monotone" dataKey="severity" stroke="hsl(var(--chart-1))" strokeWidth={2} fillOpacity={1} fill="url(#colorSeverity)" name="Avg Severity" />
                      </AreaChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-muted-foreground text-center">
                      {progressData.length > 10 ? "✓ Showing improvement trend" : "Need more data points for trend analysis"}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Symptom Distribution Pie Chart */}
              {symptomDistribution.length > 0 && (
                <Card>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-chart-3" />
                      <p className="text-sm font-semibold">Top Symptoms Breakdown</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={symptomDistribution.slice(0, 5)}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={2}
                            dataKey="count"
                            nameKey="name"
                            minAngle={15}
                          >
                            {symptomDistribution.slice(0, 5).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'][index % 5]} />
                            ))}
                          </Pie>
                          <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(value, name) => [`${value} days`, name.replace(/_/g, ' ')]} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2.5">
                        {symptomDistribution.slice(0, 5).map((symptom, idx) => {
                          const total = symptomDistribution.slice(0, 5).reduce((sum, s) => sum + s.count, 0);
                          const percent = Math.round((symptom.count / total) * 100);
                          return (
                            <div key={symptom.name} className="flex items-center justify-between text-xs gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'][idx % 5] }} />
                                <span className="text-foreground truncate">{symptom.name.replace(/^(s_|m_|p_|pp_)/, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                              </div>
                              <span className="font-semibold text-muted-foreground whitespace-nowrap">{symptom.count}d ({percent}%)</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Phase Comparison Bar Chart */}
              {phaseComparison.length > 0 && (
                <Card>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-accent" />
                      <p className="text-sm font-semibold">Luteal vs Follicular Phase Comparison</p>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={phaseComparison} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
                        <XAxis type="number" tick={{ fontSize: 9 }} domain={[0, 6]} />
                        <YAxis dataKey="phase" type="category" tick={{ fontSize: 9 }} width={70} />
                        <Tooltip {...CHART_TOOLTIP_STYLE} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="luteal" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} name="Luteal Avg" />
                        <Bar dataKey="follicular" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} name="Follicular Avg" />
                      </BarChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-muted-foreground text-center">
                      Higher luteal scores may indicate PMDD pattern
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Appointment Prep Preview */}
              {opts.include_appointment_prep && (
                <Card>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-chart-2" />
                      <p className="text-sm font-semibold">Appointment Prep Checklist</p>
                    </div>
                    <div className="space-y-2">
                      {generateAppointmentPrep(entries, analysis)}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Content Options */}
              <Card>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-primary" />
                    <p className="text-sm font-semibold">Include in Report:</p>
                  </div>
                  {[
                    { key: "include_screening", label: "PHQ-9 & GAD-7 scores" },
                    { key: "include_medications", label: "Medication log" },
                    { key: "include_journal", label: "Journal entries (max 5)" },
                    { key: "include_chart", label: "Progress chart" },
                    { key: "include_appointment_prep", label: "Appointment prep checklist" },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer">
                      <div
                        onClick={() => setOpts(o => ({ ...o, [key]: !o[key] }))}
                        className={`w-9 h-5 rounded-full transition-colors relative ${opts[key] ? "bg-primary" : "bg-muted"}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${opts[key] ? "translate-x-4" : "translate-x-0.5"}`} />
                      </div>
                      <span className="text-sm text-foreground">{label}</span>
                    </label>
                  ))}
                </CardContent>
              </Card>

              <Button
                onClick={generateReport}
                disabled={loading}
                className="w-full h-12 rounded-2xl text-base font-semibold gap-2 shadow-lg shadow-primary/20"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileDown className="w-5 h-5" />}
                {loading ? "Generating PDF…" : `Download PDF (${format(getStartDate(), "MMM d")} → ${format(getEndDate(), "MMM d")})`}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function calculateProgressData(entries, days) {
  const cutoff = subDays(new Date(), days);
  const recentEntries = entries.filter(e => new Date(e.date) >= cutoff);
  
  // Group by week
  const weeklyData = {};
  recentEntries.forEach(entry => {
    const weekStart = subDays(new Date(entry.date), new Date(entry.date).getDay());
    const weekKey = format(weekStart, "MMM d");
    
    if (!weeklyData[weekKey]) weeklyData[weekKey] = { date: weekKey, severity: 0, count: 0 };
    
    const symptomKeys = Object.keys(entry).filter(k => 
      k.startsWith('s_') || k.startsWith('m_') || k.startsWith('p_') || k.startsWith('pp_')
    );
    const avgSeverity = symptomKeys.reduce((sum, k) => sum + (entry[k] || 0), 0) / symptomKeys.length;
    
    weeklyData[weekKey].severity += avgSeverity;
    weeklyData[weekKey].count++;
  });

  return Object.values(weeklyData)
    .map(d => ({ ...d, severity: parseFloat((d.severity / d.count).toFixed(1)) }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-8);
}

function calculateSymptomDistribution(entries, days) {
  const cutoff = subDays(new Date(), days);
  const recentEntries = entries.filter(e => new Date(e.date) >= cutoff);
  
  const symptomCounts = {};
  recentEntries.forEach(entry => {
    const symptomKeys = Object.keys(entry).filter(k => 
      k.startsWith('s_') || k.startsWith('m_') || k.startsWith('p_') || k.startsWith('pp_')
    );
    
    symptomKeys.forEach(key => {
      if (entry[key] && entry[key] >= 3) { // Only count moderate+ severity
        symptomCounts[key] = (symptomCounts[key] || 0) + 1;
      }
    });
  });
  
  return Object.entries(symptomCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function calculatePhaseComparison(entries, cycles) {
  if (cycles.length < 2) return [];
  
  const recentCycles = cycles.slice(0, 2);
  const comparison = [];
  
  recentCycles.forEach((cycle, idx) => {
    const cycleStart = new Date(cycle.start_date);
    const cycleLen = cycle.cycle_length || 28;
    const lutealStart = cycleLen - 13;
    
    // Get entries for this cycle
    const cycleEntries = entries.filter(e => {
      const entryDate = new Date(e.date);
      return entryDate >= cycleStart && entryDate < new Date(cycleStart.getTime() + cycleLen * 24 * 60 * 60 * 1000);
    });
    
    // Calculate follicular average (first ~14 days)
    const follicularEntries = cycleEntries.filter((_, i) => i < lutealStart);
    const follicularAvg = follicularEntries.length > 0
      ? follicularEntries.reduce((sum, e) => {
          const symptomKeys = Object.keys(e).filter(k => k.startsWith('s_') || k.startsWith('m_'));
          return sum + symptomKeys.reduce((s, k) => s + (e[k] || 0), 0) / symptomKeys.length;
        }, 0) / follicularEntries.length
      : 0;
    
    // Calculate luteal average (last ~13 days)
    const lutealEntries = cycleEntries.filter((_, i) => i >= lutealStart);
    const lutealAvg = lutealEntries.length > 0
      ? lutealEntries.reduce((sum, e) => {
          const symptomKeys = Object.keys(e).filter(k => k.startsWith('s_') || k.startsWith('m_'));
          return sum + symptomKeys.reduce((s, k) => s + (e[k] || 0), 0) / symptomKeys.length;
        }, 0) / lutealEntries.length
      : 0;
    
    comparison.push({
      phase: `Cycle ${idx + 1}`,
      luteal: parseFloat(lutealAvg.toFixed(1)),
      follicular: parseFloat(follicularAvg.toFixed(1))
    });
  });
  
  return comparison;
}

function generateAppointmentPrep(entries, analysis) {
  const prepItems = [];

  // Top symptoms to discuss
  if (analysis?.topSymptoms?.length > 0) {
    prepItems.push(
      <div key="symptoms" className="flex gap-2 items-start p-2 bg-primary/5 rounded-lg">
        <span className="text-primary font-bold">1.</span>
        <div>
          <p className="text-sm font-semibold">Top symptoms to discuss:</p>
          <p className="text-xs text-muted-foreground">
            {analysis.topSymptoms.slice(0, 3).map(s => s.name).join(", ")}
          </p>
        </div>
      </div>
    );
  }

  // Mood scores
  if (analysis?.avgPHQ9Luteal || analysis?.avgGAD7Luteal) {
    prepItems.push(
      <div key="mood" className="flex gap-2 items-start p-2 bg-chart-2/5 rounded-lg">
        <span className="text-chart-2 font-bold">2.</span>
        <div>
          <p className="text-sm font-semibold">Mood screening scores:</p>
          <p className="text-xs text-muted-foreground">
            {analysis.avgPHQ9Luteal && `PHQ-9: ${analysis.avgPHQ9Luteal.toFixed(0)} `}
            {analysis.avgGAD7Luteal && `GAD-7: ${analysis.avgGAD7Luteal.toFixed(0)}`}
          </p>
        </div>
      </div>
    );
  }

  // Cycle patterns
  if (analysis?.meetsThreshold) {
    prepItems.push(
      <div key="pattern" className="flex gap-2 items-start p-2 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
        <span className="text-orange-600 font-bold">3.</span>
        <div>
          <p className="text-sm font-semibold">PMDD pattern detected:</p>
          <p className="text-xs text-muted-foreground">
            Luteal symptoms {analysis.percentGreater?.toFixed(0)}% higher than follicular
          </p>
        </div>
      </div>
    );
  }

  // Questions to ask
  prepItems.push(
    <div key="questions" className="flex gap-2 items-start p-2 bg-muted/50 rounded-lg">
      <span className="text-muted-foreground font-bold">4.</span>
      <div>
        <p className="text-sm font-semibold">Questions to ask your provider:</p>
        <ul className="text-xs text-muted-foreground list-disc list-inside mt-1 space-y-0.5">
          <li>Are my symptoms consistent with PMDD or another condition?</li>
          <li>What treatment options do you recommend?</li>
          <li>Should I adjust my tracking or medication timing?</li>
        </ul>
      </div>
    </div>
  );

  return prepItems;
}