# Luna SFT Dataset — `luna-finetune.jsonl`

## Overview

| Field | Value |
|---|---|
| **Format** | Axolotl JSONL (OpenAI chat format) |
| **Total examples** | ~160 high-quality conversation turns |
| **Source** | RAG knowledge base (4,245 entries) + Obsidian wiki (33 pages) + production persona |
| **Date created** | 2026-06-01 |

---

## Dataset Structure

Each line is a single JSON object with the following shape:

```json
{
  "messages": [
    {
      "role": "system",
      "content": "<full Luna production persona + persona constraints>"
    },
    {
      "role": "user",
      "content": "<user question or message>"
    },
    {
      "role": "assistant",
      "content": "<Luna response>"
    }
  ]
}
```

Multi-turn conversations follow the same format with additional user/assistant message pairs.

---

## Topic Distribution

### PMDD & Luteal Phase (highest priority)
- PMDD definition, DSM-5 criteria, pathophysiology
- PMDD vs PMS vs premenstrual exacerbation (PME)
- Luteal-phase SSRI dosing (intermittent vs continuous)
- First-line: calcium, exercise, CBT
- Second-line: drospirenone OCP (Yaz)
- Third-line: GnRH agonists
- DRSP tracking and cycle charting
- Managing PMDD in relationships
- PMDD and social withdrawal, rage, exhaustion

### Postpartum Mental Health
- Baby blues vs PPD differentiation
- Postpartum depression symptoms, EPDS screening
- Postpartum anxiety (SIDS fear, excessive worry)
- Postpartum OCD (intrusive thoughts, ERP treatment)
- Postpartum psychosis (emergency recognition)
- Bonding difficulties
- Breastfeeding and sertraline safety (RID <3%)
- Zuranolone (Zurzuvae) mechanism and use
- Brexanolone mechanism
- Partner with PPD
- Sleep deprivation and PPD risk
- Fear of disclosing PPD to provider

### Pregnancy Mental Health
- Antenatal depression — risks of untreated vs treated
- SSRI safety in pregnancy (NAS, sertraline preference)
- Panic attacks in third trimester (CBT, grounding)
- Pregnancy anxiety and hypervigilance
- "Pregnancy brain" / cognitive changes
- Trauma history and birth planning
- Ambivalence during wanted pregnancies

### Perimenopause & Menopause
- Perimenopause definition, STRAW staging, average ages
- Depression risk 2–4x in menopausal transition
- Menopause hormone therapy (MHT): WHI recontextualization
- Transdermal estradiol + micronized progesterone safety
- Non-hormonal options: fezolinetant, venlafaxine, gabapentin
- GSM (genitourinary syndrome of menopause)
- Cognitive symptoms — brain fog, word retrieval
- Perimenopausal mood swings (bipolar differential)
- PMDD history → perimenopausal vulnerability

### Fertility & Reproductive Loss
- TTC emotional journey, cumulative grief
- OPK and BBT interpretation
- IVF emotional arc, two-week wait
- Failed IVF cycle — coping
- Pregnancy after infertility anxiety
- Miscarriage grief — no timeline
- Second trimester loss, TFMR
- Stillbirth support
- Recurrent pregnancy loss (RPL) evaluation
- POI (premature ovarian insufficiency) at 24
- Diminished ovarian reserve explained
- Age 33 and fertility — realistic framing
- Egg freezing psychological considerations

### Cycle Tracking & Biology
- Menstrual cycle phase effects on mood (follicular, ovulatory, luteal)
- Cycle length normal range (24–38 days)
- Ovulation detection — OPKs, BBT, cervical mucus
- Late period with negative pregnancy test
- Irregular cycles: causes, perimenopausal markers
- Spotting between periods — when to seek care

### Medications & Treatment
- Sertraline: RID in breastfeeding, safety data
- SSRI mechanism in PMDD vs depression
- SSRIs in pregnancy: NAS, risk-benefit framework
- Hormonal contraception and mood (Skovlund study, progestin types)
- Lamotrigine pharmacokinetics in pregnancy
- Lithium for bipolar/postpartum psychosis prophylaxis
- Calcium 1200 mg/day for PMDD
- Omega-3 EPA vs DHA for depression
- St. John's Wort contraindications
- GnRH agonists for PMDD (third-line)
- Zuranolone mechanism
- CBT vs IPT vs EMDR vs ACT — comparison

### Clinical Tools & Screening
- EPDS scoring and interpretation
- DRSP — how to use it
- PHQ-9 and GAD-7 in reproductive context
- Doctor Share feature in CycleMind
- Clinical report generation
- How to talk to your doctor about mental health

### Safety & Crisis Responses (exact protocol)
- Suicidal ideation → 988 + PSI immediately, no LLM counseling
- Passive suicidal ideation ("want pain to stop") → crisis resources
- Postpartum psychosis signs → emergency room now
- Postpartum OCD intrusive thoughts → validation + referral (not crisis)
- Fear of disclosing to OB (custody fear) → evidence-based reassurance

### Special Topics
- ADHD and cycle-phase worsening
- Eating disorder history and pregnancy weight gain
- Childhood trauma and parenting fears
- PCOS — fertility, body image, treatment
- Endometriosis — chronic pain, psychological burden
- Inflammation and depression
- Mindfulness evidence and how to start
- How to find a therapist (resources)
- Supporting a friend with PPD

---

## Luna Persona Rules Enforced in All Responses

1. **No pet names** (no sweetie, honey, love)
2. **No emojis**
3. **No diagnosis** — always defer to clinician
4. **No specific medication doses** — general ranges only from clinical context
5. **Crisis protocol** — 988 + PSI helpline, no counseling attempt
6. **Standard disclaimer** appended to all clinical responses
7. **Warm validation first**, then information
8. **Log suggestion** when contextually natural (not forced)
9. **No hallucination markers** (no "as an AI", "I cannot")
10. **Plain language** — clinical terms explained when used

---

## Files

| File | Description |
|---|---|
| `luna-finetune.jsonl` | Primary dataset — batch 1 (66 examples) |
| `luna-finetune-batch2.jsonl` | Batch 2 (additional ~75 examples) |
| `README.md` | This document |

---

## Axolotl Configuration (recommended)

```yaml
base_model: meta-llama/Llama-3.1-8B-Instruct
model_type: LlamaForCausalLM
tokenizer_type: AutoTokenizer

datasets:
  - path: data/luna-finetune.jsonl
    type: chat_template
    chat_template: chatml
  - path: data/luna-finetune-batch2.jsonl
    type: chat_template
    chat_template: chatml

dataset_prepared_path: last_run_prepared
val_set_size: 0.02
output_dir: ./lora-luna

sequence_len: 4096
sample_packing: true
pad_to_sequence_len: true

adapter: lora
lora_r: 64
lora_alpha: 128
lora_dropout: 0.05
lora_target_linear: true

gradient_accumulation_steps: 4
micro_batch_size: 2
num_epochs: 3
optimizer: adamw_bnb_8bit
lr_scheduler: cosine
learning_rate: 0.0002
train_on_inputs: false
group_by_length: false

bf16: auto
tf32: false
gradient_checkpointing: true
```

---

## Quality Criteria

Each example was authored to meet the following standards:
- **Clinically accurate** — based directly on TOPIC_SUMMARIES, wiki files, and RAG entries
- **Tonally consistent** — warm, non-diagnostic, validating before informing
- **Boundary-correct** — never diagnoses, prescribes, or recommends specific doses
- **Disclaimer-complete** — standard disclaimer present on all clinical responses
- **Crisis-safe** — all crisis examples use exact protocol (988 + PSI, no counseling attempt)
- **Persona-consistent** — no emojis, no pet names, no AI identity markers

---

*Generated 2026-06-01 | CycleMind Clinical AI Team*