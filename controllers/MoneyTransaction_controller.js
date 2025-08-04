/* 
    Purpose: This template is used for the Case Controllers.
    Created Date: 2025-03-18
    Created By:  K.K.C Sakumini (sakuminic@gmail.com)
    Last Modified Date: 
    Modified By: 
    Version: Node.js v20.11.1
    Dependencies: axios , mongoose
    Related Files: Money_Transation_route.js
    Notes:  
*/

import db from "../config/db.js";
import moment from "moment";
import MoneyTransaction from "../models/Money_transactions.js";
import Case_details from "../models/Case_details.js";
// import CasePayment from "../models/Case_payments.js";
import mongoose from "mongoose";
import { createTaskFunction } from "../services/TaskService.js";

/*
    Purpose: This function is used to fetch payment cases according to filters.
    Table: money_transaction
    Request body:
      case_id 
      account_num
      settlement_phase
      from_date
      to_date
      pages
*/
export const getAllPaymentCases = async (req, res) => {
  try {
    const { case_id, account_num, case_phase, from_date, to_date, pages } = req.body;

    // if (!case_id && !case_phase && !from_date && !to_date && !account_num) {
    //   return res.status(400).json({
    //     status: "error",
    //     message: "At least one of case_id, case_phase, account_num, from_date or to_date is required."
    //   });
    // }

    let page = Number(pages);
    if (isNaN(page) || page < 1) page = 1;
    const limit = page === 1 ? 10 : 30;
    const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

    const query = {};

    if (account_num) query.account_num = account_num;
    if (case_id) query.case_id = case_id;
    if (case_phase) query.case_phase = case_phase;

    const dateFilter = {};
    if (from_date) dateFilter.$gte = new Date(from_date);
    if (to_date) {
      const endofDay = new Date(to_date);
      endofDay.setHours(23, 59, 59, 999); //
      dateFilter.$lte = endofDay;
    }
    if (Object.keys(dateFilter).length > 0) {
      query['money_details.money_transaction_date'] = dateFilter;
    }

    const filtered_cases = await MoneyTransaction.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ money_transaction_id: -1 });

    const responseData = filtered_cases.map((caseData) => {
      return {
        Money_Transaction_ID: caseData.money_transaction_id,
        Case_ID: caseData.case_id,
        Account_No: caseData.account_num || null,
        settlement_id: caseData.settlement_details?.settlement_id || null,
        Installment_Seq: caseData.settlement_details?.installment_seq || null,
        Transaction_Type: caseData.transaction_type || null,
        Money_Transaction_Amount: caseData.money_details?.money_transaction_amount || null,
        Money_Transaction_Date: caseData.money_details?.money_transaction_date || null,
        case_phase: caseData.case_phase || null,
        cumulative_settled_balance: caseData.settlement_details?.cumulative_settled_balance || null,
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

// Create task for Download Payment Case List
export const Create_task_for_Download_Payment_Case_List = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { Created_By, Phase, from_date, to_date, Case_ID, Account_Number } = req.body;

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
      Account_Number,
      Case_ID,
      Phase,
      from_date,
      to_date,
    };

    // Pass parameters directly (without nesting it inside another object)
    const taskData = {
      Template_Task_Id: 44,
      task_type: "Create task for Download Payment Case List",
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
  Purpose: Fetching payment details of a case based of case_id and money_transaction_id
  Table: money_transaction
  Request body parameters:
    case_id
    money_transaction_id
*/
export const Case_Details_Payment_By_Case_ID = async (req, res) => {
  try {
    const { case_id, money_transaction_id } = req.body;

    if (!case_id) {
      return res.status(400).json({ message: "case_id is required" });
    }

    if (!money_transaction_id) {
      return res.status(400).json({ message: "money_transaction_id is required" });
    }

    const caseDetails = await Case_details.findOne({ case_id });
    if (!caseDetails) {
      return res.status(404).json({ message: "Case not found" });
    }

    const selectedMoneyTransaction = await MoneyTransaction.findOne({ money_transaction_id: money_transaction_id });
    if (!selectedMoneyTransaction) {
      return res.status(404).json({ message: "Money transaction not found" });
    }

    const moneyTransactions = caseDetails.money_transactions || [];
    const transactionIds = moneyTransactions.map(txn => txn.money_transaction_id);

    const MoneyTransactionRecords = await MoneyTransaction.find({ money_transaction_id: { $in: transactionIds } });

    const MoneyTransactionDetails = moneyTransactions.map(txn => {
      const MoneyTransactionDoc = MoneyTransactionRecords.find(p => p.money_transaction_id === txn.money_transaction_id);
      return {
        money_transaction_id: txn.money_transaction_id,
        money_transaction_ref: MoneyTransactionDoc?.money_details?.money_transaction_ref,
        money_transaction_status: MoneyTransactionDoc?.money_details?.money_transaction_status,
        bill_payment_status: MoneyTransactionDoc?.money_details?.bill_payment_status,
        money_transaction_amount: MoneyTransactionDoc?.money_details?.money_transaction_amount,
        money_transaction_date: MoneyTransactionDoc?.money_details?.money_transaction_date,
        transaction_type: MoneyTransactionDoc?.transaction_type,
        settlement_details: MoneyTransactionDoc?.settlement_details
      };
    });

    const response = {
      case_id: caseDetails.case_id,
      account_no: selectedMoneyTransaction.account_num,
      money_transaction_id: selectedMoneyTransaction.money_transaction_id,
      created_dtm: selectedMoneyTransaction.created_dtm,
      cumulative_settled_balance: selectedMoneyTransaction.settlement_details?.cumulative_settled_balance,
      settlement_id: selectedMoneyTransaction.settlement_details?.settlement_id,
      installment_seq: selectedMoneyTransaction.settlement_details?.installment_seq,
      case_phase: selectedMoneyTransaction.case_phase,
      settle_Effected_Amount: selectedMoneyTransaction.settlement_details?.commissionable_amount,
      commission_type: selectedMoneyTransaction.commission_type,
      commissionable_amount: selectedMoneyTransaction.settlement_details?.commissionable_amount,
      drc_id: selectedMoneyTransaction.drc_id,
      ro_id: selectedMoneyTransaction.ro_id,
      commision_issued_by: selectedMoneyTransaction.commission_issued_by,
      commision_issued_dtm: selectedMoneyTransaction.commission_issued_dtm,
      payment_details: MoneyTransactionDetails,
      settlement_details: selectedMoneyTransaction.settlement_details,
      money_details: selectedMoneyTransaction.money_details
    };

    return res.status(200).json({
      message: "Case details retrieved successfully",
      status: "success",
      data: response,
    });
  } catch (error) {
    console.error("Error fetching case details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
