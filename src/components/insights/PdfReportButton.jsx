import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2, Settings, Calendar, TrendingUp, ClipboardList, X } from "lucide-react";
import { format, subDays } from "date-fns";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 8,
    fontSize: 11,
  },
};

export default function PdfReportButton({ cycles, entries, analysis }) {
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
      
      const response = await base44.functions.invoke("generateDoctorReport", {
        ...opts,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `CycleMind_Clinical_Summary_${format(new Date(), "yyyy-MM-dd")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Clinical report downloaded!");
      setPreviewOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate progress data
  const progressData = calculateProgressData(entries, dateRange);

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
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="font-serif text-xl">Clinical Report Preview</DialogTitle>
                <button onClick={() => setPreviewOpen(false)} className="text-muted-foreground hover:text-foreground">
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
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-chart-1" />
                      <p className="text-sm font-semibold">Symptom Progress (Last {dateRange} Days)</p>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={progressData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 9 }} domain={[0, 6]} />
                        <Tooltip {...CHART_TOOLTIP_STYLE} />
                        <Line type="monotone" dataKey="severity" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} name="Avg Severity" />
                      </LineChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-muted-foreground text-center">
                      {progressData.length > 10 ? "✓ Showing improvement trend" : "Need more data points for trend analysis"}
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