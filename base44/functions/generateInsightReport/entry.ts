import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { subMonths, format, differenceInDays } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const threeMonthsAgo = subMonths(now, 3);
    const twoYearsAgo = subMonths(now, 24);

    // Fetch all data
    const cycles = await base44.entities.Cycle.filter({ created_by: user.email });
    const entries = await base44.entities.DailyEntry.filter({ created_by: user.email });

    // Recent data (3 months)
    const recentEntries = entries.filter(e => new Date(e.date) >= threeMonthsAgo);
    const recentCycles = cycles.filter(c => new Date(c.start_date) >= threeMonthsAgo);

    // Calculate key metrics
    const totalEntries = recentEntries.length;
    const totalCycles = recentCycles.length;
    
    const cycleLengths = cycles.filter(c => c.cycle_length).map(c => c.cycle_length);
    const avgCycleLength = cycleLengths.length > 0 
      ? (cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length).toFixed(1)
      : 'N/A';

    // Mood scores
    const phq9Scores = recentEntries.filter(e => e.phq9_score).map(e => e.phq9_score);
    const gad7Scores = recentEntries.filter(e => e.gad7_score).map(e => e.gad7_score);
    const epdsScores = recentEntries.filter(e => e.epds_score).map(e => e.epds_score);

    const avgPHQ9 = phq9Scores.length > 0 
      ? (phq9Scores.reduce((a, b) => a + b, 0) / phq9Scores.length).toFixed(1)
      : null;
    const avgGAD7 = gad7Scores.length > 0 
      ? (gad7Scores.reduce((a, b) => a + b, 0) / gad7Scores.length).toFixed(1)
      : null;
    const avgEPDS = epdsScores.length > 0 
      ? (epdsScores.reduce((a, b) => a + b, 0) / epdsScores.length).toFixed(1)
      : null;

    // Top symptoms
    const symptomCounts = {};
    const symptomKeys = [
      's_mood_swings', 's_irritability', 's_anxiety', 's_depression',
      'm_hot_flashes', 'p_nausea', 'pp_fatigue', 's_bloating', 's_headache'
    ];

    recentEntries.forEach(e => {
      symptomKeys.forEach(key => {
        if ((e[key] || 0) >= 3) {
          symptomCounts[key] = (symptomCounts[key] || 0) + 1;
        }
      });
    });

    const topSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key, count]) => {
        const names = {
          's_mood_swings': 'Mood swings',
          's_irritability': 'Irritability',
          's_anxiety': 'Anxiety',
          's_depression': 'Low mood',
          'm_hot_flashes': 'Hot flashes',
          'p_nausea': 'Nausea',
          'pp_fatigue': 'Fatigue',
          's_bloating': 'Bloating',
          's_headache': 'Headaches'
        };
        return `${names[key] || key} (${count} days)`;
      });

    // Generate personalized summary
    const cycleType = recentCycles[0]?.cycle_type || 'menstrual';
    const summary = `Over the past 3 months, you've logged ${totalEntries} days across ${totalCycles} cycle(s). Your average cycle length is ${avgCycleLength} days. ${avgPHQ9 ? `Average PHQ-9 (depression): ${avgPHQ9}. ` : ''}${avgGAD7 ? `Average GAD-7 (anxiety): ${avgGAD7}. ` : ''}${avgEPDS ? `Average EPDS (postpartum): ${avgEPDS}. ` : ''}Most frequent symptoms: ${topSymptoms.join(', ') || 'none logged'}.`;

    // Generate 3 actionable recommendations
    const recommendations = [];

    if (avgPHQ9 && parseFloat(avgPHQ9) >= 10) {
      recommendations.push('Consider discussing your PHQ-9 scores with a mental health provider - scores above 10 may indicate moderate depression.');
    } else if (avgGAD7 && parseFloat(avgGAD7) >= 10) {
      recommendations.push('Your anxiety scores suggest moderate anxiety - consider speaking with a therapist about coping strategies.');
    } else {
      recommendations.push('Continue daily tracking to identify patterns - consistent logging improves prediction accuracy.');
    }

    if (topSymptoms.length > 0) {
      recommendations.push(`Track your top symptom (${topSymptoms[0].split(' ')[0]}) more closely - note triggers and what helps reduce severity.`);
    } else {
      recommendations.push('Consider adding mood screening scales (PHQ-9, GAD-7) to get baseline mental health metrics.');
    }

    if (totalCycles < 3) {
      recommendations.push('Log 2-3 more cycles to enable accurate period predictions and PMDD pattern detection.');
    } else {
      recommendations.push('Review your luteal phase symptoms - if mood worsens before your period, discuss PMDD screening with your provider.');
    }

    // Store prediction
    const prediction = await base44.entities.Prediction.create({
      user_id: user.id,
      prediction_type: 'insight_report',
      summary: summary,
      recommendations: recommendations,
      data_points_analyzed: totalEntries + totalCycles,
      generated_date: now.toISOString().split('T')[0]
    });

    return Response.json({
      summary: summary,
      recommendations: recommendations,
      metrics: {
        total_entries: totalEntries,
        total_cycles: totalCycles,
        avg_cycle_length: avgCycleLength,
        avg_phq9: avgPHQ9,
        avg_gad7: avgGAD7,
        avg_epds: avgEPDS,
        top_symptoms: topSymptoms
      },
      prediction_id: prediction.id
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});