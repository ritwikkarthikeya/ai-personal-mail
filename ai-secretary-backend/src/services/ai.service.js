import fetch from "node-fetch";

const OLLAMA_URL = "http://localhost:11434/api/generate";
const MODEL = "mistral";

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    // Try to extract JSON object from text
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("No JSON found in LLM response");
    }

    const jsonString = text.slice(firstBrace, lastBrace + 1);
    return JSON.parse(jsonString);
  }
}

export const aiService = {
  async analyzeEmail(emailText) {
    const prompt = `
You are an intelligent email assistant.

Return ONLY valid JSON in the following format:
{
  "summary": "short summary",
  "importance": "low | medium | high",
  "tasks": [
    { "title": "task description", "due_date": null }
  ]
}

Rules:
- Be concise
- If no tasks, return empty array
- Do NOT include explanations

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
          temperature: 0.2,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Ollama request failed");
    }

    const data = await response.json();
    return safeJsonParse(data.response);
  },
};
