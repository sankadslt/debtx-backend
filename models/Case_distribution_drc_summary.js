import { Schema, model } from 'mongoose';

// Define the schema
const caseDistributionDRCSummarySchema = new Schema({
  case_distribution_batch_id: { type: Number, required: true },
  created_dtm: { type: Date, required: true },
  drc_id: {type:Number, required:true},
  rtom: {type:String, required:true},
  case_count: {type:String, required:true},
  tot_arrease: {type:Number, required:true},
  month_1_sc: {type:Number, default:null},
  month_2_sc: {type:Number, default:null},
  month_3_sc: {type:Number, default:null},
},
{
    collection: 'Case_Distribution_DRC_Summary', 
    timestamps: true,
});

// Create the model
const caseDistributionDRCSummary = model('caseDistributionDRCSummary', caseDistributionDRCSummarySchema);

export default caseDistributionDRCSummary;
