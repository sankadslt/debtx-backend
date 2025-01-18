import moment from "moment";
import db from "../config/db.js";
import mongoose from "mongoose";
import Incident_log from "../models/Incident_log.js";
import Task from "../models/Task.js";
import FileUploadLog from "../models/file_upload_log.js";
import fs from "fs";
import path from "path";
import { Request_Incident_External_information } from "../services/IncidentService.js";
import System_Case_User_Interaction from '../models/User_Interaction.js'; 
import Incident from "../models/Incident.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import logger from "../utils/logger.js";

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
const logElapsedTime = (action, startTime, endTime = Date.now()) => {
  const start = new Date(startTime).toISOString();
  const end = new Date(endTime).toISOString();
  const elapsed = endTime - startTime;

  logger.info({
    message: `${action}: ${start} - ${end}`,
    elapsed: `${elapsed}ms`,
  });
};

// Create_Incident Controller
export const Create_Incident = async (req, res) => {
  const { Account_Num, DRC_Action, Monitor_Months, Created_By, Source_Type } = req.body;

  const apiStartTime = Date.now(); // Start time for the entire API call

  try {
    // Validate required fields
    if (!Account_Num || !DRC_Action || !Created_By || !Source_Type) {
      return res.status(400).json({
        status: "error",
        message: "All fields (Account_Num, DRC_Action, Monitor_Months, Created_By, Source_Type) are required.",
      });
    }

    if (Account_Num.length > 10) {
      return res.status(400).json({
        status: "error",
        message: "Account number must be 10 characters or fewer.",
      });
    }

    const validActions = ["collect arrears", "collect arrears and CPE", "collect CPE"];
    if (!validActions.includes(DRC_Action)) {
      return res.status(400).json({
        status: "error",
        message: `Invalid action. Allowed values are: ${validActions.join(", ")}.`,
      });
    }

    const validSourceTypes = ["Pilot Suspended", "Product Terminate", "Special"];
    if (!validSourceTypes.includes(Source_Type)) {
      return res.status(400).json({
        status: "error",
        message: `Invalid Source_Type. Allowed values are: ${validSourceTypes.join(", ")}.`,
      });
    }

    const monitorMonths = Monitor_Months || 3; // Default Monitor_Months to 3 if null

    if (monitorMonths < 1 || monitorMonths > 3) {
      return res.status(400).json({
        status: "error",
        message: "Monitor_Months must be between 1 and 3.",
      });
    }

    const mongoConnection = await mongoose.connection;
    const counterStartTime = Date.now(); // Start timer for counter operation
    const counterResult = await mongoConnection.collection("counters").findOneAndUpdate(
      { _id: "incident_id" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }
    );
    logElapsedTime("Time for generating Incident_Id", counterStartTime);

    const Incident_Id = counterResult.seq;

    const incidentStartTime = Date.now(); // Start timer for incident creation
    const newIncident = new Incident_log({
      Incident_Id,
      Account_Num,
      Incident_Status: "Incident Open", 
      Actions: DRC_Action,
      Monitor_Months: monitorMonths,
      Created_By,
      Source_Type,
      Created_Dtm: moment().toDate(),
    });

    await newIncident.save();
    logElapsedTime("Time for saving Incident_log", incidentStartTime);

    try {
      const externalApiStartTime = Date.now();
      await Request_Incident_External_information({ Account_Num, Monitor_Months: monitorMonths });
      logElapsedTime("Time for external API call", externalApiStartTime);
    } catch (apiError) {
      console.error("Error calling external API:", apiError.message);
      return res.status(500).json({
        status: "error",
        message: "Failed to request external incident information.",
      });
    }

    const taskStartTime = Date.now();
    const mongo = await db.connectMongoDB();
    const TaskCounter = await mongo.collection("counters").findOneAndUpdate(
      { _id: "task_id" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }
    );
    const Task_Id = TaskCounter.seq;

    const taskData = {
      Task_Id,
      Template_Task_Id: 9,
      parameters: {
        Incident_Id: Incident_Id.toString(),
        Account_Num: Account_Num,
      },
      Created_By,
      Execute_By: "SYS",
      Sys_Alert_ID: null,
      Interaction_ID_Success: null,
      Interaction_ID_Error: null,
      Task_Id_Error: null,
      created_dtm: new Date(),
      end_dtm: null,
      task_status: "open",
      status_changed_dtm: null,
      status_description: "",
    };

    await Task.create(taskData);
    logElapsedTime("Time for creating task", taskStartTime);

    const apiEndTime = Date.now(); // End time for the entire API call
    const apiElapsed = apiEndTime - apiStartTime;
    logger.info({
      message: `Total API execution time: ${new Date(apiStartTime).toISOString()} - ${new Date(apiEndTime).toISOString()}`,
      elapsed: `${apiElapsed}ms`,
    });

    return res.status(201).json({
      status: "success",
      message: "Incident created successfully.",
      data: {
        Incident_Id,
        Account_Num,
        DRC_Action,
        Monitor_Months: monitorMonths,
        Created_By,
        Source_Type,
        Created_Dtm: newIncident.Created_Dtm,
      },
    });
  } catch (error) {
    console.error("Unexpected error during incident creation:", error);
    logger.error({
      message: "Unexpected error during incident creation",
      error: error.message,
    });
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
//   const { Incident_Id, Rejected_Reason, Rejected_By} = req.body;

//   try {
//     // Validate required fields
//     if (!Incident_Id || !Rejected_Reason || !Rejected_By ) {
//       return res.status(400).json({
//         status: "error",
//         message: "Incident_Id, Rejected_Reason, Rejected_By are required.",
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
//             Rejected_Reason,
//             Rejected_By,
//             Rejected_Dtm: moment().toDate(),
//           },
//         },
//         { new: true, session }
//       );

//       console.log('Incident Update Result:', incidentUpdateResult);

//       if (!incidentUpdateResult) {
//         throw new Error("Incident not found or failed to update.");
//       }

//       // Update UserInteraction status
//       const interactionUpdateResult = await System_Case_User_Interaction.findOneAndUpdate(
//         { Case_User_Interaction_id: 5, "parameters.Incident_Id": String(Incident_Id) },
//         {
//           $set: {
//             status: "close",
//             status_changed_dtm: new Date(),
//             status_description: "Incident Rejected",
//           },
//         },
//         { new: true, session }
//       );

//       console.log('Interaction Update Result:', interactionUpdateResult);

//       if (!interactionUpdateResult) {
//         throw new Error("User Interaction not found or failed to update.");
//       }

//       // Commit transaction
//       await session.commitTransaction();
//       session.endSession();

//       // Respond with success
//       return res.status(200).json({
//         status: "success",
//         message: "Incident rejected successfully.",
//         data: {
//           incident: incidentUpdateResult,
//           interaction: interactionUpdateResult,
//         },
//       });
//     } catch (transactionError) {
//       // Rollback transaction on error
//       await session.abortTransaction();
//       session.endSession();
//       console.error("Transaction error:", transactionError);
//       throw transactionError;
//     }
//   } catch (error) {
//     // Log unexpected errors and respond
//     console.error("Error in Reject_Case:", error);
//     return res.status(500).json({
//       status: "error",
//       message: "Failed to reject incident.",
//       errors: {
//         exception: error.message,
//       },
//     });
//   }
// };

export const Reject_Case = async (req, res) => {
  try {
    const { Incident_Id, Reject_Reason, Rejected_By } = req.body;

    
    if (!Incident_Id || !Reject_Reason || !Rejected_By) {
      return res.status(400).json({
        message: 'Incident_Id, Reject_Reason, and Rejected_By are required fields.',
      });
    }

    
    const incidentUpdateResult = await Incident.findOneAndUpdate(
      { Incident_Id },
      {
        $set: {
          Incident_Status: 'Incident Reject',
          Rejected_Reason: Reject_Reason,
          Rejected_By,
          Rejected_Dtm: new Date(),
        },
      },
      { new: true } 
    );

    if (!incidentUpdateResult) {
      return res.status(404).json({ message: 'Incident not found.' });
    }

    
    const caseUserInteractionUpdateResult = await System_Case_User_Interaction.findOneAndUpdate(
      { Case_User_Interaction_id: 5, "parameters.Incident_ID": Incident_Id },
      {
        $set: {
          User_Interaction_status: 'close',
          User_Interaction_status_changed_dtm: new Date(),
        },
      },
      { new: true } 
    );

    if (!caseUserInteractionUpdateResult) {
      return res.status(404).json({ message: 'System Case User Interaction not found.' });
    }

    
    res.status(200).json({
      message: 'Incident rejected and status updated successfully.',
      incident: incidentUpdateResult,
      caseUserInteraction: caseUserInteractionUpdateResult,
    });
  } catch (error) {
    console.error('Error rejecting the case:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};




export const Upload_DRS_File = async (req, res) => {
  const { File_Name, File_Type, File_Content, Created_By } = req.body;

  try {
    // Validate required fields
    if (!File_Name || !File_Type || !File_Content || !Created_By) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required.",
      });
    }

    // Validate File_Type against allowed values
    const validFileTypes = [
      "Incident Creation",
      "Incident Reject",
      "Distribute to DRC",
      "Validity Period Extend",
      "Hold",
      "Discard",
    ];

    if (!validFileTypes.includes(File_Type)) {
      return res.status(400).json({
        status: "error",
        message: `Invalid File Type. Allowed values are: ${validFileTypes.join(", ")}.`,
      });
    }

    // Generate a unique File_Id
    const mongoConnection = await db.connectMongoDB();
    const counterResult = await mongoConnection.collection("counters").findOneAndUpdate(
      { _id: "file_upload_seq" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }
    );

    const file_upload_seq = counterResult.seq;

    // Ensure the uploads directory exists
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Upload file to the server
    const uploadPath = path.join(uploadDir, File_Name);
    fs.writeFileSync(uploadPath, File_Content, "utf8");

    // Define Forwarded_File_Path
    const forwardedFileDir = path.join(__dirname, "../forwarded");
    if (!fs.existsSync(forwardedFileDir)) {
      fs.mkdirSync(forwardedFileDir, { recursive: true });
    }

    const forwardedFilePath = path.join(forwardedFileDir, File_Name);

    // Insert into file_upload_log table
    const newFileLog = new FileUploadLog({
      file_upload_seq,
      File_Name,
      File_Type,
      Uploaded_By: Created_By,
      Uploaded_Dtm: moment().toDate(),
      File_Path: uploadPath,
      Forwarded_File_Path: forwardedFilePath, // Set the forwarded file path
      File_Status: "Open", // Default to "Open"
    });

    await newFileLog.save();

    // Create Task: "Extract Incident from File" (Template_Task_Id: 1)
    const taskCounter = await mongoConnection.collection("counters").findOneAndUpdate(
      { _id: "task_id" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }
    );

    const Task_Id = taskCounter.seq;

    const taskData = {
      Task_Id,
      Template_Task_Id: 1,
      parameters: {
        file_upload_seq: file_upload_seq.toString(),
        File_Name,
        File_Type,
      },
      Created_By,
      Execute_By: null,
      Sys_Alert_ID: null,
      Interaction_ID_Success: null,
      Interaction_ID_Error: null,
      Task_Id_Error: null,
      created_dtm: new Date(),
      end_dtm: null,
      task_status: "open",
      status_changed_dtm: null,
      status_description: "",
    };

    // Insert task into the System_tasks table
    await Task.create(taskData);

    return res.status(201).json({
      status: "success",
      message: "File uploaded successfully, and task created.",
      data: {
        file_upload_seq,
        Task_Id,
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
    console.error("Error during file upload and task creation:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to upload file and create task.",
      errors: {
        exception: error.message,
      },
    });
  }
};

export const List_Incidents = async (req, res) => {
  try {
    const { Actions, Incident_Status, From_Date, To_Date } = req.body;

 
    if (!Actions || !Incident_Status || !From_Date || !To_Date) {
      return res.status(400).json({ message: 'All fields are required: Actions, Incident_Status, From_Date, To_Date' });
    }


    const startDate = new Date(From_Date);
    const endDate = new Date(To_Date);

   
    const incidents = await Incident_log.find({
      Actions,
      Incident_Status,
      Created_Dtm: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    if (incidents.length === 0) {
      return res.status(404).json({ message: 'No incidents found matching the criteria.' });
    }

    
    const mongo = await db.connectMongoDB();
    const TaskCounter = await mongo.collection("counters").findOneAndUpdate(
      { _id: "task_id" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }
    );

    
    if (!TaskCounter || !TaskCounter.seq) {
      return res.status(500).json({ message: 'Failed to generate Task_Id from counters collection.' });
    }

    const Task_Id = TaskCounter.seq;

    
    const taskData = {
      Task_Id,
      Template_Task_Id: 12, 
      parameters: {
        Incident_Status,
        StartDTM: startDate.toISOString(),
        EndDTM: endDate.toISOString(),
        Actions,
      },
      Created_By: req.user?.username || 'system', 
      task_status: 'pending',
    };

    const newTask = new Task(taskData);
    await newTask.save();

   
    return res.status(200).json({
      message: 'Incidents retrieved successfully.',
      incidents,
      task: newTask,
    });
  } catch (error) {
    console.error('Error in listIncidents:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
