import { useEffect } from 'react';
import { useNotificationStore } from '../store/usenotifcationstore';
import toast from 'react-hot-toast';

const NotificationPopup = () => {
  const { 
    showNotificationPopup, 
    currentNotification, 
    hidePopup, 
    markAsRead 
  } = useNotificationStore();

  useEffect(() => {
    if (showNotificationPopup && currentNotification) {

      const timer = setTimeout(() => {
        hidePopup();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showNotificationPopup, currentNotification, hidePopup]);

  const handleClick = () => {
    if (currentNotification) {
      markAsRead(currentNotification._id);
      hidePopup();
      // You can navigate to the relevant page based on notification type
      toast.success('Notification marked as read');
    }
  };

  if (!showNotificationPopup || !currentNotification) return null;

  return (
    <div className="toast toast-top toast-end z-50">
      <div 
        className="alert alert-info cursor-pointer shadow-lg"
        onClick={handleClick}
      >
        <div>
          <span>{currentNotification.message}</span>
          {!currentNotification.isRead && (
            <div className="badge badge-primary badge-xs ml-2">New</div>
          )}
        </div>
        <button 
          className="btn btn-sm btn-circle btn-ghost"
          onClick={(e) => {
            e.stopPropagation();
            hidePopup();
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default NotificationPopup;