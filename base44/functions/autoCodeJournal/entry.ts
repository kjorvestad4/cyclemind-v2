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
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a clinical assistant analyzing a journal entry for mental health and menstrual cycle symptoms.
      
Analyze the journal text and identify which symptoms are present. DO NOT assign severity scores - the user will do that.

Journal text: "${journalText}"

Return a JSON object with this exact structure:
{
  "detectedSymptoms": [
    {"name": "symptom name", "field": "drsp_field_name"}
  ],
  "sentiment": "positive|neutral|negative",
  "pmdd_indicators": ["list of PMDD indicators found"],
  "summary": "brief clinical summary"
}

Detect symptoms from this list and map to DRSP fields:
- mood_swings, irritability, anxiety, depression, overwhelmed, concentration, lethargic, insomnia
- breast_tender, bloating, headache, pain, acne

Only include symptoms that are actually mentioned or strongly implied.`,
      response_json_schema: {
        type: "object",
        properties: {
          detectedSymptoms: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                field: { type: "string" }
              },
              required: ["name", "field"]
            }
          },
          sentiment: { type: "string" },
          pmdd_indicators: { type: "array", items: { type: "string" } },
          summary: { type: "string" }
        },
        required: ["detectedSymptoms", "sentiment", "pmdd_indicators", "summary"]
      }
    });

    return Response.json({
      success: true,
      codedSymptoms: response.codedSymptoms,
      sentiment: response.sentiment,
      pmddIndicators: response.pmdd_indicators,
      summary: response.summary
    });
  } catch (error) {
    console.error('Auto-code journal error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});