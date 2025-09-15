
import Notification from "../models/Notificationmodel.js";
import Post from "../models/Postmodel.js";
import Comment from "../models/commentmodel.js";
import { createNotification } from "../utils/Notification.js";


export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentCommentId } = req.body;
    const userId = req.user._id;


    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const commentData = {
      content,
      author: userId,
      post: postId,
    };

    let parentComment = null;


    if (parentCommentId) {
      parentComment = await Comment.findById(parentCommentId); // Assign to the declared variable
      if (!parentComment) {
        return res.status(404).json({ error: "Parent comment not found" });
      }
      commentData.parentComment = parentCommentId;
    }

    const comment = await Comment.create(commentData);

 
if (!parentCommentId) {
  await Post.findByIdAndUpdate(
    postId,
    { $push: { comments: comment._id } }
  );
}


    if (parentCommentId) {
      await Comment.findByIdAndUpdate(
        parentCommentId,
        { $push: { replies: comment._id } }
      );
    }


    await comment.populate("author", "name profilePic username");

if (post.author.toString() !== userId.toString()) {
  await createNotification({
    recipient: post.author,
    sender: userId,
    type: parentCommentId ? 'reply' : 'comment',
    post: postId,
    comment: comment._id,
    message: parentCommentId 
      ? `${req.user.name} replied to your comment` 
      : `${req.user.name} commented on your post`
  });
}

if (parentCommentId && parentComment && parentComment.author.toString() !== userId.toString()) {
  await createNotification({
    recipient: parentComment.author,
    sender: userId,
    type: 'reply',
    post: postId,
    comment: comment._id,
    message: `${req.user.name} replied to your comment`
  });
}

    res.status(201).json({ 
      success: true, 
      message: "Comment added successfully", 
      comment 
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
};


export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 10, parentOnly = false } = req.query;

    const skip = (page - 1) * limit;
    
    let query = { post: postId };

    if (parentOnly === 'true') {
      query.parentComment = null;
    }

    const comments = await Comment.find(query)
      .populate("author", "name profilePic username")
      .populate({
        path: "replies",
        populate: {
          path: "author",
          select: "name profilePic username"
        },
        options: { sort: { createdAt: 1 } }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalComments = await Comment.countDocuments(query);

    res.status(200).json({
      success: true,
      comments,
      totalPages: Math.ceil(totalComments / limit),
      currentPage: parseInt(page),
      totalComments
    });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};


export const toggleLikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const hasLiked = comment.likes.includes(userId);
    let update;

    if (hasLiked) {
      update = { $pull: { likes: userId } };
    } else {
      update = { $addToSet: { likes: userId } };
 
      if (comment.author.toString() !== userId.toString()) {
        await Notification.create({
          recipient: comment.author,
          sender: userId,
          type: 'like',
          comment: commentId,
          post: comment.post,
          message: `${req.user.name} liked your comment`
        });
      }
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      update,
      { new: true }
    ).populate("author", "name profilePic username");

    res.status(200).json({
      success: true,
      message: hasLiked ? "Comment unliked" : "Comment liked",
      comment: updatedComment,
      hasLiked: !hasLiked
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({ error: "Failed to toggle like" });
  }
};

// Update a comment
export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.author.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { 
        content,
        isEdited: true 
      },
      { new: true }
    ).populate("author", "name profilePic username");

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comment: updatedComment
    });
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({ error: "Failed to update comment" });
  }
};


export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.author.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

if (!comment.parentComment) {
  await Post.findByIdAndUpdate(
    comment.post,
    { $pull: { comments: commentId } }
  );
}

    if (comment.replies.length > 0) {
      await Comment.deleteMany({ _id: { $in: comment.replies } });
    }

    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(
        comment.parentComment,
        { $pull: { replies: commentId } }
      );
    }

    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully"
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
};


export const getCommentLikes = async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const comment = await Comment.findById(commentId)
      .populate("likes", "name profilePic username")
      .select("likes");

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.status(200).json({
      success: true,
      likes: comment.likes
    });
  } catch (error) {
    console.error("Get comment likes error:", error);
    res.status(500).json({ error: "Failed to fetch comment likes" });
  }
};

