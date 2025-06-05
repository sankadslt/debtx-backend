import Task from "../models/Task.js";
import Task_Inprogress from "../models/Task_Inprogress.js";
import db from "../config/db.js"; // MongoDB connection config
import mongoose from "mongoose";
import User_Interaction_Progress_Log from "../models/User_Interaction_Progress_Log.js";
import User_Interaction_Log from "../models/User_Interaction_Log.js";


//Create Task Function
export const createTaskFunction = async ({ Template_Task_Id, task_type, Created_By, task_status = 'open', ...dynamicParams }) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Validate required parameters
      if (!Template_Task_Id || !Created_By) {
        throw new Error("Template_Task_Id and Created_By are required.");
      }
  
      // Connect to MongoDB
      const mongoConnection = await db.connectMongoDB();
      if (!mongoConnection) {
        throw new Error("MongoDB connection failed.");
      }
  
      // Generate a unique Task_Id
      const counterResult = await mongoConnection.collection("counters").findOneAndUpdate(
        { _id: "task_id" },
        { $inc: { seq: 1 } },
        { returnDocument: "after", upsert: true, session }
      );
  
      const Task_Id = counterResult.seq; // Use `value` to access the updated document
      // console.log("Task_Id:", Task_Id);
  
      if (!Task_Id) {
        throw new Error("Failed to generate Task_Id.");
      } 

     
      // Prepare task data
      const taskData = {
        Task_Id,
        Template_Task_Id,
        task_type,
        parameters: dynamicParams, // Accept dynamic parameters
        Created_By,
        Execute_By: "SYS",
        task_status, // Use task_status directly here
      };
  
      // Insert into System_task collection
      const newTask = new Task(taskData);
      await newTask.save({ session });
  
      // Insert into System_task_Inprogress collection
      const newTaskInProgress = new Task_Inprogress(taskData);
      await newTaskInProgress.save({ session });

      await session.commitTransaction(); // Commit the transaction
      session.endSession();
  
      // Return success response
      return {
        status: "success",
        message: "Task created successfully",
        data: {
          Task_Id,
          Template_Task_Id,
          task_type,
          parameters: dynamicParams,
          Created_By,
        },
      };
    } catch (error) {
      await session.abortTransaction(); // Rollback on error
      session.endSession(); 
      
      console.error("Error creating task:", error);

      // Return error response as a structured object
    //   return {
    //     status: "error",
    //     message: "Failed to create task.",
    //     error: error.message,
    //   };

    throw new Error("Failed to create task.");
    }
  };

  //Create Task API
export const createTask = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { Template_Task_Id, task_type, Created_By, task_status = 'open', ...dynamicParams } = req.body; // Provide a default value for task_status
      // console.log("Request body:", req.body);
  
      if (!Template_Task_Id || !Created_By) {
        return res.status(400).json({ message: "Template_Task_Id and created_by are required." });
      }
  
      // Connect to MongoDB
      const mongoConnection = await db.connectMongoDB();
      if (!mongoConnection) {
        throw new Error("MongoDB connection failed");
      }
  
      // Generate a unique Task_Id
      const counterResult = await mongoConnection.collection("counters").findOneAndUpdate(
        { _id: "task_id" },
        { $inc: { seq: 1 } },
        { returnDocument: "after", upsert: true, session }
      );
  
      const Task_Id = counterResult.seq;
      if (!Task_Id) {
        return res.status(500).json({ message: "Failed to generate Task_Id" });
      }

  
      // Prepare task data
      const taskData = {
        Task_Id,
        Template_Task_Id,
        task_type,
        parameters: dynamicParams, // Accept dynamic parameters
        Created_By,
        Execute_By: "SYS",
        task_status,  // Use task_status directly here
      };
  
      // Insert into System_task collection
      const newTask = new Task(taskData);
      await newTask.save({ session });
  
      // Insert into System_task_Inprogress collection
      const newTaskInProgress = new Task_Inprogress(taskData);
      await newTaskInProgress.save({ session });

      await session.commitTransaction(); // Commit the transaction
      session.endSession();
  
      return res.status(201).json({ 
        message: "Task created successfully", 
        Task_Id, 
        Template_Task_Id,
        task_type,
        dynamicParams, // Accept dynamic parameters
        Created_By 
      });
    } catch (error) {
      await session.abortTransaction(); // Rollback on error
      session.endSession();
      
      console.error("Error creating task:", error);
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
     
    }
  };

export const Task_for_Download_Incidents_Function = async ({ DRC_Action, Incident_Status, From_Date, To_Date, Created_By, Source_type }) => {
  if (!DRC_Action || !Incident_Status || !From_Date || !To_Date || !Created_By) {
    throw new Error("Missing required parameters");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Generate a unique Task_Id
    const mongoConnection = mongoose.connection;
    const counterResult = await mongoConnection.collection("counters").findOneAndUpdate(
      { _id: "task_id" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", session, upsert: true }
    );

    const Task_Id = counterResult.value.seq;
    const dynamicParams = {
            DRC_Action,
            Incident_Status,
            From_Date,
            To_Date,
          }
    // Task object
    const taskData = {
      Task_Id,
      Template_Task_Id: 20,
      task_type: "Create Incident list for download",
      ...dynamicParams,
      Created_By,
      task_status: "open",
      created_dtm: new Date(),
    };

    // Insert into System_tasks
    const task = new Task(taskData);
    await task.save({ session });

    // Insert into System_tasks_Inprogress
    const taskInProgress = new Task_Inprogress(taskData);
    await taskInProgress.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return { message: "Task created successfully", 
      data: {Task_Id, Template_Task_Id,
        task_type,
        parameters,
        Created_By, },};
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    session.endSession();
    console.error("Error in Task_for_Download_Incidents_Function:", error);
    throw new Error("Failed to create task");
  }
};

// export const Task_for_Download_Incidents = async (req, res) => {
//   const { DRC_Action, Incident_Status, Source_Type, From_Date, To_Date, Created_By } = req.body;

//   if (!From_Date || !To_Date || !Created_By ) {
//       return res.status(400).json({ error: "Missing required parameters From Date To Date" });
//   }

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//       // Generate unique Task_Id
//       const mongoConnection = await mongoose.connection;
//       const counterResult = await mongoConnection.collection("counters").findOneAndUpdate(
//           { _id: "task_id" },
//           { $inc: { seq: 1 } },
//           { returnDocument: "after", session, upsert: true }
//       );

//       const Task_Id = counterResult.seq;

//       // Task object
//       const taskData = {
//           Task_Id,
//           Template_Task_Id: 20, // Placeholder, adjust if needed
//           task_type: "Create Incident list for download",
//           parameters: {
//               DRC_Action,
//               Incident_Status,
//               Source_Type,
//               From_Date,
//               To_Date,
//           },
//           Created_By,
//           Execute_By: "SYS",
//           task_status: "open",
//           created_dtm: new Date(),
//       };

//       // Insert into System_tasks
//       const task = new Task(taskData);
//       await task.save({ session });

//       // Insert into System_tasks_Inprogress
//       const taskInProgress = new Task_Inprogress(taskData);
//       await taskInProgress.save({ session });

//       // Commit the transaction
//       await session.commitTransaction();
      
//       return res.status(201).json({ 
//           message: "Task created successfully",
//           Task_Id,
//           Template_Task_Id: taskData.Template_Task_Id, 
//     task_type: taskData.task_type, 
//     parameters: taskData.parameters, 
//     Created_By: taskData.Created_By  
//       });

//   } catch (error) {
//       console.error("Error creating task:", error);

//       // Ensure the transaction is aborted only if still active
//       if (session.inTransaction()) {
//           await session.abortTransaction();
//       }
//       return res.status(500).json({ error: "Failed to create task", details: error.message });

//   } finally {
//       // Always end the session in the finally block
//       session.endSession();
//   }
// };

export const getOpenTaskCount = async (req, res) => {
  
  const {Template_Task_Id ,task_type} = req.body;
  
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
    return res.status(200).json({ openTaskCount: 0 });
  } catch (error) {
    console.error('Error fetching open task count:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Inputs:
 * - delegate_user_id: String (required)
 * 
 * Collection: 
 * - User_Interaction_Progress_Log
 * - To_Do_List
 * - Templete_User_Interaction
 * 
 * Success Result:
 * - Returns a success response with a list of all open requests for the to-do list assigned to the specified delegate user.
 */
export const List_All_Open_Requests_For_To_Do_List = async (req, res) => {
  try {
    const {
      delegate_user_id,
    } = req.body;

    if (!delegate_user_id) {
      return res.status(400).json({ 
        message: "Missing required fields: delegate_user_id is required." 
      });
    }

    // Build match filter - only add date filter if both dates are provided
    const matchFilter = {
      delegate_user_id: delegate_user_id
    };

    // Aggregation pipeline
    const pipeline = [
      {
        $match: matchFilter
      },
      
      {
        $addFields: {
          last_status: {
            $cond: {
              if: { $isArray: "$User_Interaction_Status" },
              then: {
                $cond: {
                  if: { $gt: [{ $size: "$User_Interaction_Status" }, 0] },
                  then: { $arrayElemAt: ["$User_Interaction_Status", -1] },
                  else: null
                }
              },
              else: null
            }
          }
        }
      },
      
      {
        $match: {
          "last_status.User_Interaction_Status": "Open" 
        },
      },
      
      {
        $lookup: {
          from: "Templete_User_Interaction",
          localField: "Interaction_ID",
          foreignField: "Interaction_ID",
          as: "Templete_User_Interaction_info"
        }
      },
      
      {
        $unwind: {
          path: "$Templete_User_Interaction_info",
          preserveNullAndEmptyArrays: true
        }
      },

      {
        $lookup: {
          from: "To_Do_List",
          localField: "Templete_User_Interaction_info.ToDoID",
          foreignField: "ToDoID",
          as: "To_Do_List_info"
        }
      },
      
      {
        $unwind: {
          path: "$To_Do_List_info",
          preserveNullAndEmptyArrays: true
        }
      },

      {
        $addFields: {
          parameter_entries: {
            $objectToArray: "$parameters"
          }
        }
      },

      { 
        $addFields: {
          normalized_showParameters: {
            $map: {
              input: { $ifNull: ["$To_Do_List_info.parameters", []] },
              as: "param",
              in: {
                $toLower: {
                  $replaceAll: {
                    input: "$$param",
                    find: " ",
                    replacement: "_"
                  }
                }
              }
            }
          }
        }
      },

      {
        $addFields: {
          filtered_parameters_array: {
            $filter: {
              input: "$parameter_entries",
              as: "entry",
              cond: {
                $in: [
                  { $toLower: "$$entry.k" },
                  "$normalized_showParameters"
                ]
              }
            }
          }
        }
      },

      {
        $addFields: {
          filtered_parameters: {
            $arrayToObject: "$filtered_parameters_array"
          }
        }
      },

      
      // Final projection
      {
        $project: {
          _id: 1,
          Interaction_Log_ID: 1,
          delegate_user_id: "$delegate_user_id",
          User_Interaction_Status: {
            $ifNull: ["$last_status.User_Interaction_Status", "N/A"]
          },
          Process: "$To_Do_List_info.Process",
          CreateDTM: 1,
          // parameters: "$parameters",
          // showParameters: "$To_Do_List_info.parameters",
          filtered_parameters: 1
        }
      }
    ];

    // Execute the aggregation pipeline
    const results = await User_Interaction_Progress_Log.aggregate(pipeline);

    if (!results || results.length === 0) {
      return res.status(204).json({ 
        message: "No matching data found for the specified criteria." 
      });
    }

    return res.status(200).json({
      status: "success",
      data: results
    });
    
  } catch (error) {
    console.error("Error fetching user interaction response log:", error);
    return res.status(500).json({ 
      message: "Internal Server Error", 
      error: error.message 
    });
  }
};

export const Handle_Interaction_Acknowledgement = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { Interaction_Log_ID, delegate_user_id } = req.body;

    if (!Interaction_Log_ID || !delegate_user_id) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Interaction_Log_ID is required." });
    }

    const matchFilter = {
      Interaction_Log_ID: Number(Interaction_Log_ID),
      delegate_user_id: delegate_user_id
    }

    const pipeline = [
      {
        $match: matchFilter
      },

      {
        $lookup: {
          from: "Templete_User_Interaction",
          localField: "Interaction_ID",
          foreignField: "Interaction_ID",
          as: "Templete_User_Interaction_info"
        }
      },

      {
        $unwind: {
          path: "$Templete_User_Interaction_info",
          preserveNullAndEmptyArrays: true
        }
      },

      // Final projection
      {
        $project: {
          _id: 1,
          Interaction_Log_ID: 1,
          delegate_user_id: "$delegate_user_id",
          Interaction_Mode: "$Templete_User_Interaction_info.Interation_Mode",
        }
      }
    ]

    // Execute the aggregation pipeline
    const results = await User_Interaction_Progress_Log.aggregate(pipeline);
    
    if (results.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "User Interaction Progress Log not found." });
    }

    const interactionMode = results[0].Interaction_Mode;

    // Update User_Interaction_Log status to "Seen"
    const seenStatus = {
      User_Interaction_Status: "Seen",
      created_dtm: new Date()
    };

    await User_Interaction_Log.updateOne(
      { Interaction_Log_ID },
      { $push: { User_Interaction_Status: seenStatus } },
      { session }
    );

    // Branch logic based on interaction mode
    if (interactionMode === "Special" || interactionMode === "Approval") {
      // Delete progress log
      await User_Interaction_Progress_Log.deleteOne({ Interaction_Log_ID: Number(Interaction_Log_ID) }, { session });
    } else {
      // Update progress log status to "Seen"
      await User_Interaction_Progress_Log.updateOne(
        { Interaction_Log_ID },
        { $push: { User_Interaction_Status: seenStatus } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Interaction acknowledged successfully.",
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


  
