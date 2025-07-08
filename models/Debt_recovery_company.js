import { Schema, model } from "mongoose";

const coordinatorSchema = new Schema({
  service_no: {
    type: String,
    maxlength: 255,
    required: true,
  },
  slt_coordinator_name: {
    type: String,
    maxlength: 255,
    required: true
  },
  slt_coordinator_email: {
    type: String,
    maxlength: 255,
    required: true,
    maxlength: 30,
  },
  coordinator_create_dtm: {
    type: Date,
    required: true
  },
  coordinator_create_by: {
    type: String,
    maxlength: 255,
    required: true
  },
  coordinator_end_by: {
    type: String,
    maxlength: 255,
    default:null
  },
  coordinator_end_dtm: {
    type: Date,
    default:null
  },
}, { _id: false });

const serviceSchema = new Schema({
  service_id: {
    type: String,
    maxlength: 255,
    required: true,
  },
  service_type: {
    type: String,
    maxlength: 255,
    required: true,
  },
  service_status: {
    type: String,
    maxlength: 255,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
  create_by: {
    type: String,
    maxlength: 255,
    default: null,
  },
  create_dtm: {
    type: Date,
    default: null,
  },
  status_update_dtm: {
    type: Date,
    default: null,
  },
  status_update_by: {
    type: String,
    maxlength: 255,
    default: null,
  },
}, { _id: false });

const rtomSchema = new Schema({
  rtom_id: {
    type: Number,
    required: true
  },
  rtom_name: {
    type: String,
    maxlength: 255,
    required: true
  },
  rtom_status: {
    type: String,
    maxlength: 255,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
  rtom_billing_center_code: {
    type: String,
    maxlength: 255,
    required: true
  },
  handling_type: {
    type: String,
    maxlength: 255,
    required: true,
    enum: ["CPE", "Arrears", "All-Type"]
  },
  status_update_by: {
    type: String,
    maxlength: 255,
    required: true
  },
  status_update_dtm: {
    type: Date,
    required: true
  },
}, { _id: false });

// Sub-schema for remarks
const remarkSchema = new Schema({
  remark: {
    type: String,
    maxlength: 255,
    defult: null,
  },
  remark_dtm: {
    type: Date,
    default: null
  },
  remark_by: {
    type: String,
    maxlength: 255,
    defult: null
  },
}, { _id: false });

// Schema for company status
const companyStatusSchema = new Schema({
  drc_status: {
    type: String,
    enum: ["Active", "Inactive", "Terminate"],
    default: "Inactive",
  },
  drc_status_dtm: {
    type: Date,
    required: true,
  },
  drc_status_by: {
    type: String,
    required: true,
  },
}, { _id: false });

const agreementDetailsSchema = new Schema({
  agreement_start_dtm: {
    type: Date,
    default: null,
  },
  agreement_end_dtm: {
    type: Date,
    default: null,
  },
  agreement_remark: {
    type: String,
    maxlength: 255,
    default: null,
  },
}, { _id: false });


const drcSchema = new Schema(
  {
    doc_version : {type:Number, required: true, default: 1},
    drc_id: {
      type: Number,
      required: true,
      unique: true
    },
    drc_name: {
      type: String,
      maxlength: 255,
      required: true,
    },
    drc_business_registration_number: {
        type: String, 
        maxlength: 255,
        required: true, 
        unique: true
    },
    drc_address: {
      type: String,
      maxlength: 255,
      required: true,
    },
    drc_contact_no: {
      type: String,
      maxlength: 30,
      required: true
    },
    drc_email: {
      type: String,
      maxlength: 255,
      unique: true,
      required: true,
    },
    drc_create_dtm: {
      type: Date,
      required: true
    },
    drc_create_by: {
      type: String,
      maxlength: 255,
      required: true
    },
    drc_terminate_dtm: {
      type: Date,
      default: null
    },
    drc_terminate_by: {
      type: String,
      maxlength: 255,
      default: null
    },
    status: {
      type: [companyStatusSchema],
      required: true,
    },
    drc_agreement_details: {
      type: agreementDetailsSchema,
      default: {}
    },
    slt_coordinator: {
      type: [coordinatorSchema],
      required: true
    },
    services: {
      type: [serviceSchema],
      required: true
    },
    rtom: {
      type: [rtomSchema],
      required: true
    },
    remark: {
      type: [remarkSchema],
      default: []
    },
  },
  {
    collection: "Debt_recovery_company",
    timestamps: true,
  }
);

const DRC = model("DRC", drcSchema);

export default DRC;
