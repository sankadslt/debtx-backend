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
  This function is responsible for retrieving FTL LOD case details from the database.

  It uses MongoDB's aggregation pipeline to filter, sort, and paginate the results.
  
  - First time page load (page = 1) returns 10 rows.
  - From the second page onward (page > 1), it loads 30 rows per page.
  
  The frontend must maintain a variable named 'pages' and pass it in the request body.
  - On every "Next" button click, increment 'pages' by 1 and call this function again.

  Filters Supported:
  - case_current_status: Should match one of the predefined valid status values.
  - current_arrears_band: Filter by arrears band.
  - date_from and date_to: Filter based on the created_dtm date range.

  The function also includes a projection to only return required fields and sorts 
  embedded ftl_lod documents by their expire_date.

  The function is wrapped in a MongoDB session for transaction safety.
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
        "Initial FLT LOD",
        "FTL LOD Settle Pending",
        "FTL LOD Settle Open-Pending",
        "FTL LOD Settle Active"
      ];
  
      if (case_current_status && !validStatuses.includes(case_current_status)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          status: "error",
          message: "Invalid case_current_status value."
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
  
      const result = await Case_details.aggregate([
        { $match: matchQuery },
        { $sort: { case_id: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 0,
            case_id: 1,
            case_current_status: 1,
            account_no: 1,
            current_arrears_amount: 1,
            ftl_lod: {
              $map: {
                input: {
                  $sortArray: {
                    input: {
                      $filter: {
                        input: "$ftl_lod",
                        as: "lod",
                        cond: { $ifNull: ["$$lod.expire_date", false] }
                      }
                    },
                    sortBy: { expire_date: 1 }
                  }
                },
                as: "item",
                in: { expire_date: "$$item.expire_date" }
              }
            }
          }
        }
      ]).session(session);
  
      await session.commitTransaction();
      session.endSession();
  
      res.status(200).json({
        status: "success",
        message: "FTL LOD cases retrieved successfully.",
        data: result
      });
  
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      res.status(500).json({
        status: "error",
        message: error.message
      });
    }
  };

/*  
  This function is responsible for adding a new customer response to a specific FTL LOD case.

  Required fields in the request body:
  - case_id: Unique identifier of the case.
  - created_by: The user who is submitting the response.
  - response: The content of the customer response.

  Logic:
  - First, it validates the presence of case_id, created_by, and response.
  - Then it fetches the case document using the case_id.
  - If the case does not exist or does not have an FTL LOD entry, it returns a 404 error.
  - It calculates the `response_seq` based on the existing number of customer responses.
  - A new response object is created with `response_seq`, `created_by`, `created_on`, and `response`.
  - It updates the case document by pushing the new response into the first `ftl_lod` entry using MongoDB’s positional operator.

  On success:
  - Returns a success status with the newly added response object.

  This ensures that customer responses are correctly added to the nested `customer_response` array within the first FTL LOD entry of the case.
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
  This function retrieves detailed information for a specific FTL LOD case using the provided case_id.

  Required field in the request body:
  - case_id: Unique identifier of the case to fetch details for.

  Logic:
  - Validates the presence of case_id.
  - Finds the case document from the `Case_details` collection using case_id.
  - If not found, returns a 404 error ("Case not found").
  - Extracts key details from the case: account_no, current_arrears_band, rtom, area, incident_id, and ref_products.
  - Fetches the related incident document from the `Incident` collection using incident_id.
  - If the related incident is not found, returns a 404 error ("Related incident not found").
  - Extracts customer details: Customer_Name, Full_Address, and Customer_Type_Name.
  - Filters the `ref_products` array to match the case's account_no and collects the corresponding service(s).

  Final Response:
  - Returns a structured object containing both case and customer details, along with the filtered service list under `event_source`.

  This function is useful for displaying complete case and customer details in a case details view page.
*/


  export const FLT_LOD_Case_Details = async (req, res) => {
    try {
      const { case_id } = req.body;
      if (!case_id) {
        return res.status(400).json({ error: 'Missing case_id in request body' });
      }
  
      const caseDoc = await Case_details.findOne({ case_id }).lean();
      if (!caseDoc) {
        return res.status(404).json({ error: 'Case not found' });
      }
  
      const { account_no, current_arrears_band, rtom, area, incident_id, ref_products } = caseDoc;
  
      const incidentDoc = await Incident.findOne({ Incident_Id: incident_id }).lean();
      if (!incidentDoc) {
        return res.status(404).json({ error: 'Related incident not found' });
      }
  
      const { Customer_Name, Full_Address, Customer_Type_Name } = incidentDoc.Customer_Details;
  
      // Filter ref_products by matching account_no
      const matchingServices = (ref_products || [])
        .filter(product => product.account_no === account_no)
        .map(product => product.service);
  
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
  
      return res.status(200).json(result);
  
    } catch (err) {
      console.error('Error fetching FLT LOD case details:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

/*  
  This function creates a new FTL LOD (Final Termination Letter of Demand) entry for a specific case.

  Required fields in the request body:
  - case_id: Unique identifier of the case.
  - pdf_by: The user who generated the PDF.
  - signed_by: The user who signed the letter.
  - customer_name: Name of the customer.
  - created_by: The user creating this entry.
  - postal_address: Postal address of the customer.
  - event_source: Source of the event related to the case.

  Logic:
  - Validates all required fields.
  - Constructs a new `ftl_lod` entry with PDF metadata and initial `ftl_lod_letter_details`.
  - Initializes the `customer_response` array as empty.
  - Creates a corresponding `case_status` entry indicating that the FTL LOD was created.
  - Updates the `Case_details` document:
    - Pushes the new `ftl_lod` entry into the `ftl_lod` array.
    - Pushes the new `case_status` entry into the `case_status` array.
    - Sets `case_current_status` to `"Initial FTL LOD"`.

  Behavior:
  - If the case is not found, responds with 404.
  - If successful, responds with a 200 and a success message.

  This function is used when initiating an FTL LOD process for a customer, and it updates both the letter and case status history accordingly.
*/

  export const Create_FLT_LOD = async (req, res) => {
    try {
      const { case_id, pdf_by, signed_by, customer_name, created_by, postal_address, event_source } = req.body;
  
      if (!case_id || !pdf_by || !signed_by || !customer_name || !created_by || !postal_address || !event_source) {
        return res.status(400).json({ error: 'Missing required fields in request body' });
      }
  
      const now = new Date();
      const expire_date = null;
  
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
  
      const caseStatusEntry = {
        case_status: 'Initial FTL LOD',
        created_dtm: now,
        created_by,
        status_reason: 'FTL LOD created',
        notified_dtm: null,
        expire_dtm: null
      };
  
      const updateResult = await Case_details.updateOne(
        { case_id },
        {
          $push: {
            ftl_lod: ftlEntry,
            case_status: caseStatusEntry
          },
          $set: {
            case_current_status: 'Initial FTL LOD'
          }
        }
      );
  
      if (updateResult.matchedCount === 0) {
        return res.status(404).json({ error: 'Case not found' });
      }
  
      return res.status(200).json({ message: 'FTL LOD entry and case status updated successfully' });
  
    } catch (err) {
      console.error('Error creating FTL LOD entry:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  
  
  
  
  
  
  
  
  
  
