import { Schema, model } from "mongoose";

// Sub-schema for remarks
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
    user_sequence: { 
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
      enum: ["slt", "DRCuser", "ro"] 
    },
    user_name: { 
      type: String, 
      required: true 
    },
    user_mail: { 
      type: String, 
      required: true, 
      unique: true 
    },
    contact_number: { 
      type: [contactNumberSchema], // Array of contact numbers
      required: true,
    },
    login_method: { 
      type: String, 
      required: true,
      enum: ["slt", "email", "mobile"]
    },
    user_roles: {
      type: [], // Array of roles
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
    DRCuser_id: { 
      type: String, 
      required: true
    },
    user_status_type: { 
      type: String, 
      required: true, 
      enum: ["user_update", "DRC_Update", "RO_update"] 
    },
    user_status: { 
      type: String, 
      required: true, 
      enum: ["enabled", "disabled"] 
    },
    user_status_dtm:{
      type: Date, 
      required: true
    },
    user_status_by: {
      type: String, 
      required: true
    },
    user_end_dtm: { 
      type: Date, 
      default: null 
    },
    user_end_by: { 
      type: String, 
      default: null 
    },
    created_by: { 
      type: String, 
      required: true 
    },
    created_dtm: { 
      type: Date, 
      default: null
    },
    approved_by: { 
      type: String, 
      default: null 
    },
    approved_dtm: {
      type: Date, 
      default: null 
    },
    remark: { 
      type: [remarkSchema], // Array of remarks
      required: true,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
     collection: "User",
  }
);

// Create the User model
const User = model("User", userSchema);

export default User;