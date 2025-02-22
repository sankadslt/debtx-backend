import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

const recoveryOfficerSchema = new Schema({
  ro_id: { type: Number, required: true },
  assigned_dtm: { type: Date, required: true },
  assigned_by: { type: String, required: true },
  removed_dtm: { type: Date, default: null },
  case_removal_remark: { type: String, default: null },
}, { _id: false });

// Define the schema for remark
const remarkSchema = new Schema({
  remark: { type: String, required: true },
  remark_added_by: { type: String, required: true },
  remark_added_date: { type: Date, required: true }
}, { _id: false });

// Define the schema for approval
const approvalSchema = new Schema({
  approved_process: { type: String, default: null },
  approved_by: { type: String, default: null },
  rejected_by: { type: String, default: null },
  approved_on: { type: Date, required: true },
  remark: {type:String, required:true}
}, { _id: false });

// Define the schema for case status
const caseStatusSchema = new Schema({
  case_status: { type: String, required: true },
  status_reason: { type: String, default: null },
  created_dtm: { type: Date, required: true },
  created_by: { type: String, default: null },
  notified_dtm: { type: Date, required: true },
  expire_dtm: { type: Date, required: true },
}, { _id: false });

// Define the contact 
const contactsSchema = new Schema({
  mob: { type: String, required: true },
  email: { type: String, required: true },
  lan: { type: String, required: true },
  address: { type: String, required: true },
  geo_location: {type: String, default:null},
},{ _id: false });

const editedcontactsSchema = new Schema({
  ro_id: { type: Number, required: true },
  drc_id: { type: Number, required: true },
  edited_dtm: { type: Date, required: true },
  mob: { type: String, required: true },
  email: { type: String, required: true },
  lan: { type: String, required: true },
  address: { type: String, required: true },
  geo_location: {type: String, default:null},
  remark:{type: String, default:null},
},{ _id: false });

// Define the schema for DRC
const drcSchema = new Schema({
  order_id: { type: Number, required: true },
  drc_id: { type: Number, required: true },
  drc_name: { type: String, required: true },
  created_dtm: { type: Date, required: true },
  drc_status: {type: String, required:true},
  status_dtm: {type:Date, required: true},
  expire_dtm: {type:Date, required: true},
  case_removal_remark: { type: String, required: true },
  removed_by: { type: String, required: true },
  removed_dtm: { type: Date, required: true },
  drc_selection_logic: {type: String, required: true},
  case_distribution_batch_id:{type:Number, required: true},
  recovery_officers: [recoveryOfficerSchema]
}, { _id: false });

const abnormalSchema = new Schema({
  remark: {type: String, required:true},
  done_by:{type: String, required:true},
  done_on: {type:Date, required:true},
  action: {type:String, required:true}
},{_id: false });

const productDetailsSchema = new Schema({
  service: { type: String, required: true },
  product_label: { type: String, required: true },
  product_status: { type: String, enum: ['Active', 'Terminated', 'Suspended', 'Inactive'], required: true },
  status_Dtm: { type: Date, required: true },
  rtom: { type: String, required: true },
  product_ownership: { type: String, required: true },
  service_address: { type: String, required: true },
});

const RoNegotiateCpeCollectSchema = new mongoose.Schema({
  drc_id: { type: Number, required: true },
  ro_id: { type: Number, required: true },
  serial_no: { type: String, required: true },
  order_id: { type: String, required: true },
  service_type: { type: String, required: true },
  date: { type: Date, required: true },
  more_info_about_item: { type: String }, // Optional for additional information
  rcmp_submit_dtm: { type: Date },
  rcmp_status: { type: String },
  rcmp_date: { type: Date },
});

const roNegotiationSchema = new mongoose.Schema({
  drc_id: { type: String, required: true },
  ro_id: { type: String, required: true },
  created_dtm: { type: Date, required: true },
  feild_reason: { type: String, required: true },
  remark: { type: String },
});

const roRequestsSchema = new mongoose.Schema({
  drc_id: { type: Number, required: true },
  ro_id: { type: Number, required: true },
  created_dtm: { type: Date, required: true },
  ro_request_id: { type: Number, required: true },
  ro_request: { type: String, required: true },
  intraction_id: { type: Number, required: true },
  todo_dtm: { type: Date, required: true },
  completed_dtm: { type: Date, default:null },
});

const mediationBoardSchema = new mongoose.Schema({
  drc_id: { type: Number, required: true },
  ro_id: { type: Number, required: true },
  created_dtm: { type: Date, required: true },
  mediation_board_calling_dtm: { type: Date, required: true },
  customer_available: { type: String, required: true, enum: ['yes','no'] },
  comment: { type: String, default:null },
  settlement_id: { type: Number},
  customer_response: { type: String, default:null },
  next_calling_dtm: { type: Date, default:null },

});

const settlementschema = new Schema({
  settlement_id: {type: Number, required: true, unique: true},
  settlement_created_dtm: {type: Date, required:true},
  settlment_status: {type: String, required:true},
  drc_id: { type: Number, required: true },
  ro_id: { type: Number, required: true },
});

// Define the main case details schema
const caseDetailsSchema = new Schema({
  case_id: { type: Number, required: true,unique: true },
  incident_id: { type: Number, required: true },
  account_no: { type: String, required: true },
  customer_ref: { type: String, required: true },
  created_dtm: { type: Date, required: true },
  implemented_dtm: { type: Date, required: true },
  area: { type: String, required: true },
  rtom: { type: String, required: true },
  arrears_band: {type: String, required: true},
  bss_arrears_amount: { type: Number, required: true },
  current_arrears_amount: { type: Number, required: true },
  current_arrears_band: {type:String, required:true},
  action_type: { type: String, required: true },
  drc_commision_rule: { type: String, required: true, enum: ['PEO TV', 'BB', 'VOICE'], },
  last_payment_date: { type: Date, required: true },
  monitor_months: { type: Number, required: true },
  last_bss_reading_date: { type: Date, required: true },
  commission: { type: Number, required: true },
  case_current_status: { type: String, required: true },
  filtered_reason: { type: String, default: null }, 
  proceed_dtm: { type: Date, required: null },
  ro_edited_customer_details: [editedcontactsSchema],
  current_contact: [contactsSchema],
  remark: [remarkSchema],
  approve: [approvalSchema],
  case_status: [caseStatusSchema],
  drc: [drcSchema],
  abnormal_stop: [abnormalSchema],
  ref_products: [productDetailsSchema], 
  ro_negotiation: [roNegotiationSchema],
  ro_requests: [roRequestsSchema],
  ro_negotiate_cpe_collect: [RoNegotiateCpeCollectSchema],
  mediation_board: [mediationBoardSchema],
  settlement : [settlementschema],
},
{
  collection: 'Case_details', 
  timestamps: true,
}
);

// Create the model from the schema
const CaseDetails = model('CaseDetails', caseDetailsSchema);

export default CaseDetails;
