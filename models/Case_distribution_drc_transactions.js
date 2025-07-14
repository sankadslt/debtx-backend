
// import { Schema, model } from 'mongoose';

// const arrayOfDistributionSchema = new Schema(
//   {
//     drc: { type: String },
//     drc_id: { type: Number }, 
//     rulebase_count: { type: Number }, 
//     plus_drc: { type: String },
//     plus_drc_id: { type: Number },  
//     plus_rulebase_count: { type: Number }, 
//     minus_drc: { type: String },
//     minus_drc_id: { type: Number }, 
//     minus_rulebase_count: { type: Number }, 
//     rtom: { type: String },
//     // rulebase_arrears_sum: { type: Number }
//   },
//   { _id: false }
// );

// const batchseqSchema = new Schema({
//     batch_seq: { type: Number, required: true},
//     created_dtm: { type: Date, required: true },
//     created_by: { type: String, required: true},
//     action_type: { type: String, required: true, enum: ['distribution', 'amend'],},
//     distribution_details: [arrayOfDistributionSchema] ,
//     batch_seq_rulebase_count: { type: Number, required: true},
//     crd_distribution_status: { type: String, default:null},
//     crd_distribution_status_on: { type: Date, default:null },
//     // batch_seq_rulebase_arrears_sum: { type: Number, required: true},
// }, { _id: false });

// const crdDistributionStatusSchema = new Schema({
//   crd_distribution_status: { 
//     type: String, 
//     enum: ['open', 'batch_forword_distribute', 'batch_amend', 'batch_approved', 'batch_forword_approval', 'batch_distributed', 'batch_rejected', 'rejected_batch_distributed'], // Define allowed statuses
//     required: true 
//   },
//   created_dtm: { type: Date, required: true },
//   created_by: { type: String, required: true},
//   crd_distribution_reason: { type: String, default: null },
// },{ _id: false });


// const caseDistributionSchema = new Schema({
//     doc_version : {type:Number, required: true, default: 1},
//     forword_case_distribution_batch_id: { type: Number, default: null },
//     case_distribution_batch_id: { type: Number, required: true, unique: true },
//     batch_seq_details: [batchseqSchema],
//     current_arrears_band: { type: String, required: true},
//     rulebase_count: { type: Number, required: true},
//     distribution_status: [crdDistributionStatusSchema],
//     drc_commision_rule: { type: String, required: true },
//     tmp_record_remove_on: { type: Date, default:null},
//     current_crd_distribution_status: { type: String, default:null },
//     current_crd_distribution_status_on: { type: Date, default:null},
// },{
//   collection: 'Case_distribution_drc_transactions',
//   timestamps: true
// });

// const CaseDistribution = model('CaseDistribution', caseDistributionSchema);

// export default CaseDistribution;

import { Schema, model } from 'mongoose';

const arrayOfDistributionSchema = new Schema(
  {
    drc: { type: String, maxlength: 30 },
    drc_id: { type: Number }, 
    rulebase_count: { type: Number }, 
    plus_drc: { type: String, maxlength: 30 },
    plus_drc_id: { type: Number },  
    plus_rulebase_count: { type: Number }, 
    minus_drc: { type: String, maxlength: 30 },
    minus_drc_id: { type: Number }, 
    minus_rulebase_count: { type: Number }, 
    rtom: { type: String, maxlength: 30 },
    // rulebase_arrears_sum: { type: Number }
  },
  { _id: false }
);

const issueListSchema = new Schema({
  Issue_Reason: { type: String, maxlength: 255, default: null },
  case_count: { type: Number, default: null },
  case_id_list: { type: [Number], default: [] },
  case_arrease: { type: Number, default: null },  
}, { _id: false });

const batchseqSchema = new Schema({
    batch_seq: { type: Number, required: true},
    created_on: { type: Date, required: true },
    created_by: { type: String, maxlength: 30, required: true},
    action_type: { type: String, maxlength: 30, required: true, enum: ['distribution', 'amend'],},
    batch_case_count: { type: Number, required: true },
    distribution_details: [arrayOfDistributionSchema] ,
    batch_case_total_arrease: { type: Number, default: null },
    proposed_user_distribution: { type: String, maxlength: 30, default: null },
    task_id: { type: Number, required: true },
    Action_Status: { type: String, maxlength: 30, required: true },
    Issue_List: [issueListSchema]
}, { _id: false });

const crdDistributionStatusSchema = new Schema({
  crd_distribution_status: { 
    type: String, 
    maxlength: 30,
    enum: ['Open', 'batch_forword_distribute', 'batch_amend', 'batch_approved', 'batch_forword_approval', 'batch_distributed', 'batch_rejected', 'rejected_batch_distributed', 'selection_failed'], // Define allowed statuses
    required: true 
  },
  created_dtm: { type: Date, required: true },
  batch_status_discription : { type: String, maxlength: 255, default: null},
  created_by : {type:String, maxlength: 30, required:true}
},{ _id: false });

const bulkDetailsSchecma = new Schema({
  inspected_count: { type: Number, default: null},
  inspected_arrease: { type: Number, default: null},
  captured_count: { type: Number, default: null},
  captured_arrease: { type: Number, default: null },
},{ _id: false });

const caseDistributionSchema = new Schema({
    doc_version : {type:Number, required: true, default: 1},
    case_distribution_batch_id: { type: Number, required: true, unique: true },
    approver_reference: { type: Number, default: null },
    current_arrears_band: { type: String, maxlength: 30, required: true},
    drc_commision_rule: { type: String, maxlength: 30, required: true },
    current_batch_distribution_status: { type: String, maxlength: 30, required: true },
    current_distribution_status_on: { type: Date, required: true },
    // distribution_status: { type: String, required: true },
    last_updatedAt: { type: Date, required: true },
    Forward_For_Approvals_On: { type: Date, default: null },
    Approved_By: { type: String, default: null },
    Approved_On: { type: Date, default: null },
    Proceed_On: { type: Date, default: null },
    tmp_record_remove_on: { type: Date, default: null },
    forward_case_distribution_batch_id: { type: Number, default: null },
    proposed_drc_distribution: { type: String, maxlength: 30, required: true },
    bulk_Details: [bulkDetailsSchecma],
    batch_status: [crdDistributionStatusSchema],
    batch_details: [batchseqSchema],

},{
  collection: 'Case_distribution_drc_transactions',
  timestamps: true
});

const CaseDistribution = model('CaseDistribution', caseDistributionSchema);

export default CaseDistribution;
