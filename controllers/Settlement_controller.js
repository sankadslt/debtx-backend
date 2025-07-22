/* 
    Purpose: This template is used for the Settlement Controllers.
    Created Date: 2025-03-23
    Created By: sasindu srinayaka (sasindusrinayaka@gmail.com)
    Version: Node.js v20.11.1
    Dependencies: axios , mongoose
    Related Files: Settlement_route.js
    Notes:  
*/

// import db from "../config/db.js";
import CaseSettlement from "../models/Case_settlement.js";
import Case_details from "../models/Case_details.js";
// import CasePayment from "../models/Case_payments.js";
import { createTaskFunction } from "../services/TaskService.js";
import Money_transactions from "../models/Money_transactions.js"
import mongoose from "mongoose";

/*  
  This API endpoint retrieves a list of settlement cases from the `CaseSettlement` collection, 
  with support for filtering, pagination, date range, and a "recent" flag to get the latest entries.

  Request Body Parameters:
  - case_id (optional): Filter by specific case ID.
  - settlement_phase (optional): Filter by settlement phase (e.g., initial, final).
  - settlement_status (optional): Filter by status (e.g., active, closed).
  - from_date & to_date (optional): Filter by creation date range (`created_dtm`).
  - page (optional, default = 1): For pagination - which page to return.
  - limit (optional, default = 10): For pagination - number of items per page.
  - recent (optional, default = false): If true, fetches 10 latest settlements and ignores filters/pagination.

  Functionality:
  - Constructs a dynamic MongoDB query based on provided filters.
  - If `recent` is true, it overrides all filters and returns the latest 10 settlements.
  - Executes the query, sorts by `created_dtm` in descending order, applies pagination or recent limit.
  - If no records found, returns 404 with an error message.

  Response:
  - Returns a list of matching settlement entries with fields:
    - `case_id`
    - `settlement_status`
    - `created_dtm` (ISO formatted)
    - `settlement_phase`
    - `settlement_id`
  - If `recent` is false, includes pagination metadata: `total`, `page`, `limit`, `pages`.

  Usage:
  - Ideal for admin dashboards, monitoring tools, or audit panels to view settlement history.
  - Supports both filtered and quick-view recent mode for efficient access.

  Status Codes:
  - 200: Success with results
  - 404: No matching settlements found
  - 500: Internal server error
*/
export const ListAllSettlementCases = async (req, res) => {
  try {
    const { account_no, case_id, case_phase, settlement_status, from_date, to_date, pages } = req.body;

    // if (!case_id && !case_phase && !settlement_status && !from_date && !to_date && !account_no) {
    //   return res.status(400).json({
    //     status: "error",
    //     message: "At least one of case_id, case_phase, settlement_status, account_no, from_date or to_date is required."
    //   });
    // }

    let page = Number(pages);
    if (isNaN(page) || page < 1) page = 1;
    const limit = page === 1 ? 10 : 30;
    const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

    const query = {};

    if (account_no) query.account_no = account_no;
    if (case_id) query.case_id = case_id;
    if (case_phase) query.case_phase = case_phase;
    if (settlement_status) query.settlement_status = settlement_status;

    const dateFilter = {};
    if (from_date) dateFilter.$gte = new Date(from_date);
    if (to_date) {
      const endOfDay = new Date(to_date);
      endOfDay.setHours(23, 59, 59, 999); 
      dateFilter.$lte = endOfDay;
    }
    if (Object.keys(dateFilter).length > 0) {
      query.settlement_status_dtm = dateFilter;
    }

    const filtered_cases = await CaseSettlement.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ settlement_id: -1 });

    const responseData = filtered_cases.map((caseData) => {
      return {
        case_id: caseData.case_id,
        account_no: caseData.account_no,
        settlement_status: caseData.settlement_status,
        settlement_status_dtm: caseData.settlement_status_dtm,
        case_phase: caseData.case_phase,
        settlement_id: caseData.settlement_id,
      };
    })

    return res.status(200).json({
      status: "success",
      message: "Cases retrieved successfully.",
      data: responseData,
    });

  } catch (error) {
    console.error("Error fetching Settlement Cases:", error.message);
    return res.status(500).json({
      status: "error",
      message: "There is an error "
    });
  }
};

/*  
  This function fetches a complete overview of a case including settlement details, LOD responses, FTL LOD data, and payment history.

  Required:
  - The frontend must pass `case_id` in the request body.

  Functionality:
  - Checks for a valid `case_id`.
  - Retrieves the case details from the `Case_details` collection.
  - If not found, returns a 404 response.

  Process:
  - Extracts `settlement_id`s from the case and queries the `CaseSettlement` collection to get related settlement plans.
  - Extracts `money_transaction_id`s and queries the `CasePayment` collection to get the payment data.
  - Constructs a detailed payment object by matching each transaction with its corresponding payment document.
  - Gathers all relevant data including:
    - Case basic details (ID, customer ref, account number, arrears, last payment date, and current status)
    - LOD response and FTL LOD data
    - Number of settlements and list of settlement plans
    - Full payment history with additional payment-related fields from `CasePayment`

  Returns:
  - A consolidated response object with all the above data.
  - If successful, responds with status 200.
  - If any error occurs, logs it and returns a 500 response.

  Usage:
  - This API is used when you need full insights into a case’s financial journey, especially for displaying settlement status, LOD and FTL interactions, and payment breakdown in detail views.
*/


export const Case_Details_Settlement_LOD_FTL_LOD = async (req, res) => {
  try {
    const { case_id } = req.body;

    if (!case_id) {
      return res.status(400).json({ message: "case_id is required" });
    }

    const caseDetails = await Case_details.findOne({ case_id });
    if (!caseDetails) {
      return res.status(404).json({ message: "Case not found" });
    }

    const settlementIds = caseDetails.settlement?.map(s => s.settlement_id) || [];
    const settlements = await CaseSettlement.find({ settlement_id: { $in: settlementIds } });

    const settlementPlans = settlements.map(s => ({
      settlement_id: s.settlement_id,
      settlement_plan: s.settlement_plan,
      last_monitoring_dtm: s.last_monitoring_dtm || null
    }));

    const moneyTransactions = caseDetails.money_transactions || [];
    const transactionIds = moneyTransactions.map(txn => txn.money_transaction_id);

    const payments = await Money_transactions.find({ money_transaction_id: { $in: transactionIds } });

    const paymentDetails = moneyTransactions.map(txn => {
      const paymentDoc = payments.find(p => p.money_transaction_id === txn.money_transaction_id);
      return {
        money_transaction_id: txn.money_transaction_id,
        payment: txn.payment,
        payment_Dtm: txn.payment_Dtm,
        cummilative_settled_balance: paymentDoc?.cummulative_settled_balance || null,
        installment_seq: paymentDoc?.installment_seq || null,
        money_transaction_type: paymentDoc?.transaction_type || null,
        money_transaction_amount: paymentDoc?.settle_Effected_Amount || null,
        money_transaction_date: paymentDoc?.money_transaction_date || null
      };
    });

    const response = {
      case_id: caseDetails.case_id,
      customer_ref: caseDetails.customer_ref,
      account_no: caseDetails.account_no,
      current_arrears_amount: caseDetails.current_arrears_amount,
      last_payment_date: caseDetails.last_payment_date,
      case_current_status: caseDetails.case_current_status,
      lod_response: caseDetails.lod_final_reminder,
      ftl_lod_responce: caseDetails.ftl_lod,
      settlement_count: settlements.length,
      settlement_plans: settlementPlans,
      payment_details: paymentDetails
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching case details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/*
  API Endpoint: Case_Details_Settlement_Phase

  Description:
  This endpoint retrieves detailed information about the settlement phases (plans) 
  related to a specific case, identified by the `case_id`.

  Request Body:
  - case_id (required): The unique identifier of the case for which the settlement 
    details need to be fetched.

  Functionality:
  - Validates the presence of `case_id` in the request body.
  - Fetches the case document from the `Case_details` collection.
  - Extracts all related `settlement_id`s from the `settlement` array in the case document.
  - Retrieves corresponding settlement documents from the `CaseSettlement` collection.
  - Maps and returns the essential fields such as:
    - `settlement_id`
    - `settlement_plan`
*/


// (SET-2P02) This function retreves Case and Case_Settlement data from getting settlement_id from the settlement array in case.
export const Case_Details_Settlement_Phase = async (req, res) => {
  try {
    const { case_id } = req.body;

    if (!case_id) {
      return res.status(400).json({ message: "case_id is required" });
    }

    // Fetch case details
    const caseDetails = await Case_details.findOne({ case_id });
    if (!caseDetails) {
      return res.status(404).json({ message: "Case not found" });
    }

    // Extract settlement IDs from the settlement array
    const settlementIds = caseDetails.settlement?.map(settlement => settlement.settlement_id) || [];

    // Fetch settlement details from Case_settlements collection
    const settlements = await CaseSettlement.find({ settlement_id: { $in: settlementIds } });

    // Extract settlement_plan field from each settlement
    const settlementPlans = settlements.map(settlement => ({
      settlement_id: settlement.settlement_id,
      settlement_plan: settlement.settlement_plan
    }));

    // Prepare response
    const response = {
      case_id: caseDetails.case_id,
      customer_ref: caseDetails.customer_ref,
      account_no: caseDetails.account_no,
      current_arrears_amount: caseDetails.current_arrears_amount,
      last_payment_date: caseDetails.last_payment_date,
      case_current_status: caseDetails.case_current_status,
      settlement_count: settlements.length,
      settlement_plans: settlementPlans
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching case details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/*
  Purpose: This API endpoint creates a task for downloading the settlement list.
  Calling Function: createTaskFunction
  Request Body Parameters:
    Created_By
    Phase
    Case_Status
    from_date
    to_date
    Case_ID
    Account_Number
*/
export const Create_Task_For_Downloard_Settlement_List = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { Created_By, Phase, Case_Status, from_date, to_date, Case_ID, Account_Number } = req.body;

    if (!Created_By) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: "error",
        message: "created by is a required parameter.",
      });
    }

    // Flatten the parameters structure
    const parameters = {  
      Account_No: Account_Number,
      case_ID: Case_ID,
      Phase: Phase,
      Case_Status: Case_Status,
      from_date: from_date,
      to_date: to_date,
    };

    // Pass parameters directly (without nesting it inside another object)
    const taskData = {
      Template_Task_Id: 42,
      task_type: "Create task for Download Settlement Case List",
      ...parameters,
      Created_By,
      task_status: "open",
    };

    // Call createTaskFunction
    await createTaskFunction(taskData, session);

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      status: "success",
      message: "Task created successfully.",
      data: taskData,
    });
  } catch (error) {
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

/*
  Purpose: This API endpoint retrieves settlement details based on the provided case_id and settlement_id.
  Table: case_settlement
  Request Body Parameters:
    - case_id (required)
    - settlement_id (required)
*/
export const Settlement_Details_By_Settlement_ID_Case_ID = async (req, res) => {
  try {
    const { case_id, settlement_id } = req.body;

    if (!case_id) {
      return res.status(400).json({ message: "case_id is required" });
    }

    if (!settlement_id) {
      return res.status(400).json({ message: "settlement_id is required" });
    }

    const caseDetails = await Case_details.findOne({ case_id });
    if (!caseDetails) {
      return res.status(404).json({ message: "Case not found" });
    }

    const SettlementDetails = await CaseSettlement.findOne({ settlement_id });
    if (!SettlementDetails) {
      return res.status(404).json({ message: "Settlement not found" });
    }

    const response = {
      settlement_id: SettlementDetails.settlement_id,
      case_id: SettlementDetails.case_id,
      account_num: SettlementDetails.account_num, 
      arrears_amount: caseDetails.current_arrears_amount,
      last_monitoring_dtm: SettlementDetails.last_monitoring_dtm,
      settlement_status: SettlementDetails.settlement_status,
      status_dtm: SettlementDetails.status_dtm,
      settlement_status_reason: SettlementDetails.settlement_status_reason,
      case_phase: SettlementDetails.case_phase,
      settlement_type: SettlementDetails.settlement_type,
      created_by: SettlementDetails.created_by,
      settlement_status_dtm: SettlementDetails.settlement_status_dtm,
      drc_id: SettlementDetails.drc_id,
      ro_id: SettlementDetails.ro_id,
      settlement_plans: SettlementDetails.settlement_plan,
      settlement_plan_received: SettlementDetails.settlement_plan_received,
      cumulative_Settle_Amount:SettlementDetails.cumulative_Settle_Amount,
      installment_seq: SettlementDetails.installment_seq,
      Installment_Settle_Amount:SettlementDetails.Installment_Settle_Amount,
      Plan_Date: SettlementDetails.Plan_Date,
    };

    return res.status(200).json({
      message: "Settlement details retrieved successfully",
      status: "success",
      data: response,
    });
  } catch (error) {
    console.error("Error fetching case details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* 
  Purpose: This API endpoint creates a task for downloading settlement details by case ID and Settlement_ID.
  Calling Function: createTaskFunction
  Request Body Parameters:
    Created_By
    Case_ID
    Settlement_ID
*/
export const Create_Task_For_Downloard_Settlement_Details_By_Case_ID = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { Created_By, Case_ID, Settlement_ID } = req.body;

    if (!Created_By) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: "error",
        message: "created by is a required parameter.",
      });
    }

    if (!Case_ID || !Settlement_ID) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: "error",
        message: "Case_ID and Settlement_ID are required parameter.",
      });
    }

    // Flatten the parameters structure
    const parameters = {
      Case_ID,
      Settlement_ID,
    };

    // Pass parameters directly (without nesting it inside another object)
    const taskData = {
      Template_Task_Id: 43,
      task_type: "Create task for Download Settlement Details By  Settlement_Id and Case_Id",
      ...parameters,
      Created_By,
      task_status: "open",
    };

    // Call createTaskFunction
    await createTaskFunction(taskData, session);

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      status: "success",
      message: "Task created successfully.",
      data: taskData,
    });
  } catch (error) {
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