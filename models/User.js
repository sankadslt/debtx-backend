// import { Schema, model } from "mongoose";

// // Sub-schema for remarks
// const contactNumberSchema = new Schema({
//   contact_number: {
//     type: Number,
//     required: true,
//   },
  

// });

// // Sub-schema for remarks
// const remarkSchema = new Schema({
//   remark: {
//     type: String,
//     required: true
//   },
//   remark_dtm: {
//     type: Date, 
//     required: true
//   },
//   remark_by: {
//     type: String,
//     required: true
//   },
// });

// // Main schema for User
// const userSchema = new Schema(
//   {
//     doc_version : {
//       type:Number, 
//       required: true, 
//       default: 1
//     },
//     user_sequence: { 
//       type: Number, 
//       required: true, 
//       unique: true 
//     },
//     user_id: { 
//       type: String, 
//       required: true, 
//       unique: true 
//     },
//     user_type: { 
//       type: String, 
//       required: true, 
//       enum: ["slt", "DRCuser", "ro"] 
//     },
//     user_name: { 
//       type: String, 
//       required: true 
//     },
//     user_mail: { 
//       type: String, 
//       required: true, 
//       unique: true 
//     },
//     contact_number: { 
//       type: [contactNumberSchema], // Array of contact numbers
//       required: true,
//     },
//     login_method: { 
//       type: String, 
//       required: true,
//       enum: ["slt", "email", "mobile"]
//     },
//     user_roles: {
//       type: [], // Array of roles
//       required: true,
//     },
//     drc_id: { 
//       type: Number, 
//       required: true 
//     },
//     ro_id: { 
//       type: Number,
//       required: true
//     },
//     DRCuser_id: { 
//       type: String, 
//       required: true
//     },
//     user_status_type: { 
//       type: String, 
//       required: true, 
//       enum: ["user_update", "DRC_Update", "RO_update"] 
//     },
//     user_status: { 
//       type: String, 
//       required: true, 
//       enum: ["enabled", "disabled"] 
//     },
//     user_status_dtm:{
//       type: Date, 
//       required: true
//     },
//     user_status_by: {
//       type: String, 
//       required: true
//     },
//     user_end_dtm: { 
//       type: Date, 
//       default: null 
//     },
//     user_end_by: { 
//       type: String, 
//       default: null 
//     },
//     created_by: { 
//       type: String, 
//       required: true 
//     },
//     created_dtm: { 
//       type: Date, 
//       default: null
//     },
//     approved_by: { 
//       type: String, 
//       default: null 
//     },
//     approved_dtm: {
//       type: Date, 
//       default: null 
//     },
//     remark: { 
//       type: [remarkSchema], // Array of remarks
//       required: true,
//     },
//   },
//   {
//     timestamps: true, // Automatically manage createdAt and updatedAt fields
//      collection: "User",
//   }
// );

// // Create the User model
// const User = model("User", userSchema);

// export default User;

// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
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
  remark_on: { type: Date, default: Date.now },
}, { _id: false });

const contactNumberSchema = new Schema({
  contact_number: {
    type: Number,
    required: true,
    unique: true,
  },
});

const userSchema = new mongoose.Schema({
  User_Squnce: {type:Number, required: true, unique: true },
  user_id: { type: String, required: true, unique: true },
  user_type: { type: String, required: true, enum: ["Slt", "Drcuser", "ro"] },
  username: { type: String, required: true },
  User_Mail: { type: String, required: true, unique: true },
  contact_num: [contactNumberSchema],  // Array of contact numbers
  login_method: { type: String, required: true, enum: ["slt", "gmail", "mobile"] },
  role: [{ type: String, required: true,  enum: ["GM", "DGM", "legal_officer", "manager", "slt_coordinator", "DRC_user", "recovery_staff", "rtom", "superadmin"] }], // Array of roles
  drc_id: { type: Number, unique: true, default: null },
  ro_id: { type: Number, unique: true, default: null },
  DRCuser_ID: { type: String, unique:true, default: null },
  User_Status_Type: { type: String, enum: ["user_update", "DRC_Update", "RO_update"], default: "user_update" },
  user_status: { type: Boolean, default: true },
  User_Status_On: { type: Date },
  User_Status_By: { type: String },
  User_End_DTM: { type: Date },
  User_End_By: { type: String },
  Created_BY: { type: String, required: true },
  Created_ON: { type: Date, default: Date.now },
  Approved_By: { type: String },
  Approved_On: { type: Date },
  Remark: [remarkSchema],  // Array of remark objects
});

const User = mongoose.model("User", userSchema);

export default User;
