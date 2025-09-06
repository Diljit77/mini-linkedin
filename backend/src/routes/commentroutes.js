
import express from "express";
import protectRoute from "../middleware/authmiddleware.js";
import {
  addComment,
  getComments,
  updateComment,
  deleteComment,
  toggleLikeComment,
  getCommentLikes
} from "../controller/commentcontroller.js";

const router = express.Router();

router.post("/post/:postId", protectRoute, addComment);

router.get("/post/:postId", getComments);


router.post("/:commentId/like", protectRoute, toggleLikeComment);


router.get("/:commentId/likes", getCommentLikes);

router.put("/:commentId", protectRoute, updateComment);

router.delete("/:commentId", protectRoute, deleteComment);

export default router;
