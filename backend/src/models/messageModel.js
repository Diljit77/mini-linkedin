import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  content: {
    type: String,
    trim: true
  },
  mediaUrl: {
    type: String
  },
  mediaType: {
    type: String,
    enum: ["image", "video", "audio", "gif", null]
  },

  isPostShare: {
    type: Boolean,
    default: false
  },
  sharedPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post"
  },
  messageType: {
    type: String,
    enum: ["text", "media", "post_share", "system"],
    default: "text"
  },

  encryptedContent: String,
  iv: String,
  authTag: String,

  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, { timestamps: true });
export default mongoose.model("Message", messageSchema);

