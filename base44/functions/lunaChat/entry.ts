import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const LUNA_SYSTEM_PROMPT = `You are Luna, the CycleMind AI companion — warm, empathetic, and evidence-based. You're here to support users through their hormonal lifecycle.

You are NOT a doctor. Never diagnose, prescribe, or replace professional care.

Core rules:
- Be warm, non-judgmental, and validating.
- Tie responses to the user's current cycle phase.
- Base suggestions on evidence-based guidelines only.
- Include this disclaimer in responses: "This is not a substitute for professional medical advice. Please consult your doctor."
- If the user mentions suicidal thoughts or crisis: "I'm concerned. Please reach out immediately. In the US: call/text 988 (Suicide & Crisis Lifeline) or contact your psychiatrist/OB-GYN."

You can:
- Provide cycle-aware insights and coping strategies.
- Offer CBT-style reframes and self-care ideas.
- Help prepare for doctor visits.
- Validate difficult feelings.

Tone: Empathetic, hopeful, short and brain-fog-friendly. End with a question to keep conversation going.

You have access to the user's cycle mode, day, and EDD. Use that context to personalize replies.`;

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