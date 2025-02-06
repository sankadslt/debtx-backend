import moment from "moment";
import db from "../config/db.js";
import mongoose from "mongoose";
import Incident_log from "../models/Incident_log.js";
import Task from "../models/Task.js";
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
// import logger from "../utils/logger.js";

// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// export const Create_Incident = async (req, res) => {
//   const { Account_Num, DRC_Action, Monitor_Months, Created_By } = req.body;

//   try {
//     // Validate required fields
//     if (!Account_Num || !DRC_Action || !Monitor_Months || !Created_By) {
//       return res.status(400).json({
//         status: "error",
//         message: "All fields are required.",
//       });
//     }

//     // Validate Account_Num length
//     if (Account_Num.length > 10) {
//       return res.status(400).json({
//         status: "error",
//         message: "Account number must be 10 characters or fewer.",
//       });
//     }
//     // Validate Actions against enum values
//     const validActions = ["collect arrears", "collect arrears and CPE", "collect CPE"];
//     if (!validActions.includes(DRC_Action)) {
//       return res.status(400).json({
//         status: "error",
//         message: `Invalid action. Allowed values are: ${validActions.join(", ")}.`,
//       });
//     }

//     // // Check if an active case exists for the Account_Num
//     // const activeCase = await Incident_log.findOne({
//     //   Account_Num,
//     //   Actions: "Active", // Assuming this checks for active cases
//     // });

//     // if (activeCase) {
//     //   return res.status(400).json({
//     //     status: "error",
//     //     message: "An active case already exists for the provided account number.",
//     //   });
//     // }
//     // Set default Monitor_Months if not provided
//     if (!Monitor_Months) {
//       Monitor_Months = 3;
//     }

//     // Validate Monitor_Months range
//     if (Monitor_Months < 1 || Monitor_Months > 3) {
//       return res.status(400).json({
//         status: "error",
//         message: "Monitor_Months must be between 1 and 3.",
//       });
//     }
//     // Generate a new Incident_Id
//     const mongoConnection = await mongoose.connection;
//     const counterResult = await mongoConnection.collection("counters").findOneAndUpdate(
//       { _id: "incident_id" },
//       { $inc: { seq: 1 } },
//       { returnDocument: "after", upsert: true }
//     );

//     const Incident_Id = counterResult.seq;

//     // Insert values into Incident_log
//     const newIncident = new Incident_log({
//       Incident_Id,
//       Account_Num,
//       Actions: DRC_Action,
//       Monitor_Months, // Add Monitor_Months
//       Created_By,
//       Created_Dtm: moment().toDate(),
//     });

//     await newIncident.save();

//     // Call external API: Request_Incident_External_information
//     try {
//       await Request_Incident_External_information({ Account_Num, Monitor_Months });
//     } catch (apiError) {
//       console.error("Error calling external API:", apiError.message);
//       return res.status(500).json({
//         status: "error",
//         message: "Failed to request external incident information.",
//       });
//     }

//     // Create task: "Extract data from data lake" (Template_Task_Id: 9)
//     const mongo = await db.connectMongoDB();
//     const TaskCounter = await mongo.collection("counters").findOneAndUpdate(
//       { _id: "task_id" }, // Counter ID for task generation
//       { $inc: { seq: 1 } }, // Increment the sequence
//       { returnDocument: "after", upsert: true }
//     );

//     const Task_Id = TaskCounter.seq; // Get the generated Task_Id

//     const taskData = {
//       Task_Id, // Unique Task_Id
//       Template_Task_Id: 9, // ID for "Extract data from data lake"
//       parameters: {
//         Incident_Id: Incident_Id.toString(), // Store values as strings for Map type
//         Account_Num: Account_Num,
//       },
//       Created_By, // The user who initiated the task
//       Execute_By: "SYS", // Default to null
//       Sys_Alert_ID: null,
//       Interaction_ID_Success: null,
//       Interaction_ID_Error: null,
//       Task_Id_Error: null,
//       created_dtm: new Date(), // Current timestamp
//       end_dtm: null, // Default to null
//       task_status: "open",
//       status_changed_dtm: null,
//       status_description: "",
//     };

//     // Insert task into the database
//     await Task.create(taskData);

//     return res.status(201).json({
//       status: "success",
//       message: "Incident created successfully.",
//       data: {
//         Incident_Id,
//         Account_Num,
//         DRC_Action,
//         Monitor_Months, // Include in the response
//         Created_By,
//         Created_Dtm: newIncident.Created_Dtm,
//       },
//     });
//   } catch (error) {
//     console.error("Unexpected error during incident creation:", error);
//     return res.status(500).json({
//       status: "error",
//       message: "Failed to create incident.",
//       errors: {
//         exception: error.message,
//       },
//     });
//   }
// };
// Helper function to log elapsed time
// Helper function to log elapsed time
// const logElapsedTime = (action, startTime, endTime = Date.now()) => {
//   const start = new Date(startTime).toISOString();
//   const end = new Date(endTime).toISOString();
//   const elapsed = endTime - startTime;

//   logger.info({
//     message: `${action}: ${start} - ${end}`,
//     elapsed: `${elapsed}ms`,
//   });
// };

// Validation function for Create_Task parameters
const validateCreateTaskParameters = (params) => {
  const { Incident_Id, Account_Num } = params;

  if (!Incident_Id || !Account_Num) {
    throw new Error(
      "Incident_Id and Account_Num are required parameters for Create_Task."
    );
  }

  if (typeof Account_Num !== "string") {
    throw new Error("Account_Num must be strings.");
  }

  return true;
};

export const Create_Incident = async (req, res) => {

  const { Account_Num, DRC_Action, Monitor_Months, Created_By, Source_Type, Contact_Number } = req.body;

  // Validate required fields
  if (!Account_Num || !DRC_Action || !Created_By || !Source_Type) {
    return res.status(400).json({
      status: "error",
      message: "All fields (Account_Num, DRC_Action, Monitor_Months, Created_By, Source_Type) are required.",
    });
  }

  if (DRC_Action === "collect CPE" && !Contact_Number) {
    return res.status(400).json({
      status: "error",
      message: "Contact_Number is required when DRC_Action is 'collect CPE'.",
    });
  }

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

    const validActions = [
      "collect arrears",
      "collect arrears and CPE",
      "collect CPE",
    ];
    if (!validActions.includes(DRC_Action)) {
      return res.status(400).json({
        status: "error",
        message: `Invalid action. Allowed values are: ${validActions.join(
          ", "
        )}.`,
      });
    }

    const validSourceTypes = [
      "Pilot Suspended",
      "Product Terminate",
      "Special",
    ];
    if (!validSourceTypes.includes(Source_Type)) {
      return res.status(400).json({
        status: "error",
        message: `Invalid Source_Type. Allowed values are: ${validSourceTypes.join(
          ", "
        )}.`,
      });
    }

    const monitorMonths = Monitor_Months || 3; // Default Monitor_Months to 3 if null

    const mongoConnection = await mongoose.connection;
    const counterResult = await mongoConnection.collection("counters").findOneAndUpdate(
      { _id: "incident_id" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", session, upsert: true }
    );

    const Incident_Id = counterResult.seq;

    const newIncidentData = {
      Incident_Id,
      Account_Num,
      Incident_Status: "Incident Open",
      Actions: DRC_Action,
      Monitor_Months: monitorMonths,
      Created_By,
      Source_Type,
      Created_Dtm: moment().toDate(),
    };

    if (DRC_Action === "collect CPE") {
      newIncidentData.Contact_Number = Contact_Number;
    }

    const newIncident = new Incident_log(newIncidentData);
    await newIncident.save({ session });

    try {
      await Request_Incident_External_information({
        Account_Num,
        Monitor_Months: monitorMonths,
      });
    } catch (apiError) {
      console.error("Error calling external API:", apiError.message);
      await session.abortTransaction(); // Rollback transaction
      return res.status(500).json({
        status: "error",
        message: "Failed to request external incident information.",
      });
    }

    try {
      const taskData = {
        Template_Task_Id: 9,
        task_type: "Extract data from data lake",
        Created_By,
        Incident_Id,
        Account_Num,
        task_status: "open",
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
        Incident_Id,
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




// export const Reject_Case = async (req, res) => {
//   try {
//     const { Incident_Id, Reject_Reason, Rejected_By } = req.body;

//     if (!Incident_Id || !Reject_Reason || !Rejected_By) {
//       return res.status(400).json({
//         message:
//           "Incident_Id, Reject_Reason, and Rejected_By are required fields.",
//       });
//     }

//     const incidentUpdateResult = await Incident.findOneAndUpdate(
//       { Incident_Id },
//       {
//         $set: {
//           Incident_Status: "Incident Reject",
//           Rejected_Reason: Reject_Reason,
//           Rejected_By,
//           Rejected_Dtm: new Date(),
//         },
//       },
//       { new: true }
//     );

//     if (!incidentUpdateResult) {
//       return res.status(404).json({ message: "Incident not found." });
//     }

//     const caseUserInteractionUpdateResult =
//       await System_Case_User_Interaction.findOneAndUpdate(
//         { Case_User_Interaction_id: 5, "parameters.Incident_ID": Incident_Id },
//         {
//           $set: {
//             User_Interaction_status: "close",
//             User_Interaction_status_changed_dtm: new Date(),
//           },
//         },
//         { new: true }
//       );

//     if (!caseUserInteractionUpdateResult) {
//       return res
//         .status(404)
//         .json({ message: "System Case User Interaction not found." });
//     }

//     res.status(200).json({
//       message: "Incident rejected and status updated successfully.",
//       incident: incidentUpdateResult,
//       caseUserInteraction: caseUserInteractionUpdateResult,
//     });
//   } catch (error) {
//     console.error("Error rejecting the case:", error);
//     res
//       .status(500)
//       .json({ message: "Internal Server Error", error: error.message });
//   }
// };


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

// export const Reject_Case = async (req, res) => {
//   try {
//     const { Incident_Id, Reject_Reason, Rejected_By } = req.body;

//     // Validate required fields
//     if (!Incident_Id || !Reject_Reason || !Rejected_By) {
//       return res.status(400).json({
//         message: "Incident_Id, Reject_Reason, and Rejected_By are required fields.",
//       });
//     }

//     // Log the query filter for debugging
//     console.log('Query Filter:', { Incident_Id });
//     console.log('Type of Incident_Id:', typeof Incident_Id);

//     // Start a session for the transaction
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//       // Update Incident status
//       const incidentUpdateResult = await Incident.findOneAndUpdate(
//         { Incident_Id: Number(Incident_Id) }, // Ensure correct type
//         {
//           $set: {
//             Incident_Status: "Incident Reject",
//             Rejected_Reason: Reject_Reason,
//             Rejected_By,
//             Rejected_Dtm: new Date(),
//           },
//         },
//         { new: true, session }
//       );

//       console.log('Incident Update Result:', incidentUpdateResult);

//       if (!incidentUpdateResult) {
//         throw new Error("Incident not found or failed to update.");
//       }

//       // Update User_Interaction_Log
//       const logUpdateResult = await User_Interaction_Log.findOneAndUpdate(
//         {
//           "parameters.Incident_Id": Incident_Id,
//           Templete_User_Interaction_ID: 5,
//           User_Interaction_Type: "Validate Incident",
//         },
//         {
//           $set: {
//             User_Interaction_Status: "close",
//             User_Interaction_Status_DTM: new Date(),
//             Rejected_Reason: Reject_Reason,
//             Rejected_By,
//           },
//         },
//         { new: true, session }
//       );

//       if (!logUpdateResult) {
//         throw new Error("No matching record found in User_Interaction_Log.");
//       }

//       // Delete from User_Interaction_Progress_Log
//       const progressLogDeleteResult = await User_Interaction_Progress_Log.findOneAndDelete(
//         {
//           "parameters.Incident_Id": Incident_Id,
//           Templete_User_Interaction_ID: 5,
//           User_Interaction_Type: "Validate Incident",
//         },
//         { session }
//       );

//       if (!progressLogDeleteResult) {
//         throw new Error("No matching record found in User_Interaction_Progress_Log to delete.");
//       }

//       // Commit the transaction
//       await session.commitTransaction();

//       // Return success response
//       res.status(200).json({
//         message: "Incident rejected and status updated successfully.",
//         updatedLog: logUpdateResult,
//       });
//     } catch (innerError) {
//       // Abort the transaction on error
//       await session.abortTransaction();
//       throw innerError;
//     } finally {
//       session.endSession();
//     }
//   } catch (error) {
//     console.error("Error rejecting the case:", error);
//     res.status(500).json({
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };

// Validation function for Create_Task parameters
const validateCreateTaskParametersForUploadDRSFile = (params) => {
  const { file_upload_seq, File_Name, File_Type } = params;
  if (!file_upload_seq || !File_Name || !File_Type) {
    throw new Error("file_upload_seq, File_Name, File_Type are required parameters for Create_Task.");
  }
  return true;
};

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
    const counterResult = await mongoConnection.collection("counters").findOneAndUpdate(
      { _id: "file_upload_seq" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true, session }
    );

    const file_upload_seq = counterResult.seq;

    // File upload handling
    const uploadDir = path.join(__dirname, "../uploads");
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
      File_Status: "Open",
    });

    await newFileLog.save({ session });

    // Create task within the transaction
    const taskData = {
      Template_Task_Id: 1,
      task_type: "Data upload from file",
      file_upload_seq,
      File_Name,
      File_Type,
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

// export const List_Incidents = async (req, res) => {
//   try {
//     const { Actions, Incident_Status, From_Date, To_Date } = req.body;

//     let query = {};

//     if (From_Date && To_Date) {
//       const startDate = new Date(From_Date);
//       const endDate = new Date(To_Date);
//       query.Created_Dtm = {
//         $gte: startDate,
//         $lte: endDate,
//       };
//     } else if (From_Date || To_Date) {
//       return res.status(400).json({
//         status: "error",
//         message: "Both From_Date and To_Date must be provided together.",
//       });
//     }

//     if (Actions) {
//       query.Actions = Actions;
//     }
//     if (Incident_Status) {
//       query.Incident_Status = Incident_Status;
//     }

//     const incidents = await Incident_log.find(query);

//     if (incidents.length === 0) {
//       return res.status(404).json({
//         status: "error",
//         message: "No incidents found matching the criteria.",
//       });
//     }

//     const mongo = await db.connectMongoDB();

//     const TaskCounter = await mongo
//       .collection("counters")
//       .findOneAndUpdate(
//         { _id: "task_id" },
//         { $inc: { seq: 1 } },
//         { returnDocument: "after", upsert: true }
//       );

//     if (!TaskCounter || !TaskCounter || !TaskCounter.seq) {
//       return res.status(500).json({
//         status: "error",
//         message: "Failed to generate Task_Id from counters collection.",
//       });
//     }

//     const Task_Id = TaskCounter.seq;

//     const taskData = {
//       Task_Id,
//       Template_Task_Id: 12,
//         parameters: {
//           Incident_Status,
//           StartDTM: From_Date ? new Date(From_Date).toISOString() : null,
//           EndDTM: To_Date ? new Date(To_Date).toISOString() : null,
//           Actions,
//       },
//       Created_By: req.user?.username || "system",
//       Execute_By: "SYS",
//       task_status: "pending",
//       created_dtm: new Date(),
//       end_dtm: null,
//       status_changed_dtm: null,
//       status_description: "",
//     };

//     const newTask = new Task(taskData);
//     await newTask.save();

//     return res.status(200).json({
//       status: "success",
//       message: "Incidents retrieved and task created successfully.",
//       incidents,
//       task: newTask,
//     });
//   } catch (error) {
//     console.error("Error in List_Incidents:", error);
//     return res.status(500).json({
//       status: "error",
//       message: "Internal server error.",
//       errors: {
//         exception: error.message,
//       },
//     });
//   }
// };

export const List_Incidents = async (req, res) => {
  try {
    const { Actions, Incident_Status, From_Date, To_Date } = req.body;

    let query = {};

    if (From_Date && To_Date) {
      const startDate = new Date(From_Date);
      const endDate = new Date(To_Date);
      query.Created_Dtm = {
        $gte: startDate,
        $lte: endDate,
      };
    } else if (From_Date || To_Date) {
      return res.status(400).json({
        status: "error",
        message: "Both From_Date and To_Date must be provided together.",
      });
    }

    if (Actions) {
      query.Actions = Actions;
    }
    if (Incident_Status) {
      query.Incident_Status = Incident_Status;
    }

    const incidents = await Incident_log.find(query);

    if (incidents.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No incidents found matching the criteria.",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Incidents retrieved successfully.",
      incidents,
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

export const total_F1_filtered_Incidents = async (req, res) => {
  try {
    const details = (await Incident.find({
      Incident_Status:"Reject Pending"
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


export const total_distribution_ready_incidents = async (req, res) => {
  try {
    const details = (await Incident.find({
      Incident_Status:"Open No Agent"
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

export const List_Incidents_CPE_Collect = async (req, res) => {
  try {
    const cpeCollectStatuses = ["Open CPE Collect"];

    const incidents = await Incident.find({
      Incident_Status: { $in: cpeCollectStatuses },
    });

    return res.status(200).json({
      status: "success",
      message: "CPE Collecrt incidents retrieved successfully.",
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

export const List_incidents_Direct_LOD = async (req, res) => {
  try {
    const directLODStatuses = ["Direct LOD"];

    const incidents = await Incident.find({
      Incident_Status: { $in: directLODStatuses },
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

export const List_F1_filted_Incidents = async (req, res) => {
  try {
    const rejectpendingStatuses = ["Reject Pending"];

    const incidents = await Incident.find({
      Incident_Status: { $in: rejectpendingStatuses },
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

export const List_distribution_ready_incidents = async (req, res) => {
  try {
    const openNoAgentStatuses = ["Open No Agent"];

    const incidents = await Incident.find({
      Incident_Status: { $in: openNoAgentStatuses },
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

export const distribution_ready_incidents_group_by_arrears_band = async (req, res) => {
  try {
    const details = (await Incident.find({
      Incident_Status:"Open No Agent"
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




export const total_incidents_CPE_Collect = async (req, res) => {
  try {
    const details = (
      await Incident.find({
        Incident_Status: "Open CPE Collect",
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

export const total_incidents_Direct_LOD = async (req, res) => {
  try {
    const details = (
      await Incident.find({
        Incident_Status: "Direct LOD",
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

export const Reject_F1_filtered_Incident = async (req, res) => {
  try{
    const { Incident_Id } = req.body;

    if (!Incident_Id) {
      return res.status(400).json({
        status:"error",
        message:"Incident_Id is a required field.",
        errors: {
          code: 400,
          description: error.message,
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
            description: error.message,
          }
      });
    }

    if (incident.Incident_Status !== 'Reject Pending') {
        return res.status(400).json({ 
         status:"error",
         message: 'Incident status must be "Reject Pending" to update' ,
         errors: {
          code: 400,
          description: error.message,
        }
      });
    }

    await Incident.updateOne(
      { Incident_Id: Incident_Id},
      {
          $set: {
              Incident_Status: 'Incident Reject',
              Incident_Status_Dtm: new Date(),
          },
      }
    );

    return res.status(200).json({
      status: "success",
      message: `Successfully rejected the F1 filtered incident.`
    });
  }catch(error){
    return res.status(500).json({
      status: "error",
      message: "Failed to rejected the F1 filtered incident.",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }
}

export const Forward_F1_filtered_incident = async (req, res) => {
  const { incidentId } = req.body;

  if (!incidentId) {
      return res.status(400).json({ message: 'Incident ID is required' });
  }

  try {
    
      const incident = await Incident.findOne({ Incident_Id: incidentId });

      if (!incident) {
          return res.status(404).json({ message: 'Incident not found' });
      }

     
      if (incident.Incident_Status !== 'Reject Pending') {
          return res.status(400).json({ message: 'Incident status must be "Reject Pending" to update' });
      }

      
      await Incident.updateOne(
          { Incident_Id: incidentId },
          {
              $set: {
                  Incident_Status: 'Open No Agent',
                  Incident_Status_Dtm: new Date(),
              },
          }
      );

      return res.status(200).json({ message: 'Incident status updated successfully' });
  } catch (error) {
      console.error('Error updating incident status:', error);
      return res.status(500).json({ message: 'Internal server error' });
  }
};


export const Create_Case_for_incident = async (req, res) => {
  try {
    const { Incident_Id } = req.body;

    // Validate the incoming request
    if (!Incident_Id) {
      return res.status(400).json({ error: 'Incident_Id is required' });
    }

    // Fetch the Incident data
    const incidentData = await Incident.findOne({ Incident_Id });

    if (!incidentData) {
      return res.status(404).json({ error: 'Incident not found' });
    }

  // Map incident data to case details, ensuring no missing required fields
const caseData = {
  case_id: Math.floor(Math.random() * 100000),
  incident_id: incidentData.Incident_Id,
  account_no: incidentData.Account_Num || "Unknown", 
  customer_ref: incidentData.Customer_Details?.Customer_Name || 'N/A',
  created_dtm: new Date(),
  implemented_dtm: incidentData.Created_Dtm || new Date(),
  area: incidentData.Region || 'Unknown',
  rtom: incidentData.Product_Details[0]?.Service_Type || 'Unknown',
  arrears_band: incidentData.Arrears_Band || "Default Band",
  bss_arrears_amount: incidentData.Arrears || 0,
  current_arrears_amount: incidentData.Arrears || 0,
  current_arrears_band: incidentData.current_arrears_band || "Default Band",
  action_type: 'New Case',
  drc_commision_rule: incidentData.drc_commision_rule || "PEO TV", // Default to valid enum value
  last_payment_date: incidentData.Last_Actions?.Payment_Created || new Date(),
  monitor_months: 6,
  last_bss_reading_date: incidentData.Last_Actions?.Billed_Created || new Date(),
  commission: 0,
  case_current_status: 'Open',
  filtered_reason: incidentData.Filtered_Reason || null,
  ref_products: incidentData.Product_Details.length > 0
    ? incidentData.Product_Details.map(product => ({
        service: product.Service_Type || "Unknown",
        product_label: product.Product_Label || "N/A",
        product_status: product.Product_Status || "Active", // Default fallback value
        status_Dtm: product.Effective_Dtm || new Date(),
        rtom: product.Region || "N/A",
        product_ownership: product.Equipment_Ownership || "Unknown",
        Service_address: product.Service_Address || "N/A",
      }))
    : [{
        service: "Default Service",
        product_label: "Default Product",
        product_status: "Active",
        status_Dtm: new Date(),
        rtom: "Default RTOM",
        product_ownership: "Unknown",
        Service_address: "Default Address",
      }],
};

    // Create and save the new case
    const newCase = new Case_details(caseData);
    await newCase.save();

    res.status(201).json({ message: 'Case created successfully', case: newCase });
  } catch (error) {
    console.error('Error creating case:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const Foward_Direct_LOD = async (req, res) => {
  const { Incident_Id } = req.body;

  if (!Incident_Id) {
    return res.status(400).json({
      status:"error",
      message:"Incident_Id is a required field.",
      errors: {
        code: 400,
        description: error.message,
      },
    });
  }

  try {
    
      const incident = await Incident.findOne({ Incident_Id: Incident_Id });

      if (!incident) {
          return res.status(404).json({ 
            status:"error",
            message: 'Incident not found' ,
            errors: {
              code: 404,
              description: error.message,
            }
         });
      }

      await Incident.updateOne(
          { Incident_Id: Incident_Id },
          {
              $set: {
                  Incident_Status: 'Direct LOD',
                  Incident_Status_Dtm: new Date(),
              },
          }
      );

      return res.status(200).json({ 
        status: "success",
        message: 'Incident status updated successfully' 
      });
  } catch (error) {
      console.error('Error updating incident status:', error);
      return res.status(500).json({ 
        status: "error",
        message: 'Internal server error' ,
        errors: {
          code: 500,
          description: error.message,
        },
      });
  }
}
