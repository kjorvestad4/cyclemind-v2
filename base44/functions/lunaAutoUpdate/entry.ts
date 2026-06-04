import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ─────────────────────────────────────────────────────────────────────────────
// LUNA AUTO-UPDATE — Self-Improving Knowledge Pipeline
//
// Accepts three input modes via POST body:
//   { mode: "user_logs",    userId, days }          → analyze recent user logs
//   { mode: "clinical_text", text, title, source }  → synthesize raw clinical text
//   { mode: "psychiatrist_feedback", text, topic }  → integrate expert feedback
//
// Outputs:
//   - Structured Markdown for knowledge-base/wiki/Luna Outputs/
//   - Updated TOPIC_SUMMARIES patch (for the clinical team to review and apply)
//   - Pattern detection summary
// ─────────────────────────────────────────────────────────────────────────────

// ── RAG TOPICS (mirrors lunaChat — keep in sync) ────────────────────────────
const RAG_TOPICS = {
  pmdd: ['pmdd', 'premenstrual dysphoric', 'luteal phase', 'premenstrual', 'pms', 'period mood', 'drsp'],
  postpartum_depression: ['postpartum depression', 'ppd', 'baby blues', 'postnatal depression'],
  postpartum_psychosis: ['postpartum psychosis', 'pp psychosis'],
  postpartum_ocd: ['postpartum ocd', 'intrusive thoughts baby'],
  postpartum_anxiety: ['postpartum anxiety', 'new mom anxiety'],
  pregnancy_depression: ['depression in pregnancy', 'antenatal depression', 'prenatal depression'],
  pregnancy_anxiety: ['anxiety in pregnancy', 'panic pregnancy'],
  bipolar: ['bipolar', 'mania', 'hypomania', 'mood stabilizer', 'lithium', 'lamotrigine'],
  perimenopause: ['perimenopause', 'hot flash', 'night sweats'],
  menopause: ['menopause', 'hrt', 'hormone therapy', 'mht', 'gsm'],
  fertility: ['fertility', 'ivf', 'ttc', 'infertility', 'ovulation'],
  pregnancy_loss: ['miscarriage', 'pregnancy loss', 'stillbirth', 'tfmr'],
  endometriosis: ['endometriosis', 'dysmenorrhea', 'pelvic pain'],
  pcos: ['pcos', 'polycystic', 'insulin resistance'],
  contraception: ['birth control', 'ocp depression', 'iud mood'],
  ssri: ['ssri', 'sertraline', 'fluoxetine', 'antidepressant'],
  breastfeeding: ['breastfeeding medication', 'lactation medication'],
  sleep: ['insomnia', 'sleep problems', 'cant sleep'],
  anxiety: ['anxiety', 'panic attack', 'gad', 'worry'],
  depression: ['depression', 'depressed', 'sad', 'hopeless'],
  trauma: ['trauma', 'ptsd', 'birth trauma'],
};

function searchRAG(text) {
  const lower = text.toLowerCase();
  const scores = {};
  for (const [topic, keywords] of Object.entries(RAG_TOPICS)) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score += kw.split(' ').length;
    }
    if (score > 0) scores[topic] = score;
  }
  if (Object.keys(scores).length === 0) return [];
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([topic]) => topic);
}

// ── LLM CALLER — tries Ollama first, falls back to Grok ─────────────────────
async function callLLM(systemPrompt, userPrompt, maxTokens = 1200) {
  // Try Ollama local model first
  try {
    const resp = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'luna-cyclemind',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        stream: false,
        options: { temperature: 0.4, num_predict: maxTokens },
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (resp.ok) {
      const data = await resp.json();
      const text = data?.message?.content || '';
      if (text.length > 50) return { text, source: 'ollama' };
    }
  } catch (_) { /* fall through */ }

  // Fallback: Grok
  const xApiKey = Deno.env.get('XAI_API_KEY');
  if (xApiKey) {
    const resp = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${xApiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-3-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: maxTokens,
        temperature: 0.4,
      }),
    });
    if (resp.ok) {
      const data = await resp.json();
      const text = data.choices?.[0]?.message?.content || '';
      if (text.length > 50) return { text, source: 'grok' };
    }
  }

  throw new Error('All LLM backends unavailable');
}

// ── MARKDOWN BUILDER ─────────────────────────────────────────────────────────
function buildWikiPage({ title, tags, relatedTopics, content, source, date }) {
  const tagList = tags.map(t => `${t}`).join(', ');
  const relatedLinks = relatedTopics.map(t => `[[${topicToWikiPage(t)}]]`).join(' · ');
  return `---
title: ${title}
tags: [${tagList}]
source: ${source}
date: ${date}
auto_generated: true
---

# ${title}

> **Related:** ${relatedLinks || 'See [[index]]'}

---

${content}

---

*Auto-generated by Luna Knowledge Pipeline · ${date} · Review and edit before clinical use.*
`;
}

function topicToWikiPage(topic) {
  const map = {
    pmdd: 'PMDD-Overview',
    postpartum_depression: 'Postpartum-Depression',
    postpartum_psychosis: 'Postpartum-Psychosis',
    postpartum_ocd: 'Postpartum-OCD',
    postpartum_anxiety: 'Postpartum-Anxiety',
    pregnancy_depression: 'Perinatal-Depression',
    pregnancy_anxiety: 'Pregnancy-Anxiety-Disorders',
    bipolar: 'Bipolar-Disorder-Reproductive-Context',
    perimenopause: 'Perimenopause-Mental-Health',
    menopause: 'Menopause-Hormone-Therapy',
    fertility: 'Fertility-Mental-Health',
    pregnancy_loss: 'Pregnancy-Loss-Grief',
    endometriosis: 'Endometriosis-Mental-Health',
    pcos: 'PCOS-Mental-Health',
    contraception: 'Contraception-Mental-Health',
    ssri: 'Luteal-Phase-SSRI-Dosing',
    breastfeeding: 'Breastfeeding-Psychotropics',
    sleep: 'Integrative-Perinatal-Depression',
    anxiety: 'Pregnancy-Anxiety-Disorders',
    depression: 'Perinatal-Depression',
    trauma: 'Trauma-Reproductive-Health',
  };
  return map[topic] || 'index';
}

// ── MODE: USER LOGS ──────────────────────────────────────────────────────────
async function processUserLogs(base44, userId, days = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  // Fetch entries for this user
  const entries = await base44.asServiceRole.entities.DailyEntry.filter(
    { created_by_id: userId },
    '-date',
    days + 5
  );

  const recent = entries.filter(e => e.date >= cutoffStr);
  if (recent.length === 0) {
    return { skipped: true, reason: 'No entries in the specified window' };
  }

  // Build a compact symptom summary for the LLM
  const symptomLines = recent.map(entry => {
    const symptoms = [];
    const drspKeys = ['s_mood_swings', 's_irritability', 's_anxiety', 's_depression',
      's_overwhelmed', 's_lethargic', 's_insomnia', 's_bloating', 's_cramping', 's_headache'];
    for (const k of drspKeys) {
      if ((entry[k] || 0) >= 4) symptoms.push(`${k.replace('s_', '')}:${entry[k]}`);
    }
    const custom = (entry.custom_symptoms || []).map(s =>
      typeof s === 'string' ? s : `${s.name}(${s.severity || '?'})`
    );
    const allSymptoms = [...symptoms, ...custom];
    const journalSnippet = entry.journal_entry
      ? entry.journal_entry.substring(0, 120).replace(/\n/g, ' ')
      : '';
    return `${entry.date} cd${entry.cycle_day || '?'} [${entry.cycle_type || 'menstrual'}]: ${allSymptoms.join(', ')}${journalSnippet ? ` | note: "${journalSnippet}"` : ''}`;
  }).join('\n');

  const ragTopics = searchRAG(symptomLines);
  const date = new Date().toISOString().split('T')[0];

  const systemPrompt = `You are a clinical data analyst specializing in reproductive mental health. Your job is to analyze anonymized user symptom logs and identify:
1. Dominant symptom patterns (especially luteal-phase clustering)
2. Severity trends (improving, worsening, stable)
3. Notable co-occurring symptoms
4. Any clinical flags worth psychiatrist review
5. Suggested knowledge base updates

Format your output as structured Markdown with these exact sections:
## Pattern Summary
## Top Symptoms
## Cycle Phase Analysis  
## Clinical Flags
## Suggested Wiki Updates

Be concise and clinically precise. No patient-identifying language.`;

  const userPrompt = `Analyze these ${recent.length} daily log entries from a single anonymized user (last ${days} days):\n\n${symptomLines}\n\nGenerate a clinical pattern analysis in the required Markdown format.`;

  const { text: analysisContent, source: llmSource } = await callLLM(systemPrompt, userPrompt);

  // Build the Luna Output wiki file
  const filename = `${date}-user-pattern-${userId.substring(0, 8)}`;
  const wikiContent = buildWikiPage({
    title: `User Pattern Analysis — ${date}`,
    tags: ['luna-output', 'pattern-analysis', 'user-logs', ...ragTopics],
    relatedTopics: ragTopics,
    content: analysisContent,
    source: `Luna Auto-Update Pipeline · ${llmSource} · ${recent.length} entries analyzed`,
    date,
  });

  return {
    type: 'user_logs',
    filename: `Luna Outputs/${filename}.md`,
    content: wikiContent,
    ragTopics,
    entriesAnalyzed: recent.length,
    llmSource,
    date,
  };
}

// ── MODE: CLINICAL TEXT ──────────────────────────────────────────────────────
async function processClinicalText(text, title, source) {
  const ragTopics = searchRAG(text);
  const date = new Date().toISOString().split('T')[0];
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const systemPrompt = `You are a clinical knowledge architect for CycleMind, a reproductive mental health platform. Your task is to synthesize clinical text into a structured Obsidian wiki page.

Output format — produce exactly these sections with proper Markdown:
## Overview
## Key Clinical Points  
## Evidence & Statistics
## Treatment Implications
## Luna Application Notes
## Key References

Rules:
- Use clinical tables where helpful (Markdown table format)
- Bold key terms and statistics
- Keep language professional but accessible
- Add [[wiki link]] placeholders for related concepts
- Flag anything that contradicts or updates existing CycleMind knowledge
- Maximum 600 words total`;

  const userPrompt = `Synthesize this clinical content into a CycleMind wiki page:\n\nTitle: ${title}\nSource: ${source}\n\nContent:\n${text.substring(0, 3000)}`;

  const { text: synthesized, source: llmSource } = await callLLM(systemPrompt, userPrompt);

  const wikiContent = buildWikiPage({
    title,
    tags: ['clinical-synthesis', 'auto-imported', ...ragTopics],
    relatedTopics: ragTopics,
    content: synthesized,
    source: `${source} · Synthesized by Luna · ${llmSource}`,
    date,
  });

  return {
    type: 'clinical_text',
    filename: `Luna Outputs/${date}-synthesis-${slug}.md`,
    content: wikiContent,
    ragTopics,
    llmSource,
    date,
  };
}

// ── MODE: PSYCHIATRIST FEEDBACK ──────────────────────────────────────────────
async function processPsychiatristFeedback(text, topic, psychiatristName) {
  const ragTopics = topic ? [topic] : searchRAG(text);
  const date = new Date().toISOString().split('T')[0];
  const slug = topic || 'general';

  const systemPrompt = `You are helping integrate expert psychiatrist feedback into CycleMind's Luna AI knowledge base.

Your tasks:
1. Extract the key clinical points from the feedback
2. Identify what in the existing knowledge base this updates or corrects
3. Generate a structured update note
4. Suggest specific edits to TOPIC_SUMMARIES (the RAG grounding text in functions/lunaChat)

Output format:
## Expert Feedback Summary
## What This Updates
## Suggested TOPIC_SUMMARIES Edit
(show the old text briefly, then the new proposed text)
## Notes for Clinical Team`;

  const userPrompt = `Psychiatrist: ${psychiatristName || 'Anonymous'}\nTopic: ${topic || 'General'}\n\nFeedback:\n${text}`;

  const { text: processed, source: llmSource } = await callLLM(systemPrompt, userPrompt);

  const wikiContent = buildWikiPage({
    title: `Psychiatrist Feedback — ${topic || 'General'} — ${date}`,
    tags: ['psychiatrist-feedback', 'knowledge-update', ...ragTopics],
    relatedTopics: ragTopics,
    content: processed,
    source: `Expert feedback from ${psychiatristName || 'clinical team'} · Processed by Luna`,
    date,
  });

  return {
    type: 'psychiatrist_feedback',
    filename: `Luna Outputs/${date}-feedback-${slug}.md`,
    content: wikiContent,
    ragTopics,
    llmSource,
    date,
  };
}

// ── MAIN HANDLER ─────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin-only — this writes to the knowledge base
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { mode } = body;

    let result;

    if (mode === 'user_logs') {
      const { userId, days = 30 } = body;
      if (!userId) return Response.json({ error: 'userId required for user_logs mode' }, { status: 400 });
      result = await processUserLogs(base44, userId, days);

    } else if (mode === 'clinical_text') {
      const { text, title, source = 'Manual import' } = body;
      if (!text || !title) return Response.json({ error: 'text and title required' }, { status: 400 });
      result = await processClinicalText(text, title, source);

    } else if (mode === 'psychiatrist_feedback') {
      const { text, topic, psychiatristName } = body;
      if (!text) return Response.json({ error: 'text required for psychiatrist_feedback mode' }, { status: 400 });
      result = await processPsychiatristFeedback(text, topic, psychiatristName);

    } else {
      return Response.json({
        error: 'Invalid mode',
        validModes: ['user_logs', 'clinical_text', 'psychiatrist_feedback'],
      }, { status: 400 });
    }

    if (result.skipped) {
      return Response.json({ skipped: true, reason: result.reason });
    }

    console.log(`[lunaAutoUpdate] Generated: ${result.filename} via ${result.llmSource}`);

    return Response.json({
      success: true,
      filename: result.filename,
      ragTopics: result.ragTopics,
      llmSource: result.llmSource,
      date: result.date,
      markdownContent: result.content,
      instructions: [
        `1. Copy the markdownContent to: knowledge-base/wiki/${result.filename}`,
        `2. Review for clinical accuracy before committing`,
        `3. If ragTopics suggest TOPIC_SUMMARIES updates, edit functions/lunaChat and redeploy`,
        `4. Commit to GitHub — Luna will use updated content on next RAG search`,
      ],
    });

  } catch (error) {
    console.error('[lunaAutoUpdate] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});