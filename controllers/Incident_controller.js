import moment from "moment";
import db from "../config/db.js";
import mongoose from "mongoose";
import Incident_log from "../models/Incident_log.js";
import Task from "../models/Task.js";
import Task_Inprogress from "../models/Task_Inprogress.js";
import FileUploadLog from "../models/file_upload_log.js";
import fs from "fs";
import path from "path";
import { Request_Incident_External_information } from "../services/IncidentService.js";
import { createTaskFunction } from "../services/TaskService.js";
import User_Interaction_Log from "../models/User_Interaction_Log.js";
import User_Interaction_Progress_Log from "../models/User_Interaction_Progress_Log.js";
import Incident from "../models/Incident.js";
import Case_details from "../models/Case_details.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
// import { startOfDay, endOfDay } from "date-fns";
// import logger from "../utils/logger.js";

// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Validation function for Create_Task parameters
const validateCreateTaskParameters = (params) => {
  const { Incident_Log_Id, Account_Num } = params;

  if (!Incident_Log_Id || !Account_Num) {
    throw new Error(
      "Incident_Id and Account_Num are required parameters for Create_Task."
    );
  }

  if (typeof Account_Num !== "string") {
    throw new Error("Account_Num must be strings.");
  }

  return true;
};

/**
 * Inputs:
 * - Account_Num: String (required)
 * - DRC_Action: String (required) [collect arrears, collect arrears and CPE, collect CPE]
 * - Monitor_Months: Number (optional, default is 3)
 * - Created_By: String (required)
 * - Source_Type: String (required) [Pilot Suspended, Product Terminate, Special]
 * - Contact_Number: String (required only if DRC_Action is "collect CPE")
 * 
 * Success Result:
 * - Returns a success response with the created incident and associated task details.
 */
export const Create_Incident = async (req, res) => {

  const { Account_Num, DRC_Action, Monitor_Months, Created_By, Source_Type, Contact_Number, file_name_dump } = req.body;

  // Validate required fields
  if (!Account_Num || !DRC_Action || !Created_By || !Source_Type) {
    return res.status(400).json({
      status: "error",
      message: "All fields (Account_Num, DRC_Action, Monitor_Months, Created_By, Source_Type) are required.",
    });
  }

  const validActions = [
    "collect arrears",
    "collect arrears and CPE",
    "collect CPE",
  ];

  const validSourceTypes = [
    "Pilot Suspended",
    "Product Terminate",
    "Special",
  ];

  const session = await mongoose.startSession(); // Start a session for transaction
  try {
    session.startTransaction(); // Start the transaction

    const existingIncident = await Incident_log.findOne({ Account_Num });
    if (existingIncident) {
      return res.status(400).json({
        status: "error",
        code: "DUPLICATE_ACCOUNT",
        message: `An incident already exists for account number: ${Account_Num}.`,
      });
    }
    if (!validActions.includes(DRC_Action)) {
      return res.status(400).json({
        status: "error",
        message: `Invalid action. Allowed values are: ${validActions.join(
          ", "
        )}.`,
      });
    }
    if (!validSourceTypes.includes(Source_Type)) {
      return res.status(400).json({
        status: "error",
        message: `Invalid Source_Type. Allowed values are: ${validSourceTypes.join(
          ", "
        )}.`,
      });
    }

    const monitorMonths = Monitor_Months || 3; // Default Monitor_Months to 3 if null

    const mongoConnection = mongoose.connection;
    const counterResult = await mongoConnection.collection("collection_sequence").findOneAndUpdate(
      { _id: "Incident_Log_Id" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", session, upsert: true }
    );

    const Incident_Log_Id = counterResult.seq;

    const newIncidentData = {
      // Incident_Id: null,
      Incident_Log_Id,
      Account_Num,
      Incident_Status: "Incident Open",
      Actions: DRC_Action,
      Monitor_Months: monitorMonths,
      Created_By,
      Source_Type,
      Created_Dtm: moment().toDate(),
      file_name_dump
    };

    if (DRC_Action === "collect CPE" && Contact_Number) {
      newIncidentData.Contact_Number = Contact_Number;
    }

    const newIncident = new Incident_log(newIncidentData);
    await newIncident.save({ session });

    // try {
    //   await Request_Incident_External_information({
    //     Account_Num,
    //     Monitor_Months: monitorMonths,
    //   });
    // } catch (apiError) {
    //   console.error("Error calling external API:", apiError.message);
    //   await session.abortTransaction(); // Rollback transaction
    //   return res.status(500).json({
    //     status: "error",
    //     message: "Failed to request external incident information.",
    //   });
    // }
    const dynamicParams = {
      Incident_Log_Id,
      Account_Num,
    };
    try {
      const taskData = {
        Template_Task_Id: 9,
        task_type: "Extract data from data lake",
        Created_By,
        task_status: "open",
        ...dynamicParams,
      };

      validateCreateTaskParameters(taskData);
      await createTaskFunction(taskData, session);
    } catch (taskError) {
      console.error("Error creating task:", taskError.message);
      await session.abortTransaction(); // Rollback transaction
      return res.status(500).json({
        status: "error",
        message: "Failed to create task.",
        errors: {
          exception: taskError.message,
        },
      });
    }

    await session.commitTransaction(); // Commit transaction
    session.endSession(); // End session

    return res.status(201).json({
      status: "success",
      message: "Incident and task created successfully.",
      data: {
        Incident_Log_Id,
        Account_Num,
        DRC_Action,
        Monitor_Months: monitorMonths,
        Created_By,
        Source_Type,
        Created_Dtm: newIncident.Created_Dtm,
        ...(DRC_Action === "collect CPE" && { Contact_Number }),
      },
    });
  } catch (error) {
    console.error("Unexpected error during incident creation:", error);
    await session.abortTransaction(); // Rollback transaction on error
    session.endSession(); // End session
    return res.status(500).json({
      status: "error",
      message: "Failed to create incident.",
      errors: {
        exception: error.message,
      },
    });
  }
};

export const Reject_Case = async (req, res) => {
  try {
    const { Incident_Id, Reject_Reason, Rejected_By } = req.body;

    // Validate required fields
    if (!Incident_Id || !Reject_Reason || !Rejected_By) {
      return res.status(400).json({
        message: "Incident_Id, Reject_Reason, and Rejected_By are required fields.",
      });
    }

    // Start a session for the transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update Incident status
      const incidentUpdateResult = await Incident.findOneAndUpdate(
        { Incident_Id: Number(Incident_Id) }, // Ensure correct type
        {
          $set: {
            Incident_Status: "Incident Reject",
            Rejected_Reason: Reject_Reason,
            Rejected_By,
            Rejected_Dtm: new Date(),
          },
        },
        { new: true, session }
      );

      if (!incidentUpdateResult) {
        throw new Error("Incident not found or failed to update.");
      }

      // Update User_Interaction_Log
      const logUpdateResult = await User_Interaction_Log.findOneAndUpdate(
        {
          "parameters.Incident_Id": String(Incident_Id), // Ensure type matches the stored data
          Templete_User_Interaction_ID: 5,
          User_Interaction_Type: "Validate Incident",
        },
        {
          $set: {
            User_Interaction_Status: "close",
            User_Interaction_Status_DTM: new Date(), // Ensure this field is updated
            Rejected_Reason: Reject_Reason,
            Rejected_By,
          },
        },
        { new: true, session }
      );

      if (!logUpdateResult) {
        throw new Error("No matching record found in User_Interaction_Log.");
      }

      // Delete from User_Interaction_Progress_Log
      const progressLogDeleteResult = await User_Interaction_Progress_Log.findOneAndDelete(
        {
          "parameters.Incident_Id": String(Incident_Id), // Ensure type matches
          Templete_User_Interaction_ID: 5,
          User_Interaction_Type: "Validate Incident",
        },
        { session }
      );

      if (!progressLogDeleteResult) {
        throw new Error("No matching record found in User_Interaction_Progress_Log to delete.");
      }

      // Commit the transaction
      await session.commitTransaction();

      // Return success response
      res.status(200).json({
        message: "Incident rejected and status updated successfully.",
        updatedLog: logUpdateResult,
      });
    } catch (innerError) {
      // Abort the transaction on error
      await session.abortTransaction();
      console.error("Inner Transaction Error:", innerError.message);
      throw innerError;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Error rejecting the case:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


// Validation function for Create_Task parameters
const validateCreateTaskParametersForUploadDRSFile = (params) => {
  const { file_upload_seq, File_Name, File_Type } = params;
  if (!file_upload_seq || !File_Name || !File_Type) {
    throw new Error("file_upload_seq, File_Name, File_Type are required parameters for Create_Task.");
  }
  return true;
};

/**
 * Inputs:
 * - File_Name: String (required) - The name of the file to be uploaded.
 * - File_Type: String (required) - The type of the file (e.g., "Incident Creation").
 * - File_Content: String (required) - The content of the file to be uploaded.
 * - Created_By: String (required) - The user who is uploading the file.
 * 
 * Success Result:
 * - Returns a success response with file details and task creation information upon successful file upload and task creation.
 */
export const Upload_DRS_File = async (req, res) => {
  const { File_Name, File_Type, File_Content, Created_By } = req.body;

  if (!File_Name || !File_Type || !File_Content || !Created_By) {
    return res.status(400).json({
      status: "error",
      message: "All fields are required.",
    });
  }

  const validFileTypes = [
    "Incident Creation", "Incident Reject", "Distribute to DRC",
    "Validity Period Extend", "Hold", "Discard"
  ];


  if (!validFileTypes.includes(File_Type)) {
    return res.status(400).json({
      status: "error",
      message: `Invalid File Type. Allowed values are: ${validFileTypes.join(", ")}.`,
    });
  }

  const session = await mongoose.startSession(); // Start a transaction session
  session.startTransaction();

  try {
    const mongoConnection = await db.connectMongoDB();
    // Increment the counter for file_upload_seq
    const counterResult = await mongoConnection.collection("collection_sequence").findOneAndUpdate(
      { _id: "file_upload_seq" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true, session }
    );

    const file_upload_seq = counterResult.seq;

    // File upload handling
    // const uploadDir = path.join(__dirname, "/srv/uploads/inbox");
    const uploadDir = path.join("/", "srv", "uploads", "inbox");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const uploadPath = path.join(uploadDir, File_Name);
    fs.writeFileSync(uploadPath, File_Content, "utf8");

    const forwardedFileDir = path.join(__dirname, "../forwarded");
    if (!fs.existsSync(forwardedFileDir)) {
      fs.mkdirSync(forwardedFileDir, { recursive: true });
    }
    const forwardedFilePath = path.join(forwardedFileDir, File_Name);

    // Save file upload log within the transaction
    const newFileLog = new FileUploadLog({
      file_upload_seq,
      File_Name,
      File_Type,
      Uploaded_By: Created_By,
      Uploaded_Dtm: moment().toDate(),
      File_Path: uploadPath,
      Forwarded_File_Path: forwardedFilePath,
      File_Status: "Upload Open",
    });

    await newFileLog.save({ session });

    const parameters = {
      file_upload_seq,
      File_Name,
      File_Type,
    };

    // Create task within the transaction
    const taskData = {
      Template_Task_Id: 1,
      task_type: "Data upload from file",
      ...parameters,
      Created_By,
      task_status: "open",
    };

    validateCreateTaskParametersForUploadDRSFile(taskData);
    await createTaskFunction(taskData); // Ensure this supports transactions if needed

    // If everything is successful, commit the transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      status: "success",
      message: "File uploaded successfully, and task created.",
      data: {
        file_upload_seq,
        File_Name,
        File_Type,
        File_Path: uploadPath,
        Forwarded_File_Path: forwardedFilePath,
        File_Status: "Open",
        Created_By,
        Uploaded_Dtm: newFileLog.Uploaded_Dtm,
      },
    });
  } catch (error) {
    await session.abortTransaction(); // Rollback changes
    session.endSession();

    console.error("Error during file upload and task creation:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to upload file and create task.",
      errors: { exception: error.message },
    });
  }
};

 /**
 * Inputs:
 * - Actions: String (optional) - Filter by the type of action taken on the incident.
 * - Incident_Status: String (optional) - Filter by the current status of the incident.
 * - Source_Type: String (optional) - Filter by the source type of the incident (e.g., Internal, External).
 * - from_date: String (optional, ISO Date format) - Filter incidents starting from this date.
 * - to_date: String (optional, ISO Date format) - Filter incidents up to this date (inclusive).
 * - pages: Number (optional) - Page number for pagination. Defaults to 1. Page 1 returns 10 records, others return 30.
 * 
 * Success Result:
 * - Returns a success response with:
 *   - data: Array of incidents matching the provided filters. Each object includes:
 *     - incidentID: Number
 *     - status: String
 *     - accountNo: String
 *     - action: String
 *     - sourceType: String
 *     - created_dtm: Date
 *   - hasMore: Boolean indicating if more data is available for pagination.
 * 
 * Error Result:
 * - Returns an error response with status and message in case of failure.
 */


export const List_Incidents = async (req, res) => {
  try {
    const { 
      Actions, 
      Incident_Status, 
      Source_Type, 
      from_date, 
      to_date,
      pages 
    } = req.body;
 
    // Pagination settings
    let page = Number(pages);
    if (isNaN(page) || page < 1) page = 1;
    const limit = page === 1 ? 10 : 30;
    const skip = page === 1 ? 0 : 10 + (page - 2) * 30; 

    let query = {};

    // Date filtering
    const dateFilter = {};
    if (from_date) dateFilter.$gte = new Date(from_date);
    if (to_date) {
      const endOfDay = new Date(to_date);
      endOfDay.setHours(23, 59, 59, 999); 
      dateFilter.$lte = endOfDay;
    }
    if (Object.keys(dateFilter).length > 0) {
      query.created_dtm = dateFilter;
    }

    // Other filters
    if (Actions) query.Actions = Actions;
    if (Incident_Status) query.Incident_Status = Incident_Status;
    if (Source_Type) query.Source_Type = Source_Type;

    // Get total count for pagination info
   // const totalCount = await Incident_log.countDocuments(query);

    // Find incidents with pagination
    const incidents = await Incident_log.find(query)
      .sort({ 
        Incident_Log_Id: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

  

    // Transform data to match frontend expectations
    const responseData = incidents.map((incident) => {
      return { 
      incidentID: incident.Incident_Log_Id,
      status: incident.Incident_Status,
      accountNo: incident.Account_Num,
      action: incident.Actions,
      sourceType: incident.Source_Type,
      created_dtm: incident.Created_Dtm
    };
  })

    return res.status(200).json({
      status: "success",
      message: "Incidents retrieved successfully.",
      data: responseData,
     
      hasMore: incidents.length === limit
    });

  } catch (error) {
    console.error("Error in List_Incidents:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
      errors: {
        exception: error.message,
      },
    });
  }
};



const validateTaskParameters = (parameters) => {
  const { Incident_Status, StartDTM, EndDTM, Actions } = parameters;

  
  if (!Incident_Status || typeof Incident_Status !== "string") {
    throw new Error("Incident_Status is required and must be a string.");
  }

  
  if (StartDTM && isNaN(new Date(StartDTM).getTime())) {
    throw new Error("StartDTM must be a valid date string.");
  }

  if (EndDTM && isNaN(new Date(EndDTM).getTime())) {
    throw new Error("EndDTM must be a valid date string.");
  }

  if (!Actions || typeof Actions !== "string") {
    throw new Error("Actions is required and must be a string.");
  }

  return true;
};

export const Create_Task_For_Incident_Details = async (req, res) => {
  const session = await mongoose.startSession(); // Start session 
  session.startTransaction(); // Start transaction

  try {
    const { Incident_Status, From_Date, To_Date, Actions, Created_By } = req.body;

    // Validate paras
    if (!Created_By) {
      await session.abortTransaction(); // Rollback 
      session.endSession(); // End 
      return res.status(400).json({
        status: "error",
        message: "Created_By is a required parameter.",
      });
    }

    
    const parameters = {
      Incident_Status,
      StartDTM: From_Date ? new Date(From_Date).toISOString() : null,
      EndDTM: To_Date ? new Date(To_Date).toISOString() : null,
      Actions,
    };

    // Validate paras
    validateTaskParameters(parameters);

   
    const taskData = {
      Template_Task_Id: 12,
      task_type: "List Incident Details",
      parameters,
      Created_By,
      task_status: "open",
    };

    //  create task
    await createTaskFunction(taskData, session);

    await session.commitTransaction(); // Commit transaction
    session.endSession(); // End 

    return res.status(201).json({
      status: "success",
      message: "Task created successfully.",
      data: taskData,
    });
  } catch (error) {
    console.error("Error in Create_Task_For_Incident_Details:", error);
    await session.abortTransaction(); // Rollback error
    session.endSession(); // End 
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error.",
      errors: {
        exception: error.message,
      },
    });
  }
};

/**
 * Inputs:
 * - None (uses no request body or parameters)
 * 
 * Success Result:
 * - Returns a success response with the total count of incidents where Incident_Status is "Reject Pending" and Proceed_Dtm is null.
 */
export const total_F1_filtered_Incidents = async (req, res) => {
  try {
    const details = (await Incident.find({
     
      Incident_Status: { $in: ["Reject Pending"] },
      Proceed_Dtm: { $eq: null, $exists: true }, 
    })).length
  
    return res.status(200).json({
      status: "success",
      message: `Successfully retrieved the total of F1 filtered incidents.`,
      data: { F1_filtered_incident_total: details },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve the F1 filtered incident count.",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }
};

/**
 * Inputs:
 * - None (uses no request body or parameters)
 * 
 * Success Result:
 * - Returns a success response with the total count of incidents where Incident_Status is "Open No Agent" and Proceed_Dtm is null.
 */
export const total_distribution_ready_incidents = async (req, res) => {
  try {
    const details = (await Incident.find({
      Incident_Status: { $in: ["Open No Agent"] },
      Proceed_Dtm: { $eq: null, $exists: true }, 
    })).length
  
    return res.status(200).json({
      status: "success",
      message: `Successfully retrieved the total of F1 filtered incidents.`,
      data: { Distribution_ready_total: details },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve the F1 filtered incident count.",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }
};

export const incidents_CPE_Collect_group_by_arrears_band = async (req, res) => {
  try {
    const details = await Incident.find({
      Incident_Status: "Open CPE Collect",
    });

    const arrearsBandCounts = details.reduce((counts, detail) => {
      const band = detail.Arrears_Band;
      counts[band] = (counts[band] || 0) + 1;
      return counts;
    }, {});

    return res.status(200).json({
      status: "success",
      message: `Successfully retrieved CPE collect incident counts by arrears bands.`,
      data: { CPE_collect_incidents_by_AB: arrearsBandCounts },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message:
        "Failed to retrieve CPE collect incident counts by arrears bands",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }
};

export const incidents_Direct_LOD_group_by_arrears_band = async (req, res) => {
  try {
    const details = await Incident.find({
      Incident_Status: "Direct LOD",
    });

    const arrearsBandCounts = details.reduce((counts, detail) => {
      const band = detail.Arrears_Band;
      counts[band] = (counts[band] || 0) + 1;
      return counts;
    }, {});

    return res.status(200).json({
      status: "success",
      message: `Successfully retrieved Direct LOD incident counts by arrears bands.`,
      data: { Direct_LOD_incidents_by_AB: arrearsBandCounts },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve Direct LOD incident counts by arrears bands",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }
};

export const List_All_Incident_Case_Pending = async (req, res) => {
  try {
    const pendingStatuses = [
      "Open CPE Collect",
      "Direct LOD",
      "Reject Pending",
      "Open No Agent",
    ];

    const incidents = await Incident.find({
      Incident_Status: { $in: pendingStatuses },
    });

    return res.status(200).json({
      status: "success",
      message: "Pending incidents retrieved successfully.",
      data: incidents,
    });
  } catch (error) {
    console.error("Error fetching pending incidents:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "An unexpected error occurred.",
    });
  }
};

/**
 * Inputs:
 * - Source_Type: String (optional)
 * - From_Date: String (optional, ISO Date format)
 * - To_Date: String (optional, ISO Date format)
 * 
 * Success Result:
 * - Returns a success response with the list of 'Open CPE Collect' incidents matching the provided filters.
 */
export const List_Incidents_CPE_Collect = async (req, res) => {
  try {
    const {Source_Type, FromDate, ToDate}= req.body;
    
    const OpencpeStatuses = ["Open CPE Collect"];
    let incidents;
    
    if(!Source_Type && !FromDate && !ToDate){
      incidents = await Incident.find({
        Incident_Status: { $in: OpencpeStatuses },
        $or: [{ Proceed_Dtm: null }, { Proceed_Dtm: "" }],
        Proceed_Dtm: { $exists: true }
      }).sort({ Created_Dtm: -1 }) 
      .limit(10); 
    }else{
      const query = { Incident_Status: { $in: OpencpeStatuses },  $or: [{ Proceed_Dtm: null }, { Proceed_Dtm: "" }], Proceed_Dtm: { $exists: true } };
      if (Source_Type) {
        query.Source_Type = Source_Type;
      }
      if (FromDate && ToDate) {
        const from = new Date(FromDate)
        const to = new Date(ToDate)
        to.setHours(23, 59, 59, 999);
        query.Created_Dtm = {
          $gte: from,
          $lte: to,
        };
      }
      incidents = await Incident.find(query);
    }
    return res.status(200).json({
      status: "success",
      message: "Open CPE Collect incidents retrieved successfully.",
      data: incidents,
    });
  } catch (error) {
    console.error("Error fetching Direct LOD incidents:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "An unexpected error occurred.",
    });
  }
};

/**
 * Inputs:
 * - Source_Type: String (optional)
 * - FromDate: String (optional, ISO Date format)
 * - ToDate: String (optional, ISO Date format)
 * 
 * Success Result:
 * - Returns a success response with the list of "Direct LOD" incidents filtered by status, source type, and date range.
 */
export const List_incidents_Direct_LOD = async (req, res) => {

  try {
    const {Source_Type, FromDate, ToDate}= req.body;
    
    const directLODStatuses = ["Direct LOD"];
    let incidents;
    
    if(!Source_Type && !FromDate && !ToDate){
      incidents = await Incident.find({
        Incident_Status: { $in: directLODStatuses },
        $or: [{ Proceed_Dtm: null }, { Proceed_Dtm: "" }],
        Proceed_Dtm: { $exists: true }
      }).sort({ Created_Dtm: -1 }) 
      .limit(10); 
    }else{
      const query = { Incident_Status: { $in: directLODStatuses },  $or: [{ Proceed_Dtm: null }, { Proceed_Dtm: "" }], Proceed_Dtm: { $exists: true } };

      if (Source_Type) {
        query.Source_Type = Source_Type;
      }
      if (FromDate && ToDate) {
        const from = new Date(FromDate)
        const to = new Date(ToDate)
        to.setHours(23, 59, 59, 999);
        query.Created_Dtm = {
          $gte: from,
          $lte: to,
        };
      }
      incidents = await Incident.find(query);
    }
    return res.status(200).json({
      status: "success",
      message: "Direct LOD incidents retrieved successfully.",
      data: incidents,
    });
  } catch (error) {
    console.error("Error fetching Direct LOD incidents:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "An unexpected error occurred.",
    });
  }
};

/**
 * Inputs:
 * - Source_Type: String (optional)
 * - FromDate: String (optional, ISO Date format)
 * - ToDate: String (optional, ISO Date format)
 * 
 * Success Result:
 * - Returns a success response with a list of 'Reject Pending' incidents filtered by source type and/or date range.
 */
export const List_F1_filted_Incidents = async (req, res) => {
  try {
    const {Source_Type, FromDate, ToDate}= req.body;
    const rejectpendingStatuses = ["Reject Pending"];
    let incidents;
    
    if(!Source_Type && !FromDate && !ToDate){
      incidents = await Incident.find({
         Incident_Status: { $in: rejectpendingStatuses },
         $and: [
          { Proceed_Dtm: { $exists: true } },
          { Proceed_Dtm: { $in: [null, ""] } }
        ]
      }).sort({ Created_Dtm: -1 }) 
      .limit(10); 
    }else{
      const query = { Incident_Status: { $in: rejectpendingStatuses },  $or: [{ Proceed_Dtm: null }, { Proceed_Dtm: "" }] };

      if (Source_Type) {
        query.Source_Type = Source_Type;
      }
      if (FromDate && ToDate) {
        const from = new Date(FromDate);
        const to = new Date(ToDate);
        to.setHours(23, 59, 59, 999);
        
        query.Created_Dtm = {
          $gte: from,
          $lte: to,
        };
      }
      incidents = await Incident.find(query);
    }
   
    return res.status(200).json({
      status: "success",
      message: "F1 filtered incidents retrieved successfully.",
      data: incidents,
    });
  } catch (error) {
    console.error("Error fetching F1 filtered incidents:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "An unexpected error occurred.",
    });
  }
};

/**
 * Inputs:
 * - No inputs
 * 
 * Success Result:
 * - Returns a success response with the latest 10 incidents where status is "Open No Agent" and Proceed_Dtm is null.
 */
export const List_distribution_ready_incidents = async (req, res) => {
  
  try {
    const openNoAgentStatuses = ["Open No Agent"];

    const incidents = await Incident.find({
      Incident_Status: { $in: openNoAgentStatuses },
      Proceed_Dtm: { $eq: null, $exists: true }, 
    })
      .sort({ Created_Dtm: -1 });

    return res.status(200).json({
      status: "success",
      message: "Pending incidents retrieved successfully.",
      data: incidents,
    });
  } catch (error) {
    console.error("Error fetching pending incidents:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "An unexpected error occurred.",
    });
  }
};

export const F1_filtered_Incidents_group_by_arrears_band = async (req, res) => {
  try {
    const details = (await Incident.find({
      Incident_Status:"Reject Pending"
    }))

    const arrearsBandCounts = details.reduce((counts, detail) => {
      const band = detail.Arrears_Band;
      counts[band] = (counts[band] || 0) + 1; 
      return counts;
    }, {});
  
    return res.status(200).json({
      status: "success",
      message: `Successfully retrieved F1 filtered incident counts by arrears bands.`,
      data: {F1_Filtered_incidents_by_AB: arrearsBandCounts}
    })
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve F1 filtered incident counts by arrears bands",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }
}

/**
 * Inputs:
 * - No request body input required.
 * 
 * Success Result:
 * - Returns a success response with incident counts grouped by arrears bands where status is "Open No Agent" and Proceed_Dtm is null.
 */
export const distribution_ready_incidents_group_by_arrears_band = async (req, res) => {
  try {
    const details = (await Incident.find({
      Incident_Status:"Open No Agent",
      Proceed_Dtm: { $eq: null, $exists: true }, 
    }))
    
    const arrearsBandCounts = details.reduce((counts, detail) => {
      const band = detail.Arrears_Band;
      counts[band] = (counts[band] || 0) + 1; 
      return counts;
    }, {});
  
    return res.status(200).json({
      status: "success",
      message: `Successfully retrieved distribution ready incident counts by arrears bands.`,
      data: {Distribution_ready_incidents_by_AB: arrearsBandCounts}
    })
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve distribution ready incident counts by arrears bands",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }
}

/**
 * Inputs:
 * - None (uses no request body or parameters)
 * 
 * Success Result:
 * - Returns a success response with the total count of incidents where Incident_Status is "Open CPE Collect" and Proceed_Dtm is null.
 */
export const total_incidents_CPE_Collect = async (req, res) => {
  try {
    const details = (
      await Incident.find({
        Incident_Status: { $in: ["Open CPE Collect"] },
        Proceed_Dtm: { $eq: null, $exists: true }, 
       
      })
    ).length;

    return res.status(200).json({
      status: "success",
      message: `Successfully retrieved the total of CPE collect incidents.`,
      data: { Distribution_ready_total: details },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve the CPE collect incident count.",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }
};

/**
 * Inputs:
 * - None (uses no request body or parameters)
 * 
 * Success Result:
 * - Returns a success response with the total count of incidents where Incident_Status is "Direct LOD" and Proceed_Dtm is null.
 */
export const total_incidents_Direct_LOD = async (req, res) => {
  try {
    const details = (
      await Incident.find({
      
        Incident_Status: { $in: ["Direct LOD"] },
        Proceed_Dtm: { $eq: null, $exists: true }, 
      })
    ).length;

    return res.status(200).json({
      status: "success",
      message: `Successfully retrieved the total of Direct LOD incidents.`,
      data: { Distribution_ready_total: details },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve the Direct LOD incident count.",
      errors: {
        code: 500,
        description: error.message,
      },
    });

  }
};
/**
 * Inputs:
 * - Incident_Id: number (required)
 * - user: String (required)
 * 
 * Success Result:
 * - Returns a success response confirming the F1 filtered incident has been rejected.
 */
export const Reject_F1_filtered_Incident = async (req, res) => {
  try{
    const { Incident_Id, user } = req.body;

    if (!Incident_Id || !user) {
      return res.status(400).json({
        status:"error",
        message:"Incident_Id is a required field.",
        errors: {
          code: 400,
          description: "Incident_Id and user are required field.",
        },
      });
    }


    const incident = await Incident.findOne({ Incident_Id: Incident_Id});

    if (!incident) {
        return res.status(404).json({
           status:"error",
           message: 'Incident not found',
           errors: {
            code: 404,
            description: 'Incident not found',
          }
      });
    }
    await Incident.updateOne(
      { Incident_Id: Incident_Id},
      {
          $set: {
              Incident_Status: 'Incident Reject',
              Incident_Status_Dtm: new Date(),
              Proceed_Dtm: new Date(),
              Proceed_By: user
          },
      },
      
    );
    return res.status(200).json({
      status: "success",
      message: `Successfully rejected the F1 filtered incident.`
    });
  }catch(error){
    console.log(error)
    return res.status(500).json({
      status: "error",
      message: "Failed to rejected the F1 filtered incident.",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }
};

/**
 * Inputs:
 * - Incident_Id: number (required)
 * 
 * Success Result:
 * - Returns a success response indicating the F1 filtered incident was successfully forwarded and status updated.
 */
export const Forward_F1_filtered_incident = async (req, res) => {

  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
  const { Incident_Id, Incident_Forwarded_By } = req.body;
  if (!Incident_Id) {
    const error = new Error("Incident_Id is required.");
    error.statusCode = 400;
    throw error;
  }

  if (!Incident_Forwarded_By) {
    const error = new Error("Incident_Forwarded_By is required.");
    error.statusCode = 400;
    throw error;
  }
  const incidentData = await Incident.findOne({ Incident_Id }).session(session);

  if (!incidentData) {
    await session.abortTransaction();
    session.endSession();
    return res.status(404).json({ 
      status: "error",
      message: "Incident not found",
      errors: {
        code: 404,
        description: "No matching incident found.",
      },
    });
  }
  let incidentStatus;

  if(incidentData.Arrears>=5000){
    incidentStatus="Open No Agent"
  }else if(incidentData.Arrears>=1000 && incidentData.Arrears <5000){
     incidentStatus="Direct LOD"
  }else if( incidentData.Arrears<1000){
    incidentStatus="Open CPE Collect"
  }

  await Incident.updateOne(
    { Incident_Id},
      {
        $set: {
          Incident_Status: incidentStatus,
          Incident_Status_Dtm: new Date(),
          Incident_Forwarded_By,
          Incident_Forwarded_On: new Date(),
        },
      },
      {session}
  );
  await session.commitTransaction();
  session.endSession();

  return res.status(201).json({ 
    status: "success",
    message: "F1 filtered incident successfully forwarded" 
  });

} catch (error) {
  await session.abortTransaction();
  session.endSession();
  
  console.error("Error forwarding F1 filtered incident: ", error);
  return res.status(error.statusCode || 500).json({
    status: "error",
    message: error.message || "Internal server error",
    errors: {
      code: error.statusCode || 500,
      description: error.message || "An unexpected error occurred.",
    },
  });
}
};

const generateCaseId = async (session) => {
  const mongoConnection = mongoose.connection;
  const counterResult = await mongoConnection.collection("collection_sequence").findOneAndUpdate(
    { _id: "case_id" },
    { $inc: { seq: 1 } },
    { returnDocument: "after", session, upsert: true }
  );
  return counterResult.seq;
};

//should be check again
export const Create_Case_for_incident= async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { Incident_Ids ,Proceed_By} = req.body;

    
    if (!Array.isArray(Incident_Ids) || Incident_Ids.length === 0) {
      return res.status(400).json({ error: 'Incident_Ids array is required with at least one element' });
    }

    if (!Proceed_By) {
      const error = new Error("Proceed_By is required.");
      error.statusCode = 400;
      throw error;
    }
    const createdCases = [];
    
    //10 
    const maxRounds = Math.min(Incident_Ids.length, 5);

    for (let i = 0; i < maxRounds; i++) {
      const incidentId = Incident_Ids[i];

      const incidentData = await Incident.findOne({ Incident_Id: incidentId });
      if (!incidentData) {
        continue; 
      }

      incidentData.Proceed_By = Proceed_By;
      incidentData.Proceed_Dtm = new Date();
      await incidentData.save({ session });
     
      const caseId = await generateCaseId(session);

      const caseData = {
        case_id: caseId,
        incident_id: incidentData.Incident_Id,
        account_no: incidentData.Account_Num || "Unknown",
        customer_ref: incidentData.Customer_Details?.Customer_Name || "N/A",
        created_dtm: new Date(),
        implemented_dtm: incidentData.Created_Dtm || new Date(),
        area: incidentData.Region || "Unknown",
        rtom: incidentData.Product_Details[0]?.Service_Type || "Unknown",
        current_arrears_band: incidentData.current_arrears_band || "Default Band",  
        arrears_band: incidentData.Arrears_Band || "Default Band",
        bss_arrears_amount: incidentData.Arrears || 0,
        current_arrears_amount: incidentData.Arrears || 0,
        action_type: "New Case",
        drc_commision_rule: incidentData.drc_commision_rule || "PEO TV",  
        last_payment_date: incidentData.Last_Actions?.Payment_Created || new Date(),
        monitor_months: 6,
        last_bss_reading_date: incidentData.Last_Actions?.Billed_Created || new Date(),
        commission: 0,
        Proceed_By: incidentData.Proceed_By || "user",
        case_current_phase:"Register",
        case_current_status: "Open No Agent",
        filtered_reason: incidentData.Filtered_Reason || null,
        ref_products: incidentData.Product_Details.length > 0
          ? incidentData.Product_Details.map(product => ({
              service: product.Service_Type || "Unknown",
              product_label: product.Product_Label || "N/A",
              product_status: product.product_status || "Active",
              status_Dtm: product.Effective_Dtm || new Date(),
              rtom: product.Region || "N/A",
              product_ownership: product.Equipment_Ownership || "Unknown",
              service_address: product.Service_Address || "N/A",
            }))
          : [{
              service: "Default Service",
              product_label: "Default Product",
              product_status: "Active",
              status_Dtm: new Date(),
              rtom: "Default RTOM",
              product_ownership: "Unknown",
              service_address: "Default Address",
            }],
      };      

      try {
        const newCase = new Case_details(caseData);
        await newCase.save({ session });
        createdCases.push(newCase);
      } catch (validationError) {
        await session.abortTransaction();
        return res.status(400).json({status: "error", error: "Validation failed", message: "There is an error while inserting to the case details document"});
      }
      
      const newCaseStatus = {
        case_status: "Open No Agent", 
        status_reason: "Incident forward to case",  
        created_dtm: new Date(),  
        created_by: Proceed_By,   
        case_phase: "Register",
      };
      newCase.case_status.push(newCaseStatus); 
      await newCase.save({ session });
      createdCases.push(newCase);
    }
  
    await session.commitTransaction();
    res.status(201).json({
      status:"success",
      message: `Successfully created ${createdCases.length} cases.`,
      cases: createdCases,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error creating cases:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    session.endSession();
  }
};




export const Forward_Direct_LOD = async (req, res) => {

    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
    const { Incident_Id, user } = req.body;
    if (!Incident_Id) {
      const error = new Error("Incident_Id is required.");
      error.statusCode = 400;
      throw error;
    }
  
    const incidentData = await Incident.findOne({ Incident_Id }).session(session);

    if (!incidentData) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        status: "error",
        message: "Incident not found",
        errors: {
          code: 404,
          description: "No matching incident found.",
        },
      });
    }

    const counterResult = await mongoose.connection.collection("collection_sequence").findOneAndUpdate(
      { _id: "case_id" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", session, upsert: true }
    );

    const Case_Id = counterResult.seq;
   
    const caseData = {
      case_id: Case_Id,
      incident_id: incidentData.Incident_Id,
      account_no: incidentData.Account_Num || "Unknown", 
      customer_ref: incidentData.Customer_Details?.Customer_Name || "N/A",
      created_dtm: new Date(),
      implemented_dtm: incidentData.Created_Dtm || new Date(),
      area: incidentData.Region || "Unknown",
      rtom: incidentData.Product_Details[0]?.Service_Type || "Unknown",
      arrears_band: incidentData.Arrears_Band || "Default Band",
      bss_arrears_amount: incidentData.Arrears || 0,
      current_arrears_amount: incidentData.Arrears || 0,
      current_arrears_band: incidentData.current_arrears_band || "Default Band",
      action_type: "Forward to CPE Collect",
      drc_commision_rule: incidentData.drc_commision_rule || "PEO TV",
      last_payment_date: incidentData.Last_Actions?.Payment_Created || new Date(),
      monitor_months: 6,
      last_bss_reading_date: incidentData.Last_Actions?.Billed_Created || new Date(),
      commission: 0,
     // case_current_status: incidentData.Incident_Status,
      case_current_status: "LIT",
      case_current_phase:"",
      filtered_reason: incidentData.Filtered_Reason || null,
      ref_products: incidentData.Product_Details.map(product => ({
        service: product.Service_Type || "Unknown",
        product_label: product.Product_Label || "N/A",
        product_status: product.Product_Status || "Active",
        status_Dtm: product.Effective_Dtm || new Date(),
        rtom: product.Region || "N/A",
        product_ownership: product.Equipment_Ownership || "Unknown",
        service_address: product.Service_Address || "N/A",
      })) || [],
      case_status: {
        case_status: "LIT",
        status_reason: "Forward Direct LOD",
        created_dtm: new Date(),
        created_by: user,
        case_phase:""
      }
    };
    
    try {
      const newCase = new Case_details(caseData);
      await newCase.save({ session });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        status: "error",
        message: "There is an error while inserting to the case details document" 
      });
    }
    await Incident.updateOne(
      { Incident_Id },
      { $set:{ Proceed_Dtm: new Date(), Proceed_By: user } },
      { session }
    );
    await session.commitTransaction();
    session.endSession();
    return res.status(201).json({ 
      status: "success",
      message: "Direct LOD incident successfully forwarded" 
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error forwarding Direct LOD incident: ", error);
    return res.status(error.statusCode || 500).json({
      status: "error",
      message: error.message || "Internal server error",
      errors: {
        code: error.statusCode || 500,
        description: error.message || "An unexpected error occurred.",
      },
    });
  }
};

/**
 * Inputs:
 * - Incident_Id: number (required)
 * - Proceed_By: String (required)
 * 
 * Success Result:
 * - Returns a success response after forwarding the incident to CPE Collect and creating a related case entry.
 */
export const Forward_CPE_Collect = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { Incident_Id,Proceed_By } = req.body;
    if (!Incident_Id) {
      const error = new Error("Incident_Id is required.");
      error.statusCode = 400; 
      throw error;
    }

    if (!Proceed_By) {
      const error = new Error("Proceed_By is required.");
      error.statusCode = 400;
      throw error;
    }
    const incidentData = await Incident.findOne({ Incident_Id }).session(session);

    if (!incidentData) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        status: "error",
        message: "Incident not found",
        errors: {
          code: 404,
          description: "No matching incident found.",
        },
      });
    }

    const counterResult = await mongoose.connection.collection("collection_sequence").findOneAndUpdate(
      { _id: "case_id" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", session, upsert: true }
    );
    const Case_Id = counterResult.seq;
    const caseData = {
      case_id: Case_Id,
      incident_id: incidentData.Incident_Id,
      account_no: incidentData.Account_Num || "Unknown", 
      customer_ref: incidentData.Customer_Details?.Customer_Name || "N/A",
      created_dtm: new Date(),
      implemented_dtm: incidentData.Created_Dtm || new Date(),
      area: incidentData.Region || "Unknown",
      rtom: incidentData.Product_Details[0]?.Service_Type || "Unknown",
      arrears_band: incidentData.Arrears_Band || "Default Band",
      bss_arrears_amount: incidentData.Arrears || 0,
      current_arrears_amount: incidentData.Arrears || 0,
      current_arrears_band: incidentData.current_arrears_band || "Default Band",
      action_type: "Forward to CPE Collect",
      drc_commision_rule: incidentData.drc_commision_rule || "PEO TV",
      last_payment_date: incidentData.Last_Actions?.Payment_Created || new Date(),
      monitor_months: 6,
      Proceed_By: incidentData.Proceed_By || "user",
      last_bss_reading_date: incidentData.Last_Actions?.Billed_Created || new Date(),
      commission: 0,
      case_current_status: "Open No Agent",
      case_current_phase:"Register",
      filtered_reason: incidentData.Filtered_Reason || null,
      ref_products: incidentData.Product_Details.map(product => ({
        service: product.Service_Type || "Unknown",
        product_label: product.Product_Label || "N/A",
        product_status: product.Product_Status || "Active",
        status_Dtm: product.Effective_Dtm || new Date(),
        rtom: product.Region || "N/A",
        product_ownership: product.Equipment_Ownership || "Unknown",
        service_address: product.Service_Address || "N/A",
      })) || [],
      case_status: {
        case_status: "Open No Agent", 
        status_reason: "Incident forwarded to CPE Collect",  
        created_dtm: new Date(),
        created_by: Proceed_By,
        case_phase:"Register",
      }
    };
    try {
      const newCase = new Case_details(caseData);
      await newCase.save({ session });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        status: "error",
        message: "There is an error while inserting to the case details document" 
      });
    }
    await Incident.updateOne(
      { Incident_Id },
      { $set:{ Proceed_Dtm: new Date(), Proceed_By: Proceed_By } },
      { session }
    );
    await session.commitTransaction();
    session.endSession();
    return res.status(201).json({ 
      status: "success",
      message: "CPE Collect incident successfully forwarded"
    });
  }catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error forwarding CPE Collect incident:", error);
    return res.status(error.statusCode || 500).json({
      status: "error",
      message: error.message || "Internal server error",
      errors: {
        code: error.statusCode || 500,
        description: error.message || "An unexpected error occurred."
      }
    });
  }
};

/**
 * Inputs:
 * - Action_Type: String (optional)
 * - FromDate: String (optional, ISO Date format)
 * - ToDate: String (optional, ISO Date format)
 * 
 * Success Result:
 * - Returns a success response with the list of rejected incidents matching the provided filters.
 */
export const List_Reject_Incident = async (req, res) => {

  try {
    const {Action_Type, FromDate, ToDate}= req.body;
    
    const rejectIncidentStatuses = ["Incident Reject"];
    let incidents;
    
    if(!Action_Type && !FromDate && !ToDate){
      incidents = await Incident.find({
        Incident_Status: { $in: rejectIncidentStatuses }
      }).sort({ Created_Dtm: -1 }) 
      .limit(10); 
    }else{
      const query = { Incident_Status: { $in: rejectIncidentStatuses }};

      if (Action_Type) {
        query.Actions = Action_Type;
      }
      if (FromDate && ToDate) {
        const from = new Date(FromDate)
        const to = new Date(ToDate)
        to.setHours(23, 59, 59, 999); // Set to end of the day
        query.Created_Dtm = {
          $gte: from,
          $lte: to,
        };
      }
      incidents = await Incident.find(query);
    }
    return res.status(200).json({
      status: "success",
      message: "Rejected incidents retrieved successfully.",
      data: incidents,
    });
  } catch (error) {
    console.error("Error fetching rejected incidents:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "An unexpected error occurred.",
    });
  }
}


export const getOpenTaskCountforCPECollect = async (req, res) => {
  
  const Template_Task_Id = 17;
  const task_type = "Create Case from Incident Open CPE Collect";

  try {
    // Check existence in both models
    const taskExists = await Task.exists({ Template_Task_Id, task_type });
    const taskInProgressExists = await Task_Inprogress.exists({ Template_Task_Id, task_type });

    if (taskExists && taskInProgressExists) {
      // Count tasks with task_status 'open' in both models
      const countInTask = await Task.countDocuments({ Template_Task_Id, task_type, task_status: 'open' });
      const countInTaskInProgress = await Task_Inprogress.countDocuments({ Template_Task_Id, task_type, task_status: 'open' });

      // Total count from both models
      const totalCount = countInTask + countInTaskInProgress;

      return res.status(200).json({ openTaskCount: totalCount });
    }

    // If records are not present in both models
    return res.status(404).json({ message: 'Records not found in both models' });
  } catch (error) {
    console.error('Error fetching open task count:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



/**
 * Inputs:
 * - From_Date: String (optional, ISO Date format)
 * - To_Date: String (optional, ISO Date format)
 * - status: String (optional)
 * 
 * Success Result:
 * - Returns a success response with the list of file upload logs matching the provided filters, or the most recent 10 logs if no filters are applied.
 */
export const List_Transaction_Logs_Upload_Files = async (req, res) => {
  const { From_Date, To_Date, status } = req.body;

  try {
    let query = {};
    let isFiltered = false;

    if (From_Date || To_Date || status) {
      isFiltered = true;
      
      if (From_Date || To_Date) {
        query.Uploaded_Dtm = {};
        
        if (From_Date) {
          const fromDate = new Date(From_Date);
          fromDate.setHours(0, 0, 0, 0);
          if (!isNaN(fromDate.getTime())) {
            query.Uploaded_Dtm.$gte = fromDate;
          }
        }
        
        if (To_Date) {
          const toDate = new Date(To_Date);
          toDate.setHours(23, 59, 59, 999);
          if (!isNaN(toDate.getTime())) {
            query.Uploaded_Dtm.$lte = toDate;
          }
        }
      }

      if (status) {
        query.File_Status = status;
      }
    }

   
    let logs;
    if (isFiltered) {
      logs = await FileUploadLog.find(query)
        .sort({ Uploaded_Dtm: -1 });
    } else {
      
      logs = await FileUploadLog.find(query)
        .sort({ Uploaded_Dtm: -1 })
        .limit(10);
    }

    if (logs.length === 0) {
      return res.status(200).json({ 
        status: "success",
        message: "No file upload logs found for the given criteria.",
        data: []
      });
    }

    return res.status(200).json({
      status: "success",
      message: "File upload logs retrieved successfully",
      data: logs
    });
  } catch (error) {
    console.error("Error retrieving file upload logs:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }
};

export const Task_for_Download_Incidents = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { Actions, Incident_Status, Source_Type, From_Date, To_Date, Created_By } = req.body;
    if (!From_Date || !To_Date || !Created_By ) {
      return res.status(400).json({ error: "Missing required parameters: From Date, To Date, Created By" });
    }
    const taskData = {
      Template_Task_Id: 20,  
      task_type: "Create Incident list for download",
      parameters: {
          Actions,
          Incident_Status,
          Source_Type,
          From_Date,
          To_Date,
      },
      Created_By,
      Execute_By: "SYS",
      task_status: "open",
      created_dtm: new Date(),
    };
    const ResponseData = await createTaskFunction(taskData, session);
    console.log("Task created successfully:", ResponseData);
    await session.commitTransaction();
    session.endSession();
    return res.status(201).json({
      message: "Task created successfully",
       ResponseData,
    });
  } catch (error) {
    console.error("Error creating the task:", error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      message: "Error creating the task",
      error: error.message || "Internal server error.",
    });
  }finally {
    session.endSession();
  }
};
