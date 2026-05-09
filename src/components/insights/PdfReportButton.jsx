import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { format, differenceInDays, differenceInYears } from "date-fns";
import { jsPDF } from "jspdf";
import { ALL_SYMPTOMS, SYMPTOM_CATEGORIES, calculateDayTotal } from "@/lib/symptoms";
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

      const addPage = () => { doc.addPage(); y = 20; addRunningHeader(); };
      const checkBreak = (h = 10) => { if (y + h > 278) addPage(); };

      const addRunningHeader = () => {
        doc.setDrawColor(...borderGray);
        doc.setLineWidth(0.2);
        doc.line(margin, 10, pageW - margin, 10);
        doc.setFontSize(7);
        doc.setTextColor(...mutedText);
        doc.text("CycleMind — DRSP Clinical Report (Confidential)", margin, 8);
        doc.text(`Generated ${format(new Date(), "MMM d, yyyy")}`, pageW - margin, 8, { align: "right" });
      };

      // COVER
      doc.setFillColor(...purple);
      doc.rect(0, 0, pageW, 42, "F");
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("CycleMind", margin, 18);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("DRSP Clinical Symptom Report", margin, 27);
      const age = user?.date_of_birth ? differenceInYears(new Date(), new Date(user.date_of_birth)) : null;
      doc.setFontSize(8);
      doc.setTextColor(210, 200, 255);
      doc.text(`Prepared: ${format(new Date(), "MMMM d, yyyy")}${age ? `  |  Age: ${age}` : ""}`, margin, 34);
      doc.text("De-identified — for clinical discussion only", pageW - margin, 34, { align: "right" });
      y = 52;
      addRunningHeader();

      // DISCLAIMER
      doc.setFillColor(255, 251, 235);
      doc.setDrawColor(251, 191, 36);
      doc.setLineWidth(0.4);
      doc.roundedRect(margin, y, contentW, 18, 2, 2, "FD");
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bolditalic");
      doc.setTextColor(120, 80, 0);
      doc.text("Not a diagnostic tool. For informational and clinical discussion purposes only.", margin + 3, y + 5.5);
      doc.setFont("helvetica", "italic");
      doc.text("Based on the Daily Record of Severity of Problems (DRSP) — Endicott, Nee & Harrison (2006).", margin + 3, y + 10.5);
      doc.text("PHQ-9 (Kroenke & Spitzer, 2001), GAD-7 (Spitzer et al., 2006) and EPDS (Cox et al., 1987) are validated screening instruments.", margin + 3, y + 15);
      y += 24;

      // PSYCHIATRIST HANDOFF NOTE
      doc.setFillColor(240, 245, 255);
      doc.setDrawColor(...purple);
      doc.setLineWidth(0.4);
      doc.roundedRect(margin, y, contentW, 22, 2, 2, "FD");
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...purple);
      doc.text("Psychiatrist / Clinician Handoff Note", margin + 3, y + 6);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...darkText);
      doc.setFontSize(8);
      const handoffText = "This report was prepared for clinical discussion using prospective daily self-report via the CycleMind app. Data reflects the patient's subjective experience and has not been clinically verified. Recommend a minimum 2-cycle review for PMDD diagnosis per DSM-5 criteria (B11.9). Mood disorder and medical exclusions should be evaluated prior to diagnosis.";
      const handoffLines = doc.splitTextToSize(handoffText, contentW - 6);
      doc.text(handoffLines, margin + 3, y + 12);
      y += 28;

      // CYCLE SUMMARY
      const sortedCycles = [...cycles].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...darkText);
      doc.text("Cycle Summary", margin, y);
      y += 5;
      doc.setDrawColor(...purple);
      doc.setLineWidth(0.5);
      doc.line(margin, y, margin + 38, y);
      y += 6;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...mutedText);
      const summaryParts = [
        `Cycles: ${cycles.length}`,
        `Entries: ${entries.length}`,
        sortedCycles.length > 0 ? `Since: ${format(new Date(sortedCycles[0].start_date), "MMM d, yyyy")}` : "",
        analysis.avgCycleLength ? `Avg cycle: ${analysis.avgCycleLength}d (±${analysis.cycleLengthVariance || "?"})` : "",
      ].filter(Boolean);
      doc.text(summaryParts.join("   |   "), margin, y);
      y += 8;

      if (sortedCycles.length > 0) {
        const cw = [55, 40, 35, 50];
        const headers = ["Period Start", "Cycle Length", "Entries", "Mode"];
        doc.setFillColor(...purple);
        doc.rect(margin, y, contentW, 7, "F");
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        let cx = margin + 3;
        headers.forEach((h, i) => { doc.text(h, cx, y + 5); cx += cw[i]; });
        y += 7;

        sortedCycles.forEach((c, idx) => {
          checkBreak(7);
          if (idx % 2 === 0) { doc.setFillColor(248, 246, 255); doc.rect(margin, y, contentW, 6.5, "F"); }
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(...darkText);
          let cx2 = margin + 3;
          doc.text(format(new Date(c.start_date), "MMM d, yyyy"), cx2, y + 4.5); cx2 += cw[0];
          const nextStart = sortedCycles[idx + 1] ? new Date(sortedCycles[idx + 1].start_date) : new Date();
          const cycleLen = differenceInDays(nextStart, new Date(c.start_date));
          doc.text(cycleLen > 0 && cycleLen < 60 ? `${cycleLen}d` : (c.cycle_length ? `${c.cycle_length}d` : "—"), cx2, y + 4.5); cx2 += cw[1];
          const cEntries = entries.filter((e) => { const d = new Date(e.date); return d >= new Date(c.start_date) && d < nextStart; });
          doc.text(`${cEntries.length}`, cx2, y + 4.5); cx2 += cw[2];
          doc.text(c.is_pregnancy_mode ? "Pregnancy" : c.is_menopause_mode ? "Menopause" : "Standard", cx2, y + 4.5);
          y += 6.5;
        });
        y += 6;
      }

      // DIAGNOSTIC FLAGS
      checkBreak(80);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...darkText);
      doc.text("Diagnostic Indicators (DRSP Criteria)", margin, y);
      y += 5;
      doc.setDrawColor(...purple);
      doc.setLineWidth(0.5);
      doc.line(margin, y, margin + 68, y);
      y += 7;

      const flags = [
        {
          label: "Day 1 Menses Total Score",
          value: analysis.mensesDayTotal !== null ? `${analysis.mensesDayTotal} / ${ALL_SYMPTOMS.length * 6}` : "N/A",
          note: analysis.mensesDayTotal !== null
            ? (analysis.mensesDayTotal >= 50 ? "Score >= 50 — consistent with PMS/PMDD tracking pattern" : "Score < 50 — consider discussing alternative diagnoses")
            : "No Day 1 entry found",
          flag: analysis.mensesDayTotal !== null && analysis.mensesDayTotal >= 50,
        },
        {
          label: "Luteal Symptoms Above Mild (avg > 3/6)",
          value: analysis.highLutealItems !== null ? `${analysis.highLutealItems} of ${ALL_SYMPTOMS.length}` : "N/A",
          note: analysis.highLutealItems > 3 ? "Elevated symptom burden in luteal phase" : "Within expected range",
          flag: analysis.highLutealItems > 3,
        },
        {
          label: "Luteal vs Follicular Phase Difference",
          value: analysis.percentGreater !== null ? `+${analysis.percentGreater.toFixed(0)}%` : "N/A",
          note: analysis.meetsThreshold
            ? ">= 30% increase in luteal phase — consistent with PMS/PMDD. Recommend clinical review."
            : "< 30% phase difference — not meeting DRSP threshold",
          flag: analysis.meetsThreshold,
        },
        {
          label: "Avg Luteal PHQ-9",
          value: analysis.avgPHQ9Luteal !== null ? `${analysis.avgPHQ9Luteal.toFixed(1)} / 27` : "N/A",
          note: analysis.avgPHQ9Luteal !== null
            ? (analysis.avgPHQ9Luteal >= 10 ? "Moderate-severe depression in luteal phase — warrants clinical attention" : "Mild or minimal depression score")
            : "PHQ-9 not completed — encourage patient to complete weekly",
          flag: analysis.avgPHQ9Luteal >= 10,
        },
        {
          label: "Avg Luteal GAD-7",
          value: analysis.avgGAD7Luteal !== null ? `${analysis.avgGAD7Luteal.toFixed(1)} / 21` : "N/A",
          note: analysis.avgGAD7Luteal !== null
            ? (analysis.avgGAD7Luteal >= 10 ? "Moderate-severe anxiety in luteal phase" : "Mild or minimal anxiety score")
            : "GAD-7 not completed",
          flag: analysis.avgGAD7Luteal >= 10,
        },
      ];

      flags.forEach((f) => {
        checkBreak(18);
        doc.setFillColor(f.flag ? 243 : 250, f.flag ? 240 : 250, f.flag ? 255 : 252);
        doc.setDrawColor(...(f.flag ? purple : borderGray));
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, y, contentW, 15, 2, 2, "FD");
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...darkText);
        doc.text(f.label, margin + 3, y + 5.5);
        doc.setTextColor(...purple);
        doc.text(f.value, pageW - margin - 3, y + 5.5, { align: "right" });
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...mutedText);
        doc.text(f.note, margin + 3, y + 11.5);
        y += 18;
      });
      y += 4;

      // DRSP AVERAGES BY PHASE
      if (analysis.phaseComparison && analysis.phaseComparison.length > 0) {
        checkBreak(60);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...darkText);
        doc.text("DRSP Averages by Phase", margin, y);
        y += 5;
        doc.setDrawColor(...purple);
        doc.setLineWidth(0.5);
        doc.line(margin, y, margin + 48, y);
        y += 6;

        const cw2 = [contentW * 0.55, contentW * 0.225, contentW * 0.225];
        doc.setFillColor(...purple);
        doc.rect(margin, y, contentW, 7, "F");
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text("Symptom", margin + 3, y + 5);
        doc.text("Luteal Avg", margin + cw2[0] + 3, y + 5);
        doc.text("Follicular Avg", margin + cw2[0] + cw2[1] + 3, y + 5);
        y += 7;

        analysis.phaseComparison.forEach((row, idx) => {
          checkBreak(7);
          if (idx % 2 === 0) { doc.setFillColor(248, 246, 255); doc.rect(margin, y, contentW, 6.5, "F"); }
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...darkText);
          doc.text(row.name, margin + 3, y + 4.5);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...(row.luteal > row.follicular + 1 ? [180, 50, 50] : purple));
          doc.text(String(row.luteal), margin + cw2[0] + 3, y + 4.5);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...mutedText);
          doc.text(String(row.follicular), margin + cw2[0] + cw2[1] + 3, y + 4.5);
          y += 6.5;
        });
        y += 8;
      }

      // SCREENING SCORES OVER TIME (PHQ-9/EPDS + GAD-7)
      const hasEpds = entries.some((e) => e.epds_score > 0);
      const screeningEntries = [...entries]
        .filter((e) => e.phq9_score > 0 || e.gad7_score > 0 || e.epds_score > 0)
        .sort((a, b) => a.date.localeCompare(b.date));

      if (screeningEntries.length > 0) {
        checkBreak(50);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...darkText);
        doc.text(hasEpds ? "EPDS, PHQ-9 & GAD-7 Scores Over Time" : "PHQ-9 & GAD-7 Scores Over Time", margin, y);
        y += 5;
        doc.setDrawColor(...purple);
        doc.setLineWidth(0.5);
        doc.line(margin, y, margin + 62, y);
        y += 4;

        if (hasEpds) {
          doc.setFontSize(7.5);
          doc.setFont("helvetica", "italic");
          doc.setTextColor(...mutedText);
          doc.text("EPDS interpretation: 0–8 Low concern · 9–11 Monitor · 12–14 Likely depression · ≥15 High concern · ≥10 warrants clinical review (ACOG/PSI)", margin, y);
          y += 5;
        }

        const cw3 = hasEpds ? [38, 30, 30, 30, 52] : [45, 40, 40, 55];
        const sh = hasEpds ? ["Date", "EPDS (/30)", "PHQ-9 (/27)", "GAD-7 (/21)", "Interpretation"] : ["Date", "PHQ-9 (/27)", "GAD-7 (/21)", "Interpretation"];
        doc.setFillColor(...purple);
        doc.rect(margin, y, contentW, 7, "F");
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        let scx = margin + 3;
        sh.forEach((h, i) => { doc.text(h, scx, y + 5); scx += cw3[i]; });
        y += 7;

        screeningEntries.forEach((e, idx) => {
          checkBreak(7);
          if (idx % 2 === 0) { doc.setFillColor(248, 246, 255); doc.rect(margin, y, contentW, 6.5, "F"); }
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...darkText);
          let cx3 = margin + 3;
          doc.text(format(new Date(e.date), "MMM d, yyyy"), cx3, y + 4.5); cx3 += cw3[0];
          if (hasEpds) {
            const epdsFlag = e.epds_score >= 10;
            doc.setFont("helvetica", epdsFlag ? "bold" : "normal");
            doc.setTextColor(...(epdsFlag ? [180, 50, 50] : darkText));
            doc.text(e.epds_score > 0 ? String(e.epds_score) : "—", cx3, y + 4.5); cx3 += cw3[1];
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...darkText);
          }
          doc.text(e.phq9_score > 0 ? String(e.phq9_score) : "—", cx3, y + 4.5); cx3 += cw3[hasEpds ? 2 : 1];
          doc.text(e.gad7_score > 0 ? String(e.gad7_score) : "—", cx3, y + 4.5); cx3 += cw3[hasEpds ? 3 : 2];
          const epdsSev = e.epds_score >= 15 ? "EPDS: High concern" : e.epds_score >= 12 ? "EPDS: Likely dep." : e.epds_score >= 10 ? "EPDS: Monitor" : "";
          const phqSev = e.phq9_score >= 20 ? "Severe dep." : e.phq9_score >= 15 ? "Mod-severe" : e.phq9_score >= 10 ? "Moderate" : e.phq9_score >= 5 ? "Mild" : "";
          const gadSev = e.gad7_score >= 15 ? "Severe anx." : e.gad7_score >= 10 ? "Mod. anx." : e.gad7_score >= 5 ? "Mild anx." : "";
          const interp = [epdsSev, e.phq9_score > 0 ? phqSev : "", e.gad7_score > 0 ? gadSev : ""].filter(Boolean).join(" / ");
          doc.setTextColor(...mutedText);
          doc.text(interp || "—", cx3, y + 4.5);
          y += 6.5;
        });
        y += 8;
      }

      // MEDICATIONS LOG
      const medEntries = [...entries]
        .filter((e) => e.medications_taken && e.medications_taken.length > 0)
        .sort((a, b) => a.date.localeCompare(b.date));

      if (medEntries.length > 0) {
        checkBreak(40);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...darkText);
        doc.text("Medications Log", margin, y);
        y += 5;
        doc.setDrawColor(...purple);
        doc.setLineWidth(0.5);
        doc.line(margin, y, margin + 38, y);
        y += 6;

        medEntries.forEach((e) => {
          checkBreak(10);
          doc.setFontSize(8.5);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...purple);
          doc.text(format(new Date(e.date), "MMM d, yyyy"), margin, y + 4);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...darkText);
          const lines = doc.splitTextToSize(e.medications_taken.join(", "), contentW - 40);
          doc.text(lines, margin + 38, y + 4);
          y += Math.max(7, lines.length * 5) + 1;
        });
        y += 4;
      }

      // OVULATION & FERTILITY TRACKING
      const ovulationTests = entries.filter((e) => e.ovulation_test && e.ovulation_test !== "");
      const cervicalMucus = entries.filter((e) => e.cervical_mucus);
      if (ovulationTests.length > 0 || cervicalMucus.length > 0) {
        checkBreak(45);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...darkText);
        doc.text("Ovulation & Fertility Tracking", margin, y);
        y += 5;
        doc.setDrawColor(...purple);
        doc.setLineWidth(0.5);
        doc.line(margin, y, margin + 50, y);
        y += 7;

        if (ovulationTests.length > 0) {
          const ovCounts = { "Positive": 0, "Negative": 0, "LH Surge": 0 };
          ovulationTests.forEach((e) => { if (ovCounts.hasOwnProperty(e.ovulation_test)) ovCounts[e.ovulation_test]++; });
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...darkText);
          doc.text("Ovulation Tests:", margin, y);
          y += 5;
          Object.entries(ovCounts).forEach(([type, count]) => {
            if (count > 0) {
              doc.setFontSize(8.5);
              doc.text(`• ${type}: ${count}`, margin + 5, y);
              y += 4;
            }
          });
          y += 2;
        }

        if (cervicalMucus.length > 0) {
          const cmTypes = {};
          cervicalMucus.forEach((e) => { cmTypes[e.cervical_mucus] = (cmTypes[e.cervical_mucus] || 0) + 1; });
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...darkText);
          doc.text("Cervical Mucus Observations:", margin, y);
          y += 5;
          Object.entries(cmTypes).forEach(([type, count]) => {
            doc.setFontSize(8.5);
            doc.text(`• ${type}: ${count}`, margin + 5, y);
            y += 4;
          });
        }
        y += 4;
      }

      // CUSTOM SYMPTOMS
      const customSymptomEntries = entries.filter((e) => e.custom_symptoms && e.custom_symptoms.length > 0);
      if (customSymptomEntries.length > 0) {
        checkBreak(35);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...darkText);
        doc.text("Custom Symptoms Tracking", margin, y);
        y += 5;
        doc.setDrawColor(...purple);
        doc.setLineWidth(0.5);
        doc.line(margin, y, margin + 50, y);
        y += 7;

        const customCounts = {};
        customSymptomEntries.forEach((e) => {
          e.custom_symptoms.forEach((s) => {
            if (!customCounts[s.name]) customCounts[s.name] = [];
            customCounts[s.name].push(s.severity);
          });
        });

        Object.entries(customCounts).forEach(([name, severities]) => {
          checkBreak(6);
          const avg = severities.reduce((a, b) => a + b) / severities.length;
          doc.setFontSize(8.5);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...darkText);
          doc.text(`• ${name}`, margin, y);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...purple);
          doc.text(`Avg: ${avg.toFixed(1)}/6 (${severities.length} logs)`, margin + 60, y);
          y += 5;
        });
        y += 4;
      }

      // INTIMACY TRACKING
      const intimacyEntries = entries.filter((e) => e.intimacy_logged);
      if (intimacyEntries.length > 0) {
        checkBreak(20);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...darkText);
        doc.text("Intimacy Log", margin, y);
        y += 5;
        doc.setDrawColor(...purple);
        doc.setLineWidth(0.5);
        doc.line(margin, y, margin + 25, y);
        y += 7;

        const unprotected = intimacyEntries.filter((e) => !e.intimacy_protected).length;
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...darkText);
        doc.text(`Total logged: ${intimacyEntries.length} days`, margin, y);
        y += 5;
        if (unprotected > 0) {
          doc.setTextColor([180, 50, 50]);
          doc.setFont("helvetica", "bold");
          doc.text(`Unprotected: ${unprotected} days`, margin, y);
          y += 5;
        }
        y += 4;
      }

      // PREGNANCY-SPECIFIC TRENDS
      const hasPregnancyData = entries.some((e) => e.p_nausea || e.p_vomiting || e.p_fatigue || e.p_mood_changes || e.fetal_movement_felt);
      if (hasPregnancyData) {
        checkBreak(30);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...darkText);
        doc.text("Pregnancy Symptom Log", margin, y);
        y += 5;
        doc.setDrawColor(...purple);
        doc.setLineWidth(0.5);
        doc.line(margin, y, margin + 45, y);
        y += 7;

        const pregnancySymptoms = ["p_nausea", "p_vomiting", "p_fatigue", "p_mood_changes", "p_sleep_issues"];
        const symData = {};
        pregnancySymptoms.forEach((key) => {
          const vals = entries.filter((e) => e[key] > 0).map((e) => e[key]);
          if (vals.length > 0) symData[key] = { avg: vals.reduce((a, b) => a + b) / vals.length, count: vals.length };
        });

        const symLabels = { p_nausea: "Nausea", p_vomiting: "Vomiting", p_fatigue: "Fatigue", p_mood_changes: "Mood Changes", p_sleep_issues: "Sleep Issues" };
        Object.entries(symData).forEach(([key, data]) => {
          checkBreak(5);
          doc.setFontSize(8.5);
          doc.setFont("helvetica", "normal");
          doc.text(`• ${symLabels[key]}`, margin, y);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...purple);
          doc.text(`${data.avg.toFixed(1)}/6 (${data.count} logs)`, margin + 60, y);
          doc.setTextColor(...darkText);
          y += 5;
        });

        const fetalMovement = entries.filter((e) => e.fetal_movement_felt).length;
        if (fetalMovement > 0) {
          doc.setFontSize(8.5);
          doc.setFont("helvetica", "normal");
          doc.text(`• Fetal Movement Felt`, margin, y);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...purple);
          doc.text(`${fetalMovement} days logged`, margin + 60, y);
          doc.setTextColor(...darkText);
          y += 5;
        }
        y += 4;
      }

      // POSTPARTUM-SPECIFIC TRENDS
      const hasPostpartumData = entries.some((e) => e.pp_lochiaBleeding || e.pp_fatigue || e.pp_moodChanges);
      if (hasPostpartumData) {
        checkBreak(30);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...darkText);
        doc.text("Postpartum Symptom Log", margin, y);
        y += 5;
        doc.setDrawColor(...purple);
        doc.setLineWidth(0.5);
        doc.line(margin, y, margin + 45, y);
        y += 7;

        const physicalKeys = ["pp_lochiaBleeding", "pp_perinealPain", "pp_incisionPain", "pp_breastEngorgement"];
        const mentalKeys = ["pp_bondingDifficulties", "pp_anxietyAboutBaby", "pp_moodChanges"];
        const phyLabels = { pp_lochiaBleeding: "Lochia Bleeding", pp_perinealPain: "Perineal Pain", pp_incisionPain: "Incision Pain", pp_breastEngorgement: "Breast Engorgement" };
        const menLabels = { pp_bondingDifficulties: "Bonding Issues", pp_anxietyAboutBaby: "Baby Anxiety", pp_moodChanges: "Mood Changes" };

        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...purple);
        doc.text("Physical Symptoms", margin, y);
        y += 4;
        physicalKeys.forEach((key) => {
          const vals = entries.filter((e) => e[key] > 0).map((e) => e[key]);
          if (vals.length > 0) {
            const avg = vals.reduce((a, b) => a + b) / vals.length;
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...darkText);
            doc.text(`• ${phyLabels[key]}`, margin + 2, y);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...purple);
            doc.text(`${avg.toFixed(1)}/6`, margin + 60, y);
            doc.setTextColor(...darkText);
            y += 4;
          }
        });

        y += 2;
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...purple);
        doc.text("Mental/Emotional", margin, y);
        y += 4;
        mentalKeys.forEach((key) => {
          const vals = entries.filter((e) => e[key] > 0).map((e) => e[key]);
          if (vals.length > 0) {
            const avg = vals.reduce((a, b) => a + b) / vals.length;
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...darkText);
            doc.text(`• ${menLabels[key]}`, margin + 2, y);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...purple);
            doc.text(`${avg.toFixed(1)}/6`, margin + 60, y);
            doc.setTextColor(...darkText);
            y += 4;
          }
        });
        y += 4;
      }

      // MENOPAUSE/PERIMENOPAUSE-SPECIFIC TRENDS
      const hasMenopauseData = entries.some((e) => e.m_hot_flashes || e.m_night_sweats || e.m_mood_swings);
      if (hasMenopauseData) {
        checkBreak(30);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...darkText);
        doc.text("Menopause/Perimenopause Symptom Log", margin, y);
        y += 5;
        doc.setDrawColor(...purple);
        doc.setLineWidth(0.5);
        doc.line(margin, y, margin + 70, y);
        y += 7;

        const mKeys = ["m_hot_flashes", "m_night_sweats", "m_vaginal_dryness", "m_mood_swings", "m_brain_fog", "m_joint_pain", "m_fatigue"];
        const mLabels = { m_hot_flashes: "Hot Flashes", m_night_sweats: "Night Sweats", m_vaginal_dryness: "Vaginal Dryness", m_mood_swings: "Mood Swings", m_brain_fog: "Brain Fog", m_joint_pain: "Joint Pain", m_fatigue: "Fatigue" };

        mKeys.forEach((key) => {
          const vals = entries.filter((e) => e[key] > 0).map((e) => e[key]);
          if (vals.length > 0) {
            const avg = vals.reduce((a, b) => a + b) / vals.length;
            checkBreak(5);
            doc.setFontSize(8.5);
            doc.setFont("helvetica", "normal");
            doc.text(`• ${mLabels[key]}`, margin, y);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...purple);
            doc.text(`${avg.toFixed(1)}/6 (${vals.length} logs)`, margin + 60, y);
            doc.setTextColor(...darkText);
            y += 4;
          }
        });
        y += 4;
      }

      // DAILY SYMPTOM LOG
      const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));
      if (sortedEntries.length > 0) {
        addPage();
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...darkText);
        doc.text("Daily Symptom Log (DRSP Scale 1-6)", margin, y);
        y += 5;
        doc.setDrawColor(...purple);
        doc.setLineWidth(0.5);
        doc.line(margin, y, margin + 60, y);
        y += 5;
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...mutedText);
        doc.text("1=Not at all  2=Minimal  3=Mild  4=Moderate  5=Severe  6=Extreme  bold=Mod+ (>=4)", margin, y);
        y += 7;

        const recent = sortedEntries.slice(-42);
        const labelW = 66;
        const maxPerRow = 14;
        const chunks = [];
        for (let i = 0; i < recent.length; i += maxPerRow) chunks.push(recent.slice(i, i + maxPerRow));

        SYMPTOM_CATEGORIES.forEach((cat) => {
          checkBreak(16);
          doc.setFillColor(240, 238, 255);
          doc.rect(margin, y, contentW, 6.5, "F");
          doc.setFontSize(8.5);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...purple);
          doc.text(cat.label, margin + 2, y + 4.5);
          y += 6.5;

          chunks.forEach((chunk) => {
            const scoreW = (contentW - labelW) / chunk.length;
            checkBreak(8 + cat.symptoms.length * 5.5);
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

            cat.symptoms.forEach((sym, si) => {
              checkBreak(6);
              if (si % 2 === 0) { doc.setFillColor(252, 252, 255); doc.rect(margin, y, contentW, 5.5, "F"); }
              doc.setFontSize(6.5);
              doc.setFont("helvetica", "normal");
              doc.setTextColor(...darkText);
              doc.text((sym.shortLabel || sym.label).slice(0, 42), margin + 2, y + 3.8);
              chunk.forEach((entry, j) => {
                const val = entry[sym.key];
                const txt = val ? String(val) : "-";
                doc.setFont("helvetica", val && val >= 4 ? "bold" : "normal");
                doc.setTextColor(...(val && val >= 4 ? [180, 50, 50] : mutedText));
                doc.text(txt, margin + labelW + j * scoreW + scoreW / 2, y + 3.8, { align: "center" });
              });
              y += 5.5;
            });
            y += 3;
          });
          y += 2;
        });
      }

      // JOURNAL NOTES
      const journalEntries = sortedEntries.filter((e) => (e.journal_entry || e.notes || "").trim());
      if (journalEntries.length > 0) {
        addPage();
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...darkText);
        doc.text("Journal Notes", margin, y);
        y += 5;
        doc.setDrawColor(...purple);
        doc.setLineWidth(0.5);
        doc.line(margin, y, margin + 30, y);
        y += 7;

        journalEntries.forEach((e) => {
          checkBreak(14);
          doc.setFontSize(8.5);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...purple);
          doc.text(format(new Date(e.date), "MMM d, yyyy"), margin, y);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...darkText);
          const txt = (e.journal_entry || e.notes || "").trim();
          const lines = doc.splitTextToSize(txt, contentW - 5);
          doc.text(lines, margin + 35, y);
          y += Math.max(6, lines.length * 4.5) + 3;
        });
      }

      // Page numbers
      const total = doc.internal.getNumberOfPages();
      for (let p = 1; p <= total; p++) {
        doc.setPage(p);
        doc.setFontSize(7);
        doc.setTextColor(...mutedText);
        doc.text(`Page ${p} of ${total}  |  CycleMind DRSP Clinical Report`, pageW / 2, 291, { align: "center" });
      }

      doc.save(`CycleMind_Clinical_Report_${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast.success("Clinical report downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={loading}
      className="w-full h-12 rounded-2xl text-base font-semibold gap-2 shadow-lg shadow-primary/20"
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileDown className="w-5 h-5" />}
      {loading ? "Generating Clinical PDF…" : "Download Clinical Report (PDF)"}
    </Button>
  );
}