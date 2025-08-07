// backend/routes/authRoutes.js
import express from "express";
import { login, getCurrentUser, signup, onboarding } from "../controller/authcontroller.js";
import protectRoute from "../middleware/authmiddleware.js";
import upload from "../middleware/upload.js";


const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.put("/onboarding/:userId", upload.single("profilePic"), onboarding);
router.get("/me", protectRoute, getCurrentUser);

export default router;
