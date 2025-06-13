import mongoose, { Schema, model } from "mongoose";

// Schema for User Approval
const userApprovalSchema = new Schema(
  {
    doc_version : {
      type:Number, 
      required: true, 
      default: 1
    },  
    approval_id: { 
      type: Number, 
      required: true, 
      unique: true 
    },
    user_type: { 
      type: String, 
      required: true, 
      enum: [ 'RO', 'DRCUser'] 
    },
    drc_id: { 
      type: NUmber, 
      required: true 
    },
    ro_id: { 
      type: Number, 
      default: null 
    },
    drcUser_id: { 
      type: Number, 
      default: null 
    },
    user_name: { 
      type: String, 
      required: true
    },
    user_role: {
      type: String, 
      required: true, 
      enum: [ "DRC_Coodinator", "RO"] 
    },
    login_email: {
      type: String,
      default: null,
    },
    login_contact_no: {
      type: String,
      required: true,
    },
    created_by: { 
      type: String, 
      required: true 
    },
    created_dtm: { 
      type: Date, 
      required: true 
    },
    approve_status: { 
      type: String, 
      default: null 
    },
    approve_by: { 
      type: String, 
      default: null 
    },
    approve_dtm: {
      type: Date, 
      default: null 
    }
  },
  {
    timestamps: true, 
    collection: "User_Approval",
  }
);

const User_Approval = mongoose.model("User_Approval", userApprovalSchema);

export default User_Approval;