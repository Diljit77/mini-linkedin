import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import { allpostsfeed,getSuggestedUsers } from '../utils/api';
import { useThemeStore } from '../store/useThemeStore';


function Homepage() {
  const [posts, setPosts] = useState([]); // ← ADD THIS
  const [loading, setLoading] = useState(true);
  const [suggestedUsers, setSuggestedUsers] = useState([]); // ← ADD THIS
const {theme}= useThemeStore();
  useEffect(() => {
    const getFeed = async () => {
      try {
        const response = await allpostsfeed();
        console.log("Posts fetched successfully:", response);
        setPosts(response?.posts || []); // ← SET THE POSTS
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };
    const getsuggestedUsers = async () => {
      try {
        const response = await getSuggestedUsers();
        console.log("Suggested users fetched successfully:", response);
        setSuggestedUsers(response || []); // ← SET THE SUGGESTED USERS
      }
      catch (error) {
        console.error("Error fetching posts:", error);
      }
    }
    getsuggestedUsers();
    getFeed();
  }, []); 

  return (
    <div className="min-h-screen bg-base-200" data-theme={theme}>
      <Navbar />

      <div className="flex flex-col lg:flex-row px-4 py-6 gap-6 max-w-[1440px] mx-auto">
        {/* Left Sidebar */}
        <div className="hidden lg:block lg:w-1/4">
          <LeftSidebar />
        </div>

        {/* Center Feed */}
        <div className="w-full lg:w-2/4">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-primary">Welcome to the Home Feed</h1>
            <p className="text-base-content opacity-70">
              Start engaging with your community by viewing the latest posts.
            </p>
          </div>

          {/* Post Feed */}
          <div className="space-y-6">
            {loading ? (
              <p>Loading posts...</p>
            ) : posts.length === 0 ? (
              <p className="text-center opacity-50">No posts yet</p>
            ) : (<>
            { Array.isArray(posts) &&
                posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))
            }
            </>
 
            
             
           
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block lg:w-1/4">
          <RightSidebar suggestions={suggestedUsers} />
        </div>
      </div>
    </div>
  );
}

export default Homepage;
