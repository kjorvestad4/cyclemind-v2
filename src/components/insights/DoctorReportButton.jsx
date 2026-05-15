import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { FileDown, Mail, Download, Check } from "lucide-react";
import { toast } from "sonner";

export default function DoctorReportButton({ user }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [options, setOptions] = useState({
    includeJournal: false,
    includeMedications: true,
    includeScreening: true
  });

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const response = await base44.functions.invoke('generateDoctorReport', options);
      
      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CycleMind_Report_${user.full_name || 'Patient'}_${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success("Report downloaded successfully!");
    } catch (error) {
      toast.error("Failed to generate report");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const emailReport = async () => {
    // TODO: Implement email functionality
    toast.info("Email feature coming soon - you can download and email manually");
  };

  return (
    <div className="space-y-3">
      {/* Options */}
      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
        <p className="text-xs font-semibold">Include in report:</p>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={options.includeJournal}
            onChange={(e) => setOptions({ ...options, includeJournal: e.target.checked })}
            className="rounded border-gray-300"
          />
        <span>Journal entries (last 5)</span>
        </label>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={options.includeMedications}
            onChange={(e) => setOptions({ ...options, includeMedications: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span>Medications logged</span>
        </label>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={options.includeScreening}
            onChange={(e) => setOptions({ ...options, includeScreening: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span>PHQ-9, GAD-7, EPDS scores</span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button 
          onClick={generateReport} 
          disabled={isGenerating}
          className="flex-1 gap-2"
        >
          {isGenerating ? (
            <span className="animate-pulse">Generating...</span>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download PDF
            </>
          )}
        </Button>
        <Button 
          onClick={emailReport}
          variant="outline"
          className="gap-2"
        >
          <Mail className="w-4 h-4" />
          Email
        </Button>
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        HIPAA-style summary for your healthcare provider (last 90 days)
      </p>
    </div>
  );
}