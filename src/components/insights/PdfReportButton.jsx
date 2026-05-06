import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { jsPDF } from "jspdf";
import { ALL_SYMPTOMS, SYMPTOM_CATEGORIES, SEVERITY_LABELS, calculateDayTotal } from "@/lib/symptoms";
import { toast } from "sonner";

export default function PdfReportButton({ cycles, entries, analysis, user }) {
  const [loading, setLoading] = useState(false);

  const generatePDF = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = 210;
      const margin = 15;
      const contentW = pageW - margin * 2;
      let y = 20;

      const purple = [107, 70, 193];
      const darkText = [30, 30, 40];
      const mutedText = [100, 100, 115];
      const borderGray = [220, 220, 228];

      const addPage = () => {
        doc.addPage();
        y = 20;
        addHeaderLine();
      };

      const checkPageBreak = (needed = 10) => {
        if (y + needed > 275) addPage();
      };

      const addHeaderLine = () => {
        doc.setDrawColor(...borderGray);
        doc.setLineWidth(0.3);
        doc.line(margin, 10, pageW - margin, 10);
        doc.setFontSize(7);
        doc.setTextColor(...mutedText);
        doc.text("CycleMind – DRSP Clinical Report", margin, 8);
        doc.text(`Generated ${format(new Date(), "MMM d, yyyy")}`, pageW - margin, 8, { align: "right" });
      };

      // ── COVER / HEADER ──────────────────────────────────────────────
      doc.setFillColor(...purple);
      doc.rect(0, 0, pageW, 38, "F");

      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("CycleMind", margin, 18);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("DRSP Clinical Symptom Report", margin, 26);

      doc.setFontSize(8);
      doc.setTextColor(220, 210, 255);
      const reportDate = format(new Date(), "MMMM d, yyyy");
      doc.text(`Report generated: ${reportDate}`, margin, 33);
      if (user?.full_name) {
        doc.text(`Patient: ${user.full_name}`, pageW - margin, 33, { align: "right" });
      }

      y = 48;

      addHeaderLine();

      // ── DISCLAIMER ──────────────────────────────────────────────────
      doc.setFillColor(255, 251, 235);
      doc.setDrawColor(251, 191, 36);
      doc.setLineWidth(0.4);
      doc.roundedRect(margin, y, contentW, 12, 2, 2, "FD");
      doc.setFontSize(7.5);
      doc.setTextColor(120, 80, 0);
      doc.setFont("helvetica", "bolditalic");
      doc.text("⚕  Not a diagnostic tool. For informational use only. Always consult a qualified healthcare provider.", margin + 3, y + 5);
      doc.setFont("helvetica", "italic");
      doc.text("Based on the Daily Record of Severity of Problems (DRSP) — Endicott, Nee & Harrison (2006).", margin + 3, y + 10);
      y += 18;

      // ── CYCLE SUMMARY ──────────────────────────────────────────────
      const sortedCycles = [...cycles].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...darkText);
      doc.text("Cycle Summary", margin, y);
      y += 6;
      doc.setDrawColor(...purple);
      doc.setLineWidth(0.6);
      doc.line(margin, y, margin + 40, y);
      y += 5;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...mutedText);
      doc.text(`Cycles recorded: ${cycles.length}`, margin, y);
      doc.text(`Daily entries logged: ${entries.length}`, margin + 55, y);
      if (sortedCycles.length > 0) {
        doc.text(`Tracking since: ${format(new Date(sortedCycles[0].start_date), "MMM d, yyyy")}`, margin + 120, y);
      }
      y += 8;

      // Cycle table
      if (sortedCycles.length > 0) {
        const colW = [55, 40, 40];
        const headers = ["Period Start", "Cycle Length", "Days Tracked"];
        doc.setFillColor(245, 243, 255);
        doc.rect(margin, y, contentW, 7, "F");
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...darkText);
        let cx = margin + 3;
        headers.forEach((h, i) => { doc.text(h, cx, y + 5); cx += colW[i]; });
        y += 7;

        sortedCycles.forEach((c, idx) => {
          checkPageBreak(7);
          if (idx % 2 === 0) {
            doc.setFillColor(252, 252, 255);
            doc.rect(margin, y, contentW, 6.5, "F");
          }
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(...darkText);
          let cx2 = margin + 3;
          doc.text(format(new Date(c.start_date), "MMM d, yyyy"), cx2, y + 4.5); cx2 += colW[0];
          doc.text(c.cycle_length ? `${c.cycle_length} days` : "—", cx2, y + 4.5); cx2 += colW[1];
          // count entries in this cycle
          const nextStart = sortedCycles[idx + 1] ? new Date(sortedCycles[idx + 1].start_date) : new Date();
          const cycleEntries = entries.filter((e) => {
            const d = new Date(e.date);
            return d >= new Date(c.start_date) && d < nextStart;
          });
          doc.text(`${cycleEntries.length}`, cx2, y + 4.5);
          y += 6.5;
        });
        y += 5;
      }

      // ── DIAGNOSTIC FLAGS ──────────────────────────────────────────
      checkPageBreak(40);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...darkText);
      doc.text("Diagnostic Indicators (DRSP Criteria)", margin, y);
      y += 6;
      doc.setDrawColor(...purple);
      doc.setLineWidth(0.6);
      doc.line(margin, y, margin + 65, y);
      y += 6;

      const flags = [
        {
          label: "Day 1 Menses Total Score",
          value: analysis.mensesDayTotal !== null ? `${analysis.mensesDayTotal}` : "N/A",
          note: analysis.mensesDayTotal !== null
            ? (analysis.mensesDayTotal >= 50 ? "✓  Score ≥ 50 — consistent with PMS/PMDD pattern" : "⚠  Score < 50 — consider discussing other diagnoses")
            : "No Day 1 entry found",
          flag: analysis.mensesDayTotal !== null && analysis.mensesDayTotal >= 50,
        },
        {
          label: "Luteal Symptoms Avg > Mild (>3)",
          value: analysis.highLutealItems !== null ? `${analysis.highLutealItems} symptoms` : "N/A",
          note: analysis.highLutealItems > 3 ? "✓  More than 3 symptoms elevated in luteal phase" : "Within normal range",
          flag: analysis.highLutealItems > 3,
        },
        {
          label: "Luteal vs Follicular Difference",
          value: analysis.percentGreater !== null ? `+${analysis.percentGreater.toFixed(0)}%` : "N/A",
          note: analysis.meetsThreshold
            ? "⚠  ≥30% increase in luteal phase — pattern consistent with PMS/PMDD"
            : "< 30% difference between phases",
          flag: analysis.meetsThreshold,
        },
      ];

      flags.forEach((f) => {
        checkPageBreak(18);
        doc.setFillColor(f.flag ? 243 : 250, f.flag ? 240 : 250, f.flag ? 255 : 252);
        const flagColor = f.flag ? purple : borderGray;
        doc.setDrawColor(...flagColor);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, y, contentW, 15, 2, 2, "FD");

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...darkText);
        doc.text(f.label, margin + 3, y + 5.5);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(...purple);
        doc.text(f.value, pageW - margin - 3, y + 5.5, { align: "right" });

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...mutedText);
        doc.text(f.note, margin + 3, y + 11.5);

        y += 18;
      });

      y += 4;

      // ── PHASE COMPARISON TABLE ────────────────────────────────────
      if (analysis.phaseComparison && analysis.phaseComparison.length > 0) {
        checkPageBreak(50);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...darkText);
        doc.text("Phase Comparison — Top Symptoms", margin, y);
        y += 6;
        doc.setDrawColor(...purple);
        doc.setLineWidth(0.6);
        doc.line(margin, y, margin + 65, y);
        y += 6;

        const cw = [contentW * 0.55, contentW * 0.225, contentW * 0.225];
        doc.setFillColor(107, 70, 193);
        doc.rect(margin, y, contentW, 7, "F");
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text("Symptom", margin + 3, y + 5);
        doc.text("Luteal Avg", margin + cw[0] + 3, y + 5);
        doc.text("Follicular Avg", margin + cw[0] + cw[1] + 3, y + 5);
        y += 7;

        analysis.phaseComparison.forEach((row, idx) => {
          checkPageBreak(7);
          if (idx % 2 === 0) {
            doc.setFillColor(248, 245, 255);
            doc.rect(margin, y, contentW, 6.5, "F");
          }
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(...darkText);
          doc.text(row.name, margin + 3, y + 4.5);

          doc.setFont("helvetica", "bold");
          doc.setTextColor(...purple);
          doc.text(String(row.luteal), margin + cw[0] + 3, y + 4.5);

          doc.setFont("helvetica", "normal");
          doc.setTextColor(...mutedText);
          doc.text(String(row.follicular), margin + cw[0] + cw[1] + 3, y + 4.5);
          y += 6.5;
        });
        y += 8;
      }

      // ── DAILY LOG TABLE ───────────────────────────────────────────
      const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));

      if (sortedEntries.length > 0) {
        addPage();

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...darkText);
        doc.text("Daily Symptom Log", margin, y);
        y += 6;
        doc.setDrawColor(...purple);
        doc.setLineWidth(0.6);
        doc.line(margin, y, margin + 45, y);
        y += 6;

        // Mini legend
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...mutedText);
        doc.text("Severity: 1=Not at all  2=Minimal  3=Mild  4=Moderate  5=Severe  6=Extreme  —=Not logged", margin, y);
        y += 8;

        // Build a compact per-category per-day table
        SYMPTOM_CATEGORIES.forEach((cat) => {
          checkPageBreak(20);

          doc.setFillColor(245, 243, 255);
          doc.rect(margin, y, contentW, 6.5, "F");
          doc.setFontSize(8.5);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...purple);
          doc.text(cat.label, margin + 2, y + 4.5);
          y += 6.5;

          // Use last 28 entries to keep columns manageable
          const recent = sortedEntries.slice(-28);
          const colDateW = 14;
          const labelW = 68;
          const scoreW = (contentW - labelW) / Math.min(recent.length, 14);

          // Show up to 14 dates per row to fit page
          const chunks = [];
          for (let i = 0; i < recent.length; i += 14) {
            chunks.push(recent.slice(i, i + 14));
          }

          chunks.forEach((chunk) => {
            checkPageBreak(8 + cat.symptoms.length * 5.5);

            // Date header row
            doc.setFillColor(235, 233, 250);
            doc.rect(margin, y, contentW, 6, "F");
            doc.setFontSize(6.5);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...darkText);
            doc.text("Symptom", margin + 2, y + 4);
            chunk.forEach((entry, j) => {
              doc.text(format(new Date(entry.date), "M/d"), margin + labelW + j * scoreW + scoreW / 2, y + 4, { align: "center" });
            });
            y += 6;

            // Symptom rows
            cat.symptoms.forEach((sym, si) => {
              checkPageBreak(6);
              if (si % 2 === 0) {
                doc.setFillColor(252, 252, 255);
                doc.rect(margin, y, contentW, 5.5, "F");
              }
              doc.setFontSize(6.5);
              doc.setFont("helvetica", "normal");
              doc.setTextColor(...darkText);
              const shortLabel = sym.label.length > 40 ? sym.label.slice(0, 40) + "…" : sym.label;
              doc.text(shortLabel, margin + 2, y + 3.8);

              chunk.forEach((entry, j) => {
                const val = entry[sym.key];
                const txt = val ? String(val) : "—";
                doc.setFont("helvetica", val && val >= 4 ? "bold" : "normal");
                const textColor = val && val >= 4 ? purple : mutedText;
                doc.setTextColor(...textColor);
                doc.text(txt, margin + labelW + j * scoreW + scoreW / 2, y + 3.8, { align: "center" });
              });
              y += 5.5;
            });

            y += 4;
          });

          y += 2;
        });
      }

      // ── FINAL PAGE — NOTES ────────────────────────────────────────
      const entriesWithNotes = sortedEntries.filter((e) => e.notes && e.notes.trim());
      if (entriesWithNotes.length > 0) {
        addPage();
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...darkText);
        doc.text("Daily Notes", margin, y);
        y += 6;
        doc.setDrawColor(...purple);
        doc.setLineWidth(0.6);
        doc.line(margin, y, margin + 30, y);
        y += 6;

        entriesWithNotes.forEach((e) => {
          checkPageBreak(14);
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...purple);
          doc.text(format(new Date(e.date), "MMM d, yyyy"), margin, y);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...darkText);
          const lines = doc.splitTextToSize(e.notes, contentW - 5);
          doc.text(lines, margin + 35, y);
          y += Math.max(6, lines.length * 4.5) + 2;
        });
      }

      // Page numbers
      const totalPages = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFontSize(7);
        doc.setTextColor(...mutedText);
        doc.text(`Page ${p} of ${totalPages}`, pageW / 2, 290, { align: "center" });
      }

      const fileName = `CycleMind_DRSP_Report_${format(new Date(), "yyyy-MM-dd")}.pdf`;
      doc.save(fileName);
      toast.success("Report downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={generatePDF} disabled={loading} className="gap-2 w-full sm:w-auto">
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
      {loading ? "Generating PDF…" : "Download Clinical Report (PDF)"}
    </Button>
  );
}