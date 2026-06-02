# CycleMind Knowledge Base — Clinical Second Brain

> **For:** The CycleMind clinical team and the three consulting psychiatrists  
> **Purpose:** A living, linked knowledge base for reproductive mental health — powering Luna's RAG responses and generating doctor-ready summaries.

---

## What Is This?

This is CycleMind's **Obsidian Vault** — a structured, interlinked Markdown knowledge base modeled after Andrej Karpathy's "Wiki Layer" approach. It functions as a true second brain:

- **Luna reads from it** — RAG grounding for every clinical response
- **Luna writes to it** — new observations land in `Luna Outputs/` and `Symptom Patterns/`
- **You edit it** — psychiatrists review, annotate, and expand pages
- **It generates reports** — structured data feeds into doctor summaries automatically

---

## Folder Structure

```
knowledge-base/
├── raw/                        ← Original immutable sources (PDFs, articles, DSM-5 excerpts)
│   └── .gitkeep
├── wiki/                       ← Clean, linked Markdown files (your Obsidian vault)
│   ├── index.md                ← Master table of contents + graph instructions
│   ├── Daily Logs/             ← Auto-generated daily entry summaries
│   ├── Symptom Patterns/       ← Luna-detected symptom pattern files per user cohort
│   ├── Cycle Phases/           ← Clinical reference for each cycle phase
│   ├── PMDD Management/        ← PMDD protocols, DRSP analysis, treatment notes
│   ├── Pregnancy & Postpartum/ ← Perinatal mental health pages
│   ├── Perimenopause & Menopause/ ← Transition-phase clinical reference
│   ├── Doctor Reports/         ← Generated clinical summaries (PDF source data)
│   └── Luna Outputs/           ← Luna's auto-written observations and insights
└── README.md                   ← This file
```

---

## Opening in Obsidian

1. Download [Obsidian](https://obsidian.md) (free)
2. Click **"Open folder as vault"**
3. Navigate to this project's `knowledge-base/wiki/` folder
4. Open it — all internal `[[links]]` will resolve automatically
5. Enable **Graph View** (Ctrl+G / Cmd+G) to see the full knowledge graph

### Recommended Obsidian Plugins
- **Dataview** — query symptom patterns as live tables
- **Templater** — auto-fill frontmatter for new pages
- **Obsidian Git** — sync vault changes back to this repo automatically
- **Natural Language Dates** — for daily log linking

---

## How Luna Writes New Notes

Luna automatically writes into two folders when it detects patterns:

### `Luna Outputs/`
When Luna generates a clinical insight report, the structured output is saved here as:
```
Luna Outputs/YYYY-MM-DD-insight-[user_cohort].md
```

### `Symptom Patterns/`
When Luna detects recurring symptom clusters across a user's logs, it creates or appends to:
```
Symptom Patterns/[symptom-name]-pattern.md
```

These files are then linked back into relevant wiki pages (e.g., a new PMDD symptom cluster links to `PMDD Management/PMDD-Overview.md`).

---

## How Psychiatrists Should Use This

### Daily Workflow
1. Open Obsidian vault → check `Luna Outputs/` for new overnight insights
2. Review any new entries in `Symptom Patterns/` — add clinical annotations
3. Use Graph View to spot unexpected connections between topics

### Editing Clinical Content
- Edit any wiki page directly in Obsidian or in VS Code
- Follow the YAML frontmatter format at the top of each file
- Add `[[links]]` to connect to related pages — Luna's RAG uses these connections
- Tag pages with `#pmdd`, `#postpartum`, `#perimenopause`, etc.

### When Luna Is Wrong
If Luna gives a clinically inaccurate response grounded in a wiki page:
1. Find the source page (check `ragTopic` in the response)
2. Edit the relevant wiki page directly
3. Commit the change — Luna's next RAG search will use the updated content

---

## Generating Doctor-Ready Summaries

### From the App
1. Open Luna chat → type "Generate clinical report"
2. Luna calls `generateClinicalReport` backend function
3. A PDF is downloaded covering the last 90 days of data

### From the Clinical Dashboard
1. Go to **Insights → Share with Doctor**
2. Select date range and data to include
3. Generate a tokenized share link (expires in 30 days)
4. Share the link directly with the treating clinician

### Manual Export
The `Doctor Reports/` wiki folder contains structured Markdown templates. Fill in the template and export as PDF from Obsidian (File → Export to PDF).

---

## Adding New Clinical Content

When adding a new wiki page:

```markdown
---
title: Page Title
tags: [pmdd, luteal-phase, ssri]
source: Textbook of Women's Reproductive Mental Health; DSM-5
date: YYYY-MM-DD
related:
  - "[[PMDD-Overview]]"
  - "[[Luteal-Phase-Patterns]]"
---

# Page Title

> **Related:** [[Link1]] · [[Link2]]

Content here...
```

---

## Keeping the Vault in Sync with the App

The knowledge base lives inside the CycleMind GitHub repo. Changes made in Obsidian (via Obsidian Git plugin) are automatically committed and pushed. Luna's backend reads from these files at runtime via the RAG pipeline.

**Sync workflow:**
```
Edit in Obsidian → Obsidian Git commits → GitHub → Luna RAG reads updated content
```

---

## Contact & Support

Questions about the clinical content? Contact the CycleMind clinical team.  
Questions about Luna's RAG integration? Check `functions/lunaChat` in the codebase.

---

*CycleMind Knowledge Base · Version 1.0 · Built for reproductive mental health.*