import UserInteraction from "../models/UserInteraction.js";
import db from "../config/db.js"; // MongoDB connection config

// Create User Interaction Function
export const createUserInteractionFunction = async ({ 
  User_Interaction_Type, 
  delegate_user_id, 
  Created_By, 
  User_Transaction_Status = 'pending', 
  Transaction_Status_DTM, 
  ...dynamicParams 
}) => {
  try {
    // Validate required parameters
    if (!User_Interaction_Type || !Created_By) {
      throw new Error("User_Interaction_Type and Created_By are required.");
    }

    // Connect to MongoDB
    const mongoConnection = await db.connectMongoDB();
    if (!mongoConnection) {
      throw new Error("MongoDB connection failed.");
    }

    // Generate a unique User_Interaction_ID
    const counterResult = await mongoConnection.collection("counters").findOneAndUpdate(
      { _id: "user_interaction_id" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }
    );

    const User_Interaction_ID = counterResult.value?.seq;
    if (!User_Interaction_ID) {
      throw new Error("Failed to generate User_Interaction_ID.");
    }

    // Prepare user interaction data
    const interactionData = {
      User_Interaction_ID,
      User_Interaction_Type,
      delegate_user_id,
      parameters: dynamicParams, // Accept dynamic parameters
      Created_By,
      Transaction_Status_DTM,
      User_Transaction_Status,
    };

    // Insert into User_Interaction collection
    const newUserInteraction = new UserInteraction(interactionData);
    await newUserInteraction.save();

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