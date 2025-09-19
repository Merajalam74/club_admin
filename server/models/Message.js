import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  club: { type: String, required: true },   
  sentBy: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Message", messageSchema);