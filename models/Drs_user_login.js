import mongoose from "mongoose";

const loginDetailsSchema = new mongoose.Schema({
  user_id: {
    type: Number,
    required: true,
  },
  username: {
    type: String,
    required: true,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    maxlength: 100,
  },
}, { _id: false });

const userSchema = new mongoose.Schema({
  doc_version: {
    type: Number,
    required: true,
    default: 1,
  },
  user_login_id: {
    type: String,
    required: true,
    unique: true,
  },
  user_nic: {
    type: String,
    required: true,
    maxlength: 30,
  },
  login_details: {
    type: loginDetailsSchema,
    required: true,
  },
}, {
  timestamps: true,
  collection: "Drs_user_login",
});

const Drs_user_login = mongoose.model("Drs_user_login", userSchema);

export default Drs_user_login;
