const { Schema, model } = require("mongoose");

const user = new Schema(
  {
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    email: {
      type: String,
      minlength: 3,
      maxlength: 80,
      match: [
        /^[a-zA-Z0-9]+([.\-_]?[a-zA-Z0-9])*@[a-zA-Z0-9]+(-?[a-zA-Z0-9])*\.[a-zA-Z]{2,}$/,
        "Email address must be in proper format e. 'xyz@xyz.xyz'",
      ],
      required: "Email address is required",
      unique: true,
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    avatarURL: String,
    token: {
      type: String,
      default: null,
    },
  },
  { versionKey: false, timestamps: true }
);

const User = model("user", user, "users");
module.exports = User;
