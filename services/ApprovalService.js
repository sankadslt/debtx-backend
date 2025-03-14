// services/ApprovalService.js
import Tmp_SLT_Approval from "../models/Tmp_SLT_Approval.js";

export const getApprovalUserIdService = async ({ case_phase, approval_type, billing_center = null }) => {
    const query = { case_phase, approval_type };
    if (billing_center) {
        query.billing_center = billing_center;
    }

    const record = await Tmp_SLT_Approval.findOne(query);
    if (!record) {
        throw new Error("No matching record found.");
    }

    return record.user_id;
};

export const getBatchApprovalUserIdService = async ({ case_phase, approval_type, billing_center }) => {
    const query = { case_phase, approval_type };
    if (billing_center) {
        query.billing_center = billing_center;
    }

    const record = await Tmp_SLT_Approval.findOne(query);
    if (!record) {
        throw new Error("No matching batch found.");
    }

    return record.user_id;
};
