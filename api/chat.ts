import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { message, history, context, fileAttachment } = await req.json();
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // 1. IMAGE GENERATION / EDITING
    // Check for image generation intent or if we are editing an image
    const isImageRequest = /diagram|infograph|visualize|draw|image|picture|photo/i.test(message);

    if (isImageRequest && !fileAttachment) {
      // Use Nano Banana Pro (gemini-3-pro-image-preview) for high quality generation
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [
            { text: `Create a technical infographic or diagram for the following codebase context. Request: ${message}` },
            { text: `CONTEXT: ${context.substring(0, 5000)}` } // Limit context for image gen prompting
          ]
        },
        config: {
            imageConfig: {
                aspectRatio: "16:9",
                imageSize: "2K"
            }
        }
      });
      
      let imageUrl = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        }
      }

      if (imageUrl) {
        return Response.json({ 
            response: "Here is the visual representation you requested:", 
            image: imageUrl 
        });
      }
    }

    // 2. TEXT / CODE EDITING WITH THINKING
    // Default to Thinking model for code tasks
    const systemInstruction = `ROLE:
You are "LegacyLens AI", a technical expert specializing in legacy code analysis. 
You are currently chatting with a developer who has uploaded a codebase for analysis.
Your goal is to help them understand the dependency graph, identify risks, and explain the code provided in the context.

TONE:
Technical, concise, "brutalist" (matching the app's aesthetic). 
Avoid fluff. Use Markdown for code snippets.

CAPABILITIES:
- If asked to fix code, refactor, or solve a bug, you MUST provide the solution in a Markdown code block using 'diff' syntax.
  Example:
  \`\`\`diff
  - old_insecure_code();
  + new_secure_code();
  \`\`\`
- If asked about critical failures, use your deep reasoning to trace the error.

CONTEXT:
The user has provided the following codebase context (concatenated source files):
--- BEGIN CONTEXT ---
${context}
--- END CONTEXT ---
`;

    const recentHistory = history.slice(-10).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const contents = [
      ...recentHistory,
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ];

    // If file attachment exists (image edit), use Flash Image 2.5
    if (fileAttachment) {
        const editResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { mimeType: fileAttachment.mimeType, data: fileAttachment.data } },
                    { text: message }
                ]
            }
        });
         return Response.json({ response: editResponse.text });
    }

    // Use Gemini 3 Pro with Thinking for deep code tasks
    const response = await ai.models.generateContentStream({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: { thinkingBudget: 32768 } // Enable thinking for complex queries
      },
      contents: contents
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of response) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        } catch (error) {
          console.error("Stream processing error:", error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return Response.json({ error: error.message || 'Failed to generate response' }, { status: 500 });
  }
}