import { Schema, model } from 'mongoose';

const rtom_details_schema = new Schema({
  rtom : {type:String, maxlength: 30, required: true,},
  case_count: { type: Number, required: true },
  rtom_tot_arrease: { type: Number, required: true },
  month_1_sc : { type: Number, default:null},
  month_2_sc : { type: Number, default:null},
  month_3_sc : { type: Number, default:null},
})

const drc_distribution_schema = new Schema({
  drc_id : {type:Number, required: true,},
  drc_name: { type: String, maxlength: 30, required: true },
  batch_seq: { type: Number, required: true },
  drc_tot_arrease : { type: Number, required: true },
  rtom_details : [rtom_details_schema],
})

const caseDistributionDRCSummarySchema = new Schema({
  doc_version : {type:Number, required: true, default: 1},
  case_distribution_batch_id: { type: Number, required: true },
  created_dtm: { type: Date, required: true },
  distributed_tot_arrease : { type: Number, required: true },
  drc_distribution : [drc_distribution_schema],
  updatedAt : {type: Date, default: null}
},
{
    collection: 'Case_distribution_drc_summary', 
    timestamps: true,
});

// Create the model
const caseDistributionDRCSummary = model('caseDistributionDRCSummary', caseDistributionDRCSummarySchema);

export default caseDistributionDRCSummary;
