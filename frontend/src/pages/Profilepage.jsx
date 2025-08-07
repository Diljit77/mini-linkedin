import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';

import PostCard from '../components/PostCard';


import {  allpostsfeed, connectedUsers, mypostsfeed} from '../utils/api';
import { useAuthStore } from '../store/userAuthStore';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/useThemeStore';
import toast from 'react-hot-toast';




function Profilepage() {
   const [posts, setPosts] = useState([]); // ← ADD THIS
const {theme}= useThemeStore();
const navigate=useNavigate();
  const {user} = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [suggestedUsers, setSuggestedUsers] = useState([]); // ← ADD THIS
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
              setSuggestedUsers(response || []); // ← SET THE SUGGESTED USERS
            }
            catch (error) {
              console.error("Error fetching posts:", error);
            }
          }
      getFeed();
    getconnectedusers()
}, []);


  
const handledeltepost=async () => {
  try {
    await deletepost(postId);
    toast.success("post deleted successfully");
   navigate("/")
  } catch (error) {
    
  }
}
 
  return (
    <div className="min-h-screen bg-base-200" data-theme={theme}>
      <Navbar />

    
      <div className="flex flex-col lg:flex-row justify-center gap-6 px-4 py-6">
        {/* Left: Profile Info */}
        <div className="w-full lg:w-1/4">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
              <div className="avatar">
                <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src="https://api.dicebear.com/6.x/bottts-neutral/svg?seed=User" alt="User" />
                </div>
              </div>
              <h2 className="card-title mt-4">{user.name}</h2>
              <p className="text-sm opacity-70">{user.bio}</p>
         
              <div className="card-actions mt-4">
                <button onClick={()=>navigate(`/profile/${user._id}`)} className="btn btn-primary btn-sm">
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Posts */}
        <div className="w-full lg:w-2/4 space-y-6">
          <h2 className="text-2xl font-bold text-primary text-center">Your Posts</h2>
          {
            posts.length===0 && (
              <div className="text-center">
                
                <p className="">No posts found.</p>
              </div>
            )
          }
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* Right: Suggestions */}
        <div className="w-full lg:w-1/4 hidden lg:block">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-primary">Your connections</h2>
              <ul className="mt-4 space-y-3">
                {suggestedUsers.map((user) => (
                  <li key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="avatar">
                        <div className="w-8 rounded-full">
                          <img src={user.profilePic} alt="something went wrong" />
                        </div>
                      </div>
                      <span className="text-sm">{user.name}</span>
                    </div>
                 
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profilepage;

