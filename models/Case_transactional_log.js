/* Purpose: This template is used for the Case Transactional Log.
Created Date: 2025-01-23 
Created By: Sasindu Srinayaka (sasindusrinayaka@gmail.com)
Last Modified Date: 
Modified By: 
Version: Node.js v20.11.1
Notes:  */

import mongoose from 'mongoose';
const { Schema, model } = mongoose;


const updatedSchema = new Schema({
    action: {
        type: String,
        required: true,
    },
    created_by: {
        type: String,
        required: true,
    },
    created_date: {
        timestamps: true,
    },
});


const caseTransactionalLogSchema = new Schema(
  {
    doc_version : {type:Number, required: true, default: 1},
    case_id: { 
        type: Number, 
        required: true 
    },
    drc_id: { 
        type: Number, 
        required: true 
    },
    transaction_type_id: { 
        type: Number, 
        required: true 
    },
    created_by: { 
        type: String, 
        required: true 
    },
    parameters: { 
      type: Map, 
      of: Number, 
      required: true
    },
    updated_case: {
        type: [updatedSchema], 
        default: []
    },
  },
  {
    collection: 'Case_transactional_log',
    timestamps: true,
  }
);

// Create the model from the schema
const CaseTransactionalLog = model('Case_transactional_log', caseTransactionalLogSchema);

export default CaseTransactionalLog;
