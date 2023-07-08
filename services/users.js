const common = require("./common");
const User = require("./schemas/user");

const get = async () => await common.getData(User);
const getById = async (id) => await common.getDataById(User, id);
const getByEmail = async (email) => await common.getData(User, { email: email });
const add = async (newUser) => await common.addData(User, newUser);
const update = async (id, newUser) => await common.updateData(User, id, newUser);
const remove = async (id) => await common.deleteData(User, id);

module.exports = {
  get,
  getById,
  getByEmail,
  add,
  update,
  remove,
};
