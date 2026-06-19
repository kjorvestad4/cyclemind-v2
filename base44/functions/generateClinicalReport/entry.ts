import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { jsPDF } from 'npm:jspdf@4.0.0';
import { differenceInDays, format, parseISO, startOfDay, subDays } from 'npm:date-fns@3.6.0';

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
    const startDate = subDays(endDate, days);

    // Fetch all user data
    const cycles = await base44.entities.Cycle.filter({ user_id: user.id });
    const entries = await base44.entities.DailyEntry.filter({});
    const predictions = await base44.entities.Prediction.filter({ user_id: user.id });
    const userMilestones = await base44.entities.UserMilestone.filter({});

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
      : 28;

    const cycleLengths = relevantCycles.map(c => c.cycle_length || 28);
    const cycleSD = cycleLengths.length > 1
      ? Math.sqrt(cycleLengths.reduce((sum, len) => sum + Math.pow(len - avgCycleLength, 2), 0) / cycleLengths.length)
      : 0;
    const cycleVariability = cycleLengths.length > 1 ? Math.round(cycleSD) : 0;

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

    const pmddRiskLevel = pmddPrediction?.risk_level || 'Not Assessed';
    const pmddAccuracy = pmddPrediction?.historical_accuracy || null;
    const pmddConfidence = pmddPrediction?.confidence_score || null;

    // Comprehensive symptom analysis
    const symptomCounts = {};
    const symptomSeverities = {};
    const follicularSymptoms = {};
    const lutealSymptoms = {};
    
    recentEntries.forEach(e => {
      const cycleDay = e.cycle_day || 1;
      const isLuteal = cycleDay > 14;
      const isFollicular = cycleDay <= 14;
      
      Object.entries(e).forEach(([key, value]) => {
        if ((key.startsWith('s_') || key.startsWith('m_') || key.startsWith('p_') || key.startsWith('pp_')) && typeof value === 'number' && value >= 1) {
          symptomCounts[key] = (symptomCounts[key] || 0) + 1;
          symptomSeverities[key] = symptomSeverities[key] || [];
          symptomSeverities[key].push(value);
          
          if (isLuteal) {
            lutealSymptoms[key] = (lutealSymptoms[key] || 0) + (value >= 3 ? 1 : 0);
          }
          if (isFollicular) {
            follicularSymptoms[key] = (follicularSymptoms[key] || 0) + (value >= 3 ? 1 : 0);
          }
        }
      });
    });

    const topSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([symptom, count]) => ({
        name: symptom.replace(/^[smp]_/, '').replace(/_/g, ' '),
        daysReported: count,
        avgSeverity: symptomSeverities[symptom] 
          ? (symptomSeverities[symptom].reduce((a, b) => a + b, 0) / symptomSeverities[symptom].length).toFixed(1)
          : null,
        lutealCount: lutealSymptoms[symptom] || 0,
        follicularCount: follicularSymptoms[symptom] || 0
      }));

    // Calculate symptom burden score
    const totalSymptomDays = recentEntries.filter(e => 
      Object.entries(e).some(([k, v]) => 
        (k.startsWith('s_') || k.startsWith('m_')) && typeof v === 'number' && v >= 3
      )
    ).length;
    const symptomBurdenScore = recentEntries.length ? Math.round((totalSymptomDays / recentEntries.length) * 100) : 0;
    const symptomBurdenTrend = symptomBurdenScore > 60 ? 'high' : symptomBurdenScore > 30 ? 'moderate' : 'low';

    // Fertility/Menopause context
    const cyclePrediction = predictions.find(p => p.prediction_type === 'cycle');
    const fertilityWindow = latestCycle?.cycle_type === 'pregnancy' ? null : cyclePrediction?.ovulation_window_start;
    const fertilityWindowEnd = latestCycle?.cycle_type === 'pregnancy' ? null : cyclePrediction?.ovulation_window_end;
    const edd = latestCycle?.cycle_type === 'pregnancy' ? latestCycle.estimated_due_date : null;
    const pregnancyWeek = latestCycle?.pregnancy_week;
    const menopauseStage = latestCycle?.cycle_type === 'menopause' ? 'Menopause' : 
                           latestCycle?.cycle_type === 'perimenopause' ? 'Perimenopause' : null;

    // Calculate luteal vs follicular comparison
    const lutealSymptomCount = Object.values(lutealSymptoms).reduce((a, b) => a + b, 0);
    const follicularSymptomCount = Object.values(follicularSymptoms).reduce((a, b) => a + b, 0);
    const lutealAvgSeverity = lutealSymptomCount > 0 ? (lutealSymptomCount / Object.keys(lutealSymptoms).length).toFixed(1) : '0';
    const follicularAvgSeverity = follicularSymptomCount > 0 ? (follicularSymptomCount / Object.keys(follicularSymptoms).length).toFixed(1) : '0';

    // Mood correlation with symptoms
    const entriesWithMoodAndSymptoms = recentEntries.filter(e => 
      (e.phq9_score || e.gad7_score) && 
      Object.entries(e).some(([k, v]) => (k.startsWith('s_') || k.startsWith('m_')) && v >= 3)
    );
    const moodCorrelationPercent = recentEntries.length ? Math.round((entriesWithMoodAndSymptoms.length / recentEntries.length) * 100) : 0;

    // Generate PDF
    const doc = new jsPDF();
    
    // Color scheme
    const colors = {
      primary: '#0F766E',      // Deep teal
      secondary: '#1E40AF',    // Slate blue
      accent: '#10B981',       // Sage green
      warning: '#D97706',      // Warm amber
      bg: '#F8FAFC',           // Soft gray
      text: '#1E293B',         // Dark slate
      lightText: '#64748B',    // Light slate
      border: '#E2E8F0'        // Light border
    };

    // === PAGE 1 ===
    
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
    doc.text(`Report Generated: ${format(new Date(), 'MMM d, yyyy')}`, 105, 31, { align: 'center' });
    doc.text(`Data Period: ${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`, 195, 31, { align: 'right' });

    let yPosition = 48;

    // KEY METRICS SECTION - 8 cards
    doc.setFontSize(14);
    doc.setTextColor(colors.text);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Metrics at a Glance', 15, yPosition);
    yPosition += 8;

    const metrics = [
      { 
        label: 'Avg Cycle Length', 
        value: `${avgCycleLength} days`, 
        sub: cycleVariability > 0 ? `Variability: ${cycleVariability} days` : 'Consistent cycle length',
        color: colors.primary
      },
      { 
        label: 'PMDD Risk Level', 
        value: pmddRiskLevel, 
        sub: pmddAccuracy ? `Accuracy: ${pmddAccuracy}%` : pmddConfidence ? `Confidence: ${pmddConfidence}%` : '',
        color: pmddRiskLevel === 'high' ? colors.warning : colors.secondary
      },
      { 
        label: 'Current Phase', 
        value: menopauseStage || latestCycle?.phase || 'N/A', 
        sub: latestCycle?.cycle_type === 'pregnancy' ? `Week ${pregnancyWeek}` : `Day ${latestCycle ? Math.floor((new Date() - new Date(latestCycle.start_date)) / (1000 * 60 * 60 * 24)) : 'N/A'}`,
        color: colors.accent
      },
      { 
        label: 'Symptom Burden', 
        value: `${symptomBurdenScore}%`, 
        sub: `Trend: ${symptomBurdenTrend.toUpperCase()}`,
        color: symptomBurdenTrend === 'high' ? colors.warning : colors.bg
      },
      { 
        label: 'Avg PHQ-9 Score', 
        value: avgPHQ9 || 'Not tracked', 
        sub: avgPHQ9 ? (parseFloat(avgPHQ9) >= 10 ? 'Moderate-Severe' : 'Minimal-Mild') : '',
        color: avgPHQ9 && parseFloat(avgPHQ9) >= 10 ? colors.warning : colors.bg
      },
      { 
        label: 'Avg GAD-7 Score', 
        value: avgGAD7 || 'Not tracked', 
        sub: avgGAD7 ? (parseFloat(avgGAD7) >= 10 ? 'Moderate-Severe' : 'Minimal-Mild') : '',
        color: avgGAD7 && parseFloat(avgGAD7) >= 10 ? colors.warning : colors.bg
      },
      { 
        label: 'Fertility Window', 
        value: fertilityWindow ? format(parseISO(fertilityWindow), 'MMM d') : (edd ? 'Pregnant' : 'Not predicted'), 
        sub: fertilityWindowEnd ? `to ${format(parseISO(fertilityWindowEnd), 'MMM d')}` : (edd ? `Due ${format(parseISO(edd), 'MMM d, yyyy')}` : ''),
        color: colors.secondary
      },
      { 
        label: 'Mood-Symptom Link', 
        value: `${moodCorrelationPercent}%`, 
        sub: 'symptom days with mood elevation',
        color: moodCorrelationPercent > 70 ? colors.warning : colors.bg
      }
    ];

    const cardWidth = 90;
    const cardHeight = 26;
    const gap = 10;

    metrics.forEach((metric, i) => {
      const x = i % 2 === 0 ? 15 : 15 + cardWidth + gap;
      const y = yPosition + Math.floor(i / 2) * (cardHeight + 6);

      // Card background with subtle border
      doc.setFillColor(metric.color === colors.warning ? '#FEF3C7' : metric.color === colors.primary ? '#F0FDFA' : metric.color === colors.secondary ? '#EFF6FF' : metric.color === colors.accent ? '#ECFDF5' : colors.bg);
      doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'F');
      
      // Left accent border
      doc.setDrawColor(metric.color);
      doc.setLineWidth(3);
      doc.line(x, y, x, y + cardHeight);
      
      // Label
      doc.setFontSize(8);
      doc.setTextColor(colors.lightText);
      doc.setFont('helvetica', 'normal');
      doc.text(metric.label, x + 5, y + 5);
      
      // Value
      doc.setFontSize(12);
      doc.setTextColor(colors.text);
      doc.setFont('helvetica', 'bold');
      doc.text(metric.value, x + 5, y + 12);
      
      // Subtitle
      if (metric.sub) {
        doc.setFontSize(7);
        doc.setTextColor(colors.lightText);
        doc.setFont('helvetica', 'normal');
        doc.text(metric.sub, x + 5, y + 20);
      }
    });

    yPosition += (Math.ceil(metrics.length / 2) * (cardHeight + 6)) + 5;

    // CYCLE & SYMPTOM TRENDS
    doc.setFontSize(14);
    doc.setTextColor(colors.text);
    doc.setFont('helvetica', 'bold');
    doc.text('Cycle & Symptom Trends', 15, yPosition);
    yPosition += 8;

    // Top 8 symptoms with detailed bars
    if (topSymptoms.length > 0) {
      doc.setFontSize(9);
      doc.setTextColor(colors.text);
      doc.setFont('helvetica', 'normal');
      doc.text('Top 8 Symptoms by Frequency (with Average Severity)', 15, yPosition);
      yPosition += 6;

      const maxCount = Math.max(...topSymptoms.map(s => s.daysReported));
      
      topSymptoms.forEach((symptom, i) => {
        if (yPosition > 240) {
          doc.addPage();
          yPosition = 20;
        }

        const rowHeight = 12;
        const barHeight = 6;
        const barX = 70;
        const barMaxWidth = 100;
        const barY = yPosition;
        const textY = yPosition + 5;

        // Symptom name
        doc.setFontSize(8);
        doc.setTextColor(colors.text);
        doc.setFont('helvetica', 'normal');
        doc.text(symptom.name.substring(0, 20), 15, textY);

        // Bar background
        doc.setFillColor('#F1F5F9');
        doc.rect(barX, barY, barMaxWidth, barHeight, 'F');

        // Bar fill
        const barWidth = maxCount > 0 ? Math.max(1, (symptom.daysReported / maxCount) * barMaxWidth) : 0;
        if (barWidth > 0) {
          doc.setFillColor(i < 3 ? colors.primary : i < 5 ? colors.secondary : colors.accent);
          doc.rect(barX, barY, barWidth, barHeight, 'F');
        }

        // Count label
        doc.setFontSize(7);
        doc.setTextColor(colors.text);
        doc.setFont('helvetica', 'bold');
        doc.text(`${symptom.daysReported}d`, 173, textY);

        // Avg severity
        if (symptom.avgSeverity) {
          doc.setFontSize(7);
          doc.setTextColor(colors.lightText);
          doc.setFont('helvetica', 'normal');
          doc.text(`avg ${symptom.avgSeverity}/6`, 182, textY);
        }

        yPosition += rowHeight;
      });
      
      yPosition += 3;
    }

    // Phase comparison table
    doc.setFontSize(9);
    doc.setTextColor(colors.text);
    doc.setFont('helvetica', 'bold');
    doc.text('Luteal vs Follicular Phase Comparison', 15, yPosition);
    yPosition += 6;

    doc.setFillColor(colors.bg);
    doc.roundedRect(15, yPosition, 180, 20, 3, 3, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(colors.text);
    doc.setFont('helvetica', 'normal');
    doc.text(`Follicular Phase (Days 1-14): ${follicularSymptomCount} symptom days reported`, 20, yPosition + 6);
    doc.text(`Luteal Phase (Days 15+): ${lutealSymptomCount} symptom days reported`, 20, yPosition + 11);
    
    const phaseDifference = lutealSymptomCount - follicularSymptomCount;
    const phasePercent = follicularSymptomCount > 0 ? Math.round((phaseDifference / follicularSymptomCount) * 100) : 0;
    doc.setTextColor(phasePercent > 50 ? colors.warning : colors.lightText);
    doc.text(phasePercent > 50 
      ? `Note: ${phasePercent}% more symptoms reported in luteal phase (suggests possible PMDD pattern)`
      : 'Symptom distribution relatively even across phases', 
      20, yPosition + 16);
    
    yPosition += 26;

    // Mood correlation callout
    if (avgPHQ9 || avgGAD7 || avgEPDS) {
      doc.setFillColor(colors.bg);
      doc.roundedRect(15, yPosition, 180, 18, 3, 3, 'F');
      
      doc.setFontSize(8);
      doc.setTextColor(colors.secondary);
      doc.setFont('helvetica', 'bold');
      doc.text('Mood Correlation Analysis:', 18, yPosition + 6);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.text);
      const correlations = [];
      if (avgPHQ9) correlations.push(`PHQ-9 avg ${avgPHQ9}`);
      if (avgGAD7) correlations.push(`GAD-7 avg ${avgGAD7}`);
      if (avgEPDS) correlations.push(`EPDS avg ${avgEPDS}`);
      
      doc.text(correlations.join(' | '), 95, yPosition + 6);
      doc.setTextColor(colors.lightText);
      doc.text(`Mood elevation present in ${moodCorrelationPercent}% of high-symptom days`, 18, yPosition + 12);
      
      yPosition += 23;
    }

    // === PAGE 2 ===
    doc.addPage();
    yPosition = 20;

    // PREDICTIONS & INSIGHTS
    doc.setFontSize(14);
    doc.setTextColor(colors.text);
    doc.setFont('helvetica', 'bold');
    doc.text('Predictions & Clinical Insights', 15, yPosition);
    yPosition += 8;

    // Cycle predictions
    if (cyclePrediction) {
      doc.setFillColor(colors.bg);
      doc.roundedRect(15, yPosition, 180, 22, 3, 3, 'F');
      
      doc.setFontSize(9);
      doc.setTextColor(colors.secondary);
      doc.setFont('helvetica', 'bold');
      doc.text('Cycle Predictions:', 18, yPosition + 6);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.text);
      doc.setFontSize(8);
      
      if (cyclePrediction.next_period_start) {
        doc.text(`Next Expected Period: ${format(parseISO(cyclePrediction.next_period_start), 'MMM d, yyyy')} (Confidence: ${cyclePrediction.confidence_score || 75}%)`, 18, yPosition + 12);
      }
      
      if (cyclePrediction.ovulation_window_start && cyclePrediction.ovulation_window_end) {
        doc.text(`Next Fertile Window: ${format(parseISO(cyclePrediction.ovulation_window_start), 'MMM d')} to ${format(parseISO(cyclePrediction.ovulation_window_end), 'MMM d, yyyy')}`, 18, yPosition + 17);
      }
      
      yPosition += 28;
    }

    // PMDD preparation
    if (pmddPrediction && pmddPrediction.risk_level) {
      doc.setFillColor(pmddRiskLevel === 'high' ? '#FEF3C7' : pmddRiskLevel === 'medium' ? '#FFFBEB' : colors.bg);
      doc.roundedRect(15, yPosition, 180, 18, 3, 3, 'F');
      
      doc.setFontSize(8);
      doc.setTextColor(pmddRiskLevel === 'high' ? colors.warning : colors.text);
      doc.setFont('helvetica', 'bold');
      doc.text(`PMDD Risk: ${pmddRiskLevel.toUpperCase()}${pmddConfidence ? ` (${pmddConfidence}% confidence)` : ''}`, 18, yPosition + 6);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.text);
      doc.text('Recommended: Daily symptom tracking, stress reduction, discuss treatment options with provider', 18, yPosition + 12);
      
      yPosition += 24;
    }

    // Menopause trajectory
    if (menopauseStage) {
      doc.setFillColor(colors.bg);
      doc.roundedRect(15, yPosition, 180, 15, 3, 3, 'F');
      
      doc.setFontSize(8);
      doc.setTextColor(colors.secondary);
      doc.setFont('helvetica', 'bold');
      doc.text(`${menopauseStage} Stage:`, 18, yPosition + 5);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.text);
      doc.text('Track symptom patterns, discuss HRT options with provider, monitor bone and cardiovascular health', 18, yPosition + 10);
      
      yPosition += 20;
    }

    // Clinician Note box - CLEAN TEXT ONLY
    doc.setFillColor('#F8FAFC');
    doc.setDrawColor(colors.primary);
    doc.setLineWidth(1);
    doc.roundedRect(15, yPosition, 180, 35, 3, 3, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(colors.secondary);
    doc.setFont('helvetica', 'bold');
    doc.text('CLINICIAN NOTE - Luna Pattern Analysis', 18, yPosition + 7);
    
    doc.setFontSize(8);
    doc.setTextColor(colors.text);
    doc.setFont('helvetica', 'normal');
    
    // Generate clean, plain text summary (NO markdown, NO symbols)
    const clinicianNotes = [];
    
    if (symptomBurdenScore > 50) {
      clinicianNotes.push('Patient reports moderate to high symptom burden with symptoms present on over half of tracked days.');
    }
    
    if (cycleVariability > 5) {
      clinicianNotes.push(`Cycle length shows notable variability with standard deviation of ${cycleVariability} days.`);
    }
    
    if (avgPHQ9 && parseFloat(avgPHQ9) >= 10) {
      clinicianNotes.push(`PHQ-9 scores average ${avgPHQ9}, indicating moderate depressive symptoms that warrant clinical attention.`);
    }
    
    if (avgGAD7 && parseFloat(avgGAD7) >= 10) {
      clinicianNotes.push(`GAD-7 scores average ${avgGAD7}, suggesting moderate anxiety symptoms.`);
    }
    
    if (topSymptoms.length > 0) {
      const topTwo = topSymptoms.slice(0, 2).map(s => `${s.name} (reported ${s.daysReported} days, avg severity ${s.avgSeverity}/6)`).join(' and ');
      clinicianNotes.push(`Most frequently reported symptoms are ${topTwo}.`);
    }
    
    if (phasePercent > 50) {
      clinicianNotes.push(`Symptom reporting shows luteal phase predominance with ${phasePercent}% more symptoms in the luteal phase, consistent with possible premenstrual pattern.`);
    }
    
    if (moodCorrelationPercent > 70) {
      clinicianNotes.push(`Strong correlation between symptom days and elevated mood screening scores, with mood elevation present in ${moodCorrelationPercent}% of high-symptom days.`);
    }
    
    const noteText = clinicianNotes.length > 0 
      ? clinicianNotes.join(' ')
      : 'Patient demonstrates consistent tracking patterns over the reporting period. Review detailed symptom trends and mood correlations for additional clinical context. Consider discussing symptom management strategies and screening results during consultation.';
    
    const splitNotes = doc.splitTextToSize(noteText, 172);
    doc.text(splitNotes, 18, yPosition + 14);
    
    yPosition += 42;

    // FOR YOUR DOCTOR SECTION
    doc.setFontSize(14);
    doc.setTextColor(colors.text);
    doc.setFont('helvetica', 'bold');
    doc.text('For Your Doctor', 15, yPosition);
    yPosition += 8;

    // Summary statistics
    doc.setFillColor(colors.bg);
    doc.roundedRect(15, yPosition, 180, 18, 3, 3, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(colors.text);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Days Tracked: ${recentEntries.length}`, 20, yPosition + 6);
    doc.text(`Days with Symptoms: ${totalSymptomDays}`, 70, yPosition + 6);
    doc.text(`Most Common Symptom: ${topSymptoms[0]?.name || 'N/A'}`, 130, yPosition + 6);
    doc.text(`Cycle Irregularity: ${cycleVariability > 7 ? 'Yes' : 'No'}`, 20, yPosition + 12);
    
    if (pmddPrediction?.top_trigger_symptoms?.length > 0) {
      doc.text(`PMDD Criteria Met: ${pmddPrediction.top_trigger_symptoms.slice(0, 3).join(', ')}`, 70, yPosition + 12);
    }
    
    yPosition += 24;

    // Raw data table header
    doc.setFontSize(8);
    doc.setTextColor(255);
    doc.setFont('helvetica', 'bold');
    
    const tableY = yPosition;
    doc.setFillColor(colors.primary);
    doc.rect(15, tableY, 180, 6, 'F');
    doc.text('Date', 18, tableY + 4);
    doc.text('Cycle Day', 45, tableY + 4);
    doc.text('Top Symptoms', 70, tableY + 4);
    doc.text('Max Severity', 145, tableY + 4);
    doc.text('Mood Score', 175, tableY + 4);

    // Table rows (last 15 entries with symptoms)
    const entriesWithSymptoms = recentEntries
      .filter(e => Object.entries(e).some(([k, v]) => (k.startsWith('s_') || k.startsWith('m_')) && typeof v === 'number' && v >= 3))
      .slice(-15);

    doc.setFontSize(6);
    doc.setTextColor(colors.text);
    doc.setFont('helvetica', 'normal');

    entriesWithSymptoms.forEach((entry, i) => {
      const rowY = tableY + 7 + (i * 6);
      
      if (rowY > 270) {
        doc.addPage();
        doc.setFillColor(colors.primary);
        doc.rect(15, 20, 180, 6, 'F');
        doc.setTextColor(255);
        doc.text('Date', 18, 24);
        doc.text('Cycle Day', 45, 24);
        doc.text('Top Symptoms', 70, 24);
        doc.text('Max Severity', 145, 24);
        doc.text('Mood Score', 175, 24);
        doc.setTextColor(colors.text);
      }

      const entryDate = format(parseISO(entry.date), 'MM/dd');
      const cycleDay = entry.cycle_day || '-';
      const entrySymptoms = Object.entries(entry)
        .filter(([k, v]) => (k.startsWith('s_') || k.startsWith('m_')) && typeof v === 'number' && v >= 3)
        .slice(0, 2)
        .map(([k]) => k.replace(/^[smp]_/, '').replace(/_/g, ' '))
        .join(', ');
      
      const maxSeverity = Math.max(...Object.entries(entry)
        .filter(([k, v]) => (k.startsWith('s_') || k.startsWith('m_')) && typeof v === 'number' && v >= 3)
        .map(([, v]) => v), 0);
      
      const moodScore = entry.phq9_score || entry.gad7_score || entry.epds_score || '-';

      doc.text(entryDate, 18, rowY + 3);
      doc.text(cycleDay.toString(), 45, rowY + 3);
      doc.text(entrySymptoms.substring(0, 22) + (entrySymptoms.length > 22 ? '...' : ''), 70, rowY + 3);
      doc.text(maxSeverity ? `${maxSeverity}/6` : '-', 145, rowY + 3);
      doc.text(moodScore.toString(), 175, rowY + 3);
    });

    yPosition = tableY + 7 + (entriesWithSymptoms.length * 6) + 10;

    // Milestones & Maternal Mental Health Journey
    const milestoneNotes = userMilestones
      .filter(m => m.include_in_report && m.user_note)
      .sort((a, b) => (a.phase === 'pregnancy' ? 0 : 1) - (b.phase === 'pregnancy' ? 0 : 1));

    if (milestoneNotes.length > 0) {
      if (yPosition > 230) { doc.addPage(); yPosition = 20; }

      doc.setFontSize(14);
      doc.setTextColor(colors.text);
      doc.setFont('helvetica', 'bold');
      doc.text('Milestones & Maternal Mental Health Journey', 15, yPosition);
      yPosition += 8;

      milestoneNotes.forEach((m) => {
        if (yPosition > 250) { doc.addPage(); yPosition = 20; }

        const noteLines = doc.splitTextToSize(m.user_note, 172);
        const noteHeight = 10 + noteLines.length * 4;

        doc.setFillColor(m.phase === 'pregnancy' ? '#FDF2F8' : '#FAF5FF');
        doc.roundedRect(15, yPosition, 180, noteHeight, 3, 3, 'F');

        doc.setFontSize(8);
        doc.setTextColor(colors.secondary);
        doc.setFont('helvetica', 'bold');
        doc.text(`${m.phase === 'pregnancy' ? 'Pregnancy' : 'Postpartum'} Milestone${m.experienced ? ' (Experienced)' : ''}`, 18, yPosition + 5);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colors.text);
        doc.text(noteLines, 18, yPosition + 11);

        yPosition += noteHeight + 4;
      });

      yPosition += 6;
    }

    // DSM-5 PMDD alignment
    if (pmddPrediction && pmddPrediction.top_trigger_symptoms?.length > 0) {
      doc.setFontSize(9);
      doc.setTextColor(colors.text);
      doc.setFont('helvetica', 'bold');
      doc.text('DSM-5 PMDD Criteria Alignment:', 15, yPosition);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(colors.lightText);
      doc.text(pmddPrediction.top_trigger_symptoms.slice(0, 6).join(', '), 15, yPosition + 5);
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
    for (let i = 0; i < 5; i++) {
      doc.line(15, yPosition + (i * 9), 195, yPosition + (i * 9));
    }

    yPosition += 52;

    // FOOTER with disclaimer - split into 3 lines to fit within page
    doc.setFontSize(7);
    doc.setTextColor(colors.lightText);
    doc.setFont('helvetica', 'italic');
    doc.text('This report was generated by Luna, the CycleMind AI clinical companion.', 105, 279, { align: 'center' });
    doc.text('It is not a substitute for professional medical advice, diagnosis, or treatment.', 105, 283, { align: 'center' });
    doc.text('All interpretations and clinical decisions should be made by a qualified healthcare provider.', 105, 287, { align: 'center' });

    // Page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(colors.lightText);
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