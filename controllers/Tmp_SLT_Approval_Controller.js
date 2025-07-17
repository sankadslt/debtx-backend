import Tmp_SLT_Approval from "../models/Tmp_SLT_Approval.js";
import { getApprovalUserIdService } from "../services/ApprovalService.js";
import { getBatchApprovalUserIdService } from "../services/ApprovalService.js";


export const getApprovalUserId = async ({
    case_phase,
    approval_type,
    billing_center
}) => {
    try {
      if (!case_phase && !approval_type) {
        throw new Error("case_phase and approval_type are required.");
      }
  
      const user_id = await getApprovalUserIdService({
        case_phase,
        approval_type,
        billing_center,
      });
  
      return {
        status: "success",
        message: "User id fetched successfully",
        user_id,
      };
    } catch (error) {
      console.error("Error fetching approval user_id:", error);
      throw new Error(error.message);
    }
};

export const getBatchApprovalUserId = async (req, res) => {
    try {
        const { case_phase, approval_type, billing_center } = req.body;

        if (!case_phase || !approval_type || !billing_center) {
            return res.status(400).json({ message: "case_phase, approval_type, and billing_center are required." });
        }

        const user_id = await getBatchApprovalUserIdService({ case_phase, approval_type, billing_center });

        res.status(200).json({ user_id });
    } catch (error) {
        console.error("Error fetching approval user_id:", error);
        res.status(404).json({ message: error.message });
    }
};