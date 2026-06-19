import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { jsPDF } from 'npm:jspdf@4.0.0';
import { differenceInDays, format, parseISO } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { includeJournal, includeMedications, includeScreening } = await req.json();

    // Fetch data for last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const cycles = await base44.entities.Cycle.filter({ user_id: user.id });
    const entries = await base44.entities.DailyEntry.filter({});
    
    // Filter entries for last 90 days
    const recentEntries = entries.filter(e => {
      const entryDate = parseISO(e.date);
      return entryDate >= ninetyDaysAgo;
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

    // Generate PDF
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor(20, 83, 45); // Teal
    doc.text('CycleMind Clinical Summary', 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Patient: ${user.full_name || 'Anonymous'}`, 20, 28);
    doc.text(`Report Generated: ${format(new Date(), 'MMM d, yyyy')}`, 20, 33);
    doc.text(`Reporting Period: Last 90 days (${format(ninetyDaysAgo, 'MMM d')} - ${format(new Date(), 'MMM d')})`, 20, 38);

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
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('This report contains sensitive health information. For healthcare provider use only.', 20, latestCycle ? 48 : 45);

    let yPosition = 55;

    // Cycle Summary
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Cycle Summary', 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
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

    // Mood Screening Scores
    doc.setFontSize(14);
    doc.text('Mood Screening Scores (90-Day Average)', 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
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

    // Top Symptoms
    doc.setFontSize(14);
    doc.text('Most Frequent Symptoms', 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    topSymptoms.forEach(symptom => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`${symptom.name.replace(/_/g, ' ')}: ${symptom.daysReported} days`, 25, yPosition);
      yPosition += 5;
    });
    yPosition += 8;

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

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount}`, 180, 290);
      doc.text('CycleMind - Clinical Grade Hormonal Mental Health Tracking', 20, 290);
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