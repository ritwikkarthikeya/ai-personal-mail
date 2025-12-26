import fetch from "node-fetch";

const OLLAMA_URL = "http://localhost:11434/api/generate";
const MODEL = "mistral";

/**
 * Tries strict JSON parse.
 * If that fails, attempts to extract JSON from text.
 * If that fails, returns null (NO THROW).
 */
function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      return null;
    }

    try {
      const jsonString = text.slice(firstBrace, lastBrace + 1);
      return JSON.parse(jsonString);
    } catch {
      return null;
    }
  }
}

export const aiService = {
  async analyzeEmail(emailText) {
    const prompt = `
You are a backend service.
You MUST return valid JSON.
Do NOT include any text before or after JSON.
Do NOT use markdown.
Do NOT explain.

If you cannot extract tasks, return an empty array.

Return EXACTLY this JSON shape:

{
  "summary": "string",
  "importance": "low | medium | high",
  "tasks": []
}

Email:
"""
${emailText}
"""
`;

    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        stream: false,
        options: {
          temperature: 0,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Ollama request failed");
    }

    const data = await response.json();

    // 🔐 Try strict + extracted JSON
    const parsed = safeJsonParse(data.response);

    if (parsed) {
      return parsed;
    }

    // 🛟 FALLBACK (CRITICAL)
    // Never let LLM failure break the pipeline
    return {
      summary: data.response.slice(0, 500), // safe truncate
      importance: "medium",
      tasks: [],
      _fallback: true,
    };
  },
};
