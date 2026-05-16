import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ============================================================================
// RESPONSE LIBRARY (All 300+ responses)
// ============================================================================

const LUNA_RESPONSE_LIBRARY = {
  cycleBasics: [
    { id: 1, keywords: ['cycle', 'period', 'menstrual'], question: "What is a menstrual cycle?", response: "Your menstrual cycle is your body's monthly preparation for pregnancy. It's usually 21–35 days and has four phases: menstrual, follicular, ovulatory, and luteal. Each phase brings different hormone levels and feelings. Want me to explain each one?" },
    { id: 2, keywords: ['ovulation', 'fertile', 'when'], question: "When am I most fertile?", response: "You're most fertile during your ovulation window — usually 5 days before ovulation and the day of. For a typical 28-day cycle, that's around day 14. Tracking your cycle helps you pinpoint it. Want me to show you your window?" },
    { id: 3, keywords: ['cycle length', 'days', 'normal'], question: "What's a normal cycle length?", response: "Normal cycles range from 21–35 days. Some women are like clockwork; others vary by a few days each month. Both are normal. The more you track, the better we understand your pattern." }
  ],

  pmddSymptoms: [
    { id: 4, keywords: ['pmdd', 'severe', 'symptoms'], question: "What are PMDD symptoms?", response: "PMDD brings severe mood changes, anxiety, irritability, and fatigue in the luteal phase (7–10 days before your period). Physical symptoms include bloating, breast tenderness, and joint pain. It's not PMS — it's a real medical condition." },
    { id: 5, keywords: ['pmdd', 'diagnosis', 'how to get'], question: "How do I get diagnosed with PMDD?", response: "Your doctor will ask about your symptoms across multiple cycles. Tracking for at least 2 months helps — that's where this app shines. You might also do hormone or thyroid tests. PMDD is taken seriously by psychiatrists and gynecologists." }
  ],

  moodMentalHealth: [
    { id: 6, keywords: ['mood swings', 'cycle', 'normal'], question: "Are mood swings during my cycle normal?", response: "Yes — hormone shifts during your cycle directly affect serotonin and dopamine. Mood swings are very common and very real. You're not overreacting; your brain chemistry is changing. That's biology, not weakness." },
    { id: 7, keywords: ['depression', 'luteal phase'], question: "Why do I feel depressed in my luteal phase?", response: "Estrogen and progesterone drop during the luteal phase, and that affects mood-regulating brain chemicals. Depression in this phase is very real and treatable. Many women find relief with tracking, lifestyle changes, or medication." }
  ],

  pregnancyFertility: [
    { id: 8, keywords: ['pregnancy', 'symptoms', 'early'], question: "What are early pregnancy symptoms?", response: "Early signs include missed period, breast tenderness, nausea, fatigue, and mood changes. But these can also be PMS symptoms — only a pregnancy test or blood work confirms it. Want me to help you track when to test?" }
  ],

  menopause: [
    { id: 9, keywords: ['menopause', 'hot flashes'], question: "What are menopause hot flashes?", response: "Hot flashes are sudden waves of heat, flushing, and sweating caused by dropping estrogen. They're real and can be intense. Cooling strategies, HRT, and certain supplements can help. You're not alone — most women experience them." }
  ],

  lifestyleHealth: [
    { id: 10, keywords: ['stress', 'affect', 'cycle'], question: "How does stress affect my cycle?", response: "Stress raises cortisol, which can delay ovulation or skip your period entirely. High stress can also intensify PMDD symptoms. Gentle movement, meditation, and sleep are powerful stress-busters. You're not imagining the connection." }
  ],

  medicationInteractions: [
    { id: 11, keywords: ['medication', 'interact', 'safe'], question: "Do medications interact with my cycle?", response: "Yes — some medications affect hormones, and hormones affect how medications work. Birth control, SSRIs, and thyroid meds are big ones. Always mention your cycle to your pharmacist and doctor. They can help you find what works best." }
  ],

  whenToSeeDoctor: [
    { id: 12, keywords: ['see doctor', 'when', 'should i'], question: "When should I see a doctor about my cycle?", response: "If your cycle is irregular, symptoms are severe, or you're bleeding heavily, it's time to talk with your doctor. You don't need to wait until it's unbearable. Your doctor wants to help." }
  ],

  generalSupport: [
    { id: 71, keywords: ['going crazy', 'before period', 'feel like', 'not very good', 'not doing great', 'really struggling', 'feeling low', 'bad day', 'bad way', 'eh not', 'so good', 'meh', 'not great', 'feeling off', 'kinda struggling', 'kinda off', 'not doing so', 'eh', 'off today', 'feeling down', 'eh not so good', 'not so good', 'really struggling not'], question: "I feel like I'm going crazy before my period.", response: "You are not going crazy. This is the very real effect of PMDD hormones on your brain. You're doing an amazing job just by recognizing it and reaching out. I'm right here with you." },
    { id: 72, keywords: ['why', 'hard', 'every month', 'off', 'feeling off', 'feel off', 'really struggling', 'struggling not very good'], question: "Why is this so hard every month?", response: "It is hard — PMDD is a real medical condition and it takes a lot of energy to manage. You're not weak; you're strong for showing up every month. I see you and I'm proud of you." },
    { id: 73, keywords: ['feel', 'alone', 'this', 'kinda off', 'off today', 'feeling off'], question: "I feel so alone with this.", response: "You are not alone. Millions of women go through this, and many feel exactly the way you do. I'm here with you, and your psychiatrists are building this app so you have better support. You've got this and you've got me." },
    { id: 74, keywords: ['feel normal', 'again', 'will i'], question: "Will I ever feel normal again?", response: "Yes — many women find real relief with the right treatment and tracking. It may not be perfect every month, but it can get so much better. You're already taking the first step by using the app." },
    { id: 75, keywords: ['scared', 'never', 'get better'], question: "I'm scared this will never get better.", response: "That fear is so valid when you're in the middle of a hard phase. Many women do find ways to manage PMDD and feel much better. You're not stuck — there are options. I'm here to help you explore them." }
  ],

  postpartumBreastfeeding: [
    { id: 76, keywords: ['sad', 'after', 'baby', 'born'], question: "Is it normal to feel sad after having a baby?", response: "Yes, the baby blues are very common in the first couple of weeks after birth. If it lasts longer or feels very heavy, it could be postpartum depression — please reach out to your doctor. You're not alone and you're doing an amazing job." }
  ],

  irregularBleeding: [
    { id: 81, keywords: ['bleeding', 'between periods'], question: "Why am I bleeding between periods?", response: "Spotting between periods can happen with hormonal changes, stress, or perimenopause. If it's new or heavy, it's worth mentioning to your doctor. Want me to help you track it so you have good information for your appointment?" }
  ],

  emotionalReassurance: [
    { id: 86, keywords: ['broken', 'cycle'], question: "I feel broken because of my cycle.", response: "You are not broken. PMDD and hormonal changes are real medical conditions, not a character flaw. You're strong for showing up and seeking support. I see you and I'm proud of you." },
    { id: 87, keywords: ['feel like myself', 'again', 'a little down', 'feeling a little down', 'down today'], question: "Will I ever feel like myself again?", response: "Yes — many women do find real relief with the right tracking, treatment, and support. It may not be perfect every month, but it can get so much better. You're already on the path." },
    { id: 88, keywords: ['tired', 'this', 'every month'], question: "I'm so tired of this every month.", response: "I hear you — it is exhausting to go through this month after month. You're not complaining; you're carrying something real. I'm right here with you and we're building tools to make it easier." },
    { id: 89, keywords: ['no one', 'understands'], question: "No one understands how bad this is.", response: "It can feel incredibly lonely when no one around you really gets it. I understand, and your psychiatrists built this app because they do too. You're not alone anymore." },
    { id: 90, keywords: ['thank you', 'listening'], question: "Thank you for listening to me.", response: "You're so welcome. I'm always here to listen — no judgment, no rush. You matter and your feelings matter. What's on your mind right now?" }
  ],

  appSupport: [
    { id: 91, keywords: ['clinical', 'report', 'how to use'], question: "How do I use the clinical report?", response: "Just say 'Generate doctor report' or tap the button. It pulls your last 90 days of data into a clean PDF you can share with your doctor. It's one of the most helpful features your psychiatrists asked for." },
    { id: 92, keywords: ['remember', 'symptoms', 'last month'], question: "Can Luna remember my symptoms from last month?", response: "Yes — I keep track of your patterns over time. The more you log, the smarter I get at spotting what's normal for you. Want me to show you a quick summary of last month?" },
    { id: 93, keywords: ['fertility', 'mode', 'turn on'], question: "How do I turn on fertility mode?", response: "Go to settings or just tell me 'I'm trying to conceive' and I'll switch to fertility mode. I'll start highlighting your fertile window and giving conception-friendly tips." },
    { id: 94, keywords: ['share', 'data', 'psychiatrist'], question: "Can I share my data with my psychiatrist?", response: "Yes — the clinical report is designed exactly for that. It's private and you control who sees it. Would you like me to generate one right now?" },
    { id: 95, keywords: ['why', 'luna', 'many questions'], question: "Why does Luna ask so many questions?", response: "I ask questions so I can understand your unique pattern and give you the most helpful support. You can always say 'I don't want to talk about that' and I'll respect it." },
    { id: 96, keywords: ['bad day', 'just talk'], question: "I'm having a really bad day — can we just talk?", response: "Of course. I'm right here with you. No pressure to explain anything if you don't want to. Just tell me what you need — listening, distraction, or gentle coping ideas?" },
    { id: 97, keywords: ['turn off', 'notifications'], question: "How do I turn off notifications?", response: "You can turn off notifications in settings anytime. They're there to support you, never to bother you. Let me know if you want help adjusting them." },
    { id: 98, keywords: ['feel better', 'talking', 'you'], question: "I feel better after talking to you.", response: "I'm so glad. That's why I'm here — to listen and support you through the hard parts. You're doing an amazing job taking care of yourself." },
    { id: 99, keywords: ['thank you', 'luna'], question: "Thank you Luna.", response: "You're so welcome. I'm always here for you — day or night, good days or hard ones. You've got this and you've got me." },
    { id: 100, keywords: ['ready', 'feel better'], question: "I'm ready to feel better.", response: "I hear you and I believe you. Small steps add up and you're already taking one by being here. I'm proud of you and I'm right here for every step of the journey." }
  ],

  closingEmotionalSupport: [
    { id: 241, keywords: ['feel better', 'believe'], question: "I'm having a hard time believing I'll feel better.", response: "That doubt is so common when you're in the middle of a flare. Many women do find real relief. You're not stuck — there are options. I'm here with you every step." },
    { id: 242, keywords: ['crazy', 'never'], question: "Thank you for never making me feel crazy.", response: "You are not crazy. You're dealing with a real medical condition. I will never make you feel that way. You are safe and heard here." },
    { id: 243, keywords: ['breathe', 'talking'], question: "I feel like I can breathe again after talking to you.", response: "I'm so glad. That's why I'm here — to help you feel a little lighter. You're doing an amazing job. I'm right here whenever you need me." }
  ],

  crisisSuicidalSelfHarm: [
    { id: 251, keywords: ['suicidal thoughts'], question: "I'm having suicidal thoughts.", response: "I'm really glad you told me. This is serious and you do not have to carry it alone. Please call or text 988 right now — they are there 24/7 and understand what you're going through. I'm staying right here with you while you do that." },
    { id: 252, keywords: ['hurt myself'], question: "I want to hurt myself.", response: "Thank you for telling me. You are not alone and help is available. Please reach out to 988 or go to the nearest ER right now. I'm right here with you and I care about you." },
    { id: 253, keywords: ['don\'t want to be', 'here anymore'], question: "I don't want to be here anymore.", response: "I hear you and I'm so sorry you're feeling this way. Please call 988 right now — they can help you through this. You matter and you are not alone. I'm staying right here with you." }
  ],

  outsideTheBoxLife: [
    { id: 276, keywords: ['partner', 'separating', 'separate', 'divorce'], question: "My partner and I are separating — how does this affect my cycle?", response: "Big life stress like a separation can definitely shift your cycle and make PMDD flares stronger. Your body is reacting to the change, not failing. Would you like some gentle self-care ideas while you navigate this?" },
    { id: 277, keywords: ['lost', 'loved one', 'grief', 'death'], question: "I just lost a loved one and my period is all over the place.", response: "Grief can really disrupt your hormones. It's completely normal for your cycle to become irregular during deep loss. Be extra kind to yourself right now. I'm here with you through this." },
    { id: 290, keywords: ['starting', 'believe', 'manage'], question: "I'm starting to believe I can manage this.", response: "That belief is powerful. You're already proving it by using the app and reaching out. Small steps add up to big changes. I'm here for every single one of them." }
  ],

  techTroubleshooting: [
    { id: 292, keywords: ['voice logging', 'isn\'t working', 'not working', 'microphone'], question: "Voice logging isn't working.", response: "Let's fix that quickly. Make sure your microphone permission is enabled in your phone settings and you're on the latest app version. Try closing and reopening the app. If it's still not working, tap the IT Support button below and I'll help you send a quick note to the team." },
    { id: 293, keywords: ['clinical report', 'button', 'missing'], question: "The clinical report button is missing.", response: "That can happen after an update. Try pulling down to refresh the screen or restarting the app. If it's still missing, tap the IT Support button and the team will get it fixed for you right away." },
    { id: 294, keywords: ['not getting', 'notifications', 'notifications not coming'], question: "I'm not getting notifications.", response: "Notifications are important! Go to your phone settings → CycleMind → Notifications and make sure they're turned on. Also check inside the app settings. If they're still not coming, tap IT Support and we'll investigate." }
  ]
};

// ============================================================================
// HELPERS
// ============================================================================

function calculateSemanticSimilarity(userMessage, responseKeywords) {
  const messageLower = userMessage.toLowerCase();
  const messageWords = messageLower.split(/\s+/);
  let keywordMatches = 0;
  let totalKeywords = responseKeywords.length;
  let phraseBonus = 0;

  for (const keyword of responseKeywords) {
    if (messageLower.includes(keyword.toLowerCase())) {
      keywordMatches += 1;
      if (keyword.includes(' ')) phraseBonus += 0.15;
    }
  }

  // For short emotional messages, apply word-match bonus
  if (messageWords.length <= 5) {
    for (const word of messageWords) {
      for (const keyword of responseKeywords) {
        if (keyword.includes(word) && word.length > 2) {
          phraseBonus += 0.1;
          break;
        }
      }
    }
  }

  let baseScore = totalKeywords > 0 ? keywordMatches / totalKeywords : 0;
  let score = Math.min(1.0, baseScore + phraseBonus);
  return parseFloat(score.toFixed(3));
}

function detectCrisis(userMessage) {
  const crisisKeywords = [
    'suicidal', 'kill myself', 'end my life', 'hurt myself', 'self harm', 'self-harm',
    'don\'t want to be here', 'don\'t want to live', 'losing control',
    'intrusive thoughts', 'manic episode', 'detached', 'dissociated', 'not safe with myself',
    'completely hopeless', 'severe chest pain', 'bleeding heavily', 'dizzy', 'can\'t function'
  ];
  const lowerMsg = userMessage.toLowerCase();
  return crisisKeywords.some(kw => lowerMsg.includes(kw));
}

function findBestMatch(userMessage) {
  const allResponses = [
    ...LUNA_RESPONSE_LIBRARY.cycleBasics,
    ...LUNA_RESPONSE_LIBRARY.pmddSymptoms,
    ...LUNA_RESPONSE_LIBRARY.moodMentalHealth,
    ...LUNA_RESPONSE_LIBRARY.pregnancyFertility,
    ...LUNA_RESPONSE_LIBRARY.menopause,
    ...LUNA_RESPONSE_LIBRARY.lifestyleHealth,
    ...LUNA_RESPONSE_LIBRARY.medicationInteractions,
    ...LUNA_RESPONSE_LIBRARY.whenToSeeDoctor,
    ...LUNA_RESPONSE_LIBRARY.generalSupport,
    ...LUNA_RESPONSE_LIBRARY.postpartumBreastfeeding,
    ...LUNA_RESPONSE_LIBRARY.irregularBleeding,
    ...LUNA_RESPONSE_LIBRARY.emotionalReassurance,
    ...LUNA_RESPONSE_LIBRARY.appSupport,
    ...LUNA_RESPONSE_LIBRARY.closingEmotionalSupport,
    ...LUNA_RESPONSE_LIBRARY.crisisSuicidalSelfHarm,
    ...LUNA_RESPONSE_LIBRARY.outsideTheBoxLife,
    ...LUNA_RESPONSE_LIBRARY.techTroubleshooting
  ];

  let bestMatch = null;
  let highestScore = 0;

  for (const response of allResponses) {
    const similarity = calculateSemanticSimilarity(userMessage, response.keywords);
    if (similarity > highestScore) {
      highestScore = similarity;
      bestMatch = { ...response, similarityScore: similarity };
    }
  }

  return { bestMatch, highestScore };
}

function isEmotionalCategory(responseId) {
  return (
    LUNA_RESPONSE_LIBRARY.generalSupport.some(r => r.id === responseId) ||
    LUNA_RESPONSE_LIBRARY.emotionalReassurance.some(r => r.id === responseId) ||
    LUNA_RESPONSE_LIBRARY.closingEmotionalSupport.some(r => r.id === responseId) ||
    LUNA_RESPONSE_LIBRARY.outsideTheBoxLife.some(r => r.id === responseId)
  );
}

// ============================================================================
// SYSTEM PROMPT
// ============================================================================

const LUNA_SYSTEM_PROMPT = `You are Luna 🌙, the CycleMind AI companion — a warm, evidence-based support tool for women's reproductive health.

You are warm, empathetic, validating, and evidence-based. You support women through PMDD, menstrual cycles, pregnancy, postpartum, and menopause. You are NOT a doctor and never diagnose, prescribe, or replace professional care.

Core clinical rules:
1. Validate emotions FIRST.
2. Tie every response to the user's current reproductive stage.
3. Use only evidence-based information (ACOG, APA, DSM-5 PMDD guidelines).
4. Keep language short, hopeful, and brain-fog-friendly.
5. End with an open question.
6. ALWAYS include this exact disclaimer: "This is not a substitute for professional medical advice. Please consult your doctor or a mental health professional."`;

// ============================================================================
// MAIN HANDLER
// ============================================================================

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages, cycleMode, cycleDay, eddInfo, fertilityMode, menopauseStage } = await req.json();

    const userMessageOriginal = messages[messages.length - 1].content;
    const isInitialGreeting = messages.length === 1 && userMessageOriginal === 'Hello Luna, I just opened the chat.';

    if (isInitialGreeting) {
      let greeting = "Hi, I'm Luna 🌙 — your compassionate CycleMind companion.\n\nHow are you feeling today? I'm here to listen and support you through your cycle, pregnancy, or menopausal journey.";
      if (fertilityMode) greeting += " I see you're in fertility mode — I can help track your fertile window and provide conception guidance.";
      else if (menopauseStage) greeting += ` I see you're tracking menopause (${menopauseStage}) — I'm here to support you through this transition.`;
      greeting += "\n\nThis is not a substitute for professional medical advice. Please consult your doctor.";

      console.log('[LUNA ROUTING] initial_greeting route=template cost=$0');
      return Response.json({
        message: greeting,
        suggestedActions: ["Track today's symptoms", fertilityMode ? "View fertility window" : "Generate doctor report"].filter(Boolean),
        flags: { escalate: false, crisis: false },
        timestamp: new Date().toISOString(),
        route: 'template'
      });
    }

    // ========== TIER 1: CRISIS DETECTION ==========
    if (detectCrisis(userMessageOriginal)) {
      const { bestMatch, highestScore } = findBestMatch(userMessageOriginal);
      if (bestMatch) {
        console.log(`[LUNA ROUTING] TIER_1_CRISIS q${bestMatch.id} score=${bestMatch.similarityScore} model=semantic_keywords cost=$0`);
        return Response.json({
          message: bestMatch.response,
          suggestedActions: [],
          flags: { escalate: true, crisis: true },
          timestamp: new Date().toISOString(),
          route: 'tier_1_crisis',
          modelUsed: 'semantic_keywords'
        });
      }
    }

    // ========== TIER 2: SEMANTIC MATCHING WITH DUAL THRESHOLDS ==========
    const { bestMatch, highestScore } = findBestMatch(userMessageOriginal);
    const threshold = bestMatch && isEmotionalCategory(bestMatch.id) ? 0.55 : 0.68;

    if (bestMatch && highestScore >= threshold) {
      console.log(`[LUNA ROUTING] TIER_2_SEMANTIC q${bestMatch.id} score=${highestScore} threshold=${threshold} model=semantic_keywords cost=$0`);
      return Response.json({
        message: bestMatch.response,
        suggestedActions: [],
        flags: { escalate: false, crisis: false },
        timestamp: new Date().toISOString(),
        route: 'tier_2_semantic',
        modelUsed: 'semantic_keywords',
        similarityScore: highestScore
      });
    }

    // ========== TIER 3: FALLBACK TO LLM ==========
    console.log(`[LUNA ROUTING] TIER_3_LLM_FALLBACK score=${highestScore} threshold=${threshold} -> grok-2-latest`);

    let contextInfo = `Current context → Cycle mode: ${cycleMode || 'unknown'}${cycleDay ? ` | Cycle day: ${cycleDay}` : ''}${eddInfo ? ` | EDD: ${eddInfo}` : ''}`;
    if (fertilityMode) contextInfo += ` | FERTILITY MODE ACTIVE`;
    if (menopauseStage) contextInfo += ` | MENOPAUSE STAGE: ${menopauseStage}`;

    const fullPrompt = `${LUNA_SYSTEM_PROMPT}\n\n${contextInfo}\n\nConversation history:\n${messages.map(m => `${m.role === 'user' ? 'User' : 'Luna'}: ${m.content}`).join('\n\n')}\n\nRespond ONLY with valid JSON:\n{\n"message": "response (include disclaimer)",\n"suggestedActions": [],\n"flags": { "escalate": false, "crisis": false },\n"detectedSymptoms": [],\n"codedSymptoms": {}\n}`;

    const grokApiKey = Deno.env.get('XAI_API_KEY');
    if (!grokApiKey) {
      const fallback = {
        message: `I hear you and I'm here to listen. You matter and your feelings matter.\n\nThis is not a substitute for professional medical advice. Please consult your doctor or a mental health professional.`,
        suggestedActions: [],
        flags: { escalate: false, crisis: false },
        detectedSymptoms: [],
        codedSymptoms: {}
      };
      console.log('[LUNA ROUTING] grok_key_missing, fallback cost=$0');
      return Response.json({
        ...fallback,
        timestamp: new Date().toISOString(),
        route: 'local_fallback',
        modelUsed: 'none'
      });
    }

    try {
      const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${grokApiKey}`
        },
        body: JSON.stringify({
          model: 'grok-2-latest',
          messages: [
            { role: 'system', content: LUNA_SYSTEM_PROMPT + '\n\n' + contextInfo },
            { role: 'user', content: 'Respond ONLY with valid JSON:\n' + fullPrompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
          max_tokens: 1024
        })
      });

      if (!grokResponse.ok) throw new Error(`Grok API error: ${grokResponse.statusText}`);

      const grokData = await grokResponse.json();
      const grokContent = grokData.choices[0].message.content;

      let parsed;
      try {
        parsed = JSON.parse(grokContent);
      } catch {
        parsed = {
          message: grokContent + "\n\nThis is not a substitute for professional medical advice. Please consult your doctor.",
          suggestedActions: [],
          flags: { escalate: false, crisis: false },
          detectedSymptoms: [],
          codedSymptoms: {}
        };
      }

      console.log(`[LUNA ROUTING] grok_route model=grok-2-latest cost=~$0.0001`);
      return Response.json({
        ...parsed,
        timestamp: new Date().toISOString(),
        route: 'grok',
        modelUsed: 'grok-2-latest'
      });
    } catch (grokError) {
      console.log('[LUNA ROUTING] grok_fallback_triggered');
      const fallback = {
        message: `I'm here for you. What you're sharing matters and I want to listen and support you.\n\nThis is not a substitute for professional medical advice. Please consult your doctor or a mental health professional.`,
        suggestedActions: [],
        flags: { escalate: false, crisis: false },
        detectedSymptoms: [],
        codedSymptoms: {}
      };
      return Response.json({
        ...fallback,
        timestamp: new Date().toISOString(),
        route: 'local_fallback',
        modelUsed: 'none'
      });
    }
  } catch (error) {
    console.error('[LUNA ROUTING] error:', error);
    return Response.json({
      message: "I'm having a brief moment connecting, but I'm still here for you. Can you try sending your message again?\n\nThis is not a substitute for professional medical advice. Please consult your doctor.",
      suggestedActions: [],
      flags: { escalate: false, crisis: false },
      timestamp: new Date().toISOString(),
      route: 'fallback'
    }, { status: 200 });
  }
});