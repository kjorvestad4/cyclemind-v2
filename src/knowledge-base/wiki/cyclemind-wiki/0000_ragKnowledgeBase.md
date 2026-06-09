---
title: Entry from ragKnowledgeBase.js
category: RAG
safety_level: standard
source: ragKnowledgeBase.js
updated: 2026-06-08T21:22:26.229880
---

Content from ragKnowledgeBase.js

// Master CycleMind RAG Knowledge Base — 4245 entries — consolidated on 2026-06-01
// Single consolidated master RAG file. All source files are imported and merged here.
// Export `allRagEntries` is the deduplicated master array used everywhere in the app.
// ============================================================
// Source files merged:
//   IDs 1–50:    lib/lunaResponseLibrary.js (different format, kept as LUNA_RESPONSE_LIBRARY)
//   IDs 51–800:  PMDD lifestyle, medication, support, postpartum, pregnancy, perimenopause, fertility, wellness, app
//   IDs 581–1084: lib/ragEntriesMid.js (safety, TCAs, MAOIs, depression, anxiety, exercise, stress)
//   IDs 1085–1395: lib/ragEntriesPregnancy.js (prenatal, nutrition, ectopic, postpartum clinical)
//   IDs 1386–2200: lib/ragEntriesClinical1.js (postpartum physiology, menopause, menstrual, cancer, sexual health, bone health)
//   IDs 2200–3305 + 4186–4245: lib/ragEntriesClinical2.js (psych therapies, depression, anxiety, OCD, PTSD, eating disorders, forensic, appendix)
//   IDs 1520–3495: Postpartum, fertility, pregnancy, textbook intro entries (this file)
//   IDs 3306–4185: lib/fertilityRagEntries.js (Chapters 1–23 fertility/reproductive psychiatry)
// ============================================================

export const ragKnowledgeBase = [

  // ============================================================
  // IDs 51–590: Previously Missing RAG Data
  // ============================================================

  // === PMDD Lifestyle (IDs 51–60) ===
  { id: 51, category: 'pmdd', keywords: ['foods avoid PMDD', 'PMDD diet luteal phase', 'sugar caffeine alcohol PMDD'], question: "What foods should I avoid during PMDD?", response: "Many women feel better when they cut back on sugar, caffeine, and alcohol in the luteal phase. Everyone is different though. Want me to suggest some easy swaps that might help you this week?" },
  { id: 52, category: 'pmdd', keywords: ['caffeine PMDD', 'caffeine anxiety irritabil... (truncated for wiki)
