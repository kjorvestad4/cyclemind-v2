import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { subMonths, format } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const twoYearsAgo = format(subMonths(now, 24), 'yyyy-MM-dd');
    const today = format(now, 'yyyy-MM-dd');

    // Fetch last 24 months of cycles
    const cycles = await base44.entities.Cycle.filter({ created_by: user.email });
    const recentCycles = cycles.filter(c => c.start_date >= twoYearsAgo);

    // Fetch last 24 months of daily entries
    const entries = await base44.entities.DailyEntry.filter({ created_by: user.email });
    const recentEntries = entries.filter(e => e.date >= twoYearsAgo);

    // Calculate key metrics
    const cycleLengths = recentCycles.map(c => c.cycle_length).filter(Boolean);
    const avgCycleLength = cycleLengths.length > 0 
      ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length) 
      : 28;

    // Get current cycle info
    const sortedCycles = [...recentCycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
    const latestCycle = sortedCycles[0];
    const cycleType = latestCycle?.cycle_type || 'menstrual';

    // Calculate current cycle day
    let cycleDay = null;
    if (latestCycle?.start_date) {
      const start = new Date(latestCycle.start_date);
      const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
      cycleDay = diffDays + 1;
    }

    // Get recent mood scores (last 90 days)
    const ninetyDaysAgo = format(subMonths(now, 3), 'yyyy-MM-dd');
    const recentMoodEntries = recentEntries.filter(e => e.date >= ninetyDaysAgo);
    
    const phq9Scores = recentMoodEntries
      .filter(e => e.phq9_score !== null && e.phq9_score !== undefined)
      .map(e => ({ date: e.date, score: e.phq9_score }));
    
    const gad7Scores = recentMoodEntries
      .filter(e => e.gad7_score !== null && e.gad7_score !== undefined)
      .map(e => ({ date: e.date, score: e.gad7_score }));
    
    const epdsScores = recentMoodEntries
      .filter(e => e.epds_score !== null && e.epds_score !== undefined)
      .map(e => ({ date: e.date, score: e.epds_score }));

    // Calculate averages
    const avgPHQ9 = phq9Scores.length > 0 
      ? (phq9Scores.reduce((sum, x) => sum + x.score, 0) / phq9Scores.length).toFixed(1)
      : null;
    
    const avgGAD7 = gad7Scores.length > 0 
      ? (gad7Scores.reduce((sum, x) => sum + x.score, 0) / gad7Scores.length).toFixed(1)
      : null;

    // Identify patterns (luteal phase symptoms)
    const lutealSymptoms = recentEntries
      .filter(e => {
        const entryCycleDay = e.cycle_day;
        return entryCycleDay && entryCycleDay >= (avgCycleLength - 14) && entryCycleDay <= avgCycleLength;
      })
      .filter(e => {
        const symptomKeys = ['s_mood_swings', 's_irritability', 's_anxiety', 's_depression', 's_overwhelmed'];
        return symptomKeys.some(key => (e[key] || 0) > 3);
      });

    const lutealPatternDetected = lutealSymptoms.length > 2;

    // Get pregnancy-specific data
    const pregnancyData = cycleType === 'pregnancy' ? {
      trimester: latestCycle?.trimester || recentEntries[0]?.trimester,
      pregnancy_week: latestCycle?.pregnancy_week || recentEntries[0]?.pregnancy_week,
      edd: latestCycle?.estimated_due_date,
      lmp: latestCycle?.last_menstrual_period,
    } : null;

    // Get menopause-specific data
    const menopauseData = (cycleType === 'menopause' || cycleType === 'perimenopause') ? {
      hrt_type: latestCycle?.hrt_type,
      hrt_start_date: latestCycle?.hrt_start_date,
    } : null;

    // Recent symptoms (last 30 days)
    const thirtyDaysAgo = format(subMonths(now, 1), 'yyyy-MM-dd');
    const lastMonthEntries = recentEntries.filter(e => e.date >= thirtyDaysAgo);
    
    const symptomCounts = {};
    lastMonthEntries.forEach(e => {
      const symptomKeys = [
        's_mood_swings', 's_irritability', 's_anxiety', 's_depression',
        'm_hot_flashes', 'p_nausea', 'pp_fatigue'
      ];
      symptomKeys.forEach(key => {
        if ((e[key] || 0) > 0) {
          symptomCounts[key] = (symptomCounts[key] || 0) + 1;
        }
      });
    });

    const topSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key, count]) => ({ symptom: key, days: count }));

    return Response.json({
      user: {
        email: user.email,
        full_name: user.full_name,
        cycle_type: cycleType,
      },
      current_status: {
        cycle_day: cycleDay,
        cycle_length: avgCycleLength,
        latest_cycle_start: latestCycle?.start_date,
      },
      historical_summary: {
        total_cycles: recentCycles.length,
        total_entries: recentEntries.length,
        avg_cycle_length: avgCycleLength,
        luteal_pattern_detected: lutealPatternDetected,
      },
      mood_scores: {
        phq9: { recent: phq9Scores.slice(-10), average: avgPHQ9 },
        gad7: { recent: gad7Scores.slice(-10), average: avgGAD7 },
        epds: { recent: epdsScores.slice(-10) },
      },
      pregnancy: pregnancyData,
      menopause: menopauseData,
      top_symptoms_last_30_days: topSymptoms,
      raw_data: {
        cycles: recentCycles,
        entries: recentEntries,
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});