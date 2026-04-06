import mongoose from "mongoose";

const meetingDetailsSchema = new mongoose.Schema(
  {
    title: String,
    date: String,
    time: String,
    duration: String,
    location: String,
    attendees: [String],
  },
  { _id: false }
);

const emailSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  gmailId: String,
  subject: String,
  from: String,
  body: String,
  date: Date,

  summary: String,
  embedding: [Number],

  // Priority fields
  priority: {
    type: String,
    enum: ["high", "medium", "low"],
    default: "medium",
  },
  actionRequired: { type: Boolean, default: false },
  priorityReason: String,

  // Calendar fields
  hasMeeting: { type: Boolean, default: false },
  meetingDetails: meetingDetailsSchema,
  calendarEventId: String,
  calendarEventAdded: { type: Boolean, default: false },
});

export default mongoose.model("Email", emailSchema);
