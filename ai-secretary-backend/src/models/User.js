import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  googleId: String,
  email: String,
  name: String,
  accessToken: String,
  refreshToken: String,
  historyId: String, 
});

export default mongoose.model("User", userSchema);
