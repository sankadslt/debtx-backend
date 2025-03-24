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

    // Default query parameters
    const query = {};

    let pageNum = Number(page);
    let limitNum = Number(limit);

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

    const sortOptions = { money_transaction_id: -1 };

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
        pages: Math.ceil(total / limitNum)
      };
    } else {
      responseData.total = formattedTransactions.length;
    }

    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
