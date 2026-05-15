import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { differenceInMonths, differenceInYears, format } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's cycles and entries
    const cycles = await base44.entities.Cycle.filter({ user_id: user.id });
    const entries = await base44.entities.DailyEntry.filter({});
    
    // Filter for menopause/perimenopause cycles
    const menopauseCycles = cycles.filter(c => 
      c.cycle_type === 'menopause' || c.cycle_type === 'perimenopause'
    );

    if (menopauseCycles.length === 0) {
      return Response.json({
        error: 'No menopause/perimenopause data. Please switch to menopause mode in your profile.',
        status: 400
      });
    }

    // Determine STRAW+10 stage
    // Stage -3: Late reproductive (cycle length variability >7 days)
    // Stage -2: Early transition (persistent cycle irregularity)
    // Stage -1: Late transition (≥60 days amenorrhea)
    // Stage 0: Final menstrual period (retrospective, after 12 months amenorrhea)
    // Stage +1: Early postmenopause (0-6 years since FMP)
    // Stage +2: Late postmenopause (>6 years since FMP)

    const sortedCycles = [...menopauseCycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
    const latestCycle = sortedCycles[0];
    const latestDate = new Date(latestCycle.start_date);
    const today = new Date();
    const monthsSinceLastPeriod = differenceInMonths(today, latestDate);

    let strawStage = '-3';
    let stageName = 'Late Reproductive';
    let description = 'Cycle length variability begins (>7 days difference between cycles).';

    if (monthsSinceLastPeriod >= 12) {
      strawStage = '+1';
      stageName = 'Early Postmenopause';
      description = '12+ months since last period. Estrogen levels are consistently low.';
    } else if (monthsSinceLastPeriod >= 2) {
      strawStage = '-1';
      stageName = 'Late Transition';
      description = 'Irregular periods with gaps of 60+ days. Hormone levels fluctuate widely.';
    } else if (latestCycle.cycle_length && latestCycle.cycle_length > 35) {
      strawStage = '-2';
      stageName = 'Early Transition';
      description = 'Persistent cycle irregularity (cycles >35 days or <21 days).';
    }

    // Analyze symptom trajectory over time
    const menopauseEntries = entries.filter(e => {
      const cycle = cycles.find(c => c.id === e.cycle_id);
      return cycle && (cycle.cycle_type === 'menopause' || cycle.cycle_type === 'perimenopause');
    });

    // Group by month for trajectory
    const monthlyData = {};
    menopauseEntries.forEach(entry => {
      const monthKey = entry.date.substring(0, 7); // YYYY-MM
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { symptoms: [], count: 0 };
      }
      monthlyData[monthKey].count += 1;
      
      // Collect key symptoms
      ['m_hot_flashes', 'm_night_sweats', 'm_mood_swings', 'm_brain_fog', 'm_sleep_disturbance', 'm_vaginal_dryness'].forEach(key => {
        if (entry[key]) {
          monthlyData[monthKey].symptoms.push({ key, severity: entry[key] });
        }
      });
    });

    // Calculate averages by month
    const trajectory = Object.entries(monthlyData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6) // Last 6 months
      .map(([month, data]) => {
        const avgSeverity = data.symptoms.reduce((sum, s) => sum + s.severity, 0) / (data.symptoms.length || 1);
        return {
          month,
          avgSeverity: Math.round(avgSeverity * 10) / 10,
          symptomCount: data.symptoms.length
        };
      });

    // Identify top symptoms
    const allSymptoms = {};
    menopauseEntries.forEach(entry => {
      ['m_hot_flashes', 'm_night_sweats', 'm_mood_swings', 'm_brain_fog', 'm_sleep_disturbance', 'm_vaginal_dryness', 'm_joint_pain', 'm_anxiety', 'm_depression'].forEach(key => {
        if (entry[key] && entry[key] >= 3) {
          allSymptoms[key] = (allSymptoms[key] || 0) + 1;
        }
      });
    });

    const topSymptoms = Object.entries(allSymptoms)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([symptom, count]) => ({
        name: symptom.replace('m_', '').replace(/_/g, ' '),
        frequency: count
      }));

    // Generate evidence-based recommendations
    const recommendations = [];

    if (topSymptoms.find(s => s.name.includes('hot flash') || s.name.includes('night sweat'))) {
      recommendations.push({
        category: 'HRT',
        text: 'Vasomotor symptoms (hot flashes, night sweats) are the #1 indication for HRT. Transdermal estrogen has lower cardiovascular risk than oral. Discuss with your provider.'
      });
    }

    if (topSymptoms.find(s => s.name.includes('mood') || s.name.includes('anxiety') || s.name.includes('depression'))) {
      recommendations.push({
        category: 'Mental Health',
        text: 'Perimenopause increases depression risk 2-4x even in women without prior history. SSRIs/SNRIs can help both mood and hot flashes. Therapy (CBT) is also effective.'
      });
    }

    if (topSymptoms.find(s => s.name.includes('brain fog') || s.name.includes('sleep'))) {
      recommendations.push({
        category: 'Lifestyle',
        text: 'Brain fog and sleep disruption are interconnected. Prioritize sleep hygiene: cool room (65-68°F), consistent schedule, limit screens before bed. Magnesium glycinate may help.'
      });
    }

    recommendations.push({
      category: 'Bone Health',
      text: 'Estrogen decline accelerates bone loss. Ensure 1200mg calcium + 800-1000 IU vitamin D daily. Weight-bearing exercise 3x/week. Consider DEXA scan if risk factors.'
    });

    return Response.json({
      success: true,
      menopauseData: {
        strawStage,
        stageName,
        description,
        monthsSinceLastPeriod,
        trajectory,
        topSymptoms,
        recommendations,
        disclaimer: "This is AI-generated pattern recognition and not a substitute for professional medical advice. Discuss HRT and treatment options with your healthcare provider."
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});