// import { Schema, model } from "mongoose";

// const serviceSchema = new Schema({
//   service_id: {
//     // Add this field explicitly
//     type: Number,
//     required: true,
//   },
//   user_id: {
//     type:String,
//     // required:true,
//   },
//   service_type: {
//     type: String,
//     required: true,
//   },
//   drc_service_status: {
//     type: String,
//     enum: ["Active", "Inactive"],
//     default: "Active",
//   },
//   status_change_dtm: {
//     type: Date,
//     required: true,
//   },
//   status_changed_by: {
//     type: String,
//     required: true,
//   },
// });

// // Sub-schema for remarks
// const remarkSchema = new Schema({
//   remark: {
//     type: String,
//     required: true,
//   },
//   remark_Dtm: {
//     type: Date, // Change to Date type
//     required: true,
//   },
//   remark_edit_by: {
//     type: String,
//     required: true,
//   },
// });
// const drcSchema = new Schema(
//   {
//     doc_version : {type:Number, required: true, default: 1},
//     drc_id: {
//       type: Number,
//       required: true,
//       unique: true,
//     },
//     drc_business_registration_number: {
//         type: String, 
//         required: true 
//     },
//     drc_name: {
//       type: String,
//       required: true,
//     },
//     drc_email: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     drc_status: {
//       type: String,
//       enum: ["Active", "Inactive", "Pending","Ended"],
//       default: "Active",
//     },
//     teli_no: {
//       type: String,
//       required: true,
//     },
//     drc_end_dat: {
//       type: Date,
//       default: null,
//     },
//     create_by: {
//       type: String,
//       required: true,
//     },
//     create_dtm: {
//       type: Date,
//       required: true,
//     },
//     services_of_drc: {
//       type: [serviceSchema],
//       required: true,
//     },
//     remark: {
//       type: [remarkSchema],
//       required: true,
//     },
//     current_drc_operator: {
//       type: String,
//       // required: true,
//     },
//   },
//   {
//     collection: "Debt_recovery_company",
//     timestamps: true,
//   }
// );

// const DRC = model("DRC", drcSchema);

// export default DRC;

import { Schema, model } from "mongoose";

const coordinatorSchema = new Schema({
  service_no: {
    type: String,
    required: true,
  },
  slt_coordinator_name: {
    type: String,
    required: true
  },
  slt_coordinator_email: {
    type: String,
    required: true
  },
  coordinator_create_dtm: {
    type: Date,
    required: true
  },
  coordinator_create_by: {
    type: String,
    required: true
  },
  coordinator_end_by: {
    type: String,
    default:null
  },
  coordinator_end_dtm: {
    type: Date,
    default:null
  },
});

const serviceSchema = new Schema({
  service_id: {
    type: String,
    required: true,
    unique: true,
  },
  service_type: {
    type: String,
    required: true,
  },
  service_status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
  create_by: {
    type: String,
    required: true,
  },
  create_on: {
    type: Date,
    required: true,
  },
  status_update_dtm: {
    type: Date,
    required: true,
  },
  status_update_by: {
    type: String,
    required: true,
  },
});

const rtomSchema = new Schema({
  rtom_id: {
    type: Number,
    required: true
  },
  rtom_name: {
    type: String,
    required: true
  },
  rtom_status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
  rtom_billing_center_code: {
    type: String,
    required: true
  },
  handling_type: {
    type: String,
    required: true,
    enum: ["CPE", "Arrears", "All-Type"]
  },
  status_update_by: {
    type: String,
    required: true
  },
  status_update_dtm: {
    type: Date,
    required: true
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
      required: true,
    },
    drc_business_registration_number: {
        type: String, 
        required: true, 
        unique: true
    },
    drc_address: {
      type: String,
      required: true
    },
    drc_contact_no: {
      type: String,
      required: true
    },
    drc_email: {
      type: String,
      unique: true
    },
    drc_status: {
      type: String,
      enum: ["Active", "Inactive", "Terminate"],
      default: "Active"
    },
    create_by: {
      type: String,
      required: true
    },
    create_on: {
      type: Date,
      required: true
    },
    drc_end_dtm: {
      type: Date,
      default: null
    },
    drc_end_by: {
      type: String,
      default: null
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
    },
  },
  {
    collection: "Debt_recovery_company",
    timestamps: true,
  }
);

const DRC = model("DRC", drcSchema);

export default DRC;
