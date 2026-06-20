import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { jsPDF } from 'npm:jspdf@4.0.0';
import { format, parseISO, subDays } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { includeJournal, includeMedications, includeScreening, includeChart, includeAppointmentPrep, start_date, end_date } = await req.json();
    const startDate = start_date ? parseISO(start_date) : subDays(new Date(), 90);
    const endDate = end_date ? parseISO(end_date) : new Date();

    const cycles = await base44.entities.Cycle.filter({ user_id: user.id });
    const entries = await base44.entities.DailyEntry.filter({});
    const recentEntries = entries.filter(e => {
      const entryDate = parseISO(e.date);
      return entryDate >= startDate && entryDate <= endDate;
    });

    // Calculate stats
    const avgCycleLength = cycles.length > 0 ? Math.round(cycles.reduce((sum, c) => sum + (c.cycle_length || 28), 0) / cycles.length) : null;
    
    const phq9Scores = recentEntries.filter(e => e.phq9_score).map(e => e.phq9_score);
    const gad7Scores = recentEntries.filter(e => e.gad7_score).map(e => e.gad7_score);
    const epdsScores = recentEntries.filter(e => e.epds_score).map(e => e.epds_score);
    const avgPHQ9 = phq9Scores.length ? (phq9Scores.reduce((a, b) => a + b, 0) / phq9Scores.length).toFixed(1) : null;
    const avgGAD7 = gad7Scores.length ? (gad7Scores.reduce((a, b) => a + b, 0) / gad7Scores.length).toFixed(1) : null;
    const avgEPDS = epdsScores.length ? (epdsScores.reduce((a, b) => a + b, 0) / epdsScores.length).toFixed(1) : null;

    const symptomCounts = {};
    recentEntries.forEach(e => {
      Object.entries(e).forEach(([key, value]) => {
        if ((key.startsWith('s_') || key.startsWith('m_') || key.startsWith('p_') || key.startsWith('pp_')) && value && value >= 3) {
          symptomCounts[key] = (symptomCounts[key] || 0) + 1;
        }
      });
    });
    const topSymptoms = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([symptom, count]) => ({ name: symptom.replace(/[smp]_/, '').replace(/_/g, ' '), daysReported: count }));

    const doc = new jsPDF();
    const margin = 15;
    const contentWidth = 180;

    // ====== BEAUTIFUL HEADER ======
    // Gradient background
    const gradient = doc.linearGradient(0, 0, 210, 50, 230, 247, 241, 255, 255, 255);
    doc.setFillColor(230, 247, 241);
    doc.rect(0, 0, 210, 50, 'F');
    
    // Top accent bar
    doc.setFillColor(10, 90, 60);
    doc.rect(0, 0, 210, 5, 'F');
    
    // Title
    doc.setFontSize(26);
    doc.setTextColor(10, 90, 60);
    doc.setFont("helvetica", "bold");
    doc.text('CycleMind', 20, 25);
    doc.setFontSize(18);
    doc.setFont("helvetica", "normal");
    doc.text('Clinical Summary', 75, 25);
    
    // Metadata
    doc.setFontSize(9);
    doc.setTextColor(70);
    doc.text(`Patient: ${user.full_name || 'Anonymous'}`, 20, 35);
    doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy')}`, 20, 40);
    doc.text(`Period: ${format(startDate, 'MMM d')} – ${format(endDate, 'MMM d, yyyy')}`, 20, 45);
    doc.text(`Cycles: ${cycles.length} | Days tracked: ${recentEntries.length}`, 20, 50);

    let y = 58;

    // ====== SECTION 1: MOOD SCREENING ======
    doc.setFillColor(245, 252, 250);
    doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'F');
    doc.setFillColor(10, 90, 60);
    doc.rect(margin, y, 4, 12, 'F');
    doc.setFontSize(13);
    doc.setTextColor(10, 90, 60);
    doc.setFont("helvetica", "bold");
    doc.text('🧠 Mood Screening Scores', margin + 10, y + 8);
    y += 14;

    if (avgPHQ9 || avgGAD7 || avgEPDS) {
      const scores = [];
      if (avgPHQ9) scores.push({ name: 'PHQ-9 (Depression)', value: avgPHQ9, ...getSeverityColor(parseFloat(avgPHQ9)) });
      if (avgGAD7) scores.push({ name: 'GAD-7 (Anxiety)', value: avgGAD7, ...getSeverityColor(parseFloat(avgGAD7)) });
      if (avgEPDS) scores.push({ name: 'EPDS (Postpartum)', value: avgEPDS, ...getSeverityColor(parseFloat(avgEPDS)) });

      scores.forEach((score, i) => {
        doc.setTextColor(...score.color);
        doc.setFont("helvetica", "bold");
        doc.text(`${score.name}: ${score.value}`, margin + 5 + (i % 2) * 90, y);
        doc.setFont("helvetica", "normal");
        doc.text(score.label, margin + 45 + (i % 2) * 90, y);
        if (i % 2 === 1) y += 8;
      });
      if (scores.length % 2 === 1) y += 4;
    } else {
      doc.setTextColor(120);
      doc.setFont("helvetica", "italic");
      doc.text('No screening scores logged', margin + 5, y);
      y += 8;
    }
    y += 6;

    // ====== SECTION 2: TOP SYMPTOMS (COLORFUL BAR CHART) ======
    if (topSymptoms.length > 0) {
      doc.setFillColor(245, 252, 250);
      doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'F');
      doc.setFillColor(10, 90, 60);
      doc.rect(margin, y, 4, 12, 'F');
      doc.setFontSize(13);
      doc.setTextColor(10, 90, 60);
      doc.setFont("helvetica", "bold");
      doc.text('📊 Top Symptoms Breakdown', margin + 10, y + 8);
      y += 15;

      const maxDays = Math.max(...topSymptoms.slice(0, 8).map(s => s.daysReported));
      const barHeight = 7;
      const barGap = 5;
      const chartStartX = 85;
      const maxBarWidth = 95;

      topSymptoms.slice(0, 8).forEach((symptom, idx) => {
        const barWidth = (symptom.daysReported / maxDays) * maxBarWidth;
        const color = getBarColor(idx);
        
        // Symptom name
        doc.setFontSize(9);
        doc.setTextColor(50);
        doc.setFont("helvetica", "normal");
        const shortName = formatSymptomName(symptom.name).substring(0, 18);
        doc.text(shortName, margin + 5, y + 5);
        
        // Colored bar with rounded effect
        doc.setFillColor(...color);
        doc.roundedRect(chartStartX, y, barWidth, barHeight, 1, 1, 'F');
        
        // Days count
        doc.setFontSize(9);
        doc.setTextColor(80);
        doc.text(`${symptom.daysReported} days`, chartStartX + barWidth + 3, y + 5);
        
        y += barHeight + barGap;
      });
      y += 4;
    }

    // ====== SECTION 3: PROGRESS CHART ======
    if (includeChart && recentEntries.length > 10) {
      doc.setFillColor(245, 252, 250);
      doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'F');
      doc.setFillColor(10, 90, 60);
      doc.rect(margin, y, 4, 12, 'F');
      doc.setFontSize(13);
      doc.setTextColor(10, 90, 60);
      doc.setFont("helvetica", "bold");
      doc.text('📈 Symptom Progress Over Time', margin + 10, y + 8);
      y += 15;

      // Calculate weekly averages
      const weeklyData = {};
      recentEntries.forEach(e => {
        const d = parseISO(e.date);
        const weekStart = subDays(d, d.getDay());
        const weekKey = format(weekStart, 'MMM d');
        if (!weeklyData[weekKey]) weeklyData[weekKey] = { sum: 0, count: 0 };
        const symptomKeys = Object.keys(e).filter(k => k.startsWith('s_') || k.startsWith('m_') || k.startsWith('p_') || k.startsWith('pp_'));
        weeklyData[weekKey].sum += symptomKeys.reduce((s, k) => s + (e[k] || 0), 0) / symptomKeys.length;
        weeklyData[weekKey].count++;
      });

      const chartData = Object.entries(weeklyData)
        .map(([week, data]) => ({ week, avg: parseFloat((data.sum / data.count).toFixed(1)) }))
        .sort((a, b) => new Date(a.week) - new Date(b.week))
        .slice(-8);

      if (chartData.length > 0) {
        const maxVal = Math.max(...chartData.map(d => d.avg), 1);
        const barWidth = 16;
        const gap = 4;
        const chartHeight = 55;
        const startX = margin + 5;
        const baseY = y + chartHeight + 10;

        chartData.forEach((d, i) => {
          const barHeight = (d.avg / maxVal) * chartHeight;
          const x = startX + i * (barWidth + gap);
          
          doc.setFillColor(20, 180, 140);
          doc.roundedRect(x, baseY - barHeight, barWidth, barHeight, 1, 1, 'F');
          
          doc.setFontSize(7);
          doc.setTextColor(80);
          doc.text(d.avg.toString(), x + barWidth / 2, baseY - barHeight - 2, { align: 'center' });
          
          doc.setFontSize(6);
          doc.text(d.week.slice(0, 5), x + barWidth / 2, baseY + 3, { align: 'center' });
        });

        // Severity reference line
        const modY = baseY - (3 / 6) * chartHeight;
        doc.setDrawColor(200);
        doc.setLineDash([2, 2]);
        doc.line(startX, modY, startX + chartData.length * (barWidth + gap), modY);
        doc.setFontSize(6);
        doc.setTextColor(150);
        doc.text('Moderate', startX + chartData.length * (barWidth + gap) + 2, modY);

        y += chartHeight + 25;
      }
    }

    // ====== SECTION 4: APPOINTMENT PREP ======
    if (includeAppointmentPrep) {
      doc.setFillColor(245, 252, 250);
      doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'F');
      doc.setFillColor(10, 90, 60);
      doc.rect(margin, y, 4, 12, 'F');
      doc.setFontSize(13);
      doc.setTextColor(10, 90, 60);
      doc.setFont("helvetica", "bold");
      doc.text('📋 Appointment Preparation', margin + 10, y + 8);
      y += 15;

      doc.setFontSize(9);
      doc.setTextColor(50);
      
      if (topSymptoms.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.text('Top symptoms:', margin + 5, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80);
        doc.text(topSymptoms.slice(0, 3).map(s => `• ${formatSymptomName(s.name)}`).join('  '), margin + 5, y);
        y += 8;
      }
      
      if (avgPHQ9 || avgGAD7) {
        doc.setFont("helvetica", "bold");
        doc.text('Mood scores:', margin + 5, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80);
        const scores = [];
        if (avgPHQ9) scores.push(`PHQ-9: ${avgPHQ9}`);
        if (avgGAD7) scores.push(`GAD-7: ${avgGAD7}`);
        doc.text(scores.join('  '), margin + 5, y);
        y += 8;
      }
      
      doc.setFont("helvetica", "bold");
      doc.text('Questions to ask:', margin + 5, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80);
      doc.text('1. Are my symptoms consistent with PMDD?', margin + 5, y);
      y += 4;
      doc.text('2. What treatment options do you recommend?', margin + 5, y);
      y += 4;
      doc.text('3. Should I adjust tracking or medication?', margin + 5, y);
      y += 6;
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
      doc.text('Based on the Daily Record of Severity of Problems (2006). For informational purposes only.', 20, 294);
      doc.setTextColor(100);
      doc.text(`Page ${i} of ${pageCount}`, 150, 302);
    }

    return new Response(doc.output('arraybuffer'), {
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

function getSeverityColor(score) {
  if (score >= 15) return { color: [220, 80, 80], label: '(Mod-Severe)' };
  if (score >= 10) return { color: [240, 180, 80], label: '(Moderate)' };
  if (score >= 5) return { color: [20, 180, 140], label: '(Mild)' };
  return { color: [100, 100, 100], label: '(Minimal)' };
}

function getBarColor(index) {
  const colors = [[10, 90, 60], [41, 128, 185], [39, 174, 96], [241, 196, 15], [230, 126, 34], [155, 89, 182], [231, 76, 60], [52, 152, 219]];
  return colors[index % colors.length];
}

function formatSymptomName(name) {
  return name.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}