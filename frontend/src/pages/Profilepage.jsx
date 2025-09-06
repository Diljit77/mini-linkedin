import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import { allpostsfeed, connectedUsers } from '../utils/api';
import { useAuthStore } from '../store/userAuthStore';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/useThemeStore';
import { MapPin, Briefcase, GraduationCap, Mail, Globe, Github, Linkedin, Twitter } from 'lucide-react';

function Profilepage() {
  const [posts, setPosts] = useState([]);
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  useEffect(() => {
    const getFeed = async () => {
      try {
        const data = await allpostsfeed();
        const myPosts = data?.posts?.filter(post => post.author._id === user._id) || [];
        setPosts(myPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    const getconnectedusers = async () => {
      try {
        const response = await connectedUsers();
        console.log("Suggested users fetched successfully:", response);
        setSuggestedUsers(response || []);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    }

    getFeed();
    getconnectedusers();
  }, [user._id]);

  return (
    <div className="min-h-screen bg-base-200" data-theme={theme}>
      <Navbar />

      <div className="flex flex-col lg:flex-row justify-center gap-6 px-4 py-6">
        {/* Left: Profile Info */}
        <div className="w-full lg:w-1/4">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex flex-col items-center text-center">
                <div className="avatar mb-4">
                  <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img src={user.profilePic} alt={user.name} />
                  </div>
                </div>
                <h2 className="card-title mb-1">{user.name}</h2>
                {user.title && <p className="text-sm text-primary font-medium mb-2">{user.title}</p>}
                {user.bio && <p className="text-sm opacity-70 mb-4">{user.bio}</p>}
                
                {/* Location */}
                {user.location && (user.location.city || user.location.country) && (
                  <div className="flex items-center gap-1 mb-3">
                    <MapPin size={16} className="text-gray-500" />
                    <span className="text-sm">
                      {user.location.city && `${user.location.city}, `}{user.location.country}
                    </span>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 w-full mb-4">
                  <div className="stat p-0 text-center">
                    <div className="stat-value text-lg">{user.connections?.length || 0}</div>
                    <div className="stat-desc">Connections</div>
                  </div>
                  <div className="stat p-0 text-center">
                    <div className="stat-value text-lg">{user.followers?.length || 0}</div>
                    <div className="stat-desc">Followers</div>
                  </div>
                </div>

                {/* Skills */}
                {user.skills && user.skills.length > 0 && (
                  <div className="w-full mb-4">
                    <h3 className="font-semibold text-sm mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-1">
                      {user.skills.slice(0, 5).map((skill, index) => (
                        <span key={index} className="badge badge-outline badge-sm">
                          {skill}
                        </span>
                      ))}
                      {user.skills.length > 5 && (
                        <span className="badge badge-ghost badge-sm">+{user.skills.length - 5} more</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Social Links */}
                {(user.contactInfo?.github || user.contactInfo?.linkedin || user.contactInfo?.website) && (
                  <div className="w-full mb-4">
                    <h3 className="font-semibold text-sm mb-2">Connect</h3>
                    <div className="flex justify-center gap-2">
                      {user.contactInfo?.github && (
                        <a href={user.contactInfo.github} target="_blank" rel="noopener noreferrer" className="btn btn-circle btn-sm btn-ghost">
                          <Github size={16} />
                        </a>
                      )}
                      {user.contactInfo?.linkedin && (
                        <a href={user.contactInfo.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-circle btn-sm btn-ghost">
                          <Linkedin size={16} />
                        </a>
                      )}
                      {user.contactInfo?.website && (
                        <a href={user.contactInfo.website} target="_blank" rel="noopener noreferrer" className="btn btn-circle btn-sm btn-ghost">
                          <Globe size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="card-actions mt-4">
                <button onClick={() => navigate(`/profile/${user._id}`)} className="btn btn-primary btn-sm w-full">
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Experience Preview */}
          {user.experience && user.experience.length > 0 && (
            <div className="card bg-base-100 shadow-xl mt-4">
              <div className="card-body">
                <h3 className="card-title text-sm flex items-center gap-2">
                  <Briefcase size={16} />
                  Experience
                </h3>
                {user.experience.slice(0, 2).map((exp, index) => (
                  <div key={index} className="mb-3 last:mb-0">
                    <h4 className="font-semibold text-sm">{exp.position || exp.role}</h4>
                    <p className="text-xs opacity-70">{exp.company}</p>
                    <p className="text-xs opacity-60">
                      {exp.startDate && new Date(exp.startDate).toLocaleDateString()} - 
                      {exp.current ? ' Present' : exp.endDate ? ` ${new Date(exp.endDate).toLocaleDateString()}` : ''}
                    </p>
                  </div>
                ))}
                {user.experience.length > 2 && (
                  <button className="btn btn-ghost btn-xs w-full" onClick={() => navigate(`/profile/${user._id}`)}>
                    View all {user.experience.length} experiences
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Education Preview */}
          {user.education && user.education.length > 0 && (
            <div className="card bg-base-100 shadow-xl mt-4">
              <div className="card-body">
                <h3 className="card-title text-sm flex items-center gap-2">
                  <GraduationCap size={16} />
                  Education
                </h3>
                {user.education.slice(0, 2).map((edu, index) => (
                  <div key={index} className="mb-3 last:mb-0">
                    <h4 className="font-semibold text-sm">{edu.degree}</h4>
                    <p className="text-xs opacity-70">{edu.school}</p>
                    <p className="text-xs opacity-60">
                      {edu.startYear} - {edu.endYear || 'Present'}
                    </p>
                  </div>
                ))}
                {user.education.length > 2 && (
                  <button className="btn btn-ghost btn-xs w-full" onClick={() => navigate(`/profile/${user._id}`)}>
                    View all {user.education.length} educations
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Middle: Posts */}
        <div className="w-full lg:w-2/4 space-y-6">
          <h2 className="text-2xl font-bold text-primary text-center">Your Posts</h2>
          {posts.length === 0 && !loading && (
            <div className="text-center">
              <p className="text-gray-500">No posts found.</p>
            </div>
          )}
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>

        {/* Right: Connections */}
        <div className="w-full lg:w-1/4 hidden lg:block">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-primary text-lg">Your connections</h2>
              <ul className="mt-4 space-y-3">
                {suggestedUsers.slice(0, 5).map((user) => (
                  <li key={user._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="avatar">
                        <div className="w-8 rounded-full">
                          <img src={user.profilePic} alt={user.name} />
                        </div>
                      </div>
                      <span className="text-sm">{user.name}</span>
                    </div>
                  </li>
                ))}
              </ul>
              {suggestedUsers.length > 5 && (
                <button className="btn btn-ghost btn-sm w-full mt-2">
                  View all {suggestedUsers.length} connections
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profilepage;