/* 
    Purpose: This template is used for the Litigation Controllers.
    Created Date: 2025-04-01
    Created By:  Sasindu Srinayaka (sasindusrinayaka@gmail.com)
    Last Modified 
    Modified By: Sasindu Srinayaka (sasindusrinayaka@gmail.com)
    Version: Node.js v20.11.1
    Dependencies: axios , mongoose
    Related Files: Litigation_route.js
    Notes:  
*/

import LitigationDetails from "../models/Case_details.js";
import CaseSettlement from "../models/Case_settlement.js";
import CasePayment from "../models/Case_payments.js";
import TemplateForwardedApprover from "../models/Template_forwarded_approver.js";
import {createUserInteractionFunction} from "../services/UserInteractionService.js"
import { getApprovalUserId } from "../controllers/Tmp_SLT_Approval_Controller.js";

// export const ListAllLitigationCases = async (req, res) => {
//     const { case_current_status, date_type, from_date, to_date } = req.body;
  
//     try {
//         // Construct base query
//         const query = {};
  
//         // Filter by case_current_status if provided
//         if (case_current_status) {
//             query.case_current_status = {
//                 $in: [
//                     "Initial Litigation", "Pending FTL", "Forward To Litigation", "Fail from Legal Unit", "Fail Legal Action", "Litigation", "Litigation Settle Pending", "Litigation Settle Open-Pending", "Litigation Settle Active"
//                 ],
//             };
//         }
  
//         // Apply date filtering based on date_type
//         if (date_type && from_date && to_date) {
//             const fromDateObj = new Date(from_date);
//             const toDateObj = new Date(to_date);
  
//             if (date_type === "Settlement created dtm") {
//                 query["settlement.settlement_created_dtm"] = {
//                     $gte: fromDateObj,
//                     $lte: toDateObj,
//                 };
//             } else if (date_type === "legal accepted date") {
//                 query["litigation.legal_submission.submission_on"] = {
//                     $gte: fromDateObj,
//                     $lte: toDateObj,
//                 };
//             }
//         }
  
//         // Fetch cases based on the constructed query
//         const cases = await LitigationDetails.find(query);
  
//         // Handle case where no matching cases are found
//         if (!cases || cases.length === 0) {
//             return res.status(404).json({
//                 status: "error",
//                 message: "No matching cases found for the given criteria.",
//                 errors: {
//                     code: 404,
//                     description: "No cases satisfy the provided criteria.",
//                 },
//             });
//         }
  
//         // Return response
//         return res.status(200).json({
//             status: "success",
//             message: "Cases retrieved successfully.",
//             data: cases,
//         });
  
//     } catch (error) {
//         console.error("Error in function:", error);
//         return res.status(500).json({
//             status: "error",
//             message: "An error occurred while retrieving cases.",
//             errors: {
//                 code: 500,
//                 description: error.message,
//             },
//         });
//     }
// };


// Function to list all litigation cases with pagination and filtering
export const ListAllLitigationCases = async (req, res) => {
    try {
        const { case_current_status, date_type, from_date, to_date, pages } = req.body;

        // Ensure `pages` is a valid number
        let page = Number(pages);
        if (isNaN(page) || page < 1) page = 1;

        // Set pagination logic: First page loads 10 rows, then 30 rows subsequently
        const limit = page === 1 ? 10 : 30;
        const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

        // Construct base query
        const query = {
            case_current_status : {
                $in: [
                    "Initial Litigation", "Pending FTL", "Forward To Litigation", "Fail from Legal Unit", 
                    "Fail Legal Action", "Litigation", "Litigation Settle Pending", 
                    "Litigation Settle Open-Pending", "Litigation Settle Active"
                ],
            },
        };

        if (case_current_status) query.case_current_status = case_current_status;

        // Apply date filtering based on `date_type`
        if (date_type && from_date && to_date) {
            const fromDateObj = new Date(from_date);
            const toDateObj = new Date(to_date);

            if (date_type === "Settlement created dtm") {
                query["settlement.settlement_created_dtm"] = { $gte: fromDateObj, $lte: toDateObj };
            } else if (date_type === "legal accepted date") {
                query["litigation.legal_submission.submission_on"] = { $gte: fromDateObj, $lte: toDateObj };
            }
        }

        // Fetch the total count of cases that match the filter criteria (without pagination)
        const totalCount = await LitigationDetails.countDocuments(query);

        // Fetch cases with pagination
        const cases = await LitigationDetails.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ case_id: -1 });

        // If no matching cases are found
        if (!cases || cases.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "No matching cases found for the given criteria.",
                errors: {
                    code: 404,
                    description: "No cases satisfy the provided criteria.",
                },
            });
        }

        // Use Promise.all to handle asynchronous operations
        const formattedCases = await Promise.all(
            cases.map(async (caseData) => {
                const lastLitigation = caseData.litigation[caseData.litigation.length - 1];
                const lastLitigationSubmission = lastLitigation.legal_submission[lastLitigation.legal_submission.length - 1];

                const lastSettlement = caseData.settlement[caseData.settlement.length - 1]; 
    
            return {
                case_id: caseData.case_id,
                status: caseData.case_current_status,
                account_no: caseData.account_no,
                current_arreas_amount: caseData.current_arrears_amount,
                legal_accepted_date: lastLitigationSubmission.submission_on,
                settlement_created_date: lastSettlement.settlement_created_dtm,
            };
            })
        );

        // Return paginated response
        return res.status(200).json({
            status: "success",
            message: "Cases retrieved successfully.",
            current_page: page,
            total_cases: totalCount,
            data: formattedCases,
        });

    } catch (error) {
        console.error("Error in function:", error);
        return res.status(500).json({
            status: "error",
            message: "An error occurred while retrieving cases.",
            errors: {
                code: 500,
                description: error.message,
            },
        });
    }
};

export const createLitigationDocument = async (req, res) => {
    try {
        const {
            case_id,
            rtom_customer_file_status,
            rtom_file_status_by,
            rtom_pages_count,
            drc_file_status,
            drc_file_status_by,
            drc_pages_count,
        } = req.body;

        if (!case_id || !rtom_customer_file_status || !drc_file_status || !rtom_file_status_by || !drc_file_status_by) {
            return res.status(400).json({
                status: "error",
                message: "Missing required fields.",
                errors: {
                    code: 400,
                    description: "case_id, rtom_customer_file_status, drc_file_status, rtom_file_status_by, drc_file_status_by are required.",
                },
            });
        }

        const rtomDocument = {
            file_status: rtom_customer_file_status,
            file_status_on: new Date(),
            file_status_by: rtom_file_status_by,
            pages_count: rtom_pages_count,
        };

        const drcDocument = {
            file_status: drc_file_status,
            file_status_on: new Date(),
            file_status_by: drc_file_status_by,
            pages_count: drc_pages_count,
        };

        const updatedCase = await LitigationDetails.findOneAndUpdate(
            { case_id },
            {
                $push: {
                    "litigation.0.support_documents.rtom_customer_file": rtomDocument,
                    "litigation.0.support_documents.drc_file": drcDocument,
                },
            },
            { new: true }
        );

        if (!updatedCase) {
            return res.status(404).json({
                status: "error",
                message: "Case not found.",
                errors: {
                    code: 404,
                    description: `No case found with case_id ${case_id}.`,
                },
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Litigation document created successfully.",
            data: updatedCase,
        });

    } catch (error) {
        console.error("Error in function:", error);
        return res.status(500).json({
            status: "error",
            message: "An error occurred while creating the litigation document.",
            errors: {
                code: 500,
                description: error.message,
            },
        });
    }
};

export const createLegalSubmission = async (req, res) => {
    try {
        const { case_id, submission, submission_on, submission_by, submission_remark } = req.body;

        if (!case_id || !submission || !submission_on || !submission_by || !submission_remark) {
            return res.status(400).json({
                status: "error",
                message: "Missing required fields.",
                errors: {
                    code: 400,
                    description: "case_id, submission, submission_on, submission_by, submission_remark are required.",
                },
            });
        }

        const legalSubmission = {
            submission,
            submission_on: new Date(submission_on),
            submission_by,
            submission_remark,
        };

        const updatedCase = await LitigationDetails.findOneAndUpdate(
            { case_id },
            {
                $push: {
                    "litigation.legal_submission": legalSubmission,
                },
            },
            { new: true }
        );

        if (!updatedCase) {
            return res.status(404).json({
                status: "error",
                message: "Case not found.",
                errors: {
                    code: 404,
                    description: `No case found with case_id ${case_id}.`,
                },
            });
        }

        // Update the case_current_status in Case_details
        const caseStatusUpdate = await LitigationDetails.findOneAndUpdate(
            { case_id },
            { $set: { case_current_status: "Forward To Litigation" } }
        );

        if (!caseStatusUpdate) {
            return res.status(404).json({
                status: "error",
                message: "Case not found in Case_details for status update.",
                errors: {
                    code: 404,
                    description: `No case found with case_id ${case_id} in Case_details.`,
                },
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Litigation document updated successfully.",
            data: updatedCase,
        });

    } catch (error) {
        console.error("Error in function:", error);
        return res.status(500).json({
            status: "error",
            message: "An error occurred while updating the litigation document.",
            errors: {
                code: 500,
                description: error.message,
            },
        });
    }
};

export const listLitigationPhaseCaseDetails = async (req, res) => {
    try {
        const { case_id } = req.body;

        if (!case_id) {
            return res.status(400).json({
                status: "error",
                message: "Missing required field: case_id.",
                errors: {
                    code: 400,
                    description: "case_id is required.",
                },
            });
        }

        const caseDetails = await LitigationDetails.findOne(
            { case_id },
            {
                case_id: 1,
                account_no: 1,
                customer_ref: 1,
                current_arrears_amount: 1,
                last_payment_date: 1,
                'litigation.legal_submission': 1,
                'litigation.legal_details': 1,
            } 
        );

        if (!caseDetails) {
            return res.status(404).json({
                status: "error",
                message: "Case not found.",
                errors: {
                    code: 404,
                    description: `No case found with case_id ${case_id}.`,
                },
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Litigation phase case details retrieved successfully.",
            data: caseDetails,
        });

    } catch (error) {
        console.error("Error in function:", error);
        return res.status(500).json({
            status: "error",
            message: "An error occurred while retrieving litigation phase case details.",
            errors: {
                code: 500,
                description: error.message,
            },
        });
    }
};

export const createLeagalDetails = async (req, res) => {
    try {
        const { case_id, court_no, case_handling_officer, remark, created_by } = req.body;

        if (!case_id || !court_no || !case_handling_officer || !remark || !created_by) {
            return res.status(400).json({
                status: "error",
                message: "Missing required fields.",
                errors: {
                    code: 400,
                    description: "case_id, court_no, court_registered_date, case_handling_officer, remark are required.",
                },
            });
        }

        const legalDetails = {
            court_no,
            court_registered_date: new Date(),
            case_handling_officer,
            remark,
            created_on: new Date(),
            created_by
        };

        const updatedCase = await LitigationDetails.findOneAndUpdate(
            { case_id },
            {
                $push: {
                    "litigation.legal_details": legalDetails,
                },
            },
            { new: true }
        );

        if (!updatedCase) {
            return res.status(404).json({
                status: "error",
                message: "Case not found.",
                errors: {
                    code: 404,
                    description: `No case found with case_id ${case_id}.`,
                },
            });
        }

        // Update the case_current_status in Case_details
        const caseStatusUpdate = await LitigationDetails.findOneAndUpdate(
            { case_id },
            { $set: { case_current_status: "Litigation" } }
        );

        if (!caseStatusUpdate) {
            return res.status(404).json({
                status: "error",
                message: "Case not found in Case_details for status update.",
                errors: {
                    code: 404,
                    description: `No case found with case_id ${case_id} in Case_details.`,
                },
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Litigation document updated successfully.",
            data: updatedCase,
        });
    } catch (error) {
        console.error("Error in function:", error);
        return res.status(500).json({
            status: "error",
            message: "An error occurred while creating legal details.",
            errors: {
                code: 500,
                description: error.message,
            },
        });
    }
}

export const createLeagalFail = async (req, res) => {
    try {
        const { case_id, action_type, remark, created_by } = req.body;        

        if (!case_id || !action_type || !remark || !created_by) {
            return res.status(400).json({
                status: "error",
                message: "Missing required fields.",
                errors: {
                    code: 400,
                    description: "case_id, action_type, remark are required.",
                },
            });
        }
        const legalDetails = {
            action_type,
            remark,
            created_on: new Date(),
            created_by
        };

        const updatedCase = await LitigationDetails.findOneAndUpdate(
            { case_id },
            {
                $push: {
                    "litigation.legal_details": legalDetails,
                    case_status: {
                        case_status: "Pending Approval Write-Off",
                        case_phase: "Litigation", // should be change to case_phase according to the  /Case_Phase API
                    },
                },
                $set: {
                    case_current_status: "Pending Approval Write-Off",
                },
            },
            { new: true }
        );

        // Fixed this part - properly structured update document
        const tempApprover = await TemplateForwardedApprover.findOneAndUpdate(
            { approver_reference: case_id }, // Query criteria (finding document to update)
            {
                $push: {
                    approver_reference: case_id,
                    created_on: new Date(),
                    created_by: created_by,
                    approve_status: {
                        status: "Open",
                        status_date: new Date(),
                        status_edit_by: created_by,
                    },
                    approver_type: "Case Write-Off Approval",
                    // approved_deligated_by: "jgfug", // should be change to approved_deligated_by id according to the /Obtain_Nominee API
                    remark: {
                        remark: remark,
                        remark_date: new Date(),
                        remark_edit_by: created_by,
                    },
                }
            },
            { new: true }
        );

        if (!updatedCase || !tempApprover) {
            return res.status(404).json({
                status: "error",
                message: "",
                errors: {
                    code: 404,
                    description: `No case found with case_id ${case_id}.`,
                },
            });
        }

        const deligate_user_id = await getApprovalUserId({
            case_phase: "Litigation",
            approval_type: "Case Write-Off Approval",
        });

        // create user interaction for case write-off approval for Create User Interaction Log
        const interaction_id = 21; // this must be changed later
        const request_type = "Pending Approval for Case Write-Off";
        const dynamicParams = { case_id };
    
        const interactionResult = await createUserInteractionFunction({
            Interaction_ID: interaction_id,
            User_Interaction_Type: request_type,
            delegate_user_id: deligate_user_id, // Dynamic delegate_id
            Created_By: created_by,
            User_Interaction_Status: "Open",
            User_Interaction_Status_DTM: new Date(),
            ...dynamicParams,
        });

        return res.status(200).json({
            status: "success",
            message: "Litigation document updated successfully.",
            data: { updatedCase, tempApprover, interactionResult }
        });
    } catch (error) {
        console.error("Error in function:", error);
        return res.status(500).json({
            status: "error",
            message: "An error occurred while creating legal details.",
            errors: {
                code: 500,
                description: error.message,
            },
        });
    }
};

export const listLitigationPhaseCaseSettlementAndPaymentDetails = async (req, res) => {
    try {
        const { case_id } = req.body;

        if (!case_id) {
            return res.status(400).json({
                status: "error",
                message: "Missing required field: case_id.",
                errors: {
                    code: 400,
                    description: "case_id is required.",
                },
            });
        }
        const caseSettlement = await CaseSettlement.findOne(
            { case_id },
            {
                settlement_plan: 1,
                last_monitoring_dtm: 1,
            } 
        );
        if (!caseSettlement) {
            return res.status(404).json({
                status: "error",
                message: "Case Settlement not found.",
                errors: {
                    code: 404,
                    description: `No case found with case_id ${case_id}.`,
                },
            });
        }

        const casePayment = await CasePayment.findOne(
            { case_id },
            {
                money_transaction_type: 1,
                money_transaction_amount: 1,
                money_transaction_date: 1,
                installment_seq: 1,
                cummilative_settled_balance: 1,
                created_dtm: 1,
            }
        );
        if (!casePayment) {
            return res.status(404).json({
                status: "error",
                message: "Case Payment not found.",
                errors: {
                    code: 404,
                    description: `No case found with case_id ${case_id}.`,
                },
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Litigation phase case details retrieved successfully.",
            data: caseSettlement, casePayment
        });
    }
    catch (error) {
        console.error("Error in function:", error);
        return res.status(500).json({
            status: "error",
            message: "An error occurred while retrieving litigation phase case details.",
            errors: {
                code: 500,
                description: error.message,
            },
        });
    }
};