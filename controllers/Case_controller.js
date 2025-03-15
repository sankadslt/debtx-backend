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
import { ro } from "date-fns/locale";

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
            return res.status(404).json({
                status: "error",
                message: "No matching DRCs found for the given case ID.",
                errors: {
                    code: 404,
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

export const List_count_by_drc_commision_rule = async (req, res) => {
  const case_status = "Open No Agent";
    try {
      const casesCount = await Case_details.aggregate([
        {
          $match: {
            "case_current_status": case_status
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

// export const Case_Distribution_Among_Agents = async (req, res) => {
//   const { drc_commision_rule, current_arrears_band, drc_list,created_by } = req.body;

//   if (!drc_commision_rule || !current_arrears_band || !drc_list || !created_by) {
//     return res.status(400).json({
//       status: "error",
//       message: "DRC commission rule, current arrears band, and DRC list fields are required.",
//     });
//   }

//   if (drc_list.length <= 0) {
//     return res.status(400).json({
//       status: "error",
//       message: "DRC List should not be empty.",
//     });
//   }

//   const validateDRCList = (drcList) => {
//     if (!Array.isArray(drcList)) {
//       throw new Error("DRC List must be an array.");
//     }

//     return drcList.map((item, index) => {
//       if (typeof item.DRC !== "string" || typeof item.Count !== "number") {
//         throw new Error(`Invalid structure at index ${index} in DRC List.`);
//       }

//       return {
//         DRC: item.DRC,
//         Count: item.Count,
//       };
//     });
//   };

//   try {
//     // Validate the DRC list
//     const validatedDRCList = validateDRCList(drc_list);

//     const mongo = await db.connectMongoDB();

//     // Validation for existing tasks with `task_status` and specific parameters
//     const existingTask = await mongo.collection("System_tasks").findOne({
//       task_status: { $ne: "Complete" },
//       "parameters.drc_commision_rule": drc_commision_rule,
//       "parameters.current_arrears_band": current_arrears_band,
//     });
//     // console.log(existingTask);
//     if (existingTask) {
//       return res.status(400).json({
//         status: "error",
//         message: "Already has tasks with this commision rule and arrears band ",
//       });
//     }

//     // Prepare dynamic parameters for the task
//     const dynamicParams = {
//       drc_commision_rule,
//       current_arrears_band,
//       distributed_Amounts: validatedDRCList,
//     }; 

//     // Call createTaskFunction
//     const result = await createTaskFunction({
//       Template_Task_Id: 3,
//       task_type: "Case Distribution Planning among DRC",
//       created_By: created_by,
//       ...dynamicParams,
//     });
    
//     const counter_result_of_case_distribution_batch_id = await mongo.collection("counters").findOneAndUpdate(
//       { _id: "case_distribution_batch_id" },
//       { $inc: { seq: 1 } },
//       { returnDocument: "after", upsert: true }
//     );
//     const case_distribution_batch_id = counter_result_of_case_distribution_batch_id.seq; // Use `value` to access the updated document
//     console.log("case_distribution_batch_id:", case_distribution_batch_id);

//     if (!case_distribution_batch_id) {
//       throw new Error("Failed to generate case_distribution_batch_id.");
//     }

//     // Prepare Case distribution drc transactions data
//     const Case_distribution_drc_transactions_data = {
//       case_distribution_batch_id,
//       batch_seq: 1,
//       created_dtm: new Date(),
//       created_by,
//       action_type: "distribution",
//       drc_commision_rule,
//       current_arrears_band,
//       array_of_distribution:validatedDRCList,
//       rulebase_count: 100,
//       rulebase_arrears_sum: 5000,
//       crd_distribution_status: {crd_distribution_status:"Open",created_dtm:new Date()},
//     };

//     // Insert into Case_distribution_drc_transactions collection
//     const new_Case_distribution_drc_transaction = new Case_distribution_drc_transactions(Case_distribution_drc_transactions_data);
//     await new_Case_distribution_drc_transaction.save();


//     // Return success response from createTaskFunction
//     return res.status(200).json(result);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       status: "error",
//       message: `An error occurred while storiing : ${error.message}`,
//     });
//   }
// };

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
      crd_distribution_status: {crd_distribution_status:"Open",created_dtm:new Date()},
      crd_distribution_status:"Open",
    };

    // Insert into Case_distribution_drc_transactions collection
    const new_Case_distribution_drc_transaction = new Case_distribution_drc_transactions(Case_distribution_drc_transactions_data);
    await new_Case_distribution_drc_transaction.save();

    // Prepare dynamic parameters for the task
    const dynamicParams = {
      // drc_commision_rule,
      // current_arrears_band,
      // distributed_Amounts_array:validatedList,
      // batch_seq_rulebase_count
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
    let query = {
      $and: [
        { "drc.drc_id": drc_id },
        {
          case_current_status: {
            $in: [
              "Open with Agent",
              "Negotiation Settle pending",
              "Negotiation Settle Open Pending",
              "Negotiation Settle Active",
              "FMB",
              "FMB Settle pending",
              "FMB Settle Open Pending",
              "FMB Settle Active",
            ],
          },
        },
        { "drc.drc_status": "Active" },
        { "drc.removed_dtm": null },
        {
          $or: [
            { "drc.recovery_officers": { $size: 0 } },
            { "drc.recovery_officers": { $elemMatch: { "removed_dtm": null } } },
          ],
        },
      ],
    };

    // Add optional filters dynamically
    if (rtom) query.$and.push({ area: rtom });
    if (arrears_band) query.$and.push({ arrears_band });
    if (ro_id) {
      query.$and.push({
        $expr: {
          $eq: [
            ro_id,
            {
              $arrayElemAt: [ { $arrayElemAt: ["$drc.recovery_officers.ro_id", -1] }, -1, ],
            },
          ],
        },
      });
    }
    if (from_date && to_date) {
      query.$and.push({ "drc.created_dtm": { $gt: new Date(from_date) } });
      query.$and.push({ "drc.created_dtm": { $lt: new Date(to_date) } });
    }

    const cases = await Case_details.find(query);

    // Handle case where no matching cases are found
    if (cases.length === 0) {
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
        const lastDrc = caseData.drc[caseData.drc.length - 1]; // Get the last DRC object
        const lastRecoveryOfficer =
          lastDrc.recovery_officers[lastDrc.recovery_officers.length - 1] || {};

        // Fetch matching recovery officer asynchronously
        const matchingRecoveryOfficer = await RecoveryOfficer.findOne({
          ro_id: lastRecoveryOfficer.ro_id,
        });

        return {
          case_id: caseData.case_id,
          status: caseData.case_current_status,
          created_dtm: lastDrc.created_dtm,
          current_arreas_amount: caseData.current_arrears_amount,
          area: caseData.area,
          remark: caseData.remark?.[caseData.remark.length - 1]?.remark || null,
          expire_dtm: lastDrc.expire_dtm,
          ro_name: matchingRecoveryOfficer?.ro_name || null,
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

    // Fetch the case details (use find() to get an array of documents)
    let query = {
      "drc.drc_id": drc_id,
      case_id : case_id,
    };


    const caseData = await Case_details.findOne(query).collation({ locale: 'en', strength: 2 });


    // Check if any cases exist
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

    // Fetch settlement data (use find() to get an array of documents)
    const settlementData = await CaseSettlement.findOne(
      { case_id },
      {
        created_dtm: 1,
        settlement_status: 1,
        expire_date: 1
      }
    ).collation({ locale: 'en', strength: 2 });

    // Check if the case has any settlements
    if (!settlementData) {
      return res.status(404).json({
        status: "error",
        message: "No settlements found for the case.",
        errors: {
          code: 404,
          description: "No settlements found for the case.",
        },
      });
    }

    // Fetch payment data (use find() to get an array of documents)
    const paymentData = await CasePayments.findOne(
      { case_id },
      {
        created_dtm: 1,
        bill_paid_amount: 1,
        settled_balance: 1
      }
    ).collation({ locale: 'en', strength: 2 });

    if (!paymentData) {
      return res.status(404).json({
        status: "error",
        message: "No payments found for the case.",
        errors: {
          code: 404,
          description: "No payments found for the case.",
        },
      });
    }

    // Use Promise.all to handle asynchronous operations
    const findDrc = { "drc.drc_id": drc_id}
    const lastRecoveryOfficer =
      caseData.findDrc?.recovery_officers?.[caseData.findDrc.recovery_officers.length - 1];

    let matchingRecoveryOfficer = null;
    if (lastRecoveryOfficer?.ro_id) {
      matchingRecoveryOfficer = await RecoveryOfficer.findOne({
        ro_id: lastRecoveryOfficer.ro_id,
      });
    }

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


    // Return success response
    return res.status(200).json({
      status: "success",
      message: "Cases retrieved successfully.",
      data: {
        formattedCaseDetails,
        settlementData,
        paymentData,
      }
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
        [`drc.${lastDRC}.recovery_officers.${lastRecoveryOfficer}.case_removal_remark`]: remark,
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
    });

    if (!cases || cases.length === 0) {
      return res.status(404).json({
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


export const List_Case_Distribution_DRC_Summary = async (req, res) => {
    try {
        const { date_from, date_to, current_arrears_band, drc_commision_rule } = req.body;
        let filter = {};

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
        console.error("Error fetching case distributions:", error);
        res.status(500).json({ message: "Server Error", error });
    }
};


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
      Created_By,
      task_status: "open"
    };

    // Pass parameters directly (without nesting it inside another object)
    const taskData = {
      Template_Task_Id: 26,
      task_type: "Create Case distribution DRC Transaction List for Downloard",
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

//this function for get the all the sequence data of the batch and pass the case_distribution_batch_id
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

//     // Input validation
//     if (!drc_id) {
//       return res.status(400).json({
//         status: false,
//         message: "Missing required fields: drc_id."
//       });
//     }

//     // Parse dates
//     const startDate = new Date(From_DAT);
//     const endDate = new Date(TO_DAT);

//     // Validate dates
//     if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
//       return res.status(400).json({
//         status: false,
//         message: "Invalid date format. Please use YYYY-MM-DD format"
//       });
//     }

//     // Build query
//     const query = {
//       "drc.drc_id": DRC_ID,
//       "created_dtm": {
//         $gte: startDate,
//         $lte: endDate
//       }
//     };

//     // Add RO_ID to query if provided
//     if (RO_ID) {
//       query["drc.recovery_officers.ro_id"] = RO_ID;
//     }

//     // Fetch cases
//     const cases = await Case_details.find(query)
//       .select({
//         case_id: 1,
//         case_current_status: 1,
//         created_dtm: 1,
//         rtom: 1,
//         'drc.recovery_officers': 1
//       })
//       .lean();

//     // Format response data
//     const formattedCases = cases.map(doc => ({
//       case_id: doc.case_id,
//       status: doc.case_current_status,
//       date: doc.created_dtm,
//       RO_name: doc.drc?.[0]?.recovery_officers?.[0]?.assigned_by || 'N/A',
//       rtom: doc.rtom,
//       calling_round: "Current Round", // Replace with your logic
//       next_calling_round: "Next Round" // Replace with your logic
//     }));

//     return res.status(200).json({
//       status: true,
//       message: "Cases retrieved successfully",
//       data: formattedCases
//     });

//   } catch (error) {
//     console.error('Error in listFilteredCases:', error);
//     return res.status(500).json({
//       status: false,
//       message: "Internal server error",
//       error: error.message
//     });
//   }
// };

// export const listAllDRCMediationBoardCases = async (req, res) => {
//   const { drc_id, rtom, ro_id, action_type, from_date, to_date } = req.body;

//   try {
//     // Validate the DRC ID
//     if (!drc_id) {
//       return res.status(400).json({
//         status: "error",
//         message: "Failed to retrieve DRC details.",
//         errors: {
//           code: 400,
//           description: "DRC ID is required.",
//         },
//       });
//     }

//     // Ensure at least one optional parameter is provided
//     if (!rtom && !ro_id && !action_type && !(from_date && to_date)) {
//       return res.status(400).json({
//         status: "error",
//         message: "At least one filtering parameter is required.",
//         errors: {
//           code: 400,
//           description: "Provide at least one of rtom, ro_id, action_type, or both from_date and to_date together.",
//         },
//       });
//     }

//     // Build query dynamically based on provided parameters
//     let query = { "drc.drc_id": drc_id };

//     // Initialize $and array if any optional filters are provided
//     if (rtom || action_type || ro_id || (from_date && to_date)) {
//       query.$and = [];
//     }

//     // Add optional filters dynamically
//     if (rtom) query.$and.push({ area: rtom });
//     if (action_type) query.$and.push({ action_type });
//     if (ro_id) {
//       query.$and.push({
//         $expr: {
//           $eq: [
//             ro_id,
//             {
//               $arrayElemAt: [ { $arrayElemAt: ["$drc.recovery_officers.ro_id", -1] }, -1, ],
//             },
//           ],
//         },
//       });
//     }
//     if (from_date && to_date) {
//       query.$and.push({ "drc.created_dtm": { $gt: new Date(from_date) } });
//       query.$and.push({ "drc.expire_dtm": { $lt: new Date(to_date) } });
//     }

//     const cases = await Case_details.find(query);

//     // Handle case where no matching cases are found
//     if (cases.length === 0) {
//       return res.status(404).json({
//         status: "error",
//         message: "No matching cases found for the given criteria.",
//         errors: {
//           code: 404,
//           description: "No cases satisfy the provided criteria.",
//         },
//       });
//     }

//     // Use Promise.all to handle asynchronous operations
//     const formattedCases = await Promise.all(
//       cases.map(async (caseData) => {
//         const lastDrc = caseData.drc[caseData.drc.length - 1]; // Get the last DRC object
//         const lastRecoveryOfficer =
//           lastDrc.recovery_officers[lastDrc.recovery_officers.length - 1] || {};

//         // Fetch matching recovery officer asynchronously
//         const matchingRecoveryOfficer = await RecoveryOfficer.findOne({
//           ro_id: lastRecoveryOfficer.ro_id,
//         });

//         return {
//           case_id: caseData.case_id,
//           status: caseData.case_current_status,
//           created_dtm: lastDrc.created_dtm,
//           area: caseData.area,
//           expire_dtm: lastDrc.expire_dtm,
//           ro_name: matchingRecoveryOfficer?.ro_name || null,
//         };
//       })
//     );

//     // Return success response
//     return res.status(200).json({
//       status: "success",
//       message: "Cases retrieved successfully.",
//       data: formattedCases,
//     });
//   } catch (error) {
//     // Handle errors
//     return res.status(500).json({
//       status: "error",
//       message: "An error occurred while retrieving cases.",
//       errors: {
//         code: 500,
//         description: error.message,
//       },
//     });
//   }
// };


// export const  ListALLMediationCasesownnedbyDRCRO = async (req, res) => {
//   const { drc_id, rtom, case_current_status, ro_id, action_type, from_date, to_date } = req.body;

//   try {
//     // Validate the DRC ID and RO ID
//     if (!drc_id && !ro_id) {
//       return res.status(400).json({
//         status: "error",
//         message: "Failed to retrieve Case details.",
//         errors: {
//           code: 400,
//           description: "DRC ID or RO ID is required.",
//         },
//       });
//     }

//     // Ensure at least one optional parameter is provided
//     if (!rtom && !action_type && !case_current_status && !(from_date && to_date)) {
//       return res.status(400).json({
//         status: "error",
//         message: "At least one filtering parameter is required.",
//         errors: {
//           code: 400,
//           description: "Provide at least one of rtom, ro_id, action_type, case_current_status, or both from_date and to_date together.",
//         },
//       });
//     }

//     // // Build base query for cases with mediation board entries
//     // let query = {
//     //   "drc.drc_id": drc_id,
//     //   "mediation_board": { $exists: true, $ne: [] },
//     //   $and: [],
//     // };

//     // Build query dynamically based on provided parameters
//     let query = { $or: [
//       { "drc.drc_id": drc_id },
//       { "drc.recovery_officers.ro_id": ro_id },
//     ]};

//     // // If the ro_id condition to the query if provided
//     // if (ro_id) {
//     //   query.$and.push({
//     //     $expr: {
//     //       $eq: [
//     //         ro_id,
//     //         {
//     //           $arrayElemAt: [ { $arrayElemAt: ["$drc.recovery_officers.ro_id", -1] }, -1, ],
//     //         },
//     //       ],
//     //     },
//     //   });
//     // }

//     // Initialize $and array if any optional filters are provided
//     if (rtom || action_type || case_current_status || (from_date && to_date)) {
//       query.$and = [];
//     }

//     // Add optional filters dynamically
//     if (rtom) query.$and.push({ area: rtom });
//     if (action_type) query.$and.push({ action_type });
//     if (case_current_status) query.$and.push({ case_current_status });
//     // if (ro_id) {
//     //   query.$and.push({
//     //     $expr: {
//     //       $eq: [
//     //         ro_id,
//     //         {
//     //           $arrayElemAt: [ { $arrayElemAt: ["$drc.recovery_officers.ro_id", -1] }, -1, ],
//     //         },
//     //       ],
//     //     },
//     //   });
//     // }
//     if (from_date && to_date) {
//       query.$and.push({ "drc.created_dtm": { $gt: new Date(from_date) } });
//       query.$and.push({ "drc.expire_dtm": { $lt: new Date(to_date) } });
//     }

//     // Execute the query with the status filter
//     const cases = await Case_details.find(query);

//     // Handle case where no matching cases are found
//     if (cases.length === 0) {
//       return res.status(404).json({
//         status: "error",
//         message: "No matching cases found for the given criteria.",
//         errors: {
//           code: 404,
//           description: "No cases satisfy the provided criteria.",
//         },
//       });
//     }

//     // // Use Promise.all to handle asynchronous operations
//     // const formattedCases = await Promise.all(
//     //   cases.map(async (caseData) => {
//     //     // const lastDrc = caseData.drc[caseData.drc.length - 1]; // Get the last DRC object
//     //     // const lastRecoveryOfficer =
//     //     //   lastDrc.recovery_officers[lastDrc.recovery_officers.length - 1] || {};

//     //     const findDRC = caseData.drc.find((drc) => drc.drc_id === drc_id);
//     //     const lastRO = findDRC.recovery_officers[findDRC.recovery_officers.length - 1];

//     //     const findRecoveryOfficer = caseData.drc.recovery_officers.find((ro) => ro.drc.recovery_officers.ro_id === ro_id);

//     //     // Fetch matching recovery officer asynchronously
//     //     const matchingRecoveryOfficer = await RecoveryOfficer.findOne({ 
//     //       $or: [
//     //         { ro_id: lastRO.ro_id },
//     //         { ro_id: findRecoveryOfficer.ro_id }
//     //       ]
//     //     });

//     //     // Get count of mediation board entries
//     //     const mediationBoardCount = caseData.mediation_board.length;

//     //     return {
//     //       case_id: caseData.case_id,
//     //       status: caseData.case_current_status,
//     //       created_dtm: findDRC.created_dtm,
//     //       area: caseData.area,
//     //       expire_dtm: findDRC.expire_dtm,
//     //       ro_name: matchingRecoveryOfficer?.ro_name || null,
//     //       mediation_board_count: mediationBoardCount, // Added count of mediation board entries
//     //       // mediation_details: {
//     //       //   created_dtm: latestMediationBoard.created_dtm,
//     //       //   mediation_board_calling_dtm: latestMediationBoard.mediation_board_calling_dtm,
//     //       //   customer_available: latestMediationBoard.customer_available,
//     //       //   comment: latestMediationBoard.comment,
//     //       //   settlement_id: latestMediationBoard.settlement_id,
//     //       //   customer_response: latestMediationBoard.customer_response,
//     //       //   next_calling_dtm: latestMediationBoard.next_calling_dtm
//     //       // }
//     //     };
//     //   })
//     // );
    

//     const formattedCases = await Promise.all(
//       cases.map(async (caseData) => {
//         // Ensure drc field exists and is an array
//         if (!Array.isArray(caseData.drc) && !Array.isArray(caseData.drc.recovery_officers)) {
//           return null; // Skip this case if drc field is missing or not an array
//         }
    
//         const findDRC = caseData.drc.find((drc) => drc.drc_id === drc_id);
        
//         const findRecoveryOfficer = caseData.drc.recovery_officers.find((ro) => ro.drc.recovery_officers.ro_id === ro_id) || null;
    
//         // If no matching DRC is found, skip this case
//         if (!findDRC && !findRecoveryOfficer) {
//           return null;
//         }
    
//         // Ensure recovery_officers exists and is an array before accessing
//         const lastRO = findDRC.recovery_officers?.[findDRC.recovery_officers.length - 1] || null;
    
//         // Fetch matching recovery officer asynchronously (ensure valid IDs)
//         const matchingRecoveryOfficer = await RecoveryOfficer.findOne({
//           $or: [
//             { ro_id: lastRO?.ro_id },
//             { ro_id: findRecoveryOfficer?.ro_id }
//           ].filter(query => query.ro_id) // Prevent searching for undefined ro_id
//         });
    
//         // Get count of mediation board entries safely
//         const mediationBoardCount = caseData.mediation_board?.length || 0;
    
//         return {
//           case_id: caseData.case_id,
//           status: caseData.case_current_status,
//           created_dtm: findDRC.created_dtm,
//           area: caseData.area,
//           expire_dtm: findDRC.expire_dtm,
//           ro_name: matchingRecoveryOfficer?.ro_name || null,
//           mediation_board_count: mediationBoardCount, // Added count of mediation board entries
//         };
//       })
//     );
    
//     // // Remove null values from results
//     // const validCases = formattedCases.filter(Boolean);
    

//     // Return success response
//     return res.status(200).json({
//       status: "success",
//       message: "Cases retrieved successfully.",
//       data: formattedCases
//     });
//   } catch (error) {
//     // Handle errors
//     return res.status(500).json({
//       status: "error",
//       message: "An error occurred while retrieving cases.",
//       errors: {
//         code: 500,
//         description: error.message,
//       },
//     });
//   }
// };


// export const ListALLMediationCasesownnedbyDRCRO = async (req, res) => {
//   const { drc_id, ro_id, rtom, case_current_status, action_type, from_date, to_date } = req.body;

//   try {
//     if (!drc_id && !ro_id) {
//       return res.status(400).json({
//         status: "error",
//         message: "Failed to retrieve Case details.",
//         errors: {
//           code: 400,
//           description: "DRC ID or RO ID is required.",
//         },
//       });
//     }

//     if (!rtom && !action_type && !case_current_status && !(from_date && to_date)) {
//       return res.status(400).json({
//         status: "error",
//         message: "At least one filtering parameter is required.",
//         errors: {
//           code: 400,
//           description: "Provide at least one of rtom, ro_id, action_type, case_current_status, or both from_date and to_date together.",
//         },
//       });
//     }

//     let query = {
//       $or: [
//         { "drc.drc_id": drc_id },
//         { "drc.recovery_officers.ro_id": ro_id },
//       ],
//     };

//     if (rtom || action_type || case_current_status || (from_date && to_date)) {
//       query.$and = [];
//     }

//     if (rtom) query.$and.push({ area: rtom });
//     if (action_type) query.$and.push({ action_type });
//     if (case_current_status) query.$and.push({ case_current_status });

//     if (from_date && to_date) {
//       query.$and.push({ "drc.created_dtm": { $gt: new Date(from_date) } });
//       query.$and.push({ "drc.expire_dtm": { $lt: new Date(to_date) } });
//     }

//     const cases = await Case_details.find(query);

//     if (!cases || cases.length === 0) {
//       return res.status(404).json({
//         status: "error",
//         message: "No matching cases found for the given criteria.",
//         errors: {
//           code: 404,
//           description: "No cases satisfy the provided criteria.",
//         },
//       });
//     }

//     const formattedCases = await Promise.all(
//       cases.map(async (caseData) => {
//         if (!caseData.drc || !Array.isArray(caseData.drc)) {
//           return null;
//         }

//         const findDRC = caseData.drc.find((drc) => drc.drc_id === drc_id) || null;

//         let findRecoveryOfficer = null;
//         if (findDRC && Array.isArray(caseData.drc.recovery_officers)) {
//           findRecoveryOfficer = caseData.recovery_officers.find((ro) => ro.ro_id === ro_id) || null;
//         }

//         if (!findDRC && !findRecoveryOfficer) {
//           return null;
//         }

//         const lastRO = findDRC?.recovery_officers?.[findDRC.recovery_officers.length - 1] || null;

//         const matchingRecoveryOfficer = await RecoveryOfficer.findOne({
//           $or: [
//             { ro_id: lastRO?.ro_id },
//             { ro_id: findRecoveryOfficer?.ro_id },
//           ].filter(query => query.ro_id),
//         });

//         const mediationBoardCount = caseData.mediation_board?.length || 0;

//         return {
//           case_id: caseData.case_id,
//           status: caseData.case_current_status,
//           created_dtm: findDRC?.created_dtm || null,
//           area: caseData.area,
//           expire_dtm: findDRC?.expire_dtm || null,
//           ro_name: matchingRecoveryOfficer?.ro_name || null,
//           mediation_board_count: mediationBoardCount,
//         };
//       })
//     );

//     // const casesss = await Promise.all(
//     //   cases.map(async (caseData) => {
//     //     const findRecoveryOfficer = caseData.recovery_officers.find((ro) => ro.ro_id === ro_id) || null;

//     //     if (!findRecoveryOfficer) {
//     //       return null;
//     //     }

//     //     const matchingRecoveryOfficer = await RecoveryOfficer.findOne({
//     //       $or: [
//     //         { ro_id: lastRO?.ro_id },
//     //         { ro_id: findRecoveryOfficer?.ro_id },
//     //       ].filter(query => query.ro_id),
//     //     });

//     //     const mediationBoardCount = caseData.mediation_board?.length || 0;

//     //     return {
//     //       case_id: caseData.case_id,
//     //       status: caseData.case_current_status,
//     //       created_dtm: findRecoveryOfficer?.created_dtm || null,
//     //       area: caseData.area,
//     //       expire_dtm: findRecoveryOfficer?.expire_dtm || null,
//     //       ro_name: matchingRecoveryOfficer?.ro_name || null,
//     //       mediation_board_count: mediationBoardCount,
//     //     };
//     //   })
//     // );

//     return res.status(200).json({
//       status: "success",
//       message: "Cases retrieved successfully.",
//       data: formattedCases.filter(Boolean),
//     });

//   } catch (error) {
//     return res.status(500).json({
//       status: "error",
//       message: "An error occurred while retrieving cases.",
//       errors: {
//         code: 500,
//         description: error.message,
//       },
//     });
//   }
// };


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


export const Batch_Forward_for_Proceed = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { case_distribution_batch_id, Proceed_by, plus_drc, plus_drc_id, minus_drc, minus_drc_id } = req.body;

    if (!case_distribution_batch_id || !Array.isArray(case_distribution_batch_id)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid input, provide an array of batch IDs" });
    }

    if (!Proceed_by) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Proceed_by is required" });
    }

    // Validate if all batch IDs have "Complete" status
    const incompleteBatches = await CaseDistribution.find({
      case_distribution_batch_id: { $in: case_distribution_batch_id },
      crd_distribution_status: { $ne: "Complete" },
    }).session(session);

    if (incompleteBatches.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Some batch IDs do not have a 'Complete' status and cannot be proceeded.",
        incompleteBatchIds: incompleteBatches.map(batch => batch.case_distribution_batch_id),
      });
    }

    const currentDate = new Date();
    const deligate_id = 5;

    // Update proceed_on and forward_for_approvals_on date in Case_distribution_drc_transactions
    const result = await CaseDistribution.updateMany(
      { case_distribution_batch_id: { $in: case_distribution_batch_id } },
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
      return res.status(404).json({ message: "No matching batch IDs found" });
    }

    // --- Create Task for Proceed Action ---
    const taskData = {
      Template_Task_Id: 31,
      task_type: "Create Task for Proceed Cases from Batch_ID",
      case_distribution_batch_id,
      Created_By: Proceed_by,
      task_status: "open",
    };

    await createTaskFunction(taskData, session);

    // --- Create Entry in Template_forwarded_approver ---
    const approvalEntry = new TmpForwardedApprover({
      approver_reference: case_distribution_batch_id[0], // Assuming one batch ID per entry
      created_by: Proceed_by,
      approver_type: "DRC_Distribution",
      approve_status: [{
        status: "Open",
        status_date: currentDate,
        status_edit_by: Proceed_by,
      }],
      approved_deligated_by: deligate_id,
      parameters: {
        plus_drc, plus_drc_id, minus_drc, minus_drc_id,
      },
    });

    await approvalEntry.save({ session });

    // --- Create User Interaction Log ---
    const interaction_id = 6; //this must be chage
    const request_type = "Pending Approval Agent Destribution"; 
    const created_by = Proceed_by;
    const dynamicParams = { case_distribution_batch_id };

    const interactionResult = await createUserInteractionFunction({
      Interaction_ID: interaction_id,
      User_Interaction_Type: request_type,
      delegate_user_id: deligate_id,  
      Created_By: created_by,
      User_Interaction_Status: "Open",
      User_Interaction_Status_DTM: currentDate,
      Request_Mode: "Negotiation", 
      ...dynamicParams,
    });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Batches forwarded for proceed successfully, task created, approval recorded, and user interaction logged.",
      updatedCount: result.modifiedCount,
      taskData,
      approvalEntry,
      interactionResult,
    });
  } catch (error) {
    console.error("Error forwarding batches for proceed:", error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      message: "Error forwarding batches for proceed",
      error: error.message || "Internal server error.",
    });
  }
};


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
      task_type: "Create Case distribution DRC Transaction_1 _Batch List for Downloard",
      ...parameters,
      Created_By,
    };

    await createTaskFunction(taskData, session);

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
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

//     if (transactions_data.length === 0) {
//       return res.status(404).json({
//         status: "error",
//         message: "No data found for this batch ID.",
//       });
//     }

//     return res.status(200).json({ 
//       status: "success",
//       message: `Successfully retrieved ${transactions_data.length} records`,
//       data: transactions_data,
//     });
//   } catch (error) {
//     console.error("Error fetching batch data:", error);
//     return res.status(500).json({
//       status: "error",
//       message: "Server error. Please try again later.",
//     });
//   }
// }

// List  All Active Mediation RO Requests from SLT


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

export const Exchange_DRC_RTOM_Cases = async (req, res) => {
  const { case_distribution_batch_id, drc_list, created_by } = req.body;

  if (!case_distribution_batch_id || !drc_list || !created_by) {
    return res.status(400).json({
      status: "error",
      message: "case distribution batch id, created by and DRC list fields are required.",
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

  try {
    const validatedDRCList = validateDRCList(drc_list);
    
    // Prepare dynamic parameters for the task
    const dynamicParams = {
      case_distribution_batch_id,
      // exchange_drc_list: validatedDRCList,
    };

    // Call createTaskFunction
    const result = await createTaskFunction({
      Template_Task_Id: 36,
      task_type: "Exchange Case Distribution Planning among DRC",
      Created_By: created_by,
      ...dynamicParams,
    });

    if(result.status==="error"){
      return res.status(400).json({
        status: "error",
        message: `An error occurred while creating the task: ${result}`,
      });
    }
    // Fetch the existing document to get the last batch_seq
    const existingCase = await CaseDistribution.findOne({ case_distribution_batch_id });

    let nextBatchSeq = 1;

    if (existingCase && existingCase.batch_seq_details.length > 0) {
        const lastBatchSeq = existingCase.batch_seq_details[existingCase.batch_seq_details.length - 1].batch_seq;
        nextBatchSeq = lastBatchSeq + 1;
    }
    console.log(nextBatchSeq);
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
    
    // existingCase.batch_seq_details.push(newBatchSeqEntry);
    const updatedexistingCase = await CaseDistribution.findOneAndUpdate(
      {case_distribution_batch_id}, 
      {
        $push: { batch_seq_details: newBatchSeqEntry },
        $set: { crd_distribution_status: "Open", crd_distribution_status_on: new Date() } 
      },
      { new: true } 
    );
    await updatedexistingCase.save();
    // await existingCase.save();
    
    return res.status(200).json({
      status: "success",
      message: `New batch sequence ${nextBatchSeq} added successfully.`,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: `An error occurred while creating the task: ${error.message}`,
    });
  }
};

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

    if (result.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No case distribution details found for the given batch ID.",
        errors: {
          code: 404,
          description: "No records match the provided Case_Distribution_Batch_ID.",
        },
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Case details retrieved successfully.",
      data: result,
    });

  } catch (err) {
    console.error("Detailed error:", {
      message: err.message,
      stack: err.stack,
      name: err.name
    });

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


export const List_All_Batch_Details = async (req, res) => {
  try {
      // Fetch documents that meet the condition
      const approverDocs = await TmpForwardedApprover.find({
          "approve_status.status": "Open",
          approver_type: "DRC_Distribution"
      });

      // Filter the documents to ensure the last element in approve_status is "Open"
      const filteredDocs = approverDocs.filter(doc => {
          const lastStatus = doc.approve_status[doc.approve_status.length - 1];
          return lastStatus && lastStatus.status === "Open";
      });

      // Extract approver_reference values
      const approverReferences = filteredDocs.map(doc => doc.approver_reference);

      // Fetch related data from Case_distribution_drc_transactions
      const caseDistributions = await CaseDistribution.find({
          case_distribution_batch_id: { $in: approverReferences }
      }).select("case_distribution_batch_id drc_commision_rule rulebase_count rulebase_arrears_sum");

      // Map results to a structured response
      const response = filteredDocs.map(approver => {
          const relatedCase = caseDistributions.find(caseDoc => caseDoc.case_distribution_batch_id === approver.approver_reference);
          return {
              _id: approver._id,
              approver_reference: approver.approver_reference,
              created_on: approver.created_on,
              created_by: approver.created_by,
              approve_status: approver.approve_status,
              approver_type: approver.approver_type,
              parameters: approver.parameters,
              approved_by: approver.approved_by,
              remark: approver.remark,
              case_distribution_details: relatedCase ? {
                  case_distribution_batch_id: relatedCase.case_distribution_batch_id,
                  drc_commision_rule: relatedCase.drc_commision_rule,
                  rulebase_count: relatedCase.rulebase_count,
                  rulebase_arrears_sum: relatedCase.rulebase_arrears_sum
              } : null
          };
      });

      res.status(200).json(response);
  } catch (error) {
      console.error("Error fetching batch details:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
};


export const Approve_Batch_or_Batches = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { approver_references, approved_by } = req.body;

    if (!approver_references || !Array.isArray(approver_references)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid input, provide an array of approver references" });
    }

    if (!approved_by) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "approved_by is required" });
    }

    const currentDate = new Date();
    const deligate_id = 8;

    // Update approve_status and approved_by for matching documents
    const result = await TmpForwardedApprover.updateMany(
      { 
        approver_reference: { $in: approver_references },
        approver_type: "DRC_Distribution" 
      },
      {
        $push: {
          approve_status: {
            status: "Approve",
            status_date: currentDate,
            status_edit_by: approved_by,
          },
        },
        $set: {
          approved_deligated_by: deligate_id
        }
      },
      { session }
    );

    if (result.modifiedCount === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "No matching approver references found" });
    }

    // --- Create Task for Approved Approvers ---
    const taskData = {
      Template_Task_Id: 29,
      task_type: "Create Task for Approve Cases from Approver_Reference",
      approver_references, // One or more approver references
      Created_By: approved_by, // Ensure Created_By is the same as approved_by
      task_status: "open",
    };

    // Call createTaskFunction
    await createTaskFunction(taskData, session);

    // --- Create User Interaction Log ---
    const interaction_id = 6; //this must be chage
    const request_type = "Pending Approval Agent Destribution"; 
    const created_by = approved_by;
    const dynamicParams = { approver_references };

    const interactionResult = await createUserInteractionFunction({
      Interaction_ID: interaction_id,
      User_Interaction_Type: request_type,
      delegate_user_id: deligate_id,  
      Created_By: created_by,
      User_Interaction_Status_DTM: currentDate,
      User_Interaction_Status: "Open",
      Request_Mode: "Negotiation", 
      ...dynamicParams,
    });


    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Approvals added successfully, and task created.",
      updatedCount: result.modifiedCount,
      taskData,
    });
  } catch (error) {
    console.error("Error approving batches:", error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      message: "Error approving batches",
      error: error.message || "Internal server error.",
    });
  }
};


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

    // --- Create Task ---
    const taskData = {
      Template_Task_Id: 30, // Different Task ID for approval tasks
      task_type: "Create batch approval List for Downloard",
      approver_references, // List of approver references
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


export const List_DRC_Assign_Manager_Approval = async (req, res) => {
  try {
      const { approver_type, date_from, date_to } = req.body;
      const allowedApproverTypes = [
          "DRC Re-Assign Approval",
          "DRC Assign Approval",
          "Case Withdrawal Approval",
          "Case Abandoned Approval",
          "Case Write-Off Approval",
          "Commission Approval"
      ];

      let filter = { approver_type: { $in: allowedApproverTypes } }; // Filter only allowed approver types

      // Filter based on approver_type
      if (approver_type && allowedApproverTypes.includes(approver_type)) {
          filter.approver_type = approver_type;
      }

      // Filter based on date range
      if (date_from && date_to) {
          filter.created_on = { $gte: new Date(date_from), $lte: new Date(date_to) };
      } else if (date_from) {
          filter.created_on = { $gte: new Date(date_from) };
      } else if (date_to) {
          filter.created_on = { $lte: new Date(date_to) };
      }

      // Fetch data from Template_forwarded_approver collection
      const approvals = await TmpForwardedApprover.find(filter);

      // Process results to extract only the last element of approve_status array
      const response = approvals.map(doc => {
          const lastApproveStatus = doc.approve_status?.length 
              ? doc.approve_status[doc.approve_status.length - 1] 
              : null;

          return {
              ...doc.toObject(),
              approve_status: lastApproveStatus ? [lastApproveStatus] : [], // Keep only the last approve_status
          };
      });

      res.status(200).json(response);
  } catch (error) {
      console.error("Error fetching DRC Assign Manager Approvals:", error);
      res.status(500).json({ message: "Server Error", error });
  }
};

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
      const deligate_id = 7;

      // Fetch the document to get the approver_type, created_on, and created_by
      const approvalDoc = await TmpForwardedApprover.findOne({ approver_reference }).session(session);

      if (!approvalDoc) {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({ message: "No matching approver reference found" });
      }

      // Determine status based on approver_type
      const statusMap = {
          "DRC Re-Assign Approval": "Open assign agent",
          "DRC Assign Approval": "Open assign agent",
          "Case Withdrawal Approval": "Case Withdrawed",
          "Case Abandoned Approval": "Case Abandoned",
          "Case Write-Off Approval": "Pending Write Off",
          "Commission Approval": "Commissioned"
      };

      const newStatus = statusMap[approvalDoc.approver_type] || "Pending";

      // Update approve_status and approved_by
      const result = await TmpForwardedApprover.updateOne(
          { approver_reference },
          {
              $push: {
                  approve_status: {
                      status: newStatus,
                      status_date: currentDate,
                      status_edit_by: approved_by,
                  },
              },
              $set: {
                approved_deligated_by: deligate_id
              }
          },
          { session }
      );

      if (result.modifiedCount === 0) {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({ message: "Approval update failed" });
      }

      // Update approve array in CaseDetails with requested_on and requested_by
      const caseResult = await Case_details.updateOne(
          { case_id: approver_reference },
          {
              $push: {
                  approve: {
                      approved_process: newStatus,
                      approved_by: approved_by,
                      approved_on: currentDate,
                      remark: " ",
                      requested_on: approvalDoc.created_on,
                      requested_by: approvalDoc.created_by
                  }
              }
          },
          { session }
      );

      // --- Create User Interaction Log ---
      const interaction_id = 6; //this must be chage
      const request_type = "Pending Approval Agent Destribution"; 
      const created_by = approved_by;
      const dynamicParams = { approver_reference };

      const interactionResult = await createUserInteractionFunction({
        Interaction_ID: interaction_id,
        User_Interaction_Type: request_type,
        delegate_user_id: deligate_id,  
        Created_By: created_by,
        User_Interaction_Status: "Open",
        User_Interaction_Status_DTM: currentDate,
        Request_Mode: "Negotiation", 
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
  }
};


export const Reject_DRC_Assign_Manager_Approval = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
      const { approver_references, approved_by } = req.body;

      if (!approver_references || !Array.isArray(approver_references) || approver_references.length === 0 || approver_references.length > 5) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ message: "Invalid input, provide between 1 to 5 approver references" });
      }

      if (!approved_by) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ message: "approved_by is required" });
      }

      const currentDate = new Date();
      const deligate_id = 6;

      // Update approve_status for matching documents in TmpForwardedApprover
      const result = await TmpForwardedApprover.updateMany(
          { 
              approver_reference: { $in: approver_references },
              approver_type: { $ne: "DRC_Distribution" } 
          },
          {
              $push: {
                  approve_status: {
                      status: "Reject",
                      status_date: currentDate,
                      status_edit_by: approved_by,
                  },
              },
              $set: {
                approved_deligated_by: null,
              }
          },
          { session }
      );

      if (result.modifiedCount === 0) {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({ message: "No matching approver references found" });
      }

      // Update approve array in CaseDetails where case_id matches approver_reference
      const caseResult = await Case_details.updateMany(
          { case_id: { $in: approver_references } },
          {
              $push: {
                  approve: {
                      approved_process: "Reject",
                      rejected_by: approved_by,
                      remark: "Rejected because some reasons."
                  }
              }
          },
          { session }
      );

      // --- Create User Interaction Log ---
      const interaction_id = 6; //this must be chage
      const request_type = "Pending Approval Agent Destribution"; 
      const created_by = approved_by;
      const dynamicParams = { approver_references };

      const interactionResult = await createUserInteractionFunction({
        Interaction_ID: interaction_id,
        User_Interaction_Type: request_type,
        delegate_user_id: deligate_id,  
        Created_By: created_by,
        User_Interaction_Status: "Open",
        User_Interaction_Status_DTM: currentDate,
        Request_Mode: "Negotiation", 
        ...dynamicParams,
      });

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
          message: "Rejections added successfully.",
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
  }
};


export const Create_task_for_DRC_Assign_Manager_Approval = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { approver_references, date_from, date_to, Created_By } = req.body;

    if (!Created_By) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Created_By is required" });
    }

    const currentDate = new Date();

    // --- Create Task ---
    const taskData = {
      Template_Task_Id: 33, // Different Task ID for approval tasks
      task_type: "Create DRC Assign maneger approval List for Downloard",
      approver_references, // List of approver references
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

export const Assign_DRC_To_Case = async (req, res) => {
  try {
    const { case_id, drc_id, remark, assigned_by, drc_name } = req.body;
    if (!case_id|| !drc_id || !assigned_by || !drc_name) {
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
        drc_id:drc_id,
        drc_name:drc_name,
        case_id:case_id,
      },
      remark:{
        remark:remark,
        remark_date: new Date(),
        remark_edit_by:assigned_by,
      },
    }
    const TmpForwardedApproverRespons = new TmpForwardedApprover(drcAssignAproveRecode);
    await TmpForwardedApproverRespons.save();

    res.status(200).json({
      status: "success",
      message: "DRC Reassining send to the Aprover.",
      data: TmpForwardedApproverRespons,
    }); 
  }
  catch (error) {
    console.error("Error in Reassining send to the Aprover : ", error);
    return res.status(500).json({
      status: "error",
      message: "An error occurred while assigning the DRC.",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }
};


export const List_Case_Distribution_Details = async (req, res) => {
  try {
      const { case_distribution_batch_id, drc_id } = req.body;

      if (!case_distribution_batch_id) {
          return res.status(400).json({ message: "Missing required field: case_distribution_batch_id" });
      }

      const query = { case_distribution_batch_id };
      if (drc_id) {
          query.drc_id = drc_id;
      }

      const results = await caseDistributionDRCSummary.find(query);

      if (results.length === 0) {
          return res.status(404).json({ message: "No records found for the given batch ID" });
      }

      const case_distribution_batch_ids = results.map(doc => doc.case_distribution_batch_id);

      const transactions = await CaseDistribution.find({
          case_distribution_batch_id: { $in: case_distribution_batch_ids }
      }, 'case_distribution_batch_id proceed_on');

      const drcIds = [...new Set(results.map(doc => doc.drc_id))];
      const drcDetailsMap = await DRC.find({ drc_id: { $in: drcIds } }, 'drc_id drc_name')
          .then(drcs => drcs.reduce((acc, drc) => {
              acc[drc.drc_id] = drc.drc_name;
              return acc;
          }, {}));

      const response = results.map(doc => {
          const transaction = transactions.find(t => t.case_distribution_batch_id === doc.case_distribution_batch_id);
          return {
              ...doc.toObject(),
              proceed_on: transaction ? transaction.proceed_on : null,
              drc_name: drcDetailsMap[doc.drc_id] || null
          };
      });

      res.status(200).json(response);
  } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const Create_Task_For_case_distribution_drc_summery = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
      const { drc_id, Created_By } = req.body;

      if (!drc_id || !Created_By) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ message: "Missing required fields: drc_id, Created_By" });
      }

      const drcDetails = await DRC.findOne({ drc_id }, 'drc_name');
      if (!drcDetails) {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({ message: "DRC not found for the given drc_id" });
      }

      const currentDate = new Date();

      // --- Create Task ---
      const taskData = {
          Template_Task_Id: 32, // Different Task ID for approval tasks
          task_type: "Create Case Distribution DRC Summary List for Downloard",
          drc_id,
          drc_name: drcDetails.drc_name, // Include DRC name
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


export const List_Case_Distribution_Details_With_Rtoms = async (req, res) => {
  try {
      const { case_distribution_batch_id, drc_id } = req.body;

      if (!case_distribution_batch_id || !drc_id) {
          return res.status(400).json({ message: "Missing required fields: case_distribution_batch_id, drc_id" });
      }

      const results = await caseDistributionDRCSummary.find({ case_distribution_batch_id, drc_id });

      if (results.length === 0) {
          return res.status(404).json({ message: "No records found for the given batch ID and DRC ID" });
      }

      const drcDetails = await DRC.findOne({ drc_id }, 'drc_name');
      const drc_name = drcDetails ? drcDetails.drc_name : null;

      const response = results.map(doc => ({
          ...doc.toObject(),
          drc_name
      }));

      res.status(200).json(response);
  } catch (error) {
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
      const dynamicParams = {
        case_id,
        drc_id,
        ro_id,
        request_id,
        request_type,
        request_comment,
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
        { case_id: case_id }, 
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

export const Mediation_Board2 = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const {
      case_id,
      drc_id,
      ro_id,
      next_calling_date,
      handover_non_settlement,
      calling_round,
      request_id,
      request_type,
      request_comment,
      intraction_id,
      customer_available,
      comment,
      settle,
      settlement_count,
      initial_amount,
      calendar_month,
      duration,
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
    if( calling_round >= 3 ){
      if (!handover_non_settlement) {
        return res.status(400).json({ 
          status: "error",
          message: "Missing required fields: handover non settlement" 
        });
      };
      if (handover_non_settlement == "yes") {
        const updatedMediationBoardCase = await Case_details.findOneAndUpdate(
          { case_id: case_id }, 
          {
            $push: { 
              mediation_board: {
                drc_id,
                ro_id,
                created_dtm: new Date(),
                handed_over_non_settlemet_on: new Date(),
                non_settlement_comment: comment
              }
            },
            $push: { 
              case_status: {
                case_status: "Hand over non settlement", 
                created_dtm: new Date(),
                created_by,
              }
            },
            $set: { 
              case_current_status: "Hand over non settlement"
            }
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
      else if(handover_non_settlement == "no"){
        if ((request_id || request_type  || intraction_id) || (request_id != "" || request_type != "" || intraction_id != "")) {
          if (!request_id || !request_type || !intraction_id) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ 
              status: "error",
              message: "Missing required fields: request_id, request_type, intraction_id" 
            });
          }
          if (customer_available == "no") {
            const dynamicParams = {
              case_id,
              drc_id,
              ro_id,
              request_id,
              request_type,
              request_comment,
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
              { case_id: case_id }, 
              { 
                $push: { 
                  mediation_board: {
                      drc_id,
                      ro_id,
                      created_dtm: new Date(),
                      mediation_board_calling_dtm: next_calling_date,
                      customer_available,
                      comment,
                  },
                  ro_requests: {
                      drc_id,
                      ro_id,
                      created_dtm: new Date(),
                      ro_request_id: request_id,
                      ro_request: request_type,
                      intraction_id: intraction_id,
                      intraction_log_id,
                  },
                  case_status: {
                      case_status: "rrrrrrrr", 
                      created_dtm: new Date(),
                      created_by,
                  }
                },
                $set: { 
                    case_current_status: "rrrrrrr"
                }
              },
              { new: true, session }
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
          else if(customer_available == "yes"){
            if(!settle){
              return res.status(400).json({ 
                status: "error",
                message: "Missing required fields: customer settle" 
              });
            };
            if(settle == "no"){
              const dynamicParams = {
                case_id,
                drc_id,
                ro_id,
                request_id,
                request_type,
                request_comment,
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
                { case_id: case_id }, 
                { 
                  $push: { 
                    mediation_board: {
                        drc_id,
                        ro_id,
                        created_dtm: new Date(),
                        mediation_board_calling_dtm: next_calling_date,
                        customer_available,
                        comment,
                        agree_to_settle:settle,
                        customer_response:fail_reason,
                    },
                    ro_requests: {
                        drc_id,
                        ro_id,
                        created_dtm: new Date(),
                        ro_request_id: request_id,
                        ro_request: request_type,
                        intraction_id: intraction_id,
                        intraction_log_id,
                    },
                    case_status: {
                        case_status: "zzzzzzzz", 
                        created_dtm: new Date(),
                        created_by,
                    }
                  },
                  $set: { 
                      case_current_status: "zzzzzzzz"
                  }
                },
                { new: true, session }
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
              const dynamicParams = {
                case_id,
                drc_id,
                ro_id,
                request_id,
                request_type,
                request_comment,
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
                { case_id: case_id }, 
                { 
                  $push: { 
                    mediation_board: {
                        drc_id,
                        ro_id,
                        created_dtm: new Date(),
                        mediation_board_calling_dtm: next_calling_date,
                        customer_available,
                        comment,
                        agree_to_settle:settle,
                    },
                    ro_requests: {
                        drc_id,
                        ro_id,
                        created_dtm: new Date(),
                        ro_request_id: request_id,
                        ro_request: request_type,
                        intraction_id: intraction_id,
                        intraction_log_id,
                    },
                    case_status: {
                        case_status: "yyyyyyy", 
                        created_dtm: new Date(),
                        created_by,
                    }
                  },
                  $set: { 
                      case_current_status: "yyyyyyy"
                  }
                },
                { new: true, session }
              );
              if (!updatedCase) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ 
                  status: "error",
                  message: 'Case not found this case id' 
                });
              }else{
                // call the setlement API
              };
            }
          }
        }
        else{
          if (customer_available == "no") {
            const updatedCase = await Case_details.findOneAndUpdate(
              { case_id: case_id }, 
              { 
                $push: { 
                  mediation_board: {
                      drc_id,
                      ro_id,
                      created_dtm: new Date(),
                      mediation_board_calling_dtm: next_calling_date,
                      customer_available,
                      comment,
                  },
                  case_status: {
                      case_status: "ttttt", 
                      created_dtm: new Date(),
                      created_by,
                  }
                },
                $set: { 
                    case_current_status: "ttttt"
                }
              },
              { new: true, session }
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
          else if(customer_available == "yes"){
            if(!settle){
              return res.status(400).json({ 
                status: "error",
                message: "Missing required fields: customer settle" 
              });
            };
            if(settle == "no"){
              const updatedCase = await Case_details.findOneAndUpdate(
                { case_id: case_id }, 
                { 
                  $push: { 
                    mediation_board: {
                        drc_id,
                        ro_id,
                        created_dtm: new Date(),
                        mediation_board_calling_dtm: next_calling_date,
                        customer_available,
                        comment,
                        agree_to_settle:settle,
                        customer_response:fail_reason,
                    },
                    case_status: {
                        case_status: "bbbbb", 
                        created_dtm: new Date(),
                        created_by,
                    }
                  },
                  $set: { 
                      case_current_status: "bbbbb"
                  }
                },
                { new: true, session }
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
              const updatedCase = await Case_details.findOneAndUpdate(
                { case_id: case_id }, 
                { 
                  $push: { 
                    mediation_board: {
                        drc_id,
                        ro_id,
                        created_dtm: new Date(),
                        mediation_board_calling_dtm: next_calling_date,
                        customer_available,
                        comment,
                        agree_to_settle:settle,
                    },
                    case_status: {
                        case_status: "ccccc", 
                        created_dtm: new Date(),
                        created_by,
                    }
                  },
                  $set: { 
                      case_current_status: "ccccc"
                  }
                },
                { new: true, session }
              );
              if (!updatedCase) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ 
                  status: "error",
                  message: 'Case not found this case id' 
                });
              }else{
                // call the setlement API
              };
            }
          }
        }
      }
      else{
        return res.status(400).json({ 
          status: "error",
          message: "handover non settlement value is not valid" 
        });
      }
    }
    else{
      if ((request_id || request_type  || intraction_id) || (request_id != "" || request_type != "" || intraction_id != "")) {
        if (!request_id || !request_type || !intraction_id) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ 
            status: "error",
            message: "Missing required fields: request_id, request_type, intraction_id" 
          });
        }
        if (customer_available == "no") {
          const dynamicParams = {
            case_id,
            drc_id,
            ro_id,
            request_id,
            request_type,
            request_comment,
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
            { case_id: case_id }, 
            { 
              $push: { 
                mediation_board: {
                    drc_id,
                    ro_id,
                    created_dtm: new Date(),
                    mediation_board_calling_dtm: next_calling_date,
                    customer_available,
                    comment,
                },
                ro_requests: {
                    drc_id,
                    ro_id,
                    created_dtm: new Date(),
                    ro_request_id: request_id,
                    ro_request: request_type,
                    intraction_id: intraction_id,
                    intraction_log_id,
                },
                case_status: {
                    case_status: "rrrrrrrr", 
                    created_dtm: new Date(),
                    created_by,
                }
              },
              $set: { 
                  case_current_status: "rrrrrrr"
              }
            },
            { new: true, session }
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
        else if(customer_available == "yes"){
          if(!settle){
            return res.status(400).json({ 
              status: "error",
              message: "Missing required fields: customer settle" 
            });
          };
          if(settle == "no"){
            const dynamicParams = {
              case_id,
              drc_id,
              ro_id,
              request_id,
              request_type,
              request_comment,
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
              { case_id: case_id }, 
              { 
                $push: { 
                  mediation_board: {
                      drc_id,
                      ro_id,
                      created_dtm: new Date(),
                      mediation_board_calling_dtm: next_calling_date,
                      customer_available,
                      comment,
                      agree_to_settle:settle,
                      customer_response:fail_reason,
                  },
                  ro_requests: {
                      drc_id,
                      ro_id,
                      created_dtm: new Date(),
                      ro_request_id: request_id,
                      ro_request: request_type,
                      intraction_id: intraction_id,
                      intraction_log_id,
                  },
                  case_status: {
                      case_status: "zzzzzzzz", 
                      created_dtm: new Date(),
                      created_by,
                  }
                },
                $set: { 
                    case_current_status: "zzzzzzzz"
                }
              },
              { new: true, session }
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
            const dynamicParams = {
              case_id,
              drc_id,
              ro_id,
              request_id,
              request_type,
              request_comment,
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
              { case_id: case_id }, 
              { 
                $push: { 
                  mediation_board: {
                      drc_id,
                      ro_id,
                      created_dtm: new Date(),
                      mediation_board_calling_dtm: next_calling_date,
                      customer_available,
                      comment,
                      agree_to_settle:settle,
                  },
                  ro_requests: {
                      drc_id,
                      ro_id,
                      created_dtm: new Date(),
                      ro_request_id: request_id,
                      ro_request: request_type,
                      intraction_id: intraction_id,
                      intraction_log_id,
                  },
                  case_status: {
                      case_status: "yyyyyyy", 
                      created_dtm: new Date(),
                      created_by,
                  }
                },
                $set: { 
                    case_current_status: "yyyyyyy"
                }
              },
              { new: true, session }
            );
            if (!updatedCase) {
              await session.abortTransaction();
              session.endSession();
              return res.status(404).json({ 
                status: "error",
                message: 'Case not found this case id' 
              });
            }else{
              // call the setlement API
            };
          }
        }
      }
      else{
        if (customer_available == "no") {
          const updatedCase = await Case_details.findOneAndUpdate(
            { case_id: case_id }, 
            { 
              $push: { 
                mediation_board: {
                    drc_id,
                    ro_id,
                    created_dtm: new Date(),
                    mediation_board_calling_dtm: next_calling_date,
                    customer_available,
                    comment,
                },
                case_status: {
                    case_status: "ttttt", 
                    created_dtm: new Date(),
                    created_by,
                }
              },
              $set: { 
                  case_current_status: "ttttt"
              }
            },
            { new: true, session }
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
        else if(customer_available == "yes"){
          if(!settle){
            return res.status(400).json({ 
              status: "error",
              message: "Missing required fields: customer settle" 
            });
          };
          if(settle == "no"){
            const updatedCase = await Case_details.findOneAndUpdate(
              { case_id: case_id }, 
              { 
                $push: { 
                  mediation_board: {
                      drc_id,
                      ro_id,
                      created_dtm: new Date(),
                      mediation_board_calling_dtm: next_calling_date,
                      customer_available,
                      comment,
                      agree_to_settle:settle,
                      customer_response:fail_reason,
                  },
                  case_status: {
                      case_status: "bbbbb", 
                      created_dtm: new Date(),
                      created_by,
                  }
                },
                $set: { 
                    case_current_status: "bbbbb"
                }
              },
              { new: true, session }
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
            const updatedCase = await Case_details.findOneAndUpdate(
              { case_id: case_id }, 
              { 
                $push: { 
                  mediation_board: {
                      drc_id,
                      ro_id,
                      created_dtm: new Date(),
                      mediation_board_calling_dtm: next_calling_date,
                      customer_available,
                      comment,
                      agree_to_settle:settle,
                  },
                  case_status: {
                      case_status: "ccccc", 
                      created_dtm: new Date(),
                      created_by,
                  }
                },
                $set: { 
                    case_current_status: "ccccc"
                }
              },
              { new: true, session }
            );
            if (!updatedCase) {
              await session.abortTransaction();
              session.endSession();
              return res.status(404).json({ 
                status: "error",
                message: 'Case not found this case id' 
              });
            }else{
              // call the setlement API
            };
          }
        }
      }
    }
  }
  catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ 
      status:"error",
      message: "Server error", 
      error: error.message 
    }); 
  }
}

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
    let query = { "drc.removed_dtm": null };

    if (drc_id) query["drc.drc_id"] = Number(drc_id);
    if (case_id) query["case_id"] = Number(case_id);
    if (account_no) query["account_no"] = String(account_no);

    const caseDetails = await Case_details.find(query, {
      case_id: 1,
      case_current_status: 1,
      account_no: 1,
      current_arrears_amount: 1,
      created_dtm: 1,
      end_dtm: 1,
      case_status: 1,
      _id: 0,
    }).lean();

    if (!caseDetails || caseDetails.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No Case Details Found.",
        errors: {
          code: 404,
          description: "No data available for the provided parameters.",
        },
      });
    }

    const invalidStatuses = ["MB Fail with Non-Settlement"];
    const expireStatuses = ["Abandoned", "Withdraw", "Case Close", "Pending Write-Off", "Write-Off"];

    let filteredCaseDetails = caseDetails.map((detail) => {
      if (Array.isArray(detail.case_status) && detail.case_status.length > 0) {
        let lastStatus = detail.case_status.at(-1);
        if (lastStatus) {
          if (invalidStatuses.includes(lastStatus.case_status)) {
            return null; // Filter out cases with invalid statuses
          }
          if (expireStatuses.includes(lastStatus.case_status)) {
            detail.end_dtm = lastStatus.created_dtm;
          }
        }
      }
      return detail;
    }).filter(Boolean);

    console.log("Filtered cases:", filteredCaseDetails);

    // Apply date range filter if from_date and to_date are provided
    if (from_date && to_date) {
      const fromDate = new Date(from_date);
      const endDate = new Date(to_date);
      filteredCaseDetails = filteredCaseDetails.filter((detail) => {
        if (detail.created_dtm) {
          const createdDate = new Date(detail.created_dtm);
          return createdDate >= fromDate && createdDate <= endDate;
        }
        return false;
      });
    }

    res.status(200).json({
      status: "success",
      message: "Case details retrieved successfully.",
      Cases: filteredCaseDetails.map(detail => ({
        ...detail,
        end_dtm: detail.end_dtm || " "
      })),
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

export const listDRCAllCases = async (req, res) => {
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

        return {
          case_id: caseData.case_id,
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

// get CaseDetails for MediationBoard 
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
      case_id: case_id,
      "drc.drc_id": drc_id,
    },
    { case_id: 1, 
      case_current_status: 1, 
      ro_cpe_collect:1, 
      customer_ref: 1, 
      account_no: 1, 
      current_arrears_amount: 1, 
      contact: 1, 
      rtom: 1,
      ref_products:1,
      last_payment_date: 1,
      drc: 1, 
      ro_negotiation:1,settle:1, 
      money_transactions:1, 
      ro_requests: 1}
    ).lean();  // Using lean() for better performance

    if (!caseDetails) {
      return res.status(404).json({
        status: "error",
        message: "Case not found or DRC ID doesn't match.",
        errors: {
          code: 404,
          description: "No case found with the provided Case ID and DRC ID combination.",
        },
      });
    }

    // const formattedCaseDetails = {
    //   case_id: caseDetails.case_id,
    //   customer_ref: caseDetails.customer_ref,
    //   account_no: caseDetails.account_no,
    //   current_arrears_amount: caseDetails.current_arrears_amount,
    //   last_payment_date: caseDetails.last_payment_date,
    //   contactDetails: caseDetails.current_contact,

    // };

    return res.status(200).json({
      status: "success",
      message: "Case details retrieved successfully.",
      data: caseDetails
    });

  } catch (err) {
    console.error("Detailed error:", {
      message: err.message,
      stack: err.stack,
      name: err.name
    });

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

// List  All Active Mediation RO Requests from SLT
// export const ListActiveRORequests = async (req, res) => {
//   try {
//     // Get request_mode from either body (POST) or query (GET)
//     const request_mode = req.method === 'POST' ? req.body.request_mode : req.query.request_mode;
    
//     let query = { end_dtm: null };
    
//     if (request_mode) {
//       query.request_mode = request_mode;
//     }

//     const ro_requests = await Template_RO_Request.find(query);

//     if (ro_requests.length === 0) {
//       return res.status(404).json({
//         status: "error",
//         message: request_mode 
//           ? `No active RO requests found with request_mode: ${request_mode}.`
//           : "No active RO requests found.",
//       });
//     }

//     // Return only the matching records

//     return res.status(200).json({
//       status: "success",
//       message: request_mode
//         ? `Active RO requests with mode '${request_mode}' retrieved successfully.`
//         : "Active RO request details retrieved successfully.",
//       data: ro_requests,
//     });
//   } catch (error) {
//     console.error("Unexpected error:", error.message);
//     return res.status(500).json({
//       status: "error",
//       message: "Internal server error occurred while fetching active RO details.",
//       error: error.message,
//     });
//   }
// };

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

export const Create_Task_For_Assigned_drc_case_list_download = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { drc_id, case_id, account_no, from_date, to_date, Created_By } = req.body;

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
      drc_id,
      case_id,
      account_no,
      from_date: from_date && !isNaN(new Date(from_date)) ? new Date(from_date).toISOString() : null,
      to_date: to_date && !isNaN(new Date(to_date)) ? new Date(to_date).toISOString() : null,
      Created_By,
      task_status: "open"
    };

    // Pass parameters directly (without nesting it inside another object)
    const taskData = {
      Template_Task_Id: 35,
      task_type: "Create task for download the Assigned DRC's case list when selected date range is higher that one month",
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

// Fetches detailed information about a case.
// export const drcCaseDetails = async (req, res) => {
//   const case_id = req.body.case_id;

//   try {
//     // Check if case_id is missing
//     if (!case_id) {
//       return res.status(400).json({ error: "Case ID is required." });
//     }
//     // Find case details in the database using the case_id
//     const caseDetails = await Case_details.findOne({ case_id }).lean();
//     // Check if case details were found
//     if (!caseDetails) {
//       return res.status(404).json({ error: "Case not found." });
//     }
//     // Return the case details in the response
//     res.status(200).json({
//       caseId: caseDetails.case_id,
//       customerRef: caseDetails.customer_ref,
//       accountNo: caseDetails.account_no,
//       arrearsAmount: caseDetails.current_arrears_amount,
//       lastPaymentDate: caseDetails.last_payment_date,
//       contactDetails: caseDetails.current_contact,
//     });
//   } catch (error) {
//     console.error("Error fetching case details:", error);
//     res.status(500).json({ error: "Internal server error." });
//   }
// };


// Updates DRC case details with new contact information and remarks.
export const updateDrcCaseDetails = async (req, res) => {
  try {
    // Extract fields from the request body
    const { drc_id, ro_id, case_id, mob, email, nic, lan , address, remark } = req.body;

    // Validate if case_id is provided
    if (!case_id || !drc_id || !ro_id) {
      return res.status(400).json({ error: "case_id, drc_id or ro_id is required" });
    }

    // Fetch case details from the database
    const caseDetails = await Case_details.findOne({ case_id, "drc.drc_id": drc_id, "drc.recovery_officers.ro_id": ro_id });
    if (!caseDetails) {
      return res.status(404).json({ error: "Case not found" });
    }

    // Check for duplicate mobile in ro_edited_customer_details array
    const isDuplicateMobile = caseDetails.ro_edited_customer_details.some(
      (contact) => contact.mob === mob
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
    const isDuplicateNIC = caseDetails.ro_edited_customer_details.some(
      (contact) => contact.nic === nic
    );
    
    if (isDuplicateNIC) {
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
      // ro_id:  "125" ,
      // drc_id: "2365",
      edited_dtm: new Date(),
      mob: mob,
      email: email,
      nic: nic,
      lan: lan,
      address: address,
      geo_location: null,
      remark: remark,
    };
    // Schema for current contact details
    const contactsSchema ={
      mob: mob,
      email: email,
      nic: nic,
      lan: lan,
      address: address,
      geo_location: null,
    };

    // Prepare update data
    const updateData = {};
    // Add edited contact details to the update data
    if (editedcontactsSchema) {
      updateData.$push = updateData.$push || {};
      updateData.$push.ro_edited_customer_details = [editedcontactsSchema];
      console.log("updateData.contact", updateData);
    }

    // Update remark array
    if (contactsSchema) {
      updateData.$set = updateData.$set || {};
      updateData.$set.current_contact = [contactsSchema];
      console.log("updateData.remark", updateData);
    }

    // Perform the update in the database
    const updatedCase = await Case_details.findOneAndUpdate(
      { case_id }, // Match the document by case_id
      updateData,
      { new: true, runValidators: true }
    );

    console.log("Updated case", updatedCase);
    return res.status(200).json(updatedCase);
  } catch (error) {
    console.error("Error updating case", error);
    return res.status(500).json({ error: "Failed to update the case" });
  }
};

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
    try {
        const { approver_reference, remark, remark_edit_by, created_by } = req.body;

        if (!approver_reference || !remark || !remark_edit_by || !created_by) {
            return res.status(400).json({ message: "All required fields must be provided." });
        }

        const currentDate = new Date();
        const deligate_id = 9;

        const newDocument = new TmpForwardedApprover({
            approver_reference,
            created_by,
            approver_type: "Case Withdrawal Approval",
            approve_status: [{
                status: "Pending Case Withdrawal",
                status_date: new Date(),
                status_edit_by: created_by,
            }],
            remark: [{
                remark,
                remark_date: new Date(),
                remark_edit_by,
            }]
        });

        await newDocument.save();

            // --- Create User Interaction Log ---
        const interaction_id = 6; //this must be chage
        const request_type = "Pending Approval Agent Destribution"; 
        const create_by = created_by;
        const dynamicParams = { approver_reference };

        const interactionResult = await createUserInteractionFunction({
          Interaction_ID: interaction_id,
          User_Interaction_Type: request_type,
          delegate_user_id: deligate_id,  
          Created_By: create_by,
          User_Interaction_Status: "Open",
          User_Interaction_Status_DTM: currentDate,
          Request_Mode: "Negotiation", 
          ...dynamicParams,
        });



        return res.status(201).json({ message: "Case withdrawal request added successfully", data: newDocument });
    } catch (error) {
        console.error("Error withdrawing case:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const List_All_DRCs_Mediation_Board_Cases = async (req, res) => {
  try {
    const { case_current_status, From_DAT, To_DAT, rtom, drc } = req.body;

    const allowedStatuses = [
      "Forward to Mediation Board",
      "MB Negotiation",
      "MB Request Customer-Info",
      "MB Handover Customer-Info",
      "MB Settle Pending",
      "MB Settle Open-Pending",
      "MB Settle Active",
      "MB Fail with Pending Non-Settlement"
    ];

    let query = {};

   
    if (Object.keys(req.body).length > 0) {
      query.case_current_status = { $in: allowedStatuses };

      if (From_DAT && To_DAT) {
        const from = new Date(From_DAT);
        from.setUTCHours(0, 0, 0, 0);
        const to = new Date(To_DAT);
        to.setUTCHours(23, 59, 59, 999);
        query.created_dtm = { $gte: from, $lte: to };
      }
      if (rtom) {
        query.rtom = rtom;
      }
      if (drc) {
        query.drc = drc;
      }
    }

   
    let cases = await Case_details.find(query).sort({ created_dtm: -1 });


const processedCases = cases.map((caseItem) => {
const mediationBoardEntries = caseItem.mediation_board || [];

const roRequestEntries = caseItem.ro_requests || [];

const lastMediationBoardEntry =
  mediationBoardEntries.length > 0
    ? mediationBoardEntries[mediationBoardEntries.length - 1]
    : null;

          const lastRoRequestEntry = roRequestEntries.length > 0
              ? roRequestEntries[roRequestEntries.length - 1]
              : null;
return {
  ...caseItem._doc,
  latest_next_calling_dtm: lastMediationBoardEntry
    ? lastMediationBoardEntry.mediation_board_calling_dtm || null
    : null,
  mediation_board_call_count: mediationBoardEntries.length,
  drc_name: caseItem.drc.length > 0 ? caseItem.drc[0].drc_name : null,
  customer_available: lastMediationBoardEntry?.customer_available || null,
  agree_to_settle: lastMediationBoardEntry?.agree_to_settle || null,
  comment: lastMediationBoardEntry?.comment || null,
  customer_response: lastMediationBoardEntry?.customer_response || null,
  ro_request_created_dtm: lastRoRequestEntry?.created_dtm || null,
  ro_request: lastRoRequestEntry?.ro_request || null,
  request_remark: lastRoRequestEntry?.request_remark || null,
};
});

    return res.status(200).json({
      status: "success",
      message: "Mediation Board cases retrieved successfully.",
      data: processedCases,
    });
  } catch (error) {
    console.error("Error fetching Mediation Board cases:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "An unexpected error occurred.",
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
      };

     
      caseRecord.case_status.push(newCaseStatus);

      
      await caseRecord.save();

      
      return res.status(200).json({ message: 'Mediation board data updated successfully', caseRecord });

  } catch (error) {
      
      return res.status(500).json({ message: 'Server error', error: error.message });
  }
};


export const ListRequestLogFromRecoveryOfficers = async (req, res) => {
  try {
      const { delegate_user_id, User_Interaction_Type, "Request Accept": requestAccept, date_from, date_to } = req.body;
      
      if (!delegate_user_id) {
          return res.status(400).json({ message: "delegate_user_id is required" });
      }
      
      let filter = { delegate_user_id };
      
      if (User_Interaction_Type) {
          filter.User_Interaction_Type = User_Interaction_Type;
      }
      
      if (date_from && date_to) {
          filter.CreateDTM = { $gte: new Date(date_from), $lte: new Date(date_to) };
      }
      
      // Step 1: Fetch documents from User_Interaction_Log
      const interactionLogs = await User_Interaction_Log.find(filter);
      
      if (!interactionLogs.length) {
          return res.status(404).json({ message: "No matching interactions found." });
      }
      
      // Step 2: Fetch matching Request records based on Interaction_Log_ID
      const interactionLogIds = interactionLogs.map(log => log.Interaction_Log_ID);
      const requests = await Request.find({ RO_Request_Id: { $in: interactionLogIds } });
      
      // Step 3: Filter User_Interaction_Log based on Request Accept status
      let filteredInteractionLogs = interactionLogs;
      
      if (requestAccept) {
          filteredInteractionLogs = interactionLogs.filter(log => {
              const matchingRequest = requests.find(req => req.RO_Request_Id === log.Interaction_Log_ID);
              if (!matchingRequest) return false;
              
              const requestAcceptStatus = matchingRequest.parameters?.get("Request Accept");
              return (requestAccept === "Approve" && requestAcceptStatus === "Yes") ||
                     (requestAccept === "Reject" && requestAcceptStatus === "No");
          });
      }
      
      if (!filteredInteractionLogs.length) {
          return res.status(404).json({ message: "No matching approved/rejected requests found." });
      }
      
      // Step 4: Fetch related case details
      const caseIds = filteredInteractionLogs.map(log => log.parameters?.get("case_id"));
      const caseDetails = await Case_details.find({ case_id: { $in: caseIds } }, {
          case_id: 1,
          case_current_status: 1,
          current_arrears_amount: 1,
          drc: 1,
          created_dtm: 1,
          monitor_months: 1
      });
      
      // Step 5: Prepare the final response with separate entries per DRC
      let responseData = [];
      
      filteredInteractionLogs.forEach(log => {
          const relatedCase = caseDetails.find(caseDoc => caseDoc.case_id === log.parameters?.get("case_id"));
          
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
          
          const matchingRequest = requests.find(req => req.RO_Request_Id === log.Interaction_Log_ID);
          const approveStatus = matchingRequest?.parameters?.get("Request Accept") || "Unknown";
          
          if (relatedCase?.drc?.length) {
              relatedCase.drc.forEach(drc => {
                  responseData.push({
                      ...log.toObject(),
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
                      Approve_Status: approveStatus
                  });
              });
          } else {
              responseData.push({
                  ...log.toObject(),
                  case_details: {
                      case_id: relatedCase?.case_id,
                      case_current_status: relatedCase?.case_current_status,
                      current_arrears_amount: relatedCase?.current_arrears_amount,
                      drc: []
                  },
                  Validity_Period: validityPeriod,
                  Approve_Status: approveStatus
              });
          }
      });
      
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
      const updatedCase = await Case_details.findOneAndUpdate(
        { case_id: case_id }, 
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
            },
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
    // const currentDate = new Date();
    // const activeNegotiations = await Field_Reasons.find
    // ({
    //   end_dtm: { $gte: currentDate },
    // })
    // .select("negotiation_id negotiation_description end_dtm");

    const activeNegotiations = await TemplateNegotiation.find();
    console.log("field reason ", activeNegotiations);
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
    if (ro_requests.length === 0) {
      return res.status(404).json({
        status: "error",
        message: `No active RO requests found with request_mode: ${request_mode}.`
      });
    }
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


// money transactions
export const getAllPaymentCases = async (req, res) => {
  try {
    // Get parameters from request body
    const { 
      case_id, 
      account_num, 
      settlement_phase, 
      from_date, 
      to_date, 
      page = 1, 
      limit = 10, 
      recent = false 
    } = req.body;
    
    // Default query parameters
    const query = {};
    let pageNum = Number(page);
    let limitNum = Number(limit);
    
    // Apply filters if they exist
    if (case_id) query.case_id = Number(case_id);
    if (account_num) query.account_num = account_num;
    if (settlement_phase) query.settlement_phase = settlement_phase;
    if (from_date && to_date) {
      query.$and.push({ created_dtm: { $gt: new Date(from_date) } });
      query.$and.push({ created_dtm: { $lt: new Date(to_date) } });
    }
    
    
    const sortOptions = { payment_id: -1 };
    
    // If recent is true, limit to 10 latest entries and ignore pagination
    if (recent === true) {
      limitNum = 10;
      pageNum = 1;
      // Clear any filters if we just want recent payments
      Object.keys(query).forEach(key => delete query[key]);
    }
    
    // Calculate skip for pagination
    const skip = (pageNum - 1) * limitNum;
    
    // Execute query with descending sort
    const payments = await CasePayments.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);
    
    // Format response data - include all fields from model
    const formattedPayments = payments.map(payment => {
      // Convert Mongoose document to plain object
      const paymentObj = payment.toObject();
      
      // Format date fields for better readability
      if (paymentObj.created_dtm) {
        paymentObj.created_dtm = paymentObj.created_dtm.toISOString();
      }
      
      if (paymentObj.bill_paid_date) {
        paymentObj.bill_paid_date = paymentObj.bill_paid_date.toISOString();
      }
      
      // Return all fields from model
      return {
        Payment_ID: paymentObj.payment_id,
        Case_ID: paymentObj.case_id,
        Created_DTM: paymentObj.created_dtm,
        Settlement_ID: paymentObj.settlement_id || '-',
        Installment_Seq: paymentObj.installment_seq || '-',
        Bill_Payment_Seq: paymentObj.bill_payment_seq || '-',
        Bill_Paid_Amount: paymentObj.bill_paid_amount || '-',
        Bill_Paid_Date: paymentObj.bill_paid_date || '-',
        Bill_Payment_Status: paymentObj.bill_payment_status || '-',
        Bill_Payment_Type: paymentObj.bill_payment_type || '-',
        Settled_Balance: paymentObj.settled_balance || '-',
        Cumulative_Settled_Balance: paymentObj.cumulative_settled_balance || '-',
        Account_No: paymentObj.account_num || '-',
        Settlement_Phase: paymentObj.settlement_phase || '-'
      };
    });
    
    // Prepare response data
    const responseData = {
      message: recent === true 
        ? 'Recent case payments retrieved successfully' 
        : 'Case payments retrieved successfully',
      data: formattedPayments,
    };
    
    // Add pagination info if not in recent mode
    if (recent !== true) {
      const total = await CasePayments.countDocuments(query);
      responseData.pagination = {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      };
    } else {
      responseData.total = formattedPayments.length;
    }
    
    return res.status(200).json(responseData);
    
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};