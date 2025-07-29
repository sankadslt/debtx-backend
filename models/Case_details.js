import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

const recoveryOfficerSchema = new Schema({
  order_id: { type: Number, required: true },
  ro_id: { type: Number, required: true },
  ro_name: { type: String, required: true },
  assigned_dtm: { type: Date, required: true },
  assigned_by: { type: String, maxlength: 30, required: true },
  removed_dtm: { type: Date, default: null },
  case_removal_remark: { type: String, maxlength: 30, default: null },
}, { _id: false });

// Define the schema for remark
const remarkSchema = new Schema({
  remark: { type: String, maxlength: 255, required: true },
  remark_added_by: { type: String, maxlength: 30, required: true },
  remark_added_date: { type: Date, required: true }
}, { _id: false });

// Define the schema for approval
const approvalSchema = new Schema({
  Approval_Type: { type: String, maxlength: 30, default: null },
  decision: { type: String, maxlength: 30, required: true, enum: ['Approve', 'Reject'] },
  done_by: { type: String, maxlength: 30, required: true },
  done_on: { type: Date, required: true },
  // approved_by: { type: String, default: null },
  // rejected_by: { type: String, default: null },
  // approved_on: { type: Date, required: true },
  // rejected_on: { type: Date, required: true },
  remark: {type:String, maxlength: 255, required:true},
  requested_by: {type: String, maxlength: 30, required: true},
  requested_on :{ type: Date, required: true },
}, { _id: false });

// Define the schema for case status
const caseStatusSchema = new Schema({
  case_status: { type: String, maxlength: 30, required: true },
  status_reason: { type: String, maxlength: 255, default: null },
  created_dtm: { type: Date, required: true },
  created_by: { type: String, maxlength: 30, required: true },
  notified_dtm: { type: Date,default: null },
  expire_dtm: { type: Date, default: null },
  case_phase:{ type: String, maxlength: 30, required: true },
}, { _id: false });

// Define the edited contact
const contactsSchema = new Schema({
  contact_type: { type: String, maxlength: 30, required: true, enum: ['Mobile', 'Landline'] },
  contact_no: { type: Number, required: true },
  customer_identification_type: { type: String, maxlength: 30, required: true, enum: ['NIC', 'Passport', "Driving License"] },
  customer_identification: { type: String, maxlength: 30, required: true },
  email: { type: String, maxlength: 30, required: true },
  address: { type: String, maxlength: 255, required: true },
  geo_location: {type: String, maxlength: 30, default:null},
},{ _id: false });

// Define the schema for DRC
const drcSchema = new Schema({
  order_id: { type: Number, required: true },
  drc_arrears_band: { type: String, maxlength: 30, required: true },
  drc_id: { type: Number, required: true },
  drc_name: { type: String, maxlength: 30, required: true },
  created_dtm: { type: Date, required: true },
  drc_status: {type: String, maxlength: 30, required:true},
  status_dtm: {type:Date, required: true},
  expire_dtm: {type:Date, required: true},
  case_removal_remark: { type: String, maxlength: 255, required: false },
  removed_by: { type: String, maxlength: 30, required: false },
  removed_dtm: { type: Date, required: false },
  drc_selection_logic: {type: String, maxlength: 30, required: true},
  case_distribution_batch_id:{type:Number, required: true},
  recovery_officers: [recoveryOfficerSchema]
}, { _id: false });

const abnormalSchema = new Schema({
  remark: {type: String, maxlength: 255, required:true},
  done_by:{type: String, maxlength: 30, required:true},
  done_on: {type:Date, required:true},
  action: {type:Number, required:true},
  Case_phase: {type:String, maxlength: 30, required:true},
  approved_on: {type:Date, required:true},
},{_id: false });

const productDetailsSchema = new Schema({
  Product_Seq: { type: Number, required: true },
  Service_Type: { type: String, maxlength: 30, required: true },
  Product_Label: { type: String, maxlength: 30, required: true },
  Product_Status: { type: String, maxlength: 30, required: true },
  Product_Id: { type: Number, required: true },
  Integration_Id: { type: String, maxlength: 30, required: true },
  Product_Name: { type: String, maxlength: 255, required: true },
  Effective_Dtm: { type: Date, required: true },
  rtom: { type: String, maxlength: 30, required: true },
  Equipment_Ownership: { type: String, maxlength: 30, required: true },
  Service_Address: { type: String, maxlength: 255, required: true },
  account_no: { type: String, maxlength: 30, required: true},
  Customer_Ref: { type: String, maxlength: 30, required: true },
  Cat: { type: String, maxlength: 255, required: true },
  Db_Cpe_Status: { type: String, maxlength: 255, required: true },
  Received_List_Cpe_Status: { type: String, maxlength: 255, required: true },
  LEA: { type: String, maxlength: 30, required: true },
  RTOM: { type: String, maxlength: 30, required: true },
  City: { type: String, maxlength: 30, required: true },
  District: { type: String, maxlength: 255, required: true },
  Region: { type: String, maxlength: 255, required: true },
  Province: { type: String, maxlength: 255, required: true },
});

const RoCpeCollectSchema = new mongoose.Schema({
  ro_cpe_collect_id: { type: Number, required: true },
  drc_id: { type: Number, required: true }, 
  ro_id: { type: Number, required: true }, 
  order_id: { type: String, maxlength: 30, required: true }, 
  collected_date: { type: Date, required: true }, 
  product_label: { type: String, maxlength: 30, required: true }, 
  service_type: { type: String, maxlength: 30, required: true }, 
  cp_type: { type: String, maxlength: 30, required: true }, 
  cpe_model: { type: String, maxlength: 30, required: true },
  serial_no: { type: String, maxlength: 30, required: true }, 
  remark: { type: String, maxlength: 255, default:null }, 
  rcmp_status: { type: String, maxlength: 30, default:null}, 
  rcmp_status_dtm: { type: Date, default:null },
  rcmp_status_reason: { type: String, maxlength: 255, default:null}, 
});

const roNegotiationSchema = new mongoose.Schema({
  drc_id: { type: Number, required: true },
  ro_id: { type: Number, required: true },
  drc: { type: String, maxlength: 255, default:"" },
  ro_name: { type: String, maxlength: 255, default:"" },
  created_dtm: { type: Date, required: true },
  field_reason: { type: String, maxlength: 255, default:"" },
  Field_reason_ID: { type: Number, default:null },
  negotiation_remark: { type: String, maxlength: 255, default:"" },
});

const roRequestsSchema = new mongoose.Schema({
  drc_id: { type: Number, required: true },
  ro_id: { type: Number, required: true },
  created_dtm: { type: Date, required: true },
  ro_request_id: { type: Number, required: true },
  ro_request: { type: String, maxlength: 255, required: true },
  request_remark: { type: String, maxlength: 255, default:null  },
  intraction_id: { type: Number, required: true }, 
  intraction_log_id: { type: Number, required: true },
  todo_dtm: { type: Date,default:null  },
  completed_dtm: { type: Date, default:null },
});

const mediationBoardSchema = new mongoose.Schema({
  drc_id: { type: Number, required: true },
  ro_id: { type: Number, required: true },
  created_dtm: { type: Date, required: true },
  mediation_board_calling_dtm: { type: Date, default:null },
  customer_available: { type: String, maxlength: 30, default:null, enum: ['yes','no'] },
  comment: { type: String, maxlength: 255, default:null },
  agree_to_settle: { type: String, maxlength: 30 },
  customer_response: { type: String, maxlength: 255, default:null },
  handed_over_non_settlemet_on: { type: Date, default:null },
  non_settlement_comment: { type: String, maxlength: 255, default:null },
  received_on: { type: Date, default:null },
  received_by: { type: String, maxlength: 30, default:null },
});

const settlementschema = new Schema({
  settlement_id: {type: Number, required: true, unique: true},
  settlement_created_dtm: {type: Date, required:true},
  settlment_status: {type: String, maxlength: 30, required:true},
  drc_id: { type: Number, required: true },
  ro_id: { type: Number, required: true },
  case_phase: {type: String, maxlength: 30, required:true},
});

const moneytransactionsschema = new Schema({
  money_transaction_id: {type: Number, required: true, unique: true},
  payment_Dtm: {type: Date, required:true},
  payment_Type : {type: String, maxlength: 30, required:true},
  payment : { type: Number, required: true },
  case_phase : {type: String, maxlength: 30, required:true},
  settle_balanced : { type: Number, required: true },
});

// Define the schema and sub-schemas for litigation schema
const rtomCustomerFileSchema = new Schema({
  file_status: { type: String, maxlength: 30, required: true, enum: ['Requested', 'Collected', 'Without Agreement'] },
  file_status_on: { type: Date },
  file_status_by: { type: String, maxlength: 30 },
  pages_count: { type: Number },
});

const drcFileSchema = new Schema({
  file_status: { type: String, maxlength: 30, required: true, enum: ['Requested', 'Collected'] },
  file_status_on: { type: Date },
  file_status_by: { type: String, maxlength: 30 },
  pages_count: { type: Number },
});

const supportDocumentsSchema = new Schema({
  rtom_customer_file: [rtomCustomerFileSchema],
  drc_file: [drcFileSchema],
  document_submitted_on: { type: Date, required: true },
});

const hsFilesInformationSchema = new Schema({
  created_on: { type: Date, required: true },
  created_by: { type: String, maxlength:30, required: true },
  tele_no: { type: String, maxlength: 30, required: true },
  customer_name: { type: String, maxlength: 30, required: true },
  postal_address: { type: String, maxlength: 255, required: true },
  proprietorship_name: { type: String, maxlength: 30, required: true },
  proprietorship_address: { type: String, maxlength: 255, required: true },
  rtom_area: { type: String, maxlength: 30, required: true },
  agreement_date: { type: Date, required: true },
  mediation_board_area: { type: String, maxlength: 30, required: true },
  date_of_mediation_board_certificate: { type: Date, required: true },
  date_service_provided: { type: Date, required: true },
  amount_outstanding: { type: Number, required: true },
  month_of_last_usage: { type: String, maxlength: 30, required: true },
  month_of_last_payment: { type: Number, required: true },
  the_customer_is_a_corperate_customer: { type: String, maxlength: 30, required: true, enum: ['yes', 'no'] },
  it_concern: { type: String, maxlength: 30, required: true, enum: ['yes', 'no'] },
});

const legalSubmissionSchema = new Schema({
  submission: { type: String, maxlength: 30, required: true, enum: ['Legal Accepted', 'Legal Rejected'] },
  submission_on: { type: Date, required: true },
  submission_by: { type: String, maxlength: 30, required: true },
  submission_remark: { type: String, maxlength: 255, required: true },
});

const legalDetailsSchema = new Schema({
  legal_sequence: { type: Number, required: true },
  action_type: { type: String, maxlength: 30, required: true, enum: ['Court details', 'Reject Details', 'Court Information', 'Legal Fail'] },
  court_no: { type: Number, required: true },
  court_registered_date: { type: Date, required: true },
  case_handling_officer: { type: String, maxlength: 30, required: true },
  remark: { type: String, maxlength: 255, required: true },
  created_on: { type: Date, required: true },
  created_by: { type: String, maxlength: 30, required: true },
});

const litigationSchema = new Schema({
  forward_on: { type: Date, required: true },
  support_documents: [supportDocumentsSchema],
  hs_files_information: [hsFilesInformationSchema],
  legal_submission: [legalSubmissionSchema],
  legal_details: [legalDetailsSchema],
});
const FLT_LOD_letter_details_schema = new Schema({
  created_on: {type: Date, required:true},
  created_by:{type: String, maxlength: 30, required:true},
  event_source: {type:String, maxlength: 30, required:true},
  customer_name: {type:String, maxlength: 30, required:true},
  postal_address: {type:Array, required:true},
},{_id: false });

const customer_response_of_LOD_schema = new Schema({
  response_seq: {type: Number, required:true},
  created_by:{type: String, maxlength: 30, required:true},
  created_on: {type:Date, required:true},
  response: {type:String, maxlength: 255, required:true},
},{_id: false });

const FTL_LOD_Schema = new Schema({
  pdf_by: {type: String, maxlength: 30, required: true, unique: true},
  pdf_on: {type: Date, required:true},
  expire_date : {type: Date, required:true},
  signed_by : { type: String, maxlength: 30, required: true },
  ftl_lod_letter_details : [FLT_LOD_letter_details_schema],
  customer_response : [customer_response_of_LOD_schema],
});

const document_type_schema = new Schema({
  document_seq: {type: Number, required:true},
  document_type:{type: String, maxlength: 30, required:true},
  change_by:{type: String, maxlength: 30, required:true},
  changed_dtm: {type:Date, required:true},
  changed_type_remark: {type:String, maxlength: 255, default:null},
},{_id: false });

const lod_submission_schema = new Schema({
  lod_distribution_id: {type: Number, required:true},
  created_by:{type: String, maxlength: 30, required:true},
  created_on: {type:Date, required:true}, //file download by
},{_id: false });

const lod_response_schema = new Schema({
  lod_response_seq: {type: Number, required:true},
  response_type: {type:String, maxlength: 30, required:true},
  lod_remark: {type:String, maxlength: 255, required:true},
  created_by:{type: String, maxlength: 30, required:true},
  created_on: {type:Date, required:true},
},{_id: false });

const current_contact_details_schema = new Schema({
  contact_type: { type: String, maxlength: 30, required: true, enum: ['Email', 'Mobile', 'Address', 'geo_location'] },
  contact:{ type: String, maxlength: 40, required: true },
},{_id: false });

const current_customer_identification_schema = new Schema({
  Identification_type: { type: String, maxlength: 30, required: true, enum: ['Driving License', 'Passport', 'NIC'] },
  contact:{ type: String, maxlength: 40, required: true },
},{_id: false });

const editedcontactsSchema = new Schema({
  ro_id: { type: Number },
  drc_id: { type: Number, required: true },
  edited_dtm: { type: Date, required: true },
  contact_details:[current_contact_details_schema],
  customer_identification:[current_customer_identification_schema],
  remark:{type: String, maxlength: 255, default:null},
  edited_by:{type: String, maxlength: 255, required:true},
},{ _id: false });

const lod_final_reminder_Schema = new Schema({
  source_type: {
    type: String,
    maxlength: 30,
    enum: ["Direct LOD", "DRC Fail", "MB Fail"],
    required: true,
  },
  current_document_type: {
    type: String,
    maxlength: 30,
    enum: ["LOD", "Final Reminder"],
    required: true,
  },
  lod_distribution_id : {type:Number, default:null},
  lod_expire_on : {type: Date,default:null},
  document_type : [document_type_schema],
  lod_submission : {type:lod_submission_schema, default:null},
  lod_response : [lod_response_schema],
  lod_notification : [{
    notification_seq : {type:Number, default:null},
    notification_on :{ type: Date, default:null }
  }],
});

// Define the main case details schema
const caseDetailsSchema = new Schema({ 
  doc_version : {type:Number, required: true, default: 3},
  case_id: { type: Number, required: true,unique: true },
  incident_id: { type: Number, required: true },
  case_distribution_batch_id: {type: Number, default: null},
  account_no: { type: String, maxlength: 30, required: true },
  customer_name: { type: String, maxlength: 30, required: true },
  customer_type_name: { type: String, maxlength: 30, required: true },
  account_manager_code : { type: String, maxlength: 30, required: true },
  customer_ref: { type: String, maxlength: 30, required: true },
  created_dtm: { type: Date, required: true },
  implemented_dtm: { type: Date, required: true },
  area: { type: String, maxlength: 30, required: true },
  rtom: { type: String, maxlength: 30, required: true },
  arrears_band: {type: String, maxlength: 30, required: true},
  bss_arrears_amount: { type: Number, required: true },
  current_arrears_amount: { type: Number, required: true },
  current_arrears_band: {type:String, maxlength: 30, required:true},
  action_type: { type: String, maxlength: 30, required: true },
  drc_commision_rule: { type: String, maxlength: 30, required: true, enum: ['PEO TV', 'BB', 'VOICE'], },
  last_payment_date: { type: Date, required: true },
  monitor_months: { type: Number, required: true },
  last_bss_reading_date: { type: Date, required: true },
  commission: { type: Number, required: true },
  case_current_status: { type: String, maxlength: 30, required: true },
  filtered_reason: { type: String, maxlength: 255, default: null }, 
  proceed_dtm: { type: Date, required: null },
  Proceed_By: { type: String, maxlength: 30, required: null },
  region:{ type: String, maxlength: 30, required: null},
  ro_edited_customer_details: [editedcontactsSchema],
  current_contact: [contactsSchema], //should be remove
  current_contact_details: [current_contact_details_schema], //new one
  current_customer_identification: [current_customer_identification_schema], // new one
  remark: [remarkSchema],
  approve: [approvalSchema],
  case_status: [caseStatusSchema],
  case_current_phase:{ type: String, maxlength: 30, required: true },
  drc: [drcSchema],
  abnormal_stop: [abnormalSchema],
  ref_products: [productDetailsSchema], 
  ro_negotiation: [roNegotiationSchema],
  ro_requests: [roRequestsSchema],
  ro_cpe_collect : [RoCpeCollectSchema],
  mediation_board: [mediationBoardSchema],
  settlement : [settlementschema],
  money_transactions	: [moneytransactionsschema],
  litigation: [litigationSchema],
  ftl_lod: [FTL_LOD_Schema],
  lod_final_reminder: {type: lod_final_reminder_Schema, default: null},
},
{
  collection: 'Case_details', 
  timestamps: true,
}
);

// Create the model from the schema
const CaseDetails = model('CaseDetails', caseDetailsSchema);

export default CaseDetails;
