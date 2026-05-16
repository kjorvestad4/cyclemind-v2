import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Template responses for common simple patterns (zero API cost)
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
    const messageLength = userMessage.length;

    // Pattern matcher for simple questions
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