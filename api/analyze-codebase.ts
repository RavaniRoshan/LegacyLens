import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { fullContext } = await req.json();
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemPrompt = `ROLE:
You are the "Legacy Code Archaeologist," an expert software architect specializing in reverse-engineering deprecated, undocumented, and complex codebases (COBOL, PHP 5.x, Java 6, etc.).

TASK:
You will receive a concatenated string of an entire project's source code. Your job is to:
1. Parse the code to understand the file structure and logic flow.
2. Construct a dependency graph (which files import/call which other files).
3. Calculate a "Fragility Score" (0-10) for each file/function.

FRAGILITY SCORING CRITERIA:
- High Coupling: The file is imported/called by many others.
- High Complexity: Contains nested loops, magic numbers, or deprecated syntax.
- Criticality: Handles money, auth, or core data.
- 10 = "If I touch this, the whole system explodes."

OUTPUT FORMAT:
Return ONLY raw JSON. Do not use Markdown formatting (no \`\`\`json). The JSON must match this schema:

{
  "summary": "A 2-sentence executive summary of what this application does.",
  "nodes": [
    {
      "id": "filename or function name",
      "type": "fragile" | "standard",
      "data": { 
        "label": "filename", 
        "fragilityScore": 8,
        "details": "Why is this fragile? Brief explanation." 
      },
      "position": { "x": 0, "y": 0 } 
    }
  ],
  "edges": [
    {
      "id": "e1-2",
      "source": "source_filename",
      "target": "target_filename",
      "animated": true
    }
  ]
}

NOTE ON POSITION:
Always set "position": { "x": 0, "y": 0 } for all nodes. The frontend will handle the visual layout.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: fullContext,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    let text = response.text || '{}';
    // Clean up any potential markdown code blocks if the model ignores the instruction
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return Response.json(JSON.parse(text));
    
  } catch (error: any) {
    console.error('API Analysis Error:', error);
    return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}