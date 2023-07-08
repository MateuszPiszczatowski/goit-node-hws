const contactsController = require("../../controllers/contacts");
const express = require("express");
const router = express.Router();

router.get("/", contactsController.getContacts);

router.get("/:id", contactsController.getContactById);

router.post("/", contactsController.addContact);

router.delete("/:id", contactsController.deleteContact);

router.put("/:id", contactsController.updateContact);

router.patch("/:id/favorite", contactsController.setFavorite);

module.exports = router;
