const { Router } = require("express");
const TokenValidator = require("../utliz/TokenValidator");
const Post = require("../database/models/Post");
const Comment = require("../database/models/Comment");
const { ResHandler, ErrorHandler } = require("../utliz/ResponseHandlers");
const Reply = require("../database/models/Reply");

const route = Router();

route.use(TokenValidator);

route.post("/create/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let body = req.body;
    let user = req.user;

    if (!id) {
      throw new Error("Bad Request");
    }

    if (!body?.text) {
      throw new Error("Please write a comment.");
    }

    let post = await Post.findById(id);

    if (!post) {
      throw new Error("Post Not Found.");
    }

    if (!post.allow_comments) {
      throw new Error("Comments not allowed.");
    }

    let comment = await Comment.create({
      user: user._id,
      post: id,
      ...body,
    });

    post.comments = [...post.comments, comment._id];
    await post.save();

    let payload = {commentID:comment._id};
    return ResHandler(payload, req, res);
  } catch (error) {
    return ErrorHandler(error, req, res);
  }
});

route.put("/reply/:id", async (req, res) => {
  try {
    let user = req.user;
    let { id } = req.params;
    let body = req.body;

    if (!id) {
      throw new Error("Bad Request");
    }

    let comment = await Comment.findById(id);

    if (!comment) {
      throw new Error("Comment not Found.");
    }

    let reply = await Reply.create({
      user: user._id,
      comment: id,
      ...body,
    });

    comment.replies = [...comment.replies, reply._id];
    await comment.save();

    return ResHandler({}, req, res);
  } catch (error) {
    return ErrorHandler(error, req, res);
  }
});

route.put("/like/:id", async (req, res) => {
  try {
    let user = req.user;
    let { id } = req.params;

    if (!id) {
      throw new Error("Bad Request");
    }

    let comment = await Comment.findById(id);

    let hasLiked = comment?.likes?.findIndex(
      (item) => item.toString() === user?._id?.toString()
    );

    if (hasLiked !== -1) {
      comment.likes.splice(hasLiked, 1);
    }

    if (hasLiked === -1) {
      comment.likes.push(user._id);
    }

    await comment.save();

    return ResHandler({}, req, res);
  } catch (error) {
    return ErrorHandler(error, req, res);
  }
});

route.put("/unlike/:id", async (req, res) => {
  try {
    let user = req.user;
    let { id } = req.params;

    if (!id) {
      throw new Error("Bad Request");
    }
    await Comment.findByIdAndUpdate(id, {
      $pull: { likes: { $in: [user._id] } },
    });

    return ResHandler({}, req, res);
  } catch (error) {
    return ErrorHandler(error, req, res);
  }
});

route.put("/reply/like/:id", async (req, res) => {
  try {
    let user = req.user;
    let { id } = req.params;

    if (!id) {
      throw new Error("Bad Request");
    }
    await Reply.findByIdAndUpdate(id, { $addToSet: { likes: user._id } });

    return ResHandler({}, req, res);
  } catch (error) {
    return ErrorHandler(error, req, res);
  }
});

route.put("/reply/unlike/:id", async (req, res) => {
  try {
    let user = req.user;
    let { id } = req.params;

    if (!id) {
      throw new Error("Bad Request");
    }
    await Reply.findByIdAndUpdate(id, {
      $pull: { likes: { $in: [user._id] } },
    });

    return ResHandler({}, req, res);
  } catch (error) {
    return ErrorHandler(error, req, res);
  }
});

route.delete("/delete/:id", async (req, res) => {
  try {
    let { id } = req.params;

    if (!id) {
      throw new Error("Bad Request");
    }

    let comment = await Comment.findById(id);

    await Promise.all(
      comment.replies.map(async (item) => {
        await Reply.findByIdAndDelete(item._id);
      })
    );

    await Comment.findByIdAndDelete(id);

    return ResHandler({}, req, res);
  } catch (error) {
    return ErrorHandler(error, res, res);
  }
});

route.delete("/:commentID/reply/delete/:replyID", async (req, res) => {
  try {
    let { commentID, replyID } = req.params;

    if (!commentID || !replyID) {
      throw new Error("Bad Request");
    }

    let comment = await Comment.findById(commentID);

    if (!comment) {
      throw new Error("Comment not Found");
    }

    await Comment.findByIdAndUpdate(commentID, {
      $pull: { replies: { $in: [replyID] } },
    });

    await Reply.findByIdAndDelete(replyID);

    await Comment.findByIdAndDelete(commentID);

    return ResHandler({}, req, res);
  } catch (error) {
    return ErrorHandler(error, res, res);
  }
});

module.exports = route;
