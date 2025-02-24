import Task from "../models/Task.js";
import Task_Inprogress from "../models/Task_Inprogress.js";
import db from "../config/db.js"; // MongoDB connection config
import mongoose from "mongoose";


//Create Task Function
export const createTaskFunction = async ({ Template_Task_Id, task_type, Created_By, task_status = 'open', ...dynamicParams }) => {
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
        { returnDocument: "after", upsert: true }
      );
  
      const Task_Id = counterResult.seq; // Use `value` to access the updated document
      console.log("Task_Id:", Task_Id);
  
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
      await newTask.save();
  
      // Insert into System_task_Inprogress collection
      const newTaskInProgress = new Task_Inprogress(taskData);
      await newTaskInProgress.save();
  
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
    try {
      const { Template_Task_Id, task_type, Created_By, task_status = 'open', ...dynamicParams } = req.body; // Provide a default value for task_status
      console.log("Request body:", req.body);
  
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
        { returnDocument: "after", upsert: true }
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
      await newTask.save();
  
      // Insert into System_task_Inprogress collection
      const newTaskInProgress = new Task_Inprogress(taskData);
      await newTaskInProgress.save();
  
      return res.status(201).json({ 
        message: "Task created successfully", 
        Task_Id, 
        Template_Task_Id,
        task_type,
        dynamicParams, // Accept dynamic parameters
        Created_By 
      });
    } catch (error) {
      console.error("Error creating task:", error);
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
     
    }
  };

  export const Task_for_Download_Incidents_Function = async ({ DRC_Action, Incident_Status, From_Date, To_Date, Created_By }) => {
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

    // Task object
    const taskData = {
      Task_Id,
      Template_Task_Id: 20,
      task_type: "Create Incident list for download",
      parameters: {
        DRC_Action,
        Incident_Status,
        From_Date,
        To_Date,
      },
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

export const Task_for_Download_Incidents = async (req, res) => {
  const { DRC_Action, Incident_Status, Source_Type, From_Date, To_Date, Created_By } = req.body;

  if (!From_Date || !To_Date || !Created_By ) {
      return res.status(400).json({ error: "Missing required parameters From Date To Date" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
      // Generate unique Task_Id
      const mongoConnection = await mongoose.connection;
      const counterResult = await mongoConnection.collection("counters").findOneAndUpdate(
          { _id: "task_id" },
          { $inc: { seq: 1 } },
          { returnDocument: "after", session, upsert: true }
      );

      const Task_Id = counterResult.seq;

      // Task object
      const taskData = {
          Task_Id,
          Template_Task_Id: 21, // Placeholder, adjust if needed
          task_type: "Create Incident list for download",
          parameters: {
              DRC_Action,
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

      // Insert into System_tasks
      const task = new Task(taskData);
      await task.save({ session });

      // Insert into System_tasks_Inprogress
      const taskInProgress = new Task_Inprogress(taskData);
      await taskInProgress.save({ session });

      // Commit the transaction
      await session.commitTransaction();
      
      return res.status(201).json({ 
          message: "Task created successfully",
          Task_Id,
          Template_Task_Id: taskData.Template_Task_Id, 
    task_type: taskData.task_type, 
    parameters: taskData.parameters, 
    Created_By: taskData.Created_By  
      });

  } catch (error) {
      console.error("Error creating task:", error);

      // Ensure the transaction is aborted only if still active
      if (session.inTransaction()) {
          await session.abortTransaction();
      }
      return res.status(500).json({ error: "Failed to create task", details: error.message });

  } finally {
      // Always end the session in the finally block
      session.endSession();
  }
};

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



  
