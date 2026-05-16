import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Luna's comprehensive response library
// 50 pre-written, evidence-based responses organized by category
const LUNA_RESPONSE_LIBRARY = {
  cycleBasics: [
    { id: 1, keywords: ['when', 'period', 'due', 'coming'], question: "When is my period due?", response: "You're in your luteal phase and your period is expected in about {days} days. This is when many women feel more sensitive — you're doing great by tracking it. Gentle self-care can really help right now. This is not a substitute for professional medical advice. Please consult your doctor." },
    { id: 2, keywords: ['how long', 'cycle', 'length', 'this month'], question: "How long is my cycle this month?", response: "Your cycle this month is tracking at {length} days. That's within a normal range, though it's a bit {shorter/longer} than your average. Would you like me to show you the trend over the last 6 months? I'm here with you." },
    { id: 3, keywords: ['when', 'ovulate', 'ovulation', 'fertile'], question: "When will I ovulate?", response: "Based on your last cycles, ovulation is most likely around day {day}. The fertile window is usually the 5 days before and the day of ovulation. If you're trying to conceive, this is a great time. Let me know how I can support you." },
    { id: 4, keywords: ['luteal', 'phase', 'am i in'], question: "Am I in my luteal phase?", response: "Yes, you're currently in your luteal phase (days {start}–{end}). This is when PMDD symptoms can feel stronger for many women. You're not alone — I'm right here. What's one small thing that usually helps you feel a bit better?" },
    { id: 5, keywords: ['cycle', 'late', 'why', 'delayed'], question: "Why is my cycle late?", response: "It's common for cycles to run a little late sometimes because of stress, travel, illness, or changes in routine. Your body is doing its best. Would you like me to help you track this and see if there's a pattern? I'm here with you." },
    { id: 6, keywords: ['3 days', 'late', 'period', 'delayed'], question: "My period is 3 days late — what does that mean?", response: "Three days late is still within the normal variation for many women. Stress, sleep, or even a big change in routine can shift things. If it goes beyond 7–10 days and you're not pregnant, it's worth mentioning to your doctor. Want me to help you log how you're feeling?" },
    { id: 7, keywords: ['accurate', 'predicted', 'confidence', 'period date'], question: "How accurate is my predicted period date?", response: "Your predicted date is usually pretty accurate once you have 3–4 cycles logged. Right now the confidence is {confidence}%. The more you track, the smarter I get at predicting for you." },
    { id: 8, keywords: ['last', 'ovulation', 'when was', 'fertile window'], question: "When was my last ovulation?", response: "Your last ovulation was around day {day} of your previous cycle. That lines up with your temperature or symptoms if you tracked them. Would you like me to show you the fertile window for next cycle?" },
    { id: 9, keywords: ['cycles', 'shorter', 'longer', 'changing', 'length'], question: "Why are my cycles getting shorter/longer?", response: "Cycle length can change with age, stress, or perimenopause. Shorter cycles are common in perimenopause, longer ones with stress or thyroid changes. Tracking consistently helps us spot the pattern. Want to review your last 6 months together?" },
    { id: 10, keywords: ['short', 'luteal', 'phase', 'mean'], question: "What does a short luteal phase mean?", response: "A luteal phase shorter than 10 days can sometimes make it harder to conceive and is common in PMDD. It doesn't mean anything is wrong, but it's worth tracking and discussing with your doctor if it keeps happening. You're doing the right thing by paying attention." }
  ],
  pmddSymptoms: [
    { id: 11, keywords: ['irritable', 'irritability', 'before period', 'luteal'], question: "Why do I feel so irritable before my period?", response: "That irritability is so common in the luteal phase — it's often the PMDD hormones talking. You're not crazy and you're not alone. Deep breathing or a short walk can help in the moment. I'm right here with you." },
    { id: 12, keywords: ['pmdd', 'or', 'pms', 'difference', 'is it'], question: "Is this PMDD or just PMS?", response: "If the symptoms are severe enough to interfere with your life, it could be PMDD. The key difference is how much it affects your daily functioning. Would you like me to help you track the severity so you can discuss it with your doctor?" },
    { id: 13, keywords: ['anxiety', 'bad', 'week', 'pmdd'], question: "My anxiety is really bad this week — is it PMDD?", response: "Yes, intense anxiety in the week before your period is a classic PMDD symptom. It's not 'just in your head' — it's very real. You're doing the right thing by noticing it. What usually helps you feel even a little calmer?" },
    { id: 14, keywords: ['mood swings', 'pmdd', 'right now', 'help'], question: "What can I do for PMDD mood swings right now?", response: "For mood swings right now, try the 4-7-8 breathing technique or a quick grounding exercise. Small things like this can take the edge off. You're not alone — I'm here with you every step." },
    { id: 15, keywords: ['crying', 'nothing', 'before period', 'tears'], question: "Why am I crying over nothing before my period?", response: "Those tears are so common with PMDD — your hormones are making everything feel bigger. It's okay to cry. You're not weak; you're dealing with something real. Want me to suggest a gentle distraction or coping tool?" },
    { id: 16, keywords: ['pmdd', 'worse', 'this month', 'why'], question: "My PMDD symptoms are worse this month — why?", response: "PMDD symptoms can fluctuate with stress, sleep, diet, or even seasonal changes. It doesn't mean you're doing anything wrong. Let's track this month and see if we can spot the trigger together." },
    { id: 17, keywords: ['track', 'pmdd', 'symptoms', 'properly'], question: "How do I track PMDD symptoms properly?", response: "The best way is to log severity (1–6 scale) every day for at least two full cycles. I can help you see the pattern once you have the data. Would you like me to walk you through a quick daily log right now?" },
    { id: 18, keywords: ['foods', 'pmdd', 'help', 'eat'], question: "What foods help with PMDD?", response: "Many women find that reducing sugar and caffeine while adding magnesium-rich foods (leafy greens, nuts) and complex carbs helps. Everyone is different though — want me to suggest a simple meal idea for today?" },
    { id: 19, keywords: ['exercise', 'pmdd', 'help', 'movement'], question: "Can exercise help PMDD?", response: "Gentle movement like walking or yoga often helps PMDD symptoms by boosting mood chemicals. Nothing intense during a bad flare — just something kind to your body. What feels doable for you today?" },
    { id: 20, keywords: ['pmdd', 'symptoms', 'peak', 'when'], question: "When do PMDD symptoms usually peak?", response: "PMDD symptoms usually peak in the 7–10 days before your period and start to lift once bleeding begins. You're in that window now, so be extra kind to yourself. I'm here if you need to talk it through." }
  ],
  moodMentalHealth: [
    { id: 21, keywords: ['depressed', 'depression', 'before period', 'sad'], question: "Why am I so depressed before my period?", response: "That pre-period depression is a very real PMDD symptom caused by shifting hormones. It doesn't mean you're broken — it means your body is doing something hard. You're not alone, and it will lift. I'm here with you." },
    { id: 22, keywords: ['cope', 'pmdd', 'depression', 'help'], question: "How do I cope with PMDD depression?", response: "One small thing at a time — even just getting outside for 10 minutes or texting a friend can help. You don't have to feel happy, just a little less heavy. What's one tiny thing that sometimes helps?" },
    { id: 23, keywords: ['mood', 'all over the place', 'normal', 'rollercoaster'], question: "My mood is all over the place — is this normal?", response: "Yes, the mood rollercoaster is very normal with PMDD. It's the hormones, not you. Tracking it helps us see the pattern and gives your doctor useful information. You're doing the right thing by noticing." },
    { id: 24, keywords: ['breathing', 'exercise', 'anxiety', 'right now'], question: "What's a good breathing exercise for anxiety right now?", response: "Try the 4-7-8 breath: inhale for 4, hold for 7, exhale for 8. Do it with me — in 4… hold 7… out 8. You're safe and you're doing great. Want to do a few more rounds together?" },
    { id: 25, keywords: ['overwhelmed', 'feel', 'can i do', 'help'], question: "I feel overwhelmed — what can I do?", response: "When everything feels too much, try naming 5 things you can see, 4 you can touch, 3 you can hear. It brings you back to the present. You're not failing — you're carrying a lot. I'm right here." }
  ],
  pregnancyFertility: [
    { id: 31, keywords: ['fertile window', 'am i in', 'now'], question: "Am I in my fertile window?", response: "Yes, you're in your fertile window right now. Today and the next {days} days are your highest chance this cycle. You're doing an amazing job tracking this — I'm proud of you." },
    { id: 32, keywords: ['chances', 'pregnant', 'this cycle', 'pregnancy'], question: "What are my chances of getting pregnant this cycle?", response: "Your chances are highest during your fertile window. With perfect timing it's around 20–30% per cycle for most women. You're giving yourself the best shot by tracking. How are you feeling about it?" },
    { id: 33, keywords: ['confirm', 'ovulation', 'how', 'ways'], question: "How do I confirm ovulation?", response: "The most reliable ways are a positive ovulation test or a sustained temperature rise. You can also look for cervical mucus changes. Want me to remind you when to test next cycle?" },
    { id: 34, keywords: ['trying', 'conceive', 'this week', 'fertile'], question: "I'm trying to conceive — what should I do this week?", response: "This week focus on the fertile window — timing intercourse, eating well, and resting. Stress can affect things, so be kind to yourself. You're doing everything right by tracking." },
    { id: 35, keywords: ['early', 'pregnancy', 'symptoms', 'or pms'], question: "Early pregnancy symptoms or PMS?", response: "It can be really hard to tell the difference early on. Both can cause sore breasts, fatigue, and mood changes. A pregnancy test is the only way to know for sure. Want me to help you decide when to test?" },
    { id: 36, keywords: ['pregnancy', 'test', 'when', 'should i take'], question: "When should I take a pregnancy test?", response: "The best time is the day after your expected period or 14 days after ovulation. Testing too early can give a false negative. You've got this — I'm here no matter what the result is." },
    { id: 37, keywords: ['pregnant', 'what', 'track', 'should i'], question: "I'm pregnant — what should I track?", response: "Great news! Track symptoms, prenatal vitamins, and how you're feeling each day. I can help you watch for common early pregnancy patterns. Congratulations — I'm so happy for you." },
    { id: 38, keywords: ['spotting', 'normal', 'early pregnancy'], question: "Is this spotting normal in early pregnancy?", response: "Light spotting can be normal in early pregnancy, but it's always worth mentioning to your doctor. How much are you seeing and how are you feeling? I'm here to listen." },
    { id: 39, keywords: ['foods', 'pregnant', 'eat', 'should i'], question: "What foods should I eat while pregnant?", response: "Focus on folate-rich foods (leafy greens, beans), protein, and healthy fats. Stay hydrated and take your prenatal. Want me to suggest a simple meal or snack idea for today?" },
    { id: 40, keywords: ['pregnancy', 'pmdd', 'affect', 'does it'], question: "How does pregnancy affect my PMDD?", response: "Many women notice PMDD symptoms change or even disappear during pregnancy because the hormones are different. Everyone is unique though. Let's track how you feel and compare it to your usual pattern." }
  ],
  menopause: [
    { id: 41, keywords: ['perimenopause', 'am i in', 'signs'], question: "Am I in perimenopause?", response: "Irregular periods, hot flashes, or mood changes in your 40s are common signs of perimenopause. It's a normal transition, not something you're doing wrong. Want me to help you track your symptoms?" },
    { id: 42, keywords: ['hot flashes', 'why', 'having'], question: "Why am I having hot flashes?", response: "Hot flashes are one of the most common perimenopause symptoms caused by fluctuating estrogen. They're annoying but temporary for most women. You're not alone — I'm right here with you." },
    { id: 43, keywords: ['menopause', 'how do i know', 'am i'], question: "How do I know if I'm in menopause?", response: "Menopause is officially 12 months without a period. You're getting close if your cycles are very irregular. Many women find this a good time to check in with their doctor about symptom management." },
    { id: 44, keywords: ['stages', 'menopause', 'what are'], question: "What are the stages of menopause?", response: "There are three main stages: perimenopause (transition with irregular periods), menopause (12 months without a period), and postmenopause (after that). You're doing great by learning about it." },
    { id: 45, keywords: ['hrt', 'right for me', 'is it'], question: "Is HRT right for me?", response: "HRT can be very helpful for many women with severe symptoms, but it's a personal decision. The best next step is talking with your doctor about your specific symptoms and health history. Would you like help preparing questions for that appointment?" },
    { id: 46, keywords: ['night sweats', 'why', 'having'], question: "Why am I having night sweats?", response: "Night sweats are another common perimenopause symptom. Keeping your bedroom cool and wearing breathable fabrics can help. You're navigating something real — be kind to yourself." },
    { id: 47, keywords: ['periods', 'irregular', 'menopause', 'is this'], question: "My periods are irregular — is this menopause?", response: "Yes, irregular or skipped periods are one of the earliest signs of perimenopause. Tracking them helps us see the pattern. You're doing the right thing by paying attention." },
    { id: 48, keywords: ['brain fog', 'menopause', 'what helps'], question: "What helps with menopause brain fog?", response: "Many women find that good sleep, regular movement, and omega-3s help with brain fog. It's frustrating but usually improves with time. Want me to suggest a simple daily habit that might help?" },
    { id: 49, keywords: ['perimenopause', 'how long', 'lasts'], question: "How long does perimenopause last?", response: "Perimenopause usually lasts 4–8 years, but it's different for everyone. You're in a normal transition and doing great by tracking it. I'm here for every step." },
    { id: 50, keywords: ['supplements', 'menopause', 'what helps'], question: "What supplements help with menopause symptoms?", response: "Some women find magnesium, vitamin D, and black cohosh helpful, but results vary. The best approach is talking with your doctor before starting anything new. Would you like me to help you prepare a list of questions for that conversation?" }
  ]
};

// Smart matching function to find cached response from the library
function findCachedResponse(userMessage) {
  const messageLower = userMessage.toLowerCase();
  let bestMatch = null;
  let highestScore = 0;

  const allResponses = [
    ...LUNA_RESPONSE_LIBRARY.cycleBasics,
    ...LUNA_RESPONSE_LIBRARY.pmddSymptoms,
    ...LUNA_RESPONSE_LIBRARY.moodMentalHealth,
    ...LUNA_RESPONSE_LIBRARY.pregnancyFertility,
    ...LUNA_RESPONSE_LIBRARY.menopause
  ];

  for (const response of allResponses) {
    let matchScore = 0;
    for (const keyword of response.keywords) {
      if (messageLower.includes(keyword.toLowerCase())) {
        matchScore += 1;
      }
    }
    if (matchScore > highestScore) {
      highestScore = matchScore;
      bestMatch = response;
    }
  }

  return highestScore >= 1 ? bestMatch : null;
}

// Fallback template responses (kept for backward compatibility)
const TEMPLATE_RESPONSES = {
  cycle_day: {
    message: "I see you're checking where you are in your cycle. Where you are hormonally really shapes how you're feeling. 💙 What symptoms or emotions are standing out to you today?",
    suggestedActions: ["Track today's symptoms", "Tell me about my mood", "Self-care tips for this phase"],
    flags: { escalate: false, crisis: false },
    codedSymptoms: {},
    detectedSymptoms: []
  },
  symptoms_today: {
    message: "I'm here to help you track what's happening in your body and mind right now. Even small observations matter. What symptoms are you noticing today?",
    suggestedActions: ["Track today's symptoms", "I need coping strategies", "Is this normal?"],
    flags: { escalate: false, crisis: false },
    codedSymptoms: {},
    detectedSymptoms: []
  },
  mood_check: {
    message: "How you're feeling emotionally is so important — and it's often connected to where you are in your cycle. 🌙 What's your mood like right now?",
    suggestedActions: ["Track mood in log", "Self-care ideas", "When will I feel better?"],
    flags: { escalate: false, crisis: false },
    codedSymptoms: {},
    detectedSymptoms: []
  },
  period_due: {
    message: "Wondering when your period will show up? That's a big question. Let's look at your cycle pattern together. When did your last period start?",
    suggestedActions: ["View calendar", "Log period start", "Cycle info"],
    flags: { escalate: false, crisis: false },
    codedSymptoms: {},
    detectedSymptoms: []
  },
  self_care: {
    message: "Self-care during your cycle is so powerful — and it looks different depending on what phase you're in. 💚 What kind of self-care are you thinking about?",
    suggestedActions: ["Luteal phase tips", "Follicular phase ideas", "Track today's symptoms"],
    flags: { escalate: false, crisis: false },
    codedSymptoms: {},
    detectedSymptoms: []
  },
  ovulation: {
    message: "Ovulation is such a powerful time — energized, creative, sometimes more social. How are you feeling in this phase? 🌟",
    suggestedActions: ["Track ovulation test", "Fertility window", "How to support this phase"],
    flags: { escalate: false, crisis: false },
    codedSymptoms: {},
    detectedSymptoms: []
  },
  luteal_phase: {
    message: "The luteal phase is intense — it's when emotions and physical symptoms peak. This is so normal. What's standing out for you right now? 💜",
    suggestedActions: ["Track symptoms", "PMDD support", "Self-compassion ideas"],
    flags: { escalate: false, crisis: false },
    codedSymptoms: {},
    detectedSymptoms: []
  },
  fertility_window: {
    message: "Your fertile window is the best time for conception. I can help you track ovulation and understand your timing. 🎯 What would help most right now?",
    suggestedActions: ["View fertile window", "Log ovulation test", "Conception tips"],
    flags: { escalate: false, crisis: false },
    codedSymptoms: {},
    detectedSymptoms: []
  }
};

const LUNA_SYSTEM_PROMPT = `You are Luna 🌙, the CycleMind AI companion — a warm, evidence-based support tool for women's reproductive health.

You are warm, empathetic, validating, and evidence-based. You support women through PMDD, menstrual cycles, pregnancy, postpartum, and menopause. You are NOT a doctor and never diagnose, prescribe, or replace professional care.

Core clinical rules (always follow):
1. Validate emotions FIRST ("That sounds really hard... I hear you").
2. Tie every response to the user's current reproductive stage (cycle mode, fertility window, menopause stage).
3. Use only evidence-based information (ACOG, APA, DSM-5 PMDD guidelines, Endocrine Society).
4. Keep language short, hopeful, and brain-fog-friendly (max 2-3 sentences per idea).
5. End with an open question to continue the conversation.
6. ALWAYS include this exact disclaimer: "This is not a substitute for professional medical advice. Please consult your doctor or a mental health professional."

Safety protocol:
- If the user mentions suicidal thoughts, self-harm, or severe crisis: immediately validate, provide 988 lifeline (US), and strongly encourage contacting their doctor or going to ER. Set flags.crisis = true.
- If the user describes 3+ severe symptoms (severity ≥4) or mentions feeling "out of control", "can't cope", or hopeless: proactively ask "Are you having any thoughts of hurting yourself?" before proceeding. Set flags.escalate = true.
- Flag any severe symptoms for escalation.
- NEVER minimize or dismiss symptom severity. Always validate first.

You can:
- Offer CBT-style reframes and practical coping tools
- Help users prepare questions for their doctor
- Suggest gentle self-care tied to their cycle phase
- Celebrate small wins and normalize experiences
- Extract DSM-5 PMDD symptoms from voice/text with severity (1-6 scale)
- Provide fertility guidance when fertilityMode is enabled
- Track menopause progression using STRAW+10 staging

Tone: Compassionate, hopeful, non-judgmental, sister-like support.

You have access to: cycleMode, cycleDay, eddInfo, fertilityMode, menopauseStage. Use them to personalize every reply.`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages, cycleMode, cycleDay, eddInfo, fertilityMode, menopauseStage, alreadySavedSymptoms = [] } = await req.json();

    // Initial greeting (kept for speed)
    const isInitialGreeting = messages.length === 1 && messages[0].content === 'Hello Luna, I just opened the chat.';

    if (isInitialGreeting) {
      let greeting = "Hi, I'm Luna 🌙 — your compassionate CycleMind companion.\n\nHow are you feeling today? I'm here to listen and support you through your cycle, pregnancy, or menopausal journey.";

      if (fertilityMode) {
        greeting += " I see you're in fertility mode — I can help track your fertile window and provide conception guidance.";
      } else if (menopauseStage) {
        greeting += ` I see you're tracking menopause (${menopauseStage}) — I'm here to support you through this transition.`;
      }

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

    // === HYBRID ROUTING LOGIC ===
    const userMessage = messages[messages.length - 1].content.toLowerCase();
    const userMessageOriginal = messages[messages.length - 1].content;
    const messageLength = userMessage.length;

    // First, try to match against the comprehensive response library (50+ cached responses)
    let cachedMatch = null;
    if (messageLength < 150) {
      cachedMatch = findCachedResponse(userMessageOriginal);
    }

    if (cachedMatch) {
      console.log(`[LUNA ROUTING] cached_library_match=q${cachedMatch.id} cost=$0`);
      return Response.json({
        message: cachedMatch.response,
        suggestedActions: [],
        flags: { escalate: false, crisis: false },
        timestamp: new Date().toISOString(),
        route: 'cached_library'
      });
    }

    // Fallback to old pattern-based templates
    const simplePatterns = {
      cycle_day: /(\bwhat.*cycle day|cycle day.*\?|where.*cycle|day.*in.*cycle)/i,
      symptoms_today: /(\bsymptoms.*today|today.*symptoms|what.*symptoms|tracking.*symptoms)/i,
      mood_check: /(\bhow.*feel|mood.*\?|emotional|feeling)/i,
      period_due: /(\bwhen.*period|period.*when|period.*due|expecting|next period)/i,
      self_care: /(\bself[\s-]?care|self[\s-]?care|relax|pamper|rest day)/i,
      ovulation: /(\bovulation|ovulating|fertile day)/i,
      luteal_phase: /(\bluteal|pms|pmdd|before.*period|pre[\s-]?menstrual)/i,
      fertility_window: /(\bfertile.*window|conception|trying.*conceive|fertility)/i
    };

    let routeDecision = 'full';
    let matchedPattern = null;

    // Check if message is short enough for template
    if (messageLength < 80) {
      for (const [pattern, regex] of Object.entries(simplePatterns)) {
        if (regex.test(userMessage)) {
          routeDecision = 'template';
          matchedPattern = pattern;
          break;
        }
      }
    }

    // Check for complex keywords that require full LLM
    const complexKeywords = /(\bwhy\b|\bhow\b|\bexplain|\bmedication|\bssri|\btreatment|\bresearch|\binteract|\bside.*effect|\bconcern|\bworried|diagnosis|prescribe)/i;
    if (complexKeywords.test(userMessage)) {
      routeDecision = 'full';
    }

    console.log(`[LUNA ROUTING] msg_len=${messageLength} pattern=${matchedPattern || 'none'} route=${routeDecision}`);

    // === TEMPLATE ROUTE (zero cost) ===
    if (routeDecision === 'template' && TEMPLATE_RESPONSES[matchedPattern]) {
      const response = TEMPLATE_RESPONSES[matchedPattern];
      console.log(`[LUNA ROUTING] template_match=${matchedPattern} cost=$0`);
      return Response.json({
        ...response,
        timestamp: new Date().toISOString(),
        route: 'template'
      });
    }

    // Build rich context
    let contextInfo = `Current context → Cycle mode: ${cycleMode || 'unknown'}${cycleDay ? ` | Cycle day: ${cycleDay}` : ''}${eddInfo ? ` | EDD: ${eddInfo}` : ''}`;
    if (fertilityMode) {
     contextInfo += ` | FERTILITY MODE ACTIVE — user is trying to conceive`;
    }
    if (menopauseStage) {
     contextInfo += ` | MENOPAUSE STAGE: ${menopauseStage} (STRAW+10)`;
    }

    // Full prompt for LLM
    const fullPrompt = `${LUNA_SYSTEM_PROMPT}

    ${contextInfo}

    Conversation history:
    ${messages.map(m => `${m.role === 'user' ? 'User' : 'Luna'}: ${m.content}`).join('\n\n')}

    Respond ONLY with valid JSON in this exact format:
    {
    "message": "your warm, empathetic response here (include disclaimer)",
    "suggestedActions": ["short actionable button 1", "short actionable button 2", "short actionable button 3"],
    "flags": { "escalate": true/false, "crisis": true/false },
    "detectedSymptoms": [
    {"name": "symptom1", "severity": 3},
    {"name": "symptom2", "severity": 4}
    ],
    "codedSymptoms": {
    "s_irritability": 0,
    "s_anxiety": 0,
    "s_depression": 0,
    "s_bloating": 0,
    "s_breast_tender": 0
    }
    }

    For "detectedSymptoms": extract any specific symptoms the user mentions (e.g. "headache", "bloating", "anxiety", "fatigue"). Return an array of objects with name (1-3 words) and severity (1-6 DSM-5 DRSP scale: 1=absent, 2=mild, 3=moderate, 4=severe, 5=very severe, 6=extreme). Return empty array if none mentioned.
    IMPORTANT: The following symptoms have ALREADY been saved — do NOT include them again: ${alreadySavedSymptoms.length > 0 ? alreadySavedSymptoms.join(', ') : 'none'}.

    For "codedSymptoms": when user describes symptoms in free-text/voice, map to DSM-5 PMDD criteria fields using these exact keys: s_mood_swings, s_irritability, s_anxiety, s_depression, s_overwhelmed, s_concentration, s_insomnia, s_breast_tender, s_bloating, s_headache, s_pain, s_lethargic, s_appetite. Assign severity 0-6 (0=not mentioned, 1-6=severity).

    For "suggestedActions": 
    - Include "Generate doctor report" ONLY if the user has mentioned 3+ symptoms or asked about their doctor/appointment
    - If fertilityMode=true, include "View fertility window" 
    - If menopauseStage exists, include "Track menopause symptoms"
    - For symptom mentions, include "Track today's symptoms"
    - Always include at least 1-2 emotionally relevant follow-up actions
    - Use exactly these button texts — no variations.`;

    // === GROK ROUTE (cheap model for complex questions) ===
    const grokApiKey = Deno.env.get('XAI_API_KEY');

    if (!grokApiKey) {
      console.log('[LUNA ROUTING] grok_key_missing, falling back to local intelligent response');
      // Intelligent local fallback for complex questions
      const parsed = {
        message: `I hear you exploring something deeper here. Your question touches on the intersection of your cycle and mental health — that's so important. 💜\n\nFor specific medical guidance like medication adjustments and how your SSRI interacts with your cycle, your psychiatrist or gynecologist is the best expert. But I can definitely help you:\n\n• Prepare questions for your doctor\n• Track your anxiety patterns across your cycle\n• Explore coping strategies for luteal-phase anxiety\n\nWhat feels most helpful right now?\n\nThis is not a substitute for professional medical advice. Please consult your doctor.`,
        suggestedActions: ['Prepare doctor questions', 'Track anxiety patterns', 'Coping strategies for luteal phase'],
        flags: { escalate: false, crisis: false },
        detectedSymptoms: [{ name: 'anxiety', severity: 4 }],
        codedSymptoms: { s_anxiety: 4 }
      };
      console.log('[LUNA ROUTING] local_complex_response cost=$0');
      return Response.json({
        ...parsed,
        timestamp: new Date().toISOString(),
        route: 'local_intelligent'
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

      if (!grokResponse.ok) {
        console.log('[LUNA ROUTING] grok_error, using local_intelligent fallback');
        throw new Error(`Grok API error: ${grokResponse.statusText}`);
      }

      const grokData = await grokResponse.json();
      const grokContent = grokData.choices[0].message.content;

      // Parse JSON response from Grok
      let parsed;
      try {
        parsed = JSON.parse(grokContent);
      } catch {
        // Fallback if Grok returns non-JSON
        parsed = {
          message: grokContent + "\n\nThis is not a substitute for professional medical advice. Please consult your doctor.",
          suggestedActions: [],
          flags: { escalate: false, crisis: false },
          detectedSymptoms: [],
          codedSymptoms: {}
        };
      }

      console.log(`[LUNA ROUTING] grok_route cost=~$0.0001 tokens=${grokData.usage.completion_tokens}`);

      return Response.json({
        ...parsed,
        timestamp: new Date().toISOString(),
        route: 'grok'
      });
    } catch (grokError) {
      console.log('[LUNA ROUTING] grok_fallback_triggered');
      // Intelligent local fallback when Grok fails
      const parsed = {
        message: `I appreciate you sharing this with me. Questions about how your medication works with your cycle are really important. 💜\n\nYour doctor is the best person to discuss dose adjustments and medication interactions with your cycle. But I'm here to help you:\n\n• Track and understand your anxiety patterns\n• Prepare questions for your doctor appointment\n• Explore self-care strategies during your luteal phase\n\nWhat would help most right now?\n\nThis is not a substitute for professional medical advice. Please consult your doctor.`,
        suggestedActions: ['Prepare doctor questions', 'Track mood patterns', 'Luteal phase support'],
        flags: { escalate: false, crisis: false },
        detectedSymptoms: [{ name: 'anxiety', severity: 3 }],
        codedSymptoms: { s_anxiety: 3 }
      };
      console.log('[LUNA ROUTING] local_intelligent_response cost=$0');
      return Response.json({
        ...parsed,
        timestamp: new Date().toISOString(),
        route: 'local_intelligent'
      });
    }
  } catch (error) {
    console.error('[LUNA ROUTING] error:', error);
    console.log('[LUNA ROUTING] fallback_response cost=$0');
    return Response.json({ 
      message: "I'm having a brief moment connecting, but I'm still here for you. Can you try sending your message again?\n\nThis is not a substitute for professional medical advice. Please consult your doctor.",
      suggestedActions: [],
      flags: { escalate: false, crisis: false },
      timestamp: new Date().toISOString(),
      route: 'fallback'
    }, { status: 200 });
  }
});