import mongoose from "mongoose";

const emailSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  gmailId: String,
  subject: String,
  from: String,
  body: String,
  date: Date,

  summary: String,

  embedding: [Number]
});

export default mongoose.model("Email", emailSchema);
