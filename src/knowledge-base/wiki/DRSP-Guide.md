---
title: DRSP — Daily Record of Severity of Problems
tags: [drsp, pmdd, diagnosis, tracking, assessment]
source: Endicott J et al. J Psychiatr Res 2006; ACOG Practice Bulletin
date: 2026-06-01
related:
  - "[[PMDD-Overview]]"
  - "[[Luteal-Phase-Patterns]]"
  - "[[Cycle-Tracking-Mental-Health]]"
---

# DRSP — Daily Record of Severity of Problems

> **Related:** [[PMDD-Overview]] · [[Luteal-Phase-Patterns]] · [[Cycle-Tracking-Mental-Health]]

---

## What Is the DRSP?

The **Daily Record of Severity of Problems (DRSP)** is the gold-standard validated instrument for diagnosing PMDD and tracking premenstrual symptom severity. It is required by DSM-5 for confirming PMDD diagnosis.

**Key principle:** Symptoms must be rated **prospectively** — the same day they occur — not retrospectively. Retrospective recall significantly overestimates luteal-phase symptoms.

---

## DRSP Symptom Domains

The DRSP rates 21 items on a 1–6 scale:
- **1** = Not at all present
- **2** = Minimal
- **3** = Mild
- **4** = Moderate
- **5** = Severe
- **6** = Extreme — couldn't function

### Affective Symptoms (Core — ≥1 required for PMDD diagnosis)
| # | Symptom | DSM-5 Criterion |
|---|---|---|
| 1 | Felt depressed, sad, hopeless, or self-deprecating | Criterion B1 |
| 2 | Felt anxious, tense, keyed up | Criterion B2 |
| 3 | Mood swings; sudden sadness or tearfulness | Criterion B3 |
| 4 | Felt angry, irritable, or had conflicts | Criterion B4 |

### Psychological Symptoms
| # | Symptom |
|---|---|
| 5 | Decreased interest in usual activities |
| 6 | Difficulty concentrating |
| 7 | Lethargy, easy fatigability |
| 8 | Appetite changes, food cravings, overeating |
| 9 | Hypersomnia (sleeping too much) |
| 10 | Insomnia (trouble sleeping) |
| 11 | Felt overwhelmed or out of control |

### Physical Symptoms
| # | Symptom |
|---|---|
| 12 | Breast tenderness or swelling |
| 13 | Bloating or weight gain sensation |
| 14 | Headaches |
| 15 | Joint or muscle pain |

### Functional Impairment (required for diagnosis)
| # | Domain |
|---|---|
| 16 | Work/school productivity impaired |
| 17 | Social activities avoided |
| 18 | Relationships strained |

---

## How CycleMind Maps to DRSP

CycleMind's daily log implements the full DRSP:

| CycleMind Field | DRSP Item |
|---|---|
| `s_depression` / `s_depressed` | Item 1 — Depressed mood |
| `s_anxiety` / `s_anxious` | Item 2 — Anxiety |
| `s_mood_swings` | Item 3 — Mood swings |
| `s_irritability` / `s_angry` | Item 4 — Irritability/anger |
| `s_less_interest` | Item 5 — Decreased interest |
| `s_concentration` | Item 6 — Concentration |
| `s_lethargic` | Item 7 — Lethargy |
| `s_appetite` / `s_cravings` | Items 8 — Appetite/cravings |
| `s_hypersomnia` | Item 9 — Hypersomnia |
| `s_insomnia` | Item 10 — Insomnia |
| `s_overwhelmed` / `s_out_of_control` | Item 11 — Overwhelmed |
| `s_breast_tender` | Item 12 — Breast tenderness |
| `s_bloating` | Item 13 — Bloating |
| `s_headache` | Item 14 — Headaches |
| `s_pain` | Item 15 — Joint/muscle pain |
| `s_productivity` | Item 16 — Work impairment |
| `s_social` | Item 17 — Social avoidance |
| `s_relationships` | Item 18 — Relationship strain |

---

## Interpreting DRSP Data

### Diagnostic Thresholds
For PMDD diagnosis, the following pattern must be present across **2 consecutive cycles**:

1. **Luteal phase:** Average score ≥4 ("moderate") on ≥5 symptoms, with ≥1 being affective
2. **Follicular phase:** Average score ≤2 ("minimal") on the same symptoms
3. **Symptom-free window:** Must be at least 1 week after menstruation begins (days 4–13 typically)

### PMDD vs PME vs PMS

| Pattern | Description | Interpretation |
|---|---|---|
| **PMDD** | Symptoms only in luteal phase, symptom-free follicular | Classic PMDD — treat with SSRI or OCP |
| **PME** | Symptoms throughout cycle, worse in luteal | Premenstrual Exacerbation — treat underlying disorder |
| **PMS** | Luteal symptoms, <5 items, or <moderate severity | Sub-threshold — lifestyle first, monitor |
| **No pattern** | Random symptom distribution | Likely other diagnosis — assess for MDD, GAD, bipolar |

### Luteal Phase Calculation
- Luteal phase = from ovulation to day before period
- Typically days 15–28 of a 28-day cycle
- Varies: short cycles = shorter luteal; long cycles = similar luteal length
- CycleMind auto-calculates based on entered cycle start dates

---

## Charting Best Practices

### For Users
- Rate symptoms **every evening** before bed — same time daily
- Rate how you felt **during the day**, not right now
- Include a brief note if rating >4 — helps clinicians understand context
- Track for a minimum of **2 full cycles** before seeking diagnosis

### For Clinicians
- Export 90-day DRSP data from CycleMind → **Insights → Share with Doctor**
- Look for the **symptom-free window** — its presence/absence is diagnostic
- Average follicular score vs luteal score: difference ≥30% suggests PMDD
- High scores throughout = consider PME — assess for MDD, GAD, bipolar II

---

## Luna's DRSP Integration

Luna references DRSP data when:
- User mentions mood, irritability, anxiety, or physical symptoms in chat
- User asks about PMDD diagnosis or cycle-related mood changes
- Weekly pattern analysis identifies luteal clustering

Luna will **never diagnose PMDD** from DRSP data alone — it will note patterns and recommend prospective tracking and clinician evaluation.

---

## Key References
- Endicott J et al. *Daily Record of Severity of Problems*. J Psychiatr Res. 2006.
- American Psychiatric Association. DSM-5. 2013.
- ACOG Practice Bulletin on Premenstrual Syndrome. 2023.