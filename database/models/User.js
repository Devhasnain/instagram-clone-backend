const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    username: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String },
    ip: { type: String },
    user_agent: { type: String },
    devices: [
      {
        ip: { type: String },
        user_agent: { type: String },
        date: { type: Date, default: Date.now },
      },
    ],
    bio: { type: String },
    number: { type: String },
    gender: { type: String },
    is_private: { type: Boolean },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    stories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Story",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const usersSchema = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = usersSchema;
