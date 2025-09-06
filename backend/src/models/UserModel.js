import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, null: false },

    bio: { type: String },
    profilePic: {
      type: String,
      default:
        "https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg"
    },


    title: { type: String, default: "" }, 
    skills: [{ type: String }], 
    education: [
      {
        school: String,
        degree: String,
        fieldOfStudy: String,
        startYear: Number,
        endYear: Number,
        description: String
      },
    ],
    experience: [
      {
        company: String,
        position: String,
        role: String,
        startDate: Date,
        endDate: Date,
        current: { type: Boolean, default: false },
        description: String,
      },
    ],
    location: {
      city: String,
      country: String,
    },
    contactInfo: {
      phone: String,
      website: String,
      github: String,
      linkedin: String,
      twitter: String,
    },
    socialLinks: {
      portfolio: String,
      behance: String,
      dribbble: String,
      medium: String,
    },

    isOnboarded: { type: Boolean, default: false },
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;