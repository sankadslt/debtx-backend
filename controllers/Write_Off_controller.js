/* 
    Purpose: This template is used for the Write_Off Controllers.
    Created Date: 2025-04-25
    Created By: Buthmi Mithara (buthmimithara1234@gmail.com)
    Version: Node.js v20.11.1
    Dependencies: axios , mongoose
    Related Files: Write_Off_route.js
    Notes:  
*/


import Case_details from "../models/Case_details.js";
import { createTaskFunction } from "../services/TaskService.js";
import mongoose from "mongoose";

/**
 * Controller: Get all write-off cases.
 * - Returns cases with status "Pending Write Off" or "Write Off".
 * - For each case, gets the last object in `case_status` array.
 * - Returns `created_dtm` and `case_phase` from the last status object as `write_off_on` and `case_phase`.
 * - Supports date filtering, pagination, and recent mode.
 */
export const getAllWriteOffCases = async (req, res) => {
    // Extract filters and pagination from request body
    const {
      status,        // Filter by a specific status if provided
      fromDate,      // Filter by write-off date (start)
      toDate,        // Filter by write-off date (end)
      page = 1,      // Page number for pagination (default: 1)
      limit = 10,    // Items per page (default: 10)
      recent = false // If true, return only the latest 10 cases
    } = req.body;
  
    try {
      // Build the status filter: by default, include both statuses
      let statusFilter = ["Pending Write Off", "Write Off"];
      if (status) {
        statusFilter = [status];
      }
  
      // Start the aggregation pipeline
      const pipeline = [
        // Only include cases with eligible current status
        { $match: { case_current_status: { $in: statusFilter } } },
        // Add 'lastStatus' as the last element of 'case_status' array
        { $addFields: { lastStatus: { $arrayElemAt: ["$case_status", -1] } } }
      ];
  
      // If both dates are provided, filter by lastStatus.created_dtm
      if (fromDate && toDate) {
        pipeline.push({
          $match: {
            "lastStatus.created_dtm": {
              $gte: new Date(fromDate),
              $lte: new Date(toDate)
            }
          }
        });
      }
  
      // Sorting and pagination logic
      pipeline.push({ $sort: { case_id: -1 } }); // Sort by case_id descending
  
      let effectiveLimit = 10;
      let skip = 0;
      if (recent === true || recent === "true") {
        // "Recent" mode: just get 10 latest, no skip
        effectiveLimit = 10;
        skip = 0;
      } else {
        // Pagination: page 1 returns 10, next pages return 30 each
        const pageNum = Number(page) || 1;
        effectiveLimit = limit ? Number(limit) : (pageNum === 1 ? 10 : 30);
        skip = pageNum === 1 ? 0 : 10 + (pageNum - 2) * 30;
      }
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: effectiveLimit });
  
      // Project only required fields
      pipeline.push({
        $project: {
          case_id: 1,
          case_current_status: 1,
          account_no: 1,
          customer_ref: 1,
          amount: "$current_arrears_amount",
          write_off_on: "$lastStatus.created_dtm", // last status date
          case_phase: "$lastStatus.case_phase"     // last status phase
        }
      });
  
      // Run the aggregation pipeline
      const cases = await Case_details.aggregate(pipeline);
  
      // If no cases found, return 404
      if (!cases || cases.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "No write-off cases found for the provided parameters"
        });
      }
  
      // Build pagination metadata (if not recent mode)
      let pagination = undefined;
      if (!(recent === true || recent === "true")) {
        // Separate count pipeline to get total matching docs
        const countPipeline = [
          { $match: { case_current_status: { $in: statusFilter } } },
          { $addFields: { lastStatus: { $arrayElemAt: ["$case_status", -1] } } }
        ];
        if (fromDate && toDate) {
          countPipeline.push({
            $match: {
              "lastStatus.created_dtm": {
                $gte: new Date(fromDate),
                $lte: new Date(toDate)
              }
            }
          });
        }
        countPipeline.push({ $count: "total" });
        const countResult = await Case_details.aggregate(countPipeline);
        const total = countResult[0]?.total || 0;
        // Calculate total pages (page 1: 10, next pages: 30 each)
        pagination = {
          total,
          page: Number(page) || 1,
          limit: effectiveLimit,
          pages: total <= 10 ? 1 : Math.ceil((total - 10) / 30) + 1
        };
      }
  
      // Respond with results and pagination info
      return res.status(200).json({
        status: "success",
        message: "Write-off cases retrieved successfully.",
        data: {
          results: cases,
          ...(pagination && { pagination })
        }
      });
    } catch (error) {
      // Error handling
      return res.status(500).json({
        status: "error",
        message: error.message || "Internal server error"
      });
    }
  };
  
/**
 * Controller: Create a background task to download the Write-Off Case List.
 * - Expects Created_By, Case_Status, from_date, to_date in request body.
 * - Uses a transaction to ensure task is only created if all is valid.
 * - Calls createTaskFunction to actually create the task.
 */
export const Create_Task_For_Downloard_Write_Off_List = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      const { Created_By, Case_Status, from_date, to_date } = req.body;
  
      // Validate required field
      if (!Created_By) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          status: "error",
          message: "created by is a required parameter.",
        });
      }
  
      // Build task parameters
      const parameters = {
        Case_Status: Case_Status,
        from_date: from_date,
        to_date: to_date,
      };
  
      // Prepare task data for creation
      const taskData = {
        Template_Task_Id: 47,
        task_type: "Create task for Download Write-off Case List",
        Created_By,
        task_status: "open",
        ...parameters
      };
  
      // Actually create the task in the database (with transaction)
      await createTaskFunction(taskData, session);
  
      await session.commitTransaction();
      session.endSession();
  
      // Respond with success
      return res.status(200).json({
        status: "success",
        message: "Task created successfully.",
        data: taskData,
      });
    } catch (error) {
      // Rollback on error
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
