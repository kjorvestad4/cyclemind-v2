import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { jsPDF } from 'npm:jspdf@4.0.0';
import { differenceInDays, format, parseISO, startOfDay } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { days = 90 } = await req.json().catch(() => ({ days: 90 }));

    // Fetch date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch all user data
    const cycles = await base44.entities.Cycle.filter({ user_id: user.id });
    const entries = await base44.entities.DailyEntry.filter({});
    const predictions = await base44.entities.Prediction.filter({ user_id: user.id });

    // Filter entries for date range
    const recentEntries = entries.filter(e => {
      const entryDate = parseISO(e.date);
      return entryDate >= startDate && entryDate <= endDate;
    });

    // Calculate cycle statistics
    const relevantCycles = cycles.filter(c => {
      const cycleStart = parseISO(c.start_date);
      return cycleStart >= startDate;
    });

    const avgCycleLength = relevantCycles.length > 0
      ? Math.round(relevantCycles.reduce((sum, c) => sum + (c.cycle_length || 28), 0) / relevantCycles.length)
      : null;

    const cycleLengths = relevantCycles.map(c => c.cycle_length || 28);
    const cycleVariability = cycleLengths.length > 1
      ? Math.round((Math.max(...cycleLengths) - Math.min(...cycleLengths)) / avgCycleLength * 100)
      : 0;

    // Get latest cycle for context
    const latestCycle = [...cycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date))[0];

    // Calculate mood scores
    const phq9Scores = recentEntries.filter(e => e.phq9_score).map(e => e.phq9_score);
    const gad7Scores = recentEntries.filter(e => e.gad7_score).map(e => e.gad7_score);
    const epdsScores = recentEntries.filter(e => e.epds_score).map(e => e.epds_score);

    const avgPHQ9 = phq9Scores.length ? (phq9Scores.reduce((a, b) => a + b, 0) / phq9Scores.length).toFixed(1) : null;
    const avgGAD7 = gad7Scores.length ? (gad7Scores.reduce((a, b) => a + b, 0) / gad7Scores.length).toFixed(1) : null;
    const avgEPDS = epdsScores.length ? (epdsScores.reduce((a, b) => a + b, 0) / epdsScores.length).toFixed(1) : null;

    // PMDD Risk Assessment
    const pmddPrediction = [...predictions]
      .filter(p => p.prediction_type === 'pmdd_risk')
      .sort((a, b) => new Date(b.generated_date) - new Date(a.generated_date))[0];

    const pmddRiskLevel = pmddPrediction?.risk_level || 'Unknown';
    const pmddAccuracy = pmddPrediction?.historical_accuracy || null;

    // Symptom analysis
    const symptomCounts = {};
    const symptomSeverities = {};
    
    recentEntries.forEach(e => {
      Object.entries(e).forEach(([key, value]) => {
        if ((key.startsWith('s_') || key.startsWith('m_') || key.startsWith('p_') || key.startsWith('pp_')) && value >= 3) {
          symptomCounts[key] = (symptomCounts[key] || 0) + 1;
          symptomSeverities[key] = symptomSeverities[key] || [];
          symptomSeverities[key].push(value);
        }
      });
    });

    const topSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([symptom, count]) => ({
        name: symptom.replace(/^[smp]_/, '').replace(/_/g, ' '),
        daysReported: count,
        avgSeverity: symptomSeverities[symptom] 
          ? (symptomSeverities[symptom].reduce((a, b) => a + b, 0) / symptomSeverities[symptom].length).toFixed(1)
          : null
      }));

    // Calculate symptom burden score
    const totalSymptomDays = recentEntries.filter(e => 
      Object.entries(e).some(([k, v]) => 
        (k.startsWith('s_') || k.startsWith('m_')) && v >= 3
      )
    ).length;
    const symptomBurdenScore = Math.round((totalSymptomDays / recentEntries.length) * 100) || 0;
    const symptomBurdenTrend = symptomBurdenScore > 60 ? 'high' : symptomBurdenScore > 30 ? 'moderate' : 'low';

    // Fertility/Menopause context
    const fertilityWindow = latestCycle?.cycle_type === 'pregnancy' ? null : 
      predictions.find(p => p.prediction_type === 'cycle')?.ovulation_window_start;
    
    const edd = latestCycle?.cycle_type === 'pregnancy' ? latestCycle.estimated_due_date : null;
    const pregnancyWeek = latestCycle?.pregnancy_week;
    const menopauseStage = latestCycle?.cycle_type === 'menopause' ? 'Menopause' : 
                           latestCycle?.cycle_type === 'perimenopause' ? 'Perimenopause' : null;

    // Generate PDF
    const doc = new jsPDF();
    
    // Color scheme
    const colors = {
      primary: '#0F766E',      // Deep teal
      secondary: '#1E40AF',    // Slate blue
      accent: '#10B981',       // Sage green
      warning: '#D97706',      // Warm amber
      bg: '#F8FAFC',           // Soft gray
      text: '#1E293B'          // Dark slate
    };

    // HEADER
    doc.setFillColor(colors.primary);
    doc.rect(0, 0, 210, 25, 'F');
    
    doc.setFontSize(20);
    doc.setTextColor(255);
    doc.setFont('helvetica', 'bold');
    doc.text('CycleMind Clinical Summary', 105, 14, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setTextColor(240);
    doc.setFont('helvetica', 'normal');
    doc.text('CONFIDENTIAL - For Healthcare Provider Use Only', 105, 20, { align: 'center' });

    // Patient info bar
    doc.setFillColor(colors.secondary);
    doc.rect(0, 25, 210, 15, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(255);
    doc.text(`Patient: ${user.full_name || 'Anonymous'}`, 15, 31);
    doc.text(`Report Date: ${format(new Date(), 'MMM d, yyyy')}`, 105, 31, { align: 'center' });
    doc.text(`Period: ${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`, 195, 31, { align: 'right' });

    let yPosition = 48;

    // KEY METRICS SECTION
    doc.setFontSize(14);
    doc.setTextColor(colors.text);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Metrics at a Glance', 15, yPosition);
    yPosition += 8;

    // Metrics cards
    const metrics = [
      { label: 'Avg Cycle Length', value: avgCycleLength ? `${avgCycleLength} days` : 'N/A', sub: `Variability: ${cycleVariability}%` },
      { label: 'PMDD Risk', value: pmddRiskLevel, sub: pmddAccuracy ? `Accuracy: ${pmddAccuracy}%` : '' },
      { label: 'Current Phase', value: menopauseStage || (latestCycle?.phase || 'N/A'), sub: latestCycle?.cycle_type === 'pregnancy' ? `Week ${pregnancyWeek}` : '' },
      { label: 'Symptom Burden', value: `${symptomBurdenScore}%`, sub: `Trend: ${symptomBurdenTrend}` }
    ];

    const cardWidth = 90;
    const cardHeight = 28;
    const gap = 10;

    metrics.forEach((metric, i) => {
      const x = i % 2 === 0 ? 15 : 15 + cardWidth + gap;
      const y = yPosition + Math.floor(i / 2) * (cardHeight + 8);

      // Card background
      doc.setFillColor(i === 3 && symptomBurdenTrend === 'high' ? colors.warning : colors.bg);
      doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'F');
      
      // Label
      doc.setFontSize(8);
      doc.setTextColor('#64748B');
      doc.setFont('helvetica', 'normal');
      doc.text(metric.label, x + 3, y + 5);
      
      // Value
      doc.setFontSize(13);
      doc.setTextColor(colors.text);
      doc.setFont('helvetica', 'bold');
      doc.text(metric.value, x + 3, y + 13);
      
      // Subtitle
      if (metric.sub) {
        doc.setFontSize(7);
        doc.setTextColor('#94A3B8');
        doc.text(metric.sub, x + 3, y + 21);
      }
    });

    yPosition += (Math.ceil(metrics.length / 2) * (cardHeight + 8)) + 5;

    // CYCLE & SYMPTOM TRENDS
    doc.setFontSize(14);
    doc.setTextColor(colors.text);
    doc.setFont('helvetica', 'bold');
    doc.text('Cycle & Symptom Trends', 15, yPosition);
    yPosition += 8;

    // Top symptoms with bars
    if (topSymptoms.length > 0) {
      doc.setFontSize(9);
      doc.setTextColor(colors.text);
      doc.setFont('helvetica', 'normal');
      doc.text('Top 5 Symptoms (Frequency & Avg Severity)', 15, yPosition);
      yPosition += 6;

      const maxCount = Math.max(...topSymptoms.map(s => s.daysReported));
      
      topSymptoms.forEach((symptom, i) => {
        if (yPosition > 240) {
          doc.addPage();
          yPosition = 20;
        }

        const barWidth = (symptom.daysReported / maxCount) * 120;
        const barHeight = 6;
        
        // Symptom name
        doc.setFontSize(9);
        doc.setTextColor(colors.text);
        doc.text(symptom.name, 20, yPosition + 5);
        
        // Bar background
        doc.setFillColor('#E2E8F0');
        doc.roundedRect(80, yPosition + 1, 120, barHeight, 2, 2, 'F');
        
        // Bar fill
        doc.setFillColor(i < 3 ? colors.primary : colors.secondary);
        doc.roundedRect(80, yPosition + 1, barWidth, barHeight, 2, 2, 'F');
        
        // Count and severity
        doc.setFontSize(8);
        doc.setTextColor(colors.text);
        doc.text(`${symptom.daysReported} days`, 205, yPosition + 5, { align: 'right' });
        
        if (symptom.avgSeverity) {
          doc.setTextColor('#64748B');
          doc.text(`(avg: ${symptom.avgSeverity}/6)`, 205, yPosition + 9, { align: 'right' });
        }
        
        yPosition += 10;
      });
      
      yPosition += 3;
    }

    // Mood correlation callout
    if (avgPHQ9 || avgGAD7) {
      doc.setFillColor(colors.bg);
      doc.roundedRect(15, yPosition, 180, 15, 3, 3, 'F');
      
      doc.setFontSize(8);
      doc.setTextColor(colors.text);
      doc.setFont('helvetica', 'bold');
      doc.text('Mood Correlation:', 18, yPosition + 5);
      
      doc.setFont('helvetica', 'normal');
      const correlations = [];
      if (avgPHQ9) correlations.push(`PHQ-9 avg: ${avgPHQ9}`);
      if (avgGAD7) correlations.push(`GAD-7 avg: ${avgGAD7}`);
      if (avgEPDS) correlations.push(`EPDS avg: ${avgEPDS}`);
      
      doc.text(correlations.join(' | '), 70, yPosition + 5);
      doc.setTextColor('#64748B');
      doc.text('Higher symptom days correlate with elevated mood scores', 18, yPosition + 10);
      
      yPosition += 20;
    }

    // PREDICTIONS & INSIGHTS
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(colors.text);
    doc.setFont('helvetica', 'bold');
    doc.text('Predictions & Insights', 15, yPosition);
    yPosition += 8;

    const cyclePrediction = predictions.find(p => p.prediction_type === 'cycle');
    
    if (cyclePrediction) {
      doc.setFontSize(9);
      doc.setTextColor(colors.text);
      doc.setFont('helvetica', 'normal');
      
      if (cyclePrediction.next_period_start) {
        doc.text(`Next Period: ${format(parseISO(cyclePrediction.next_period_start), 'MMM d, yyyy')} (Confidence: ${cyclePrediction.confidence_score || 80}%)`, 20, yPosition);
        yPosition += 6;
      }
      
      if (cyclePrediction.ovulation_window_start && cyclePrediction.ovulation_window_end) {
        doc.text(`Fertile Window: ${format(parseISO(cyclePrediction.ovulation_window_start), 'MMM d')} - ${format(parseISO(cyclePrediction.ovulation_window_end), 'MMM d')}`, 20, yPosition);
        yPosition += 6;
      }
    }

    // PMDD preparation
    if (pmddRiskLevel && pmddRiskLevel !== 'Unknown') {
      doc.setFillColor(pmddRiskLevel === 'high' ? '#FEF3C7' : colors.bg);
      doc.roundedRect(15, yPosition, 180, 12, 3, 3, 'F');
      
      doc.setFontSize(8);
      doc.setTextColor(pmddRiskLevel === 'high' ? colors.warning : colors.text);
      doc.setFont('helvetica', 'bold');
      doc.text(`PMDD Risk: ${pmddRiskLevel.toUpperCase()}`, 18, yPosition + 5);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.text);
      doc.text('Preparation: Track symptoms daily, consider lifestyle modifications, discuss with provider', 90, yPosition + 5);
      
      yPosition += 16;
    }

    // Clinician Note box
    doc.setFillColor(colors.bg);
    doc.roundedRect(15, yPosition, 180, 25, 3, 3, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(colors.secondary);
    doc.setFont('helvetica', 'bold');
    doc.text('CLINICIAN NOTE - Luna Pattern Summary', 18, yPosition + 6);
    
    doc.setFontSize(8);
    doc.setTextColor(colors.text);
    doc.setFont('helvetica', 'normal');
    
    const clinicianNotes = [];
    if (symptomBurdenScore > 50) clinicianNotes.push('• Moderate-high symptom burden reported');
    if (cycleVariability > 20) clinicianNotes.push('• Notable cycle length variability');
    if (avgPHQ9 >= 10 || avgGAD7 >= 10) clinicianNotes.push('• Elevated mood screening scores');
    if (topSymptoms.length > 0) clinicianNotes.push(`• Primary symptoms: ${topSymptoms.slice(0, 2).map(s => s.name).join(', ')}`);
    
    const noteText = clinicianNotes.length > 0 
      ? clinicianNotes.join(' ')
      : 'Patient shows consistent tracking patterns. Review symptom trends and mood correlations for clinical insights.';
    
    const splitNotes = doc.splitTextToSize(noteText, 170);
    doc.text(splitNotes, 18, yPosition + 12);
    
    yPosition += 32;

    // FOR YOUR DOCTOR SECTION
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(colors.text);
    doc.setFont('helvetica', 'bold');
    doc.text('For Your Doctor', 15, yPosition);
    yPosition += 8;

    // Raw data summary table header
    doc.setFontSize(8);
    doc.setTextColor(255);
    doc.setFont('helvetica', 'bold');
    
    const tableY = yPosition;
    doc.setFillColor(colors.primary);
    doc.rect(15, tableY, 180, 6, 'F');
    doc.text('Date', 18, tableY + 4);
    doc.text('Top Symptoms', 45, tableY + 4);
    doc.text('Severity', 120, tableY + 4);
    doc.text('Notes', 145, tableY + 4);

    // Table rows (last 10 entries with symptoms)
    const entriesWithSymptoms = recentEntries
      .filter(e => Object.entries(e).some(([k, v]) => (k.startsWith('s_') || k.startsWith('m_')) && v >= 3))
      .slice(-10);

    doc.setFontSize(7);
    doc.setTextColor(colors.text);
    doc.setFont('helvetica', 'normal');

    entriesWithSymptoms.forEach((entry, i) => {
      const rowY = tableY + 7 + (i * 8);
      
      if (rowY > 270) {
        doc.addPage();
        doc.setFillColor(colors.primary);
        doc.rect(15, 20, 180, 6, 'F');
        doc.setTextColor(255);
        doc.text('Date', 18, 24);
        doc.text('Top Symptoms', 45, 24);
        doc.text('Severity', 120, 24);
        doc.text('Notes', 145, 24);
        doc.setTextColor(colors.text);
      }

      const entryDate = format(parseISO(entry.date), 'MM/dd');
      const entrySymptoms = Object.entries(entry)
        .filter(([k, v]) => (k.startsWith('s_') || k.startsWith('m_')) && v >= 3)
        .slice(0, 2)
        .map(([k]) => k.replace(/^[smp]_/, '').replace(/_/g, ' '))
        .join(', ');
      
      const maxSeverity = Math.max(...Object.entries(entry)
        .filter(([k, v]) => (k.startsWith('s_') || k.startsWith('m_')) && v >= 3)
        .map(([, v]) => v), 0);

      doc.text(entryDate, 18, rowY + 3);
      doc.text(entrySymptoms.substring(0, 18) + (entrySymptoms.length > 18 ? '...' : ''), 45, rowY + 3);
      doc.text(maxSeverity ? `${maxSeverity}/6` : '-', 120, rowY + 3);
      doc.text(entry.journal_entry ? entry.journal_entry.substring(0, 15) + '...' : '-', 145, rowY + 3);
    });

    yPosition = tableY + 7 + (entriesWithSymptoms.length * 8) + 10;

    // DSM-5 PMDD criteria match
    if (pmddPrediction && pmddPrediction.top_trigger_symptoms?.length > 0) {
      doc.setFontSize(9);
      doc.setTextColor(colors.text);
      doc.setFont('helvetica', 'bold');
      doc.text('DSM-5 PMDD Criteria Match:', 15, yPosition);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor('#64748B');
      doc.text(pmddPrediction.top_trigger_symptoms.slice(0, 5).join(', '), 15, yPosition + 5);
      yPosition += 12;
    }

    // Space for handwritten notes
    doc.setFontSize(9);
    doc.setTextColor(colors.text);
    doc.setFont('helvetica', 'bold');
    doc.text('Provider Notes:', 15, yPosition);
    yPosition += 2;

    doc.setDrawColor('#CBD5E1');
    doc.setLineWidth(0.5);
    for (let i = 0; i < 4; i++) {
      doc.line(15, yPosition + (i * 8), 195, yPosition + (i * 8));
    }

    yPosition += 40;

    // FOOTER with disclaimer
    doc.setFontSize(7);
    doc.setTextColor('#94A3B8');
    doc.setFont('helvetica', 'italic');
    doc.text('This report was generated by Luna, an AI companion in the CycleMind app. It is not a substitute for professional medical advice. All interpretations should be reviewed by a qualified healthcare provider.', 105, 285, { align: 'center' });

    // Page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor('#94A3B8');
      doc.setFont('helvetica', 'normal');
      doc.text(`Page ${i} of ${pageCount}`, 195, 290, { align: 'right' });
    }

    // Convert to blob
    const pdfBytes = doc.output('arraybuffer');
    
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="CycleMind_Clinical_Summary_${format(new Date(), 'yyyy-MM-dd')}.pdf"`
      }
    });
  } catch (error) {
    console.error('Clinical report error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});