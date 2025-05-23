import { Schema, model } from "mongoose";

const serviceSchema = new Schema({
  service_id: {
    // Add this field explicitly
    type: Number,
    required: true,
  },
  user_id: {
    type:String,
    // required:true,
  },
  service_type: {
    type: String,
    required: true,
  },
  drc_service_status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
  status_change_dtm: {
    type: Date,
    required: true,
  },
  status_changed_by: {
    type: String,
    required: true,
  },
});

// Sub-schema for remarks
const remarkSchema = new Schema({
  remark: {
    type: String,
    required: true,
  },
  remark_Dtm: {
    type: Date, // Change to Date type
    required: true,
  },
  remark_edit_by: {
    type: String,
    required: true,
  },
});
const drcSchema = new Schema(
  {
    doc_version : {type:Number, required: true, default: 1},
    drc_id: {
      type: Number,
      required: true,
      unique: true,
    },
    drc_business_registration_number: {
        type: String, 
        required: true 
    },
    drc_name: {
      type: String,
      required: true,
    },
    drc_email: {
      type: String,
      required: true,
      unique: true,
    },
    drc_status: {
      type: String,
      enum: ["Active", "Inactive", "Pending","Ended"],
      default: "Active",
    },
    teli_no: {
      type: String,
      required: true,
    },
    drc_end_dat: {
      type: Date,
      default: null,
    },
    create_by: {
      type: String,
      required: true,
    },
    create_dtm: {
      type: Date,
      required: true,
    },
    services_of_drc: {
      type: [serviceSchema],
      required: true,
    },
    remark: {
      type: [remarkSchema],
      required: true,
    },
    current_drc_operator: {
      type: String,
      // required: true,
    },
  },
  {
    collection: "Debt_recovery_company",
    timestamps: true,
  }
);

const DRC = model("DRC", drcSchema);

export default DRC;
