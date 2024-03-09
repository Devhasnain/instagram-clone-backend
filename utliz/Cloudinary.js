const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PostStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "post",
    allowed_formats: ["jpg", "jpeg", "png", "avi"],
  },
});

const StoryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "story",
    resource_type: "auto",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "avi","mp4", "webm"],
  },
});

const UserStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "user",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const ReelStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "video",
    allowed_formats: ["jpg", "jpeg", "png", "avi"],
  },
});

const postFiles = multer({ storage: PostStorage }).array("files", 5);
const postStory = multer({ storage: StoryStorage }).array("files", 5);
const userImage = multer({ storage: UserStorage }).single("image");
const postReel = multer({ storage: ReelStorage }).single("reel");
const storage = multer.memoryStorage();
const bufferUploader = multer({ storage: storage }).array("files", 5);

module.exports = { postFiles, postReel, userImage, bufferUploader, postStory };
