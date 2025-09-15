import express from "express";
import protectRoute from "../middleware/authmiddleware.js";
import { deleteNotification, getnotificaion, markAllAsRead, marknotification,getUnreadCount } from "../controller/notificationcontroller.js";

const router = express.Router();

router.get("/", protectRoute, getnotificaion);
router.get("/unread-count", protectRoute, getUnreadCount);
router.put("/notifications/:id/read", protectRoute, marknotification);
router.put("/read-all", protectRoute, markAllAsRead);
router.delete("/:id", protectRoute, deleteNotification);

export default router;