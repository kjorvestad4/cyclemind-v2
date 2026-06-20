import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { jsPDF } from 'npm:jspdf@4.0.0';
import { format, parseISO, subDays, differenceInDays } from 'npm:date-fns@3.6.0';

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

    // Symptom counts
    const symptomCounts = {};
    recentEntries.forEach(e => {
      Object.entries(e).forEach(([key, value]) => {
        if ((key.startsWith('s_') || key.startsWith('m_') || key.startsWith('p_') || key.startsWith('pp_')) && value && value >= 3) {
          symptomCounts[key] = (symptomCounts[key] || 0) + 1;
        }
      });
    });
    const topSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([key, count]) => ({
        key,
        name: key.replace(/^(s_|m_|p_|pp_)/, '').replace(/_/g, ' '),
        daysReported: count
      }));

    // Calculate mood trend data (for line chart)
    const MOOD_KEYS = ["s_depressed", "s_anxious", "s_mood_swings", "s_angry", "s_hopeless", "s_sensitive", "s_overwhelmed", "s_out_of_control"];
    const PHYSICAL_KEYS = ["s_breast_tender", "s_bloating", "s_headache", "s_pain", "s_insomnia", "s_hypersomnia", "s_appetite"];
    const moodTrendData = [...recentEntries]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30)
      .map(e => ({
        date: format(parseISO(e.date), 'M/d'),
        mood: parseFloat((MOOD_KEYS.reduce((s, k) => s + (e[k] || 0), 0) / MOOD_KEYS.length).toFixed(1)),
        physical: parseFloat((PHYSICAL_KEYS.reduce((s, k) => s + (e[k] || 0), 0) / PHYSICAL_KEYS.length).toFixed(1)),
        total: parseFloat((calculateDayTotal(e) / 22).toFixed(1))
      }));

    // Calculate weekly severity trend
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
    const weeklyTrend = Object.entries(weeklyData)
      .map(([week, data]) => ({ week, avg: parseFloat((data.sum / data.count).toFixed(1)) }))
      .sort((a, b) => new Date(a.week) - new Date(b.week))
      .slice(-8);

    const doc = new jsPDF();
    const margin = 15;
    const contentWidth = 180;

    // ====== PROFESSIONAL HEADER ======
    // Teal gradient header
    doc.setFillColor(20, 100, 80);
    doc.rect(0, 0, 210, 45, 'F');
    
    // Lavender accent bar
    doc.setFillColor(180, 160, 200);
    doc.rect(0, 42, 210, 3, 'F');
    
    // Logo circle
    doc.setFillColor(255, 255, 255);
    doc.circle(25, 22, 12, 'F');
    doc.setFontSize(18);
    doc.setTextColor(20, 100, 80);
    doc.setFont("helvetica", "bold");
    doc.text('C', 21, 27);
    
    // Title
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text('CycleMind', 45, 20);
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text('Clinical Summary Report', 45, 28);
    
    // Metadata
    doc.setFontSize(9);
    doc.setTextColor(240, 240, 240);
    doc.text(`Patient: ${user.full_name || 'Anonymous'}`, 45, 36);
    doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy')}`, 45, 41);
    doc.text(`Report Period: ${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`, margin, 50);
    doc.text(`Cycles Analyzed: ${cycles.length} | Days Tracked: ${recentEntries.length}`, margin, 55);

    let y = 63;

    // ====== SECTION 1: KEY METRICS ======
    doc.setFillColor(245, 250, 248);
    doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'F');
    
    // Teal header bar
    doc.setFillColor(20, 100, 80);
    doc.roundedRect(margin, y, contentWidth, 5, 2, 2, 'F');
    
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text('Key Metrics', margin + 5, y + 3.5);
    
    y += 8;
    doc.setFontSize(9);
    doc.setTextColor(50);
    doc.setFont("helvetica", "normal");
    
    // Metrics grid
    const metrics = [
      { label: 'Avg Cycle Length', value: avgCycleLength ? `${avgCycleLength} days` : 'N/A' },
      { label: 'Total Cycles', value: `${cycles.length}` },
      { label: 'Days Tracked', value: `${recentEntries.length}` },
      { label: 'Report Period', value: `${differenceInDays(endDate, startDate)} days` }
    ];
    
    metrics.forEach((m, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = margin + 5 + col * 88;
      const yPos = y + row * 7;
      
      doc.setTextColor(120);
      doc.setFont("helvetica", "normal");
      doc.text(m.label, x, yPos);
      
      doc.setTextColor(20, 100, 80);
      doc.setFont("helvetica", "bold");
      doc.text(m.value, x + 40, yPos);
    });
    
    y += 20;

    // ====== SECTION 2: MOOD SCREENING ======
    if (includeScreening && (avgPHQ9 || avgGAD7 || avgEPDS)) {
      doc.setFillColor(245, 250, 248);
      doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'F');
      
      doc.setFillColor(20, 100, 80);
      doc.roundedRect(margin, y, contentWidth, 5, 2, 2, 'F');
      
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text('Mood Screening Scores', margin + 5, y + 3.5);
      y += 8;
      
      const scores = [];
      if (avgPHQ9) scores.push({ name: 'PHQ-9 (Depression)', value: avgPHQ9, ...getSeverityColor(parseFloat(avgPHQ9)) });
      if (avgGAD7) scores.push({ name: 'GAD-7 (Anxiety)', value: avgGAD7, ...getSeverityColor(parseFloat(avgGAD7)) });
      if (avgEPDS) scores.push({ name: 'EPDS (Postpartum)', value: avgEPDS, ...getSeverityColor(parseFloat(avgEPDS)) });
      
      scores.forEach((score, i) => {
        const col = i % 2;
        const x = margin + 5 + col * 90;
        const yPos = y + (Math.floor(i / 2)) * 8;
        
        doc.setFontSize(9);
        doc.setTextColor(80);
        doc.setFont("helvetica", "normal");
        doc.text(score.name, x, yPos);
        
        doc.setFontSize(11);
        doc.setTextColor(...score.color);
        doc.setFont("helvetica", "bold");
        doc.text(`${score.value}  ${score.label}`, x, yPos + 5);
      });
      
      y += (Math.ceil(scores.length / 2)) * 16 + 5;
    }

    // ====== SECTION 3: TOP SYMPTOMS (HORIZONTAL BAR CHART) ======
    if (topSymptoms.length > 0) {
      doc.setFillColor(245, 250, 248);
      doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'F');
      
      doc.setFillColor(20, 100, 80);
      doc.roundedRect(margin, y, contentWidth, 5, 2, 2, 'F');
      
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text('Top Symptoms Breakdown', margin + 5, y + 3.5);
      y += 10;
      
      const maxDays = Math.max(...topSymptoms.slice(0, 6).map(s => s.daysReported));
      const barHeight = 6;
      const barGap = 7;
      const chartStartX = 95;
      const maxBarWidth = 85;
      
      topSymptoms.slice(0, 6).forEach((symptom, idx) => {
        const barWidth = (symptom.daysReported / maxDays) * maxBarWidth;
        const color = idx % 2 === 0 ? [20, 100, 80] : [180, 160, 200]; // Teal or Lavender
        
        // Symptom name (word wrap for long names)
        doc.setFontSize(8);
        doc.setTextColor(50);
        doc.setFont("helvetica", "normal");
        const words = symptom.name.split(' ');
        let line = '';
        let lineY = y + 4;
        
        words.forEach((word, wi) => {
          if ((line + word).length > 18) {
            doc.text(line, margin + 3, lineY);
            line = word + ' ';
            lineY += 4;
          } else {
            line += word + ' ';
          }
        });
        if (line.trim()) doc.text(line.trim(), margin + 3, lineY);
        
        // Colored bar
        doc.setFillColor(...color);
        doc.roundedRect(chartStartX, y + 1, barWidth, barHeight, 1, 1, 'F');
        
        // Days count
        doc.setFontSize(8);
        doc.setTextColor(80);
        doc.setFont("helvetica", "bold");
        doc.text(`${symptom.daysReported}d`, chartStartX + barWidth + 3, y + 5.5);
        
        y += barHeight + barGap;
      });
      y += 3;
    }

    // ====== SECTION 4: MOOD & PHYSICAL TREND (LINE CHART) ======
    if (includeChart && moodTrendData.length > 5) {
      doc.setFillColor(245, 250, 248);
      doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'F');
      
      doc.setFillColor(20, 100, 80);
      doc.roundedRect(margin, y, contentWidth, 5, 2, 2, 'F');
      
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text('Mood & Physical Symptoms Trend', margin + 5, y + 3.5);
      y += 10;
      
      const chartHeight = 50;
      const chartWidth = contentWidth - 10;
      const startX = margin + 5;
      const baseY = y + chartHeight + 10;
      
      const maxMood = Math.max(...moodTrendData.map(d => d.mood), 1);
      const maxPhysical = Math.max(...moodTrendData.map(d => d.physical), 1);
      
      // Draw grid lines
      doc.setDrawColor(220, 220, 220);
      doc.setLineDash([2, 2]);
      for (let i = 0; i <= 3; i++) {
        const gridY = baseY - (i / 3) * chartHeight;
        doc.line(startX, gridY, startX + chartWidth, gridY);
        doc.setFontSize(6);
        doc.setTextColor(150);
        doc.text((i * 2).toString(), startX - 8, gridY + 1);
      }
      
      // Draw mood line (teal)
      doc.setDrawColor(20, 100, 80);
      doc.setLineWidth(1.5);
      doc.setLineDash([]);
      moodTrendData.forEach((d, i) => {
        const x = startX + (i / (moodTrendData.length - 1)) * chartWidth;
        const yPoint = baseY - (d.mood / 6) * chartHeight;
        if (i === 0) doc.line(x, yPoint, x, yPoint);
        else {
          const prevX = startX + ((i - 1) / (moodTrendData.length - 1)) * chartWidth;
          const prevY = baseY - (moodTrendData[i - 1].mood / 6) * chartHeight;
          doc.line(prevX, prevY, x, yPoint);
        }
      });
      
      // Draw physical line (lavender)
      doc.setDrawColor(180, 160, 200);
      doc.setLineWidth(1.5);
      moodTrendData.forEach((d, i) => {
        const x = startX + (i / (moodTrendData.length - 1)) * chartWidth;
        const yPoint = baseY - (d.physical / 6) * chartHeight;
        if (i === 0) doc.line(x, yPoint, x, yPoint);
        else {
          const prevX = startX + ((i - 1) / (moodTrendData.length - 1)) * chartWidth;
          const prevY = baseY - (moodTrendData[i - 1].physical / 6) * chartHeight;
          doc.line(prevX, prevY, x, yPoint);
        }
      });
      
      // X-axis labels (every 5th date)
      doc.setFontSize(6);
      doc.setTextColor(100);
      moodTrendData.forEach((d, i) => {
        if (i % 5 === 0 || i === moodTrendData.length - 1) {
          const x = startX + (i / (moodTrendData.length - 1)) * chartWidth;
          doc.text(d.date, x - 5, baseY + 4);
        }
      });
      
      // Legend
      doc.setDrawColor(20, 100, 80);
      doc.setLineWidth(1.5);
      doc.line(startX + chartWidth - 50, baseY + 8, startX + chartWidth - 40, baseY + 8);
      doc.setFontSize(7);
      doc.setTextColor(20, 100, 80);
      doc.text('Mood', startX + chartWidth - 38, baseY + 10);
      
      doc.setDrawColor(180, 160, 200);
      doc.line(startX + chartWidth - 20, baseY + 8, startX + chartWidth - 10, baseY + 8);
      doc.setTextColor(180, 160, 200);
      doc.text('Physical', startX + chartWidth - 8, baseY + 10);
      
      y += chartHeight + 20;
    }

    // ====== SECTION 5: WEEKLY SEVERITY TREND (BAR CHART) ======
    if (includeChart && weeklyTrend.length > 2) {
      doc.setFillColor(245, 250, 248);
      doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'F');
      
      doc.setFillColor(20, 100, 80);
      doc.roundedRect(margin, y, contentWidth, 5, 2, 2, 'F');
      
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text('Weekly Symptom Severity', margin + 5, y + 3.5);
      y += 10;
      
      const chartHeight = 45;
      const barWidth = 18;
      const gap = 6;
      const startX = margin + 10;
      const baseY = y + chartHeight + 10;
      const maxVal = Math.max(...weeklyTrend.map(d => d.avg), 1);
      
      weeklyTrend.forEach((d, i) => {
        const barHeight = (d.avg / maxVal) * chartHeight;
        const x = startX + i * (barWidth + gap);
        
        // Gradient-like bar (teal to light teal)
        doc.setFillColor(20, 100, 80);
        doc.roundedRect(x, baseY - barHeight, barWidth, barHeight, 1, 1, 'F');
        
        // Value on top
        doc.setFontSize(7);
        doc.setTextColor(80);
        doc.setFont("helvetica", "bold");
        doc.text(d.avg.toString(), x + barWidth / 2, baseY - barHeight - 2, { align: 'center' });
        
        // Week label
        doc.setFontSize(6);
        doc.setTextColor(100);
        doc.setFont("helvetica", "normal");
        doc.text(d.week.slice(0, 6), x + barWidth / 2, baseY + 4, { align: 'center' });
      });
      
      // Severity reference line at 3 (moderate)
      const modY = baseY - (3 / 6) * chartHeight;
      doc.setDrawColor(200, 150, 150);
      doc.setLineDash([3, 3]);
      doc.setLineWidth(1);
      doc.line(startX, modY, startX + weeklyTrend.length * (barWidth + gap) - gap, modY);
      doc.setFontSize(6);
      doc.setTextColor(180, 100, 100);
      doc.text('Moderate', startX + weeklyTrend.length * (barWidth + gap) - gap + 2, modY);
      
      y += chartHeight + 22;
    }

    // ====== SECTION 6: APPOINTMENT PREP ======
    if (includeAppointmentPrep) {
      doc.setFillColor(245, 250, 248);
      doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'F');
      
      doc.setFillColor(20, 100, 80);
      doc.roundedRect(margin, y, contentWidth, 5, 2, 2, 'F');
      
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text('Appointment Preparation', margin + 5, y + 3.5);
      y += 10;
      
      doc.setFontSize(9);
      doc.setTextColor(50);
      doc.setFont("helvetica", "normal");
      
      if (topSymptoms.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(20, 100, 80);
        doc.text('Top symptoms to discuss:', margin + 5, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80);
        const symptomList = topSymptoms.slice(0, 3).map(s => {
          const words = s.name.split(' ');
          return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }).join('  •  ');
        doc.text('• ' + symptomList, margin + 5, y);
        y += 8;
      }
      
      if (avgPHQ9 || avgGAD7) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(20, 100, 80);
        doc.text('Mood screening averages:', margin + 5, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80);
        const scores = [];
        if (avgPHQ9) scores.push(`PHQ-9: ${avgPHQ9}`);
        if (avgGAD7) scores.push(`GAD-7: ${avgGAD7}`);
        doc.text(scores.join('  |  '), margin + 5, y);
        y += 8;
      }
      
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 100, 80);
      doc.text('Questions for your provider:', margin + 5, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80);
      doc.text('1. Are my symptoms consistent with PMDD or another condition?', margin + 5, y);
      y += 4;
      doc.text('2. What treatment options do you recommend?', margin + 5, y);
      y += 4;
      doc.text('3. Should I adjust my tracking or medication timing?', margin + 5, y);
      y += 6;
    }

    // ====== FOOTER ======
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer background
      doc.setFillColor(240, 245, 243);
      doc.rect(0, 280, 210, 27, 'F');
      
      // Teal accent bar
      doc.setFillColor(20, 100, 80);
      doc.rect(0, 280, 210, 3, 'F');
      
      // Footer text
      doc.setFontSize(8);
      doc.setTextColor(20, 100, 80);
      doc.setFont("helvetica", "bold");
      doc.text('DRSP-Based Clinical Assessment Tool', 20, 288);
      
      doc.setFontSize(7);
      doc.setTextColor(100);
      doc.setFont("helvetica", "normal");
      doc.text('Based on the Daily Record of Severity of Problems (Endicott, Nee & Harrison, 2006).', 20, 293);
      doc.text('For informational purposes only. Not a diagnostic tool. Always consult a qualified healthcare provider.', 20, 297);
      
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(`Page ${i} of ${pageCount}`, 150, 302);
    }

    return new Response(doc.output('arraybuffer'), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="CycleMind_Clinical_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf"`
      }
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});

function calculateDayTotal(entry) {
  const symptomKeys = Object.keys(entry).filter(k => 
    k.startsWith('s_') || k.startsWith('m_') || k.startsWith('p_') || k.startsWith('pp_')
  );
  return symptomKeys.reduce((sum, k) => sum + (entry[k] || 0), 0);
}

function getSeverityColor(score) {
  if (score >= 15) return { color: [200, 80, 80], label: '(Mod-Severe)' };
  if (score >= 10) return { color: [220, 180, 80], label: '(Moderate)' };
  if (score >= 5) return { color: [20, 180, 140], label: '(Mild)' };
  return { color: [120, 120, 120], label: '(Minimal)' };
}