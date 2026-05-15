import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { journalText } = await req.json();
    
    if (!journalText || !journalText.trim()) {
      return Response.json({ error: 'No journal text provided' }, { status: 400 });
    }

    // Use LLM to extract symptoms from journal text (without severity - user will assign)
    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a clinical assistant analyzing a journal entry for mental health and menstrual cycle symptoms.
      
Analyze the journal text and identify which symptoms are present. Map them to DRSP field names.

Journal text: "${journalText}"

Return a JSON object with this structure:
{
  "symptoms": [
    {"name": "symptom name", "field": "drsp_field_name"},
    ...
  ]
}

Map to these DRSP fields:
- mood_swings, irritability, anxiety, depression, overwhelmed, concentration, lethargic, insomnia
- breast_tender, bloating, headache, pain, acne

Only include symptoms that are actually mentioned. Return empty array [] if none found.`,
      response_json_schema: {
        type: "object",
        properties: {
          symptoms: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                field: { type: "string" }
              },
              required: ["name", "field"]
            }
          }
        },
        required: ["symptoms"]
      }
    });

    // Build the response structure
    const detectedSymptoms = llmResponse.symptoms || [];

    return Response.json({
      success: true,
      detectedSymptoms: detectedSymptoms,
      sentiment: "neutral",
      pmdd_indicators: [],
      summary: "Symptoms extracted from journal entry"
    });
  } catch (error) {
    console.error('Auto-code journal error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});