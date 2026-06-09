---
title: Entry from lunaResponseLibrary.js
category: RAG
safety_level: standard
source: lunaResponseLibrary.js
updated: 2026-06-08T21:22:26.231462
---

Content from lunaResponseLibrary.js

// Luna's Evidence-Based Response Library
// 50 pre-written, cached responses organized by category
// All responses maintain warm, sister-like tone + medical disclaimers

export const LUNA_RESPONSE_LIBRARY = {
  // ===== CYCLE BASICS & PREDICTIONS (1–10) =====
  cycleBasics: [
    {
      id: 1,
      keywords: ['when', 'period', 'due', 'coming'],
      question: "When is my period due?",
      response: "You're in your luteal phase and your period is expected in about {days} days. This is when many women feel more sensitive — you're doing great by tracking it. Gentle self-care can really help right now. This is not a substitute for professional medical advice. Please consult your doctor."
    },
    {
      id: 2,
      keywords: ['how long', 'cycle', 'length', 'this month'],
      question: "How long is my cycle this month?",
      response: "Your cycle this month is tracking at {length} days. That's within a normal range, though it's a bit {shorter/longer} than your average. Would you like me to show you the trend over the last 6 months? I'm here with you."
    },
    {
      id: 3,
      keywords: ['when', 'ovulate', 'ovulation', 'fertile'],
      question: "When will I ovulate?",
      response: "Based on your last cycles, ovulation is most likely around day {day}. The fertile window is usually the 5 days before and the day of ovulation. If you're trying to conceive, this is a great time. Let me know how I can support you."
    },
    {
      id: 4,
      keywords: ['luteal', 'phase', 'am i in'],
      question: "Am I in my luteal phase?",
      response: "Yes, you're currently in your luteal phase (days {start}–{end}). This is when PMDD symptoms can feel stronger for many women. You're not alone — I'm right here. What's one small thing that usually helps you feel a bit better?"
    },
    {
      id: 5,
      keywords: ['cycle', 'late', 'why', 'delayed'],
      question: "Why is my cycle late?",
      response: "It's common for cycles to run a little late som... (truncated for wiki)
