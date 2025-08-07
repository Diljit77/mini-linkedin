import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true ,null:false},
    bio: { type: String },
    isOnboarded: { type: Boolean, default: false },
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    profilePic: { type: String, default: "" }, // Default avatar
  },
  { timestamps: true }
);

const User=mongoose.model("User", userSchema);
export default User;
