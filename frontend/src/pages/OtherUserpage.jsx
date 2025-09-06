import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { currentUser, getuserpost, getUserProfile } from "../utils/api";
import { MapPin, Calendar, Mail, Link as LinkIcon, ArrowLeft, RefreshCw, UserX } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";

const OtherUserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [posts, setPosts] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});
  const { theme } = useThemeStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [user, profile, post] = await Promise.all([
          currentUser(),
          getUserProfile(id),
          getuserpost(id)
        ]);

        setCurrentUserData(user);
        setPosts(post);

        if (profile && (profile._id || profile.id)) {
          setProfileUser(profile);
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
      {/* Profile Header */}
      <div className="rounded-lg shadow-md p-6 mb-6 flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Profile Picture */}
        <div className="avatar">
          <div className="w-32 h-32 rounded-full ring-4 ring-base-100">
            <img
              src={profileUser.profilePic || "/default-avatar.png"}
              alt={profileUser.name}
              onError={(e) => (e.target.src = "/default-avatar.png")}
            />
          </div>
        </div>

        {/* User Info */}
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

        {/* Action Buttons */}
        {currentUserData?._id !== profileUser._id && (
          <div className="flex gap-2">
            <button className="btn btn-primary">Message</button>
            <button className="btn btn-outline">Connect</button>
          </div>
        )}
      </div>

      {/* About */}
      {profileUser.about && (
        <div className="rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">About</h2>
          <p className="opacity-80 leading-relaxed">{profileUser.about}</p>
        </div>
      )}

      {/* Experience */}
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

      {/* Education */}
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

      {/* Skills */}
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

      {/* Recent Activity */}
      <div className="rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        {posts?.length > 0 ? (
          posts.map((post) => (
            <div key={post._id} className="border-b pb-4 mb-4 last:border-b-0 last:mb-0">
              <p className="opacity-80">{post.content}</p>
              <div className="flex items-center gap-2 mt-2 text-sm opacity-60">
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>{post.likes || 0} likes</span>
                <span>•</span>
                <span>{post.comments || 0} comments</span>
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
