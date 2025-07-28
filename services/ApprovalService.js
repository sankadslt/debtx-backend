// services/ApprovalService.js
import Tmp_SLT_Approval from "../models/Tmp_SLT_Approval.js";
import TmpForwardedApprover from "../models/Template_forwarded_approver.js";

export const getApprovalUserIdService = async ({ case_phase, approval_type, billing_center = null }) => {
  try {
    const query = {
      ...(case_phase && { case_phase }),
      ...(billing_center && { billing_center }),
      ...(approval_type && { approval_type }),
    };
    const record = await Tmp_SLT_Approval.findOne(query);
    if (!record || !record.user_id) {
      throw new Error("No matching record or user_id found.");
    }
    return record.user_id;
  } catch (error) {
    console.error("Error in getApprovalUserIdService:", error.message);
    throw new Error("Failed to get approval user ID: " + error.message);
  }
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

export const Check_valid_approval = async ({ approver_reference, approver_type }) => {
  try {
    const results = await TmpForwardedApprover.aggregate([
      {
        $match: {
          approver_reference: Number(approver_reference),
          approver_type: approver_type
        }
      },
      {
        $project: {
          approve_status: 1,
          last_status: { $arrayElemAt: ["$approve_status", -1] }
        }
      },
      {
        $match: {
          "last_status.status": "Open"
        }
      }
    ]);
    if (results.length === 0) {
      return "success";
    }
    return "There is an open approval with this approver type and approver reference";
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Failed to check valid approval.");
  }
};


