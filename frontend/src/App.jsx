import './App.css'
import { Route, Routes } from 'react-router-dom'
import Homepage from './pages/Homepage'
import Loginpage from './pages/Loginpage'
import Signuppage from './pages/Signuppage'
import Profilepage from './pages/Profilepage'
import Onboaringpage from './pages/Onboaringpage'
import { Toaster } from 'react-hot-toast'
import CreatePostPage from './pages/CreatePostpage'
import PrivateRoute from './utils/privateroute'
import AuthRedirectRoute from './utils/authredirectedroute'
import EditPostModal from './components/EditpostModal'
import ActivityPage from './pages/Activitypage'
import EditProfilePage from './components/EditprofileModal'
import ChatPage from './pages/ChatPage'
import OtherUserProfile from './pages/OtherUserpage'
import { useEffect } from 'react'
import { useAuthStore } from './store/userAuthStore'
import { useNotificationStore } from './store/usenotifcationstore'
import { io } from 'socket.io-client'
import NotificationPopup from './components/Notificationpopup'
import Notification from './pages/Notifcation'


function App() {
  const { refreshUser, user } = useAuthStore();
  const { addNotification, setUnreadCount } = useNotificationStore();

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (user) {
   
      const socket = io(import.meta.env.VITE_BASE_URL ,{
        withCredentials: true,
      });

      // Join user's room
      socket.emit('join', user._id);

      // Listen for new notifications
      socket.on('newNotification', (notification) => {
        addNotification(notification);
        setUnreadCount(prev => prev + 1);
      });

      // Clean up on unmount
      return () => {
        socket.disconnect();
      };
    }
  }, [user, addNotification, setUnreadCount]);

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <NotificationPopup />
      
      <Routes>
        <Route path="/login" element={
          <AuthRedirectRoute>
            <Loginpage />
          </AuthRedirectRoute>
        } />
        <Route path="/signup" element={
          <AuthRedirectRoute>
            <Signuppage />
          </AuthRedirectRoute>
        } />

        {/* Protected Routes */}
        <Route path="/" element={
          <PrivateRoute>
            <Homepage />
          </PrivateRoute>
        } />
        <Route path="/onboarding" element={
          <PrivateRoute>
            <Onboaringpage />
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <Profilepage />
          </PrivateRoute>
        } />
        <Route path="/create" element={
          <PrivateRoute>
            <CreatePostPage />
          </PrivateRoute>
        } />
        <Route path="/post/:Id" element={
          <PrivateRoute>
            <EditPostModal />
          </PrivateRoute>
        } />
        <Route path="/activty" element={
          <PrivateRoute>
            <ActivityPage />
          </PrivateRoute>
        } />
        <Route path="/profile/:id" element={
          <PrivateRoute>
            <EditProfilePage />
          </PrivateRoute>
        } />
        <Route path="/otherprofile/:id" element={
          <PrivateRoute>
            <OtherUserProfile />
          </PrivateRoute>
        } />
        <Route path="/messages/:id?" element={
          <PrivateRoute>
            <ChatPage />
          </PrivateRoute>
        } />
        {/* New Notification Route */}
        <Route path="/notifications" element={
          <PrivateRoute>
            <Notification />
          </PrivateRoute>
        } />
      </Routes>
    </>
  )
}

export default App
