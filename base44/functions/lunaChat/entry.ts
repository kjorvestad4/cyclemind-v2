import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// RAG entries are now imported from the separate lib/ragEntries.js file
// This keeps the function file manageable and maintainable

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages, cycleMode, cycleDay, cyclePhase, eddInfo, fertilityMode, menopauseStage, alreadySavedSymptoms = [], isQuickReply = false, mode = 'quick' } = await req.json();

    // Get current date for context
    const currentDate = new Date();
    
    // Build context message
    let contextMessage = `You are Luna, a compassionate AI companion for a menstrual health and mental wellness app called CycleMind. You are speaking with a user on ${currentDate.toLocaleDateString()}. `;
    
    // Add cycle context
    if (fertilityMode) {
      contextMessage += "The user is in fertility mode (trying to conceive). ";
      if (eddInfo?.ovulationWindow) {
        contextMessage += `Their fertile window is ${eddInfo.ovulationWindow.start} to ${eddInfo.ovulationWindow.end}. `;
      }
    } else if (menopauseStage) {
      contextMessage += `The user is in ${menopauseStage} (menopause/perimenopause mode). `;
    } else if (cycleMode === 'pregnancy' && eddInfo) {
      contextMessage += `The user is pregnant. Current trimester: ${eddInfo.trimester}, Week: ${eddInfo.week}, EDD: ${eddInfo.edd}. `;
    } else if (cycleMode === 'postpartum') {
      contextMessage += "The user is in postpartum mode. ";
    } else if (cycleDay) {
      contextMessage += `The user is on cycle day ${cycleDay}, in the ${cyclePhase} phase. `;
    }

    contextMessage += "\n\nYour role is to:\n1. Listen with empathy and validate their feelings\n2. Provide evidence-based information when asked\n3. Encourage professional help when appropriate\n4. NEVER provide medical advice — always defer to their healthcare team\n5. If they mention self-harm or suicide, provide crisis resources immediately (988 Lifeline)\n6. Be warm, supportive, and non-judgmental\n7. Use simple, conversational language\n8. Keep responses concise unless they ask for depth\n\nIMPORTANT: If the user mentions suicidal thoughts, self-harm, or crisis, respond with empathy and provide the 988 Suicide & Crisis Lifeline immediately. Do not try to counsel them through it yourself.";

    // Add already saved symptoms context
    if (alreadySavedSymptoms.length > 0) {
      contextMessage += `\n\nNote: The following symptoms have already been saved to today's log: ${alreadySavedSymptoms.join(', ')}. If you detect these same symptoms in their message, do not offer to save them again.`;
    }

    // Build the full message array for the LLM
    const llmMessages = [
      { role: "system", content: contextMessage },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ];

    // Quick reply mode = shorter, more conversational
    // Deep mode = more thoughtful, detailed response
    const prompt = mode === 'quick' 
      ? "Respond in 2-4 sentences max. Be warm and conversational. If they mentioned symptoms, gently offer to save them to today's log (unless already saved)."
      : "Take a moment to think deeply. Respond with more detail and nuance (up to 6-8 sentences). You can offer multiple supportive suggestions. If they mentioned symptoms, offer to save them to today's log (unless already saved).";

    // Call the LLM
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `${prompt}\n\nUser's latest message: ${messages[messages.length - 1].content}`,
      add_context_from_internet: false,
      file_urls: [],
    });

    // Parse response for symptoms detection (simple keyword matching for now)
    const symptomKeywords = ['sad', 'anxious', 'tired', 'exhausted', 'bloated', 'cramping', 'headache', 'irritable', 'angry', 'overwhelmed', 'stressed', 'mood swings', 'crying', 'depressed', 'hopeless', 'guilty', 'ashamed', 'fatigue', 'pain', 'nausea', 'breast tenderness', 'cravings', 'insomnia', 'sleeping too much', 'appetite changes'];
    const lastMessage = messages[messages.length - 1].content.toLowerCase();
    const detectedSymptoms = symptomKeywords.filter(keyword => lastMessage.includes(keyword));
    
    // Filter out already saved symptoms
    const newSymptoms = detectedSymptoms.filter(s => !alreadySavedSymptoms.includes(s));

    return Response.json({
      message: response,
      detectedSymptoms: newSymptoms,
      source: 'llm'
    });
  } catch (error) {
    console.error('LunaChat error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});