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

    // Use LLM to extract and code symptoms from journal text
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a clinical assistant analyzing a journal entry for mental health and menstrual cycle symptoms.
      
Analyze the journal text and extract symptoms based on DRSP (Daily Record of Severity of Problems) criteria.
Assign severity scores 1-6 based on the intensity described (1=none, 2=mild, 3=moderate, 4=moderately severe, 5=severe, 6=extreme).

Journal text: "${journalText}"

Return a JSON object with this exact structure:
{
  "codedSymptoms": {
    "mood_swings": 0-6,
    "irritability": 0-6,
    "anxiety": 0-6,
    "depression": 0-6,
    "overwhelmed": 0-6,
    "concentration": 0-6,
    "lethargic": 0-6,
    "insomnia": 0-6,
    "breast_tender": 0-6,
    "bloating": 0-6,
    "headache": 0-6,
    "pain": 0-6,
    "acne": 0-6
  },
  "sentiment": "positive|neutral|negative",
  "pmdd_indicators": ["list of PMDD indicators found"],
  "summary": "brief clinical summary"
}

Only assign non-zero scores to symptoms that are actually mentioned or strongly implied. Use context clues for severity.`,
      response_json_schema: {
        type: "object",
        properties: {
          codedSymptoms: {
            type: "object",
            properties: {
              mood_swings: { type: "number" },
              irritability: { type: "number" },
              anxiety: { type: "number" },
              depression: { type: "number" },
              overwhelmed: { type: "number" },
              concentration: { type: "number" },
              lethargic: { type: "number" },
              insomnia: { type: "number" },
              breast_tender: { type: "number" },
              bloating: { type: "number" },
              headache: { type: "number" },
              pain: { type: "number" },
              acne: { type: "number" }
            }
          },
          sentiment: { type: "string" },
          pmdd_indicators: { type: "array", items: { type: "string" } },
          summary: { type: "string" }
        },
        required: ["codedSymptoms", "sentiment", "pmdd_indicators", "summary"]
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