const Joi = require("joi");

const validateUser = (user) => {
  const userSchema = Joi.object({
    email: Joi.string().email(),
    password: Joi.string().pattern(/^(?=.*\d)(?=.*[A-Z])(?=.*[\W_]).{8,}$/),
  });
  const validation = userSchema.validate(user);
  return validation;
};

const validateContact = (contact) => {
  const contactSchema = Joi.object({
    name: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    phone: Joi.string()
      .pattern(
        /^(\+|0)?((((\d{2})+[ -]?)?\d{3}[ -]?\d{3}[ -]?\d{3})|((((\+?\d{2})+[ -]?)?\d{3}[ -]?\d{2}[ -]?\d{2})))$/
      )
      .required(),
    favorite: Joi.boolean().optional().default(false),
    owner: Joi.string().required(),
  });
  return contactSchema.validate(contact);
};

module.exports = {
  validateUser,
  validateContact,
};
