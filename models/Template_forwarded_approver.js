import mongoose, { model } from 'mongoose';

const { Schema } = mongoose;

const remarkSchema = new Schema({
    remark: {
        type: String,
        required: true,
    },
    remark_date: {
        type: Date,
        required: true,
    },
    remark_edit_by: {
        type: String,
        required: true,
    },
});
const statusSchema = new Schema({
    status: {
        type: String,
        enum: ['Open', 'Approve', 'Reject'],
        required: true,
    },
    status_date: {
        type: Date, // Change to Date type
        required: true,
    },
    status_edit_by: {
        type: String,
        required: true,
    },
});
const temmplateForwardedApproverSchema = new Schema({
  approver_reference: { type: String, required: true },
  created_on: { type: Date, required: true, default: Date.now },
  created_by: { type: String, required: true },
  approve_status: { type: [statusSchema]},
  approver_type: { 
    type: String, 
    enum: ['DRC_Distribution', 'DRC_ReAssign'], 
    required: true 
  }, 
  approved_by: { type: String, default: null },
  remark:  {type:[remarkSchema]},
}, {
  collection: 'Template_forwarded_approver', 
  timestamps: true
});

const TmpForwardedApprover = model('TmpForwardedApprover', temmplateForwardedApproverSchema);

export default TmpForwardedApprover;
