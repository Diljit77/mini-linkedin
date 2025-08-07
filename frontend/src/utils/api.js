import toast from "react-hot-toast";
import { AxiosInstance } from './axios'; // Adjust the import based on your project structure

export const cuurnetUser=async () => {
    try {
const res=await AxiosInstance.get('/auth/me');
return res.data;

    
} catch (error) {
    console.error("Error during geting user info:", error);
    toast.error(error?.response?.data?.message || "something went wrong");
    throw error;
}
}
export const login=async (data) => {
try {
const res=await AxiosInstance.post('/auth/login', data);
return res.data;

    
} catch (error) {
    console.error("Error during login:", error);
    toast.error(error?.response?.data?.message || "Login failed");
    throw error;
}
}

export const Signup=async (data) => {
try {
const res=await AxiosInstance.post('/auth/signup', data);
return res.data;

    
} catch (error) {
    console.error("Error during Signup:", error);
    toast.error(error?.response?.data?.message || "Signup failed");
    throw error;
}
}
export const onboarding=async (userId,data) => {
try {
const res=await AxiosInstance.put(`/auth/onboarding/${userId}`, data);
return res.data;

    
} catch (error) {
    console.error("Error during onboading", error);
    toast.error(error?.response?.data?.message || "onboarding failed");
    throw error;
}
}
export const allpostsfeed = async () => {
  try {
    const res = await AxiosInstance.get(`/posts/feed`);
    return res.data;
  } catch (error) {
    console.error("Error fetching feed", error);
    toast.error(error?.response?.data?.message || "Failed to fetch posts");
    throw error;
  }
};
export const mypostsfeed = async () => {
  try {
    const res = await AxiosInstance.get(`/posts/my-posts`);
    return res.data;
  } catch (error) {
    console.error("Error fetching feed", error);
    toast.error(error?.response?.data?.message || "Failed to fetch posts");
    throw error;
  }
};
export const createpost=async (data) => {
      try {
    const res = await AxiosInstance.post(`/posts/`,data);
    return res.data;
  } catch (error) {
    console.error("Error fetching feed", error);
    toast.error(error?.response?.data?.message || "Failed to fetch posts");
    throw error;
  }
}
export const getSuggestedUsers = async () => {
  try {
    const res = await AxiosInstance.get('/users/suggested');
    return res.data.users;
  } catch (error) {
    console.error("Error fetching suggested users:", error);
    toast.error(error?.response?.data?.message || "Failed to fetch suggested users");
    throw error;
  }
}
export const fetchpost=async (postId) => {
      try {
    const res = await AxiosInstance.get(`/posts/${postId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching feed", error);
    toast.error(error?.response?.data?.message || "Failed to fetch posts");
    throw error;
  }
}
export const Sendrequest=async (receiverId) => {
      try {
    const res = await AxiosInstance.post(`/connections/send`,{receiverId:receiverId});
    return res.data;
  } catch (error) {
    console.error("Error fetching feed", error);
    toast.error(error?.response?.data?.message || "Failed to send request");
    throw error;
  }
}
export const getSentRequests = async () => {
try {
      const res = await AxiosInstance.get('/connections/sent');
  return res.data.requests;
} catch (error) {
        console.error("Error fetching feed", error);
    toast.error(error?.response?.data?.message || "Failed to send request");
    throw error;
}
};

export const getReceivedRequests = async () => {
 try {
     const res = await AxiosInstance.get('/connections/received');
  return res.data.requests;
 } catch (error) {
        console.error("Error fetching feed", error);
    toast.error(error?.response?.data?.message || "Failed to send request");
    throw error;
    
 }
};

export const getAcceptedConnections = async () => {
    try {
          const res = await AxiosInstance.get('/connections/accepted');
  return res.data.connections;
    } catch (error) {
            console.error("Error fetching feed", error);
    toast.error(error?.response?.data?.message || "Failed to send request");
    throw error;
        
    }

};
export const acceptConnectionRequest = async (requestId) => {
    try {
        const res = await AxiosInstance.put(`/connections/accept/${requestId}`);
  return res.data.connections;
    } catch (error) {
        console.error("Error accepting connection request:", error);
        toast.error(error?.response?.data?.message || "Failed to accept connection request");
        throw error;
    }
}
export const connectedUsers = async () => {
    try {
        const res = await AxiosInstance.get('/users/connected');
        return res.data.data;
    } catch (error) {
        console.error("Error fetching connected users:", error);
        toast.error(error?.response?.data?.message || "Failed to fetch connected users");
        throw error;
    }
}
export const deletepost=async (postId) => {
    try {
        const res = await AxiosInstance.delete(`/posts/${postId}`);
        return res.data;
    } catch (error) {
        console.error("Error deleting post:", error);
        toast.error(error?.response?.data?.message || "Failed to delete post");
        throw error;
    } 
  }

export const editpost=async (postId,data) => {
  try {
    const res = await AxiosInstance.put(`/posts/${postId}`, data);
    return res.data;
  } catch (error) {
    console.error("Error editing post:", error);
    toast.error(error?.response?.data?.message || "Failed to edit post");
    throw error;
    
  }
}