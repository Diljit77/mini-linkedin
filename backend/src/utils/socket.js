import { Server } from "socket.io";
import Message from "../models/messageModel.js";
import { encryptMessage, decryptMessage } from "../utils/Cryptohelper.js";

let io;
const onlineUsers = new Map();

export const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "http://localhost:5173", methods: ["GET", "POST"], credentials: true },
  });

  io.on("connection", (socket) => {
    console.log("⚡ Client connected:", socket.id);

    socket.on("join", (userId) => {
      onlineUsers.set(userId, socket.id);
      console.log(`✅ User ${userId} online`);
    });

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

     
        const plainMessage = message.toObject();
        if (plainMessage.encryptedContent) {
          plainMessage.content = decryptMessage({
            encryptedContent: plainMessage.encryptedContent,
            iv: plainMessage.iv,
            authTag: plainMessage.authTag,
          });
        }

        const receiverSocket = onlineUsers.get(receiver);
        if (receiverSocket) {
          io.to(receiverSocket).emit("receiveMessage", plainMessage);
        }

        socket.emit("messageSent", plainMessage);
      } catch (error) {
        console.error("Error saving message:", error);
        socket.emit("messageError", { error: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      for (let [userId, id] of onlineUsers.entries()) {
        if (id === socket.id) {
          onlineUsers.delete(userId);
          console.log(`❌ User ${userId} offline`);
          break;
        }
      }
    });
  });
};
