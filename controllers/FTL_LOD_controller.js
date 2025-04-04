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
        "initial FLT LOD",
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
  
  
  
  
  
  
  
  
