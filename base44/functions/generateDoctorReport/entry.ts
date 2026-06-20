import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
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

    // Use provided date range or default to last 90 days
    const startDate = start_date ? parseISO(start_date) : subDays(new Date(), 90);
    const endDate = end_date ? parseISO(end_date) : new Date();

    const cycles = await base44.entities.Cycle.filter({ user_id: user.id });
    const entries = await base44.entities.DailyEntry.filter({});
    
    // Filter entries for date range
    const recentEntries = entries.filter(e => {
      const entryDate = parseISO(e.date);
      return entryDate >= startDate && entryDate <= endDate;
    });

    // Calculate summary statistics
    const totalDaysLogged = recentEntries.length;
    const avgCycleLength = cycles.length > 0 
      ? Math.round(cycles.reduce((sum, c) => sum + (c.cycle_length || 28), 0) / cycles.length)
      : null;

    // Mood scores
    const phq9Scores = recentEntries.filter(e => e.phq9_score).map(e => e.phq9_score);
    const gad7Scores = recentEntries.filter(e => e.gad7_score).map(e => e.gad7_score);
    const epdsScores = recentEntries.filter(e => e.epds_score).map(e => e.epds_score);

    const avgPHQ9 = phq9Scores.length ? (phq9Scores.reduce((a, b) => a + b, 0) / phq9Scores.length).toFixed(1) : null;
    const avgGAD7 = gad7Scores.length ? (gad7Scores.reduce((a, b) => a + b, 0) / gad7Scores.length).toFixed(1) : null;
    const avgEPDS = epdsScores.length ? (epdsScores.reduce((a, b) => a + b, 0) / epdsScores.length).toFixed(1) : null;

    // Top symptoms
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

    // Generate PDF with professional teal branding
    const doc = new jsPDF();
    
    // Enhanced Header with gradient-style hero element and accent bar
    doc.setFillColor(230, 247, 241); // Light teal background
    doc.rect(0, 0, 210, 40, 'F');
    
    // Top accent bar
    doc.setFillColor(10, 90, 60); // Dark teal
    doc.rect(0, 0, 210, 3, 'F');
    
    doc.setFontSize(20);
    doc.setTextColor(10, 90, 60);
    doc.setFont("helvetica", "bold");
    doc.text('CycleMind Clinical Summary', 20, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.setFont("helvetica", "normal");
    doc.text(`Patient: ${user.full_name || 'Anonymous'}`, 20, 30);
    doc.text(`Report Generated: ${format(new Date(), 'MMM d, yyyy')}`, 20, 35);
    doc.text(`Reporting Period: ${format(startDate, 'MMM d, yyyy')} – ${format(endDate, 'MMM d, yyyy')}`, 20, 40);

    const latestCycle = [...cycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date))[0];

    // Add fertility/menopause context if applicable
    if (latestCycle) {
      doc.setFontSize(9);
      if (latestCycle.cycle_type === 'pregnancy' || latestCycle.is_pregnancy_mode) {
        doc.text(`Pregnancy Mode | EDD: ${latestCycle.estimated_due_date || 'N/A'} | Week: ${latestCycle.pregnancy_week || 'N/A'}`, 20, 43);
      } else if (latestCycle.cycle_type === 'menopause' || latestCycle.is_menopause_mode) {
        doc.text(`Menopause Tracking | HRT: ${latestCycle.hrt_type || 'None'}`, 20, 43);
      }
    }

    // Disclaimer
    doc.setFontSize(7);
    doc.setTextColor(120);
    doc.text('CONFIDENTIAL: This report contains sensitive health information. For healthcare provider use only.', 20, latestCycle ? 53 : 48);

    let yPosition = 55;

    // Cycle Summary with enhanced teal accent bar
    doc.setFillColor(245, 252, 250); // Very light teal
    doc.rect(20, yPosition - 5, 170, 7, 'F');
    doc.setFillColor(10, 90, 60); // Dark teal accent
    doc.rect(20, yPosition - 5, 3, 7, 'F');
    doc.setFontSize(13);
    doc.setTextColor(10, 90, 60);
    doc.setFont("helvetica", "bold");
    doc.text('Cycle Summary', 27, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.text(`Total Cycles Logged: ${cycles.length}`, 25, yPosition);
    yPosition += 5;
    doc.text(`Average Cycle Length: ${avgCycleLength || 'N/A'} days`, 25, yPosition);
    yPosition += 5;
    doc.text(`Days Tracked: ${totalDaysLogged}`, 25, yPosition);
    yPosition += 5;

    // User-set luteal phase & PMDD window from profile settings
    if (user.luteal_phase_length) {
      doc.text(`User-set Avg Luteal Phase: ${user.luteal_phase_length} days`, 25, yPosition);
      yPosition += 5;
    }

    // Calculate PMDD symptom intensity in luteal vs follicular
    if (latestCycle && latestCycle.cycle_length && user.luteal_phase_length) {
      const ovulationDay = (latestCycle.cycle_length || 28) - (user.luteal_phase_length || 14);
      const pmddWindowDays = user.pmdd_window_days || 10;
      const pmddWindowStart = (latestCycle.cycle_length || 28) - pmddWindowDays + 1;

      let lutealSum = 0, lutealCount = 0;
      let follicularSum = 0, follicularCount = 0;

      recentEntries.forEach(e => {
        if (!e.cycle_day) return;
        const symptomKeys = Object.keys(e).filter(k =>
          k.startsWith('s_') || k.startsWith('m_') || k.startsWith('pp_')
        );
        const dayTotal = symptomKeys.reduce((s, k) => s + (e[k] || 0), 0);
        if (dayTotal === 0) return;

        if (e.cycle_day >= pmddWindowStart) {
          lutealSum += dayTotal;
          lutealCount++;
        } else if (e.cycle_day <= ovulationDay - 1) {
          follicularSum += dayTotal;
          follicularCount++;
        }
      });

      if (lutealCount > 0 && follicularCount > 0) {
        const lutealAvg = lutealSum / lutealCount;
        const follicularAvg = follicularSum / follicularCount;
        const ratio = follicularAvg > 0 ? (lutealAvg / follicularAvg).toFixed(1) : null;
        if (ratio) {
          doc.text(`PMDD symptom intensity in luteal window: ${ratio}x higher (based on your logs)`, 25, yPosition);
          yPosition += 5;
        }
      }
    }
    yPosition += 3;

    // Contraception transition note
    if (user.current_situation === 'stopped_contraception' && user.include_transition_note) {
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      const transitionText = 'Contraception transition noted • Symptom tracking active during amenorrhea • Ready to re-baseline once first natural period logged';
      const splitTransition = doc.splitTextToSize(transitionText, 165);
      doc.text(splitTransition, 25, yPosition);
      yPosition += (splitTransition.length * 4) + 3;
      doc.setFontSize(10);
      doc.setTextColor(0);
    }

    if (latestCycle) {
      doc.text(`Current Cycle Type: ${latestCycle.cycle_type || 'Menstrual'}`, 25, yPosition);
      yPosition += 5;
      doc.text(`Current Cycle Day: ${latestCycle.cycle_day || 'N/A'}`, 25, yPosition);
      yPosition += 5;
      
      if (latestCycle.cycle_type === 'pregnancy' || latestCycle.is_pregnancy_mode) {
        doc.text(`Pregnancy Week: ${latestCycle.pregnancy_week || 'N/A'} | Trimester: ${latestCycle.trimester || 'N/A'}`, 25, yPosition);
        yPosition += 5;
        if (latestCycle.estimated_due_date) {
          doc.text(`Estimated Due Date: ${format(parseISO(latestCycle.estimated_due_date), 'MMM d, yyyy')}`, 25, yPosition);
          yPosition += 5;
        }
      }
      
      if (latestCycle.cycle_type === 'menopause' || latestCycle.is_menopause_mode) {
        doc.text(`HRT Type: ${latestCycle.hrt_type || 'None'}`, 25, yPosition);
        yPosition += 5;
        if (latestCycle.hrt_start_date) {
          doc.text(`HRT Start Date: ${format(parseISO(latestCycle.hrt_start_date), 'MMM d, yyyy')}`, 25, yPosition);
          yPosition += 5;
        }
      }
    }
    yPosition += 8;

    // Mood Screening Scores with enhanced teal accent bar
    doc.setFillColor(245, 252, 250);
    doc.rect(20, yPosition - 5, 170, 7, 'F');
    doc.setFillColor(10, 90, 60);
    doc.rect(20, yPosition - 5, 3, 7, 'F');
    doc.setFontSize(13);
    doc.setTextColor(10, 90, 60);
    doc.setFont("helvetica", "bold");
    doc.text('Mood Screening Scores (90-Day Average)', 27, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(50);
    if (avgPHQ9) {
      doc.text(`PHQ-9 (Depression): ${avgPHQ9} ${getSeverityLabel(parseFloat(avgPHQ9))}`, 25, yPosition);
      yPosition += 5;
    }
    if (avgGAD7) {
      doc.text(`GAD-7 (Anxiety): ${avgGAD7} ${getSeverityLabel(parseFloat(avgGAD7))}`, 25, yPosition);
      yPosition += 5;
    }
    if (avgEPDS) {
      doc.text(`EPDS (Postpartum Depression): ${avgEPDS} ${getSeverityLabel(parseFloat(avgEPDS))}`, 25, yPosition);
      yPosition += 5;
    }
    yPosition += 8;

    // Top Symptoms with enhanced teal accent bar and severity visualization
    doc.setFillColor(245, 252, 250);
    doc.rect(20, yPosition - 5, 170, 7, 'F');
    doc.setFillColor(10, 90, 60);
    doc.rect(20, yPosition - 5, 3, 7, 'F');
    doc.setFontSize(13);
    doc.setTextColor(10, 90, 60);
    doc.setFont("helvetica", "bold");
    doc.text('Most Frequent Symptoms', 27, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(50);
    const daysInRange = differenceInDays(endDate, startDate);
    topSymptoms.forEach((symptom, idx) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      // Enhanced severity bar with color coding
      const barWidth = Math.min((symptom.daysReported / daysInRange) * 120, 140);
      const barColor = symptom.daysReported >= 30 ? [220, 80, 80] : symptom.daysReported >= 15 ? [240, 180, 80] : [20, 180, 140];
      doc.setFillColor(...barColor);
      doc.rect(25, yPosition - 2, barWidth, 4, 'F');
      doc.text(`${idx + 1}. ${symptom.name.replace(/_/g, ' ')}: ${symptom.daysReported} days`, 25, yPosition + 1);
      yPosition += 7;
    });
    yPosition += 8;

    // Progress Chart (if included)
    if (includeChart && recentEntries.length > 0) {
      doc.setFillColor(245, 252, 250);
      doc.rect(20, yPosition - 5, 170, 7, 'F');
      doc.setFillColor(10, 90, 60);
      doc.rect(20, yPosition - 5, 3, 7, 'F');
      doc.setFontSize(13);
      doc.setTextColor(10, 90, 60);
      doc.setFont("helvetica", "bold");
      doc.text('Symptom Progress Over Time', 27, yPosition);
      yPosition += 10;
      
      // Calculate weekly averages
      const weeklyData = {};
      recentEntries.forEach(e => {
        const d = parseISO(e.date);
        const dayOfWeek = d.getDay();
        const weekStart = subDays(d, dayOfWeek);
        const weekKey = format(weekStart, 'MMM d');
        
        if (!weeklyData[weekKey]) weeklyData[weekKey] = { sum: 0, count: 0 };
        
        const symptomKeys = Object.keys(e).filter(k => 
          k.startsWith('s_') || k.startsWith('m_') || k.startsWith('p_') || k.startsWith('pp_')
        );
        const avg = symptomKeys.reduce((s, k) => s + (e[k] || 0), 0) / symptomKeys.length;
        
        weeklyData[weekKey].sum += avg;
        weeklyData[weekKey].count++;
      });
      
      const chartData = Object.entries(weeklyData)
        .map(([week, data]) => ({
          week,
          avg: parseFloat((data.sum / data.count).toFixed(1))
        }))
        .sort((a, b) => new Date(a.week) - new Date(b.week))
        .slice(-8);
      
      // Simple bar chart visualization
      const maxVal = Math.max(...chartData.map(d => d.avg), 1);
      const barWidth = 18;
      const gap = 4;
      const chartHeight = 80;
      const startX = 25;
      const baseY = yPosition + chartHeight;
      
      chartData.forEach((d, i) => {
        const barHeight = (d.avg / maxVal) * chartHeight;
        const x = startX + i * (barWidth + gap);
        
        // Bar
        doc.setFillColor(20, 180, 140);
        doc.rect(x, baseY - barHeight, barWidth, barHeight, 'F');
        
        // Value
        doc.setFontSize(8);
        doc.setTextColor(80);
        doc.text(d.avg.toString(), x + barWidth / 2, baseY - barHeight - 2, { align: 'center' });
        
        // Week label
        doc.setFontSize(7);
        doc.text(d.week.slice(0, 5), x + barWidth / 2, baseY + 4, { align: 'center' });
      });
      
      yPosition += chartHeight + 15;
    }

    // Appointment Prep Checklist (if included)
    if (includeAppointmentPrep) {
      doc.setFillColor(245, 252, 250);
      doc.rect(20, yPosition - 5, 170, 7, 'F');
      doc.setFillColor(10, 90, 60);
      doc.rect(20, yPosition - 5, 3, 7, 'F');
      doc.setFontSize(13);
      doc.setTextColor(10, 90, 60);
      doc.setFont("helvetica", "bold");
      doc.text('Appointment Preparation', 27, yPosition);
      yPosition += 10;
      
      doc.setFontSize(9);
      doc.setTextColor(50);
      
      // Top symptoms
      if (topSymptoms.length > 0) {
        doc.text('📋 Top symptoms to discuss:', 25, yPosition);
        yPosition += 4;
        doc.setFontSize(8);
        doc.setTextColor(80);
        doc.text(topSymptoms.slice(0, 3).map(s => `• ${s.name.replace(/_/g, ' ')}`).join(' | '), 25, yPosition);
        yPosition += 6;
        doc.setFontSize(9);
        doc.setTextColor(50);
      }
      
      // Mood scores
      if (avgPHQ9 || avgGAD7) {
        doc.text('🧠 Mood screening averages:', 25, yPosition);
        yPosition += 4;
        doc.setFontSize(8);
        doc.setTextColor(80);
        const scores = [];
        if (avgPHQ9) scores.push(`PHQ-9: ${avgPHQ9}`);
        if (avgGAD7) scores.push(`GAD-7: ${avgGAD7}`);
        doc.text(scores.join(' | '), 25, yPosition);
        yPosition += 6;
        doc.setFontSize(9);
        doc.setTextColor(50);
      }
      
      // Questions to ask
      doc.text('❓ Questions for your provider:', 25, yPosition);
      yPosition += 4;
      doc.setFontSize(8);
      doc.setTextColor(80);
      const questions = [
        'Are my symptoms consistent with PMDD?',
        'What treatment options do you recommend?',
        'Should I adjust tracking or medication timing?'
      ];
      questions.forEach((q, i) => {
        doc.text(`${i + 1}. ${q}`, 25, yPosition);
        yPosition += 4;
      });
      yPosition += 3;
    }

    // Journal Entries (if included)
    if (includeJournal) {
      doc.setFontSize(14);
      doc.text('Recent Journal Entries', 20, yPosition);
      yPosition += 8;
      
      const entriesWithJournal = recentEntries.filter(e => e.journal_entry).slice(0, 5);
      entriesWithJournal.forEach(entry => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFontSize(9);
        doc.text(`${format(parseISO(entry.date), 'MMM d')}:`, 25, yPosition);
        yPosition += 5;
        
        const journalText = entry.journal_entry.substring(0, 150);
        const splitText = doc.splitTextToSize(journalText, 170);
        doc.text(splitText, 25, yPosition);
        yPosition += (splitText.length * 5) + 3;
      });
      yPosition += 5;
    }

    // Medications (if included)
    if (includeMedications) {
      doc.setFontSize(14);
      doc.text('Medications Logged', 20, yPosition);
      yPosition += 8;
      
      const allMeds = new Set();
      recentEntries.forEach(e => {
        if (e.medications_taken) {
          e.medications_taken.forEach(med => allMeds.add(med));
        }
      });
      
      if (allMeds.size > 0) {
        doc.setFontSize(10);
        allMeds.forEach(med => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(`• ${med}`, 25, yPosition);
          yPosition += 5;
        });
      } else {
        doc.text('No medications logged', 25, yPosition);
        yPosition += 5;
      }
      yPosition += 5;
    }

    // Enhanced Footer with professional branding
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer background
      doc.setFillColor(230, 247, 241);
      doc.rect(0, 280, 210, 27, 'F');
      
      // Top accent bar
      doc.setFillColor(10, 90, 60);
      doc.rect(0, 280, 210, 2, 'F');
      
      // Branding text
      doc.setFontSize(8);
      doc.setTextColor(10, 90, 60);
      doc.setFont("helvetica", "bold");
      doc.text('⚕️ DRSP-Based Clinical Assessment Tool', 20, 287);
      
      doc.setFontSize(7);
      doc.setTextColor(80);
      doc.setFont("helvetica", "normal");
      doc.text('Based on the Daily Record of Severity of Problems — Endicott, Nee & Harrison (2006).', 20, 292);
      doc.text('For informational purposes only — not a diagnostic tool. Always consult a qualified healthcare provider.', 20, 297);
      doc.setTextColor(100);
      doc.text(`Page ${i} of ${pageCount} | Generated by CycleMind`, 140, 302);
    }

    // Convert to blob
    const pdfBytes = doc.output('arraybuffer');
    
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="CycleMind_Report_${user.full_name || 'Patient'}_${format(new Date(), 'yyyy-MM-dd')}.pdf"`
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getSeverityLabel(score) {
  if (score >= 15) return '(Moderate-Severe)';
  if (score >= 10) return '(Moderate)';
  if (score >= 5) return '(Mild)';
  return '(Minimal)';
}