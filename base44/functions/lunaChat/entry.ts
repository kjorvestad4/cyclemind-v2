import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ─────────────────────────────────────────────────────────────────────────────
// LUNA PRODUCTION PERSONA
// ─────────────────────────────────────────────────────────────────────────────
const LUNA_PERSONA = [
  "You are Luna, a proactive clinical superagent for women's mental health inside CycleMind.",
  "CycleMind was built by three psychiatrists to help women track and understand PMDD, menstrual cycles, pregnancy, postpartum, and perimenopause.",
  "",
  "Core Rules:",
  "- NEVER use pet names. Address the user simply as 'you'.",
  "- Be warm, validating, and sister-like in support. Short sentences — brain-fog-friendly.",
  "- Be hopeful but evidence-based.",
  "- Use simple, clear language.",
  "- Emojis: use 🌙 💚 💙 sparingly (teal/green/blue only). Never diagnose — defer to providers.",
  "",
  "Response Style:",
  "- For factual or analytical questions, be direct and concise — start with the facts, no unnecessary empathy openers.",
  "- For emotional or supportive queries, use warm empathy.",
  "- When you have user data context (cycle day, phase, symptoms), reference it specifically (e.g., 'Your bloating tends to peak in the luteal phase...').",
  "- Include 1–2 clinical insights from RAG context when available. Do NOT cite source names (e.g. DSM-5, ACOG, Endocrine Society) inline in your response text — references are appended automatically as clickable links at the bottom.",
  "- Use context flags (fertilityMode, menopauseStage, cycleDay) to personalize every response.",
  "",
  "Medical Boundaries:",
  "- You are NOT a doctor, psychiatrist, or therapist.",
  "- You cannot diagnose or prescribe.",
  "- For medication questions, use educational language: 'Common options that patients often discuss with their doctor include...' or 'According to guidelines, the following are frequently considered...'",
  "- Never volunteer specific supplement or medication dosages. If directly asked about calcium, you may say 'studies have explored doses in the 1000–1200 mg/day elemental calcium range' but must immediately follow with 'Discuss the right dose and any needed bloodwork with your clinician.'",
  "- Do NOT append any disclaimer sentence at the end of your responses. A disclaimer is already shown separately in the UI.",
  "",
  "CycleMind Integration:",
  "- Suggest logging mood, sleep, cravings, or symptoms only when it feels natural and helpful — never automatically in every response.",
  "- Recognize cycle-phase patterns when described.",
  "- Offer insights only from the user's own logged data + the RAG + wiki layer.",
  "- Suggest generating a Clinical Report when the user discusses symptoms with their provider or asks about patterns.",
  "- When a user wants to adjust their cycle settings, luteal phase, or PMDD window, suggest the action 'Customize my cycle' which deep-links to the Cycle Profile Settings screen.",
  "",
  "Emergency Protocol:",
  "- If the user mentions self-harm, suicide, harming baby, or psychosis → provide the 988 crisis line and urge emergency care immediately.",
].join('\n');

// ─────────────────────────────────────────────────────────────────────────────
// PSYCH TEST MODE
// ─────────────────────────────────────────────────────────────────────────────
const PSYCH_TEST_FOOTER = [
  "",
  "--- PSYCH TEST MODE ---",
  "Feedback requested: Rate tone (1-5), personalization (1-5), safety/clinical feel. Any suggested changes?",
].join('\n');

function resolveTestMode(messages) {
  // Walk through all messages to determine current test mode state
  let active = false;
  for (const msg of messages) {
    if (msg.role !== 'user') continue;
    const lower = (msg.content || '').toLowerCase().trim();
    if (lower.includes('enter test mode') || lower.includes('psychtestmode') || lower.startsWith('i am testing in psychtestmode')) {
      active = true;
    }
    if (lower.includes('exit test mode')) {
      active = false;
    }
  }
  return active;
}

// ─────────────────────────────────────────────────────────────────────────────
// RAG KNOWLEDGE BASE — inline deterministic search
// ─────────────────────────────────────────────────────────────────────────────

const RAG_TOPICS = {
  pmdd: ['pmdd', 'premenstrual dysphoric', 'luteal phase', 'premenstrual', 'pms', 'period mood', 'cycle mood', 'drsp', 'before my period', 'before period', 'right before period', 'week before period', 'days before period'],
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
  calcium: ['calcium supplement', 'calcium pmdd', 'supplement for pms', 'vitamin supplement pmdd', 'non-medication pmdd', 'non-pharma pmdd'],
  contraception: ['birth control', 'pill mood', 'ocp depression', 'iud mood', 'depo mood', 'contraception depression'],
  ssri: ['ssri', 'sertraline', 'fluoxetine', 'antidepressant', 'medication mood', 'escitalopram', 'snri'],
  breastfeeding: ['breastfeeding medication', 'nursing medication', 'lactation medication', 'breastfeed antidepressant'],
  sleep: ['insomnia', 'sleep problems', 'cant sleep', 'waking up', 'sleep cycle'],
  anxiety: ['anxiety', 'panic attack', 'gad', 'worry', 'anxious', 'fear', 'nervous'],
  depression: ['depression', 'depressed', 'sad', 'hopeless', 'worthless', 'empty', 'anhedonia', 'low mood'],
  trauma: ['trauma', 'ptsd', 'abuse', 'assault', 'domestic violence', 'birth trauma'],
  crisis: ['suicidal', 'suicide', 'self harm', 'self-harm', 'cutting', 'want to die', 'kill myself', 'hurt myself', 'end my life', 'not worth living', 'harming baby', 'harm my baby'],
  // ── NEW TOPICS from updated Obsidian wiki ──
  adhd: ['adhd', 'attention deficit', 'add', 'stimulant', 'methylphenidate', 'concerta', 'adderall', 'vyvanse', 'executive function', 'focus difficulty', 'disorganized', 'cant concentrate', 'procrastination'],
  substance_use: ['substance use', 'alcohol pregnancy', 'cannabis pregnancy', 'weed pregnancy', 'opioid', 'addiction', 'buprenorphine', 'methadone', 'drug use pregnancy', 'drinking while pregnant', 'naloxone', 'drinking alcohol', 'alcohol and pregnancy', 'alcohol while pregnant', 'using drugs', 'drug addiction', 'cannabis while pregnant'],
  schizophrenia: ['schizophrenia', 'antipsychotic', 'quetiapine', 'olanzapine', 'risperidone', 'hallucinations', 'delusions', 'psychotic', 'clozapine', 'aripiprazole'],
  infant_mental_health: ['infant mental health', 'bonding with baby', 'bonding', 'attachment', 'parent-infant', 'mother-baby bond', 'baby bonding', 'circle of security', 'dyadic therapy', 'not bonding', 'cant bond', 'cant connect with baby', 'bond with my baby'],
  integrative: ['exercise depression', 'omega-3', 'omega 3', 'fish oil', 'meditation', 'mindfulness', 'prenatal yoga', 'light therapy', 'nutrition mental health', 'lifestyle depression', 'integrative approach', 'mediterranean diet', 'natural remedies', 'vitamins for mood', 'supplements for mood'],
  menarche: ['menarche', 'first period', 'puberty', 'adolescent', 'teenager mood', 'teen cycle', 'young girl period', 'early puberty', 'teen menstrual'],
  menstrual_suppression: ['menstrual suppression', 'stop my period', 'stop period', 'continuous pill', 'skip period', 'skip my period', 'amenorrhea', 'eliminate period', 'no period', 'continuous birth control', 'skip placebo', 'stop having periods', 'get rid of my period'],
  prenatal_stress: ['prenatal stress', 'stress during pregnancy', 'fetal programming', 'cortisol pregnancy', 'pregnancy stress baby', 'intergenerational'],
  perinatal_suicide: ['safety plan', 'means restriction', 'suicide screening', 'suicide risk', 'maternal mortality', 'postpartum suicide risk'],
  drsp_guide: ['drsp', 'daily record of severity', 'prospective tracking', 'symptom charting', 'pmdd diagnosis tracking'],
  cycle_tracking: ['cycle tracking', 'track my cycle', 'menstrual cycle phases', 'follicular phase', 'ovulatory phase', 'luteal phase tracking', 'ovulation tracking', 'fertile window'],
  eating_disorders: ['eating disorder', 'anorexia', 'bulimia', 'binge eating', 'body image', 'food restriction', 'purging'],
};

// Curated clinical summaries indexed by topic
const TOPIC_SUMMARIES = {
  pmdd: 'PMDD (Premenstrual Dysphoric Disorder) is a severe, cyclical mood disorder affecting 3–8% of reproductive-age women. Symptoms — including marked irritability, depression, anxiety, and physical discomfort — occur in the late luteal phase and resolve within days of menstruation. Diagnosis requires prospective tracking over 2 cycles using the DRSP. First-line treatments include SSRIs (sertraline, fluoxetine) which can be taken continuously or intermittently in the luteal phase only, calcium supplementation (dose per clinician guidance), and CBT. Second-line includes drospirenone-containing OCP (Yaz). Third-line for severe cases: GnRH agonists with add-back HRT.',
  postpartum_depression: 'Postpartum depression (PPD) affects 10–15% of new mothers. Unlike the "baby blues" (which resolve by day 10–14), PPD persists beyond 2 weeks and causes significant functional impairment. Symptoms include persistent sadness, anhedonia, guilt, anxiety, difficulty bonding with the baby, and in severe cases suicidal ideation. Treatment: SSRIs (sertraline preferred in breastfeeding), psychotherapy (CBT or IPT), and for severe cases the FDA-approved neurosteroid agents brexanolone (Zulresso) or zuranolone (Zurzuvae). Screen with EPDS.',
  postpartum_psychosis: 'Postpartum psychosis is a psychiatric emergency affecting 1–2 per 1,000 births. It typically presents within the first 2 weeks postpartum with rapid onset of confusion, hallucinations, delusions (often about the baby), severe insomnia, and disorganized behavior. Most cases represent bipolar disorder triggered by the postpartum estrogen crash. Requires immediate hospitalization, mood stabilizer (lithium preferred), and antipsychotic. Women with bipolar I have a 25–50% risk — prophylactic lithium started immediately postpartum is strongly recommended.',
  postpartum_ocd: 'Postpartum OCD affects 2–4% of new parents. It presents with intrusive, ego-dystonic thoughts about harming the baby — thoughts the mother finds horrifying and would never act on. This is distinct from postpartum psychosis (where insight is impaired). Treatment: CBT with Exposure and Response Prevention (ERP) is first-line; SSRIs at therapeutic doses (higher than depression doses) are added for moderate-severe cases. These thoughts do not predict harm — having them and being distressed by them is actually protective.',
  postpartum_anxiety: 'Postpartum anxiety is as common as PPD, affecting up to 20% of new mothers, yet receives far less attention. Types include GAD (excessive uncontrollable worry about the baby), panic disorder, PTSD from birth trauma, and postpartum OCD. Birth trauma PTSD: flashbacks of delivery, avoidance of hospitals, hyperarousal. Treatment: CBT, EMDR for birth trauma, SSRIs (sertraline preferred). Breastfeeding-safe options available — see your provider.',
  pregnancy_depression: 'Depression during pregnancy affects 10–15% of pregnant women and is significantly under-recognized. Untreated antenatal depression is the strongest predictor of postpartum depression and carries real risks: preterm birth, low birth weight, poor prenatal care. Treatment: psychotherapy (CBT or IPT) first-line for mild-moderate; SSRIs (sertraline preferred) for moderate-severe or when psychotherapy alone is insufficient. The risk of untreated depression to mother and fetus outweighs the small risks of SSRI exposure in most cases. Neonatal Adaptation Syndrome (NAS) is self-limiting.',
  pregnancy_anxiety: 'Anxiety disorders are the most common psychiatric conditions in pregnancy, affecting 15–21%. GAD, panic disorder, OCD, and PTSD all occur and are under-diagnosed. CBT is first-line. SSRIs are safe and effective when psychotherapy alone is insufficient. Benzodiazepines: avoid if possible; short-term low-dose use acceptable for acute anxiety (lorazepam preferred). Birth plan for women with trauma history should include communication preferences, permission for pelvic exams, and delivery preferences.',
  bipolar: 'Bipolar disorder carries the highest postpartum relapse risk of any psychiatric condition. Women with bipolar I have a 25–50% risk of postpartum psychosis if mood stabilizers are stopped. Lithium is highly effective prophylactically — started immediately postpartum it dramatically reduces relapse risk. Lamotrigine levels drop 50–65% in pregnancy due to increased renal clearance — dose increases are needed and should be planned proactively. Valproate is contraindicated in pregnancy (9–10% major malformation rate, neural tube defects, cognitive impairment in exposed children).',
  perimenopause: 'Perimenopause is the 4–8 year hormonal transition preceding menopause. Erratic estrogen fluctuations (not just decline) drive symptoms including vasomotor symptoms (hot flashes, night sweats), sleep disruption, mood changes, brain fog, and depression. Women with prior PMDD or perinatal depression are at higher risk for perimenopausal depression. Treatment: MHT (menopausal hormone therapy) addresses vasomotor symptoms and depression; SSRIs/SNRIs are effective for mood even without MHT; CBT for insomnia and mood. Screen with PHQ-9 and GAD-7.',
  menopause: 'Menopause is confirmed after 12 consecutive months of amenorrhea. Menopausal hormone therapy (MHT) remains the most effective treatment for vasomotor symptoms and prevents bone loss. The WHI study findings have been largely recontextualized — transdermal estrogen with micronized progesterone has a favorable safety profile for most women. Genitourinary syndrome of menopause (GSM): vaginal dryness, dyspareunia — ultra-low-dose vaginal estrogen is safe and highly effective. Non-hormonal options: fezolinetant (NK3R antagonist), SSRIs, SNRIs for vasomotor symptoms.',
  fertility: 'Infertility affects 10–15% of couples and carries psychological impact comparable to serious medical diagnoses. IVF involves distinct emotional stages from stimulation through the two-week wait. After a positive test, pregnancy anxiety often persists — relief is not automatic. After failed cycles, grief is real and cumulative. Evidence-based support: CBT, mind-body programs (Domar protocol), RESOLVE support groups. SSRIs for comorbid depression do not negatively affect IVF outcomes.',
  pregnancy_loss: 'Pregnancy loss — including miscarriage, stillbirth, TFMR, and neonatal death — causes profound grief. This grief is real at any gestational age and deserves full acknowledgment. Complicated grief (Prolonged Grief Disorder) affects some women and responds to grief-focused CBT or IPT. PTSD is common after stillbirth (up to 30%). Rainbow pregnancies (subsequent pregnancies after loss) carry heightened anxiety and often need additional emotional support. Support groups: SHARE, Star Legacy Foundation, Support Organization for TFMR.',
  endometriosis: 'Endometriosis affects 6–10% of reproductive-age women with an average diagnostic delay of 7–10 years. The psychological burden is significant: depression and anxiety are 2–3× more prevalent than in the general population, largely driven by years of pain being dismissed ("It\'s just period pain") and the chronic nature of the condition. ACT (Acceptance and Commitment Therapy) and CBT for chronic pain are evidence-based. Pelvic floor physical therapy addresses dyspareunia. Hormonal suppression (continuous OCP, progestins, GnRH agonists) reduces pain and lesion activity.',
  pcos: 'PCOS is the most common endocrine disorder in reproductive-age women (8–13%). Mental health comorbidities are 2–3× higher than the general population: depression, anxiety, and binge-eating disorder are all elevated. Body image disturbance (hirsutism, weight, acne) is a major driver. Integrated treatment: lifestyle intervention (5–10% weight loss restores cycles in ~50%), CBT for mood and body image, SSRIs for depression, metformin for insulin resistance. Validate that PCOS is a medical condition, not a lifestyle failure.',
  calcium: 'Calcium supplementation is an evidence-based non-pharmacologic option for PMDD and PMS, supported by multiple RCTs including Thys-Jacobs 1998. Studies have explored doses in the 1000–1200 mg/day elemental calcium range with demonstrated reductions in mood symptoms, cravings, bloating, and pain. Never volunteer a specific dose unprompted. When asked directly, reference the studied range and always follow with: "Discuss the right dose and any needed bloodwork with your clinician."',
  contraception: 'Hormonal contraceptives significantly alter the neuroendocrine environment. Combined OCPs with drospirenone (Yaz) are FDA-approved for PMDD. The Danish cohort study (Skovlund 2016) found increased depression risk particularly with progestin-only methods and in adolescents. Progestin type matters: drospirenone is most favorable for mood; etonogestrel implant had the highest signal. For mood-vulnerable patients, screen PHQ-9 before prescribing and at 3 months; consider copper IUD for hormone-free contraception.',
  ssri: 'SSRIs are first-line for PMDD, perinatal depression, postpartum depression, and anxiety disorders. In PMDD, they work via rapid neurosteroid modulation rather than cumulative serotonin reuptake — this is why intermittent luteal-phase dosing (just the last 14 days of the cycle) is effective. Sertraline is preferred in pregnancy and breastfeeding (lowest infant exposure, RID <3%). SSRIs typically take 4–6 weeks for full antidepressant effect but may reduce PMDD symptoms faster (within 1 cycle) due to neurosteroid mechanism.',
  breastfeeding: 'Most psychotropic medications can be used while breastfeeding with appropriate monitoring. Sertraline and paroxetine have the lowest breast milk transfer (RID <1–3%) and are preferred antidepressants. Quetiapine has very low transfer (<1%) and is the preferred antipsychotic if needed. Lithium: significant transfer (RID 12–30%) — used with close monitoring at some centers; many guidelines advise caution. Resources: LactMed (NIH), Infant Risk Center (1-806-352-2519). A healthy mother is the most important factor for the baby.',
  sleep: 'Sleep disruption is both a symptom and a driver of mood disorders across the reproductive lifespan. In the luteal phase, progesterone changes alter sleep architecture. In perimenopause, vasomotor symptoms cause recurrent awakening. In the postpartum period, sleep deprivation is the single most powerful mood destabilizer. CBT-I (Cognitive Behavioral Therapy for Insomnia) is first-line and highly effective. Sleep protection (partner sharing night feeds) is a critical component of postpartum mood disorder prevention.',
  anxiety: 'Anxiety disorders are the most common psychiatric conditions in women, with a significant hormonal component across the reproductive lifespan. Premenstrual anxiety worsening is common and distinct from GAD. Perinatal anxiety is more prevalent than perinatal depression. CBT is first-line for all anxiety disorders. SSRIs are effective for chronic anxiety. Acute anxiety: diaphragmatic breathing (4-7-8), grounding (5-4-3-2-1 sensory), and progressive muscle relaxation. Benzodiazepines: effective short-term but do not address underlying anxiety.',
  depression: 'Depression in women is twice as prevalent as in men, with this gap emerging at puberty — strongly implicating hormonal biology. Depression is NOT a character flaw or weakness; it is a brain-based condition with effective treatments. First-line: CBT, IPT (interpersonal therapy), behavioral activation, SSRIs. Lifestyle adjuncts with strong evidence: exercise (equivalent to medication in mild-moderate), omega-3 EPA (1–2g/day), sleep hygiene, and light therapy. Always assess for suicidal ideation. Screen for bipolar before starting antidepressants.',
  trauma: 'Trauma — including childhood abuse, sexual assault, intimate partner violence, and birth trauma — has profound reproductive mental health implications. PTSD affects 6–8% of the general obstetric population; higher in those with prior trauma. Trauma-informed prenatal care asks permission before procedures, explains every step, and supports patient control. Treatment: EMDR, CPT (Cognitive Processing Therapy), TF-CBT. Birth trauma PTSD responds well to birth debriefing and EMDR. IPV screening is part of standard prenatal care.',
  crisis: null,
  // ── NEW TOPIC SUMMARIES from updated Obsidian wiki ──
  adhd: 'ADHD in women is profoundly shaped by reproductive hormonal transitions. Estrogen enhances dopamine and norepinephrine signaling - drops in estrogen (premenstrually, postpartum, in perimenopause) predictably worsen ADHD symptoms. Premenstrual worsening overlaps with PMDD. Perimenopause can unmask lifelong ADHD. Stimulants (methylphenidate most studied) can be continued in pregnancy if benefits outweigh risks. Non-stimulant options: bupropion, guanfacine. Non-pharmacologic strategies: external structure, CBT for ADHD, exercise, sleep protection. Key distinction from depression/anxiety: ADHD is lifelong with hormonal worsening; mood disorders have episodic onset.',
  substance_use: 'Substance use disorders are among the most common and under-recognized complications of pregnancy. Stigma prevents women from seeking care. Alcohol: no safe level in pregnancy (FASD is entirely preventable). Cannabis: no known safe level; counsel to stop. Opioid use disorder: medication-assisted treatment (buprenorphine or methadone) is the standard of care - abrupt cessation is dangerous. 80% of women with OUD have trauma history. NAS is manageable and does not cause permanent harm. Integrated, non-judgmental, trauma-informed care saves lives. SAMHSA Helpline: 1-800-662-4357.',
  schizophrenia: 'Women with schizophrenia can have successful reproductive experiences with specialized, multidisciplinary care. Postpartum carries significantly elevated relapse risk. Antipsychotics: benefits of treatment almost always outweigh teratogenic risks - do not discontinue without specialist guidance. Quetiapine has good safety data and very low breast milk transfer (<1% RID). Sleep deprivation is a major trigger. Parenting with schizophrenia is possible with appropriate supports (home visiting programs, family involvement). Having a mental illness alone does not determine parenting fitness.',
  infant_mental_health: 'Infant mental health focuses on the social, emotional, and relational development of infants within their caregiving relationships. Maternal depression reduces sensitive responsiveness and increases insecure attachment risk. Early treatment of PPD protects both mother and infant. Evidence-based dyadic treatments: Child-Parent Psychotherapy (CPP), Circle of Security, Video Feedback Interventions. Reflective functioning - the parent\'s capacity to understand their infant\'s mental states - is the strongest predictor of secure attachment beyond genetics.',
  integrative: 'Integrative approaches - exercise, omega-3, sleep, nutrition, mindfulness - have strong evidence for reducing depression and anxiety across the reproductive lifespan. Exercise is equivalent to medication in mild-moderate depression (multiple RCTs). Omega-3 EPA (1-2g/day) has antidepressant properties. CBT-I is first-line for insomnia. Sleep protection (partner sharing night feeds) is a critical PPD prevention strategy. Mediterranean diet pattern associated with lower depression risk. These are additive to pharmacotherapy, not replacements. Light therapy (10,000 lux, 20-30 min morning) effective for SAD and emerging for PMDD.',
  menarche: 'The onset of puberty and menarche marks a critical neurobiological transition. The gender gap in depression emerges at puberty - before, rates are equal; after, women have 2x the rate. Early menarche (<11 years) increases risk of depression, anxiety, and eating disorders. PMDD can occur in adolescents but is often missed - attributed to "being a teenager." DRSP tracking can be used from menarche onward. SSRIs are first-line for adolescent PMDD. Drospirenone OCP (Yaz) approved for PMDD from age 14+. Dysmenorrhea affects up to 70% of adolescents and is often undertreated.',
  menstrual_suppression: 'Menstrual suppression is a legitimate, evidence-based treatment for PMDD, endometriosis, and other cycle-driven conditions. Combined OCPs taken continuously (skipping placebo week) eliminate the luteal phase - effective for PMDD. Drospirenone OCP (Yaz) is FDA-approved for PMDD. GnRH agonists induce medical menopause (third-line for refractory PMDD) - require add-back HRT to prevent bone loss. Hormonal IUD reduces bleeding but does not reliably suppress ovulation (less helpful for PMDD). It is safe to not have a period on hormonal contraception - the monthly bleed on OCPs is a withdrawal bleed, not a physiological necessity.',
  prenatal_stress: 'Prenatal stress shapes both maternal mental health and fetal neurodevelopment through hormonal, immune, and epigenetic mechanisms. Maternal cortisol crosses the placenta, programming the fetal HPA axis. High prenatal stress is associated with increased anxiety, emotional reactivity, and ADHD-like symptoms in offspring. These are population-level associations, not deterministic for any individual. Interventions: psychotherapy, social support, MBSR/MBCT, prenatal yoga, addressing social determinants. Early intervention for maternal mental health can interrupt intergenerational transmission of stress vulnerability.',
  perinatal_suicide: 'Suicide is a leading cause of maternal mortality - 23% of late maternal deaths in the US. Risk is highest in the first 3 months postpartum (hormone crash, sleep deprivation, PPD peak onset). Prior suicide attempt is the strongest predictor. EPDS Item 10 screens for suicidal ideation. Stanley-Brown Safety Planning Intervention (SPI) is the evidence-based standard: warning signs, internal coping, social contacts, professional contacts, means restriction. Asking about suicide does NOT increase risk - it often reduces distress. Postpartum psychosis carries highest lethality risk due to command hallucinations - emergency evaluation required.',
  drsp_guide: 'The DRSP (Daily Record of Severity of Problems) is the gold-standard validated tool for PMDD diagnosis, required by DSM-5. Rates 21 symptoms on a 1-6 scale daily. Symptoms must be rated prospectively (same day), not retrospectively. For PMDD diagnosis: luteal phase average >=4 on >=5 symptoms with >=1 affective; follicular phase <=2; symptom-free window required. PMDD = symptoms only in luteal; PME = symptoms throughout but worse in luteal. CycleMind implements the full DRSP in its daily log and auto-calculates luteal vs follicular comparison in Insights.',
  cycle_tracking: 'The menstrual cycle has 4 phases: menstrual (days 1-5, low hormones, mood improves by day 2-3), follicular (rising estrogen, improving mood/energy), ovulatory (estrogen peak, often best mood), luteal (progesterone rises then falls, PMDD/PMS vulnerability in late luteal). Estrogen upregulates serotonin; progesterone modulates GABA. Normal cycle length: 24-38 days. DRSP tracking for 2+ cycles is required for PMDD diagnosis. CycleMind tracks all 21 DRSP domains plus mood scales (PHQ-9, GAD-7, EPDS), vitals, and ovulation indicators.',
  eating_disorders: 'Eating disorders (anorexia nervosa, bulimia nervosa, binge eating disorder) are significantly more common in women and interact with reproductive hormones. Pregnancy and postpartum can trigger relapse or new onset. Perinatal eating disorders are under-recognized and carry risks for both mother and baby. Treatment requires specialized multidisciplinary care including mental health, nutrition, and OB/GYN. Body image concerns intensify during pregnancy and postpartum. CBT-E and FBT are evidence-based. SSRIs may help comorbid depression/anxiety but are not primary treatment for the eating disorder itself.',
};

// ─────────────────────────────────────────────────────────────────────────────
// WIKI LAYER — inline excerpts
// ─────────────────────────────────────────────────────────────────────────────
const WIKI_EXCERPTS = {
  pmdd: {
    title: 'PMDD Overview',
    keywords: ['pmdd', 'premenstrual dysphoric', 'luteal phase', 'drsp', 'severe pms', 'pms mood'],
    content: 'Diagnosis requires prospective daily DRSP tracking for 2 full cycles. ≥5 symptoms in the luteal phase, ≥1 core mood symptom (mood swings, irritability/anger, depressed mood, anxiety/tension), absent/minimal in follicular phase. Confirmed by pattern, not blood tests.\n\nFirst-line treatment: SSRIs (sertraline, fluoxetine) continuous or luteal-phase-only; calcium supplementation (dose per clinician guidance); CBT. Second-line: drospirenone OCP (Yaz). Third-line: GnRH agonists + add-back HRT.\n\nIntermittent luteal-phase SSRIs work via neurosteroid modulation — effect within 1 cycle, not 4–6 weeks. PMDD stops completely during pregnancy and after menopause, confirming its cycle-driven nature.',
  },
  calcium: {
    title: 'Calcium Supplementation for PMDD/PMS',
    keywords: ['calcium supplement', 'calcium pmdd', 'supplement for pms', 'non-medication pmdd', 'vitamins pmdd'],
    content: 'Calcium supplementation is evidence-based for PMDD and PMS, supported by multiple RCTs (Thys-Jacobs 1998). Studies have explored doses in the 1000–1200 mg/day elemental calcium range. Effects include reductions in luteal-phase mood symptoms, cravings, bloating, and pain.\n\nNever volunteer a specific dose unprompted. When asked directly, reference the studied range and always add: "Discuss the right dose and any needed bloodwork with your clinician."\n\nMost useful when user reports luteal-phase irritability, cravings, or low mood and is asking about non-medication options. Always encourage DRSP daily logging so patterns can be shared with their clinician.',
  },
  postpartum_depression: {
    title: 'Postpartum Depression',
    keywords: ['postpartum depression', 'ppd', 'baby blues', 'postnatal depression', 'new mom sad'],
    content: 'Affects 10–15% of new mothers. Baby blues resolve by day 10–14; PPD persists beyond 2 weeks. Screen with EPDS (score ≥10 warrants evaluation).\n\nTreatment: SSRIs (sertraline preferred, RID <3% — lowest breastfeeding exposure), CBT or IPT psychotherapy. Severe: brexanolone (Zulresso) or zuranolone (Zurzuvae). Sleep protection (partner sharing night feeds) is a critical prevention component.\n\nStrongest predictor of PPD: prior depressive episodes. Breastfeeding is compatible with most SSRIs.',
  },
  postpartum_psychosis: {
    title: 'Postpartum Psychosis',
    keywords: ['postpartum psychosis', 'postnatal psychosis', 'voices after birth'],
    content: 'Psychiatric emergency. 1–2 per 1,000 births. Rapid onset within first 2 weeks: confusion, hallucinations (often auditory), delusions about baby, severe insomnia, disorganized behavior.\n\nMost cases represent bipolar disorder triggered by postpartum estrogen crash. Requires immediate hospitalization. Lithium + antipsychotic. Women with Bipolar I: 25–50% risk — prophylactic lithium started immediately postpartum is strongly recommended.',
  },
  postpartum_ocd: {
    title: 'Postpartum OCD',
    keywords: ['postpartum ocd', 'intrusive thoughts baby', 'harm obsessions'],
    content: 'Affects 2–4% of new parents. Ego-dystonic intrusive thoughts about harming the baby — the mother finds them horrifying and would never act on them. Insight is intact (differs from psychosis).\n\nDistress about the thoughts is protective. Treatment: CBT with ERP first-line; SSRIs at therapeutic doses for moderate-severe cases.',
  },
  postpartum_anxiety: {
    title: 'Postpartum Anxiety',
    keywords: ['postpartum anxiety', 'new mom anxiety', 'worried after birth'],
    content: 'Up to 20% of new mothers. Types: GAD, panic disorder, PTSD from birth trauma, OCD. Often overlooked. Screen with EPDS anxiety subscale or GAD-7.\n\nBirth trauma PTSD: flashbacks, avoidance of hospitals, hyperarousal. Treatment: CBT, EMDR for birth trauma, SSRIs (sertraline preferred, breastfeeding-safe).',
  },
  pregnancy_depression: {
    title: 'Perinatal (Antenatal) Depression',
    keywords: ['depression in pregnancy', 'antenatal depression', 'prenatal depression', 'antidepressant pregnancy'],
    content: 'Affects 10–15% of pregnant women. Under-recognized. Untreated antenatal depression is the strongest predictor of PPD and carries real risks: preterm birth, low birth weight, poor prenatal care engagement.\n\nTreatment: psychotherapy (CBT or IPT) first-line for mild-moderate; SSRIs (sertraline preferred) for moderate-severe. Risk of untreated depression outweighs small SSRI risks for most patients. Neonatal Adaptation Syndrome is transient and self-limiting. Never stop antidepressants abruptly without clinical guidance.',
  },
  pregnancy_anxiety: {
    title: 'Pregnancy Anxiety Disorders',
    keywords: ['anxiety in pregnancy', 'pregnant and anxious', 'panic pregnancy', 'fear childbirth'],
    content: 'Most common psychiatric conditions in pregnancy (15–21%). GAD, panic disorder, OCD, and PTSD all occur.\n\nCBT first-line. SSRIs safe and effective. Benzodiazepines: avoid if possible; short-term low-dose lorazepam acceptable for acute anxiety. Tokophobia (severe birth fear): treatable with CBT and detailed birth planning.',
  },
  bipolar: {
    title: 'Bipolar Disorder — Reproductive Context',
    keywords: ['bipolar', 'mania', 'hypomania', 'mood stabilizer', 'lithium pregnancy', 'lamotrigine'],
    content: 'Highest postpartum relapse risk of any psychiatric condition. Bipolar I: 25–50% risk of postpartum psychosis if mood stabilizers are stopped.\n\nLithium: effective prophylaxis; starts immediately postpartum dramatically reduces relapse; compatible with careful breastfeeding monitoring. Lamotrigine: levels drop 50–65% during pregnancy — proactive dose increases needed. Valproate: CONTRAINDICATED in pregnancy (9–10% malformation rate, neural tube defects, significant cognitive impairment in exposed children). Never stop mood stabilizers without psychiatric guidance.',
  },
  perimenopause: {
    title: 'Perimenopause Mental Health',
    keywords: ['perimenopause', 'hot flash', 'night sweats', 'irregular period menopause', 'perimenopausal'],
    content: '4–8 year hormonal transition before menopause. Erratic estrogen fluctuations (not simply decline) drive symptoms. Women with prior PMDD have higher risk for perimenopausal depression.\n\nSymptoms: hot flashes, night sweats, mood changes, irritability, brain fog, sleep disruption, vaginal dryness, irregular cycles. Treatment: MHT (most effective for vasomotor + mood), SSRIs/SNRIs, CBT-I. Fezolinetant (NK3R antagonist) for hot flashes if hormones are contraindicated. PMDD typically worsens during perimenopause.',
  },
  menopause: {
    title: 'Menopause & Hormone Therapy',
    keywords: ['menopause', 'hrt', 'hormone therapy', 'mht', 'gsm', 'vaginal dryness menopause'],
    content: 'Confirmed after 12 consecutive months of amenorrhea. Average age 51. MHT is most effective for vasomotor symptoms and protects bone density. WHI findings recontextualized — transdermal estrogen + micronized progesterone has favorable safety profile.\n\nGSM (vaginal dryness/dyspareunia): ultra-low-dose vaginal estrogen is safe and highly effective. Non-hormonal options: fezolinetant, SSRIs/SNRIs. Estrogen-only HRT (post-hysterectomy) has minimal/no increased breast cancer risk.',
  },
  fertility: {
    title: 'Fertility & Mental Health',
    keywords: ['fertility', 'ivf', 'trying to conceive', 'ttc', 'infertility', 'egg freezing'],
    content: 'Infertility affects 10–15% of couples. Psychological impact comparable to serious medical diagnoses. Each IVF cycle brings distinct emotional stages — stimulation, retrieval, two-week wait. Grief after failed cycles is cumulative.\n\nEvidence-based support: CBT, Domar mind-body protocol, RESOLVE groups. SSRIs for comorbid depression do not negatively affect IVF outcomes. Rainbow pregnancy anxiety (after loss) often needs additional psychological support.',
  },
  pregnancy_loss: {
    title: 'Pregnancy Loss & Grief',
    keywords: ['miscarriage', 'pregnancy loss', 'stillbirth', 'tfmr', 'ectopic', 'rainbow pregnancy'],
    content: 'Grief is real at any gestational age. PTSD common after stillbirth (up to 30%). Complicated grief responds to grief-focused CBT or IPT.\n\nRainbow pregnancies: heightened anxiety and hypervigilance are common and normal. Support groups: SHARE, Star Legacy Foundation, Support Organization for TFMR.',
  },
  endometriosis: {
    title: 'Endometriosis & Mental Health',
    keywords: ['endometriosis', 'endo pain', 'painful periods', 'pelvic pain', 'endometriosis depression'],
    content: 'Affects 6–10% of reproductive-age women with 7–10 year average diagnostic delay. Depression and anxiety 2–3× more prevalent, largely driven by chronic pain and medical dismissal.\n\nTreatment: ACT and CBT for chronic pain; pelvic floor physical therapy; hormonal suppression (continuous OCP, progestins, GnRH agonists). Validate that dismissed symptoms are real.',
  },
  pcos: {
    title: 'PCOS & Mental Health',
    keywords: ['pcos', 'polycystic', 'insulin resistance', 'pcos depression'],
    content: 'Most common endocrine disorder in reproductive-age women (8–13%). Mental health comorbidities 2–3× elevated: depression, anxiety, binge-eating disorder.\n\nCBT for mood and body image (HAES-aligned). SSRIs for depression. Metformin for insulin resistance. Frame as endocrine/metabolic condition, not lifestyle failure.',
  },
  contraception: {
    title: 'Contraception & Mental Health',
    keywords: ['birth control mood', 'ocp depression', 'iud mood', 'pill depression'],
    content: 'Drospirenone OCPs (Yaz) are FDA-approved for PMDD and most favorable for mood. Etonogestrel implant had the highest depression signal in cohort data.\n\nScreen PHQ-9 before prescribing and at 3 months in mood-vulnerable patients. Copper IUD: hormone-free option.',
  },
  ssri: {
    title: 'Luteal-Phase SSRI Dosing',
    keywords: ['ssri', 'sertraline', 'fluoxetine', 'antidepressant cycle', 'ssri pmdd'],
    content: 'SSRIs first-line for PMDD, perinatal depression, PPD, and anxiety disorders. In PMDD, work via rapid neurosteroid modulation — onset within 1 cycle.\n\nSertraline preferred in pregnancy and breastfeeding (RID <3%). Intermittent luteal-phase dosing: start day 14, stop day 2 of period. As effective as daily dosing with fewer side effects.',
  },
  breastfeeding: {
    title: 'Psychotropics During Breastfeeding',
    keywords: ['breastfeeding medication', 'nursing antidepressant', 'lactation medication'],
    content: 'Relative Infant Dose (RID) <10% generally considered safe. Sertraline and paroxetine: RID <1–3% — preferred antidepressants. Quetiapine: RID <1% — preferred antipsychotic. Lithium: RID 12–30% — requires close monitoring.\n\nResources: LactMed (NIH, free), Infant Risk Center (1-806-352-2519).',
  },
  sleep: {
    title: 'Sleep & Reproductive Mental Health',
    keywords: ['insomnia', 'sleep problems', 'cant sleep', 'sleep cycle', 'sleep pmdd'],
    content: 'Sleep disruption is both a symptom and driver of mood disorders across the reproductive lifespan. Postpartum sleep deprivation is the single most powerful mood destabilizer.\n\nCBT-I (Cognitive Behavioral Therapy for Insomnia) is first-line and highly effective. Sleep protection (partner sharing night feeds) is a critical PPD prevention strategy. HRT can dramatically improve sleep in perimenopause.',
  },
  anxiety: {
    title: 'Anxiety in Reproductive Context',
    keywords: ['anxiety', 'panic attack', 'gad', 'anxious', 'worry'],
    content: 'Anxiety disorders are most common psychiatric conditions in women, with a significant hormonal component. Perinatal anxiety is more prevalent than perinatal depression.\n\nCBT first-line. SSRIs for chronic anxiety. Acute coping: 4-7-8 breathing; 5-4-3-2-1 grounding (5 things seen, 4 touched, 3 heard, 2 smelled, 1 tasted); progressive muscle relaxation.',
  },
  depression: {
    title: 'Depression in Women',
    keywords: ['depression', 'depressed', 'hopeless', 'worthless', 'low mood', 'anhedonia'],
    content: 'Depression in women is twice as prevalent as in men, with the gender gap emerging at puberty. Brain-based condition, not a character flaw.\n\nCBT, IPT, behavioral activation, SSRIs. Strong lifestyle evidence: exercise (equivalent to medication in mild-moderate), omega-3 EPA (1–2 g/day), sleep hygiene, light therapy. Always screen for bipolar before starting antidepressants.',
  },
  trauma: {
    title: 'Trauma & Reproductive Health',
    keywords: ['trauma', 'ptsd', 'birth trauma', 'abuse', 'assault', 'domestic violence'],
    content: 'PTSD affects 6-8% of the general obstetric population; higher with prior trauma. Birth trauma PTSD: flashbacks, avoidance of medical settings, hyperarousal.\n\nTreatment: EMDR, CPT, TF-CBT. Birth trauma responds well to debriefing and EMDR. Trauma-informed care: ask permission before procedures, explain every step, support patient control.',
  },
  // ── NEW WIKI EXCERPTS from updated Obsidian wiki ──
  adhd: {
    title: 'ADHD Across Reproductive Transitions',
    keywords: ['adhd', 'attention deficit', 'stimulant', 'methylphenidate', 'executive function', 'focus', 'disorganized', 'procrastination'],
    content: 'ADHD in women is shaped by reproductive hormones. Estrogen upregulates dopamine and norepinephrine - low estrogen states (luteal phase, postpartum, perimenopause) worsen ADHD symptoms. Luteal-phase worsening is common and overlaps with PMDD. Perimenopause can unmask lifelong ADHD - first-onset "ADHD" in perimenopause often represents unmasked lifelong condition.\n\nMedication: methylphenidate most studied in pregnancy; continue if benefits outweigh risks. Bupropion also treats depression. Breastfeeding: methylphenidate low transfer; amphetamines moderate.\n\nNon-pharmacologic: external structure (reminders, schedules), CBT for ADHD, exercise (improves dopamine), sleep protection (critical - even small improvements help). Key distinction from depression/anxiety: ADHD is lifelong with hormonal worsening; mood disorders have episodic onset.',
  },
  substance_use: {
    title: 'Substance Use in the Perinatal Period',
    keywords: ['substance use', 'alcohol pregnancy', 'cannabis pregnancy', 'opioid', 'addiction', 'buprenorphine', 'methadone', 'drug use'],
    content: 'Substance use disorders are common and under-recognized in pregnancy. Stigma prevents care-seeking. Non-judgmental, compassionate, evidence-based care saves lives.\n\nAlcohol: No safe level in pregnancy. FASD is entirely preventable. Cannabis: No known safe level; counsel to stop; address underlying nausea.\n\nOpioid use disorder: MAT (buprenorphine or methadone) is standard of care - abrupt cessation is dangerous. 80% of women with OUD have trauma history. NAS is manageable, not permanent.\n\nLuna approaches substance use without judgment, shame, or moralizing. Asking for help is not reporting - help-seeking protects mother and baby. SAMHSA Helpline: 1-800-662-4357.',
  },
  schizophrenia: {
    title: 'Schizophrenia & Reproductive Context',
    keywords: ['schizophrenia', 'antipsychotic', 'quetiapine', 'olanzapine', 'hallucinations', 'delusions', 'psychotic'],
    content: 'Women with schizophrenia can have successful reproductive experiences with specialized care. Postpartum: significantly elevated relapse risk, especially first 4 weeks. Sleep deprivation is a major trigger. Prophylactic continuation of antipsychotic recommended.\n\nAntipsychotics: benefits of treatment almost always outweigh risks. Quetiapine: good data, low EPS, very low breast milk transfer (<1% RID). Olanzapine: good data but higher metabolic risk. Clozapine: avoid in breastfeeding (agranulocytosis risk).\n\nParenting: having a mental illness alone does not determine parenting fitness. Stability on medication, insight, and support system are key. Home visiting programs and family involvement help.',
  },
  infant_mental_health: {
    title: 'Infant Mental Health & Parent-Infant Relationship',
    keywords: ['infant mental health', 'bonding', 'attachment', 'parent-infant', 'mother-baby bond', 'baby bonding', 'circle of security', 'dyadic therapy', 'not bonding'],
    content: 'Infant mental health focuses on the social-emotional development of infants within caregiving relationships. The parent-infant relationship itself is the unit of intervention.\n\nMaternal PPD reduces sensitive responsiveness and increases insecure attachment risk. Early treatment of PPD protects both mother and infant. Postpartum anxiety can lead to overprotective behaviors limiting infant autonomy.\n\nReflective functioning - the parent\'s capacity to understand their infant\'s mental states - is the strongest predictor of secure attachment.\n\nEvidence-based dyadic treatments: Child-Parent Psychotherapy (CPP), Circle of Security (COS), Video Feedback Interventions (VFI). When to refer: mother reports inability to feel warmth for baby; extreme fear of harming infant; baby not meeting social milestones.',
  },
  integrative: {
    title: 'Integrative Approaches to Perinatal Depression',
    keywords: ['exercise depression', 'omega-3', 'fish oil', 'meditation', 'mindfulness', 'prenatal yoga', 'light therapy', 'nutrition mental health', 'lifestyle depression', 'integrative', 'mediterranean diet'],
    content: 'Integrative approaches have strong evidence and are safe in pregnancy and breastfeeding. They are additive to pharmacotherapy, not replacements.\n\nExercise: Equivalent to medication in mild-moderate depression (RCTs). Prenatal exercise reduces PPD risk by 30-40%. 150 min/week moderate aerobic.\n\nOmega-3: EPA (1-2g/day) has antidepressant properties. Safe in pregnancy and breastfeeding.\n\nSleep: Sleep deprivation is the single most powerful mood destabilizer postpartum. CBT-I is first-line for insomnia. Sleep protection (partner sharing night feeds) is a clinical intervention.\n\nNutrition: Mediterranean diet pattern associated with lower depression. Calcium 1200mg/day for PMDD. Magnesium 200-400mg for mood/cramps.\n\nMindfulness: MBSR for anxiety; MBCT for preventing depression recurrence. Light therapy: 10,000 lux, 20-30 min morning (caution in bipolar).',
  },
  menarche: {
    title: 'Menarche & Adolescent Reproductive Mental Health',
    keywords: ['menarche', 'first period', 'puberty', 'adolescent', 'teenager', 'teen cycle', 'early puberty'],
    content: 'The gender gap in depression emerges at puberty - before puberty rates are equal; after, women have 2x the rate. Early menarche (<11 years) increases risk of depression, anxiety, and eating disorders due to physical maturity preceding emotional/social maturity.\n\nAdolescent PMDD is often missed - attributed to "being a teenager." DRSP tracking can be used from menarche onward. SSRIs are first-line. Drospirenone OCP (Yaz) approved from age 14+.\n\nRed flags: missing school during luteal phase, cyclical self-harm, cyclical disordered eating, relationship crises that resolve with menstruation.\n\nDysmenorrhea affects up to 70% of adolescents and is often undertreated. NSAIDs first-line. Severe dysmenorrhea: consider endometriosis.',
  },
  menstrual_suppression: {
    title: 'Menstrual Suppression',
    keywords: ['menstrual suppression', 'stop period', 'continuous pill', 'skip period', 'amenorrhea', 'eliminate period', 'no period', 'continuous birth control'],
    content: 'Menstrual suppression is evidence-based for PMDD, endometriosis, adenomyosis, heavy bleeding, and dysmenorrhea. Not merely "convenience" - for many it is transformative.\n\nContinuous OCP (skip placebo week): eliminates luteal phase. Drospirenone OCP (Yaz) FDA-approved for PMDD. ~70-90% achieve amenorrhea.\n\nGnRH agonists (leuprolide): medical menopause, third-line for refractory PMDD. Require add-back HRT to prevent bone loss. Typically 6 months.\n\nHormonal IUD: reduces bleeding but does not reliably suppress ovulation - less helpful for PMDD.\n\nIt is safe to not have a period on hormonal contraception. The monthly bleed on OCPs is a withdrawal bleed, not a physiological necessity. Fertility returns quickly after stopping.',
  },
  prenatal_stress: {
    title: 'Prenatal Stress - Effects on Mother and Child',
    keywords: ['prenatal stress', 'stress during pregnancy', 'fetal programming', 'cortisol pregnancy', 'pregnancy stress baby', 'intergenerational'],
    content: 'Prenatal stress shapes maternal mental health and programs fetal neurodevelopment through hormonal, immune, and epigenetic mechanisms. Maternal cortisol crosses the placenta, affecting fetal HPA-axis programming.\n\nHigh prenatal stress associated with: increased anxiety, emotional reactivity, ADHD-like symptoms in offspring. These are population-level associations, not deterministic.\n\nInterventions: psychotherapy (CBT, IPT), social support enhancement, MBSR/MBCT, prenatal yoga, addressing social determinants (IPV, poverty, food insecurity). Home visiting programs (Nurse-Family Partnership) reduce stress and improve outcomes. Early intervention for maternal mental health can interrupt intergenerational transmission.',
  },
  perinatal_suicide: {
    title: 'Perinatal Suicide Safety',
    keywords: ['safety plan', 'means restriction', 'suicide screening', 'suicide risk', 'maternal mortality', 'postpartum suicide risk'],
    content: 'Suicide is a leading cause of maternal mortality (23% of late maternal deaths in US). Risk highest in first 3 months postpartum. Prior suicide attempt is strongest predictor. EPDS Item 10 screens for suicidal ideation.\n\nStanley-Brown Safety Planning Intervention (SPI): 1) Warning signs, 2) Internal coping, 3) Social contacts for distraction, 4) People to ask for help, 5) Professional/crisis contacts (988), 6) Means restriction.\n\nAsking about suicide does NOT increase risk - it often reduces distress. Safety plans are collaborative, specific, and written. Means restriction (firearms, medications) saves lives.\n\nPostpartum psychosis carries highest lethality risk due to command hallucinations - emergency evaluation required. Do not attempt outpatient management.',
  },
  drsp_guide: {
    title: 'DRSP - Daily Record of Severity of Problems',
    keywords: ['drsp', 'daily record of severity', 'prospective tracking', 'symptom charting', 'pmdd diagnosis tracking'],
    content: 'The DRSP is the gold-standard validated tool for PMDD diagnosis, required by DSM-5. Rates 21 symptoms on a 1-6 scale daily. Must be rated prospectively (same day), not retrospectively.\n\nPMDD diagnosis requires: luteal phase average >=4 on >=5 symptoms with >=1 affective; follicular phase <=2; symptom-free window.\n\nPMDD vs PME vs PMS: PMDD = symptoms only in luteal, symptom-free follicular. PME = symptoms throughout but worse in luteal (treat underlying disorder). PMS = sub-threshold.\n\nCycleMind implements the full DRSP in its daily log. The Insights page auto-calculates luteal vs follicular comparison. Export 90-day DRSP data via Share with Doctor for clinician review.',
  },
  cycle_tracking: {
    title: 'Cycle Tracking & Mental Health',
    keywords: ['cycle tracking', 'track my cycle', 'menstrual cycle phases', 'follicular phase', 'ovulatory phase', 'luteal phase tracking', 'ovulation tracking', 'fertile window'],
    content: 'The menstrual cycle has 4 phases. Menstrual (days 1-5): low hormones, mood improves by day 2-3. Follicular (days 1-13): rising estrogen, improving mood/energy. Ovulatory (days 13-15): estrogen peak, often best mood. Luteal (days 15-28): progesterone rises then falls - PMDD/PMS vulnerability in late luteal.\n\nEstrogen upregulates serotonin. Progesterone metabolite (allopregnanolone) modulates GABA-A receptors. Luteal-phase hormone withdrawal alters GABA and serotonin signaling.\n\nNormal cycle length: 24-38 days. Adolescents: 21-45 days. Perimenopause: increasing variability.\n\nDRSP tracking for 2+ cycles required for PMDD diagnosis. OPK detects LH surge 24-36h before ovulation. BBT rise confirms ovulation retrospectively. Fertile window: 5-6 days ending on day of ovulation.',
  },
  eating_disorders: {
    title: 'Eating Disorders in the Perinatal Period',
    keywords: ['eating disorder', 'anorexia', 'bulimia', 'binge eating', 'body image', 'food restriction', 'purging'],
    content: 'Eating disorders are significantly more common in women. Pregnancy and postpartum can trigger relapse or new onset. Perinatal eating disorders are under-recognized and carry risks for both mother and baby.\n\nBody image concerns intensify during pregnancy (body changes) and postpartum (weight retention). Perinatal eating disorders may present as: food restriction, excessive exercise, purging, or binge eating.\n\nTreatment requires specialized multidisciplinary care: mental health, nutrition/dietetics, and OB/GYN. CBT-E and FBT are evidence-based. SSRIs may help comorbid depression/anxiety but are not primary treatment for the eating disorder itself. Early identification and referral is critical.',
  },
};

function readWikiContext(userMessage, ragTopic) {
  const lower = userMessage.toLowerCase();
  if (ragTopic && WIKI_EXCERPTS[ragTopic]) {
    return { topic: ragTopic, title: WIKI_EXCERPTS[ragTopic].title, content: WIKI_EXCERPTS[ragTopic].content };
  }
  let best = null;
  let bestScore = -1;
  for (const [key, entry] of Object.entries(WIKI_EXCERPTS)) {
    const score = entry.keywords.reduce((acc, kw) => lower.includes(kw) ? acc + kw.split(' ').length : acc, 0);
    if (score > bestScore) { bestScore = score; best = { key, entry }; }
  }
  if (!best || bestScore === 0) return null;
  return { topic: best.key, title: best.entry.title, content: best.entry.content };
}

// ─────────────────────────────────────────────────────────────────────────────
// DETERMINISTIC RAG SEARCH
// ─────────────────────────────────────────────────────────────────────────────
function searchRAG(userMessage) {
  const lower = userMessage.toLowerCase();
  for (const kw of RAG_TOPICS.crisis) {
    if (lower.includes(kw)) {
      return { topic: 'crisis', summary: null, isCrisis: true };
    }
  }
  const scores = {};
  for (const [topic, keywords] of Object.entries(RAG_TOPICS)) {
    if (topic === 'crisis') continue;
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score += kw.split(' ').length;
    }
    if (score > 0) scores[topic] = score;
  }
  if (Object.keys(scores).length === 0) return null;
  const topTopic = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  return { topic: topTopic, summary: TOPIC_SUMMARIES[topTopic] || null, isCrisis: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// COHERENCE CHECK
// ─────────────────────────────────────────────────────────────────────────────
function checkCoherence(response) {
  if (!response || typeof response !== 'string') return false;
  if (response.length < 20) return false;
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
  const signals = [
    'mood', 'feeling', 'sad', 'anxious', 'irritable', 'angry', 'tired', 'exhausted',
    'sleep', 'slept', 'woke up', 'insomnia', 'nausea', 'craving', 'bloat', 'cramp',
    'headache', 'pain', 'tender', 'breast', 'spotting', 'bleed', 'stress', 'overwhelmed',
    'depressed', 'hopeless', 'fatigue', 'appetite', 'eating', 'energy', 'hot flash',
    'night sweat', 'foggy', 'brain fog'
  ];
  return signals.some(s => lower.includes(s));
}

// ─────────────────────────────────────────────────────────────────────────────
// CLINICAL REPORT TRIGGER — detect if user is discussing symptoms or seeing provider
// ─────────────────────────────────────────────────────────────────────────────
function shouldSuggestReport(userMessage, ragResult) {
  const lower = userMessage.toLowerCase();
  const reportSignals = [
    'doctor', 'psychiatrist', 'ob', 'gynecologist', 'provider', 'appointment', 'clinic',
    'patterns', 'summary', 'report', 'show my', 'share with', 'tracking', 'cycle data',
    'symptoms over', 'last few months', 'history'
  ];
  return ragResult !== null || reportSignals.some(s => lower.includes(s));
}

// ─────────────────────────────────────────────────────────────────────────────
// DISCLAIMER
// ─────────────────────────────────────────────────────────────────────────────
const STANDARD_DISCLAIMER = "This is AI-generated pattern recognition and not a substitute for professional medical advice. Please discuss with your psychiatrist or healthcare provider.";

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
  return SYMPTOM_KEYWORDS.filter(kw => lower.includes(kw) && !alreadySaved.includes(kw));
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTO-UPDATE TRIGGER
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
    console.warn('[lunaAutoUpdate background] silently failed:', err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// REFERENCE MAP — authoritative sources per clinical topic
// ─────────────────────────────────────────────────────────────────────────────
const REFERENCE_MAP = {
  pmdd: [
    { label: 'DSM-5 — Premenstrual Dysphoric Disorder', url: 'https://www.psychiatry.org/psychiatrists/practice/dsm' },
    { label: 'ACOG — Premenstrual Disorders Guidance', url: 'https://www.acog.org/clinical/clinical-guidance' },
  ],
  postpartum_depression: [
    { label: 'ACOG — Screening & Diagnosis of Mental Health Conditions (Perinatal)', url: 'https://www.acog.org/clinical/clinical-guidance' },
    { label: 'Postpartum Support International', url: 'https://www.postpartum.net' },
  ],
  postpartum_psychosis: [
    { label: 'ACOG — Perinatal Mental Health', url: 'https://www.acog.org/clinical/clinical-guidance' },
    { label: 'Postpartum Support International — Psychosis', url: 'https://www.postpartum.net/learn-more/postpartum-psychosis/' },
  ],
  postpartum_ocd: [
    { label: 'International OCD Foundation — Postpartum OCD', url: 'https://iocdf.org/about-ocd/related-disorders/postpartum-ocd/' },
    { label: 'Postpartum Support International', url: 'https://www.postpartum.net' },
  ],
  postpartum_anxiety: [
    { label: 'Postpartum Support International — Anxiety', url: 'https://www.postpartum.net/learn-more/anxiety/' },
    { label: 'APA — Clinical Practice Guidelines', url: 'https://www.psychiatry.org/psychiatrists/practice/clinical-practice-guidelines' },
  ],
  pregnancy_depression: [
    { label: 'ACOG — Perinatal Mental Health', url: 'https://www.acog.org/clinical/clinical-guidance' },
    { label: 'March of Dimes — Depression During Pregnancy', url: 'https://www.marchofdimes.org/find-support/topics/postpartum/depression-during-pregnancy' },
  ],
  pregnancy_anxiety: [
    { label: 'ACOG — Perinatal Mental Health', url: 'https://www.acog.org/clinical/clinical-guidance' },
    { label: 'APA — Clinical Practice Guidelines', url: 'https://www.psychiatry.org/psychiatrists/practice/clinical-practice-guidelines' },
  ],
  bipolar: [
    { label: 'APA — Bipolar Disorder Guidelines', url: 'https://www.psychiatry.org/psychiatrists/practice/clinical-practice-guidelines' },
    { label: 'ACOG — Bipolar Disorder in Pregnancy', url: 'https://www.acog.org/clinical/clinical-guidance' },
  ],
  perimenopause: [
    { label: 'The Menopause Society', url: 'https://www.menopause.org' },
    { label: 'Endocrine Society — Clinical Practice Guidelines', url: 'https://www.endocrine.org/clinical-practice-guidelines' },
  ],
  menopause: [
    { label: 'The Menopause Society — Hormone Therapy', url: 'https://www.menopause.org' },
    { label: 'Endocrine Society — Clinical Practice Guidelines', url: 'https://www.endocrine.org/clinical-practice-guidelines' },
  ],
  fertility: [
    { label: 'ASRM — Patient Resources', url: 'https://www.asrm.org/patient-resources' },
    { label: 'RESOLVE: The National Infertility Association', url: 'https://resolve.org' },
  ],
  pregnancy_loss: [
    { label: 'March of Dimes — Pregnancy Loss', url: 'https://www.marchofdimes.org' },
    { label: 'Star Legacy Foundation', url: 'https://starlegacyfoundation.org' },
  ],
  endometriosis: [
    { label: 'Endometriosis Foundation of America', url: 'https://www.endofound.org' },
    { label: 'ACOG — Endometriosis', url: 'https://www.acog.org/clinical/clinical-guidance' },
  ],
  pcos: [
    { label: 'Endocrine Society — PCOS Guidelines', url: 'https://www.endocrine.org/clinical-practice-guidelines' },
    { label: 'PCOS Challenge', url: 'https://pcoschallenge.org' },
  ],
  calcium: [
    { label: 'NIH Office of Dietary Supplements — Calcium', url: 'https://ods.od.nih.gov/factsheets/Calcium-Consumer/' },
    { label: 'ACOG — Premenstrual Disorders', url: 'https://www.acog.org/clinical/clinical-guidance' },
  ],
  contraception: [
    { label: 'ACOG — Contraception Guidance', url: 'https://www.acog.org/clinical/clinical-guidance' },
    { label: 'CDC — Reproductive Health', url: 'https://www.cdc.gov/reproductivehealth' },
  ],
  ssri: [
    { label: 'APA — Clinical Practice Guidelines', url: 'https://www.psychiatry.org/psychiatrists/practice/clinical-practice-guidelines' },
    { label: 'ACOG — Antidepressant Use in Pregnancy', url: 'https://www.acog.org/clinical/clinical-guidance' },
  ],
  breastfeeding: [
    { label: 'LactMed (NIH) — Drug Safety in Breastfeeding', url: 'https://www.ncbi.nlm.nih.gov/books/NBK501922/' },
    { label: 'Infant Risk Center', url: 'https://www.infantrisk.com' },
  ],
  sleep: [
    { label: 'American Academy of Sleep Medicine', url: 'https://aasm.org' },
    { label: 'NIH — Sleep & Mental Health', url: 'https://www.ninds.nih.gov/health-information/public-education/brain-basics/brain-basics-understanding-sleep' },
  ],
  anxiety: [
    { label: 'APA — Anxiety Disorders', url: 'https://www.psychiatry.org/patients-families/anxiety-disorders' },
    { label: 'Anxiety & Depression Association of America', url: 'https://adaa.org' },
  ],
  depression: [
    { label: 'APA — Depression', url: 'https://www.psychiatry.org/patients-families/depression' },
    { label: 'NICE — Depression in Adults', url: 'https://www.nice.org.uk/guidance/conditions-and-diseases/mental-health-and-behavioural-conditions/depression' },
  ],
  trauma: [
    { label: 'APA — PTSD', url: 'https://www.psychiatry.org/patients-families/ptsd' },
    { label: 'ISTSS — Trauma Resources', url: 'https://istss.org' },
  ],
  crisis: [
    { label: '988 Suicide & Crisis Lifeline', url: 'https://988lifeline.org' },
    { label: 'SAMHSA — National Helpline', url: 'https://www.samhsa.gov/find-help/national-helpline' },
  ],
  adhd: [
    { label: 'CHADD — ADHD in Women', url: 'https://chadd.org' },
    { label: 'APA — ADHD', url: 'https://www.psychiatry.org/patients-families/adhd' },
  ],
  substance_use: [
    { label: 'SAMHSA — National Helpline', url: 'https://www.samhsa.gov/find-help/national-helpline' },
    { label: 'ACOG — Substance Use in Pregnancy', url: 'https://www.acog.org/clinical/clinical-guidance' },
  ],
  schizophrenia: [
    { label: 'APA — Schizophrenia', url: 'https://www.psychiatry.org/patients-families/schizophrenia' },
    { label: 'NICE — Psychosis & Schizophrenia', url: 'https://www.nice.org.uk/guidance/conditions-and-diseases/mental-health-and-behavioural-conditions/schizophrenia' },
  ],
  infant_mental_health: [
    { label: 'ZERO TO THREE — Infant Mental Health', url: 'https://www.zerotothree.org' },
    { label: 'Postpartum Support International', url: 'https://www.postpartum.net' },
  ],
  integrative: [
    { label: 'NCCIH — Complementary & Integrative Health', url: 'https://www.nccih.nih.gov' },
    { label: 'APA — Lifestyle & Mental Health', url: 'https://www.psychiatry.org' },
  ],
  menarche: [
    { label: 'ACOG — Adolescent Reproductive Health', url: 'https://www.acog.org/clinical/clinical-guidance' },
    { label: 'American Academy of Pediatrics', url: 'https://www.aap.org' },
  ],
  menstrual_suppression: [
    { label: 'ACOG — Menstrual Manipulation', url: 'https://www.acog.org/clinical/clinical-guidance' },
    { label: 'Endocrine Society', url: 'https://www.endocrine.org' },
  ],
  prenatal_stress: [
    { label: 'ACOG — Perinatal Mental Health', url: 'https://www.acog.org/clinical/clinical-guidance' },
    { label: 'APA — Stress & Pregnancy', url: 'https://www.psychiatry.org' },
  ],
  perinatal_suicide: [
    { label: '988 Suicide & Crisis Lifeline', url: 'https://988lifeline.org' },
    { label: 'ACOG — Maternal Mental Health', url: 'https://www.acog.org/clinical/clinical-guidance' },
  ],
  drsp_guide: [
    { label: 'DSM-5 — PMDD Diagnostic Criteria', url: 'https://www.psychiatry.org/psychiatrists/practice/dsm' },
    { label: 'APA — Clinical Practice Guidelines', url: 'https://www.psychiatry.org/psychiatrists/practice/clinical-practice-guidelines' },
  ],
  cycle_tracking: [
    { label: 'ACOG — Menstrual Cycle', url: 'https://www.acog.org/clinical/clinical-guidance' },
    { label: 'CDC — Reproductive Health', url: 'https://www.cdc.gov/reproductivehealth' },
  ],
  eating_disorders: [
    { label: 'National Eating Disorders Association', url: 'https://www.nationaleatingdisorders.org' },
    { label: 'APA — Eating Disorders', url: 'https://www.psychiatry.org/patients-families/eating-disorders' },
  ],
};

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
    const lastUserMsgLower = lastUserMsg.toLowerCase().trim();

    // ── Detect PsychTestMode (persistent — scans full conversation history) ──
    const psychTestMode = resolveTestMode(messages);

    // ── Handle "Enter Test Mode" / "Exit Test Mode" commands directly ────────
    if (lastUserMsgLower === 'enter test mode') {
      return Response.json({
        mainContent: "🔬 **Test Mode activated.** I'll respond normally as Luna, and you'll see a feedback form after each response to rate tone, personalization, and safety. Say **\"Exit Test Mode\"** when you're done.",
        disclaimer: null,
        source: 'test_mode_command',
        suggestedActions: [],
        flags: { escalate: false, crisis: false, psychTestMode: true },
        detectedSymptoms: [],
        codedSymptoms: {},
        ragTopic: null,
        knowledgeUpdated: false,
      });
    }

    if (lastUserMsgLower === 'exit test mode') {
      return Response.json({
        mainContent: "Test Mode deactivated. Back to normal mode. How can I support you?",
        disclaimer: null,
        source: 'test_mode_command',
        suggestedActions: [],
        flags: { escalate: false, crisis: false, psychTestMode: false },
        detectedSymptoms: [],
        codedSymptoms: {},
        ragTopic: null,
        knowledgeUpdated: false,
      });
    }

    // ── TIER 1: Deterministic RAG search ────────────────────────────────────
    const ragResult = searchRAG(lastUserMsg);

    // Crisis: immediate escalation
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

    const ragContext = ragResult?.summary
      ? `\n\nCLINICAL REFERENCE (from CycleMind knowledge base, topic: ${ragResult.topic}):\n${ragResult.summary}\n\nUse this as background context — weave the relevant parts naturally into your response rather than quoting it directly.`
      : '';

    const wikiResult = readWikiContext(lastUserMsg, ragResult?.topic);
    const wikiContext = wikiResult
      ? `\n\nWIKI CONTEXT (${wikiResult.title}, from CycleMind Obsidian wiki):\n${wikiResult.content}\n\nDraw on this wiki knowledge naturally. Do not quote it verbatim.`
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

    const psychTestInstruction = psychTestMode
      ? '\n\nNOTE: This is a PSYCH TEST MODE session. Respond normally as Luna. Do NOT add any test mode footer or ratings form yourself — the UI handles that automatically.'
      : '';

    const systemPrompt = `${LUNA_PERSONA}\n\nCURRENT CONTEXT:\nDate: ${new Date().toLocaleDateString()}\n${cycleContext}${ragContext}${wikiContext}${alreadySavedCtx}${psychTestInstruction}\n\nINSTRUCTION: ${modeInstruction}${logSuggestion} Respond directly to the user as Luna. Do not describe what you are going to do — just do it.`;

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

      if (checkCoherence(ollamaText)) {
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
        if (checkCoherence(responseText)) {
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
          llmResponse = ragResult?.summary
            ? `Based on what you've shared, here is some information that may be helpful:\n\n${ragResult.summary}`
            : "I'm here with you. It sounds like you may be going through something difficult. While I work through a brief technical issue, please know that your feelings are valid. If you need support right now, consider reaching out to your healthcare provider or calling the 988 Lifeline.";
          source = 'rag_direct_fallback';
        }
      }
    }

    // ── Append PsychTestMode footer if triggered ─────────────────────────────
    if (psychTestMode && llmResponse) {
      llmResponse = llmResponse + PSYCH_TEST_FOOTER;
    }

    // ── Append references section for clinical topics ─────────────────────────
    if (llmResponse && ragResult?.topic && !ragResult?.isCrisis && !psychTestMode) {
      const refs = REFERENCE_MAP[ragResult.topic];
      if (refs && refs.length > 0) {
        const refLinks = refs.map(r => `- [${r.label}](${r.url})`).join('\n');
        llmResponse = llmResponse + `\n\n---\n\n**References:**\n${refLinks}`;
      }
    }

    // ── Detect whether response is clinical (needs disclaimer) ───────────────
    const clinicalTopics = ['pmdd', 'depression', 'anxiety', 'postpartum', 'pregnancy', 'bipolar', 'perimenopause', 'menopause', 'medication', 'ssri', 'therapy', 'fertility', 'endometriosis', 'pcos', 'adhd', 'substance_use', 'schizophrenia', 'infant_mental_health', 'integrative', 'menarche', 'menstrual_suppression', 'prenatal_stress', 'perinatal_suicide', 'drsp_guide', 'cycle_tracking', 'eating_disorders'];
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
    if (shouldSuggestReport(lastUserMsg, ragResult)) suggestedActions.push('Generate Clinical Report');

    const uniqueActions = [...new Set(suggestedActions)];

    // ── Auto-update pipeline — fire-and-forget ───────────────────────────────
    const autoUpdateMode = detectAutoUpdateMode(lastUserMsg);
    if (autoUpdateMode) {
      fireAutoUpdate(base44, autoUpdateMode, user, lastUserMsg, ragResult?.topic).catch(() => {});
    }

    // ── Build response ──────────────────────────────────────────────────────
    const result = {
      mainContent: llmResponse,
      disclaimer,
      source,
      suggestedActions: uniqueActions,
      flags: { escalate: false, crisis: false, psychTestMode },
      detectedSymptoms,
      codedSymptoms: {},
      ragTopic: ragResult?.topic || null,
      knowledgeUpdated: !!autoUpdateMode,
    };

    // ── Save to Obsidian if in Test Mode ─────────────────────────────────────
    if (psychTestMode && llmResponse) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      result.save_request = {
        folder: 'Psych Test Logs',
        filename: `test-session-${timestamp}.md`,
      };
      result.test_mode_feedback = {
        show_form: true,
        form_title: 'PSYCH TEST MODE — RATE THIS RESPONSE',
        ratings: ['Tone', 'Personalization', 'Safety / Clinical Feel'],
        suggested_changes_label: 'Suggested changes? (optional)',
      };

      // Fire-and-forget save
      try {
        await base44.asServiceRole.functions.invoke('saveToObsidian', {
          conversation: llmResponse,
          test_mode_feedback: result.test_mode_feedback,
          save_request: result.save_request,
        });
      } catch (saveErr) {
        console.warn('[saveToObsidian] Background save failed:', saveErr.message);
      }
    }

    return Response.json(result);

  } catch (error) {
    console.error('LunaChat fatal error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});