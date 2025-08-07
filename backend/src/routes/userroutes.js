import { getConnectedUsers, getSuggestedUsers } from "../controller/usercontroller.js";
import protectRoute from "../middleware/authmiddleware.js";
import express from "express";

const router = express.Router();


router.get('/suggested', protectRoute, getSuggestedUsers);
router.get("/connected", protectRoute, getConnectedUsers);

export default router;