import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  currentUser, 
  getuserpost, 
  getUserProfile, 
  Sendrequest, 
  getAcceptedConnections,
  getSentRequests,
  acceptConnectionRequest,
  getReceivedRequests
} from "../utils/api";
import { 
  MapPin, 
  Calendar, 
  Mail, 
  Link as LinkIcon, 
  ArrowLeft, 
  RefreshCw, 
  UserX, 
  MessageSquare, 
  UserCheck, 
  UserPlus,
  Check,
  X
} from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";

import toast from "react-hot-toast";
import { useAuthStore } from "../store/userAuthStore";

const OtherUserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [posts, setPosts] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});
  const [connectionStatus, setConnectionStatus] = useState("not_connected"); 
  const [receivedRequestId, setReceivedRequestId] = useState(null);
  const { theme } = useThemeStore();
  const { user: authUser } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [user, profile, post, connections, sentRequests, receivedRequests] = await Promise.all([
          currentUser(),
          getUserProfile(id),
          getuserpost(id),
          getAcceptedConnections(),
          getSentRequests(),
          getReceivedRequests ? getReceivedRequests() : Promise.resolve([])
        ]);

        setCurrentUserData(user);
        setPosts(post);

        if (profile && (profile._id || profile.id)) {
          setProfileUser(profile);
        
          const isConnected = connections.some(
            conn => conn._id === profile._id || conn.id === profile._id || 
                   conn._id === profile.id || conn.id === profile.id
          );
          
          if (isConnected) {
            setConnectionStatus("connected");
          } else {
       
            const hasSentRequest = sentRequests.some(
              req => req.receiverId === profile._id || req.receiverId === profile.id || 
                     req.receiver._id === profile._id || req.receiver._id === profile.id
            );
            
            if (hasSentRequest) {
              setConnectionStatus("pending");
            } else {
          
              if (receivedRequests && receivedRequests.length > 0) {
                const receivedRequest = receivedRequests.find(
                  req => req.senderId === profile._id || req.senderId === profile.id || 
                         req.sender._id === profile._id || req.sender._id === profile.id
                );
                
                if (receivedRequest) {
                  setConnectionStatus("received_request");
                  setReceivedRequestId(receivedRequest._id || receivedRequest.id);
                } else {
                  setConnectionStatus("not_connected");
                }
              } else {
                setConnectionStatus("not_connected");
              }
            }
          }
        } else {
          setError("User profile data is invalid or empty");
          setProfileUser(null);
        }
      } catch (error) {
        setError(error.message || "Failed to load user profile");
        setProfileUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleConnect = async () => {
    try {
      await Sendrequest(profileUser._id || profileUser.id);
      setConnectionStatus("pending");
      toast.success("Connection request sent!");
    } catch (error) {
      console.error("Failed to send connection request:", error);
      toast.error(error.response?.data?.message || "Failed to send connection request");
    }
  };

  const handleAcceptRequest = async () => {
    try {
      await acceptConnectionRequest(receivedRequestId);
      setConnectionStatus("connected");
      toast.success("Connection request accepted!");
    } catch (error) {
      console.error("Failed to accept connection request:", error);
      toast.error(error.response?.data?.message || "Failed to accept connection request");
    }
  };

  const handleMessage = () => {
    navigate(`/message`);
  };

  const retryFetch = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const [user, profile] = await Promise.all([
        currentUser(),
        getUserProfile(id)
      ]);
      setCurrentUserData(user);
      if (profile && (profile._id || profile.id)) {
        setProfileUser(profile);
      } else {
        setError("User profile data is still invalid after retry");
      }
    } catch (error) {
      setError(error.message || "Failed to load user profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-theme={theme}>
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <p>Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" data-theme={theme}>
        <div className="card w-full max-w-md shadow-xl">
          <div className="card-body items-center text-center">
            <UserX size={48} className="text-error mb-4" />
            <h2 className="card-title text-error">User Not Found</h2>
            <p className="mb-4">{error || "The user you're looking for doesn't exist."}</p>

            <div className="collapse collapse-arrow w-full mb-4">
              <input type="checkbox" /> 
              <div className="collapse-title text-sm font-medium">Debug Information</div>
              <div className="collapse-content">
                <pre className="text-xs text-left overflow-auto max-h-40">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            </div>

            <div className="card-actions mt-4 flex flex-col gap-2 w-full">
              <button className="btn btn-primary w-full" onClick={retryFetch}>
                <RefreshCw size={18} className="mr-2" /> Try Again
              </button>
              <button className="btn btn-outline w-full" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} className="mr-2" /> Go Back
              </button>
              <Link to="/" className="btn btn-ghost w-full">Return Home</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-theme={theme} className="max-w-6xl mx-auto px-4 py-6">
    
      <div className="rounded-lg shadow-md p-6 mb-6 flex flex-col md:flex-row items-center md:items-start gap-6">
  
        <div className="avatar">
          <div className="w-32 h-32 rounded-full ring-4 ring-base-100">
            <img
              src={profileUser.profilePic || "/default-avatar.png"}
              alt={profileUser.name}
              onError={(e) => (e.target.src = "/default-avatar.png")}
            />
          </div>
        </div>


        <div className="flex-1">
          <h1 className="text-3xl font-bold">{profileUser.name}</h1>
          <p className="text-lg opacity-70 mt-1">{profileUser.title || "Full Stack Developer"}</p>

          <div className="flex gap-6 text-sm opacity-70 mt-3">
            <span>{profileUser.followers || 0} followers</span>
            <span>{profileUser.connections?.length || 0} connections</span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm mt-4">
            {profileUser.location && (
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                {typeof profileUser.location === "object"
                  ? `${profileUser.location.city}, ${profileUser.location.country}`
                  : profileUser.location}
              </div>
            )}

            {profileUser.email && (
              <div className="flex items-center gap-1"><Mail size={16} /> {profileUser.email}</div>
            )}
            {profileUser.website && (
              <div className="flex items-center gap-1">
                <LinkIcon size={16} />
                <a href={profileUser.website} className="hover:underline">{profileUser.website}</a>
              </div>
            )}
            {profileUser.joinDate && (
              <div className="flex items-center gap-1">
                <Calendar size={16} /> Joined {new Date(profileUser.joinDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

     
        {currentUserData?._id !== profileUser._id && (
          <div className="flex gap-2 flex-wrap justify-center">
            {connectionStatus === "connected" ? (
              <>
                <button className="btn btn-primary" onClick={handleMessage}>
                  <MessageSquare size={18} className="mr-2" /> Message
                </button>
                <button className="btn btn-outline" disabled>
                  <UserCheck size={18} className="mr-2" /> Connected
                </button>
              </>
            ) : connectionStatus === "pending" ? (
              <button className="btn btn-outline" disabled>
                <UserPlus size={18} className="mr-2" /> Request Sent
              </button>
            ) : connectionStatus === "received_request" ? (
              <div className="flex gap-2">
                <button className="btn btn-primary" onClick={handleAcceptRequest}>
                  <Check size={18} className="mr-2" /> Accept
                </button>
                <button className="btn btn-outline">
                  <X size={18} className="mr-2" /> Decline
                </button>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={handleConnect}>
                <UserPlus size={18} className="mr-2" /> Connect
              </button>
            )}
          </div>
        )}
      </div>


      {profileUser.about && (
        <div className="rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">About</h2>
          <p className="opacity-80 leading-relaxed">{profileUser.about}</p>
        </div>
      )}

      {profileUser.experience?.length > 0 && (
        <div className="rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Experience</h2>
          {profileUser.experience.map((exp, i) => (
            <div key={i} className="mb-4 last:mb-0">
              <h3 className="font-semibold text-lg">{exp.position}</h3>
              <p className="opacity-70">{exp.company}</p>
              <p className="text-sm opacity-60">{exp.startDate} - {exp.endDate || "Present"}</p>
              {exp.description && <p className="mt-2 opacity-80">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

 
      {profileUser.education?.length > 0 && (
        <div className="rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Education</h2>
          {profileUser.education.map((edu, i) => (
            <div key={i} className="mb-4 last:mb-0">
              <h3 className="font-semibold text-lg">{edu.degree}</h3>
              <p className="opacity-70">{edu.school}</p>
              <p className="text-sm opacity-60">{edu.graduationYear}</p>
            </div>
          ))}
        </div>
      )}

      {profileUser.skills?.length > 0 && (
        <div className="rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {profileUser.skills.map((skill, i) => (
              <span key={i} className="badge badge-primary badge-lg">{skill}</span>
            ))}
          </div>
        </div>
      )}

     
      <div className="rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        {posts?.length > 0 ? (
          posts.map((post) => (
            <div key={post._id} className="border-b pb-4 mb-4 last:border-b-0 last:mb-0">
              <p className="opacity-80">{post.content}</p>
              <div className="flex items-center gap-2 mt-2 text-sm opacity-60">
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>{post.likeCount || 0} likes</span>
                <span>•</span>
                <span>{post.commentCount || 0} comments</span>
              </div>
            </div>
          ))
        ) : (
          <p className="opacity-60">No recent activity</p>
        )}
      </div>
    </div>
  );
};

export default OtherUserProfile;