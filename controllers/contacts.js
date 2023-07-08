const contactsService = require("../services/contacts");
const Contact = require("../services/schemas/contact");
const getContacts = async (req, res, next) => {
  try {
    res.json(await contactsService.get());
  } catch (e) {
    console.log(e.message);
    next(e);
  }
};

const getContactById = async (req, res, next) => {
  try {
    const contact = await contactsService.getById(req.params.id);
    if (contact) {
      res.json(contact);
      return;
    }
    res.status(404).json({ message: "Not found" });
  } catch (e) {
    console.log(e.message);
    next(e);
  }
};

const addContact = async (req, res, next) => {
  try {
    const contact = req.body;
    const addResult = await contactsService.add(contact);
    res.status(addResult._id ? 201 : 400).json(addResult.message);
  } catch (e) {
    console.log(e.message);
    next(e);
  }
};

const deleteContact = async (req, res, next) => {
  try {
    const removed = await contactsService.remove(req.params.id);
    if (removed._id) {
      res.json({ message: "contact deleted" });
      return;
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
    const contactInvalidity = isContactInvalid(contact);
    if (contactInvalidity) {
      res.status(400).json(contactInvalidity);
    }

    const updateResult = await contactsService.update(req.params.id, prepareContact(contact));
    if (updateResult._id) {
      res.status(200).json(updateResult);
      return;
    }
    res.status(404).json(updateResult);
    return;
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
    const patchResult = await contactsService.update(req.params.id, {
      favorite: isFavorite,
    });
    res.status(patchResult._id === undefined ? 404 : 200).json(patchResult);
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
