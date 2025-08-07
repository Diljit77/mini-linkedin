import React from 'react';
import { useAuthStore } from '../store/userAuthStore';
import { useThemeStore } from '../store/useThemeStore';

function LeftSidebar() {
  const {user} = useAuthStore();
  const {theme}= useThemeStore();
  console.log(user) // Assuming you have a Zustand store for user auth
  return (
    <div className="card bg-base-100 shadow-md p-4" data-theme={theme}>
      <h2 className="text-lg font-bold mb-2">Your Profile</h2>
      <div className="avatar mb-2">
        <div className="w-16 rounded-full">
          <img src={user?.profilePic} alt="User Avatar" />
        </div>
      </div>
      <p className="text-base-content">{user?.name}</p>
      <p className="text-sm opacity-70">{user?.bio}</p>
    <p>
  {user?.connections?.length || 0}{" "}
  {user?.connections?.length === 1 ? "connection" : "connections"}
</p>
    </div>
  );
}

export default LeftSidebar;
