import User_Interaction_Log from "../models/User_Interaction_Log.js";
import User_Interaction_Progress_Log from "../models/User_Interaction_Progress_Log.js";
import db from "../config/db.js"; // MongoDB connection config

// Create User Interaction Function
export const createUserInteractionFunction = async ({
  Interaction_ID,
  User_Interaction_Type,
  delegate_user_id,
  Created_By,
  User_Interaction_Status = "Open",
  ...dynamicParams
}) => {
  try {
    // Validate required parameters
    if (!Interaction_ID || !Created_By || !delegate_user_id) {
      throw new Error("Interaction_ID, Created_By, and delegate_user_id are required.");
    }

    // Connect to MongoDB
    const mongoConnection = await db.connectMongoDB();
    if (!mongoConnection) {
      throw new Error("MongoDB connection failed.");
    }

    // Generate a unique Interaction_Log_ID
    const counterResult = await mongoConnection.collection("counters").findOneAndUpdate(
      { _id: "interaction_log_id" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }
    );

    const Interaction_Log_ID = counterResult.value.seq;
    if (!Interaction_Log_ID) {
      throw new Error("Failed to generate Interaction_Log_ID.");
    }

    // Prepare interaction data
    const interactionData = {
      Interaction_Log_ID,
      Interaction_ID,
      User_Interaction_Type,
      parameters: dynamicParams, // Accept dynamic parameters
      delegate_user_id,
      Created_By,
      User_Interaction_Status,
    };

    // Insert into User_Interaction_Log collection
    const newInteraction = new User_Interaction_Log(interactionData);
    await newInteraction.save();

    // Insert into User_Interaction_Progress_Log collection
    const newInteractionInProgress = new User_Interaction_Progress_Log(interactionData);
    await newInteractionInProgress.save();

    // Return success response
    return {
      status: "success",
      message: "User interaction created successfully",
      data: interactionData,
    };
  } catch (error) {
    console.error("Error creating user interaction:", error);
    throw new Error("Failed to create user interaction.");
  }
};

// Create User Interaction API
export const createUserInteraction = async (req, res) => {
  try {
    const {
      Interaction_ID,
      User_Interaction_Type,
      delegate_user_id,
      Created_By,
      User_Interaction_Status = "Open",
      ...dynamicParams
    } = req.body;

    if (!Interaction_ID || !Created_By || !delegate_user_id) {
      return res.status(400).json({ message: "Interaction_ID, Created_By, and delegate_user_id are required." });
    }

    // Connect to MongoDB
    const mongoConnection = await db.connectMongoDB();
    if (!mongoConnection) {
      throw new Error("MongoDB connection failed.");
    }

    // Generate a unique Interaction_Log_ID
    const counterResult = await mongoConnection.collection("counters").findOneAndUpdate(
      { _id: "interaction_log_id" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }
    );

    const Interaction_Log_ID = counterResult.value.seq;
    if (!Interaction_Log_ID) {
      return res.status(500).json({ message: "Failed to generate Interaction_Log_ID." });
    }

    // Prepare interaction data
    const interactionData = {
      Interaction_Log_ID,
      Interaction_ID,
      User_Interaction_Type,
      parameters: dynamicParams, // Accept dynamic parameters
      delegate_user_id,
      Created_By,
      User_Interaction_Status,
    };

    // Insert into User_Interaction_Log collection
    const newInteraction = new User_Interaction_Log(interactionData);
    await newInteraction.save();

    // Insert into User_Interaction_Progress_Log collection
    const newInteractionInProgress = new User_Interaction_Progress_Log(interactionData);
    await newInteractionInProgress.save();

    return res.status(201).json({
      message: "User interaction created successfully",
      data: interactionData,
    });
  } catch (error) {
    console.error("Error creating user interaction:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
