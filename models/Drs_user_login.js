import mongoose from "mongoose";

const loginDetailsSchema = new mongoose.Schema({
  user_id: Number,
  username: String,
  email: String,
});

const DrsUserLoginSchema = new mongoose.Schema({
  doc_version: Number,
  user_login_id: String,
  user_nic: String,
  login_details: loginDetailsSchema,
});

export default mongoose.model("Drs_user_login", DrsUserLoginSchema, "Drs_user_login");