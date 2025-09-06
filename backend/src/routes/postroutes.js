import express from "express";
import { createPost, deletePost, editPost, getallPostbyUserid, getFeedPosts, getMyPosts, getPostById, getShareStats, sharePost, toggleLike } from "../controller/postcontroller.js";
import protectRoute from "../middleware/authmiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/", protectRoute, upload.array("image", 5), createPost);
router.get("/feed", protectRoute, getFeedPosts);
router.put("/:id", protectRoute,upload.array("image", 5), editPost);
router.get("/:id", protectRoute, getPostById)
router.delete("/:id", protectRoute, deletePost);
router.get("/my-posts", protectRoute, getMyPosts);
router.post("/:postId/like", protectRoute, toggleLike);
router.get("/users/:id",protectRoute,getallPostbyUserid);

router.post("/:id/share", protectRoute, sharePost);
router.get("/:id/shares", protectRoute, getShareStats);

export default router;
