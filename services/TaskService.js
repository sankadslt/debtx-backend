import Task from "../models/Task.js";
import Task_Inprogress from "../models/Task_Inprogress.js";
import db from "../config/db.js"; // MongoDB connection config

//Create Task Functionw
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
  
