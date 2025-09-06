import { DeleteIcon, EditIcon, X, Heart, MessageCircle, MoreHorizontal, Send, Reply, Edit, Trash, Share,   
 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useThemeStore } from "../store/useThemeStore";
import toast from "react-hot-toast";
import { deletepost, toggleLike, getComments, addComment, toggleLikeComment, updateComment, deleteComment, sharePost, connectedUsers } from "../utils/api";
import { useEffect,useState } from "react";
import { FiShare, FiX, FiMessageCircle, FiSend, FiMail } from "react-icons/fi";
import { FaWhatsapp, FaLinkedin, FaFacebook, FaTwitter, FaTelegram, FaEnvelope } from "react-icons/fa";


function timeAgo(dateString) {
  const now = new Date();
  const past = new Date(dateString);
  const seconds = Math.floor((now - past) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, value] of Object.entries(intervals)) {
    const count = Math.floor(seconds / value);
    if (count >= 1) {
      return `${count} ${unit}${count > 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
}


function ShareModal({ isOpen, onClose, post, currentUserData }) {
  const [selectedConnections, setSelectedConnections] = useState([]);
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);

  useEffect(() => {
    const fetchConnections = async () => {
      if (isOpen) {
        setIsLoadingConnections(true);
        try {
          const connectedUsersData = await connectedUsers();
          setConnections(connectedUsersData);
          console.log("Connections loaded:", connectedUsersData);
        } catch (error) {
          console.error("Error loading connections:", error);
          toast.error("Failed to load connections");
        } finally {
          setIsLoadingConnections(false);
        }
      }
    };

    fetchConnections();
  }, [isOpen, post]);

  const handleShareToConnections = async () => {
    if (selectedConnections.length === 0) return;

    setIsLoading(true);
    try {
      await sharePost(post._id, selectedConnections);
      toast.success("Post shared with selected connections");
      onClose();
    } catch (error) {
      console.error("Error sharing post:", error);
      toast.error("Failed to share post");
    } finally {
      setIsLoading(false);
    }
  };

  const shareUrl = `${window.location.origin}/?highlightPost=${post._id}`;

  const encodedShareUrl = encodeURIComponent(shareUrl);
  const encodedShareText = encodeURIComponent(
    `Check out this post by ${post.author.name}: ${post.content.substring(0, 100)}...`
  );

  const socialShareLinks = {
    whatsapp: `https://wa.me/?text=${encodedShareText}%0A%0A${encodedShareUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedShareUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}&quote=${encodedShareText}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedShareText}&url=${encodedShareUrl}`,
    telegram: `https://t.me/share/url?url=${encodedShareUrl}&text=${encodedShareText}`,
    email: `mailto:?subject=${encodeURIComponent(
      `Post by ${post.author.name}`
    )}&body=${encodeURIComponent(
      `Check out this post:\n\n${post.content.substring(
        0,
        150
      )}... :  \n\n${shareUrl}`
    )}`,
  };

  const copyToClipboard = async () => {
    try {
      const textToCopy = `Check out this post by ${
        post.author.name
      }: ${post.content.substring(0, 100)}...\n\n${shareUrl}`;
      await navigator.clipboard.writeText(textToCopy);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-base-100 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-base-300 flex justify-between items-center">
          <h3 className="font-semibold text-lg">Share Post</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <FiX size={20} />
          </button>
        </div>

        <div className="p-4">
    
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Share with Connections</h4>
            <div className="max-h-40 overflow-y-auto border border-base-300 rounded-lg p-2">
              {isLoadingConnections ? (
                <div className="text-center py-4">
                  <span className="loading loading-spinner loading-sm"></span>
                  <span className="ml-2">Loading connections...</span>
                </div>
              ) : connections.length > 0 ? (
                connections.map((connection) => (
                  <label
                    key={connection._id}
                    className="flex items-center gap-3 p-2 hover:bg-base-200 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedConnections.includes(connection._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedConnections((prev) => [
                            ...prev,
                            connection._id,
                          ]);
                        } else {
                          setSelectedConnections((prev) =>
                            prev.filter((id) => id !== connection._id)
                          );
                        }
                      }}
                      className="checkbox checkbox-sm"
                    />
                    <div className="avatar">
                      <div className="w-8 h-8 rounded-full">
                        <img
                          src={connection.profilePic}
                          alt={connection.name}
                        />
                      </div>
                    </div>
                    <span className="text-sm">{connection.name}</span>
                  </label>
                ))
              ) : (
                <p className="text-base-content/60 text-center py-4">
                  No connections found
                </p>
              )}
            </div>
            <button
              onClick={handleShareToConnections}
              disabled={selectedConnections.length === 0 || isLoading}
              className="btn btn-primary btn-sm w-full mt-3"
            >
              {isLoading
                ? "Sharing..."
                : `Share with ${selectedConnections.length} connection(s)`}
            </button>
          </div>

          {/* Social share */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Share via</h4>
            <div className="grid grid-cols-3 gap-3">
              <a
                href={socialShareLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm flex flex-col items-center gap-2 p-3"
                onClick={onClose}
              >
                <FaWhatsapp size={20} className="text-green-500" />
                <span className="text-xs">WhatsApp</span>
              </a>

              <a
                href={socialShareLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm flex flex-col items-center gap-2 p-3"
                onClick={onClose}
              >
                <FaLinkedin size={20} className="text-blue-600" />
                <span className="text-xs">LinkedIn</span>
              </a>

              <a
                href={socialShareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm flex flex-col items-center gap-2 p-3"
                onClick={onClose}
              >
                <FaFacebook size={20} className="text-blue-600" />
                <span className="text-xs">Facebook</span>
              </a>

              <a
                href={socialShareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm flex flex-col items-center gap-2 p-3"
                onClick={onClose}
              >
                <FaTwitter size={20} className="text-sky-400" />
                <span className="text-xs">Twitter</span>
              </a>

              <a
                href={socialShareLinks.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm flex flex-col items-center gap-2 p-3"
                onClick={onClose}
              >
                <FaTelegram size={20} className="text-sky-500" />
                <span className="text-xs">Telegram</span>
              </a>

              <a
                href={socialShareLinks.email}
                className="btn btn-outline btn-sm flex flex-col items-center gap-2 p-3"
                onClick={onClose}
              >
                <FaEnvelope size={20} className="text-gray-600" />
                <span className="text-xs">Email</span>
              </a>
            </div>
          </div>

          {/* Copy link */}
          <div>
            <h4 className="font-semibold mb-3">Copy Link</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="input input-bordered flex-1 input-sm"
              />
              <button onClick={copyToClipboard} className="btn btn-primary btn-sm">
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function Comment({ comment, postId, currentUserData, onCommentUpdate, onReply, depth = 0 }) {
  const [isLiked, setIsLiked] = useState(comment.isLiked || false);
  const [likes, setLikes] = useState(comment.likeCount || 0);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showReplies, setShowReplies] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [replies, setReplies] = useState(comment.replies || []);
  const [replyCount, setReplyCount] = useState(comment.replyCount || 0);

  const handleLike = async () => {
    try {
      await toggleLikeComment(comment._id);
      if (isLiked) {
        setLikes(prev => prev - 1);
      } else {
        setLikes(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleEdit = async () => {
    try {
      const updatedComment = await updateComment(comment._id, editContent);
      onCommentUpdate(updatedComment.comment);
      setIsEditing(false);
      toast.success("Comment updated successfully");
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    
    try {
      await deleteComment(comment._id);
      onCommentUpdate(null, comment._id);
      toast.success("Comment deleted successfully");
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    
    try {
      const response = await addComment(postId, replyContent, comment._id);
      const newReply = response.comment;
      
      // Update local state
      setReplies(prev => [newReply, ...prev]);
      setReplyCount(prev => prev + 1);
      setReplyContent("");
      setIsReplying(false);
      setShowReplies(true);
      
      // Notify parent component
      if (onReply) {
        onReply(newReply);
      }
      
      toast.success("Reply posted successfully");
    } catch (error) {
      console.error("Error posting reply:", error);
    }
  };

  const handleReplyUpdate = (updatedReply, deletedReplyId) => {
    if (deletedReplyId) {
      setReplies(prev => prev.filter(reply => reply._id !== deletedReplyId));
      setReplyCount(prev => prev - 1);
    } else if (updatedReply) {
      setReplies(prev => prev.map(reply => 
        reply._id === updatedReply._id ? updatedReply : reply
      ));
    }
  };

  const isAuthor = currentUserData && currentUserData._id === comment.author._id;
  const isTopLevel = depth === 0;

  return (
    <div className={`flex gap-3 py-3 ${isTopLevel ? 'border-b border-base-300 last:border-b-0' : ''}`}>
      <div className="avatar">
        <div className="w-8 h-8 rounded-full">
          <img src={comment.author.profilePic} alt={comment.author.name} />
        </div>
      </div>
      
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold text-sm">{comment.author.name}</h4>
            <p className="text-xs text-base-content/60">
              {timeAgo(comment.createdAt)}
              {comment.isEdited && " • Edited"}
            </p>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="btn btn-ghost btn-xs"
            >
              <MoreHorizontal size={14} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-6 bg-base-100 rounded-lg shadow-lg border border-base-300 p-2 z-10">
                {isAuthor && (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setIsMenuOpen(false);
                      }}
                      className="btn btn-ghost btn-xs w-full justify-start"
                    >
                      <Edit size={12} className="mr-1" /> Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="btn btn-ghost btn-xs w-full justify-start text-error"
                    >
                      <Trash size={12} className="mr-1" /> Delete
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setIsReplying(true);
                    setIsMenuOpen(false);
                  }}
                  className="btn btn-ghost btn-xs w-full justify-start"
                >
                  <Reply size={12} className="mr-1" /> Reply
                </button>
              </div>
            )}
          </div>
        </div>
        
        {isEditing ? (
          <div className="mt-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="textarea textarea-bordered w-full textarea-sm"
              rows="2"
            />
            <div className="flex gap-2 mt-2">
              <button onClick={handleEdit} className="btn btn-primary btn-xs">
                Save
              </button>
              <button 
                onClick={() => setIsEditing(false)} 
                className="btn btn-ghost btn-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-base-content/80 mt-1 text-sm">{comment.content}</p>
        )}
        
        <div className="flex items-center gap-3 mt-1 text-xs">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 ${isLiked ? "text-error" : "text-base-content/70"}`}
          >
            <Heart size={14} className={isLiked ? "fill-current" : ""} />
            <span>{likes}</span>
          </button>
          
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="flex items-center gap-1 text-base-content/70"
          >
            <Reply size={14} />
            <span>Reply</span>
          </button>
          
          {replyCount > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-primary"
            >
              {showReplies ? "Hide replies" : `View ${replyCount} replies`}
            </button>
          )}
        </div>

        
        {isReplying && (
          <div className="mt-3">
            <div className="flex gap-2">
              <div className="avatar">
                <div className="w-6 h-6 rounded-full">
                  <img 
                    src={currentUserData?.profilePic || "/default-avatar.png"} 
                    alt={currentUserData?.name || "User"} 
                  />
                </div>
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="input input-bordered flex-1 input-xs"
                  onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                />
                <button
                  onClick={handleReply}
                  disabled={!replyContent.trim()}
                  className="btn btn-primary btn-xs"
                >
                  <Send size={12} />
                </button>
              </div>
            </div>
          </div>
        )}


        {showReplies && replies.length > 0 && (
          <div className="mt-3 pl-4 border-l-2 border-base-300">
            {replies.map((reply) => (
              <Comment
                key={reply._id}
                comment={reply}
                postId={postId}
                currentUserData={currentUserData}
                onCommentUpdate={handleReplyUpdate}
                onReply={(newReply) => {
                  setReplies(prev => [newReply, ...prev]);
                  setReplyCount(prev => prev + 1);
                }}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PostCard({ post, onCommentCountChange, isHighlighted = false }) {
  const location = useLocation();
  const isProfilePage = location.pathname === "/profile";
  const navigate = useNavigate();
  const { theme } = useThemeStore();

  const [selectedImage, setSelectedImage] = useState(null);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likes, setLikes] = useState(post.likeCount || 0);
  const [commentCount, setCommentCount] = useState(post.commentsCount || post.comments?.length || 0);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [commentsPage, setCommentsPage] = useState(1);
  const [showShareModal, setShowShareModal] = useState(false);

  // Load current user data
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const user = await currentUser();
        setCurrentUserData(user);
      } catch (error) {
        console.error("Error loading current user:", error);
      }
    };
    loadCurrentUser();
  }, []);

  function handleedit(postId) {
    navigate(`/post/${postId}`);
  }

  async function handleDelete(postId) {
    try {
      await deletepost(postId);
      toast.success("Post deleted successfully");
      navigate("/");
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  }

  async function handleLike() {
    try {
      await toggleLike(post._id); 
      if (isLiked) {
        setLikes((prev) => prev - 1);
      } else {
        setLikes((prev) => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (err) {
      toast.error("Failed to update like");
      console.error(err);
    }
  }

  const loadComments = async (pageNum = 1) => {
    if (!post?._id) return;
    
    try {
      setIsLoadingComments(true);
      const response = await getComments(post._id, pageNum, 5, true);
      if (pageNum === 1) {
        setComments(response.comments);
      } else {
        setComments(prev => [...prev, ...response.comments]);
      }
      setHasMoreComments(pageNum < response.totalPages);
      setCommentsPage(pageNum);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUserData) return;

    try {
      const response = await addComment(post._id, newComment);
      setComments(prev => [response.comment, ...prev]);
      setNewComment("");
      const newCount = commentCount + 1;
      setCommentCount(newCount);
      if (onCommentCountChange) {
        onCommentCountChange(post._id, newCount);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleCommentUpdate = (updatedComment, deletedCommentId) => {
    if (deletedCommentId) {
      setComments(prev => prev.filter(comment => comment._id !== deletedCommentId));
      const newCount = commentCount - 1;
      setCommentCount(newCount);
      if (onCommentCountChange) {
        onCommentCountChange(post._id, newCount);
      }
    } else if (updatedComment) {
      setComments(prev => prev.map(comment => 
        comment._id === updatedComment._id ? updatedComment : comment
      ));
    }
  };

  const handleReply = (newReply) => {

    setComments(prev => prev.map(comment => {
      if (comment._id === newReply.parentComment) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply],
          replyCount: (comment.replyCount || 0) + 1
        };
      }
      return comment;
    }));
  };

  const toggleComments = () => {
    if (!showComments && comments.length === 0) {
      loadComments(1);
    }
    setShowComments(!showComments);
  };

  const isAuthor = currentUserData && post.author._id === currentUserData._id;

  return (
    <div
      className="relative card bg-base-100 shadow-md hover:shadow-xl border border-base-200 rounded-lg overflow-hidden"
      data-theme={theme}
    >

      {!isProfilePage && (
        <div className="absolute top-3 right-3 z-10">
          {post.visibility === "public" && (
            <div className="badge badge-success gap-1 text-xs">🌐 Public</div>
          )}
          {post.visibility === "connections" && (
            <div className="badge badge-info gap-1 text-xs">
              👥 Connections Only
            </div>
          )}
        </div>
      )}

      <div className="card-body space-y-3">
     
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4">
            <div className="avatar">
              <div className="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img src={post.author.profilePic} alt={post.author.name} />
              </div>
            </div>

            <div>
              <Link to={`/otherprofile/${post.author._id}`}>
                <h2 className="font-semibold text-base">{post.author.name}</h2>
              </Link>
              <p className="text-sm text-base-content opacity-60">
                {timeAgo(post.createdAt)}
                {post.isEdited && " • Edited"}
              </p>
            </div>
          </div>

          {isAuthor && (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <MoreHorizontal size={16} />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-8 bg-base-100 rounded-lg shadow-lg border border-base-300 p-2 z-10">
                  <button
                    onClick={() => handleedit(post._id)}
                    className="btn btn-ghost btn-sm w-full justify-start"
                  >
                    <EditIcon size={14} className="mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="btn btn-ghost btn-sm w-full justify-start text-error"
                  >
                    <DeleteIcon size={14} className="mr-1" /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>


     
        <div className="text-base-content text-sm leading-relaxed whitespace-pre-line">
          {post.content}
        </div>

    
        {post.image && post.image.length > 0 && (
          <div
            className={`grid gap-2 ${
              post.image.length === 1
                ? "grid-cols-1"
                : post.image.length === 2
                ? "grid-cols-2"
                : "grid-cols-2 md:grid-cols-3"
            }`}
          >
            {post.image.map((imgUrl, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-lg cursor-pointer"
                onClick={() => setSelectedImage(imgUrl)}
              >
                <img
                  src={imgUrl}
                  alt={`Post image ${idx + 1}`}
                  className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        )}

        {post.video && (
          <div className="overflow-hidden rounded-lg">
            <video
              controls
              className="w-full h-auto max-h-96 object-contain rounded-lg"
            >
              <source src={post.video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}


        <div className="flex items-center gap-4 text-sm text-base-content/60 pt-2 border-t border-base-300">
          <span>{likes} likes</span>
          <span>{commentCount} comments</span>
          {post.shares > 0 && <span>{post.shares} shares</span>}
        </div>


        <div className="flex items-center pt-3 border-t border-base-300">
 
          <button
            onClick={handleLike}
            className={`flex items-center cursor-pointer gap-2 px-3 py-1 rounded-lg transition flex-1 justify-center ${
              isLiked ? "text-error" : "text-base-content hover:bg-base-200"
            }`}
          >
            <Heart size={20} className={isLiked ? "fill-current" : ""} />
            <span className="text-sm">Like</span>
          </button>


          <button
            onClick={toggleComments}
            className="flex items-center cursor-pointer gap-2 px-3 py-1 rounded-lg transition text-base-content hover:bg-base-200 flex-1 justify-center"
          >
            <MessageCircle size={20} />
            <span className="text-sm">Comment</span>
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center cursor-pointer gap-2 px-3 py-1 rounded-lg transition text-base-content hover:bg-base-200 flex-1 justify-center"
          >
            <Share size={20} />
            <span className="text-sm">Share</span>
          </button>
        </div>

        {showComments && (
          <div className="pt-3 border-t border-base-300">

            <div className="flex gap-2 mb-4">
              <div className="avatar">
                <div className="w-8 h-8 rounded-full">
                  <img 
                    src={currentUserData?.profilePic || "/default-avatar.png"} 
                    alt={currentUserData?.name || "User"} 
                  />
                </div>
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="input input-bordered flex-1 input-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="btn btn-primary btn-sm"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>

           {isHighlighted && (
        <div className="absolute top-3 left-3 z-10">
          <div className="badge badge-primary gap-1 text-xs">
            <Share size={12} /> Shared with you
          </div>
        </div>
      )}

            <div className="space-y-1">
              {comments.length === 0 && !isLoadingComments ? (
                <div className="text-center text-base-content/60 py-4">
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                comments.map(comment => (
                  <Comment
                    key={comment._id}
                    comment={comment}
                    postId={post._id}
                    currentUserData={currentUserData}
                    onCommentUpdate={handleCommentUpdate}
                    onReply={handleReply}
                  />
                ))
              )}
            </div>

            {/* Load More Comments Button */}
            {hasMoreComments && (
              <div className="text-center mt-3">
                <button
                  onClick={() => loadComments(commentsPage + 1)}
                  disabled={isLoadingComments}
                  className="btn btn-primary btn-sm"
                >
                  {isLoadingComments ? "Loading..." : "Load More Comments"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="relative max-w-3xl w-full p-4">
            {/* Close button */}
            <button
              className="btn btn-circle btn-sm absolute top-4 right-4 bg-base-100 hover:bg-base-200"
              onClick={() => setSelectedImage(null)}
            >
              <X size={20} className="text-base-content" />
            </button>

            {/* Image */}
            <img
              src={selectedImage}
              alt="Preview"
              className="w-full max-h-[90vh] object-contain rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        post={post}
        currentUserData={currentUserData}
      />
    </div>
  );
}

export default PostCard;