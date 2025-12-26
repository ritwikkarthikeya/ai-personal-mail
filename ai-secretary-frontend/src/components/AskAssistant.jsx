import { useState } from "react";
import { askAssistant } from "../api/ask";

export default function AskAssistant() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const ask = async () => {
    const res = await askAssistant(question);
    setAnswer(res.answer);
  };

  return (
    <section>
      <h3>Search Assistant</h3>
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask something..."
      />
      <button onClick={ask}>Ask</button>
      {answer && <p>{answer}</p>}
    </section>
  );
}
