// // import { Schema, model } from 'mongoose';

// // // Define the schema
// // const caseDistributionSchema = new Schema({
// //   case_distribution_batch_id: { type: Number, required: true },
// //   batch_seq: { type: Number, required: true },
// //   created_dtm: { type: Date, required: true },
// //   created_by: { type: String, required: true },
// //   action_type: { type: String, required: true },
// //   drc_commision_rule: { type: String, required: true },
  
// //   array_of_distribution: [
// //     {
// //       drc_abbreviation: { type: String, required: true },
// //       rtom: { type: String, required: true },
// //       case_count: { type: Number, required: true },
// //       sum_of_arrears: { type: Number, required: true }
// //     }
// //   ],
// //   selection_logic: { type: String, required: true },
// //   rulebase_count: { type: Number, required: true },
// //   rulebase_arrears_sum: { type: Number, required: true },
// //   forward_for_approvals_on: { type: Date },
// //   approved_by: { type: String },
// //   approved_on: { type: Date },
// //   proceed_on: { type: Date },
// //   tmp_record_remove_on: { type: Date }
// // },
// // {
// //     collection: 'Case_distribution_drc_transactions', 
// //     timestamps: true,
// // }
// // );

// // // Create the model
// // const CaseDistribution = model('CaseDistribution', caseDistributionSchema);

// // export default CaseDistribution;



// import { Schema, model } from 'mongoose';
 
// // Define the crd_distribution_status schema
// const crdDistributionStatusSchema = new Schema({
//   crd_distribution_status: { 
//     type: String, 
//     enum: ['Open', 'Inprogress', 'Error', 'Complete'], // Define allowed statuses
//     required: true 
//   },
//   created_dtm: { type: Date, required: true }
// });

// // Define the array_of_distribution schema with two possible structures
// const arrayOfDistributionSchema = new Schema(
//   {
//     DRC: { type: String }, 
//     Count: { type: Number }, 

//     drc_name: { type: String }, 
//     rtom: { type: String },
//     case_count: { type: Number },
//     sum_of_arrears: { type: Number }
//   },
//   { _id: false }
// );

// // Define the main schema
// const caseDistributionSchema = new Schema(
//   {
//     case_distribution_batch_id: { type: Number, required: true },
//     batch_seq: { type: Number, required: true },
//     created_dtm: { type: Date, required: true },
//     created_by: { type: String, required: true },
//     action_type: { 
//       type: String, 
//       enum: ['distribution', 'amend'], // Restrict action_type to these two values
//       required: true 
//     },
    // drc_commision_rule: { type: String, required: true },
//     current_arrears_band: { type: String, required: true }, // Added arrears_band field

//     array_of_distribution: [arrayOfDistributionSchema],

//     // selection_logic: { type: String, required: true },
//     rulebase_count: { type: Number, required: true },
//     rulebase_arrears_sum: { type: Number, required: true },

//     // Move crd_distribution_status here
//     crd_distribution_status: [crdDistributionStatusSchema],

//     forward_for_approvals_on: { type: Date, default: null  },
//     approved_by: { type: String, default: null  },
//     approved_on: { type: Date, default: null  },
//     proceed_on: { type: Date, default: null  },
//     tmp_record_remove_on: { type: Date, default: null  }
//   },
  // {
  //   collection: 'Case_distribution_drc_transactions', // Collection name
  //   timestamps: true // Automatically include createdAt and updatedAt
  // }
// );

// // Create the model
// const CaseDistribution = model('CaseDistribution', caseDistributionSchema);

// export default CaseDistribution;

import { Schema, model } from 'mongoose';

const arrayOfDistributionSchema = new Schema(
  {
    drc: { type: String },
    drc_id: { type: Number }, 
    rulebase_count: { type: Number }, 
    plus_drc: { type: String },
    plus_drc_id: { type: Number },  
    plus_rulebase_count: { type: Number }, 
    minus_drc: { type: String },
    minus_drc_id: { type: Number }, 
    minus_rulebase_count: { type: Number }, 
    rtom: { type: String },
    // rulebase_arrears_sum: { type: Number }
  },
  { _id: false }
);

const batchseqSchema = new Schema({
    batch_seq: { type: Number, required: true},
    created_dtm: { type: Date, required: true },
    created_by: { type: String, required: true},
    action_type: { type: String, required: true, enum: ['distribution', 'amend'],},
    array_of_distributions: [arrayOfDistributionSchema] ,
    batch_seq_rulebase_count: { type: Number, required: true},
    crd_distribution_status: { type: String, default:null},
    crd_distribution_status_on: { type: Date, default:null },
    // batch_seq_rulebase_arrears_sum: { type: Number, required: true},
}, { _id: false });

const crdDistributionStatusSchema = new Schema({
  crd_distribution_status: { 
    type: String, 
    enum: ['Open', 'Inprogress', 'Error', 'Complete'], // Define allowed statuses
    required: true 
  },
  created_dtm: { type: Date, required: true }
});

const caseDistributionSchema = new Schema({
    doc_version : {type:Number, required: true, default: 1},
    case_distribution_batch_id: { type: Number, required: true, unique: true },
    batch_seq_details: [batchseqSchema],
    created_dtm: { type: Date, required: true },
    created_by: { type: String, required: true},
    current_arrears_band: { type: String, required: true},
    rulebase_count: { type: Number, required: true},
    // rulebase_arrears_sum: { type: Number, required: true},
    status: [crdDistributionStatusSchema],
    drc_commision_rule: { type: String, required: true },
    forward_for_approvals_on: { type: Date, default:null},
    approved_by: { type: String, default:null},
    approved_on: { type: Date, default:null},
    proceed_on: { type: Date, default:null},
    tmp_record_remove_on: { type: Date, default:null},
    crd_distribution_status: { type: String, default:null },
    crd_distribution_status_on: { type: Date, default:null},
},{
  collection: 'Case_distribution_drc_transactions',
  timestamps: true
});

const CaseDistribution = model('CaseDistribution', caseDistributionSchema);

export default CaseDistribution;
