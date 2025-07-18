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
      return res.status(400).json({
        status: "error",
        message: "All fields are required.",
      });
    }
    let page = Number(pages);
    if (isNaN(page) || page < 1) page = 1;

    const limit = page === 1 ? 10 : 30;
    const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

    const query = status ? { case_current_status: status } : {};
    // Fetch the total count of cases that match the filter criteria (without pagination)
    const totalCount = await Case_details.countDocuments(query);
    const distributions = await Case_details.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ case_id: -1 });
    return res.status(200).json({
      status: "success",
      message: "Cases retrieved successfully.",
      data: distributions,
      total_cases: totalCount,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const F2_selection_cases_count = async (req, res) => {
  try {
    const case_counts = await Case_details.aggregate([
      {
        $match: { case_current_status: "LIT Prescribed" },
      },
      {
        $group: {
          _id: "$lod_final_reminder.current_document_type", // No need for $arrayElemAt
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          total_count: { $sum: "$count" },
          cases: { $push: { document_type: "$_id", count: "$count" } },
        },
      },
      {
        $project: {
          _id: 0,
          total_count: 1,
          cases: 1,
        },
      },
    ]).exec();
    return res.status(200).json({
      status: "success",
      data:
        case_counts.length > 0 ? case_counts[0] : { total_count: 0, cases: [] },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error while fetching case counts",
    });
  }
};

export const List_F2_Selection_Cases = async (req, res) => {
  try {
    const { current_document_type, pages } = req.body;

    if (!current_document_type) {
      return res.status(400).json({
        status: "error",
        message: "current document type is required.",
      });
    }
    let page = Number(pages);
    if (isNaN(page) || page < 1) page = 1;
    // Define pagination limits
    const limit = page === 1 ? 10 : 30;
    const skip = page === 1 ? 0 : 10 + (page - 2) * 30;
    // Fetch cases from database
    // const Lod_cases = await Case_details.find({ 'lod_final_reminder.current_document_type': current_document_type })
    const Lod_cases = await Case_details.find({
      $and: [
        { "lod_final_reminder.current_document_type": current_document_type },
        { case_current_status: "LIT Prescribed" },
      ],
    })
      .select(
        "case_id current_arrears_amount customer_type_name account_manager_code lod_final_reminder"
      )
      .skip(skip)
      .limit(limit)
      .sort({ case_id: -1 });

    return res.status(200).json({
      status: "success",
      message: "Cases retrieved successfully.",
      data: Lod_cases,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const Create_Task_For_Downloard_All_Digital_Signature_LOD_Cases = async (
  req,
  res
) => {
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

    const parameters = {
      case_current_status: "LIT Prescribed",
    };

    const taskData = {
      Template_Task_Id: 39,
      task_type: "Create Task For Downloard All Digital Signature LOD Cases",
      ...parameters,
      Created_By,
      task_status: "open",
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

export const Create_Task_For_Downloard_Each_Digital_Signature_LOD_Cases =
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { Created_By, current_document_type } = req.body;

      if (!Created_By || !current_document_type) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          status: "error",
          message:
            "created by and current document type are required parameters.",
        });
      }

      // Flatten the parameters structure
      const parameters = {
        case_current_status: "LIT Prescribed",
        current_document_type,
      };

      // Pass parameters directly (without nesting it inside another object)
      const taskData = {
        Template_Task_Id: 40,
        task_type: "Create Task For Downloard Each LOD OR Final Reminder Cases",
        ...parameters,
        Created_By,
        task_status: "open",
      };

      // Call createTaskFunction
      const response = await createTaskFunction(taskData, session);

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        status: "success",
        message: "Task created successfully.",
        data: response,
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
    const { case_id, current_document_type, Created_By, changed_type_remark } =
      req.body;

    if (
      !case_id ||
      !current_document_type ||
      !Created_By ||
      !changed_type_remark
    ) {
      return res.status(400).json({
        status: "error",
        message: "All parammeters are required.",
      });
    }
    const Lod_cases = await Case_details.findOne({ case_id });
    if (!Lod_cases) {
      return res.status(404).json({
        status: "error",
        message: "Case has not found with this case_id.",
      });
    }
    let next_document_type;
    if (current_document_type === "LOD") {
      next_document_type = "Final Reminder";
    } else if (current_document_type === "Final Reminder") {
      next_document_type = "LOD";
    }

    const last_document_seq =
      Lod_cases.lod_final_reminder.document_type.length > 0
        ? Lod_cases.lod_final_reminder.document_type[
            Lod_cases.lod_final_reminder.document_type.length - 1
          ].document_seq
        : 0;
    console.log("this is the log ", last_document_seq);
    const updatedCase = await Case_details.findOneAndUpdate(
      { case_id },
      {
        $set: {
          "lod_final_reminder.current_document_type": next_document_type,
        },
        $push: {
          "lod_final_reminder.document_type": {
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
    return res.status(200).json({
      status: "success",
      message: "Cases updated successfully.",
      data: updatedCase,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const Create_Task_for_Proceed_LOD_OR_Final_Reminder_List = async (
  req,
  res
) => {
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
        message:
          "Already has not complete tasks with this current_document_type ",
      });
    }
    // Flatten the parameters structure
    const parameters = {
      case_current_status: "LIT Prescribed",
      current_document_type,
      Case_count,
    };

    // Pass parameters directly (without nesting it inside another object)
    const taskData = {
      Template_Task_Id: 41,
      task_type: "Create Task for Proceed LOD OR Final_Reminder List",
      ...parameters,
      Created_By,
      task_status: "open",
    };

    // Call createTaskFunction
    const response = await createTaskFunction(taskData, session);

    await session.commitTransaction();
    await session.endSession();

    return res.status(200).json({
      status: "success",
      message: "Task created successfully.",
      data: response,
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

export const List_Final_Reminder_Lod_Cases = async (req, res) => {
  try {
    const {
      case_status,
      date_type,
      date_from,
      date_to,
      current_document_type,
      pages,
    } = req.body;
    const allowedStatusTypes = [
      "Initial LOD",
      "LOD Settle Pending",
      "LOD Settle Open-Pending",
      "LOD Settle Active",
      "Final Reminder",
      "Final Reminder Settle Pending",
      "Final Reminder Settle Open-Pending",
      "Final Reminder Settle Active",
    ];
    if (!current_document_type) {
      return res.status(400).json({
        status: "error",
        message: "The current document type is required ",
      });
    }
    // if (!case_status && !date_type) {
    //   return res.status(400).json({
    //     status: "error",
    //     message: "There should be at least one parameter case status or date type ",
    //   });
    // }
    if (date_type && !date_from && !date_to) {
      return res.status(400).json({
        status: "error",
        message: "There should be at least one parameter date from or date to ",
      });
    }
    let page = Number(pages);
    if (isNaN(page) || page < 1) page = 1;
    const limit = page === 1 ? 10 : 30;
    const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

    let filter = { case_current_status: { $in: allowedStatusTypes } };
    filter["lod_final_reminder.current_document_type"] = current_document_type;
    if (case_status && allowedStatusTypes.includes(case_status)) {
      filter.case_current_status = case_status;
    }
    if (date_type) {
      let dateField;
      switch (date_type) {
        case "created_date":
          dateField = "lod_final_reminder.lod_submission.created_on";
          break;
        case "expire_date":
          dateField = "lod_final_reminder.lod_expire_on";
          break;
        case "last_response_date":
          dateField = "lod_final_reminder.lod_response.created_on";
          break;
        default:
          return res.status(400).json({
            status: "error",
            message:
              "Invalid date_type. Must be one of: created_date, expiry_date, last_response_date",
          });
      }
      const dateFilter = {};
      if (date_from) dateFilter.$gte = new Date(date_from);
      if (date_to) {
        const endofDay = new Date(date_to);
        endofDay.setHours(23, 59, 59, 999);
        dateFilter.$lte = new Date(endofDay);
      }
      if (!date_from && !date_to) {
        return res.status(400).json({
          status: "error",
          message:
            "There should be at least one parameter, date_from or date_to",
        });
      }
      if (Object.keys(dateFilter).length > 0) {
        filter[dateField] = dateFilter;
      }
    }
    const filtered_cases = await Case_details.find(filter)
      .select("case_id case_current_status lod_final_reminder")
      .skip(skip)
      .limit(limit)
      .sort({ case_id: -1 });

    return res.status(200).json({
      status: "success",
      message: "Cases retrieved successfully.",
      data: filtered_cases,
    });
  } catch (error) {
    console.error(
      "Error fetching DRC Assign Manager Approvals:",
      error.message
    );
    return res.status(500).json({
      status: "error",
      message: "There is an error ",
    });
  }
};

export const create_Customer_Responce = async (req, res) => {
  try {
    const { case_id, customer_responce, remark, created_by } = req.body;
    const valid_customer_responce = [
      "Agree to Settle",
      "Customer Dispute",
      "Request More Information",
    ];
    if (!case_id || !customer_responce || !created_by) {
      return res.status(400).json({
        status: "error",
        message: "All parammeters are required.",
      });
    }
    if (!valid_customer_responce.includes(customer_responce)) {
      return res.status(400).json({
        status: "error",
        message: `Invalid customer_responce. Allowed values are: ${valid_customer_responce.join(
          ", "
        )}`,
      });
    }
    const Lod_cases = await Case_details.findOne({ case_id });
    const last_responce_seq =
      Lod_cases.lod_final_reminder.lod_response.length > 0
        ? Lod_cases.lod_final_reminder.lod_response[
            Lod_cases.lod_final_reminder.lod_response.length - 1
          ].lod_response_seq
        : 0;
    const updatedCase = await Case_details.findOneAndUpdate(
      { case_id },
      {
        $push: {
          "lod_final_reminder.lod_response": {
            lod_response_seq: last_responce_seq + 1,
            response_type: customer_responce,
            lod_remark: remark,
            created_by,
            created_on: new Date(),
          },
        },
      },
      {
        new: true,
        runValidators: true,
        fields: { "lod_final_reminder.lod_response": 1 },
      }
    );
    return res.status(200).json({
      status: "success",
      message: "Cases updated successfully.",
      data: updatedCase,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const case_details_for_lod_final_reminder = async (req, res) => {
  try {
    const { case_id } = req.body;
    if (!case_id) {
      return res.status(400).json({
        status: "error",
        message: "case id i required.",
      });
    }
    const case_detais = await Case_details.findOne(
      { case_id },
      {
        case_id: 1,
        customer_ref: 1,
        account_no: 1,
        current_arrears_amount: 1,
        last_payment_date: 1,
        lod_final_reminder: 1,
      }
    );
    if (!case_detais) {
      return res.status(404).json({
        status: "error",
        message: "There is no case with this case id.",
      });
    }
    return res.status(200).json({
      status: "success",
      message: "case retrive successfully ",
      data: case_detais,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const List_All_LOD_Holdlist = async (req, res) => {
  try {
    const { LODtype, from_date, to_date, pages } = req.body;

    const pipeline = [];

    if (LODtype) {
      pipeline.push({
        $match: { "lod_final_reminder.current_document_type": String(LODtype) },
      });
    }

    const dateFilter = {};
    if (from_date) dateFilter.$gte = new Date(from_date);
    if (to_date) {
      const endOfDay = new Date(to_date);
      endOfDay.setHours(23, 59, 59, 999);
      dateFilter.$lte = endOfDay;
    }

    pipeline.push({
      $addFields: {
        last_status: { $arrayElemAt: ["$case_status", -1] },
      },
    });

    if (Object.keys(dateFilter).length > 0) {
      pipeline.push({
        $match: { "last_status.created_dtm": dateFilter },
      });
    }

    // Direct filter for case_current_status = "LD Hold"
    pipeline.push({
      $match: { case_current_status: "LD Hold" },
    });

    let page = Number(pages);
    if (isNaN(page) || page < 1) page = 1;
    const limit = page === 1 ? 10 : 30;
    const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

    // Pagination
    pipeline.push({ $sort: { case_id: -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const filtered_cases = await Case_details.aggregate(pipeline);

    const responseData = filtered_cases.map((LODHoldData) => {
      return {
        case_id: LODHoldData.case_id,
        status: LODHoldData.case_current_status,
        lod_type: LODHoldData.lod_final_reminder?.current_document_type || null,
        hold_by: LODHoldData.last_status?.created_by || null,
        date: LODHoldData.last_status?.created_dtm || null,
      };
    });

    return res.status(200).json({
      status: "success",
      message: "Cases retrieved successfully.",
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching LD Hold list Data:", error.message);
    return res.status(500).json({
      status: "error",
      message: "There is an error ",
    });
  }
};

export const Proceed_LD_Hold_List = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { approver_reference, created_by } = req.body;

    if (!approver_reference || !created_by) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    const currentDate = new Date();

    let case_phase = "Letter of Demand";

    // Verify case exists
    const caseExists = await Case_details.findOne({
      case_id: approver_reference,
    }).session(session);
    if (!caseExists) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Case not found" });
    }

    // Update approve array in CaseDetails with requested_on and requested_by
    const caseResult = await Case_details.updateOne(
      { case_id: approver_reference },
      {
        $push: {
          case_status: {
            case_status: "LIT Prescribed",
            status_reason: "Case proceeded from LD Hold",
            created_dtm: currentDate,
            created_by: created_by,
            case_phase,
          },
        },
        $set: {
          case_current_status: "LIT Prescribed",
          case_current_phase: case_phase,
        },
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      status: "success",
      message: "Case proceed request added successfully",
      data: { caseResult },
    });
  } catch (error) {
    // console.error("Error withdrawing case:", error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: error.message });
  }
};
