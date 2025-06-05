// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//   doc_version : {type:Number, required: true, default: 1},
//   user_id: { type: String, required: true, unique: true },
//   user_type: { type: String, required: true, enum: ["slt", "drc", "ro"] },
//   username: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   role: { type: String, required: true, enum: ["user", "admin", "superadmin", "drc_admin", "drc_user"] },
//   created_by: { type: String, required: true },
//   created_on: { type: Date, default: Date.now },
//   user_status: { type: Boolean, required: true, default: true },
//   login_method: { type: String, required: true, enum: ["slt", "email", "facebook"] },
//   sequence_id: { type: Number },
//   drc_id: { type: Number, default: null },
//   ro_id: { type: Number, default: null },
// });

// // Create the User model
// const User = mongoose.model("User", userSchema);

// export default User;

import mongoose from "mongoose";

const remarkSchema = new mongoose.Schema({
  remark: { type: String, required: true },
  remark_by: { type: String, required: true },
  remark_dtm: { type: Date, default: Date.now },
});

const contacNoSchema = new mongoose.Schema({
    contactNo: {
        type: Number,
        required: true,
    }
});

const userSchema = new mongoose.Schema({
  doc_version: { type: Number, required: true, default: 1 },
  user_id: { type: String, required: true, unique: true },
  user_type: { type: String, required: true, enum: ["slt", "drc", "ro"] },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["user", "admin", "superadmin", "drc_admin", "drc_user"] },
  created_by: { type: String, required: true },
  created_on: { type: Date, default: Date.now },
  user_status: { type: Boolean, required: true, default: true },
  login_method: { type: String, required: true, enum: ["slt", "email", "facebook"] },
  sequence_id: { type: Number },
  drc_id: { type: Number, default: null },
  ro_id: { type: Number, default: null },
  drc_user_id: {type: Number, default: null},
  user_status_type: {type: String, enum:['user_update', 'drc_update', 'ro_update']},
  user_status: { type: String, enum: ['enable', 'disable'], required: true, default: 'enable'},
  user_status_on: { type: Date, required: true },
  user_status_by: { type: String, required: true },
  user_end_dtm: { type: Date, default: null},
  user_end_by: { type: String, default: null },
  approved_by: { type: String, default: null },
  approved_on: { type: Date, default: null },
  contactNo: [contacNoSchema],
  remark: [remarkSchema],
});

// Create the User model
const User = mongoose.model("User", userSchema);

export default User;
