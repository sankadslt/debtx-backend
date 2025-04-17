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
import CasePayment from "../models/Case_payments.js";

export const ListAllSettlementCases = async (req, res) => {
  const {
    case_id, 
    settlement_phase, 
    settlement_status, 
    from_date, 
    to_date,
    page = 1,  // Add default value
    limit = 10,  // Add default value
    recent = false  // Add default value
  } = req.body;

  try {
    // Query
    const query = {};

    // Initialize $and array if needed for date filtering
    // if (from_date && to_date) {
    //   query.$and = [];
    // }

    let pageNum = Number(page);
    let limitNum = Number(limit);

    if (case_id) query.case_id = case_id;
    if (settlement_phase) query.settlement_phase = settlement_phase;
    if (settlement_status) query.settlement_status = settlement_status;
    if (from_date && to_date) {
      query.$and = [];
      query.$and.push({ created_dtm: { $gt: new Date(from_date) } });
      query.$and.push({ created_dtm: { $lt: new Date(to_date) } });
    }

    const sortOptions = { created_dtm: -1 };

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
    const settlements = await CaseSettlement.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    if (settlements.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No data found for the provided parameters"
      });
    }

    // Format response data - include all fields from model
    const formattedSettlements = settlements.map(settlement => {
      // Convert Mongoose document to plain object
      const SettlementDetails = settlement.toObject();

      // Format date fields for better readability
      if (SettlementDetails.created_dtm) {
        SettlementDetails.created_dtm = SettlementDetails.created_dtm.toISOString();
      }

      if (SettlementDetails.last_monitoring_dtm) {
        SettlementDetails.last_monitoring_dtm = SettlementDetails.last_monitoring_dtm.toISOString();
      }

      // Return all fields from model with properly formatted names
      return {
        case_id: SettlementDetails.case_id,
        settlement_status: SettlementDetails.settlement_status,
        created_dtm: SettlementDetails.created_dtm,
        settlement_phase: SettlementDetails.settlement_phase,
        settlement_id: SettlementDetails.settlement_id,
      };
    });

    // Prepare response data
    const responseData = {
      message: recent === true ? 'Recent Case settlements are retrieved successfully' : 'Case settlements retrieved successfully',
      data: formattedSettlements,
    };

    // Add pagination info if not in recent mode
    if (recent !== true) {
      const total = await CaseSettlement.countDocuments(query);
      responseData.pagination = {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      };
    } else {
      responseData.total = formattedSettlements.length;
    }

    return res.status(200).json({
      status: "success",
      message: "Successfully retrieved case settlements.",
      data: responseData,
    });

  } catch (error) {
    console.error("Error fetching settlement data:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server error. Please try again later.",
    });
  }
};


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

    const payments = await CasePayment.find({ money_transaction_id: { $in: transactionIds } });

    const paymentDetails = moneyTransactions.map(txn => {
      const paymentDoc = payments.find(p => p.money_transaction_id === txn.money_transaction_id);
      return {
        money_transaction_id: txn.money_transaction_id,
        payment: txn.payment,
        payment_Dtm: txn.payment_Dtm,
        cummilative_settled_balance: paymentDoc?.cummilative_settled_balance || null,
        installment_seq: paymentDoc?.installment_seq || null,
        money_transaction_type: paymentDoc?.money_transaction_type || null,
        money_transaction_amount: paymentDoc?.money_transaction_amount || null,
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