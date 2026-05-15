import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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
      
      return Response.json({
        message: greeting,
        suggestedActions: ["Track today's symptoms", fertilityMode ? "View fertility window" : "Generate doctor report"].filter(Boolean),
        flags: { escalate: false, crisis: false },
        timestamp: new Date().toISOString()
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

    const parsed = await base44.integrations.Core.InvokeLLM({
      prompt: fullPrompt,
      model: 'claude_sonnet_4_6',
      response_json_schema: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          suggestedActions: { type: 'array', items: { type: 'string' } },
          flags: {
            type: 'object',
            properties: {
              escalate: { type: 'boolean' },
              crisis: { type: 'boolean' }
            }
          },
          detectedSymptoms: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                severity: { type: 'number', minimum: 1, maximum: 6 }
              },
              required: ['name', 'severity']
            }
          },
          codedSymptoms: {
            type: 'object',
            properties: {
              s_mood_swings: { type: 'number' },
              s_irritability: { type: 'number' },
              s_anxiety: { type: 'number' },
              s_depression: { type: 'number' },
              s_overwhelmed: { type: 'number' },
              s_concentration: { type: 'number' },
              s_insomnia: { type: 'number' },
              s_breast_tender: { type: 'number' },
              s_bloating: { type: 'number' },
              s_headache: { type: 'number' },
              s_pain: { type: 'number' },
              s_lethargic: { type: 'number' },
              s_appetite: { type: 'number' }
            }
          }
        }
      }
    });

    return Response.json({
      ...parsed,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Luna chat error:', error);
    return Response.json({ 
      message: "I'm having a brief moment connecting, but I'm still here for you. Can you try sending your message again?",
      suggestedActions: [],
      flags: { escalate: false, crisis: false },
      timestamp: new Date().toISOString()
    }, { status: 200 });
  }
});