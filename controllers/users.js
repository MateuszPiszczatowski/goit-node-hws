const usersService = require("../services/users");
const validators = require("../utils/validators");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const path = require("path");
const Jimp = require("jimp");
const nanoid = import("nanoid");
const sgMail = require("@sendgrid/mail");

require("dotenv").config();
const secret = process.env.SECRET;
sgMail.setApiKey(process.env.SENDGRID_KEY);
const gravatar = require("gravatar");
const fs = require("fs").promises;
const storeImage = path.join(process.cwd(), "public", "avatars");

const getUsers = async (req, res, next) => {
  try {
    res.json(await usersService.get());
  } catch (e) {
    next(e);
  }
};

const tokenAuth = async (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    const bearerString = req.get("Authorization");
    if (bearerString && bearerString !== "") {
      const bearer = [...bearerString];
      bearer.splice(0, 7);
      if (!user || err || user.token !== bearer.join("") || user.verify === false) {
        return res.status(401).json({ message: "Not Authorized" });
      }
      req.user = user;
      return next();
    }
    return res.status(401).json({ message: "Not Authorized, authorization header is missing" });
  })(req, res, next);
};

const sendToken = async (email, token) => {
  const msg = {
    to: email,
    subject: "Verification link for Contacts App",
    from: process.env.SENDGRID_EMAIL,
    text: `To verify click on the link: localhost:3000/api/users/verify/${token}`,
    html: `To verify click on the link: <a href="http://localhost:3000/api/users/verify/${token}">localhost:3000/api/users/verify/${token}</a>`,
  };
  await sgMail.send(msg);
};

const resendVerify = async (req, res, next) => {
  try {
    if (!req.body.email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const foundUser = await usersService.getByEmail(req.body.email);
    if (foundUser.length === 1) {
      const user = foundUser[0];
      if (user.verify === true) {
        return res.status(400).json({ message: "User already verified" });
      }
      await sendToken(user.email, user.verificationToken);
      return res.json();
    }
    if (foundUser.length > 1) {
      return res.status(500).json({
        message: "Multiple accounts with the same email, please contact with the administrator.",
      });
    }
    return res.status(404).json({ message: "Not Found" });
  } catch (e) {
    return next(e);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const foundUser = await usersService.getByEmailToken(req.params.verificationToken);
    if (foundUser.length === 1) {
      const user = foundUser[0];
      const updateResult = await usersService.update(user._id, {
        verificationToken: null,
        verify: true,
      });
      if (updateResult._id) {
        return res.json({ message: "Verification successful" });
      } else {
        return res.status(500).json({ message: updateResult });
      }
    }
    if (foundUser.length > 1) {
      return res.status(500).json({
        message:
          "Multiple accounts with the same verification token, please contact with the administrator.",
      });
    }
    return res.status(404).json({ message: "Not Found" });
  } catch (e) {
    return next(e);
  }
};

const logout = async (req, res, next) => {
  try {
    const user = req.user;
    user.token = null;
    await usersService.update(user._id, user);
    return res.status(204).json();
  } catch (e) {
    next(e);
  }
};

const current = async (req, res, next) => {
  try {
    const { email, subscription } = req.user;
    const payload = { email, subscription };
    return res.json(payload);
  } catch (e) {
    next(e);
  }
};

const login = async (req, res, next) => {
  try {
    if (req.body.email && req.body.password) {
      const user = (await usersService.getByEmail(req.body.email))[0];
      if (user) {
        if (user.verify === false) {
          return res.status(400).json({ message: "Must verify your email address first" });
        }
        if (bcrypt.compareSync(req.body.password, user.password)) {
          const payload = {
            id: user._id,
            subscription: user.subscription,
          };
          const token = jwt.sign(payload, secret);
          payload.token = token;
          user.token = token;
          await usersService.update(user._id, user);
          return res.json(payload);
        }
      }
    }
    res.status(400).json({ message: "Invalid user or password" });
  } catch (e) {
    next(e);
  }
};

const validateUserData = async (req, res, next) => {
  const newUser = req.body;
  const validationResult = validators.validateUser(newUser);
  if (validationResult.error) {
    const response = { errors: [] };
    for (const error of validationResult.error.details) {
      const errorPath = error.path.join(".");
      if (errorPath === "password") {
        response.errors.push({
          message:
            "Invalid password, requirements: 1 lower case letter; 1 upper case letter; 1 digit; 1 special character; minimum 8 characters",
        });
      } else if (errorPath === "email") {
        response.errors.push({
          message: "Invalid email, use email format as in the example: example@exam.ex",
        });
      } else {
        response.errors.push({ message: error.message });
      }
    }
    return res.status(400).json(response);
  }
  next();
};

const isUserEmailUnique = async (email) => {
  const foundWithEmail = await usersService.getByEmail(email);
  if (foundWithEmail[0]) {
    return false;
  }
  return true;
};

const encryptPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

const validateAndEncryptMiddleware = async (req, res, next) => {
  if (await isUserEmailUnique(req.body.email)) {
    req.body.password = encryptPassword(req.body.password);
    return next();
  }
  return res.status(409).json({ message: "Email already in use" });
};

const addVerificationToken = async (user) => {
  user.verificationToken = (await nanoid).nanoid();
  while ((await usersService.getByEmailToken(user.verificationToken))._id) {
    user.verificationToken = (await nanoid).nanoid();
  }
};

const signup = async (req, res, next) => {
  try {
    const user = req.body;
    if (user.email) {
      user.avatarURL = gravatar.url(user.email, { s: 200 });
    }
    await addVerificationToken(user);
    const addResult = await usersService.add(user);

    if (addResult._id) {
      await sendToken(user.email, user.verificationToken);
      return res
        .status(201)
        .json({ user: { email: addResult.email, subscription: addResult.subscription } });
    }
    return res.status(400).json(addResult.message);
  } catch (e) {
    next(e);
  }
};

const changeAvatar = async (req, res, next) => {
  try {
    const { path: temporaryName, originalname } = req.file;
    const currentNames = await fs.readdir(storeImage);
    let uniqueName = originalname;
    while (currentNames.includes(uniqueName)) {
      uniqueName = originalname;
      const extension = path.extname(uniqueName);
      uniqueName = uniqueName.slice(0, -extension.length);
      uniqueName = uniqueName + (await nanoid).nanoid() + extension;
    }
    const fileName = path.join(storeImage, uniqueName);
    try {
      const lenna = await Jimp.read(temporaryName);
      await lenna.resize(250, 250).quality(75).writeAsync(fileName);
      await fs.unlink(temporaryName);
      const updateResult = await usersService.update(req.user.id, { avatarURL: fileName });
      if (!updateResult._id) {
        fs.unlink(fileName);
        return res.status(500).json({ message: "error during updating user account" });
      }
    } catch (err) {
      await fs.unlink(temporaryName);
      return next(err);
    }
    return res.json({ message: "File uploaded successfully", status: 200 });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  getUsers,
  changeAvatar,
  login,
  signup,
  validateAndEncryptMiddleware,
  validateUserData,
  logout,
  tokenAuth,
  current,
  storeImage,
  resendVerify,
  verifyEmail,
};
