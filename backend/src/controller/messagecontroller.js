import Message from "../models/messageModel.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import { encryptMessage, decryptMessage } from "../utils/Cryptohelper.js";

export const saveMessage = async (req, res) => {
  try {
    const { receiverId, content, gifUrl, mediaType: clientMediaType } = req.body;
    const sender = req.user._id;

    let mediaUrl = null;
    let finalMediaType = null;

    if (gifUrl) {
      mediaUrl = gifUrl;
      finalMediaType = "gif";
    } else if (req.file) {
      console.log("File received:", req.file.originalname, req.file.mimetype, req.file.size);
      
      const streamUpload = (req) => {
        return new Promise((resolve, reject) => {
        
    
let resourceType = "auto";
if (req.file) {
  if (req.file.mimetype.startsWith("audio/")) {
    resourceType = "video"; 
  } else if (req.file.mimetype.startsWith("image/")) {
    resourceType = "image";
  } else if (req.file.mimetype.startsWith("video/")) {
    resourceType = "video";
  }
}

          const stream = cloudinary.uploader.upload_stream(
            { resource_type: resourceType },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };

      const result = await streamUpload(req);
      mediaUrl = result.secure_url;

     
      if (req.file.mimetype.startsWith("audio/")) {
        finalMediaType = "audio";
      } else if (result.resource_type === "image") {
        finalMediaType = "image";
      } else if (result.resource_type === "video") {
    
        finalMediaType = req.file.mimetype.startsWith("video/") ? "video" : "audio";
      }
    } else if (clientMediaType) {
      finalMediaType = clientMediaType;
    }

    let encryptedData = null;
    if (content) {
      encryptedData = encryptMessage(content);
    }

    const message = await Message.create({
      sender,
      receiver: receiverId,
      mediaUrl,
      mediaType: finalMediaType,
      ...(encryptedData && {
        encryptedContent: encryptedData.encryptedContent,
        iv: encryptedData.iv,
        authTag: encryptedData.authTag,
      }),
    });

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

    res.status(201).json({ success: true, message: plainMessage });
  } catch (error) {
    console.error("SaveMessage Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.messageId;
    await Message.findByIdAndDelete(messageId);
    return res.status(200).json({ success: true, message: "message deleted " });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const EditMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    let encryptedData = null;
    if (content) {
      encryptedData = encryptMessage(content);
    }

    const newMessage = await Message.findByIdAndUpdate(
      messageId,
      encryptedData
        ? {
            encryptedContent: encryptedData.encryptedContent,
            iv: encryptedData.iv,
            authTag: encryptedData.authTag,
          }
        : {},
      { new: true }
    );

    if (!newMessage) {
      return res
        .status(404)
        .json({ message: "error while updating", success: false });
    }

    return res
      .status(200)
      .json({ message: "message updated successfully", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { receiverId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: receiverId },
        { sender: receiverId, receiver: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name profilePic")
      .populate("receiver", "name profilePic");

    // 🔐 Decrypt all
    const decrypted = messages.map((msg) => {
      const obj = msg.toObject();
      if (obj.encryptedContent) {
        obj.content = decryptMessage({
          encryptedContent: obj.encryptedContent,
          iv: obj.iv,
          authTag: obj.authTag,
        });
      }
      return obj;
    });

    res.status(200).json({ success: true, messages: decrypted });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getConversations = async (req, res) => {
  try {
    const { userId } = req.user;

    const conversations = await Message.aggregate([
      { $match: { $or: [{ sender: userId }, { receiver: userId }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$sender", userId] }, "$receiver", "$sender"],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
    ]);

    // 🔐 Decrypt lastMessage content
    const withDecrypted = conversations.map((c) => {
      if (c.lastMessage?.encryptedContent) {
        c.lastMessage.content = decryptMessage({
          encryptedContent: c.lastMessage.encryptedContent,
          iv: c.lastMessage.iv,
          authTag: c.lastMessage.authTag,
        });
      }
      return c;
    });

    res.status(200).json({ success: true, conversations: withDecrypted });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
