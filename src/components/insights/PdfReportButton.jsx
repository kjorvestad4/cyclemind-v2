import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2, Settings } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function PdfReportButton({ cycles, entries, analysis }) {
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [opts, setOpts] = useState({ include_journal: false, include_medications: true, include_screening: true });

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke("generateDoctorReport", opts);

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
      setShowOptions(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          onClick={generateReport}
          disabled={loading}
          className="flex-1 h-12 rounded-2xl text-base font-semibold gap-2 shadow-lg shadow-primary/20"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileDown className="w-5 h-5" />}
          {loading ? "Generating Clinical PDF…" : "Download Clinical Report (PDF)"}
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowOptions(!showOptions)}
          className="h-12 w-12 rounded-2xl p-0"
          title="Report options"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {showOptions && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-3">
          <p className="text-sm font-semibold text-primary">Include in report:</p>
          {[
            { key: "include_screening", label: "PHQ-9 & GAD-7 scores", default: true },
            { key: "include_medications", label: "Medication log", default: true },
            { key: "include_journal", label: "Journal entries (max 5)", default: false },
          ].map(({ key, label, default: def }) => (
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
        </div>
      )}
    </div>
  );
}