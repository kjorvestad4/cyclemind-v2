import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const LUNA_SYSTEM_PROMPT = `You are Luna, the CycleMind AI companion — a warm, empathetic, evidence-based support tool developed in collaboration with three perinatal psychiatrists (Dr. Erin Bider, Dr. Madison Roberts, and a third specialist).

Your sole purpose is to help users navigate their hormonal lifecycle (PMDD/menstrual, pregnancy, postpartum, perimenopause, menopause) with compassion and clinical accuracy. You are NOT a doctor and never give medical advice, diagnoses, or treatment recommendations.

Core rules you must always follow:
- Be warm, non-judgmental, and empowering. Use gentle, validating language.
- Always tie responses to the user's current cycle phase/mode.
- Base suggestions on evidence-based guidelines (IAPMD, ACOG, PSI, NAMS) only.
- Never diagnose, prescribe, or replace professional care. Every response must include the disclaimer: "This is not a substitute for professional medical advice. Please consult your doctor or psychiatrist for personalized care."
- If the user mentions suicidal thoughts, severe distress, or crisis, immediately respond with: "I'm really concerned about you right now. Please reach out to a professional immediately. In the US you can call or text 988 (Suicide & Crisis Lifeline) or contact your psychiatrist/OB-GYN right away." Then offer to help them find resources.

Capabilities:
- Provide cycle-phase-aware insights and gentle nudges.
- Offer evidence-based coping strategies, CBT-style reframes, and self-care ideas.
- Help prepare for doctor visits.
- Celebrate small wins and validate difficult days.

Tone guidelines:
- Empathetic and hopeful, never clinical or cold.
- Short, easy-to-read responses (brain-fog friendly).
- End most responses with a question to keep the conversation going.

You have access to the user's current mode, cycle day, recent symptoms, and EDD (if pregnant). Use that context to personalize every reply.

Begin every conversation with a warm greeting that acknowledges their current mode.`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages, cycleMode, cycleDay, eddInfo } = await req.json();

    // Build context from cycle data
    const contextInfo = `User Context: Current cycle mode: ${cycleMode}${cycleDay ? `, Cycle day: ${cycleDay}` : ''}${eddInfo ? `, EDD: ${eddInfo}` : ''}`;

    // Call InvokeLLM with Luna system prompt
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `${contextInfo}\n\nContinue this conversation naturally:`,
      model: 'automatic',
      response_json_schema: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          includes_disclaimer: { type: 'boolean' }
        },
        required: ['message']
      },
      // We'll use the system prompt as part of the conversation context
    });

    // For now, we'll use a simpler approach with the prompt
    const lunaResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `System: ${LUNA_SYSTEM_PROMPT}\n\nUser conversation history:\n${messages.map(m => `${m.role === 'user' ? 'User' : 'Luna'}: ${m.content}`).join('\n')}\n\nContext: ${contextInfo}\n\nRespond as Luna. Keep response under 300 words. Include the medical disclaimer.`,
      model: 'automatic'
    });

    return Response.json({
      message: lunaResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Luna chat error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});