import { Server } from "socket.io";
import Message from "../models/messageModel.js";
import Notification from "../models/Notificationmodel.js";
import { encryptMessage, decryptMessage } from "../utils/Cryptohelper.js";
import { createNotification } from "../utils/Notification.js";
import dotenv from "dotenv";

dotenv.config();

let io;
const onlineUsers = new Map(); // userId -> socketId mapping
const userSockets = new Map(); // socketId -> userId mapping

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    },
  });

  // Store io instance globally for access in other files
  global.io = io;

  io.on("connection", (socket) => {
    console.log("⚡ Client connected:", socket.id);

    // User joins with their userId
    socket.on("join", (userId) => {
      onlineUsers.set(userId, socket.id);
      userSockets.set(socket.id, userId);
      socket.join(userId); // Join room with userId as room name
      console.log(`✅ User ${userId} online with socket ${socket.id}`);
      
      // Notify others about user's online status if needed
      socket.broadcast.emit("userOnline", userId);
    });

    // Handle message sending
    socket.on("sendMessage", async ({ sender, receiver, content, mediaUrl, mediaType }) => {
      try {
        let encryptedData = null;
        if (content) {
          encryptedData = encryptMessage(content);
        }

        const message = new Message({
          sender,
          receiver,
          mediaUrl,
          mediaType,
          ...(encryptedData && {
            encryptedContent: encryptedData.encryptedContent,
            iv: encryptedData.iv,
            authTag: encryptedData.authTag,
          }),
        });

        await message.save();
        await message.populate("sender", "name profilePic");
        await message.populate("receiver", "name profilePic");

        // Decrypt for sending to client
        const plainMessage = message.toObject();
        if (plainMessage.encryptedContent) {
          plainMessage.content = decryptMessage({
            encryptedContent: plainMessage.encryptedContent,
            iv: plainMessage.iv,
            authTag: plainMessage.authTag,
          });
        }

        // Send to receiver if online
        const receiverSocketId = onlineUsers.get(receiver);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receiveMessage", plainMessage);
        }

        // Send confirmation to sender
        socket.emit("messageSent", plainMessage);

        // Create notification for the message
        if (receiver !== sender) {
          await createNotification({
            recipient: receiver,
            sender: sender,
            type: "message",
            message: `You have a new message from ${plainMessage.sender.name}`
          });
        }
      } catch (error) {
        console.error("Error saving message:", error);
        socket.emit("messageError", { error: "Failed to send message" });
      }
    });

    // Handle typing indicators
    socket.on("typingStart", ({ receiverId, senderId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", { userId: senderId, isTyping: true });
      }
    });

    socket.on("typingStop", ({ receiverId, senderId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", { userId: senderId, isTyping: false });
      }
    });

    // Handle message read receipts
    socket.on("markMessagesRead", async ({ senderId, receiverId }) => {
      try {
        // Update messages as read in database
        await Message.updateMany(
          { sender: senderId, receiver: receiverId, isRead: false },
          { isRead: true, readAt: new Date() }
        );

        // Notify the sender that their messages were read
        const senderSocketId = onlineUsers.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("messagesRead", { readerId: receiverId });
        }
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });

    // Handle notification read status
    socket.on("markNotificationRead", async (notificationId) => {
      try {
        const notification = await Notification.findById(notificationId);
        if (notification) {
          await notification.markAsRead();
          
          // Emit update to the user who owns the notification
          const userSocketId = onlineUsers.get(notification.recipient.toString());
          if (userSocketId) {
            io.to(userSocketId).emit("notificationRead", notificationId);
          }
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    });

    // Handle post likes for real-time notifications
    socket.on("postLiked", async ({ postId, likerId, postAuthorId }) => {
      try {
        // Only create notification if the liker is not the post author
        if (likerId !== postAuthorId) {
          const notification = await createNotification({
            recipient: postAuthorId,
            sender: likerId,
            type: "like",
            post: postId,
            message: "liked your post"
          });
          
          // Send real-time notification to post author if online
          const authorSocketId = onlineUsers.get(postAuthorId);
          if (authorSocketId) {
            io.to(authorSocketId).emit("newNotification", notification);
          }
        }
      } catch (error) {
        console.error("Error handling post like notification:", error);
      }
    });

    // Handle connection requests for real-time notifications
    socket.on("connectionRequest", async ({ senderId, receiverId }) => {
      try {
        const notification = await createNotification({
          recipient: receiverId,
          sender: senderId,
          type: "connection",
          message: "sent you a connection request"
        });
        
        // Send real-time notification to receiver if online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newNotification", notification);
        }
      } catch (error) {
        console.error("Error handling connection request notification:", error);
      }
    });

    // Handle user going offline
    socket.on("disconnect", () => {
      const userId = userSockets.get(socket.id);
      
      if (userId) {
        onlineUsers.delete(userId);
        userSockets.delete(socket.id);
        console.log(`❌ User ${userId} offline`);
        
        // Notify others about user's offline status if needed
        socket.broadcast.emit("userOffline", userId);
      }
    });

    // Error handling
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });
};

// Helper function to send notifications from anywhere in the app
export const sendNotification = (userId, notificationData) => {
  const socketId = onlineUsers.get(userId);
  if (socketId && io) {
    io.to(socketId).emit("newNotification", notificationData);
  }
};

// Helper function to check if a user is online
export const isUserOnline = (userId) => {
  return onlineUsers.has(userId);
};

// Helper function to get online users
export const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};

export default io;
