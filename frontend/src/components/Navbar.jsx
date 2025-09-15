import React, { useEffect } from 'react';
import { Home, PlusSquare, User, LogOut, NotebookIcon, MessagesSquareIcon, Bell } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/userAuthStore';
import { useNotificationStore } from '../store/usenotifcationstore';
import { getUnreadCount } from '../utils/api';
import toast from 'react-hot-toast';
import ThemeSelector from './ThemeSelector';
import { useThemeStore } from '../store/useThemeStore';

const Navbar = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const { unreadCount, setUnreadCount } = useNotificationStore();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await getUnreadCount();
        setUnreadCount(response.count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };
    
    if (user) {
      fetchUnreadCount();
    }
  }, [user, setUnreadCount]);

  function handlelogout() {
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
        <Link to="/messages" className="flex items-center gap-1 hover:text-primary transition">
          <MessagesSquareIcon size={20} /> message
        </Link>
        
        {/* Notification Bell */}
        <Link to="/notifications" className="flex items-center gap-1 hover:text-primary transition relative">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 badge badge-xs badge-primary">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
        
        <ThemeSelector />
      </div>

      {/* Mobile Navigation (simplified) */}
      <div className="md:hidden flex gap-4 items-center">
        {/* Notification Bell for mobile */}
        <Link to="/notifications" className="relative">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 badge badge-xs badge-primary">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
        
        {/* Mobile menu button */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/activty">Activity</Link></li>
            <li><Link to="/create">Create</Link></li>
            <li><Link to="/profile">Profile</Link></li>
            <li><Link to="/messages">Messages</Link></li>
            <li><Link to="/notifications">Notifications {unreadCount > 0 && `(${unreadCount})`}</Link></li>
            <li><ThemeSelector mobile /></li>
          </ul>
        </div>
      </div>

      {/* Right side - Avatar & Dropdown */}
      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
          <div className="w-10 rounded-full">
            <img src={user?.profilePic || ""} alt="User avatar" />
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
            <Link to="/notifications">
              Notifications {unreadCount > 0 && <span className="badge badge-primary badge-xs">{unreadCount}</span>}
            </Link>
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