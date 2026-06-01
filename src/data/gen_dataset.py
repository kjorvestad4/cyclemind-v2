#!/usr/bin/env python3
"""
Luna SFT Dataset Generator — produces data/luna-finetune.jsonl
Run: python data/gen_dataset.py
"""
import json, random, pathlib
from gen_core import (
    OUT, PERSONA_FULL, PERSONA_SHORT, DISCLAIMER,
    CRISIS_RESPONSE, PP_PSYCHOSIS_RESPONSE, d, ex, mt
)

# ── Knowledge blocks ──────────────────────────────────────────────────────────

PMDD_MECH = d(
    "PMDD is not caused by abnormal hormone levels — your labs can be completely normal. "
    "It's caused by **abnormal central sensitivity** to normal hormonal fluctuations. "
    "The key mechanism involves allopregnanolone, a progesterone metabolite that modulates "
    "GABA-A receptors. In women with PMDD, this neurosteroid modulation functions abnormally "
    "and the serotonin system is impaired during the late luteal phase. The same hormonal "
    "changes most people barely notice produce significant neurological disruption in PMDD."
)

PMDD_TX = d(
    "Treatment follows a stepped approach:\n\n"
    "**First-line (strongest evidence)**\n"
    "- SSRIs (sertraline, fluoxetine, escitalopram) — taken continuously or just in the "
    "luteal phase. Uniquely, SSRIs work within days for PMDD rather than weeks.\n"
    "- Calcium 1,200 mg/day — reduces symptoms ~30% in RCTs\n"
    "- Regular aerobic exercise (150 min/week)\n"
    "- CBT targeting luteal-phase thought patterns\n\n"
    "**Second-line**\n"
    "- OCP with drospirenone (Yaz) — FDA-approved for PMDD; suppresses the cycle\n\n"
    "**Third-line (severe/refractory)**\n"
    "- GnRH agonists (medical menopause) with estrogen/progesterone add-back\n\n"
    "Your provider can help determine the best starting point for your situation."
)

LUTEAL_DOSING = d(
    "Luteal-phase dosing is based on a key pharmacological fact: SSRIs work within "
    "**hours to days** for PMDD (unlike depression, which takes 4–6 weeks), because the "
    "mechanism is different — rapid neurosteroid modulation rather than cumulative serotonin changes.\n\n"
    "This means you don't need daily dosing. **Luteal-phase dosing** means starting approximately "
    "14 days before your expected period (cycle day 14–16) and stopping when menstruation begins. "
    "Advantages: lower medication exposure, fewer side effects in the follicular phase, and it "
    "naturally aligns with a cyclical condition.\n\n"
    "Both continuous and luteal-phase dosing are comparably effective. The choice depends on "
    "cycle regularity, preferences, and whether you have between-cycle symptoms."
)

PPD_OVERVIEW = d(
    "Postpartum depression affects 10–15% of new mothers, beginning at any point in the first "
    "year — not just the early weeks. Unlike baby blues (resolve by day 14), PPD persists and "
    "causes significant functional impairment.\n\n"
    "Key symptoms: persistent sadness or emptiness, difficulty feeling connected to the baby, "
    "excessive guilt, fatigue beyond newborn demands, trouble sleeping when baby sleeps, "
    "and in severe cases, thoughts of self-harm.\n\n"
    "PPD is highly treatable with CBT, IPT, SSRIs, and in specific cases the neurosteroid "
    "agents brexanolone or zuranolone. The most important step is telling your provider."
)

PERI_OVERVIEW = d(
    "Perimenopause is the hormonal transition before menopause, typically spanning 4–8 years "
    "beginning around age 47. It's characterized by erratic estrogen fluctuations — not just "
    "decline — which drive hot flashes, night sweats, sleep disruption, mood changes, and brain fog.\n\n"
    "Women in the menopausal transition have a 2–4x increased risk of depression. This can "
    "occur without any prior psychiatric history. Women with prior PMDD are at higher risk.\n\n"
    "Diagnosis is clinical — based on symptoms and age. A single FSH level is unreliable "
    "because it fluctuates too much. Treatment: SSRIs/SNRIs (first-line for mood), "
    "MHT for vasomotor symptoms and mood."
)

MHT_CONTENT = d(
    "Menopausal hormone therapy (MHT) is the most effective treatment for vasomotor symptoms "
    "and GSM. The WHI findings that caused widespread concern applied to older women using "
    "oral synthetic hormones — not to younger women using transdermal estradiol with micronized "
    "progesterone.\n\n"
    "**Current consensus (NAMS, Endocrine Society):** For healthy women under 60 or within "
    "10 years of menopause onset with moderate-severe symptoms, benefits generally outweigh risks.\n\n"
    "Preferred: **transdermal estradiol** (patch, gel) + **micronized progesterone** — both "
    "bioidentical, more favorable safety profile than older WHI formulations.\n\n"
    "Contraindications: estrogen-sensitive breast cancer, active clots, recent MI/stroke."
)

FERTILITY_CONTENT = d(
    "Infertility carries psychological weight comparable to serious medical diagnoses — "
    "grief, identity loss, relationship strain, and isolation are all real and common.\n\n"
    "IVF has distinct emotional stages: stimulation (hormonal mood effects), retrieval, "
    "embryo development, and the two-week wait — profoundly anxiety-provoking. Failed cycles "
    "produce genuine grief that intensifies with each subsequent attempt.\n\n"
    "Evidence-based support: CBT, Domar Mind/Body program, RESOLVE peer support (resolve.org). "
    "Pregnancy after infertility carries higher anxiety throughout — well-documented and "
    "not a bad sign about the pregnancy."
)

LOSS_CONTENT = d(
    "Pregnancy loss — miscarriage, stillbirth, TFMR, neonatal death — causes profound grief "
    "regardless of gestational age. The grief doesn't scale neatly with weeks — by any "
    "point in a wanted pregnancy, there is a baby, a future, a relationship lost.\n\n"
    "PTSD affects up to 30% of women after stillbirth. Depression and complicated grief "
    "are common across all loss types.\n\n"
    "Support: SHARE (nationalshare.org), Star Legacy Foundation (starlegacyfoundation.org), "
    "A Heartbreaking Choice (aheartbreakingchoice.com) for TFMR.\n\n"
    "Rainbow pregnancies carry heightened anxiety and often benefit from additional support."
)

CYCLE_PHASES = d(
    "The menstrual cycle has distinct phases with predictable mood effects:\n\n"
    "- **Menstrual (days 1–5):** Low hormones; mood often lifts by day 2–3\n"
    "- **Follicular (days 1–13):** Rising estrogen → improving mood, energy, motivation\n"
    "- **Ovulatory (~days 13–15):** Estrogen peak → often best mood, energy, libido\n"
    "- **Early luteal (days 15–22):** Progesterone rises → generally stable\n"
    "- **Late luteal (days 22–28):** Hormone withdrawal → PMDD/PMS vulnerability — serotonin "
    "drops, GABA-A signaling changes, cortisol reactivity rises\n\n"
    "Daily logging in CycleMind reveals your personal pattern within this framework — "
    "far more useful than knowing the population average."
)

SLEEP_CONTENT = d(
    "Sleep disruption is both a symptom and driver of mood disorders across the reproductive lifespan.\n\n"
    "CBT-I (Cognitive Behavioral Therapy for Insomnia) is first-line and works better long-term than medication:\n"
    "- Consistent wake time (anchors circadian rhythm)\n"
    "- Stimulus control: bed for sleep only; get up if awake >20 minutes\n"
    "- Cool, dark room (65–68°F)\n"
    "- No screens 60 min before bed\n"
    "- Avoid daytime naps >30 minutes\n\n"
    "Postpartum: **sleep protection** (partner sharing night feeds for one 4-hour consolidated block) "
    "is one of the most evidence-based PPD prevention interventions available."
)

OCD_CONTENT = d(
    "What you're describing sounds like postpartum OCD — specifically harm obsessions, "
    "one of the most common and misunderstood perinatal presentations.\n\n"
    "These thoughts are **ego-dystonic** — completely foreign to who you are, horrifying to you, "
    "and the distress you feel about them is actually protective. People with postpartum OCD "
    "do not act on these thoughts. This is fundamentally different from postpartum psychosis, "
    "where insight is impaired.\n\n"
    "Postpartum OCD affects up to 4% of new parents and responds very well to CBT with "
    "Exposure and Response Prevention (ERP). Many people experience substantial relief.\n\n"
    "Please share this with a mental health provider. You don't have to carry it alone."
)

BIPOLAR_PREG = d(
    "Bipolar disorder in the perinatal period requires careful planning — ideally with a "
    "reproductive psychiatrist before conception.\n\n"
    "Key facts:\n"
    "- Postpartum carries the highest relapse risk — women with bipolar I have 25–50% risk "
    "of postpartum psychosis without prophylaxis\n"
    "- **Valproate is contraindicated in pregnancy** (9–10% major malformation rate, cognitive "
    "impairment in exposed children)\n"
    "- **Lithium:** Can often be continued with monitoring; relapse risk off lithium often "
    "greater than medication risk\n"
    "- **Lamotrigine:** Levels drop 50–65% during pregnancy due to increased clearance — "
    "dose increases and frequent monitoring essential\n"
    "- **Prophylactic lithium** started immediately postpartum dramatically reduces relapse risk\n\n"
    "Planning with a specialist before pregnancy is the single most protective step."
)

TRAUMA_CONTENT = d(
    "Trauma — childhood abuse, sexual assault, IPV, birth trauma — has profound reproductive "
    "mental health implications.\n\n"
    "IPV affects 1 in 4 women and often escalates during pregnancy. Routine IPV screening "
    "at all prenatal visits is standard of care.\n\n"
    "Birth trauma PTSD affects 3–6% of women after childbirth, presenting with flashbacks, "
    "avoidance of birth reminders, and hyperarousal — often co-occurring with PPD.\n\n"
    "Evidence-based treatments: EMDR (strongest evidence for birth trauma), CPT, "
    "Trauma-Focused CBT, SSRIs (sertraline and paroxetine FDA-approved for PTSD).\n\n"
    "Trauma-informed care: ask permission before procedures, explain every step, "
    "support patient control throughout. If experiencing IPV: National DV Hotline 1-800-799-7233."
)

BFMEDS = d(
    "Most psychotropic medications can be used while breastfeeding with appropriate monitoring. "
    "The key metric is the Relative Infant Dose (RID) — the percentage of maternal dose "
    "the infant receives. Under 10% is generally considered acceptable.\n\n"
    "**Preferred antidepressants:**\n"
    "- Sertraline: RID <3% — most studied, consistently preferred\n"
    "- Paroxetine: RID <2% — very low transfer\n"
    "- Escitalopram: RID ~8% — acceptable\n\n"
    "**Antipsychotics:** Quetiapine has very low transfer (<1%) and is preferred if needed.\n\n"
    "**Lithium:** Significant transfer (RID 12–30%) — used at some centers with close infant monitoring.\n\n"
    "Resources: LactMed (NIH, free), Infant Risk Center (1-806-352-2519). "
    "A healthy, treated mother is the most important factor for baby's wellbeing."
)

PCOS_CONTENT = d(
    "PCOS is the most common endocrine disorder in reproductive-age women (8–13%) and carries "
    "significant mental health burden: depression, anxiety, and binge-eating disorder are all "
    "2–3x more prevalent than in the general population.\n\n"
    "The psychological impact of androgenic symptoms — hirsutism, acne, weight changes — "
    "is a major driver of body image disturbance.\n\n"
    "PCOS is a medical condition with biological drivers — not a lifestyle failure.\n\n"
    "Integrated treatment: lifestyle (5–10% weight loss restores cycles in ~50% of overweight "
    "women with PCOS), CBT for mood and body image, SSRIs for depression, metformin for insulin "
    "resistance, letrozole for ovulation induction.\n\n"
    "PCOS is the most common cause of anovulatory infertility — but most people with PCOS "
    "can achieve pregnancy, often with relatively straightforward interventions."
)

ENDO_CONTENT = d(
    "Endometriosis affects 6–10% of reproductive-age women with an average diagnostic delay "
    "of 7–10 years. Depression and anxiety are 2–3x more prevalent, largely driven by chronic "
    "pain and years of being told 'it's just bad periods.'\n\n"
    "Medical invalidation directly contributes to psychological distress.\n\n"
    "Evidence-based psychological approaches: ACT (best evidence for chronic pain acceptance), "
    "CBT for chronic pain, pelvic floor physical therapy.\n\n"
    "Medical management: hormonal suppression (continuous OCP, progestins, GnRH agonists), "
    "excision surgery by a specialist (better long-term outcomes than ablation).\n\n"
    "Your pain is real. You have the right to have it taken seriously."
)

CBT_CONTENT = d(
    "CBT (Cognitive Behavioral Therapy) targets the relationship between thoughts, emotions, "
    "and behaviors. Time-limited (8–20 sessions), skill-focused, homework-based.\n\n"
    "**For PMDD:** Targets symptom catastrophizing, behavioral avoidance in luteal phase, "
    "pre-luteal stress planning, and interpersonal communication about cycles.\n\n"
    "**For perinatal depression/anxiety:** CBT and IPT (Interpersonal Therapy) are both "
    "first-line evidence-based options. IPT focuses on role transitions and relationship "
    "changes — well-suited to new parenthood.\n\n"
    "**For OCD:** CBT with ERP (Exposure and Response Prevention) is first-line.\n\n"
    "**For birth trauma:** EMDR has strongest evidence; CPT also effective.\n\n"
    "**ACT** (Acceptance and Commitment Therapy) uses mindfulness and values rather than "
    "thought challenging — particularly useful for chronic pain and fertility grief."
)

OMEGA3 = d(
    "For mood and depression, evidence points to **EPA** as the active component — not DHA. "
    "Use an EPA:DHA ratio of at least 2:1, at 1–2 grams of EPA per day.\n\n"
    "DHA is critical for fetal brain development in pregnancy but doesn't drive the "
    "antidepressant effect. Most prenatal vitamins contain DHA but not enough EPA for "
    "mood benefit — a separate EPA-dominant supplement is needed.\n\n"
    "Label reading: look at actual EPA content per serving, not total fish oil. A 1,000 mg "
    "fish oil capsule may contain only 180 mg EPA.\n\n"
    "Algae oil is a vegan alternative. Safe in pregnancy and breastfeeding at typical doses. "
    "Over 3g/day, discuss with your provider. Adjunct only — not a replacement for clinical treatment."
)

EPDS_CONTENT = d(
    "The EPDS (Edinburgh Postnatal Depression Scale) is the gold-standard screening tool "
    "for perinatal depression — validated during pregnancy AND postpartum.\n\n"
    "10-item self-report on the past 7 days. Each item scored 0–3; total range 0–30.\n\n"
    "**Scoring:**\n"
    "- ≥10: Possible depression — warrants clinical evaluation\n"
    "- ≥13: Likely depression — referral recommended\n"
    "- Question 10 (self-harm) any score >0: Immediate safety assessment required\n\n"
    "EPDS is a screening tool, not a diagnostic tool — a positive screen means further "
    "evaluation is needed, not that depression is confirmed."
)

DRSP_CONTENT = d(
    "The DRSP (Daily Record of Severity of Problems) is the gold-standard tool for "
    "prospectively diagnosing PMDD. Rate 21 symptoms daily on 1–6 for at least 2 cycles.\n\n"
    "Domains: affective (depression, anxiety, mood swings, irritability), cognitive "
    "(concentration, overwhelmed), physical (cramps, bloating, breast tenderness), "
    "functional (work, social, relationship interference).\n\n"
    "PMDD pattern: ≥5 symptoms (at least 1 affective) scoring markedly higher in late "
    "luteal phase vs. follicular, with luteal average ≥30% higher.\n\n"
    "CycleMind's daily log maps directly to these domains — consistent logging builds "
    "this dataset for clinical use."
)

GSM_CONTENT = d(
    "Genitourinary syndrome of menopause (GSM) affects vaginal, vulvar, and lower urinary "
    "tissues due to estrogen deficiency. Unlike hot flashes, GSM typically **worsens "
    "progressively** without treatment.\n\n"
    "Symptoms: vaginal dryness, itching, burning, pain during sex, urinary urgency, "
    "frequency, and recurrent UTIs.\n\n"
    "Treatment (highly effective):\n"
    "- **Ultra-low dose local estrogen** (cream, tablet, ring, suppository) — restores "
    "tissue locally with minimal systemic absorption; safe for most women\n"
    "- Lubricants (for sexual activity) and moisturizers (regular maintenance)\n"
    "- Ospemifene or Intrarosa (vaginal DHEA) — alternatives to local estrogen\n\n"
    "GSM is significantly undertreated because many women accept it as inevitable. "
    "Very worth discussing with your provider."
)

# ── Build examples ────────────────────────────────────────────────────────────

def build():
    data = []

    # ── PMDD ─────────────────────────────────────────────────────────────────
    pmdd_user_ids = [
        ("I feel like a different person the week before my period. Could this be PMDD?", PMDD_MECH),
        ("Every month around day 22 I crash emotionally. Is there a name for this?", PMDD_MECH),
        ("My mood is predictably terrible before my period. Is this hormonal?", PMDD_MECH),
        ("Why do I feel so different in the 2 weeks before my period?", PMDD_MECH),
        ("I suspect PMDD. How would I know for sure?", PMDD_MECH),
        ("My husband says I change personalities before my period.", PMDD_MECH),
        ("I have PMDD symptoms but my hormones tested normal.", PMDD_MECH),
        ("What actually causes PMDD?", PMDD_MECH),
        ("Is PMDD caused by low progesterone?", PMDD_MECH),
        ("What is allopregnanolone and how does it relate to PMDD?", PMDD_MECH),
        ("What are treatment options for PMDD?", PMDD_TX),
        ("My doctor wants to try SSRIs for PMDD. How do they work?", PMDD_TX),
        ("PMDD is ruining my life. What can be done?", PMDD_TX),
        ("I've tried SSRIs and they didn't work for PMDD. What's next?", PMDD_TX),
        ("What is luteal-phase SSRI dosing?", LUTEAL_DOSING),
        ("My doctor mentioned intermittent dosing for PMDD. What is that?", LUTEAL_DOSING),
        ("Can I take sertraline just before my period for PMDD?", LUTEAL_DOSING),
        ("Does calcium actually help PMDD?", d(
            "Yes — multiple RCTs including a large study in AJOG showed calcium at 1,200 mg/day "
            "reduces PMDD symptoms by approximately 30% compared to placebo. The effect is "
            "consistent across studies.\n\n"
            "Calcium appears to influence hypothalamic mood-regulating pathways in the luteal "
            "phase. Calcium citrate (better absorbed) split across meals is a practical approach.\n\n"
            "Magnesium 200–360 mg/day has supporting evidence for fluid retention and cramping. "
            "Neither fully treats clinically significant PMDD alone, but both are reasonable, "
            "low-risk adjuncts. Discuss with your provider before starting supplements."
        )),
        ("Can exercise help with PMDD?", d(
            "Yes — meta-analyses show regular aerobic exercise reduces PMDD symptom severity "
            "through serotonin/endorphin release, BDNF upregulation, HPA-axis regulation, and "
            "cortisol reduction — all pathways disrupted in PMDD.\n\n"
            "Recommendation: 150 min/week moderate-intensity aerobic exercise. Most effective "
            "when consistent throughout the entire cycle, not just during symptomatic days. "
            "The luteal phase makes exercise harder — build the habit in the follicular phase "
            "and maintain it through the difficult window. Adjunct to, not replacement for, "
            "clinical treatment."
        )),
        ("Is Yaz effective for PMDD?", d(
            "Yes — Yaz (drospirenone 3mg + ethinyl estradiol 20mcg) is the only OCP with "
            "an FDA indication specifically for PMDD.\n\n"
            "It works by suppressing ovulation, eliminating the luteal-phase hormonal "
            "fluctuations that drive PMDD. Drospirenone is anti-androgenic and has mild "
            "aldosterone-antagonist properties (reduces fluid retention), making it "
            "favorable for physical PMDD symptoms as well.\n\n"
            "Not everyone responds — some women find OCPs worsen mood. Monitor the first "
            "2–3 cycles and share observations with your provider."
        )),
        ("What is DRSP and how do I use it?", DRSP_CONTENT),
        ("How do I track PMDD symptoms properly?", DRSP_CONTENT),
        ("My doctor wants prospective charting. What does that mean?", DRSP_CONTENT),
        ("How long do I need to track before seeing a doctor about PMDD?", DRSP_CONTENT),
        ("I feel like a completely different person before my period.", d(
            "That experience — feeling unlike yourself in the late luteal phase — is one of the "
            "most disorienting aspects of PMDD, and very hard for those around you to understand.\n\n"
            "What you're describing is consistent with what PMDD does neurologically: the late "
            "luteal phase creates a distinct neurochemical state that feels so different from your "
            "baseline because it genuinely is different. It's not a behavioral choice — it's a "
            "predictable, physiologically-driven event tied to specific hormonal windows.\n\n"
            "For partners: framing it as physiological rather than behavioral can help. Showing "
            "cycle data together — when the pattern is visible on a chart — often shifts "
            "understanding faster than verbal explanation. IAPMD (iapmd.org) has partner resources.\n\n"
            "Daily logging in CycleMind through two complete cycles builds concrete evidence "
            "of the pattern for both self-understanding and clinical conversations."
        )),
        ("My PMDD rage is affecting my kids and I feel terrible.", d(
            "The guilt you feel — recognizing the rage felt out of proportion — is meaningful. "
            "It shows this isn't who you are at your core.\n\n"
            "Marked irritability and anger in the late luteal phase is one of the four core "
            "affective criteria for PMDD — a neurochemical event, not a character issue. "
            "Progesterone withdrawal reduces emotional braking and lowers the threat-response "
            "threshold. For women with PMDD, this is amplified significantly.\n\n"
            "Short-term: noticing you're in the luteal window and mentally contextualizing it, "
            "brief vigorous exercise to blunt cortisol spikes, reducing alcohol and caffeine.\n\n"
            "But the more important step: talk to your provider. What you're describing is "
            "severe enough to warrant proper evaluation and treatment."
        )),
        ("PMDD is getting worse every year. Is that normal?", d(
            "Progressive worsening of PMDD over time is well-documented. One model suggests "
            "a 'kindling' effect: each luteal-phase dysregulation episode may sensitize brain "
            "systems, lowering the threshold for future disruption.\n\n"
            "In the late 20s through 30s, PMDD often intensifies. Approaching perimenopause, "
            "increasing estrogen fluctuation can further amplify symptoms.\n\n"
            "Worsening severity is a signal to reassess management. If what worked before "
            "doesn't work now, escalating treatment is appropriate — not a failure. Bring "
            "your logged symptom data to your provider to support that conversation."
        )),
        ("I feel so alone dealing with PMDD.", d(
            "You're far from alone — PMDD affects 3–8% of people with cycles, millions of "
            "people. The challenge is that it's invisible, cyclical, and still frequently "
            "dismissed, which creates profound isolation.\n\n"
            "For community: IAPMD (iapmd.org) has patient communities, peer support, and a "
            "provider directory of PMDD-aware clinicians. Reddit r/PMDD is a large, active "
            "community where people understand the cyclical disruption exactly.\n\n"
            "Finding others who know what it means to lose yourself every luteal phase and "
            "return can be genuinely meaningful alongside clinical treatment."
        )),
        ("My provider dismisses PMDD. What can I do?", d(
            "Provider dismissal of PMDD is frustratingly common despite it being a formal "
            "DSM-5 diagnosis (F32.81).\n\n"
            "Within the current relationship: bring DRSP tracking data — 2 cycles of daily "
            "logs from CycleMind showing the luteal-phase pattern are harder to dismiss. "
            "Reference that PMDD is in DSM-5-TR and there are FDA-approved treatments "
            "(Sarafem, Yaz).\n\n"
            "If dismissal continues: seek a second opinion. IAPMD (iapmd.org) has a provider "
            "directory of PMDD-aware clinicians — OBGYNs, psychiatrists, NPs who specialize "
            "in this. Reproductive psychiatrists are often more knowledgeable about PMDD "
            "than general OBGYNs. You deserve a provider who takes your diagnosis seriously."
        )),
        ("Is St. John's Wort safe for premenstrual mood?", d(
            "St. John's Wort is one case where 'natural' and 'safe' aren't the same thing.\n\n"
            "**The drug interaction problem is serious:** It strongly induces cytochrome P450 "
            "enzymes, reducing blood levels of: oral contraceptives (can cause unintended "
            "pregnancy), SSRIs (combined use risks serotonin syndrome), warfarin, antiretrovirals, "
            "antiseizure medications.\n\n"
            "**Evidence for PMDD:** Much thinner than for SSRIs or calcium. Insufficient data.\n\n"
            "**In pregnancy:** Not recommended — insufficient safety data.\n\n"
            "**Better alternatives:** Calcium 1,200 mg/day has stronger PMDD evidence with "
            "an excellent safety profile and no drug interactions. For persistent symptoms, "
            "proper clinical evaluation is the better path."
        )),
        ("What does the follicular phase feel like for most people?", d(
            "The follicular phase (days 1–13, with rising estrogen) is typically the mood-stable "
            "and often mood-positive part of the cycle.\n\n"
            "Rising estrogen upregulates serotonin and receptor sensitivity, increases dopaminergic "
            "activity (driving motivation and reward), and supports prefrontal cortex function. "
            "Result: improving mood, energy, social motivation, and often cognitive clarity.\n\n"
            "For women with PMDD, the follicular phase is often experienced as 'the real me' — "
            "the baseline self that the late luteal phase disrupts. The stark contrast between "
            "follicular and late luteal is itself diagnostically informative — it suggests a "
            "premenstrual disorder rather than a continuous mood condition."
        )),
        ("I'm on day 14 and feel amazing — is this ovulation?", d(
            "Day 14 is right around ovulation in a typical 28-day cycle — and the mood and "
            "energy peak you're describing is consistent with the ovulatory window.\n\n"
            "Around ovulation, estrogen is at or near its peak, LH surges, and many people "
            "experience peak mood, energy, social motivation, verbal fluency, and libido.\n\n"
            "If you're tracking fertility, this is your highest-fertility window — OPK testing "
            "today or tomorrow will confirm the LH surge. Logging how you feel today in "
            "CycleMind builds your personal ovulatory signature over cycles."
        )),
        ("My anxiety worsens dramatically 10 days before my period.", d(
            "The 'PMDD vs anxiety' framing is actually a false choice — anxiety is one of the "
            "four core affective criteria for PMDD.\n\n"
            "The clinically important distinction:\n"
            "1. **Confined to luteal phase** (resolves within days of period): suggests PMDD\n"
            "2. **Present throughout the cycle, worsened premenstrually**: suggests Premenstrual "
            "Exacerbation (PME) of an underlying anxiety disorder\n\n"
            "This distinction matters for treatment: pure PMDD anxiety often responds to "
            "intermittent luteal-phase SSRI dosing; PME of GAD typically requires continuous "
            "treatment of the underlying disorder.\n\n"
            "Track anxiety level AND cycle day daily in CycleMind for two full cycles — "
            "this pattern distinction will become clear and be useful for your provider."
        )),
        ("What is PME and how is it different from PMDD?", d(
            "PME (Premenstrual Exacerbation) is a pattern where an underlying psychiatric "
            "condition — depression, anxiety, bipolar disorder, ADHD — is present throughout "
            "the cycle but becomes significantly worse in the late luteal phase.\n\n"
            "Key difference from PMDD:\n"
            "- **PMDD:** Symptoms confined to the luteal phase; clear remission in follicular phase\n"
            "- **PME:** Symptoms present throughout, worsened premenstrually; no clean follicular remission\n\n"
            "DRSP tracking over two cycles makes this distinction visible. The clinical "
            "implication matters: PME requires treating the underlying condition continuously, "
            "while pure PMDD can sometimes be managed with cycle-targeted interventions."
        )),
        ("I have ADHD and feel like it gets worse before my period.", d(
            "This is real and well-documented — one of the most under-recognized aspects of "
            "ADHD in women.\n\n"
            "Estrogen upregulates dopamine synthesis and receptor sensitivity in the prefrontal "
            "cortex. When estrogen falls in the late luteal phase, dopaminergic tone drops, and "
            "ADHD symptoms worsen: more distractibility, impulsivity, emotional reactivity, "
            "worse working memory.\n\n"
            "Many women with ADHD describe the luteal phase as when their medication 'stops "
            "working' — when in fact the neurochemical baseline has shifted underneath it.\n\n"
            "This pattern extends to postpartum (massive estrogen drop) and perimenopause "
            "(progressive decline) — both windows when ADHD may worsen or be first recognized. "
            "Discuss these cyclical patterns with your ADHD provider."
        )),
        ("I've been tracking in CycleMind for 3 cycles and can see my mood crashes days 18-26.", d(
            "Three cycles of consistent daily logging with a clear luteal-phase pattern — "
            "this is exactly the kind of data that's clinically actionable.\n\n"
            "What you have: prospective, time-stamped symptom data across 3 cycles showing "
            "a reproducible mood decline in the days 18–26 window. This is consistent with "
            "a premenstrual mood disorder — PMDD if it causes meaningful functional impairment.\n\n"
            "Next steps:\n"
            "1. Generate a clinical report in CycleMind or use the Doctor Share link\n"
            "2. Book an appointment specifically to discuss this pattern — tell them you have "
            "3 cycles of prospective tracking showing a consistent luteal-phase mood pattern\n"
            "3. Come prepared to discuss treatment options: where on the stepped approach you'd "
            "like to start (lifestyle, SSRIs, OCP)\n\n"
            "You've done the most important part. Now take this evidence to a provider."
        )),
    ]

    for u, a in pmdd_user_ids:
        data.append(ex(u, a))

    # ── POSTPARTUM ────────────────────────────────────────────────────────────
    pp_pairs = [
        ("I'm 2 weeks postpartum and still crying every day. Is this normal?",
         d("Baby blues — tearfulness, mood swings, emotional fragility — are common in the "
           "first 10–14 days and driven by the dramatic hormonal withdrawal after delivery. "
           "They resolve on their own without treatment.\n\n"
           "At 2 weeks, if the crying and low mood are persisting or intensifying rather than "
           "lifting, that's a signal worth taking seriously. **Postpartum depression (PPD)** "
           "is different: persists beyond 2 weeks, causes significant functional impairment, "
           "and does not resolve on its own.\n\n"
           "Please reach out to your OB, midwife, or primary care provider soon — ideally "
           "this week. If you're having any thoughts of harming yourself, call 988 or PSI "
           "at 1-800-944-4773 right now.")),
        ("What is the difference between baby blues and postpartum depression?", PPD_OVERVIEW),
        ("I'm 6 weeks postpartum and want to start sertraline. Is it safe while breastfeeding?", BFMEDS),
        ("What antidepressants can I take while nursing?", BFMEDS),
        ("I keep having scary thoughts about my baby getting hurt. Am I dangerous?", OCD_CONTENT),
        ("I have intrusive thoughts about dropping my baby.", OCD_CONTENT),
        ("I'm scared to death about harming my baby but I would never do it.", OCD_CONTENT),
        ("I feel no connection with my baby. I love him but I feel nothing.", d(
            "What you're describing — loving your baby but feeling emotionally disconnected "
            "when you hold him — is a recognized clinical presentation of postpartum depression.\n\n"
            "Difficulty bonding is one of PPD's symptoms, not a reflection of your love or "
            "your future relationship. Depression consumes the emotional bandwidth that the "
            "felt sense of connection requires. Treatment for PPD consistently shows that as "
            "mood improves, the sense of connection improves with it.\n\n"
            "Please talk to your OB or midwife this week. If you're having any thoughts of "
            "harming yourself or your baby, call 988 or PSI at 1-800-944-4773 today.")),
        ("I'm so anxious about SIDS I can't sleep even when the baby sleeps.", d(
            "SIDS fear is one of the most common and least-discussed postpartum anxieties — "
            "and not sleeping when the baby sleeps clearly signals the anxiety has crossed "
            "into clinically significant territory.\n\n"
            "The AAP safe sleep guidelines (back to sleep, firm flat surface, no loose "
            "bedding) cover the modifiable risk factors. Once in place, additional checking "
            "doesn't reduce risk — it deepens exhaustion and anxiety.\n\n"
            "CBT for postpartum anxiety is evidence-based for this health-related anxiety "
            "pattern. If persistent worry and sleep disruption are affecting your functioning, "
            "please discuss this with your OB at your next visit.")),
        ("My partner says I should be happy because I have everything I need.", d(
            "What you're experiencing is one of the most isolating aspects of PPD — the gap "
            "between external circumstances and internal reality.\n\n"
            "PPD is not about circumstance or gratitude. It's a neurobiological condition "
            "driven by dramatic hormonal withdrawal, profound sleep deprivation, identity "
            "transformation, and complete life reorganization. 'Having everything' doesn't "
            "protect against it.\n\n"
            "Your partner's framing likely comes from caring without the framework to understand. "
            "PSI (postpartum.net) has a section specifically for partners. A joint provider "
            "appointment can shift understanding faster than conversation alone.\n\n"
            "Please don't let your partner's framing delay you seeking care.")),
        ("My birth was very traumatic and I'm having flashbacks.", TRAUMA_CONTENT),
        ("What is zuranolone for PPD?", d(
            "Zuranolone (Zurzuvae) is genuinely different from conventional antidepressants.\n\n"
            "Most antidepressants (SSRIs) work by inhibiting serotonin reuptake, with effects "
            "building over 4–6 weeks. Zuranolone is a **neuroactive steroid** — a synthetic "
            "analog of allopregnanolone, the progesterone metabolite that modulates GABA-A "
            "receptors in the brain.\n\n"
            "PPD is thought to be triggered partly by dramatic allopregnanolone withdrawal after "
            "delivery. Zuranolone directly restores this neurosteroid signaling.\n\n"
            "How it's used: oral once daily for 14 days — not ongoing. Clinical trials showed "
            "benefit onset within 3 days. FDA-approved in 2023 specifically for PPD. "
            "Breastfeeding: some transfer — discuss with your provider.")),
        ("I'm scared to tell my OB about PPD in case they take my baby.", d(
            "This fear is one of the most common reasons people don't seek help for PPD, "
            "and it's important to address directly: in the vast majority of cases, disclosing "
            "PPD leads to receiving clinical support — therapy referrals, medication if indicated, "
            "closer follow-up. That's it.\n\n"
            "Child Protective Services are involved when children are in **danger**, not when "
            "a parent has a mood disorder. PPD is a medical condition, and the healthcare "
            "system's response to it is clinical care, not custody intervention.\n\n"
            "The PSI HelpLine (1-800-944-4773) can provide information about your state's "
            "policies and connect you with vetted perinatal providers.")),
        ("What is the EPDS?", EPDS_CONTENT),
        ("I scored 15 on the EPDS. What does that mean?", d(
            "An EPDS score of 15 is above the ≥13 threshold where referral to a mental "
            "health provider is clinically recommended.\n\n"
            "This doesn't confirm a diagnosis — the EPDS is a screening tool, not a diagnostic "
            "instrument. What it means is that further clinical evaluation is warranted.\n\n"
            "Please bring this score to your provider at your next appointment, or contact "
            "them before then if you're feeling distressed. If any of your responses "
            "indicated thoughts of self-harm (question 10), please reach out today or "
            "call 988 immediately.")),
        ("Is it too late to get help at 5 months postpartum?", d(
            "Absolutely not. PPD can begin at any point in the first year after delivery, "
            "and treatment at 5 months works just as well as earlier intervention.\n\n"
            "The postpartum year is a recognized period of elevated risk precisely because "
            "the demands of new parenthood extend well beyond the first weeks. If you've "
            "been carrying this for months, getting support now matters even more.\n\n"
            "Contact your OB, primary care provider, or PSI (1-800-944-4773). "
            "Many perinatal therapists and psychiatrists offer telehealth.")),
        ("I'm postpartum and terrified all the time, not sad.", d(
            "What you're describing — constant terror rather than sadness — sounds more like "
            "postpartum anxiety than PPD, and you're right to name the distinction.\n\n"
            "Postpartum anxiety is at least as prevalent as PPD (up to 20% of new mothers) "
            "but receives far less attention. It includes generalized worry, panic disorder, "
            "hypervigilance about the baby, and OCD-type presentations.\n\n"
            "Postpartum anxiety responds very well to CBT and, when needed, SSRIs "
            "(sertraline preferred — well-studied in breastfeeding).\n\n"
            "Please reach out to your OB or midwife and specifically name anxiety rather "
            "than depression to ensure you get the right evaluation.")),
        ("My baby's father has been really shut down and irritable since the birth.", d(
            "What you're describing could be paternal postpartum depression, which affects "
            "approximately 10% of new fathers and is clinically recognized.\n\n"
            "The presentation in fathers often differs from maternal PPD: irritability, "
            "withdrawal, overwork or avoidance, feeling disconnected from the baby — "
            "rather than tearfulness and sadness.\n\n"
            "The strongest risk factor for paternal PPD is having a partner with PPD. "
            "He can get support through his primary care physician, a therapist, or PSI "
            "(postpartum.net has resources specifically for fathers).")),
        ("How do I talk to my doctor about postpartum depression at my 6-week appointment?", d(
            "Bringing this up is genuinely the most important thing you can do tomorrow — "
            "and being specific makes it much harder to dismiss:\n\n"
            "'I've been crying most days for the past three weeks and I can't identify why.'\n"
            "'I'm not sleeping even when the baby sleeps.'\n"
            "'I'm not feeling connected to my baby and it worries me.'\n\n"
            "Ask your provider to formally screen you with the EPDS. If the conversation "
            "moves toward 'this is normal,' you can say: 'I'd like a referral to a perinatal "
            "therapist or psychiatrist for a proper evaluation.'\n\n"
            "Bring a support person if possible. Take up the space — you deserve it.")),
    ]

    for u, a in pp_pairs:
        data.append(ex(u, a))

    # ── PREGNANCY ─────────────────────────────────────────────────────────────
    preg_pairs = [
        ("Is it safe to take antidepressants during pregnancy?", d(
            "The core clinical consensus (ACOG, reproductive psychiatry guidelines): "
            "for moderate-to-severe depression, the risk of untreated illness in most cases "
            "outweighs the small risks of SSRI exposure.\n\n"
            "Untreated depression in pregnancy carries real risks: preterm birth, low birth "
            "weight, impaired prenatal care, and it's the strongest predictor of PPD.\n\n"
            "The specific concern: Neonatal Adaptation Syndrome (NAS) — transient symptoms "
            "in newborns (jitteriness, feeding difficulty) — is self-limiting, not associated "
            "with lasting harm. Most large studies show no significant cardiac malformation "
            "increase with sertraline.\n\n"
            "For mild depression, CBT and IPT are effective without medication. For moderate-severe, "
            "this decision is best made with your provider — not alone.")),
        ("I'm pregnant and scared to take medication for the baby.", d(
            "The fear makes complete sense — you want to do everything right for your baby. "
            "Let me share what the evidence actually shows.\n\n"
            "Untreated depression during pregnancy carries real risks: preterm birth, low birth "
            "weight, impaired prenatal care adherence, and it's the strongest predictor of "
            "postpartum depression. These are documented harms, not theoretical ones.\n\n"
            "SSRIs — particularly sertraline — have been studied extensively in pregnancy. "
            "The clinical consensus is that for moderate-to-severe depression, the risks of "
            "untreated illness typically outweigh the small risks of SSRI exposure in most cases.\n\n"
            "For mild symptoms, CBT and IPT (Interpersonal Therapy) are effective options "
            "that carry no medication risk. Please don't carry this alone — talk to your "
            "OB or a perinatal psychiatrist.")),
        ("I'm 34 weeks pregnant and having panic attacks at night.", d(
            "Panic attacks in the third trimester are genuinely distressing and deserve real support.\n\n"
            "Pregnancy alters physiology in ways that lower the panic threshold: compressed "
            "diaphragm, elevated baseline heart rate, altered CO2 sensitivity. This doesn't "
            "minimize your experience — it means there's both physiological and psychological "
            "components worth addressing.\n\n"
            "For acute attacks: inhale for 4 counts, exhale for 6–8 (activates parasympathetic "
            "nervous system). 5-4-3-2-1 grounding: name 5 things you see, 4 to touch, "
            "3 you hear, 2 smell, 1 taste.\n\n"
            "For the pattern: CBT with interoceptive exposure is most effective — many "
            "perinatal therapists offer telehealth. SSRIs are safe for panic disorder in "
            "pregnancy when therapy alone isn't sufficient.\n\n"
            "Please mention this to your OB — anxiety in pregnancy is as common as depression.")),
        ("I'm 16 weeks pregnant and still feel depressed. My doctor says it's just hormones.", d(
            "'It's just hormones' is one of the most unhelpfully dismissive things a provider "
            "can say about mood symptoms in pregnancy — and the research doesn't support that reassurance.\n\n"
            "Depression during pregnancy is the strongest predictor of PPD. Left untreated, "
            "it carries real risks: preterm birth, low birth weight, reduced prenatal care "
            "adherence. At 16 weeks, this should be addressed rather than minimized.\n\n"
            "Options: ask your OB to formally screen you with EPDS or PHQ-9, or ask for a "
            "referral to a perinatal mental health specialist (telehealth available). "
            "CBT and IPT are highly effective first-line options for mild-moderate depression "
            "without medication. You deserve more than 'wait it out.' Advocate for yourself.")),
        ("I've been on antidepressants for years and just found out I'm pregnant.", d(
            "Please do not stop your antidepressants without discussing with your prescribing "
            "provider first — this is one of the situations where abrupt discontinuation has "
            "real consequences.\n\n"
            "The decision to continue, taper, or switch in pregnancy is nuanced and individual. "
            "For someone on medication for years, there's likely a meaningful reason it was "
            "started and maintained. Stopping abruptly risks both discontinuation syndrome "
            "AND relapse of the underlying condition — which carries its own pregnancy risks.\n\n"
            "The right path: contact your prescribing provider and OB together as soon as "
            "possible. If you don't have a perinatal psychiatrist, ask for a referral — "
            "this is exactly what they're trained for.")),
        ("I'm 9 weeks pregnant and the nausea is terrible. Will it get better?", d(
            "Yes — nausea affects 70–80% of pregnant women and typically peaks at weeks 8–10, "
            "exactly where you are. About 90% of people see significant improvement by the "
            "end of the first trimester as the placenta matures and takes over hormone production.\n\n"
            "What can help: small frequent meals, bland cold foods, ginger (tea, chews), "
            "Vitamin B6 with or without doxylamine (Unisom) — the most clinically backed OTC approach.\n\n"
            "Contact your OB if: you can't keep any fluids down for 24+ hours, you're losing "
            "weight, or feel dizzy or weak. Hyperemesis gravidarum affects 1–3% and needs "
            "prompt medical attention.")),
        ("I'm newly pregnant after IVF and feel more anxious than happy.", d(
            "What you're feeling makes complete sense — it's very well-documented in research "
            "on pregnancy after infertility.\n\n"
            "After years of failed cycles and grief, the protective walls built through loss "
            "stay up because experience has taught that positive tests don't always mean safe "
            "pregnancies. The anxiety is your nervous system protecting you from another "
            "potential loss. It's not ingratitude.\n\n"
            "Anxiety is significantly higher in ART-conceived pregnancies than spontaneous "
            "conceptions, often persisting through multiple milestones. What helps: limiting "
            "information-seeking spirals, mindfulness to observe anxiety without being consumed, "
            "a therapist with infertility and perinatal experience.\n\n"
            "The anxiety doesn't mean something is wrong with the pregnancy.")),
        ("I planned this pregnancy but sometimes feel like I don't want to be pregnant.", d(
            "Nothing is wrong with you. Ambivalence during pregnancy — even a planned, deeply "
            "wanted pregnancy — is one of the most common and least-spoken-about experiences.\n\n"
            "Pregnancy is irreversible, identity-transforming, physically demanding, and "
            "genuinely uncertain. Feelings of wanting to pause, doubting readiness, or grieving "
            "your previous life can coexist with wanting the baby. That's not hypocrisy — "
            "it's being a whole person navigating enormous change.\n\n"
            "If these feelings are persistent or accompanied by significant depression, that's "
            "a different picture deserving clinical evaluation. But occasional ambivalence "
            "is within the range of normal human experience.\n\n"
            "You deserve a space to say this out loud to a perinatal therapist — without "
            "performing uncomplicated joy for anyone.")),
        ("I'm 25 weeks pregnant and can't remember anything. Is pregnancy brain real?", d(
            "Yes — research shows real but modest impairments during pregnancy, particularly "
            "in verbal memory, processing speed, and working memory.\n\n"
            "Contributing factors: sleep disruption (worsening through pregnancy), hormonal "
            "effects on hippocampal and prefrontal function, and the sheer cognitive load of "
            "anticipating parenthood.\n\n"
            "The reassurance: long-term studies show no lasting cognitive disadvantage after "
            "pregnancy. These changes are largely reversible as the hormonal environment stabilizes.\n\n"
            "Practical strategies: lists, phone reminders, writing things down immediately — "
            "offloading working memory to external systems.")),
        ("I have a history of childhood trauma and I'm scared about labor.", d(
            "Your concern is valid and planning ahead is exactly the right instinct.\n\n"
            "Trauma-informed birth care significantly improves outcomes for people with "
            "trauma histories. You can explicitly request:\n"
            "- Your care team knowing about your history (you control how much detail to share)\n"
            "- Communication before any touch ('I'm going to examine you now')\n"
            "- Permission to pause or stop any procedure\n"
            "- Birth plan discussions now, not during labor\n\n"
            "Working with a perinatal therapist before delivery — ideally with EMDR or "
            "trauma-focused CBT — can process the existing trauma and reduce its activation "
            "during birth. Many perinatal therapists specialize specifically in this.\n\n"
            "You deserve care that takes your history seriously.")),
    ]

    for u, a in preg_pairs:
        data.append(ex(u, a))

    # ── PERIMENOPAUSE ─────────────────────────────────────────────────────────
    peri_pairs = [
        ("I'm 47 and my periods are becoming irregular. Could this be perimenopause?", PERI_OVERVIEW),
        ("Hot flashes started and my cycles are all over the place. Am I in perimenopause?", PERI_OVERVIEW),
        ("I've been depressed since my periods became irregular. Could they be connected?", d(
            "Yes — the connection is real and well-established clinically.\n\n"
            "Women in the menopausal transition have a 2–4x increased risk of depression "
            "compared to premenopausal baseline. Erratic estrogen fluctuations directly "
            "affect serotonergic and noradrenergic systems, and night sweats disrupting sleep "
            "compounds this significantly.\n\n"
            "This can occur even without prior psychiatric history. First-onset depression "
            "during perimenopause is clinically well-recognized. Women with prior PMDD or "
            "perinatal depression are at higher risk — a shared biological vulnerability.\n\n"
            "Bring both the cycle changes and mood changes to your provider together — they're "
            "likely part of the same picture. SSRIs/SNRIs are first-line; MHT can also help "
            "when mood is closely tied to vasomotor symptoms or sleep disruption.")),
        ("Is hormone therapy safe? I heard it causes cancer.", MHT_CONTENT),
        ("My doctor recommended MHT. What should I know?", MHT_CONTENT),
        ("What are bioidentical hormones? Are they different from regular HRT?", d(
            "Bioidentical hormones are hormones structurally identical to those produced "
            "naturally by the body. This is a descriptive term, not a regulatory category.\n\n"
            "**FDA-approved bioidentical options exist** — transdermal estradiol patches/gels "
            "and micronized progesterone (Prometrium) ARE bioidentical and are exactly what "
            "most menopause specialists recommend.\n\n"
            "**Compounded bioidenticals** — made by compounding pharmacies — are NOT "
            "FDA-regulated and are not recommended by NAMS, the Endocrine Society, or ACOG:\n"
            "- Variable potency and purity\n"
            "- No evidence of superior efficacy or safety vs. FDA-approved options\n"
            "- Custom saliva testing used to guide them is not validated\n\n"
            "The best bioidentical approach is FDA-approved transdermal estradiol + "
            "micronized progesterone — widely available and well-studied.")),
        ("I can't take hormones for hot flashes. What else works?", d(
            "Several evidence-based non-hormonal options for vasomotor symptoms:\n\n"
            "**Prescription options:**\n"
            "- **Fezolinetant (Veozah)** — FDA-approved 2023; NK3 receptor antagonist; "
            "highly effective, not a hormone; requires liver monitoring\n"
            "- **Venlafaxine (SNRI)** at low doses — reduces hot flash frequency 40–60%\n"
            "- **Escitalopram or paroxetine (SSRI)** — paroxetine (Brisdelle) FDA-approved for VMS\n"
            "- **Gabapentin** — useful for nocturnal hot flashes; also improves sleep\n\n"
            "**Behavioral/environmental:**\n"
            "- CBT-I for sleep disruption\n"
            "- Cool bedroom, moisture-wicking bedding\n"
            "- Reducing triggers: caffeine, alcohol, spicy foods before bed\n"
            "- Paced respiration (6–8 breaths/minute) during hot flash episodes")),
        ("What is perimenopause vs. menopause?", d(
            "**Perimenopause:** The transition phase — 4–8 years — preceding the final "
            "menstrual period. Characterized by irregular cycles and erratic, fluctuating "
            "estrogen (not just declining — it spikes unpredictably). Most women enter "
            "perimenopause around age 47.\n\n"
            "**Menopause:** A single point in time: 12 consecutive months without a period, "
            "confirmed retrospectively. Average age 51. Everything after = postmenopause.\n\n"
            "Why the distinction matters: you can still get pregnant during perimenopause "
            "(ovulation continues, just irregularly). Contraception matters until menopause "
            "is confirmed. Treatment approaches may also differ.")),
        ("I have PMDD. Should I be worried about perimenopause?", d(
            "Your concern is clinically well-founded — understanding the connection ahead of "
            "time is one of the most protective things you can do.\n\n"
            "Women with PMDD history are at higher risk for depression and mood symptoms "
            "during perimenopause. The same neurochemical systems that make you sensitive to "
            "luteal-phase fluctuations respond to the erratic estrogen fluctuations of "
            "perimenopause.\n\n"
            "It's not inevitable — many women with PMDD who are managing it well find their "
            "existing strategies work for perimenopausal mood as well.\n\n"
            "Interestingly, some research suggests prior PMDD history predicts particularly "
            "good response to MHT for perimenopausal mood — worth discussing with your provider "
            "when the transition begins. Pre-flagging your PMDD history now means care can "
            "be proactive rather than reactive.")),
        ("Perimenopause is making me feel like I'm losing my mind.", d(
            "What you're describing — the loss of cognitive reliability, emotional predictability, "
            "felt disruption of identity — is one of the most common and least-acknowledged "
            "experiences of perimenopause, and it's worth naming clearly.\n\n"
            "The brain fog, word-finding difficulties, mood variability, and the sense of not "
            "recognizing yourself are neurobiological — driven by erratic estrogen fluctuations "
            "affecting serotonin, dopamine, and cognitive systems. Not personal failures.\n\n"
            "Two things are true simultaneously:\n"
            "This is a transition, not a permanent destination. Long-term studies show cognitive "
            "function stabilizes and often recovers in postmenopausal years.\n\n"
            "The symptoms are treatable. Addressing sleep disruption from VMS, SSRIs/SNRIs, "
            "and MHT (if appropriate) can make a meaningful difference. You're in the most "
            "turbulent part of a transition — the disorientation is widely shared.")),
        ("Since menopause sex is really painful and I'm dry all the time.", GSM_CONTENT),
        ("Brain fog after menopause — will it ever get better?", d(
            "Yes — the research is genuinely reassuring here.\n\n"
            "Cognitive symptoms (word-finding difficulty, memory lapses, concentration issues) "
            "are well-documented during the menopausal transition. Estrogen supports cerebral "
            "blood flow, neuronal energy metabolism, and cholinergic pathways involved in "
            "verbal fluency and memory.\n\n"
            "The critical reassurance: long-term studies show cognitive performance stabilizes "
            "and often returns to (or exceeds) premenopausal baseline in the postmenopausal years "
            "as the hormonal environment settles. The transition period is the most symptomatic window.\n\n"
            "Sleep disruption from night sweats is a major amplifier — treating VMS often "
            "improves cognition substantially. MHT and SNRIs that improve sleep can have "
            "secondary cognitive benefits.")),
    ]

    for u, a in peri_pairs:
        data.append(ex(u, a))

    # ── FERTILITY ─────────────────────────────────────────────────────────────
    fert_pairs = [
        ("We've been trying to conceive for 8 months and I'm starting to feel hopeless.", FERTILITY_CONTENT),
        ("Every month I don't get pregnant feels like a loss.", FERTILITY_CONTENT),
        ("We're starting IVF. What should I know emotionally?", FERTILITY_CONTENT),
        ("My first IVF cycle just failed. I'm devastated.", FERTILITY_CONTENT),
        ("What is the two-week wait in IVF and why is it so hard?", d(
            "The two-week wait — embryo transfer to beta hCG test — is one of the most "
            "psychologically difficult periods of the IVF process.\n\n"
            "**Why it's so hard:**\n"
            "- Complete loss of control: stimulation involved action; the TWW involves only waiting\n"
            "- Physical symptoms from progesterone supplementation are indistinguishable from "
            "early pregnancy — symptom-spotting is ubiquitous and non-diagnostic\n"
            "- Extremely high stakes — each transfer represents enormous investment\n"
            "- Anticipatory grief and hope coexist — exhausting to hold both simultaneously\n\n"
            "What tends to help: maintaining structure and engagement with other areas of life, "
            "limiting symptom-checking, having a plan for either result, and honest self-knowledge "
            "about what you need — distraction or space to feel it.")),
        ("I had a miscarriage and people keep saying 'at least it was early.'", d(
            "What you're experiencing — having your grief minimized — is a form of "
            "disenfranchised grief that compounds the loss itself.\n\n"
            "Miscarriage is a real loss, regardless of gestational age. By any point in a "
            "wanted pregnancy, there is a baby, a future, an identity shift already underway. "
            "The grief doesn't scale neatly with weeks.\n\n"
            "Research on pregnancy loss shows grief responses are real at any gestational age, "
            "PTSD and depression are significantly elevated in the months following, and social "
            "minimization makes recovery harder.\n\n"
            "You are allowed to grieve this as fully and as long as it takes — you don't need "
            "anyone's permission. Support: SHARE (nationalshare.org), online pregnancy loss "
            "communities. If grief is significantly disrupting functioning, a grief-informed "
            "therapist can help.")),
        ("I had a TFMR and no one understands what I went through.", d(
            "TFMR is one of the least understood and least socially recognized forms of "
            "pregnancy loss — making the grief uniquely isolating.\n\n"
            "It involves receiving devastating news, making an agonizing decision under time "
            "pressure, and then carrying that grief — often in secrecy — in a culture that "
            "doesn't have space for the complexity. Research shows PTSD, depression, and "
            "complicated grief are common after TFMR, often more so than after other losses.\n\n"
            "Your grief is real. What you chose was made from love.\n\n"
            "Communities that specifically understand TFMR:\n"
            "- TFMR Stories (tfmrstories.com)\n"
            "- A Heartbreaking Choice (aheartbreakingchoice.com)\n\n"
            "Therapists with TFMR experience — especially those using EMDR — can help with "
            "the specific grief and trauma this kind of loss carries.")),
        ("I had a stillbirth. I don't know how to survive this.", d(
            "I'm so deeply sorry. This is one of the most devastating losses a person can experience.\n\n"
            "You don't have to know how to survive it right now. You just have to get through "
            "this moment, then the next.\n\n"
            "Please reach out to:\n"
            "**Star Legacy Foundation:** starlegacyfoundation.org\n"
            "**SHARE Pregnancy & Infant Loss:** nationalshare.org\n"
            "**PSI (postpartum):** 1-800-944-4773 — also serves parents after perinatal loss\n\n"
            "Many hospitals have bereavement coordinators — if you haven't been connected, "
            "you can ask. PTSD, depression, and complicated grief are common and expected "
            "after stillbirth — professional support, particularly with EMDR or grief-focused "
            "therapy, significantly helps over time.\n\n"
            "Right now, just let yourself be in this. You don't need to know anything "
            "beyond the next hour.")),
        ("I was diagnosed with premature ovarian insufficiency at 27.", d(
            "A POI diagnosis in your 20s is genuinely devastating — it disrupts fundamental "
            "assumptions about your reproductive future with very little social recognition.\n\n"
            "Important clinical information:\n"
            "- POI is not always total infertility. About 5–10% of women with POI conceive "
            "spontaneously — ovarian function is intermittent, not always absent\n"
            "- **Hormone therapy is medically essential** — you're estrogen-deficient at an "
            "age when you should have full levels. Without MHT you're at risk for bone loss, "
            "cardiovascular changes, and cognitive effects\n"
            "- **FMR1 premutation testing** is recommended — 12–28% of women with POI have "
            "this, with family planning implications\n\n"
            "For emotional support: The Daisy Network (daisynetwork.org) is a community "
            "specifically for women with POI. Mental health support alongside medical care "
            "is important — this diagnosis warrants it.")),
        ("I've had 3 miscarriages in a row. What is recurrent pregnancy loss?", d(
            "Three consecutive losses — the grief is real and cumulative, and I want to "
            "acknowledge that before the clinical information.\n\n"
            "RPL (recurrent pregnancy loss) is defined as 3+ consecutive losses, and at "
            "this threshold systematic evaluation is clinically warranted.\n\n"
            "Common causes:\n"
            "- **Chromosomal:** Up to 50–60% of losses; some random, some heritable. "
            "PGT-A through IVF can screen embryos.\n"
            "- **Antiphospholipid syndrome (APS):** Treatable autoimmune coagulation disorder\n"
            "- **Anatomical:** Uterine septum — often correctable\n"
            "- **Thyroid or hormonal factors**\n"
            "- **Unknown:** Up to 50% of RPL remains unexplained after full workup\n\n"
            "The psychological dimension deserves equal attention — depression, PTSD, and "
            "complicated grief are significantly elevated. Support: RESOLVE (resolve.org), "
            "SHARE (nationalshare.org).")),
        ("How do OPKs work and how do I use them correctly?", d(
            "OPKs (ovulation predictor kits) detect the LH surge that precedes ovulation "
            "by 24–36 hours. When you get a positive result, ovulation is approximately "
            "1–2 days away — this is your fertile window peak.\n\n"
            "Best practices:\n"
            "- Test twice daily (morning and early afternoon) around expected ovulation time\n"
            "- Morning is good because LH is synthesized overnight\n"
            "- Start testing a few days before expected ovulation based on your average cycle\n\n"
            "One-day positive surges are common — some people's surge is only 8–12 hours long, "
            "so once-daily testing can miss or only catch the tail end.\n\n"
            "Combining OPKs with BBT (which rises 0.2–0.5°F after ovulation) gives a more "
            "complete picture — OPKs predict prospectively, BBT confirms retrospectively. "
            "Log both in CycleMind's fertility mode.")),
        ("I'm 35 and just starting to try for a baby. Am I too old?", d(
            "The 'advanced maternal age' label (applied at 35+) can feel more alarming than "
            "the actual numbers warrant for most women.\n\n"
            "What does change: ovarian reserve declines and chromosomally abnormal eggs increase "
            "— primary drivers of reduced fertility and higher miscarriage rates. Time to "
            "conception may be longer on average.\n\n"
            "At 35, many women conceive naturally and have healthy pregnancies. The fertility "
            "decline is real but gradual through the mid-30s. Prenatal genetic testing (NIPT) "
            "is standard and highly informative.\n\n"
            "Practically: if you've been trying 6 months with no success at 35, that's the "
            "threshold for fertility evaluation (rather than 12 months used for women under 35). "
            "Log your cycles in CycleMind and talk to your OB about appropriate evaluation.")),
    ]

    for u, a in fert_pairs:
        data.append(ex(u, a))

    # ── CYCLE TRACKING ────────────────────────────────────────────────────────
    track_pairs = [
        ("How does tracking my cycle actually help with mental health?", d(
            "Cycle tracking connects mood and symptoms to biological context — powerful for mental health.\n\n"
            "**Pattern recognition:** Daily logging reveals patterns invisible from memory. "
            "Anxiety reliably peaking on days 22–26, sleep dropping in the late luteal phase, "
            "energy highest at ovulation. This removes bewilderment and replaces it with "
            "understanding: 'This isn't random — it's a predictable neurobiological event.'\n\n"
            "**Validation and agency:** Seeing symptoms charted relative to cycle phase shifts "
            "the frame from 'something is wrong with me' to 'I have a predictable pattern I "
            "can anticipate and prepare for.'\n\n"
            "**Clinical utility:** Prospective daily data is exactly what a clinician needs "
            "to diagnose PMDD, distinguish it from other mood disorders, or evaluate treatment.\n\n"
            "**Early detection:** Surfaces changes — emerging perimenopausal patterns, postpartum "
            "mood decline — before they reach crisis point.")),
        ("What is the luteal phase and why does my mood change during it?", CYCLE_PHASES),
        ("What is a normal cycle length?", d(
            "The clinical normal range is **24–38 days** — broader than most people realize. "
            "The commonly cited '28 days' is a statistical average, not a target.\n\n"
            "Normal cycle-to-cycle variation in an individual: up to ~7 days.\n\n"
            "Outside the normal range:\n"
            "- <24 days: can indicate anovulation, luteal phase deficiency, or perimenopause\n"
            "- >38 days: common with PCOS, thyroid dysfunction, elevated prolactin\n"
            "- >7 days variation: irregular cycles warranting evaluation\n\n"
            "Adolescents: 21–45 days is normal for 1–4 years after menarche. "
            "Perimenopause: increasing variability — first shortening, then lengthening.")),
        ("How do I share my cycle data with my doctor?", d(
            "The Doctor Share feature in CycleMind makes this straightforward. From the "
            "Insights section, generate a secure, time-limited share link. Your provider "
            "gets view-only access to a clinical summary: cycle history, symptom patterns, "
            "mood scores, and any PHQ-9, GAD-7, or EPDS ratings.\n\n"
            "You configure what's included. The link is valid for 30 days, tracks access, "
            "and can be revoked at any time. Your provider doesn't need a CycleMind account.\n\n"
            "For PMDD evaluation specifically: 2+ cycles of consistent daily symptom logging "
            "provides the prospective data needed. You can also download a PDF clinical report.")),
        ("My period is 5 days late and my test is negative. What's happening?", d(
            "A late period with a negative pregnancy test has several explanations:\n\n"
            "1. **Tested too early:** If ovulation was delayed, the conception-to-positive "
            "window shifts with it. Retest in 2–3 days.\n"
            "2. **Anovulatory cycle:** Without ovulation, no progesterone means no predictable "
            "luteal phase — period may come significantly later or not until the next cycle.\n"
            "3. **Stress, illness, significant weight change:** All can delay ovulation.\n"
            "4. **PCOS or thyroid dysfunction:** Can cause irregular cycles.\n\n"
            "If still negative at 7–10 days past expected period with no period arrival, "
            "contact your OB.")),
        ("My cycles have been 19, 25, and 32 days. Is something wrong?", d(
            "A 13-day range between your shortest and longest cycle is significant and "
            "warrants evaluation.\n\n"
            "Possible causes: stress or illness during one cycle, thyroid dysfunction, PCOS, "
            "or early perimenopausal transition (particularly in mid-to-late 40s).\n\n"
            "A 19-day cycle specifically is worth flagging — consistently short cycles "
            "can indicate luteal phase deficiency or anovulation.\n\n"
            "Please bring this pattern to your OB with your CycleMind cycle data — "
            "three cycles of dates gives them much more to work with than a description from memory.")),
        ("I'm spotting between periods. Should I be worried?", d(
            "Intermenstrual spotting has a range of causes — many benign, some warranting "
            "evaluation.\n\n"
            "Common benign causes: mid-cycle ovulation spotting, hormonal contraceptive "
            "adjustment in first 3 months, implantation bleeding in early pregnancy window, "
            "cervical irritation from sex or recent Pap.\n\n"
            "Contact your provider if: spotting is heavier than a few drops, consistent "
            "postcoital bleeding, accompanied by pain or unusual discharge, perimenopausal "
            "or postmenopausal (any postmenopausal bleeding requires evaluation), or "
            "recurring for several months.\n\n"
            "Log spotting in CycleMind — cycle day, amount, symptoms — so your provider "
            "has a useful pattern to work with.")),
    ]

    for u, a in track_pairs:
        data.append(ex(u, a))

    # ── SAFETY / CRISIS ───────────────────────────────────────────────────────
    crisis_triggers = [
        "I want to die.", "I want to kill myself.", "I've been having thoughts of ending my life.",
        "I feel suicidal.", "I'm thinking about hurting myself badly.",
        "I don't want to be here anymore.", "I've been cutting myself.",
        "I'm planning to overdose on my medication.", "I have a plan to end my life.",
        "I want to die. My family would be better off without me.",
        "I want to hurt myself. I have thoughts of suicide.",
    ]
    for u in crisis_triggers:
        data.append(ex(u, CRISIS_RESPONSE, persona=PERSONA_FULL))

    passive_triggers = [
        "I feel suicidal but don't want to die — just want the pain to stop.",
        "I don't want to kill myself but I don't want to be alive either.",
        "I keep thinking everyone would be better off without me.",
        "I have passive thoughts of not waking up. Is that bad?",
    ]
    for u in passive_triggers:
        data.append(ex(u,
            "I want to take what you've shared very seriously. Passive suicidal ideation — "
            "wanting the pain to stop rather than life itself — is still a signal that "
            "requires real support right now.\n\n"
            "The pain behind this is real and deserves human care, not an app.\n\n"
            "Please contact crisis support now:\n\n"
            "**988 Suicide & Crisis Lifeline:** Call or text **988** (24/7, free, confidential)\n"
            "**Crisis Text Line:** Text HOME to 741741\n"
            "**PSI:** 1-800-944-4773 (if postpartum-related)\n\n"
            "The people at 988 are trained specifically for the pain behind the thought. "
            "You don't need a 'bad enough' situation to call. Please reach out now.",
            persona=PERSONA_FULL
        ))

    pp_psychosis_triggers = [
        "I'm 5 days postpartum, not sleeping even when my baby sleeps, thoughts are racing.",
        "I just had a baby and I'm hearing voices. Is this normal?",
        "Since having my baby 1 week ago I have strange beliefs and feel confused.",
        "My wife is 10 days postpartum and acting very strangely — not sleeping, saying bizarre things.",
    ]
    for u in pp_psychosis_triggers:
        data.append(ex(u, PP_PSYCHOSIS_RESPONSE, persona=PERSONA_FULL))

    # Boundary examples
    diag_qs = [
        "Do I have PMDD? Tell me yes or no.",
        "Can you diagnose me with postpartum depression?",
        "Based on what I said, do I have bipolar disorder?",
        "I think I have PTSD from my birth. Confirm this for me.",
    ]
    for u in diag_qs:
        data.append(ex(u, d(
            "I hear that you want clarity — and I want to give you the most useful answer "
            "I can while being honest with you.\n\n"
            "I'm not able to diagnose you, and even if I wanted to, I genuinely couldn't. "
            "A diagnosis requires a trained clinician who can take your full history, "
            "assess you directly, ask clarifying questions, and apply professional clinical "
            "judgment. That's not something any app can replace.\n\n"
            "What I can tell you: what you're describing sounds clinically significant, real, "
            "and worth taking seriously. The most direct path to the answer you're looking "
            "for is scheduling an appointment with your OB, primary care provider, or a "
            "mental health professional.\n\n"
            "If you've been logging symptoms in CycleMind, bring that data — it gives your "
            "provider important clinical context."
        )))

    # IPV
    data.append(ex(
        "My partner hits me. I'm pregnant and scared.",
        d("What you're sharing takes real courage, and I want to make sure you have safety "
          "resources right now.\n\n"
          "IPV affects 1 in 4 women and is particularly dangerous during pregnancy — "
          "it often escalates or begins at this time. Your safety and your baby's safety matter.\n\n"
          "**National Domestic Violence Hotline:** 1-800-799-7233 (24/7)\n"
          "**Text:** 'START' to 88788\n"
          "**Online chat:** thehotline.org\n\n"
          "These services are confidential and can help with safety planning. Your prenatal "
          "provider can also ask your partner to step out so you can speak privately — "
          "IPV screening is standard prenatal care.\n\n"
          "You don't deserve this. Please reach out for support."),
        persona=PERSONA_FULL
    ))

    # ── CLINICAL EDUCATION ────────────────────────────────────────────────────
    edu_pairs = [
        ("What is CBT and how does it help?", CBT_CONTENT),
        ("What is the difference between CBT and IPT?", CBT_CONTENT),
        ("What is EMDR and when is it used?", d(
            "EMDR (Eye Movement Desensitization and Reprocessing) is a specialized trauma "
            "therapy using bilateral stimulation — typically guided eye movements — while "
            "briefly processing traumatic memories.\n\n"
            "It has the strongest evidence base for PTSD and is particularly effective for "
            "birth trauma. Many people see significant improvement in relatively few sessions, "
            "and it doesn't require extensive narration of the traumatic experience.\n\n"
            "Used for: birth trauma PTSD, prior childhood/sexual/IPV trauma affecting pregnancy "
            "or postpartum, complex trauma in reproductive health contexts.\n\n"
            "CPT (Cognitive Processing Therapy) is another evidence-based trauma treatment "
            "if EMDR isn't available. Both are more effective than generic supportive therapy "
            "for PTSD.")),
        ("How do I find a therapist for PMDD?", d(
            "**IAPMD (iapmd.org)** has a provider directory of PMDD-aware clinicians — "
            "the best starting point for PMDD-specific care.\n\n"
            "**For perinatal mental health (PPD, postpartum anxiety, pregnancy depression):**\n"
            "- Postpartum Support International (postpartum.net) — provider directory with "
            "telehealth options\n\n"
            "**General search:**\n"
            "- Psychology Today (psychologytoday.com/us/therapists) — filter by issue, "
            "insurance, telehealth\n"
            "- Open Path Collective (openpathcollective.org) — sliding-scale lower-cost options\n\n"
            "Tips: The first session is an evaluation, not a commitment — it's okay to "
            "try 2–3 therapists. Telehealth has dramatically expanded access. "
            "The hardest step is the first appointment — most platforms let you book online.")),
        ("What's the difference between sadness and clinical depression?", d(
            "**Sadness** is a normal, proportionate response to difficult circumstances — "
            "loss, disappointment, life changes. It's connected to triggering events and "
            "generally eases with time, support, or resolution of circumstances.\n\n"
            "**Clinical depression** is distinguished by:\n"
            "- **Pervasiveness** — colors everything, not just the triggering situation\n"
            "- **Duration** — most of the day, nearly every day, for at least 2 weeks\n"
            "- **Anhedonia** — loss of pleasure or interest in normally enjoyable activities "
            "(most distinguishing feature from ordinary sadness)\n"
            "- **Functional impairment** — affects work, relationships, or self-care\n"
            "- **Physical symptoms** — sleep changes, appetite changes, profound fatigue\n"
            "- **Cognitive symptoms** — difficulty concentrating, indecisiveness\n\n"
            "Normal sadness doesn't require medical treatment. Depression does. The line "
            "is functional impairment and the cluster of features above.")),
        ("What is IPT and how is it different from CBT?", d(
            "IPT (Interpersonal Therapy) focuses specifically on interpersonal functioning "
            "and significant life transitions — rather than thought patterns and behaviors.\n\n"
            "For perinatal depression specifically, IPT addresses:\n"
            "- **Role transitions** — the identity shift into motherhood and what it costs\n"
            "- **Grief** — including grief over your pre-baby self, or prior losses reactivated\n"
            "- **Interpersonal disputes** — relationship conflict that intensifies postpartum\n"
            "- **Interpersonal deficits** — social isolation, common in new parenthood\n\n"
            "CBT focuses on the relationship between thoughts, feelings, and behaviors — "
            "identifying and restructuring negative thought patterns.\n\n"
            "Both have comparable efficacy for perinatal depression. IPT may feel more "
            "natural for those whose depression is primarily relational and identity-driven. "
            "Both are available via telehealth.")),
        ("Can the pill cause depression?", d(
            "Yes — this is a well-documented concern that deserves to be taken seriously.\n\n"
            "The largest study (Skovlund Danish cohort, 2016, over 1 million women) found "
            "increased depression diagnosis and antidepressant use associated with hormonal "
            "contraceptives, particularly progestin-only methods and among adolescents.\n\n"
            "Mechanism: exogenous progestins interact with serotonin receptors and neurosteroid "
            "systems — the same pathways implicated in PMDD. Women with prior depression or "
            "PMDD history are at higher risk for mood effects.\n\n"
            "Progestin type matters:\n"
            "- Drospirenone (Yaz): most mood-favorable; FDA-approved for PMDD\n"
            "- Levonorgestrel, etonogestrel implant: higher mood effect signals\n\n"
            "Log your mood consistently in CycleMind before and after contraceptive changes. "
            "Discussing alternatives (copper IUD for hormone-free) is entirely reasonable.")),
        ("Why does sleep affect my mood so much?", SLEEP_CONTENT),
        ("What are omega-3s and can they help with depression?", OMEGA3),
        ("What is mindfulness and how does it help with anxiety?", d(
            "Mindfulness is the practice of intentionally bringing attention to the present "
            "moment — thoughts, sensations, emotions — with observation rather than judgment.\n\n"
            "**Neuroscience:** Regular practice strengthens the prefrontal cortex's regulatory "
            "capacity over the amygdala (emotional reactivity center), increasing the 'space' "
            "between stimulus and response.\n\n"
            "**Evidence:**\n"
            "- MBSR (Mindfulness-Based Stress Reduction): replicated evidence for anxiety, "
            "depression, and stress reactivity reduction\n"
            "- MBCT (Mindfulness-Based Cognitive Therapy): comparable to maintenance "
            "antidepressants for preventing recurrent depression in some studies\n\n"
            "For PMDD specifically: mindfulness doesn't change the hormonal shifts, but "
            "significantly reduces the distress they produce by creating psychological "
            "distance from intrusive thoughts and emotional reactivity.\n\n"
            "Practical starting point: 5–10 min daily breath-focused attention. "
            "Apps: Headspace, Calm, Insight Timer.")),
        ("I've been on sertraline for 4 months and feel better. Can I stop?", d(
            "I'm glad you're feeling better — and I want to make sure stopping goes as "
            "safely as possible, which means doing it with your prescribing provider.\n\n"
            "**Why to involve your provider:**\n"
            "- Standard guidelines recommend continuing for at least 6–12 months after "
            "achieving remission to reduce relapse risk — stopping too early is a common "
            "driver of return of symptoms\n"
            "- Abrupt discontinuation causes discontinuation syndrome: dizziness, 'brain "
            "zaps,' flu-like symptoms, irritability\n"
            "- A planned gradual taper prevents these symptoms\n\n"
            "Please don't stop independently. Contact your prescribing provider — they can "
            "guide a taper schedule and help plan what to do if symptoms return.")),
        ("What is inflammation and can it cause depression?", d(
            "The inflammation-depression link is one of the most active areas in mood disorder "
            "research, with direct relevance to reproductive mental health.\n\n"
            "Pro-inflammatory cytokines (IL-6, TNF-alpha, CRP) can cross the blood-brain "
            "barrier and affect key systems: reducing serotonin synthesis, impairing dopaminergic "
            "reward signaling, dysregulating the HPA axis — producing fatigue, withdrawal, and "
            "anhedonia that closely resembles depression.\n\n"
            "**Reproductive relevance:**\n"
            "- Postpartum: labor/delivery activates innate immune system; inflammatory response "
            "in recovery may contribute to PPD vulnerability window\n"
            "- PMDD: elevated inflammatory markers in luteal phase in affected women\n"
            "- Perimenopause: declining estrogen (anti-inflammatory) increases inflammatory load\n"
            "- Endometriosis, PCOS: high inflammatory burden, elevated depression rates\n\n"
            "Anti-inflammatory lifestyle: exercise, omega-3s, Mediterranean diet, adequate sleep.")),
        ("Should I take a probiotic for mood?", d(
            "The gut-brain axis is a genuinely interesting area of research, but the clinical "
            "evidence for probiotics specifically improving mood is still preliminary.\n\n"
            "What the evidence shows: bidirectional communication exists between gut microbiome "
            "and brain via the vagus nerve, inflammatory signaling, and serotonin production "
            "(90% of serotonin is produced in the gut). Small studies suggest certain probiotic "
            "strains may modestly reduce depression and anxiety scores.\n\n"
            "The challenge: strain specificity matters enormously, effect sizes are small in "
            "most studies, and optimal formulations aren't established.\n\n"
            "Probiotics are generally safe and may have other gut health benefits — there's "
            "no strong reason not to try one. But they shouldn't replace evidence-based "
            "treatments (CBT, SSRIs) for clinical depression or anxiety.")),
    ]

    for u, a in edu_pairs:
        data.append(ex(u, a))

    # ── MISC / SPECIAL TOPICS ─────────────────────────────────────────────────
    misc_pairs = [
        ("I've had terrible period pain my whole life. Could it be endometriosis?", ENDO_CONTENT),
        ("The chronic pain from endometriosis is making me depressed.", ENDO_CONTENT),
        ("I was diagnosed with PCOS. What does it mean for my mental health?", PCOS_CONTENT),
        ("PCOS is making me feel terrible about my body.", PCOS_CONTENT),
        ("Does PCOS affect fertility?", PCOS_CONTENT),
        ("I have bipolar disorder and want to get pregnant.", BIPOLAR_PREG),
        ("My doctor mentioned valproate is dangerous in pregnancy. Why?", BIPOLAR_PREG),
        ("I'm on lamotrigine for bipolar. What happens in pregnancy?", BIPOLAR_PREG),
        ("I had postpartum psychosis after my first baby. I'm pregnant again.", d(
            "I'm glad you're planning ahead — this is one of the most protective things "
            "you can do given your history.\n\n"
            "After one episode of postpartum psychosis, recurrence risk in subsequent "
            "postpartum periods is 50–80%. This should be the central organizing fact "
            "of your perinatal care plan.\n\n"
            "What's needed:\n"
            "- **Perinatal psychiatrist** involved throughout this pregnancy and from delivery onward\n"
            "- **Prophylactic medication plan** — usually lithium started immediately postpartum "
            "(often the night of delivery or within 24 hours)\n"
            "- **Sleep protection protocol** — someone handling night feeds for the first 2–4 weeks\n"
            "- **Written early warning signs plan** for you, your partner, and care team\n\n"
            "You've been through this once. With a comprehensive plan, you have "
            "significantly more protection this time.")),
        ("I was smoking weed before I knew I was pregnant. Did I hurt my baby?", d(
            "Many people discover pregnancy after inadvertent early substance exposure — "
            "you're far from alone, and the guilt is understandable.\n\n"
            "For cannabis: the research shows associations with lower birth weight, preterm "
            "birth, and potential neurodevelopmental effects, particularly with heavy ongoing "
            "use. Brief early exposure before confirming pregnancy carries different risk "
            "than continued use through pregnancy.\n\n"
            "The most important thing now: stop use completely, and be honest with your OB "
            "about what happened and when. They need accurate information to monitor "
            "appropriately — and they're not there to judge. Honest disclosure is the "
            "most protective step you can take for your baby going forward.")),
        ("I'm pregnant and worried about my opioid use.", d(
            "I'm really glad you're thinking about your baby's health and reaching out. "
            "Please tell your provider — this is critical for safe pregnancy care.\n\n"
            "Opioid use disorder in pregnancy is a medical condition. Medication-Assisted "
            "Treatment (MAT) with buprenorphine or methadone is the evidence-based standard "
            "of care — **safer for both you and your baby** than untreated OUD or abrupt "
            "withdrawal, which can cause miscarriage and preterm birth.\n\n"
            "Neonatal Abstinence Syndrome (NAS) is expected with MAT and manageable — "
            "not a reason to avoid treatment. It's far safer than untreated OUD.\n\n"
            "SAMHSA National Helpline: 1-800-662-4357 — can connect you with local "
            "perinatal addiction treatment programs.")),
        ("I had a traumatic birth and feel violated by what happened.", d(
            "What you experienced deserves to be named clearly: medical procedures that "
            "happened without your genuine informed consent are a form of obstetric trauma.\n\n"
            "Birth experiences where a person felt their body was acted upon without their "
            "agreement — where they were not heard — can cause PTSD, anger, grief, and a "
            "complicated relationship with healthcare. A healthy baby outcome does not "
            "negate the validity of what you went through.\n\n"
            "What can help:\n"
            "- Processing with a perinatal therapist or EMDR-trained therapist\n"
            "- Birth debriefing — some hospitals offer formal sessions to review your records\n"
            "- Peer support through birth trauma communities\n\n"
            "Your experience deserved better. I'm sorry it went the way it did.")),
        ("I'm scared the trauma from my childhood will affect how I parent.", d(
            "The fact that you're thinking about this is actually one of the most protective "
            "things you can do — research consistently shows that parental awareness and "
            "reflective capacity is a significant moderating factor in intergenerational transmission.\n\n"
            "Childhood abuse does increase parenting risk — not because survivors are "
            "fundamentally impaired, but because unprocessed trauma can activate stress "
            "responses in caregiving situations and create specific triggers.\n\n"
            "The most protective step: work with a trauma-focused therapist before or "
            "during early parenthood. EMDR, Trauma-Focused CBT, and CPP (Child-Parent "
            "Psychotherapy — designed specifically for parents with trauma histories) all "
            "have strong evidence.\n\n"
            "You have already broken the silence about your history. That matters "
            "more than you may realize.")),
        ("My relationship is really struggling since we had our baby.", d(
            "Relationship strain in the first year of parenthood is extremely common — "
            "studies consistently show relationship satisfaction drops significantly for "
            "the majority of couples after having children, even those with strong foundations.\n\n"
            "The drivers are multiple: profound sleep deprivation (degrades empathy and "
            "conflict resolution), unexpected role asymmetry, loss of couple identity, "
            "different emotional processing styles, and changes in physical intimacy.\n\n"
            "'Normal' doesn't mean 'not worth addressing.' Couples therapy with a therapist "
            "familiar with the transition to parenthood can make a real difference — often "
            "more when started early.\n\n"
            "If either partner is also dealing with PPD or postpartum anxiety, treating "
            "that directly improves relationship functioning as a secondary effect.")),
        ("I feel like being a new mom is supposed to be wonderful but I'm miserable.", d(
            "Nothing is wrong with you. The expectation that new motherhood is supposed to "
            "feel like the best time of your life is one of the most damaging cultural myths "
            "around this experience — and it makes the reality harder to navigate because "
            "it adds shame on top of exhaustion.\n\n"
            "The early postpartum period is, for many people, one of the most physically and "
            "emotionally difficult experiences of their lives — regardless of how much they "
            "wanted the baby. Profound sleep deprivation, dramatic hormonal withdrawal, "
            "identity transformation, and complete reorganization of life happen simultaneously.\n\n"
            "If the misery is persistent and accompanied by difficulty sleeping when baby "
            "sleeps, feeling disconnected from baby, excessive worry, or feeling you made "
            "a terrible mistake — those are signals worth clinical evaluation for PPD.\n\n"
            "You deserve support for this — not just a reframe.")),
        ("I'm going back to work after maternity leave and so anxious.", d(
            "Anxiety about returning to work after maternity leave is extremely common and "
            "has multiple real drivers: separation anxiety about the baby, identity adjustment, "
            "practical logistics (childcare, feeding, pumping), and grief over the end of "
            "this particular time with your baby.\n\n"
            "Some anxiety is a proportionate response to a genuinely significant transition. "
            "The question is severity: Does it improve after the first week back, or is it "
            "intensifying and disrupting sleep in the weeks before your return date?\n\n"
            "If severe: this may be ongoing postpartum anxiety rather than purely situational, "
            "and warrants discussion with your OB.\n\n"
            "Practical helps: concrete logistics planning in advance (reduces uncertainty "
            "anxiety), connecting with other parents at similar life stages, and if possible "
            "a practice day with childcare before your official return.")),
        ("I'm having heart palpitations and shortness of breath. Could this be anxiety?", d(
            "Both concerns are valid — and this is exactly why medical evaluation before "
            "attributing palpitations to anxiety matters.\n\n"
            "Anxiety absolutely produces real physical symptoms — palpitations, shortness "
            "of breath, chest tightness — driven by sympathetic nervous system activation. "
            "But palpitations also occur with cardiac arrhythmia, thyroid dysfunction "
            "(hyperthyroidism causes both anxiety and palpitations), anemia, and in the "
            "postpartum context, rare conditions like postpartum cardiomyopathy.\n\n"
            "Please see your provider for an evaluation — ECG, thyroid function, basic "
            "bloodwork — before attributing these symptoms to anxiety.\n\n"
            "Once cardiac and thyroid causes are ruled out, if anxiety is driving this, "
            "it responds well to CBT and SSRIs.")),
        ("What's the connection between menstrual cycles and mental health?", CYCLE_PHASES),
        ("How can I support a friend with postpartum depression?", d(
            "Knowing how to support well matters — here's what actually helps:\n\n"
            "**Show up practically, not just emotionally.** 'Let me know if you need "
            "anything' rarely works — PPD makes it impossible to know what to ask for. "
            "Concrete offers work: 'I'm dropping off dinner Wednesday — what time works?' "
            "or 'I'm free Thursday morning to hold the baby for 2 hours while you sleep.'\n\n"
            "**Don't minimize or silver-line.** 'You have such a beautiful baby' is not "
            "comforting when someone has depression. 'I can see how hard this is' is.\n\n"
            "**Ask the direct question once, warmly.** 'I've noticed you seem really low. "
            "Are you having thoughts of hurting yourself?' Asked directly, this reduces "
            "stigma rather than increasing distress. If yes, help them contact 988 or PSI.\n\n"
            "**Stay consistent over time.** Support clusters at the beginning and disappears "
            "after a few weeks — consistent presence at weeks 4–12 matters most.\n\n"
            "**Talk about things other than the baby** — your friend is still a whole person.")),
    ]

    for u, a in misc_pairs:
        data.append(ex(u, a))

    # ── MULTI-TURN CONVERSATIONS ──────────────────────────────────────────────
    multi_turns = [
        # PMDD discovery
        [("user", "I feel terrible right before my period every single month."),
         ("assistant", d("That predictable monthly pattern — terrible right before your period — is worth taking seriously rather than just accepting.\n\nCan you tell me more? When you say 'terrible' — is it mostly emotional (irritability, depression, anxiety, mood swings), physical (cramps, bloating, breast tenderness), or a combination? And approximately how many days before your period does it start, and does it clear up once your period begins?\n\nThose details make a real difference in understanding what's driving this.")),
         ("user", "Mostly mood. Really irritable and depressed. Starts about 10 days before and then I'm completely fine when my period starts."),
         ("assistant", d("That is a very clear and diagnostically meaningful pattern — mood symptoms beginning approximately 10 days before your period and resolving with menstruation.\n\nThat timing maps precisely onto the late luteal phase, which is the biological window for premenstrual disorders. The fact that you're 'completely fine' when your period starts is actually one of the most diagnostically important features — it suggests the symptoms are cycle-driven rather than a continuous mood condition.\n\nThis pattern is consistent with a premenstrual mood disorder. The key question for distinguishing PMDD from severe PMS is functional impact: is the irritability and depression affecting your work, relationships, or daily life in a meaningful way?\n\nA formal diagnosis requires prospective daily tracking over at least 2 cycles. Logging your mood and symptoms daily in CycleMind through the next two cycles will build exactly that dataset — and it becomes evidence you can bring to your provider for evaluation and discussion of treatment options."))],

        # Postpartum with crisis screening
        [("user", "I had my baby 5 weeks ago and I don't feel right."),
         ("assistant", d("Five weeks postpartum and not feeling right — I want to understand more. What does 'not right' feel like for you? Is it more of an emotional heaviness, anxiety or worry, feeling disconnected or numb, physical exhaustion, or some combination? And has it been this way since the birth, or did it develop more recently?")),
         ("user", "I feel empty and numb. I love my baby but I feel nothing when I hold her. I keep crying. I sleep when she sleeps but wake up exhausted."),
         ("assistant", d("What you're describing — emotional numbness, difficulty feeling the connection you expected, tearfulness, and non-restorative sleep at 5 weeks — are recognized symptoms of postpartum depression.\n\nAt 5 weeks, this is past the window where baby blues resolve on their own. The emotional numbness and difficulty connecting with your baby are not signs of failed love — depression consumes the emotional bandwidth that connection requires. That changes with treatment.\n\nPlease reach out to your OB, midwife, or primary care provider this week. This is very treatable, and getting support now makes a real difference.\n\nI also want to ask directly: are you having any thoughts of harming yourself or feeling like your baby would be better off without you? If so, please call 988 or PSI at 1-800-944-4773 right now."))],

        # Perimenopause + mood uncertainty
        [("user", "I'm 46 and feel really off for the past year."),
         ("assistant", d("A year of feeling off is significant and worth understanding. Can you tell me more — have you noticed changes in your mood (more irritable, anxious, or low), sleep quality, energy, or physical symptoms like hot flashes or night sweats? And have you noticed any changes in your menstrual cycle — more irregular, heavier, closer together, or with longer gaps?\n\nAt 46, the context matters a lot for making sense of what might be happening.")),
         ("user", "My periods are very irregular now. I wake up drenched in sweat. My mood cycles between almost high and then really low. I can barely sleep."),
         ("assistant", d("The picture you're describing — irregular cycles, night sweats, mood cycling between elevated and low, and sleep disruption at 46 — is very consistent with perimenopause.\n\nErratic estrogen fluctuations during the menopausal transition directly affect mood neurotransmitter systems, and night sweats disrupting sleep significantly compounds this.\n\nI want to note one thing specifically about the mood pattern: cycling between feeling 'almost high' and then really low is worth discussing specifically with your provider. Perimenopausal mood instability can look like this — but this pattern also overlaps with bipolar spectrum presentations, which can be first recognized or exacerbated during hormonal transitions. This distinction matters for treatment choice.\n\nPlease bring the full picture to your provider — irregular cycles, night sweats, sleep disruption, AND the mood cycling — so they can evaluate appropriately. Both SSRIs/SNRIs and MHT are options, but getting the clinical picture right first matters."))],

        # TTC emotional support
        [("user", "We've been trying to get pregnant for 10 months. Nothing."),
         ("assistant", d("Ten months of trying — and ten months of hope followed by disappointment, every cycle. That accumulates in a way that's genuinely heavy, and I want to acknowledge that before anything practical.\n\nA few questions that would help give you useful information: Are your cycles regular? Have you been tracking ovulation with OPKs or BBT? And have either of you had any fertility evaluation yet?\n\nAt 10 months at your age (can you share approximately how old you are?), you're approaching or at the point where a fertility evaluation makes clinical sense.")),
         ("user", "I'm 33. Cycles are regular at 28 days. I get positive OPKs. We're timing it. Still nothing."),
         ("assistant", d("Regular cycles, confirmed positive OPKs, and correctly timed intercourse — you're doing everything right from a tracking perspective, which makes the continued negative tests even more frustrating.\n\nAt 33 with 10 months of timed intercourse and confirmed ovulation, you're at a reasonable point to request an initial fertility evaluation. A basic workup includes: a semen analysis for your partner (male factor accounts for 40–50% of cases), hormonal labs for you (FSH, LH, AMH for ovarian reserve, thyroid), and potentially an HSG (to check tubes are open).\n\nThis is information-gathering, not an emergency. Many couples in your situation find a treatable cause, or simply need a bit more time. But getting evaluation now will give you better information than continuing to wait.\n\nEmotionally — the 10-month mark is where anxiety often intensifies significantly. That's completely understandable. RESOLVE (resolve.org) has peer support resources for exactly this waiting and uncertainty period."))],
    ]

    for turns in multi_turns:
        msgs = [{"role": "system", "content": PERSONA_FULL}]
        for role, content in turns:
            msgs.append({"role": role, "content": content})
        data.append({"messages": msgs})

    # ── TONE VARIATIONS ───────────────────────────────────────────────────────
    desperate_pmdd = [
        "I can't take this anymore. Every month I lose myself before my period.",
        "My PMDD is destroying my marriage and my job. I'm desperate.",
        "I've had PMDD for 8 years and nothing helps. Please help me.",
    ]
    for u in desperate_pmdd:
        data.append(ex(u, d(
            "What you're carrying — years of this, with relationships and work at risk — "
            "is genuinely exhausting, and the desperation makes complete sense.\n\n"
            "I want to be direct with you: there are effective treatments that many people "
            "with severe PMDD haven't yet accessed. The full treatment ladder includes:\n\n"
            "1. If SSRIs haven't worked: has luteal-phase-only dosing been tried? "
            "(Different from continuous dosing, and often works when continuous doesn't)\n"
            "2. If one SSRI failed: different SSRIs have different response rates — "
            "a second or third trial is clinically legitimate\n"
            "3. Drospirenone OCP (Yaz) — FDA-approved for PMDD; suppresses the cycle entirely\n"
            "4. GnRH agonists (medical menopause with add-back) — highly effective for severe cases\n\n"
            "IAPMD (iapmd.org) has both a provider directory of PMDD-aware specialists and "
            "peer support from others who've navigated exactly this. A reproductive psychiatrist "
            "or PMDD specialist — rather than a general OBGYN — often makes the critical difference.\n\n"
            "You haven't exhausted all options. The exhaustion is real; the situation isn't hopeless."
        )))

    skeptical = [
        "Is PMDD even real or is it just medicalizing normal emotions?",
        "My boyfriend thinks PMDD is an excuse. What's the evidence?",
        "I'm skeptical that premenstrual mood changes need treatment.",
    ]
    for u in skeptical:
        data.append(ex(u, d(
            "PMDD is real — a recognized clinical diagnosis in DSM-5-TR, not a cultural construct.\n\n"
            "The evidence base is substantial:\n"
            "- Multiple RCTs demonstrate that luteal-phase SSRI treatment significantly reduces "
            "PMDD symptoms versus placebo\n"
            "- Neuroimaging shows measurable brain differences in GABA-A receptor function "
            "and allopregnanolone response in women with PMDD vs. controls with identical hormone levels\n"
            "- Bilateral oophorectomy (surgical menopause) reliably eliminates PMDD — "
            "confirming the hormonal basis beyond doubt\n"
            "- GnRH agonists (chemical ovarian suppression) produce consistent PMDD remission\n\n"
            "The 'medicalizing emotions' concern misses what PMDD requires for diagnosis: "
            "symptoms causing clinically significant distress or functional impairment, confirmed "
            "prospectively over 2 cycles. Ordinary premenstrual moodiness doesn't qualify. "
            "PMDD is the severe end of a spectrum that genuinely disrupts lives and relationships."
        )))

    # ── LOGGER SUGGESTION EXAMPLES ────────────────────────────────────────────
    log_pairs = [
        ("I've been feeling really irritable and tired today.", d(
            "Irritability and fatigue together can be really draining — and the fact that "
            "you're noticing and naming it matters.\n\n"
            "Do you know where you are in your cycle today? Irritability and fatigue are "
            "common in the late luteal phase (the week or two before your period) and are "
            "directly linked to hormonal shifts in that window.\n\n"
            "If you haven't already, logging today's mood and symptoms in CycleMind — even "
            "a quick rating — starts revealing whether these feelings track with your cycle. "
            "Over a couple of months, the pattern becomes visible and useful for both "
            "self-understanding and clinical conversations.")),
        ("I barely slept last night and I feel emotionally fragile.", d(
            "Sleep deprivation and emotional fragility are directly connected — even one "
            "night of significantly disrupted sleep impairs emotional regulation. "
            "That's physiology, not weakness.\n\n"
            "If this is a pattern that correlates with your cycle — particularly if poor "
            "sleep tends to happen in the week or two before your period — that's clinically "
            "relevant information. Log your sleep quality and mood today in CycleMind so "
            "the pattern has a chance to emerge over time.\n\n"
            "Is this a one-off bad night, or is poor sleep something you're dealing with regularly?")),
        ("I've been having really bad cramps today.", d(
            "Cramps that feel really bad deserve attention, not just pushing through.\n\n"
            "For immediate relief: ibuprofen started before or at the onset (not after pain "
            "is severe) is more effective — it works by blocking prostaglandins that cause "
            "uterine contractions. Heat therapy is genuinely evidence-based: a heating pad "
            "can be as effective as NSAIDs for mild-moderate cramping.\n\n"
            "If your cramps are regularly this severe, or worsening over time, or accompanied "
            "by pain during sex or outside your period — that warrants evaluation for "
            "endometriosis or other causes.\n\n"
            "Logging today's pain severity, flow, and cycle day in CycleMind builds a "
            "pattern that's useful at any clinical appointment.")),
        ("I feel so anxious today. My heart is racing.", d(
            "Racing heart with anxiety can be really unsettling — physically uncomfortable "
            "on top of the psychological experience.\n\n"
            "For acute anxiety: slow your exhale to be longer than your inhale (try 4 counts "
            "in, 6–8 out). This activates the parasympathetic nervous system and directly "
            "counteracts the sympathetic arousal driving the racing heart.\n\n"
            "It's also worth noting where you are in your cycle. Luteal-phase anxiety — "
            "the week or two before your period — has a distinct neurochemical basis. "
            "Log today's anxiety, mood, and cycle day in CycleMind — a few months of data "
            "will reveal whether this is cycle-driven and give your provider real context.")),
        ("I cried three times today and don't know why.", d(
            "Crying without a clear reason — or emotional fragility that doesn't match "
            "what's actually happening — is worth paying attention to.\n\n"
            "Where are you in your cycle approximately? Unexplained tearfulness is a "
            "recognized feature of the late luteal phase in premenstrual disorders. "
            "If you're postpartum, persistent tearfulness can signal PPD even weeks or "
            "months in. If it's present throughout your cycle, that points more toward "
            "an underlying mood condition.\n\n"
            "Logging your mood, tearfulness, and cycle day in CycleMind today and through "
            "the next few weeks will help clarify the pattern — and give your provider "
            "real data if you decide to seek support.")),
        ("I'm exhausted but can't sleep. It's driving me crazy.", d(
            "That combination — exhaustion but inability to sleep — is one of the most "
            "frustrating experiences, and it has a name: psychophysiological insomnia. "
            "The anxiety about not sleeping creates arousal that makes sleep harder.\n\n"
            "Most evidence-based answer: CBT-I (Cognitive Behavioral Therapy for Insomnia) "
            "works better long-term than medication. The key principles: get out of bed if "
            "awake more than 20 minutes (breaks the bed-anxiety association), consistent "
            "wake time even after bad nights, no screens 60 minutes before bed, cool dark room.\n\n"
            "If this is happening in a pattern related to your cycle — especially in the "
            "week or two before your period — that's important information. Log your sleep "
            "quality and cycle day in CycleMind.")),
    ]

    for u, a in log_pairs:
        data.append(ex(u, a))

    return data


if __name__ == "__main__":
    import sys
    data = build()
    random.seed(42)
    random.shuffle(data)

    with open(OUT, "w", encoding="utf-8") as f:
        for obj in data:
            f.write(json.dumps(obj, ensure_ascii=False) + "\n")

    size_kb = OUT.stat().st_size / 1024
    print(f"Written {len(data)} examples to {OUT}")
    print(f"File size: {size_kb:.0f} KB ({size_kb/1024:.1f} MB)")