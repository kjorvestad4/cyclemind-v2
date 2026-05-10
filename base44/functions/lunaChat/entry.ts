import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const LUNA_SYSTEM_PROMPT = `You are Luna 🌙, the CycleMind AI companion — a warm, evidence-based support tool for women's reproductive health.

You are warm, empathetic, validating, and evidence-based. You support women through PMDD, menstrual cycles, pregnancy, postpartum, and menopause. You are NOT a doctor and never diagnose, prescribe, or replace professional care.

Core clinical rules (always follow):
1. Validate emotions FIRST ("That sounds really hard... I hear you").
2. Tie every response to the user's current reproductive stage.
3. Use only evidence-based information (ACOG, APA, APA PMDD guidelines).
4. Keep language short, hopeful, and brain-fog-friendly (max 2-3 sentences per idea).
5. End with an open question to continue the conversation.
6. ALWAYS include this exact disclaimer: "This is not a substitute for professional medical advice. Please consult your doctor or a mental health professional."

Safety protocol:
- If the user mentions suicidal thoughts, self-harm, or severe crisis: immediately validate, provide 988 lifeline (US), and strongly encourage contacting their doctor or going to ER.
- Flag any severe symptoms for escalation.

You can:
- Offer CBT-style reframes and practical coping tools
- Help users prepare questions for their doctor
- Suggest gentle self-care tied to their cycle phase
- Celebrate small wins and normalize experiences

Tone: Compassionate, hopeful, non-judgmental, sister-like support.

You have access to: cycleMode, cycleDay, eddInfo. Use them to personalize every reply.`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages, cycleMode, cycleDay, eddInfo } = await req.json();

    // Initial greeting (kept for speed)
    const isInitialGreeting = messages.length === 1 && messages[0].content === 'Hello Luna, I just opened the chat.';
    
    if (isInitialGreeting) {
      return Response.json({
        message: "Hi, I'm Luna 🌙 — your compassionate CycleMind companion.\n\nHow are you feeling today? I'm here to listen and support you through your cycle, pregnancy, or menopausal journey. This is not a substitute for professional medical advice. Please consult your doctor.",
        suggestedActions: ["Log my mood today", "Track today's symptoms"],
        flags: { escalate: false, crisis: false },
        timestamp: new Date().toISOString()
      });
    }

    // Build rich context
    const contextInfo = `Current context → Cycle mode: ${cycleMode || 'unknown'}${cycleDay ? ` | Cycle day: ${cycleDay}` : ''}${eddInfo ? ` | EDD: ${eddInfo}` : ''}`;

    // Full prompt for LLM
    const fullPrompt = `${LUNA_SYSTEM_PROMPT}

${contextInfo}

Conversation history:
${messages.map(m => `${m.role === 'user' ? 'User' : 'Luna'}: ${m.content}`).join('\n\n')}

Respond ONLY with valid JSON in this exact format:
{
  "message": "your warm, empathetic response here (include disclaimer)",
  "suggestedActions": ["short actionable button 1", "short actionable button 2"],
  "flags": { "escalate": true/false, "crisis": true/false }
}`;

    const lunaResponse = await base44.integrations.Core.InvokeLLM({
      prompt: fullPrompt,
      model: 'automatic'
    });

    // Parse JSON safely (fallback if LLM doesn't obey perfectly)
    let parsed;
    try {
      parsed = typeof lunaResponse === 'string' ? JSON.parse(lunaResponse) : lunaResponse;
    } catch (e) {
      parsed = {
        message: lunaResponse || "I'm here and listening. What's on your mind right now?",
        suggestedActions: [],
        flags: { escalate: false, crisis: false }
      };
    }

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