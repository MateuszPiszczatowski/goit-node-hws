const getData = async (DataSource, schema) => {
  if (schema) {
    return await DataSource.find(schema);
  }
  return await DataSource.find();
};

const getDataById = async (DataSource, id) => {
  try {
    return await DataSource.findById(id);
  } catch (_) {
    return { message: "Data not found" };
  }
};

const addData = async (DataSource, data) => {
  try {
    return await DataSource.create(new DataSource(data));
  } catch (error) {
    console.log(error);
    return { message: error };
  }
};

const deleteData = async (DataSource, id) => {
  try {
    return await DataSource.findByIdAndRemove(id);
  } catch (_) {
    return { message: "Data not found" };
  }
};

const updateData = async (DataSource, id, data) => {
  try {
    return await DataSource.findByIdAndUpdate(id, data);
  } catch (_) {
    return { message: "Not found" };
  }
};

module.exports = {
  getData,
  getDataById,
  addData,
  deleteData,
  updateData,
};
