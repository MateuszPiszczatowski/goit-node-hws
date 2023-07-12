const app = require("./app");

require("dotenv").config();
const mongoUrl = process.env.HOST_URL;
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.set("autoCreate", false);
require("./config/config-passport");
const storeImage = require("./controllers/users").storeImage;
const uploadDir = require("./utils/multerUpload").uploadDir;
const fs = require("fs").promises;

const isAccessible = (path) => {
  console.log(path);
  return fs
    .access(path)
    .then(() => true)
    .catch(() => false);
};

const createFolderIsNotExist = async (folder) => {
  if (!(await isAccessible(folder))) {
    await fs.mkdir(folder);
  }
};

mongoose
  .connect(mongoUrl)
  .then(async () => {
    await createFolderIsNotExist("public");
    await createFolderIsNotExist(storeImage);
    await createFolderIsNotExist(uploadDir);
    console.log("Database connection succesful");
    app.listen(3000, () => {
      console.log("Server running. Use our API on port: 3000");
    });
  })
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
