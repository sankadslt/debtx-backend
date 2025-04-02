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
                    _id: {
                        $cond: { 
                            if: { $isArray: "$lod_final_reminder.current_document_type" }, 
                            then: { $arrayElemAt: ["$lod_final_reminder.current_document_type", 0] }, 
                            else: "$lod_final_reminder.current_document_type"
                        }
                    },
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

    return res.status(201).json({
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
  
      return res.status(201).json({
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

        if(!Lod_cases){
            return res.status(404).json({
                status: "error",
                message: "Case is not found with that case id"
            });
        }

        const last_document_type_seq_of_case = Lod_cases.lod_final_reminder[Lod_cases.lod_final_reminder.length];

        const updatedCase = await Case_details.findOneAndUpdate(
            { case_id },
            {
              $set: {
                'lod_final_reminder.current_document_type':current_document_type,
              },
              $push: {
                'lod_final_reminder.document_type': {
                    document_seq: last_document_type_seq_of_case + 1,
                    document_type: current_document_type,
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

export const Create_LOD_List = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { Created_By, Case_count, current_document_type } = req.body;
  
      if (!Created_By || !current_document_type || !Case_count) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          status: "error",
          message: "All parameters are required",
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
        Template_Task_Id: 41,
        task_type: "Create_LOD_List",
        ...parameters, 
      };
  
      // Call createTaskFunction
      await createTaskFunction(taskData, session);
  
      await session.commitTransaction();
      session.endSession();
  
      return res.status(201).json({
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