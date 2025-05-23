/* 
    Purpose: This template is used for the Case Controllers.
    Created Date: 2025-01-08
    Created By:  Naduni Rabel (rabelnaduni2000@gmail.com)
    Last Modified Date: 2025-02-09
    Modified By: Naduni Rabel (rabelnaduni2000@gmail.com), Sasindu Srinayaka (sasindusrinayaka@gmail.com)
    Version: Node.js v20.11.1
    Dependencies: axios , mongoose
    Related Files: Case_route.js
    Notes:  
*/

import db from "../config/db.js";
import Case_details from "../models/Case_details.js";
import Case_transactions from "../models/Case_transactions.js";
import System_Case_User_Interaction from "../models/User_Interaction.js";
import SystemTransaction from "../models/System_transaction.js";
import RecoveryOfficer from "../models/Recovery_officer.js"
import CaseDistribution from "../models/Case_distribution_drc_transactions.js";
import CaseSettlement from "../models/Case_settlement.js";
import CasePayments from "../models/Case_payments.js";
import Template_RO_Request from "../models/Template_RO_Request .js";
import Template_Mediation_Board from "../models/Template_mediation_board.js";
import TemplateNegotiation from "../models/Template_negotiation.js"
import moment from "moment";
import mongoose from "mongoose";
import {createUserInteractionFunction} from "../services/UserInteractionService.js"
import { createTaskFunction } from "../services/TaskService.js";
import Case_distribution_drc_transactions from "../models/Case_distribution_drc_transactions.js"

import tempCaseDistribution from "../models/Template_case_distribution_drc_details.js";
import TmpForwardedApprover from '../models/Template_forwarded_approver.js';
import caseDistributionDRCSummary from "../models/Case_distribution_drc_summary.js";
import DRC from "../models/Debt_recovery_company.js";
import User_Interaction_Log from "../models/User_Interaction_Log.js";
import Request from "../models/Request.js";
import Tmp_SLT_Approval from '../models/Tmp_SLT_Approval.js'; // Import the model directly
import { getApprovalUserIdService } from "../services/ApprovalService.js";
import { getBatchApprovalUserIdService } from "../services/ApprovalService.js";
import Incident from "../models/Incident.js";
import CaseMonitor from "../models/Case_Monitor.js";
import CaseMonitorLog from "../models/Case_Monitor_Log.js";
import { ro } from "date-fns/locale";

/**
 * Inputs:
 * - None
 * 
 * Success Result:
 * - Returns a success response with a single Arrears band document from the database.
 */
export const ListAllArrearsBands = async (req, res) => {
  try {
    const mongoConnection = await db.connectMongoDB();
    if (!mongoConnection) {
      throw new Error("MongoDB connection failed");
    }
    const counterResult = await mongoConnection
      .collection("Arrears_bands")
      .findOne({});
    return res.status(200).json({
      status: "success",
      message: "Data retrieved successfully.",
      data: counterResult,
    });
  } catch (error) {
    // Capture the error object in the catch block
    return res.status(500).json({
      status: "error",
      message: "Error retrieving Arrears bands.",
      errors: {
        code: 500,
        description: error.message, // Now correctly references the error object
      },
    });
  }
};

export const drcExtendValidityPeriod = async (req, res) => {
  const { Case_Id, DRC_Id, No_Of_Month, Extended_By } = req.body;

  if (!Case_Id || !No_Of_Month || !Extended_By || !DRC_Id) {
    return res.status(400).json({
      status: "error",
      message: "Failed to extend DRC validity period.",
      errors: {
        code: 400,
        description: "All fields are required",
      },
    });
  }

  try {
    //update expire date
    const updatedCaseDetails = await Case_details.findOneAndUpdate(
      { case_id: Case_Id, "drc.drc_id": DRC_Id },
      {
        $set: {
          "drc.$.expire_dtm": new Date(
            new Date(
              new Date(
                (
                  await Case_details.findOne({
                    case_id: Case_Id,
                    "drc.drc_id": DRC_Id,
                  })
                ).drc.find((drc) => drc.drc_id === DRC_Id).expire_dtm
              ).setMonth(
                new Date(
                  (
                    await Case_details.findOne({
                      case_id: Case_Id,
                      "drc.drc_id": DRC_Id,
                    })
                  ).drc.find((drc) => drc.drc_id === DRC_Id).expire_dtm
                ).getMonth() + No_Of_Month
              )
            )
          ),
        },
      },
      { new: true }
    );
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error updating No of Months.",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }

  //insert state change record to Case_transactions
  try {
    const newCaseTransaction = new Case_transactions({
      case_id: Case_Id,
      transaction_type_id: 1,
      created_by: Extended_By,
      parameters: {
        "No of Months": No_Of_Month,
      },
      drc_id: DRC_Id,
    });
    await newCaseTransaction.save();
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error inserting stat change record.",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }

  //Remove user interaction "Agent Time Extend"
  try {
    await System_Case_User_Interaction.findOneAndUpdate(
      { "parameters.Case_ID": Case_Id, Case_User_Interaction_id: 2 },
      {
        $set: {
          status: "close",
          status_changed_dtm: new Date(),
        },
      }
    );
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error closing Agent time extend.",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }

  //Add user interaction "Pending Approval RO Extend Period"
  try {
    const mongoConnection = await db.connectMongoDB();
    if (!mongoConnection) {
      throw new Error("MongoDB connection failed");
    }
    const counterResult = await mongoConnection
      .collection("counters")
      .findOneAndUpdate(
        { _id: "User_Interaction_Id" },
        { $inc: { seq: 1 } },
        { returnDocument: "after", upsert: true }
      );

    const user_interaction_id = counterResult.seq;

    if (!user_interaction_id) {
      throw new Error("Failed to generate a valid User_Interaction_Id");
    }

    const openPendingApprovalROExtendPeriod = new System_Case_User_Interaction({
      User_Interaction_id: user_interaction_id,
      Case_User_Interaction_id: 7,
      parameters: {
        Case_ID: Case_Id,
      },
      Created_By: Extended_By,
      Execute_By: "Admin456",
      Sys_Alert_ID: null,
      Interaction_ID_Success: null,
      Interaction_ID_Error: null,
      User_Interaction_Id_Error: null,
      created_dtm: new Date(),
      end_dtm: null,
      status: "pending",
      updatedAt: new Date(),
      status_changed_dtm: new Date(),
      status_description: "",
    });
    await openPendingApprovalROExtendPeriod.save();
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error updating System Case User Interaction.",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }

  return res.status(200).json({
    status: "success",
    message: "DRC validity period successfully extended.",
  });
};

// export const listHandlingCasesByDRC = async (req, res) => {
//     const { drc_id } = req.body;

//     try {
//         // Validate drc_id
//         if (!drc_id) {
//             return res.status(400).json({
//                 status: "error",
//                 message: "Failed to retrieve DRC details.",
//                 errors: {
//                     code: 400,
//                     description: "DRC ID is required.",
//                 },
//             });
//         }

//         // Query to find cases that meet the conditions
//         const cases = await Case_details.find({
//             $and: [
//                 // Match case_current_status
//                 {
//                     case_current_status: {
//                         $in: [
//                             "Open No Agent",
//                             "Open with Agent",
//                             "Negotiation Settle pending",
//                             "Negotiation Settle Open Pending",
//                             "Negotiation Settle Active",
//                             "FMB",
//                             "FMB Settle pending",
//                             "FMB Settle Open Pending",
//                             "FMB Settle Active",
//                         ],
//                     },
//                 },
//                 // Check if the DRC array has matching conditions
//                 {
//                     $and: [
//                         { "drc.drc_id": drc_id }, // Match the provided drc_id
//                         { "drc.status": "Open" }, // DRC status must be "Open"
//                         { "drc.expire_dtm": { $gte: new Date() } }, // expire_dtm must be in the future or now
//                         {
//                             $or: [
//                                 // recovery_officers array is empty
//                                 { "drc.recovery_officers": { $size: 0 } },
//                                 // recovery_officers has at least one entry with removed_dtm = null
//                                 { "drc.recovery_officers": { $elemMatch: { removed_dtm: null } } },
//                             ],
//                         },
//                     ],
//                 },
//             ],
//         });

//         // Check if no cases found
//         if (!cases || cases.length === 0) {
//             return res.status(404).json({
//                 status: "error",
//                 message: "No cases found for the provided DRC ID.",
//                 errors: {
//                     code: 404,
//                     description: "No matching cases in the database.",
//                 },
//             });
//         }

//         // Return success response
//         return res.status(200).json({
//             status: "success",
//             message: "Cases retrieved successfully.",
//             data: cases,
//         });
//     } catch (error) {
//         // Handle errors
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

export const listAllDRCOwnedByCase = async (req, res) => {
    const { case_id } = req.body;

    try {
        // Validate case ID
        if (!case_id) {
            return res.status(400).json({
                status: "error",
                message: "Failed to retrieve DRC details.",
                errors: {
                    code: 400,
                    description: "Case with the given ID not found.",
                },
            });
        }

        // Query to find DRCs owned by the case
        const drcs = await Case_details.find({
            case_id: case_id
        });

        // Handle case where no matching DRCs are found
        if (drcs.length === 0) {
            return res.status(200).json({
                status: "error",
                message: "No matching DRCs found for the given case ID.",
                errors: {
                    code: 200,
                    description: "No DRCs satisfy the provided criteria.",
                },
            });
        }

        // Return success response
        return res.status(200).json({
            status: "success",
            message: "DRCs retrieved successfully.",
            data: drcs,
        });
    } catch (error) {
        // Handle errors
        return res.status(500).json({
            status: "error",
            message: "An error occurred while retrieving DRCs.",
            errors: {
                code: 500,
                description: error.message,
            },
        });
    }
}

export const Open_No_Agent_Cases_Direct_LD = async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;

    const fromDateParsed = fromDate ? new Date(fromDate) : null;
    const toDateParsed = toDate ? new Date(toDate) : null;

    if (fromDate && isNaN(fromDateParsed.getTime())) {
      return res.status(400).json({ message: "Invalid 'fromDate' format." });
    }

    if (toDate && isNaN(toDateParsed.getTime())) {
      return res.status(400).json({ message: "Invalid 'toDate' format." });
    }

    const dateFilter = {};
    if (fromDateParsed) dateFilter.$gte = fromDateParsed;
    if (toDateParsed) dateFilter.$lte = toDateParsed;

    const query = {
      case_current_status: "Open No Agent",
      filtered_reason: { $in: [null, ""] },
      current_arrears_amount: { $gt: 1000, $lte: 5000 },
    };

    if (Object.keys(dateFilter).length > 0) {
      query.created_dtm = dateFilter;
    }

   
    const cases = await Case_details.find(query).select(
      "case_id account_no area rtom filtered_reason"
    );
    if (!cases.length) {
      return res.status(404).json({
        message: "No cases found matching the criteria.",
        criteria: {
          case_current_status: "Open No Agent",
          fromDate,
          toDate,
        },
      });
    }

    res.status(200).json({
      message: "Cases retrieved successfully.",
      criteria: {
        case_current_status: "Open No Agent",
        fromDate,
        toDate,
      },
      data: cases,
    });
  } catch (error) {
    console.error("Error retrieving cases:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const Open_No_Agent_Cases_ALL = async (req, res) => {
    const {
      case_current_status,
      fromDate,
      toDate,
    } = req.body;
  
    try {
      
      const fromDateParsed = fromDate ? new Date(fromDate) : null;
      const toDateParsed = toDate ? new Date(toDate) : null;
  
      if (fromDate && isNaN(fromDateParsed.getTime())) {
        return res.status(400).json({ message: "Invalid 'fromDate' format." });
      }
  
      if (toDate && isNaN(toDateParsed.getTime())) {
        return res.status(400).json({ message: "Invalid 'toDate' format." });
      }
  
      
      const dateFilter = {};
      if (fromDateParsed) dateFilter.$gte = fromDateParsed;
      if (toDateParsed) dateFilter.$lte = toDateParsed;
  
      //  `case_current_status`
      const baseQuery = {};
      if (case_current_status) {
        baseQuery.case_current_status = case_current_status;
      }
      if (Object.keys(dateFilter).length > 0) {
        baseQuery.created_dtm = dateFilter;
      }
  
      // "Open No Agent" (default for f1FilterCases and directLDCases)
      const openNoAgentQuery = {
        case_current_status: "Open No Agent",
      };
      if (Object.keys(dateFilter).length > 0) {
        openNoAgentQuery.created_dtm = dateFilter;
      }
  
      
      const noAgentCases = await Case_details.find(baseQuery).select(
        "case_id account_no area rtom filtered_reason"
      );
  
      const f1FilterCases = await Case_details.find({
        ...openNoAgentQuery,
        filtered_reason: { $exists: true, $ne: null, $ne: "" },
      }).select("case_id account_no area rtom filtered_reason");
  
      const directLDCases = await Case_details.find({
        ...openNoAgentQuery,
        filtered_reason: { $in: [null, ""] },
        current_arrears_amount: { $gt: 1000, $lte: 5000 }, 
      }).select("case_id account_no area rtom filtered_reason");
  
      
      if (
        !noAgentCases.length &&
        !f1FilterCases.length &&
        !directLDCases.length
      ) {
        return res.status(404).json({
          message: "No cases found matching the criteria.",
        });
      }
  
     
      res.status(200).json({
        message: "Cases retrieved successfully.",
        data: {
          No_Agent_Cases: noAgentCases,
          F1_Filter: f1FilterCases,
          Direct_LD: directLDCases,
        },
      });
    } catch (error) {
      console.error("Error retrieving cases:", error);
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
};

export const Case_Abandant = async (req, res) => {
  const { case_id, Action, Done_By } = req.body;

  try {
    // Validate required fields
    if (!case_id || !Action || !Done_By) {
      return res.status(400).json({
        status: "error",
        message: "case_id, Action, and Done_By are required.",
      });
    }

    // Validate Action
    if (Action !== "Abandaned") {
      return res.status(400).json({
        status: "error",
        message: `Invalid action. Only 'Abandaned' is allowed.`,
      });
    }

    // Fetch the case to ensure it exists
    const caseRecord = await Case_details.findOne({ case_id });

    if (!caseRecord) {
      return res.status(404).json({
        status: "error",
        message: `Case with ID ${case_id} not found.`,
      });
    }

    // Check if the case is already abandoned
    if (caseRecord.case_current_status === "Abandaned") {
      return res.status(400).json({
        status: "error",
        message: `Case with ID ${case_id} is already abandoned.`,
      });
    }

    // Update the case details
    const updatedCase = await Case_details.findOneAndUpdate(
      { case_id },
      {
        $set: {
          case_current_status: "Abandaned",
        },
        $push: {
          abnormal_stop: {
            remark: `Case marked as ${Action}`,
            done_by: Done_By,
            done_on: moment().toDate(),
            action: Action,
          },
        },
      },
      { new: true, runValidators: true }
    );

    const mongoConnection = await mongoose.connection;
    const counterResult = await mongoConnection.collection("counters").findOneAndUpdate(
      { _id: "transaction_id" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }
    );
    const Transaction_Id = counterResult.seq;

    // Log the transaction in SystemTransaction
    const transactionData = {
      Transaction_Id,
      transaction_type_id: 5,
      parameters: {
        case_id,
        action: Action,
        done_by: Done_By,
        done_on: moment().toDate(),
      },
      created_dtm: moment().toDate(),
    };

    const newTransaction = new SystemTransaction(transactionData);
    await newTransaction.save();

    return res.status(200).json({
      status: "success",
      message: "Case abandoned successfully.",
      data: {
        case_id: updatedCase.case_id,
        case_current_status: updatedCase.case_current_status,
        abnormal_stop: updatedCase.abnormal_stop,
        transaction: {
          Transaction_Id,
          transaction_type_id: transactionData.transaction_type_id,
          created_dtm: transactionData.created_dtm,
        },
      },
    });
  } catch (error) {
    console.error("Error during case abandonment:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to abandon case.",
      errors: {
        exception: error.message,
      },
    });
  }
};

export const Approve_Case_abandant = async (req, res) => {
  const { case_id, Approved_By } = req.body;

  try {
    // Validate required fields
    if (!case_id || !Approved_By) {
      return res.status(400).json({
        status: "error",
        message: "case_id and Approved_By are required.",
      });
    }

    // Fetch the case to ensure it exists and is discarded
    const caseRecord = await Case_details.findOne({ case_id });

    if (!caseRecord) {
      return res.status(404).json({
        status: "error",
        message: `Case with ID ${case_id} not found.`,
      });
    }

    if (caseRecord.case_current_status !== "Abandaned") {
      return res.status(400).json({
        status: "error",
        message: `Case with ID ${case_id} is not in 'Abandaned' status.`,
      });
    }

    // Update the case details to reflect approval
    const updatedCase = await Case_details.findOneAndUpdate(
      { case_id },
      {
        $set: {
          case_current_status: "Abandaned Approved",
        },
        $push: {
          approve: {
            approved_process: "Case Abandaned Approval",
            approved_by: Approved_By,
            approved_on: moment().toDate(),
            remark: "Case abandaned approved successfully.",
          },
          abnormal_stop: {
            remark: `Case marked as Abandaned Approved`,
            done_by: Approved_By,
            done_on: moment().toDate(),
            action: 'Abandaned Approved',
          },
        },
      },
      { new: true, runValidators: true } // Return the updated document and apply validation
    );

    return res.status(200).json({
      status: "success",
      message: "Case Abandaned approved successfully.",
      data: {
        case_id: updatedCase.case_id,
        case_current_status: updatedCase.case_current_status,
        approved_by: Approved_By,
        approved_on: moment().toDate(),
      },
    });
  } catch (error) {
    console.error("Error during case discard approval:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to approve case discard.",
      errors: {
        exception: error.message,
      },
    });
  }
};

export const Open_No_Agent_Cases_F1_Filter = async (req, res) => {
  const { from_date, to_date } = req.body;

  try {
    // Validate date inputs
    if (!from_date || !to_date) {
      return res.status(400).json({
        status: "error",
        message: "Both from_date and to_date are required.",
      });
    }

    const fromDate = new Date(from_date);
    const toDate = new Date(new Date(to_date).setHours(23, 59, 59, 999));

    if (isNaN(fromDate) || isNaN(toDate)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid date format. Use a valid ISO date format.",
      });
    }

    if (fromDate > toDate) {
      return res.status(400).json({
        status: "error",
        message: "from_date cannot be later than to_date.",
      });
    }

    // Fetch cases where case_current_status is 'Open No Agent' and filtered_reason is not null or empty
    // Also filter by created_dtm within the provided date range
    const cases = await Case_details.find({
      case_current_status: "Open No Agent",
      //filtered_reason: { $exists: true, $ne: null, $ne: "" },
      filtered_reason: { $type: "string", $ne: "" },
      created_dtm: { $gte: fromDate, $lte: toDate },
    })
      .select({
        case_id: 1,
        account_no: 1,
        customer_ref: 1,
        arrears_amount: 1,
        area: 1,
        rtom: 1,
        filtered_reason: 1,
        created_dtm: 1,
      })
      .sort({ created_dtm: -1 }); // Sort by creation date (most recent first)

    // If no cases match the criteria
    if (!cases || cases.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No cases found matching the criteria.",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Filtered cases retrieved successfully.",
      data: cases,
    });
  } catch (error) {
    console.error("Error fetching filtered cases:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve cases.",
      errors: {
        exception: error.message,
      },
    });
  }
};

export const Case_Current_Status = async (req, res) => {
  const { Case_ID } = req.body;

  try {
    // Validate input
    if (!Case_ID) {
      return res.status(400).json({
        status: "error",
        message: "Case_ID is required.",
      });
    }

    // Query the database for the case by Case_ID
    const caseData = await Case_details.findOne({ case_id: Case_ID });

    // Check if the case exists
    if (!caseData) {
      return res.status(404).json({
        status: "error",
        message: `Case with ID ${Case_ID} not found.`,
      });
    }

    // Extract the current status
    const { case_current_status } = caseData;

    // Return the current status along with relevant case details
    return res.status(200).json({
      status: "success",
      message: "Case current status retrieved successfully.",
      data: {
        case_id: caseData.case_id,
        case_current_status,
      },
    });
  } catch (error) {
    console.error("Error retrieving case status:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve case status.",
      errors: {
        exception: error.message,
      },
    });
  }
};


// export const assignROToCase = async (req, res) => {
//   try {
//     const { case_id, ro_id } = req.body;

//     // Validate input
//     if (!case_id || !ro_id) {
//       return res.status(400).json({
//         status: "error",
//         message: "Failed to assign Recovery Officer.",
//         errors: {
//           code: 400,
//           description: "Case ID and RO ID are required.",
//         },
//       });
//     }

//     const assigned_by = "System";

//     // Fetch the case details
//     const caseData = await Case_details.findOne({ case_id });

//     if (!caseData) {
//       return res.status(404).json({
//         status: "error",
//         message: "Case ID not found in Database.",
//       });
//     }

//     // Check if expire_dtm is null
//     if (caseData.expire_dtm !== null) {
//       return res.status(400).json({
//         status: "error",
//         message: "Cannot assign Recovery Officer. Case has expired.",
//         errors: {
//           code: 400,
//           description: "The expire_dtm field must be null.",
//         },
//       });
//     }

//     // Find the `drc` array and check the recovery_officers array
//     const drc = caseData.drc.find((d) => d.drc_id); // Assume drc_id exists; adjust logic if necessary
//     if (!drc) {
//       return res.status(404).json({
//         status: "error",
//         message: "DRC not found for the given case.",
//       });
//     }

//     // Get the recovery_officers array
//     const recoveryOfficers = drc.recovery_officers || [];
//     const lastOfficer = recoveryOfficers[recoveryOfficers.length - 1];

//     // Check if remove_dtm is null in the last officer
//     if (lastOfficer && lastOfficer.removed_dtm === null) {
//       return res.status(400).json({
//         status: "error",
//         message: "Cannot assign new Recovery Officer. Previous officer not removed.",
//         errors: {
//           code: 400,
//           description: "The remove_dtm field for the last Recovery Officer must not be null.",
//         },
//       });
//     }

//     // Prepare the new recovery officer object
//     const newOfficer = {
//       ro_id: ro_id,
//       assigned_dtm: new Date(), // Date format: day/month/year
//       assigned_by: assigned_by,
//       removed_dtm: null,
//       case_removal_remark: null,
//     };

//     // Push the new recovery officer into the array
//     const updateData = {
//       $push: { "drc.$.recovery_officers": newOfficer },
//     };

//     // Update the database
//     const updatedResult = await Case_details.updateOne(
//       { case_id, "drc.drc_id": drc.drc_id }, // Match specific drc within case
//       updateData
//     );

//     if (updatedResult.nModified === 0) {
//       return res.status(400).json({
//         status: "error",
//         message: "Failed to assign Recovery Officer. Update operation unsuccessful.",
//       });
//     }

//     // Send success response
//     res.status(200).json({
//       status: "success",
//       message: "Recovery Officer assigned successfully.",
//     });
// } catch (error) {
//     // Handle unexpected errors
//     return res.status(500).json({
//       status: "error",
//       message: "An error occurred while assigning the Recovery Officer.",
//       errors: {
//         code: 500,
//         description: error.message,
//       },
//     });
//   }
// };

export const Case_Status = async (req, res) => {
  const { Case_ID } = req.body;

  try {
    // Validate input
    if (!Case_ID) {
      return res.status(400).json({
        status: "error",
        message: "Case_ID is required.",
      });
    }

    // Query the database for the case by Case_ID
    const caseData = await Case_details.findOne({ case_id: Case_ID });

    // Check if the case exists
    if (!caseData) {
      return res.status(404).json({
        status: "error",
        message: `Case with ID ${Case_ID} not found.`,
      });
    }

    // Extract the case_status array
    const { case_status } = caseData;

    // Check if the case_status array exists and has entries
    if (!case_status || case_status.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No case status found for the given case.",
      });
    }

    // Find the latest case status by sorting the array by created_dtm in descending order
    const latestStatus = case_status.reduce((latest, current) =>
      new Date(current.created_dtm) > new Date(latest.created_dtm) ? current : latest
    );

    // Return the latest case status along with relevant case details
    return res.status(200).json({
      status: "success",
      message: "Latest case status retrieved successfully.",
      data: {
        case_id: caseData.case_id,
        case_status: latestStatus.case_status,
        status_reason: latestStatus.status_reason,
        created_dtm: latestStatus.created_dtm,
        created_by: latestStatus.created_by,
        notified_dtm: latestStatus.notified_dtm,
        expire_dtm: latestStatus.expire_dtm,
      },
    });
  } catch (error) {
    console.error("Error retrieving case status:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve case status.",
      errors: {
        exception: error.message,
      },
    });
  }
};

export const Case_List = async (req, res) => {
  const { account_no } = req.body;

  try {
    // Validate input
    if (!account_no) {
      return res.status(400).json({
        status: "error",
        message: "Account number is required.",
      });
    }

    // Query the database for all cases with the specified account_no
    const caseData = await Case_details.find(
      { account_no },
      {
        _id: 1,
        case_id: 1,
        incident_id: 1,
        account_no: 1,
        customer_ref: 1,
        created_dtm: 1,
        implemented_dtm: 1,
        area: 1,
        rtom: 1,
        drc_selection_rule_base: 1,
        current_selection_logic: 1,
        bss_arrears_amount: 1,
        current_arrears_amount: 1,
        action_type: 1,
        selection_rule: 1,
        last_payment_date: 1,
        monitor_months: 1,
        last_bss_reading_date: 1,
        commission: 1,
        case_current_status: 1,
        filtered_reason: 1,
        "case_status.case_status": 1,
        "case_status.status_reason": 1,
        "case_status.created_dtm": 1,
        "case_status.created_by": 1,
        "case_status.notified_dtm": 1,
        "case_status.expire_dtm": 1,
      }
    );

    // Check if any cases were found
    if (!caseData || caseData.length === 0) {
      return res.status(404).json({
        status: "error",
        message: `No cases found for account number ${account_no}.`,
      });
    }

    // Return the filtered case details
    return res.status(200).json({
      status: "success",
      message: "Cases retrieved successfully.",
      data: caseData,
    });
  } catch (error) {
    console.error("Error retrieving cases:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve cases.",
      errors: {
        exception: error.message,
      },
    });
  }
};

export const openNoAgentCasesAllByServiceTypeRulebase = async (req, res) => {

  const { Rule, From_Date, To_Date , Case_Status} = req.body;
  const fromDate = new Date(`${From_Date}T00:00:00.000Z`);
  const toDate = new Date(`${To_Date}T23:59:59.999Z`);
  
  if (!Rule|| !From_Date ||!To_Date) {
    return res.status(400).json({
      status: "error",
      message: "Failed to retrieve Open No Agent case details.",
      errors: {
        code: 400,
        description: "Rule, From_Date and To_Date are required fields",
      },
    });
  }
  if (isNaN(fromDate) || isNaN(toDate)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid date format",
      errors: {
        code: 400,
        description: "Invalid date format for From_Date or To_Date",
      },
    });
  }

  try {
   
    const noAgent = await Case_details.find({
      case_current_status:"Open No Agent", 
      drc_commision_rule: Rule, 
      created_dtm: {
        $gte: fromDate,
        $lte: toDate,
      }  
    }).select('case_id created_dtm account_no area rtom current_arrears_amount case_current_status filtered_reason drc_selection_rule');
    const f1Filter = noAgent.filter((caseData) => {
      return caseData.filtered_reason !== null && caseData.filtered_reason !== "";
    });
    const directLD = noAgent.filter((caseData) => {
      return caseData.current_arrears_amount<=5000 && caseData.current_arrears_amount >=1000;
    });
    return res.status(200).json({
      status: "success",
      message: `Successfully retrieved Open No Agent - ${Rule} details.`,
      data:{
        No_Agent_Cases: noAgent,
        F1_Filter: f1Filter,
        Direct_LD: directLD
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve case details.",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }
}

export const openNoAgentCountArrearsBandByServiceType = async (req, res) =>{
  const { Rule, Case_Status } = req.body;

  if (!Rule) {
    return res.status(400).json({
      status: "error",
      message: "Failed to retrieve Open No Agent count.",
      errors: {
        code: 400,
        description: "Rule is a required field",
      },
    });
  }

  try {
    const details = await Case_details.find({case_current_status:"Open No Agent", drc_commision_rule: Rule})
    
    const arrearsBandCounts = details.reduce((counts, detail) => {
      const band = detail.arrears_band;
      counts[band] = (counts[band] || 0) + 1; 
      return counts;
    }, {});
    
    return res.status(200).json({
      status: "success",
      message: `Successfully retrieved arrears band counts for rule - ${Rule}.`,
      data: arrearsBandCounts
    })
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve arrears band counts.",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }
}

export const listCases = async (req, res) =>{
  try{
  const { From_Date, To_Date} = req.body;
  const fromDate = new Date(`${From_Date}T00:00:00.000Z`);
  const toDate = new Date(`${To_Date}T23:59:59.999Z`);
  
  if (!From_Date ||!To_Date) {
    return res.status(400).json({
      status: "error",
      message: "Failed to retrieve Open No Agent case details.",
      errors: {
        code: 400,
        description: "From_Date and To_Date are required fields",
      },
    });
  }
  if (isNaN(fromDate) || isNaN(toDate)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid date format",
      errors: {
        code: 400,
        description: "Invalid date format for From_Date or To_Date",
      },
    })
  }

  const openNoAgent = await Case_details.find({
    case_current_status:"Open No Agent", 
    $or: [
      { filtered_reason: null }, 
      { filtered_reason: "" },    
      { filtered_reason: { $regex: /^\s*$/ } }, 
    ],
    created_dtm: {
      $gte: fromDate,
      $lte: toDate,
    }  
  }).select('case_id created_dtm account_no area rtom current_arrears_amount case_current_status filtered_reason drc_selection_rule');

  return res.status(200).json({
    status: "success",
    message: `Successfully retrieved  cases.`,
    data:{
      mongoData: openNoAgent
  }})
   
  }catch(error){
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve Open No Agent cases.",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }
  
}

export const Acivite_Case_Details = async (req, res) => {
  const { account_no } = req.body;

  try {
    // Validate input
    if (!account_no) {
      return res.status(400).json({
        status: "error",
        message: "Account number is required.",
      });
    }

    // Query the database to find cases with the specified account_no
    const cases = await Case_details.find({ account_no });

    // Check if any cases were found
    if (!cases || cases.length === 0) {
      return res.status(404).json({
        status: "error",
        message: `No cases found for account number ${account_no}.`,
      });
    }

    // Filter cases where the latest status in `case_status` is not in the excluded statuses
    const excludedStatuses = ['Write_Off', 'Abandoned', 'Case_Close', 'Withdraw'];
    const activeCases = cases.filter((caseData) => {
      const { case_status } = caseData;

      if (!case_status || case_status.length === 0) {
        return false; // Exclude cases with no status
      }

      // Find the latest status based on created_dtm
      const latestStatus = case_status.reduce((latest, current) =>
        new Date(current.created_dtm) > new Date(latest.created_dtm) ? current : latest
      );

      // Check if the latest status is not in the excluded statuses
      return !excludedStatuses.includes(latestStatus.case_status);
    });

    // Check if any active cases remain after filtering
    if (activeCases.length === 0) {
      return res.status(404).json({
        status: "error",
        message: `No active cases found for account number ${account_no}.`,
      });
    }

    // Return the filtered cases
    return res.status(200).json({
      status: "success",
      message: "Active cases retrieved successfully.",
      data: activeCases.map((caseData) => ({
        _id: caseData._id,
        case_id: caseData.case_id,
        incident_id: caseData.incident_id,
        account_no: caseData.account_no,
        customer_ref: caseData.customer_ref,
        created_dtm: caseData.created_dtm,
        implemented_dtm: caseData.implemented_dtm,
        area: caseData.area,
        rtom: caseData.rtom,
        drc_selection_rule_base: caseData.drc_selection_rule_base,
        current_selection_logic: caseData.current_selection_logic,
        bss_arrears_amount: caseData.bss_arrears_amount,
        current_arrears_amount: caseData.current_arrears_amount,
        action_type: caseData.action_type,
        selection_rule: caseData.selection_rule,
        last_payment_date: caseData.last_payment_date,
        monitor_months: caseData.monitor_months,
        last_bss_reading_date: caseData.last_bss_reading_date,
        commission: caseData.commission,
        case_current_status: caseData.case_current_status,
        filtered_reason: caseData.filtered_reason,
        case_status: caseData.case_status, // Return full case_status array for detailed view
      })),
    });
  } catch (error) {
    console.error("Error retrieving active cases:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve active cases.",
      errors: {
        exception: error.message,
      },
    });
  }
};

/**
 * Inputs:
 * - None (uses fixed filter: case_current_status = "Open No Agent" and case_distribution_batch_id = null)
 * 
 * Success Result:
 * - Returns a success response with the count of cases grouped by drc_commision_rule.
 */
export const List_count_by_drc_commision_rule = async (req, res) => {
  const case_status = "Open No Agent";
    try {
      const casesCount = await Case_details.aggregate([
        {
          $match: {
            "case_current_status": case_status,
            "case_distribution_batch_id": null,
          }
        },
        {
          $group: {
            _id: "$drc_commision_rule",
            case_count: { $sum: 1 }
          }
        },
        {
          $project: {
            drc_commision_rule: "$_id",
            case_count: 1,
            _id: 0
          }
        }
      ]);
      const totalRules = casesCount.length;
      return res.status(200).json({
        status: "success",
        message: "Cases count grouped by drc_commision_rule fetched successfully.",
        metadata: {
          total_rules: totalRules
        },
        data: casesCount
      });
    } catch (error) {
        return res.status(500).json({
          status: "error",
          message: "Failed to fetch cases count. Please try again later.",
          error: error.message
        });
    }
};

/**
 * Inputs:
 * - drc_commision_rule: String (required)
 * - current_arrears_band: String (required)
 * - drc_list: Array of objects (required) - each object must contain:
 *    - DRC: String
 *    - DRC_Id: Number
 *    - Count: Number
 * - created_by: String (required)
 * 
 * Success Result:
 * - Returns a success response with task creation details for case distribution among DRCs.
 */
export const Case_Distribution_Among_Agents = async (req, res) => {
  const { drc_commision_rule, current_arrears_band, drc_list, created_by } = req.body;

  if (!drc_commision_rule || !current_arrears_band || !drc_list || !created_by) {
    return res.status(400).json({
      status: "error",
      message: "DRC commission rule, current arrears band, created by and DRC list fields are required.",
    });
  }

  if (!Array.isArray(drc_list) || drc_list.length <= 0) {
    return res.status(400).json({
      status: "error",
      message: "DRC List should not be empty.",
    });
  }
  const validateDRCList = (drcList) => {
    if (!Array.isArray(drcList)) {
      throw new Error("DRC List must be an array.");
    }
    
    let batch_seq_rulebase_count = 0;

    return {
      validatedList: drcList.map((item, index) => {
        if (typeof item.DRC !== "string" || typeof item.Count !== "number" || typeof item.DRC_Id !== "number") {
          throw new Error(`Invalid structure at index ${index} in DRC List.`);
        }
        batch_seq_rulebase_count += item.Count;
        return {
          DRC: item.DRC,
          DRC_Id: item.DRC_Id,
          Count: item.Count,
        };
      }),
      batch_seq_rulebase_count,
    };
  };
  try {
    // Validate the DRC list
    const { validatedList, batch_seq_rulebase_count } = validateDRCList(drc_list);
    const mongo = await db.connectMongoDB();

    // Validation for existing tasks with task_status and specific parameters
    const existingTask = await mongo.collection("System_tasks").findOne({
      task_status: { $ne: "Complete" },
      "parameters.drc_commision_rule": drc_commision_rule,
      "parameters.current_arrears_band": current_arrears_band,
    });
    if (existingTask) {
      return res.status(400).json({
        status: "error",
        message: "Already has tasks with this commision rule and arrears band ",
      });
    }
    const counter_result_of_case_distribution_batch_id = await mongo.collection("counters").findOneAndUpdate(
      { _id: "case_distribution_batch_id" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }
    );
    const case_distribution_batch_id = counter_result_of_case_distribution_batch_id.seq; // Use `value` to access the updated document

    if (!case_distribution_batch_id) {
      throw new Error("Failed to generate case_distribution_batch_id.");
    }
    const batch_seq_details = [{
      batch_seq: 1,
      created_dtm: new Date(),
      created_by,
      action_type: "distribution",
      array_of_distributions: drc_list.map(({ DRC, Count,DRC_Id }) => ({
        drc: DRC,
        drc_id: DRC_Id,
        rulebase_count: Count,
      })),
      batch_seq_rulebase_count:batch_seq_rulebase_count,
      crd_distribution_status:"Open",
    }];
    // Prepare Case distribution drc transactions data
    const Case_distribution_drc_transactions_data = {
      case_distribution_batch_id,
      batch_seq_details,
      created_dtm: new Date(),
      created_by,
      current_arrears_band,
      rulebase_count: batch_seq_rulebase_count,
      status: [{
        crd_distribution_status: "Open",
        created_dtm: new Date(),
      }],
      drc_commision_rule,  
      crd_distribution_status_on: new Date(),
      crd_distribution_status:"Open",
    };

    // Insert into Case_distribution_drc_transactions collection
    const new_Case_distribution_drc_transaction = new Case_distribution_drc_transactions(Case_distribution_drc_transactions_data);
    await new_Case_distribution_drc_transaction.save();

    // Prepare dynamic parameters for the task
    const dynamicParams = {
      drc_commision_rule,
      current_arrears_band,
      case_distribution_batch_id,
    };

    // Call createTaskFunction
    const result = await createTaskFunction({
      Template_Task_Id: 3,
      task_type: "Case Distribution Planning among DRC",
      Created_By: created_by,
      ...dynamicParams,
    });

    // Return success response from createTaskFunction
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: `An error occurred while creating the task: ${error.message}`,
    });
  }
};


export const listHandlingCasesByDRC = async (req, res) => {
  const { drc_id, rtom, ro_id, arrears_band, from_date, to_date } = req.body;

  try {
    // Validate the DRC ID
    if (!drc_id) {
      return res.status(400).json({
        status: "error",
        message: "Failed to retrieve DRC details.",
        errors: {
          code: 400,
          description: "DRC ID is required.",
        },
      });
    }

    // Ensure at least one optional parameter is provided
    if (!rtom && !ro_id && !arrears_band && !(from_date && to_date)) {
      return res.status(400).json({
        status: "error",
        message: "At least one filtering parameter is required.",
        errors: {
          code: 400,
          description: "Provide at least one of rtom, ro_id, arrears_band, or both from_date and to_date together.",
        },
      });
    }

    // Build query dynamically based on provided parameters
    // let query = {
    //   $and: [
    //     { "drc.drc_id": drc_id },
    //     {
    //       case_current_status: {
    //         $in: [
    //           "Open with Agent",
    //           "Negotiation Settle pending",
    //           "Negotiation Settle Open Pending",
    //           "Negotiation Settle Active",
    //           "FMB",
    //           "FMB Settle pending",
    //           "FMB Settle Open Pending",
    //           "FMB Settle Active",
    //         ],
    //       },
    //     },
    //     { "drc.drc_status": "Active" },
    //     { "drc.removed_dtm": null },
    //     {
    //       $or: [
    //         { "drc.recovery_officers": { $size: 0 } },
    //         { "drc.recovery_officers": { $elemMatch: { "removed_dtm": null } } },
    //       ],
    //     },
    //   ],
    // };

    // Add optional filters dynamically
    // if (rtom) query.$and.push({ area: rtom });
    // if (arrears_band) query.$and.push({ arrears_band });
    // if (ro_id) {
    //   query.$and.push({
    //     $expr: {
    //       $eq: [
    //         ro_id,
    //         {
    //           $arrayElemAt: [ { $arrayElemAt: ["$drc.recovery_officers.ro_id", -1] }, -1, ],
    //         },
    //       ],
    //     },
    //   });
    // }
    // if (from_date && to_date) {
    //   query.$and.push({ "drc.created_dtm": { $gt: new Date(from_date) } });
    //   query.$and.push({ "drc.created_dtm": { $lt: new Date(to_date) } });
    // }

    // const cases = await Case_details.find(query);

    const allowedStatusTypes = [
          "Open with Agent",
          "RO Negotiation",
          "Negotiation Settle pending",
          "Negotiation Settle Open Pending",
          "Negotiation Settle Active",
          "RO Negotiation Extension Pending",
          "RO Negotiation Extended",
          "RO Negotiation FMB Pending",
          "Forward to Mediation Board",
          "MB Negotiation",
          "MB Request Customer-Info",
          "MB Handover Customer-Info",
          "MB Settle pending",
          "MB Settle Open Pending",
          "MB Settle Active",
          "MB Fail with Pending Non-Settlement"
      ];

      const pipeline = [];

      // Match allowed status
      pipeline.push({
        $match: {
          case_current_status: { $in: allowedStatusTypes }
        }
      });

      // Optional filters
      if  (rtom) {
        pipeline.push({ $match: { rtom: rtom } });
      }

      // Add a projection to get the last DRC entry
      pipeline.push({
        $addFields: {
          last_drc: { $arrayElemAt: ['$drc', -1] }
        }
      });

      pipeline.push({
        $match: {
          'last_drc.drc_status': 'Active',
          'last_drc.removed_dtm': null
        }
      });

      if (drc_id) {
        pipeline.push({
          $match: {
            'last_drc.drc_id': Number(drc_id)
          }
        });
      }

      if (arrears_band) {
        pipeline.push({ 
          $match: { arrears_band } });
      }

      const dateFilter = {};
      if (from_date) dateFilter.$gte = new Date(from_date);
      if (to_date) dateFilter.$lte = new Date(to_date);

      // pipeline.push({
      //   $addFields: {
      //     last_mediation_board: { $arrayElemAt: ['$mediation_board', -1] }
      //   }
      // });

      if (Object.keys(dateFilter).length > 0) {
        pipeline.push({
          $match: { 'last_drc.created_dtm': dateFilter }
        });
      }

      pipeline.push({
        $addFields: {
          last_ro: { $arrayElemAt: ['$last_drc.recovery_officers', -1] }
        }
      });

      if (ro_id) {
        pipeline.push({
          $match: {
            'last_ro.ro_id': Number(ro_id)
          }
        });
      }

      pipeline.push({
        $lookup: {
          from: "Recovery_officer", // name of the recovery officer collection
          localField: "last_ro.ro_id",
          foreignField: "ro_id",
          as: "recovery_officer"
        }
      });

      // Optionally flatten the result if you expect only one match
      // pipeline.push({
      //   $addFields: {
      //     recovery_officer: { $arrayElemAt: ["$recovery_officer", 0] }
      //   }
      // });

      // let page = Number(pages);
      // if (isNaN(page) || page < 1) page = 1;
      // const limit = page === 1 ? 10 : 30;
      // const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

      // Pagination
      pipeline.push({ $sort: { case_id: -1 } });
      // pipeline.push({ $skip: skip });
      // pipeline.push({ $limit: limit });

      const filtered_cases = await Case_details.aggregate(pipeline);

    // Handle case where no matching cases are found
    if (filtered_cases.length === 0) {
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
      filtered_cases.map(async (caseData) => {
        // const lastDrc = caseData.drc[caseData.drc.length - 1]; // Get the last DRC object
        // const lastRecoveryOfficer =
        //   lastDrc.recovery_officers[lastDrc.recovery_officers.length - 1] || {};

        // // Fetch matching recovery officer asynchronously
        // const matchingRecoveryOfficer = await RecoveryOfficer.findOne({
        //   ro_id: lastRecoveryOfficer.ro_id,
        // });

        return {
          case_id: caseData.case_id,
          status: caseData.case_current_status,
          created_dtm: caseData.last_drc.created_dtm,
          current_arreas_amount: caseData.current_arrears_amount,
          area: caseData.area,
          remark: caseData.remark?.[caseData.remark.length - 1]?.remark || null,
          expire_dtm: caseData.last_drc ? caseData.last_drc.expire_dtm : null,
          ro_name: caseData.recovery_officer?.[0]?.ro_name || null,
          assigned_date: caseData.last_ro? caseData.last_ro.assigned_dtm : null,
        };
      })
    );

    // Return success response
    return res.status(200).json({
      status: "success",
      message: "Cases retrieved successfully.",
      data: formattedCases,
    });
  } catch (error) {
    // Handle errors
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


export const assignROToCase = async (req, res) => {
  try {
    const { case_ids, ro_id, drc_id, assigned_by } = req.body;

    // Validate input
    if (!Array.isArray(case_ids) || case_ids.length === 0 || !ro_id || !drc_id || !assigned_by) {
      return res.status(400).json({
        status: "error",
        message: "Failed to assign Recovery Officer.",
        errors: {
          code: 400,
          description: "case_ids must be a non-empty array and all fields are required.",
        },
      });
    }

    // Fetch the recovery officer details
    const recoveryOfficer = await RecoveryOfficer.findOne({ ro_id });
    if (!recoveryOfficer) {
      return res.status(404).json({
        status: "error",
        message: "Recovery Officer not found.",
        errors: {
          code: 404,
          description: `No Recovery Officer found with ro_id: ${ro_id}.`,
        },
      });
    }

    // const assigned_by = "System";
    // Extract the RTOM areas assigned to the recovery officer
    const assignedAreas = recoveryOfficer.rtoms_for_ro.map((r) => r.name);

    const errors = [];
    const updates = [];

    // Fetch all cases with the provided case IDs
    const cases = await Case_details.find({
      $and: [
        { case_id: { $in: case_ids } }, // Match cases with the provided case_ids
        { "drc.drc_id": drc_id }       // Ensure the drc_id matches
      ]
    });
    
    if (cases.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No cases found for the provided case IDs.",
      });
    }

    for (const caseData of cases) {
      const { case_id, drc, area } = caseData;

      // Ensure the case area matches one of the recovery officer's assigned areas
      if (!assignedAreas.includes(area)) {
        errors.push({
          case_id,
          message: `The area "${area}" does not match any RTOM area assigned to Recovery Officer with ro_id: ${ro_id}.`,
        });
        continue;
      }

      // Ensure there's at least one DRC with expire_dtm as null
      const activeDrc = drc.find((d) => d.removed_dtm === null);
      if (!activeDrc) {
        errors.push({
          case_id,
          message: "No active DRC with removed_dtm as null found.",
        });
        continue;
      }

      // Ensure recovery_officers array exists in the active DRC
      const recoveryOfficers = activeDrc.recovery_officers || [];
      const lastOfficer = recoveryOfficers[recoveryOfficers.length - 1];

      // If there is a last officer, ensure remove_dtm is updated
      if (lastOfficer && lastOfficer.removed_dtm === null) {
        lastOfficer.removed_dtm = new Date();
      }

      // Prepare the new recovery officer object
      const newOfficer = {
        ro_id,
        assigned_dtm: new Date(),
        assigned_by,
        removed_dtm: null,
        case_removal_remark: null,
      };

      // Add the new officer to the recovery_officers array
      recoveryOfficers.push(newOfficer);

      // Update the case data
      updates.push({
        updateOne: {
          filter: { case_id, "drc.drc_id": activeDrc.drc_id },
          update: {
            $set: { "drc.$.recovery_officers": recoveryOfficers },
          },
        },
      });
    }

    // Apply updates using bulkWrite
    if (updates.length > 0) {
      await Case_details.bulkWrite(updates);
    }

    // Respond with success and error details
    res.status(200).json({
      status: "success",
      message: "Recovery Officers assigned successfully.",
      details: {
        updated_cases: updates.length,
        failed_cases: errors,
      },
    });
  } catch (error) {
    // Handle unexpected errors
    return res.status(500).json({
      status: "error",
      message: "An error occurred while assigning the Recovery Officer.",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }
};


// export const listBehaviorsOfCaseDuringDRC = async (req, res) => {
//   try {
//     const { case_id, drc_id } = req.body;

//     // Validate input
//     if (!case_id || !drc_id) {
//       return res.status(400).json({
//         status: "error",
//         message: "All fields are required.",
//       });
//     }

//     // Fetch the case details (use find() to get an array of documents)
//     let query = {
//       "drc.drc_id": drc_id,
//       case_id : case_id,
//     };


//     const caseData = await Case_details.findOne(query).collation({ locale: 'en', strength: 2 });


//     // Check if any cases exist
//     if (!caseData) {
//       return res.status(404).json({
//         status: "error",
//         message: "No matching cases found for the given criteria.",
//         errors: {
//           code: 404,
//           description: "No cases satisfy the provided criteria.",
//         },
//       });
//     }

//     // Fetch settlement data (use find() to get an array of documents)
//     const settlementData = await CaseSettlement.findOne(
//       { case_id },
//       {
//         created_dtm: 1 || null,
//         settlement_status: 1 || null,
//         expire_date: 1 || null
//       }
//     ).collation({ locale: 'en', strength: 2 });

//     // Check if the case has any settlements
//     if (!settlementData) {
//       return res.status(404).json({
//         status: "error",
//         message: "No settlements found for the case.",
//         errors: {
//           code: 404,
//           description: "No settlements found for the case.",
//         },
//       });
//     }

//     // Fetch payment data (use find() to get an array of documents)
//     const paymentData = await CasePayments.findOne(
//       { case_id },
//       {
//         created_dtm: 1 || null,
//         bill_paid_amount: 1 || null,
//         settled_balance: 1 || null
//       }
//     ).collation({ locale: 'en', strength: 2 });

//     if (!paymentData) {
//       return res.status(404).json({
//         status: "error",
//         message: "No payments found for the case.",
//         errors: {
//           code: 404,
//           description: "No payments found for the case.",
//         },
//       });
//     }

//     // Use Promise.all to handle asynchronous operations
//     const findDrc = { "drc.drc_id": drc_id}
//     const lastRecoveryOfficer =
//       caseData.findDrc?.recovery_officers?.[caseData.findDrc.recovery_officers.length - 1];

//     let matchingRecoveryOfficer = null;
//     if (lastRecoveryOfficer?.ro_id) {
//       matchingRecoveryOfficer = await RecoveryOfficer.findOne({
//         ro_id: lastRecoveryOfficer.ro_id,
//       });
//     }

//     const formattedCaseDetails = {
//       case_id: caseData.case_id,
//       customer_ref: caseData.customer_ref,
//       account_no: caseData.account_no,
//       current_arrears_amount: caseData.current_arrears_amount,
//       last_payment_date: caseData.last_payment_date,
//       ref_products: caseData.ref_products || null,
//       ro_negotiation: caseData.ro_negotiation || null,
//       ro_requests: caseData.ro_requests || null,
//       ro_id: matchingRecoveryOfficer?.ro_id || null,
//     };


//     // Return success response
//     return res.status(200).json({
//       status: "success",
//       message: "Cases retrieved successfully.",
//       data: {
//         formattedCaseDetails,
//         settlementData,
//         paymentData,
//       }
//     });
//   } catch (error) {
//     // Handle unexpected errors
//     return res.status(500).json({
//       status: "error",
//       message: "An error occurred while retrieving case behaviors.",
//       errors: {
//         code: 500,
//         description: error.message,
//       },
//     });
//   }
// };

export const listBehaviorsOfCaseDuringDRC = async (req, res) => {
  try {
    const { case_id, drc_id } = req.body;
    // Validate input
    if (!case_id || !drc_id) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required.",
      });
    }
    
    // Fetch the case details
    let query = {
      "drc.drc_id": drc_id,
      case_id: case_id,
    };
    const caseData = await Case_details.findOne(query).collation({ locale: 'en', strength: 2 });
    
    // Check if case exists
    if (!caseData) {
      return res.status(404).json({
        status: "error",
        message: "No matching cases found for the given criteria.",
        errors: {
          code: 404,
          description: "No cases satisfy the provided criteria.",
        },
      });
    }
    
    // Find the DRC-specific data
    const drcEntry = caseData.drc?.find(entry => entry.drc_id === drc_id);
    
    // Find the last recovery officer for this DRC
    let matchingRecoveryOfficer = null;
    if (drcEntry?.recovery_officers?.length) {
      const lastRecoveryOfficer = drcEntry.recovery_officers[drcEntry.recovery_officers.length - 1];
      if (lastRecoveryOfficer?.ro_id) {
        matchingRecoveryOfficer = await RecoveryOfficer.findOne({
          ro_id: lastRecoveryOfficer.ro_id,
        });
      }
    }
    
    // Format case details
    const formattedCaseDetails = {
      case_id: caseData.case_id,
      customer_ref: caseData.customer_ref,
      account_no: caseData.account_no,
      current_arrears_amount: caseData.current_arrears_amount,
      last_payment_date: caseData.last_payment_date,
      ref_products: caseData.ref_products || null,
      ro_negotiation: caseData.ro_negotiation || null,
      ro_requests: caseData.ro_requests || null,
      ro_id: matchingRecoveryOfficer?.ro_id || null,
    };
    
    // Prepare response object
    const responseData = {
      formattedCaseDetails
    };
    
    // Try to fetch settlement data, but don't require it
    try {
      const settlementData = await CaseSettlement.findOne(
        { case_id },
        {
          created_dtm: 1,
          settlement_status: 1,
          expire_date: 1
        }
      ).collation({ locale: 'en', strength: 2 });
      
      if (settlementData) {
        responseData.settlementData = settlementData;
      }
    } catch (settlementError) {
      // Log error but continue
      console.error("Error fetching settlement data:", settlementError.message);
    }
    
    // Try to fetch payment data, but don't require it
    try {
      const paymentData = await CasePayments.findOne(
        { case_id },
        {
          created_dtm: 1,
          bill_paid_amount: 1,
          settled_balance: 1
        }
      ).collation({ locale: 'en', strength: 2 });
      
      if (paymentData) {
        responseData.paymentData = paymentData;
      }
    } catch (paymentError) {
      // Log error but continue
      console.error("Error fetching payment data:", paymentError.message);
    }
    
    // Return success response
    return res.status(200).json({
      status: "success",
      message: "Case data retrieved successfully.",
      data: responseData
    });
  } catch (error) {
    // Handle unexpected errors
    return res.status(500).json({
      status: "error",
      message: "An error occurred while retrieving case behaviors.",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }
};


export const updateLastRoDetails = async (req, res) => {
  const { case_id, drc_id, remark } = req.body;

  try {
    // Validate input
    if (!case_id || !drc_id || !remark) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required.",
      });
    }

    // Ensure remark is a valid text input (not just spaces or symbols)
    const trimmedRemark = remark.trim();
    const isValidRemark = /^[A-Za-z0-9\s.,!?]+$/.test(trimmedRemark); // Accepts letters, numbers, spaces, and common punctuation.

    if (trimmedRemark.length === 0 || !isValidRemark) {
      return res.status(400).json({
        status: "error",
        message: "Remark must contain valid text (letters or numbers).",
      });
    }

    // Find the case to get the last recovery officer's index
    const caseData = await Case_details.findOne({
      case_id,
      "drc.drc_id": drc_id,
    });

    if (!caseData) {
      return res.status(404).json({
        status: "error",
        message: "Case not found.",
        errors: {
          code: 404,
          description: "No case found with the provided case_id and drc_id.",
        },
      });
    }

    // Find the index of the matching drc object
    const lastDRC = caseData.drc.findIndex((drc) => drc.drc_id === drc_id);

    if (lastDRC === -1) {
      return res.status(404).json({
        status: "error",
        message: "DRC not found in the case.",
        errors: {
          code: 404,
          description: "No DRC found with the provided drc_id.",
        },
      });
    }

    // Get the last recovery officer's index
    const recoveryOfficers = caseData.drc[lastDRC].recovery_officers;
    const lastRecoveryOfficer = recoveryOfficers.length - 1;

    if (lastRecoveryOfficer === -1) {
      return res.status(404).json({
        status: "error",
        message: "No recovery officers found in the DRC.",
        errors: {
          code: 404,
          description: "The recovery_officers array is empty.",
        },
      });
    }

    // Update the case_removal_remark of the last recovery officer
    const updateCaseData = {
      $set: {
        [`drc.${lastDRC}.recovery_officers.${lastRecoveryOfficer}.case_removal_remark`]: trimmedRemark,
      },
    };

    // Update the case data
    const updatedCase = await Case_details.findOneAndUpdate(
      { case_id, "drc.drc_id": drc_id },
      updateCaseData,
      { new: true } // Return the updated document
    );

    if (!updatedCase) {
      return res.status(404).json({
        status: "error",
        message: "Case not found.",
        errors: {
          code: 404,
          description: "No case found with the provided case_id and drc_id.",
        },
      });
    } else {
      // Return success response
      return res.status(200).json({
        status: "success",
        message: "Recovery Officer details updated successfully.",
      });
    }
  } catch (error) {
    // Handle unexpected errors
    return res.status(500).json({
      status: "error",
      message: "An error occurred while updating recovery officer details.",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }
};

/**
 * Inputs:
 * - drc_commision_rule: String (required)
 * 
 * Success Result:
 * - Returns a success response with total matching case count and arrears band breakdown including count and arrears sum per band.
 */
export const count_cases_rulebase_and_arrears_band = async (req, res) => {
  const { drc_commision_rule } = req.body;

  try {
    if (!drc_commision_rule) {
      return res.status(400).json({
        status: "error",
        message: "drc_commision_rule is required.",
      });
    }

    const case_status = "Open No Agent";
    const mongoConnection = await db.connectMongoDB();
    if (!mongoConnection) {
      throw new Error("MongoDB connection failed");
    }

    const arrearsBandsData = await mongoConnection.collection("Arrears_bands").findOne({});
    if (!arrearsBandsData) {
      return res.status(404).json({
        status: "error",
        message: "No arrears bands found.",
      });
    }

    const arrearsBands = Object.entries(arrearsBandsData)
      .filter(([key]) => key !== "_id")
      .map(([key, value]) => ({ key, range: value, count: 0, arrears_sum: 0 }));

    const cases = await Case_details.find({
      case_current_status: case_status,
      drc_commision_rule,
      case_distribution_batch_id: null
    });

    if (!cases || cases.length === 0) {
      return res.status(204).json({
        status: "error",
        message: "No cases found for the provided criteria.",
      });
    }

    const totalCases = cases.length;

    cases.forEach((caseData) => {
      const { arrears_band, current_arrears_amount } = caseData;
      const band = arrearsBands.find((band) => band.key === arrears_band);
      if (band) {
        band.count++;
        band.arrears_sum += current_arrears_amount || 0;
      }
    });

    const formattedBands = arrearsBands.map((band) => ({
      band: band.range,
      count: band.count,
      arrears_sum: band.arrears_sum,
      details: {
        description: `Cases in the range of ${band.range}`,
      },
    }));

    return res.status(200).json({
      status: "success",
      message: "Counts retrieved successfully.",
      data: {
        Total: totalCases,
        Arrears_Bands: formattedBands,
      },
    });
  } catch (error) {
    console.error("Error retrieving counts:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve counts.",
      errors: {
        exception: error.message,
      },
    });
  }
};

/**
 * Inputs:
 * - date_from: String (optional, ISO Date format)
 * - date_to: String (optional, ISO Date format)
 * - current_arrears_band: String (optional)
 * - drc_commision_rule: String (optional)
 * 
 * Success Result:
 * - Returns a summary of case distributions with the latest batch_seq and latest status based on the provided filters.
 */
export const List_Case_Distribution_DRC_Summary = async (req, res) => {
  try {
      const { date_from, date_to, current_arrears_band, drc_commision_rule } = req.body;
      let filter = {};

      if (!date_from && !date_to && !current_arrears_band && !drc_commision_rule) {
          return res.status(200).json({
            status: "error",
            message: "No filters provided",
          });
      }
      // Filter based on date range
      if (date_from && date_to) {
          filter.created_dtm = { $gte: new Date(date_from), $lte: new Date(date_to) };
      } else if (date_from) {
          filter.created_dtm = { $gte: new Date(date_from) };
      } else if (date_to) {
          filter.created_dtm = { $lte: new Date(date_to) };
      }

      // Filter based on arrears_band
      if (current_arrears_band) {
          filter.current_arrears_band = current_arrears_band;
      }

      // Filter based on drc_commision_rule
      if (drc_commision_rule) {
          filter.drc_commision_rule = drc_commision_rule;
      }

      // Fetch case distributions based on filter
      const caseDistributions = await CaseDistribution.find(filter);

      // Process results to extract the last batch_seq details and last crd_distribution_status
      const response = caseDistributions.map(doc => {
          // Sort batch_seq_details by batch_seq in descending order and take the last one
          const lastBatchSeq = doc.batch_seq_details?.length
              ? doc.batch_seq_details.sort((a, b) => b.batch_seq - a.batch_seq)[0]
              : null;

          // Sort status by created_dtm in descending order and take the last one
          const lastStatus = doc.status?.length
              ? doc.status.sort((a, b) => new Date(b.created_dtm) - new Date(a.created_dtm))[0]
              : null;

          return {
              _id: doc._id,
              case_distribution_batch_id: doc.case_distribution_batch_id,
              batch_seq_details: lastBatchSeq ? [lastBatchSeq] : [], // Only the last batch_seq
              created_dtm: doc.created_dtm,
              created_by: doc.created_by,
              current_arrears_band: doc.current_arrears_band,
              rulebase_count: doc.rulebase_count,
              rulebase_arrears_sum: doc.rulebase_arrears_sum,
              status: lastStatus ? [lastStatus] : [], // Only the last status
              drc_commision_rule: doc.drc_commision_rule,
              forward_for_approvals_on: doc.forward_for_approvals_on,
              approved_by: doc.approved_by,
              approved_on: doc.approved_on,
              proceed_on: doc.proceed_on,
              tmp_record_remove_on: doc.tmp_record_remove_on
          };
      });

      res.status(200).json(response);
  } catch (error) {
      res.status(500).json({ message: "Server Error", error });
  }
};

/**
 * Inputs:
 * - current_arrears_band: String (optional)
 * - date_from: String (optional, ISO Date format)
 * - date_to: String (optional, ISO Date format)
 * - drc_commision_rule: String or Object (optional)
 * - Created_By: String (required)
 * 
 * Success Result:
 * - Returns a success response confirming the task creation with the provided parameters.
 */
export const Create_Task_For_case_distribution = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { current_arrears_band, date_from, date_to, drc_commision_rule, Created_By } = req.body;

    if (!Created_By) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: "error",
        message: "Created_By is a required parameter.",
      });
    }

    // Flatten the parameters structure
    const parameters = {
      current_arrears_band,
      date_from: date_from && !isNaN(new Date(date_from)) ? new Date(date_from).toISOString() : null,
      date_to: date_to && !isNaN(new Date(date_to)) ? new Date(date_to).toISOString() : null,
      drc_commision_rule, 
    };

    // Pass parameters directly (without nesting it inside another object)
    const taskData = {
      Template_Task_Id: 26,
      task_type: "Create Case distribution DRC Transaction List for Downloard",
      ...parameters, // Spreads parameters directly into taskData
      Created_By,
      task_status: "open"
    };

    // Call createTaskFunction
    await createTaskFunction(taskData, session);

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      status: "success",
      message: "Task created successfully.",
      data: taskData,
    });
  } catch (error) {
    console.error("Error in Create_Task_For_case_distribution:", error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error.",
      errors: {
        exception: error.message,
      },
    });
  }
};

/**
 * Inputs:
 * - case_distribution_batch_id: String (required)
 * 
 * Success Result:
 * - Returns a success response with the list of transactions related to the given batch ID.
 */
export const List_all_transaction_seq_of_batch_id = async (req, res) => {
  try {
    const { case_distribution_batch_id } = req.body;

    if (!case_distribution_batch_id) {
      return res.status(400).json({
        status: "error",
        message: "case_distribution_batch_id is a required parameter.",
      });
    }

    const transactions_data = await Case_distribution_drc_transactions.find({ case_distribution_batch_id });

    if (transactions_data.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No data found for this batch ID.",
      });
    }

    return res.status(200).json({ 
      status: "success",
      message: `Successfully retrieved ${transactions_data.length} records`,
      data: transactions_data,
    });
  } catch (error) {
    console.error("Error fetching batch data:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error. Please try again later.",
    });
  }
};

export const ListALLMediationCasesownnedbyDRCRO = async (req, res) => {
  const { drc_id, ro_id, rtom, case_current_status, action_type, from_date, to_date } = req.body;

  try {
    // Validate input parameters
    if (!drc_id) {
      return res.status(400).json({
        status: "error",
        message: "Failed to retrieve Case details.",
        errors: {
          code: 400,
          description: "DRC ID is required.",
        },
      });
    }

    if (!rtom && !ro_id && !action_type && !case_current_status && !(from_date && to_date)) {
      return res.status(400).json({
        status: "error",
        message: "At least one filtering parameter is required.",
        errors: {
          code: 400,
          description: "Provide at least one of rtom, ro_id, action_type, case_current_status, or both from_date and to_date together.",
        },
      });
    }

    // Build query dynamically
    let query = {
      $and: [
        { "drc.drc_id": drc_id },
        {
          case_current_status: {
            $in: [
              "Forward_to_Mediation_Board",
              "MB_Negotiation",
              "MB_Request_Customer_Info",
              "MB_Handed_Customer_Info",
              "MB_Settle_pending",
              "MB_Settle_open_pending",
              "MB_Settle_Active",
              "MB_fail_with_pending_non_settlement",
            ],
          },
        },
      ],
    };

    // Add optional filters dynamically
    if (rtom) query.$and.push({ area: rtom });
    if (ro_id) {
      query.$and.push({
        $expr: {
          $eq: [
            ro_id,
            { $arrayElemAt: [ { $arrayElemAt: ["$drc.recovery_officers.ro_id", -1] }, -1, ], },
          ],
        },
      });
    };    
    if (action_type) query.$and.push({ action_type });
    if (case_current_status) query.$and.push({ case_current_status });
    if (from_date && to_date) {
      query.$and.push({ "drc.created_dtm": { $gt: new Date(from_date) } });
      query.$and.push({ "drc.created_dtm": { $lt: new Date(to_date) } });
    }

    // Fetch cases based on the query
    const cases = await Case_details.find(query);

    // Handle case where no matching cases are found
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

    // Format cases based on drc_id or ro_id
    const formattedCases = await Promise.all(
      cases.map(async (caseData) => {
        const findDRC = Array.isArray(caseData.drc) ? caseData.drc.find((drc) => drc.drc_id === drc_id) : null;

        const lastRO = findDRC?.recovery_officers?.[findDRC.recovery_officers.length - 1] || null;

        const matchingRecoveryOfficer = await RecoveryOfficer.findOne({ ro_id: lastRO?.ro_id });

        const mediationBoardCount = caseData.mediation_board?.length || 0;

        return {
          case_id: caseData.case_id,
          status: caseData.case_current_status,
          created_dtm: findDRC?.created_dtm || null,
          ro_name: matchingRecoveryOfficer?.ro_name || null,
          area: caseData.area,
          mediation_board_count: mediationBoardCount,
          next_calling_date: caseData.mediation_board?.[mediationBoardCount - 1]?.mediation_board_calling_dtm || null,
          current_contact:caseData.current_contact || null,
          account_no: caseData.account_no || null
        };
      })
    );

  // Return response
  return res.status(200).json({
    status: "success",
    message: "Cases retrieved successfully.",
    data: formattedCases.filter(Boolean), // Filter out null/undefined values
  });

  } catch (error) {
    console.error("Error in function:", error); // Log the full error for debugging
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

/**
 * Inputs:
 * - case_distribution_batch_id: Number (required)
 * - Proceed_by: String (required)
 * - billing_center: String (optional)
 * 
 * Success Result:
 * - Returns a success response after forwarding the batch for proceed,
 *   including task creation, approval entry, and user interaction logging.
 */

export const Batch_Forward_for_Proceed = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { case_distribution_batch_id, Proceed_by } = req.body;

    if (!case_distribution_batch_id) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "case_distribution_batch_id is required" });
    }

    if (!Proceed_by) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Proceed_by is required" });
    }

    // Get delegate_id dynamically
    const case_phase = "Distribution";
    const approval_type = "DRC Assign Approval";

    const delegate_id = await getBatchApprovalUserIdService({ case_phase, approval_type });

    // Validate if batch has "Complete" status
    const batchToProcess = await CaseDistribution.findOne({
      case_distribution_batch_id,
      crd_distribution_status: "Complete"
    }).session(session);

    if (!batchToProcess) {
      await session.abortTransaction();
      session.endSession();
      return res.status(204).json({
        message: "The batch does not have a 'Complete' status and cannot be proceeded.",
        batchId: case_distribution_batch_id,
      });
    }

    const currentDate = new Date();

    // Update proceed_on and forward_for_approvals_on date in Case_distribution_drc_transactions
    const result = await CaseDistribution.updateOne(
      { case_distribution_batch_id },
      {
        $set: {
          proceed_on: currentDate,
          forward_for_approvals_on: currentDate, // New field update
        },
      },
      { session }
    );

    if (result.modifiedCount === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "No matching batch ID found" });
    }
    const parameters = {
      case_distribution_batch_id
    };
    // Create Task for Proceed Action
    const taskData = {
      Template_Task_Id: 31,
      task_type: "Create Task for Proceed Cases from Batch_ID",
      ...parameters,
      Created_By: Proceed_by,
      task_status: "open",
    };

    await createTaskFunction(taskData, session);

    // Create Entry in Template_forwarded_approver
    const approvalEntry = new TmpForwardedApprover({
      approver_reference: case_distribution_batch_id, // Single batch ID
      created_by: Proceed_by,
      approver_type: "DRC Assign Approval",
      parameters,
      approve_status: [{
        status: "Open",
        status_date: currentDate,
        status_edit_by: Proceed_by,
      }],
      approved_deligated_by: delegate_id, // Dynamic delegate_id
    });

    await approvalEntry.save({ session });

    const dynamicParams = { case_distribution_batch_id};

    const interactionResult = await createUserInteractionFunction({
      Interaction_ID: 6,
      User_Interaction_Type: "Pending Approval Agent Destribution",
      delegate_user_id: delegate_id,
      Created_By: Proceed_by,
      User_Interaction_Status: "Open",
      User_Interaction_Status_DTM: currentDate,
      ...dynamicParams,
      session,
    });

    // Commit transaction  
    await session.commitTransaction();
    session.endSession();

    // Success response
    return res.status(200).json({
      message: "Batch forwarded for proceed successfully, task created, approval recorded, and user interaction logged.",
      updatedCount: result.modifiedCount,
      taskData,
      approvalEntry,
      interactionResult,
    });

  } catch (error) {
    console.error("Error forwarding batch for proceed:", error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      message: "Error forwarding batch for proceed",
      error: error.message || "Internal server error.",
    });
  }
};


/**
 * Inputs:
 * - case_distribution_batch_id: number (required)
 * - Created_By: String (required)
 * 
 * Success Result:
 * - Returns a success response after creating a task for Case Distribution DRC Transaction Batch List.
 */
export const Create_Task_For_case_distribution_transaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {case_distribution_batch_id,Created_By, } = req.body;

    if (!case_distribution_batch_id || !Created_By) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: "error",
        message: "case_distribution_batch_id and Created_By are required parameter.",
      });
    }
    const parameters = {
      case_distribution_batch_id
    };

    const taskData = {
      Template_Task_Id: 27,
      task_type: "Crealist_distribution_array_of_a_transactionte Case distribution DRC Transaction_1 _Batch List for Downloard",
      ...parameters,
      Created_By,
      task_status:"open"
    };

    await createTaskFunction(taskData, session);

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      status: "success",
      message: "Create Case distribution DRC Transaction_1_Batch List for Download",
      data: taskData,
    });
  } catch (error) {
    console.error("Error in Create_Task_For_case_distribution:", error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error.",
      errors: {
        exception: error.message,
      },
    });
  }
};

/**
 * Inputs:
 * - case_distribution_batch_id: number (required)
 * - batch_seq: Number (required)
 * 
 * Success Result:
 * - Returns a success response with the list of transaction records matching the given batch ID and sequence.
 */
export const list_distribution_array_of_a_transaction = async (req, res) => {
  try {
    const { case_distribution_batch_id, batch_seq } = req.body;

    if (!case_distribution_batch_id || !batch_seq) {
      return res.status(400).json({
        status: "error",
        message: "case_distribution_batch_id and batch_seq are required parameters.",
      });
    }

    const transactions_data = await Case_distribution_drc_transactions.find({
      case_distribution_batch_id,
      "batch_seq_details.batch_seq": batch_seq
    },{
      _id: 0,
      case_distribution_batch_id: 1,
      created_dtm: 1,
      created_by:1,
      rulebase_count:1,
      rulebase_arrears_sum:1,
      status:1,
      drc_commision_rule:1,
      forward_for_approvals_on:1,
      approved_by:1,
      approved_on:1,
      proceed_on:1,
      tmp_record_remove_on:1,
      current_arrears_band:1,
      batch_seq_details: { $elemMatch: { batch_seq: batch_seq } }
    });
    
    return res.status(200).json({ 
      status: "success",
      message: `Successfully retrieved ${transactions_data.length} records`,
      data: transactions_data,
    });
  } catch (error) {
    console.error("Error fetching batch data:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error. Please try again later.",
    });
  }
};

export const ListActiveRORequestsMediation = async (req, res) => {
  try {
    // Fetch all RO details from MongoDB
    const ro_requests = await Template_RO_Request.find();

    // Check if any data is found in databases
    if (ro_requests.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No RO request found.",
      });
    }

    // Return the retrieved data
    return res.status(200).json({
      status: "success",
      message: "Ro request details retrieved successfully.",
      data: ro_requests,
    });
  } catch (error) {
    console.error("Unexpected error:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Internal server error occurred while fetching RO details.",
      error: error.message,
    });
  }
};

/**
 * Inputs:
 * - case_distribution_batch_id: String (required)
 * - batch_seq: String or Number (required)
 * - Created_By: String (required)
 * 
 * Success Result:
 * - Returns a success response with task creation data for Case Distribution DRC Transaction Batch List distribution array.
 */
export const Create_Task_For_case_distribution_transaction_array = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { case_distribution_batch_id, batch_seq, Created_By } = req.body;

    if (!case_distribution_batch_id || !batch_seq || !Created_By) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: "error",
        message: "case_distribution_batch_id, batch_seq, and Created_By are required parameters.",      });
    }
    const parameters = {
      case_distribution_batch_id,
      batch_seq
    };

    const taskData = {
      Template_Task_Id: 28,
      task_type: "Create Case distribution DRC Transaction_1 _Batch List distribution array for Downloard",
      Created_By,
      ...parameters,
      task_status:"open"
    };

    await createTaskFunction(taskData, session);

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      status: "success",
      message: "Create Case distribution DRC Transaction_1_Batch List distribution array for Download",
      data: taskData,
    });
  } catch (error) {
    console.error("Error in Create_Task_For_case_distribution:", error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error.",
      errors: {
        exception: error.message,
      },
    });
  }
};

/**
 * Inputs:
 * - case_distribution_batch_id: String (required)
 * - drc_list: Array of objects (required)
 *    - Each object must include:
 *        - plus_drc_id: Number
 *        - plus_drc: String
 *        - plus_rulebase_count: Number
 *        - minus_drc_id: Number
 *        - minus_drc: String
 *        - minus_rulebase_count: Number
 *        - rtom: (optional field)
 * - created_by: String (required)
 * 
 * Success Result:
 * - Returns a success response with the message that a new batch sequence is added successfully.
 */
export const Exchange_DRC_RTOM_Cases = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const { case_distribution_batch_id, drc_list, created_by } = req.body;

  if (!case_distribution_batch_id || !drc_list || !created_by) {
    return res.status(400).json({
      status: "error",
      message: "case distribution batch id, created by and DRC list fields are required.",
    });
  }
  try {
    // Fetch the existing document to get the last batch_seq
    const existingCase = await CaseDistribution.findOne({ case_distribution_batch_id }).session(session);

    if(!existingCase){
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        status: "error",
        message: "case distribution batch id is not match with the existing batches.",
      },
    );
    }
    const mongo = await db.connectMongoDB();
    const existingTask = await mongo.collection("System_tasks").findOne({
      task_status: { $ne: "Complete" },
      "parameters.case_distribution_batch_id": case_distribution_batch_id,
      },
      { session }
    );
    if (existingTask) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: "error",
        message: "Already has tasks with this case distribution batch id ",
      });
    }
    if (!Array.isArray(drc_list) || drc_list.length <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: "error",
        message: "DRC List should not be empty.",
      });
    }

    const validateDRCList = (drcList) => {
      if (!Array.isArray(drcList)) {
        throw new Error("DRC List must be an array.");
      }
      return drcList.map((item, index) => {
        const isValid = 
          typeof item.plus_drc === "string" &&
          typeof item.plus_rulebase_count === "number" &&
          typeof item.minus_drc === "string" &&
          typeof item.minus_rulebase_count === "number" &&
          typeof item.plus_drc_id === "number" &&
          typeof item.minus_drc_id === "number";

        if (!isValid) {
          throw new Error(`Invalid structure at index ${index} in DRC List.`);
        }

        return {
          plus_drc_id: item.plus_drc_id,
          plus_drc: item.plus_drc,
          plus_rulebase_count: item.plus_rulebase_count,
          minus_drc_id: item.minus_drc_id,
          minus_drc: item.minus_drc,
          minus_rulebase_count: item.minus_rulebase_count,
        };
      });
    };

    const validatedDRCList = validateDRCList(drc_list);
    
    // Prepare dynamic parameters for the task
    const dynamicParams = {
      case_distribution_batch_id,
    };

    // Call createTaskFunction
    const result = await createTaskFunction({
      Template_Task_Id: 36,
      task_type: "Exchange Case Distribution Planning among DRC",
      Created_By: created_by,
      ...dynamicParams,
      task_status:"open"
    });

    if(result.status==="error"){
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: "error",
        message: `An error occurred while creating the task: ${result}`,
      });
    }
    let nextBatchSeq = 1;

    if (existingCase && existingCase.batch_seq_details.length > 0) {
        const lastBatchSeq = existingCase.batch_seq_details[existingCase.batch_seq_details.length - 1].batch_seq;
        nextBatchSeq = lastBatchSeq + 1;
    }
    const batch_seq_rulebase_count = drc_list.reduce(
      (total, { plus_rulebase_count }) => total + plus_rulebase_count,
      0
    );

    const newBatchSeqEntry = {
      batch_seq: nextBatchSeq,
      created_dtm: new Date(),
      created_by,
      action_type: "amend",
      array_of_distributions: drc_list.map(({
        plus_drc_id,
        plus_drc,
        plus_rulebase_count,
        minus_drc_id,
        minus_drc,
        minus_rulebase_count,
        rtom,
      }) => ({
        plus_drc_id,
        plus_drc,
        plus_rulebase_count,
        minus_drc_id,
        minus_drc,
        minus_rulebase_count,
        rtom,
      })),
      batch_seq_rulebase_count,
      crd_distribution_status:"Open",
    };
    
    existingCase.batch_seq_details.push(newBatchSeqEntry);
    existingCase.crd_distribution_status = "Open";
    existingCase.crd_distribution_status_on = new Date();

    await existingCase.save({ session }); 
    
    await session.commitTransaction();
    session.endSession();
    return res.status(200).json({
      status: "success",
      message: `New batch sequence ${nextBatchSeq} added successfully.`,
    });

  } catch (error) {
    console.error(error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      status: "error",
      message: `An error occurred while creating the task: ${error.message}`,
    });
  }
};

/**
 * Inputs:
 * - case_distribution_batch_id: String (required)
 * 
 * Success Result:
 * - Returns a success response with grouped case details by batch ID, DRC, and RTOM, including case count and DRC name.
 */
export const Case_Distribution_Details_With_Drc_Rtom_ByBatchId = async (req, res) => {
  const { case_distribution_batch_id } = req.body;

  try {
    if (!case_distribution_batch_id) {
      return res.status(400).json({
        status: "error",
        message: "Case_Distribution_Batch_ID is required",
      });
    }

    const result = await tempCaseDistribution.aggregate([
      {
        $match: { case_distribution_batch_id: case_distribution_batch_id },
      },
      {
        $group: {
          _id: {
            case_distribution_batch_id: "$case_distribution_batch_id",
            drc_id: "$drc_id",
            rtom: "$rtom",
          },
          case_count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "Debt_recovery_company", 
          localField: "_id.drc_id",
          foreignField: "drc_id",
          as: "drc_details",
        },
      },
      {
        $unwind: {
          path: "$drc_details",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          case_distribution_batch_id: "$_id.case_distribution_batch_id",
          drc_id: "$_id.drc_id",
          rtom: "$_id.rtom",
          case_count: 1,
          drc_name: "$drc_details.drc_name",
        },
      },
    ]);

    return res.status(200).json({
      status: "success",
      message: "Case details retrieved successfully.",
      data: result,
    });

  } catch (err) {
      return res.status(500).json({
        status: "error",
        message: "Failed to retrieve case details.",
        errors: {
          code: 500,
          description: err.message || "Internal server error occurred while fetching case details.",
        },
      });
  }
};

/**
 * Inputs:
 * - approved_deligated_by: String (required)
 * 
 * Success Result:
 * - Returns a list of batch approval records with status "Open" assigned to the provided delegate ID,
 *   along with related case distribution details if available.
 */

export const List_All_Batch_Details = async (req, res) => {
  try {
    const { approved_deligated_by } = req.body; 
    
    if (!approved_deligated_by) {
      return res.status(400).json({ message: "approved_deligated_by is required" });
    }

    // Fetch all data in a single aggregation pipeline
    const result = await TmpForwardedApprover.aggregate([
      // Stage 1: Match approver documents with required conditions
      {
        $match: {
          approver_type: "DRC Assign Approval",
          approved_deligated_by: approved_deligated_by
        }
      },
      // Stage 2: Add a field for the last status
      {
        $addFields: {
          lastStatus: { $arrayElemAt: ["$approve_status", -1] }
        }
      },
      // Stage 3: Filter to only include documents where last status is "Open"
      {
        $match: {
          "lastStatus.status": "Open"
        }
      },
      // Stage 4: Lookup related case distribution data
      {
        $lookup: {
          from: "Case_distribution_drc_transactions", // Collection name
          localField: "approver_reference",
          foreignField: "case_distribution_batch_id",
          as: "case_distribution_details"
        }
      },
      // Stage 5: Unwind the case_distribution_details array (converts array to object)
      {
        $unwind: {
          path: "$case_distribution_details",
          preserveNullAndEmptyArrays: true // Keep documents even if no matching case distribution
        }
      },
      // Stage 6: Project only the fields we need
      {
        $project: {
          _id: 1,
          approver_reference: 1,
          created_on: 1,
          created_by: 1,
          approve_status: 1,
          approver_type: 1,
          parameters: 1,
          approved_deligated_by: 1,
          remark: 1,
          case_distribution_details: {
            $cond: {
              if: { $ifNull: ["$case_distribution_details", false] },
              then: {
                case_distribution_batch_id: "$case_distribution_details.case_distribution_batch_id",
                drc_commision_rule: "$case_distribution_details.drc_commision_rule",
                rulebase_count: "$case_distribution_details.rulebase_count",
                rulebase_arrears_sum: "$case_distribution_details.rulebase_arrears_sum"
              },
              else: null
            }
          }
        }
      }
    ]);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching batch details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


/**
 * Inputs:
 * - approver_reference: String (required) – The reference ID of the batch to approve.
 * - approved_by: String (required) – The user ID performing the approval.
 * 
 * Success Result:
 * - Updates the approval status for the given approver reference.
 * - Creates a task entry for the approval action.
 * - Logs the user interaction related to the approval event.
 */

export const Approve_Batch = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { approver_reference, approved_by } = req.body;

    if (!approver_reference) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "approver_reference is required" });
    }

    if (!approved_by) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "approved_by is required" });
    }

    const currentDate = new Date();

    // Fetch the created_by field for the matching approver_reference
    const approverDoc = await TmpForwardedApprover.findOne({
      approver_reference: approver_reference,
      approver_type: "DRC Assign Approval"
    }).select("approver_reference created_by");

    if (!approverDoc) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "No matching approver reference found" });
    }

    // Get delegate_id from created_by
    const delegate_id = approverDoc.created_by;

    // Update approve_status for the matching document
    const result = await TmpForwardedApprover.updateOne(
      { 
        approver_reference: approver_reference,
        approver_type: "DRC Assign Approval" 
      },
      {
        $push: {
          approve_status: {
            status: "Approve",
            status_date: currentDate,
            status_edit_by: approved_by,
          },
        }
      },
      { session }
    );

    if (result.modifiedCount === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(204).json({ message: "No matching approver reference found or already approved" });
    }

    const dynamicParams = {
      case_distribution_batch_id: approver_reference, // List of approver references
    }; 

    // Create Task for Approved Approver
    const taskData = {
      Template_Task_Id: 29,
      task_type: "Create Task for Approve Cases from Approver_Reference",
      ...dynamicParams,
      Created_By: approved_by,
      task_status: "open",
    };

    await createTaskFunction(taskData, session);

    await createUserInteractionFunction({
      Interaction_ID: 15,
      User_Interaction_Type: "Agent Distribution Batch Approved",
      delegate_user_id: delegate_id,
      Created_By: approved_by,
      User_Interaction_Status_DTM: currentDate,
      User_Interaction_Status: "Open",
      ...dynamicParams,
      approver_reference: approver_reference,
      session
    });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Approval added successfully, task created and interaction added.",
      updatedCount: result.modifiedCount,
      taskData: taskData,
    });
  } catch (error) {
    console.error("Error approving batch:", error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      message: "Error approving batch",
      error: error.message || "Internal server error.",
    });
  }
};


/**
 * Inputs:
 * - approver_references: Array of approver reference IDs (required)
 * - Created_By: String (user ID or name who created the task) (required)
 * 
 * Success Result:
 * - Returns a success response with the created batch approval task details.
 */
export const Create_task_for_batch_approval = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { approver_references, Created_By } = req.body;

    if (!approver_references || !Array.isArray(approver_references) || approver_references.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid input, provide an array of approver references" });
    }

    if (!Created_By) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Created_By is required" });
    }

    const currentDate = new Date();
    const dynamicParams = {
      approver_references, // List of approver references
    }; 
    // --- Create Task ---
    const taskData = {
      Template_Task_Id: 30, // Different Task ID for approval tasks
      task_type: "Create batch approval List for Downloard",
      ...dynamicParams,
      Created_By, // Assigned creator
      task_status: "open",
    };

    // Call createTaskFunction
    await createTaskFunction(taskData, session);

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "Task for batch approval created successfully.",
      taskData,
    });
  } catch (error) {
    console.error("Error creating batch approval task:", error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      message: "Error creating batch approval task",
      error: error.message || "Internal server error.",
    });
  }
};

/**
 * Inputs:
 * - approver_type: String (optional) – Type of approval to filter by. Must be one of the predefined allowed types.
 * - date_from: String (optional) – Start date (ISO format) for filtering records by created_on.
 * - date_to: String (optional) – End date (ISO format) for filtering records by created_on.
 * - approved_deligated_by: String  – Filter records by who delegated the approval.
 * - approve_status: String (optional) – Filter based on the most recent approval status.
 * 
 * Success Result:
 * - Returns a list of approval documents that match the specified filters.
 * - Each returned document includes only the last approve_status and is sorted by creation date descending.
 */

export const List_DRC_Assign_Manager_Approval = async (req, res) => {
  try {
    const { approver_type, date_from, date_to, approved_deligated_by, approve_status } = req.body;
    
    const allowedApproverTypes = [
      "DRC Re-Assign Approval",
      "Case Withdrawal Approval",
      "Case Abandoned Approval",
      "Case Write-Off Approval",
      "Commission Approval"
    ];
    
    if (!approved_deligated_by) {
      return res.status(400).json({ message: "approved_deligated_by is required" });
    }

    // Build the match stage for the aggregation pipeline
    let matchStage = { approver_type: { $in: allowedApproverTypes } };

    // Filter based on approver_type
    if (approver_type && allowedApproverTypes.includes(approver_type)) {
      matchStage.approver_type = approver_type;
    }

    // Filter based on date range
    if (date_from && date_to) {
      matchStage.created_on = { $gte: new Date(date_from), $lte: new Date(date_to) };
    } else if (date_from) {
      matchStage.created_on = { $gte: new Date(date_from) };
    } else if (date_to) {
      matchStage.created_on = { $lte: new Date(date_to) };
    }

    // Filter based on approved_deligated_by
    if (approved_deligated_by) {
      matchStage.approved_deligated_by = approved_deligated_by;
    }

    // Use aggregation to process data in the database
    const approvals = await TmpForwardedApprover.aggregate([
      // Match documents based on filters
      { $match: matchStage },
      
      // Add a field with the last approve_status
      { 
        $addFields: {
          lastApproveStatus: { 
            $arrayElemAt: ["$approve_status", -1] 
          }
        }
      },
      
      // Filter based on approve_status if provided
      ...(approve_status ? [
        { 
          $match: { 
            "lastApproveStatus.status": approve_status 
          } 
        }
      ] : []),
      
      // Replace the approve_status array with an array containing only the last status
      {
        $addFields: {
          approve_status: {
            $cond: {
              if: { $gt: [{ $size: "$approve_status" }, 0] },
              then: ["$lastApproveStatus"],
              else: []
            }
          }
        }
      },
      
      // Remove the temporary lastApproveStatus field
      {
        $project: {
          lastApproveStatus: 0
        }
      },
      
      // Sort by created_on in descending order (latest first)
      {
        $sort: { created_on: -1 }
      }
    ]);

    res.status(200).json(approvals);
  } catch (error) {
    console.error("Error fetching DRC Assign Manager Approvals:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


/**
 * Approves a DRC Assign Manager request and updates relevant collections.
 *
 * Inputs:
 * - approver_reference: String (required) – Reference ID used to identify the approval record.
 * - approved_by: String (required) – User ID of the approver.
 *
 * Process:
 * 1. Starts a MongoDB session and transaction.
 * 2. Validates input.
 * 3. Fetches the original approval document to get metadata like `created_by`, `approver_type`, and `created_on`.
 * 4. Determines the case status to apply using a predefined `statusMap`.
 * 5. Updates `TmpForwardedApprover` collection:
 *    - Appends to `approve_status` array with approval metadata.
 * 6. Updates `Case_details` collection:
 *    - Pushes approval info to both `approve` and `case_status` arrays.
 *    - Sets `case_current_status` accordingly.
 * 7. Logs the action using `createUserInteractionFunction`.
 * 8. Commits the transaction and returns a success message.
 *
 * Success Response:
 * - 200 OK with count of modified documents.
 *
 * Failure Responses:
 * - 400 if required fields are missing.
 * - 204 if approver reference does not exist.
 * - 304 if no document was modified.
 * - 500 for general errors.
 */

export const Approve_DRC_Assign_Manager_Approval = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { approver_reference, approved_by } = req.body;

    if (!approver_reference) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid input, approver_reference is required" });
    }

    if (!approved_by) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "approved_by is required" });
    }

    const currentDate = new Date();

    // Fetch the document to get approver_type, created_on, and created_by
    const approvalDoc = await TmpForwardedApprover.findOne(
      { 
      approver_reference: { $in: approver_reference },                           
      approver_type: { $ne: "DRC Assign Approval" }
      },
      {
        created_on: 1, created_by: 1, approver_type: 1, parameters:1
      }
    ).session(session);


    if (!approvalDoc) {
      await session.abortTransaction();
      session.endSession();
      return res.status(204).json({ message: "No matching approver reference found" });
    }

    // Fetch case details to check drc array length and monitor_months
    const caseDetails = await Case_details.findOne(
      { 
        case_id: approver_reference 
      },
      {
        monitor_months: 1, drc: 1, case_current_status: 1
      }
    ).session(session);
    
    if (!caseDetails) {
      await session.abortTransaction();
      session.endSession();
      return res.status(204).json({ message: "No matching case found" });
    }
    
    // Validate drc array length and monitor_months
    if (approvalDoc.approver_type === "DRC Re-Assign Approval") {
      if (caseDetails.drc && caseDetails.drc.length >= 3) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Cannot add more DRCs. Maximum limit of 3 DRCs reached." });
      }
      
      if (caseDetails.monitor_months >= 5) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Cannot add DRC when monitor_months are reached to 5." });
      }
    }

    // Assign created_by as delegate_id
    const deligate_id = approvalDoc.created_by;

    // Determine status based on approver_type
    const statusMap = {
      "DRC Re-Assign Approval": "Open assign agent",
      "Case Withdrawal Approval": "Case Withdrawed",
      "Case Abandoned Approval": "Case Abandoned",
      "Case Write-Off Approval": "Pending Write Off",
      "Commission Approval": "Commissioned"
    };

    const newStatus = statusMap[approvalDoc.approver_type] || "Pending";

    // Update approve_status and approved_by
    const result = await TmpForwardedApprover.updateOne(
      {
        approver_reference: { $in: approver_reference },
        approver_type: { $ne: "DRC Assign Approval" }
      },
      {
        $push: {
          approve_status: {
            status: "Approve",
            status_date: currentDate,
            status_edit_by: approved_by,
          },
        }
      },
      { session }
    );

    if (result.modifiedCount === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(304).json({ message: "Approval update failed" });
    }
    
    // should be call to the case_phase API
    // const case_phase = await pythonapi(case_current_status);

    // Update all active DRCs to Inactive if this is a DRC Re-Assign Approval
    if (approvalDoc.approver_type === "DRC Re-Assign Approval" && caseDetails.drc && caseDetails.drc.length > 0) {
      // Update all active DRCs to inactive
      await Case_details.updateOne(
        { case_id: approver_reference },
        { 
          $set: { 
            "drc.$[elem].drc_status": "Inactive",
            "drc.$[elem].removed_by": approved_by,
            "drc.$[elem].removed_dtm": currentDate
          } 
        },
        { 
          arrayFilters: [{ "elem.drc_status": "Active" }],
          session 
        }
      );
    }
      
    // Handle DRC Re-Assign Approval
    let caseUpdateOperation = {
      $push: {
        approve: {
          approved_process: newStatus,
          approved_by: approved_by,
          approved_on: currentDate,
          remark: " ",
          requested_on: approvalDoc.created_on,
          requested_by: approvalDoc.created_by
        },
        case_status: {
          case_status: newStatus,
          status_reason: "Case Approved",
          created_dtm: currentDate,
          created_by: approved_by,
          case_phase: "python" //case_phase,
        }
      },
      $set: {
        case_current_status: newStatus,
      },
    };

    if (approvalDoc.approver_type === "DRC Re-Assign Approval" && approvalDoc.parameters) 
      {
        const drcId = approvalDoc.parameters.get('drc_id');
        const drcName = approvalDoc.parameters.get('drc_name');

        if (drcId && drcName) {
          // Add new DRC object to the drc array
          caseUpdateOperation.$push.drc = {
            order_id: null,
            drc_id: drcId,
            drc_name: drcName,
            created_dtm: currentDate,
            drc_status: "Active",
            status_dtm: null,
            expire_dtm: null,
            case_removal_remark: null,
            removed_by: null,
            removed_dtm: null,
            drc_selection_logic: null,
            case_distribution_batch_id: null,
            recovery_officers: []
          };
        }
        else{
          return res.status(204).json({
            message: "Can not add new DRC to drc array because 'drc_id' or 'drc_name' is missing in approval collection document ",
          });
        }
      }
    else if (approvalDoc.approver_type === "Case Withdrawal Approval")
      {
        // Add new abnormal stop object to the abnormal_stop array
        caseUpdateOperation.$push.abnormal_stop = {
           remark: "Approved Case Withdrawal Approval",                                         
          done_by: approved_by,
          done_on: currentDate,
          action: approver_reference,
          Case_phase: "python" //case_phase,   // case_current_status = Case Withdrawed // approve karata passe phace eka one nam python api ekata mee status eka denna.
        };
      }
    else if (approvalDoc.approver_type === "Case Abandoned Approval")
      {
        // Add new abnormal stop object to the abnormal_stop array
        caseUpdateOperation.$push.abnormal_stop = {
          remark: "Approved Case Abandoned Approval",                                         
          done_by: approved_by,
          done_on: currentDate,
          action: approver_reference,
          Case_phase: "python" //case_phase,   // case_current_status = Case Withdrawed // approve karata passe phace eka one nam python api ekata mee status eka denna.
        };
      }
    else if (approvalDoc.approver_type === "Case Write-Off Approval")
      {
        // Add new abnormal stop object to the abnormal_stop array
        caseUpdateOperation.$push.abnormal_stop = {
           remark: "Approved Case Write-Off Approval",                                         
          done_by: approved_by,
          done_on: currentDate,
          action: approver_reference,
          Case_phase: "python" //case_phase,   // case_current_status = Case Withdrawed // approve karata passe phace eka one nam python api ekata mee status eka denna.
        };
      }
    else{
      return res.status(204).json({
        message: "approver_type is incoerrect one",
      });
    }

    // Update Case_details
    const caseResult = await Case_details.updateOne(
      { case_id: approver_reference },
      caseUpdateOperation,
      { session }
    );

    // --- Create User Interaction Log ---
    const interaction_id = 16;
    const request_type = "Approved DRC Assign Manager Approval";
    const created_by = approved_by;
    const dynamicParams = { approver_reference };

    await createUserInteractionFunction({
      Interaction_ID: interaction_id,
      User_Interaction_Type: request_type,
      delegate_user_id: deligate_id,
      Created_By: created_by,
      User_Interaction_Status: "Open",
      User_Interaction_Status_DTM: currentDate,
      session,
      ...dynamicParams,
    });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Approval added successfully.",
      updatedCount: result.modifiedCount + caseResult.modifiedCount,
    });
  } catch (error) {
    console.error("Error approving DRC Assign Manager Approvals:", error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      message: "Error approving DRC Assign Manager Approvals",
      error: error.message || "Internal server error.",
    });
  } finally {
    if (session) {
      session.endSession();
    }
  }
};


/**
 * Rejects a DRC Assign Manager approval request and updates related case and tracking collections.
 *
 * Request Body:
 * - approver_reference: string (required) – Unique reference to identify the approval document.
 * - approved_by: string (required) – ID of the user performing the rejection.
 *
 * Logic:
 * 1. Starts a MongoDB session and transaction for atomic updates.
 * 2. Validates required input fields.
 * 3. Fetches the approval document using `approver_reference`.
 * 4. Derives the delegate ID from the original `created_by` field.
 * 5. Maps the `approver_type` to an appropriate rejected status via `statusMap`.
 * 6. Updates `TmpForwardedApprover`:
 *    - Pushes a new reject record to `approve_status` array.
 * 7. Updates `Case_details`:
 *    - Adds a rejection entry to both `approve` and `case_status` arrays.
 *    - Sets `case_current_status` accordingly.
 * 8. Logs the rejection using `createUserInteractionFunction`.
 * 9. Commits the transaction and returns success response.
 *
 * Responses:
 * - 200: Rejection processed successfully.
 * - 204: No document found matching the `approver_reference`.
 * - 304: No modifications were made (potential logic error or already rejected).
 * - 400: Missing required parameters.
 * - 500: Server error during transaction.
 */

export const Reject_DRC_Assign_Manager_Approval = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { approver_reference, approved_by } = req.body;

    if (!approver_reference) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid input, approver_reference is required" });
    }

    if (!approved_by) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "approved_by is required" });
    }

    const currentDate = new Date();

    // Fetch only created_on and created_by from the approval document
    const approvalDocFields = await TmpForwardedApprover.findOne(
      { 
        approver_reference: { $in: approver_reference },
        approver_type: { $ne: "DRC Assign Approval" }
      },
      { created_on: 1, created_by: 1 }
    ).session(session);

    if (!approvalDocFields) {
      await session.abortTransaction();
      session.endSession();
      return res.status(204).json({ message: "No matching approver reference found" });
    }

    // Get the last two case status entries (most recent at the end)
    const caseStatusFields = await Case_details.findOne(
      { case_id: approver_reference },
      { case_status: { $slice: -2 } }
    ).session(session);

    if (!caseStatusFields) {
      await session.abortTransaction();
      session.endSession();
      return res.status(204).json({ message: "No matching case found" });
    }

    // Get the previous status (second-to-last element if exists, otherwise null)
    let previousStatus = null;
    if (caseStatusFields.case_status && caseStatusFields.case_status.length > 1) {
      // When we have at least 2 elements, index 0 is the second-to-last
      previousStatus = caseStatusFields.case_status[0].case_status;
    }

    // If we couldn't find a previous status, return an error
    if (previousStatus === null) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Cannot find previous case status" });
    }

    // Assign created_by as delegate_id
    const deligate_id = approvalDocFields.created_by;

    // Update approve_status and approved_by
    const result = await TmpForwardedApprover.updateOne(
      { 
        approver_reference: { $in: approver_reference },
        approver_type: { $ne: "DRC Assign Approval" }
      },
      {
        $push: {
          approve_status: {
            status: "Reject",
            status_date: currentDate,
            status_edit_by: approved_by,
          },
        }
      },
      { session }
    );

    if (result.modifiedCount === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(304).json({ message: "Rejection update failed" });
    }

    // Update approve array in CaseDetails with requested_on and requested_by
    const caseResult = await Case_details.updateOne(
      { case_id: approver_reference },
      {
        $push: {
          approve: {
            approved_process: previousStatus,
            rejected_by: approved_by,
            rejected_on: currentDate,
            approved_on: null,
            remark: "Approval Rejected ",
            requested_on: approvalDocFields.created_on,
            requested_by: approvalDocFields.created_by
          },
          case_status: {
            case_status: previousStatus,
            status_reason: "Approval Rejected",
            created_dtm: currentDate,
            created_by: approved_by,
            case_phase: "Negotiation"
          }
        },
        $set: {
          case_current_status: previousStatus,
        },
      },
      { session }
    );

    // --- Create User Interaction Log ---
    const dynamicParams = { approver_reference };

    await createUserInteractionFunction({
      Interaction_ID: 17,
      User_Interaction_Type: "Rejected DRC Assign Manager Approval",
      delegate_user_id: deligate_id,
      Created_By: approved_by,
      User_Interaction_Status: "Open",
      User_Interaction_Status_DTM: currentDate,
      session,
      ...dynamicParams,
    });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Rejection added successfully.",
      updatedCount: result.modifiedCount + caseResult.modifiedCount,
    });
  } catch (error) {
    console.error("Error rejecting DRC Assign Manager Approvals:", error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      message: "Error rejecting DRC Assign Manager Approvals",
      error: error.message || "Internal server error.",
    });
  } finally {
    if (session) {
      session.endSession();
    }
  }
};


/**
 * Inputs:
 * - approver_references: Array (optional)
 * - date_from: String (optional, ISO Date format)
 * - date_to: String (optional, ISO Date format)
 * - Created_By: String (required)
 * 
 * Success Result:
 * - Returns a success response confirming the task for batch approval was created.
 */
export const Create_task_for_DRC_Assign_Manager_Approval = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {approver_type, date_from, date_to, Created_By, approver_status } = req.body;

    if (!Created_By) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Created_By is required" });
    }

    const parameters = {
      //approver_references, // List of approver references
      date_from,
      date_to,
      approver_status,
      approver_type,
    };
    // --- Create Task ---
    const taskData = {
      Template_Task_Id: 33, // Different Task ID for approval tasks
      task_type: "Create DRC Assign maneger approval List for Downloard",
      ...parameters,
      Created_By, // Assigned creator
      task_status: "open",
    };

    // Call createTaskFunction
    await createTaskFunction(taskData, session);

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "Task for batch approval created successfully.",
      taskData,
    });
  } catch (error) {
    console.error("Error creating batch approval task:", error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      message: "Error creating batch approval task",
      error: error.message || "Internal server error.",
    });
  }
};

/**
 * Inputs:
 * - case_id: number (required)
 * - drc_id: number (required)
 * - remark: String (optional)
 * - assigned_by: String (required)
 * - drc_name: String (required)
 * 
 * Success Result:
 * - Returns a success response after assigning the DRC and logging the approval request.
 */
export const Assign_DRC_To_Case = async (req, res) => {
  
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const { case_id, drc_id, remark, assigned_by, drc_name } = req.body;
    
    if (!case_id|| !drc_id || !assigned_by || !drc_name) {
      await session.abortTransaction();
      return res.status(400).json({
        status: "error",
        message: "case_id and drc_id is required.",
        errors: {
          code: 400,
          description: "case_id and drc_id is required.",
        },
      });
    }
    const drcAssignAproveRecode = {
      approver_reference: case_id,
      created_on: new Date(),
      created_by: assigned_by,
      approve_status:{
        status:"Open",
        status_date:new Date(),
        status_edit_by:assigned_by,
      },
      approver_type:"DRC Re-Assign Approval",
      parameters:{
        drc_id,
        drc_name,
        case_id,
      },
      remark:{
        remark,
        remark_date: new Date(),
        remark_edit_by:assigned_by,
      },
    }
    const TmpForwardedApproverRespons = new TmpForwardedApprover(drcAssignAproveRecode);
    await TmpForwardedApproverRespons.save({ session });
    
    const dynamicParams = {
      case_id,
      drc_id,
      drc_name
    };
    // should be call to the case_phase API
      // const case_phase = await pythonapi(case_status);
      const delegate_id = await getApprovalUserIdService({
          case_phase: "python status",
          approval_type: "DRC Re-Assign Approval"
      });
    const result = await createUserInteractionFunction({
      Interaction_ID:22, 
      User_Interaction_Type:"Pending approval for DRC Re Assign Approval", 
      delegate_user_id:delegate_id,   
      Created_By:assigned_by,
      User_Interaction_Status: "Open",
      ...dynamicParams,
      session 
    });

    if(!result || result.status === "error"){
      await session.abortTransaction();
      res.status(404).json({
        status: "error",
        message: "DRC Reassining send to the Aprover process has a error.",
      }); 
    }
    await session.commitTransaction();

    return res.status(200).json({
      status: "success",
      message: "DRC Reassining send to the Aprover.",
      data: TmpForwardedApproverRespons,
    }); 
  }
  catch (error) {
    console.error("Error in Reassining send to the Aprover : ", error);
    await session.abortTransaction();
    return res.status(500).json({
      status: "error",
      message: "An error occurred while assigning the DRC.",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }
  finally {
    session.endSession();
  }
};

/**
 * Retrieves case distribution summary details along with related transaction and DRC info.
 *
 * Request Body:
 * - case_distribution_batch_id: string (required) – ID of the case distribution batch to filter data.
 * - drc_id: string (optional) – If provided, filters records for the specific DRC.
 *
 * Logic:
 * 1. Validates the presence of `case_distribution_batch_id`. Returns 400 if missing.
 * 2. Builds a MongoDB aggregation pipeline on `caseDistributionDRCSummary`:
 *    - $match: Filters by `case_distribution_batch_id` and optionally `drc_id`.
 *    - $lookup: Joins `Case_distribution_drc_transactions` on `case_distribution_batch_id`.
 *    - $lookup: Joins `Debt_recovery_company` on `drc_id` to enrich with DRC details.
 *    - $unwind: Flattens `transaction_data` and `drc_details` arrays (preserving nulls).
 *    - $project: Selects only the required fields, including joined data with fallbacks.
 * 3. Returns 204 if no records found, 200 with results if found.
 *
 * Responses:
 * - 200: Aggregation completed successfully, results returned.
 * - 204: No matching records found for provided batch ID.
 * - 400: Required input `case_distribution_batch_id` missing.
 * - 500: Server error during aggregation.
 */

export const List_Case_Distribution_Details = async (req, res) => {
  try {
    const { case_distribution_batch_id, drc_id } = req.body;

    if (!case_distribution_batch_id) {
      return res.status(400).json({ message: "Missing required field: case_distribution_batch_id" });
    }

    // Build match stage based on input parameters
    const matchStage = { case_distribution_batch_id };
    if (drc_id) {
      matchStage.drc_id = drc_id;
    }

    // Use aggregation to get all data in one query
    const results = await caseDistributionDRCSummary.aggregate([
      // Stage 1: Match documents based on input criteria
      {
        $match: matchStage
      },
      
      // Stage 2: Lookup transaction data from CaseDistribution collection
      {
        $lookup: {
          from: "Case_distribution_drc_transactions", // Collection name
          localField: "case_distribution_batch_id",
          foreignField: "case_distribution_batch_id",
          as: "transaction_data"
        }
      },
      
      // Stage 3: Lookup DRC details from DRC collection
      {
        $lookup: {
          from: "Debt_recovery_company", // Collection name 
          localField: "drc_id",
          foreignField: "drc_id",
          as: "drc_details"
        }
      },
      
      // Stage 4: Unwind the transaction_data array (converts array to object)
      {
        $unwind: {
          path: "$transaction_data",
          preserveNullAndEmptyArrays: true // Keep documents even if no matching transaction
        }
      },
      
      // Stage 5: Unwind the drc_details array
      {
        $unwind: {
          path: "$drc_details",
          preserveNullAndEmptyArrays: true // Keep documents even if no matching DRC
        }
      },
      
      // Stage 6: Project only the fields we need
      {
        $project: {
          doc_version: 1,
          _id: 1,
          case_distribution_batch_id: 1,
          created_dtm: "$created_dtm",
          drc_id: 1,
          rtom: 1,
          case_count: 1,
          tot_arrease: "$tot_arrease",
          month_1_sc: 1,
          month_2_sc: 1,
          month_3_sc: 1,
          proceed_on: { $ifNull: ["$transaction_data.proceed_on", null] },
          drc_name: { $ifNull: ["$drc_details.drc_name", null] },
        }
      }
    ]);

    if (results.length === 0) {
      return res.status(204).json({ message: "No records found for the given batch ID" });
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching case distribution details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



export const Create_Task_For_case_distribution_drc_summery = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
      const { drc_id, case_distribution_batch_id, Created_By } = req.body;

      if (!drc_id || !Created_By) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ message: "Missing required fields: drc_id, Created_By" });
      }

      const drcDetails = await DRC.findOne({ drc_id }, 'drc_name');
      if (!drcDetails) {
          await session.abortTransaction();
          session.endSession();
          return res.status(204).json({ message: "DRC not found for the given drc_id" });
      }

      const currentDate = new Date();
      const dynamicParams = {
        drc_id,
        drc_name: drcDetails.drc_name, // Include DRC name
        case_distribution_batch_id,
      }
      // --- Create Task ---
      const taskData = {
          Template_Task_Id: 32, // Different Task ID for approval tasks
          task_type: "Create Case Distribution DRC Summary List for Downloard",
          Created_By, // Assigned creator
          task_status: "open",
          ...dynamicParams,
      };

      // Call createTaskFunction
      await createTaskFunction(taskData, session);

      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({
          message: "Task for batch approval created successfully.",
          taskData,
      });
  } catch (error) {
      console.error("Error creating batch approval task:", error);
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({
          message: "Error creating batch approval task",
          error: error.message || "Internal server error.",
      });
  }
};


/**
 * Fetches detailed case distribution summary including RTOM and DRC information for a specific batch and DRC.
 *
 * Request Body:
 * - case_distribution_batch_id: string (required) – The batch ID used to filter the summary.
 * - drc_id: string (required) – The DRC ID used to filter the summary.
 *
 * Logic:
 * 1. Validates presence of both `case_distribution_batch_id` and `drc_id`. Returns 400 if missing.
 * 2. Performs an aggregation on `caseDistributionDRCSummary`:
 *    - $match: Filters records by batch ID and DRC ID.
 *    - $lookup: Joins with `Debt_recovery_company` to get DRC details using `drc_id`.
 *    - $unwind: Flattens `drc_details` array while preserving documents with no match.
 *    - $project: Returns selected fields, including DRC name and RTOM data.
 * 3. If no results found, responds with 204.
 * 4. Returns 200 with result data if found.
 *
 * Responses:
 * - 200: Matching case distribution details returned.
 * - 204: No records found for the given batch ID and DRC ID.
 * - 400: Missing required input parameters.
 * - 500: Internal server error during aggregation.
 */

export const List_Case_Distribution_Details_With_Rtoms = async (req, res) => {
  try {
    const { case_distribution_batch_id, drc_id } = req.body;

    if (!case_distribution_batch_id || !drc_id) {
      return res.status(400).json({ message: "Missing required fields: case_distribution_batch_id, drc_id" });
    }

    // Use aggregation to get all data in one query
    const results = await caseDistributionDRCSummary.aggregate([
      // Stage 1: Match documents based on input criteria
      {
        $match: {
          case_distribution_batch_id,
          drc_id
        }
      },
      
      // Stage 2: Lookup DRC details from DRC collection
      {
        $lookup: {
          from: "Debt_recovery_company", // Collection name for DRC
          localField: "drc_id",
          foreignField: "drc_id",
          as: "drc_details"
        }
      },
      
      // Stage 3: Unwind the drc_details array
      {
        $unwind: {
          path: "$drc_details",
          preserveNullAndEmptyArrays: true // Keep documents even if no matching DRC
        }
      },
      
      // Stage 4: Project the fields we need
      {
        $project: {
          _id: 1,
          case_distribution_batch_id: 1,
          drc_id: 1,
          drc_name: "$drc_details.drc_name",
          rtom: 1,
          case_count: 1,
          tot_arrease: 1,
          month_1_sc: 1,
          month_2_sc: 1,
          month_3_sc: 1,
          created_dtm: 1,
          created_by: 1,
        }
      }
    ]);

    if (results.length === 0) {
      return res.status(204).json({ message: "No records found for the given batch ID and DRC ID" });
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching case distribution details with RTOMs:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



export const Mediation_Board = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const {
      case_id,
      drc_id,
      ro_id,
      next_calling_date,
      request_id,
      request_type,
      request_comment,
      handed_over_non_settlemet,
      intraction_id,
      customer_available,
      comment,
      settle,
      settlement_count,
      initial_amount,
      calendar_month,
      duration_start_date,
      duration_end_date,
      remark,
      fail_reason,
      created_by,
    } = req.body;

    if (!case_id || !drc_id || !customer_available) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        status: "error",
        message: "Missing required fields: case_id, drc_id, customer_available" 
      });
    }
    const mediationBoardData = {
      drc_id, 
      ro_id, 
      created_dtm: new Date(), 
      mediation_board_calling_dtm: next_calling_date,
      customer_available: customer_available, // Optional field (must be 'yes' or 'no' if provided)
      comment: fail_reason === "" ? null : comment, // Optional field (default: null)
      agree_to_settle: settle, // Optional field (no default)
      customer_response: settle === "no" ? fail_reason : null, // Optional field (default: null)
      handed_over_non_settlemet_on: handed_over_non_settlemet === "yes" ? new Date() : null,
      non_settlement_comment: handed_over_non_settlemet === "yes" ? comment : null, // Optional field (default: null)
    };
    if (request_id !=="") {
      if (!request_id || !request_type || !intraction_id) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ 
          status: "error",
          message: "Missing required fields: request_id, request_type, intraction_id" 
        });
      }
      let case_status_with_request =  "MB Negotiaion";
      const statusMap = {
        "Mediation Board Settlement plan Request": "MB Negotiaion",
        "Mediation Board period extend Request": "MB Negotiaion",
        "Mediation Board customer further information request": "MB Negotiaion",
        "Mediation Board Customer request service": "MB Negotiaion",
      };
      case_status_with_request = statusMap[request_type] || "MB Negotiaion";

      const dynamicParams = {
        case_id,
        drc_id,
        ro_id,
        request_id,
        request_type,
      };

      const result = await createUserInteractionFunction({
        Interaction_ID:intraction_id,
        User_Interaction_Type:request_type,
        delegate_user_id:1,   // should be change this 
        Created_By:created_by,
        User_Interaction_Status: "Open",
        ...dynamicParams
      });

      if (!result || !result.Interaction_Log_ID) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ 
          status: "error", 
          message: "Failed to create user interaction" 
        });
      }
      const intraction_log_id = result.Interaction_Log_ID;
      const updatedCase = await Case_details.findOneAndUpdate(
        {case_id}, 
        { 
            $push: { 
                mediation_board: mediationBoardData,
                ro_requests: {
                    drc_id,
                    ro_id,
                    created_dtm: new Date(),
                    ro_request_id: request_id,
                    ro_request: request_type,
                    request_remark:request_comment,
                    intraction_id: intraction_id,
                    intraction_log_id,
                },
                case_status: {
                  case_status: case_status_with_request,
                  created_dtm: new Date(),
                  created_by: created_by,
                }
            },
            $set: {
                  case_current_status: case_status_with_request,
            }
        },
        { new: true, session } // Correct placement of options
      );
      if (!updatedCase) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ 
          status: "error",
          message: 'Case not found this case id' 
        });
      }
    }
    else{
      const updatedMediationBoardCase = await Case_details.findOneAndUpdate(
        { case_id: case_id }, 
        {
          $push: {
            mediation_board: mediationBoardData,
            ...(handed_over_non_settlemet === "yes" && {
              case_status: {
                case_status: "MB Fail with Pending Non-Settlement",
                created_dtm: new Date(),
                created_by: created_by,
              },
            }),
          },
          ...(handed_over_non_settlemet === "yes" && {
            $set: {
              case_current_status: "MB Fail with Pending Non-Settlement",
            },
          }),
        },
        { new: true, session }
      );
      if (!updatedMediationBoardCase) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ 
          success: false, 
          message: 'Case not found for this case id' 
        });
      }
    }
    if(settle === "yes"){
      if(!settlement_count || !initial_amount || !calendar_month || !duration_start_date || !duration_end_date){
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ 
          status: "error",
          message: "Missing required fields: settlement count, initial amount, calendar months, duration" 
        });
      };
      // call settlement APi
      console.log("call settlement APi");
    };
    await session.commitTransaction();
    session.endSession();
    return res.status(200).json({ 
      status: "success", 
      message: "Operation completed successfully" 
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ 
      status:"error",
      message: "Server error", 
      error: error.message 
    }); 
 }
}

/**
 * Inputs:
 * - drc_id: Number (required)
 * - case_id: Number (optional)
 * - account_no: String (optional)
 * - from_date: String (optional, ISO Date format)
 * - to_date: String (optional, ISO Date format)
 * 
 * Success Result:
 * - Returns a success response with the list of case details owned by the specified DRC, filtered by the provided criteria.
 */
// export const List_CasesOwened_By_DRC = async (req, res) => {
//   let { drc_id, account_no, from_date, to_date,case_id } = req.body;

//   if (!drc_id) {
//     return res.status(400).json({
//       status: "error",
//       message: "DRC ID is required",
//     });
//   }
//   if (!case_id && !account_no && !from_date && !to_date) {
//     return res.status(400).json({
//       status: "error",
//       message: "Failed to retrieve case details.",
//       errors: {
//         code: 400,
//         description:
//           "At least one of case_id, from_date, to_date, or account_no is required.",
//       },
//     });
//   }
//   const invalidstatus = [
//     "Withdraw",
//     "Forward to WRIT",
//     "WRIT",
//     "Forward to Re-WRIT",
//     "Re-WRIT",
//     "WRIT Settle Pending",
//     "WRIT Settle Open-Pending",
//     "WRIT Settle Active",
//     "Re-WRIT Settle Pending",
//     "Re-WRIT Settle Open-Pending",
//     "Re-WRIT Settle Active",
//     "LOD Monitoring Expire",
//     "Forward LOD Dispute",
//     "Dispute Settle Pending",
//     "Dispute Settle Open-Pending",
//     "Dispute Settle Active",
//     "Initial Litigation",
//     "Pending FTL",
//     "Forward To Litigation",
//     "Fail from Legal Unit",
//     "Fail Legal Action",
//     "Litigation",
//     "Litigation Settle Pending",
//     "Litigation Settle Open-Pending",
//     "Litigation Settle Active",
//     "Pending FTL LOD",
//     "Initial FTL LOD",
//     "FTL LOD Settle Pending",
//     "FTL LOD Settle Open-Pending",
//     "FTL LOD Settle Active",
//     "LIT Prescribed",
//     "Final Reminder",
//     "Initial LOD",
//     "LOD Settle Pending",
//     "LOD Settle Open-Pending",
//     "LOD Settle Active",
//     "Final Reminder Settle Pending",
//     "Final Reminder Settle Open-Pending",
//     "Final Reminder Settle Active",
//     "LOD Monitoring Expire",
//     "Pending Abandoned",
//     "Abandoned",
//     "Pending Withdraw",
//     "Case Close",
//     "Pending Write-Off",
//     "Write-Off",
//     "MB Fail with Non-Settlement",
//   ];
//   try {
//     let query = {
//       "drc.removed_dtm": null,
//       case_current_status: {
//         $nin: invalidstatus
//       }
//     };
//     if (from_date && to_date) {
//           query.$and.push({ "drc.created_dtm": { $gt: new Date(from_date) } });
//           query.$and.push({ "drc.created_dtm": { $lt: new Date(to_date) } });
//     }
//     if (drc_id) query["drc.drc_id"] = Number(drc_id);
//     if (case_id) query["case_id"] = Number(case_id);
//     if (account_no) query["account_no"] = String(account_no);

//     const caseDetails = await Case_details.find(query, {
//       case_id: 1,
//       case_current_status: 1,
//       account_no: 1,
//       current_arrears_amount: 1,
//       created_dtm: 1,
//       end_dtm: 1,
//       case_status: 1,
//       _id: 0,
//     }).lean();

//     if (!caseDetails || caseDetails.length === 0) {
//       return res.status(204).json({
//         status: "error",
//         message: "No Case Details Found.",
//         errors: {
//           code: 200,
//           description: "No data available for the provided parameters.",
//         },
//       });
//     }
//     res.status(200).json({
//       status: "success",
//       message: "Case details retrieved successfully.",
//       Cases: caseDetails,
//     });
//   } catch (error) {
//     // console.error("Error fetching case details:", error);
//     res.status(500).json({
//       status: "error",
//       message: "Error Fetching Case Details.",
//       errors: { code: 500, description: error.message },
//     });
//   }
// };

// After Revamp

// export const List_CasesOwened_By_DRC = async (req, res) => {
//   let { drc_id, case_id, account_no, from_date, to_date } = req.body;

//     if (!drc_id && !case_id && !account_no && !from_date && !to_date) {
//     return res.status(400).json({
//       status: "error",
//       message: "Failed to retrieve case details.",
//       errors: {
//         code: 400,
//         description:
//           "At least one of drc_id, case_id, or account_no is required.",
//       },
//     });
//   }
  
//   try {
//     // List of invalid statuses
//     const invalidStatuses = [
//       "Withdraw", "Forward to WRIT", "WRIT", "Forward to Re-WRIT", "Re-WRIT",
//       "WRIT Settle Pending", "WRIT Settle Open-Pending", "WRIT Settle Active",
//       "Re-WRIT Settle Pending", "Re-WRIT Settle Open-Pending", "Re-WRIT Settle Active",
//       "LOD Monitoring Expire", "Forward LOD Dispute", "Dispute Settle Pending",
//       "Dispute Settle Open-Pending", "Dispute Settle Active", "Initial Litigation",
//       "Pending FTL", "Forward To Litigation", "Fail from Legal Unit", "Fail Legal Action",
//       "Litigation", "Litigation Settle Pending", "Litigation Settle Open-Pending",
//       "Litigation Settle Active", "Pending FTL LOD", "Initial FTL LOD",
//       "FTL LOD Settle Pending", "FTL LOD Settle Open-Pending", "FTL LOD Settle Active",
//       "LIT Prescribed", "Final Reminder", "Initial LOD", "LOD Settle Pending",
//       "LOD Settle Open-Pending", "LOD Settle Active", "Final Reminder Settle Pending",
//       "Final Reminder Settle Open-Pending", "Final Reminder Settle Active",
//       "LOD Monitoring Expire", "Pending Abandoned", "Abandoned", "Pending Withdraw",
//       "Case Close", "Pending Write-Off", "Write-Off", "MB Fail with Non-Settlement"
//     ];

//     // Build the query
//     let query = {
//       "drc.removed_dtm": null,
//       "drc.drc_status" : "Active",
//       "drc.drc_id": Number(drc_id),
//       case_current_status: { $nin: invalidStatuses }
//     };

//     if (case_id) query["case_id"] = Number(case_id);
//     if (account_no) query["account_no"] = String(account_no);

//     // Add date range filtering if both dates are provided
//     if (from_date && to_date) {
//       query.created_dtm = {
//         $gte: new Date(from_date),
//         $lte: new Date(to_date)
//       };
//     }

//     const caseDetails = await Case_details.find(query, {
//       case_id: 1,
//       case_current_status: 1,
//       account_no: 1,
//       current_arrears_amount: 1,
//       created_dtm: 1,
//       end_dtm: 1,
//       case_current_status: 1,
//       // case_status: 1,
//       _id: 0,
//     }).lean();

//     if (!caseDetails || caseDetails.length === 0) {
//       return res.status(204).json({
//         status: "success",
//         message: "No Case Details Found.",
//         data: []
//       });
//     }

//     // // Process end_dtm for specific statuses
//     // const expireStatuses = ["Abandoned", "Withdraw", "Case Close", "Pending Write-Off", "Write-Off"];
    
//     // const processedCaseDetails = caseDetails.map(detail => {
//     //   // Set end_dtm based on last case status if it's in expireStatuses
//     //   if (Array.isArray(detail.case_status) && detail.case_status.length > 0) {
//     //     const lastStatus = detail.case_status.at(-1);
//     //     if (lastStatus && expireStatuses.includes(lastStatus.case_status)) {
//     //       detail.end_dtm = lastStatus.created_dtm;
//     //     }
//     //   }
      
//     //   // Ensure end_dtm is never null/undefined in response
//     //   return {
//     //     ...detail,
//     //     end_dtm: detail.end_dtm || " "
//     //   };
//     // });

//     res.status(200).json({
//       status: "success",
//       message: "Case details retrieved successfully.",
//       Cases: caseDetails,
//     });
//   } catch (error) {
//     console.error("Error fetching case details:", error);
//     res.status(500).json({
//       status: "error",
//       message: "Error Fetching Case Details.",
//       errors: { code: 500, description: error.message },
//     });
//   }
// };


// After fix the error

export const List_CasesOwened_By_DRC = async (req, res) => {
  let { drc_id, case_id, account_no, from_date, to_date } = req.body;

  if (!drc_id && !case_id && !account_no && !from_date && !to_date) {
    return res.status(400).json({
      status: "error",
      message: "Failed to retrieve case details.",
      errors: {
        code: 400,
        description:
          "At least one of drc_id, case_id, or account_no is required.",
      },
    });
  }
  
  try {
    // List of invalid statuses
    const invalidStatuses = [
      "Withdraw", "Forward to WRIT", "WRIT", "Forward to Re-WRIT", "Re-WRIT",
      "WRIT Settle Pending", "WRIT Settle Open-Pending", "WRIT Settle Active",
      "Re-WRIT Settle Pending", "Re-WRIT Settle Open-Pending", "Re-WRIT Settle Active",
      "LOD Monitoring Expire", "Forward LOD Dispute", "Dispute Settle Pending",
      "Dispute Settle Open-Pending", "Dispute Settle Active", "Initial Litigation",
      "Pending FTL", "Forward To Litigation", "Fail from Legal Unit", "Fail Legal Action",
      "Litigation", "Litigation Settle Pending", "Litigation Settle Open-Pending",
      "Litigation Settle Active", "Pending FTL LOD", "Initial FTL LOD",
      "FTL LOD Settle Pending", "FTL LOD Settle Open-Pending", "FTL LOD Settle Active",
      "LIT Prescribed", "Final Reminder", "Initial LOD", "LOD Settle Pending",
      "LOD Settle Open-Pending", "LOD Settle Active", "Final Reminder Settle Pending",
      "Final Reminder Settle Open-Pending", "Final Reminder Settle Active",
      "LOD Monitoring Expire", "Pending Abandoned", "Abandoned", "Pending Withdraw",
      "Case Close", "Pending Write-Off", "Write-Off", "MB Fail with Non-Settlement"
    ];

    // Build the query
    let query = {
      "drc.removed_dtm": null,
      "drc.drc_status": "Active",
      case_current_status: { $nin: invalidStatuses }
    };

    if (drc_id) query["drc.drc_id"] = Number(drc_id);
    if (case_id) query["case_id"] = Number(case_id);
    if (account_no) query["account_no"] = String(account_no);

    // Add date range filtering if both dates are provided
    if (from_date && to_date) {
      query.created_dtm = {
        $gte: new Date(from_date),
        $lte: new Date(to_date)
      };
    }

    const caseDetails = await Case_details.find(query, {
      case_id: 1,
      case_current_status: 1,
      account_no: 1,
      current_arrears_amount: 1,
      created_dtm: 1,
      end_dtm: 1,
      drc: 1, // Include the drc array
      _id: 0,
    }).lean();

    if (!caseDetails || caseDetails.length === 0) {
      return res.status(204).json({
        status: "success",
        message: "No Case Details Found.",
        data: []
      });
    }
    
    // Process the results to include only the relevant DRC object
    const processedCaseDetails = caseDetails.map(detail => {
      // Find the specific DRC that matches the drc_id if provided
      let selectedDrc = null;
      if (drc_id && Array.isArray(detail.drc)) {
        selectedDrc = detail.drc.find(d => d.drc_id === Number(drc_id) && d.drc_status === "Active" && !d.removed_dtm);
      } else if (Array.isArray(detail.drc)) {
        // If no drc_id provided, get the first active DRC
        selectedDrc = detail.drc.find(d => d.drc_status === "Active" && !d.removed_dtm);
      }
      
      // Return case details with only the selected DRC
      return {
        case_id: detail.case_id,
        case_current_status: detail.case_current_status,
        account_no: detail.account_no,
        current_arrears_amount: detail.current_arrears_amount,
        created_dtm: selectedDrc.created_dtm,
        end_dtm: selectedDrc.end_dtm || "",
        drc: selectedDrc || null
      };
    });
    
    res.status(200).json({
      status: "success",
      message: "Case details retrieved successfully.",
      Cases: processedCaseDetails,
    });
  } catch (error) {
    console.error("Error fetching case details:", error);
    res.status(500).json({
      status: "error",
      message: "Error Fetching Case Details.",
      errors: { code: 500, description: error.message },
    });
  }
};



/**
 * Inputs:
 * - drc_id: number (required)
 * - ro_id: number (optional)
 * - rtom: String (optional)
 * - action_type: String (optional)
 * - from_date: String (optional, ISO Date format)
 * - to_date: String (optional, ISO Date format)
 * 
 * Success Result:
 * - Returns a success response with the list of DRC cases matching the provided filters.
 */
export const listDRCAllCases = async (req, res) => {
  const { drc_id, status, ro_id, rtom, action_type, from_date, to_date } = req.body;

  try {
    // Validate input parameters
    if (!drc_id) {
      return res.status(400).json({
        status: "error",
        message: "Failed to retrieve Case details.",
        errors: {
          code: 400,
          description: "DRC ID is required.",
        },
      });
    }

    if (!rtom && !status && !ro_id && !action_type && !(from_date && to_date)) {
      return res.status(400).json({
        status: "error",
        message: "At least one filtering parameter is required.",
        errors: {
          code: 400,
          description: "Provide at least one of rtom, ro_id, action_type, case_current_status, or both from_date and to_date together.",
        },
      });
    }

    let query = {
                  "last_drc.drc_id": drc_id,
                  "last_drc.removed_dtm": null,
                  case_current_status: {
                    $in: [
                      "RO Negotiation",
                      "Negotiation Settle Pending",
                      "Negotiation Settle Open-Pending",
                      "Negotiation Settle Active",
                      "RO Negotiation Extension Pending",
                      "RO Negotiation Extended",
                      "RO Negotiation FMB Pending",
                    ],
                  },
                };

    // Add optional filters dynamically
    if (rtom) query.area = rtom;
    if (ro_id) query["last_recovery_officer.ro_id"] = ro_id;
    if (action_type) query.action_type = action_type;
    if(status) query.case_current_status = status;
    if (from_date && to_date) {
      query["last_drc.created_dtm"] = {
        $gte: new Date(from_date),
        $lte: new Date(to_date),
      };
    }

    // Fetch cases based on the query
   const cases = await Case_details.aggregate([
      {
        $addFields: {
          last_drc: { $arrayElemAt: ["$drc", -1] },
          last_contact: { $arrayElemAt: ["$current_contact", -1] },
          last_recovery_officer: {
            $arrayElemAt: ["$last_drc.recovery_officers", -1],
          },
        },
      },
      {
        $lookup: {
          from: "Recovery_officer", // use your actual collection name here
          localField: "last_recovery_officer.ro_id",
          foreignField: "ro_id",
          as: "ro_info",
        },
      },
      {
        $match: query,
      },
      {
        $sort: {
          "last_drc.created_dtm": -1, 
        },
      },
      {
        $project: {
          case_id: 1,
          status: "$case_current_status",
          created_dtm:"$last_drc.created_dtm",
          contact_no:"$last_contact.contact_no",
          area:1,
          action_type: 1,
          ro_name:{ $arrayElemAt: ["$ro_info.ro_name", 0] },
        },
      },
    ]);

    // Handle case where no matching cases are found
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

    return res.status(200).json({
      status: "success",
      message: "Cases retrieved successfully.",
      data: cases,
    });
  } catch (error) {
    console.error("Error fetching cases:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve cases.",
      errors: error.message,
    });
  }
};

// Description: Get details of all Mediation Board Phase Cases assigned to a specific DRC with optional filters
// Table: Case_details
// Inputs:
//    drc_id: Required
//    ro_id: Optional
//    rtom: Optional
//    case_current_status: Optional
//    action_type: Optional
//    from_date: Optional
//    to_date: Optional
// Outputs:
//    case_id: caseData.case_id,
//    customer_name
//    status
//    created_dtm
//    ro_name
//    area
//    mediation_board_count
//    next_calling_date
//    current_contact
//    account_no
//API ID: C-1P80
export const List_All_Mediation_Board_Cases_By_DRC_ID_or_RO_ID_Ext_01 = async (req, res) => {
  const { drc_id, ro_id, rtom, case_current_status, action_type, from_date, to_date } = req.body;

  try {
    // Validate input parameters
    if (!drc_id) {
      return res.status(400).json({
        status: "error",
        message: "Failed to retrieve Case details.",
        errors: {
          code: 400,
          description: "DRC ID is required.",
        },
      });
    }

    if (!rtom && !ro_id && !action_type && !case_current_status && !(from_date && to_date)) {
      return res.status(400).json({
        status: "error",
        message: "At least one filtering parameter is required.",
        errors: {
          code: 400,
          description: "Provide at least one of rtom, ro_id, action_type, case_current_status, or both from_date and to_date together.",
        },
      });
    }

    // Build query dynamically
    let query = {
      $and: [
        { "drc.drc_id": drc_id },
        {
          case_current_status: {
            $in: [
              "Forward to Mediation Board",
              "MB Negotiation",
              "MB Request Customer-Info",
              "MB Handover Customer-Info",
              "MB Settle Pending",
              "MB Settle Open-Pending",
              "MB Settle Active",
              "MB Fail with Pending Non-Settlement",
            ],
          },
        },
      ],
    };

    // Add optional filters dynamically
    if (rtom) query.$and.push({ area: rtom });
    if (ro_id) {
      query.$and.push({
        $expr: {
          $eq: [
            ro_id,
            { $arrayElemAt: [ { $arrayElemAt: ["$drc.recovery_officers.ro_id", -1] }, -1, ], },
          ],
        },
      });
    };    
    if (action_type) query.$and.push({ action_type });
    if (case_current_status) query.$and.push({ case_current_status });
    if (from_date && to_date) {
      query.$and.push({ "drc.created_dtm": { $gt: new Date(from_date) } });
      query.$and.push({ "drc.created_dtm": { $lt: new Date(to_date) } });
    }

    // Fetch cases based on the query
    const cases = await Case_details.find(query);

    // Handle case where no matching cases are found
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

    // Format cases based on drc_id or ro_id
    const formattedCases = await Promise.all(
      cases.map(async (caseData) => {
        const findDRC = Array.isArray(caseData.drc) ? caseData.drc.find((drc) => drc.drc_id === drc_id) : null;

        const lastRO = findDRC?.recovery_officers?.[findDRC.recovery_officers.length - 1] || null;

        const matchingRecoveryOfficer = await RecoveryOfficer.findOne({ ro_id: lastRO?.ro_id });

        const mediationBoardCount = caseData.mediation_board?.length || 0;

        return {
          case_id: caseData.case_id,
          customer_name: caseData.customer_name|| null,
          status: caseData.case_current_status,
          created_dtm: findDRC?.created_dtm || null,
          ro_name: matchingRecoveryOfficer?.ro_name || null,
          area: caseData.area,
          mediation_board_count: mediationBoardCount,
          next_calling_date: caseData.mediation_board?.[mediationBoardCount - 1]?.mediation_board_calling_dtm || null,
          current_contact:caseData.current_contact || null,
          account_no: caseData.account_no || null
        };
      })
    );

  // Return response
  return res.status(200).json({
    status: "success",
    message: "Cases retrieved successfully.",
    data: formattedCases.filter(Boolean), // Filter out null/undefined values
  });

  } catch (error) {
    console.error("Error in function:", error); // Log the full error for debugging
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

// Description: Get details of all Negotiation Phase Cases assigned to a specific DRC with optional filters
// Table: Case_details
// Inputs:
//    drc_id: Required
//    ro_id: Optional
//    rtom: Optional
//    action_type: Optional
//    from_date: Optional
//    to_date: Optional
// Outputs:
//    case_id
//    account_no
//    customer_name
//    status
//    created_dtm
//    ro_name
//    contact_no
//    area
//    action_type
//API ID: C-1P72
export const List_All_DRC_Negotiation_Cases_ext_1 = async (req, res) => {
  const { drc_id, ro_id, rtom, action_type, from_date, to_date } = req.body;
  try {
    // Validate input parameters
    if (!drc_id) {
      return res.status(400).json({
        status: "error",
        message: "Failed to retrieve Case details.",
        errors: {
          code: 400,
          description: "DRC ID is required.",
        },
      });
    }

    if (!rtom && !ro_id && !action_type && !(from_date && to_date)) {
      return res.status(400).json({
        status: "error",
        message: "At least one filtering parameter is required.",
        errors: {
          code: 400,
          description: "Provide at least one of rtom, ro_id, action_type, case_current_status, or both from_date and to_date together.",
        },
      });
    }

    // Define the query with the required filters
    let query = {
      $and: [
        { "drc.drc_id": drc_id },
        {
          case_current_status: {
            $in: [
              "RO Negotiation",
              "Negotiation Settle Pending",
              "Negotiation Settle Open-Pending",
              "Negotiation Settle Active",
              "RO Negotiation Extension Pending",
              "RO Negotiation Extended",
              "RO Negotiation FMB Pending",
            ],
          },
        },
      ],
    };

    // Add optional filters dynamically
    if (rtom) query.$and.push({ area: rtom });
    if (ro_id) query.$and.push({ "drc.recovery_officers.ro_id": ro_id });
    if (action_type) query.$and.push({ action_type });
    if (from_date && to_date) {
      query.$and.push({ "drc.created_dtm": { $gt: new Date(from_date) } });
      query.$and.push({ "drc.created_dtm": { $lt: new Date(to_date) } });
    }

    // Fetch cases based on the query
    const cases = await Case_details.find(query);

    // Handle case where no matching cases are found
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

    // Return the retrieved cases
    const formattedCases = await Promise.all(
      cases.map(async (caseData) => {
        const findDRC = Array.isArray(caseData.drc) ? caseData.drc.find((drc) => drc.drc_id === drc_id) : null;

        const lastRO = findDRC?.recovery_officers?.[findDRC.recovery_officers.length - 1] || null;

        const matchingRecoveryOfficer = await RecoveryOfficer.findOne({ ro_id: lastRO?.ro_id });

        // const matchingIncident = await Incident.findOne({ incident_id: caseData.incident_id });

        return {
          case_id: caseData.case_id,
          account_no: caseData.account_no,
          customer_name: caseData.customer_name || null,
          status: caseData.case_current_status,
          created_dtm: findDRC?.created_dtm || null,
          ro_name: matchingRecoveryOfficer?.ro_name || null,
          contact_no: caseData.current_contact?.[caseData.current_contact.length - 1]?.contact_no || null,
          area: caseData.area,
          action_type: caseData.action_type,
        };
      })
    );

    return res.status(200).json({
      status: "success",
      message: "Cases retrieved successfully.",
      data: formattedCases,
    });
  } catch (error) {
    console.error("Error fetching cases:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve cases.",
      errors: error.message,
    });
  }
};

// Description: Count all Negotiation Phase Cases
// Table: Case_details
// Inputs:
//    drc_id: Required
//    ro_id: Required
// Outputs:
//    count
//API ID: C-1P82
export const Count_Negotiation_Phase_Cases = async (req, res) => {
  const { drc_id, ro_id } = req.body;
  try {
    if (!drc_id || !ro_id) {
      return res.status(400).json({
        status: "error",
        message: "Failed to retrieve Case details.",
        errors: {
          code: 400,
          description: "DRC ID and RO ID is required.",
        },
      });
    }

    // Query the database to count cases with the specified statuses
    const caseCount = await Case_details.countDocuments({
      "drc.drc_id": drc_id,
      "drc.recovery_officers.ro_id": ro_id,
      case_current_status: { $in: [
        "RO Negotiation",
        "Negotiation Settle Pending",
        "Negotiation Settle Open-Pending",
        "Negotiation Settle Active",
        "RO Negotiation Extension Pending",
        "RO Negotiation Extended",
        "RO Negotiation FMB Pending",
      ]},
    });

    return res.status(200).json({
      status: "success",
      message: "Case count retrieved successfully.",
      data: { count: caseCount },
    });


  } catch (error) {
    console.error("Error fetching cases:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to count cases.",
      errors: error.message,
    });
  }
};

// Description: Count all Mediation Board Phase Cases
// Table: Case_details
// Inputs:
//    drc_id: Required
//    ro_id: Required
// Outputs:
//    count
//API ID: C-1P81
export const Count_Mediation_Board_Phase_Cases = async (req, res) => {
  const { drc_id, ro_id } = req.body;
  try {
    if (!drc_id || !ro_id) {
      return res.status(400).json({
        status: "error",
        message: "Failed to retrieve Case details.",
        errors: {
          code: 400,
          description: "DRC ID and RO ID is required.",
        },
      });
    }

    // Query the database to count cases with the specified statuses
    const caseCount = await Case_details.countDocuments({
      "drc.drc_id": drc_id,
      "drc.recovery_officers.ro_id": ro_id,
      case_current_status: { $in: [
        "Forward to Mediation Board",
        "MB Negotiation",
        "MB Request Customer-Info",
        "MB Handover Customer-Info",
        "MB Settle Pending",
        "MB Settle Open-Pending",
        "MB Settle Active",
        "MB Fail with Pending Non-Settlement",
      ]},
    });

    return res.status(200).json({
      status: "success",
      message: "Case count retrieved successfully.",
      data: { count: caseCount },
    });


  } catch (error) {
    console.error("Error fetching cases:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to count cases.",
      errors: error.message,
    });
  }
};

/**
 * Inputs:
 * - case_id: number (required)
 * - drc_id: number (required)
 * 
 * Success Result:
 * - Returns a success response with the case details and the calling_round count (number of mediation board entries).
 */
export const CaseDetailsforDRC = async (req, res) => {
  try {
    const { case_id, drc_id } = req.body;
    if (!case_id || !drc_id) {
      return res.status(400).json({
        status: "error",
        message: "Both Case ID and DRC ID are required.",
        errors: {
          code: 400,
          description: "Please provide both case_id and drc_id in the request body.",
        },
      });
    }

    // Find the case that matches both case_id and has the specified drc_id in its drc array
    const caseDetails = await Case_details.findOne({
      case_id
    },
    { case_id: 1, 
      case_current_status: 1, 
      ro_cpe_collect:1, 
      customer_ref: 1, 
      account_no: 1, 
      current_arrears_amount: 1, 
      current_contact: 1, 
      rtom: 1,
      ref_products:1,
      last_payment_date: 1,
      drc: 1, 
      ro_negotiation:1,
      settlement:1, 
      mediation_board:1,
      money_transactions:1, 
      ro_requests: 1,
      mediation_board: 1,
    }
    ).lean();  // Using lean() for better performance

    const mediationBoardCount = caseDetails.mediation_board?.length || 0;

    return res.status(200).json({
      status: "success",
      message: "Case details retrieved successfully.",
      data: {
        ...caseDetails,  // All fields from the case details
        calling_round: mediationBoardCount, // Include the count in the response
      },
    });

  } catch (error) {
    console.error("Error fetching cases:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Failed to retrieve cases.",
      errors: error.message,
    });
  }
};

export const ListActiveMediationResponse = async (req, res) => {
  try {
    // Fetch only negotiations where end_dtm is null
    const activeMediation = await Template_Mediation_Board.find({ end_dtm: null });

    // Check if any active negotiations are found
    if (activeMediation.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No active Mediation response found.",
      });
    }

    // Return the retrieved active negotiations
    return res.status(200).json({
      status: "success",
      message: "Active mediation details retrieved successfully.",
      data: activeMediation,
    });
  } catch (error) {
    console.error("Unexpected error:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Internal server error occurred while fetching active negotiation details.",
      error: error.message,
    });
  }
};
/**
 * Inputs:
 * - drc_id: number (optional)
 * - case_id: number (optional)
 * - account_no: String (optional)
 * - from_date: String (required, ISO Date format)
 * - to_date: String (required, ISO Date format)
 * - Created_By: String (required)
 * 
 * Success Result:
 * - Returns a success response with the created task details for downloading the assigned DRC case list.
 */
export const Create_Task_For_Assigned_drc_case_list_download = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { drc_id, case_id, account_no, from_date, to_date, Created_By } = req.body;

    if (!Created_By || !from_date ||!to_date ||!drc_id) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: "error",
        message: "Created By, drc id, from date and to date are required parameter.",
      });
    }

    // Flatten the parameters structure
    const parameters = {
      drc_id,
      case_id,
      account_no,
      from_date: from_date && !isNaN(new Date(from_date)) ? new Date(from_date).toISOString() : null,
      to_date: to_date && !isNaN(new Date(to_date)) ? new Date(to_date).toISOString() : null,
    };

    // Pass parameters directly (without nesting it inside another object)
    const taskData = {
      Template_Task_Id: 35,
      task_type: "Create task for download the Assigned DRC's case list when selected date range is higher than one month",
      ...parameters, // Spreads parameters directly into taskData
      Created_By,
      task_status: "open"
    };

    // Call createTaskFunction
    await createTaskFunction(taskData, session);

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      status: "success",
      message: "Task created successfully.",
      data: taskData,
    });
  } catch (error) {
    console.error("Error in Create_Task_For_Assigned_drc_case_list_download:", error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error.",
      errors: {
        exception: error.message,
      },
    });
  }
};

/**
 * Inputs:
 * - drc_id: number (required)
 * - ro_id: number (required)
 * - case_id: number (required)
 * - customer_identification: String (required)
 * - contact_no: String (required)
 * - email: String (required)
 * - customer_identification_type: String (required)
 * - contact_type: String (required)
 * - address: String (required)
 * - remark: String (optional)
 * 
 * Success Result:
 * - Returns the updated case object with the new contact details added to the database.
 */
export const updateDrcCaseDetails = async (req, res) => {
  // Extract fields from the request body
  const { drc_id, ro_id, case_id, customer_identification, contact_no, email, customer_identification_type, contact_type , address, remark } = req.body;
  
  try {
    // Validate input parameters
    if (!case_id && !drc_id) {
      return res.status(400).json({
        status: "error",
        message: "Failed to retrieve Case details.",
        errors: {
          code: 400,
          description: "Case ID and DRC ID is required.",
        },
      });
    }

    // Fetch case details from the database
    const caseDetails = await Case_details.findOne({case_id},{ ro_edited_customer_details: 1, _id: 0 });
    // Handle case where no matching cases are found
    if (!caseDetails || caseDetails.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No matching cases found for the given criteria.",
        errors: {
          code: 404,
          description: "No cases satisfy the provided criteria.",
        },
      });
    }

    // Check for duplicate mobile in ro_edited_customer_details array
    const isDuplicateMobile = caseDetails.ro_edited_customer_details.some(
      (contact) => contact.contact_no === contact_no
    );
    
    if (isDuplicateMobile) {
      return res.status(400).json({ error: "Duplicate data detected: Mobile already exists" });
    }

    // Check for duplicate email in ro_edited_customer_details array
    const isDuplicateEmail = caseDetails.ro_edited_customer_details.some(
      (contact) => contact.email === email
    );
    
    if (isDuplicateEmail) {
      return res.status(400).json({ error: "Duplicate data detected: Email already exists" });
    }

    // Check for duplicate nic in ro_edited_customer_details array
    const isDuplicateCustomerIdentification = caseDetails.ro_edited_customer_details.some(
      (contact) => contact.customer_identification === customer_identification
    );
    
    if (isDuplicateCustomerIdentification) {
      return res.status(400).json({ error: "Duplicate data detected: NIC already exists" });
    }

    // Check for duplicate address in ro_edited_customer_details array
    const isDuplicateAddress = caseDetails.ro_edited_customer_details.some(
      (contact) => contact.address === address
    );
    
    if (isDuplicateAddress) {
      return res.status(400).json({ error: "Duplicate data detected: address already exists" });
    }
    
    // Schema for edited contact details
    const editedcontactsSchema = {
      ro_id: ro_id,
      drc_id: drc_id,
      edited_dtm: new Date(),
      email: email,
      customer_identification: customer_identification,
      customer_identification_type: customer_identification_type,
      contact_no: contact_no,
      contact_type: contact_type,
      address: address,
      geo_location: null,
      remark: remark,
    };
    // Schema for current contact details
    const contactsSchema ={
      email: email,
      customer_identification: customer_identification,
      customer_identification_type: customer_identification_type,
      contact_no: contact_no,
      contact_type: contact_type,
      address: address,
      geo_location: null,
    };

    // Prepare update data
    const updateData = {};
    // Add edited contact details to the update data
    if (editedcontactsSchema) {
      updateData.$push = updateData.$push || {};
      updateData.$push.ro_edited_customer_details = { $each: [editedcontactsSchema] };
    }

    // Update remark array
    if (contactsSchema) {
      updateData.$set = updateData.$set || {};
      updateData.$set.current_contact = [contactsSchema];
    }

    // Perform the update in the database
    const updatedCase = await Case_details.findOneAndUpdate(
      { case_id }, // Match the document by case_id
      updateData,
      { new: true, runValidators: true }
    );

    // console.log("Updated case", updatedCase);
    return res.status(200).json(updatedCase);
  } catch (error) {
    console.error("Error updating case", error);
    return res.status(500).json({ error: "Failed to update the case" });
  }
};

/**
 * Inputs:
 * - case_id: String (required)
 * 
 * Success Result:
 * - Returns a success response with the case details including fields like case_id, customer_ref, account_no, current_arrears_amount, last_payment_date, drc, and ro_negotiation.
 */
export const AssignDRCToCaseDetails = async (req, res) => {
  let { case_id,} = req.body;
  if (!case_id) {
    return res.status(400).json({
      status: "error",
      message: "Failed to retrieve case details.",
      errors: { code: 400, description: "case_id is required" },
    });
  }
  try {
    const query = { "case_id": case_id};

    const caseDetails = await Case_details.findOne(query, {
      case_id: 1,
      customer_ref: 1,
      account_no: 1,
      current_arrears_amount: 1,
      last_payment_date: 1,
      drc:1,
      ro_negotiation:1,
      _id: 0,
    });

    if (!caseDetails) {
      return res.status(404).json({
        status: "error",
        message: "No Case Details Found.",
        errors: { code: 404, description: "No data available for the provided DRC_Id" },
      });
    }
    res.status(200).json({
      status: "success",
      message: "Case details retrieved successfully.",
      data: caseDetails,
    });
  } catch (error) {
    console.error("Error fetching case details:", error);
    res.status(500).json({
      status: "error",
      message: "Error Fetching Case Details.",
      errors: { code: 500, description: error.message },
    });
  }
};

export const Withdraw_CasesOwened_By_DRC = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
      const { approver_reference, remark, remark_edit_by, created_by, case_status } = req.body;

      if (!approver_reference || !remark || !remark_edit_by || !created_by) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ message: "All required fields must be provided." });
      }

      const currentDate = new Date();
      // should be call to the case_phase API
      // const case_phase = await pythonapi(case_status);
      const delegate_id = await getApprovalUserIdService({
          case_phase: "Distribution",
          approval_type: "DRC Assign Approval"
      });

      // --- Proceed to insert document ---
      const newDocument = new TmpForwardedApprover({
          approver_reference,
          created_by,
          approver_type: "Case Withdrawal Approval",
          approve_status: [{
              status: "Open",
              status_date: currentDate,
              status_edit_by: created_by,
          }],
          remark: [{
              remark,
              remark_date: currentDate,
              remark_edit_by,
          }],
          approved_deligated_by: delegate_id
      });

      await newDocument.save({ session });

      // should be call to the case_phase API
      // const case_phase = await pythonapi(case_status);

      // Update approve array in CaseDetails with requested_on and requested_by
      const caseResult = await Case_details.updateOne(
          { case_id: approver_reference },
          {
              $push: {
                  case_status: {
                    case_status: "Pending Case Withdrawal",
                    status_reason: "Case send for Withdrawal Approval",
                    created_dtm: currentDate,
                    created_by: created_by,
                    case_phase: "python"  // case_phase
                  }
              },
              $set: {
                case_current_status: "Pending Case Withdrawal",
              },
          },
          { session }
      );

      const dynamicParams = {
        approver_reference,
      };
      // --- Interaction Log ---
      const interactionResult = await createUserInteractionFunction({
          Interaction_ID: 18,
          User_Interaction_Type: "Pending approval for Case Withdraw",
          delegate_user_id: delegate_id, 
          Created_By: created_by,
          User_Interaction_Status: "Open",
          User_Interaction_Status_DTM: currentDate,
          ...dynamicParams,
          session
      });

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
          status:"success",
          message: "Case withdrawal request added successfully",
          data: newDocument
      });
  } catch (error) {
      // console.error("Error withdrawing case:", error);
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({ message: error.message });
  }
};


// export const List_All_DRCs_Mediation_Board_Cases = async (req, res) => {
//   try {
//     const { case_current_status, From_DAT, To_DAT, rtom, drc } = req.body;

//     const allowedStatuses = [
//       "Forward to Mediation Board",
//       "MB Negotiation",
//       "MB Request Customer-Info",
//       "MB Handover Customer-Info",
//       "MB Settle Pending",
//       "MB Settle Open-Pending",
//       "MB Settle Active",
//       "MB Fail with Pending Non-Settlement"
//     ];

//     let query = {};

   
//     if (Object.keys(req.body).length > 0) {
//       query.case_current_status = { $in: allowedStatuses };

//       if (From_DAT && To_DAT) {
//         const from = new Date(From_DAT);
//         from.setUTCHours(0, 0, 0, 0);
//         const to = new Date(To_DAT);
//         to.setUTCHours(23, 59, 59, 999);
//         query.created_dtm = { $gte: from, $lte: to };
//       }
//       if (rtom) {
//         query.rtom = rtom;
//       }
//       if (drc) {
//         query.drc = drc;
//       }
//     }

   
//     let cases = await Case_details.find(query).sort({ created_dtm: -1 });


// const processedCases = cases.map((caseItem) => {
// const mediationBoardEntries = caseItem.mediation_board || [];

// const roRequestEntries = caseItem.ro_requests || [];

// const lastMediationBoardEntry =
//   mediationBoardEntries.length > 0
//     ? mediationBoardEntries[mediationBoardEntries.length - 1]
//     : null;

//           const lastRoRequestEntry = roRequestEntries.length > 0
//               ? roRequestEntries[roRequestEntries.length - 1]
//               : null;
// return {
//   ...caseItem._doc,
//   latest_next_calling_dtm: lastMediationBoardEntry
//     ? lastMediationBoardEntry.mediation_board_calling_dtm || null
//     : null,
//   mediation_board_call_count: mediationBoardEntries.length,
//   drc_name: caseItem.drc.length > 0 ? caseItem.drc[0].drc_name : null,
//   customer_available: lastMediationBoardEntry?.customer_available || null,
//   agree_to_settle: lastMediationBoardEntry?.agree_to_settle || null,
//   comment: lastMediationBoardEntry?.comment || null,
//   customer_response: lastMediationBoardEntry?.customer_response || null,
//   ro_request_created_dtm: lastRoRequestEntry?.created_dtm || null,
//   ro_request: lastRoRequestEntry?.ro_request || null,
//   request_remark: lastRoRequestEntry?.request_remark || null,
// };
// });

//     return res.status(200).json({
//       status: "success",
//       message: "Mediation Board cases retrieved successfully.",
//       data: processedCases,
//     });
//   } catch (error) {
//     console.error("Error fetching Mediation Board cases:", error);
//     return res.status(500).json({
//       status: "error",
//       message: error.message || "An unexpected error occurred.",
//     });
//   }
// };

export const List_All_DRCs_Mediation_Board_Cases = async (req, res) => {
  try {
      const { case_status, From_DAT, TO_DAT, RTOM, DRC, pages } = req.body;
      const allowedStatusTypes = [
          "Forward to Mediation Board",
          "MB Negotiation",
          "MB Request Customer-Info",
          "MB Handover Customer-Info",
          "MB Settle Pending",
          "MB Settle Open-Pending",
          "MB Settle Active",
          "MB Fail with Pending Non-Settlement"
      ];

      if (!case_status && !RTOM && !DRC && !From_DAT && !TO_DAT) {
        return res.status(400).json({
          status: "error",
          message: "At least one of case_status, From_DAT, TO_DAT, RTOM is required."
        });
      }

      const pipeline = [];

      // Match allowed status
      pipeline.push({
        $match: {
          case_current_status: { $in: allowedStatusTypes }
        }
      });

      // Optional filters
      if (case_status && allowedStatusTypes.includes(case_status)) {
        pipeline.push({
          $match: { case_current_status: case_status }
        });
      }

      if  (RTOM) {
        pipeline.push({ $match: { rtom: RTOM } });
      }

      const dateFilter = {};
      if (From_DAT) dateFilter.$gte = new Date(From_DAT);
      if (TO_DAT) dateFilter.$lte = new Date(TO_DAT);

      pipeline.push({
        $addFields: {
          last_mediation_board: { $arrayElemAt: ['$mediation_board', -1] }
        }
      });

      if (Object.keys(dateFilter).length > 0) {
        pipeline.push({
          $match: { 'last_mediation_board.created_dtm': dateFilter }
        });
      }

      // Add a projection to get the last DRC entry
      pipeline.push({
        $addFields: {
          last_drc: { $arrayElemAt: ['$drc', -1] }
        }
      });

      if (DRC) {
        pipeline.push({
          $match: {
            'last_drc.drc_id': Number(DRC)
          }
        });
      }

      pipeline.push({
        $lookup: {
          from: "Recovery_officer", // name of the recovery officer collection
          localField: "last_mediation_board.ro_id",
          foreignField: "ro_id",
          as: "recovery_officer"
        }
      });

      // Optionally flatten the result if you expect only one match
      pipeline.push({
        $addFields: {
          recovery_officer: { $arrayElemAt: ["$recovery_officer", 0] }
        }
      });

      let page = Number(pages);
      if (isNaN(page) || page < 1) page = 1;
      const limit = page === 1 ? 10 : 30;
      const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

      // Pagination
      pipeline.push({ $sort: { case_id: -1 } });
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });

      const filtered_cases = await Case_details.aggregate(pipeline);

      const responseData = filtered_cases.map((caseData) => {
        return {
          case_id: caseData.case_id,
          status: caseData.case_current_status,
          date: caseData.last_mediation_board?.created_dtm || null,
          rtom: caseData.rtom,
          drc_name: caseData.last_drc ? caseData.last_drc.drc_name : null,
          drc_id: caseData.last_drc ? caseData.last_drc.drc_id : null,
          ro_name: caseData.recovery_officer ? caseData.recovery_officer.ro_name : null,
          calling_round: caseData.mediation_board ? caseData.mediation_board.length : 0,
          next_calling_date: caseData.last_mediation_board ? caseData.last_mediation_board.mediation_board_calling_dtm : null,
        };
      });

      return res.status(200).json({
            status: "success",
            message: "Cases retrieved successfully.",
            data: responseData,
      });
  } catch (error) {
      console.error("Error fetching DRC Assign Manager Approvals:", error.message);
      return res.status(500).json({
        status: "error",
        message: "There is an error "
      });
  }
};

export const Accept_Non_Settlement_Request_from_Mediation_Board = async (req, res) => {
  try {
      const { case_id, recieved_by } = req.body;  

   
      if (!case_id) {
          return res.status(400).json({ message: 'case_id is required' });
      }
      if (!recieved_by) {
          return res.status(400).json({ message: 'recieved_by is required' });
      }

    
      const caseRecord = await Case_details.findOne({ case_id });

      if (!caseRecord) {
          return res.status(404).json({ message: 'Case not found' });
      }

      
      if (caseRecord.case_current_status !== 'MB Fail with Pending Non-Settlement') {
          return res.status(400).json({ message: 'Case status does not match the required condition' });
      }

     
      const mediationBoardEntry = caseRecord.mediation_board?.[caseRecord.mediation_board.length - 1];

      if (mediationBoardEntry) {
         
          mediationBoardEntry.received_on = new Date();
          mediationBoardEntry.received_by = recieved_by;
      } else {
          return res.status(400).json({ message: 'No mediation board entry found for this case' });
      }

      
      caseRecord.case_current_status = 'MB Fail with Non-Settlement';

      
      const newCaseStatus = {
          case_status: 'MB Fail with Non-Settlement',    
          status_reason: 'Non-settlement request accepted from Mediation Board',  
          created_dtm: new Date(),                      
          created_by: recieved_by, 
          case_phase: 'Mediation Board',                    
      };

     
      caseRecord.case_status.push(newCaseStatus);

      
      await caseRecord.save();

      
      return res.status(200).json({ message: 'Mediation board data updated successfully', caseRecord });

  } catch (error) {
      
      return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Original Code

// export const ListAllRequestLogFromRecoveryOfficers = async (req, res) => {
//     try {
//         const { delegate_user_id, User_Interaction_Type, "Request Accept": requestAccept, date_from, date_to } = req.body;
        
//         if (!delegate_user_id) {
//             return res.status(400).json({ message: "delegate_user_id is required" });
//         }
        
//         const validUserInteractionTypes = [
//             "Mediation board forward request letter",
//             "Negotiation Settlement plan Request",
//             "Negotiation period extend Request",
//             "Negotiation customer further information Request",
//             "Negotiation Customer request service",
//             "Mediation Board Settlement plan Request",
//             "Mediation Board period extend Request",
//             "Mediation Board customer further information request",
//             "Mediation Board Customer request service"
//         ];
        
//         let filter = { delegate_user_id };
        
//         if (User_Interaction_Type) {
//             filter.User_Interaction_Type = User_Interaction_Type;
//         } else {
//             filter.User_Interaction_Type = { $in: validUserInteractionTypes };
//         }
        
//         if (date_from && date_to) {
//             filter.CreateDTM = { $gte: new Date(date_from), $lte: new Date(date_to) };
//         }
        
//         // Step 1: Fetch documents from User_Interaction_Log
//         const interactionLogs = await User_Interaction_Log.find(filter);
        
//         if (!interactionLogs.length) {
//             return res.status(204).json({ message: "No matching interactions found." });
//         }
        
//         // Step 2: Fetch matching Request records based on Interaction_Log_ID
//         const interactionLogIds = interactionLogs.map(log => log.Interaction_Log_ID);
//         const requests = await Request.find({ RO_Request_Id: { $in: interactionLogIds } });
        
//         // Step 3: Filter User_Interaction_Log based on Request Accept status
//         let filteredInteractionLogs = interactionLogs;
        
//         if (requestAccept) {
//             filteredInteractionLogs = interactionLogs.filter(log => {
//                 const matchingRequest = requests.find(req => req.RO_Request_Id === log.Interaction_Log_ID);
//                 if (!matchingRequest) return false;
                
//                 const requestAcceptStatus = matchingRequest.parameters?.get("Request Accept");
//                 return (requestAccept === "Approve" && requestAcceptStatus === "Yes") ||
//                        (requestAccept === "Reject" && requestAcceptStatus === "No");
//             });
//         }
        
//         if (!filteredInteractionLogs.length) {
//             return res.status(204).json({ message: "No matching approved/rejected requests found." });
//         }
        
//         // Step 4: Fetch related case details
//         const caseIds = filteredInteractionLogs.map(log => log.parameters?.get("case_id"));
//         const caseDetails = await Case_details.find({ case_id: { $in: caseIds } }, {
//             case_id: 1,
//             case_current_status: 1,
//             current_arrears_amount: 1,
//             drc: 1,
//             created_dtm: 1,
//             monitor_months: 1
//         });
        
//         // Step 5: Calculate request count where User_Interaction_Status is "Open"
//         const requestCount = filteredInteractionLogs.filter(log => log.User_Interaction_Status === "Open").length;
        
//         // Step 6: Prepare the final response with separate entries per DRC
//         let responseData = [];
        
//         filteredInteractionLogs.forEach(log => {
//             const relatedCase = caseDetails.find(caseDoc => caseDoc.case_id === log.parameters?.get("case_id"));
            
//             let validityPeriod = "";
//             if (relatedCase) {
//                 const createdDtm = new Date(relatedCase.created_dtm);
//                 if (relatedCase.monitor_months) {
//                     const endDtm = new Date(createdDtm);
//                     endDtm.setMonth(endDtm.getMonth() + relatedCase.monitor_months);
//                     validityPeriod = `${createdDtm.toISOString()} - ${endDtm.toISOString()}`;
//                 } else {
//                     validityPeriod = createdDtm.toISOString();
//                 }
//             }
            
//             const matchingRequest = requests.find(req => req.RO_Request_Id === log.Interaction_Log_ID);
//             const approveStatus = matchingRequest?.parameters?.get("Request Accept") || "Unknown";
            
//             if (relatedCase?.drc?.length) {
//                 relatedCase.drc.forEach(drc => {
//                     responseData.push({
//                         ...log.toObject(),
//                         case_details: {
//                             case_id: relatedCase.case_id,
//                             case_current_status: relatedCase.case_current_status,
//                             current_arrears_amount: relatedCase.current_arrears_amount,
//                             drc: {
//                                 drc_id: drc.drc_id,
//                                 drc_name: drc.drc_name,
//                                 drc_status: drc.drc_status
//                             },
//                             Validity_Period: validityPeriod
//                         },
//                         Approve_Status: approveStatus,
//                         Request_Count: requestCount
//                     });
//                 });
//             } else {
//                 responseData.push({
//                     ...log.toObject(),
//                     case_details: {
//                         case_id: relatedCase?.case_id,
//                         case_current_status: relatedCase?.case_current_status,
//                         current_arrears_amount: relatedCase?.current_arrears_amount,
//                         drc: []
//                     },
//                     Validity_Period: validityPeriod,
//                     Approve_Status: approveStatus,
//                     Request_Count: requestCount
//                 });
//             }
//         });
        
//         return res.json(responseData);
//     } catch (error) {
//         console.error("Error fetching request logs:", error);
//         return res.status(500).json({ message: "Internal Server Error", error: error.message });
//     }
// };

// After adding aggregration.

export const ListAllRequestLogFromRecoveryOfficers = async (req, res) => {
  try {
    const {
      delegate_user_id,
      User_Interaction_Type,
      "Request Accept": requestAccept,
      drc_name,
      date_from,
      date_to
    } = req.body;

    if (!delegate_user_id) {
      return res.status(400).json({ message: "delegate_user_id is required" });
    }

    const validUserInteractionTypes = [
      "Mediation board forward request letter",
      "Negotiation Settlement plan Request",
      "Negotiation period extend Request",
      "Negotiation customer further information Request",
      "Negotiation Customer request service",
      "Mediation Board Settlement plan Request",
      "Mediation Board period extend Request",
      "Mediation Board customer further information request",
      "Mediation Board Customer request service"
    ];

    // Build match stage for initial filtering
    let matchStage = { delegate_user_id };

    if (User_Interaction_Type) {
      matchStage.User_Interaction_Type = User_Interaction_Type;
    } else {
      matchStage.User_Interaction_Type = { $in: validUserInteractionTypes };
    }

    if (date_from && date_to) {
      matchStage.CreateDTM = { $gte: new Date(date_from), $lte: new Date(date_to) };
    }

    // Get total count of open requests in a separate query
    // This is kept separate as it's a simple count query with different criteria
    const totalRequestCount = await User_Interaction_Log.countDocuments({
      ...matchStage,
      User_Interaction_Status: "Open"
    });

    // Main aggregation pipeline
    const pipeline = [
      // Stage 1: Match interaction logs based on criteria
      { $match: matchStage },
      
      // Stage 2: Sort by creation date descending
      { $sort: { CreateDTM: -1 } },
      
      // Stage 3: Add doc_version if it doesn't exist
      {
        $addFields: {
          doc_version: { $ifNull: ["$doc_version", 1] }
        }
      },
      
      // Stage 4: Lookup related requests
      {
        $lookup: {
          from: "Request", // Assuming your collection name is "Request"
          localField: "Interaction_Log_ID",
          foreignField: "RO_Request_Id",
          as: "request"
        }
      },
      
      // Stage 5: Unwind the request array (converts array to object)
      {
        $unwind: {
          path: "$request",
          preserveNullAndEmptyArrays: true
        }
      },
      
      // Stage 6: Filter by request accept status if specified
      ...(requestAccept ? [{
        $match: {
          $or: [
            { "request.parameters.Request Accept": { $exists: false } },
            {
              $and: [
                { "request.parameters.Request Accept": requestAccept === "Approve" ? "Yes" : "No" }
              ]
            }
          ]
        }
      }] : []),
      
      // Stage 7: Add case_id field from either interaction log or request
      {
        $addFields: {
          case_id: {
            $cond: {
              if: { $ifNull: ["$parameters.case_id", false] },
              then: "$parameters.case_id",
              else: { $ifNull: ["$request.parameters.case_id", null] }
            }
          }
        }
      },
      
      // Stage 8: Lookup case details
      {
        $lookup: {
          from: "Case_details", // Assuming your collection name is "Case_details"
          localField: "case_id",
          foreignField: "case_id",
          as: "case"
        }
      },
      
      // Stage 9: Unwind the case array
      {
        $unwind: {
          path: "$case",
          preserveNullAndEmptyArrays: true
        }
      },
      
      // Stage 10: Filter by DRC name if specified
      ...(drc_name ? [{
        $match: {
          $or: [
            { "case.drc": { $exists: false } },
            { "case.drc.drc_name": drc_name },
            { "case.drc": { $elemMatch: { drc_name: drc_name } } }
          ]
        }
      }] : []),
      
      // Stage 11: Add validity period
      {
        $addFields: {
          "validity_period": {
            $cond: {
              if: { $and: [
                { $ifNull: ["$case.created_dtm", false] },
                { $ifNull: ["$case.monitor_months", false] }
              ]},
              then: {
                $concat: [
                  { $toString: "$case.created_dtm" },
                  " - ",
                  { 
                    $toString: { 
                      $dateAdd: { 
                        startDate: "$case.created_dtm", 
                        unit: "month", 
                        amount: "$case.monitor_months" 
                      } 
                    } 
                  }
                ]
              },
              else: { $ifNull: [{ $toString: "$case.created_dtm" }, ""] }
            }
          },
          "approve_status": {
            $cond: {
              if: { $ifNull: ["$request.parameters.Request Accept", false] },
              then: "$request.parameters.Request Accept",
              else: "Unknown"
            }
          }
        }
      },
      
      // Stage 12: Project the final structure
      {
        $project: {
          _id: 1,
          Interaction_Log_ID: 1,
          User_Interaction_Type: 1,
          User_Interaction_Status: 1,
          delegate_user_id: 1,
          parameters: 1,
          CreateDTM: 1,
          doc_version: 1,
          case_details: {
            case_id: "$case.case_id",
            case_current_status: "$case.case_current_status",
            current_arrears_amount: "$case.current_arrears_amount",
            drc: {
              $cond: {
                if: { $isArray: "$case.drc" },
                then: "$case.drc",
                else: {
                  $cond: {
                    if: { $ifNull: ["$case.drc", false] },
                    then: ["$case.drc"],
                    else: []
                  }
                }
              }
            },
            Validity_Period: "$validity_period"
          },
          Approve_Status: "$approve_status",
          Request_Count: { $literal: totalRequestCount }
        }
      }
    ];

    // Execute the aggregation pipeline
    const results = await User_Interaction_Log.aggregate(pipeline);

    if (!results.length) {
      return res.status(204).json({ 
        message: "No matching interactions found.", 
        Request_Count: totalRequestCount 
      });
    }

    // Process DRC data for final response
    const responseData = [];
    
    results.forEach(result => {
      if (Array.isArray(result.case_details.drc) && result.case_details.drc.length > 0) {
        // Handle array of DRCs
        result.case_details.drc.forEach(drc => {
          if (!drc_name || drc.drc_name === drc_name) {
            responseData.push({
              ...result,
              case_details: {
                ...result.case_details,
                drc: {
                  drc_id: drc.drc_id,
                  drc_name: drc.drc_name,
                  drc_status: drc.drc_status
                }
              }
            });
          }
        });
      } else {
        // Handle case with no DRC or single DRC
        if (!drc_name) {
          responseData.push(result);
        }
      }
    });

    if (!responseData.length) {
      return res.status(204).json({ 
        message: "No matching DRC found.", 
        Request_Count: totalRequestCount 
      });
    }

    return res.json(responseData);

  } catch (error) {
    console.error("Error fetching request logs:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};



// export const ListRequestLogFromRecoveryOfficers = async (req, res) => {
//   try {
//       const { delegate_user_id, User_Interaction_Type, "Request Accept": requestAccept, date_from, date_to } = req.body;
      
//       if (!delegate_user_id) {
//           return res.status(400).json({ message: "delegate_user_id is required" });
//       }
      
//       const validUserInteractionTypes = [
//           "Mediation board forward request letter",
//           "Negotiation Settlement plan Request",
//           "Negotiation period extend Request",
//           "Negotiation customer further information Request",
//           "Negotiation Customer request service",
//           "Mediation Board Settlement plan Request",
//           "Mediation Board period extend Request",
//           "Mediation Board customer further information request",
//           "Mediation Board Customer request service"
//       ];
      
//       let filter = { delegate_user_id };
      
//       if (User_Interaction_Type) {
//           filter.User_Interaction_Type = User_Interaction_Type;
//       } else {
//           filter.User_Interaction_Type = { $in: validUserInteractionTypes };
//       }
      
//       if (date_from && date_to) {
//           filter.CreateDTM = { $gte: new Date(date_from), $lte: new Date(date_to) };
//       }
      
//       // Step 1: Calculate total request count where User_Interaction_Status is "Open"
//       const totalRequestCount = await User_Interaction_Log.countDocuments({ ...filter, User_Interaction_Status: "Open" });
      
//       // Step 2: Fetch latest 10 documents from User_Interaction_Log
//       const interactionLogs = await User_Interaction_Log.find(filter).sort({ CreateDTM: -1 }).limit(10);
      
//       if (!interactionLogs.length) {
//           return res.status(204).json({ message: "No matching interactions found.", Request_Count: totalRequestCount });
//       }
      
//       // Step 3: Fetch matching Request records based on Interaction_Log_ID
//       const interactionLogIds = interactionLogs.map(log => log.Interaction_Log_ID);
//       const requests = await Request.find({ RO_Request_Id: { $in: interactionLogIds } });
      
//       // Step 4: Filter User_Interaction_Log based on Request Accept status
//       let filteredInteractionLogs = interactionLogs;
      
//       if (requestAccept) {
//           filteredInteractionLogs = interactionLogs.filter(log => {
//               const matchingRequest = requests.find(req => req.RO_Request_Id === log.Interaction_Log_ID);
//               if (!matchingRequest) return false;
              
//               const requestAcceptStatus = matchingRequest.parameters?.get("Request Accept");
//               return (requestAccept === "Approve" && requestAcceptStatus === "Yes") ||
//                      (requestAccept === "Reject" && requestAcceptStatus === "No");
//           });
//       }
      
//       if (!filteredInteractionLogs.length) {
//           return res.status(204).json({ message: "No matching approved/rejected requests found.", Request_Count: totalRequestCount });
//       }
      
//       // Step 5: Fetch related case details
//       const caseIds = filteredInteractionLogs.map(log => log.parameters?.get("case_id"));
//       const caseDetails = await Case_details.find({ case_id: { $in: caseIds } }, {
//           case_id: 1,
//           case_current_status: 1,
//           current_arrears_amount: 1,
//           drc: 1,
//           created_dtm: 1,
//           monitor_months: 1
//       });
      
//       // Step 6: Prepare the final response with separate entries per DRC
//       let responseData = [];
      
//       filteredInteractionLogs.forEach(log => {
//           const relatedCase = caseDetails.find(caseDoc => caseDoc.case_id === log.parameters?.get("case_id"));
          
//           let validityPeriod = "";
//           if (relatedCase) {
//               const createdDtm = new Date(relatedCase.created_dtm);
//               if (relatedCase.monitor_months) {
//                   const endDtm = new Date(createdDtm);
//                   endDtm.setMonth(endDtm.getMonth() + relatedCase.monitor_months);
//                   validityPeriod = `${createdDtm.toISOString()} - ${endDtm.toISOString()}`;
//               } else {
//                   validityPeriod = createdDtm.toISOString();
//               }
//           }
          
//           const matchingRequest = requests.find(req => req.RO_Request_Id === log.Interaction_Log_ID);
//           const approveStatus = matchingRequest?.parameters?.get("Request Accept") || "Unknown";
          
//           if (relatedCase?.drc?.length) {
//               relatedCase.drc.forEach(drc => {
//                   responseData.push({
//                       ...log.toObject(),
//                       case_details: {
//                           case_id: relatedCase.case_id,
//                           case_current_status: relatedCase.case_current_status,
//                           current_arrears_amount: relatedCase.current_arrears_amount,
//                           drc: {
//                               drc_id: drc.drc_id,
//                               drc_name: drc.drc_name,
//                               drc_status: drc.drc_status
//                           },
//                           Validity_Period: validityPeriod
//                       },
//                       Approve_Status: approveStatus,
//                       Request_Count: totalRequestCount
//                   });
//               });
//           } else {
//               responseData.push({
//                   ...log.toObject(),
//                   case_details: {
//                       case_id: relatedCase?.case_id,
//                       case_current_status: relatedCase?.case_current_status,
//                       current_arrears_amount: relatedCase?.current_arrears_amount,
//                       drc: []
//                   },
//                   Validity_Period: validityPeriod,
//                   Approve_Status: approveStatus,
//                   Request_Count: totalRequestCount
//               });
//           }
//       });
      
//       return res.json(responseData);
//   } catch (error) {
//       console.error("Error fetching request logs:", error);
//       return res.status(500).json({ message: "Internal Server Error", error: error.message });
//   }
// };

// drc eka add kra

// export const ListRequestLogFromRecoveryOfficers = async (req, res) => {
//   try {
//     const {
//       delegate_user_id,
//       User_Interaction_Type,
//       "Request Accept": requestAccept,
//       drc_name,
//       date_from,
//       date_to
//     } = req.body;

//     if (!delegate_user_id) {
//       return res.status(400).json({ message: "delegate_user_id is required" });
//     }

//     const validUserInteractionTypes = [
//       "Mediation board forward request letter",
//       "Negotiation Settlement plan Request",
//       "Negotiation period extend Request",
//       "Negotiation customer further information Request",
//       "Negotiation Customer request service",
//       "Mediation Board Settlement plan Request",
//       "Mediation Board period extend Request",
//       "Mediation Board customer further information request",
//       "Mediation Board Customer request service"
//     ];

//     let filter = { delegate_user_id };

//     if (User_Interaction_Type) {
//       filter.User_Interaction_Type = User_Interaction_Type;
//     } else {
//       filter.User_Interaction_Type = { $in: validUserInteractionTypes };
//     }

//     if (date_from && date_to) {
//       filter.CreateDTM = { $gte: new Date(date_from), $lte: new Date(date_to) };
//     }

//     const totalRequestCount = await User_Interaction_Log.countDocuments({
//       ...filter,
//       User_Interaction_Status: "Open"
//     });

//     const interactionLogs = await User_Interaction_Log.find(filter)
//       .sort({ CreateDTM: -1 })
//       .limit(10);

//     if (!interactionLogs.length) {
//       return res.status(204).json({ message: "No matching interactions found.", Request_Count: totalRequestCount });
//     }

//     const interactionLogIds = interactionLogs.map(log => log.Interaction_Log_ID);
//     const requests = await Request.find({ RO_Request_Id: { $in: interactionLogIds } });

//     let filteredInteractionLogs = interactionLogs;

//     if (requestAccept) {
//       filteredInteractionLogs = interactionLogs.filter(log => {
//         const matchingRequest = requests.find(req => req.RO_Request_Id === log.Interaction_Log_ID);
//         if (!matchingRequest) return false;

//         const requestAcceptStatus = matchingRequest.parameters?.get("Request Accept");
//         return (requestAccept === "Approve" && requestAcceptStatus === "Yes") ||
//                (requestAccept === "Reject" && requestAcceptStatus === "No");
//       });
//     }

//     if (!filteredInteractionLogs.length) {
//       return res.status(204).json({ message: "No matching approved/rejected requests found.", Request_Count: totalRequestCount });
//     }

//     const caseIds = filteredInteractionLogs.map(log => log.parameters?.get("case_id"));
//     const caseDetails = await Case_details.find({ case_id: { $in: caseIds } }, {
//       case_id: 1,
//       case_current_status: 1,
//       current_arrears_amount: 1,
//       drc: 1,
//       created_dtm: 1,
//       monitor_months: 1
//     });

//     let responseData = [];

//     filteredInteractionLogs.forEach(log => {
//       const relatedCase = caseDetails.find(caseDoc => caseDoc.case_id === log.parameters?.get("case_id"));

//       let validityPeriod = "";
//       if (relatedCase) {
//         const createdDtm = new Date(relatedCase.created_dtm);
//         if (relatedCase.monitor_months) {
//           const endDtm = new Date(createdDtm);
//           endDtm.setMonth(endDtm.getMonth() + relatedCase.monitor_months);
//           validityPeriod = `${createdDtm.toISOString()} - ${endDtm.toISOString()}`;
//         } else {
//           validityPeriod = createdDtm.toISOString();
//         }
//       }

//       const matchingRequest = requests.find(req => req.RO_Request_Id === log.Interaction_Log_ID);
//       const approveStatus = matchingRequest?.parameters?.get("Request Accept") || "Unknown";

//       if (relatedCase?.drc?.length) {
//         relatedCase.drc.forEach(drc => {
//           if (!drc_name || drc.drc_name === drc_name) {
//             responseData.push({
//               ...log.toObject(),
//               case_details: {
//                 case_id: relatedCase.case_id,
//                 case_current_status: relatedCase.case_current_status,
//                 current_arrears_amount: relatedCase.current_arrears_amount,
//                 drc: {
//                   drc_id: drc.drc_id,
//                   drc_name: drc.drc_name,
//                   drc_status: drc.drc_status
//                 },
//                 Validity_Period: validityPeriod
//               },
//               Approve_Status: approveStatus,
//               Request_Count: totalRequestCount
//             });
//           }
//         });
//       } else {
//         if (!drc_name) {
//           responseData.push({
//             ...log.toObject(),
//             case_details: {
//               case_id: relatedCase?.case_id,
//               case_current_status: relatedCase?.case_current_status,
//               current_arrears_amount: relatedCase?.current_arrears_amount,
//               drc: [],
//               Validity_Period: validityPeriod
//             },
//             Approve_Status: approveStatus,
//             Request_Count: totalRequestCount
//           });
//         }
//       }
//     });

//     if (!responseData.length) {
//       return res.status(204).json({ message: "No matching DRC found.", Request_Count: totalRequestCount });
//     }

//     return res.json(responseData);

//   } catch (error) {
//     console.error("Error fetching request logs:", error);
//     return res.status(500).json({ message: "Internal Server Error", error: error.message });
//   }
// };

// After adding the aggregration
export const ListRequestLogFromRecoveryOfficers = async (req, res) => {
  try {
    const {
      delegate_user_id,
      User_Interaction_Type,
      "Request Accept": requestAccept,
      drc_name,
      date_from,
      date_to
    } = req.body;

    if (!delegate_user_id) {
      return res.status(400).json({ message: "delegate_user_id is required" });
    }

    const validUserInteractionTypes = [
      "Mediation board forward request letter",
      "Negotiation Settlement plan Request",
      "Negotiation period extend Request",
      "Negotiation customer further information Request",
      "Negotiation Customer request service",
      "Mediation Board Settlement plan Request",
      "Mediation Board period extend Request",
      "Mediation Board customer further information request",
      "Mediation Board Customer request service"
    ];

    // Build match stage for initial filtering
    let matchStage = { delegate_user_id };

    if (User_Interaction_Type) {
      matchStage.User_Interaction_Type = User_Interaction_Type;
    } else {
      matchStage.User_Interaction_Type = { $in: validUserInteractionTypes };
    }

    if (date_from && date_to) {
      matchStage.CreateDTM = { $gte: new Date(date_from), $lte: new Date(date_to) };
    }

    // Get total count of open requests in a separate query
    const totalRequestCount = await User_Interaction_Log.countDocuments({
      ...matchStage,
      User_Interaction_Status: "Open"
    });

    // Main aggregation pipeline
    const pipeline = [
      // Stage 1: Match interaction logs based on criteria
      { $match: matchStage },
      
      // Stage 2: Sort by creation date descending
      { $sort: { CreateDTM: -1 } },
      
      // Stage 3: Limit to 10 records
      { $limit: 10 },
      
      // Stage 4: Add doc_version if it doesn't exist
      {
        $addFields: {
          doc_version: { $ifNull: ["$doc_version", 1] }
        }
      },
      
      // Stage 5: Lookup related requests
      {
        $lookup: {
          from: "Request", // Adjust collection name if needed
          localField: "Interaction_Log_ID",
          foreignField: "RO_Request_Id",
          as: "request"
        }
      },
      
      // Stage 6: Unwind the request array
      {
        $unwind: {
          path: "$request",
          preserveNullAndEmptyArrays: true
        }
      },
      
      // Stage 7: Filter by request accept status if specified
      ...(requestAccept ? [{
        $match: {
          $or: [
            { "request": { $exists: false } },
            {
              $and: [
                { "request.parameters.Request Accept": requestAccept === "Approve" ? "Yes" : "No" }
              ]
            }
          ]
        }
      }] : []),
      
      // Stage 8: Lookup case details
      {
        $lookup: {
          from: "Case_details", // Adjust collection name if needed
          localField: "parameters.case_id",
          foreignField: "case_id",
          as: "case"
        }
      },
      
      // Stage 9: Unwind the case array
      {
        $unwind: {
          path: "$case",
          preserveNullAndEmptyArrays: true
        }
      },
      
      // Stage 10: Calculate validity period
      {
        $addFields: {
          validity_period: {
            $cond: {
              if: { $and: [
                { $ifNull: ["$case.created_dtm", false] },
                { $ifNull: ["$case.monitor_months", false] }
              ]},
              then: {
                $concat: [
                  { $toString: "$case.created_dtm" },
                  " - ",
                  { 
                    $toString: { 
                      $dateAdd: { 
                        startDate: "$case.created_dtm", 
                        unit: "month", 
                        amount: "$case.monitor_months" 
                      } 
                    } 
                  }
                ]
              },
              else: { $ifNull: [{ $toString: "$case.created_dtm" }, ""] }
            }
          },
          approve_status: { 
            $ifNull: ["$request.parameters.Request Accept", "Unknown"] 
          }
        }
      },
      
      // Stage 11: Handle DRC filtering
      {
        $project: {
          _id: 1,
          Interaction_Log_ID: 1,
          User_Interaction_Type: 1,
          User_Interaction_Status: 1,
          delegate_user_id: 1,
          parameters: 1,
          CreateDTM: 1,
          doc_version: 1,
          approve_status: 1,
          validity_period: 1,
          case_details: {
            case_id: "$case.case_id",
            case_current_status: "$case.case_current_status",
            current_arrears_amount: "$case.current_arrears_amount"
          },
          drc_data: {
            $cond: {
              if: { $isArray: "$case.drc" },
              then: "$case.drc",
              else: {
                $cond: {
                  if: { $ifNull: ["$case.drc", false] },
                  then: ["$case.drc"],
                  else: []
                }
              }
            }
          }
        }
      }
    ];

    // Execute the aggregation pipeline
    const results = await User_Interaction_Log.aggregate(pipeline);

    if (!results.length) {
      return res.status(204).json({ 
        message: "No matching interactions found.", 
        Request_Count: totalRequestCount 
      });
    }

    // Process DRC data for final response
    const responseData = [];
    
    results.forEach(result => {
      if (Array.isArray(result.drc_data) && result.drc_data.length > 0) {
        // Handle array of DRCs
        result.drc_data.forEach(drc => {
          if (!drc_name || drc.drc_name === drc_name) {
            responseData.push({
              ...result,
              case_details: {
                ...result.case_details,
                drc: {
                  drc_id: drc.drc_id,
                  drc_name: drc.drc_name,
                  drc_status: drc.drc_status
                },
                Validity_Period: result.validity_period
              },
              Approve_Status: result.approve_status,
              Request_Count: totalRequestCount
            });
            
            // Remove temporary fields
            delete responseData[responseData.length - 1].drc_data;
            delete responseData[responseData.length - 1].validity_period;
            delete responseData[responseData.length - 1].approve_status;
          }
        });
      } else {
        // Handle case with no DRC
        if (!drc_name) {
          responseData.push({
            ...result,
            case_details: {
              ...result.case_details,
              drc: [],
              Validity_Period: result.validity_period
            },
            Approve_Status: result.approve_status,
            Request_Count: totalRequestCount
          });
          
          // Remove temporary fields
          delete responseData[responseData.length - 1].drc_data;
          delete responseData[responseData.length - 1].validity_period;
          delete responseData[responseData.length - 1].approve_status;
        }
      }
    });

    if (!responseData.length) {
      return res.status(204).json({ 
        message: "No matching DRC found.", 
        Request_Count: totalRequestCount 
      });
    }

    return res.json(responseData);

  } catch (error) {
    console.error("Error fetching request logs:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


// Original Code

// export const ListAllRequestLogFromRecoveryOfficersWithoutUserID = async (req, res) => {
//   try {
//       const { delegate_user_id, User_Interaction_Type, "Request Accept": requestAccept, date_from, date_to } = req.body;
      
//       const validUserInteractionTypes = [
//           "Mediation board forward request letter",
//           "Negotiation Settlement plan Request",
//           "Negotiation period extend Request",
//           "Negotiation customer further information Request",
//           "Negotiation Customer request service",
//           "Mediation Board Settlement plan Request",
//           "Mediation Board period extend Request",
//           "Mediation Board customer further information request",
//           "Mediation Board Customer request service"
//       ];
      
//       let filter = {};
      
//       if (delegate_user_id) {
//           filter.delegate_user_id = delegate_user_id;
//       }
      
//       if (User_Interaction_Type) {
//           filter.User_Interaction_Type = User_Interaction_Type;
//       } else {
//           filter.User_Interaction_Type = { $in: validUserInteractionTypes };
//       }
      
//       if (date_from && date_to) {
//           filter.CreateDTM = { $gte: new Date(date_from), $lte: new Date(date_to) };
//       }
      
//       // Step 1: Fetch documents from User_Interaction_Log
//       const interactionLogs = await User_Interaction_Log.find(filter);
      
//       if (!interactionLogs.length) {
//           return res.status(204).json({ message: "No matching interactions found." });
//       }
      
//       // Step 2: Fetch matching Request records based on Interaction_Log_ID
//       const interactionLogIds = interactionLogs.map(log => log.Interaction_Log_ID);
//       const requests = await Request.find({ RO_Request_Id: { $in: interactionLogIds } });
      
//       // Step 3: Filter User_Interaction_Log based on Request Accept status
//       let filteredInteractionLogs = interactionLogs;
      
//       if (requestAccept) {
//           filteredInteractionLogs = interactionLogs.filter(log => {
//               const matchingRequest = requests.find(req => req.RO_Request_Id === log.Interaction_Log_ID);
//               if (!matchingRequest) return false;
              
//               const requestAcceptStatus = matchingRequest.parameters?.get("Request Accept");
//               return (requestAccept === "Approve" && requestAcceptStatus === "Yes") ||
//                      (requestAccept === "Reject" && requestAcceptStatus === "No");
//           });
//       }
      
//       if (!filteredInteractionLogs.length) {
//           return res.status(204).json({ message: "No matching approved/rejected requests found." });
//       }
      
//       // Step 4: Fetch related case details
//       const caseIds = filteredInteractionLogs.map(log => log.parameters?.get("case_id"));
//       const caseDetails = await Case_details.find({ case_id: { $in: caseIds } }, {
//           case_id: 1,
//           case_current_status: 1,
//           current_arrears_amount: 1,
//           drc: 1,
//           created_dtm: 1,
//           monitor_months: 1
//       });
      
//       // Step 5: Calculate request count where User_Interaction_Status is "Open"
//       const requestCount = filteredInteractionLogs.filter(log => log.User_Interaction_Status === "Open").length;
      
//       // Step 6: Prepare the final response with separate entries per DRC
//       let responseData = [];
      
//       filteredInteractionLogs.forEach(log => {
//           const relatedCase = caseDetails.find(caseDoc => caseDoc.case_id === log.parameters?.get("case_id"));
          
//           let validityPeriod = "";
//           if (relatedCase) {
//               const createdDtm = new Date(relatedCase.created_dtm);
//               if (relatedCase.monitor_months) {
//                   const endDtm = new Date(createdDtm);
//                   endDtm.setMonth(endDtm.getMonth() + relatedCase.monitor_months);
//                   validityPeriod = `${createdDtm.toISOString()} - ${endDtm.toISOString()}`;
//               } else {
//                   validityPeriod = createdDtm.toISOString();
//               }
//           }
          
//           const matchingRequest = requests.find(req => req.RO_Request_Id === log.Interaction_Log_ID);
//           const approveStatus = matchingRequest?.parameters?.get("Request Accept") || "Unknown";
          
//           if (relatedCase?.drc?.length) {
//               relatedCase.drc.forEach(drc => {
//                   responseData.push({
//                       ...log.toObject(),
//                       case_details: {
//                           case_id: relatedCase.case_id,
//                           case_current_status: relatedCase.case_current_status,
//                           current_arrears_amount: relatedCase.current_arrears_amount,
//                           drc: {
//                               drc_id: drc.drc_id,
//                               drc_name: drc.drc_name,
//                               drc_status: drc.drc_status
//                           },
//                           Validity_Period: validityPeriod
//                       },
//                       Approve_Status: approveStatus,
//                       Request_Count: requestCount
//                   });
//               });
//           } else {
//               responseData.push({
//                   ...log.toObject(),
//                   case_details: {
//                       case_id: relatedCase?.case_id,
//                       case_current_status: relatedCase?.case_current_status,
//                       current_arrears_amount: relatedCase?.current_arrears_amount,
//                       drc: []
//                   },
//                   Validity_Period: validityPeriod,
//                   Approve_Status: approveStatus,
//                   Request_Count: requestCount
//               });
//           }
//       });
      
//       return res.json(responseData);
//   } catch (error) {
//       console.error("Error fetching request logs:", error);
//       return res.status(500).json({ message: "Internal Server Error", error: error.message });
//   }
// };

// After adding drc

// export const ListAllRequestLogFromRecoveryOfficersWithoutUserID = async (req, res) => {
//   try {
//     const {
//       delegate_user_id,
//       User_Interaction_Type,
//       "Request Accept": requestAccept,
//       drc_name,
//       date_from,
//       date_to
//     } = req.body;

//     const validUserInteractionTypes = [
//       "Mediation board forward request letter",
//       "Negotiation Settlement plan Request",
//       "Negotiation period extend Request",
//       "Negotiation customer further information Request",
//       "Negotiation Customer request service",
//       "Mediation Board Settlement plan Request",
//       "Mediation Board period extend Request",
//       "Mediation Board customer further information request",
//       "Mediation Board Customer request service"
//     ];

//     let filter = {};

//     if (delegate_user_id) {
//       filter.delegate_user_id = delegate_user_id;
//     }

//     if (User_Interaction_Type) {
//       filter.User_Interaction_Type = User_Interaction_Type;
//     } else {
//       filter.User_Interaction_Type = { $in: validUserInteractionTypes };
//     }

//     if (date_from && date_to) {
//       filter.CreateDTM = { $gte: new Date(date_from), $lte: new Date(date_to) };
//     }

//     const interactionLogs = await User_Interaction_Log.find(filter);

//     if (!interactionLogs.length) {
//       return res.status(204).json({ message: "No matching interactions found." });
//     }

//     const interactionLogIds = interactionLogs.map(log => log.Interaction_Log_ID);
//     const requests = await Request.find({ RO_Request_Id: { $in: interactionLogIds } });

//     let filteredInteractionLogs = interactionLogs;

//     if (requestAccept) {
//       filteredInteractionLogs = interactionLogs.filter(log => {
//         const matchingRequest = requests.find(req => req.RO_Request_Id === log.Interaction_Log_ID);
//         if (!matchingRequest) return false;

//         const requestAcceptStatus = matchingRequest.parameters?.get("Request Accept");
//         return (requestAccept === "Approve" && requestAcceptStatus === "Yes") ||
//                (requestAccept === "Reject" && requestAcceptStatus === "No");
//       });
//     }

//     if (!filteredInteractionLogs.length) {
//       return res.status(204).json({ message: "No matching approved/rejected requests found." });
//     }

//     const caseIds = filteredInteractionLogs.map(log => log.parameters?.get("case_id"));
//     const caseDetails = await Case_details.find({ case_id: { $in: caseIds } }, {
//       case_id: 1,
//       case_current_status: 1,
//       current_arrears_amount: 1,
//       drc: 1,
//       created_dtm: 1,
//       monitor_months: 1
//     });

//     const requestCount = filteredInteractionLogs.filter(log => log.User_Interaction_Status === "Open").length;

//     let responseData = [];

//     filteredInteractionLogs.forEach(log => {
//       const relatedCase = caseDetails.find(caseDoc => caseDoc.case_id === log.parameters?.get("case_id"));

//       let validityPeriod = "";
//       if (relatedCase) {
//         const createdDtm = new Date(relatedCase.created_dtm);
//         if (relatedCase.monitor_months) {
//           const endDtm = new Date(createdDtm);
//           endDtm.setMonth(endDtm.getMonth() + relatedCase.monitor_months);
//           validityPeriod = `${createdDtm.toISOString()} - ${endDtm.toISOString()}`;
//         } else {
//           validityPeriod = createdDtm.toISOString();
//         }
//       }

//       const matchingRequest = requests.find(req => req.RO_Request_Id === log.Interaction_Log_ID);
//       const approveStatus = matchingRequest?.parameters?.get("Request Accept") || "Unknown";

//       if (relatedCase?.drc?.length) {
//         relatedCase.drc.forEach(drc => {
//           if (!drc_name || drc.drc_name === drc_name) {
//             responseData.push({
//               ...log.toObject(),
//               case_details: {
//                 case_id: relatedCase.case_id,
//                 case_current_status: relatedCase.case_current_status,
//                 current_arrears_amount: relatedCase.current_arrears_amount,
//                 drc: {
//                   drc_id: drc.drc_id,
//                   drc_name: drc.drc_name,
//                   drc_status: drc.drc_status
//                 },
//                 Validity_Period: validityPeriod
//               },
//               Approve_Status: approveStatus,
//               Request_Count: requestCount
//             });
//           }
//         });
//       } else {
//         if (!drc_name) {
//           responseData.push({
//             ...log.toObject(),
//             case_details: {
//               case_id: relatedCase?.case_id,
//               case_current_status: relatedCase?.case_current_status,
//               current_arrears_amount: relatedCase?.current_arrears_amount,
//               drc: [],
//               Validity_Period: validityPeriod
//             },
//             Approve_Status: approveStatus,
//             Request_Count: requestCount
//           });
//         }
//       }
//     });

//     if (!responseData.length) {
//       return res.status(204).json({ message: "No matching DRC found.", Request_Count: requestCount });
//     }

//     return res.json(responseData);

//   } catch (error) {
//     console.error("Error fetching request logs:", error);
//     return res.status(500).json({ message: "Internal Server Error", error: error.message });
//   }
// };


// After adding the aggregration
export const ListAllRequestLogFromRecoveryOfficersWithoutUserID = async (req, res) => {
  try {
    const {
      delegate_user_id,
      User_Interaction_Type,
      "Request Accept": requestAccept,
      drc_name,
      date_from,
      date_to
    } = req.body;

    const validUserInteractionTypes = [
      "Mediation board forward request letter",
      "Negotiation Settlement plan Request",
      "Negotiation period extend Request",
      "Negotiation customer further information Request",
      "Negotiation Customer request service",
      "Mediation Board Settlement plan Request",
      "Mediation Board period extend Request",
      "Mediation Board customer further information request",
      "Mediation Board Customer request service"
    ];

    // Build match stage for aggregation
    let matchStage = {};

    if (delegate_user_id) {
      matchStage.delegate_user_id = delegate_user_id;
    }

    if (User_Interaction_Type) {
      matchStage.User_Interaction_Type = User_Interaction_Type;
    } else {
      matchStage.User_Interaction_Type = { $in: validUserInteractionTypes };
    }

    if (date_from && date_to) {
      matchStage.CreateDTM = { $gte: new Date(date_from), $lte: new Date(date_to) };
    }

    // Get all interaction logs using aggregation
    const interactionLogs = await User_Interaction_Log.aggregate([
      { $match: matchStage },
      { $sort: { CreateDTM: -1 } }
    ]);

    if (!interactionLogs.length) {
      return res.status(204).json({ message: "No matching interactions found." });
    }

    // Get interaction log IDs for lookup
    const interactionLogIds = interactionLogs.map(log => log.Interaction_Log_ID);

    // Find related requests using aggregation
    const requests = await Request.aggregate([
      { $match: { RO_Request_Id: { $in: interactionLogIds } } }
    ]);

    // Filter by request accept status if specified
    let filteredInteractionLogs = interactionLogs;
    if (requestAccept) {
      filteredInteractionLogs = interactionLogs.filter(log => {
        const matchingRequest = requests.find(req => req.RO_Request_Id === log.Interaction_Log_ID);
        if (!matchingRequest) return false;

        const requestAcceptStatus = matchingRequest.parameters?.["Request Accept"];
        return (requestAccept === "Approve" && requestAcceptStatus === "Yes") ||
               (requestAccept === "Reject" && requestAcceptStatus === "No");
      });
    }

    if (!filteredInteractionLogs.length) {
      return res.status(204).json({ message: "No matching approved/rejected requests found." });
    }

    // Extract case IDs for lookup (from log or, if missing, from request)
    const caseIds = filteredInteractionLogs.map(log => {
      let caseId = log.parameters?.case_id;
      if (!caseId) {
        const matchingRequest = requests.find(req => req.RO_Request_Id === log.Interaction_Log_ID);
        caseId = matchingRequest?.parameters?.case_id;
      }
      return caseId;
    }).filter(id => id);

    // Find case details using aggregation
    const caseDetails = await Case_details.aggregate([
      { $match: { case_id: { $in: caseIds } } },
      {
        $project: {
          case_id: 1,
          case_current_status: 1,
          current_arrears_amount: 1,
          drc: 1,
          created_dtm: 1,
          monitor_months: 1
        }
      }
    ]);

    // Count open requests in filtered logs
    const requestCount = filteredInteractionLogs.filter(log => log.User_Interaction_Status === "Open").length;

    // Build the response data
    let responseData = [];

    filteredInteractionLogs.forEach(log => {
      // Add doc_version if it doesn't exist
      if (!log.hasOwnProperty('doc_version')) {
        log.doc_version = 1;
      }

      // Find matching request
      const matchingRequest = requests.find(req => req.RO_Request_Id === log.Interaction_Log_ID);

      // Find case_id from log, else from request
      let caseId = log.parameters?.case_id;
      if (!caseId) {
        caseId = matchingRequest?.parameters?.case_id;
      }

      // Find related case
      const relatedCase = caseDetails.find(caseDoc => caseDoc.case_id === caseId);

      let validityPeriod = "";
      if (relatedCase) {
        const createdDtm = new Date(relatedCase.created_dtm);
        if (relatedCase.monitor_months) {
          const endDtm = new Date(createdDtm);
          endDtm.setMonth(endDtm.getMonth() + relatedCase.monitor_months);
          validityPeriod = `${createdDtm.toISOString()} - ${endDtm.toISOString()}`;
        } else {
          validityPeriod = createdDtm.toISOString();
        }
      }

      const approveStatus = matchingRequest?.parameters?.["Request Accept"] || "Unknown";

      if (relatedCase?.drc?.length) {
        // Handle array of DRCs
        relatedCase.drc.forEach(drc => {
          if (!drc_name || drc.drc_name === drc_name) {
            responseData.push({
              ...log,
              case_details: {
                case_id: relatedCase.case_id,
                case_current_status: relatedCase.case_current_status,
                current_arrears_amount: relatedCase.current_arrears_amount,
                drc: {
                  drc_id: drc.drc_id,
                  drc_name: drc.drc_name,
                  drc_status: drc.drc_status
                },
                Validity_Period: validityPeriod
              },
              Approve_Status: approveStatus,
              Request_Count: requestCount
            });
          }
        });
      } else if (relatedCase?.drc && !Array.isArray(relatedCase.drc)) {
        // Handle single DRC object
        const drc = relatedCase.drc;
        if (!drc_name || drc.drc_name === drc_name) {
          responseData.push({
            ...log,
            case_details: {
              case_id: relatedCase.case_id,
              case_current_status: relatedCase.case_current_status,
              current_arrears_amount: relatedCase.current_arrears_amount,
              drc: {
                drc_id: drc.drc_id,
                drc_name: drc.drc_name,
                drc_status: drc.drc_status
              },
              Validity_Period: validityPeriod
            },
            Approve_Status: approveStatus,
            Request_Count: requestCount
          });
        }
      } else {
        // Handle case with no DRC
        if (!drc_name) {
          responseData.push({
            ...log,
            case_details: {
              case_id: relatedCase?.case_id,
              case_current_status: relatedCase?.case_current_status,
              current_arrears_amount: relatedCase?.current_arrears_amount,
              drc: [],
              Validity_Period: validityPeriod
            },
            Approve_Status: approveStatus,
            Request_Count: requestCount
          });
        }
      }
    });

    if (!responseData.length) {
      return res.status(204).json({ message: "No matching DRC found.", Request_Count: requestCount });
    }

    return res.json(responseData);

  } catch (error) {
    console.error("Error fetching request logs:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


export const Customer_Negotiations = async (req, res) => {
  const session = await mongoose.startSession(); // Start a session
  session.startTransaction(); // Begin the transaction
  try {
    const {
      case_id,
      request_id,
      request_type,
      request_comment,
      drc_id,
      ro_id,
      ro_name,
      drc,
      field_reason,
      field_reason_remark,
      intraction_id,
      initial_amount,
      calender_month,
      duration_from,
      duration_to,
      settlement_remark,
      created_by,
    } = req.body;
    console.log("details are ", req.body);
    if (!case_id || !drc_id || !field_reason) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        status: "error",
        message: "Missing required fields: case_id, drc_id, field_reason" 
      });
    }
    const negotiationData = {
      drc_id, 
      ro_id, 
      drc,
      ro_name,
      created_dtm: new Date(),
      field_reason,
      remark:field_reason_remark,
    };
    if (request_id !=="") {
      if (!request_id || !request_type || !intraction_id) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ 
          status: "error",
          message: "Missing required fields: request_id, request_type, intraction_id" 
        });
      }
      const dynamicParams = {
        case_id,
        drc_id,
        ro_id,
        request_id,
        request_type,
        request_comment,
        intraction_id,
      };
      const result = await createUserInteractionFunction({
        Interaction_ID:intraction_id,
        User_Interaction_Type:request_type,
        delegate_user_id:1,   // should be change this 
        Created_By:created_by,
        User_Interaction_Status: "Open",
        ...dynamicParams
      });

      if (!result || !result.Interaction_Log_ID) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ 
          status: "error", 
          message: "Failed to create user interaction" 
        });
      }
      const intraction_log_id = result.Interaction_Log_ID;
      let case_status_with_request =  "RO Negotiation";
      const statusMap = {
        "Mediation board forward request letter": "RO Negotiation FMB Pending",
        "Negotiation Settlement plan Request": "RO Negotiation",
        "Negotiation period extend Request": "RO Negotiation extension Pending",
        "Negotiation customer further information Request": "RO Negotiation",
        "Negotiation Customer request service": "RO Negotiation",
      };
      case_status_with_request = statusMap[request_type] || "MB Negotiaion";
      const updatedCase = await Case_details.findOneAndUpdate(
        { case_id: case_id, 'drc.drc_id': drc_id }, 
        { 
            $push: { 
              ro_negotiation: negotiationData,
              ro_requests: {
                  drc_id,
                  ro_id,
                  created_dtm: new Date(),
                  ro_request_id: request_id,
                  ro_request: request_type,
                  request_remark:request_comment,
                  intraction_id: intraction_id,
                  intraction_log_id,
              },
              case_status:{
                case_status:case_status_with_request,
                created_dtm: new Date(),
                created_by:created_by,
              }
            },
            $set: {
              case_current_status: case_status_with_request,
            }
        },
        { new: true, session } // Correct placement of options
      );
      if (!updatedCase) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ 
          status: "error",
          message: 'Case not found this case id' 
        });
      }
    }
    else{
      const updatedMediationBoardCase = await Case_details.findOneAndUpdate(
        { case_id: case_id, 'drc.drc_id': drc_id }, 
        {
          $push: {
            ro_negotiation: negotiationData,
          },
        },
        { new: true, session }
      );
      if (!updatedMediationBoardCase) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ 
          success: false, 
          message: 'Case not found for this case id' 
        });
      }
    }
    if(field_reason === "Agreed To Settle"){
      if(!initial_amount || !calender_month || !duration_from || !duration_to){
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ 
          status: "error",
          message: "Missing required fields: settlement count, initial amount, calendar months, duration" 
        });
      };
      // call settlement APi
      console.log("call settlement APi");
    };
    await session.commitTransaction();
    session.endSession();
    return res.status(200).json({ 
      status: "success", 
      message: "Operation completed successfully" 
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ 
      status:"error",
      message: "Server error", 
      error: error.message 
    }); 
 }  finally {
    session.endSession();
 };
};

//get active negotiations for the customer negotiations
export const getActiveNegotiations = async (req, res) => {
  try {
    const activeNegotiations = await TemplateNegotiation.find();
    return res.status(200).json({
      status: "success",
      message: "Active negotiations retrieved successfully.",
      data: activeNegotiations,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error retrieving active negotiations.",
      errors: {
        code: 500,
        description: error.message,
      },
});
}
};

// List  All Active Mediation RO Requests from SLT
export const ListActiveRORequests = async (req, res) => {
  try {
    const {request_mode} = req.body;
    if (!request_mode) {
      return res.status(400).json({ 
        status: "error",
        message: "Missing required fields: request_mode" 
      });
    };
    const ro_requests = await Template_RO_Request.find({ end_dtm: null, request_mode });
    // if (ro_requests.length === 0) {
    //   return res.status(404).json({
    //     status: "error",
    //     message: `No active RO requests found with request_mode: ${request_mode}.`
    //   });
    // }
    return res.status(200).json({
      status: "success",
      message: `Active RO requests with mode '${request_mode}' retrieved successfully.`,
      data: ro_requests
    });
  } catch (error) {
    console.error("Unexpected error:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Internal server error occurred while fetching active RO details.",
      error: error.message,
    });
  }
};

export const Create_task_for_Request_log_download_when_select_more_than_one_month = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { delegate_user_id, User_Interaction_Type, "Request Accept": requestAccept, date_from, date_to, Created_By } = req.body;

    if (!Created_By) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Created_By is required" });
    }

    const currentDate = new Date();

    // --- Create Task ---
    const taskData = {
      Template_Task_Id: 37, // Different Task ID for approval tasks
      task_type: "Create Task for Request log List for Downloard",
      delegate_user_id,
      User_Interaction_Type,
      requestAccept,
      date_from,
      date_to,
      created_on: currentDate.toISOString(),
      Created_By, // Assigned creator
      task_status: "open",
    };

    // Call createTaskFunction
    await createTaskFunction(taskData, session);

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "Task for batch approval created successfully.",
      taskData,
    });
  } catch (error) {
    console.error("Error creating batch approval task:", error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      message: "Error creating batch approval task",
      error: error.message || "Internal server error.",
    });
  }
};

// Original Code

// export const List_Details_Of_Mediation_Board_Acceptance = async (req, res) => {
//   try {
//       const { delegate_user_id, User_Interaction_Type, case_id, Interaction_Log_ID } = req.body;
      
//       if (!delegate_user_id || !case_id || !Interaction_Log_ID) {
//           return res.status(400).json({ message: "delegate_user_id, case_id, and Interaction_Log_ID are required" });
//       }
      
//       let filter = { delegate_user_id, Interaction_Log_ID };
      
//       if (User_Interaction_Type) {
//           filter.User_Interaction_Type = User_Interaction_Type;
//       }
      
//       // Fetch document from User_Interaction_Log based on Interaction_Log_ID
//       const interactionLog = await User_Interaction_Log.findOne(filter);
      
//       if (!interactionLog) {
//           return res.status(204).json({ message: "No matching interaction found." });
//       }
      
//       // Fetch all interactions related to delegate_user_id excluding the one with Interaction_Log_ID
//       const requestHistory = await User_Interaction_Log.find(
//           { delegate_user_id, Interaction_Log_ID: { $ne: Interaction_Log_ID } },
//           { _id: 0, __v: 0 } // Exclude unnecessary fields
//       );
      
//       // Fetch relevant case details
//       const caseDetails = await Case_details.findOne(
//           { case_id },
//           { 
//               case_id: 1, 
//               customer_ref: 1, 
//               account_no: 1, 
//               current_arrears_amount: 1, 
//               last_payment_date: 1, 
//               monitor_months: 1,
//               incident_id: 1,
//               case_current_status: 1,
//               ro_negotiation: 1,
//               mediation_board: 1
//           }
//       );
      
//       if (!caseDetails) {
//           return res.status(204).json({ message: "No case details found." });
//       }
      
//       // Fetch incident details
//       const incidentDetails = await Incident.findOne(
//           { Incident_Id: caseDetails.incident_id },
//           { "Customer_Details.Customer_Type_Name": 1, "Marketing_Details.ACCOUNT_MANAGER": 1 }
//       );
      
//       const roNegotiationStatuses = [
//           "RO Negotiation", "Negotiation Settle Pending", "Negotiation Settle Open-Pending", 
//           "Negotiation Settle Active", "RO Negotiation Extension Pending", 
//           "RO Negotiation Extended", "RO Negotiation FMB Pending"
//       ];
      
//       const mediationBoardStatuses = [
//           "Forward to Mediation Board", "MB Negotiation", "MB Request Customer-Info", 
//           "MB Handover Customer-Info", "MB Settle Pending", "MB Settle Open-Pending", 
//           "MB Settle Active", "MB Fail with Pending Non-Settlement", "MB Fail with Non-Settlement"
//       ];
      
//       let response = caseDetails.toObject();
      
//       if (roNegotiationStatuses.includes(caseDetails.case_current_status)) {
//           response.ro_negotiation = caseDetails.ro_negotiation;
//           delete response.mediation_board;
//       } else if (mediationBoardStatuses.includes(caseDetails.case_current_status)) {
//           response.mediation_board = caseDetails.mediation_board;
//           delete response.ro_negotiation;
//       } else {
//           delete response.ro_negotiation;
//           delete response.mediation_board;
//       }
      
//       // Add incident details if found
//       if (incidentDetails) {
//           response.Customer_Type_Name = incidentDetails.Customer_Details?.Customer_Type_Name || null;
//           response.ACCOUNT_MANAGER = incidentDetails.Marketing_Details?.ACCOUNT_MANAGER || null;
//       }
      
//       // Add request history
//       response.Request_History = requestHistory;
      
//       return res.json(response);
//   } catch (error) {
//       console.error("Error fetching case details:", error);
//       return res.status(500).json({ message: "Internal Server Error", error: error.message });
//   }
// };

// Aggregration 1

// export const List_Details_Of_Mediation_Board_Acceptance = async (req, res) => {
//   try {
//     const { delegate_user_id, User_Interaction_Type, case_id, Interaction_Log_ID } = req.body;
    
//     if (!delegate_user_id || !case_id || !Interaction_Log_ID) {
//       return res.status(400).json({ message: "delegate_user_id, case_id, and Interaction_Log_ID are required" });
//     }

//     // Fetch the specific interaction log (to check existence)
//     const interactionLog = await User_Interaction_Log.findOne({
//       delegate_user_id,
//       Interaction_Log_ID,
//       ...(User_Interaction_Type && { User_Interaction_Type })
//     });

//     if (!interactionLog) {
//       return res.status(204).json({ message: "No matching interaction found." });
//     }

//     // Aggregation for case details + incident details
//     const caseDetailsAgg = await Case_details.aggregate([
//       { $match: { case_id: Number(case_id) } },
//       {
//         $lookup: {
//           from: "incidents",
//           localField: "incident_id",
//           foreignField: "Incident_Id",
//           as: "incident"
//         }
//       },
//       { $unwind: { path: "$incident", preserveNullAndEmptyArrays: true } },
//       {
//         $addFields: {
//           Customer_Type_Name: "$incident.Customer_Details.Customer_Type_Name",
//           ACCOUNT_MANAGER: "$incident.Marketing_Details.ACCOUNT_MANAGER"
//         }
//       },
//       {
//         $project: {
//           _id: 1,
//           case_id: 1,
//           incident_id: 1,
//           account_no: 1,
//           customer_ref: 1,
//           current_arrears_amount: 1,
//           last_payment_date: 1,
//           monitor_months: 1,
//           case_current_status: 1,
//           mediation_board: 1,
//           ro_negotiation: 1,
//           Customer_Type_Name: 1,
//           ACCOUNT_MANAGER: 1
//         }
//       }
//     ]);

//     if (!caseDetailsAgg.length) {
//       return res.status(204).json({ message: "No case details found." });
//     }

//     const caseDetails = caseDetailsAgg[0];

//     // Aggregation for request history
//     const requestHistory = await User_Interaction_Log.aggregate([
//       {
//         $match: {
//           delegate_user_id,
//           Interaction_Log_ID: { $ne: Number(Interaction_Log_ID) }
//         }
//       },
//       {
//         $project: {
//           _id: 0, // Exclude _id
//           doc_version: 1,
//           Interaction_Log_ID: 1,
//           Interaction_ID: 1,
//           User_Interaction_Type: 1,
//           delegate_user_id: 1,
//           Created_By: 1,
//           User_Interaction_Status: 1,
//           parameters: 1,
//           User_Interaction_Status_DTM: 1,
//           Rejected_Reason: 1,
//           Rejected_By: 1,
//           Request_Mode: 1,
//           CreateDTM: 1
//         }
//       }
//     ]);

//     // Prepare response object
//     let response = { ...caseDetails };

//     // Only include the relevant section based on case status
//     const roNegotiationStatuses = [
//       "RO Negotiation", "Negotiation Settle Pending", "Negotiation Settle Open-Pending", 
//       "Negotiation Settle Active", "RO Negotiation Extension Pending", 
//       "RO Negotiation Extended", "RO Negotiation FMB Pending"
//     ];
//     const mediationBoardStatuses = [
//       "Forward to Mediation Board", "MB Negotiation", "MB Request Customer-Info", 
//       "MB Handover Customer-Info", "MB Settle Pending", "MB Settle Open-Pending", 
//       "MB Settle Active", "MB Fail with Pending Non-Settlement", "MB Fail with Non-Settlement"
//     ];

//     if (roNegotiationStatuses.includes(response.case_current_status)) {
//       delete response.mediation_board;
//     } else if (mediationBoardStatuses.includes(response.case_current_status)) {
//       delete response.ro_negotiation;
//     } else {
//       delete response.ro_negotiation;
//       delete response.mediation_board;
//     }

//     response.Request_History = requestHistory;

//     return res.json(response);

//   } catch (error) {
//     console.error("Error fetching case details:", error);
//     return res.status(500).json({ message: "Internal Server Error", error: error.message });
//   }
// };


// Aggregration 2
export const List_Details_Of_Mediation_Board_Acceptance = async (req, res) => {
  try {
    const { delegate_user_id, User_Interaction_Type, case_id, Interaction_Log_ID } = req.body;

    if (!delegate_user_id || !case_id || !Interaction_Log_ID) {
      return res.status(400).json({
        message: "delegate_user_id, case_id, and Interaction_Log_ID are required"
      });
    }

    const result = await Case_details.aggregate([
      {
        $match: { case_id: Number(case_id) }
      },
      {
        $lookup: {
          from: "incidents",
          localField: "incident_id",
          foreignField: "Incident_Id",
          as: "incident"
        }
      },
      { $unwind: { path: "$incident", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          Customer_Type_Name: "$incident.Customer_Details.Customer_Type_Name",
          ACCOUNT_MANAGER: "$incident.Marketing_Details.ACCOUNT_MANAGER"
        }
      },
      {
        $lookup: {
          from: "user_interaction_logs",
          let: { delegateUserId: delegate_user_id, logId: Number(Interaction_Log_ID) },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$delegate_user_id", "$$delegateUserId"] },
                    { $eq: ["$Interaction_Log_ID", "$$logId"] },
                    ...(User_Interaction_Type
                      ? [{ $eq: ["$User_Interaction_Type", User_Interaction_Type] }]
                      : [])
                  ]
                }
              }
            }
          ],
          as: "currentInteraction"
        }
      },
      {
        $lookup: {
          from: "user_interaction_logs",
          let: { delegateUserId: delegate_user_id, logId: Number(Interaction_Log_ID) },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$delegate_user_id", "$$delegateUserId"] },
                    { $ne: ["$Interaction_Log_ID", "$$logId"] }
                  ]
                }
              }
            },
            {
              $project: {
                _id: 0,
                doc_version: 1,
                Interaction_Log_ID: 1,
                Interaction_ID: 1,
                User_Interaction_Type: 1,
                delegate_user_id: 1,
                Created_By: 1,
                User_Interaction_Status: 1,
                parameters: 1,
                User_Interaction_Status_DTM: 1,
                Rejected_Reason: 1,
                Rejected_By: 1,
                Request_Mode: 1,
                CreateDTM: 1
              }
            }
          ],
          as: "Request_History"
        }
      },
      {
        $project: {
          _id: 1,
          case_id: 1,
          incident_id: 1,
          account_no: 1,
          customer_ref: 1,
          current_arrears_amount: 1,
          last_payment_date: 1,
          monitor_months: 1,
          case_current_status: 1,
          mediation_board: 1,
          ro_negotiation: 1,
          Customer_Type_Name: 1,
          ACCOUNT_MANAGER: 1,
          Request_History: 1,
          currentInteraction: 1
        }
      }
    ]);

    // If no case found
    if (!result.length) {
      return res.status(204).json({ message: "No case details found." });
    }

    const caseDetails = result[0];

    // If no interaction found
    if (!caseDetails.currentInteraction.length) {
      return res.status(204).json({ message: "No matching interaction found." });
    }

    // Remove currentInteraction field before sending response
    delete caseDetails.currentInteraction;

    // Filter sections based on case status
    const roNegotiationStatuses = [
      "RO Negotiation", "Negotiation Settle Pending", "Negotiation Settle Open-Pending",
      "Negotiation Settle Active", "RO Negotiation Extension Pending",
      "RO Negotiation Extended", "RO Negotiation FMB Pending"
    ];
    const mediationBoardStatuses = [
      "Forward to Mediation Board", "MB Negotiation", "MB Request Customer-Info",
      "MB Handover Customer-Info", "MB Settle Pending", "MB Settle Open-Pending",
      "MB Settle Active", "MB Fail with Pending Non-Settlement", "MB Fail with Non-Settlement"
    ];

    if (roNegotiationStatuses.includes(caseDetails.case_current_status)) {
      delete caseDetails.mediation_board;
    } else if (mediationBoardStatuses.includes(caseDetails.case_current_status)) {
      delete caseDetails.ro_negotiation;
    } else {
      delete caseDetails.ro_negotiation;
      delete caseDetails.mediation_board;
    }

    return res.json(caseDetails);

  } catch (error) {
    console.error("Error fetching details:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Define the status mapping based on User_Interaction_Type and Request Accept
const statusMapping = {
  "Mediation board forward request letter": { Yes: "FMB", No: "RO Negotiation" },
  "Negotiation Settlement plan Request": { Yes: "RO Negotiation Settle Pending", No: "RO Negotiation" },
  "Negotiation period extend Request": { Yes: "RO Negotiation extended", No: "RO Negotiation" },
  "Negotiation customer further information Request": { Yes: "RO Negotiation", No: "RO Negotiation" },
  "Negotiation Customer request service": { Yes: "RO Negotiation", No: "RO Negotiation" },
  "Mediation Board Settlement plan Request": { Yes: "MB Negotiation Settle Pending", No: "MB Negotiation" },
  "Mediation Board period extend Request": { Yes: "MB Negotiation", No: "MB Negotiation" },
  "Mediation Board customer further information request": { Yes: "MB Negotiation", No: "MB Negotiation" },
  "Mediation Board Customer request service": { Yes: "MB Negotiation", No: "MB Negotiation" }
};

export const Submit_Mediation_Board_Acceptance = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      create_by,
      Interaction_Log_ID,
      case_id,
      User_Interaction_Type,
      Request_Mode,
      Interaction_ID,
      "Request Accept": requestAccept,
      Reamrk,
      No_of_Calendar_Month,
      Letter_Send
    } = req.body;

    const caseStatus = statusMapping[User_Interaction_Type]?.[requestAccept];

    if (!caseStatus) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: `Invalid User_Interaction_Type or Request Accept value provided.`
      });
    }

    const newRequest = new Request({
      RO_Request_Id: Interaction_Log_ID,
      Request_Description: User_Interaction_Type,
      created_dtm: new Date(),
      created_by: create_by,
      Request_Mode: Request_Mode,
      Intraction_ID: Interaction_ID,
      parameters: {
        "Request Accept": requestAccept,
        "Reamrk": Reamrk,
        "No_of_Calendar_Month": No_of_Calendar_Month,
        "Letter_Send": Letter_Send
      }
    });

    const savedRequest = await newRequest.save({ session });

    const existingCase = await Case_details.findOne({ case_id: case_id }).session(session);
    if (!existingCase) {
      await session.abortTransaction();
      session.endSession();
      return res.status(204).json({ message: `Case with case_id ${case_id} not found.` });
    }

    const existingMonitorMonths = existingCase.monitor_months || 0;
    let finalMonitorMonths = existingMonitorMonths;
    let monthsToAdd = 0;

    if (No_of_Calendar_Month && No_of_Calendar_Month !== "null") {
      monthsToAdd = parseInt(No_of_Calendar_Month, 10);
      if (isNaN(monthsToAdd) || monthsToAdd < 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Invalid No_of_Calendar_Month value." });
      }

      finalMonitorMonths = existingMonitorMonths + monthsToAdd;
      if (finalMonitorMonths > 5) {
        await session.abortTransaction();
        session.endSession();
        return res.status(405).json({ message: `Cannot update monitor_months beyond 5.` });
      }
    }

    const newCaseStatus = {
      case_status: caseStatus,
      status_reason: Reamrk || null,
      created_dtm: new Date(),
      created_by: create_by,
      notified_dtm: null,
      expire_dtm: null
    };

    const updateFields = {
      $push: { case_status: newCaseStatus },
      $set: { case_current_status: caseStatus, monitor_months: finalMonitorMonths }
    };

    await Case_details.updateOne({ case_id: case_id }, updateFields, { session });
    await User_Interaction_Log.updateOne(
      { Interaction_Log_ID: Interaction_Log_ID },
      { $set: { User_Interaction_Status: "Complete" } },
      { session }
    );

    const completedDate = new Date();
    await Case_details.updateOne(
      { case_id: case_id, "ro_requests.intraction_log_id": Interaction_Log_ID },
      { $set: { "ro_requests.$.completed_dtm": completedDate } },
      { session }
    );

    const approvalDoc = await User_Interaction_Log.findOne({ Interaction_Log_ID }).session(session);
    if (!approvalDoc) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "No matching Interaction_Log_ID found" });
    }

    const deligate_id = approvalDoc.Created_By;

    // --- Create User Interaction Log ---
    const interaction_id = 19; // This may need to be changed
    const request_type = "Approved Mediation Board forward request"; 
    const created_by = create_by;
    const dynamicParams = { Interaction_Log_ID };

    await createUserInteractionFunction({
      Interaction_ID: interaction_id,
      User_Interaction_Type: request_type,
      delegate_user_id: deligate_id,  // Now using created_by as delegate ID
      Created_By: created_by,
      User_Interaction_Status: "Open",
      User_Interaction_Status_DTM: new Date(),
      ...dynamicParams,
    });

    const drcArrayLength = existingCase.drc.length;
    let extendedExpireDate = null;
    if (drcArrayLength > 0 && monthsToAdd > 0) {
      const lastDrcIndex = drcArrayLength - 1;
      const lastExpireDtm = existingCase.drc[lastDrcIndex].expire_dtm;
      if (lastExpireDtm) {
        extendedExpireDate = new Date(lastExpireDtm);
        extendedExpireDate.setMonth(extendedExpireDate.getMonth() + monthsToAdd);
        await Case_details.updateOne(
          { case_id: case_id },
          { $set: { [`drc.${lastDrcIndex}.expire_dtm`]: extendedExpireDate } },
          { session }
        );
      }
    }

    if (No_of_Calendar_Month) {
      const caseMonitor = await CaseMonitor.findOne({ case_id: case_id }).session(session);
      if (caseMonitor) {
        let newMonitorExpireDtm = new Date(caseMonitor.Monitor_Expire_Dtm);
        newMonitorExpireDtm.setMonth(newMonitorExpireDtm.getMonth() + monthsToAdd);
        await CaseMonitor.updateOne(
          { case_id: case_id },
          { $set: { Monitor_Expire_Dtm: newMonitorExpireDtm, Last_Request_On: new Date() } },
          { session }
        );
      }
    }

    if (No_of_Calendar_Month) {
      const caseMonitorLog = await CaseMonitorLog.findOne({ case_id: case_id }).session(session);
      if (caseMonitorLog) {
        let newnewMonitorExpireDtm = new Date(caseMonitorLog.Monitor_Expire_Dtm);
        newnewMonitorExpireDtm.setMonth(newnewMonitorExpireDtm.getMonth() + monthsToAdd);
        await CaseMonitorLog.updateOne(
          { case_id: case_id },
          { $set: { Monitor_Expire_Dtm: newnewMonitorExpireDtm } },
          { session }
        );
      }
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Mediation Board Acceptance Request submitted successfully.",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error:", error);
    return res.status(500).json({ message: "Failed to submit request.", error: error.message });
  }
};

export const Withdraw_Mediation_Board_Acceptance = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      create_by,
      Interaction_Log_ID,
      case_id,
      User_Interaction_Type,
      Request_Mode,
      Interaction_ID,
      "Request Accept": requestAccept,
      Reamrk,
      No_of_Calendar_Month,
      Letter_Send
    } = req.body;

    const newRequest = new Request({
      RO_Request_Id: Interaction_Log_ID,
      Request_Description: User_Interaction_Type,
      created_dtm: new Date(),
      created_by: create_by,
      Request_Mode: Request_Mode,
      Intraction_ID: Interaction_ID,
      parameters: {
        "Request Accept": requestAccept,
        "Reamrk": Reamrk,
        "No_of_Calendar_Month": No_of_Calendar_Month,
        "Letter_Send": Letter_Send
      }
    });

    const savedRequest = await newRequest.save({ session });
    const existingCase = await Case_details.findOne({ case_id: case_id }).session(session);

    if (!existingCase) {
      await session.abortTransaction();
      session.endSession();
      return res.status(204).json({ message: `Case with case_id ${case_id} not found.` });
    }

    const existingMonitorMonths = existingCase.monitor_months || 0;
    let finalMonitorMonths = existingMonitorMonths;
    let monthsToAdd = 0;

    if (No_of_Calendar_Month && No_of_Calendar_Month !== "null") {
      monthsToAdd = parseInt(No_of_Calendar_Month, 10);
      if (isNaN(monthsToAdd) || monthsToAdd < 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Invalid No_of_Calendar_Month value." });
      }

      finalMonitorMonths = existingMonitorMonths + monthsToAdd;
      if (finalMonitorMonths > 5) {
        await session.abortTransaction();
        session.endSession();
        return res.status(405).json({ message: `Cannot update monitor_months beyond 5.` });
      }
    }

    const newCaseStatus = {
      case_status: "Withdraw",
      status_reason: Reamrk || null,
      created_dtm: new Date(),
      created_by: create_by
    };

    const updateFields = {
      $push: { case_status: newCaseStatus },
      $set: { case_current_status: "Withdraw", monitor_months: finalMonitorMonths }
    };

    await Case_details.updateOne({ case_id: case_id }, updateFields, { session });
    const completedDate = new Date();

    await Case_details.updateOne(
      { case_id: case_id, "ro_requests.intraction_log_id": Interaction_Log_ID },
      { $set: { "ro_requests.$.completed_dtm": completedDate } },
      { session }
    );

    await User_Interaction_Log.updateOne(
      { Interaction_Log_ID: Interaction_Log_ID },
      { $set: { User_Interaction_Status: "Complete" } },
      { session }
    );

    const approvalDoc = await User_Interaction_Log.findOne({ Interaction_Log_ID }).session(session);

    if (!approvalDoc) {
      await session.abortTransaction();
      session.endSession();
      return res.status(204).json({ message: "No matching Interaction_Log_ID found" });
    }

    const deligate_id = approvalDoc.Created_By;

    // --- Create User Interaction Log ---
    const interaction_id = 20; // This may need to be changed
    const request_type = "Withdraw Mediation Board forward request"; 
    const created_by = create_by;
    const dynamicParams = { Interaction_Log_ID };

    await createUserInteractionFunction({
      Interaction_ID: interaction_id,
      User_Interaction_Type: request_type,
      delegate_user_id: deligate_id,  // Now using created_by as delegate ID
      Created_By: created_by,
      User_Interaction_Status: "Open",
      User_Interaction_Status_DTM: new Date(),
      ...dynamicParams,
    });

    const drcArrayLength = existingCase.drc.length;
    let extendedExpireDate = null;

    if (drcArrayLength > 0 && monthsToAdd > 0) {
      const lastDrcIndex = drcArrayLength - 1;
      const lastExpireDtm = existingCase.drc[lastDrcIndex].expire_dtm;

      if (lastExpireDtm) {
        extendedExpireDate = new Date(lastExpireDtm);
        extendedExpireDate.setMonth(extendedExpireDate.getMonth() + monthsToAdd);

        await Case_details.updateOne(
          { case_id: case_id },
          { $set: { [`drc.${lastDrcIndex}.expire_dtm`]: extendedExpireDate } },
          { session }
        );
      }
    }

    if (No_of_Calendar_Month) {
      const caseMonitor = await CaseMonitor.findOne({ case_id: case_id });
      if (caseMonitor) {
        let newMonitorExpireDtm = new Date(caseMonitor.Monitor_Expire_Dtm);
        newMonitorExpireDtm.setMonth(newMonitorExpireDtm.getMonth() + monthsToAdd);
  
        await CaseMonitor.updateOne(
          { case_id: case_id },
          { $set: { Monitor_Expire_Dtm: newMonitorExpireDtm, Last_Request_On: new Date() } },
          { session }
        );
      }
    }
  
    if (No_of_Calendar_Month) {
      const caseMonitorLog = await CaseMonitorLog.findOne({ case_id: case_id });
      if (caseMonitorLog) {
        let newnewMonitorExpireDtm = new Date(caseMonitorLog.Monitor_Expire_Dtm);
        newnewMonitorExpireDtm.setMonth(newnewMonitorExpireDtm.getMonth() + monthsToAdd);
  
        await CaseMonitorLog.updateOne(
          { case_id: case_id },
          { $set: { Monitor_Expire_Dtm: newnewMonitorExpireDtm }},
          { session }
        );
      }   
    }

    const delegated_user_id = await getApprovalUserIdService({
      case_phase: "Initial Review",
      approval_type: "Customer Approval"
    });

    const forwardedApprover = new TmpForwardedApprover({
      approver_reference: case_id,
      created_on: new Date(),
      created_by: create_by,
      approve_status: [{ status: "Open", status_date: new Date(), status_edit_by: create_by }],
      approver_type: "Case Withdrawal Approval",
      parameters: {
        "Request Accept": requestAccept,
        "Reamrk": Reamrk,
        "No_of_Calendar_Month": No_of_Calendar_Month,
        "Letter_Send": Letter_Send
      },
      approved_deligated_by: delegated_user_id,
      remark: [{ remark: Reamrk || "Withdrawal requested", remark_date: new Date(), remark_edit_by: create_by }]
    });

    const savedForwardApprover = await forwardedApprover.save({ session });
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ message: "Withdrawal mediation board request submitted successfully." });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: "Failed to process withdrawal mediation board acceptance.", error: error.message });
  }
};



// export const getAllPaymentCases = async (req, res) => {
//   try {
//     // Get parameters from request body
//     const { 
//       case_id, 
//       account_num, 
//       settlement_phase, 
//       from_date, 
//       to_date, 
//       page = 1, 
//       limit = 10, 
//       recent = false 
//     } = req.body;

//     // Default query parameters
//     const query = {};
    
//     // Initialize $and array if needed for date filtering
//     if (from_date && to_date) {
//       query.$and = [];
//     }
    
//     let pageNum = Number(page);
//     let limitNum = Number(limit);

//     // Apply filters if they exist
//     if (case_id) query.case_id = Number(case_id);
//     if (account_num) query.account_num = Number(account_num);
//     if (settlement_phase) query.settlement_phase = settlement_phase;
//     if (from_date && to_date) {
//       query.$and.push({ created_dtm: { $gt: new Date(from_date) } });
//       query.$and.push({ created_dtm: { $lt: new Date(to_date) } });
//     }

//     const sortOptions = { money_transaction_id: -1 };

//     // If recent is true, limit to 10 latest entries and ignore pagination
//     if (recent === true) {
//       limitNum = 10;
//       pageNum = 1;
//       // Clear any filters if we just want recent payments
//       Object.keys(query).forEach(key => delete query[key]);
//     }

//     // Calculate skip for pagination
//     const skip = (pageNum - 1) * limitNum;

//     // Execute query with descending sort
//     const transactions = await MoneyTransaction.find(query)
//       .sort(sortOptions)
//       .skip(skip)
//       .limit(limitNum);

//     // Format response data - include all fields from model
//     const formattedTransactions = transactions.map(transaction => {
//       // Convert Mongoose document to plain object
//       const transactionObj = transaction.toObject();

//       // Format date fields for better readability
//       if (transactionObj.created_dtm) {
//         transactionObj.created_dtm = transactionObj.created_dtm.toISOString();
//       }

//       if (transactionObj.money_transaction_date) {
//         transactionObj.money_transaction_date = transactionObj.money_transaction_date.toISOString();
//       }

//       // Return all fields from model with properly formatted names
//       return {
//         Money_Transaction_ID: transactionObj.money_transaction_id,
//         Case_ID: transactionObj.case_id,
//         Account_No: transactionObj.account_num || '-',
//         Created_DTM: transactionObj.created_dtm,
//         Settlement_ID: transactionObj.settlement_id || '-',
//         Installment_Seq: transactionObj.installment_seq || '-',
//         Transaction_Type: transactionObj.transaction_type || '-',
//         Money_Transaction_Ref: transactionObj.money_transaction_ref || '-',
//         Money_Transaction_Amount: transactionObj.money_transaction_amount || '-',
//         Money_Transaction_Date: transactionObj.money_transaction_date || '-',
//         Bill_Payment_Status: transactionObj.bill_payment_status || '-',
//         Settlement_Phase: transactionObj.settlement_phase || '-',
//         Cummulative_Credit: transactionObj.cummulative_credit || '-',
//         Cummulative_Debit: transactionObj.cummulative_debit || '-',
//         Cummulative_Settled_Balance: transactionObj.cummulative_settled_balance || '-',
//         Commissioned_Amount: transactionObj.commissioned_amount || '-'
//       };
//     });

//     // Prepare response data
//     const responseData = {
//       message: recent === true ? 'Recent money transactions retrieved successfully' : 'Money transactions retrieved successfully',
//       data: formattedTransactions,
//     };

//     // Add pagination info if not in recent mode
//     if (recent !== true) {
//       const total = await MoneyTransaction.countDocuments(query);
//       responseData.pagination = {
//         total,
//         page: pageNum,
//         limit: limitNum,
//         pages: Math.ceil(total / limitNum)
//       };
//     } else {
//       responseData.total = formattedTransactions.length;
//     }

//     return res.status(200).json(responseData);
//   } catch (error) {
//     return res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };


export const RO_CPE_Collection = async (req,res) => {
  try {
    const { case_id, drc_id, ro_id, order_id, product_label, service_type, cp_type, cpe_model, serial_no, remark } = req.body;
      
    if (!case_id || !drc_id || !cp_type ||!cpe_model || !serial_no) {
        return res.status(400).json({ message: "case_id, drc_id, cpe_model, serial_no and cp_type are required" });
    };
    const mongoConnection = await db.connectMongoDB();
    if (!mongoConnection) {
      return res.status(500).json({ message: "Failed to connect to MongoDB" });
    }
    const counterResult = await mongoConnection.collection("counters").findOneAndUpdate(
      { _id: "ro_cpe_collect_id" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }
    );
    if (!counterResult.seq) {
      return res.status(500).json({ message: "Failed to generate ro_cpe_collect_id" });
    }

    const ro_cpe_collect_id = counterResult.seq;

    const updatedCaseDetails = await Case_details.findOneAndUpdate(
      { case_id: case_id, "drc.drc_id": drc_id }, 
      {
        $push: {
          ro_cpe_collect: {
            ro_cpe_collect_id: ro_cpe_collect_id, 
            drc_id: Number(drc_id), 
            ro_id: Number(ro_id), 
            order_id: order_id, 
            collected_date: new Date(), 
            product_label,
            service_type,
            cp_type,
            cpe_model,
            serial_no,
            remark,
          }
        }
      },
      { new: true }
    );
    // if (!updatedCaseDetails) {
    //   return res.status(404).json({
    //     status: "error",
    //     message: "Case not found",
    //     errors: {
    //       code: 404,
    //       data: "Case is not available",
    //     },
    //   });
    // }
    return res.status(200).json({
      status: "success",
      message: "Case has been updated successfully",
      data: updatedCaseDetails,
    });
  } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        errors: {
          code: 500,
          description: error.message,
        },
      });
  }
};


export const List_Request_Response_log = async (req, res) => {
  try {
    const { case_current_status, date_from, date_to } = req.body;

    if (!date_from || !date_to || !case_current_status) {
      return res.status(400).json({ message: "Missing required fields: case_current_status, date_from, and date_to are required." });
    }

    const startDate = new Date(date_from);
    const endDate = new Date(date_to);
    endDate.setHours(23, 59, 59, 999);

    // Step 1: Fetch all requests within the date range
    const requests = await Request.find({
      created_dtm: { $gte: startDate, $lte: endDate }
    });

    if (!requests.length) {
      return res.status(204).json({ message: "No requests found within the given date range." });
    }

    const requestIds = requests.map(req => req.RO_Request_Id);
    console.log("Request IDs:", requestIds);

    // Step 2: Fetch related user interaction logs
    const interactions = await User_Interaction_Log.find({ Interaction_Log_ID: { $in: requestIds } });
    console.log("Interactions:", interactions);

    if (!interactions.length) {
      return res.status(204).json({ message: "No related user interactions found." });
    }

    // Extract case IDs from interaction logs (handling Map type correctly)
    const caseIds = interactions
      .map(interaction => interaction.parameters?.get("case_id"))
      .filter(Boolean);
    console.log("Extracted Case IDs:", caseIds);

    // Step 3: Fetch all related case details
    const allCases = await Case_details.find({ case_id: { $in: caseIds } });

    if (!allCases.length) {
      return res.status(204).json({ message: "No related case details found." });
    }

    // Step 4: Filter cases based on case_current_status
    const cases = allCases.filter(caseDoc => caseDoc.case_current_status === case_current_status);

    if (!cases.length) {
      return res.status(404).json({ message: "No matching case details found." });
    }

    // Construct response, grouping data by DRC
    const response = cases.flatMap(caseDoc => {
      const relatedInteraction = interactions.find(interaction => interaction.parameters?.get("case_id") === caseDoc.case_id);
      const relatedRequest = requests.find(request => request.RO_Request_Id === relatedInteraction?.Interaction_Log_ID);

      const startValidity = new Date(caseDoc.created_dtm);
      const expiryValidity = new Date(startValidity);
      expiryValidity.setMonth(expiryValidity.getMonth() + caseDoc.monitor_months);

      return caseDoc.drc.map(drcEntry => ({
        drc_id: drcEntry.drc_id,
        drc_name: drcEntry.drc_name,
        case_id: caseDoc.case_id,
        case_current_status: caseDoc.case_current_status,
        Validity_Period: `${startValidity.toISOString()} - ${expiryValidity.toISOString()}`,
        User_Interaction_Status: relatedInteraction?.User_Interaction_Status || "N/A",
        Request_Description: relatedRequest?.Request_Description || "N/A",
        Letter_Issued_On: relatedRequest?.parameters?.get("Letter_Send") === "Yes" ? relatedRequest.created_dtm : null,
        Approved_on: relatedRequest?.parameters?.get("Request Accept") === "Yes" ? relatedRequest.created_dtm : null,
        Approved_by: relatedRequest?.parameters?.get("Request Accept") === "Yes" ? relatedRequest.created_by : null,
        Remark: relatedRequest?.parameters?.get("Remark") || "N/A"
      }));
    });

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching request response log:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const Create_Task_For_Request_Responce_Log_Download = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { case_current_status, date_from, date_to, Created_By } = req.body;

    if (!Created_By) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: "error",
        message: "Created_By is a required parameter.",
      });
    }

    // Flatten the parameters structure
    const parameters = {
      case_current_status,
      date_from: date_from && !isNaN(new Date(date_from)) ? new Date(date_from).toISOString() : null,
      date_to: date_to && !isNaN(new Date(date_to)) ? new Date(date_to).toISOString() : null,
      Created_By,
      task_status: "open"
    };

    // Pass parameters directly (without nesting it inside another object)
    const taskData = {
      Template_Task_Id: 38,
      task_type: "Create Request Responce Log List for Downloard",
      ...parameters, // Spreads parameters directly into taskData
    };

    // Call createTaskFunction
    await createTaskFunction(taskData, session);

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      status: "success",
      message: "Task created successfully.",
      data: taskData,
    });
  } catch (error) {
    console.error("Error in Create_Task_For_case_distribution:", error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error.",
      errors: {
        exception: error.message,
      },
    });
  }
};



