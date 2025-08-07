import Post from "../models/Postmodel.js";
import User from "../models/UserModel.js";


// Create a new post
export const createPost = async (req, res) => {
  const { content, visibility } = req.body;
  const userId = req.user._id;

  try {
    const post = await Post.create({
      content,
      visibility,
      author: userId,
    });

    res.status(201).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyPosts = async (req, res) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const userId = req.user._id;

  try {
    const posts = await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .populate("author", "name profilePic")
      .lean();
console.log(`Posts fetched for user ${userId}:`, posts);
    return res.status(200).json({ success: true, posts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


// Get posts visible to the user (public + connections)
export const getFeedPosts = async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    const posts = await Post.find({
      $or: [
        { visibility: "public" },
        { author: { $in: user.connections } },
        { author: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .populate("author", "name profilePic");

    res.status(200).json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    
    const postId = req.params.id;
    const post = await Post.findById(postId).populate("author", "name profilePic");
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
   return res.status(200).json({ success: true, post });
  } catch (error) {
    
  }

}
// Edit a post
export const editPost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user._id;
  const { content, visibility } = req.body;

  try {
    const post = await Post.findById(postId);

    if (!post || post.author.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    post.content = content || post.content;
    post.visibility = visibility || post.visibility;

    await post.save();
    res.status(200).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a post
export const deletePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user._id;

  try {
    const post = await Post.findById(postId);

    if (!post || post.author.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await Post.findByIdAndDelete(postId);
    res.status(200).json({ success: true, message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
