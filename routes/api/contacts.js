const contactsController = require("../../controllers/contacts");
const usersController = require("../../controllers/users");
const express = require("express");
const router = express.Router();

router.get("/", usersController.tokenAuth, contactsController.getContacts);

router.get("/:id", usersController.tokenAuth, contactsController.getContactById);

router.post("/", usersController.tokenAuth, contactsController.addContact);

router.delete("/:id", usersController.tokenAuth, contactsController.deleteContact);

router.put("/:id", usersController.tokenAuth, contactsController.updateContact);

router.patch("/:id/favorite", usersController.tokenAuth, contactsController.setFavorite);

module.exports = router;
