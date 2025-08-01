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
import axios from "axios";
import db from "../config/db.js";
import Case_details from "../models/Case_details.js";
import Case_transactions from "../models/Case_transactions.js";
import System_Case_User_Interaction from "../models/User_Interaction.js";
import {Check_valid_approval} from "../services/ApprovalService.js"
import SystemTransaction from "../models/System_transaction.js";
import RecoveryOfficer from "../models/Recovery_officer.js";
import CaseDistribution from "../models/Case_distribution_drc_transactions.js";
import CaseSettlement from "../models/Case_settlement.js";
import drc_agreement from "../models/DRC_Agreement_details.js";
// import CasePayments from "../models/Case_payments.js";
import Money_transactions from "../models/Money_transactions.js";
import Template_RO_Request from "../models/Template_RO_Request .js";
import Template_Mediation_Board from "../models/Template_mediation_board.js";
import TemplateNegotiation from "../models/Template_negotiation.js";
import moment from "moment";
import mongoose from "mongoose";
import { createUserInteractionFunction } from "../services/UserInteractionService.js";
import { createTaskFunction } from "../services/TaskService.js";
import Case_distribution_drc_transactions from "../models/Case_distribution_drc_transactions.js";
import { getUserIdOwnedByDRCId } from "../controllers/DRC_controller.js";
import tempCaseDistribution from "../models/Case_distribution_drc_details.js";
import TmpForwardedApprover from "../models/Template_forwarded_approver.js";
import caseDistributionDRCSummary from "../models/Case_distribution_drc_summary.js";
import DRC from "../models/Debt_recovery_company.js";
import User_Interaction_Log from "../models/User_Interaction_Log.js";
import Request from "../models/Request.js";
import Tmp_SLT_Approval from "../models/Tmp_SLT_Approval.js"; // Import the model directly
import { getApprovalUserIdService } from "../services/ApprovalService.js";
import { getBatchApprovalUserIdService } from "../services/ApprovalService.js";
import Incident from "../models/Incident.js";
import CaseMonitor from "../models/Case_Monitor.js";
import CaseMonitorLog from "../models/Case_Monitor_Log.js";
import { ro } from "date-fns/locale";
import User_Interaction_Progress_Log from "../models/User_Interaction_Progress_Log.js";
import CaseDetails from "../models/Case_details.js";
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
      .collection("collection_sequence")
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
      case_id: case_id,
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
};

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
  const { case_current_status, fromDate, toDate } = req.body;

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
          current_case_phase: "Abnormal",
        },
        $push: {
          abnormal_stop: {
            remark: `Case marked as ${Action}`,
            done_by: Done_By,
            done_on: moment().toDate(),
            action: Action,
          },
          case_status: {
            case_status: "Abandaned",
            created_dtm: new Date(),
            created_by: Done_By,
            case_phase: "Abnormal",
          },
        },
      },
      { new: true, runValidators: true }
    );

    const mongoConnection = await mongoose.connection;
    const counterResult = await mongoConnection
      .collection("collection_sequence")
      .findOneAndUpdate(
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
            action: "Abandaned Approved",
          },
          case_status: {
            case_status: "Abandaned Approved",
            created_dtm: new Date(),
            created_by: Done_By,
            case_phase: "Abnormal",
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
      new Date(current.created_dtm) > new Date(latest.created_dtm)
        ? current
        : latest
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
  const { Rule, From_Date, To_Date } = req.body;
  const fromDate = new Date(`${From_Date}T00:00:00.000Z`);
  const toDate = new Date(`${To_Date}T23:59:59.999Z`);

  if (!Rule || !From_Date || !To_Date) {
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
      case_current_status: "Open No Agent",
      drc_commision_rule: Rule,
      created_dtm: {
        $gte: fromDate,
        $lte: toDate,
      },
    }).select(
      "case_id created_dtm account_no area rtom current_arrears_amount case_current_status filtered_reason drc_selection_rule"
    );
    const f1Filter = noAgent.filter((caseData) => {
      return (
        caseData.filtered_reason !== null && caseData.filtered_reason !== ""
      );
    });
    const directLD = noAgent.filter((caseData) => {
      return (
        caseData.current_arrears_amount <= 5000 &&
        caseData.current_arrears_amount >= 1000
      );
    });
    return res.status(200).json({
      status: "success",
      message: `Successfully retrieved Open No Agent - ${Rule} details.`,
      data: {
        No_Agent_Cases: noAgent,
        F1_Filter: f1Filter,
        Direct_LD: directLD,
      },
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
};

export const openNoAgentCountArrearsBandByServiceType = async (req, res) => {
  const { Rule } = req.body;

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
    const details = await Case_details.find({
      case_current_status: "Open No Agent",
      drc_commision_rule: Rule,
    });

    const arrearsBandCounts = details.reduce((counts, detail) => {
      const band = detail.arrears_band;
      counts[band] = (counts[band] || 0) + 1;
      return counts;
    }, {});

    return res.status(200).json({
      status: "success",
      message: `Successfully retrieved arrears band counts for rule - ${Rule}.`,
      data: arrearsBandCounts,
    });
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
};

export const listCases = async (req, res) => {
  try {
    const { From_Date, To_Date } = req.body;
    const fromDate = new Date(`${From_Date}T00:00:00.000Z`);
    const toDate = new Date(`${To_Date}T23:59:59.999Z`);

    if (!From_Date || !To_Date) {
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
      });
    }

    const openNoAgent = await Case_details.find({
      case_current_status: "Open No Agent",
      $or: [
        { filtered_reason: null },
        { filtered_reason: "" },
        { filtered_reason: { $regex: /^\s*$/ } },
      ],
      created_dtm: {
        $gte: fromDate,
        $lte: toDate,
      },
    }).select(
      "case_id created_dtm account_no area rtom current_arrears_amount case_current_status filtered_reason drc_selection_rule"
    );

    return res.status(200).json({
      status: "success",
      message: `Successfully retrieved  cases.`,
      data: {
        mongoData: openNoAgent,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve Open No Agent cases.",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }
};

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
    const excludedStatuses = [
      "Write_Off",
      "Abandoned",
      "Case_Close",
      "Withdraw",
    ];
    const activeCases = cases.filter((caseData) => {
      const { case_status } = caseData;

      if (!case_status || case_status.length === 0) {
        return false; // Exclude cases with no status
      }

      // Find the latest status based on created_dtm
      const latestStatus = case_status.reduce((latest, current) =>
        new Date(current.created_dtm) > new Date(latest.created_dtm)
          ? current
          : latest
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
          case_current_status: case_status,
          case_distribution_batch_id: null,
        },
      },
      {
        $group: {
          _id: "$drc_commision_rule",
          case_count: { $sum: 1 },
        },
      },
      {
        $project: {
          drc_commision_rule: "$_id",
          case_count: 1,
          _id: 0,
        },
      },
    ]);
    const totalRules = casesCount.length;
    return res.status(200).json({
      status: "success",
      message:
        "Cases count grouped by drc_commision_rule fetched successfully.",
      metadata: {
        total_rules: totalRules,
      },
      data: casesCount,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch cases count. Please try again later.",
      error: error.message,
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
  const {
    drc_commision_rule,
    current_arrears_band,
    drc_list,
    created_by,
    batch_id,
  } = req.body;

  if (
    !drc_commision_rule ||
    !current_arrears_band ||
    !drc_list ||
    !created_by
  ) {
    return res.status(400).json({
      status: "error",
      message:
        "DRC commission rule, current arrears band, created by and DRC list fields are required.",
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
        if (
          typeof item.DRC !== "string" ||
          typeof item.Count !== "number" ||
          typeof item.DRC_Id !== "number"
        ) {
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
    const { validatedList, batch_seq_rulebase_count } =
      validateDRCList(drc_list);
    const mongo = await db.connectMongoDB();

    // Validation for existing tasks with task_status and specific parameters
    const existingTask = await mongo.collection("System_tasks").findOne({
      // task_status: "Open",
      "parameters.drc_commision_rule": drc_commision_rule,
      "parameters.current_arrears_band": current_arrears_band,
    });

    if (existingTask) {
      const isOpen = existingTask.task_status === "open";
      if (isOpen) {
        return res.status(409).json({
          status: "error",
          message:
            "Already has a open task with this commision rule and arrears band ",
        });
      } else {
        const existingBatch = await mongo
          .collection("Case_distribution_drc_transactions")
          .findOne({
            drc_commision_rule: drc_commision_rule,
            current_arrears_band: current_arrears_band,
          });

        if (existingBatch) {
          if (
            existingBatch.current_batch_distribution_status !==
              "batch_rejected" &&
            existingBatch.current_batch_distribution_status !==
              "batch_distributed" &&
            existingBatch.current_batch_distribution_status !==
              "selection_failed"
          ) {
            return res.status(409).json({
              status: "error",
              message:
                "Already has a processing batch with this commision rule and arrears band.",
            });
          }
        }
      }
    }
    // const counter_result_of_case_distribution_batch_id = await mongo.collection("collection_sequence").findOneAndUpdate(
    //   { _id: "case_distribution_batch_id" },
    //   { $inc: { seq: 1 } },
    //   { returnDocument: "after", upsert: true }
    // );
    // const case_distribution_batch_id = counter_result_of_case_distribution_batch_id.seq; // Use `value` to access the updated document

    // if (!case_distribution_batch_id) {
    //   throw new Error("Failed to generate case_distribution_batch_id.");
    // }
    // const batch_seq_details = [{
    //   batch_seq: 1,
    //   created_dtm: new Date(),
    //   created_by,
    //   action_type: "distribution",
    //   distribution_details: drc_list.map(({ DRC, Count,DRC_Id }) => ({
    //     drc: DRC,
    //     drc_id: DRC_Id,
    //     rulebase_count: Count,
    //   })),
    //   batch_seq_rulebase_count:batch_seq_rulebase_count,
    //   crd_distribution_status:"Open",
    // }];
    // if(batch_id){
    //   const Case_distribution_drc_transactions_data = {
    //     case_distribution_batch_id,
    //     forword_case_distribution_batch_id:batch_id,
    //     batch_seq_details,
    //     created_dtm: new Date(),
    //     created_by,
    //     current_arrears_band,
    //     rulebase_count: batch_seq_rulebase_count,
    //     distribution_status:[{
    //       crd_distribution_status:"rejected_batch_distributed",
    //       created_dtm: new Date(),
    //       created_by:created_by,
    //     }],
    //     drc_commision_rule,
    //     crd_distribution_status_on: new Date(),
    //     crd_distribution_status:"Open",
    //   };
    //   const new_Case_distribution_drc_transaction = new Case_distribution_drc_transactions(Case_distribution_drc_transactions_data);
    //   await new_Case_distribution_drc_transaction.save();
    // } else {
    //   const Case_distribution_drc_transactions_data = {
    //     case_distribution_batch_id,
    //     batch_seq_details,
    //     created_dtm: new Date(),
    //     created_by,
    //     current_arrears_band,
    //     rulebase_count: batch_seq_rulebase_count,
    //     distribution_status:[{
    //     crd_distribution_status:"open",
    //     created_dtm: new Date(),
    //     created_by:created_by,
    //   }],
    //   drc_commision_rule,
    //   crd_distribution_status_on: new Date(),
    //   crd_distribution_status:"Open",
    // };
    //   const new_Case_distribution_drc_transaction = new Case_distribution_drc_transactions(Case_distribution_drc_transactions_data);
    //   await new_Case_distribution_drc_transaction.save();
    // };

    // const payload = {
    //   Created_By: created_by,
    // }

    // const dynamicParams = {
    //   drc_commision_rule,
    //   current_arrears_band,
    // };

    const formattedString = validatedList
      .map((item) => `${item.DRC_Id}:${item.Count}`)
      .join(",");

    let dynamicParams = {};
    let Template_Task_Id; // Default Template Task ID
    let task_type;

    if (batch_id) {
      Template_Task_Id = 52;
      task_type = "Re-Proceed Case Distribution Planning among DRC";
      dynamicParams = {
        drc_commision_rule: drc_commision_rule,
        current_arrears_band: current_arrears_band,
        drc_distribution: formattedString,
        Rejected_distribution_batch_id: batch_id,
      };
    } else {
      Template_Task_Id = 3;
      task_type = "Case Distribution Planning among DRC";
      dynamicParams = {
        drc_commision_rule: drc_commision_rule,
        current_arrears_band: current_arrears_band,
        drc_distribution: formattedString,
      };
    }
    const result = await createTaskFunction({
      Template_Task_Id: Template_Task_Id,
      task_type: task_type,
      Created_By: created_by,
      ...dynamicParams,
    });
    console.log(result);
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
  const { drc_id, rtom, ro_id, arrears_band, from_date, to_date, pages } =
    req.body;

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

    let page = Number(pages);
    if (isNaN(page) || page < 1) page = 1;
    const limit = page === 1 ? 10 : 30;
    const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

    // Ensure at least one optional parameter is provided
    // if (!rtom && !ro_id && !arrears_band && !(from_date && to_date)) {
    //   return res.status(400).json({
    //     status: "error",
    //     message: "At least one filtering parameter is required.",
    //     errors: {
    //       code: 400,
    //       description:
    //         "Provide at least one of rtom, ro_id, arrears_band, or both from_date and to_date together.",
    //     },
    //   });
    // }

    const allowedStatusTypes = [
      "Open With Agent",
      "RO Negotiation",
      "Negotiation Settle Pending",
      "Negotiation Settle Open-Pending",
      "Negotiation Settle Active",
      "RO Negotiation Extension Pending",
      "RO Negotiation Extended",
      "RO Negotiation FMB Pending",
      "Forward to Mediation Board",
      "MB Negotiation",
      "MB Request Customer-Info",
      "MB Handover Customer-Info",
      "MB Settle Pending",
      "MB Settle Open-Pending",
      "MB Settle Active",
      "MB Fail with Pending Non-Settlement",
    ];

    const pipeline = [];

    // Match allowed status
    pipeline.push({
      $match: {
        case_current_status: { $in: allowedStatusTypes },
      },
    });

    // Optional filters
    // if (rtom) {
    //   pipeline.push({ $match: { rtom: rtom } });
    // }
    if (rtom) {
      pipeline.push({
        $match: {
          $expr: {
            $eq: [
              { $trim: { input: { $toLower: "$rtom" } } },
              rtom.toLowerCase().trim()
            ]
          }
        }
      });
    }

    // Add a projection to get the last DRC entry
    pipeline.push({
      $addFields: {
        last_drc: { $arrayElemAt: ["$drc", -1] },
      },
    });

    pipeline.push({
      $match: {
        "last_drc.removed_dtm": null,
        $expr: {
          $gt: ["$last_drc.expire_dtm", new Date()]
        }
      },
    });

    
    pipeline.push({
      $match: {
        "last_drc.drc_id": Number(drc_id),
      },
    });

    if (arrears_band) {
      pipeline.push({
        $match: { arrears_band },
      });
    }

    const dateFilter = {};
    if (from_date) dateFilter.$gte = new Date(from_date);
    if (to_date) {
      const endofDate = new Date(to_date);
      endofDate.setHours(23, 59, 59, 999); //
      dateFilter.$lte = endofDate;
    }

    // pipeline.push({
    //   $addFields: {
    //     last_mediation_board: { $arrayElemAt: ['$mediation_board', -1] }
    //   }
    // });

    if (Object.keys(dateFilter).length > 0) {
      pipeline.push({
        $match: { "last_drc.created_dtm": dateFilter },
      });
    }

    pipeline.push({
      // $addFields: {
      //   last_ro: { $arrayElemAt: ['$last_drc.recovery_officers', -1] }
      // }
      $addFields: {
        last_ro: {
          $cond: {
            if: {
              $and: [
                { $isArray: "$last_drc.recovery_officers" },
                { $gt: [{ $size: "$last_drc.recovery_officers" }, 0] },
              ],
            },
            then: { $arrayElemAt: ["$last_drc.recovery_officers", -1] },
            else: null,
          },
        },
      },
    });

    if (ro_id) {
      pipeline.push({
        $match: {
          "last_ro.ro_id": Number(ro_id),
        },
      });
    }

    // pipeline.push({
    //   $lookup: {
    //     from: "Recovery_officer", // name of the recovery officer collection
    //     localField: "last_ro.ro_id",
    //     foreignField: "ro_id",
    //     as: "recovery_officer",
    //   },
    // });

    // Optionally flatten the result if you expect only one match
    // pipeline.push({
    //   $addFields: {
    //     recovery_officer: { $arrayElemAt: ["$recovery_officer", 0] }
    //   }
    // });



    // Pagination
    pipeline.push({ $sort: { case_id: -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // const filtered_cases = await Case_details.aggregate(pipeline);

    const filtered_cases = await Case_details.aggregate(pipeline);

    // Handle case where no matching cases are found
    // if (filtered_cases.length === 0) {
    //   return res.status(204).json({
    //     status: "error",
    //     message: "No matching cases found for the given criteria.",
    //     errors: {
    //       code: 404,
    //       description: "No cases satisfy the provided criteria.",
    //     },
    //   });
    // }

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
          account_no: caseData.account_no,
          status: caseData.case_current_status,
          created_dtm: caseData.last_drc.created_dtm,
          current_arreas_amount: caseData.current_arrears_amount,
          area: caseData.rtom,
          action_type: caseData.action_type,
          remark: caseData.remark?.[caseData.remark.length - 1]?.remark || null,
          expire_dtm: caseData.last_drc ? caseData.last_drc.expire_dtm : null,
          ro_name: caseData.last_ro ? caseData.last_ro.ro_name : null,
          assigned_date: caseData.last_ro
            ? caseData.last_ro.assigned_dtm
            : null,
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

export const List_Handling_Cases_By_DRC_Without_RO = async (req, res) => {
  const { drc_id, rtom, ro_id, arrears_band, from_date, to_date, pages } =
    req.body;

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

    let page = Number(pages);
    if (isNaN(page) || page < 1) page = 1;
    const limit = page === 1 ? 10 : 30;
    const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

    const allowedStatusTypes = [
      "Open With Agent",
      "RO Negotiation",
      "Negotiation Settle Pending",
      "Negotiation Settle Open-Pending",
      "Negotiation Settle Active",
      "RO Negotiation Extension Pending",
      "RO Negotiation Extended",
      "RO Negotiation FMB Pending",
      "Forward to Mediation Board",
      "MB Negotiation",
      "MB Request Customer-Info",
      "MB Handover Customer-Info",
      "MB Settle Pending",
      "MB Settle Open-Pending",
      "MB Settle Active",
      "MB Fail with Pending Non-Settlement",
    ];

    const pipeline = [];

    // Match allowed status
    pipeline.push({
      $match: {
        case_current_status: { $in: allowedStatusTypes },
      },
    });

    // Optional filters
    // if (rtom) {
    //   pipeline.push({ $match: { rtom: rtom } });
    // }
    if (rtom) {
      pipeline.push({
        $match: {
          $expr: {
            $eq: [
              { $trim: { input: { $toLower: "$rtom" } } },
              rtom.toLowerCase().trim()
            ]
          }
        }
      });
    }

    // Add a projection to get the last DRC entry
    pipeline.push({
      $addFields: {
        last_drc: { $arrayElemAt: ["$drc", -1] },
      },
    });

    pipeline.push({
      $match: {
        "last_drc.removed_dtm": null,
        $expr: {
          $gt: ["$last_drc.expire_dtm", new Date()]
        }
      },
    });

    
    pipeline.push({
      $match: {
        "last_drc.drc_id": Number(drc_id),
      },
    });

    if (arrears_band) {
      pipeline.push({
        $match: { arrears_band },
      });
    }

    const dateFilter = {};
    if (from_date) dateFilter.$gte = new Date(from_date);
    if (to_date) {
      const endofDate = new Date(to_date);
      endofDate.setHours(23, 59, 59, 999); //
      dateFilter.$lte = endofDate;
    }

    if (Object.keys(dateFilter).length > 0) {
      pipeline.push({
        $match: { "last_drc.created_dtm": dateFilter },
      });
    }

    pipeline.push({
      $match: {
        $or: [
          { "last_drc.recovery_officers": { $exists: false } },
          { "last_drc.recovery_officers": null },
          { "last_drc.recovery_officers": { $size: 0 } },
        ],
      },
    });

    // Pagination
    pipeline.push({ $sort: { case_id: -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // const filtered_cases = await Case_details.aggregate(pipeline);

    const filtered_cases = await Case_details.aggregate(pipeline);

    // Handle case where no matching cases are found
    // if (filtered_cases.length === 0) {
    //   return res.status(204).json({
    //     status: "error",
    //     message: "No matching cases found for the given criteria.",
    //     errors: {
    //       code: 404,
    //       description: "No cases satisfy the provided criteria.",
    //     },
    //   });
    // }

    // Use Promise.all to handle asynchronous operations
    const formattedCases = await Promise.all(
      filtered_cases.map(async (caseData) => {
        return {
          case_id: caseData.case_id,
          account_no: caseData.account_no,
          status: caseData.case_current_status,
          created_dtm: caseData.last_drc.created_dtm,
          current_arreas_amount: caseData.current_arrears_amount,
          area: caseData.rtom,
          action_type: caseData.action_type,
          remark: caseData.remark?.[caseData.remark.length - 1]?.remark || null,
          expire_dtm: caseData.last_drc ? caseData.last_drc.expire_dtm : null,
          ro_name: caseData.last_ro ? caseData.last_ro.ro_name : null,
          assigned_date: caseData.last_ro
            ? caseData.last_ro.assigned_dtm
            : null,
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

export const List_Handling_Cases_By_DRC_With_RO = async (req, res) => {
  const { drc_id, rtom, ro_id, arrears_band, from_date, to_date, pages } =
    req.body;

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

    let page = Number(pages);
    if (isNaN(page) || page < 1) page = 1;
    const limit = page === 1 ? 10 : 30;
    const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

    // Ensure at least one optional parameter is provided
    // if (!rtom && !ro_id && !arrears_band && !(from_date && to_date)) {
    //   return res.status(400).json({
    //     status: "error",
    //     message: "At least one filtering parameter is required.",
    //     errors: {
    //       code: 400,
    //       description:
    //         "Provide at least one of rtom, ro_id, arrears_band, or both from_date and to_date together.",
    //     },
    //   });
    // }

    const allowedStatusTypes = [
      "Open With Agent",
      "RO Negotiation",
      "Negotiation Settle Pending",
      "Negotiation Settle Open-Pending",
      "Negotiation Settle Active",
      "RO Negotiation Extension Pending",
      "RO Negotiation Extended",
      "RO Negotiation FMB Pending",
      "Forward to Mediation Board",
      "MB Negotiation",
      "MB Request Customer-Info",
      "MB Handover Customer-Info",
      "MB Settle Pending",
      "MB Settle Open-Pending",
      "MB Settle Active",
      "MB Fail with Pending Non-Settlement",
    ];

    const pipeline = [];

    // Match allowed status
    pipeline.push({
      $match: {
        case_current_status: { $in: allowedStatusTypes },
      },
    });

    // Optional filters
    // if (rtom) {
    //   pipeline.push({ $match: { rtom: rtom } });
    // }
    if (rtom) {
      pipeline.push({
        $match: {
          $expr: {
            $eq: [
              { $trim: { input: { $toLower: "$rtom" } } },
              rtom.toLowerCase().trim()
            ]
          }
        }
      });
    }

    // Add a projection to get the last DRC entry
    pipeline.push({
      $addFields: {
        last_drc: { $arrayElemAt: ["$drc", -1] },
      },
    });

    pipeline.push({
      $match: {
        "last_drc.removed_dtm": null,
        $expr: {
          $gt: ["$last_drc.expire_dtm", new Date()]
        }
      },
    });

    
    pipeline.push({
      $match: {
        "last_drc.drc_id": Number(drc_id),
      },
    });

    if (arrears_band) {
      pipeline.push({
        $match: { arrears_band },
      });
    }

    const dateFilter = {};
    if (from_date) dateFilter.$gte = new Date(from_date);
    if (to_date) {
      const endofDate = new Date(to_date);
      endofDate.setHours(23, 59, 59, 999); //
      dateFilter.$lte = endofDate;
    }

    // pipeline.push({
    //   $addFields: {
    //     last_mediation_board: { $arrayElemAt: ['$mediation_board', -1] }
    //   }
    // });

    if (Object.keys(dateFilter).length > 0) {
      pipeline.push({
        $match: { "last_drc.created_dtm": dateFilter },
      });
    }

    pipeline.push({
      $match: {
        "last_drc.recovery_officers": {
          $type: "array"
        },
        $expr: {
          $gt: [{ $size: "$last_drc.recovery_officers" }, 0]
        }
      }
    });


    pipeline.push({
      // $addFields: {
      //   last_ro: { $arrayElemAt: ['$last_drc.recovery_officers', -1] }
      // }
      $addFields: {
        last_ro: {
          $cond: {
            if: {
              $and: [
                { $isArray: "$last_drc.recovery_officers" },
                { $gt: [{ $size: "$last_drc.recovery_officers" }, 0] },
              ],
            },
            then: { $arrayElemAt: ["$last_drc.recovery_officers", -1] },
            else: null,
          },
        },
      },
    });

    if (ro_id) {
      pipeline.push({
        $match: {
          "last_ro.ro_id": Number(ro_id),
        },
      });
    }

    // pipeline.push({
    //   $lookup: {
    //     from: "Recovery_officer", // name of the recovery officer collection
    //     localField: "last_ro.ro_id",
    //     foreignField: "ro_id",
    //     as: "recovery_officer",
    //   },
    // });

    // Optionally flatten the result if you expect only one match
    // pipeline.push({
    //   $addFields: {
    //     recovery_officer: { $arrayElemAt: ["$recovery_officer", 0] }
    //   }
    // });



    // Pagination
    pipeline.push({ $sort: { case_id: -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // const filtered_cases = await Case_details.aggregate(pipeline);

    const filtered_cases = await Case_details.aggregate(pipeline);

    // Handle case where no matching cases are found
    // if (filtered_cases.length === 0) {
    //   return res.status(204).json({
    //     status: "error",
    //     message: "No matching cases found for the given criteria.",
    //     errors: {
    //       code: 404,
    //       description: "No cases satisfy the provided criteria.",
    //     },
    //   });
    // }

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
          account_no: caseData.account_no,
          status: caseData.case_current_status,
          created_dtm: caseData.last_drc.created_dtm,
          current_arreas_amount: caseData.current_arrears_amount,
          area: caseData.rtom,
          action_type: caseData.action_type,
          remark: caseData.remark?.[caseData.remark.length - 1]?.remark || null,
          expire_dtm: caseData.last_drc ? caseData.last_drc.expire_dtm : null,
          ro_name: caseData.last_ro ? caseData.last_ro.ro_name : null,
          assigned_date: caseData.last_ro
            ? caseData.last_ro.assigned_dtm
            : null,
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
    if (!Array.isArray(case_ids) || !ro_id || !drc_id || !assigned_by) {
      return res.status(400).json({
        status: "error",
        message: "Failed to assign Recovery Officer.",
        errors: {
          code: 400,
          description:
            "case_ids must be a non-empty array and all fields are required.",
        },
      });
    }
    if (case_ids.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "There should be selected case ids.",
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
    const assignedAreas = recoveryOfficer?.rtom?.map((r) => r.rtom_name?.toLowerCase()) || [];

    const errors = [];
    const updates = [];

    // Fetch all cases with the provided case IDs
    const cases = await Case_details.find({
      case_id: { $in: case_ids },
    });

    if (cases.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No cases found for the provided case IDs.",
      });
    }

    for (const caseData of cases) {
      const { case_id, drc, rtom } = caseData;

      // Ensure the case area matches one of the recovery officer's assigned areas
      if (!assignedAreas.includes(rtom.toLowerCase())) {
        errors.push({
          case_id,
          message: `The area "${rtom}" does not match any RTOM area assigned to Recovery Officer with ro_id: ${ro_id}.`,
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
        ro_name: recoveryOfficer.ro_name,
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

    // Fetch the case details
    let query = {
      "drc.drc_id": drc_id,
      case_id: case_id,
    };
    const caseData = await Case_details.findOne(query).collation({
      locale: "en",
      strength: 2,
    });

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
    const drcEntry = caseData.drc?.find((entry) => entry.drc_id === drc_id);

    // Find the last recovery officer for this DRC
    let matchingRecoveryOfficer = null;
    if (drcEntry?.recovery_officers?.length) {
      const lastRecoveryOfficer =
        drcEntry.recovery_officers[drcEntry.recovery_officers.length - 1];
      if (lastRecoveryOfficer?.ro_id) {
        matchingRecoveryOfficer = await RecoveryOfficer.findOne({
          ro_id: lastRecoveryOfficer.ro_id,
        });
      }
    }

    // Get all relevant negotiations for the current DRC
    const relevantNegotiations = (caseData.ro_cpe_collect || []).filter(
      (roneg) => roneg.drc_id === Number(drc_id)
    );

    // Attach matching negotiation to each ref_product
    const refProductsCPECollect = (caseData.ref_products || []).map(
      (product) => {
        const negotiation = relevantNegotiations.filter(
          (roneg) => roneg.Product_Label === product.Product_Label
        );
        return {
          ...(product.toObject?.() || product), // Convert Mongoose subdoc if needed
          negotiation: negotiation || null,
        };
      }
    );

    // Format case details
    const formattedCaseDetails = {
      case_id: caseData.case_id,
      customer_ref: caseData.customer_ref,
      account_no: caseData.account_no,
      current_arrears_amount: caseData.current_arrears_amount,
      last_payment_date: caseData.last_payment_date,
      rtom: caseData.rtom || null,
      ref_products: refProductsCPECollect || null,
      // ro_negotiation: caseData.ro_negotiation || null,
      ro_negotiation: caseData.ro_negotiation
        ? caseData.ro_negotiation.filter(
            (ronegotiation) => ronegotiation.drc_id === Number(drc_id)
          )
        : null,
      ro_negotiation_re_assign_ro: caseData.ro_negotiation
        ? caseData.ro_negotiation.filter(
            (ronegotiation) => 
              ronegotiation.drc_id === Number(drc_id) &&
              ronegotiation.ro_id === matchingRecoveryOfficer?.ro_id
          )
        : null,
      // ro_requests: caseData.ro_requests || null,
      ro_requests: caseData.ro_requests
        ? caseData.ro_requests.filter(
            (rorequests) => rorequests.drc_id === Number(drc_id)
          )
        : null,
      ro_cpe_collect: caseData.ro_cpe_collect
        ? caseData.ro_cpe_collect.filter(
            (roCPECollect) => roCPECollect.drc_id === Number(drc_id)
          )
        : null,
      ro_id: matchingRecoveryOfficer?.ro_id || null,
    };

    // Prepare response object
    const responseData = {
      formattedCaseDetails,
    };

    // Try to fetch settlement data, but don't require it
    try {
      const settlementData = await CaseSettlement.find(
        {
          case_id: Number(case_id),
          drc_id: Number(drc_id),
        },
        {
          created_dtm: 1,
          settlement_status: 1,
          expire_date: 1,
          ro_id: 1,
        }
      ).collation({ locale: "en", strength: 2 });

      if (settlementData) {
        responseData.settlementData = settlementData;
        responseData.settlementData_ro_re_assign = settlementData.filter(
          (settlemet) => settlemet.ro_id === matchingRecoveryOfficer?.ro_id
        );
      }
    } catch (settlementError) {
      // Log error but continue
      console.error("Error fetching settlement data:", settlementError.message);
    }

    // Try to fetch payment data, but don't require it
    try {
      const paymentData = await Money_transactions.find(
        {
          case_id: Number(case_id),
          drc_id: Number(drc_id),
        },
        {
          created_dtm: 1,
          money_transaction_amount: 1,
          cummulative_settled_balance: 1
        }
      ).collation({ locale: "en", strength: 2 });

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
      data: responseData,
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
        [`drc.${lastDRC}.recovery_officers.${lastRecoveryOfficer}.case_removal_remark`]:
          trimmedRemark,
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

    const arrearsBandsData = await mongoConnection
      .collection("Arrears_bands")
      .findOne({});
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
      case_distribution_batch_id: null,
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
    const {
      date_from,
      date_to,
      current_arrears_band,
      drc_commision_rule,
      pages,
    } = req.body;

    // if (!date_from && !date_to && !current_arrears_band && !drc_commision_rule) {
    //   return res.status(200).json({
    //     status: "error",
    //     message: "No filters provided",
    //   });
    // }
    let page = Number(pages);
    if (isNaN(page) || page < 1) page = 1;
    // Define pagination limits
    const limit = page === 1 ? 10 : 30;
    const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

    const baseMatch = {};
    if (current_arrears_band) {
      baseMatch.current_arrears_band = current_arrears_band;
    }
    if (drc_commision_rule) {
      baseMatch.drc_commision_rule = drc_commision_rule;
    }
    const dateMatch = {};
    if (date_from) dateMatch.$gte = new Date(date_from);
    if (date_to) {
      const new_date_to = new Date(date_to);
      new_date_to.setHours(23, 59, 59, 999);
      dateMatch.$lte = new Date(new_date_to);
    }
    const pipeline = [
      { $match: baseMatch },
      { $sort: { case_distribution_id: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $addFields: {
          first_created_on: { $arrayElemAt: ["$batch_details.created_on", 0] },
        },
      },
    ];
    if (date_from || date_to) {
      pipeline.push({
        $match: {
          first_created_on: dateMatch,
        },
      });
    }
    pipeline.push({
      $project: {
        case_distribution_id: "$case_distribution_batch_id",
        current_batch_distribution_status: "$current_batch_distribution_status",
        action_type: {
          $let: {
            vars: {
              lastBatch: {
                $arrayElemAt: [
                  "$batch_details",

                  {
                    $subtract: [
                      { $size: { $ifNull: ["$batch_details", []] } },
                      1,
                    ],
                  },
                ],
              },
            },
            in: "$$lastBatch.action_type",
          },
        },
        Forward_For_Approvals_On: "$Forward_For_Approvals_On",
        drc_commision_rule: "$drc_commision_rule",
        current_arrears_band: "$current_arrears_band",
        inspected_count: "$bulk_Details.inspected_count",
        captured_count: "$bulk_Details.captured_count",
        Approved_On: "$Approved_On",
        create_dtm: {
          $let: {
            vars: {
              firstBatch: {
                $arrayElemAt: ["$batch_details", 0],
              },
            },
            in: "$$firstBatch.created_on",
          },
        },
        _id: 0,
      },
    });
    const caseDistributions = await CaseDistribution.aggregate(pipeline);
    return res.status(200).json({
      status: "success",
      message: "Batch details fetching success",
      data: caseDistributions,
    });
  } catch (error) {
    console.log(error);
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
    const {
      current_arrears_band,
      date_from,
      date_to,
      drc_commision_rule,
      Created_By,
    } = req.body;

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
      date_from:
        date_from && !isNaN(new Date(date_from)) ? new Date(date_from) : null,
      date_to: date_to && !isNaN(new Date(date_to)) ? new Date(date_to) : null,
      drc_commision_rule,
    };

    // Pass parameters directly (without nesting it inside another object)
    const taskData = {
      Template_Task_Id: 26,
      task_type: "Create Case distribution DRC Transaction List for Download",
      ...parameters,
      Created_By,
      task_status: "open",
    };

    // Call createTaskFunction
    const response = await createTaskFunction(taskData, session);

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      status: "success",
      message: "Task created successfully.",
      data: response,
    });
  } catch (error) {
    //console.error("Error in Create_Task_For_case_distribution:", error);
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
    const mongoConnection = await db.connectMongoDB();
    if (!mongoConnection) {
      throw new Error("MongoDB connection failed");
    }

    const { case_distribution_batch_id } = req.body;

    if (!case_distribution_batch_id) {
      return res.status(400).json({
        status: "error",
        message: "case_distribution_batch_id is a required parameter.",
      });
    }

    const arrearsBandDoc = await mongoConnection
      .collection("Arrears_bands")
      .findOne({});

    const transactions_data = await Case_distribution_drc_transactions.find(
      { case_distribution_batch_id },
      {
        case_distribution_batch_id: 1,
        current_arrears_band: 1,
        drc_commision_rule: 1,
        inspected_count: "$bulk_Details.inspected_count",
        captured_count: "$bulk_Details.captured_count",
        batch_details: 1,
      }
    );

    // 🧠 Map readable arrears bands
    const enriched_data = transactions_data.map((tx) => ({
      ...tx.toObject(),
      current_arrears_band: arrearsBandDoc?.[tx.current_arrears_band] || tx.current_arrears_band,
    }));


    if (enriched_data.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No data found for this batch ID.",
      });
    }

    return res.status(200).json({
      status: "success",
      message: `Successfully retrieved ${enriched_data.length} records`,
      data: enriched_data,
    });
  } catch (error) {
    console.error("Error fetching batch data:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error. Please try again later.",
    });
  }
};

/**
 * Inputs:
 * - drc_id: Number (required)
 * - status: String (optional)
 * - ro_id: Number (optional)
 * - rtom: String (optional)
 * - action_type: String (optional)
 * - from_date: String (optional, ISO Date format)
 * - to_date: String (optional, ISO Date format)
 *
 * Success Result:
 * - Returns a success response with the list of mediation cases filtered by the given criteria and owned by the specified DRC.
 */
export const ListALLMediationCasesownnedbyDRCRO = async (req, res) => {
  const { drc_id, status, ro_id, rtom, action_type, from_date, to_date,pages} =
    req.body;
  let fromDateObj = null;
  let toDateObj = null;
  try {
    if (!drc_id) {
      return res.status(400).json({
        status: "error",
        message: "Failed to retrieve Case details.",
        errors: {
          code: 400,
          description: "DRC ID is required.",
        },
      });
    };

    let page = Number(pages);
    if (isNaN(page) || page < 1) page = 1;

    const limit = page === 1 ? 10 : 30;
    const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

    if (from_date && to_date) {
      fromDateObj = new Date(from_date);
      toDateObj = new Date(to_date);
      console.log(fromDateObj, "and this is the to date ", toDateObj);

      if (isNaN(fromDateObj) || isNaN(toDateObj)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid date format.",
          errors: {
            code: 400,
            description: "from_date and to_date must be valid date strings.",
          },
        });
      }
    }
    // if (
    //   !rtom &&
    //   !status &&
    //   !ro_id &&
    //   !action_type &&
    //   !(toDateObj && fromDateObj)
    // ) {
    //   return res.status(400).json({
    //     status: "error",
    //     message: "At least one filtering parameter is required.",
    //     errors: {
    //       code: 400,
    //       description:
    //         "Provide at least one of rtom, ro_id, action_type, case_current_status, or both from_date and to_date together.",
    //     },
    //   });
    // }
    const allowedStatuses = [
      "Forward to Mediation Board",
      "MB Negotiation",
      // "MB Request Customer-Info",
      "MB Fail with Non-Settlement",
      "MB Settle Pending",
      "MB Settle Open-Pending",
      "MB Settle Active",
      "MB Fail with Pending Non-Settlement",
    ];
    let query = {
      "last_drc.drc_id": drc_id,
      "last_drc.removed_dtm": null,
    };
    if (status) {
      if (allowedStatuses.includes(status)) {
        query.case_current_status = status;
      } else {
        return res.status(400).json({
          status: "error",
          message: "Invalid case status.",
          errors: {
            code: 400,
            description: `Status "${status}" is not allowed. Allowed statuses are: ${allowedStatuses.join(
              ", "
            )}`,
          },
        });
      }
    } else {
      query.case_current_status = { $in: allowedStatuses };
    }
    if (rtom) query.area = rtom;
    if (ro_id) query["last_recovery_officer.ro_id"] = ro_id;
    if (action_type) query.action_type = action_type;
    if (fromDateObj && toDateObj) {
      query["last_drc.created_dtm"] = {
        $gte: fromDateObj,
        $lte: toDateObj,
      };
    }
    const cases = await Case_details.aggregate([
      {
        $addFields: {
          last_drc: { $arrayElemAt: ["$drc", -1] },
          // last_contact: { $arrayElemAt: ["$current_contact", -1] },
          last_recovery_officer: {
            $let: {
              vars: { lastDRC: { $arrayElemAt: ["$drc", -1] } },
              in: "$$lastDRC.recovery_officers",
            },
          },
        },
      },
      {
        $lookup: {
          from: "Recovery_officer",
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
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $project: {
          case_id: 1,
          customer_name: 1,
          account_no: 1,
           mediation_board_count: {
            $cond: {
              if: { $isArray: "$mediation_board" },
              then: { $size: "$mediation_board" },
              else: 0
            }
          },
          next_calling_date: {
            $let: {
              vars: {
                lastEntry: { $arrayElemAt: ["$mediation_board", -1] },
              },
              in: "$$lastEntry.mediation_board_calling_dtm",
            },
          },
          status: "$case_current_status",
          created_dtm: "$last_drc.created_dtm",
          current_contact_details: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$current_contact_details",
                  as: "item",
                  cond: { $eq: ["$$item.contact_type", "Mobile"] },
                },
              },
              0,
            ],
          },
          area: 1,
          action_type: 1,
          ro_name: { $arrayElemAt: ["$ro_info.ro_name", 0] },
        },
      },
    ]);

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
  const mongoConnection = mongoose.connection;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { case_distribution_batch_id, Proceed_by } = req.body;

    if (!case_distribution_batch_id) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "case_distribution_batch_id is required" });
    }

    if (!Proceed_by) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Proceed_by is required" });
    }

    // Get delegate_id dynamically
    const case_phase = "Distribution";
    const approval_type = "DRC Assign Approval";

    const delegate_id = await getBatchApprovalUserIdService({
      case_phase,
      approval_type,
    });

    // Validate if batch has "Complete" status
    const batchToProcess = await CaseDistribution.findOne({
      case_distribution_batch_id,

      current_batch_distribution_status: { $in: ["Open"] },
    }).session(session);

    if (!batchToProcess) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        message:
          "The batch does not have a 'Open' status and cannot be proceeded.",

        batchId: case_distribution_batch_id,
      });
    }

    const currentDate = new Date();

    // Update proceed_on and forward_for_approvals_on date in Case_distribution_drc_transactions
    const result = await CaseDistribution.updateOne(
      { case_distribution_batch_id },
      {
        $set: {
          Forward_For_Approvals_On: new Date(),
          current_batch_distribution_status: "batch_forword_approval",
          current_distribution_status_on: new Date(),
        },
        $push: {
          batch_status: {
            crd_distribution_status: "batch_forword_approval",
            created_dtm: new Date(),
            created_by: Proceed_by,
          },
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
      case_distribution_batch_id,
    };
    // const taskData = {
    //   Template_Task_Id: 31,
    //   task_type: "Create Task for Proceed Cases from Batch_ID",
    //   ...parameters,
    //   Created_By: Proceed_by,
    //   task_status: "open",
    // };

    // await createTaskFunction(taskData, session);
    // Generate a unique approver_id
    const counterResult = await mongoConnection
      .collection("collection_sequence")
      .findOneAndUpdate(
        { _id: "approver_id" },
        { $inc: { seq: 1 } },
        { returnDocument: "after", upsert: true, session }
      );

    const approver_id = counterResult.seq;

    if (!approver_id) {
      throw new Error("Failed to generate Task_Id.");
    }

    // Create Entry in Template_forwarded_approver
    const approvalEntry = new TmpForwardedApprover({
      approver_id,
      approver_reference: case_distribution_batch_id,
      created_by: Proceed_by,
      approver_type: "DRC Assign Approval",
      parameters,
      approve_status: [
        {
          status: "Open",
          status_date: currentDate,
          status_edit_by: Proceed_by,
        },
      ],
      approved_deligated_by: delegate_id,
    });

    await approvalEntry.save({ session });

    const dynamicParams = { case_distribution_batch_id };

    const interactionResult = await createUserInteractionFunction({
      Interaction_ID: 6,
      User_Interaction_Type: "Pending Approval Agent Destribution",
      delegate_user_id: delegate_id,
      Created_By: Proceed_by,
      ...dynamicParams,
      session,
    });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Success response
    return res.status(200).json({
      message:
        "Batch forwarded for proceed successfully, task created, approval recorded, and user interaction logged.",
      updatedCount: result.modifiedCount,
      // taskData,
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
export const Create_Task_For_case_distribution_transaction = async (
  req,
  res
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { case_distribution_batch_id, Created_By } = req.body;

    if (!case_distribution_batch_id || !Created_By) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: "error",
        message:
          "case_distribution_batch_id and Created_By are required parameter.",
      });
    }
    const parameters = {
      case_distribution_batch_id,
    };

    const taskData = {
      Template_Task_Id: 27,
      task_type:
        "Create Case distribution DRC Transaction_1 _Batch List for Download",
      ...parameters,
      Created_By,
      task_status: "open",
    };

    const response = await createTaskFunction(taskData, session);

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      status: "success",

      message:
        "Create Case distribution DRC Transaction_1_Batch List for Download",
      data: response,
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
        message:
          "case_distribution_batch_id and batch_seq are required parameters.",
      });
    }
    const transactions_data = await Case_distribution_drc_transactions.find(
      {
        case_distribution_batch_id,
        "batch_details.batch_seq": batch_seq,
      },
      {
        case_distribution_batch_id: 1,
        current_arrears_band: 1,
        drc_commision_rule: 1,
        inspected_count: "$bulk_Details.inspected_count",
        captured_count: "$bulk_Details.captured_count",
        batch_details: { $elemMatch: { batch_seq: batch_seq } },
      }
    );
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
     const { request_mode} = req.body;
    // Fetch all RO details from MongoDB
    const ro_requests = await Template_RO_Request.find({request_mode});

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
    //console.error("Unexpected error:", error.message);
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
export const Create_Task_For_case_distribution_transaction_array = async (
  req,
  res
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { case_distribution_batch_id, batch_seq, Created_By } = req.body;

    if (!case_distribution_batch_id || !batch_seq || !Created_By) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: "error",
        message:
          "case_distribution_batch_id, batch_seq, and Created_By are required parameters.",
      });
    }
    const parameters = {
      case_distribution_batch_id,
      batch_seq,
    };

    const taskData = {
      Template_Task_Id: 28,
      task_type:
        "Create Case distribution DRC Transaction_1 _Batch List distribution array for Download",
      Created_By,
      ...parameters,
      task_status: "open",
    };

    await createTaskFunction(taskData, session);

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      status: "success",
      message:
        "Create Case distribution DRC Transaction_1_Batch List distribution array for Download",
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
 * Collection:
 * - System_tasks
 */
export const Validate_Existing_Batch_Task = async (req, res) => {
  const { case_distribution_batch_id } = req.body;
  console.log("case_distribution_batch_id", req.body);

  if (!case_distribution_batch_id) {
    return res.status(400).json({
      status: "error",
      message: "case distribution batch id is required.",
    });
  }

  try {
    const mongo = await db.connectMongoDB();
    const existingTask = await mongo.collection("System_tasks").findOne({
      task_status: "open",
      "parameters.case_distribution_batch_id": Number(
        case_distribution_batch_id
      ),
    });
    if (existingTask) {
      return res.status(409).json({
        status: "error",
        message: "Already has tasks with this case distribution batch id",
      });
    } else {
      return res.status(200).json({
        status: "success",
        message: "No existing tasks found for this case distribution batch id.",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: `An error occurred while validation: ${error.message}`,
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
  const {
    case_distribution_batch_id,
    drc_list,
    created_by,
    current_arrears_band,
    drc_commision_rule,
  } = req.body;

  if (
    !case_distribution_batch_id ||
    !drc_list ||
    !created_by ||
    !current_arrears_band ||
    !drc_commision_rule
  ) {
    return res.status(400).json({
      status: "error",
      message:
        "case distribution batch id, created by, drc_commision_rule, current_arrears_band, DRC list fields are required.",
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
  try {
    const mongo = await db.connectMongoDB();
    const existingTask = await mongo.collection("System_tasks").findOne(
      {
        Template_Task_Id: 36,
        "parameters.case_distribution_batch_id": case_distribution_batch_id,
        "parameters.drc_commision_rule": drc_commision_rule,
        "parameters.current_arrears_band": current_arrears_band,
      },
      { session }
    );
    if (existingTask) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: "error",
        message:
          "Already has tasks with this case distribution batch id, drc_commision_rule and current_arrears_band ",
      });
    }

    const formattedString = drc_list
      .map(
        (item) =>
          `${item.plus_drc_id}:${item.rtom}:+${item.plus_rulebase_count},${item.minus_drc_id}:${item.rtom}:-${item.minus_rulebase_count}`
      )
      .join(",");

    const dynamicParams = {
      case_distribution_batch_id,
      current_arrears_band,
      drc_commision_rule,
      Amend: formattedString,
    };
    console.log(dynamicParams);

    const result = await createTaskFunction({
      Template_Task_Id: 36,
      task_type: "Exchange Case Distribution Planning among DRC",
      Created_By: created_by,
      ...dynamicParams,
      task_status: "open",
    });

    if (result.status === "error") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: "error",
        message: `An error occurred while creating the task: ${result}`,
      });
    }
    await session.commitTransaction();
    session.endSession();
    return res.status(200).json({
      status: "success",
      message: `New batch sequence task added successfully.`,
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
export const Case_Distribution_Details_With_Drc_Rtom_ByBatchId = async (
  req,
  res
) => {
  try {
    const { case_distribution_batch_id } = req.body;

    if (!case_distribution_batch_id) {
      return res.status(400).json({
        message: "Missing required field: case_distribution_batch_id",
      });
    }

    const data = await caseDistributionDRCSummary.aggregate([
      {
        $match: {
          case_distribution_batch_id: case_distribution_batch_id,
        },
      },
      { $unwind: "$drc_distribution" },
      { $unwind: "$drc_distribution.rtom_details" },
      {
        $group: {
          _id: {
            drc_id: "$drc_distribution.drc_id",
            drc_name: "$drc_distribution.drc_name",
            rtom: "$drc_distribution.rtom_details.rtom",
          },
          case_count: { $sum: "$drc_distribution.rtom_details.case_count" },
        },
      },
      {
        $group: {
          _id: {
            drc_id: "$_id.drc_id",
            drc_name: "$_id.drc_name",
          },
          rtoms: {
            $push: {
              rtom: "$_id.rtom",
              case_count: "$case_count",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          drc_id: "$_id.drc_id",
          drc_name: "$_id.drc_name",
          rtoms: 1,
        },
      },
    ]);

    return res.status(200).json({
      status: "success",
      message: "rtom of the drc's case count",
      data,
    });
  } catch (error) {
    console.error("Error in getDRCWithRTOMList:", error);
    res.status(500).json({ error: "Internal server error" });
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
    const { approved_deligated_by, pages } = req.body;

    let page = Number(pages);
    if (isNaN(page) || page < 1) page = 1;
    const limit = page === 1 ? 10 : 30;
    const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

    if (!approved_deligated_by) {
      return res
        .status(400)
        .json({ message: "approved_deligated_by is required" });
    }

    // Fetch all data in a single aggregation pipeline
    const result = await TmpForwardedApprover.aggregate([
      // Stage 1: Match approver documents with required conditions
      {
        $match: {
          approver_type: "DRC Assign Approval",
          approved_deligated_by: approved_deligated_by,
        },
      },
      // Stage 2: Add a field for the last status
      {
        $addFields: {
          lastStatus: { $arrayElemAt: ["$approve_status", -1] },
        },
      },
      // Stage 3: Filter to only include documents where last status is "Open"
      {
        $match: {
          "lastStatus.status": "Open",
        },
      },
      // Stage 4: Lookup related case distribution data
      {
        $lookup: {
          from: "Case_distribution_drc_transactions", // Collection name
          localField: "approver_reference",
          foreignField: "case_distribution_batch_id",
          as: "case_distribution_details",
        },
      },
      // Stage 5: Unwind the case_distribution_details array (converts array to object)
      {
        $unwind: {
          path: "$case_distribution_details",
          preserveNullAndEmptyArrays: true, // Keep documents even if no matching case distribution
        },
      },
      {
        $sort: { "created_on": -1 }, // Sort by created_on date in descending order
      },
      {
        $skip: skip, // Skip documents for pagination
      },
      {
        $limit: limit, // Limit the number of documents returned
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
                case_distribution_batch_id:
                  "$case_distribution_details.case_distribution_batch_id",
                drc_commision_rule:
                  "$case_distribution_details.drc_commision_rule",
                rulebase_count:
                  "$case_distribution_details.bulk_Details.inspected_count",
                rulebase_arrears_sum:
                  "$case_distribution_details.bulk_Details.inspected_arrease",
              },
              else: null,
            },
          },
        },
      },
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
    const { approver_reference, approved_by, IsApproved } = req.body;

    if (!approver_reference) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "approver_reference is required" });
    }

    if (!approved_by) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "approved_by is required" });
    }

    if (!IsApproved) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "IsApproved is required" });
    }

    const currentDate = new Date();

    let statusTempForwardedApprover;
    let statusCaseDistribution;
    let discriptionDistribution;

    if (IsApproved === "Approve") {
      statusTempForwardedApprover = "Approve";
      statusCaseDistribution = "batch_approved";
      discriptionDistribution = "Batch is Approved";
    } else {
      statusTempForwardedApprover = "Reject";
      statusCaseDistribution = "batch_rejected";
      discriptionDistribution = "Batch is Rejected";
    }

    // Fetch the created_by field for the matching approver_reference
    const approverDoc = await TmpForwardedApprover.findOne({
      approver_reference: approver_reference,
      approver_type: "DRC Assign Approval",
    }).select("approver_reference created_by approver_id");

    if (!approverDoc) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ message: "No matching approver reference found" });
    }

    // Get delegate_id from created_by
    const delegate_id = approverDoc.created_by;

    // Update approve_status for the matching document
    const result = await TmpForwardedApprover.updateOne(
      {
        approver_reference: approver_reference,
        approver_type: "DRC Assign Approval",
      },
      {
        $push: {
          approve_status: {
            status: statusTempForwardedApprover,
            status_date: currentDate,
            status_edit_by: approved_by,
          },
        },
      },
      { session }
    );

    console.log("Approve By", approved_by);
    console.log("current Date", currentDate);

    const resultCaseDistribution = await CaseDistribution.updateOne(
      {
        case_distribution_batch_id: approver_reference,
      },
      {
        $push: {
          batch_status: {
            crd_distribution_status: statusCaseDistribution,
            created_dtm: currentDate,
            batch_status_discription: discriptionDistribution,
            created_by: approved_by,
          },
        },
        $set: {
          current_batch_distribution_status: statusCaseDistribution,
          approver_reference: approverDoc.approver_id,
          Approved_By: approved_by,
          Approved_On: currentDate,
        },
      },
      { session }
    );

    if (
      // result.modifiedCount === 0 ||
      resultCaseDistribution.modifiedCount === 0
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(204).json({
        message: "No matching approver reference found or already approved",
      });
    }

    let taskCreatedResponse;

    if (IsApproved === "Approve") {
      const dynamicParams = {
        case_distribution_batch_id: approver_reference, // List of approver references
      };

      // Create Task for Approved Approver
      const taskData = {
        Template_Task_Id: 29,
        task_type: "Approved Distribute Cases among DRCs",
        ...dynamicParams,
        Created_By: approved_by,
        task_status: "open",
      };

      taskCreatedResponse = await createTaskFunction(taskData, session);

      await createUserInteractionFunction({
        Interaction_ID: 15,
        User_Interaction_Type: "Agent Distribution Batch Approved",
        delegate_user_id: delegate_id,
        Created_By: approved_by,
         ...dynamicParams,
        session,   
      });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message:
        "Approval added successfully, task created and interaction added.",
      // updatedCount: result.modifiedCount,
      response: taskCreatedResponse,
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

    if (
      !approver_references ||
      !Array.isArray(approver_references) ||
      approver_references.length === 0
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Invalid input, provide an array of approver references",
      });
    }

    if (!Created_By) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Created_By is required" });
    }

    const dynamicParams = {
      approver_references, // List of approver references
    };

    const taskData = {
      Template_Task_Id: 30,
      task_type: "Create batch approval List for Download",
      ...dynamicParams,
      Created_By,
      task_status: "open",
    };

    // Call createTaskFunction
    const response = await createTaskFunction(taskData, session);

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "Task for batch approval created successfully.",
      response,
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
    const {
      approver_type,
      date_from,
      date_to,
      approved_deligated_by,
      approve_status,
      pages,
    } = req.body;

    const allowedApproverTypes = [
      "DRC Re-Assign Approval",
      "Case Withdrawal Approval",
      "Case Abandoned Approval",
      "Case Write-Off Approval",
      "Commission Approval",
      "DRC Agreement"
    ];

    let page = Number(pages);
    if (isNaN(page) || page < 1) page = 1;
    // Define pagination limits
    const limit = page === 1 ? 10 : 30;
    const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

    if (!approved_deligated_by) {
      return res
        .status(400)
        .json({ message: "approved_deligated_by is required" });
    }

    // Build the match stage for the aggregation pipeline
    let matchStage = { approver_type: { $in: allowedApproverTypes } };

    // Filter based on approver_type
    if (approver_type && allowedApproverTypes.includes(approver_type)) {
      matchStage.approver_type = approver_type;
    }

    // Filter based on date range
    if (date_from && date_to) {
      const endofDate = new Date(date_to);
      endofDate.setHours(23, 59, 59, 999);
      matchStage.created_on = { $gte: new Date(date_from), $lte: endofDate };
    } else if (date_from) {
      matchStage.created_on = { $gte: new Date(date_from) };
    } else if (date_to) {
      matchStage.created_on = { $lte: endofDate };
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
            $arrayElemAt: ["$approve_status", -1],
          },
        },
      },

      {
        $match: {
          "lastApproveStatus.status": "Open",
        },
      },

      // Filter based on approve_status if provided
      // ...(approve_status
      //   ? [
      //       {
      //         $match: {
      //           "lastApproveStatus.status": approve_status,
      //         },
      //       },
      //     ]
      //   : []),

      // Replace the approve_status array with an array containing only the last status
      {
        $addFields: {
          approve_status: {
            $cond: {
              if: { $gt: [{ $size: "$approve_status" }, 0] },
              then: ["$lastApproveStatus"],
              else: [],
            },
          },
        },
      },

      // Remove the temporary lastApproveStatus field
      {
        $project: {
          lastApproveStatus: 0,
        },
      },

      // Sort by created_on in descending order (latest first)
      {
        $sort: { created_on: -1 },
      },

      {
        $skip: skip, // Skip documents for pagination
      },

      {
        $limit: limit, // Limit the number of documents returned
      },
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

export const Aprove_DRC_Assign_Manager_Approval = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { approver_reference, approved_by,approver_id } = req.body;
    if (!approver_reference) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Invalid input, approver_reference is required" });
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
        approver_id
      },
      {
        created_on: 1,
        created_by: 1,
        approver_type: 1,
        parameters: 1,
      }
    ).session(session);
    if (!approvalDoc) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ message: "No matching approver reference found" });
    };
    if(approvalDoc.approver_type === "DRC Agreement"){
      const start_date = new Date(approvalDoc.parameters.get("start_date"));
      const end_date = new Date(approvalDoc.parameters.get("end_date"));
      const deligate_id = approvalDoc.created_by;
      const result = await TmpForwardedApprover.updateOne(
        {
          approver_id,
          approver_reference,
          approver_type:"DRC Agreement"
        },
        {
          $push: {
            approve_status: {
              status: "Approve",
              status_date: currentDate,
              status_edit_by: approved_by,
            },
          },
        },
        { session }
      );
      const agreement_result = await drc_agreement.updateOne(
        {
          drc_id:approver_reference,
          approver_id
        },
        {
          $set: {
            agreement_status: "Approved",
          }
        },
        { session }
      );
      if(!agreement_result){
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "DRC agreement not updated" }); 
      }
      if (result.modifiedCount === 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Approval update failed" });
      }
  
      let caseResult = { modifiedCount: 0 }; 
      console.log("Start Date:", start_date > new Date());
      if (start_date > new Date()) {
        const parameters = {
          start_date,
          end_date,
          drc_id:approver_reference
        };
        const taskData = {
          Template_Task_Id: 33, //python
          task_type: "python",  //python
          ...parameters,
          Created_By: approved_by,
          task_status: "open",
        };
        await createTaskFunction(taskData, session);
      } else {
        caseResult = await DRC.updateOne(
          { drc_id: approver_reference },
          {
            $push: {
              status: {
                drc_status: "Active",
                drc_status_dtm: new Date(),
                drc_status_by: approved_by
              }
            },
            $set: {
              "drc_agreement_details.agreement_status":"Approved"
            }
          },
          { session }
        );
      }
  
      // Create User Interaction Log
      const interaction_id = 16; //python
      const request_type = "python"; //python
      const created_by = approved_by;
      const dynamicParams = { start_date, end_date, drc_id:approver_reference };
  
      await createUserInteractionFunction({
        Interaction_ID: interaction_id,
        User_Interaction_Type: request_type,
        delegate_user_id: deligate_id,
        Created_By: created_by,
        ...dynamicParams,
        session,  
      });
  
      await session.commitTransaction();
      session.endSession();
  
      return res.status(200).json({
        message: "Approval added successfully.",
        updatedCount: result.modifiedCount + caseResult.modifiedCount,
      });
    }
    else{
      // Fetch case details to check drc array length and monitor_months
      const caseDetails = await Case_details.findOne(
        {
          case_id: approver_reference,
        },
        {
          monitor_months: 1,
          drc: 1,
          case_current_status: 1,
        }
      ).session(session);
      if (!caseDetails) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: "No matching case found" });
      }

      // Validate drc array length and monitor_months
      if (approvalDoc.approver_type === "DRC Re-Assign Approval") {
        if (caseDetails.drc && caseDetails.drc.length >= 3) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            message: "Cannot add more DRCs. Maximum limit of 3 DRCs reached.",
          });
        }

        if (caseDetails.monitor_months >= 5) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            message: "Cannot add DRC when monitor_months are reached to 5.",
          });
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
        "Commission Approval": "Commissioned",
      };

      const newStatus = statusMap[approvalDoc.approver_type];

      if (!newStatus) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Invalid approver_type" });
      }

      // Update approve_status and approved_by
      const result = await TmpForwardedApprover.updateOne(
        {
          approver_reference: { $in: approver_reference },
          approver_type: { $ne: "DRC Assign Approval" },
        },
        {
          $push: {
            approve_status: {
              status: "Approve",
              status_date: currentDate,
              status_edit_by: approved_by,
            },
          },
        },
        { session }
      );

      if (result.modifiedCount === 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(304).json({ message: "Approval update failed" });
      }
      const payload = { case_status: newStatus };
      let case_phase = "";
      try {
        const response = await axios.post(
          "http://124.43.177.52:6000/app2/get_case_phase",
          payload
        );

        if (!response.data.case_phase) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            message: "case_phase not found in API response",
          });
        }
        case_phase = response.data.case_phase;
        console.log("case_phase:", case_phase);
      } catch (error) {
        console.error("Error during axios call:", error.message);
        if (error.response) {
          console.error("API Error Response:", error.response.data);
        }
        // Abort and end session on axios error
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({
          message: "Failed to get case_phase from external API",
          error: error.message,
        });
      }
      // Update all active DRCs to Inactive if this is a DRC Re-Assign Approval
      if (
        approvalDoc.approver_type === "DRC Re-Assign Approval" &&
        caseDetails.drc &&
        caseDetails.drc.length > 0
      ) {
        // Update all active DRCs to inactive
        await Case_details.updateOne(
          { case_id: approver_reference },
          {
            $set: {
              "drc.$[elem].drc_status": "Inactive",
              "drc.$[elem].removed_by": approved_by,
              "drc.$[elem].removed_dtm": currentDate,
            },
          },
          {
            arrayFilters: [{ "elem.drc_status": "Active" }],
            session,
          }
        );
      }

      // Handle DRC Re-Assign Approval
      let caseUpdateOperation = {
        $push: {
          approve: {
            Approval_Type: approvalDoc.approver_type,
            approved_process: newStatus,
            decision: "Approve",
            done_by: approved_by,
            done_on: currentDate,
            // approved_by: approved_by,
            // approved_on: currentDate,
            remark: "Approved",
            requested_on: approvalDoc.created_on,
            requested_by: approvalDoc.created_by,
          },
          case_status: {
            case_status: newStatus,
            status_reason: "Case Approved",
            created_dtm: currentDate,
            created_by: approved_by,
            case_phase,
          },
        },
        $set: {
          case_current_status: newStatus,
          case_current_phase: case_phase,
        },
      };

      if (
        approvalDoc.approver_type === "DRC Re-Assign Approval" &&
        approvalDoc.parameters
      ) {
        const drcId = approvalDoc.parameters?.drc_id;
        const drcName = approvalDoc.parameters?.drc_name;

        if (drcId && drcName) {
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
            recovery_officers: [],
          };
        } else {
          return res.status(204).json({
            message:
              "Can not add new DRC to drc array because 'drc_id' or 'drc_name' is missing in approval collection document ",
          });
        }
      } else if (approvalDoc.approver_type === "Case Withdrawal Approval") {
        caseUpdateOperation.$push.abnormal_stop = {
          remark: "Approved Case Withdrawal Approval",
          done_by: approved_by,
          done_on: currentDate,
          action: approver_reference,
          Case_phase: case_phase,
        };
      } else if (approvalDoc.approver_type === "Case Abandoned Approval") {
        caseUpdateOperation.$push.abnormal_stop = {
          remark: "Approved Case Abandoned Approval",
          done_by: approved_by,
          done_on: currentDate,
          action: approver_reference,
          Case_phase: case_phase,
        };
      } else if (approvalDoc.approver_type === "Case Write-Off Approval") {
        caseUpdateOperation.$push.abnormal_stop = {
          remark: "Approved Case Write-Off Approval",
          done_by: approved_by,
          done_on: currentDate,
          action: approver_reference,
          Case_phase: case_phase,
        };
      } else {
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
        ...dynamicParams,
        session,
        
      });

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        message: "Approval added successfully.",
        updatedCount: result.modifiedCount + caseResult.modifiedCount,
      });
    }
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
    const { approver_reference, approved_by,approver_id } = req.body;
    if (!approver_reference) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Invalid input, approver_reference is required" });
    };
    if (!approver_id) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Invalid input, approver_id is required" });
    };
    if (!approved_by) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "approved_by is required" });
    };
    const currentDate = new Date();
    // Fetch only created_on and created_by from the approval document
    const approvalDocFields = await TmpForwardedApprover.findOne(
      {approver_id},
      { created_on: 1, created_by: 1,approver_type:1 }
    ).session(session);
    if (!approvalDocFields) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ message: "No matching approver reference found" });
    };
    if(approvalDocFields.approver_type === "DRC Agreement"){
      const deligate_id = approvalDocFields.created_by;
      const result = await TmpForwardedApprover.updateOne(
        {
          approver_id,
          approver_reference,
          approver_type:"DRC Agreement"
        },
        {
          $push: {
            approve_status: {
              status: "Rejected",
              status_date: currentDate,
              status_edit_by: approved_by,
            },
          },
        },
        { session }
      );
      const agreement_result = await drc_agreement.updateOne(
        {
          drc_id:approver_reference,
          approver_id
        },
        {
          $set: {
            agreement_status: "Rejected",
          }
        },
        { session }
      );
      if(!agreement_result.modifiedCount === 0){
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "DRC agreement not updated" }); 
      }
      if (result.modifiedCount === 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Approval update failed" });
      };
      const drcresult = await DRC.updateOne(
        { drc_id: approver_reference },
        {
          $set: {
            "drc_agreement_details.agreement_status":"Rejected"
          }
        },
        { session }
      );
      if (drcresult.modifiedCount === 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "DRC update failed" });
      };
      const dynamicParams = {drc_id:approver_reference };
      await createUserInteractionFunction({
        Interaction_ID: 16, //python
        User_Interaction_Type: "python", //python
        delegate_user_id: deligate_id,
        Created_By: approved_by,
        ...dynamicParams,
        session,   
      });
      await session.commitTransaction();
      session.endSession();
      return res.status(200).json({
        message: "Reject added successfully.",
      });
    };
    if (!["DRC Assign Approval", "DRC Agreement"].includes(approvalDocFields.approver_type)) {
      const caseStatusFields = await Case_details.findOne(
        { case_id: approver_reference },
        { case_status: { $slice: -2 } }
      ).session(session);

      if (!caseStatusFields) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: "No matching case found" });
      }

      // Get the previous status (second-to-last element if exists, otherwise null)
      let previousStatus = null;
      if (
        caseStatusFields.case_status &&
        caseStatusFields.case_status.length > 1
      ) {
        // When we have at least 2 elements, index 0 is the second-to-last
        previousStatus = caseStatusFields.case_status[0].case_status;
      }

      // If we couldn't find a previous status, return an error
      if (previousStatus === null) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ message: "Cannot find previous case status" });
      }

      // Assign created_by as delegate_id
      const deligate_id = approvalDocFields.created_by;

      // Update approve_status and approved_by
      const result = await TmpForwardedApprover.updateOne(
        {
          approver_reference: { $in: approver_reference },
          approver_type: { $ne: "DRC Assign Approval" },
        },
        {
          $push: {
            approve_status: {
              status: "Reject",
              status_date: currentDate,
              status_edit_by: approved_by,
            },
          },
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
              // rejected_by: approved_by,
              // rejected_on: currentDate,
              // approved_on: null,
              decision: "Reject",
              done_by: approved_by,
              done_on: currentDate,
              remark: "Approval Rejected",
              requested_on: approvalDocFields.created_on,
              requested_by: approvalDocFields.created_by,
            },
            case_status: {
              case_status: previousStatus,
              status_reason: "Approval Rejected",
              created_dtm: currentDate,
              created_by: approved_by,
              case_phase: "Negotiation",
            },
          },
          $set: {
            case_current_status: previousStatus,
            case_current_phase: "Negotiation",
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
        ...dynamicParams,
        session,       
      });

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        message: "Rejection added successfully.",
        updatedCount: result.modifiedCount + caseResult.modifiedCount,
      });
    };
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
    const { approver_type, date_from, date_to, Created_By, approver_status } =
      req.body;

    if (!Created_By) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Created_By is required" });
    }

    const parameters = {
      date_from,
      date_to,
      approver_status,
      approver_type,
    };
    // --- Create Task ---
    const taskData = {
      Template_Task_Id: 33,
      task_type: "Create DRC Assign maneger approval List for Download",
      ...parameters,
      Created_By,
      task_status: "open",
    };

    // Call createTaskFunction
    const response = await createTaskFunction(taskData, session);

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "Task for batch approval created successfully.",
      response,
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
  const mongoConnection = mongoose.connection;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const {
      case_id,
      drc_id,
      remark,
      assigned_by,
      drc_name,
      case_current_status,
    } = req.body;
    
    const approver_type = "DRC Re-Assign Approval";
    const approver_reference = case_id;
    const recode = await Check_valid_approval({ approver_reference, approver_type });
    if (recode !== "success") {
      return res.status(404).json({
        status: "error",
        message: recode,
      });
    };

    if (!case_id || !drc_id || !assigned_by || !drc_name) {
      await session.abortTransaction();
      return res.status(400).json({
        status: "error",
        message: "case_id, drc_id, assigned_by, and drc_name are required.",
        errors: {
          code: 400,
          description: "case_id and drc_id is required.",
        },
      });
    }

    // Generate a unique approver_id using collection_sequence
    const counterResult = await mongoConnection
      .collection("collection_sequence")
      .findOneAndUpdate(
        { _id: "approver_id" },
        { $inc: { seq: 1 } },
        { returnDocument: "after", upsert: true, session }
      );

    const approver_id = counterResult.seq;

    if (!approver_id) {
      throw new Error("Failed to generate Task_Id.");
    }
    const dynamicParams = {
      case_id,
      drc_id,
      drc_name,
    };
    const payload = { case_status: case_current_status };
    let case_phase = "";
    try {
      const response = await axios.post(
        "https://debtx.slt.lk:6500/get_case_phase",
        payload
      );
      if (!response.data.case_phase) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: "case_phase not found in API response",
        });
      }
      case_phase = response.data.case_phase;
    } catch (error) {
      console.error("Error during axios call:", error.message);
      if (error.response) {
        console.error("API Error Response:", error.response.data);
      }
      // Abort and end session on axios error
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({
        message: "Failed to get case_phase from external API",
        error: error.message,
      });
    }
    const delegate_id = await getApprovalUserIdService({
      case_phase,
      approval_type: "DRC Re-Assign Approval",
    });

    const drcAssignAproveRecode = {
      approver_id,
      approver_reference: case_id,
      created_on: new Date(),
      created_by: assigned_by,
      approve_status: {
        status: "Open",
        status_date: new Date(),
        status_edit_by: assigned_by,
      },
      approver_type: "DRC Re-Assign Approval",
      parameters: {
        drc_id,
        drc_name,
        case_id,
      },
      remark: {
        remark,
        remark_date: new Date(),
        remark_edit_by: assigned_by,
      },
      approved_deligated_by:delegate_id,
    };
    const TmpForwardedApproverRespons = new TmpForwardedApprover(
      drcAssignAproveRecode
    );
    await TmpForwardedApproverRespons.save({ session });

    const result = await createUserInteractionFunction({
      Interaction_ID: 22,
      User_Interaction_Type: "Pending approval for DRC Re Assign Approval",
      delegate_user_id: delegate_id,
      Created_By: assigned_by,
      ...dynamicParams,
      session,
    });
    const caseResult = await Case_details.updateOne(
      { case_id: approver_reference },
      {
        $push: {
          case_status: {
            case_status: "Pending Re-Assign agent approval",
            status_reason: "Case send for DRC Re Assign Approval",
            created_dtm: new Date(),
            created_by: assigned_by,
            case_phase,
          },
        },
        $set: {
          case_current_status: "Pending Re-Assign agent approval",
          case_current_phase: case_phase,
        },
      },
      { session }
    );
    if (!result || result.status === "error") {
      await session.abortTransaction();
      return res.status(404).json({
        status: "error",
        message: "DRC Reassining send to the Aprover process has a error.",
      });
    }
    await session.commitTransaction();

    return res.status(200).json({
      status: "success",
      message: "DRC Reassining send to the Aprover.",
      data: TmpForwardedApproverRespons.toObject(),
    });
  } catch (error) {
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
  } finally {
    session.endSession();
  }
};

/**
 * Inputs:
 * - case_distribution_batch_id: Number (required)
 * - drc_id: Number (optional)
 *
 * Success Result:
 * - Returns a success response with DRC-wise total case count and detailed RTOM-wise distribution grouped by batch.
 */
export const List_Case_Distribution_Details = async (req, res) => {
  try {
    const { case_distribution_batch_id, drc_id } = req.body;

    if (!case_distribution_batch_id) {
      return res.status(400).json({
        message: "Missing required field: case_distribution_batch_id",
      });
    }

    const pipeline = [
      {
        $match: {
          case_distribution_batch_id: case_distribution_batch_id,
        },
      },
      { $unwind: "$drc_distribution" },
    ];
    if (drc_id !== undefined && drc_id !== null) {
      pipeline.push({
        $match: {
          "drc_distribution.drc_id": drc_id,
        },
      });
    }

    pipeline.push(
      { $unwind: "$drc_distribution.rtom_details" },
      {
        $facet: {
          rtom_distribution: [
            {
              $project: {
                case_distribution_batch_id: 1,
                created_dtm: 1,
                distributed_tot_arrease: 1,
                drc_id: "$drc_distribution.drc_id",
                drc_name: "$drc_distribution.drc_name",
                rtom: "$drc_distribution.rtom_details.rtom",
                case_count: "$drc_distribution.rtom_details.case_count",
                rtom_tot_arrease:
                  "$drc_distribution.rtom_details.rtom_tot_arrease",
                month_1_sc: "$drc_distribution.rtom_details.month_1_sc",
                month_2_sc: "$drc_distribution.rtom_details.month_2_sc",
                month_3_sc: "$drc_distribution.rtom_details.month_3_sc",
              },
            },
            {
              $group: {
                _id: {
                  case_distribution_batch_id: "$case_distribution_batch_id",
                  created_dtm: "$created_dtm",
                  distributed_tot_arrease: "$distributed_tot_arrease",
                },
                rtom_distribution: {
                  $push: {
                    drc_id: "$drc_id",
                    drc_name: "$drc_name",
                    rtom: "$rtom",
                    case_count: "$case_count",
                    rtom_tot_arrease: "$rtom_tot_arrease",
                    month_1_sc: "$month_1_sc",
                    month_2_sc: "$month_2_sc",
                    month_3_sc: "$month_3_sc",
                  },
                },
              },
            },
          ],
          drc_distribution: [
            {
              $group: {
                _id: {
                  drc_id: "$drc_distribution.drc_id",
                  drc_name: "$drc_distribution.drc_name",
                },
                total_case_count: {
                  $sum: "$drc_distribution.rtom_details.case_count",
                },
                drc_tot_arrease: {
                  $first: "$drc_distribution.drc_tot_arrease",
                },
              },
            },
            {
              $project: {
                _id: 0,
                drc_id: "$_id.drc_id",
                drc_name: "$_id.drc_name",
                total_case_count: 1,
                drc_tot_arrease: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          rtom_distribution: { $arrayElemAt: ["$rtom_distribution", 0] },
          drc_distribution: 1,
        },
      },
      {
        $project: {
          case_distribution_batch_id:
            "$rtom_distribution._id.case_distribution_batch_id",
          created_dtm: "$rtom_distribution._id.created_dtm",
          distributed_tot_arrease:
            "$rtom_distribution._id.distributed_tot_arrease",
          rtom_distribution: "$rtom_distribution.rtom_distribution",
          drc_distribution: 1,
        },
      }
    );

    const result = await caseDistributionDRCSummary.aggregate(pipeline);
    return res.status(200).json({
      status: "success",
      message: "case distribution data fetch successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching case distribution details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const Create_Task_For_case_distribution_drc_summery = async (
  req,
  res
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { drc_id, case_distribution_batch_id, Created_By } = req.body;

    if (!drc_id || !Created_By) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Missing required fields: drc_id, Created_By" });
    }

    const drcDetails = await DRC.findOne({ drc_id }, "drc_name");
    if (!drcDetails) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(204)
        .json({ message: "DRC not found for the given drc_id" });
    }

    const dynamicParams = {
      drc_id,
      drc_name: drcDetails.drc_name,
      case_distribution_batch_id,
    };
    const taskData = {
      Template_Task_Id: 32,
      task_type: "Create Case Distribution DRC Summary List for Download",
      Created_By,
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
 * Inputs:
 * - case_id: Number (required)
 * - drc_id: Number (required)
 * - ro_id: Number (optional)
 * - next_calling_date: date (optional, ISO Date)
 * - current_arrears_amount: Number (required if settle is "yes")
 * - request_id: Number (optional)
 * - request_type: String (required if request_id is provided)
 * - request_comment: String (optional)
 * - handed_over_non_settlemet: String ("yes" or "no")
 * - intraction_id: Number (required if request_id is provided)
 * - customer_available: String (required if handed_over_non_settlemet is "no")
 * - comment: String (optional)
 * - settle: String ("yes" or "no")
 * - initial_amount: Number (required if settle is "yes")
 * - calendar_month: Number (required if settle is "yes")
 * - case_current_status: String (required if settle is "yes")
 * - remark: String (optional)
 * - fail_reason: String (optional)
 * - created_by: String (required)
 *
 * Success Result:
 * - Returns a success response confirming the mediation board operation and optional settlement plan creation.
 */
export const Mediation_Board = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const {
      case_id,
      drc_id,
      ro_id,
      next_calling_date,
      current_arrears_amount,
      request_id,
      request_type,
      request_comment,
      handed_over_non_settlemet,
      intraction_id,
      customer_available,
      comment,
      settle,
      initial_amount,
      calendar_month,
      fail_reason_comment,
      case_current_status,
      non_settlement_comment,
      remark,
      fail_reason,
      created_by,
    } = req.body;

    if (!case_id || !drc_id) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: "error",
        message: "Missing required fields: case_id, drc_id, customer_available",
      });
    }
    if (handed_over_non_settlemet === "no" || !handed_over_non_settlemet) {
      if (!customer_available) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          status: "error",
          message: "Missing required fields: customer_available",
        });
      }
    }
    const mediationBoardData = {
      drc_id,
      ro_id,
      created_dtm: new Date(),
      mediation_board_calling_dtm: next_calling_date,
      customer_available: customer_available,
      comment: customer_available === "no" ? comment : null,
      agree_to_settle: settle,
      customer_response: settle === "no" ? fail_reason : null,
      handed_over_non_settlemet_on:handed_over_non_settlemet === "yes" ? new Date() : null,
      non_settlement_comment,
    };
    if (request_id !== "") {
      if (!request_id || !request_type || !intraction_id) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          status: "error",
          message:
            "Missing required fields: request_id, request_type, intraction_id",
        });
      }
      let case_status_with_request = "MB Negotiaion";
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
        Interaction_ID: intraction_id,
        User_Interaction_Type: request_type,
        delegate_user_id: await getUserIdOwnedByDRCId(drc_id),
        Created_By: created_by,
        ...dynamicParams,
      });

      if (!result || !result.Interaction_Log_ID) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({
          status: "error",
          message: "Failed to create user interaction",
        });
      }
      const intraction_log_id = result.Interaction_Log_ID;
      const updatedCase = await Case_details.findOneAndUpdate(
        { case_id },
        {
          $push: {
            mediation_board: mediationBoardData,
            ro_requests: {
              drc_id,
              ro_id,
              created_dtm: new Date(),
              ro_request_id: request_id,
              ro_request: request_type,
              request_remark: request_comment,
              intraction_id: intraction_id,
              intraction_log_id,
            },
            case_status: {
              case_status: case_status_with_request,
              created_dtm: new Date(),
              created_by: created_by,
              case_phase: "Mediation Board",
            },
          },
          $set: {
            case_current_status: case_status_with_request,
            case_current_phase: "Mediation Board",
          },
        },
        { new: true, session }
      );
      if (!updatedCase) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          status: "error",
          message: "Case not found this case id",
        });
      }
    } else {
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
                case_phase: "Mediation Board",
              },
            }),
          },
          ...(handed_over_non_settlemet === "yes" && {
            $set: {
              case_current_status: "MB Fail with Pending Non-Settlement",
              case_current_phase: "Mediation Board",
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
          message: "Case not found for this case id",
        });
      }
    }
    if (settle === "yes") {
      if (
        !current_arrears_amount ||
        !initial_amount ||
        !calendar_month ||
        !case_current_status
      ) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          status: "error",
          message:
            "Missing required fields:current_arrears_amount, initial amount, calendar months, case_current_status",
        });
      }
      const payload = {
        created_by,
        case_phase: "Mediation Board",
        case_current_status,
        settlement_type: "Type A",
        settlement_amount: current_arrears_amount,
        drc_id,
        settlement_plan_received: [initial_amount, calendar_month],
        case_id,
        remark,
        ro_id,
      };
      try {
        const response = await axios.post(
          "http://124.43.177.52:6000/app3/api/v1/Create_Settlement_Plan",
          payload
        );
        console.log(response.data);
      } catch (error) {
        console.error("Settelment API call failed:", error.message);
        await session.abortTransaction();
        return res.status(500).json({
          status: "error",
          message: "Settlement API call failed",
          error: error.message,
        });
      }
    }
    await session.commitTransaction();
    session.endSession();
    return res.status(200).json({
      status: "success",
      message: "Operation completed successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Inputs:
 * - case_id: Number (required)
 * - request_id: Number (optional)
 * - request_type: String (required if request_id is provided)
 * - request_comment: String (required if request_id is provided)
 * - current_arrears_amount: Number (required if field_reason is "Agreed To Settle")
 * - case_current_status: String (required if field_reason is "Agreed To Settle")
 * - drc_id: Number (required)
 * - ro_id: Number (optional)
 * - ro_name: String (optional)
 * - drc: String (optional)
 * - expire_dtm: String (optional, ISO Date)
 * - created_dtm: String (optional, ISO Date)
 * - field_reason: String (optional)
 * - field_reason_remark: String (required if field_reason is provided)
 * - intraction_id: String (required if request_id is provided)
 * - initial_amount: Number (required if field_reason is "Agreed To Settle")
 * - calender_month: Number (required if field_reason is "Agreed To Settle")
 * - settlement_remark: String (optional)
 * - region: String (optional)
 * - created_by: String (required)
 *
 * Success Result:
 * - Returns a success response indicating the operation completed successfully.
 */
export const Customer_Negotiations = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      case_id,
      request_id,
      request_type,
      request_comment,
      current_arrears_amount,
      case_current_status,
      drc_id,
      ro_id,
      ro_name,
      drc,
      expire_dtm,
      created_dtm,
      field_reason,
      Field_reason_ID,
      field_reason_remark,
      credit_class_no,
      credit_class_name,
      account_manager_code,
      customer_type_name,
      intraction_id,
      initial_amount,
      calender_month,
      settlement_remark,
      region,
      created_by,
    } = req.body;
    if (!case_id || !drc_id) {
      await session.abortTransaction();
      return res.status(400).json({
        status: "error",
        message: "Missing required fields: case_id and drc_id",
      });
    }
    if (field_reason) {
      if (!field_reason_remark) {
        await session.abortTransaction();
        return res.status(400).json({
          status: "error",
          message: "Missing required fields: field_reason_remark",
        });
      }
    }
    const negotiationData = {
      drc_id,
      ro_id,
      drc,
      ro_name,
      created_dtm: new Date(),
      field_reason,
      Field_reason_ID,
      negotiation_remark: field_reason_remark,
    };
    const start = new Date(created_dtm);
    const end = new Date(expire_dtm);

    const years = end.getFullYear() - start.getFullYear();
    const months = end.getMonth() - start.getMonth();

    const validity_period = years * 12 + months;

    if (request_id) {
      if (!request_type || !intraction_id || !request_comment) {
        await session.abortTransaction();
        return res.status(400).json({
          status: "error",
          message:
            "Missing required fields: request_comment, request_type, intraction_id",
        });
      }
      if (request_type == "Mediation board forward request letter") {
        const result = await negotiation_condition_function(
          current_arrears_amount,
          credit_class_no,
          credit_class_name,
          account_manager_code,
          customer_type_name,
          validity_period,
          region,
          expire_dtm,
          case_id,
          created_by
        );
        if (
          result.message !==
          "Request Mediation Board Forward Letter is a valid request"
        ) {
          await session.abortTransaction();
          return res.status(404).json({
            status: "negotiation_condition_function output",
            result,
          });
        }
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
        Interaction_ID: intraction_id,
        User_Interaction_Type: request_type,
        delegate_user_id: await getUserIdOwnedByDRCId(drc_id),
        Created_By: created_by,
        ...dynamicParams,
      });

      if (!result || !result.Interaction_Log_ID) {
        await session.abortTransaction();
        return res.status(500).json({
          status: "error",
          message: "Failed to create user interaction",
        });
      }
      const intraction_log_id = result.Interaction_Log_ID;
      let case_status_with_request = "RO Negotiation";
      const statusMap = {
        "Mediation board forward request letter": "RO Negotiation FMB Pending",
        "Negotiation Settlement plan Request": "RO Negotiation",
        "Negotiation period extend Request": "RO Negotiation Extension Pending",
        "Negotiation customer further information Request": "RO Negotiation",
        "Negotiation Customer request service": "RO Negotiation",
      };
      case_status_with_request = statusMap[request_type] || "MB Negotiation";
      const updatedCase = await Case_details.findOneAndUpdate(
        { case_id },
        {
          $push: {
            ro_negotiation: negotiationData,
            ro_requests: {
              drc_id,
              ro_id,
              created_dtm: new Date(),
              ro_request_id: request_id,
              ro_request: request_type,
              request_remark: request_comment,
              intraction_id: intraction_id,
              intraction_log_id,
            },
            case_status: {
              case_status: case_status_with_request,
              created_dtm: new Date(),
              created_by: created_by,
              case_phase: "Negotiation",
            },
          },
          $set: {
            case_current_status: case_status_with_request,
            case_current_phase: "Negotiation",
          },
        },
        { new: true, session }
      );
      if (!updatedCase) {
        await session.abortTransaction();
        return res.status(404).json({
          status: "error",
          message: "Case not found this case id",
        });
      }
    } else {
      const updatedMediationBoardCase = await Case_details.findOneAndUpdate(
        { case_id: case_id, "drc.drc_id": drc_id },
        {
          $push: {
            ro_negotiation: negotiationData,
          },
        },
        { new: true, session }
      );
      if (!updatedMediationBoardCase) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: "Case not found for this case id",
        });
      }
    }
    if (field_reason === "Agreed To Settle") {
      if (
        !current_arrears_amount ||
        !initial_amount ||
        !calender_month ||
        !case_current_status
      ) {
        await session.abortTransaction();
        return res.status(400).json({
          status: "error",
          message:
            "Missing required fields:current_arrears_amount, initial amount, calendar months, case_current_status",
        });
      }
      const payload = {
        case_id,
        created_by, 
        settlement_type: "Type A",
        settlement_plan_received: [initial_amount, calender_month],
        remark:settlement_remark,
      };
      try {
        const response = await axios.post(
          "https://debtx.slt.lk:6500/api/v1/Create_Settlement_Plan",
          payload
        );
        if(response.status === "error" || response.status === "failed"){
          return res.status(404).json({
            status: "error",
            message: response.status_reason
          });
        };
      } catch (error) {
        await session.abortTransaction();
        return res.status(500).json({
          status: "error",
          message: "Settlement API call failed",
          error: error.message,
        });
      }
    }
    await session.commitTransaction();
    return res.status(200).json({
      status: "success",
      message: "Operation completed successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

export const List_CasesOwened_By_DRC = async (req, res) => {
  const { drc_id, case_id, account_no, from_date, to_date, pages } = req.body;

  try {
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

    let page = Number(pages);
    if (isNaN(page) || page < 1) page = 1;
    const limit = page === 1 ? 10 : 30;
    const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

    const pipeline = [];

    if (case_id) {
      pipeline.push({ $match: { case_id: Number(case_id) } });
    }

    if (account_no) {
      pipeline.push({ $match: { account_no } });
    }

    pipeline.push({
      $addFields: {
        last_drc: { $arrayElemAt: ["$drc", -1] },
      },
    });

    pipeline.push({
      $match: {
        "last_drc.drc_status": "Active",
        "last_drc.removed_dtm": null,
        "last_drc.drc_id": Number(drc_id),
      },
    });

    const dateFilter = {};
    if (from_date) dateFilter.$gte = new Date(from_date);
    if (to_date) {
      const endOfDay = new Date(to_date);
      endOfDay.setHours(23, 59, 59, 999); // Set to end of the day
      dateFilter.$lte = endOfDay;
    };

    if (Object.keys(dateFilter).length > 0) {
      pipeline.push({
        $match: { "last_drc.created_dtm": dateFilter },
      });
    }

    pipeline.push({ $sort: { case_id: -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });
    pipeline.push({
      $project: {
        case_id: 1,
        "last_drc.drc_id": 1,
        "last_drc.created_dtm": 1,
        "last_drc.expire_dtm": 1,
        "last_drc.removed_dtm": 1,
        case_current_status: 1,
        account_no: 1,
        current_arrears_amount: 1,
      },
    });
    
    const filtered_cases = await Case_details.aggregate(pipeline);

    if (filtered_cases.length === 0) {
      return res.status(204).json({
        status: "error",
        message: "No matching cases found for the given criteria.",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Cases retrieved successfully.",
      data: filtered_cases,
    });
  } catch (error) {
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
  const { drc_id, status, ro_id, rtom, action_type, from_date, to_date, pages } =
    req.body;
  let fromDateObj = null;
  let toDateObj = null;
  try {

    let page = Number(pages);
    if (isNaN(page) || page < 1) page = 1;
    const limit = page === 1 ? 10 : 30;
    const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

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
    if (from_date && to_date) {
      fromDateObj = new Date(from_date);
      toDateObj = new Date(to_date);
      toDateObj.setHours(23, 59, 59, 999); // Set to end of the day

      if (isNaN(fromDateObj) || isNaN(toDateObj)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid date format.",
          errors: {
            code: 400,
            description: "from_date and to_date must be valid date strings.",
          },
        });
      }
    }
    // if (
    //   !rtom &&
    //   !status &&
    //   !ro_id &&
    //   !action_type &&
    //   !(toDateObj && fromDateObj)
    // ) {
    //   return res.status(400).json({
    //     status: "error",
    //     message: "At least one filtering parameter is required.",
    //     errors: {
    //       code: 400,
    //       description:
    //         "Provide at least one of rtom, ro_id, action_type, case_current_status, or both from_date and to_date together.",
    //     },
    //   });
    // };
    const allowedStatuses = [
      "RO Negotiation",
      "Negotiation Settle Pending",
      "Negotiation Settle Open-Pending",
      "Negotiation Settle Active",
      "RO Negotiation Extension Pending",
      "RO Negotiation Extended",
      "RO Negotiation FMB Pending",
    ];
    let query = {
      "last_drc.drc_id": drc_id,
      "last_drc.removed_dtm": null,
    };
    if (status) {
      if (allowedStatuses.includes(status)) {
        query.case_current_status = status;
      } else {
        return res.status(400).json({
          status: "error",
          message: "Invalid case status.",
          errors: {
            code: 400,
            description: `Status "${status}" is not allowed. Allowed statuses are: ${allowedStatuses.join(
              ", "
            )}`,
          },
        });
      }
    } else {
      query.case_current_status = { $in: allowedStatuses };
    }
    if (rtom) {
      query.$expr = {
        $eq: [{ $toLower: "$rtom" }, rtom.toLowerCase()]
      };
    }
    if (ro_id) query["last_recovery_officer.ro_id"] = ro_id;
    if (action_type) query.action_type = action_type;
    if (fromDateObj && toDateObj) {
      query["last_drc.created_dtm"] = {
        $gte: fromDateObj,
        $lte: toDateObj,
      };
    }
    const cases = await Case_details.aggregate([
      {
        $addFields: {
          last_drc: { $arrayElemAt: ["$drc", -1] },
          // last_contact: { $arrayElemAt: ["$current_contact", -1] },
          last_recovery_officer: {
            $let: {
              vars: { lastDRC: { $arrayElemAt: ["$drc", -1] } },
              in: "$$lastDRC.recovery_officers",
            },
          },
        },
      },
      {
        $lookup: {
          from: "Recovery_officer",
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
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $project: {
          case_id: 1,
          status: "$case_current_status",
          created_dtm: "$last_drc.created_dtm",
          current_contact_details: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$current_contact_details",
                  as: "item",
                  cond: { $eq: ["$$item.contact_type", "Mobile"] },
                },
              },
              0,
            ],
          },
          area: 1,
          action_type: 1,
          ro_name: { $arrayElemAt: ["$ro_info.ro_name", 0] },
        },
      },
    ]);

    if (!cases || cases.length === 0) {
      return res.status(204).json({
        status: "error",
        message: "No matching cases found for the given criteria.",
        errors: {
          code: 204,
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
export const List_All_Mediation_Board_Cases_By_DRC_ID_or_RO_ID_Ext_01 = async (
  req,
  res
) => {
  const {
    drc_id,
    ro_id,
    rtom,
    case_current_status,
    action_type,
    from_date,
    to_date,
  } = req.body;
  let fromDateObj = null;
  let toDateObj = null;

  try {
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

    if (from_date && to_date) {
      fromDateObj = new Date(from_date);
      toDateObj = new Date(to_date);

      if (isNaN(fromDateObj) || isNaN(toDateObj)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid date format.",
          errors: {
            code: 400,
            description: "from_date and to_date must be valid date strings.",
          },
        });
      }
    }

    // if (
    //   !rtom &&
    //   !case_current_status &&
    //   !ro_id &&
    //   !action_type &&
    //   !(toDateObj && fromDateObj)
    // ) {
    //   return res.status(400).json({
    //     status: "error",
    //     message: "At least one filtering parameter is required.",
    //     errors: {
    //       code: 400,
    //       description:
    //         "Provide at least one of rtom, ro_id, action_type, case_current_status, or both from_date and to_date together.",
    //     },
    //   });
    // }

    const allowedStatuses = [
      "Forward to Mediation Board",
      "MB Negotiation",
      "MB Request Customer-Info",
      "MB Handover Customer-Info",
      "MB Settle Pending",
      "MB Settle Open-Pending",
      "MB Settle Active",
      "MB Fail with Pending Non-Settlement",
    ];

    let query = {
      "last_drc.drc_id": drc_id,
      "last_drc.removed_dtm": null,
    };

    if (case_current_status) {
      if (allowedStatuses.includes(case_current_status)) {
        query.case_current_status = case_current_status;
      } else {
        return res.status(400).json({
          status: "error",
          message: "Invalid case status.",
          errors: {
            code: 400,
            description: `Status "${case_current_status}" is not allowed. Allowed statuses are: ${allowedStatuses.join(
              ", "
            )}`,
          },
        });
      }
    } else {
      query.case_current_status = { $in: allowedStatuses };
    }

    if (rtom) query.rtom = rtom;
    if (ro_id) query["last_recovery_officer.ro_id"] = ro_id;
    if (action_type) query.action_type = action_type;
    if (fromDateObj && toDateObj) {
      query["last_drc.created_dtm"] = {
        $gte: fromDateObj,
        $lte: toDateObj,
      };
    }

    const cases = await Case_details.aggregate([
      {
        $addFields: {
          last_drc: {
            $cond: {
              if: { $isArray: "$drc" },
              then: { $arrayElemAt: ["$drc", -1] },
              else: null,
            },
          },
          // last_contact: {
          //   $cond: {
          //     if: { $isArray: "$current_contact" },
          //     then: { $arrayElemAt: ["$current_contact", -1] },
          //     else: null,
          //   },
          // },
          last_recovery_officer: {
            $cond: {
              if: {
                $and: [
                  { $isArray: "$drc" },
                  { $gt: [{ $size: "$drc" }, 0] },
                  {
                    $isArray: {
                      $getField: {
                        field: "recovery_officers",
                        input: { $arrayElemAt: ["$drc", -1] },
                      },
                    },
                  },
                ],
              },
              then: {
                $let: {
                  vars: {
                    lastDRC: { $arrayElemAt: ["$drc", -1] },
                  },
                  in: {
                    $arrayElemAt: ["$$lastDRC.recovery_officers", -1],
                  },
                },
              },
              else: null,
            },
          },
        },
      },
      {
        $lookup: {
          from: "Recovery_officer",
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
          customer_name: 1,
          account_no: 1,
          mediation_board_count: {
            $cond: {
              if: { $isArray: "$mediation_board" },
              then: { $size: "$mediation_board" },
              else: 0,
            },
          },
          next_calling_date: {
            $cond: {
              if: { $isArray: "$mediation_board" },
              then: {
                $let: {
                  vars: {
                    lastEntry: { $arrayElemAt: ["$mediation_board", -1] },
                  },
                  in: "$$lastEntry.mediation_board_calling_dtm",
                },
              },
              else: null,
            },
          },
          status: "$case_current_status",
          created_dtm: "$last_drc.created_dtm",
          current_contact_details:1,
          area: 1,
          rtom: 1,
          action_type: 1,
          ro_name: {
            $cond: {
              if: { $isArray: "$ro_info" },
              then: { $arrayElemAt: ["$ro_info.ro_name", 0] },
              else: null,
            },
          },
        },
      },
    ]);

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
  const { drc_id, ro_id, rtom, action_type, from_date, to_date,pages } = req.body;
  let fromDateObj = null;
  let toDateObj = null;

  try { 
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

    let page = Number(pages);
    if (isNaN(page) || page < 1) page = 1;

    const limit = page === 1 ? 10 : 30;
    const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

    // if (!rtom && !ro_id && !action_type && !(from_date && to_date)) {
    //   return res.status(400).json({
    //     status: "error",
    //     message: "At least one filtering parameter is required.",
    //     errors: {
    //       code: 400,
    //       description:
    //         "Provide at least one of rtom, ro_id, action_type, or both from_date and to_date together.",
    //     },
    //   });
    // }

    if (from_date && to_date) {
      fromDateObj = new Date(from_date);
      toDateObj = new Date(to_date);

      if (isNaN(fromDateObj) || isNaN(toDateObj)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid date format.",
          errors: {
            code: 400,
            description: "from_date and to_date must be valid date strings.",
          },
        });
      }
    }

    const allowedStatuses = [
      "RO Negotiation",
      "Negotiation Settle Pending",
      "Negotiation Settle Open-Pending",
      "Negotiation Settle Active",
      "RO Negotiation Extension Pending",
      "RO Negotiation Extended",
      "RO Negotiation FMB Pending",
    ];

    let query = {
      "last_drc.drc_id": drc_id,
      "last_drc.removed_dtm": null,
      case_current_status: { $in: allowedStatuses },
    };

    if (rtom) query.rtom = rtom;
    if (ro_id) query["last_recovery_officer.ro_id"] = ro_id;
    if (action_type) query.action_type = action_type;
    if (fromDateObj && toDateObj) {
      query["last_drc.created_dtm"] = {
        $gte: fromDateObj,
        $lte: toDateObj,
      };
    }

    const cases = await Case_details.aggregate([
      {
        $addFields: {
          last_drc: {
            $cond: {
              if: { $isArray: "$drc" },
              then: { $arrayElemAt: ["$drc", -1] },
              else: null,
            },
          },
          // last_contact: {
          //   $cond: {
          //     if: { $isArray: "$current_contact" },
          //     then: { $arrayElemAt: ["$current_contact", -1] },
          //     else: null,
          //   },
          // },
          last_recovery_officer: {
            $cond: {
              if: {
                $and: [
                  { $isArray: "$drc" },
                  { $gt: [{ $size: "$drc" }, 0] },
                  {
                    $isArray: {
                      $getField: {
                        field: "recovery_officers",
                        input: { $arrayElemAt: ["$drc", -1] },
                      },
                    },
                  },
                ],
              },
              then: {
                $let: {
                  vars: {
                    lastDRC: { $arrayElemAt: ["$drc", -1] },
                  },
                  in: {
                    $arrayElemAt: ["$$lastDRC.recovery_officers", -1],
                  },
                },
              },
              else: null,
            },
          },
        },
      },
      {
        $lookup: {
          from: "Recovery_officer",
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
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $project: {
          case_id: 1,
          status: "$case_current_status",
          created_dtm: "$last_drc.created_dtm",
          current_contact_details: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$current_contact_details",
                  as: "item",
                  cond: { $eq: ["$$item.contact_type", "Mobile"] },
                },
              },
              0,
            ],
          },
          customer_name:1,
          account_no:1,
          area: 1,
          action_type: 1,
          ro_name: {
            $cond: {
              if: { $isArray: "$ro_info" },
              then: { $arrayElemAt: ["$ro_info.ro_name", 0] },
              else: null,
            },
          },
        },
      },
    ]);

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

    const caseCount = await Case_details.aggregate([
      {
        $addFields: {
          last_drc: {
            $cond: {
              if: { $isArray: "$drc" },
              then: { $arrayElemAt: ["$drc", -1] },
              else: null,
            },
          },
          last_recovery_officer: {
            $cond: {
              if: {
                $and: [
                  { $isArray: "$drc" },
                  { $gt: [{ $size: "$drc" }, 0] },
                  {
                    $isArray: {
                      $getField: {
                        field: "recovery_officers",
                        input: { $arrayElemAt: ["$drc", -1] },
                      },
                    },
                  },
                ],
              },
              then: {
                $let: {
                  vars: {
                    lastDRC: { $arrayElemAt: ["$drc", -1] },
                  },
                  in: {
                    $arrayElemAt: ["$$lastDRC.recovery_officers", -1],
                  },
                },
              },
              else: null,
            },
          },
        },
      },
      {
        $match: {
          "last_drc.drc_id": drc_id,
          "last_recovery_officer.ro_id": ro_id,
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
      },
      {
        $count: "totalCases",
      },
    ]);

    const count = caseCount.length > 0 ? caseCount[0].totalCases : 0;

    return res.status(200).json({
      status: "success",
      message: "Case count retrieved successfully.",
      data: { count },
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

    const caseCount = await Case_details.aggregate([
      {
        $addFields: {
          last_drc: {
            $cond: {
              if: { $isArray: "$drc" },
              then: { $arrayElemAt: ["$drc", -1] },
              else: null,
            },
          },
          last_recovery_officer: {
            $cond: {
              if: {
                $and: [
                  { $isArray: "$drc" },
                  { $gt: [{ $size: "$drc" }, 0] },
                  {
                    $isArray: {
                      $getField: {
                        field: "recovery_officers",
                        input: { $arrayElemAt: ["$drc", -1] },
                      },
                    },
                  },
                ],
              },
              then: {
                $let: {
                  vars: {
                    lastDRC: { $arrayElemAt: ["$drc", -1] },
                  },
                  in: {
                    $arrayElemAt: ["$$lastDRC.recovery_officers", -1],
                  },
                },
              },
              else: null,
            },
          },
        },
      },
      {
        $match: {
          "last_drc.drc_id": drc_id,
          "last_recovery_officer.ro_id": ro_id,
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
      },
      {
        $count: "totalCases",
      },
    ]);

    const count = caseCount.length > 0 ? caseCount[0].totalCases : 0;

    return res.status(200).json({
      status: "success",
      message: "Case count retrieved successfully.",
      data: { count },
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
// export const CaseDetailsforDRC = async (req, res) => {
//   try {
//     const { case_id, drc_id, ro_id } = req.body;

//     if (!case_id || !drc_id) {
//       return res.status(400).json({
//         status: "error",
//         message: "Both Case ID and DRC ID are required.",
//         errors: {
//           code: 400,
//           description: "Please provide both case_id and drc_id in the request body.",
//         },
//       });
//     }

//     const roFilter = ro_id
//       ? [{ $eq: ["$$item.ro_id", ro_id] }]
//       : [{}]; // No filter if ro_id not provided

//     const caseDetails = await CaseDetails.aggregate([
//       {
//         $match: { case_id: Number(case_id) }
//       },
//       {
//         $project: {
//           case_id: 1,
//           case_current_status: 1,
//           ro_cpe_collect: 1,
//           customer_ref: 1,
//           region: 1,
//           account_no: 1,
//           current_arrears_amount: 1,
//           current_contact: 1,
//           rtom: 1,
//           ref_products: 1,
//           last_payment_date: 1,
//           money_transactions: 1,
//           drc: {
//             $filter: {
//               input: "$drc",
//               as: "item",
//               cond: { $eq: ["$$item.drc_id", Number(drc_id)] }
//             }
//           },
//           mediation_board: {
//             $filter: {
//               input: "$mediation_board",
//               as: "item",
//               cond: { $and: roFilter }
//             }
//           },
//           ro_negotiation: {
//             $filter: {
//               input: "$ro_negotiation",
//               as: "item",
//               cond: { $and: roFilter }
//             }
//           },
//           ro_requests: {
//             $filter: {
//               input: "$ro_requests",
//               as: "item",
//               cond: { $and: roFilter }
//             }
//           }
//         }
//       }
//     ]);

//     if (!caseDetails.length) {
//       return res.status(404).json({
//         status: "error",
//         message: "No case found with the given case_id.",
//         errors: { code: 404 },
//       });
//     }

//     const mediationBoardCount = caseDetails[0]?.mediation_board?.length || 0;

//     return res.status(200).json({
//       status: "success",
//       message: "Case details retrieved successfully.",
//       data: caseDetails,
//       calling_round: mediationBoardCount
//     });

//   } catch (error) {
//     console.error("Error fetching case details:", error);
//     return res.status(500).json({
//       status: "error",
//       message: "Failed to retrieve case details.",
//       errors: {
//         code: 500,
//         description: error.message,
//       },
//     });
//   }
// };

export const CaseDetailsforDRC = async (req, res) => {
  try {
    const { case_id, drc_id, ro_id } = req.body;

    if (!case_id || !drc_id) {
      return res.status(400).json({
        status: "error",
        message: "Both Case ID and DRC ID are required.",
        errors: {
          code: 400,
          description:
            "Please provide both case_id and drc_id in the request body.",
        },
      });
    }

    const pipeline = [
      {
        $match: { case_id: Number(case_id) },
      },
      {
        $addFields: {
          last_drc: { $arrayElemAt: ["$drc", -1] },
        },
      },
      {
        $match: {
          "last_drc.drc_id": Number(drc_id),
        },
      },
    ];

    // If ro_id is provided, add filter for the last recovery officer's ro_id
    if (ro_id) {
      pipeline.push({
        $addFields: {
          last_ro: { $arrayElemAt: ["$last_drc.recovery_officers", -1] },
        },
      });
      pipeline.push({
        $match: {
          "last_ro.ro_id": Number(ro_id),
        },
      });
    }

    pipeline.push({
      $project: {
        case_id: 1,
        case_current_status: 1,
        ro_cpe_collect: 1,
        customer_ref: 1,
        region: 1,
        account_no: 1,
        current_arrears_amount: 1,
       // current_contact: 1,
        current_arrears_amount: 1,
        current_customer_identification:1,
        current_contact_details:1,
        rtom: 1,
        area:1,
        ref_products: 1,
        last_payment_date: 1,
        money_transactions: 1,
        drc: "$last_drc",      
        mediation_board: {
            $filter: {
              input: "$mediation_board",
              as: "item",
              cond: {
                $and: [
                  { $eq: ["$$item.drc_id", Number(drc_id)] },
                  {
                    $cond: [
                      { $ifNull: [ro_id, false] }, 
                      { $eq: ["$$item.ro_id", Number(ro_id)] },
                      { $eq: ["$$item.ro_id", null] } 
                    ]
                  }
                ]
              }
            }
          },
          ro_negotiation: {
            $filter: {
              input: "$ro_negotiation",
              as: "item",
              cond: {
                $and: [
                  { $eq: ["$$item.drc_id", Number(drc_id)] },
                  {
                    $cond: [
                      { $ifNull: [ro_id, false] }, 
                      { $eq: ["$$item.ro_id", Number(ro_id)] },
                      { $eq: ["$$item.ro_id", null] } 
                    ]
                  }
                ]
              }
            }
          },
          ro_requests: {
            $filter: {
              input: "$ro_requests",
              as: "item",
              cond: {
                $and: [
                  { $eq: ["$$item.drc_id", Number(drc_id)] },
                  {
                    $cond: [
                      { $ifNull: [ro_id, false] }, // if ro_id is present
                      { $eq: ["$$item.ro_id", Number(ro_id)] },
                      { $eq: ["$$item.ro_id", null] } // if not present, match null
                    ]
                  }
                ]
              }
            }
          },
      },
    });

    const caseDetails = await CaseDetails.aggregate(pipeline);

    if (!caseDetails.length) {
      return res.status(404).json({
        status: "error",
        message:
          "No matching case found with the given case_id, drc_id and optional ro_id.",
        errors: {
          code: 404,
          description: "No matching document found.",
        },
      });
    }

    const mediationBoardCount = caseDetails[0]?.mediation_board?.length || 0;

    return res.status(200).json({
      status: "success",
      message: "Case details retrieved successfully.",
      data: caseDetails,
      calling_round: mediationBoardCount,
    });
  } catch (error) {
    console.error("Error fetching case details:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve case details.",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }
};
/**
 * Inputs:
 * - None
 *
 * Success Result:
 * - Returns a success response with the list of active mediation records where end_dtm is null.
 */
export const ListActiveMediationResponse = async (req, res) => {
  try {
    // Fetch only negotiations where end_dtm is null
    const activeMediation = await Template_Mediation_Board.find({
      end_dtm: null,
    });

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
      message:
        "Internal server error occurred while fetching active negotiation details.",
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
export const Create_Task_For_Assigned_drc_case_list_download = async (
  req,
  res
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { drc_id, case_id, account_no, from_date, to_date, Created_By } =
      req.body;

    if (!Created_By || !from_date || !to_date || !drc_id) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: "error",
        message:
          "Created By, drc id, from date and to date are required parameter.",
      });
    }

    // Flatten the parameters structure
    const parameters = {
      drc_id,
      case_id,
      account_no,
      from_date:
        from_date && !isNaN(new Date(from_date))
          ? new Date(from_date).toISOString()
          : null,
      to_date:
        to_date && !isNaN(new Date(to_date))
          ? new Date(to_date).toISOString()
          : null,
    };

    // Pass parameters directly (without nesting it inside another object)
    const taskData = {
      Template_Task_Id: 35,
      task_type:
        "Create task for download the Assigned DRC's case list when selected date range is higher than one month",
      ...parameters,
      Created_By,
      task_status: "open",
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
    console.error(
      "Error in Create_Task_For_Assigned_drc_case_list_download:",
      error
    );
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
export const updateDrcCaseDetails2 = async (req, res) => {
  // Extract fields from the request body
  const {
    drc_id,
    ro_id,
    case_id,
    customer_identification,
    contact_no,
    email,
    customer_identification_type,
    contact_type,
    address,
    remark,
  } = req.body;

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
    const caseDetails = await Case_details.findOne(
      { case_id },
      { ro_edited_customer_details: 1, _id: 0 }
    );
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
      return res
        .status(400)
        .json({ error: "Duplicate data detected: Mobile already exists" });
    }

    // Check for duplicate email in ro_edited_customer_details array
    const isDuplicateEmail = caseDetails.ro_edited_customer_details.some(
      (contact) => contact.email === email
    );

    if (isDuplicateEmail) {
      return res
        .status(400)
        .json({ error: "Duplicate data detected: Email already exists" });
    }

    // Check for duplicate nic in ro_edited_customer_details array
    const isDuplicateCustomerIdentification =
      caseDetails.ro_edited_customer_details.some(
        (contact) => contact.customer_identification === customer_identification
      );

    if (isDuplicateCustomerIdentification) {
      return res
        .status(400)
        .json({ error: "Duplicate data detected: NIC already exists" });
    }

    // Check for duplicate address in ro_edited_customer_details array
    const isDuplicateAddress = caseDetails.ro_edited_customer_details.some(
      (contact) => contact.address === address
    );

    if (isDuplicateAddress) {
      return res
        .status(400)
        .json({ error: "Duplicate data detected: address already exists" });
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
    const contactsSchema = {
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
      updateData.$push.ro_edited_customer_details = {
        $each: [editedcontactsSchema],
      };
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

export const updateDrcCaseDetails = async (req, res) => {
  const {
    drc_id,
    ro_id,
    case_id,
    Email,
    Edited_Email,
    Mobile,
    Edited_Mobile,
    Address,
    Edited_Address,
    geo_location,
    Edited_geo_location,
    Driving_License,
    Edited_Driving_License,
    Passport,
    Edited_Passport,
    NIC,
    Edited_NIC,
    remark,
    edited_by,
  } = req.body;
  try {
    if (!case_id && !drc_id) {
      return res.status(400).json({
        status: "error",
        message: "Failed to retrieve Case details.",
        errors: {
          code: 400,
          description: "Case ID and DRC ID is required.",
        },
      });
    };

    const caseDetails = await Case_details.findOne(
      {case_id},
      { current_customer_identification: 1, current_contact_details:1, _id: 0 }
    );

    if (!caseDetails || caseDetails.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No matching cases found for the given criteria.",
        errors: {
          code: 404,
          description: "No cases satisfy the provided criteria.",
        },
      });
    };
    
    let email_ex = Edited_Email != null ? Edited_Email : Email;
    let mobile_ex = Edited_Mobile != null ? Edited_Mobile : Mobile;
    let address_ex = Edited_Address != null ? Edited_Address : Address;
    let geo_location_ex = Edited_geo_location != null ? Edited_geo_location : geo_location;
    let driving_license_ex = Edited_Driving_License != null ? Edited_Driving_License : Driving_License;
    let passport_ex = Edited_Passport != null ? Edited_Passport : Passport;
    let nic_ex = Edited_NIC != null ? Edited_NIC : NIC;

    const newContacts = [
      { contact_type: 'Email', contact: email_ex },
      { contact_type: 'Mobile', contact: mobile_ex },
      { contact_type: 'Address', contact: address_ex },
      { contact_type: 'geo_location', contact: geo_location_ex }
    ];
    const newIdentification  = [
      { Identification_type: 'Driving License', contact: driving_license_ex },
      { Identification_type: 'Passport', contact: passport_ex },
      { Identification_type: 'NIC', contact: nic_ex }
    ];
    const contact_details = [
      Edited_Email ? { contact_type: 'Email', contact: Edited_Email } : null,
      Edited_Mobile ? { contact_type: 'Mobile', contact: Edited_Mobile } : null,
      Edited_Address ? { contact_type: 'Address', contact: Edited_Address } : null,
      Edited_geo_location ? { contact_type: 'geo_location', contact: Edited_geo_location,} : null,
    ].filter(Boolean);

    const customer_identification = [
      Edited_Driving_License ? { Identification_type: 'Driving License', contact: Edited_Driving_License } : null,
      Edited_NIC ? { Identification_type: 'Passport', contact: Edited_NIC } : null,
      Edited_Passport ? { Identification_type: 'NIC', contact: Edited_Passport } : null
    ].filter(Boolean);

    const roeditrecode  = {
      ro_id,
      drc_id,
      edited_dtm: new Date(),
      contact_details:contact_details,
      customer_identification:customer_identification,
      remark,
      edited_by
    };
    const updatedCase = await Case_details.findOneAndUpdate(
      { case_id },
      {
        $push: { ro_edited_customer_details: roeditrecode },
        $set: { 
          current_customer_identification: newIdentification, 
          current_contact_details: newContacts 
        }
      },
      { new: true }
    );
    if (!updatedCase) {
      return res.status(400).json({
        status: "error",
        message: "Failed to update Case details.", 
      });
    }
    return res.status(200).json({
      status: "success",
      data:updatedCase,
    });
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
  let { case_id } = req.body;
  if (!case_id) {
    return res.status(400).json({
      status: "error",
      message: "Failed to retrieve case details.",
      errors: { code: 400, description: "case_id is required" },
    });
  }
  try {
    const query = { case_id: case_id };

    const caseDetails = await Case_details.findOne(query, {
      case_id: 1,
      customer_ref: 1,
      account_no: 1,
      current_arrears_amount: 1,
      last_payment_date: 1,
      drc: 1,
      ro_negotiation: 1,
      _id: 0,
    });

    if (!caseDetails) {
      return res.status(404).json({
        status: "error",
        message: "No Case Details Found.",
        errors: {
          code: 404,
          description: "No data available for the provided DRC_Id",
        },
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
  const mongoConnection = mongoose.connection;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      approver_reference,
      remark,
      remark_edit_by,
      created_by,
      case_status,
    } = req.body;

    if (!approver_reference || !remark || !remark_edit_by || !created_by) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    };
    
    const approver_type = "Case Withdrawal Approval";
    const recode = await Check_valid_approval({ approver_reference, approver_type });
    if (recode !== "success") {
      return res.status(404).json({
        status: "error",
        message: recode,
      });
    };

    const currentDate = new Date();
    const payload = {case_status};
    let case_phase = "";
    try {
      const response = await axios.post(
        "https://debtx.slt.lk:6500/get_case_phase",
        payload
      );
      if (!response.data.case_phase) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: "case_phase not found in API response",
        });
      }
      case_phase = response.data.case_phase;
    } catch (error) {
      console.error("Error during axios call:", error.message);
      if (error.response) {
        console.error("API Error Response:", error.response.data);
      }
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({
        message: "Failed to get case_phase from external API",
        error: error.message,
      });
    }
    const delegate_id = await getApprovalUserIdService({
      case_phase,
      approval_type: "DRC Assign Approval",
    });
    // Generate a new approver_id using the collection_sequence
    const counterResult = await mongoConnection
      .collection("collection_sequence")
      .findOneAndUpdate(
        { _id: "approver_id" },
        { $inc: { seq: 1 } },
        { returnDocument: "after", upsert: true, session }
      );

    const approver_id = counterResult.seq;

    if (!approver_id) {
      throw new Error("Failed to generate Task_Id.");
    }

    // --- Proceed to insert document ---
    const newDocument = new TmpForwardedApprover({
      approver_id,
      approver_reference,
      created_by,
      approver_type,
      approve_status: [
        {
          status: "Open",
          status_date: currentDate,
          status_edit_by: created_by,
        },
      ],
      remark: [
        {
          remark,
          remark_date: currentDate,
          remark_edit_by,
        },
      ],
      approved_deligated_by: delegate_id,
    });

    await newDocument.save({ session });

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
            case_phase,
          },
        },
        $set: {
          case_current_status: "Pending Case Withdrawal",
          case_current_phase: case_phase,
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
      ...dynamicParams,
      session,
    });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      status: "success",
      message: "Case withdrawal request added successfully",
      data: newDocument,
    });
  } catch (error) {
    // console.error("Error withdrawing case:", error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: error.message });
  }
};

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
      "MB Fail with Pending Non-Settlement",
    ];

    // if (!case_status && !RTOM && !DRC && !From_DAT && !TO_DAT) {
    //   return res.status(400).json({
    //     status: "error",
    //     message: "At least one of case_status, From_DAT, TO_DAT, RTOM is required."
    //   });
    // }

    const pipeline = [];

    // Match allowed status
    pipeline.push({
      $match: {
        case_current_status: { $in: allowedStatusTypes },
      },
    });

    // Optional filters
    if (case_status && allowedStatusTypes.includes(case_status)) {
      pipeline.push({
        $match: { case_current_status: case_status },
      });
    }

    if (RTOM) {
      // pipeline.push({ $match: { rtom: RTOM } });
      pipeline.push({
        $match: {
          $expr: {
            $eq: [
              { $toLower: '$rtom' },
              RTOM.toLowerCase()
            ]
          }
        }
      });
    }

    const dateFilter = {};
    if (From_DAT) dateFilter.$gte = new Date(From_DAT);
    if (TO_DAT) {
      const endofDate = new Date(TO_DAT);
      endofDate.setHours(23, 59, 59, 999); // Set to the end of the day
      dateFilter.$lte = new Date(endofDate);
    }

    pipeline.push({
      $addFields: {
        last_mediation_board: { $arrayElemAt: ["$mediation_board", -1] },
      },
    });

    if (Object.keys(dateFilter).length > 0) {
      pipeline.push({
        $match: { "last_mediation_board.created_dtm": dateFilter },
      });
    }

    // Add a projection to get the last DRC entry
    pipeline.push({
      $addFields: {
        last_drc: { $arrayElemAt: ["$drc", -1] },
      },
    });

    pipeline.push({
      $match: {
        "last_drc.drc_status": "Active",
        "last_drc.removed_dtm": null,
      },
    });

    if (DRC) {
      pipeline.push({
        $match: {
          "last_drc.drc_id": Number(DRC),
        },
      });
    }

    pipeline.push({
      $lookup: {
        from: "Recovery_officer", // name of the recovery officer collection
        localField: "last_mediation_board.ro_id",
        foreignField: "ro_id",
        as: "recovery_officer",
      },
    });

    // Optionally flatten the result if you expect only one match
    pipeline.push({
      $addFields: {
        recovery_officer: { $arrayElemAt: ["$recovery_officer", 0] },
      },
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
        area: caseData.area,
        drc_name: caseData.last_drc ? caseData.last_drc.drc_name : null,
        drc_id: caseData.last_drc ? caseData.last_drc.drc_id : null,
        ro_name: caseData.recovery_officer
          ? caseData.recovery_officer.ro_name
          : null,
        calling_round: caseData.mediation_board
          ? caseData.mediation_board.length
          : 0,
        next_calling_date: caseData.last_mediation_board
          ? caseData.last_mediation_board.mediation_board_calling_dtm
          : null,
      };
    });

    return res.status(200).json({
      status: "success",
      message: "Cases retrieved successfully.",
      data: responseData,
    });
  } catch (error) {
    console.error(
      "Error fetching DRC Assign Manager Approvals:",
      error.message
    );
    return res.status(500).json({
      status: "error",
      message: "There is an error ",
    });
  }
};

/**
 * Inputs:
 * - case_id: String (required)
 * - recieved_by: String (required)
 *
 * Collection: Case_details
 *
 * Purpose: Accepts a non-settlement request from the Mediation Board and updates the case status accordingly.
 */
export const Accept_Non_Settlement_Request_from_Mediation_Board = async (
  req,
  res
) => {
  try {
    const { case_id, recieved_by } = req.body;

    if (!case_id) {
      return res.status(400).json({ message: "case_id is required" });
    }
    if (!recieved_by) {
      return res.status(400).json({ message: "recieved_by is required" });
    }

    const caseRecord = await Case_details.findOne({ case_id });

    if (!caseRecord) {
      return res.status(404).json({ message: "Case not found" });
    }

    if (
      caseRecord.case_current_status !== "MB Fail with Pending Non-Settlement"
    ) {
      return res
        .status(400)
        .json({ message: "Case status does not match the required condition" });
    }

    const mediationBoardEntry =
      caseRecord.mediation_board?.[caseRecord.mediation_board.length - 1];

    if (mediationBoardEntry) {
      mediationBoardEntry.received_on = new Date();
      mediationBoardEntry.received_by = recieved_by;
    } else {
      return res
        .status(400)
        .json({ message: "No mediation board entry found for this case" });
    }

    caseRecord.case_current_status = "MB Fail with Non-Settlement";
    caseRecord.case_current_phase = "Mediation Board";

    const newCaseStatus = {
      case_status: "MB Fail with Non-Settlement",
      status_reason: "Non-settlement request accepted from Mediation Board",
      created_dtm: new Date(),
      created_by: recieved_by,
      case_phase: "Mediation Board",
    };

    caseRecord.case_status.push(newCaseStatus);

    await caseRecord.save({ validateBeforeSave: false });

    return res.status(200).json({
      message: "Mediation board data updated successfully",
      caseRecord,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// This is handel previous model isses wich 'User_Interaction_Status' is not an array object before.
export const ListAllRequestLogFromRecoveryOfficers = async (req, res) => {
  try {
    const {
      delegate_user_id,
      User_Interaction_Type,
      // Request_Accept,
      drc_id,
      date_from,
      date_to,
      pages,
    } = req.body;

    let page = Number(pages);
    if (isNaN(page) || page < 1) page = 1;
    const limit = page === 1 ? 10 : 30;
    const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

    if (!delegate_user_id) {
      return res.status(400).json({
        message: "Missing required fields: delegate_user_id is required.",
      });
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
      "Mediation Board Customer request service",
    ];

    // Build match filter - only add date filter if both dates are provided
    const matchFilter = {
      delegate_user_id: delegate_user_id,
    };

    // Add date filter only if both dates are provided
    if (date_from && date_to) {
      const startDate = new Date(date_from);
      const endDate = new Date(date_to);
      endDate.setHours(23, 59, 59, 999);
      matchFilter.CreateDTM = { $gte: startDate, $lte: endDate };
    }

    // Filter User_Interaction_Type
    if (User_Interaction_Type && User_Interaction_Type.trim() !== "") {
      // matchFilter.User_Interaction_Type = User_Interaction_Type;
      // matchFilter.User_Interaction_Type = { $in: validUserInteractionTypes };
      if (validUserInteractionTypes.includes(User_Interaction_Type.trim())) {
        matchFilter.User_Interaction_Type = User_Interaction_Type;
      } else {
        console.error("Invalid interaction type provided");
      }
    } else {
      matchFilter.User_Interaction_Type = { $in: validUserInteractionTypes };
    }

    // Aggregation pipeline
    const pipeline = [
      // Stage 1: Match User_Interaction_Log documents
      {
        $match: matchFilter,
      },

      // Stage 2: Add last status field with proper array handling
      {
        $addFields: {
          last_status: {
            $cond: {
              if: { $isArray: "$User_Interaction_Status" },
              then: {
                $cond: {
                  if: { $gt: [{ $size: "$User_Interaction_Status" }, 0] },
                  then: { $arrayElemAt: ["$User_Interaction_Status", -1] },
                  else: null,
                },
              },
              else: null,
            },
          },
        },
      },

      // Stage 3: Filter by last User_Interaction_Status
      {
        $match: {
          $or: [
            { "last_status.User_Interaction_Status": "Open" },
            { "last_status.User_Interaction_Status": "Seen" },
          ],
        },
      },

      // Stage 4: Lookup Case_details collection
      {
        $lookup: {
          from: "Case_details",
          localField: "parameters.case_id",
          foreignField: "case_id",
          as: "case_details",
        },
      },

      // Stage 5: Unwind case_details array
      {
        $unwind: {
          path: "$case_details",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Stage 6: Unwind ro_requests array
      {
        $unwind: {
          path: "$case_details.ro_requests",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Stage 7: Match ro_requests with Interaction_Log_ID
      {
        $match: {
          $expr: {
            $eq: [
              "$case_details.ro_requests.intraction_log_id",
              "$Interaction_Log_ID",
            ],
          },
        },
      },

      // Stage 8: Lookup Debt_recovery_company collection for drc_name
      {
        $lookup: {
          from: "Debt_recovery_company",
          localField: "case_details.ro_requests.drc_id",
          foreignField: "drc_id",
          as: "drc_details",
        },
      },

      // Stage 9: Unwind drc_details array
      {
        $unwind: {
          path: "$drc_details",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Stage 10: Filter by drc_id if provided
      ...(drc_id
        ? [
            {
              $match: {
                "case_details.ro_requests.drc_id": drc_id,
              },
            },
          ]
        : []),

      // Stage 11: Lookup Request collection
      // {
      //   $lookup: {
      //     from: "Request",
      //     localField: "Interaction_Log_ID",
      //     foreignField: "Interaction_Log_ID",
      //     as: "request_docs"
      //   }
      // },

      // Stage 12: Unwind request_docs array
      // {
      //   $unwind: {
      //     path: "$request_docs",
      //     preserveNullAndEmptyArrays: true
      //   }
      // },

      // Stage 13: Filter by Request_Accept if provided
      // ...(Request_Accept ? [{
      //   $match: {
      //     "request_docs.parameters.Request_Accept": Request_Accept
      //   }
      // }] : []),

      // Stage 14: Add calculated fields
      {
        $addFields: {
          validity_period: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$case_details.created_dtm", null] },
                  { $ne: ["$case_details.monitor_months", null] },
                ],
              },
              then: {
                $concat: [
                  {
                    $dateToString: {
                      date: "$case_details.created_dtm",
                      format: "%Y-%m-%d",
                    },
                  },
                  " - ",
                  {
                    $dateToString: {
                      date: {
                        $dateAdd: {
                          startDate: "$case_details.created_dtm",
                          unit: "month",
                          amount: "$case_details.monitor_months",
                        },
                      },
                      format: "%Y-%m-%d",
                    },
                  },
                ],
              },
              else: {
                $cond: {
                  if: { $ne: ["$case_details.created_dtm", null] },
                  then: {
                    $dateToString: {
                      date: "$case_details.created_dtm",
                      format: "%Y-%m-%d",
                    },
                  },
                  else: "N/A",
                },
              },
            },
          },
        },
      },

      // {
      //   $sort: { CreateDTM: -1 }, // Sort by CreateDTM in descending order
      // },

      // { $skip: skip }, // Skip records for pagination

      // { $limit: limit }, // Limit to the specified number of records

      // Stage 15: Final projection
      // {
      //   $project: {
      //     _id: 0,
      //     case_id: "$case_details.case_id",
      //     case_current_status: "$case_details.case_current_status",
      //     Interaction_Log_ID: "$Interaction_Log_ID",
      //     Interaction_ID: "$Interaction_ID",
      //     User_Interaction_Status: {
      //       $ifNull: ["$last_status.User_Interaction_Status", "N/A"],
      //     },
      //     current_arrears_amount: "$case_details.current_arrears_amount",
      //     Validity_Period: "$validity_period",
      //     drc_id: "$case_details.ro_requests.drc_id",
      //     drc_name: "$drc_details.drc_name",
      //     User_Interaction_Type: "$User_Interaction_Type",
      //     CreateDTM: "$CreateDTM",
      //     // Request_Accept: "$request_docs.parameters.Request_Accept"
      //   },
      // },
    ];

    const DataPipeline = [
      ...pipeline,
      { $sort: { CreateDTM: -1 } }, // Sort by CreateDT
      { $skip: skip }, // Skip records for pagination
      { $limit: limit }, // Limit to the specified number of records
      {
        $project: {
          _id: 0,
          case_id: "$case_details.case_id",
          case_current_phase: "$case_details.case_current_phase",
          case_current_status: "$case_details.case_current_status",
          Interaction_Log_ID: "$Interaction_Log_ID",
          Interaction_ID: "$Interaction_ID",
          User_Interaction_Status: {
            $ifNull: ["$last_status.User_Interaction_Status", "N/A"],
          },
          current_arrears_amount: "$case_details.current_arrears_amount",
          Validity_Period: "$validity_period",
          drc_id: "$case_details.ro_requests.drc_id",
          ro_id: "$case_details.ro_requests.ro_id",
          drc_name: "$drc_details.drc_name",
          User_Interaction_Type: "$User_Interaction_Type",
          CreateDTM: "$CreateDTM",
          // Request_Accept: "$request_docs.parameters.Request_Accept"
        },
      },
    ]

    // Execute the aggregation pipeline
    const results = await User_Interaction_Progress_Log.aggregate(DataPipeline);

    let totalCount = 0;

    if (Number(pages) === 1) {
      const countPipeline = [...pipeline, { $count: "total" }];
      const countResult = await User_Interaction_Progress_Log.aggregate(countPipeline);
      totalCount = countResult[0]?.total || 0;
    }


    if (!results || results.length === 0) {
      return res.status(204).json({
        message: "No matching data found for the specified criteria.",
      });
    }

    return res.status(200).json({
      success: true,
      count: totalCount,
      data: results,
    });
  } catch (error) {
    console.error("Error fetching user interaction response log:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// After adding the aggregration
export const ListRequestLogFromRecoveryOfficers = async (req, res) => {
  try {
    const {
      delegate_user_id,
      User_Interaction_Type,
      "Request Accept": requestAccept,
      drc_name,
      date_from,
      date_to,
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
      "Mediation Board Customer request service",
    ];

    // Build match stage for initial filtering
    let matchStage = { delegate_user_id };

    if (User_Interaction_Type) {
      matchStage.User_Interaction_Type = User_Interaction_Type;
    } else {
      matchStage.User_Interaction_Type = { $in: validUserInteractionTypes };
    }

    if (date_from && date_to) {
      matchStage.CreateDTM = {
        $gte: new Date(date_from),
        $lte: new Date(date_to),
      };
    }

    // Get total count of open requests in a separate query
    const totalRequestCount = await User_Interaction_Log.countDocuments({
      ...matchStage,
      User_Interaction_Status: "Open",
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
          doc_version: { $ifNull: ["$doc_version", 1] },
        },
      },

      // Stage 5: Lookup related requests
      {
        $lookup: {
          from: "Request", // Adjust collection name if needed
          localField: "Interaction_Log_ID",
          foreignField: "RO_Request_Id",
          as: "request",
        },
      },

      // Stage 6: Unwind the request array
      {
        $unwind: {
          path: "$request",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Stage 7: Filter by request accept status if specified
      ...(requestAccept
        ? [
            {
              $match: {
                $or: [
                  { request: { $exists: false } },
                  {
                    $and: [
                      {
                        "request.parameters.Request Accept":
                          requestAccept === "Approve" ? "Yes" : "No",
                      },
                    ],
                  },
                ],
              },
            },
          ]
        : []),

      // Stage 8: Lookup case details
      {
        $lookup: {
          from: "Case_details", // Adjust collection name if needed
          localField: "parameters.case_id",
          foreignField: "case_id",
          as: "case",
        },
      },

      // Stage 9: Unwind the case array
      {
        $unwind: {
          path: "$case",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Stage 10: Calculate validity period
      {
        $addFields: {
          validity_period: {
            $cond: {
              if: {
                $and: [
                  { $ifNull: ["$case.created_dtm", false] },
                  { $ifNull: ["$case.monitor_months", false] },
                ],
              },
              then: {
                $concat: [
                  { $toString: "$case.created_dtm" },
                  " - ",
                  {
                    $toString: {
                      $dateAdd: {
                        startDate: "$case.created_dtm",
                        unit: "month",
                        amount: "$case.monitor_months",
                      },
                    },
                  },
                ],
              },
              else: { $ifNull: [{ $toString: "$case.created_dtm" }, ""] },
            },
          },
          approve_status: {
            $ifNull: ["$request.parameters.Request Accept", "Unknown"],
          },
        },
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
            current_arrears_amount: "$case.current_arrears_amount",
          },
          drc_data: {
            $cond: {
              if: { $isArray: "$case.drc" },
              then: "$case.drc",
              else: {
                $cond: {
                  if: { $ifNull: ["$case.drc", false] },
                  then: ["$case.drc"],
                  else: [],
                },
              },
            },
          },
        },
      },
    ];

    // Execute the aggregation pipeline
    const results = await User_Interaction_Log.aggregate(pipeline);

    if (!results.length) {
      return res.status(204).json({
        message: "No matching interactions found.",
        Request_Count: totalRequestCount,
      });
    }

    // Process DRC data for final response
    const responseData = [];

    results.forEach((result) => {
      if (Array.isArray(result.drc_data) && result.drc_data.length > 0) {
        // Handle array of DRCs
        result.drc_data.forEach((drc) => {
          if (!drc_name || drc.drc_name === drc_name) {
            responseData.push({
              ...result,
              case_details: {
                ...result.case_details,
                drc: {
                  drc_id: drc.drc_id,
                  drc_name: drc.drc_name,
                  drc_status: drc.drc_status,
                },
                Validity_Period: result.validity_period,
              },
              Approve_Status: result.approve_status,
              Request_Count: totalRequestCount,
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
              Validity_Period: result.validity_period,
            },
            Approve_Status: result.approve_status,
            Request_Count: totalRequestCount,
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
        Request_Count: totalRequestCount,
      });
    }

    return res.json(responseData);
  } catch (error) {
    console.error("Error fetching request logs:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// After adding the aggregration
export const ListAllRequestLogFromRecoveryOfficersWithoutUserID = async (
  req,
  res
) => {
  try {
    // Handle empty request body by providing defaults
    const {
      delegate_user_id,
      User_Interaction_Type,
      "Request Accept": requestAccept,
      drc_name,
      date_from,
      date_to,
    } = req.body || {};

    const validUserInteractionTypes = [
      "Mediation board forward request letter",
      "Negotiation Settlement plan Request",
      "Negotiation period extend Request",
      "Negotiation customer further information Request",
      "Negotiation Customer request service",
      "Mediation Board Settlement plan Request",
      "Mediation Board period extend Request",
      "Mediation Board customer further information request",
      "Mediation Board Customer request service",
    ];

    // Build match stage for initial filtering
    let matchStage = {};

    // Only add delegate_user_id to match if it's provided
    if (delegate_user_id) {
      matchStage.delegate_user_id = delegate_user_id;
    }

    if (User_Interaction_Type) {
      matchStage.User_Interaction_Type = User_Interaction_Type;
    } else {
      matchStage.User_Interaction_Type = { $in: validUserInteractionTypes };
    }

    if (date_from && date_to) {
      matchStage.CreateDTM = {
        $gte: new Date(date_from),
        $lte: new Date(date_to),
      };
    }

    // Main aggregation pipeline
    const pipeline = [
      // Stage 1: Match interaction logs based on criteria
      { $match: matchStage },

      // Stage 2: Sort by creation date descending
      { $sort: { CreateDTM: -1 } },

      // Stage 3: Add doc_version if it doesn't exist
      {
        $addFields: {
          doc_version: { $ifNull: ["$doc_version", 1] },
        },
      },

      // Stage 4: Lookup related requests
      {
        $lookup: {
          from: "Request",
          localField: "Interaction_Log_ID",
          foreignField: "RO_Request_Id",
          as: "request",
        },
      },

      // Stage 5: Unwind the request array with preserveNullAndEmptyArrays
      {
        $unwind: {
          path: "$request",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Stage 6: Filter by request accept status if specified
      ...(requestAccept
        ? [
            {
              $match: {
                $or: [
                  { request: { $exists: false } },
                  { request: null },
                  {
                    "request.parameters.Request Accept":
                      requestAccept === "Approve" ? "Yes" : "No",
                  },
                ],
              },
            },
          ]
        : []),

      // Stage 7: Add case_id field from either interaction log or request
      {
        $addFields: {
          case_id: {
            $cond: {
              if: { $ifNull: ["$parameters.case_id", false] },
              then: "$parameters.case_id",
              else: { $ifNull: ["$request.parameters.case_id", null] },
            },
          },
        },
      },

      // Stage 8: Lookup case details
      {
        $lookup: {
          from: "Case_details",
          localField: "case_id",
          foreignField: "case_id",
          as: "case",
        },
      },

      // Stage 9: Unwind the case array with preserveNullAndEmptyArrays
      {
        $unwind: {
          path: "$case",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Stage 10: Calculate validity period and approve status with proper null checks
      {
        $addFields: {
          validity_period: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$case.created_dtm", null] },
                  { $ne: ["$case.monitor_months", null] },
                  { $gt: [{ $ifNull: ["$case.monitor_months", 0] }, 0] },
                ],
              },
              then: {
                $concat: [
                  { $toString: { $ifNull: ["$case.created_dtm", new Date()] } },
                  " - ",
                  {
                    $toString: {
                      $dateAdd: {
                        startDate: {
                          $ifNull: ["$case.created_dtm", new Date()],
                        },
                        unit: "month",
                        amount: { $ifNull: ["$case.monitor_months", 0] },
                      },
                    },
                  },
                ],
              },
              else: {
                $ifNull: [{ $toString: "$case.created_dtm" }, ""],
              },
            },
          },
          approve_status: {
            $ifNull: ["$request.parameters.Request Accept", "Unknown"],
          },
        },
      },

      // Stage 11: Project the structure for final processing
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
            case_id: { $ifNull: ["$case.case_id", null] },
            case_current_status: {
              $ifNull: ["$case.case_current_status", null],
            },
            current_arrears_amount: {
              $ifNull: ["$case.current_arrears_amount", null],
            },
          },
          drc_data: {
            $cond: {
              if: { $isArray: "$case.drc" },
              then: { $ifNull: ["$case.drc", []] },
              else: {
                $cond: {
                  if: { $ifNull: ["$case.drc", false] },
                  then: [{ $ifNull: ["$case.drc", {}] }],
                  else: [],
                },
              },
            },
          },
        },
      },

      // Stage 12: Facet to get both results and count in one query
      {
        $facet: {
          results: [{ $match: {} }],
          openRequestCount: [
            { $match: { User_Interaction_Status: "Open" } },
            { $count: "count" },
          ],
        },
      },
    ];

    // Execute the aggregation pipeline with error handling
    const aggregationResults = await User_Interaction_Log.aggregate(
      pipeline
    ).catch((err) => {
      console.error("Aggregation error:", err);
      return [{ results: [], openRequestCount: [] }];
    });

    // Handle case when aggregation returns empty result
    if (!aggregationResults || !aggregationResults.length) {
      return res.status(204).json({
        message: "No matching interactions found.",
        Request_Count: 0,
      });
    }

    const [aggregationResult] = aggregationResults;
    const { results = [], openRequestCount = [] } = aggregationResult || {};
    const requestCount =
      openRequestCount.length > 0 ? openRequestCount[0].count : 0;

    if (!results || !results.length) {
      return res.status(204).json({
        message: "No matching interactions found.",
        Request_Count: requestCount,
      });
    }

    // Process DRC data for final response
    const responseData = [];

    results.forEach((result) => {
      // Skip if result is null or undefined
      if (!result) return;

      // Ensure drc_data exists and is an array
      const drcData = Array.isArray(result.drc_data) ? result.drc_data : [];

      if (drcData.length > 0) {
        // Handle array of DRCs
        drcData.forEach((drc) => {
          // Skip if drc is null or undefined
          if (!drc) return;

          if (!drc_name || drc.drc_name === drc_name) {
            responseData.push({
              ...result,
              case_details: {
                ...result.case_details,
                drc: {
                  drc_id: drc.drc_id || null,
                  drc_name: drc.drc_name || null,
                  drc_status: drc.drc_status || null,
                },
                Validity_Period: result.validity_period || "",
              },
              Approve_Status: result.approve_status || "Unknown",
              Request_Count: requestCount,
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
              Validity_Period: result.validity_period || "",
            },
            Approve_Status: result.approve_status || "Unknown",
            Request_Count: requestCount,
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
        Request_Count: requestCount,
      });
    }

    return res.json(responseData);
  } catch (error) {
    console.error("Error fetching request logs:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

/**
 * Inputs:
 * - None
 *
 * Success Result:
 * - Returns a success response with the list of negotiations where end_dtm is null (i.e., active negotiations).
 */
export const getActiveNegotiations = async (req, res) => {
  try {
    const activeNegotiations = await TemplateNegotiation.find({
      end_dtm: null,
    });
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

/**
 * Inputs:
 * - request_mode: String (required)
 *
 * Success Result:
 * - Returns a success response with the list of active RO requests filtered by the given request_mode.
 */
export const ListActiveRORequests = async (req, res) => {
  try {
    const { request_mode } = req.body;
    if (!request_mode) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields: request_mode",
      });
    }
    const ro_requests = await Template_RO_Request.find({
      end_dtm: null,
      request_mode,
    });
    return res.status(200).json({
      status: "success",
      message: `Active RO requests with mode '${request_mode}' retrieved successfully.`,
      data: ro_requests,
    });
  } catch (error) {
    console.error("Unexpected error:", error.message);
    return res.status(500).json({
      status: "error",
      message:
        "Internal server error occurred while fetching active RO details.",
      error: error.message,
    });
  }
};

export const Create_task_for_Request_log_download_when_select_more_than_one_month =
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const {
        delegate_user_id,
        User_Interaction_Type,
        drc_id,
        date_from,
        date_to,
      } = req.body;
      if (!delegate_user_id) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Created_By is required" });
      }
      const parameters = {
        drc_id,
        delegate_user_id,
        User_Interaction_Type,
        date_from:
          date_from && !isNaN(new Date(date_from))
            ? new Date(date_from).toISOString()
            : null,
        date_to:
          date_to && !isNaN(new Date(date_to))
            ? new Date(date_to).toISOString()
            : null,
      };
      // --- Create Task ---
      const taskData = {
        Template_Task_Id: 37,
        task_type: "Create Task for Request log List for Download",
        ...parameters,
        Created_By: delegate_user_id,
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

// After adding Aggregration
export const List_Details_Of_Mediation_Board_Acceptance = async (req, res) => {
  try {
    const {
      delegate_user_id,
      User_Interaction_Type,
      case_id,
      Interaction_Log_ID,
    } = req.body;

    if (!delegate_user_id || !case_id || !Interaction_Log_ID) {
      return res.status(400).json({
        message:
          "delegate_user_id, case_id, and Interaction_Log_ID are required",
      });
    }

    let matchStage = { delegate_user_id, Interaction_Log_ID };

    if (User_Interaction_Type) {
      matchStage.User_Interaction_Type = User_Interaction_Type;
    }

    // Define the statuses for conditional logic
    const roNegotiationStatuses = [
      "RO Negotiation",
      "Negotiation Settle Pending",
      "Negotiation Settle Open-Pending",
      "Negotiation Settle Active",
      "RO Negotiation Extension Pending",
      "RO Negotiation Extended",
      "RO Negotiation FMB Pending",
    ];

    const mediationBoardStatuses = [
      "Forward to Mediation Board",
      "MB Negotiation",
      "MB Request Customer-Info",
      "MB Handover Customer-Info",
      "MB Settle Pending",
      "MB Settle Open-Pending",
      "MB Settle Active",
      "MB Fail with Pending Non-Settlement",
      "MB Fail with Non-Settlement",
    ];

    // Main aggregation pipeline
    const pipeline = [
      // Stage 1: Match the specific interaction log
      { $match: matchStage },

      // Stage 2: Lookup case details
      {
        $lookup: {
          from: "Case_details", // Adjust collection name if needed
          let: { case_id: case_id },
          pipeline: [
            { $match: { $expr: { $eq: ["$case_id", "$$case_id"] } } },
            {
              $project: {
                case_id: 1,
                customer_ref: 1,
                account_no: 1,
                customer_name: 1,
                current_arrears_amount: 1,
                account_manager_code: 1,
                last_payment_date: 1,
                monitor_months: 1,
                incident_id: 1,
                customer_type_name: 1,
                case_current_status: 1,
                ro_negotiation: 1,
                mediation_board: 1,
                ro_requests: 1,
                validity_expire_dtm: { $arrayElemAt: ["$drc.expire_dtm", -1] },
                validity_period_months: {
                  $dateDiff: {
                    startDate: { $arrayElemAt: ["$drc.created_dtm", -1] },
                    endDate: { $arrayElemAt: ["$drc.expire_dtm", -1] },
                    unit: "month",
                  },
                },
              },
            },
          ],
          as: "case_details",
        },
      },

      // Stage 3: Unwind case details
      {
        $unwind: {
          path: "$case_details",
          preserveNullAndEmptyArrays: false,
        },
      },

      // Stage 4: Lookup incident details
      // {
      //   $lookup: {
      //     from: "Incident", // Adjust collection name if needed
      //     let: { incident_id: "$case_details.incident_id" },
      //     pipeline: [
      //       { $match: { $expr: { $eq: ["$Incident_Id", "$$incident_id"] } } },
      //       {
      //         $project: {
      //           "Customer_Details.Customer_Type_Name": 1,
      //           "Marketing_Details.ACCOUNT_MANAGER": 1
      //         }
      //       }
      //     ],
      //     as: "incident"
      //   }
      // },

      // Stage 5: Unwind incident (optional)
      {
        $unwind: {
          path: "$incident",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Stage 6: Lookup request history
      // {
      //   $lookup: {
      //     from: "User_Interaction_Log", // Adjust collection name if needed
      //     let: { delegate_id: "$delegate_user_id", log_id: "$Interaction_Log_ID" },
      //     pipeline: [
      //       {
      //         $match: {
      //           $expr: {
      //             $and: [
      //               { $eq: ["$delegate_user_id", "$$delegate_id"] },
      //               { $ne: ["$Interaction_Log_ID", "$$log_id"] }
      //             ]
      //           }
      //         }
      //       },
      //       { $project: { _id: 0, __v: 0 } }
      //     ],
      //     as: "Request_History"
      //   }
      // },

      // Stage 7: Format the response
      {
        $project: {
          _id: 0,
          case_id: "$case_details.case_id",
          customer_ref: "$case_details.customer_ref",
          customer_name: "$case_details.customer_name",
          customer_type_name: "$case_details.customer_type_name",
          account_no: "$case_details.account_no",
          current_arrears_amount: "$case_details.current_arrears_amount",
          account_manager_code: "$case_details.account_manager_code",
          last_payment_date: "$case_details.last_payment_date",
          monitor_months: "$case_details.monitor_months",
          incident_id: "$case_details.incident_id",
          case_current_status: "$case_details.case_current_status",
          validity_expire_dtm: "$case_details.validity_expire_dtm",
          validity_period_months: "$case_details.validity_period_months",

          ro_requests: "$case_details.ro_requests",

          // Conditionally include ro_negotiation or mediation_board based on status
          ro_negotiation: {
            $cond: {
              if: {
                $in: [
                  "$case_details.case_current_status",
                  roNegotiationStatuses,
                ],
              },
              then: "$case_details.ro_negotiation",
              else: "$$REMOVE",
            },
          },
          mediation_board: {
            $cond: {
              if: {
                $in: [
                  "$case_details.case_current_status",
                  mediationBoardStatuses,
                ],
              },
              then: "$case_details.mediation_board",
              else: "$$REMOVE",
            },
          },

          // Add incident details
          // Customer_Type_Name: { $ifNull: ["$incident.Customer_Details.Customer_Type_Name", null] },
          // ACCOUNT_MANAGER: { $ifNull: ["$incident.Marketing_Details.ACCOUNT_MANAGER", null] },

          // Include request history
          // Request_History: 1
        },
      },
    ];

    // Execute the aggregation pipeline
    const results = await User_Interaction_Progress_Log.aggregate(pipeline);

    if (!results || results.length === 0) {
      return res.status(204).json({ message: "No matching data found." });
    }

    return res.json(results[0]);
  } catch (error) {
    console.error("Error fetching case details:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Define the status mapping based on User_Interaction_Type and Request Accept
// const statusMapping = {
//   "Mediation board forward request letter": { Yes: "Forward to Mediation Board", No: "RO Negotiation" },
//   "Negotiation Settlement plan Request": { Yes: "Negotiation Settle Pending", No: "RO Negotiation" },
//   "Negotiation period extend Request": { Yes: "RO Negotiation Extension Pending", No: "RO Negotiation" },
//   "Negotiation customer further information Request": { Yes: "RO Negotiation", No: "RO Negotiation" },
//   "Negotiation Customer request service": { Yes: "RO Negotiation", No: "RO Negotiation" },
//   "Mediation Board Settlement plan Request": { Yes: "MB Settle Pending", No: "MB Negotiation" },
//   "Mediation Board period extend Request": { Yes: "MB Negotiation", No: "MB Negotiation" },
//   "Mediation Board customer further information request": { Yes: "MB Negotiation", No: "MB Negotiation" },
//   "Mediation Board Customer request service": { Yes: "MB Negotiation", No: "MB Negotiation" }
// };

/**
 * Inputs:
 * - create_by: String (required)
 * - Interaction_Log_ID: Number (required)
 * - case_id: Number (required)
 * - User_Interaction_Type: String (required)
 * - Interaction_ID: Number (required)
 * - requestAccept: String (required)
 * - Reamrk: String (Optional)
 * - No_of_Calendar_Month: Number (Optional)
 * - Letter_Send: String (Optional)
 *
 * Description: Submits a mediation board acceptance request based on the provided parameters.
 *
 * Collections:
 * - Request
 * - Case_details
 * - User_Interaction_Log
 * - User_Interaction_Progress_Log
 *
 * Success Result:
 * - Returns a success response.
 */
export const Submit_Mediation_Board_Acceptance = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const requestMapping = {
    "Mediation board forward request letter": "RO Negotiation FMB Pending",
    "Negotiation Settlement plan Request": "RO Negotiation",
    "Negotiation period extend Request": "RO Negotiation",
    "Negotiation customer further information Request": "RO Negotiation",
    "Negotiation Customer request service": "RO Negotiation",
    "Mediation Board Settlement plan Request": "MB Negotiation",
    "Mediation Board period extend Request": "MB Negotiation",
    "Mediation Board customer further information request": "MB Negotiation",
    "Mediation Board Customer request service": "MB Negotiation",
  };

  // Define the status mapping based on User_Interaction_Type and Request Accept
  const statusMapping = {
    "Mediation board forward request letter": {
      Yes: "Forward to Mediation Board",
      No: "RO Negotiation",
    },
    "Negotiation Settlement plan Request": {
      Yes: "Negotiation Settle Pending",
      No: "RO Negotiation",
    },
    "Negotiation period extend Request": {
      Yes: "RO Negotiation Extension Pending",
      No: "RO Negotiation",
    },
    "Negotiation customer further information Request": {
      Yes: "RO Negotiation",
      No: "RO Negotiation",
    },
    "Negotiation Customer request service": {
      Yes: "RO Negotiation",
      No: "RO Negotiation",
    },
    "Mediation Board Settlement plan Request": {
      Yes: "MB Settle Pending",
      No: "MB Negotiation",
    },
    "Mediation Board period extend Request": {
      Yes: "MB Negotiation",
      No: "MB Negotiation",
    },
    "Mediation Board customer further information request": {
      Yes: "MB Negotiation",
      No: "MB Negotiation",
    },
    "Mediation Board Customer request service": {
      Yes: "MB Negotiation",
      No: "MB Negotiation",
    },
  };

  const phaseMapping = {
    "RO Negotiation": "Negotiation",
    "Negotiation Settle Pending": "Negotiation",
    "RO Negotiation Extension Pending": "Negotiation",

    "MB Negotiation": "Mediation Board",
    "MB Settle Pending": "Mediation Board",
    "Forward to Mediation Board": "Mediation Board",
  };

  try {
    const {
      create_by,
      Interaction_Log_ID,
      case_id,
      User_Interaction_Type,
      // Request_Mode,
      Interaction_ID,
      // "Request Accept": requestAccept,
      requestAccept,
      Reamrk,
      No_of_Calendar_Month,
      Letter_Send,
    } = req.body;

    if (
      !create_by ||
      !Interaction_Log_ID ||
      !User_Interaction_Type ||
      !case_id ||
      !Interaction_ID ||
      !requestAccept
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message:
          "create_by, Interaction_Log_ID, User_Interaction_Type, case_id, Interaction_ID, requestAccept are required.",
      });
    }

    // Decide the new case status based on User_Interaction_Type and Request Accept
    const caseStatus = statusMapping[User_Interaction_Type]?.[requestAccept];

    const requestedCaseStatus = requestMapping[User_Interaction_Type];

    console.log("Requested Case Status:", requestedCaseStatus);
    console.log("Case Status:", caseStatus);

    if (!caseStatus || !requestedCaseStatus) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: `Invalid User_Interaction_Type or Request Accept value provided.`,
      });
    }

    const existingCase = await Case_details.findOne(
      { case_id: case_id },
      { drc: 1, case_current_status: 1 }
    ).session(session);

    if (!existingCase) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ message: `Case with case_id ${case_id} not found.` });
    }

    // if (existingCase.case_current_status != requestedCaseStatus) {
    //   await session.abortTransaction();
    //   session.endSession();
    //   return res.status(409).json({
    //     message: `Cannot submit ${User_Interaction_Type} when case is not in ${requestedCaseStatus} status.`,
    //   });
    // };

    const approvalDoc = await User_Interaction_Log.findOne({
      Interaction_Log_ID,
    }).session(session);

    if (!approvalDoc) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ message: "No matching Interaction_Log_ID found" });
    }

    // Create a new request document
    const newRequest = new Request({
      case_id: case_id,
      Interaction_Log_ID: Interaction_Log_ID,
      // RO_Request_Id: Interaction_Log_ID,
      Request_Description: User_Interaction_Type,
      created_dtm: new Date(),
      created_by: create_by,
      // Request_Mode: Request_Mode,
      Intraction_ID: Interaction_ID,
      parameters: {
        Request_Accept: requestAccept,
        Reamrk: Reamrk,
        No_of_Calendar_Month: No_of_Calendar_Month,
        Letter_Send: Letter_Send,
        Request_CreatedDTM: approvalDoc.CreateDTM,
      },
    });

    const savedRequest = await newRequest.save({ session });

    // Update the DRC expire_dtm if No_of_Calendar_Month is provided
    if (No_of_Calendar_Month && No_of_Calendar_Month !== "null") {
      const monthsToAdd = parseInt(No_of_Calendar_Month, 10);
      if (isNaN(monthsToAdd) || monthsToAdd < 0) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ message: "Invalid No_of_Calendar_Month value." });
      }

      const drcArrayLength = existingCase.drc.length;
      const lastDrcIndex = drcArrayLength - 1;
      const lastDrc = existingCase.drc[lastDrcIndex];

      const startDate = new Date(lastDrc.created_dtm);
      const endDate = new Date(lastDrc.expire_dtm);

      const currentDuration =
        (endDate.getFullYear() - startDate.getFullYear()) * 12 +
        (endDate.getMonth() - startDate.getMonth());

      const totalAfterAdd = currentDuration + monthsToAdd;

      if (totalAfterAdd > 5) {
        await session.abortTransaction();
        session.endSession();
        return res.status(405).json({
          message: `Cannot extend DRC expire_dtm beyond a total of 5 months.`,
        });
      }

      const extendedExpireDate = new Date(lastDrc.expire_dtm);
      extendedExpireDate.setMonth(extendedExpireDate.getMonth() + monthsToAdd);

      await Case_details.updateOne(
        { case_id: case_id },
        { $set: { [`drc.${lastDrcIndex}.expire_dtm`]: extendedExpireDate } },
        { session }
      );
    }

    // Update the case status and current phase if it has changed
    if (existingCase.case_current_status != caseStatus && existingCase.case_current_status === requestedCaseStatus) {
      const newCaseStatus = {
        case_status: caseStatus,
        status_reason: Reamrk || null,
        created_dtm: new Date(),
        created_by: create_by,
        notified_dtm: null,
        expire_dtm: null,
        case_phase: phaseMapping[caseStatus] || null,
      };

      const updateFields = {
        $push: { case_status: newCaseStatus },
        $set: {
          case_current_status: caseStatus,
          case_current_phase: phaseMapping[caseStatus] || null,
        },
      };

      await Case_details.updateOne({ case_id: case_id }, updateFields, {
        session,
      });
    }

    // Update the completed_dtm for the RO request
    const completedDate = new Date();
    await Case_details.updateOne(
      { case_id: case_id, "ro_requests.intraction_log_id": Interaction_Log_ID },
      { $set: { "ro_requests.$.completed_dtm": completedDate } },
      { session }
    );

    // Update the User Interaction Log with new status
    const newUserInteractionStatus = {
      User_Interaction_Status: "Complete",
      created_dtm: new Date(),
    };

    await User_Interaction_Log.updateOne(
      { Interaction_Log_ID: Interaction_Log_ID },
      { $push: { User_Interaction_Status: newUserInteractionStatus } },
      { session }
    );

    const deligate_id = approvalDoc.Created_By;

    // --- Create User Interaction Log ---
    const interaction_id = 19;
    // const request_type = "Approved Mediation Board forward request";
    const created_by = create_by;
    const dynamicParams = {
      case_id: case_id,
      Accept: requestAccept,
      request_type: User_Interaction_Type,
    };

    // Inserte a new request log
    await createUserInteractionFunction({
      Interaction_ID: interaction_id,
      User_Interaction_Type: User_Interaction_Type,
      delegate_user_id: deligate_id, // Now using created_by as delegate ID
      Created_By: created_by,
      ...dynamicParams,
      session: session,    
    });

    // Delete the User Interaction Progress Log entry
    await User_Interaction_Progress_Log.deleteOne(
      { Interaction_Log_ID },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Mediation Board Acceptance Request submitted successfully.",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    // console.error("Error:", error);
    return res
      .status(500)
      .json({ message: "Failed to submit request.", error: error.message });
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
      Letter_Send,
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
        Reamrk: Reamrk,
        No_of_Calendar_Month: No_of_Calendar_Month,
        Letter_Send: Letter_Send,
      },
    });

    const savedRequest = await newRequest.save({ session });
    const existingCase = await Case_details.findOne({
      case_id: case_id,
    }).session(session);

    if (!existingCase) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(204)
        .json({ message: `Case with case_id ${case_id} not found.` });
    }

    const existingMonitorMonths = existingCase.monitor_months || 0;
    let finalMonitorMonths = existingMonitorMonths;
    let monthsToAdd = 0;

    if (No_of_Calendar_Month && No_of_Calendar_Month !== "null") {
      monthsToAdd = parseInt(No_of_Calendar_Month, 10);
      if (isNaN(monthsToAdd) || monthsToAdd < 0) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ message: "Invalid No_of_Calendar_Month value." });
      }

      finalMonitorMonths = existingMonitorMonths + monthsToAdd;
      if (finalMonitorMonths > 5) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(405)
          .json({ message: `Cannot update monitor_months beyond 5.` });
      }
    }

    const newCaseStatus = {
      case_status: "Withdraw",
      status_reason: Reamrk || null,
      created_dtm: new Date(),
      created_by: create_by,
      case_phase: "Abnormal",
    };

    const updateFields = {
      $push: { case_status: newCaseStatus },
      $set: {
        case_current_status: "Withdraw",
        monitor_months: finalMonitorMonths,
        case_current_phase: "Abnormal",
      },
    };

    await Case_details.updateOne({ case_id: case_id }, updateFields, {
      session,
    });
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

    const approvalDoc = await User_Interaction_Log.findOne({
      Interaction_Log_ID,
    }).session(session);

    if (!approvalDoc) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(204)
        .json({ message: "No matching Interaction_Log_ID found" });
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
      delegate_user_id: deligate_id, // Now using created_by as delegate ID
      Created_By: created_by,
      ...dynamicParams,
    });

    const drcArrayLength = existingCase.drc.length;
    let extendedExpireDate = null;

    if (drcArrayLength > 0 && monthsToAdd > 0) {
      const lastDrcIndex = drcArrayLength - 1;
      const lastExpireDtm = existingCase.drc[lastDrcIndex].expire_dtm;

      if (lastExpireDtm) {
        extendedExpireDate = new Date(lastExpireDtm);
        extendedExpireDate.setMonth(
          extendedExpireDate.getMonth() + monthsToAdd
        );

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
        newMonitorExpireDtm.setMonth(
          newMonitorExpireDtm.getMonth() + monthsToAdd
        );

        await CaseMonitor.updateOne(
          { case_id: case_id },
          {
            $set: {
              Monitor_Expire_Dtm: newMonitorExpireDtm,
              Last_Request_On: new Date(),
            },
          },
          { session }
        );
      }
    }

    if (No_of_Calendar_Month) {
      const caseMonitorLog = await CaseMonitorLog.findOne({ case_id: case_id });
      if (caseMonitorLog) {
        let newnewMonitorExpireDtm = new Date(
          caseMonitorLog.Monitor_Expire_Dtm
        );
        newnewMonitorExpireDtm.setMonth(
          newnewMonitorExpireDtm.getMonth() + monthsToAdd
        );

        await CaseMonitorLog.updateOne(
          { case_id: case_id },
          { $set: { Monitor_Expire_Dtm: newnewMonitorExpireDtm } },
          { session }
        );
      }
    }

    const delegated_user_id = await getApprovalUserIdService({
      case_phase: "Initial Review",
      approval_type: "Manager Approval",
    });

    // Generate a new approver_id
    const counterResult = await mongoConnection
      .collection("collection_sequence")
      .findOneAndUpdate(
        { _id: "approver_id" },
        { $inc: { seq: 1 } },
        { returnDocument: "after", upsert: true, session }
      );

    const approver_id = counterResult.seq;

    if (!approver_id) {
      throw new Error("Failed to generate Task_Id.");
    }

    const forwardedApprover = new TmpForwardedApprover({
      approver_id,
      approver_reference: case_id,
      created_on: new Date(),
      created_by: create_by,
      approve_status: [
        { status: "Open", status_date: new Date(), status_edit_by: create_by },
      ],
      approver_type: "Case Withdrawal Approval",
      parameters: {
        "Request Accept": requestAccept,
        Reamrk: Reamrk,
        No_of_Calendar_Month: No_of_Calendar_Month,
        Letter_Send: Letter_Send,
      },
      approved_deligated_by: delegated_user_id,
      remark: [
        {
          remark: Reamrk || "Withdrawal requested",
          remark_date: new Date(),
          remark_edit_by: create_by,
        },
      ],
    });

    const savedForwardApprover = await forwardedApprover.save({ session });
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Withdrawal mediation board request submitted successfully.",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      message: "Failed to process withdrawal mediation board acceptance.",
      error: error.message,
    });
  }
};

/**
 * Inputs:
 * - case_id: Number (required)
 * - drc_id: Number (required)
 * - ro_id: Number (optional)
 * - order_id: Number (optional)
 * - product_label: String (optional)
 * - service_type: String (optional)
 * - cp_type: String (required)
 * - cpe_model: String (required)
 * - serial_no: String (required)
 * - remark: String (optional)
 *
 * Success Result:
 * - Returns a success response with the updated case details including the new RO CPE collection data.
 */
export const RO_CPE_Collection = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      case_id,
      drc_id,
      ro_id,
      order_id,
      product_label,
      service_type,
      cp_type,
      cpe_model,
      serial_no,
      remark,
      Created_By,
    } = req.body;

    if (!case_id || !drc_id || !cp_type || !cpe_model || !serial_no) {
      await session.abortTransaction();
      return res.status(400).json({
        message:
          "case_id, drc_id, cpe_model, serial_no and cp_type are required",
      });
    }
    const mongoConnection = await db.connectMongoDB();
    if (!mongoConnection) {
      await session.abortTransaction();
      return res.status(500).json({ message: "Failed to connect to MongoDB" });
    }
    const counterResult = await mongoConnection
      .collection("collection_sequence")
      .findOneAndUpdate(
        { _id: "ro_cpe_collect_id" },
        { $inc: { seq: 1 } },
        { returnDocument: "after", upsert: true }
      );
    if (!counterResult.seq) {
      await session.abortTransaction();
      return res
        .status(500)
        .json({ message: "Failed to generate ro_cpe_collect_id" });
    }

    const ro_cpe_collect_id = counterResult.seq;

    const updatedCaseDetails = await Case_details.findOneAndUpdate(
      { case_id },
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
          },
        },
      },
      { new: true, session }
    );
    if (!updatedCaseDetails) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Case not found" });
    }
    const parameters = {
      case_id,
      serial_no,
      product_label,
    };
    const taskData = {
      Template_Task_Id: 51,
      task_type: "Monitor and Update RCMP Details",
      ...parameters,
      task_status: "open",
      Created_By,
    };

    await createTaskFunction(taskData, session);

    await session.commitTransaction();

    return res.status(200).json({
      status: "success",
      message: "Case has been updated successfully",
      data: updatedCaseDetails,
    });
  } catch (error) {
    await session.abortTransaction();
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  } finally {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    await session.endSession();
  }
};

export const List_Request_Response_log = async (req, res) => {
  try {
    const { case_current_status, date_from, date_to, pages } = req.body;
    console.log("Request body:", req.body);

    // if (!date_from || !date_to || !case_current_status) {
    //   return res.status(400).json({
    //     message:
    //       "Missing required fields: case_current_status, date_from, and date_to are required.",
    //   });
    // }

    let page = Number(pages);
    if (isNaN(page) || page < 1) page = 1;
    const limit = page === 1 ? 10 : 30;
    const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

    const pipeline = [];

    // const startDate = new Date(date_from);
    // const endDate = new Date(date_to);
    // endDate.setHours(23, 59, 59, 999);

    if (date_from && date_to) {
      const startDate = new Date(date_from);
      const endDate = new Date(date_to);
      endDate.setHours(23, 59, 59, 999);

      pipeline.push({
        $match: {
          created_dtm: { $gte: startDate, $lte: endDate }
        }
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: "Case_details",
          localField: "case_id",
          foreignField: "case_id",
          as: "case_details",
        },
      },

      {
        $unwind: {
          path: "$case_details",
          preserveNullAndEmptyArrays: true,
        },
      },
    );

    if (case_current_status) {
      pipeline.push({
        $match: {
          Request_Description: case_current_status,
        },
      });
    };

    // Aggregation pipeline
    pipeline.push(
      // ...pipeline,
      // Stage 1: Match requests within date range
      // {
      //   $match: {
      //     created_dtm: { $gte: startDate, $lte: endDate },
      //   },
      // },

      // Stage 2: Lookup Case_details collection
      // {
      //   $lookup: {
      //     from: "Case_details",
      //     localField: "case_id",
      //     foreignField: "case_id",
      //     as: "case_details",
      //   },
      // },

      // Stage 3: Unwind case_details array
      // {
      //   $unwind: {
      //     path: "$case_details",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },

      // Stage 4: Filter by case_current_status
      // {
      //   $match: {
      //     "case_details.case_current_status": case_current_status,
      //   },
      // },

      // Stage 5: Unwind ro_requests array to find matching interaction_log_id
      {
        $unwind: {
          path: "$case_details.ro_requests",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Stage 6: Match ro_requests with Interaction_Log_ID
      {
        $match: {
          $expr: {
            $eq: [
              "$Interaction_Log_ID",
              "$case_details.ro_requests.intraction_log_id",
            ],
          },
        },
      },

      // Stage 7: Lookup User_Interaction_Log collection
      {
        $lookup: {
          from: "User_Interaction_Log",
          localField: "Interaction_Log_ID",
          foreignField: "Interaction_Log_ID",
          as: "user_interaction_log",
        },
      },

      // Stage 8: Unwind user_interaction_log array
      {
        $unwind: {
          path: "$user_interaction_log",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Stage 9: Lookup Debt_recovery_company collection for drc_name
      {
        $lookup: {
          from: "Debt_recovery_company",
          localField: "case_details.ro_requests.drc_id",
          foreignField: "drc_id",
          as: "drc_details",
        },
      },

      // Stage 10: Unwind drc_details array
      {
        $unwind: {
          path: "$drc_details",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Stage 11: Add calculated fields
      {
        $addFields: {
          // Calculate Validity Period
          validity_period: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$case_details.created_dtm", null] },
                  { $ne: ["$case_details.monitor_months", null] },
                ],
              },
              then: {
                $concat: [
                  {
                    $dateToString: {
                      date: { $toDate: "$case_details.created_dtm" },
                      format: "%Y-%m-%d",
                    },
                  },
                  " - ",
                  {
                    $dateToString: {
                      date: {
                        $dateAdd: {
                          startDate: { $toDate: "$case_details.created_dtm" },
                          unit: "month",
                          amount: "$case_details.monitor_months",
                        },
                      },
                      format: "%Y-%m-%d",
                    },
                  },
                ],
              },
              else: {
                $dateToString: {
                  date: { $toDate: "$case_details.created_dtm" },
                  format: "%Y-%m-%d",
                },
              },
            },
          },

          // Get last User_Interaction_Status
          last_user_interaction_status: {
            $cond: {
              if: {
                $and: [
                  { $isArray: "$user_interaction_log.User_Interaction_Status" },
                  { $gt: [{ $size: "$user_interaction_log.User_Interaction_Status" }, 0] },
              ],
              },
              then: {
                $arrayElemAt: [
                  "$user_interaction_log.User_Interaction_Status.User_Interaction_Status",
                  -1,
                ],
              },
              else: null,
            },
          },

          // Letter Issued On
          letter_issued_on: {
            $cond: {
              if: { $eq: ["$parameters.Letter_Send", true] },
              then: "$created_dtm",
              else: null,
            },
          },

          // Get Remark from parameters
          remark: {
            $ifNull: ["$parameters.Reamrk", null],
          },

          acceptance: {
            $ifNull: ["$parameters.Request_Accept", null],
          },

          request_created_dtm: {
            $ifNull: ["$parameters.Request_CreatedDTM", null],
          },
        },
      },

      // Stage 12: Final projection
      {
        $project: {
          _id: 0,
          case_id: "$case_id",
          case_current_status: "$case_details.case_current_status",
          User_Interaction_Status: "$acceptance",
          Validity_Period: "$validity_period",
          drc_id: "$case_details.ro_requests.drc_id",
          drc_name: "$drc_details.drc_name",
          Request_Description: "$Request_Description",
          Letter_Issued_on: "$letter_issued_on",
          created_dtm: "$created_dtm",
          created_by: "$created_by",
          Remark: "$remark",
          request_created_dtm: "$request_created_dtm",
        },
      },

      {
        $sort: { created_dtm: -1 }, // Sort by created_dtm in descending order
      },

      {
        $skip: skip, // Skip documents for pagination
      },

      {
        $limit: limit, // Limit the number of documents returned
      }
    );

    // Execute the aggregation pipeline
    const results = await Request.aggregate(pipeline);

    if (!results || results.length === 0) {
      return res.status(204).json({
        message: "No matching data found for the specified criteria.",
      });
    }

    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error fetching request response log:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const Create_Task_For_Request_Responce_Log_Download = async (
  req,
  res
) => {
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
      date_from:
        date_from && !isNaN(new Date(date_from))
          ? new Date(date_from).toISOString()
          : null,
      date_to:
        date_to && !isNaN(new Date(date_to))
          ? new Date(date_to).toISOString()
          : null,
    };

    // Pass parameters directly (without nesting it inside another object)
    const taskData = {
      Template_Task_Id: 38,
      task_type: "Create Request Response Log List for Download",
      ...parameters,
      task_status: "open",
      Created_By,
    };

    // Call createTaskFunction
    const response = await createTaskFunction(taskData, session);

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      status: "success",
      message: "Task created successfully.",
      data: response,
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

export const List_Settlement_Details_Owen_By_SettlementID_and_DRCID = async (
  req,
  res
) => {
  try {
    const { case_id, drc_id, ro_id } = req.body;

    if (!case_id || !drc_id) {
      return res.status(400).json({
        status: "error",
        message: "case id and drc id are a required parameters.",
      });
    }
    const result = await Case_details.aggregate([
      {
        $match: { case_id },
      },
      {
        $project: {
          settlementIds: {
            $map: {
              input: "$settlement",
              as: "s",
              in: "$$s.settlement_id",
            },
          },
        },
      },
      {
        $lookup: {
          from: "Case_settlements",
          localField: "settlementIds",
          foreignField: "settlement_id",
          as: "settlement_details",
        },
      },
      {
        $project: {
          settlement_details: {
            $filter: {
              input: "$settlement_details",
              as: "item",
              cond: {
                $and: [
                  { $eq: ["$$item.drc_id", drc_id] },
                  ...(ro_id != null ? [{ $eq: ["$$item.ro_id", ro_id] }] : []),
                ],
              },
            },
          },
          _id: 0,
        },
      },
    ]);
    if (!result) {
      return res.status(404).json({
        status: "error",
        message: "result is not found.",
      });
    }
    return res.status(200).json({
      status: "success",
      message: "result is found.",
      data: result[0]?.settlement_details || [],
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

async function negotiation_condition_function(
  arrears_amount,
  credit_class_no,
  credit_class_name,
  account_manager_code,
  customer_type_name,
  drc_validity_period,
  region,
  expair_date,
  case_id,
  created_by
) {
  let case_status = "";
  let message = "";
  let reason = "";
  let new_seq = 0;
  const now = new Date();
  let document_type = "";
  const isDRCExpired = expair_date < now;
  if (
    arrears_amount < 3000 ||
    [3, 7, 10, 43].includes(credit_class_no) ||
    credit_class_name === "VIP" ||
    ["CS1_GOV", "CS1_VLB", "CS2_CM1", "CS2_CM2"].includes(
      account_manager_code
    ) ||
    [
      "Diplomats & Delegates",
      "Government Organizations",
      "Government Official Residential",
    ].includes(customer_type_name)
  ) {
    document_type = "Final Reminder";
  } else {
    document_type = "LOD";
  }
  if (arrears_amount < 50000) {
    if (drc_validity_period > 3) {
      if (isDRCExpired) {
        try {
          const currentCase = await Case_details.findOne(
            { case_id },
            { lod_final_reminder: 1 }
          );
          if (
            currentCase &&
            currentCase.lod_final_reminder &&
            currentCase.lod_final_reminder.document_type &&
            currentCase.lod_final_reminder.document_type.length > 0
          )
          {
            const lastDocType = currentCase.lod_final_reminder.document_type.slice(-1)[0];
            new_seq = lastDocType ? lastDocType.document_seq + 1 : 1;
          } else {
            new_seq = 1;
          }
          const updatedCase = await Case_details.findOneAndUpdate(
            { case_id },
            {
              $set: {
                case_current_status: "LIT Prescribed",
                current_case_phase: "Letter of Demand",
                "lod_final_reminder.source_type": "DRC Fail",
                "lod_final_reminder.current_document_type": document_type,
              },
              $push: {
                "lod_final_reminder.document_type": {
                  document_seq: new_seq,
                  document_type: document_type,
                  change_by: created_by,
                  changed_dtm: new Date(),
                },
                case_status: {
                  case_status: "LIT Prescribed",
                  created_dtm: new Date(),
                  created_by,
                  case_phase: "Letter of Demand",
                },
              },
            },
            { new: true, runValidators: true }
          );
        } catch (error) {
          return {
            message: "Database update failed",
            reason: error.message,
            error: true,
          };
        }
        case_status = "LIT Prescribed";
        message =
          "Can not Request Mediation Board Forward Letter for this case";
        reason = "DRC validity period is expired";
      } else {
        message =
          "Request Mediation Board Forward Letter is not a valid request";
        reason =
          "DRC validity period is not expired but more than three months";
      }
    } else {
      message = "Request Mediation Board Forward Letter is not a valid request";
      reason = "DRC validity period is less than three months";
    }
    return {
      case_status,
      message,
      reason,
    };
  }
  if (arrears_amount > 1000000) {
    try {
      const updatedCase = await Case_details.findOneAndUpdate(
        { case_id },
        {
          $set: {
            case_current_status: "Pending FTL LOD",
            current_case_phase: "Letter of Demand",
          },
          $push: {
            case_status: {
              case_status: "Pending FTL LOD",
              created_dtm: new Date(),
              created_by,
              case_phase: "Letter of Demand",
            },
          },
        },
        { new: true, runValidators: true }
      );
    } catch (error) {
      return {
        message: "Database update failed",
        reason: error.message,
        error: true,
      };
    }
    case_status = "Pending FTL LOD";
    message = "Request Mediation Board Forward Letter is not a valid request";
    reason = "arrears amount is more than 1000000";

    return {
      case_status,
      message,
      reason,
    };
  }
  if (region === "metro") {
    message = "Request Mediation Board Forward Letter is a valid request";
    reason = "region is metro";
  } else if (region === "region") {
    if (arrears_amount > 100000) {
      message = "Request Mediation Board Forward Letter is a valid request";
      reason = "region is region and amount more than 100000";
    } else {
      if (drc_validity_period > 3) {
        if (isDRCExpired) {
          try {
            const currentCase = await Case_details.findOne(
              { case_id },
              { lod_final_reminder: 1 }
            );
            if (
              currentCase &&
              currentCase.lod_final_reminder &&
              currentCase.lod_final_reminder.document_type &&
              currentCase.lod_final_reminder.document_type.length > 0
            ) {
              const lastDocType = currentCase.lod_final_reminder.document_type.slice(-1)[0];
              new_seq = lastDocType ? lastDocType.document_seq + 1 : 1;
            } else {
              new_seq = 1;
            }
            const updatedCase = await Case_details.findOneAndUpdate(
              { case_id },
              {
                $set: {
                  case_current_status: "LIT Prescribed",
                  current_case_phase: "Letter of Demand",
                  "lod_final_reminder.source_type": "DRC Fail",
                  "lod_final_reminder.current_document_type": document_type,
                },
                $push: {
                  "lod_final_reminder.document_type": {
                    document_seq: new_seq,
                    document_type: document_type,
                    change_by: created_by,
                    changed_dtm: new Date(),
                  },
                  case_status: {
                    case_status: "LIT Prescribed",
                    created_dtm: new Date(),
                    created_by,
                    case_phase: "Letter of Demand",
                  },
                },
              },
              { new: true, runValidators: true }
            );
          } catch (error) {
            return {
              message: "Database update failed",
              reason: error.message,
              error: true,
            };
          }
          case_status = "LIT Prescribed";
          message =
            "Can not Request Mediation Board Forward Letter for this case";
          reason = "DRC validity period is expired";
        } else {
          message =
            "Request Mediation Board Forward Letter is not a valid request";
          reason =
            "DRC validity period is not expired but more than three months";
        }
      } else {
        message =
          "Request Mediation Board Forward Letter is not a valid request";
        reason = "DRC validity period is less than three months";
      }
    }
  }
  return {
    case_status,
    message,
    reason,
  };
}

export const listdownCaseDetailsByCaseId = async (req, res) => {
  try {
    const caseId = parseInt(req.params.caseId);

    if (isNaN(caseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid case ID provided",
      });
    }

    const caseDetails = await CaseDetails.findOne({ case_id: caseId })
      .lean()
      .exec();

    if (!caseDetails) {
      return res.status(404).json({
        success: false,
        message: "Case details not found for the provided ID",
      });
    }

    const { _id, __v, ...cleanedCaseDetails } = caseDetails;

    const hasData = (arr) => Array.isArray(arr) && arr.length > 0;

    const addNavigationMetadata = (dataArray) => {
      if (!Array.isArray(dataArray) || dataArray.length === 0) return dataArray;

      return dataArray.map((item) => {
        const { _id, __v, ...cleanedItem } = item;
        return {
          ...cleanedItem,
        };
      });
    };

    const response = {
      caseInfo: {
        caseId: cleanedCaseDetails.case_id,
        createdDtm: cleanedCaseDetails.created_dtm,
        daysCount: Math.floor(
          (new Date() - new Date(cleanedCaseDetails.created_dtm)) /
            (1000 * 60 * 60 * 24)
        ),
      },
      basicInfo: {
        accountNo: cleanedCaseDetails.account_no,
        customerName: cleanedCaseDetails.customer_name,
        customerRef: cleanedCaseDetails.customer_ref,
        area: cleanedCaseDetails.area,
        rtom: cleanedCaseDetails.rtom,
        arrearsAmount: cleanedCaseDetails.current_arrears_amount,
        actionType: cleanedCaseDetails.action_type,
        currentStatus: cleanedCaseDetails.case_current_status,
        lastPaymentDate: cleanedCaseDetails.last_payment_date,
        lastBssReadingDate: cleanedCaseDetails.last_bss_reading_date,
        remark: cleanedCaseDetails.remark?.[0]?.remark || null,
      },
    };

    if (hasData(cleanedCaseDetails.drc)) {
      response.drcInfo = cleanedCaseDetails.drc.map((drc) => {
        const { recovery_officers, ...restDrc } = drc;
        return {
          ...restDrc,
          recoveryOfficers: Array.isArray(recovery_officers)
            ? recovery_officers
            : [],
        };
      });
    }

    if (hasData(cleanedCaseDetails.ro_edited_customer_details)) {
      response.roCustomerUpdates = addNavigationMetadata(
        cleanedCaseDetails.ro_edited_customer_details
      );
    }

    if (hasData(cleanedCaseDetails.remark)) {
      response.remark = addNavigationMetadata(cleanedCaseDetails.remark);
    }

    if (hasData(cleanedCaseDetails.approve)) {
      response.approve = addNavigationMetadata(cleanedCaseDetails.approve);
    }

    if (hasData(cleanedCaseDetails.case_status)) {
      response.caseStatus = addNavigationMetadata(cleanedCaseDetails.case_status);
    }

    if (hasData(cleanedCaseDetails.abnormal_stop)) {
      response.abnormal_stop = addNavigationMetadata(cleanedCaseDetails.abnormal_stop);
    }

    if (hasData(cleanedCaseDetails.ref_products)) {
      response.refProducts = addNavigationMetadata(cleanedCaseDetails.ref_products);
    }

    if (hasData(cleanedCaseDetails.ro_negotiation)) {
      response.roNegotiations = addNavigationMetadata(cleanedCaseDetails.ro_negotiation);
    }

    if (hasData(cleanedCaseDetails.ro_requests)) {
      response.roRequests = addNavigationMetadata(cleanedCaseDetails.ro_requests);
    }

    if (hasData(cleanedCaseDetails.ro_cpe_collect)) {
      response.roCpeCollections = addNavigationMetadata(cleanedCaseDetails.ro_cpe_collect);
    }

    if (hasData(cleanedCaseDetails.mediation_board)) {
      response.mediationBoard = addNavigationMetadata(cleanedCaseDetails.mediation_board);
    }

    if (hasData(cleanedCaseDetails.settlement)) {
      response.settlements = addNavigationMetadata(cleanedCaseDetails.settlement);
    }

    if (hasData(cleanedCaseDetails.money_transactions)) {
      response.payments = addNavigationMetadata(cleanedCaseDetails.money_transactions);
    }

    if (hasData(cleanedCaseDetails.litigation)) {
      response.litigationInfo = cleanedCaseDetails.litigation.map((litigation) => {
        const {
          support_documents,
          hs_files_information,
          legal_submission,
          legal_details,
          ...restLit
        } = litigation;

        return {
          ...restLit,
          supportDocuments: Array.isArray(support_documents)
            ? support_documents
            : [],
          hsFilesInformation: Array.isArray(hs_files_information)
            ? hs_files_information
            : [],
          legalSubmission: Array.isArray(legal_submission)
            ? legal_submission
            : [],
          legalDetails: Array.isArray(legal_details)
            ? legal_details
            : [],
        };
      });
    }

    if (hasData(cleanedCaseDetails.ftl_lod)) {
      response.ftlLodLetterDetails = cleanedCaseDetails.ftl_lod.map((ftl_lod) => {
        const { ftl_lod_letter_details, customer_response, ...restLod } = ftl_lod;

        return {
          ...restLod,
          ftlLodLetterDetails: Array.isArray(ftl_lod_letter_details)
            ? ftl_lod_letter_details
            : [],
          relatedDocuments: Array.isArray(customer_response)
            ? customer_response
            : [],
        };
      });
    }
   

    if (hasData(cleanedCaseDetails.lod_final_reminder)) {
      response.lodFinalReminder = cleanedCaseDetails.lod_final_reminder.map(
        (lod_final_reminder) => {
          const {
            document_type,
            lod_submission,
            lod_response,
            ...restlodFinalReminder
          } = lod_final_reminder;

          return {
            ...restlodFinalReminder,
            document_type: Array.isArray(document_type) ? document_type : [],
            lod_submission: Array.isArray(lod_submission) ? lod_submission : [],
            lod_response: Array.isArray(lod_response) ? lod_response : [],
          };
        }
      );
    }

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error fetching case details:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching case details",
      error: error.message,
    });
  }
};

export const List_All_Cases = async (req, res) => {
  try {
    const {
      case_current_status,
      From_DAT,
      TO_DAT,
      RTOM ,
      DRC,
      arrears_band,
      service_type,
      pages,
    } = req.body;
    
    // if (
    //   !case_current_status && !RTOM && !DRC && !arrears_band && !service_type && !From_DAT && !TO_DAT
    // )
    // {
    //   return res.status(400).json({
    //     status: "error",
    //     message: "At least one filter is required"
    //   });
    // }

    const pipeline = [];

    if (case_current_status) {
      pipeline.push({ $match: { case_current_status } });
    }

    if (RTOM) {
      pipeline.push({ $match: { area: RTOM } });
    }

    if (arrears_band) {
      pipeline.push({ $match: { arrears_band } });
    }

    if (service_type) {
      pipeline.push({ $match: { drc_commision_rule:service_type } });
    }

    // const dateFilter = {};
    // const fromDate = From_DAT ? new Date(From_DAT) : null;
    // const toDate = TO_DAT ? new Date(TO_DAT) : null;
    // if (toDate) toDate.setHours(23, 59, 59, 999); // Set end of day for toDate

    // if (fromDate && toDate && fromDate > toDate) {
    //   dateFilter.$gte = toDate;
    //   dateFilter.$lte = fromDate;
    // } else {
    //   if (fromDate) dateFilter.$gte = fromDate;
    //   if (toDate) dateFilter.$lte = toDate;
    // }

    const dateFilter = {};
    if (From_DAT) dateFilter.$gte = new Date(From_DAT);
    if (TO_DAT) {
      const endofDay = new Date(TO_DAT);
      endofDay.setHours(23, 59, 59, 999);
      dateFilter.$lte = new Date(endofDay);
    }

    if (Object.keys(dateFilter).length > 0) {
      pipeline.push({ $match: { created_dtm: dateFilter } });
    }

    pipeline.push({
      $addFields: {
        last_drc: { $arrayElemAt: ["$drc", -1] },
      },
    });

    pipeline.push({
      $addFields: {
        last_drc: {
          $cond: {
            if: { $gt: [{ $size: { $ifNull: ["$drc", []] } }, 0] },
            then: { $arrayElemAt: ["$drc", -1] },
            else: null,
          },
        },
      },
    });

    pipeline.push({
      $match: {
        $or: [
          { last_drc: { $exists: false } },
          { last_drc: null },
          {
            "last_drc.drc_status": "Active",
            "last_drc.removed_dtm": null,
          },
        ],
      },
    });

    if (DRC) {
      pipeline.push({
        $match: {
          "last_drc.drc_id": Number(DRC),
        },
      });
    }

    // Pagination logic
    let page = Number(pages);
    if (isNaN(page) || page < 1) page = 1;
    const limit = page === 1 ? 10 : 30;
    const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

    pipeline.push({ $sort: { case_id: -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const filtered_cases = await Case_details.aggregate(pipeline);

    const responseData = filtered_cases.map((caseData) => {
      return {
        case_id: caseData.case_id,
        status: caseData.case_current_status,
        date: caseData.created_dtm || null,
        rtom: caseData.rtom || null,
        area: caseData.area || null,
        service_type: caseData.drc_commision_rule || null,
        current_arrears_amount: caseData.current_arrears_amount || null,
        account_no: caseData.account_no || null,
        drc_name: caseData.last_drc ? caseData.last_drc.drc_name : null,
        drc_id: caseData.last_drc ? caseData.last_drc.drc_id : null,
        last_payment_date: caseData.last_payment_date || null,
      };
    });
 
    return res.status(200).json({
      status: "success",
      message: "Cases retrieved successfully.",
      data: responseData,
    });
  } catch (error) {
    console.error("Failed to fetch cases:", error.message);
    return res.status(500).json({
      status: "error",
      message: "There is an error fetching case list.",
    });
  }
};

export const CaseStatus = async (req, res) => {
  try {
    const mongoConnection = await db.connectMongoDB();
    if (!mongoConnection) {
      throw new Error("MongoDB connection failed");
    }
    const statuses = await mongoConnection
      .collection("Case_Phases")
      .find({ end_dtm: null })
      .toArray();

    return res.status(200).json({
      status: "success",
      message: "Data retrieved successfully.",
      data: statuses, // Return raw data with case_status field
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error retrieving Case status.",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }
};

export const List_DRC_Distribution_Rejected_Batches = async (req, res) => {
  try {
    const rejected_batches = await CaseDistribution.aggregate([
      {
        $match: {
          current_batch_distribution_status: "batch_rejected",
        },
      },
      {
        $facet: {
          data: [
            {
              $project: {
                _id: 0,
                case_distribution_batch_id: 1,
                bulk_Details: 1,
                drc_commision_rule: 1,
              },
            },
          ],
          count: [{ $count: "total" }],
        },
      },
    ]);

    const data = rejected_batches[0]?.data || [];
    const count = rejected_batches[0]?.count[0]?.total || 0;

    return res.status(200).json({
      status: "success",
      message: "Data retrieved successfully.",
      count,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error retrieving Case status.",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }
};

/**
 * Purpose: To retrieve the summary of a rejected batch by case_distribution_batch_id.
 * Inputs:
 * - case_distribution_batch_id (required)
 *
 * Collection: Case_distribution_drc_transactions
 */
export const List_Rejected_Batch_Summary_Case_Distribution_Batch_Id = async (
  req,
  res
) => {
  try {
    const { case_distribution_batch_id } = req.body;

    if (!case_distribution_batch_id) {
      return res.status(400).json({
        status: "error",
        message: "case_distribution_batch_id is required.",
      });
    }
    const Rejected_Batch = await CaseDistribution.findOne(
      { case_distribution_batch_id },
      {
        batch_details: 1,
        bulk_Details: 1,
        drc_commision_rule: 1,
        current_arrears_band: 1,
      }
    );

    if (!Rejected_Batch) {
      return res.status(404).json({
        status: "error",
        message:
          "No rejected batch found for the provided case_distribution_batch_id.",
      });
    }

    const responseData = {
      rejected_drc_summary:
        Rejected_Batch?.batch_details?.[0]?.distribution_details,
      rulebase_count: Rejected_Batch?.bulk_Details?.[0]?.inspected_count,
      drc_commision_rule: Rejected_Batch.drc_commision_rule,
      current_arrears_band: Rejected_Batch.current_arrears_band || 0,
      captured_count: Rejected_Batch?.bulk_Details?.[0]?.captured_count || 0,
    };

    return res.status(200).json({
      status: "success",
      message: "Retrieved rejected batch summary successfully.",
      data: responseData,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const Settelment_plan_request_acceptence_type_A = async (req, res) => {
  const session = await mongoose.startSession();

  const requestMapping = {
    "Negotiation Settlement plan Request": "RO Negotiation",
    "Mediation Board Settlement plan Request": "MB Negotiation"
  };

  // Define the status mapping based on User_Interaction_Type and Request Accept
  const statusMapping = {
    "Negotiation Settlement plan Request": {
      Yes: "Negotiation Settle Pending",
      No: "RO Negotiation",
    },
    "Mediation Board Settlement plan Request": {
      Yes: "MB Settle Pending",
      No: "MB Negotiation",
    }
  };

  const phaseMapping = {
    "Negotiation Settle Pending": "Negotiation",
    "MB Settle Pending": "Mediation Board",
  };

  try {
    session.startTransaction();
    const {
      create_by,
      Interaction_Log_ID,
      case_id,
      User_Interaction_Type,
      Interaction_ID,
      requestAccept,
      Remark,
      Letter_Send,
      calendar_month,
      initial_amount,
    } = req.body;

    if (
      !create_by ||
      !Interaction_Log_ID ||
      !User_Interaction_Type ||
      !case_id ||
      !Interaction_ID ||
      !requestAccept || !initial_amount || !calendar_month
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message:
          "create_by, Interaction_Log_ID, User_Interaction_Type, case_id, Interaction_ID, requestAccept, initial_amount, calendar_month are required.",
      });
    };

    const caseStatus = statusMapping[User_Interaction_Type]?.[requestAccept];
    const requestedCaseStatus = requestMapping[User_Interaction_Type];

    if (!caseStatus || !requestedCaseStatus) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: `Invalid User_Interaction_Type or Request Accept value provided.`,
      });
    };

    const payload = {
      case_id,
      created_by:create_by,
      settlement_type: "Type A",
      settlement_plan_received: [initial_amount, calendar_month],
      remark:Remark
    };
    let response;
    try {
      response = await axios.post(
      "https://debtx.slt.lk:6500/api/v1/Create_Settlement_Plan",
      payload
    );
    }catch (error) {
      await session.abortTransaction();
      return res.status(500).json({
        status: "error",
        message: "Settlement API call failed",
        error: error.message,
      });
    }
    if(response.data.status === "failed"){
      await session.abortTransaction();
      return res.status(400).json({
        status: "error",
        message: response.data.status_reason,
      });
    };

    const existingCase = await Case_details.findOne(
      { case_id: case_id },
      { drc: 1, case_current_status: 1 }
    ).session(session);

    if (!existingCase) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ message: `Case with case_id ${case_id} not found.` });
    }

    if (existingCase.case_current_status != requestedCaseStatus) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({
        message: `Cannot submit ${User_Interaction_Type} when case is not in ${requestedCaseStatus} status.`,
      });
    };

    const approvalDoc = await User_Interaction_Log.findOne({
      Interaction_Log_ID,
    }).session(session);

    if (!approvalDoc) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ message: "No matching Interaction_Log_ID found" });
    }

    // Create a new request document
    const newRequest = new Request({
      case_id: case_id,
      Interaction_Log_ID: Interaction_Log_ID,
      Request_Description: User_Interaction_Type,
      created_dtm: new Date(),
      created_by: create_by,
      Intraction_ID: Interaction_ID,
      parameters: {
        Request_Accept: requestAccept,
        Remark: Remark,
        settlement_id:response.data.settlement_id,
        Letter_Send: Letter_Send,
        Request_CreatedDTM: approvalDoc.CreateDTM,
      },
    });

    await newRequest.save({ session });

    // Update the case status and current phase if it has changed
    if (existingCase.case_current_status != caseStatus && existingCase.case_current_status === requestedCaseStatus) {
      const newCaseStatus = {
        case_status: caseStatus,
        status_reason: Remark || null,
        created_dtm: new Date(),
        created_by: create_by,
        notified_dtm: null,
        expire_dtm: null,
        case_phase: phaseMapping[caseStatus] || null,
      };

      const updateFields = {
        $push: { case_status: newCaseStatus },
        $set: {
          case_current_status: caseStatus,
          case_current_phase: phaseMapping[caseStatus] || null,
        },
      };

      await Case_details.updateOne({ case_id: case_id }, updateFields, {
        session,
      });
    }

    // Update the completed_dtm for the RO request
    const completedDate = new Date();
    await Case_details.updateOne(
      { case_id: case_id, "ro_requests.intraction_log_id": Interaction_Log_ID },
      { $set: { "ro_requests.$.completed_dtm": completedDate } },
      { session }
    );

    // Update the User Interaction Log with new status
    const newUserInteractionStatus = {
      User_Interaction_Status: "Complete",
      created_dtm: new Date(),
    };

    await User_Interaction_Log.updateOne(
      { Interaction_Log_ID: Interaction_Log_ID },
      { $push: { User_Interaction_Status: newUserInteractionStatus } },
      { session }
    );

    const deligate_id = approvalDoc.Created_By;

    const created_by = create_by;
    const dynamicParams = {
      case_id: case_id,
      Accept: requestAccept,
      request_type: User_Interaction_Type,
    };

    // Inserte a new request log
    await createUserInteractionFunction({
      Interaction_ID: 19,
      User_Interaction_Type: User_Interaction_Type,
      delegate_user_id: deligate_id, // Now using created_by as delegate ID
      Created_By: created_by,
      ...dynamicParams,
      session: session,    
    });

    // Delete the User Interaction Progress Log entry
    await User_Interaction_Progress_Log.deleteOne(
      { Interaction_Log_ID },
      { session }
    );

    await session.commitTransaction();
    return res.status(200).json({
      message: "Mediation Board Acceptance Request submitted successfully.",
    });
  } catch (error) {
    await session.abortTransaction();
    return res
      .status(500)
      .json({ message: "Failed to submit request.", error: error.message });
  } finally {
    session.endSession();
  }
};
