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
import MoneyTransaction from "../models/Money_transactions.js";
import TemplateForwardedApprover from "../models/Template_forwarded_approver.js";
import {createUserInteractionFunction} from "../services/UserInteractionService.js"
import { getApprovalUserId } from "../controllers/Tmp_SLT_Approval_Controller.js";
import mongoose from "mongoose";


export const ListAllLitigationCases = async (req, res) => {
    try {
        const { case_current_status, date_type, from_date, to_date, pages } = req.body;

        if (!case_current_status && !date_type && !from_date && !to_date) {
            res.status(400).json({
                status:"error",
                message: "All These One parameter is required. case_current_status, date_type, from_date, to_date."
            });
        };

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
    const session = await mongoose.startSession();
    session.startTransaction();

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
            await session.abortTransaction();
            session.endSession();
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

        // Conditionally update case_current_status based on file statuses
        let updateFields = {
            $push: {
                "litigation.0.support_documents.rtom_customer_file": rtomDocument,
                "litigation.0.support_documents.drc_file": drcDocument,
            },
        };

        const isPendingFTL =
            (rtom_customer_file_status === "Collected" && drc_file_status === "Collected") ||
            (rtom_customer_file_status === "Without Agreement" && drc_file_status === "Collected");

        if (isPendingFTL) {
            updateFields.$set = {
                case_current_status: "Pending FTL",
            };
        }

        const updatedCase = await LitigationDetails.findOneAndUpdate(
            { case_id },
            updateFields,
            { session, new: true }
        );

        if (!updatedCase) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                status: "error",
                message: "Case not found.",
                errors: {
                    code: 404,
                    description: `No case found with case_id ${case_id}.`,
                },
            });
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            status: "success",
            message: "Litigation document created successfully.",
            data: updatedCase,
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
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
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { case_id, submission, submission_by, submission_remark } = req.body;

        if (!case_id || !submission || !submission_by || !submission_remark) {
            return res.status(400).json({
                status: "error",
                message: "Missing required fields.",
                errors: {
                    code: 400,
                    description: "case_id, submission, submission_by, submission_remark are required.",
                },
            });
        }

        const legalSubmission = {
            submission,
            submission_on: new Date(),
            submission_by,
            submission_remark,
        };

        // Push new submission to the case
        const updatedCase = await LitigationDetails.findOneAndUpdate(
            { case_id },
            {
                $push: {
                    "litigation.legal_submission": legalSubmission,
                },
            },
            { session, new: true }
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

        // Determine the new status based on submission value
        let newStatus = "";
        if (submission === "legal Accepted") {
            newStatus = "Forward To Litigation";
        } else if (submission === "legal Rejected") {
            newStatus = "Fail From Legal Unit";
        } else {
            return res.status(400).json({
                status: "error",
                message: "Invalid submission value.",
                errors: {
                    code: 400,
                    description: "Submission must be either 'legal Accepted' or 'legal Rejected'.",
                },
            });
        }

        // Update the case_current_status
        const caseStatusUpdate = await LitigationDetails.findOneAndUpdate(
            { case_id },
            { $push: {
                case_status: {
                    case_status: newStatus,
                    status_reason: submission_remark,
                    created_dtm: new Date(),
                    created_by: submission_by,
                    case_phase: "Litigation", // should be change to case_phase according to the  /Case_Phase API
                },
            }
            },
            { $set: { case_current_status: newStatus } },
            { session, new: true }
        );

        if (!caseStatusUpdate) {
            return res.status(404).json({
                status: "error",
                message: "Case not found for status update.",
                errors: {
                    code: 404,
                    description: `No case found with case_id ${case_id}.`,
                },
            });
        }

        await session.commitTransaction(); // ✅ COMMIT the transaction
        session.endSession();

        return res.status(200).json({
            status: "success",
            message: "Litigation document updated successfully.",
            data: updatedCase,
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
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

export const createLegalDetails = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { case_id, court_no, court_register_dtm, case_handling_officer, remark, created_by } = req.body;

        if (!case_id || !court_no || !court_register_dtm || !case_handling_officer || !remark || !created_by) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                status: "error",
                message: "Missing required fields.",
                errors: {
                    code: 400,
                    description: "case_id, court_no, case_handling_officer, action_type, court_register_dtm, remark, and created_by are required.",
                },
            });
        }

        const legalDetails = {
            court_no,
            action_type: "Legal Fail",
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
                    case_status: {
                        case_status: "Litigation",
                        status_reason: remark, // used remark as the status reason
                        created_dtm: new Date(),
                        created_by,
                        case_phase: "Litigation", // TODO: dynamic from /Case_Phase API
                    },
                },
                $set: {
                    case_current_status: "Litigation"
                }
            },
            { session, new: true } // ✅ correct placement of session and options
        );

        if (!updatedCase) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                status: "error",
                message: "Case not found.",
                errors: {
                    code: 404,
                    description: `No case found with case_id ${case_id}.`,
                },
            });
        }

        await session.commitTransaction(); // ✅ COMMIT the transaction
        session.endSession();

        return res.status(200).json({
            status: "success",
            message: "Legal details added successfully.",
            data: updatedCase,
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
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

export const createLegalFail = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { case_id, remark, created_by } = req.body; 

        if (!case_id || !remark || !created_by) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                status: "error",
                message: "Missing required fields.",
                errors: {
                    code: 400,
                    description: "case_id, remark are required.",
                },
            });
        }
        const legalDetails = {
            action_type: "Legal Fail",
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
            { session, new: true }
        );

        if (!updatedCase) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                status: "error",
                message: "",
                errors: {
                    code: 404,
                    description: `No case found with case_id ${case_id}.`,
                },
            });
        }

        const case_phase = "Litigation";
        const approval_type = "Case Write-Off Approval";

        const delegateResult = await getApprovalUserId({
            case_phase,
            approval_type,
        });
          
        if (!delegateResult?.user_id) {
            await session.abortTransaction();
            session.endSession();
            throw new Error("Failed to resolve delegated user_id.");
        }

        const newTempApprover = new TemplateForwardedApprover(
            {
                approver_reference: case_id,
                created_on: new Date(),
                created_by: created_by,
                approve_status: {
                    status: "Open",
                    status_date: new Date(),
                    status_edit_by: created_by,
                },
                approver_type: "Case Write-Off Approval",
                approved_deligated_by: Number(delegateResult.user_id), // approved_deligated_by id according to the /Obtain_Nominee API
                remark: {
                    remark: remark,
                    remark_date: new Date(),
                    remark_edit_by: created_by,
                },
            }
        );

        await newTempApprover.save({ session }); // Save the new temporary approver to the database

        if (!newTempApprover) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                status: "error",
                message: "Faild to create temporary approver.",
                errors: {
                    code: 404,
                    description: `Faild to update temporary approver with case_id ${case_id}.`,
                },
            });
        }

        // create user interaction for case write-off approval for Create User Interaction Log
        const interaction_id = 21; // this must be changed later
        const request_type = "Pending Approval for Case Write-Off";
        const dynamicParams = { case_id };
    
        const interactionResult = await createUserInteractionFunction({
            Interaction_ID: interaction_id,
            User_Interaction_Type: request_type,
            delegate_user_id: Number(delegateResult.user_id), // Dynamic delegate_id
            Created_By: created_by,
            User_Interaction_Status: "Open",
            User_Interaction_Status_DTM: new Date(),
            ...dynamicParams,
        },{session} // Pass the session to the function
        );

        await session.commitTransaction(); // ✅ COMMIT the transaction
        session.endSession();

        return res.status(200).json({
            status: "success",
            message: "Litigation document updated successfully.",
            data: { updatedCase, newTempApprover, interactionResult }
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
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
  
      const [caseSettlement, casePayment] = await Promise.all([
        CaseSettlement.findOne(
          { case_id },
          { settlement_plan: 1, last_monitoring_dtm: 1 }
        ),
        MoneyTransaction.findOne(
          { case_id },
          {
            transaction_type: 1,
            money_transaction_amount: 1,
            money_transaction_date: 1,
            installment_seq: 1,
            cummulative_settled_balance: 1,
            created_dtm: 1,
          }
        ),
      ]);
  
      return res.status(200).json({
        status: "success",
        message: "Litigation phase case details retrieved successfully.",
        data: {
          settlementData: caseSettlement || null,
          paymentData: casePayment || null,
        },
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