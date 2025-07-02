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
    maxlength: 30,
    required: true,
  },
  slt_coordinator_name: {
    type: String,
    maxlength: 30,
    required: true
  },
  slt_coordinator_email: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v); // Basic email validation regex
      },
      message: props => `${props.value} is not a valid email!`
  }
  },
  coordinator_create_dtm: {
    type: Date,
    required: true
  },
  coordinator_create_by: {
    type: String,
    maxlength: 30,
    required: true
  },
  coordinator_end_by: {
    type: String,
    maxlength: 30,
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
    maxlength: 30,
    required: true,
  },
  service_type: {
    type: String,
    maxlength: 30,
    required: true,
  },
  service_status: {
    type: String,
    maxlength: 30,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
  create_by: {
    type: String,
    maxlength: 30,
    required: true,
  },
  create_dtm: {
    type: Date,
    required: true,
  },
  status_update_dtm: {
    type: Date,
    required: true,
  },
  status_update_by: {
    type: String,
    maxlength: 30,
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
    maxlength: 30,
    required: true
  },
  rtom_status: {
    type: String,
    maxlength: 30,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
  rtom_billing_center_code: {
    type: String,
    maxlength: 30,
    required: true
  },
  handling_type: {
    type: String,
    maxlength: 30,
    required: true,
    enum: ["CPE", "Arrears", "All-Type"]
  },
  status_update_by: {
    type: String,
    maxlength: 30,
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
    defult: null,
    validate: {
      validator: function(v) {
        return v.length <= 255; // Limit remark length to 255 characters
      },
      message: props => `Remark is too long! Maximum 255 characters allowed.`
    }
  },
  remark_dtm: {
    type: Date,
    default: null
  },
  remark_by: {
    type: String,
    maxlength: 30,
    defult: null
  },
});

// Schema for company status
const companyStatusSchema = new Schema({
  drc_status: {
    type: String,
    enum: ["Active", "Inactive", "Terminate"],
    required: true,
  },
  drc_status_dtm: {
    type: Date,
    required: true,
  },
  drc_status_by: {
    type: String,
    required: true,
  },
});

// Schema for agreement details
const agreementDetailsSchema = new Schema({
  agreement_start_dtm: {
    type: Date,
    required: true,
  },
  agreement_end_dtm: {
    type: Date,
    required: true,
  },
  agreement_remark: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return v.length <= 255; // Limit remark length to 500 characters
      },
      message: props => `Remark is too long! Maximum 255 characters allowed.`
    }
  },
  agreement_update_by: {
    type: String,
    required: true,
  }  
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
      maxlength: 30,
      required: true,
      validate: {
        validator: function(v) {
            return v.length <= 30; // Limit area code length to 10 characters
        },
        message: props => `Area code is too long! Maximum 30 characters allowed.`
      }
    },
    drc_business_registration_number: {
        type: String, 
        maxlength: 30,
        required: true, 
        unique: true
    },
    drc_address: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
            return v.length <= 30; // Limit area code length to 10 characters
        },
        message: props => `Area code is too long! Maximum 30 characters allowed.`
      }
    },
    drc_contact_no: {
      type: String,
      maxlength: 30,
      required: true
    },
    drc_email: {
      type: String,
      maxlength: 30,
      unique: true,
      required: true,
      validate: {
        validator: function(v) {
            return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v); // Basic email validation regex
        },
        message: props => `${props.value} is not a valid email!`
      }
    },
    // drc_status: {
    //   type: String,
    //   enum: ["Active", "Inactive", "Terminate"],
    //   default: "Active"
    // },
    drc_status: {
      type: [companyStatusSchema],
      required: true,
    },
    // create_by: {
    //   type: String,
    //   required: true,
    // },
    // create_on: {
    //   type: Date,
    //   required: true
    // },
    drc_end_dtm: {
      type: Date,
      default: null
    },
    drc_end_by: {
      type: String,
      maxlength: 30,
      default: null
    },
    drc_agreement_details: {
      type: [agreementDetailsSchema],
      required: true,
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
