// ─────────────────────────────────────────────────────────────────────────────
// CycleMind Wiki Reader — frontend utility
// Mirrors the inline WIKI_EXCERPTS in functions/lunaChat.
// Provides structured excerpts from knowledge-base/wiki/ as a searchable JS object.
// ─────────────────────────────────────────────────────────────────────────────

export const WIKI_INDEX = {
  pmdd: {
    title: 'PMDD Overview',
    keywords: ['pmdd', 'premenstrual dysphoric', 'luteal phase', 'drsp', 'severe pms', 'pms mood'],
    overview: `PMDD (Premenstrual Dysphoric Disorder) affects 3–8% of reproductive-age women. It is caused by heightened brain sensitivity to normal hormone fluctuations — not abnormal hormone levels. Symptoms occur exclusively in the luteal phase and resolve within days of menstruation.`,
    diagnosis: `Requires prospective daily tracking for 2 full cycles using the DRSP. At least 5 symptoms must be present, including ≥1 core mood symptom (marked mood swings, irritability/anger, depressed mood, or anxiety/tension). Symptoms must be absent or minimal in the follicular phase.`,
    treatment: `First-line: SSRIs (sertraline, fluoxetine) continuous or luteal-phase-only dosing; calcium 1200 mg/day; CBT. Second-line: drospirenone-containing OCP (Yaz). Third-line: GnRH agonists with add-back HRT. Lifestyle: reduce caffeine, alcohol, refined sugar; increase aerobic exercise, sleep hygiene, magnesium supplementation.`,
    clinical_notes: `Intermittent luteal-phase SSRI dosing is as effective as daily dosing for PMDD and carries fewer side effects. SSRIs work faster for PMDD (1 cycle) than for depression (4–6 weeks) via neurosteroid modulation.`,
  },
  postpartum_depression: {
    title: 'Postpartum Depression',
    keywords: ['postpartum depression', 'ppd', 'baby blues', 'postnatal depression', 'after birth depression', 'new mom sad'],
    overview: `PPD affects 10–15% of new mothers and is distinct from baby blues (which resolve by day 10–14). Onset is typically within 4 weeks but can occur within the first year postpartum.`,
    diagnosis: `Screen with EPDS (Edinburgh Postnatal Depression Scale) — score ≥10 warrants evaluation. Core symptoms: persistent sadness, anhedonia, guilt, anxiety, difficulty bonding, sleep/appetite changes, difficulty concentrating.`,
    treatment: `SSRIs (sertraline preferred — lowest milk transfer RID <3%). Psychotherapy: CBT or IPT. Severe/refractory: brexanolone (Zulresso) or zuranolone (Zurzuvae). Breastfeeding is compatible with most SSRIs.`,
    clinical_notes: `The most powerful predictor of PPD is prior depressive episodes. Sleep deprivation is a key modifiable risk factor — sleep protection (partner sharing night feeds) is part of prevention.`,
  },
  postpartum_psychosis: {
    title: 'Postpartum Psychosis',
    keywords: ['postpartum psychosis', 'postnatal psychosis', 'hearing voices after birth', 'confused after birth'],
    overview: `Psychiatric emergency. Affects 1–2 per 1,000 births. Typically presents within the first 2 weeks postpartum with rapid onset confusion, hallucinations (often auditory), delusions about the baby, severe insomnia, disorganized behavior.`,
    diagnosis: `Distinguished from PPD by loss of insight, psychotic features, and rapid deterioration. Most cases represent bipolar disorder triggered by postpartum estrogen crash.`,
    treatment: `Requires immediate hospitalization. Mood stabilizer (lithium preferred) + antipsychotic. Women with Bipolar I have 25–50% risk — prophylactic lithium started immediately postpartum strongly recommended.`,
    clinical_notes: `Crisis escalation required. Never manage postpartum psychosis remotely. Refer to ER immediately.`,
  },
  postpartum_ocd: {
    title: 'Postpartum OCD',
    keywords: ['postpartum ocd', 'intrusive thoughts baby', 'harm obsessions', 'scary thoughts new mom'],
    overview: `Affects 2–4% of new parents. Ego-dystonic intrusive thoughts about harming the baby — highly distressing thoughts the mother would never act on. Distinct from postpartum psychosis (insight is intact in OCD).`,
    treatment: `CBT with Exposure and Response Prevention (ERP) is first-line. SSRIs at therapeutic doses (higher than depression doses) for moderate-severe cases. The presence of these thoughts and the distress they cause is protective — it distinguishes OCD from psychosis.`,
    clinical_notes: `Having intrusive thoughts does not predict harm. Reassurance is important but should be balanced with reducing reassurance-seeking compulsions.`,
  },
  postpartum_anxiety: {
    title: 'Postpartum Anxiety',
    keywords: ['postpartum anxiety', 'ppa', 'new mom anxiety', 'worried about baby postpartum'],
    overview: `As common as PPD — affects up to 20% of new mothers. Types: GAD (excessive worry), panic disorder, PTSD from birth trauma, postpartum OCD. Often overlooked because attention focuses on depression.`,
    treatment: `CBT, EMDR for birth trauma, SSRIs (sertraline preferred). Breastfeeding-safe options available. Screen with EPDS items 3–5 (anxiety subscale) or GAD-7.`,
    clinical_notes: `Birth trauma PTSD: flashbacks of delivery, avoidance of hospitals/medical settings, hyperarousal. EMDR and trauma-focused CBT are highly effective.`,
  },
  pregnancy_depression: {
    title: 'Perinatal (Antenatal) Depression',
    keywords: ['depression in pregnancy', 'antenatal depression', 'prenatal depression', 'pregnant and depressed', 'antidepressant pregnancy'],
    overview: `Affects 10–15% of pregnant women. Significantly under-recognized because pregnancy is assumed to be a happy time. Untreated antenatal depression is the strongest predictor of PPD.`,
    treatment: `Psychotherapy (CBT or IPT) first-line for mild-moderate. SSRIs (sertraline preferred) for moderate-severe or when psychotherapy is insufficient. Risk of untreated depression to mother and fetus outweighs small SSRI risks for most cases. Neonatal Adaptation Syndrome is transient and self-limiting.`,
    clinical_notes: `Risks of untreated antenatal depression: preterm birth, low birth weight, poor prenatal care engagement, impaired maternal-fetal bonding. Never stop antidepressants abruptly during pregnancy without clinical guidance.`,
  },
  pregnancy_anxiety: {
    title: 'Pregnancy Anxiety Disorders',
    keywords: ['anxiety in pregnancy', 'pregnant and anxious', 'panic pregnancy', 'fear childbirth', 'tokophobia'],
    overview: `Anxiety disorders are the most common psychiatric conditions in pregnancy (15–21%). GAD, panic disorder, OCD, and PTSD all occur and are under-diagnosed.`,
    treatment: `CBT first-line. SSRIs safe and effective when psychotherapy insufficient. Benzodiazepines: avoid if possible; short-term low-dose acceptable for acute anxiety (lorazepam preferred). Birth plan for women with trauma history: communication preferences, permission protocols.`,
    clinical_notes: `Tokophobia (severe fear of childbirth) is treatable with CBT and detailed birth planning with a supportive midwife or OB.`,
  },
  bipolar: {
    title: 'Bipolar Disorder — Reproductive Context',
    keywords: ['bipolar', 'mania', 'hypomania', 'mood stabilizer', 'lithium pregnancy', 'lamotrigine pregnancy'],
    overview: `Bipolar disorder has the highest postpartum relapse risk of any psychiatric condition. Women with Bipolar I have a 25–50% risk of postpartum psychosis if mood stabilizers are stopped.`,
    clinical_notes: `Lithium: highly effective prophylactically postpartum; started immediately after delivery dramatically reduces relapse risk; compatible with careful breastfeeding monitoring. Lamotrigine: levels drop 50–65% during pregnancy due to increased renal clearance — proactive dose increases needed. Valproate: CONTRAINDICATED in pregnancy (9–10% major malformation rate, neural tube defects, significant cognitive impairment in exposed children). Never stop mood stabilizers without psychiatric guidance.`,
  },
  perimenopause: {
    title: 'Perimenopause Mental Health',
    keywords: ['perimenopause', 'peri-menopause', 'hot flash', 'night sweats', 'irregular period menopause', 'perimenopausal mood'],
    overview: `Perimenopause is the 4–8 year hormonal transition preceding menopause. Erratic estrogen fluctuations (not simply decline) drive symptoms. Duration averages 4–6 years. Women with prior PMDD or perinatal depression have higher risk for perimenopausal depression.`,
    symptoms: `Vasomotor symptoms (hot flashes, night sweats), sleep disruption, mood changes, irritability, brain fog, depression, anxiety, vaginal dryness, decreased libido, joint pain, irregular cycles.`,
    treatment: `MHT (menopausal hormone therapy) addresses vasomotor symptoms and depression. SSRIs/SNRIs effective for mood even without MHT. CBT-I for insomnia. Non-hormonal option: fezolinetant (NK3R antagonist) for hot flashes.`,
    clinical_notes: `PMDD often intensifies during perimenopause due to more dramatic hormone swings. FSH testing is not reliable for confirming perimenopause — diagnosis is clinical, based on symptoms and irregular cycles in the appropriate age range.`,
  },
  menopause: {
    title: 'Menopause & Hormone Therapy',
    keywords: ['menopause', 'postmenopause', 'hrt', 'hormone therapy', 'mht', 'gsm', 'vaginal dryness menopause'],
    overview: `Menopause confirmed after 12 consecutive months of amenorrhea. Average age 51. MHT remains most effective treatment for vasomotor symptoms and prevents bone loss. WHI findings have been recontextualized — transdermal estrogen + micronized progesterone has a favorable safety profile for most healthy women.`,
    treatment: `MHT forms: patches, gels, pills, sprays, rings. GSM (genitourinary syndrome): ultra-low-dose vaginal estrogen is safe and highly effective. Non-hormonal: fezolinetant, SSRIs, SNRIs for vasomotor symptoms; CBT for mood and insomnia.`,
    clinical_notes: `Estrogen-only HRT (post-hysterectomy) has minimal/no increased breast cancer risk. Combined HRT risk is comparable to 1 glass wine/day and must be weighed against quality-of-life and bone/cardiovascular benefits.`,
  },
  fertility: {
    title: 'Fertility & Mental Health',
    keywords: ['fertility', 'ivf', 'trying to conceive', 'ttc', 'infertility', 'egg freezing'],
    overview: `Infertility affects 10–15% of couples. Psychological impact is comparable to serious medical diagnoses — depression and anxiety rates are significantly elevated. Each IVF cycle brings distinct emotional stages.`,
    treatment: `CBT, mind-body programs (Domar protocol), and RESOLVE support groups are evidence-based. SSRIs for comorbid depression do not negatively affect IVF outcomes. Rainbow pregnancy anxiety (after loss) often needs additional psychological support.`,
    clinical_notes: `After failed IVF cycles, grief is cumulative. The two-week wait after embryo transfer is a particularly high-anxiety period. Validated screening: SCREENIVF battery.`,
  },
  pregnancy_loss: {
    title: 'Pregnancy Loss & Grief',
    keywords: ['miscarriage', 'pregnancy loss', 'stillbirth', 'tfmr', 'ectopic', 'rainbow pregnancy'],
    overview: `Pregnancy loss includes miscarriage, stillbirth, TFMR, neonatal death, ectopic pregnancy. Grief is real at any gestational age. Complicated grief (Prolonged Grief Disorder) affects a subset and responds to grief-focused CBT or IPT.`,
    clinical_notes: `PTSD is common after stillbirth (up to 30%). Rainbow pregnancies (subsequent pregnancies after loss) carry heightened anxiety and hypervigilance. Support groups: SHARE, Star Legacy Foundation, Support Organization for TFMR.`,
  },
  endometriosis: {
    title: 'Endometriosis & Mental Health',
    keywords: ['endometriosis', 'endo pain', 'painful periods', 'pelvic pain', 'endometriosis depression'],
    overview: `Affects 6–10% of reproductive-age women with an average 7–10 year diagnostic delay. Depression and anxiety are 2–3× more prevalent, largely driven by chronic pain and medical dismissal.`,
    treatment: `ACT (Acceptance and Commitment Therapy) and CBT for chronic pain are evidence-based. Pelvic floor physical therapy for dyspareunia. Hormonal suppression (continuous OCP, progestins, GnRH agonists) reduces pain. Validate that dismissed symptoms are real.`,
  },
  pcos: {
    title: 'PCOS & Mental Health',
    keywords: ['pcos', 'polycystic', 'insulin resistance', 'pcos mental health', 'pcos depression'],
    overview: `PCOS is the most common endocrine disorder in reproductive-age women (8–13%). Mental health comorbidities: depression, anxiety, and binge-eating disorder are 2–3× elevated. Body image disturbance (hirsutism, weight, acne) is a major driver.`,
    treatment: `CBT for mood and body image; HAES-aligned therapy; SSRIs for depression. Metformin for insulin resistance. Lifestyle: 5–10% weight loss restores cycles in ~50% of overweight women. Frame as endocrine/metabolic condition, not lifestyle failure.`,
  },
  contraception: {
    title: 'Contraception & Mental Health',
    keywords: ['birth control mood', 'ocp depression', 'iud mood', 'hormonal contraception mood', 'pill depression'],
    overview: `Hormonal contraceptives significantly alter the neuroendocrine environment. Danish cohort study (Skovlund 2016): increased depression risk particularly with progestin-only methods and in adolescents.`,
    clinical_notes: `Drospirenone (in Yaz) is most favorable for mood in PMDD; etonogestrel implant had the highest signal for depression. Screen PHQ-9 before prescribing and at 3 months in mood-vulnerable patients. Copper IUD: hormone-free option. Combined OCPs with drospirenone are FDA-approved for PMDD.`,
  },
  ssri: {
    title: 'Luteal-Phase SSRI Dosing',
    keywords: ['ssri', 'sertraline', 'fluoxetine', 'antidepressant cycle', 'ssri pmdd', 'luteal phase medication'],
    overview: `SSRIs are first-line for PMDD, perinatal depression, PPD, and anxiety disorders. In PMDD, they work via rapid neurosteroid modulation — which is why intermittent luteal-phase dosing is effective (onset within 1 cycle, faster than antidepressant effect).`,
    clinical_notes: `Sertraline preferred in pregnancy and breastfeeding (RID <3%, lowest infant exposure). Intermittent luteal-phase dosing: start day 14 of cycle, stop day 2 of period. As effective as daily dosing for PMDD with fewer side effects.`,
  },
  breastfeeding: {
    title: 'Psychotropics During Breastfeeding',
    keywords: ['breastfeeding medication', 'nursing antidepressant', 'lactation medication', 'breastfeed ssri'],
    overview: `Most psychotropics can be used while breastfeeding with appropriate monitoring. Key metric: Relative Infant Dose (RID) — <10% generally considered safe.`,
    clinical_notes: `Sertraline and paroxetine: lowest breast milk transfer (RID <1–3%) — preferred antidepressants. Quetiapine: RID <1% — preferred antipsychotic if needed. Lithium: RID 12–30% — requires close monitoring. Resources: LactMed (NIH, free), Infant Risk Center (1-806-352-2519).`,
  },
  sleep: {
    title: 'Sleep & Reproductive Mental Health',
    keywords: ['insomnia', 'sleep problems', 'cant sleep', 'waking up cycle', 'sleep cycle', 'sleep pmdd'],
    overview: `Sleep disruption is both a symptom and a driver of mood disorders across the reproductive lifespan. In the luteal phase, progesterone changes alter sleep architecture. Postpartum sleep deprivation is the single most powerful mood destabilizer.`,
    treatment: `CBT-I (Cognitive Behavioral Therapy for Insomnia) is first-line and highly effective. Sleep protection (partner sharing night feeds) is a critical PPD prevention strategy. HRT can dramatically improve sleep in perimenopause.`,
  },
  anxiety: {
    title: 'Anxiety in Reproductive Context',
    keywords: ['anxiety', 'panic attack', 'gad', 'anxious', 'worry', 'nervous'],
    overview: `Anxiety disorders are the most common psychiatric conditions in women, with a significant hormonal component. Premenstrual anxiety worsening is common. Perinatal anxiety is more prevalent than perinatal depression.`,
    treatment: `CBT first-line for all anxiety disorders. SSRIs effective for chronic anxiety. Acute coping: 4-7-8 breathing, 5-4-3-2-1 grounding (5 things seen, 4 touched, 3 heard, 2 smelled, 1 tasted), progressive muscle relaxation.`,
  },
  depression: {
    title: 'Depression in Women',
    keywords: ['depression', 'depressed', 'sad', 'hopeless', 'worthless', 'empty', 'low mood', 'anhedonia'],
    overview: `Depression in women is twice as prevalent as in men, with the gender gap emerging at puberty — strongly implicating hormonal biology. Depression is a brain-based condition with effective treatments.`,
    treatment: `CBT, IPT, behavioral activation, SSRIs. Lifestyle adjuncts with strong evidence: exercise (equivalent to medication in mild-moderate), omega-3 EPA (1–2 g/day), sleep hygiene, light therapy. Always screen for bipolar before starting antidepressants.`,
  },
  trauma: {
    title: 'Trauma & Reproductive Health',
    keywords: ['trauma', 'ptsd', 'birth trauma', 'abuse', 'assault', 'domestic violence'],
    overview: `Trauma — including childhood abuse, sexual assault, IPV, and birth trauma — has profound reproductive mental health implications. PTSD affects 6–8% of the general obstetric population.`,
    treatment: `EMDR, CPT (Cognitive Processing Therapy), TF-CBT. Birth trauma PTSD responds well to birth debriefing and EMDR. IPV screening (HITS, AAS) is part of standard prenatal care. Trauma-informed care: ask permission before procedures, explain every step, support patient control.`,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// readWikiContext — search wiki for relevant content by query + optional topic hint
// Returns the most relevant wiki entry's content as a formatted string, or null.
// ─────────────────────────────────────────────────────────────────────────────
export function readWikiContext(query, topicHint = null) {
  const lower = query.toLowerCase();

  let best = null;
  let bestScore = -1;

  for (const [key, entry] of Object.entries(WIKI_INDEX)) {
    // If topicHint provided, only return that topic
    if (topicHint && key !== topicHint) continue;

    const score = entry.keywords.reduce((acc, kw) => {
      if (lower.includes(kw)) return acc + kw.split(' ').length;
      return acc;
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      best = { key, entry, score };
    }
  }

  if (!best || best.score === 0) return null;

  const e = best.entry;
  const parts = [];
  if (e.overview)        parts.push(`**Overview:** ${e.overview}`);
  if (e.diagnosis)       parts.push(`**Diagnosis:** ${e.diagnosis}`);
  if (e.symptoms)        parts.push(`**Symptoms:** ${e.symptoms}`);
  if (e.treatment)       parts.push(`**Treatment:** ${e.treatment}`);
  if (e.screening)       parts.push(`**Screening:** ${e.screening}`);
  if (e.clinical_notes)  parts.push(`**Clinical Notes:** ${e.clinical_notes}`);

  return {
    topic: best.key,
    title: e.title,
    content: parts.join('\n\n'),
  };
}