import React from 'react';
import { Home, PlusSquare, User, LogOut, NotebookIcon, MessagesSquareIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/userAuthStore';
import toast from 'react-hot-toast';
import ThemeSelector from './ThemeSelector';
import { useThemeStore } from '../store/useThemeStore';

const Navbar = () => {
    const { user } = useAuthStore(); // ✅ correct key from Zustand
const navigate=useNavigate();
const {theme}= useThemeStore();
function handlelogout(){
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  toast.success("logout successfully");
window.location.href = "/login";
}
  return (
    <nav className="bg-base-100 shadow-md px-6 py-3 flex justify-between items-center">
      {/* Left side - Logo */}
      <div className="text-xl font-bold">
        <Link to="/">miniLinkdlen</Link>
      </div>

      {/* Center - Navigation links */}
      <div className="hidden md:flex gap-6 text-sm items-center" data-theme={theme}>
        <Link to="/" className="flex items-center gap-1 hover:text-primary transition">
          <Home size={20} /> Home
        </Link>
        <Link to="/activty" className="flex items-center gap-1 hover:text-primary transition">
          <NotebookIcon size={20} /> Activity
        </Link>
          <Link to="/create" className="flex items-center gap-1 hover:text-primary transition">
          <PlusSquare size={20} /> Create
        </Link>
        <Link to="/profile" className="flex items-center gap-1 hover:text-primary transition">
          <User size={20} /> Profile
        </Link>
          <Link to="/message" className="flex items-center gap-1 hover:text-primary transition">
          <MessagesSquareIcon size={20} /> message
        </Link>
        <ThemeSelector />
      </div>

      {/* Right side - Avatar & Dropdown */}
      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
          <div className="w-10 rounded-full">
            <img src={user?.profilePic ||""} alt="User avatar" />
          </div>
        </div>
        <ul
          tabIndex={0}
          className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
        >
          <li className="px-2 py-1 text-sm">
            <span className="font-bold">{user.name}</span>
            <p className="text-xs text-gray-500">{user.email}</p>
          </li>
          <li>
            <Link to="/profile">Profile</Link>
          </li>
        <li>
  <button onClick={handlelogout} className="flex items-center gap-2">
    <LogOut size={18} /> Logout
  </button>
</li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

