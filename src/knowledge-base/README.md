# CycleMind Knowledge Base — Clinical Second Brain

> **For:** The CycleMind clinical team and the three consulting psychiatrists  
> **Purpose:** A living, linked knowledge base for reproductive mental health — powering Luna's RAG responses and generating doctor-ready summaries.

---

## What Is This?

This is CycleMind's **Obsidian Vault** — a structured, interlinked Markdown knowledge base modeled after the "Wiki Layer" approach. It functions as a true second brain:

- **Luna reads from it** — RAG grounding for every clinical response
- **Luna writes to it** — new observations land in `Luna Outputs/` automatically via the pipeline
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
│   ├── Luna Outputs/           ← Luna's auto-written pattern analyses and syntheses
│   ├── Symptom Patterns/       ← Recurring pattern files by symptom cluster
│   ├── PMDD-Overview.md
│   ├── Luteal-Phase-Patterns.md
│   ├── Luteal-Phase-SSRI-Dosing.md
│   ├── DRSP-Guide.md
│   ├── Cycle-Tracking-Mental-Health.md
│   ├── Perinatal-Depression.md
│   ├── Postpartum-Depression.md
│   ├── Postpartum-Psychosis.md
│   ├── Postpartum-OCD.md
│   ├── Postpartum-Anxiety.md
│   ├── Pregnancy-Anxiety-Disorders.md
│   ├── Bipolar-Disorder-Reproductive-Context.md
│   ├── Perimenopause-Mental-Health.md
│   ├── Menopause-Hormone-Therapy.md
│   ├── Fertility-Mental-Health.md
│   ├── Pregnancy-Loss-Grief.md
│   ├── Endometriosis-Mental-Health.md
│   ├── PCOS-Mental-Health.md
│   ├── Contraception-Mental-Health.md
│   ├── Trauma-Reproductive-Health.md
│   ├── Breastfeeding-Psychotropics.md
│   ├── Integrative-Perinatal-Depression.md
│   ├── Substance-Use-Perinatal.md
│   ├── Menstrual-Suppression.md
│   ├── Menarche-Adolescent-Mental-Health.md
│   ├── Perinatal-Suicide-Safety.md
│   ├── Luna-Clinical-Boundaries.md
│   ├── Luna-Crisis-Protocol.md
│   └── Luna-RAG-Architecture.md
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

---

## Self-Improving Knowledge Pipeline

CycleMind includes a **`lunaAutoUpdate`** backend function that feeds new data into the knowledge base automatically. It uses Luna's local Ollama model (`luna-cyclemind`) + deterministic `searchRAG` to analyze inputs and generate structured Markdown.

### Three Input Modes

---

### Mode 1: Analyze User Logs

Analyzes a specific user's recent daily logs, detects symptom patterns, and generates a clinical summary in `Luna Outputs/`.

**How to trigger** (from the app's function tester or API):

```json
POST /lunaAutoUpdate
{
  "mode": "user_logs",
  "userId": "<user-id-from-dashboard>",
  "days": 30
}
```

**Output:** A Markdown file like `Luna Outputs/2026-06-04-user-pattern-<userid>.md` containing:
- Symptom severity table (luteal vs follicular averages)
- Cycle phase analysis
- Clinical flags
- Suggested knowledge base updates

**To apply the output:**
1. Copy the `markdownContent` from the API response
2. Save it to `knowledge-base/wiki/Luna Outputs/` with the suggested filename
3. Open in Obsidian → review clinical accuracy
4. If the analysis suggests a `TOPIC_SUMMARIES` edit, update `functions/lunaChat` accordingly

---

### Mode 2: Import Clinical Text

Paste a clinical article excerpt, textbook passage, or guideline update. Luna synthesizes it into a structured wiki page.

```json
POST /lunaAutoUpdate
{
  "mode": "clinical_text",
  "title": "New ACOG Guidance on Fezolinetant for Menopausal Hot Flashes",
  "source": "ACOG Practice Bulletin 2026",
  "text": "Fezolinetant (Veozah) is a selective neurokinin 3 receptor antagonist approved by the FDA in 2023 for moderate-to-severe vasomotor symptoms... [paste full text here]"
}
```

**Output:** A synthesized wiki page in `Luna Outputs/` with:
- Clinical overview
- Key evidence and statistics
- Treatment implications for CycleMind users
- Luna application notes
- Suggested `[[wiki links]]` to related pages

**To apply:** Review the output → save to `knowledge-base/wiki/Luna Outputs/` → if clinically sound, promote to the main wiki by moving it to the appropriate folder and removing the `auto_generated: true` frontmatter flag.

---

### Mode 3: Integrate Psychiatrist Feedback

When one of the three psychiatrists reviews a Luna response and has corrections or additions, feed that feedback directly into the pipeline.

```json
POST /lunaAutoUpdate
{
  "mode": "psychiatrist_feedback",
  "topic": "pmdd",
  "psychiatristName": "Dr. Smith",
  "text": "Luna's PMDD response is missing the point about luteal-phase-only SSRIs being effective even at low doses (25mg sertraline). The current TOPIC_SUMMARY doesn't mention the dose flexibility which is clinically important for patients who experience SSRI side effects at standard doses..."
}
```

**Output:** A structured feedback note in `Luna Outputs/` containing:
- Distilled clinical points
- What in the existing knowledge base needs updating
- A **suggested edit to `TOPIC_SUMMARIES`** in `functions/lunaChat` (ready to copy-paste)
- Notes for the clinical team

**To apply the TOPIC_SUMMARIES edit:**
1. Find the suggested edit in the output's `## Suggested TOPIC_SUMMARIES Edit` section
2. Open `functions/lunaChat` in VS Code
3. Find the relevant topic in `TOPIC_SUMMARIES` (e.g., `pmdd: \`...\``)
4. Replace with the updated text
5. Save → the function redeploys automatically
6. Luna will use the updated grounding on the next user conversation

---

## Full Workflow for Psychiatrists

### Weekly Review Workflow
```
Monday morning:
1. Open Obsidian vault → check Luna Outputs/ for new files from the past week
2. Review each auto-generated analysis for clinical accuracy
3. Annotate or correct anything inaccurate directly in the Markdown file
4. If a TOPIC_SUMMARIES update is suggested → apply it to functions/lunaChat
5. Commit changes (Obsidian Git auto-commits on save if configured)

As needed:
- Paste new clinical guidelines → Mode 2 (clinical_text)
- After reviewing a Luna conversation → Mode 3 (psychiatrist_feedback)
```

### When Luna Gets Something Wrong
1. Note which `ragTopic` was matched (shown in the chat's "Clinical reference" badge)
2. Find the matching entry in `TOPIC_SUMMARIES` in `functions/lunaChat`
3. Use Mode 3 to generate a corrected version, or edit directly
4. Redeploy → Luna improves immediately

### Promoting Auto-Generated Content to Main Wiki
1. Open the auto-generated file in Obsidian
2. Review and edit for clinical accuracy
3. Remove `auto_generated: true` from the YAML frontmatter
4. Move the file from `Luna Outputs/` to the appropriate main wiki folder
5. Add the page to `index.md`'s navigation table
6. Add it to relevant `related:` frontmatter of other pages

---

## Making Edits to Clinical Content

When editing any wiki page:
- Follow the YAML frontmatter format at the top of each file
- Add `[[links]]` to connect to related pages — Luna's RAG uses these connections
- Tag pages with topic tags (e.g., `pmdd`, `postpartum`, `perimenopause`)
- Clinical corrections are effective immediately once committed to GitHub

---

## Generating Doctor-Ready Summaries

### From the App
1. Open Luna chat → type "Generate clinical report"
2. Luna calls `generateClinicalReport` backend function
3. A PDF covering the last 90 days is downloaded

### From the Clinical Dashboard
1. Go to **Insights → Share with Doctor**
2. Select date range and data to include
3. Generate a tokenized share link (expires in 30 days)

### Manual Export from Obsidian
Use the `Doctor Reports/` wiki folder templates → export as PDF from Obsidian (File → Export to PDF).

---

## Sync with GitHub

Changes made in Obsidian (via Obsidian Git plugin) are automatically committed and pushed. Luna's backend reads from these files at runtime via the RAG pipeline.

```
Edit in Obsidian → Obsidian Git commits → GitHub → Luna RAG reads updated content
```

---

## Contact & Support

Questions about clinical content: contact the CycleMind clinical team.  
Questions about Luna's RAG integration or the auto-update pipeline: see `Luna-RAG-Architecture.md` or check `functions/lunaAutoUpdate` in the codebase.

---

*CycleMind Knowledge Base · Version 2.0 · Self-improving pipeline added 2026-06-04*