// middlewares/protectRoute.js
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";

import dotenv from "dotenv";
dotenv.config();


const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id); // ✅ Correct field

    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user; // You could also just attach req.userId = user._id
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default protectRoute;



