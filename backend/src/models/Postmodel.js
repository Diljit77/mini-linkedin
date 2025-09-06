
import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image:[ {
      type: String,
      default: null
    }
  ],
    video: {
      type: String,
      default: null
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    comments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }],
    shares: {
      type: Number,
      default: 0
    },
    isEdited: {
      type: Boolean,
      default: false
    },
        shares: {
      type: Number,
      default: 0
    },

  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

postSchema.index({ author: 1 });
postSchema.index({ createdAt: -1 });

const Post = mongoose.model("Post", postSchema);
export default Post;
