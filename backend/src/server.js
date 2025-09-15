import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";   // ✅ needed for socket + express
import connectDB from "./config/db.js";
import authRoutes from "./routes/authroutes.js";
import userRoutes from "./routes/userroutes.js";
import postRoutes from "./routes/postroutes.js";
import connectionRoutes from "./routes/connectionroutes.js";
import commentRoutes from "./routes/commentroutes.js";
import { initSocket } from "./utils/socket.js";
import messageRoutes from "./routes/messageroutes.js";
import notifcationROutes from "./routes/notificationroutes.js"; 
dotenv.config();
connectDB();

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL, 
       credentials: true
  
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/messages", messageRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notifcationROutes);
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initSocket(server);


server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
