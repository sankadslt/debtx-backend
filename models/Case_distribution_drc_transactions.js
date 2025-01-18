import { Schema, model } from 'mongoose';

// Define the schema
const caseDistributionSchema = new Schema({
  case_distribution_batch_id: { type: Number, required: true },
  batch_seq: { type: Number, required: true },
  created_dtm: { type: Date, required: true },
  created_by: { type: String, required: true },
  action_type: { type: String, required: true },
  drc_selection_rule: { type: String, required: true },
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
  forward_for_approvals_on: { type: Date },
  approved_by: { type: String },
  approved_on: { type: Date },
  proceed_on: { type: Date },
  tmp_record_remove_on: { type: Date }
},
{
    collection: 'Case_distribution_drc_transactions', 
    timestamps: true,
}
);

// Create the model
const CaseDistribution = model('CaseDistribution', caseDistributionSchema);

export default CaseDistribution;
