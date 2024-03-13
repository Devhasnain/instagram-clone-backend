const { Router } = require("express");
const { ErrorHandler, ResHandler } = require("../utliz/ResponseHandlers");
const Post = require("../database/models/Post");
const TokenValidator = require("../utliz/TokenValidator");
const { postFiles, postReel, postStory } = require("../utliz/Cloudinary");
const usersSchema = require("../database/models/User");
const Story = require("../database/models/Story");
const {
  populateComments,
  populateUser,
  populateLikes,
  populatePostShares,
  populateShares,
} = require("../utliz/constants");
const cloudinary = require("cloudinary").v2;
const route = Router();

route.use(TokenValidator);

route.get("/get/all", async (req, res) => {
  try {
    let posts = await Post.find()
      .populate(populateComments)
      .populate(populateUser)
      .populate(populateLikes)
      .populate(populateShares)
      .lean()
      .exec();
    let payload = {
      posts,
    };
    return ResHandler(payload, req, res);
  } catch (error) {
    return ErrorHandler(error, req, res);
  }
});

route.get("/get/all/:userID", async (req, res) => {
  try {
    let { userID } = req.params;
    let posts = await Post.find({ user: userID })
      .populate(populateComments)
      .populate(populateUser)
      .populate(populateLikes)
      .lean()
      .exec();
    let payload = {
      posts,
    };
    return ResHandler(payload, req, res);
  } catch (error) {
    return ErrorHandler(error, req, res);
  }
});

route.put("/like/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let user = req.user;

    if (!id) {
      throw new Error("Bad Request");
    }

    let post = await Post.findById(id);

    if (!post) {
      throw new Error("Bad Request");
    }

    let hasLiked = post?.likes?.findIndex((item) => item.toString() === user?._id?.toString());
    
    if (hasLiked !== -1) {
      post.likes.splice(hasLiked, 1);
    }
    
    if (hasLiked === -1) {
      post.likes.push(user._id);
    }

    await post.save();

    return ResHandler({}, req, res);
  } catch (error) {
    return ErrorHandler(error, req, res);
  }
});

route.put("/unlike/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let user = req.user;
    if (!id) {
      throw new Error("Bad Request");
    }
    await Post.findByIdAndUpdate(id, {
      $pull: { likes: { $in: [user._id] } },
    });

    return ResHandler({}, req, res);
  } catch (error) {
    return ErrorHandler(error, req, res);
  }
});

route.post("/create", postFiles, async (req, res) => {
  try {
    let body = req.body;
    let user = req.user;
    let images =
      req?.files?.filter((item) => ({
        path: item.path,
        filename: item.filename,
      })) ?? [];

    if (images?.length < 1) {
      throw new Error("Please select images to create a post.");
    }

    let newPost = await Post.create({
      user: user._id,
      type: "post",
      images,
      ...body,
    });

    await usersSchema.findByIdAndUpdate(user._id, {
      $push: { posts: newPost._id },
    });

    let post = await Post.findById(newPost._id)
      .populate(populateComments)
      .populate(populateUser)
      .populate(populateLikes)
      .lean()
      .exec();

    let payload = {
      msg: "New post has been created successfuly.",
      post,
    };

    return ResHandler(payload, req, res);
  } catch (error) {
    console.log(error);
    return ErrorHandler(error, req, res);
  }
});

route.post("/create/story", postStory, async (req, res) => {
  try {
    let body = req.body;
    let user = req.user;
    let assets =
      req.files.filter((item) => ({
        mimetype: item.mimetype,
        path: item.path,
        filename: item.filename,
      })) ?? [];

    if (assets?.length < 1) {
      throw new Error("Please select assets to create a post.");
    }

    let story = await Story.create({
      user: user._id,
      assets,
      ...body,
    });

    await usersSchema.findByIdAndUpdate(user._id, {
      $push: { stories: story._id },
    });

    let payload = {
      msg: "New post has been created successfuly.",
      story,
    };

    return ResHandler(payload, req, res);
  } catch (error) {
    console.log(error.message);
    return ErrorHandler(error, req, res);
  }
});

route.post("/create/reel", postReel, async (req, res) => {
  try {
    let body = req.body;
    let user = req.user;
    let images = req.files.filter((item) => ({
      path: item.path,
      filename: item.filename,
    }));
    let post = await Post.create({
      user: user._id,
      images,
      ...body,
    });

    await usersSchema.findByIdAndUpdate(user._id, {
      $push: { posts: post._id },
    });

    let payload = {
      msg: "New post has been created successfuly.",
      post,
    };

    return ResHandler(payload, req, res);
  } catch (error) {
    return ErrorHandler(error, req, res);
  }
});

route.get("/get/:id", async (req, res) => {
  try {
    let { id } = req.params;
    console.log(id);
    if (!id) {
      throw new Error("Bad Request");
    }
    let post = await Post.findById(id);
    return res.status(200).json(post);
  } catch (error) {
    return ErrorHandler(error, req, res);
  }
});

route.delete("/delete/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let user = req.user;
    if (!id) {
      throw new Error("Bad Request");
    }

    let post = await Post.findById(id);

    if (!post) {
      throw new Error("Post not found.");
    }

    let images = [];

    post.images.forEach((item) => {
      images.push(item.filename);
    });

    await cloudinary.api.delete_resources(images, {
      type: "upload",
      resource_type: "image",
    });

    await Post.findByIdAndDelete(id);

    await usersSchema.findByIdAndUpdate(user._id, { $pull: { posts: id } });

    let payload = {
      msg: "Post has been deleted successfuly.",
    };

    return ResHandler(payload, req, res);
  } catch (error) {
    console.log(error);
    return ErrorHandler(error, req, res);
  }
});

module.exports = route;
