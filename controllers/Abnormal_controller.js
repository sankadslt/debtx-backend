import mongoose from "mongoose";
import db from "../config/db.js";
import moment from "moment";
import axios from "axios";
import Case_details from "../models/Case_details.js";
import { createTaskFunction } from "../services/TaskService.js";
import TmpForwardedApprover from "../models/Template_forwarded_approver.js";
import { getApprovalUserIdService } from "../services/ApprovalService.js";
import { createUserInteractionFunction } from "../services/UserInteractionService.js";
import CaseDetails from "../models/Case_details.js";
import { Rtom_detais_of_the_DRC } from "./DRC_Service_controller.js";
 
export const List_All_Withdrawal_Case_Logs = async (req, res) => {
  try {
    const { status, accountNumber, fromDate, toDate, page = 1 } = req.body;

    // Pagination settings
    const currentPage = Number(page);
    if (isNaN(currentPage) || currentPage < 1) {
      return res.status(400).json({
        status: "error",
        message: "Invalid page number",
      });
    }

    const limit = currentPage === 1 ? 10 : 30;
    const skip = currentPage === 1 ? 0 : 10 + (currentPage - 2) * 30;

    let query = {};

    // Date filtering
    if (fromDate && toDate) {
      query.createdAt = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }

    // Status filter
    // Status filter - default to both "Write Off" and "Pending Write Off" if no status is selected
    if (status) {
      query.case_current_status = status;
    } else {
      query.case_current_status = { $in: ["Write Off", "Pending Write Off"] };
    }

    // Account number filter
    if (accountNumber) {
      query.account_no = String(accountNumber).trim();
    }

    const cases = await Case_details.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Case_details.countDocuments(query);

    const responseData = cases.map((caseItem) => {
      const abnormalStopArray = caseItem.abnormal_stop || [];
      const lastAbnormal =
        abnormalStopArray.length > 0
          ? abnormalStopArray[abnormalStopArray.length - 1]
          : "";

      return {
        caseId: caseItem.case_id,
        status: caseItem.case_current_status,
        accountNo: caseItem.account_no,
        amount: caseItem.current_arrears_amount,
        remark: lastAbnormal?.remark || "",
        withdrawBy: lastAbnormal?.done_by || "",
        withdrawOn: lastAbnormal?.done_on || "",
        approvedOn: lastAbnormal?.approved_on || "",
      };
    });
    console.log("Response Data:", responseData);
    return res.status(200).json({
      status: "success",
      message: "Withdrawal cases retrieved successfully.",
      data: responseData,
      pagination: {
        total,
        page: currentPage,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    console.error("Error in List_All_Withdrawal_Case_Logs:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
      errors: {
        exception: error.message,
      },
    });
  }
};

export const Task_for_Download_Withdrawals = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { Created_by, status, accountNumber, fromDate, toDate } = req.body;

    if (!Created_by) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: "error",
        message: "Created_by is a required parameter.",
      });
    }

    const taskParams = {
      Template_Task_Id: 100,
      task_type: "Download Withdrawal case list",
      Created_By: Created_by,
      task_status: "open",
      status,
      accountNumber,
      fromDate,
      toDate,
    };

    const result = await createTaskFunction(taskParams, session);

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json(result);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error in Task_for_Download_Withdrawals:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error",
    });
  }
};

// export const Create_Wthdraw_case = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//       const { approver_reference, remark, remark_edit_by, created_by, case_status } = req.body;

//       if (!approver_reference || !remark || !remark_edit_by || !created_by) {
//           await session.abortTransaction();
//           session.endSession();
//           return res.status(400).json({ message: "All required fields must be provided." });
//       }

//       const currentDate = new Date();
//       const payload = {case_status};
//       // FOR TESTING - Hardcode a case_phase instead of calling external API
//       let case_phase = "InitialReview"; // Mock value for testing
//       console.log("Using mock case_phase for testing:", case_phase);

//       /* COMMENT OUT THE EXTERNAL API CALL FOR TESTING
//       try {
//         const response = await axios.post('http://124.43.177.52:6000/app2/get_case_phase', payload);

//         if (!response.data.case_phase) {
//           await session.abortTransaction();
//           session.endSession();
//           return res.status(400).json({
//             message: "case_phase not found in API response",
//           });
//         }
//         case_phase = response.data.case_phase;
//         console.log("case_phase:", case_phase);
//       } catch (error) {
//         console.error('Error during axios call:', error.message);
//         if (error.response) {
//           console.error('API Error Response:', error.response.data);
//         }
//         await session.abortTransaction();
//         session.endSession();
//         return res.status(500).json({
//           message: "Failed to get case_phase from external API",
//           error: error.message,
//         });
//       };
//       */

//       const delegate_id = await getApprovalUserIdService({
//           case_phase,
//           approval_type: "DRC Assign Approval"
//       });

//       // Rest of your existing code remains the same...
//       const mongoConnection = await db.connectMongoDB();
//       const counterResult = await mongoConnection.collection("collection_sequence").findOneAndUpdate(
//         { _id: "approver_id" },
//         { $inc: { seq: 1 } },
//         { returnDocument: "after", upsert: true, session }
//       );

//       const approver_id = counterResult.seq;

//       if (!approver_id) {
//         throw new Error("Failed to generate Task_Id.");
//       }

//       const newDocument = new TmpForwardedApprover({
//           approver_id,
//           approver_reference,
//           created_by,
//           approver_type: "Case Withdrawal Approval",
//           approve_status: [{
//               status: "Open",
//               status_date: currentDate,
//               status_edit_by: created_by,
//           }],
//           remark: [{
//               remark,
//               remark_date: currentDate,
//               remark_edit_by,
//           }],
//           approved_deligated_by: delegate_id
//       });

//       await newDocument.save({ session });

//       const caseResult = await Case_details.updateOne(
//           { case_id: approver_reference },
//           {
//               $push: {
//                   case_status: {
//                     case_status: "Pending Case Withdrawal",
//                     status_reason: "Case send for Withdrawal Approval",
//                     created_dtm: currentDate,
//                     created_by: created_by,
//                     case_phase,
//                   }
//               },
//               $set: {
//                 case_current_status: "Pending Case Withdrawal",
//                 case_current_phase: case_phase,
//               },
//           },
//           { session }
//       );

//       const dynamicParams = {
//         approver_reference,
//       };

//       const interactionResult = await createUserInteractionFunction({
//           Interaction_ID: 18,
//           User_Interaction_Type: "Pending approval for Case Withdraw",
//           delegate_user_id: delegate_id,
//           Created_By: created_by,
//           User_Interaction_Status: "Open",
//           User_Interaction_Status_DTM: currentDate,
//           ...dynamicParams,
//           session
//       });

//       await session.commitTransaction();
//       session.endSession();

//       return res.status(200).json({
//           success: true,
//           message: "Case withdrawal request added successfully",
//           data: newDocument
//       });
//   } catch (error) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(500).json({ message: error.message });
//   }
// };

export const Create_Withdraw_case = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      approver_reference,
      remark,
      remark_edit_by,
      created_by,
      case_status,
    } = req.body;

    if (!approver_reference || !remark || !remark_edit_by || !created_by) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    const currentDate = new Date();
    const payload = { case_status };
    let case_phase = "";
    try {
      const response = await axios.post(
        "http://124.43.177.52:6000/app2/get_case_phase",
        payload
      );

      if (!response.data.case_phase) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: "case_phase not found in API response",
        });
      }
      case_phase = response.data.case_phase;
      console.log("case_phase:", case_phase);
    } catch (error) {
      console.error("Error during axios call:", error.message);
      if (error.response) {
        console.error("API Error Response:", error.response.data);
      }
      // Abort and end session on axios error
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({
        message: "Failed to get case_phase from external API",
        error: error.message,
      });
    }

    const delegate_id = await getApprovalUserIdService({
      case_phase,
      approval_type: "DRC Assign Approval",
    });

    const mongoConnection = await db.connectMongoDB();
    const counterResult = await mongoConnection
      .collection("collection_sequence")
      .findOneAndUpdate(
        { _id: "approver_id" },
        { $inc: { seq: 1 } },
        { returnDocument: "after", upsert: true, session }
      );

    const approver_id = counterResult.seq;

    if (!approver_id) {
      throw new Error("Failed to generate Task_Id.");
    }

    // --- Proceed to insert document ---
    const newDocument = new TmpForwardedApprover({
      approver_id,
      approver_reference,
      created_by,
      approver_type: "Case Withdrawal Approval",
      approve_status: [
        {
          status: "Open",
          status_date: currentDate,
          status_edit_by: created_by,
        },
      ],
      remark: [
        {
          remark,
          remark_date: currentDate,
          remark_edit_by,
        },
      ],
      approved_deligated_by: delegate_id,
    });

    await newDocument.save({ session });

    const caseResult = await Case_details.updateOne(
      { case_id: approver_reference },
      {
        $push: {
          case_status: {
            case_status: "Pending Case Withdrawal",
            status_reason: "Case send for Withdrawal Approval",
            created_dtm: currentDate,
            created_by: created_by,
            case_phase,
          },
        },
        $set: {
          case_current_status: "Pending Case Withdrawal",
          case_current_phase: case_phase,
        },
      },
      { session }
    );

    const dynamicParams = {
      approver_reference,
    };
    // --- Interaction Log ---
    const interactionResult = await createUserInteractionFunction({
      Interaction_ID: 18,
      User_Interaction_Type: "Pending approval for Case Withdraw",
      delegate_user_id: delegate_id,
      Created_By: created_by,
      User_Interaction_Status: "Open",
      User_Interaction_Status_DTM: currentDate,
      ...dynamicParams,
      session,
    });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Case withdrawal request added successfully",
      data: newDocument,
    });
  } catch (error) {
    // console.error("Error withdrawing case:", error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: error.message });
  }
};

export const List_All_Abondoned_Case_Logs = async (req, res) => {
  try {
    const { status, accountNumber, fromDate, toDate, page = 1 } = req.body;

    // Pagination settings
    const currentPage = Number(page);
    if (isNaN(currentPage) || currentPage < 1) {
      return res.status(400).json({
        status: "error",
        message: "Invalid page number",
      });
    }

    const limit = currentPage === 1 ? 10 : 30;
    const skip = currentPage === 1 ? 0 : 10 + (currentPage - 2) * 30;

    let query = {};

    // Date filtering
    if (fromDate && toDate) {
      query.createdAt = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }

    if (status) {
      query.case_current_status = status;
    } else {
      query.case_current_status = { $in: ["Abondoned", "Pending  Abondoned"] };
    }

    // Account number filter
    if (accountNumber) {
      query.account_no = String(accountNumber).trim();
    }

    const cases = await Case_details.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Case_details.countDocuments(query);

    const responseData = cases.map((caseItem) => {
      const abnormalStopArray = caseItem.abnormal_stop || [];
      const lastAbnormal =
        abnormalStopArray.length > 0
          ? abnormalStopArray[abnormalStopArray.length - 1]
          : "";

      return {
        caseId: caseItem.case_id,
        status: caseItem.case_current_status,

        amount: caseItem.current_arrears_amount,
        remark: lastAbnormal?.remark || "",
        abondonedBy: lastAbnormal?.done_by || "",
        abondonedOn: lastAbnormal?.done_on || "",
        approvedOn: lastAbnormal?.approved_on || "",
      };
    });
    console.log("Response Data:", responseData);
    return res.status(200).json({
      status: "success",
      message: "Abondoned cases retrieved successfully.",
      data: responseData,
      pagination: {
        total,
        page: currentPage,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    console.error("Error in List_All_Abondoned_Case_Logs:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
      errors: {
        exception: error.message,
      },
    });
  }
};

export const Task_for_Download_Abondoned = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { Created_by, status, accountNumber, fromDate, toDate } = req.body;

    if (!Created_by) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: "error",
        message: "Created_by is a required parameter.",
      });
    }

    const taskParams = {
      Template_Task_Id: 101,
      task_type: "Download Abondoned case list",
      Created_By: Created_by,
      task_status: "open",
      status,
      accountNumber,
      fromDate,
      toDate,
    };

    const result = await createTaskFunction(taskParams, session);

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json(result);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error in Task_for_Download_Abondoned:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error",
    });
  }
};

export const Create_Abondoned_case = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      approver_reference,
      remark,
      remark_edit_by,
      created_by,
      case_status,
    } = req.body;

    if (!approver_reference || !remark || !remark_edit_by || !created_by) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    const currentDate = new Date();
    const payload = { case_status };
    let case_phase = "";
    try {
      const response = await axios.post(
        "http://124.43.177.52:6000/app2/get_case_phase",
        payload
      );

      if (!response.data.case_phase) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: "case_phase not found in API response",
        });
      }
      case_phase = response.data.case_phase;
      console.log("case_phase:", case_phase);
    } catch (error) {
      console.error("Error during axios call:", error.message);
      if (error.response) {
        console.error("API Error Response:", error.response.data);
      }
      // Abort and end session on axios error
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({
        message: "Failed to get case_phase from external API",
        error: error.message,
      });
    }

    const delegate_id = await getApprovalUserIdService({
      case_phase,
      approval_type: "DRC Assign Approval",
    });

    const mongoConnection = await db.connectMongoDB();
    const counterResult = await mongoConnection
      .collection("collection_sequence")
      .findOneAndUpdate(
        { _id: "approver_id" },
        { $inc: { seq: 1 } },
        { returnDocument: "after", upsert: true, session }
      );

    const approver_id = counterResult.seq;

    if (!approver_id) {
      throw new Error("Failed to generate Task_Id.");
    }

    // --- Proceed to insert document ---
    const newDocument = new TmpForwardedApprover({
      approver_id,
      approver_reference,
      created_by,
      approver_type: "Case Withdrawal Approval",
      approve_status: [
        {
          status: "Open",
          status_date: currentDate,
          status_edit_by: created_by,
        },
      ],
      remark: [
        {
          remark,
          remark_date: currentDate,
          remark_edit_by,
        },
      ],
      approved_deligated_by: delegate_id,
    });

    await newDocument.save({ session });

    const caseResult = await Case_details.updateOne(
      { case_id: approver_reference },
      {
        $push: {
          case_status: {
            case_status: "Pending Case Withdrawal",
            status_reason: "Case send for Withdrawal Approval",
            created_dtm: currentDate,
            created_by: created_by,
            case_phase,
          },
        },
        $set: {
          case_current_status: "Pending Case Withdrawal",
          case_current_phase: case_phase,
        },
      },
      { session }
    );

    const dynamicParams = {
      approver_reference,
    };
    // --- Interaction Log ---
    const interactionResult = await createUserInteractionFunction({
      Interaction_ID: 18,
      User_Interaction_Type: "Pending approval for Case Withdraw",
      delegate_user_id: delegate_id,
      Created_By: created_by,
      User_Interaction_Status: "Open",
      User_Interaction_Status_DTM: currentDate,
      ...dynamicParams,
      session,
    });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Case withdrawal request added successfully",
      data: newDocument,
    });
  } catch (error) {
    // console.error("Error withdrawing case:", error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: error.message });
  }
};


export const List_All_Case_Closed_Log = async (req, res) => {
  try {
    const { account_no, phase,rtom, from_date, to_date, pages } = req.body;

  
    
    const pipeline = [];
    
    if (phase) {
      pipeline.push({ $match: { phase } });
    }
    if (account_no) {
      pipeline.push({ $match: { account_no } });
    }
    
    if (rtom) {
      pipeline.push({
        $match: {
          rtom: { $regex: `^${rtom.trim()}$`, $options: "i" }
        }
      });
    }
    const dateFilter = {};
    if (from_date) dateFilter.$gte = new Date(from_date);
    if (to_date) {
      const endOfDay = new Date(to_date);
      endOfDay.setHours(23, 59, 59, 999); 
      dateFilter.$lte = endOfDay;
    }
    if (Object.keys(dateFilter).length > 0) {
      pipeline.push({ $match: { created_dtm: dateFilter } });
    }


    let page = Number(pages);
    if (isNaN(page) || page < 1) page = 1;
    const limit = page === 1 ? 10 : 30;
    const skip = page === 1 ? 0 : 10 + (page - 2) * 30;
    pipeline.push({ $sort: { case_id: -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });
      

    const filtered_cases = await Case_details.aggregate(pipeline)
 

    const responseData = filtered_cases.map((caseData) => {
      return {
        case_id: caseData.case_id,
        account_no: caseData.account_no,
        status: caseData.case_current_status,
        rtom:caseData.rtom,
        created_dtm: caseData.created_on,
        phase: caseData.phase,
        
      };
    })
 console.log("Response Data:", responseData);
    if (responseData.length === 0) {
      return res.status(204).json({
        status: "error",
        message: "No matching  Case Closed Log found."
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Cases retrieved successfully.",
      data: responseData,
    });

  } catch (error) {
    console.error("Error fetching  Case Closed Log:", error.message);
    return res.status(500).json({
      status: "error",
      message: "There is an error "
    });
  }
};

export const Create_Task_For_Downloard_Case_Closed_List = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { Created_By, Phase, Case_Status, from_date, to_date, Case_ID } = req.body;

    if (!Created_By) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: "error",
        message: "created by is a required parameter.",
      });
    }

    
    const parameters = {  
     
      case_ID: Case_ID,
      Phase: Phase,
      Case_Status: Case_Status,
      from_date: from_date,
      to_date: to_date,
    };

     
    const taskData = {
      Template_Task_Id: 42,
      task_type: "Create task for Download Case Closed Log",
      ...parameters,
      Created_By,
      task_status: "open",
    };

     
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