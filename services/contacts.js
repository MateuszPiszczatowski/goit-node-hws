const common = require("./common");
const Contact = require("./schemas/contact");

const get = async () => await common.getData(Contact);
const getById = async (id) => await common.getDataById(Contact, id);
const add = async (newContact) => await common.addData(Contact, newContact);
const update = async (id, newContact) => await common.updateData(Contact, id, newContact);
const remove = async (id) => await common.deleteData(Contact, id);

module.exports = {
  get,
  getById,
  add,
  update,
  remove,
};
