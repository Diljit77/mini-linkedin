import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
       visibility: {
      type: String,
      enum: ["public", "connections"],
      default: "public",
    },
  
  
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
export default Post;
