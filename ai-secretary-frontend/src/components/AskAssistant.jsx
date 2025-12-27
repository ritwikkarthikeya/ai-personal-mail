import { useState } from "react";
import { askAssistant } from "../api/ask";

export default function AskAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await askAssistant(input);

      const aiMessage = {
        role: "assistant",
        content: response || "No answer available.",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "❌ Failed to get response." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            Ask anything about your emails 👇
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={
              msg.role === "user"
                ? "chat-bubble user"
                : "chat-bubble assistant"
            }
          >
            {msg.content}
          </div>
        ))}

        {loading && (
          <div className="chat-bubble assistant">Thinking…</div>
        )}
      </div>

      <div className="chat-input-bar">
        <input
          type="text"
          placeholder="Ask about your emails…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
        />
        <button onClick={handleAsk}>Send</button>
      </div>
    </div>
  );
}
