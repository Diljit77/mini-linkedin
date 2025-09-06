import toast from "react-hot-toast";
import { AxiosInstance } from "./axios"; 

export const currentUser = async () => {
  try {
    const res = await AxiosInstance.get("/api/auth/me");
    return res.data;
  } catch (error) {
    console.error("Error during getting user info:", error);
    toast.error(error?.response?.data?.message || "Something went wrong");
    throw error;
  }
};

export const login = async (data) => {
  try {
    const res = await AxiosInstance.post("/api/auth/login", data);
    return res.data;
  } catch (error) {
    console.error("Error during login:", error);
    toast.error(error?.response?.data?.message || "Login failed");
    throw error;
  }
};

export const Signup = async (data) => {
  try {
    const res = await AxiosInstance.post("/api/auth/signup", data);
    return res.data;
  } catch (error) {
    console.error("Error during signup:", error);
    toast.error(error?.response?.data?.message || "Signup failed");
    throw error;
  }
};

export const onboarding = async (userId, data) => {
  try {
    const res = await AxiosInstance.put(`/api/auth/onboarding/${userId}`, data);
    return res.data;
  } catch (error) {
    console.error("Error during onboarding", error);
    toast.error(error?.response?.data?.message || "Onboarding failed");
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const res = await AxiosInstance.get(`/api/users/profile/${userId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};
export const allpostsfeed = async () => {
  try {
    const res = await AxiosInstance.get(`/api/posts/feed`);
    return res.data;
  } catch (error) {
    console.error("Error fetching feed", error);
    toast.error(error?.response?.data?.message || "Failed to fetch posts");
    throw error;
  }
};

export const mypostsfeed = async () => {
  try {
    const res = await AxiosInstance.get(`/api/posts/my-posts`);
    return res.data;
  } catch (error) {
    console.error("Error fetching my posts", error);
    toast.error(error?.response?.data?.message || "Failed to fetch posts");
    throw error;
  }
};
export const getuserpost = async (userid) => {
  try {
    const res = await AxiosInstance.get(`/api/posts/users/${userid}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching my posts", error);
    toast.error(error?.response?.data?.message || "Failed to fetch posts");
    throw error;
  }
};

export const createpost = async (formData) => {
  try {
    const res = await AxiosInstance.post(`/api/posts/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    console.error("Error creating post", error);
    toast.error(error?.response?.data?.message || "Failed to create post");
    throw error;
  }
};

export const fetchpost = async (postId) => {
  try {
    const res = await AxiosInstance.get(`/api/posts/${postId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching post", error);
    toast.error(error?.response?.data?.message || "Failed to fetch post");
    throw error;
  }
};

export const deletepost = async (postId) => {
  try {
    const res = await AxiosInstance.delete(`/api/posts/${postId}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting post:", error);
    toast.error(error?.response?.data?.message || "Failed to delete post");
    throw error;
  }
};

export const editpost = async (postId, data) => {
  try {
    const res = await AxiosInstance.put(`/api/posts/${postId}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    console.error("Error editing post:", error);
    toast.error(error?.response?.data?.message || "Failed to edit post");
    throw error;
  }
};

export const toggleLike = async (postId) => {
  try {
    const res = await AxiosInstance.post(`/api/posts/${postId}/like`);
    return res.data.data;
  } catch (error) {
    console.error("Error toggling like", error);
    toast.error(error?.response?.data?.message || "Failed to toggle like");
    throw error;
  }
};

export const Sendrequest = async (receiverId) => {
  try {
    const res = await AxiosInstance.post(`/api/connections/send`, { receiverId });
    return res.data;
  } catch (error) {
    console.error("Error sending request", error);
    toast.error(error?.response?.data?.message || "Failed to send request");
    throw error;
  }
};

export const getSentRequests = async () => {
  try {
    const res = await AxiosInstance.get("/api/connections/sent");
    return res.data.requests;
  } catch (error) {
    console.error("Error fetching sent requests", error);
    toast.error(error?.response?.data?.message || "Failed to fetch requests");
    throw error;
  }
};

export const getReceivedRequests = async () => {
  try {
    const res = await AxiosInstance.get("/api/connections/received");
    return res.data.requests;
  } catch (error) {
    console.error("Error fetching received requests", error);
    toast.error(error?.response?.data?.message || "Failed to fetch requests");
    throw error;
  }
};

export const getAcceptedConnections = async () => {
  try {
    const res = await AxiosInstance.get("/api/connections/accepted");
    return res.data.connections;
  } catch (error) {
    console.error("Error fetching accepted connections", error);
    toast.error(error?.response?.data?.message || "Failed to fetch connections");
    throw error;
  }
};

export const acceptConnectionRequest = async (requestId) => {
  try {
    const res = await AxiosInstance.put(`/api/connections/accept/${requestId}`);
    return res.data.connections;
  } catch (error) {
    console.error("Error accepting connection request:", error);
    toast.error(error?.response?.data?.message || "Failed to accept connection request");
    throw error;
  }
};

export const getSuggestedUsers = async () => {
  try {
    const res = await AxiosInstance.get("/api/users/suggested");
    return res.data.users;
  } catch (error) {
    console.error("Error fetching suggested users:", error);
    toast.error(error?.response?.data?.message || "Failed to fetch suggested users");
    throw error;
  }
};

export const connectedUsers = async () => {
  try {
    const res = await AxiosInstance.get("/api/users/connected");
    return res.data.data;
  } catch (error) {
    console.error("Error fetching connected users:", error);
    toast.error(error?.response?.data?.message || "Failed to fetch connected users");
    throw error;
  }
};

export const fetchMessages = async (receiverId) => {
  try {
    const res = await AxiosInstance.get(`/api/messages/${receiverId}`);
    return res.data.messages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    toast.error(error?.response?.data?.message || "Failed to fetch messages");
    throw error;
  }
};

export const sendMessageAPI = async (receiverId, content, media = null, mediaType = null) => {
  try {
    const formData = new FormData();
    formData.append("receiverId", receiverId);
    formData.append("content", content);
    
    if (media) {
      if (typeof media === 'string') {
        formData.append("gifUrl", media);
        formData.append("mediaType", "gif");
      } else {
        formData.append("media", media);
        formData.append("mediaType", mediaType);
      }
    }

    const res = await AxiosInstance.post(`/api/messages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data.message;
  } catch (error) {
    console.error("Error sending message:", error);
    toast.error(error?.response?.data?.message || "Failed to send message");
    throw error;
  }
};
export const deleteMessage = async (messageId) => {
  try {
    const res = await AxiosInstance.delete(`/api/messages/${messageId}`);
    return res.data;
  } catch (error) {
    console.error("Error delete message:", error);
    toast.error(error?.response?.data?.message || "Failed to delete message");
    throw error;
  }
};
export const updateMessage = async (messageId,content) => {
  try {
    const res = await AxiosInstance.put(`/api/messages/${messageId}`,{content});
    return res.data;
  } catch (error) {
    console.error("Error delete message:", error);
    toast.error(error?.response?.data?.message || "Failed to delete message");
    throw error;
  }
};

export const addComment = async (postId, content, parentCommentId = null) => {
  try {
    const res = await AxiosInstance.post(`/api/comments/post/${postId}`, {
      content,
      parentCommentId
    });
    return res.data;
  } catch (error) {
    console.error("Error adding comment:", error);
    toast.error(error?.response?.data?.message || "Failed to add comment");
    throw error;
  }
};

export const getComments = async (postId, page = 1, limit = 10, parentOnly = false) => {
  try {
    const res = await AxiosInstance.get(`/api/comments/post/${postId}`, {
      params: { page, limit, parentOnly }
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};

export const toggleLikeComment = async (commentId) => {
  try {
    const res = await AxiosInstance.post(`/api/comments/${commentId}/like`);
    return res.data;
  } catch (error) {
    console.error("Error toggling comment like:", error);
    toast.error(error?.response?.data?.message || "Failed to like comment");
    throw error;
  }
};

export const updateComment = async (commentId, content) => {
  try {
    const res = await AxiosInstance.put(`/api/comments/${commentId}`, { content });
    return res.data;
  } catch (error) {
    console.error("Error updating comment:", error);
    toast.error(error?.response?.data?.message || "Failed to update comment");
    throw error;
  }
};

export const deleteComment = async (commentId) => {
  try {
    const res = await AxiosInstance.delete(`/api/comments/${commentId}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting comment:", error);
    toast.error(error?.response?.data?.message || "Failed to delete comment");
    throw error;
  }
};

export const getCommentLikes = async (commentId) => {
  try {
    const res = await AxiosInstance.get(`/api/comments/${commentId}/likes`);
    return res.data;
  } catch (error) {
    console.error("Error fetching comment likes:", error);
    throw error;
  }
};

export const sharePost = async (postId, connectionIds) => {
  try {
    const res = await AxiosInstance.post(`/api/posts/${postId}/share`, {
      connectionIds
    });
    return res.data;
  } catch (error) {
    console.error("Error sharing post", error);
    toast.error(error?.response?.data?.message || "Failed to share post");
    throw error;
  }
};

export const getPostShareStats = async (postId) => {
  try {
    const res = await AxiosInstance.get(`/api/posts/${postId}/shares`);
    return res.data;
  } catch (error) {
    console.error("Error fetching share stats", error);
    throw error;
  }
};