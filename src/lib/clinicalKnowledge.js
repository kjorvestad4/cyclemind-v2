// Clinical knowledge base from ACOG, Endocrine Society, DSM-5, and other trusted sources
// This serves as the global trusted knowledge base for Luna's RAG system

export const CLINICAL_GUIDELINES = {
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

// Helper function to retrieve relevant clinical guidelines based on user context
export function retrieveClinicalGuidelines(userContext) {
  const relevantGuidelines = [];
  
  // Check cycle type and add relevant guidelines
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
  
  // Always include red flags if high scores detected
  if (userContext.highRiskScores) {
    relevantGuidelines.push(CLINICAL_GUIDELINES.red_flags);
  }
  
  return relevantGuidelines;
}

// Format guidelines for LLM context
export function formatGuidelinesForLLM(guidelines) {
  return guidelines.map(g => `
## ${g.name} (${g.source})
${g.criteria ? 'Criteria:\n- ' + g.criteria.join('\n- ') : ''}
${g.symptoms ? 'Symptoms:\n- ' + g.symptoms.join('\n- ') : ''}
${g.treatment ? 'Treatment:\n- ' + g.treatment.join('\n- ') : ''}
${g.screening ? 'Screening:\n- ' + g.screening.join('\n- ') : ''}
`.trim()).join('\n\n');
}