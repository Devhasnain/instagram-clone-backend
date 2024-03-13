const { Router } = require("express");
const { ErrorHandler, ResHandler } = require("../utliz/ResponseHandlers");
const usersSchema = require("../database/models/User");
const {
  extractInfo,
  populateLikes,
  populateComments,
  populateShares,
  populateUser,
} = require("../utliz/constants");
const TokenValidator = require("../utliz/TokenValidator");
const route = Router();

route.use(TokenValidator);

route.get("/get/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let auth = req.user;

    if (!id) {
      throw new Error("bad request");
    }

    let user = await usersSchema.findById(id).select(extractInfo).lean();

    if (!user) {
      throw new Error("User not found");
    }

    if (user.is_private) {
      let isFriend =
        user?.following?.length && user?.following?.includes(auth._id);
      if (isFriend) {
        let userProfileInfo = await usersSchema
          .findById(user._id)
          .select(extractInfo)
          .populate({
            path: "posts",
            populate: [
              populateUser,
              populateLikes,
              populateComments,
              populateShares,
            ],
          });
        let payload = {
          msg: "success",
          user: userProfileInfo,
        };
        return ResHandler(payload, req, res);
      }
    }

    let userProfileInfo = await usersSchema
      .findById(user._id)
      .select(extractInfo)
      .populate({
        path: "posts",
        populate: [
          populateUser,
          populateLikes,
          populateComments,
          populateShares,
        ],
      });
    let payload = {
      msg: "success",
      user: userProfileInfo,
    };

    return ResHandler(payload, req, res);
  } catch (error) {
    return ErrorHandler(error, req, res);
  }
});

module.exports = route;
