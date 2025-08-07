import express from "express";
import { createPost, deletePost, editPost, getFeedPosts, getMyPosts, getPostById } from "../controller/postcontroller.js";
import protectRoute from "../middleware/authmiddleware.js";

const router = express.Router();


router.post("/", protectRoute, createPost);
router.get("/feed", protectRoute, getFeedPosts);
router.put("/:id", protectRoute, editPost);
router.get("/:id", protectRoute, getPostById)
router.delete("/:id", protectRoute, deletePost);
router.get("/my-posts", protectRoute, getMyPosts);
export default router;
