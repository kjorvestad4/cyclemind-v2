# CycleMind Knowledge Base — Obsidian Vault

## Overview
This knowledge base contains the synthesized clinical knowledge underpinning the CycleMind platform, derived from the **Textbook of Women's Reproductive Mental Health** and allied clinical sources. It is structured as an Obsidian-compatible Markdown vault with internal wiki links, YAML frontmatter, and a full index.

## How to Open in Obsidian

1. Download and install [Obsidian](https://obsidian.md) (free).
2. Open Obsidian → **Open folder as vault**.
3. Navigate to and select this `knowledge-base/wiki/` folder.
4. Obsidian will index all `.md` files and render the graph view automatically.

## Folder Structure

```
knowledge-base/
├── README.md                  ← this file
├── raw/                       ← immutable source documents (PDFs, excerpts)
│   └── .gitkeep
└── wiki/                      ← synthesized Markdown wiki pages
    ├── index.md               ← main table of contents + graph instructions
    ├── PMDD.md
    ├── Luteal-Phase-SSRI-Dosing.md
    ├── Perinatal-Depression.md
    ├── Postpartum-Psychosis.md
    ├── Perimenopause-Mental-Health.md
    ├── Pregnancy-Anxiety-Disorders.md
    ├── Bipolar-Disorder-Reproductive-Context.md
    ├── Postpartum-OCD.md
    ├── Substance-Use-Perinatal.md
    ├── Trauma-Reproductive-Health.md
    ├── Menopause-Hormone-Therapy.md
    ├── Fertility-Mental-Health.md
    ├── Infant-Mental-Health.md
    ├── Prenatal-Stress.md
    ├── Eating-Disorders-Perinatal.md
    ├── ADHD-Reproductive-Transitions.md
    ├── Schizophrenia-Reproductive-Context.md
    ├── Postpartum-Depression.md
    ├── Integrative-Perinatal-Depression.md
    └── Cycle-Tracking-Mental-Health.md
```

## Usage for Luna AI

Luna's RAG system (`src/lib/ragKnowledgeBase.js`) is the runtime lookup layer. This wiki is the **human-readable reference layer** for the three psychiatrists to review, annotate, and expand.

## Contributing
- Add new source documents to `raw/`
- Synthesize new wiki pages in `wiki/` using the existing format
- Maintain Obsidian-compatible `[[wiki links]]` between related concepts