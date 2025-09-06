// models/commentModel.js
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null
    },
    replies: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }],
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    isEdited: {
      type: Boolean,
      default: false
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

commentSchema.virtual('replyCount').get(function() {
  return this.replies.length;
});

commentSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parentComment: 1 });

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
