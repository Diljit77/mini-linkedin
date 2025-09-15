import { useEffect, useState } from 'react';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification
} from '../utils/api';
import { useNotificationStore } from '../store/usenotifcationstore';
import { useAuthStore } from '../store/userAuthStore';
import Navbar from '../components/Navbar';
import { useThemeStore } from '../store/useThemeStore';

const Notification = () => {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const { 
    notifications, 
    setNotifications, 
    markAsRead, 
    markAllAsRead: markAllAsReadStore,
    removeNotification,
    unreadCount,
    setUnreadCount
  } = useNotificationStore();
  
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async (pageNum = 1) => {
    try {
      const response = await getNotifications(pageNum, 20);
      if (pageNum === 1) {
        setNotifications(response.notifications);
      } else {
        setNotifications([...notifications, ...response.notifications]);
      }
      setHasMore(response.notifications.length === 20);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      markAsRead(notificationId);
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      markAllAsReadStore();
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      removeNotification(notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleLoadMore = () => {
    fetchNotifications(page + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200" data-theme={theme}>
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200" data-theme={theme}>
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <button 
              className="btn btn-primary"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read ({unreadCount})
            </button>
          )}
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg opacity-70">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 rounded-lg shadow-md flex justify-between items-start ${
                  notification.isRead ? 'bg-base-100' : 'bg-primary/10'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {notification.sender?.profilePic && (
                      <img
                        src={notification.sender.profilePic}
                        alt={notification.sender.name}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-semibold">{notification.message}</p>
                      <p className="text-sm opacity-70">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {notification.type === 'like' && notification.post && (
                    <p className="text-sm opacity-70 mt-2">
                      Post: "{notification.post.content?.substring(0, 50)}..."
                    </p>
                  )}
                  
                  {notification.type === 'comment' && notification.comment && (
                    <p className="text-sm opacity-70 mt-2">
                      Comment: "{notification.comment.content?.substring(0, 50)}..."
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {!notification.isRead && (
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => handleMarkAsRead(notification._id)}
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => handleDelete(notification._id)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {hasMore && (
          <div className="flex justify-center mt-8">
            <button 
              className="btn btn-outline"
              onClick={handleLoadMore}
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification;