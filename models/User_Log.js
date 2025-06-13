import mongoose, { Schema, model } from "mongoose";

// Sub-schema for Contact Numbers
const contactNumberSchema = new Schema({
  contact_number: {
    type: Number,
    required: true,
  },
});

// Sub-schema for remarks
const remarkSchema = new Schema({
  remark: {
    type: String,
    required: true
  },
  remark_dtm: {
    type: Date, 
    required: true
  },
  remark_by: {
    type: String,
    required: true
  },
});

// Main schema for User
const userSchema = new Schema(
  {
    doc_version : {
      type:Number, 
      required: true, 
      default: 1
    },
    User_Sequence: { 
      type: Number, 
      required: true, 
      unique: true 
    },
    user_id: { 
      type: String, 
      required: true, 
      unique: true 
    },
    user_type: { 
      type: String, 
      required: true, 
      enum: ["Slt", "Drcuser", "ro"] 
    },
    username: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true 
    },
    contact_num: { 
      type: [contactNumberSchema],
    },
    login_method: { 
      type: String, 
      required: true,
      enum: ["slt", "gmail", "mobile"]
    },
    role: {
      type: String,
      enum: ["GM", "DGM", "legal_officer", "manager", "slt_coordinator", "DRC_user", "recovery_staff", "rtom"],
      required: true,
    },
    drc_id: { 
      type: Number, 
      required: true 
    },
    ro_id: { 
      type: Number,
      required: true
    },
    DRCuser_ID: { 
      type: String, 
      required: true
    },
    User_Status_Type: { 
      type: String, 
      required: true, 
      enum: ["user_update", "DRC_Update", "RO_update"] 
    },
    user_status: { 
      type: String, 
      required: true, 
      enum: ["true", "false"] 
    },
    User_Status_On:{
      type: Date, 
      required: true
    },
    User_Status_By: {
      type: String, 
      required: true
    },
    User_End_DTM: { 
      type: Date, 
      default: null 
    },
    User_End_By: { 
      type: String, 
      default: null 
    },
    Created_BY: { 
      type: String, 
      required: true 
    },
    Created_ON: { 
      type: Date, 
      default: null
    },
    Approved_By: { 
      type: String, 
      default: null 
    },
    Approved_On: {
      type: Date, 
      default: null 
    },
    Remark: { 
      type: [remarkSchema],
      required: true,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
    collection: "User_log",
  }
);

// Create the User model
const User_log = mongoose.model("User_log", userSchema);

export default User_log;