import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle, FileText, Brain, Upload } from "lucide-react";
import { toast } from "sonner";

function ActionCard({ icon, title, description, buttonLabel, onRun, creditCost }) {
  const [status, setStatus] = useState("idle"); // idle | running | done | error
  const [result, setResult] = useState(null);

  const handleRun = async () => {
    setStatus("running");
    setResult(null);
    try {
      const res = await onRun();
      setResult(res);
      setStatus("done");
      toast.success(`${title} complete`);
    } catch (err) {
      setStatus("error");
      setResult({ error: err.message });
      toast.error(`${title} failed: ${err.message}`);
    }
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="font-semibold text-sm text-foreground">{title}</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">~{creditCost} credits</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>

      <Button
        size="sm"
        onClick={handleRun}
        disabled={status === "running"}
        className="w-full"
        variant={status === "done" ? "secondary" : "default"}
      >
        {status === "running" ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Running…</>
        ) : status === "done" ? (
          <><CheckCircle className="w-4 h-4" /> Done — Run Again</>
        ) : status === "error" ? (
          <><AlertCircle className="w-4 h-4" /> Retry</>
        ) : (
          buttonLabel
        )}
      </Button>

      {result && status === "done" && (
        <div className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
          {Object.entries(result).filter(([k]) => k !== 'error').map(([k, v]) => (
            <div key={k} className="flex justify-between gap-2">
              <span className="font-medium capitalize">{k.replace(/_/g, ' ')}:</span>
              <span className="text-right">{String(v)}</span>
            </div>
          ))}
        </div>
      )}

      {status === "error" && result?.error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
          {result.error}
        </div>
      )}
    </div>
  );
}

export default function AdminActionsPanel({ entries }) {
  // Auto-code journals: process all unstructured journal entries
  const runAutoCodeJournals = async () => {
    const withJournals = (entries || []).filter(e => e.journal_entry && e.journal_entry.trim().length > 10);
    if (withJournals.length === 0) return { processed: 0, message: "No journal entries found to process" };

    let processed = 0;
    let symptomsFound = 0;

    for (const entry of withJournals.slice(0, 20)) { // cap at 20 to conserve credits
      const res = await base44.functions.invoke("autoCodeJournal", { journalText: entry.journal_entry });
      if (res.data?.success && res.data.detectedSymptoms?.length > 0) {
        symptomsFound += res.data.detectedSymptoms.length;
        processed++;
      }
    }

    return {
      entries_analyzed: Math.min(withJournals.length, 20),
      entries_with_symptoms: processed,
      total_symptoms_found: symptomsFound,
    };
  };

  // Generate clinical report PDF
  const runClinicalReport = async () => {
    const response = await base44.functions.invoke("generateClinicalReport", { days: 90 });
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CycleMind_Clinical_Summary_${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return { report: "Downloaded", pages: "2", format: "PDF" };
  };

  // Export psych logs
  const runExportPsychLogs = async () => {
    const res = await base44.functions.invoke("exportPsychLogsToObsidian", {});
    return res.data || { message: "Export triggered" };
  };

  return (
    <Card className="border-primary/20 bg-primary/3">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          Admin Actions
        </CardTitle>
        <p className="text-xs text-muted-foreground">Run data processing and export jobs</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <ActionCard
          icon={<Brain className="w-5 h-5 text-primary" />}
          title="Auto-Code Journal Entries"
          description="Scan journal text and extract structured DRSP symptom tags from free-text entries (up to 20 entries)."
          buttonLabel="Run Auto-Coding"
          creditCost="~50"
          onRun={runAutoCodeJournals}
        />
        <ActionCard
          icon={<FileText className="w-5 h-5 text-primary" />}
          title="Generate Clinical Report"
          description="Create a comprehensive 2-page PDF clinical summary of the last 90 days — ready to share with your provider."
          buttonLabel="Generate & Download PDF"
          creditCost="~150"
          onRun={runClinicalReport}
        />
        <ActionCard
          icon={<Upload className="w-5 h-5 text-primary" />}
          title="Export Psych Logs to Obsidian"
          description="Sync all psych test sessions to GitHub (Obsidian vault) and log traces to Opik for evaluation."
          buttonLabel="Export Logs"
          creditCost="~10"
          onRun={runExportPsychLogs}
        />
      </CardContent>
    </Card>
  );
}