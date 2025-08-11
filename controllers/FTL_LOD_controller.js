/* 
    Purpose: This template is used for the FTL LOD Route.
    Created Date: 2025-04-03
    Created By:  Dinusha Anupama (dinushanupama@gmail.com)
    Last Modified Date: 2025-04-01
    Modified By: Dinusha Anupama (dinushanupama@gmail.com)
    Version: Node.js v20.11.1
    Dependencies: axios , mongoose
    Related Files: FTL_LOD_route.js
    Notes:  
*/

import db from "../config/db.js";
import Case_details from "../models/Case_details.js";
import Incident from '../models/Incident.js';
import CaseSettlement from "../models/Case_settlement.js";
// import CasePayment from "../models/Case_payments.js";
import CasePayment from "../models/Money_transactions.js";
import mongoose from "mongoose";


/*  This is the function with the data retriving logic. first time load the 10 rows and second time load next 30 rows
    The variable named 'pages' should be maintain in the frontend and pass to the backend
    Every click of the next button should increment this variable by one and call this function
*/
export const Retrive_logic = async (req, res) => {
    try {
        const { status, pages } = req.body;
        if (!status) {
            res.status(400).json({
                status:"error",
                message: "All fields are required."
            });
        };
        let page = Number(pages);
        if (isNaN(page) || page < 1) page = 1;

        const limit = page === 1 ? 10 : 30;
        const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

        const query = status ? {case_current_status: status} : {};
        const distributions = await Case_details.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ case_id: -1 });
        res.status(200).json({
            status:"success",
            message: "Cases retrieved successfully.",
            data: distributions,
        });
    } catch (error) {
        res.status(500).json({
            status:"error",
            message: error.message,
        });
    }
};

/*
  Function: List_FTL_LOD_Cases (FLT-1P01)

  Description:
  This function retrieves FTL LOD (Final Term Letter of Demand) case details from the MongoDB database.

  Collections Used:
  - Case_details: Primary source for case data.
  - Arrears_bands: Used to fetch valid arrears band keys for validation.

  Request Body Parameters:
  - case_current_status: Optional. Must be one of the predefined status values.
  - current_arrears_band: Optional. Must be one of the dynamic keys from the Arrears_bands collection.
  - date_from: Optional. ISO date string to filter cases created after this date.
  - date_to: Optional. ISO date string to filter cases created before this date.
  - pages: Required. Integer representing the current page number. Page 1 returns 10 results; pages >1 return 30 results each.

  Response:
  - HTTP 200: Success. Returns filtered and paginated case data.
  - HTTP 204: Invalid case_current_status provided.
  - HTTP 400: Invalid current_arrears_band value.
  - HTTP 500: Internal server error or DB connection failure.

  Flow:
  1. Start MongoDB session and transaction.
  2. Parse and validate input values from request body.
  3. Connect to MongoDB and retrieve valid arrears bands from Arrears_bands collection.
  4. Validate 'case_current_status' and 'current_arrears_band' against their respective valid lists.
  5. Calculate pagination: 10 items for page 1, 30 for others.
  6. Build MongoDB aggregation pipeline with match, sort, skip, limit, and project stages.
  7. Fetch the result and commit the transaction.
  8. Return a success response with filtered case data.
  9. Handle and log errors, abort transaction on failure.
*/

export const List_FTL_LOD_Cases = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const {
      case_current_status,
      current_arrears_band,
      date_from,
      date_to,
      pages
    } = req.body;

    const validStatuses = [
      "Pending FTL LOD",
      "Initial FTL LOD",
      "FTL LOD Settle Pending",
      "FTL LOD Settle Open-Pending",
      "FTL LOD Settle Active"
    ];

    const mongoConnection = await db.connectMongoDB();
    if (!mongoConnection) {
      throw new Error("MongoDB connection failed");
    }

    const arrearsData = await mongoConnection
      .collection("Arrears_bands")
      .findOne({});

    const validArrearsBands = arrearsData
      ? Object.keys(arrearsData).filter(key => key !== "_id")
      : [];

    if (case_current_status && !validStatuses.includes(case_current_status)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(204).json({
        status: "error",
        message: "Invalid case_current_status value."
      });
    }

    if (current_arrears_band && !validArrearsBands.includes(current_arrears_band)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: "error",
        message: "Invalid current_arrears_band value."
      });
    }

    let page = Number(pages);
    if (isNaN(page) || page < 1) page = 1;

    const limit = page === 1 ? 10 : 30;
    const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

    const matchQuery = {};

    if (case_current_status) {
      matchQuery.case_current_status = case_current_status;
    }

    if (current_arrears_band) {
      matchQuery.current_arrears_band = current_arrears_band;
    }

    if (date_from || date_to) {
      matchQuery.created_dtm = {};
      if (date_from) matchQuery.created_dtm.$gte = new Date(date_from);
      if (date_to) matchQuery.created_dtm.$lte = new Date(date_to);
    }

    const total = await Case_details.countDocuments(matchQuery).session(session);

    const result = await Case_details.aggregate([
      { $match: matchQuery },
      { $sort: { case_id: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          case_id: 1,
          account_no: 1,
          current_arrears_amount: 1,
          case_current_status: 1,
          ftl_lod: {
            $cond: {
              if: { $isArray: "$ftl_lod" },
              then: {
                $map: {
                  input: "$ftl_lod",
                  as: "item",
                  in: {
                    expire_date: "$$item.expire_date"
                  }
                }
              },
              else: []
            }
          }
        }
      }
    ]).session(session);

    await session.commitTransaction();
    session.endSession();

    const pagesCount = total <= 10 ? 1 : Math.ceil((total - 10) / 30) + 1;

    res.status(200).json({
      status: "success",
      message: "FTL LOD cases retrieved successfully.",
      data: {
        cases: result,
        pagination: {
          total,
          page,
          limit,
          pages: pagesCount
        }
      }
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      status: "error",
      message: "Error retrieving FTL LOD cases.",
      errors: {
        code: 500,
        description: error.message
      }
    });
  }
};


/*
  Function: Create_Customer_Response (FLT-1P04)

  Description:
  This function allows users to append a new customer response to the first `ftl_lod` entry of a case in the database.

  Collections Used:
  - Case_details: Stores case information and embedded ftl_lod and customer_response arrays.

  Request Body Parameters:
  - case_id: Required. Identifier of the case to update.
  - created_by: Required. The user or system who created the response.
  - response: Required. The actual response text/content.

  Response:
  - HTTP 200: Success. Returns the newly added customer response object.
  - HTTP 400: Missing required fields in the request body.
  - HTTP 404: Case not found or does not contain any ftl_lod records.
  - HTTP 500: Internal server error.

  Flow:
  1. Parse and validate required fields from request body.
  2. Find the case document by case_id and verify it has an ftl_lod entry.
  3. Generate response_seq by incrementing current response count in ftl_lod[0].
  4. Construct a new response object with metadata.
  5. Use MongoDB’s positional operator to push the response to ftl_lod.0.customer_response.
  6. Return success response with the created response object.
  7. Catch and log errors, return 500 on failure.
*/

  export const Create_Customer_Response = async (req, res) => {
    try {
      const { case_id, created_by, response } = req.body;
  
      if (!case_id || !created_by || !response) {
        return res.status(400).json({
          status: "error",
          message: "case_id, created_by, and response are required.",
        });
      }
  
      // Find the case and ensure ftl_lod exists
      const caseDoc = await Case_details.findOne({ case_id });
  
      if (!caseDoc || !Array.isArray(caseDoc.ftl_lod) || caseDoc.ftl_lod.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "FTL LOD not found for this case.",
        });
      }
  
      // Get current customer_response length for response_seq
      const currentResponses = caseDoc.ftl_lod[0].customer_response || [];
      const response_seq = currentResponses.length + 1;
  
      const newResponse = {
        response_seq,
        created_by,
        created_on: new Date(),
        response,
      };
  
      // Update using positional operator to push into the correct nested array
      await Case_details.updateOne(
        { case_id },
        { $push: { "ftl_lod.0.customer_response": newResponse } }
      );
  
      return res.status(200).json({
        status: "success",
        message: "Customer response added successfully.",
        data: newResponse,
      });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  };


/*
  Function: FLT_LOD_Case_Details (FLT-1P04)

  Description:
  This function retrieves detailed information for a given FTL LOD case, enriching it with related incident and customer data.

  Collections Used:
  - Case_details: Source of case data, including account_no, arrears info, RTOM, area, and linked incident_id.
  - Incident: Used to fetch customer information linked to the case via incident_id.

  Request Body Parameters:
  - case_id: Required. Identifier of the case to fetch.

  Response:
  - HTTP 200: Success. Returns combined case and incident details with matched services.
  - HTTP 400: Missing case_id in request body.
  - HTTP 404: Case or related incident not found.
  - HTTP 500: Internal server error.

  Flow:
  1. Validate presence of case_id in request body.
  2. Query Case_details collection using case_id.
  3. If found, extract account_no, arrears band, rtom, area, incident_id, ref_products.
  4. Query Incident collection using incident_id to get customer details.
  5. Match account_no in ref_products to extract corresponding services.
  6. Construct and return a response combining both case and incident/customer information.
  7. Log and return 500 in case of any unexpected errors.
*/


export const FLT_LOD_Case_Details = async (req, res) => {
  try {
    const { case_id } = req.body;

    // Step 1: Validate input
    if (!case_id) {
      return res.status(400).json({ status: "error", message: "Missing case_id in request body" });
    }

    // Step 2: Check if case exists
    const caseDoc = await Case_details.findOne({ case_id }).lean();
    if (!caseDoc) {
      return res.status(404).json({ status: "error", message: "Case not found for the given case_id" });
    }

    const { account_no, current_arrears_band, rtom, area, incident_id, ref_products } = caseDoc;

    // Step 3: Check if related incident exists
    const incidentDoc = await Incident.findOne({ Incident_Id: incident_id }).lean();
    if (!incidentDoc) {
      return res.status(404).json({ status: "error", message: "Related incident not found for the case" });
    }

    // Step 4: Extract customer details
    const { Customer_Name, Full_Address, Customer_Type_Name } = incidentDoc.Customer_Details;

    // Step 5: Filter relevant services
    const matchingServices = (ref_products || [])
      .filter(product => product.account_no === account_no)
      .map(product => product.service);

      // Check if any other cases are related to this incident_id
    const relatedCases = await Case_details.find({
      incident_id: incident_id,
      case_id: { $ne: case_id }  // exclude the current case
    }).lean();


    // Step 6: Build response
    const result = {
      account_no,
      current_arrears_band,
      rtom,
      area,
      incident_id,
      customer_name: Customer_Name,
      full_address: Full_Address,
      customer_type_name: Customer_Type_Name,
      event_source: matchingServices
    };

    return res.status(200).json({ status: "success", data: result });

  } catch (err) {
    console.error("Error in FLT_LOD_Case_Details:", err);
    return res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

/*
  Function: Create_FLT_LOD (FLT-1P02)

  Description:
  This function creates a new FTL LOD (Final Term Letter of Demand) entry for a case, and updates its case status accordingly.

  Collections Used:
  - Case_details: The case document where FTL LOD and case status entries are pushed.

  Request Body Parameters:
  - case_id: Required. Identifier of the case being updated.
  - pdf_by: Required. The user/system who generated the FTL PDF.
  - signed_by: Required. The person who signed the FTL LOD.
  - customer_name: Required. Name of the customer receiving the LOD.
  - created_by: Required. User who initiated the FTL LOD creation.
  - postal_address: Required. Address of the customer.
  - event_source: Required. Service/event info linked to the case.

  Response:
  - HTTP 200: Success. FTL LOD and case status updated.
  - HTTP 400: Missing required fields in request body.
  - HTTP 404: Case not found for the provided case_id.
  - HTTP 500: Internal server error.

  Flow:
  1. Validate all required fields are present in the request body.
  2. Construct an `ftlEntry` object with FTL LOD letter details and metadata.
  3. Construct a `caseStatusEntry` to reflect the status change.
  4. Use MongoDB `$push` to append to `ftl_lod` and `case_status`, and `$set` to update `case_current_status`.
  5. Handle case not found scenario with HTTP 404.
  6. Return a success message upon completion.
  7. Catch and log errors, return HTTP 500 for exceptions.
*/


  export const Create_FLT_LOD = async (req, res) => {
    try {
          // Step 1: Extract required fields from request body
      const { case_id, pdf_by, signed_by, customer_name, created_by, postal_address, event_source } = req.body;
  
          // Step 2: Validate all required fields are present
      if (!case_id || !pdf_by || !signed_by || !customer_name || !created_by || !postal_address || !event_source) {
        return res.status(400).json({ error: 'Missing required fields in request body' });
      }

      // Step 3: Find the case document using case_id
      const caseDetails = await Case_details.findOne({ case_id });
      if (!caseDetails) {
        return res.status(404).json({ error: 'Case not found for the provided case_id' });
      }

      // Step 4: Generate timestamps for record creation
      const now = new Date();
      const expire_date = null;

      // Step 5: Construct FTL LOD entry to be pushed into the case
      const ftlEntry = {
        pdf_by,
        pdf_on: now,
        expire_date,
        signed_by,
        ftl_lod_letter_details: [
          {
            created_on: now,
            created_by,
            customer_name,
            postal_address: [postal_address],
            event_source
          }
        ],
        customer_response: []
      };
  
          // Step 6: Prepare the case status update to reflect FTL LOD creation
      const caseStatusEntry = {
        case_status: 'Initial FTL LOD',
        created_dtm: now,
        created_by,
        status_reason: 'FTL LOD created',
        notified_dtm: null,
        expire_dtm: null,
        case_phase:"Letter of Demand"
      };
  
      
    // Step 7: Update the case document - push FTL entry & status, set current status
      const updateResult = await Case_details.updateOne(
        { case_id },
        {
          $push: {
            ftl_lod: ftlEntry,
            case_status: caseStatusEntry
          },
          $set: {
            case_current_status: 'Initial FTL LOD',
            case_current_phase:"Letter of Demand",
          }
        }
      );
  
          // Step 7: Handle case not found
      // if (updateResult.matchedCount === 0) {
      //   return res.status(404).json({ error: 'Case not found' });
      // }
  
          // Step 8: Return success response
      return res.status(200).json({ message: 'FTL LOD entry and case status updated successfully' });
  
    } catch (err) {
          // Step 9: Catch and log any unexpected errors
      console.error('Error creating FTL LOD entry:', err);
      return res.status(500).json({ error: 'Internal server error' });
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
          // Step 1: Extract case_id and validate presence
      const { case_id } = req.body;
  
      if (!case_id) {
        return res.status(400).json({ message: "case_id is required" });
      }

      // Step 2: Find the case document
      const caseDetails = await Case_details.findOne({ case_id });
      if (!caseDetails) {
        return res.status(404).json({ message: "Case not found" });
      }
  
          // Step 3: Extract settlement IDs from the case
      const settlementIds = caseDetails.settlement?.map(s => s.settlement_id) || [];

          // Step 4: Fetch settlement documents using settlement IDs
      const settlements = await CaseSettlement.find({ settlement_id: { $in: settlementIds } });
  
          // Step 5: Build array of settlement plans
      const settlementPlans = settlements.map(s => ({
        settlement_id: s.settlement_id,
        settlement_plan: s.settlement_plan,
        last_monitoring_dtm: s.last_monitoring_dtm || null
      }));
  
          // Step 6: Extract transaction IDs from money_transactions
      const moneyTransactions = caseDetails.money_transactions || [];
      const transactionIds = moneyTransactions.map(txn => txn.money_transaction_id);
  
          // Step 7: Fetch payment documents related to transaction IDs
      const payments = await CasePayment.find({ money_transaction_id: { $in: transactionIds } });
  
          // Step 8: Merge transaction info with corresponding payment data
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
  
          // Step 9: Construct final response object
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
  
          // Step 10: Return full case details response
      return res.status(200).json(response);
    } catch (error) {
          // Step 11: Handle unexpected errors
      console.error("Error fetching case details:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  
  
  
  
  
  
  
  
  
  
  
