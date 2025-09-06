import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    type: {
      type: String,
      enum: ['like', 'comment', 'reply', 'share', 'follow', 'mention'],
      required: true
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    },
    message: {
      type: String,
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });


const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

export default Notification;