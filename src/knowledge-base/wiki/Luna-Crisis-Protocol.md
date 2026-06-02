---
title: Luna — Crisis Protocol & Escalation Scripts
tags: [luna, crisis, safety, suicide, escalation, emergency]
source: CycleMind Clinical Protocol; 988 Lifeline; PSI; ZERO Suicide Framework
date: 2026-06-01
related:
  - "[[Luna-Clinical-Boundaries]]"
  - "[[Perinatal-Suicide-Safety]]"
  - "[[Postpartum-Depression]]"
  - "[[Postpartum-Psychosis]]"
---

# Luna — Crisis Protocol & Escalation Scripts

> **Related:** [[Luna-Clinical-Boundaries]] · [[Postpartum-Depression]] · [[Postpartum-Psychosis]]

> ⚠️ **This is a safety-critical document. Review with the clinical team quarterly.**

---

## Crisis Detection

Luna uses keyword-based crisis detection that runs **before** any LLM call — ensuring zero-latency response with no possibility of hallucinated output.

### Tier 0 Crisis Keywords (Immediate Response)
Any message containing these phrases triggers the immediate crisis response:

```
suicidal, suicide, self harm, self-harm, cutting, want to die,
kill myself, hurt myself, end my life, not worth living,
take my life, no reason to live, better off dead, wouldn't miss me
```

This list is maintained in `functions/lunaChat` under `RAG_TOPICS.crisis`.

---

## Crisis Response Script

When a crisis keyword is detected, Luna sends **this exact response** — no LLM, no variation:

> *"I'm very concerned about what you've shared. Please reach out for immediate support right now.*
>
> ***988 Suicide & Crisis Lifeline:** Call or text **988***
> ***Postpartum Support International:** 1-800-944-4773*
> ***Emergency Services:** 911*
>
> *You don't have to face this alone. Please make that call."*

### Why This Exact Script
- No well-intentioned but potentially harmful attempts at counseling through the crisis
- Immediate, clear, actionable resources
- Does not minimize ("I'm sure things will get better") or create false urgency
- Validated against ZERO Suicide framework language guidelines

---

## Perinatal-Specific Crisis Scenarios

### Postpartum Suicidal Ideation
Suicide is a leading cause of maternal mortality in the first year postpartum. Perinatal suicidal ideation requires **same-day clinical assessment**.

**Luna's response includes:**
- 988 (primary)
- PSI Helpline: 1-800-944-4773 (perinatal-specialized)
- ER if active plan or intent

**Clinical follow-up required within 24 hours.**

### Postpartum Psychosis
Signs: Rapid mood shifts, confusion, hallucinations, delusions (often about baby), severe insomnia (3+ days), disorganized behavior.

**This is a psychiatric emergency.** Luna's response:
> *"What you're describing sounds like it needs urgent medical attention. Please go to your nearest emergency room now, or call 911. If you have a support person nearby, please tell them what's happening. This is a medical emergency that is treatable — please seek care immediately."*

**Do not attempt to stabilize via chat. ER referral is the only appropriate response.**

### Thoughts of Harming the Baby (OCD vs Psychosis)
Critical distinction:
- **OCD (ego-dystonic):** "I keep having horrible thoughts about hurting my baby and I'm terrified." → Postpartum OCD — validate, provide PSI, encourage therapist immediately. Not a safety emergency in most cases.
- **Psychosis (ego-syntonic):** "I think the baby needs to be hurt" / no distress about thought → Psychiatric emergency → 911 / ER immediately.

Luna flags **all** harm-toward-baby disclosures for clinical review, regardless of OCD vs psychosis assessment.

### Active IPV Disclosure
If a user discloses being in a dangerous relationship:
- Luna provides DV hotline: 1-800-799-7233
- Does not pressure leaving (most dangerous time)
- Does not lecture
- Validates and provides resource

---

## Secondary Escalation (Soft Escalation)

These situations trigger Luna to strongly encourage professional help (not full crisis protocol):

| Situation | Luna's Response |
|---|---|
| PHQ-9 score ≥15 in logs | Notes elevated scores; encourages provider contact within the week |
| Multiple consecutive days of severe DRSP (≥5) | Flags pattern; suggests "this sounds like it's significantly impacting your life — please talk to your provider this week" |
| "I haven't been sleeping for days" (postpartum) | Notes postpartum psychosis risk; recommends urgent provider contact |
| Disclosure of eating disorder behaviors | Validates; provides NEDA helpline (1-800-931-2237); encourages specialized care |
| Substance use disclosure (pregnancy) | Non-judgmental; SAMHSA helpline 1-800-662-4357; emphasizes care protects baby |

---

## Crisis Resources — Master List

| Resource | Number / Link | For |
|---|---|---|
| **988 Suicide & Crisis Lifeline** | Call or text 988 | All suicidal ideation |
| **Crisis Text Line** | Text HOME to 741741 | Prefer texting |
| **Postpartum Support International** | 1-800-944-4773 | Perinatal crisis |
| **National DV Hotline** | 1-800-799-7233 | IPV/domestic violence |
| **RAINN** | 1-800-656-4673 | Sexual assault |
| **SAMHSA** | 1-800-662-4357 | Substance use |
| **NEDA (Eating Disorders)** | 1-800-931-2237 | Eating disorders |
| **Emergency Services** | 911 | Imminent danger |
| **PSI Provider Directory** | postpartum.net | Finding specialized perinatal therapist |

---

## Clinical Team Notification Protocol

When Luna detects a crisis:
1. Crisis response is sent immediately to user
2. A `LunaAlert` record is created with `alert_type: "severe_symptoms"` and `severity: "high"`
3. Alert appears in the clinical team's notification dashboard
4. **24-hour follow-up required** for any high-severity alert
5. Document in clinical notes that outreach was made

---

## Regular Review

This protocol should be reviewed:
- **Quarterly** by clinical team
- **After any critical incident** where Luna's crisis response was activated
- **After any update** to DSM criteria or major clinical guidelines
- **Annually** as part of CycleMind clinical audit

---

*CycleMind Safety Protocol · ZERO Suicide Framework compliant · Review quarterly*