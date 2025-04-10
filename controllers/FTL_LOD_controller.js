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



  
  // export const FLT_LOD_Case_Details = async (req, res) => {
  //   try {
  //     const { case_id } = req.body;
  //     if (!case_id) {
  //       return res.status(400).json({ error: 'Missing case_id in request body' });
  //     }
  
  //     // Step 1: Find the CaseDetails document by case_id
  //     const caseDoc = await Case_details.findOne({ case_id }).lean();
  //     if (!caseDoc) {
  //       return res.status(404).json({ error: 'Case not found' });
  //     }
  
  //     const { account_no, current_arrears_band, rtom, area, incident_id } = caseDoc;
  
  //     // Step 2: Find the Incident document using incident_id
  //     const incidentDoc = await Incident.findOne({ Incident_Id: incident_id }).lean();
  //     if (!incidentDoc) {
  //       return res.status(404).json({ error: 'Related incident not found' });
  //     }
  
  //     const { Customer_Name, Full_Address, Customer_Type_Name } = incidentDoc.Customer_Details;
  
  //     // Step 3: Prepare response data
  //     const result = {
  //       account_no,
  //       current_arrears_band,
  //       rtom,
  //       area,
  //       incident_id,
  //       customer_name: Customer_Name,
  //       full_address: Full_Address,
  //       customer_type_name: Customer_Type_Name,
  //     };
  
  //     return res.status(200).json(result);
  
  //   } catch (err) {
  //     console.error('Error fetching FLT LOD case details:', err);
  //     return res.status(500).json({ error: 'Internal server error' });
  //   }
  // };

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
  
  
  
  
  
  
  
  
  
  
