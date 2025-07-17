import mongoose from "mongoose";

// Sub-schema for Contact Numbers
const contactNumberSchema = new mongoose.Schema({
  contact_number: {
    type: Number,
    required: true,
  },
});

// Sub-schema for remarks
const remarkSchema = new mongoose.Schema({
  remark: {
    type: String,
    maxlength: 255,
    required: true,
  },
  remark_dtm: {
    type: Date,
    required: true,
  },
  remark_by: {
    type: String,
    maxlength: 30,
    required: true,
  },
});

// Main schema for User
const userSchema = new mongoose.Schema(
  {
    doc_version: {
      type: Number,
      required: true,
      default: 1,
    },
    User_Sequence: {
      type: Number,
      required: true,
      unique: true,
    },
    user_id: {
      type: String,
      maxlength: 30,
      required: true,
      unique: true,
    },
    user_type: {
      type: String,
      maxlength: 30,
      required: true,
      enum: ["Slt", "Drcuser", "ro"],
    },
    username: {
      type: String,
      maxlength: 30,
      required: true,
    },
    user_nic: {
      type: String,
      maxlength: 30,
      required: true,
    },
    email: {
      type: String,
      maxlength: 30,
      required: true,
      unique: true,
    },
    contact_num: {
      type: [contactNumberSchema],
      required: true,
    },
    login_method: {
      type: String,
      maxlength: 30,
      required: true,
      enum: ["slt", "gmail", "mobile"],
    },
    role: {
      type: String,
      maxlength: 30,
      enum: [
        "GM",
        "DGM",
        "legal_officer",
        "manager",
        "slt_coordinator",
        "DRC_user",
        "recovery_staff",
        "rtom",
        "superadmin",
      ],
      required: true,
    },
    drc_id: {
      type: Number,
      required: true,
    },
    ro_id: {
      type: Number,
      default: null,
    },
    drcUser_id: {
      type: Number,
      required: true,
    },
    User_Status_Type: {
      type: String,
      maxlength: 30,
      required: true,
      enum: ["user_update", "DRC_Update", "RO_update"],
    },
    user_status: {
      type: String,
      maxlength: 30,
      required: true,
      enum: ["Active", "Inactive", "Terminate"],
    },
    User_Status_DTM: {
      type: Date,
      required: true,
    },
    User_Status_By: {
      type: String,
      maxlength: 30,
      required: true,
    },
    User_End_DTM: {
      type: Date,
      default: null,
    },
    User_End_By: {
      type: String,
      maxlength: 30,
      default: null,
    },
    Created_BY: {
      type: String,
      maxlength: 30,
      required: true,
    },
    Created_DTM: {
      type: Date,
      default: null,
    },
    Approved_By: {
      type: String,
      maxlength: 30,
      default: null,
    },
    Approved_DTM: {
      type: Date,
      default: null,
    },
    Remark: {
      type: [remarkSchema],
      required: true,
    },
    user_nic: {
      type: String,
      maxlength: 30,
      required: true,
    },
      user_nic: {
      type: String,
      maxlength: 30,
      required: true,
    },
    Grade: {
      type: String,
      maxlength: 30,
       default: null,
    },
    password: {
      type: String,
      maxlength: 30,
      required: true,
    }, //need to be remove
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
    collection: "users",
  }
);

// Create the User model
const User = mongoose.model("User", userSchema);

export default User;
