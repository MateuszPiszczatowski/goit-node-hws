const usersController = require("../../controllers/users");
const express = require("express");
const router = express.Router();

router.post(
  "/signup",
  usersController.validateUserData,
  usersController.validateAndEncryptMiddleware,
  usersController.signup
);

router.post("/login", usersController.login);

router.get("/logout", usersController.tokenAuth, usersController.logout);

router.get("/current", usersController.tokenAuth, usersController.current);

module.exports = router;
