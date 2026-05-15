import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Inline clinical knowledge base (cannot import from lib/ in backend functions)
const CLINICAL_GUIDELINES = {
  pmdd: {
    name: "DSM-5 PMDD Diagnostic Criteria",
    source: "American Psychiatric Association DSM-5",
    criteria: [
      "A. In the majority of menstrual cycles, at least 5 symptoms must be present in the final week before menses onset",
      "B. One (or more) of the following: marked affective lability, marked irritability/anger, marked depressed mood, marked anxiety/tension",
      "C. One (or more) of the following: decreased interest in activities, difficulty concentrating, lethargy, marked change in appetite, hypersomnia/insomnia, sense of being overwhelmed, physical symptoms (breast tenderness, bloating, joint/muscle pain)",
      "D. Symptoms are associated with clinically significant distress or interference with work, school, or relationships",
      "E. Confirmation by prospective daily ratings during at least two symptomatic cycles (DRSP is gold standard)"
    ],
    treatment: [
      "SSRIs are first-line treatment (fluoxetine, sertraline, escitalopram)",
      "Can be dosed continuously or luteal-phase only",
      "Oral contraceptives containing drospirenone may help",
      "Lifestyle: regular exercise, stress reduction, adequate sleep, limit caffeine/alcohol"
    ]
  },
  pregnancy_mental_health: {
    name: "Perinatal Mental Health Guidelines",
    source: "ACOG Committee Opinion 757",
    screening: [
      "EPDS score ≥10 suggests possible depression - further evaluation needed",
      "EPDS score ≥13 indicates likely depression - refer to mental health provider",
      "EPDS question 10 (self-harm): Any score >0 requires immediate safety assessment"
    ],
    treatment: [
      "Untreated perinatal depression has risks: preterm birth, low birth weight, impaired bonding",
      "SSRIs are generally considered safe in pregnancy - discuss risks/benefits with provider",
      "Psychotherapy (CBT, IPT) is effective first-line for mild-moderate symptoms",
      "Postpartum: continue treatment for at least 6-12 months after remission"
    ]
  },
  postpartum: {
    name: "Postpartum Depression & Anxiety",
    source: "ACOG + Endocrine Society",
    screening: [
      "EPDS is gold standard for postpartum depression screening",
      "Screen at prenatal visit, 2-6 weeks postpartum, and throughout first year",
      "GAD-7 for anxiety screening (score ≥10 suggests moderate-severe anxiety)"
    ],
    symptoms: [
      "Baby blues: mood swings, tearfulness (days 3-5, resolves by 2 weeks)",
      "Postpartum depression: persistent sadness, guilt, inability to care for self/baby",
      "Postpartum anxiety: excessive worry about baby's health, racing thoughts, panic attacks",
      "Postpartum psychosis: rare emergency (delusions, hallucinations, confusion) - immediate psychiatric care needed"
    ]
  },
  menopause: {
    name: "Menopause & Perimenopause Mental Health",
    source: "North American Menopause Society + Endocrine Society",
    symptoms: [
      "Perimenopause: increased risk of depression even in women without prior history",
      "Vasomotor symptoms (hot flashes, night sweats) strongly associated with mood disturbances",
      "Sleep disruption from night sweats can worsen anxiety and depression",
      "Brain fog and memory complaints are common and distressing"
    ],
    treatment: [
      "HRT (hormone replacement therapy) can improve mood in perimenopausal women",
      "Transdermal estrogen may have lower risk profile than oral",
      "SSRIs/SNRIs effective for both mood and vasomotor symptoms",
      "Lifestyle: regular exercise, cognitive behavioral therapy, stress management"
    ]
  },
  cycle_tracking: {
    name: "Menstrual Cycle & Mental Health Connection",
    source: "Endocrine Society + ACOG",
    phases: [
      "Follicular phase (post-period to ovulation): estrogen rises, mood typically improves",
      "Ovulatory phase: peak estrogen, often best mood and energy",
      "Luteal phase (post-ovulation to period): progesterone dominates, serotonin drops - vulnerability window for PMDD/PME",
      "Menstrual phase: hormone withdrawal, symptoms typically improve after day 2-3"
    ],
    tracking_recommendations: [
      "Track daily for at least 2-3 cycles to identify patterns",
      "Note symptom timing relative to cycle phase (follicular vs luteal)",
      "DRSP (Daily Record of Severity of Problems) is validated for PMDD diagnosis",
      "Share tracked data with healthcare provider for informed treatment decisions"
    ]
  },
  red_flags: {
    name: "When to Seek Immediate Help",
    source: "Crisis Guidelines",
    emergency_symptoms: [
      "Suicidal thoughts or self-harm ideation: Contact crisis line (988 in US) or go to ER immediately",
      "Thoughts of harming baby (postpartum): Emergency psychiatric evaluation needed",
      "Psychosis symptoms (hallucinations, delusions, severe confusion): Medical emergency",
      "Inability to care for self or baby for >24 hours: Urgent evaluation needed"
    ],
    urgent_referral: [
      "PHQ-9 score ≥15 (moderate-severe depression)",
      "GAD-7 score ≥15 (moderate-severe anxiety)",
      "EPDS score ≥13 (likely postpartum depression)",
      "Any positive response on EPDS question 10 (self-harm)"
    ]
  }
};

function retrieveClinicalGuidelines(userContext) {
  const relevantGuidelines = [];
  if (userContext.cycleType === 'menstrual' || userContext.cycleType === 'perimenopause') {
    if (userContext.pmddSymptoms || userContext.lutealWorsening) {
      relevantGuidelines.push(CLINICAL_GUIDELINES.pmdd);
    }
    relevantGuidelines.push(CLINICAL_GUIDELINES.cycle_tracking);
  }
  if (userContext.cycleType === 'pregnancy') {
    relevantGuidelines.push(CLINICAL_GUIDELINES.pregnancy_mental_health);
  }
  if (userContext.cycleType === 'postpartum') {
    relevantGuidelines.push(CLINICAL_GUIDELINES.postpartum);
  }
  if (userContext.cycleType === 'menopause' || userContext.cycleType === 'perimenopause') {
    relevantGuidelines.push(CLINICAL_GUIDELINES.menopause);
  }
  if (userContext.highRiskScores) {
    relevantGuidelines.push(CLINICAL_GUIDELINES.red_flags);
  }
  return relevantGuidelines;
}

function formatGuidelinesForLLM(guidelines) {
  return guidelines.map(g => `
## ${g.name} (${g.source})
${g.criteria ? 'Criteria:\n- ' + g.criteria.join('\n- ') : ''}
${g.symptoms ? 'Symptoms:\n- ' + g.symptoms.join('\n- ') : ''}
${g.treatment ? 'Treatment:\n- ' + g.treatment.join('\n- ') : ''}
${g.screening ? 'Screening:\n- ' + g.screening.join('\n- ') : ''}
`.trim()).join('\n\n');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's complete history
    const cycles = await base44.entities.Cycle.filter({ user_id: user.id });
    const entries = await base44.entities.DailyEntry.filter({});
    
    // Filter entries for this user (by date matching cycle user_id)
    const userEntries = entries.filter(e => {
      const cycle = cycles.find(c => c.id === e.cycle_id);
      return cycle?.user_id === user.id;
    });

    // Analyze patterns
    const patterns = analyzeUserPatterns(cycles, userEntries, user);
    
    // Retrieve relevant clinical guidelines
    const guidelines = retrieveClinicalGuidelines(patterns);
    const guidelinesContext = formatGuidelinesForLLM(guidelines);
    
    // Generate 1-2 clinical insights
    const insights = generateClinicalInsights(patterns, guidelines);
    
    return Response.json({
      patterns,
      insights,
      guidelinesContext,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function analyzeUserPatterns(cycles, entries, user) {
  const now = new Date();
  const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
  
  // Get latest cycle
  const sortedCycles = [...cycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
  const latestCycle = sortedCycles[0];
  
  if (!latestCycle) {
    return { cycleType: user.cycle_type || 'menstrual', hasData: false };
  }
  
  // Calculate cycle day
  const cycleStart = new Date(latestCycle.start_date);
  const cycleDay = Math.floor((now - cycleStart) / (1000 * 60 * 60 * 24)) + 1;
  const cycleLength = latestCycle.cycle_length || 28;
  const ovulationDay = Math.round(cycleLength - 14);
  const isLuteal = cycleDay > ovulationDay && cycleDay <= cycleLength;
  const isFollicular = cycleDay <= ovulationDay;
  
  // Filter recent entries (last 90 days for pattern analysis)
  const recentEntries = entries.filter(e => {
    const entryDate = new Date(e.date);
    return entryDate >= twoYearsAgo && entryDate <= now;
  });
  
  // Calculate symptom patterns by phase
  const lutealSymptoms = [];
  const follicularSymptoms = [];
  
  recentEntries.forEach(entry => {
    const entryCycleDay = entry.cycle_day;
    const entryIsLuteal = entryCycleDay > ovulationDay && entryCycleDay <= cycleLength;
    
    // Collect symptoms
    const symptomKeys = [
      's_mood_swings', 's_irritability', 's_anxiety', 's_depression', 
      's_overwhelmed', 's_lethargic', 's_insomnia', 's_cravings',
      'p_nausea', 'p_fatigue', 'p_mood_changes',
      'pp_anxietyAboutBaby', 'pp_moodChanges', 'pp_fatigue',
      'm_hot_flashes', 'm_mood_swings', 'm_brain_fog', 'm_sleep_disturbance'
    ];
    
    symptomKeys.forEach(key => {
      if (entry[key] && entry[key] >= 4) { // Moderate-severe threshold
        if (entryIsLuteal) {
          lutealSymptoms.push(key);
        } else {
          follicularSymptoms.push(key);
        }
      }
    });
  });
  
  // Calculate mood scores
  const phq9Scores = recentEntries.filter(e => e.phq9_score).map(e => e.phq9_score);
  const gad7Scores = recentEntries.filter(e => e.gad7_score).map(e => e.gad7_score);
  const epdsScores = recentEntries.filter(e => e.epds_score).map(e => e.epds_score);
  
  const avgPHQ9 = phq9Scores.length ? phq9Scores.reduce((a, b) => a + b, 0) / phq9Scores.length : null;
  const avgGAD7 = gad7Scores.length ? gad7Scores.reduce((a, b) => a + b, 0) / gad7Scores.length : null;
  const avgEPDS = epdsScores.length ? epdsScores.reduce((a, b) => a + b, 0) / epdsScores.length : null;
  
  // Detect luteal worsening (PMDD pattern)
  const lutealWorsening = lutealSymptoms.length > follicularSymptoms.length * 1.5;
  
  // Extract journal entries for RAG
  const journalEntries = recentEntries
    .filter(e => e.journal_entry)
    .map(e => ({
      date: e.date,
      cycle_day: e.cycle_day,
      content: e.journal_entry
    }))
    .slice(-20); // Last 20 journal entries
  
  return {
    hasData: true,
    cycleType: latestCycle.cycle_type || user.cycle_type || 'menstrual',
    cycleDay,
    cycleLength,
    isLuteal,
    isFollicular,
    lutealWorsening,
    lutealSymptoms: getTopSymptoms(lutealSymptoms),
    follicularSymptoms: getTopSymptoms(follicularSymptoms),
    avgPHQ9,
    avgGAD7,
    avgEPDS,
    highRiskScores: avgPHQ9 >= 15 || avgGAD7 >= 15 || avgEPDS >= 13,
    totalEntries: recentEntries.length,
    journalEntries,
    latestCycle
  };
}

function getTopSymptoms(symptomList) {
  const counts = {};
  symptomList.forEach(s => {
    counts[s] = (counts[s] || 0) + 1;
  });
  
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([symptom, count]) => ({ symptom, count }));
}

function generateClinicalInsights(patterns, guidelines) {
  const insights = [];
  
  // Insight 1: PMDD pattern detection
  if (patterns.lutealWorsening && patterns.cycleType === 'menstrual') {
    insights.push({
      type: 'pmdd_pattern',
      title: 'Luteal Phase Mood Pattern Detected',
      content: `Your data shows symptoms worsen during your luteal phase (after ovulation). This pattern is consistent with PMDD or premenstrual exacerbation (PME). The DSM-5 requires prospective daily tracking for 2+ cycles to diagnose PMDD - you've logged ${patterns.totalEntries} days.`,
      guideline: 'DSM-5 PMDD Diagnostic Criteria',
      action: 'Track 2 more cycles with DRSP, then share this data with your psychiatrist to discuss luteal-phase SSRI dosing or other PMDD treatments.'
    });
  }
  
  // Insight 2: High mood scores
  if (patterns.highRiskScores) {
    const scoreType = patterns.avgPHQ9 >= 15 ? 'depression (PHQ-9)' : 
                      patterns.avgGAD7 >= 15 ? 'anxiety (GAD-7)' : 'postpartum depression (EPDS)';
    insights.push({
      type: 'high_risk',
      title: 'Elevated Mood Symptoms',
      content: `Your average ${scoreType} score suggests moderate-to-severe symptoms. This level of distress warrants clinical attention.`,
      guideline: 'When to Seek Immediate Help',
      action: 'Please contact your psychiatrist or healthcare provider within the next week to discuss treatment options. If you are having thoughts of self-harm, call 988 (US crisis line) immediately.'
    });
  }
  
  // Insight 3: Perimenopause mood changes
  if ((patterns.cycleType === 'perimenopause' || patterns.cycleType === 'menopause') && patterns.lutealSymptoms.length > 0) {
    insights.push({
      type: 'perimenopause',
      title: 'Perimenopausal Mood Changes',
      content: 'Perimenopause increases depression risk even in women without prior history. Your tracked symptoms (hot flashes, mood swings, sleep disruption) are interconnected - hormonal fluctuations affect serotonin and sleep quality.',
      guideline: 'Menopause & Perimenopause Mental Health',
      action: 'Discuss HRT options with your provider - transdermal estrogen may improve both vasomotor symptoms and mood. SSRIs can also help with both mood and hot flashes.'
    });
  }
  
  // Insight 4: Postpartum screening
  if (patterns.cycleType === 'postpartum' && patterns.avgEPDS >= 10) {
    insights.push({
      type: 'postpartum',
      title: 'Postpartum Mood Screening',
      content: `Your EPDS score suggests possible postpartum depression. This is common (1 in 7 women) and highly treatable. Untreated postpartum depression affects both you and your baby's wellbeing.`,
      guideline: 'Postpartum Depression & Anxiety',
      action: 'Contact your OB/GYN or a perinatal mental health specialist this week. Therapy (CBT/IPT) and/or medication can help you feel better. You deserve support.'
    });
  }
  
  // Insight 5: Tracking consistency
  if (patterns.totalEntries < 30 && patterns.cycleType === 'menstrual') {
    insights.push({
      type: 'tracking',
      title: 'Build Your Data Foundation',
      content: `You've logged ${patterns.totalEntries} days. For PMDD diagnosis and accurate pattern detection, aim for daily tracking across 2-3 complete cycles (60-90 days).`,
      guideline: 'Menstrual Cycle & Mental Health Connection',
      action: 'Set a daily reminder to log symptoms. The more consistent you are, the better insights Luna can provide and the more useful data you will have for your doctor.'
    });
  }
  
  // Limit to 1-2 insights per conversation
  return insights.slice(0, 2);
}