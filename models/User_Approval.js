import mongoose, { Schema, model } from "mongoose";

// Schema for User Approval
const userApprovalSchema = new Schema(
  {
    doc_version : {
      type:Number, 
      required: true, 
      default: 1
    },  
    user_approver_id: { 
      type: Number, 
      required: true, 
      unique: true 
    },
    User_Type: { 
      type: String, 
      required: true, 
      enum: [ "DRC","DRC User","RO"] 
    },
    User_id: { 
      type: String, 
      required: true 
    },
    DRC_id: { 
      type: Number, 
      default: null 
    },
    created_on: { 
      type: Date, 
      default: Date() 
    },
    created_by: { 
      type: String,
      required: true
    },
    approve_status: {
      type: String, 
      maxlength: 30,
      required: true, 
      enum: ["Open","Approve","Reject"] 
    },
    approve_status_on: {
      type: Date, 
      default: Date() 
    },
    approver_type: {
      type: String, 
      maxlength: 30,
      required: true, 
      enum: [ "DRC_Agreement","DRC_user_registration","DRC_user_details_update"] 
    },
    approved_Deligated_by: { 
      type: String,
      required: true
    },
    remark: { 
      type: String,
      default:null
    },
    Parameters:{
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    existing_reference_id:{
      type: Number, 
      default:null,
    }
    // login_email: {
    //   type: String,
    //   maxlength: 30,
    //   default: null,
    // },
    // login_contact_no: {
    //   type: String,
    //   maxlength: 30,
    //   required: true,
    // },
    // drcUser_status: {
    //   type: String,
    //   maxlength: 30,
    //   enum: ['Active', 'Inactive', 'Terminate'],
    //   default: "Active",
    // },
    // created_by: { 
    //   type: String, 
    //   maxlength: 30,
    //   required: true 
    // },
    // created_dtm: { 
    //   type: Date, 
    //   required: true 
    // },
    // approve_status: { 
    //   type: String, 
    //   maxlength: 30,
    //   default: null 
    // },
    // approve_by: { 
    //   type: String,
    //   maxlength: 30, 
    //   default: null 
    // },
    // approve_dtm: {
    //   type: Date, 
    //   default: null 
    // },
    // parameters: {
    //   type: Map,
    //   of: mongoose.Schema.Types.Mixed, // Allow different types for the map values (String, Number, Array, etc.)
    //   default: {},
    //   default: {},
    // }
  },
  {
    timestamps: true, 
    collection: "User_Approval",
  }
);

const User_Approval = mongoose.model("User_Approval", userApprovalSchema);

export default User_Approval;