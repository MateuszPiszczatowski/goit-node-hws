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
    let message;
    if (error.errors) {
      message = Object.keys(error.errors).reduce(
        (acc, errorKey) => acc + `${error.errors[errorKey]}; `,
        ""
      );
    } else {
      message = error;
    }
    return { message: message };
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
