import express from "express";
import { saveMessage, getMessages, getConversations, deleteMessage, EditMessage } from "../controller/messagecontroller.js";
import protectRoute from "../middleware/authmiddleware.js";
import upload from "../middleware/upload.js";



const router = express.Router();

router.post("/", protectRoute, upload.single("media"), saveMessage);
router.get("/:receiverId", protectRoute, getMessages);
router.get("/", protectRoute, getConversations);
router.delete("/:messageId",protectRoute,deleteMessage);
router.put("/:messageId",protectRoute,EditMessage)
export default router;
