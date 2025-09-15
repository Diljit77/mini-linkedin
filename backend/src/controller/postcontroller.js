
import Like from "../models/likemodel.js";
import Post from "../models/Postmodel.js";
import User from "../models/UserModel.js";
import { uploadImageBufferToCloudinary } from "../utils/upload.js";
import Message from "../models/messageModel.js";
import Notification from "../models/Notificationmodel.js";
import { createNotification } from "../utils/Notification.js";




export const createPost = async (req, res) => {
  const { content, visibility } = req.body;
  const userId = req.user._id;

  try {
    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const imageUrl = await uploadImageBufferToCloudinary(file.buffer); // ✅ use buffer
   imageUrls.push(imageUrl.secure_url); 
      }
    }

    const post = await Post.create({
      content,
      visibility,
      author: userId,
      image: imageUrls,
    });

    res.status(201).json({ success: true, post });
  } catch (error) {
    console.error("Create Post Error:", error);
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
      .populate("author", "name profilePic")
      .lean();

    // Check likes for current user
    const postIds = posts.map((p) => p._id);
    const likes = await Like.find({ post: { $in: postIds }, user: userId }).lean();
    const likedPostIds = new Set(likes.map((l) => l.post.toString()));

    const postsWithLike = posts.map((p) => ({
      ...p,
      isLiked: likedPostIds.has(p._id.toString()), // ✅ true if user liked
    }));

    res.status(200).json({ success: true, posts: postsWithLike });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getPostById = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId)
      .populate("author", "name profilePic")
      .lean();

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Check if current user liked this post
    const existingLike = await Like.findOne({ post: postId, user: userId });
    post.isLiked = !!existingLike; // true/false

    return res.status(200).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getallPostbyUserid=async (req,res) => {
  try {
    const {id}=req.params;
    const post=await Post.find({author:id});
    if(!post){
      return res.status(404).json({message:"no post exist",success:false});

    }
    return res.status(200).json(post);
  } catch (error) {
    console.log(error);
    return res.status(500).json({message:"somthing went wrong"})
    
  }
}


export const editPost = async (req, res) => {
  const { id: postId } = req.params;
  const userId = req.user._id;
let { content, visibility, removeImages } = req.body;
  // `removeImages` is an array of URLs the user wants to delete

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // ✅ update text + visibility
    if (content !== undefined) post.content = content;
    if (visibility !== undefined) post.visibility = visibility;

    // ✅ handle image deletion
    if (removeImages && Array.isArray(removeImages)) {
      post.image = post.image.filter((imgUrl) => !removeImages.includes(imgUrl));
    }

    // ✅ handle new uploaded images
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const imageUrl = await uploadImageBufferToCloudinary(file.buffer);
        post.image.push(imageUrl); // append new images
      }
    }

    const updatedPost = await post.save();

    res.status(200).json({ success: true, post: updatedPost });
  } catch (error) {
    console.error("Edit Post Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


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




export const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id; 

    const post = await Post.findById(postId).populate("author", "_id");
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const existingLike = await Like.findOne({ post: postId, user: userId });

    if (existingLike) {
      // Unlike
      await existingLike.deleteOne();
      await Post.findByIdAndUpdate(postId, { $inc: { likeCount: -1 } });
      return res.status(200).json({ message: "Post unliked" });
    } else {
      // Like
      await Like.create({ post: postId, user: userId });
      await Post.findByIdAndUpdate(postId, { $inc: { likeCount: 1 } });

      // Send notification if the post author is not the current user
      if (post.author._id.toString() !== userId.toString()) {
        await createNotification({
          recipient: post.author._id,
          sender: userId,
          type: "like",
          post: postId,
          message: `${req.user.name} liked your post`
        });
      }
      
      return res.status(200).json({ message: "Post liked" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Failed to toggle like" });
  }
};
export const sharePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { connectionIds } = req.body;
    const userId = req.user._id;

    const post = await Post.findById(id).select('+shares').populate('author', 'name profilePic');
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.visibility === "connections" && 
        !post.author._id.equals(userId) && 
        !post.author.connections.includes(userId)) {
      return res.status(403).json({ message: "Not authorized to share this post" });
    }

    const currentUser = await User.findById(userId);
    

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { $inc: { shares: connectionIds.length } },
      { new: true, runValidators: false } 
    );

    const messages = [];
    const validConnectionIds = [];

    for (const connectionId of connectionIds) {
      if (currentUser.connections.includes(connectionId)) {
        validConnectionIds.push(connectionId);

        // Create a message for the chat
        const messageContent = `Check out this post by ${post.author.name}: ${post.content.substring(0, 100)}...`;
        const shareUrl = `${process.env.FRONTEND_URL}/?highlightPost=${post._id}`;
        
        const message = new Message({
          sender: userId,
          receiver: connectionId,
          content: `${messageContent}\n\n${shareUrl}`,
          isPostShare: true,
          sharedPost: post._id,
          messageType: 'post_share'
        });

        messages.push(message);

        // Also create notification
        const notification = new Notification({
          recipient: connectionId,
          sender: userId,
          type: 'share',
          post: post._id,
          message: `${currentUser.name} shared a post with you`
        });
        
        await notification.save();
      }
    }

    // Save all messages
    if (messages.length > 0) {
      await Message.insertMany(messages);
    }

    res.status(200).json({
      message: `Post shared with ${validConnectionIds.length} connection(s)`,
      sharesCount: updatedPost.shares,
      sharedWith: validConnectionIds
    });

  } catch (error) {
    console.error("Error sharing post:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getShareStats = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!post.author.equals(userId) && 
        post.visibility === "connections" && 
        !post.author.connections.includes(userId)) {
      return res.status(403).json({ message: "Not authorized to view this post" });
    }

    res.status(200).json({
      shares: post.shares,
      postId: post._id
    });

  } catch (error) {
    console.error("Error getting share stats:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};