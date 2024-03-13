const { Router } = require("express");
const router = Router();
const authController = require("./controllers/auth");
const userController = require("./controllers/user");
const postController = require("./controllers/post");
const commentController = require("./controllers/comment");

router.use("/auth", authController);
router.use("/user", userController);
// router.use("/friend", postController);
router.use("/post", postController);

router.use("/comment", commentController);

module.exports = router;
