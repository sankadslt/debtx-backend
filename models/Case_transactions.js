import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const caseTransactionSchema = new Schema(
  {
    doc_version : {type:Number, required: true, default: 1},
    case_id: { type: Number, required: true },
    drc_id: { type: Number, required: true },
    transaction_type_id: { type: Number, required: true },
    created_by: { type: String, maxlength: 30, required: true },
    parameters: { 
      type: Map, 
      of: Number, 
      required: true
    }
  },
  {
    collection: 'Case_transactions',
    timestamps: true,
  }
);

// Create the model from the schema
const CaseTransaction = model('CaseTransaction', caseTransactionSchema);

export default CaseTransaction;
