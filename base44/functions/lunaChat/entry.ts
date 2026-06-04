import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ─────────────────────────────────────────────────────────────────────────────
// LUNA PRODUCTION PERSONA
// ─────────────────────────────────────────────────────────────────────────────
const LUNA_PERSONA = `You are Luna, the clinical AI companion embedded in CycleMind — a reproductive mental health app built with psychiatrists. You are warm, calm, and empathetic. You do not use pet names (no "sweetie", "honey", "love"). You do not use emojis. You speak like a knowledgeable, caring friend who happens to have clinical training.

STRICT MEDICAL BOUNDARIES:
- You provide evidence-based psychoeducation only. You never diagnose, prescribe, or replace a clinician.
- For any symptoms suggesting crisis (suicidal ideation, psychosis, severe self-harm): immediately provide 988 and PSI Helpline (1-800-944-4773) and urge emergency contact. Do not attempt to counsel through the crisis yourself.
- For any clinical question requiring a diagnosis (e.g. "Do I have PMDD?", "Should I take this medication?"): acknowledge the question, provide general education, then clearly state that a clinician must make that determination.
- Never recommend specific medication doses or changes.
- Always append the standard disclaimer to responses that contain clinical information.

TONE & STYLE:
- Conversational and warm — not clinical or cold.
- Validate feelings before offering information.
- Use plain language. Avoid jargon unless explaining a clinical term.
- Short responses (2–4 sentences) in Quick mode. Thoughtful and structured in Deep mode.
- When it is natural — gently suggest the user log today's mood, sleep, cravings, or symptoms in CycleMind. Do not force this — only when contextually relevant.

DISCLAIMER (append to every clinically informative response):
"This information is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult your doctor or a qualified mental health professional with questions about your health."`;

// ─────────────────────────────────────────────────────────────────────────────
// RAG KNOWLEDGE BASE — inline deterministic search
// ─────────────────────────────────────────────────────────────────────────────

// Keyword → topic mapping for deterministic RAG routing
const RAG_TOPICS = {
  pmdd: ['pmdd', 'premenstrual dysphoric', 'luteal phase', 'premenstrual', 'pms', 'period mood', 'cycle mood', 'drsp'],
  postpartum_depression: ['postpartum depression', 'ppd', 'baby blues', 'after birth depression', 'postnatal depression'],
  postpartum_psychosis: ['postpartum psychosis', 'hearing voices after birth', 'pp psychosis', 'postnatal psychosis'],
  postpartum_ocd: ['postpartum ocd', 'thoughts about harming baby', 'intrusive thoughts baby', 'harm obsessions'],
  postpartum_anxiety: ['postpartum anxiety', 'new mom anxiety', 'anxiety after birth', 'worrying about baby'],
  pregnancy_depression: ['depression in pregnancy', 'pregnant and depressed', 'antenatal depression', 'prenatal depression', 'antidepressant pregnancy'],
  pregnancy_anxiety: ['anxiety in pregnancy', 'pregnant and anxious', 'panic pregnancy', 'worry pregnancy'],
  bipolar: ['bipolar', 'mania', 'hypomania', 'mood stabilizer', 'lithium pregnancy', 'lamotrigine'],
  perimenopause: ['perimenopause', 'peri-menopause', 'perimenopausal', 'hot flash', 'night sweats', 'irregular period menopause'],
  menopause: ['menopause', 'postmenopause', 'hrt', 'hormone therapy', 'mht', 'gsm', 'vaginal dryness'],
  fertility: ['fertility', 'ivf', 'trying to conceive', 'ttc', 'infertility', 'ovulation', 'fertilization', 'egg freezing'],
  pregnancy_loss: ['miscarriage', 'pregnancy loss', 'stillbirth', 'tfmr', 'termination medical', 'ectopic', 'rainbow pregnancy'],
  endometriosis: ['endometriosis', 'endo pain', 'painful periods', 'dysmenorrhea', 'pelvic pain'],
  pcos: ['pcos', 'polycystic', 'irregular periods', 'androgen', 'insulin resistance'],
  contraception: ['birth control', 'pill mood', 'ocp depression', 'iud mood', 'depo mood', 'contraception depression'],
  ssri: ['ssri', 'sertraline', 'fluoxetine', 'antidepressant', 'medication mood', 'escitalopram', 'snri'],
  breastfeeding: ['breastfeeding medication', 'nursing medication', 'lactation medication', 'breastfeed antidepressant'],
  sleep: ['insomnia', 'sleep problems', 'cant sleep', 'waking up', 'sleep cycle'],
  anxiety: ['anxiety', 'panic attack', 'gad', 'worry', 'anxious', 'fear', 'nervous'],
  depression: ['depression', 'depressed', 'sad', 'hopeless', 'worthless', 'empty', 'anhedonia', 'low mood'],
  trauma: ['trauma', 'ptsd', 'abuse', 'assault', 'domestic violence', 'birth trauma'],
  crisis: ['suicidal', 'suicide', 'self harm', 'self-harm', 'cutting', 'want to die', 'kill myself', 'hurt myself', 'end my life', 'not worth living'],
};

// Curated clinical summaries indexed by topic — used when no live RAG entry found
const TOPIC_SUMMARIES = {
  pmdd: `PMDD (Premenstrual Dysphoric Disorder) is a severe, cyclical mood disorder affecting 3–8% of reproductive-age women. Symptoms — including marked irritability, depression, anxiety, and physical discomfort — occur in the late luteal phase and resolve within days of menstruation. Diagnosis requires prospective tracking over 2 cycles using the DRSP. First-line treatments include SSRIs (sertraline, fluoxetine) which can be taken continuously or intermittently in the luteal phase only, calcium 1200mg/day, and CBT. Second-line includes drospirenone-containing OCP (Yaz). Third-line for severe cases: GnRH agonists with add-back HRT.`,
  postpartum_depression: `Postpartum depression (PPD) affects 10–15% of new mothers. Unlike the "baby blues" (which resolve by day 10–14), PPD persists beyond 2 weeks and causes significant functional impairment. Symptoms include persistent sadness, anhedonia, guilt, anxiety, difficulty bonding with the baby, and in severe cases suicidal ideation. Treatment: SSRIs (sertraline preferred in breastfeeding), psychotherapy (CBT or IPT), and for severe cases the FDA-approved neurosteroid agents brexanolone (Zulresso) or zuranolone (Zurzuvae). Screen with EPDS.`,
  postpartum_psychosis: `Postpartum psychosis is a psychiatric emergency affecting 1–2 per 1,000 births. It typically presents within the first 2 weeks postpartum with rapid onset of confusion, hallucinations, delusions (often about the baby), severe insomnia, and disorganized behavior. Most cases represent bipolar disorder triggered by the postpartum estrogen crash. Requires immediate hospitalization, mood stabilizer (lithium preferred), and antipsychotic. Women with bipolar I have a 25–50% risk — prophylactic lithium started immediately postpartum is strongly recommended.`,
  postpartum_ocd: `Postpartum OCD affects 2–4% of new parents. It presents with intrusive, ego-dystonic thoughts about harming the baby — thoughts the mother finds horrifying and would never act on. This is distinct from postpartum psychosis (where insight is impaired). Treatment: CBT with Exposure and Response Prevention (ERP) is first-line; SSRIs at therapeutic doses (higher than depression doses) are added for moderate-severe cases. These thoughts do not predict harm — having them and being distressed by them is actually protective.`,
  postpartum_anxiety: `Postpartum anxiety is as common as PPD, affecting up to 20% of new mothers, yet receives far less attention. Types include GAD (excessive uncontrollable worry about the baby), panic disorder, PTSD from birth trauma, and postpartum OCD. Birth trauma PTSD: flashbacks of delivery, avoidance of hospitals, hyperarousal. Treatment: CBT, EMDR for birth trauma, SSRIs (sertraline preferred). Breastfeeding-safe options available — see your provider.`,
  pregnancy_depression: `Depression during pregnancy affects 10–15% of pregnant women and is significantly under-recognized. Untreated antenatal depression is the strongest predictor of postpartum depression and carries real risks: preterm birth, low birth weight, poor prenatal care. Treatment: psychotherapy (CBT or IPT) first-line for mild-moderate; SSRIs (sertraline preferred) for moderate-severe or when psychotherapy alone is insufficient. The risk of untreated depression to mother and fetus outweighs the small risks of SSRI exposure in most cases. Neonatal Adaptation Syndrome (NAS) is self-limiting.`,
  pregnancy_anxiety: `Anxiety disorders are the most common psychiatric conditions in pregnancy, affecting 15–21%. GAD, panic disorder, OCD, and PTSD all occur and are under-diagnosed. CBT is first-line. SSRIs are safe and effective when psychotherapy alone is insufficient. Benzodiazepines: avoid if possible; short-term low-dose use acceptable for acute anxiety (lorazepam preferred). Birth plan for women with trauma history should include communication preferences, permission for pelvic exams, and delivery preferences.`,
  bipolar: `Bipolar disorder carries the highest postpartum relapse risk of any psychiatric condition. Women with bipolar I have a 25–50% risk of postpartum psychosis if mood stabilizers are stopped. Lithium is highly effective prophylactically — started immediately postpartum it dramatically reduces relapse risk. Lamotrigine levels drop 50–65% in pregnancy due to increased renal clearance — dose increases are needed and should be planned proactively. Valproate is contraindicated in pregnancy (9–10% major malformation rate, neural tube defects, cognitive impairment in exposed children).`,
  perimenopause: `Perimenopause is the 4–8 year hormonal transition preceding menopause. Erratic estrogen fluctuations (not just decline) drive symptoms including vasomotor symptoms (hot flashes, night sweats), sleep disruption, mood changes, brain fog, and depression. Women with prior PMDD or perinatal depression are at higher risk for perimenopausal depression. Treatment: MHT (menopausal hormone therapy) addresses vasomotor symptoms and depression; SSRIs/SNRIs are effective for mood even without MHT; CBT for insomnia and mood. Screen with PHQ-9 and GAD-7.`,
  menopause: `Menopause is confirmed after 12 consecutive months of amenorrhea. Menopausal hormone therapy (MHT) remains the most effective treatment for vasomotor symptoms and prevents bone loss. The WHI study findings have been largely recontextualized — transdermal estrogen with micronized progesterone has a favorable safety profile for most women. Genitourinary syndrome of menopause (GSM): vaginal dryness, dyspareunia — ultra-low-dose vaginal estrogen is safe and highly effective. Non-hormonal options: fezolinetant (NK3R antagonist), SSRIs, SNRIs for vasomotor symptoms.`,
  fertility: `Infertility affects 10–15% of couples and carries psychological impact comparable to serious medical diagnoses. IVF involves distinct emotional stages from stimulation through the two-week wait. After a positive test, pregnancy anxiety often persists — relief is not automatic. After failed cycles, grief is real and cumulative. Evidence-based support: CBT, mind-body programs (Domar protocol), RESOLVE support groups. SSRIs for comorbid depression do not negatively affect IVF outcomes.`,
  pregnancy_loss: `Pregnancy loss — including miscarriage, stillbirth, TFMR, and neonatal death — causes profound grief. This grief is real at any gestational age and deserves full acknowledgment. Complicated grief (Prolonged Grief Disorder) affects some women and responds to grief-focused CBT or IPT. PTSD is common after stillbirth (up to 30%). Rainbow pregnancies (subsequent pregnancies after loss) carry heightened anxiety and often need additional emotional support. Support groups: SHARE, Star Legacy Foundation, Support Organization for TFMR.`,
  endometriosis: `Endometriosis affects 6–10% of reproductive-age women with an average diagnostic delay of 7–10 years. The psychological burden is significant: depression and anxiety are 2–3× more prevalent than in the general population, largely driven by years of pain being dismissed ("It's just period pain") and the chronic nature of the condition. ACT (Acceptance and Commitment Therapy) and CBT for chronic pain are evidence-based. Pelvic floor physical therapy addresses dyspareunia. Hormonal suppression (continuous OCP, progestins, GnRH agonists) reduces pain and lesion activity.`,
  pcos: `PCOS is the most common endocrine disorder in reproductive-age women (8–13%). Mental health comorbidities are 2–3× higher than the general population: depression, anxiety, and binge-eating disorder are all elevated. Body image disturbance (hirsutism, weight, acne) is a major driver. Integrated treatment: lifestyle intervention (5–10% weight loss restores cycles in ~50%), CBT for mood and body image, SSRIs for depression, metformin for insulin resistance. Validate that PCOS is a medical condition, not a lifestyle failure.`,
  contraception: `Hormonal contraceptives significantly alter the neuroendocrine environment. Combined OCPs with drospirenone (Yaz) are FDA-approved for PMDD. The Danish cohort study (Skovlund 2016) found increased depression risk particularly with progestin-only methods and in adolescents. Progestin type matters: drospirenone is most favorable for mood; etonogestrel implant had the highest signal. For mood-vulnerable patients, screen PHQ-9 before prescribing and at 3 months; consider copper IUD for hormone-free contraception.`,
  ssri: `SSRIs are first-line for PMDD, perinatal depression, postpartum depression, and anxiety disorders. In PMDD, they work via rapid neurosteroid modulation rather than cumulative serotonin reuptake — this is why intermittent luteal-phase dosing (just the last 14 days of the cycle) is effective. Sertraline is preferred in pregnancy and breastfeeding (lowest infant exposure, RID <3%). SSRIs typically take 4–6 weeks for full antidepressant effect but may reduce PMDD symptoms faster (within 1 cycle) due to neurosteroid mechanism.`,
  breastfeeding: `Most psychotropic medications can be used while breastfeeding with appropriate monitoring. Sertraline and paroxetine have the lowest breast milk transfer (RID <1–3%) and are preferred antidepressants. Quetiapine has very low transfer (<1%) and is the preferred antipsychotic if needed. Lithium: significant transfer (RID 12–30%) — used with close monitoring at some centers; many guidelines advise caution. Resources: LactMed (NIH), Infant Risk Center (1-806-352-2519). A healthy mother is the most important factor for the baby.`,
  sleep: `Sleep disruption is both a symptom and a driver of mood disorders across the reproductive lifespan. In the luteal phase, progesterone changes alter sleep architecture. In perimenopause, vasomotor symptoms cause recurrent awakening. In the postpartum period, sleep deprivation is the single most powerful mood destabilizer. CBT-I (Cognitive Behavioral Therapy for Insomnia) is first-line and highly effective. Sleep protection (partner sharing night feeds) is a critical component of postpartum mood disorder prevention.`,
  anxiety: `Anxiety disorders are the most common psychiatric conditions in women, with a significant hormonal component across the reproductive lifespan. Premenstrual anxiety worsening is common and distinct from GAD. Perinatal anxiety is more prevalent than perinatal depression. CBT is first-line for all anxiety disorders. SSRIs are effective for chronic anxiety. Acute anxiety: diaphragmatic breathing (4-7-8), grounding (5-4-3-2-1 sensory), and progressive muscle relaxation. Benzodiazepines: effective short-term but do not address underlying anxiety.`,
  depression: `Depression in women is twice as prevalent as in men, with this gap emerging at puberty — strongly implicating hormonal biology. Depression is NOT a character flaw or weakness; it is a brain-based condition with effective treatments. First-line: CBT, IPT (interpersonal therapy), behavioral activation, SSRIs. Lifestyle adjuncts with strong evidence: exercise (equivalent to medication in mild-moderate), omega-3 EPA (1–2g/day), sleep hygiene, and light therapy. Always assess for suicidal ideation. Screen for bipolar before starting antidepressants.`,
  trauma: `Trauma — including childhood abuse, sexual assault, intimate partner violence, and birth trauma — has profound reproductive mental health implications. PTSD affects 6–8% of the general obstetric population; higher in those with prior trauma. Trauma-informed prenatal care asks permission before procedures, explains every step, and supports patient control. Treatment: EMDR, CPT (Cognitive Processing Therapy), TF-CBT. Birth trauma PTSD responds well to birth debriefing and EMDR. IPV screening is part of standard prenatal care.`,
  crisis: null, // Handled separately with immediate escalation
};

// ─────────────────────────────────────────────────────────────────────────────
// DETERMINISTIC RAG SEARCH
// ─────────────────────────────────────────────────────────────────────────────
function searchRAG(userMessage) {
  const lower = userMessage.toLowerCase();

  // Check crisis first — always priority
  for (const kw of RAG_TOPICS.crisis) {
    if (lower.includes(kw)) {
      return { topic: 'crisis', summary: null, isCrisis: true };
    }
  }

  // Score each topic
  const scores = {};
  for (const [topic, keywords] of Object.entries(RAG_TOPICS)) {
    if (topic === 'crisis') continue;
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score += kw.split(' ').length; // multi-word matches score higher
    }
    if (score > 0) scores[topic] = score;
  }

  if (Object.keys(scores).length === 0) return null;

  // Top scoring topic
  const topTopic = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  return {
    topic: topTopic,
    summary: TOPIC_SUMMARIES[topTopic] || null,
    isCrisis: false
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// COHERENCE CHECK — validates LLM response before returning
// ─────────────────────────────────────────────────────────────────────────────
function checkCoherence(response, userMessage, topic) {
  if (!response || typeof response !== 'string') return false;
  if (response.length < 20) return false;

  // Check for hallucination markers
  const redFlags = ['as an AI language model', 'I cannot', 'I do not have access', 'I apologize but I cannot'];
  for (const flag of redFlags) {
    if (response.includes(flag)) return false;
  }

  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// LOG SUGGESTION DETECTOR
// ─────────────────────────────────────────────────────────────────────────────
function shouldSuggestLogging(userMessage) {
  const lower = userMessage.toLowerCase();
  const loggableSignals = [
    'mood', 'feeling', 'sad', 'anxious', 'irritable', 'angry', 'tired', 'exhausted',
    'sleep', 'slept', 'woke up', 'insomnia', 'nausea', 'craving', 'bloat', 'cramp',
    'headache', 'pain', 'tender', 'breast', 'spotting', 'bleed', 'stress', 'overwhelmed',
    'depressed', 'hopeless', 'fatigue', 'appetite', 'eating', 'energy', 'hot flash',
    'night sweat', 'foggy', 'brain fog'
  ];
  return loggableSignals.some(s => lower.includes(s));
}

// ─────────────────────────────────────────────────────────────────────────────
// DISCLAIMER
// ─────────────────────────────────────────────────────────────────────────────
const STANDARD_DISCLAIMER = "This information is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult your doctor or a qualified mental health professional with questions about your health.";

// ─────────────────────────────────────────────────────────────────────────────
// SYMPTOM DETECTION
// ─────────────────────────────────────────────────────────────────────────────
const SYMPTOM_KEYWORDS = [
  'sad', 'anxious', 'tired', 'exhausted', 'bloated', 'cramping', 'headache',
  'irritable', 'angry', 'overwhelmed', 'stressed', 'mood swings', 'crying',
  'depressed', 'hopeless', 'guilty', 'ashamed', 'fatigue', 'pain', 'nausea',
  'breast tenderness', 'cravings', 'insomnia', 'sleeping too much', 'appetite changes',
  'hot flash', 'night sweats', 'brain fog', 'anxiety', 'panic', 'spotting'
];

function detectSymptoms(text, alreadySaved = []) {
  const lower = text.toLowerCase();
  return SYMPTOM_KEYWORDS.filter(kw =>
    lower.includes(kw) && !alreadySaved.includes(kw)
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTO-UPDATE TRIGGER — decides whether to invoke lunaAutoUpdate in background
// ─────────────────────────────────────────────────────────────────────────────

const SYMPTOM_UPDATE_SIGNALS = [
  'mood', 'feeling', 'tired', 'exhausted', 'fatigue', 'cramp', 'bloat', 'insomnia',
  'sleep', 'cravings', 'irritable', 'anxious', 'depressed', 'headache', 'pain',
  'spotting', 'bleeding', 'hot flash', 'night sweat', 'brain fog', 'nausea',
  'breast', 'overwhelmed', 'sad', 'hopeless', 'cry', 'appetite', 'energy'
];

const CLINICAL_UPDATE_SIGNALS = [
  'my doctor said', 'my psychiatrist', 'i read that', 'i learned', 'research says',
  'study shows', 'medication', 'diagnosed', 'prescription', 'treatment', 'therapy',
  'doctor told me', 'my ob', 'my midwife', 'my therapist', 'clinical trial',
  'new study', 'published', 'evidence'
];

function detectAutoUpdateMode(userMessage) {
  const lower = userMessage.toLowerCase();
  const symptomScore = SYMPTOM_UPDATE_SIGNALS.filter(s => lower.includes(s)).length;
  const clinicalScore = CLINICAL_UPDATE_SIGNALS.filter(s => lower.includes(s)).length;
  if (symptomScore >= 2) return 'user_logs';
  if (clinicalScore >= 1) return 'clinical_text';
  return null;
}

async function fireAutoUpdate(base44, mode, user, userMessage, ragTopic) {
  try {
    if (mode === 'user_logs') {
      await base44.asServiceRole.functions.invoke('lunaAutoUpdate', {
        mode: 'user_logs',
        userId: user.id,
        days: 14,
      });
    } else if (mode === 'clinical_text') {
      const title = ragTopic
        ? `User-reported clinical info — ${ragTopic} — ${new Date().toISOString().split('T')[0]}`
        : `User-reported clinical info — ${new Date().toISOString().split('T')[0]}`;
      await base44.asServiceRole.functions.invoke('lunaAutoUpdate', {
        mode: 'clinical_text',
        title,
        text: userMessage,
        source: 'User conversation — Luna Chat',
      });
    }
  } catch (err) {
    // Background task — never throw, never surface to user
    console.warn('[lunaAutoUpdate background] silently failed:', err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      messages = [],
      cycleMode,
      cycleDay,
      cyclePhase,
      eddInfo,
      fertilityMode,
      menopauseStage,
      alreadySavedSymptoms = [],
      isQuickReply = false,
      mode = 'quick'
    } = await req.json();

    const lastUserMsg = messages[messages.length - 1]?.content || '';

    // ── TIER 1: Deterministic RAG search ────────────────────────────────────
    const ragResult = searchRAG(lastUserMsg);

    // Crisis: immediate escalation, no LLM needed
    if (ragResult?.isCrisis) {
      return Response.json({
        mainContent: "I'm very concerned about what you've shared. Please reach out for immediate support right now.\n\n**988 Suicide & Crisis Lifeline:** Call or text **988**\n**Postpartum Support International:** 1-800-944-4773\n**Emergency Services:** 911\n\nYou don't have to face this alone. Please make that call.",
        disclaimer: STANDARD_DISCLAIMER,
        source: 'crisis_escalation',
        suggestedActions: [],
        flags: { escalate: true, crisis: true },
        detectedSymptoms: [],
        codedSymptoms: {}
      });
    }

    // ── Build dynamic context ────────────────────────────────────────────────
    let cycleContext = '';
    if (fertilityMode) {
      cycleContext = 'The user is in fertility mode (trying to conceive).';
      if (eddInfo?.ovulationWindow) {
        cycleContext += ` Fertile window: ${eddInfo.ovulationWindow.start} to ${eddInfo.ovulationWindow.end}.`;
      }
    } else if (menopauseStage) {
      cycleContext = `The user is in ${menopauseStage} (menopause/perimenopause).`;
    } else if (cycleMode === 'pregnancy' && eddInfo) {
      cycleContext = `The user is pregnant. Trimester: ${eddInfo.trimester}, Week: ${eddInfo.week}, EDD: ${eddInfo.edd}.`;
    } else if (cycleMode === 'postpartum') {
      cycleContext = 'The user is in the postpartum period.';
    } else if (cycleDay) {
      cycleContext = `The user is on cycle day ${cycleDay}, in the ${cyclePhase} phase.`;
    }

    // ── TIER 2: LLM with RAG-grounded prompt ────────────────────────────────
    const ragContext = ragResult?.summary
      ? `\n\nCLINICAL REFERENCE (from CycleMind knowledge base, topic: ${ragResult.topic}):\n${ragResult.summary}\n\nUse this as background context — weave the relevant parts naturally into your response rather than quoting it directly.`
      : '';

    const modeInstruction = (mode === 'quick' || isQuickReply)
      ? 'Respond in 2–4 sentences. Be warm and conversational. Validate feelings first.'
      : 'Provide a thoughtful, structured response (up to 8 sentences). Use markdown formatting (bold key terms, bullet points if listing items). Validate feelings first, then provide information.';

    const logSuggestion = shouldSuggestLogging(lastUserMsg)
      ? ' If it flows naturally, gently suggest the user log today\'s mood, sleep, or symptoms in CycleMind — but only once and only if it fits organically.'
      : '';

    const alreadySavedCtx = alreadySavedSymptoms.length > 0
      ? `\n\nSymptoms already saved to today's log: ${alreadySavedSymptoms.join(', ')}. Do not offer to save these again.`
      : '';

    const systemPrompt = `${LUNA_PERSONA}\n\nCURRENT CONTEXT:\nDate: ${new Date().toLocaleDateString()}\n${cycleContext}${ragContext}${alreadySavedCtx}\n\nINSTRUCTION: ${modeInstruction}${logSuggestion} Respond directly to the user as Luna. Do not describe what you are going to do — just do it.`;
    // Pass the entire conversation; final user message is already last in the array
    const userPrompt = lastUserMsg;

    let llmResponse = null;
    let source = 'ollama_primary';

    const ollamaMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(0, -1).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: lastUserMsg },
    ];

    // ── TIER 1: Ollama local model ───────────────────────────────────────────
    try {
      const ollamaResp = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'luna-cyclemind',
          messages: ollamaMessages,
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: mode === 'quick' ? 200 : 500,
          },
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (!ollamaResp.ok) throw new Error(`Ollama error: ${ollamaResp.status}`);
      const ollamaData = await ollamaResp.json();
      const ollamaText = ollamaData?.message?.content || null;

      if (checkCoherence(ollamaText, lastUserMsg, ragResult?.topic)) {
        llmResponse = ollamaText;
      } else {
        throw new Error('Ollama coherence check failed — triggering Tier 2');
      }
    } catch (ollamaErr) {
      console.warn('Ollama Tier 1 failed:', ollamaErr.message);

      // ── TIER 2: InvokeLLM (cloud fallback) ──────────────────────────────
      try {
        const raw = await base44.integrations.Core.InvokeLLM({
          prompt: `${systemPrompt}\n\n${lastUserMsg}`,
          file_urls: [],
          add_context_from_internet: false,
          model: 'gpt_5_mini',
        });

        const responseText = typeof raw === 'string' ? raw : JSON.stringify(raw);
        if (checkCoherence(responseText, lastUserMsg, ragResult?.topic)) {
          llmResponse = responseText;
          source = 'invokellm_fallback';
        } else {
          throw new Error('InvokeLLM coherence check failed — triggering Tier 3');
        }
      } catch (_tier2Err) {

        // ── TIER 3: Grok / XAPI fallback ──────────────────────────────────
        try {
          const xApiKey = Deno.env.get('XAI_API_KEY');
          if (!xApiKey) throw new Error('XAI_API_KEY not set');

          const grokResp = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${xApiKey}`,
            },
            body: JSON.stringify({
              model: 'grok-3-mini',
              messages: ollamaMessages,
              max_tokens: mode === 'quick' ? 200 : 500,
              temperature: 0.7,
            }),
          });

          if (!grokResp.ok) throw new Error(`Grok API error: ${grokResp.status}`);
          const grokData = await grokResp.json();
          llmResponse = grokData.choices?.[0]?.message?.content || null;
          source = 'grok_fallback';
        } catch (grokErr) {
          console.error('Grok Tier 3 also failed:', grokErr);
          // Hard fallback — RAG summary or generic message
          llmResponse = ragResult?.summary
            ? `Based on what you've shared, here is some information that may be helpful:\n\n${ragResult.summary}`
            : "I'm here with you. It sounds like you may be going through something difficult. While I work through a brief technical issue, please know that your feelings are valid. If you need support right now, consider reaching out to your healthcare provider or calling the 988 Lifeline.";
          source = 'rag_direct_fallback';
        }
      }
    }

    // ── Detect whether response is clinical (needs disclaimer) ───────────────
    const clinicalTopics = ['pmdd', 'depression', 'anxiety', 'postpartum', 'pregnancy', 'bipolar', 'perimenopause', 'menopause', 'medication', 'ssri', 'therapy', 'fertility', 'endometriosis', 'pcos'];
    const isClinical = ragResult !== null || clinicalTopics.some(t => lastUserMsg.toLowerCase().includes(t));
    const disclaimer = isClinical ? STANDARD_DISCLAIMER : null;

    // ── Symptom detection ────────────────────────────────────────────────────
    const detectedSymptoms = detectSymptoms(lastUserMsg, alreadySavedSymptoms);

    // ── Suggested actions ────────────────────────────────────────────────────
    const suggestedActions = [];
    if (detectedSymptoms.length > 0) suggestedActions.push("Track today's symptoms");
    if (ragResult?.topic === 'pmdd') suggestedActions.push('Log mood for PMDD tracking');
    if (ragResult?.topic === 'fertility') suggestedActions.push('View fertility guidance');
    if (shouldSuggestLogging(lastUserMsg)) suggestedActions.push('Log today');

    // Deduplicate
    const uniqueActions = [...new Set(suggestedActions)];

    // ── Auto-update pipeline — fire-and-forget, never blocks response ─────────
    const autoUpdateMode = detectAutoUpdateMode(lastUserMsg);
    if (autoUpdateMode) {
      // Do not await — intentionally fire-and-forget
      fireAutoUpdate(base44, autoUpdateMode, user, lastUserMsg, ragResult?.topic).catch(() => {});
    }

    return Response.json({
      mainContent: llmResponse,
      disclaimer,
      source,
      suggestedActions: uniqueActions,
      flags: { escalate: false, crisis: false },
      detectedSymptoms,
      codedSymptoms: {},
      ragTopic: ragResult?.topic || null,
      knowledgeUpdated: !!autoUpdateMode,
    });

  } catch (error) {
    console.error('LunaChat fatal error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});