---
title: Luna RAG Architecture — Technical Reference
tags: [luna, rag, architecture, technical, ai, knowledge-base]
source: CycleMind Internal Documentation
date: 2026-06-01
related:
  - "[[Luna-Clinical-Boundaries]]"
  - "[[Luna-Crisis-Protocol]]"
  - "[[index]]"
---

# Luna RAG Architecture

> **Related:** [[Luna-Clinical-Boundaries]] · [[Luna-Crisis-Protocol]] · [[index]]

---

## Overview

Luna uses a **3-tier retrieval-augmented generation (RAG)** architecture to ground her responses in clinically accurate information while maintaining warm, conversational output.

```
User Message
     │
     ▼
┌─────────────────────────────────┐
│  TIER 0: Crisis Safety Check    │  ← Immediate escalation, no LLM needed
│  (keyword matching, instant)    │
└─────────────────────────────────┘
     │ (if not crisis)
     ▼
┌─────────────────────────────────┐
│  TIER 1: Deterministic RAG      │  ← Topic match → TOPIC_SUMMARIES lookup
│  (zero-latency, inline)         │
└─────────────────────────────────┘
     │ (RAG context built)
     ▼
┌─────────────────────────────────┐
│  LLM TIER 1: Ollama local       │  ← luna-cyclemind model, localhost:11434
│  (luna-cyclemind, <15s timeout) │
└─────────────────────────────────┘
     │ (if timeout or coherence fail)
     ▼
┌─────────────────────────────────┐
│  LLM TIER 2: InvokeLLM cloud    │  ← Base44 cloud fallback
│  (cloud fallback)               │
└─────────────────────────────────┘
     │ (if cloud fails)
     ▼
┌─────────────────────────────────┐
│  LLM TIER 3: Grok / xAI API    │  ← grok-3-mini via XAI_API_KEY
│  (final fallback)               │
└─────────────────────────────────┘
     │ (if all LLMs fail)
     ▼
┌─────────────────────────────────┐
│  RAG Direct Fallback            │  ← Return TOPIC_SUMMARIES text directly
│  (no LLM)                       │
└─────────────────────────────────┘
```

---

## RAG Topic Detection

### How Topics Are Matched
The `searchRAG()` function in `functions/lunaChat` uses **keyword-weighted scoring**:

1. User message is lowercased
2. Each message is checked against `RAG_TOPICS` dictionary (25+ topics)
3. Each matching keyword scores points (multi-word matches score proportionally higher)
4. Highest-scoring topic wins
5. Crisis keywords are checked first — always override

### RAG Topics Covered

| Topic Key | Triggers On |
|---|---|
| `pmdd` | pmdd, premenstrual, luteal phase, pms, drsp |
| `postpartum_depression` | ppd, baby blues, postnatal depression |
| `postpartum_psychosis` | hearing voices after birth, pp psychosis |
| `postpartum_ocd` | intrusive thoughts baby, harm obsessions |
| `postpartum_anxiety` | new mom anxiety, worrying about baby |
| `pregnancy_depression` | antenatal depression, prenatal depression |
| `pregnancy_anxiety` | anxiety in pregnancy, panic pregnancy |
| `bipolar` | bipolar, mania, hypomania, lithium, lamotrigine |
| `perimenopause` | perimenopause, hot flash, night sweats |
| `menopause` | menopause, hrt, hormone therapy, gsm |
| `fertility` | fertility, ivf, ttc, infertility, ovulation |
| `pregnancy_loss` | miscarriage, stillbirth, tfmr, ectopic |
| `endometriosis` | endometriosis, dysmenorrhea, pelvic pain |
| `pcos` | pcos, polycystic, insulin resistance |
| `contraception` | birth control, pill mood, iud mood |
| `ssri` | ssri, sertraline, fluoxetine, antidepressant |
| `breastfeeding` | breastfeeding medication, nursing medication |
| `sleep` | insomnia, sleep problems, waking up |
| `anxiety` | anxiety, panic attack, gad, worry |
| `depression` | depression, depressed, sad, hopeless |
| `trauma` | trauma, ptsd, abuse, birth trauma |
| `crisis` | suicidal, suicide, self harm, want to die |

---

## Context Injection

When a RAG topic is matched, the corresponding `TOPIC_SUMMARIES[topic]` (a concise clinical summary) is injected into the LLM system prompt:

```
CLINICAL REFERENCE (from CycleMind knowledge base, topic: pmdd):
[TOPIC_SUMMARIES.pmdd content]

Use this as background context — weave the relevant parts naturally
into your response rather than quoting it directly.
```

This ensures every clinical response is grounded in the knowledge base, not hallucinated.

---

## Coherence Check

Before accepting an LLM response, `checkCoherence()` validates:
1. Response is a non-empty string (length > 20 characters)
2. Does not contain AI refusal markers ("as an AI language model", "I cannot", etc.)
3. If coherence fails → next tier is tried

---

## Response Structure

Every response from `lunaChat` returns:

```typescript
{
  mainContent: string,          // Luna's message
  disclaimer: string | null,    // Clinical disclaimer (if topic is clinical)
  source: string,               // 'ollama_primary' | 'invokellm_fallback' | 'grok_fallback' | 'rag_direct_fallback'
  suggestedActions: string[],   // Quick-reply buttons
  flags: {
    escalate: boolean,          // Should clinician be notified?
    crisis: boolean,            // Crisis response?
  },
  detectedSymptoms: string[],   // Symptoms mentioned → offered for logging
  codedSymptoms: object,        // DRSP-coded symptom fields
  ragTopic: string | null,      // Which RAG topic was matched
}
```

---

## Symptom Detection Pipeline

After the LLM response, the user's message is scanned for symptom keywords:

```
User message → SYMPTOM_KEYWORDS matching → detectedSymptoms[]
                                                 │
                                                 ▼
                                    "Save to today's log?" UI card
                                                 │
                                                 ▼
                               LunaChat.saveSymptoms() → DailyEntry.custom_symptoms[]
```

The `alreadySavedSymptoms` parameter prevents re-offering symptoms already logged in this session.

---

## Log Suggestion Heuristic

`shouldSuggestLogging()` scans user messages for "loggable signals":
- Mood words: sad, anxious, irritable, overwhelmed, stressed
- Physical words: nausea, cramp, headache, bloat, fatigue
- Sleep words: insomnia, woke up, tired, exhausted
- Cycle words: bleeding, spotting, cramping, hot flash

When triggered, Luna will gently suggest logging — but only once per conversation segment, and only when it flows naturally.

---

## Adding New RAG Topics

To add a new clinical topic:

1. Add keywords to `RAG_TOPICS` in `functions/lunaChat`:
```javascript
new_topic: ['keyword1', 'keyword2 phrase', 'keyword3'],
```

2. Add a clinical summary to `TOPIC_SUMMARIES`:
```javascript
new_topic: `Clinical summary text here — 2–4 sentences covering key facts,
evidence-based treatments, and any Luna-specific boundaries.`,
```

3. Optionally create a matching wiki page in this vault for the detailed reference.

---

## Model Configuration

| Parameter | Value |
|---|---|
| Model (Tier 1) | `luna-cyclemind` (Ollama local) |
| Temperature | 0.7 |
| Max tokens (Quick) | 200 |
| Max tokens (Deep) | 500 |
| Timeout | 15 seconds |
| Fallback (Tier 2) | InvokeLLM (Base44 cloud) |
| Fallback (Tier 3) | Grok-3-mini (xAI API) |

---

*Last updated: 2026-06-01 · CycleMind Engineering*