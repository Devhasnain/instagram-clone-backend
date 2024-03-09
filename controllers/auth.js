const { Router } = require("express");
const { ErrorHandler, ResHandler } = require("../utliz/ResponseHandlers");
const {
  loginSchema,
  registerSchema,
} = require("../utliz/AuthValidationSchema");
const usersSchema = require("../database/models/User");
const bcrypt = require("bcrypt");
const Jwt = require("jsonwebtoken");
const {
  userPostsPopulation,
  userPostLikePopulation,
  userStoryPopulation,
} = require("../utliz/constants");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

const route = Router();

route.post("/login", async (req, res) => {
  try {
    const body = await loginSchema.safeParseAsync(req.body);

    if (body.error) {
      throw new Error(body.error);
    }

    const { email, password } = body.data;

    const findUser = await usersSchema.findOne({ email });

    if (!findUser) {
      throw new Error("User not found.");
    }

    let matchPassword = await bcrypt.compare(
      password,
      findUser?.password ?? ""
    );

    if (!matchPassword) {
      throw new Error("Incorrect Email or Password");
    }
    let ip = req.ip;
    let user_agent = req.get("user-agent");
    let newSession = {
      ip,
      user_agent,
    };
    let sessions = [...findUser.devices, newSession];

    findUser.devices = sessions;
    await findUser.save();

    let token = Jwt.sign(
      { _id: findUser?._id ?? "", email: findUser?.email ?? "" },
      JWT_SECRET
    );

    let payload = {
      token,
    };

    return ResHandler(payload, req, res);
  } catch (error) {
    return ErrorHandler(error, req, res);
  }
});

route.post("/register", async (req, res) => {
  try {
    const body = await registerSchema.safeParseAsync(req.body);

    if (body.error) {
      throw new Error(body.error);
    }

    const { email, password } = body.data;

    const checkDubEmail = await usersSchema.findOne({ email });

    if (checkDubEmail) {
      throw new Error("Email is already in use.");
    }

    let hash = await bcrypt.hash(password, 12);
    const user_agent = req.get("user-agent");
    let ip = req.ip;

    let newUser = await usersSchema.create({
      ...body.data,
      password: hash,
      ip,
      user_agent,
      devices: [
        {
          ip,
          user_agent,
        },
      ],
    });

    let token = Jwt.sign(
      { _id: newUser?._id ?? "", email: newUser?.email ?? "" },
      JWT_SECRET
    );

    let payload = {
      token,
    };

    return ResHandler(payload, req, res);
  } catch (error) {
    return ErrorHandler(error, req, res);
  }
});

route.get("/refresh", async (req, res) => {
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
      .populate(userPostLikePopulation)
      .populate(userPostsPopulation)
      .populate(userStoryPopulation)
      .lean()
      .exec();

    if (!payload) {
      throw new Error("Authentication faild.");
    }

    return ResHandler(payload, req, res);
  } catch (error) {
    return ErrorHandler(error, req, res);
  }
});

module.exports = route;
