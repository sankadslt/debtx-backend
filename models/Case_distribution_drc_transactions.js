// import { Schema, model } from 'mongoose';

// // Define the schema
// const caseDistributionSchema = new Schema({
//   case_distribution_batch_id: { type: Number, required: true },
//   batch_seq: { type: Number, required: true },
//   created_dtm: { type: Date, required: true },
//   created_by: { type: String, required: true },
//   action_type: { type: String, required: true },
//   drc_commision_rule: { type: String, required: true },
  
//   array_of_distribution: [
//     {
//       drc_abbreviation: { type: String, required: true },
//       rtom: { type: String, required: true },
//       case_count: { type: Number, required: true },
//       sum_of_arrears: { type: Number, required: true }
//     }
//   ],
//   selection_logic: { type: String, required: true },
//   rulebase_count: { type: Number, required: true },
//   rulebase_arrears_sum: { type: Number, required: true },
//   forward_for_approvals_on: { type: Date },
//   approved_by: { type: String },
//   approved_on: { type: Date },
//   proceed_on: { type: Date },
//   tmp_record_remove_on: { type: Date }
// },
// {
//     collection: 'Case_distribution_drc_transactions', 
//     timestamps: true,
// }
// );

// // Create the model
// const CaseDistribution = model('CaseDistribution', caseDistributionSchema);

// export default CaseDistribution;



import { Schema, model } from 'mongoose';

// Define the crd_distribution_status schema
const crdDistributionStatusSchema = new Schema({
  crd_distribution_status: { 
    type: String, 
    enum: ['Open', 'Inprogress', 'Error', 'Complete'], // Define allowed statuses
    required: true 
  },
  created_dtm: { type: Date, required: true }
});

// Define the main schema
const caseDistributionSchema = new Schema(
  {
    case_distribution_batch_id: { type: Number, required: true },
    batch_seq: { type: Number, required: true },
    created_dtm: { type: Date, required: true },
    created_by: { type: String, required: true },
    action_type: { 
      type: String, 
      enum: ['distribution', 'amend'], // Restrict action_type to these two values
      required: true 
    },
    drc_commision_rule: { type: String, required: true },
    arrears_band: { type: String, required: true }, // Added arrears_band field

    array_of_distribution: [
      {
        drc_abbreviation: { type: String, required: true },
        rtom: { type: String, required: true },
        case_count: { type: Number, required: true },
        sum_of_arrears: { type: Number, required: true }
      }
    ],

    selection_logic: { type: String, required: true },
    rulebase_count: { type: Number, required: true },
    rulebase_arrears_sum: { type: Number, required: true },

    // Move crd_distribution_status here
    crd_distribution_status: [crdDistributionStatusSchema],

    forward_for_approvals_on: { type: Date },
    approved_by: { type: String },
    approved_on: { type: Date },
    proceed_on: { type: Date },
    tmp_record_remove_on: { type: Date }
  },
  {
    collection: 'Case_distribution_drc_transactions', // Collection name
    timestamps: true // Automatically include createdAt and updatedAt
  }
);

// Create the model
const CaseDistribution = model('CaseDistribution', caseDistributionSchema);

export default CaseDistribution;
