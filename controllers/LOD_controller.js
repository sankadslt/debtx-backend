/* 
    Purpose: This template is used for the LOD Controllers.
    Created Date: 2025-04-01
    Created By:  Ravindu Pathum(ravindupathumiit@gmail.com)
    Last Modified Date: 2025-04-01
    Modified By: Ravindu Pathum (ravindupathumiit@gmail.com)
    Version: Node.js v20.11.1
    Dependencies: axios , mongoose
    Related Files: Case_route.js
    Notes:  
*/

import db from "../config/db.js";
import Case_details from "../models/Case_details.js";
import mongoose from "mongoose";
import { createTaskFunction } from "../services/TaskService.js";


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

export const F2_selection_cases_count = async (req, res) => {
    try {
        const case_counts = await Case_details.aggregate([
            {
                $match: { case_current_status: "LIT Prescribed" }
            },
            {
                $group: {
                    _id: "$lod_final_reminder.current_document_type", // No need for $arrayElemAt
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: null,
                    total_count: { $sum: "$count" },
                    cases: { $push: { document_type: "$_id", count: "$count" } }
                }
            },
            {
                $project: {
                    _id: 0,
                    total_count: 1,
                    cases: 1
                }
            }
        ]).exec();
        return res.status(200).json({
            status: "success",
            data: case_counts.length > 0 ? case_counts[0] : { total_count: 0, cases: [] }
        });
    }catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Server error while fetching case counts"
        });
    }
};

export const List_F2_Selection_Cases = async (req, res) => {
    try {
        const { current_document_type, pages } = req.body;

        if (!current_document_type) {
            return res.status(400).json({
                status: "error",
                message: "current document type is required."
            });
        }
        let page = Number(pages);
        if (isNaN(page) || page < 1) page = 1;
        // Define pagination limits
        const limit = page === 1 ? 10 : 30;
        const skip = page === 1 ? 0 : 10 + (page - 2) * 30;
        // Fetch cases from database
        const Lod_cases = await Case_details.find({ 'lod_final_reminder.current_document_type': current_document_type })
            .skip(skip)
            .limit(limit)
            .sort({ case_id: -1 });

        res.status(200).json({
            status: "success",
            message: "Cases retrieved successfully.",
            data: Lod_cases,
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

export const Create_Task_For_Downloard_All_Digital_Signature_LOD_Cases = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { Created_By } = req.body;

    if (!Created_By) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: "error",
        message: "Created_By is a required parameter.",
      });
    }

    // Flatten the parameters structure
    const parameters = {
      case_current_status : "LIT Prescribed",
      Created_By,
      task_status: "open"
    };

    // Pass parameters directly (without nesting it inside another object)
    const taskData = {
      Template_Task_Id: 39,
      task_type: "Create Task For Downloard All Digital Signature LOD Cases",
      ...parameters, 
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

export const Create_Task_For_Downloard_Each_Digital_Signature_LOD_Cases = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      const { Created_By, current_document_type } = req.body;
  
      if (!Created_By || !current_document_type) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          status: "error",
          message: "created by and current document type are required parameters.",
        });
      }
  
      // Flatten the parameters structure
      const parameters = {
        case_current_status : "LIT Prescribed",
        current_document_type,
        Created_By,
        task_status: "open"
      };
  
      // Pass parameters directly (without nesting it inside another object)
      const taskData = {
        Template_Task_Id: 40,
        task_type: "Create Task For Downloard Each Digital Signature LOD Cases",
        ...parameters, 
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

export const Change_Document_Type = async (req, res) => {
    try {
        const { case_id, current_document_type, Created_By, changed_type_remark } = req.body;

        if (!case_id || !current_document_type || !Created_By || !changed_type_remark) {
            return res.status(400).json({
                status: "error",
                message: "All parammeters are required."
            });
        }
        const Lod_cases = await Case_details.findOne({case_id});
        
        let next_document_type;
        if (current_document_type === "LOD") {
            next_document_type = "Final Reminder";
        }
        else if (current_document_type === "Final Reminder") {
            next_document_type = "LOD";
        } 
        

        const last_document_seq = Lod_cases.lod_final_reminder.document_type.length > 0 
            ? Lod_cases.lod_final_reminder.document_type[Lod_cases.lod_final_reminder.document_type.length - 1].document_seq 
            : 0;

        const updatedCase = await Case_details.findOneAndUpdate(
            { case_id },
            {
              $set: {
                'lod_final_reminder.current_document_type':next_document_type,
              },
              $push: {
                'lod_final_reminder.document_type': {
                    document_seq: last_document_seq + 1,
                    document_type: next_document_type,
                    change_by: Created_By,
                    changed_dtm: new Date(),
                    changed_type_remark,
                },
              },
            },
            { new: true, runValidators: true }
          );
        res.status(200).json({
            status: "success",
            message: "Cases updated successfully.",
            data: updatedCase,
        });

    }catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

export const Create_Task_for_Proceed_LOD_OR_Final_Reminder_List = async (req, res) => {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const { Created_By, Case_count, current_document_type } = req.body;
  
      if (!Created_By || !current_document_type || !Case_count) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(400).json({
          status: "error",
          message: "All parameters are required parameters.",
        });
      }
      const mongo = await db.connectMongoDB();
      const existingTask = await mongo.collection("System_tasks").findOne({
        task_status: { $ne: "Complete" },
        "parameters.current_document_type": current_document_type,
      });
      if (existingTask) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(400).json({
          status: "error",
          message: "Already has not complete tasks with this current_document_type ",
        });
      }
      // Flatten the parameters structure
      const parameters = {
        case_current_status : "LIT Prescribed",
        current_document_type,
        Created_By,
        task_status: "open",
        Case_count,
      };
  
      // Pass parameters directly (without nesting it inside another object)
      const taskData = {
        Template_Task_Id: 41,
        task_type: "Create Task for Proceed LOD OR Final_Reminder List",
        ...parameters, 
      };
  
      // Call createTaskFunction
      await createTaskFunction(taskData, session);
  
      await session.commitTransaction();
      await session.endSession();
  
      return res.status(200).json({
        status: "success",
        message: "Task created successfully.",
        data: taskData,
      });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        await session.endSession();
        return res.status(500).json({
            status: "error",
            message: error.message || "Internal server error",
            errors: {
                exception: error.message,
            },
        });
    }
};

export const List_Lod_Cases3 = async (req, res) => {    
  try {
    const { case_status, date_type, date_from, date_to } = req.query;

    // Validate at least one filter parameter is provided
    if (!case_status && !date_type) {
      return res.status(400).json({
        status: "error",
        message: "At least one filter parameter (case_status or date_type) is required"
      });
    }

    // Build the query dynamically
    const query = {};

    if (case_status) {
      query.case_status = case_status;
    }

    if (date_type) {
      let dateField;
      
      // Determine which field to filter based on date_type
      switch(date_type) {
        case 'created_date':
          dateField = 'lod_final_reminder.lod_submission.created_on';
          break;
        case 'expiry_date':
          dateField = 'lod_final_reminder.lod_expire_on';
          break;
        case 'last_response_date':
          // Special handling for array's last element
          dateField = 'lod_final_reminder.lod_response.created_on';
          break;
        default:
          return res.status(400).json({
            status: "error",
            message: "Invalid date_type. Must be one of: created_date, expiry_date, last_response_date"
          });
      }

      // Initialize date filter
      const dateFilter = {};

      if (date_from) {
        if (isNaN(Date.parse(date_from))) {
          return res.status(400).json({
            status: "error",
            message: "Invalid date_from format"
          });
        }
        dateFilter.$gte = new Date(date_from);
      }

      if (date_to) {
        if (isNaN(Date.parse(date_to))) {
          return res.status(400).json({
            status: "error",
            message: "Invalid date_to format"
          });
        }
        dateFilter.$lte = new Date(date_to);
      }

      // Special handling for last_response_date in array
      if (date_type === 'last_response_date') {
        query.$expr = {
          $let: {
            vars: {
              lastResponse: { $arrayElemAt: ['$lod_final_reminder.lod_response', -1] }
            },
            in: {
              $and: [
                { $ne: ['$$lastResponse', null] },
                ...(date_from ? [{ $gte: ['$$lastResponse.created_on', new Date(date_from)] }] : []),
                ...(date_to ? [{ $lte: ['$$lastResponse.created_on', new Date(date_to)] }] : [])
              ]
            }
          }
        };
      } else {
        // Regular date field filtering
        query[dateField] = dateFilter;
      }

      // Validate at least one date parameter was provided
      if (!date_from && !date_to) {
        return res.status(400).json({
          status: "error",
          message: "At least one date parameter (date_from or date_to) is required when using date_type"
        });
      }
    }

    // Execute the query
    const cases = await Case_details.find(query);

    res.status(200).json({
      status: "success",
      count: cases.length,
      data: cases
    });

  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

export const List_Lod_Cases = async (req, res) => {
  try {
      const { case_status, date_type, date_from, date_to } = req.body;
      const allowedStatusTypes = [
          "Initial LOD",
          "LOD Settle Pending",
          "LOD Settle Open-Pending",
          "LOD Settle Active",
      ];

      let filter = { case_status: { $in: allowedStatusTypes } };

      if (case_status && allowedStatusTypes.includes(case_status)) {
          filter.case_current_status = case_status;
      }

      if (date_type) {
        switch(date_type) {
          case 'created_date':
            dateField = 'lod_final_reminder.lod_submission.created_on';
            if (date_from && date_to) {
              filter.dateField = { $gte: new Date(date_from), $lte: new Date(date_to) };
            } else if (date_from) {
                filter.dateField = { $gte: new Date(date_from) };
            } else if (date_to) {
                filter.dateField = { $lte: new Date(date_to) };
            }
            break;
          case 'expiry_date':
            dateField = 'lod_final_reminder.lod_expire_on';
            if (date_from && date_to) {
              filter.dateField = { $gte: new Date(date_from), $lte: new Date(date_to) };
            } else if (date_from) {
                filter.dateField = { $gte: new Date(date_from) };
            } else if (date_to) {
                filter.dateField = { $lte: new Date(date_to) };
            }
            break;
          case 'last_response_date':
            dateField = 'lod_final_reminder.lod_response.created_on';
            if (date_from && date_to) {
              filter.dateField = { $gte: new Date(date_from), $lte: new Date(date_to) };
            } else if (date_from) {
                filter.dateField = { $gte: new Date(date_from) };
            } else if (date_to) {
                filter.dateField = { $lte: new Date(date_to) };
            }
            break;
          default:
            return res.status(400).json({
              status: "error",
              message: "Invalid date_type. Must be one of: created_date, expiry_date, last_response_date"
            });
        }
      }

      const filtered_cases = await Case_details.find(filter);

      res.status(200).json({
            status: "success",
            message: "Cases retrieved successfully.",
            data: filtered_cases,
        });
  } catch (error) {
      console.error("Error fetching DRC Assign Manager Approvals:", error.message);
      res.status(500).json({
        status: "error",
        message: "There is an error "
      });
  }
};

export const List_Final_Reminder_Cases = async (req, res) => {
  try {
      const { approver_type, date_from, date_to, approved_deligated_by } = req.body;
      const allowedApproverTypes = [
          "DRC Re-Assign Approval",
          "DRC Assign Approval",
          "Case Withdrawal Approval",
          "Case Abandoned Approval",
          "Case Write-Off Approval",
          "Commission Approval"
      ];

      let filter = { approver_type: { $in: allowedApproverTypes } }; // Filter only allowed approver types

      // Filter based on approver_type
      if (approver_type && allowedApproverTypes.includes(approver_type)) {
          filter.approver_type = approver_type;
      }

      // Filter based on date range
      if (date_from && date_to) {
          filter.created_on = { $gte: new Date(date_from), $lte: new Date(date_to) };
      } else if (date_from) {
          filter.created_on = { $gte: new Date(date_from) };
      } else if (date_to) {
          filter.created_on = { $lte: new Date(date_to) };
      }

      // Filter based on approved_deligated_by
      if (approved_deligated_by) {
          filter.approved_deligated_by = approved_deligated_by;
      }

      // Fetch data from Template_forwarded_approver collection
      const approvals = await TmpForwardedApprover.find(filter);

      // Process results to extract only the last element of approve_status array
      const response = approvals.map(doc => {
          const lastApproveStatus = doc.approve_status?.length 
              ? doc.approve_status[doc.approve_status.length - 1] 
              : null;

          return {
              ...doc.toObject(),
              approve_status: lastApproveStatus ? [lastApproveStatus] : [], // Keep only the last approve_status
          };
      });

      res.status(200).json(response);
  } catch (error) {
      console.error("Error fetching DRC Assign Manager Approvals:", error);
      res.status(500).json({ message: "Server Error", error });
  }
};