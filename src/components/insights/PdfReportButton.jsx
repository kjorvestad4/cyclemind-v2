import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function PdfReportButton() {
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke("generateClinicalReport", { days: 90 });

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
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={generateReport}
      disabled={loading}
      className="w-full h-12 rounded-2xl text-base font-semibold gap-2 shadow-lg shadow-primary/20"
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileDown className="w-5 h-5" />}
      {loading ? "Generating Clinical PDF…" : "Download Clinical Report (PDF)"}
    </Button>
  );
}