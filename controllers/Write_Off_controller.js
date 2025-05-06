import Case_details from "../models/Case_details.js";
import { createTaskFunction } from "../services/TaskService.js";
import mongoose from "mongoose";

/**
 * Get all write-off cases.
 * - Only returns cases where current status is "Pending Write Off" or "Write Off".
 * - For each case, gets the last object in `case_status` array.
 * - Returns `created_dtm` and `case_phase` from the last status object as `write_off_on` and `case_phase`.
 * - Supports date filtering, pagination, and recent mode.
 */


export const getAllWriteOffCases = async (req, res) => {
    // Extract filters and pagination from request body
    const {
      status,        // Optional: filter by a specific status
      fromDate,      // Optional: filter by write-off date (start)
      toDate,        // Optional: filter by write-off date (end)
      page = 1,      // Page number for pagination (default: 1)
      limit = 10,    // Items per page (default: 10)
      recent = false // If true, return only the latest 10 cases
    } = req.body;
  
    try {
      // 1. Build the status filter: by default, both statuses
      let statusFilter = ["Pending Write Off", "Write Off"];
      if (status) {
        statusFilter = [status];
      }
  
      // 2. Start the aggregation pipeline
      const pipeline = [
        // Only cases with eligible current status
        { $match: { case_current_status: { $in: statusFilter } } },
        // Add 'lastStatus' as the last element of 'case_status' array
        { $addFields: { lastStatus: { $arrayElemAt: ["$case_status", -1] } } }
      ];
  
      // 3. Date filter: filter by lastStatus.created_dtm if both dates are provided
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
  
      // 4. Sorting and pagination
      pipeline.push({ $sort: { case_id: -1 } }); // Sort by case_id descending
  
      let effectiveLimit = 10;
      let skip = 0;
      if (recent === true || recent === "true") {
        // "Recent" mode: just get 10 latest, no skip
        effectiveLimit = 10;
        skip = 0;
      } else {
        // Pagination logic
        const pageNum = Number(page) || 1;
        effectiveLimit = limit ? Number(limit) : (pageNum === 1 ? 10 : 30);
        skip = pageNum === 1 ? 0 : 10 + (pageNum - 2) * 30;
      }
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: effectiveLimit });
  
      // 5. Project required fields, including lastStatus.case_phase and lastStatus.created_dtm
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
  
      // 6. Run the aggregation pipeline
      const cases = await Case_details.aggregate(pipeline);
  
      if (!cases || cases.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "No write-off cases found for the provided parameters"
        });
      }
  
      // 7. Pagination metadata (if not recent)
      let pagination = undefined;
      if (!(recent === true || recent === "true")) {
        // Build a count pipeline for total matching docs
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
        pagination = {
          total,
          page: Number(page) || 1,
          limit: effectiveLimit,
          pages: total <= 10 ? 1 : Math.ceil((total - 10) / 30) + 1
        };
      }
  
      // 8. Respond with results and pagination
      return res.status(200).json({
        status: "success",
        message: "Write-off cases retrieved successfully.",
        data: {
          results: cases,
          ...(pagination && { pagination })
        }
      });
    } catch (error) {
      // 9. Error handling
      return res.status(500).json({
        status: "error",
        message: error.message || "Internal server error"
      });
    }
  };
  
  
  

export const Create_Task_For_Downloard_Write_Off_List = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      const { Created_By, Case_Status, from_date, to_date } = req.body;
  
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
        Case_Status: Case_Status,
        from_date: from_date,
        to_date: to_date,
      };
  
      // Pass parameters directly (without nesting it inside another object)
      const taskData = {
        Template_Task_Id: 47,
        task_type: "Create task for Download Write-off Case List",
        Created_By,
        task_status: "open",
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
  

