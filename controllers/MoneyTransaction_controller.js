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
import CasePayment from "../models/Case_payments.js";
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
    const { case_id, account_num, settlement_phase, from_date, to_date, pages } = req.body;

    if (!case_id && !settlement_phase && !from_date && !to_date && !account_num) {
      return res.status(400).json({
        status: "error",
        message: "At least one of case_id, settlement_phase, account_num, from_date or to_date is required."
      });
    }

    let page = Number(pages);
    if (isNaN(page) || page < 1) page = 1;
    const limit = page === 1 ? 10 : 30;
    const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

    const query = {};

    if (account_num) query.account_num = account_num;
    if (case_id) query.case_id = case_id;
    if (settlement_phase) query.settlement_phase = settlement_phase;

    const dateFilter = {};
    if (from_date) dateFilter.$gte = new Date(from_date);
    if (to_date) dateFilter.$lte = new Date(to_date);
    if (Object.keys(dateFilter).length > 0) {
      query.money_transaction_date = dateFilter;
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
        Settlement_ID: caseData.settlement_id || null,
        Installment_Seq: caseData.installment_seq || null,
        Transaction_Type: caseData.transaction_type || null,
        Money_Transaction_Amount: caseData.money_transaction_amount || null,
        Money_Transaction_Date: caseData.money_transaction_date || null,
        Settlement_Phase: caseData.settlement_phase || null,
        Cummulative_Settled_Balance: caseData.cummulative_settled_balance || null,
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

    const selectedMoneyTransaction = await MoneyTransaction.findOne({ money_transaction_id });
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
        money_transaction_ref: MoneyTransactionDoc?.money_transaction_ref,
        money_transaction_reference_type: MoneyTransactionDoc?.money_transaction_Reference_type,
        money_transaction_amount: MoneyTransactionDoc?.money_transaction_amount,
        money_transaction_date: MoneyTransactionDoc?.money_transaction_date,
        money_transaction_type: MoneyTransactionDoc?.transaction_type,
      };
    });

    const response = {
      case_id: caseDetails.case_id,
      account_no: selectedMoneyTransaction.account_num,
      money_transaction_id: selectedMoneyTransaction.money_transaction_id,
      created_dtm: selectedMoneyTransaction.created_dtm,
      cummulative_settled_balance: selectedMoneyTransaction.cummulative_settled_balance,
      settlement_id: selectedMoneyTransaction.settlement_id,
      installment_seq: selectedMoneyTransaction.installment_seq,
      settlement_phase: selectedMoneyTransaction.settlement_phase,
      settle_Effected_Amount: selectedMoneyTransaction.settle_Effected_Amount,
      commission_type: selectedMoneyTransaction.commission_type,
      commission_amount: selectedMoneyTransaction.commissioned_amount,
      drc_id: selectedMoneyTransaction.drc_id,
      ro_id: selectedMoneyTransaction.ro_id,
      commision_issued_by: selectedMoneyTransaction.commission_issued_by,
      commision_issued_dtm: selectedMoneyTransaction.commission_issued_by,
      payment_details: MoneyTransactionDetails
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