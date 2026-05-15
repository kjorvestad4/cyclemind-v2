import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { audioTranscript } = await req.json();
    
    if (!audioTranscript || !audioTranscript.trim()) {
      return Response.json({ error: 'No transcript provided' }, { status: 400 });
    }

    // Use LLM to extract symptoms from the transcript
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a clinical assistant extracting symptoms from a user's voice transcript about their menstrual cycle, mood, and health.
      
Extract symptoms and map them to the DRSP (Daily Record of Severity of Problems) scale with severity 1-6 (1=none, 6=severe).

Transcript: "${audioTranscript}"

Return a JSON object with this exact structure:
{
  "emotional_symptoms": [
    {"name": "symptom name", "severity": 1-6}
  ],
  "physical_symptoms": [
    {"name": "symptom name", "severity": 1-6}
  ],
  "journal_note": "brief summary of what the user shared, or null if nothing notable"
}

Emotional symptoms can include: mood swings, irritability, anxiety, depression, feeling overwhelmed, difficulty concentrating, fatigue, appetite changes, sleep issues, etc.
Physical symptoms can include: breast tenderness, bloating, headaches, joint pain, cramping, acne, weight gain, etc.

Only include symptoms that are actually mentioned. Use severity based on intensity words (e.g., "really", "very", "bad" = higher severity).`,
      response_json_schema: {
        type: "object",
        properties: {
          emotional_symptoms: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                severity: { type: "number" }
              },
              required: ["name", "severity"]
            }
          },
          physical_symptoms: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                severity: { type: "number" }
              },
              required: ["name", "severity"]
            }
          },
          journal_note: { type: ["string", "null"] }
        },
        required: ["emotional_symptoms", "physical_symptoms", "journal_note"]
      }
    });

    // Map extracted symptoms to DailyEntry fields
    const mappedEntry = {
      date: new Date().toISOString().split('T')[0],
      journal_entry: response.journal_note || audioTranscript,
      // Map common symptoms to DRSP fields
      s_mood_swings: response.emotional_symptoms.find(s => s.name.toLowerCase().includes('mood'))?.severity || 0,
      s_irritability: response.emotional_symptoms.find(s => s.name.toLowerCase().includes('irritab'))?.severity || 0,
      s_anxiety: response.emotional_symptoms.find(s => s.name.toLowerCase().includes('anx'))?.severity || 0,
      s_depression: response.emotional_symptoms.find(s => s.name.toLowerCase().includes('depress'))?.severity || 0,
      s_overwhelmed: response.emotional_symptoms.find(s => s.name.toLowerCase().includes('overwhelm'))?.severity || 0,
      s_concentration: response.emotional_symptoms.find(s => s.name.toLowerCase().includes('concentrat'))?.severity || 0,
      s_lethargic: response.emotional_symptoms.find(s => s.name.toLowerCase().includes('fatig') || s.name.toLowerCase().includes('tired'))?.severity || 0,
      s_insomnia: response.emotional_symptoms.find(s => s.name.toLowerCase().includes('sleep') || s.name.toLowerCase().includes('insomnia'))?.severity || 0,
      s_breast_tender: response.physical_symptoms.find(s => s.name.toLowerCase().includes('breast'))?.severity || 0,
      s_bloating: response.physical_symptoms.find(s => s.name.toLowerCase().includes('bloat'))?.severity || 0,
      s_headache: response.physical_symptoms.find(s => s.name.toLowerCase().includes('headache'))?.severity || 0,
      s_pain: response.physical_symptoms.find(s => s.name.toLowerCase().includes('pain') || s.name.toLowerCase().includes('cramp'))?.severity || 0,
      s_acne: response.physical_symptoms.find(s => s.name.toLowerCase().includes('acne') || s.name.toLowerCase().includes('skin'))?.severity || 0,
    };

    return Response.json({
      success: true,
      extractedSymptoms: response,
      mappedEntry
    });
  } catch (error) {
    console.error('Voice to symptoms error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});