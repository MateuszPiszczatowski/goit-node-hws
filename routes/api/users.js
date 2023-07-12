const usersController = require("../../controllers/users");
const express = require("express");
const router = express.Router();
const { upload } = require("../../utils/multerUpload");

router.post(
  "/signup",
  usersController.validateUserData,
  usersController.validateAndEncryptMiddleware,
  usersController.signup
);

router.post("/login", usersController.login);

router.get("/logout", usersController.tokenAuth, usersController.logout);

router.get("/current", usersController.tokenAuth, usersController.current);

router.patch(
  "/avatars",
  usersController.tokenAuth,
  upload.single("picture"),
  usersController.changeAvatar
);

module.exports = router;
