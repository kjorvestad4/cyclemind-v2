import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { jsPDF } from 'npm:jspdf@4.0.0';
import { differenceInDays, format, parseISO, subDays } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { includeJournal, includeMedications, includeScreening, includeChart, includeAppointmentPrep, start_date, end_date } = await req.json();

    const startDate = start_date ? parseISO(start_date) : subDays(new Date(), 90);
    const endDate = end_date ? parseISO(end_date) : new Date();

    const cycles = await base44.entities.Cycle.filter({ user_id: user.id });
    const entries = await base44.entities.DailyEntry.filter({});
    
    const recentEntries = entries.filter(e => {
      const entryDate = parseISO(e.date);
      return entryDate >= startDate && entryDate <= endDate;
    });

    const totalDaysLogged = recentEntries.length;
    const avgCycleLength = cycles.length > 0 
      ? Math.round(cycles.reduce((sum, c) => sum + (c.cycle_length || 28), 0) / cycles.length)
      : null;

    const phq9Scores = recentEntries.filter(e => e.phq9_score).map(e => e.phq9_score);
    const gad7Scores = recentEntries.filter(e => e.gad7_score).map(e => e.gad7_score);
    const epdsScores = recentEntries.filter(e => e.epds_score).map(e => e.epds_score);

    const avgPHQ9 = phq9Scores.length ? (phq9Scores.reduce((a, b) => a + b, 0) / phq9Scores.length).toFixed(1) : null;
    const avgGAD7 = gad7Scores.length ? (gad7Scores.reduce((a, b) => a + b, 0) / gad7Scores.length).toFixed(1) : null;
    const avgEPDS = epdsScores.length ? (epdsScores.reduce((a, b) => a + b, 0) / epdsScores.length).toFixed(1) : null;

    const symptomCounts = {};
    recentEntries.forEach(e => {
      Object.entries(e).forEach(([key, value]) => {
        if (key.startsWith('s_') || key.startsWith('m_') || key.startsWith('p_') || key.startsWith('pp_')) {
          if (value && value >= 3) {
            symptomCounts[key] = (symptomCounts[key] || 0) + 1;
          }
        }
      });
    });

    const topSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([symptom, count]) => ({
        name: symptom.replace(/[smp]_/, '').replace(/_/g, ' '),
        daysReported: count
      }));

    const doc = new jsPDF();
    
    // ====== PROFESSIONAL HEADER ======
    doc.setFillColor(230, 247, 241);
    doc.rect(0, 0, 210, 45, 'F');
    
    doc.setFillColor(10, 90, 60);
    doc.rect(0, 0, 210, 5, 'F');
    
    doc.setFontSize(24);
    doc.setTextColor(10, 90, 60);
    doc.setFont("helvetica", "bold");
    doc.text('CycleMind Clinical Summary', 20, 28);
    
    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.setFont("helvetica", "normal");
    doc.text(`Patient: ${user.full_name || 'Anonymous'}`, 20, 36);
    doc.text(`Report Generated: ${format(new Date(), 'MMM d, yyyy')}`, 20, 41);
    doc.text(`Reporting Period: ${format(startDate, 'MMM d, yyyy')} – ${format(endDate, 'MMM d, yyyy')}`, 20, 46);

    const latestCycle = [...cycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date))[0];

    if (latestCycle) {
      doc.setFontSize(9);
      doc.setTextColor(10, 90, 60);
      doc.setFont("helvetica", "bold");
      if (latestCycle.cycle_type === 'pregnancy' || latestCycle.is_pregnancy_mode) {
        doc.text(`Pregnancy Mode | EDD: ${latestCycle.estimated_due_date || 'N/A'} | Week: ${latestCycle.pregnancy_week || 'N/A'}`, 20, 52);
      } else if (latestCycle.cycle_type === 'menopause' || latestCycle.is_menopause_mode) {
        doc.text(`Menopause Tracking | HRT: ${latestCycle.hrt_type || 'None'}`, 20, 52);
      }
    }

    doc.setFontSize(7);
    doc.setTextColor(120);
    doc.setFont("helvetica", "italic");
    doc.text('CONFIDENTIAL: This report contains sensitive health information. For healthcare provider use only.', 20, latestCycle ? 60 : 55);

    let yPosition = latestCycle ? 65 : 60;

    // ====== SECTION 1: CYCLE SUMMARY ======
    drawSectionHeader(doc, 'Cycle Summary', yPosition);
    yPosition += 12;
    
    doc.setFontSize(10);
    doc.setTextColor(50);
    drawStatRow(doc, 'Total Cycles Logged', cycles.length.toString(), 25, yPosition);
    yPosition += 6;
    drawStatRow(doc, 'Average Cycle Length', `${avgCycleLength || 'N/A'} days`, 25, yPosition);
    yPosition += 6;
    drawStatRow(doc, 'Days Tracked', totalDaysLogged.toString(), 25, yPosition);
    yPosition += 6;

    if (user.luteal_phase_length) {
      drawStatRow(doc, 'User-set Luteal Phase', `${user.luteal_phase_length} days`, 25, yPosition);
      yPosition += 6;
    }

    if (latestCycle) {
      drawStatRow(doc, 'Cycle Type', latestCycle.cycle_type || 'Menstrual', 25, yPosition);
      yPosition += 6;
      if (latestCycle.cycle_type === 'pregnancy' || latestCycle.is_pregnancy_mode) {
        drawStatRow(doc, 'Pregnancy Week', `${latestCycle.pregnancy_week || 'N/A'} | ${latestCycle.trimester || 'N/A'}`, 25, yPosition);
        yPosition += 6;
      }
    }
    yPosition += 5;

    // ====== SECTION 2: MOOD SCREENING ======
    drawSectionHeader(doc, 'Mood Screening Scores (90-Day Average)', yPosition);
    yPosition += 12;
    
    if (avgPHQ9) {
      const severity = getSeverityColor(parseFloat(avgPHQ9));
      doc.setTextColor(...severity.color);
      doc.setFont("helvetica", "bold");
      drawStatRow(doc, 'PHQ-9 (Depression)', `${avgPHQ9} ${severity.label}`, 25, yPosition);
      yPosition += 6;
      doc.setTextColor(50);
      doc.setFont("helvetica", "normal");
    }
    if (avgGAD7) {
      const severity = getSeverityColor(parseFloat(avgGAD7));
      doc.setTextColor(...severity.color);
      doc.setFont("helvetica", "bold");
      drawStatRow(doc, 'GAD-7 (Anxiety)', `${avgGAD7} ${severity.label}`, 25, yPosition);
      yPosition += 6;
      doc.setTextColor(50);
      doc.setFont("helvetica", "normal");
    }
    if (avgEPDS) {
      const severity = getSeverityColor(parseFloat(avgEPDS));
      doc.setTextColor(...severity.color);
      doc.setFont("helvetica", "bold");
      drawStatRow(doc, 'EPDS (Postpartum)', `${avgEPDS} ${severity.label}`, 25, yPosition);
      yPosition += 6;
    }
    yPosition += 5;

    // ====== SECTION 3: SYMPTOM DISTRIBUTION (COLORFUL BAR CHART) ======
    if (topSymptoms.length > 0) {
      drawSectionHeader(doc, 'Top Symptoms Breakdown', yPosition);
      yPosition += 12;
      
      doc.setFontSize(9);
      doc.setTextColor(80);
      doc.setFont("helvetica", "normal");
      doc.text('Symptoms with moderate+ severity (3+) by frequency:', 25, yPosition);
      yPosition += 8;

      // Colorful horizontal bar chart
      const maxDays = Math.max(...topSymptoms.slice(0, 8).map(s => s.daysReported));
      const barHeight = 6;
      const barGap = 5;
      const chartStartX = 90;
      const maxBarWidth = 100;
      
      topSymptoms.slice(0, 8).forEach((symptom, idx) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        const barWidth = (symptom.daysReported / maxDays) * maxBarWidth;
        const color = getBarColor(idx);
        
        // Symptom name (formatted nicely)
        doc.setFontSize(9);
        doc.setTextColor(50);
        doc.setFont("helvetica", "normal");
        const shortName = formatSymptomName(symptom.name);
        doc.text(shortName, 25, yPosition + 2);
        
        // Colored bar
        doc.setFillColor(...color);
        doc.rect(chartStartX, yPosition, barWidth, barHeight, 'F');
        
        // Days count
        doc.setFontSize(9);
        doc.setTextColor(80);
        doc.text(`${symptom.daysReported} days`, chartStartX + barWidth + 3, yPosition + 4);
        
        yPosition += barHeight + barGap;
      });
      
      yPosition += 5;
    }

    // ====== SECTION 4: PROGRESS CHART ======
    if (includeChart && recentEntries.length > 0) {
      drawSectionHeader(doc, 'Symptom Progress Over Time', yPosition);
      yPosition += 12;
      
      const weeklyData = {};
      recentEntries.forEach(e => {
        const d = parseISO(e.date);
        const weekStart = subDays(d, d.getDay());
        const weekKey = format(weekStart, 'MMM d');
        
        if (!weeklyData[weekKey]) weeklyData[weekKey] = { sum: 0, count: 0 };
        
        const symptomKeys = Object.keys(e).filter(k => k.startsWith('s_') || k.startsWith('m_') || k.startsWith('p_') || k.startsWith('pp_'));
        const avg = symptomKeys.reduce((s, k) => s + (e[k] || 0), 0) / symptomKeys.length;
        
        weeklyData[weekKey].sum += avg;
        weeklyData[weekKey].count++;
      });
      
      const chartData = Object.entries(weeklyData)
        .map(([week, data]) => ({ week, avg: parseFloat((data.sum / data.count).toFixed(1)) }))
        .sort((a, b) => new Date(a.week) - new Date(b.week))
        .slice(-8);
      
      if (chartData.length > 0) {
        const maxVal = Math.max(...chartData.map(d => d.avg), 1);
        const barWidth = 14;
        const gap = 4;
        const chartHeight = 50;
        const startX = 25;
        const baseY = yPosition + chartHeight + 10;
        
        chartData.forEach((d, i) => {
          const barHeight = (d.avg / maxVal) * chartHeight;
          const x = startX + i * (barWidth + gap);
          
          doc.setFillColor(20, 180, 140);
          doc.rect(x, baseY - barHeight, barWidth, barHeight, 'F');
          
          doc.setFontSize(7);
          doc.setTextColor(80);
          doc.text(d.avg.toString(), x + barWidth / 2, baseY - barHeight - 1, { align: 'center' });
          
          doc.setFontSize(6);
          doc.text(d.week.slice(0, 5), x + barWidth / 2, baseY + 3, { align: 'center' });
        });
        
        yPosition += chartHeight + 20;
      }
    }

    // ====== SECTION 5: APPOINTMENT PREP ======
    if (includeAppointmentPrep) {
      drawSectionHeader(doc, 'Appointment Preparation', yPosition);
      yPosition += 12;
      
      doc.setFontSize(9);
      doc.setTextColor(50);
      
      if (topSymptoms.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.text('Top symptoms to discuss:', 25, yPosition);
        yPosition += 5;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80);
        doc.text(topSymptoms.slice(0, 3).map(s => `• ${formatSymptomName(s.name)}`).join(' | '), 25, yPosition);
        yPosition += 8;
        doc.setTextColor(50);
      }
      
      if (avgPHQ9 || avgGAD7) {
        doc.setFont("helvetica", "bold");
        doc.text('Mood screening averages:', 25, yPosition);
        yPosition += 5;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80);
        const scores = [];
        if (avgPHQ9) scores.push(`PHQ-9: ${avgPHQ9}`);
        if (avgGAD7) scores.push(`GAD-7: ${avgGAD7}`);
        doc.text(scores.join(' | '), 25, yPosition);
        yPosition += 8;
        doc.setTextColor(50);
      }
      
      doc.setFont("helvetica", "bold");
      doc.text('Questions for your provider:', 25, yPosition);
      yPosition += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80);
      doc.text('1. Are my symptoms consistent with PMDD?', 25, yPosition);
      yPosition += 4;
      doc.text('2. What treatment options do you recommend?', 25, yPosition);
      yPosition += 4;
      doc.text('3. Should I adjust tracking or medication timing?', 25, yPosition);
      yPosition += 5;
    }

    // ====== FOOTER ======
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      doc.setFillColor(230, 247, 241);
      doc.rect(0, 280, 210, 27, 'F');
      
      doc.setFillColor(10, 90, 60);
      doc.rect(0, 280, 210, 3, 'F');
      
      doc.setFontSize(8);
      doc.setTextColor(10, 90, 60);
      doc.setFont("helvetica", "bold");
      doc.text('DRSP-Based Clinical Assessment Tool', 20, 288);
      
      doc.setFontSize(7);
      doc.setTextColor(80);
      doc.setFont("helvetica", "normal");
      doc.text('Based on the Daily Record of Severity of Problems — Endicott, Nee & Harrison (2006).', 20, 294);
      doc.text('For informational purposes only — not a diagnostic tool.', 20, 299);
      doc.setTextColor(100);
      doc.text(`Page ${i} of ${pageCount} | Generated by CycleMind`, 135, 304);
    }

    const pdfBytes = doc.output('arraybuffer');
    
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="CycleMind_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf"`
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// ====== HELPER FUNCTIONS ======

function drawSectionHeader(doc, title, y) {
  doc.setFillColor(245, 252, 250);
  doc.rect(20, y - 6, 170, 9, 'F');
  
  doc.setFillColor(10, 90, 60);
  doc.rect(20, y - 6, 4, 9, 'F');
  
  doc.setFontSize(14);
  doc.setTextColor(10, 90, 60);
  doc.setFont("helvetica", "bold");
  doc.text(title, 28, y + 2);
}

function drawStatRow(doc, label, value, x, y) {
  doc.setTextColor(80);
  doc.setFont("helvetica", "normal");
  doc.text(`${label}:`, x, y);
  doc.setTextColor(10, 90, 60);
  doc.setFont("helvetica", "bold");
  doc.text(value, x + 55, y);
}

function getSeverityColor(score) {
  if (score >= 15) return { color: [220, 80, 80], label: '(Moderate-Severe)' };
  if (score >= 10) return { color: [240, 180, 80], label: '(Moderate)' };
  if (score >= 5) return { color: [20, 180, 140], label: '(Mild)' };
  return { color: [100, 100, 100], label: '(Minimal)' };
}

function getSeverityLabel(score) {
  if (score >= 15) return '(Moderate-Severe)';
  if (score >= 10) return '(Moderate)';
  if (score >= 5) return '(Mild)';
  return '(Minimal)';
}

function getBarColor(index) {
  const colors = [
    [10, 90, 60],     // Dark teal
    [41, 128, 185],   // Blue
    [39, 174, 96],    // Green
    [241, 196, 15],   // Yellow
    [230, 126, 34],   // Orange
    [155, 89, 182],   // Purple
    [231, 76, 60],    // Red
    [52, 152, 219],   // Light blue
  ];
  return colors[index % colors.length];
}

function formatSymptomName(name) {
  // Convert "hot_flashes" to "Hot Flashes" with proper capitalization
  return name
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}