import {mongoose} from "mongoose";
const { Schema } = mongoose;

const tmpSLTApprovalSchema = new Schema({
    doc_version : {type:Number, required: true, default: 1},
    user_id: { type: String, maxlength: 30, required: true },
    case_phase: { type: String, maxlength: 30, required: true },
    approval_type: { type: String, maxlength: 30, required: true },
    billing_center: { type: String, maxlength: 30 },
    end_dtm: { type: Date, required: true },
},
{
  collection: 'Template_SLT_Approval', 
  timestamps: true,
});
 
const Tmp_SLT_Approval = mongoose.model('Tmp_SLT_Approval', tmpSLTApprovalSchema);

export default Tmp_SLT_Approval;