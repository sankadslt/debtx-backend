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


// money transactions
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
//     let pageNum = Number(page);
//     let limitNum = Number(limit);
    
//     // Apply filters if they exist
//     if (case_id) query.case_id = Number(case_id);
//     if (account_num) query.account_num = account_num;
//     if (settlement_phase) query.settlement_phase = settlement_phase;
//     if (from_date && to_date) {
//       query.$and.push({ created_dtm: { $gt: new Date(from_date) } });
//       query.$and.push({ created_dtm: { $lt: new Date(to_date) } });
//     }
    
    
//     const sortOptions = { payment_id: -1 };
    
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
//     const payments = await CasePayments.find(query)
//       .sort(sortOptions)
//       .skip(skip)
//       .limit(limitNum);
    
//     // Format response data - include all fields from model
//     const formattedPayments = payments.map(payment => {
//       // Convert Mongoose document to plain object
//       const paymentObj = payment.toObject();
      
//       // Format date fields for better readability
//       if (paymentObj.created_dtm) {
//         paymentObj.created_dtm = paymentObj.created_dtm.toISOString();
//       }
      
//       if (paymentObj.bill_paid_date) {
//         paymentObj.bill_paid_date = paymentObj.bill_paid_date.toISOString();
//       }
      
//       // Return all fields from model
//       return {
//         Payment_ID: paymentObj.payment_id,
//         Case_ID: paymentObj.case_id,
//         Created_DTM: paymentObj.created_dtm,
//         Settlement_ID: paymentObj.settlement_id || '-',
//         Installment_Seq: paymentObj.installment_seq || '-',
//         Bill_Payment_Seq: paymentObj.bill_payment_seq || '-',
//         Bill_Paid_Amount: paymentObj.bill_paid_amount || '-',
//         Bill_Paid_Date: paymentObj.bill_paid_date || '-',
//         Bill_Payment_Status: paymentObj.bill_payment_status || '-',
//         Bill_Payment_Type: paymentObj.bill_payment_type || '-',
//         Settled_Balance: paymentObj.settled_balance || '-',
//         Cumulative_Settled_Balance: paymentObj.cumulative_settled_balance || '-',
//         Account_No: paymentObj.account_num || '-',
//         Settlement_Phase: paymentObj.settlement_phase || '-'
//       };
//     });
    
//     // Prepare response data
//     const responseData = {
//       message: recent === true 
//         ? 'Recent case payments retrieved successfully' 
//         : 'Case payments retrieved successfully',
//       data: formattedPayments,
//     };
    
//     // Add pagination info if not in recent mode
//     if (recent !== true) {
//       const total = await CasePayments.countDocuments(query);
//       responseData.pagination = {
//         total,
//         page: pageNum,
//         limit: limitNum,
//         pages: Math.ceil(total / limitNum)
//       };
//     } else {
//       responseData.total = formattedPayments.length;
//     }
    
//     return res.status(200).json(responseData);
    
//   } catch (error) {
//     return res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };


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


export const getAllPaymentCases = async (req, res) => {
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
  
  try {
    // Validate required fields
    if (!case_id && !settlement_phase && !account_num && !from_date && !to_date) {
      return res.status(400).json({
        status: "error",
        message: "At least one of case_id, settlement_phase, settlement_status, from_date or to_date is required."
      });
    }

    // Default query parameters
    const query = {};

    let pageNum = Number(page);
    let limitNum = Number(page) === 1 ? 10 : 30;

    // Apply filters if they exist
    if (case_id) query.case_id = Number(case_id);
    if (account_num) query.account_num = Number(account_num);
    if (settlement_phase) query.settlement_phase = settlement_phase;
    if (from_date && to_date) {
      // Initialize the $and array before using push
      query.$and = [];
      query.$and.push({ created_dtm: { $gte: new Date(from_date) } });
      query.$and.push({ created_dtm: { $lte: new Date(to_date) } });
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
    // const skip = (pageNum - 1) * limitNum;
    const skip = pageNum === 1 ? 0 : 10 + (pageNum - 2) * 30;

    // Execute query with descending sort
    const transactions = await MoneyTransaction.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Format response data - include all fields from model
    const formattedTransactions = transactions.map(transaction => {
      // Convert Mongoose document to plain object
      const transactionObj = transaction.toObject();

      // Format date fields for better readability
      if (transactionObj.created_dtm) {
        transactionObj.created_dtm = transactionObj.created_dtm.toISOString();
      }

      if (transactionObj.money_transaction_date) {
        transactionObj.money_transaction_date = transactionObj.money_transaction_date.toISOString();
      }

      // Return all fields from model with properly formatted names
      return {
        Money_Transaction_ID: transactionObj.money_transaction_id,
        Case_ID: transactionObj.case_id,
        Account_No: transactionObj.account_num || '-',
        Created_DTM: transactionObj.created_dtm,
        Settlement_ID: transactionObj.settlement_id || '-',
        Installment_Seq: transactionObj.installment_seq || '-',
        Transaction_Type: transactionObj.transaction_type || '-',
        Money_Transaction_Ref: transactionObj.money_transaction_ref || '-',
        Money_Transaction_Amount: transactionObj.money_transaction_amount || '-',
        Money_Transaction_Date: transactionObj.money_transaction_date || '-',
        Bill_Payment_Status: transactionObj.bill_payment_status || '-',
        Settlement_Phase: transactionObj.settlement_phase || '-',
        Cummulative_Credit: transactionObj.cummulative_credit || '-',
        Cummulative_Debit: transactionObj.cummulative_debit || '-',
        Cummulative_Settled_Balance: transactionObj.cummulative_settled_balance || '-',
        Commissioned_Amount: transactionObj.commissioned_amount || '-'
      };
    });

    // Prepare response data
    const responseData = {
      message: recent === true ? 'Recent money transactions retrieved successfully' : 'Money transactions retrieved successfully',
      data: formattedTransactions,
    };

    // Add pagination info if not in recent mode
    if (recent !== true) {
      const total = await MoneyTransaction.countDocuments(query);
      responseData.pagination = {
        total,
        page: pageNum,
        limit: limitNum,
        pages: total <= 10 ? 1 : Math.ceil((total - 10) / 30) + 1
      };
    } else {
      responseData.total = formattedTransactions.length;
    }

    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
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
      Created_By,
      task_status: "open",
      Account_No: Account_Number,
      case_ID: Case_ID,
      Phase: Phase,
      from_date: from_date,
      to_date: to_date,
    };

    // Pass parameters directly (without nesting it inside another object)
    const taskData = {
      Template_Task_Id: 44,
      task_type: "Create task for Download Payment Case List",
      ...parameters
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

    // const settlementIds = caseDetails.settlement?.map(s => s.settlement_id) || [];
    // const settlements = await CaseSettlement.find({ settlement_id: { $in: settlementIds } });

    // const settlementPlans = settlements.map(s => ({
    //   settlement_id: s.settlement_id,
    //   drc_id: s.drc_id,
    //   ro_id: s.ro_id,
    //   settlement_status: s.settlement_status,
    //   status_reason: s.status_reason || null,
    //   status_dtm: s.status_dtm || null,
    //   settlement_phase: s.settlement_phase || null,
    //   settlement_type: s.settlement_type || null,
    //   created_by: s.created_by || null,
    //   created_dtm: s.created_dtm || null,
    //   settlement_plan: s.settlement_plan,
    //   last_monitoring_dtm: s.last_monitoring_dtm || null,
    //   settlement_plan_received: s.settlement_plan_received || null
    // }));

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
      cummulative_settled_balance: selectedMoneyTransaction.cummilative_settled_balance,
      settlement_id: selectedMoneyTransaction.settlement_id,
      installment_seq: selectedMoneyTransaction.installment_seq,
      settlement_phase: selectedMoneyTransaction.settlement_phase,
      settle_Effected_Amount: selectedMoneyTransaction.settle_Effected_Amount,
      commission_type: selectedMoneyTransaction.commission_type,
      commission_amount: selectedMoneyTransaction.commission_amount,
      drc_id: selectedMoneyTransaction.drc_id,
      ro_id: selectedMoneyTransaction.ro_id,
      commision_issued_by: selectedMoneyTransaction.commision_issued_by,
      commision_issued_dtm: selectedMoneyTransaction.commision_issued_dtm,
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