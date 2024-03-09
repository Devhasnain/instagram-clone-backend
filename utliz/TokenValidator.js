const usersSchema = require("../database/models/User");
const { ErrorHandler } = require("./ResponseHandlers");
const Jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = async (req, res, next) => {
  try {
    let token = req.headers["authorization"];

    if (!token) {
      throw new Error("Authentication faild.");
    }

    let { _id, email } = Jwt.verify(token, JWT_SECRET);

    if (!_id || !email) {
      throw new Error("Authentication faild.");
    }

    let payload = await usersSchema
      .findOne({ _id, email })
      .select(["-password"])
      .lean()
      .exec();

    if (!payload) {
      throw new Error("Authentication faild.");
    }

    req.user = payload;
    next();
  } catch (error) {
    return ErrorHandler(error, req, res);
  }
};
