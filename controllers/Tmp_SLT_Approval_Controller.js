import Tmp_SLT_Approval from "../models/Tmp_SLT_Approval.js";
import { getApprovalUserIdService } from "../services/ApprovalService.js";
import { getBatchApprovalUserIdService } from "../services/ApprovalService.js";


// Get approval user_id for a single case_phase and approval_type
// export const getApprovalUserId = async (req, res) => {
//     try {
//         const { case_phase, approval_type, billing_center } = req.body;

//         if (!case_phase || !approval_type) {
//             return res.status(400).json({ message: "case_phase and approval_type are required." });
//         }

//         const query = { case_phase, approval_type };
//         if (billing_center) {
//             query.billing_center = billing_center;
//         }

//         const record = await Tmp_SLT_Approval.findOne(query);

//         if (!record) {
//             return res.status(404).json({ message: "No matching record found." });
//         }

//         res.status(200).json({ user_id: record.user_id });
//     } catch (error) {
//         console.error("Error fetching approval user_id:", error);
//         res.status(500).json({ message: "Internal Server Error." });
//     }
// };

export const getApprovalUserId = async ({
    case_phase,
    approval_type,
    billing_center
}) => {
    try {
      if (!case_phase || !approval_type) {
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
      throw new Error(error.message); // ✅ Re-throw to be caught in controller
    }
};
  

// Get approval user_id for a batch of case_phase and approval_type
// export const getBatchApprovalUserId = async (req, res) => {
//     try {
//         const { case_phase, approval_type, billing_center } = req.body;

//         if (!case_phase || !approval_type || billing_center) {
//             return res.status(400).json({ message: "case_phase and approval_type are required." });
//         }

//         const record = await Tmp_SLT_Approval.findOne({ case_phase, approval_type, billing_center });

//         if (!record) {
//             return res.status(404).json({ message: "No matching batch found." });
//         }

//         res.status(200).json({ user_id: record.user_id });
//     } catch (error) {
//         console.error("Error fetching approval user_id:", error);
//         res.status(500).json({ message: "Internal Server Error." });
//     }
// };


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