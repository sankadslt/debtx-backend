/* 
    Purpose: This template is used for the Litigation Controllers.
    Created Date: 2025-04-01
    Created By:  Sasindu Srinayaka (sasindusrinayaka@gmail.com)
    Last Modified Date: 2025-05-03
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


/*
    Function: 
        - List_All_Litigation_Cases (LIT - 1P01)

    Description:
        - This function retrieves a paginated list of litigation-phase cases from the MongoDB database, filtered by case status and/or date ranges. It supports filtering by settlement creation date or legal acceptance date and returns summary details for each matching case.

    Collections Used:
        - LitigationDetails: Stores all case and litigation phase information.

    Request Body Parameters:
        - case_current_status: (Optional) Filter by a specific case status. If omitted, all predefined litigation statuses are included.
        - date_type: (Optional) The type of date to filter by. Supported values: "Settlement created dtm", "legal accepted date".
        - from_date: (Optional) Start date for the date range filter (ISO string).
        - to_date: (Optional) End date for the date range filter (ISO string)
        - pages: (Optional) Integer for the page number. Page 1 returns 10 results; pages >1 return 30 results each.

    Response:
        - HTTP 200: Success. Returns filtered, paginated case summaries.
        - HTTP 400: No filter parameter provided.
        - HTTP 404: No cases found matching the given criteria.
        - HTTP 500: Internal server error or database failure.

    Flow:
        - Parse and validate input parameters from the request body.
        - Set up pagination: 10 results for page 1, 30 for subsequent pages.
        - Build the MongoDB query:
            By default, filters for cases with litigation-related statuses.
            If case_current_status is provided, filters by that status.
            If date_type, from_date, and to_date are provided, adds the appropriate date range filter:
                * "Settlement created dtm" → settlement.settlement_created_dtm
                * "legal accepted date" → litigation.legal_submission.submission_on
        - Query the LitigationDetails collection using the built filter, with pagination and sorting by descending case_id.
        - Return 404 if no cases are found.
        - Format the cases:
            For each case, extract:
                * case_id
                * status (current status)
                * account_no
                * current_arrears_amount
                * The latest legal_accepted_date (from last legal submission)
                * The latest settlement_created_date (from last settlement)
        - Return a success response with the formatted, paginated case data and total count.
        - Handle errors:
            Return 400 if no filter parameter is provided.
            Return 404 if no cases match the criteria.
            Return 500 for internal server or database errors.
*/
export const ListAllLitigationCases = async (req, res) => {
    try {
        const { case_current_status, date_type, from_date, to_date, pages } = req.body;

        if (!case_current_status && !date_type && !from_date && !to_date) {
            return res.status(400).json({
                status: "error",
                message: "All These One parameter is required. case_current_status, date_type, from_date, to_date."
            });
        };

        let page = Number(pages);
        if (isNaN(page) || page < 1) page = 1;
        const limit = page === 1 ? 10 : 30;
        const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

        const query = {
            case_current_status: {
                $in: [
                    "Initial Litigation", "Pending FTL", "Forward To Litigation", "Fail from Legal Unit", 
                    "Fail Legal Action", "Litigation", "Litigation Settle Pending", 
                    "Litigation Settle Open-Pending", "Litigation Settle Active"
                ],
            },
        };

        if (case_current_status) query.case_current_status = case_current_status;

        if (date_type && from_date && to_date) {
            const fromDateObj = new Date(from_date);
            const toDateObj = new Date(to_date);

            if (date_type === "Settlement created dtm") {
                query["settlement.settlement_created_dtm"] = { $gte: fromDateObj, $lte: toDateObj };
            } else if (date_type === "legal accepted date") {
                query["litigation.legal_submission.submission_on"] = { $gte: fromDateObj, $lte: toDateObj };
            }
        }

        const cases = await LitigationDetails.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ case_id: -1 });

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

        const formattedCases = await Promise.all(
            cases.map(async (caseData) => {
                const lastLitigation = Array.isArray(caseData.litigation) && caseData.litigation.length
                    ? caseData.litigation[caseData.litigation.length - 1]
                    : null;

                const lastLitigationSubmission = lastLitigation?.legal_submission?.length
                    ? lastLitigation.legal_submission[lastLitigation.legal_submission.length - 1]
                    : null;

                const lastSettlement = Array.isArray(caseData.settlement) && caseData.settlement.length
                    ? caseData.settlement[caseData.settlement.length - 1]
                    : null;

                return {
                    case_id: caseData.case_id,
                    status: caseData.case_current_status,
                    account_no: caseData.account_no,
                    current_arreas_amount: caseData.current_arrears_amount,
                    legal_accepted_date: lastLitigationSubmission?.submission_on || null,
                    settlement_created_date: lastSettlement?.settlement_created_dtm || null,
                };
            })
        );

        return res.status(200).json({
            status: "success",
            message: "Cases retrieved successfully.",
            total_count: cases.length,
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

/*
  Function: /Create_Litigation Document (LIT - 1A01)

    Description:
        - This function creates and appends litigation support documents (RTOM and DRC files) to a specific case in the MongoDB database. It also updates the case status to "Pending FTL" under certain conditions.

    Collections Used:
        - LitigationDetails: Stores litigation case details and their associated support documents.

    Request Body Parameters:
        - case_id: (Required) The unique identifier for the case to update.
        - rtom_customer_file_status: (Required) Status of the RTOM customer file (e.g., "Collected", "Without Agreement").
        - rtom_file_status_by: (Required) Identifier of the user who updated the RTOM file status.
        - rtom_pages_count: (Optional) Number of pages in the RTOM file.
        - drc_file_status: (Required) Status of the DRC file (e.g., "Collected").
        - drc_file_status_by: (Required) Identifier of the user who updated the DRC file status.
        - drc_pages_count: (Optional) Number of pages in the DRC file.

    Response:
        - HTTP 200: Success. Litigation documents created and case updated.
        - HTTP 400: Missing required fields in the request body.
        - HTTP 404: No case found with the provided case_id.
        - HTTP 500: Internal server error or database failure.

    Flow:
        - Start MongoDB session and transaction.
        - Parse and validate required input fields from the request body.
        - Construct RTOM and DRC document objects with status, user, timestamp, and page count.
        - Build the update object to push these documents to the corresponding arrays in the case’s litigation support documents.
        - Conditionally update the case status to "Pending FTL" if both RTOM and DRC file statuses meet the criteria.
        - Find and update the case by case_id, pushing new documents and updating status if needed.
        - Handle errors:
            Abort transaction and return 400 if required fields are missing.
            Abort transaction and return 404 if the case is not found.
            Abort transaction and return 500 for other errors.
        - Commit the transaction and end the session on success.
        - Return a success response with the updated case data.
*/
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

/*
    Function: Create_Legal_Submission (LIT - 1A03)

    Description:
        - This function records a legal submission for a litigation case in the MongoDB database, updates the case’s status based on the submission outcome, and logs the status change in the case’s history.

    Collections Used:
        - LitigationDetails: Stores litigation case details, legal submissions, and status history.

    Request Body Parameters:
        - case_id: (Required) The unique identifier of the case to update.
        - submission: (Required) The outcome of the legal review. Must be either "legal Accepted" or "legal Rejected".
        - submission_by: (Required) Identifier of the user making the submission.
        - submission_remark: (Required) Remarks or comments regarding the submission.

    Response:
        - HTTP 200: Success. Legal submission recorded and case status updated.
        - HTTP 400: Missing required fields or invalid submission value.
        - HTTP 404: No case found with the provided case_id.
        - HTTP 500: Internal server error or database failure.

    Flow:
        - Start MongoDB session and transaction.
        - Parse and validate required input fields from the request body.
        - Construct a legal submission object with submission details, timestamp, user, and remarks.
        - Push the new legal submission to the litigation.legal_submission array in the specified case.
        - Return 404 if the case is not found.
        - Determine the new case status based on the submission value:
            If "legal Accepted", set status to "Forward To Litigation".
            If "legal Rejected", set status to "Fail From Legal Unit".
            Return 400 if the submission value is invalid.
        - Push a new status entry into the case’s case_status history and update the case_current_status field.
        - Return 404 if the case is not found during the status update.
        - Commit the transaction and end the session on success.
        - Return a success response with the updated case data.
        - Handle errors:
            Abort transaction and return 400 for validation errors.
            Abort transaction and return 404 if the case is not found.
            Abort transaction and return 500 for other errors.
*/
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

/*
    Function: List_Litigation_Phase_Case_Details_By_Case_ID (LIT - 1P02)

    Description:
        - This function retrieves essential details of a specific litigation-phase case from the MongoDB database. It is used to fetch summary information and legal records for a given case.

    Collections Used:
        - LitigationDetails: Stores all case and litigation phase information.

    Request Body Parameters:
        - case_id: (Required) The unique identifier of the case whose details are to be retrieved.

    Response:
        - HTTP 200: Success. Returns selected fields of the litigation-phase case.
        - HTTP 400: Missing required case_id in the request body.
        - HTTP 404: No case found with the provided case_id.
        - HTTP 500: Internal server error or database failure.

    Flow:
        - Parse and validate the required input field from the request body.
        - Query the LitigationDetails collection for the case with the specified case_id, projecting only essential fields:
            case_id
            account_no
            customer_ref
            current_arrears_amount
            last_payment_date
            litigation.legal_submission
            litigation.legal_details

        - Return 404 if the case is not found.
        - Return a success response with the retrieved case details.
        - Handle errors:
            Return 400 for missing case_id.
            Return 404 if the case is not found.
            Return 500 for internal server or database errors.
*/
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

/*
    Function: 
        - Create_Legal_Details_By_Case_ID (LIT - 1A04)

    Description:
        - This function creates and appends new legal details for a specific litigation case in the MongoDB database. It also updates the case’s status to "Litigation" and logs the status change in the case’s history.

    Collections Used:
        - LitigationDetails: Stores litigation case information, legal details, and status history.

    Request Body Parameters:
        - case_id: (Required) The unique identifier for the case to update.
        - court_no: (Required) The court number associated with the legal action.
        - court_register_dtm: (Required) The court registration date (expected as a string, but not used in the DB update).
        - case_handling_officer: (Required) The officer responsible for handling the case.
        - remark: (Required) Remarks or comments about the legal action.
        - created_by: (Required) Identifier of the user creating the legal details.

    Response:
        - HTTP 200: Success. Legal details created and case updated.
        - HTTP 400: Missing required fields in the request body.
        - HTTP 404: No case found with the provided case_id.
        - HTTP 500: Internal server error or database failure.

    Flow:
        - Start MongoDB session and transaction.
        - Parse and validate required input fields from the request body.
        - Construct a legal details object with court number, action type, court registration date (set to now), handling officer, remarks, and creator information.
        - Update the case:
            Push the new legal details to the litigation.legal_details array.
            Push a new status entry into the case_status array, using the remark as the status reason.
            Set the case_current_status to "Litigation".
        - Return 404 if the case is not found.
        - Commit the transaction and end the session on success.
        - Return a success response with the updated case data.
        - Handle errors:
            Abort transaction and return 400 for missing required fields.
            Abort transaction and return 404 if the case is not found.
            Abort transaction and return 500 for other errors.
*/
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

/*
    Function: 
        - Create_Legal_Fail_By_case_ID (LIT - 2A05)

    Description:
        - This function processes a legal failure for a litigation case, updates the case status to "Pending Approval Write-Off", logs the legal failure details, creates a delegated approval record, and logs a user interaction for write-off approval. All operations are performed within a MongoDB transaction.

    Collections Used:
        - LitigationDetails: Stores litigation case information, including legal details and status history.
        - TemplateForwardedApprover: Stores records of delegated approvers for the write-off approval process.
        - (External Service) getApprovalUserId: API/service to resolve the delegated user for approval.
        - (External Service) createUserInteractionFunction: Function to create a user interaction log for the approval process.

    Request Body Parameters:
        - case_id: (Required) The unique identifier of the case to update.
        - remark: (Required) Remarks or comments about the legal failure.
        - created_by: (Required) Identifier of the user initiating the legal fail process.

    Response:
        - HTTP 200: Success. Legal failure processed, approval and interaction records created.
        - HTTP 400: Missing required fields in the request body.
        - HTTP 404: No case found with the provided case_id, or failure to create approval records.
        - HTTP 500: Internal server error or database failure.

    Flow:
        - Start MongoDB session and transaction.
        - Parse and validate required input fields from the request body.
        - Build a legal details object with action type "Legal Fail", remarks, and creator information.
        - Update the case:
            Push the legal details to the litigation.legal_details array.
            Push a new status entry "Pending Approval Write-Off" to the case_status array.
            Set case_current_status to "Pending Approval Write-Off".
        - Return 404 if the case is not found.
        - Resolve the delegated approver for the write-off approval using the getApprovalUserId service.
        - Return 500 if a delegated approver cannot be resolved.
        - Create a new approval record in the TemplateForwardedApprover collection, associating it with the case and delegated user.
        - Return 404 if the approval record cannot be created.
        - Create a user interaction log for the write-off approval using the createUserInteractionFunction, passing all relevant details.
        - Commit the transaction and end the session on success.
        - Return a success response with the updated case, new approval record, and interaction log.
        - Handle errors:
            Abort transaction and return 400 for missing required fields.
            Abort transaction and return 404 if the case or approval record is not found.
            Abort transaction and return 500 for other errors.
*/
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

/*
    Function: 
        - List_Lit_Phase_Case_settlement_and_payment_Details_By_Case_ID (LIT - 2P03)
    Description:
        - This function retrieves settlement plan details and the most recent payment transaction for a specific litigation-phase case from the MongoDB database. It is used to provide a summary of settlement and payment status for a given case.

    Collections Used:
        - CaseSettlement: Stores settlement plans and last monitoring date for cases.
        - MoneyTransaction: Stores payment transaction details for cases.

    Request Body Parameters:
        - case_id: (Required) The unique identifier of the case whose settlement and payment details are to be retrieved.

    Response:
        - HTTP 200: Success. Returns settlement plan and last payment transaction details (or null if not found).
        - HTTP 400: Missing required case_id in the request body.
        - HTTP 500: Internal server error or database failure.

    Flow:
        - Parse and validate the required input field from the request body.
        - Query the CaseSettlement collection for the case’s settlement plan and last monitoring date.
        - Query the MoneyTransaction collection for the case’s most recent payment transaction, including:
            transaction_type
            money_transaction_amount
            money_transaction_date
            installment_seq
            cummulative_settled_balance
            created_dtm
        - Return a success response with the retrieved settlement and payment data (or null if not found).
        - Handle errors:
            Return 400 for missing case_id.
            Return 500 for internal server or database errors.
*/
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