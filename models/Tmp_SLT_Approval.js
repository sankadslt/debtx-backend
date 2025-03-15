import {mongoose} from "mongoose";
const { Schema } = mongoose;

const tmpSLTApprovalSchema = new Schema({
    user_id: { type: String, required: true },
    case_phase: { type: String, required: true },
    approval_type: { type: String, required: true },
    billing_center: { type: String},
    end_dtm: { type: Date, required: true },
});

const Tmp_SLT_Approval = mongoose.model('Tmp_SLT_Approval', tmpSLTApprovalSchema);

export default Tmp_SLT_Approval;