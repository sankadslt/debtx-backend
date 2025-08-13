import mongoose from "mongoose";

const userLoginSchema = new mongoose.Schema({
  user_login_id: String,
  create_on: Date,
  end_dtm: Date,
});

const userContactNumSchema = new mongoose.Schema({
  contact_number: String,
  create_on: Date,
  end_dtm: Date,
});

const roleSchema = new mongoose.Schema({
  role_name: String,
  start_dtm: Date,
  end_dtm: Date,
});

const userProfileSchema = new mongoose.Schema({
  username: String,
  email: String,
  user_nic: String,
  user_designation: String,
});

const userStatusSchema = new mongoose.Schema({
  status: String,
  status_reason: String,
  status_on: Date,
  status_by: String,
});

const lastUserRefSchema = new mongoose.Schema({
  User_1_id: { type: mongoose.Schema.Types.Mixed, default: null },
  User_2_id: { type: mongoose.Schema.Types.Mixed, default: null },
});

const drcDetailsSchema = new mongoose.Schema({
  drc_id: { type: mongoose.Schema.Types.Mixed, default: null },
  ro_id: { type: mongoose.Schema.Types.Mixed, default: null },
});

const DrsUserSchema = new mongoose.Schema({
  doc_version: Number,
  user_id: Number,
  user_type: String,
  last_user_ref: lastUserRefSchema,
  user_login: [userLoginSchema],
  User_profile: userProfileSchema,
  user_contact_num: [userContactNumSchema],
  role: [roleSchema],
  drc_details: drcDetailsSchema,
  user_status: userStatusSchema,
  user_remark: { type: mongoose.Schema.Types.Mixed, default: null },
  create_by: String,
  create_on: Date,
  Approve_by: { type: mongoose.Schema.Types.Mixed, default: null },
  Approve_on: { type: mongoose.Schema.Types.Mixed, default: null },
});

export default mongoose.model("Drs_user", DrsUserSchema, "Drs_user");