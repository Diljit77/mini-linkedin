import Notification from "../models/Notificationmodel.js";

export const createNotification = async ({
  recipient,
  sender,
  type,
  post = null,
  comment = null,
  message = ""
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      post,
      comment,
      message,
    });
    
    // Emit real-time notification if Socket.io is set up
    if (global.io && recipient.toString() !== sender.toString()) {
      const populatedNotification = await Notification.findById(notification._id)
        .populate("sender", "name profilePic")
        .populate("post", "content")
        .populate("comment", "content");
      
      global.io.to(recipient.toString()).emit("newNotification", populatedNotification);
    }
    
    return notification;
  } catch (error) {
    console.error("Notification creation failed:", error);
    throw error;
  }
};

export const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({
    recipient: userId,
    isRead: false
  });
};