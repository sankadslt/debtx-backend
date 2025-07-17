import mongoose, { model } from 'mongoose';

const { Schema } = mongoose;

const remarkSchema = new Schema({
    remark: {
        type: String,
        maxlength: 255,
        required: true,
    },
    remark_date: {
        type: Date,
        required: true,
    },
    remark_edit_by: {
        type: String,
        maxlength: 30,
        required: true,
    },
});
const statusSchema = new Schema({
    status: {
        type: String,
        maxlength: 30,
        enum: ['Open', 'Approve', 'Reject'],
        required: true,
    },
    status_date: {
        type: Date, // Change to Date type
        required: true,
    },
    status_edit_by: {
        type: String,
        maxlength: 30,
        required: true,
    },
});
const temmplateForwardedApproverSchema = new Schema({
  doc_version : {type:Number, required: true, default: 1},
  approver_id: { type: Number, required: true, unique: true },
  approver_reference: { type: Number, required: true },
  created_on: { type: Date, required: true, default: Date.now },
  created_by: { type: String, maxlength: 30, required: true },
  approve_status: { type: [statusSchema]},
  approver_type: { 
    type: String, 
    maxlength: 30,
    enum: ['DRC_Distribution', 'DRC Re-Assign Approval','DRC Assign Approval', 'Case Withdrawal Approval','Case Abandoned Approval','Case Write-Off Approval','Commission Approval','DRC Agreement' ], 
    required: true 
  }, 
  parameters: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
      default: {},
    },
  approved_deligated_by: { type: String, maxlength: 30, default: null },
  remark:  {type:[remarkSchema]},
}, { 
  collection: 'Template_forwarded_approver', 
  timestamps: true
});

const TmpForwardedApprover = model('TmpForwardedApprover', temmplateForwardedApproverSchema);

export default TmpForwardedApprover;
