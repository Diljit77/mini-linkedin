import { getConnectedUsers, getSuggestedUsers, getUserprofile } from "../controller/usercontroller.js";
import protectRoute from "../middleware/authmiddleware.js";
import express from "express";

const router = express.Router();


router.get('/suggested', protectRoute, getSuggestedUsers);
router.get("/connected", protectRoute, getConnectedUsers);
router.get("/profile/:id",protectRoute,getUserprofile);
export default router;