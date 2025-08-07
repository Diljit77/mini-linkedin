import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { createpost } from '../utils/api';
import toast from 'react-hot-toast';
import { useThemeStore } from '../store/useThemeStore';
import { useNavigate } from 'react-router-dom';

function CreatePostPage() {
  const {theme}= useThemeStore();
  const [content, setContent] = useState('');
  const navivgate = useNavigate();
  const [visibility, setVisibility] = useState('public');



  const handlePost =async () => {
    console.log({ content, visibility });
    try {
      
      const post=await createpost({ content, visibility });
      toast.success('Post created successfully!');
      Navigate("/")
    } catch (error) {
      console.error("Error creating post:", error);
      
    }
    // Send to backend or show toast
  };

  return (
    <div className="min-h-screen bg-base-200" data-theme={theme}>
      <Navbar />

      <div className="max-w-3xl mx-auto mt-10 p-4">
        <div className="card bg-base-100 shadow-xl p-6">
          <h2 className="text-2xl font-bold text-primary mb-4 text-center">Create a Post</h2>

          {/* Avatar + Textarea */}
          <div className="flex items-start gap-4 mb-4">
          
         <div className="form-control w-full">
  <label className="label">
    <span className="label-text mb-2">Your Post</span>
  </label>
  <div className="relative">
   
    <textarea
     value={content}
  onChange={(e) => setContent(e.target.value)}
      className="textarea textarea-bordered pl-10 w-full"
      placeholder="Tell us about yourself..."
 
    />
  </div>
</div>
          </div>

          <div className="divider my-2" />

        
         

          {/* Visibility */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Post Visibility</span>
            </label>
            <select
              className="select select-bordered"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
            >
              <option value="public">🌍 Public</option>
              <option value="connections">👥 Connections Only</option>
            </select>
          </div>

          {/* Post Button */}
          <div className="text-right">
            <button className="btn btn-primary" onClick={handlePost}>
              📤 Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}





export default CreatePostPage;
