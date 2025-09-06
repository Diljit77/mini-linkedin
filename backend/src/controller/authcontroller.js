// backend/controllers/authController.js

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import dotenv from "dotenv";
dotenv.config();

import streamifier from "streamifier"; 
import cloudinary from "../config/cloudinary.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
     
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res
      .cookie("token", token, { httpOnly: true })
      .status(201)
      .json({ message: "User registered successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res
      
      .status(200)
      .json({ message: "Login successful", user,token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



export const onboarding = async (req, res) => {
  try {
    const { userId } = req.params;
   
    const parseIfString = (value) => {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (e) {
          return value; 
        }
      }
      return value;
    };

    const {
      name,
      title,
      bio,
      skills,
      education,
      experience,
      location,
      contactInfo,
      socialLinks
    } = req.body;

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(400).json({ message: "User does not exist" });
    }

    let profilePicUrl = existingUser.profilePic;

   
    if (req.file) {
      const streamUpload = (req) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream((error, result) => {
            if (result) resolve(result);
            else reject(error);
          });
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };

      const result = await streamUpload(req);
      profilePicUrl = result.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name: name || existingUser.name,
        title: title || existingUser.title,
        bio: bio || existingUser.bio,
        skills: parseIfString(skills) || existingUser.skills,
        education: parseIfString(education) || existingUser.education,
        experience: parseIfString(experience) || existingUser.experience,
        location: parseIfString(location) || existingUser.location,
        contactInfo: parseIfString(contactInfo) || existingUser.contactInfo,
        socialLinks: parseIfString(socialLinks) || existingUser.socialLinks,
        profilePic: profilePicUrl,
        isOnboarded: true,
      },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "User onboarded successfully", user: updatedUser });
  } catch (err) {
    console.log("Onboarding Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};





export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
   
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
