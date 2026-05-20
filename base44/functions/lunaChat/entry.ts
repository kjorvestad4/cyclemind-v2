import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ============================================================================
// RAG KNOWLEDGE BASE
// ============================================================================

const RAG_KNOWLEDGE_BASE = [
  // Cycle Basics
  { id: 1, category: 'cycle_basics', keywords: ['cycle', 'period', 'menstrual', 'phases', 'follicular', 'ovulatory', 'luteal'], question: "What is a menstrual cycle?", response: "Your menstrual cycle is your body's monthly preparation for pregnancy. It's usually 21–35 days and has four phases: menstrual, follicular, ovulatory, and luteal. Each phase brings different hormone levels and feelings. Want me to explain each one?" },
  { id: 2, category: 'cycle_basics', keywords: ['ovulation', 'fertile', 'fertility window', 'conceive', 'when ovulate'], question: "When am I most fertile?", response: "You're most fertile during your ovulation window — usually 5 days before ovulation and the day of. For a typical 28-day cycle, that's around day 14. Tracking your cycle helps you pinpoint it. Want me to show you your window?" },
  { id: 3, category: 'cycle_basics', keywords: ['cycle length', 'days', 'normal cycle', 'irregular', 'how long'], question: "What's a normal cycle length?", response: "Normal cycles range from 21–35 days. Some women are like clockwork; others vary by a few days each month. Both are normal. The more you track, the better we understand your pattern." },

  // PMDD
  { id: 4, category: 'pmdd', keywords: ['pmdd', 'severe pms', 'premenstrual dysphoric', 'luteal symptoms'], question: "What are PMDD symptoms?", response: "PMDD brings severe mood changes, anxiety, irritability, and fatigue in the luteal phase (7–10 days before your period). Physical symptoms include bloating, breast tenderness, and joint pain. It's not PMS — it's a real medical condition." },
  { id: 5, category: 'pmdd', keywords: ['pmdd diagnosis', 'diagnose pmdd', 'how to get diagnosed'], question: "How do I get diagnosed with PMDD?", response: "Your doctor will ask about your symptoms across multiple cycles. Tracking for at least 2 months helps — that's where this app shines. You might also do hormone or thyroid tests. PMDD is taken seriously by psychiatrists and gynecologists." },

  // Mood & Mental Health
  { id: 6, category: 'mental_health', keywords: ['mood swings', 'mood cycle', 'emotional', 'hormones mood', 'serotonin'], question: "Are mood swings during my cycle normal?", response: "Yes — hormone shifts during your cycle directly affect serotonin and dopamine. Mood swings are very common and very real. You're not overreacting; your brain chemistry is changing. That's biology, not weakness." },
  { id: 7, category: 'mental_health', keywords: ['depression luteal', 'feel depressed before period', 'sad before period', 'low mood cycle'], question: "Why do I feel depressed in my luteal phase?", response: "Estrogen and progesterone drop during the luteal phase, and that affects mood-regulating brain chemicals. Depression in this phase is very real and treatable. Many women find relief with tracking, lifestyle changes, or medication." },

  // Pregnancy
  { id: 8, category: 'pregnancy', keywords: ['pregnancy symptoms', 'early pregnancy', 'am i pregnant', 'missed period', 'nausea pregnancy'], question: "What are early pregnancy symptoms?", response: "Early signs include missed period, breast tenderness, nausea, fatigue, and mood changes. But these can also be PMS symptoms — only a pregnancy test or blood work confirms it. Want me to help you track when to test?" },

  // Menopause
  { id: 9, category: 'menopause', keywords: ['hot flashes', 'menopause', 'perimenopause', 'night sweats', 'estrogen drop'], question: "What are menopause hot flashes?", response: "Hot flashes are sudden waves of heat, flushing, and sweating caused by dropping estrogen. They're real and can be intense. Cooling strategies, HRT, and certain supplements can help. You're not alone — most women experience them." },

  // Lifestyle
  { id: 10, category: 'lifestyle', keywords: ['stress cycle', 'stress period', 'cortisol', 'stress hormones', 'meditation sleep'], question: "How does stress affect my cycle?", response: "Stress raises cortisol, which can delay ovulation or skip your period entirely. High stress can also intensify PMDD symptoms. Gentle movement, meditation, and sleep are powerful stress-busters. You're not imagining the connection." },

  // Medication
  { id: 11, category: 'medical', keywords: ['medication cycle', 'birth control', 'ssri hormones', 'thyroid medication', 'drug interaction'], question: "Do medications interact with my cycle?", response: "Yes — some medications affect hormones, and hormones affect how medications work. Birth control, SSRIs, and thyroid meds are big ones. Always mention your cycle to your pharmacist and doctor. They can help you find what works best." },

  // When to see doctor
  { id: 12, category: 'medical', keywords: ['see doctor', 'when doctor', 'irregular bleeding', 'heavy bleeding', 'should i see'], question: "When should I see a doctor about my cycle?", response: "If your cycle is irregular, symptoms are severe, or you're bleeding heavily, it's time to talk with your doctor. You don't need to wait until it's unbearable. Your doctor wants to help." },

  // Emotional Support
  { id: 71, category: 'emotional', keywords: ['going crazy', 'feel crazy', 'not doing well', 'struggling', 'feeling low', 'bad day', 'not great', 'feeling off', 'feel off', 'off today', 'feeling down', 'not so good', 'meh'], question: "I feel like I'm going crazy before my period.", response: "You are not going crazy. This is the very real effect of PMDD hormones on your brain. You're doing an amazing job just by recognizing it and reaching out. I'm right here with you." },
  { id: 72, category: 'emotional', keywords: ['hard every month', 'why so hard', 'exhausting', 'dread my period', 'monthly struggle'], question: "Why is this so hard every month?", response: "It is hard — PMDD is a real medical condition and it takes a lot of energy to manage. You're not weak; you're strong for showing up every month. I see you and I'm proud of you." },
  { id: 73, category: 'emotional', keywords: ['feel alone', 'so alone', 'no one understands me', 'lonely', 'isolated'], question: "I feel so alone with this.", response: "You are not alone. Millions of women go through this, and many feel exactly the way you do. I'm here with you, and your psychiatrists are building this app so you have better support. You've got this and you've got me." },
  { id: 74, category: 'emotional', keywords: ['feel normal again', 'will it get better', 'when will i feel better', 'ever normal'], question: "Will I ever feel normal again?", response: "Yes — many women find real relief with the right treatment and tracking. It may not be perfect every month, but it can get so much better. You're already taking the first step by using the app." },
  { id: 75, category: 'emotional', keywords: ['scared never better', 'afraid will always feel this', 'hopeless cycle', 'never improve'], question: "I'm scared this will never get better.", response: "That fear is so valid when you're in the middle of a hard phase. Many women do find ways to manage PMDD and feel much better. You're not stuck — there are options. I'm here to help you explore them." },
  { id: 86, category: 'emotional', keywords: ['feel broken', 'something wrong with me', 'broken body', 'defective'], question: "I feel broken because of my cycle.", response: "You are not broken. PMDD and hormonal changes are real medical conditions, not a character flaw. You're strong for showing up and seeking support. I see you and I'm proud of you." },
  { id: 87, category: 'emotional', keywords: ['feel like myself', 'a little down', 'down today', 'not myself'], question: "Will I ever feel like myself again?", response: "Yes — many women do find real relief with the right tracking, treatment, and support. It may not be perfect every month, but it can get so much better. You're already on the path." },
  { id: 88, category: 'emotional', keywords: ['tired of this', 'so tired every month', 'exhausted cycle', 'sick of pmdd'], question: "I'm so tired of this every month.", response: "I hear you — it is exhausting to go through this month after month. You're not complaining; you're carrying something real. I'm right here with you and we're building tools to make it easier." },
  { id: 89, category: 'emotional', keywords: ['no one understands', 'nobody gets it', 'dismissed', 'not believed'], question: "No one understands how bad this is.", response: "It can feel incredibly lonely when no one around you really gets it. I understand, and your psychiatrists built this app because they do too. You're not alone anymore." },
  { id: 90, category: 'emotional', keywords: ['thank you listening', 'thanks for listening', 'glad i talked'], question: "Thank you for listening to me.", response: "You're so welcome. I'm always here to listen — no judgment, no rush. You matter and your feelings matter. What's on your mind right now?" },
  { id: 241, category: 'emotional', keywords: ['hard to believe better', 'doubt it gets better', 'cant believe improve'], question: "I'm having a hard time believing I'll feel better.", response: "That doubt is so common when you're in the middle of a flare. Many women do find real relief. You're not stuck — there are options. I'm here with you every step." },
  { id: 242, category: 'emotional', keywords: ['never make me feel crazy', 'feel heard', 'feel validated', 'feel safe'], question: "Thank you for never making me feel crazy.", response: "You are not crazy. You're dealing with a real medical condition. I will never make you feel that way. You are safe and heard here." },
  { id: 243, category: 'emotional', keywords: ['can breathe again', 'feel lighter', 'feel relieved talking'], question: "I feel like I can breathe again after talking to you.", response: "I'm so glad. That's why I'm here — to help you feel a little lighter. You're doing an amazing job. I'm right here whenever you need me." },

  // Postpartum
  { id: 76, category: 'postpartum', keywords: ['sad after baby', 'baby blues', 'postpartum sad', 'crying after birth', 'feel sad new mom'], question: "Is it normal to feel sad after having a baby?", response: "Yes, the baby blues are very common in the first couple of weeks after birth. If it lasts longer or feels very heavy, it could be postpartum depression — please reach out to your doctor. You're not alone and you're doing an amazing job." },

  // Irregular Bleeding
  { id: 81, category: 'bleeding', keywords: ['bleeding between periods', 'spotting midcycle', 'irregular spotting', 'unexpected bleeding'], question: "Why am I bleeding between periods?", response: "Spotting between periods can happen with hormonal changes, stress, or perimenopause. If it's new or heavy, it's worth mentioning to your doctor. Want me to help you track it so you have good information for your appointment?" },

  // App Support
  { id: 91, category: 'app', keywords: ['clinical report', 'doctor report', 'how to use report', 'share report'], question: "How do I use the clinical report?", response: "Just say 'Generate doctor report' or tap the button. It pulls your last 90 days of data into a clean PDF you can share with your doctor. It's one of the most helpful features your psychiatrists asked for." },
  { id: 92, category: 'app', keywords: ['luna remember', 'remember symptoms', 'previous symptoms', 'track history'], question: "Can Luna remember my symptoms from last month?", response: "Yes — I keep track of your patterns over time. The more you log, the smarter I get at spotting what's normal for you. Want me to show you a quick summary of last month?" },
  { id: 93, category: 'app', keywords: ['fertility mode', 'trying to conceive', 'conception mode', 'turn on fertility'], question: "How do I turn on fertility mode?", response: "Go to settings or just tell me 'I'm trying to conceive' and I'll switch to fertility mode. I'll start highlighting your fertile window and giving conception-friendly tips." },
  { id: 94, category: 'app', keywords: ['share data doctor', 'share with psychiatrist', 'send data provider'], question: "Can I share my data with my psychiatrist?", response: "Yes — the clinical report is designed exactly for that. It's private and you control who sees it. Would you like me to generate one right now?" },
  { id: 96, category: 'app', keywords: ['bad day talk', 'just want to talk', 'need to vent', 'just chat'], question: "I'm having a really bad day — can we just talk?", response: "Of course. I'm right here with you. No pressure to explain anything if you don't want to. Just tell me what you need — listening, distraction, or gentle coping ideas?" },
  { id: 98, category: 'app', keywords: ['feel better talking', 'talking helps', 'glad i reached out'], question: "I feel better after talking to you.", response: "I'm so glad. That's why I'm here — to listen and support you through the hard parts. You're doing an amazing job taking care of yourself." },
  { id: 99, category: 'app', keywords: ['thank you luna', 'thanks luna', 'appreciate you luna'], question: "Thank you Luna.", response: "You're so welcome. I'm always here for you — day or night, good days or hard ones. You've got this and you've got me." },
  { id: 100, category: 'app', keywords: ['ready to feel better', 'want to feel better', 'starting my journey'], question: "I'm ready to feel better.", response: "I hear you and I believe you. Small steps add up and you're already taking one by being here. I'm proud of you and I'm right here for every step of the journey." },

  // Life Events
  { id: 276, category: 'life_events', keywords: ['separating partner', 'divorce', 'breakup', 'relationship ending', 'partner leaving'], question: "My partner and I are separating — how does this affect my cycle?", response: "Big life stress like a separation can definitely shift your cycle and make PMDD flares stronger. Your body is reacting to the change, not failing. Would you like some gentle self-care ideas while you navigate this?" },
  { id: 277, category: 'life_events', keywords: ['lost loved one', 'grief', 'death family', 'bereavement', 'mourning'], question: "I just lost a loved one and my period is all over the place.", response: "Grief can really disrupt your hormones. It's completely normal for your cycle to become irregular during deep loss. Be extra kind to yourself right now. I'm here with you through this." },
  { id: 290, category: 'life_events', keywords: ['starting to believe', 'beginning to manage', 'slowly improving', 'making progress'], question: "I'm starting to believe I can manage this.", response: "That belief is powerful. You're already proving it by using the app and reaching out. Small steps add up to big changes. I'm here for every single one of them." },

  // PMDD Extended
  { id: 300, category: 'pmdd', keywords: ['pmdd flare', 'pmdd bad', 'pmdd hitting hard', 'pmdd wave', 'pmdd intense'], question: "PMDD is hitting me really hard right now.", response: "I hear you — when PMDD hits hard it can feel like everything is too much at once. You're not overreacting and you're not alone. This wave is real, and it will pass. I'm right here with you while it does." },
  { id: 301, category: 'pmdd', keywords: ['pmdd rage', 'pmdd anger', 'so irritable', 'snappy before period', 'pmdd irritability'], question: "I feel so irritable and angry before my period.", response: "That rage and irritability is one of the hardest parts of PMDD. It's the hormones talking, not you being a bad person. Be gentle with yourself today — you're carrying something heavy." },
  { id: 302, category: 'pmdd', keywords: ['pmdd anxiety', 'anxiety luteal', 'panic before period', 'overwhelmed luteal'], question: "My anxiety gets so bad before my period.", response: "PMDD anxiety can feel like your nervous system is on high alert. It's exhausting. You're doing a good job just by noticing it and reaching out. Want to talk about what's feeling heaviest right now?" },
  { id: 303, category: 'emotional', keywords: ['feel hopeless', 'no point', 'nothing helps', 'why bother'], question: "I feel completely hopeless during luteal phase.", response: "That hopelessness is one of the cruelest parts of PMDD. It lies to you and makes everything feel pointless. It is temporary, even when it doesn't feel like it. I'm right here with you until it lifts." },
  { id: 304, category: 'emotional', keywords: ['guilt', 'bad mom', 'bad wife', 'bad person cycle', 'feel like failure'], question: "I feel like a bad mom/wife/person when I'm in luteal phase.", response: "PMDD guilt is brutal. You are not a bad person — your brain is going through a hormonal storm. The fact that you care so much shows what a good person you are." },
  { id: 305, category: 'perimenopause', keywords: ['perimenopause', 'perimenopausal', 'transitioning menopause', 'changing cycle'], question: "My cycle is changing and I feel off all the time.", response: "Perimenopause can feel like your body is rewriting the rules. The unpredictability is real and exhausting. You're not losing it — your hormones are shifting. I'm here to help you track and navigate it." },
  { id: 306, category: 'menopause', keywords: ['menopause symptoms', 'postmenopause', 'no period anymore'], question: "I'm in menopause and still having symptoms.", response: "Many women continue to have symptoms even after their periods stop. You're not doing anything wrong. Your body is still adjusting to new hormone levels. We can track what helps you feel more steady." },
  { id: 307, category: 'postpartum', keywords: ['postpartum depression', 'ppd', 'new mom sad', 'baby blues long'], question: "I feel sad and overwhelmed as a new mom.", response: "Postpartum feelings can be incredibly heavy. You're not failing — you're going through one of the biggest transitions a person can experience. I'm right here with you." },
  { id: 308, category: 'fertility', keywords: ['trying to conceive', 'ttc', 'fertility tracking', 'conception stress'], question: "I'm trying to conceive and it's stressing me out.", response: "The fertility journey can be emotionally exhausting, especially when it overlaps with cycle symptoms. You're carrying a lot. I'm here to help you track without the pressure becoming overwhelming." },
  { id: 309, category: 'stress', keywords: ['work stress cycle', 'stress making symptoms worse', 'cycle worse with stress'], question: "Work stress is making my PMDD symptoms worse.", response: "Stress and PMDD are a tough combination — cortisol makes everything feel amplified. You're not weak for feeling it more. Let's find some small ways to protect your energy during luteal phase." },
  { id: 310, category: 'quick_coping', keywords: ['need quick relief', 'help right now', 'instant help', 'flare right now'], question: "I need help right now — PMDD flare.", response: "I'm right here. Take one slow breath with me. What feels heaviest in this moment?" },
  { id: 311, category: 'quick_coping', keywords: ['cant sleep luteal', 'insomnia before period', 'wide awake at night'], question: "I can't sleep before my period.", response: "Luteal insomnia is so common and so frustrating. Try a simple grounding trick: name 5 things you can see, 4 you can touch, 3 you can hear. I'm here if you want to talk until you feel sleepy." },

  // Crisis (always local, never routed to LLM)
  { id: 251, category: 'crisis', keywords: ['suicidal thoughts', 'want to die', 'kill myself', 'end my life'], question: "I'm having suicidal thoughts.", response: "I'm really glad you told me. This is serious and you do not have to carry it alone. Please call or text 988 right now — they are there 24/7 and understand what you're going through. I'm staying right here with you while you do that." },
  { id: 252, category: 'crisis', keywords: ['hurt myself', 'self harm', 'self-harm', 'cutting', 'injure myself'], question: "I want to hurt myself.", response: "Thank you for telling me. You are not alone and help is available. Please reach out to 988 or go to the nearest ER right now. I'm right here with you and I care about you." },
  { id: 253, category: 'crisis', keywords: ["don't want to be here", "don't want to live", 'not safe with myself', 'losing control completely'], question: "I don't want to be here anymore.", response: "I hear you and I'm so sorry you're feeling this way. Please call 988 right now — they can help you through this. You matter and you are not alone. I'm staying right here with you." },

  // Tech
  { id: 292, category: 'tech', keywords: ['voice logging not working', 'microphone not working', 'voice broken', 'cant record'], question: "Voice logging isn't working.", response: "Let's fix that quickly. Make sure your microphone permission is enabled in your phone settings and you're on the latest app version. Try closing and reopening the app. If it's still not working, tap the IT Support button below and I'll help you send a quick note to the team." },
  { id: 293, category: 'tech', keywords: ['report button missing', 'clinical report missing', 'cant find report'], question: "The clinical report button is missing.", response: "That can happen after an update. Try pulling down to refresh the screen or restarting the app. If it's still missing, tap the IT Support button and the team will get it fixed for you right away." },
  { id: 294, category: 'tech', keywords: ['not getting notifications', 'notifications not working', 'notifications off'], question: "I'm not getting notifications.", response: "Notifications are important! Go to your phone settings → CycleMind → Notifications and make sure they're turned on. Also check inside the app settings. If they're still not coming, tap IT Support and we'll investigate." }
];

const EMOTIONAL_CATEGORIES = new Set(['emotional', 'life_events', 'postpartum']);
const CRISIS_CATEGORIES = new Set(['crisis']);

// ============================================================================
// RAG SEARCH
// ============================================================================

function ragSearch(userMessage) {
  const messageLower = userMessage.toLowerCase();
  const messageWords = messageLower.split(/\s+/);
  let bestMatch = null;
  let highestScore = 0;

  for (const entry of RAG_KNOWLEDGE_BASE) {
    let score = 0;
    let phraseBonus = 0;

    for (const keyword of entry.keywords) {
      const kLower = keyword.toLowerCase();
      if (messageLower.includes(kLower)) {
        score += 1;
        if (keyword.includes(' ')) phraseBonus += 0.2; // multi-word bonus
      }
    }

    // Short message word-overlap bonus
    if (messageWords.length <= 5) {
      for (const word of messageWords) {
        if (word.length > 2 && entry.keywords.some(k => k.includes(word))) {
          phraseBonus += 0.1;
          break;
        }
      }
    }

    const normalizedScore = entry.keywords.length > 0
      ? Math.min(1.0, (score / entry.keywords.length) + phraseBonus)
      : 0;

    if (normalizedScore > highestScore) {
      highestScore = parseFloat(normalizedScore.toFixed(3));
      bestMatch = entry;
    }
  }

  return { bestMatch, score: highestScore };
}

// ============================================================================
// ROUTER
// ============================================================================

const CRISIS_SIGNAL_KEYWORDS = ['suicide', 'kill myself', 'hurt myself', "can't go on", 'end it', 'suicidal', 'end my life', "don't want to be here", "don't want to live", 'not safe with myself'];
const MEDICAL_SIGNAL_KEYWORDS = ['medication', 'antidepressant', 'ssri', 'hormone therapy', 'should i take', 'birth control', 'thyroid', 'prescription', 'drug interaction'];

function routeDecision(userMessage, ragResults) {
  const { score } = ragResults;
  const msgLower = userMessage.toLowerCase();

  const isCrisis = CRISIS_SIGNAL_KEYWORDS.some(k => msgLower.includes(k));
  const isMedical = MEDICAL_SIGNAL_KEYWORDS.some(k => msgLower.includes(k));

  if (isCrisis) {
    return { useLocal: true, priority: 'crisis' };
  }

  if (isMedical) {
    return { useLocal: score > 0.65, priority: 'medical' };
  }

  if (score >= 0.75) {
    return { useLocal: true, priority: 'strong_match' };
  }

  if (score >= 0.55) {
    return { useLocal: true, priority: 'partial_match' };
  }

  return { useLocal: false, priority: 'grok_fallback' };
}

// ============================================================================
// SYSTEM PROMPT
// ============================================================================

const LUNA_SYSTEM_PROMPT = `You are Luna 🌙, CycleMind's warm, empathetic, and sister-like AI companion for women with PMDD, menstrual cycles, pregnancy, postpartum, and menopause.

Core Personality:
- You are warm, caring, validating, and supportive — like a wise, understanding older sister who truly gets it.
- Speak naturally and conversationally.
- Always acknowledge the user's feelings first.
- Never use terms like "honey", "sweetie", "darling", or overly affectionate nicknames.
- Never sound clinical or like a medical website.

RAG Adaptation Rules (Very Important):
- If curated responses are provided in the context, prioritize and adapt them.
- Blend the core advice from the best curated response with your warm, sister-like voice.
- Do not copy the curated response verbatim — make it feel personal and natural.
- If no strong curated response exists, respond empathetically and encourage professional support when appropriate.

Strict Safety Rules:
- NEVER give specific medical advice, recommend medications, supplements, dosages, or treatments.
- NEVER suggest they have a specific condition or diagnosis.
- If the user asks about medication or treatment, gently redirect to their doctor.
- Always be cautious with crisis or self-harm language.
- Do NOT append any disclaimer at the end — the disclaimer is handled separately by the system.`;

// ============================================================================
// RESPONSE GENERATORS
// ============================================================================

async function generateLocalResponse(userMessage, ragEntry) {
  const isCrisis = CRISIS_CATEGORIES.has(ragEntry.category);

  // Crisis responses are never adapted — always return verbatim
  if (isCrisis) {
    return {
      mainContent: ragEntry.response,
      disclaimer: "This is not a substitute for professional medical advice. Please consult your doctor or a mental health professional.",
      source: 'rag',
      suggestedActions: [],
      flags: { escalate: true, crisis: true },
      route: 'tier_1_crisis',
      modelUsed: 'rag_verbatim'
    };
  }

  // Adapt the curated response to the user's message via Grok
  const grokApiKey = Deno.env.get('XAI_API_KEY');
  if (grokApiKey) {
    const adaptPrompt = `You are Luna 🌙. Adapt the following curated response to sound warm, empathetic, and sister-like.

Original Curated Response:
${ragEntry.response}

User Message: ${userMessage}

Guidelines:
- Keep the core advice from the curated response
- Make it feel personal and supportive
- Use natural, conversational language
- Do not add new medical advice
- Do NOT append any disclaimer — it is handled separately

Respond with only the adapted message text, nothing else.`;

    try {
      const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${grokApiKey}` },
        body: JSON.stringify({
          model: 'grok-3-mini',
          messages: [{ role: 'user', content: adaptPrompt }],
          temperature: 0.65,
          max_tokens: 512
        })
      });

      if (grokResponse.ok) {
        const data = await grokResponse.json();
        // Strip any disclaimer the model may have appended
        let adapted = data.choices[0].message.content.trim();
        adapted = adapted.replace(/This is not a substitute for professional medical advice\..*$/s, '').trim();
        return {
          mainContent: adapted,
          disclaimer: "This is not a substitute for professional medical advice. Please consult your doctor or a mental health professional.",
          source: 'rag',
          suggestedActions: [],
          flags: { escalate: false, crisis: false },
          route: 'tier_2_rag_adapted',
          modelUsed: 'grok-3-mini'
        };
      }
    } catch (_) {
      // fall through to verbatim
    }
  }

  // Fallback: return verbatim curated response
  return {
    mainContent: ragEntry.response,
    disclaimer: "This is not a substitute for professional medical advice. Please consult your doctor or a mental health professional.",
    source: 'rag',
    suggestedActions: [],
    flags: { escalate: false, crisis: false },
    route: 'tier_2_rag_verbatim',
    modelUsed: 'rag_verbatim'
  };
}

async function generateGrokResponse(messages, contextInfo, ragResults) {
  const grokApiKey = Deno.env.get('XAI_API_KEY');
  console.log('[LUNA] grok key present:', !!grokApiKey, 'key prefix:', grokApiKey?.slice(0,8));

  if (!grokApiKey) {
    return {
      mainContent: "I hear you and I'm here to listen. You matter and your feelings matter.",
      disclaimer: "This is not a substitute for professional medical advice. Please consult your doctor or a mental health professional.",
      source: 'rag',
      suggestedActions: [],
      flags: { escalate: false, crisis: false },
      route: 'local_fallback',
      modelUsed: 'none'
    };
  }

  const systemContent = LUNA_SYSTEM_PROMPT + '\n\n' + contextInfo;

  // Inject RAG context into the last user message
  const messagesWithContext = messages.map((m, i) => {
    if (i === messages.length - 1 && m.role === 'user' && ragResults.bestMatch) {
      return {
        role: 'user',
        content: `Context from curated responses:\n${ragResults.bestMatch.response}\n\nUser message: ${m.content}`
      };
    }
    return { role: m.role, content: m.content };
  });

  const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${grokApiKey}`
    },
    body: JSON.stringify({
      model: 'grok-3-mini',
      messages: [
        { role: 'system', content: systemContent + '\n\nIMPORTANT: Respond ONLY with a valid JSON object with keys: mainContent (string — your response, no disclaimer), suggestedActions (array of strings), flags (object with escalate and crisis booleans).' },
        ...messagesWithContext
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1024
    })
  });

  if (!grokResponse.ok) {
    const errBody = await grokResponse.text();
    console.error('[LUNA] grok error body:', errBody);
    throw new Error(`Grok API error: ${grokResponse.status} ${grokResponse.statusText} — ${errBody}`);
  }

  const grokData = await grokResponse.json();
  const content = grokData.choices[0].message.content;

  try {
    const parsed = JSON.parse(content);
    // Normalize: extract mainContent from `message` if model used old key
    const mainContent = parsed.mainContent || parsed.message || '';
    // Strip any disclaimer the model may have appended to the content
    const cleanContent = mainContent.replace(/This is not a substitute for professional medical advice\..*$/s, '').trim();
    return {
      ...parsed,
      mainContent: cleanContent,
      disclaimer: "This is not a substitute for professional medical advice. Please consult your doctor or a mental health professional.",
      source: 'grok',
      route: 'tier_3_grok',
      modelUsed: 'grok-3-mini'
    };
  } catch {
    return {
      mainContent: content.replace(/This is not a substitute for professional medical advice\..*$/s, '').trim(),
      disclaimer: "This is not a substitute for professional medical advice. Please consult your doctor or a mental health professional.",
      source: 'grok',
      suggestedActions: [],
      flags: { escalate: false, crisis: false },
      route: 'tier_3_grok',
      modelUsed: 'grok-3-mini'
    };
  }
}

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

    const body = await req.json();
    console.log('[LUNA] body keys:', Object.keys(body));
    const { messages, cycleMode, cycleDay, eddInfo, fertilityMode, menopauseStage } = body;
    const userMessage = messages[messages.length - 1].content;
    console.log('[LUNA] userMessage:', userMessage);

    // ── Initial greeting shortcut ──
    if (messages.length === 1 && userMessage === 'Hello Luna, I just opened the chat.') {
      let greeting = "Hi, I'm Luna 🌙 — your compassionate CycleMind companion.\n\nHow are you feeling today? I'm here to listen and support you through your cycle, pregnancy, or menopausal journey.";
      if (fertilityMode) greeting += " I see you're in fertility mode — I can help track your fertile window and provide conception guidance.";
      else if (menopauseStage) greeting += ` I see you're tracking menopause (${menopauseStage}) — I'm here to support you through this transition.`;
      // disclaimer is returned separately

      console.log('[LUNA] route=template');
      return Response.json({
        mainContent: greeting,
        disclaimer: "This is not a substitute for professional medical advice. Please consult your doctor or a mental health professional.",
        source: 'rag',
        suggestedActions: ["Track today's symptoms", fertilityMode ? "View fertility window" : "Generate doctor report"].filter(Boolean),
        flags: { escalate: false, crisis: false },
        timestamp: new Date().toISOString(),
        route: 'template'
      });
    }

    // ── Step 1: RAG Search ──
    const ragResults = ragSearch(userMessage);
    console.log(`[LUNA] rag_search score=${ragResults.score} match_id=${ragResults.bestMatch?.id} category=${ragResults.bestMatch?.category}`);

    // ── Quick Reply shortcut: suggested action buttons use RAG-only, no Grok ──
    const { isQuickReply } = body;
    if (isQuickReply && ragResults.bestMatch && ragResults.score >= 0.3) {
      const result = await generateLocalResponse(userMessage, ragResults.bestMatch);
      console.log(`[LUNA] route=quick_reply model=${result.modelUsed}`);
      return Response.json({ ...result, timestamp: new Date().toISOString() });
    }
    if (isQuickReply && !ragResults.bestMatch) {
      return Response.json({
        mainContent: "I'm here with you. Want to tell me more about what's going on right now?",
        disclaimer: "This is not a substitute for professional medical advice. Please consult your doctor or a mental health professional.",
        source: 'rag',
        suggestedActions: [],
        flags: { escalate: false, crisis: false },
        timestamp: new Date().toISOString(),
        route: 'quick_fallback'
      });
    }

    // ── Step 2: Router Decision ──
    const decision = routeDecision(userMessage, ragResults);
    console.log(`[LUNA] router useLocal=${decision.useLocal} priority=${decision.priority}`);

    // ── Step 3a: Local RAG Response ──
    if (decision.useLocal && ragResults.bestMatch) {
      const result = await generateLocalResponse(userMessage, ragResults.bestMatch);
      console.log(`[LUNA] route=${result.route} model=${result.modelUsed}`);
      return Response.json({ ...result, timestamp: new Date().toISOString() });
    }

    // ── Step 3b: Grok Fallback ──
    const contextInfo = [
      `Current context → Cycle mode: ${cycleMode || 'unknown'}`,
      cycleDay ? `Cycle day: ${cycleDay}` : null,
      eddInfo ? `EDD: ${eddInfo}` : null,
      fertilityMode ? 'FERTILITY MODE ACTIVE' : null,
      menopauseStage ? `MENOPAUSE STAGE: ${menopauseStage}` : null
    ].filter(Boolean).join(' | ');

    console.log(`[LUNA] route=tier_3_grok score=${ragResults.score} priority=${decision.priority}`);
    const result = await generateGrokResponse(messages, contextInfo, ragResults);
    return Response.json({ ...result, timestamp: new Date().toISOString() });

  } catch (error) {
    console.error('[LUNA] error:', error.message);
    return Response.json({
      mainContent: "I'm having a brief moment connecting, but I'm still here for you. Can you try sending your message again?",
      disclaimer: "This is not a substitute for professional medical advice. Please consult your doctor or a mental health professional.",
      source: 'rag',
      suggestedActions: [],
      flags: { escalate: false, crisis: false },
      timestamp: new Date().toISOString(),
      route: 'fallback'
    }, { status: 200 });
  }
});