import { ragSearch } from "./search.service.js";

export const askAssistant = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { question } = req.body;

    if (!question || question.trim() === "") {
      return res.status(400).json({
        answer: "Please ask a valid question.",
      });
    }

    const answer = await ragSearch(userId, question);

    res.json({ answer });
  } catch (err) {
    console.error("Ask assistant error:", err);
    res.status(500).json({
      answer: "Something went wrong while answering. Please try again.",
    });
  }
};
