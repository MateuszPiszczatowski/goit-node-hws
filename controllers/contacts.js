const contactsService = require("../services/contacts");
const Contact = require("../services/schemas/contact");
const validators = require("../utils/validators");

const getContacts = async (req, res, next) => {
  try {
    res.json(await contactsService.getByOwner(req.user.id));
  } catch (e) {
    console.log(e.message);
    next(e);
  }
};

const getContactById = async (req, res, next) => {
  try {
    const contact = await contactsService.getById(req.params.id);
    if (contact) {
      if (contact.owner === req.user.id) {
        res.json(contact);
        return;
      }
      return res.status(401).json({ message: "Not Authorized" });
    }
    return res.status(404).json({ message: "Not found" });
  } catch (e) {
    console.log(e.message);
    next(e);
  }
};

const addContact = async (req, res, next) => {
  try {
    const contact = req.body;
    contact.owner = req.user.id;
    const addResult = await contactsService.add(contact);
    return res.status(addResult._id ? 201 : 400).json(addResult);
  } catch (e) {
    console.log(e.message);
    return next(e);
  }
};

const deleteContact = async (req, res, next) => {
  try {
    const foundContact = await contactsService.getById(req.params.id);
    if (foundContact) {
      if (`${foundContact.owner}` === req.user.id) {
        const removed = await contactsService.remove(req.params.id);
        if (removed._id) {
          return res.json({ message: "contact deleted" });
        }
        return res.status(400).json({ removed });
      }
      return res.status(401).json({ message: "Not Authorized" });
    }
    res.status(404).json({ message: "Not found" });
  } catch (e) {
    console.log(e.message);
    next(e);
  }
};

const isContactInvalid = (contact) => {
  const newContact = new Contact(contact);
  const validationError = newContact.validateSync();
  if (validationError) {
    return { message: validationError.message };
  }
  return false;
};

const prepareContact = (contact) => {
  const newContact = new Contact(contact);
  const { _id, ...preparedContact } = newContact.toObject();
  return preparedContact;
};

const updateContact = async (req, res, next) => {
  try {
    const contact = req.body;
    contact.owner = req.user.id;
    const contactInvalidity = isContactInvalid(contact);
    if (!validators.validateContact(contact)) {
      res.status(400).json(contactInvalidity);
    }
    const foundContact = await contactsService.getById(req.params.id);
    if (`${foundContact.owner}` === req.user.id) {
      const updateResult = await contactsService.update(req.params.id, prepareContact(contact));
      if (updateResult._id) {
        return res.status(200).json(updateResult);
      }
      return res.status(404).json(updateResult);
    }
    return res.status(401).json({ message: "Not Authorized" });
  } catch (e) {
    console.log(e.message);
    next(e);
  }
};

const setFavorite = async (req, res, next) => {
  try {
    const isFavorite = req.body.favorite;
    if (isFavorite === undefined) {
      res.status(400).json({ message: "missing field favorite" });
      return;
    }
    const foundContact = await contactsService.getById(req.params.id);
    if (`${foundContact.owner}` === req.user.id) {
      const patchResult = await contactsService.update(req.params.id, {
        favorite: isFavorite,
      });
      return res.status(patchResult._id === undefined ? 404 : 200).json(patchResult);
    }
    return res.status(401).json({ message: "Not Authorized" });
  } catch (e) {
    console.log(e.message);
    next(e);
  }
};

module.exports = {
  getContacts,
  getContactById,
  addContact,
  deleteContact,
  updateContact,
  setFavorite,
};
