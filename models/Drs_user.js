// import mongoose from "mongoose";

// // Sub-schema for Contact Numbers
// const contactNumberSchema = new mongoose.Schema({
//   contact_number: {
//     type: Number,
//     required: true,
//   },
// }, { _id: false }); // Disable _id for sub-schema

// // Sub-schema for remarks
// const remarkSchema = new mongoose.Schema({
//   remark: {
//     type: String,
//     maxlength: 255,
//     required: true,
//   },
//   remark_dtm: {
//     type: Date,
//     required: true,
//   },
//   remark_by: {
//     type: String,
//     maxlength: 30,
//     required: true,
//   },
// });

// // Main schema for User
// const userSchema = new mongoose.Schema(
//   {
//     doc_version: {
//       type: Number,
//       required: true,
//       default: 2,
//     },
//     User_Sequence: {
//       type: Number,
//       required: true,
//       unique: true,
//     },
//     user_id: {
//       type: String,
//       maxlength: 30,
//       required: true,
//       unique: true,
//     },
//     user_type: {
//       type: String,
//       maxlength: 30,
//       required: true,
//       enum: ["slt", "drcuser", "ro"],
//     },
//     username: {
//       type: String,
//       maxlength: 30,
//       required: true,
//     },
//     user_nic: {
//       type: String,
//       maxlength: 30,
//       required: true,
//     },
//     email: {
//       type: String,
//       maxlength: 30,
//       required: true,
//       unique: true,
//     },
//     contact_num: {
//       type: [contactNumberSchema],
//       required: true,
//     },
//     login_method: {
//       type: String,
//       maxlength: 30,
//       required: true,
//       enum: ["slt", "gmail", "mobile"],
//     },
//     role: {
//       type: String,
//       maxlength: 30,
//       enum: [
//         "GM",
//         "DGM",
//         "legal_officer",
//         "manager",
//         "slt_coordinator",
//         "DRC_user",
//         "recovery_staff",
//         "rtom",
//         "superadmin",
//       ],
//       required: true,
//     },
//     drc_id: {
//       type: Number,
//       required: true,
//     },
//     ro_id: {
//       type: Number,
//       default: null,
//     },
//     drcUser_id: {
//       type: Number,
//       required: true,
//     },
//     User_Status_Type: {
//       type: String,
//       maxlength: 30,
//       required: true,
//       enum: ["user_update", "DRC_Update", "RO_update"],
//     },
//     user_status: {
//       type: String,
//       maxlength: 30,
//       required: true,
//       enum: ["Active", "Inactive", "Terminate"],
//     },
//     User_Status_On: {
//       type: Date,
//       required: true,
//     },
//     User_Status_By: {
//       type: String,
//       maxlength: 30,
//       required: true,
//     },
//     User_End_DTM: {
//       type: Date,
//       default: null,
//     },
//     User_End_By: {
//       type: String,
//       maxlength: 30,
//       default: null,
//     },
//     Created_BY: {
//       type: String,
//       maxlength: 30,
//       required: true,
//     },
//     Created_DTM: {
//       type: Date,
//       default: null,
//     },
//     Approved_By: {
//       type: String,
//       maxlength: 30,
//       default: null,
//     },
//     Approved_DTM: {
//       type: Date,
//       default: null,
//     },
//     Remark: {
//       type: [remarkSchema],
//       required: true,
//     },
//   },
//   {
//     timestamps: true, // Automatically manage createdAt and updatedAt fields
//     collection: "drcusers",
//   }
// );

// // Create the User model
// const User = mongoose.model("drcusers", userSchema);

// export default User;


import mongoose from "mongoose";

// Sub-schema for user login entries
const userLoginSchema = new mongoose.Schema(
  {
    user_login_id: {
      type: String,
      required: true,
    },
    create_on: {
      type: Date,
      default: Date.now,
    },
    end_dtm: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

// Sub-schema for user profile
const userProfileSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      maxlength: 30,
      required: true,
    },
    email: {
      type: String,
      maxlength: 30,
      required: true,
    },
    user_nic: {
      type: String,
      maxlength: 30,
      required: true,
    },
    user_designation: {
      type: String,
      maxlength: 50,
      required: true,
    },
  },
  { _id: false }
);

// Sub-schema for contact numbers
const contactNumberSchema = new mongoose.Schema(
  {
    contact_number: {
      type: String,
      required: true,
    },
    create_on: {
      type: Date,
      default: Date.now,
    },
    end_dtm: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

// Sub-schema for user roles
const userRoleSchema = new mongoose.Schema(
  {
    role_name: {
      type: String,
      maxlength: 30,
      required: true,
    },
    start_dtm: {
      type: Date,
      default: Date.now,
    },
    end_dtm: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

// Sub-schema for DRC and RO references
const drcDetailsSchema = new mongoose.Schema(
  {
    drc_id: {
      type: Number,
      default: null,
    },
    ro_id: {
      type: Number,
      default: null,
    },
  },
  { _id: false }
);

// Sub-schema for user status
const userStatusSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["active", "inactive", "terminate"],
      required: true,
    },
    status_on: {
      type: Date,
      default: Date.now,
    },
    status_by: {
      type: String,
      maxlength: 30,
      required: true,
    },
  },
  { _id: false }
);

// Sub-schema for last user reference
const lastUserRefSchema = new mongoose.Schema(
  {
    User_id: {
      type: String,
      default: null,
    }
  },
  { _id: false }
);

// Sub-schema for user Remark
const userRemarkSchema = new mongoose.Schema(
  {
    remark: {
      type: String
    },
    remark_dtm: {
      type: Date,
      default: Date.now,
    },
    remark_by: {
      type: String,
      maxlength: 30,
      required: true,
    },
  },
  { _id: false }
);

// Main User Schema
const userSchema = new mongoose.Schema(
  {
    doc_version: {
      type: Number,
      default: 2,
    },
    user_id: {
      type: Number,
      required: true,
      unique: true,
    },
    user_type: {
      type: String,
      maxlength: 30,
      required: true,
      enum: ["slt", "drc_officer", "ro"],
    },
    last_user_ref: {
      type: lastUserRefSchema,
       default: [],
    },
    user_login: {
      type: [userLoginSchema],
      default: [],
    },
    User_profile: {
      type: userProfileSchema,
      required: true,
    },
    user_contact_num: {
      type: [contactNumberSchema],
      default: [],
    },
    role: {
      type: [userRoleSchema],
      default: [],
    },
    drc_details: {
      type: drcDetailsSchema,
      default: () => ({}),
    },
    user_status: {
      type: userStatusSchema,
      required: true,
    },
    user_remark: {
      type: userRemarkSchema,
      default: [],
    },
    create_by: {
      type: String,
      maxlength: 30,
      required: true,
    },
    create_on: {
      type: Date,
      default: Date.now,
    },
    Approve_by: {
      type: String,
      maxlength: 30,
      default: null,
    },
    Approve_on: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "Drs_user",
  }
);

const Drs_user = mongoose.model("Drs_user", userSchema);
export default Drs_user;

