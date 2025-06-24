import { Schema, model } from 'mongoose';

const cases_details_schema = new Schema({
  case_id: {type:Number, required: true,},
  drc_id : {type:Number, required: true,},
  rtom: {type:String, required: true,},
  arrease: {type:Number, required: true},
  new_drc_id : {type:Number, default: null},
  proceed_on: {type:Date, default:null},
  updatedAt : {type:Date, default:null}
},{_id: false })

// Define the schema
const temCaseDistributionSchema = new Schema({
  doc_version : {type:Number, required: true, default: 1},
  case_distribution_batch_id: { type: Number, required: true },
  batch_seq:{ type: Number, required: true },
  created_dtm: { type: Date, required: true },
  proceed_on: { type: Date, required: true },
  cases_details : [cases_details_schema]
},
{
    collection: 'Case_distribution_drc_details', 
    timestamps: true,
});

// Create the model
const tempCaseDistribution = model('tempCaseDistribution', temCaseDistributionSchema);

export default tempCaseDistribution;
