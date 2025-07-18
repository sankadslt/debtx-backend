import User_Interaction_Log from "../models/User_Interaction_Log.js";
import User_Interaction_Progress_Log from "../models/User_Interaction_Progress_Log.js";
import db from "../config/db.js"; 


// Create User Interaction Function
export const createUserInteractionFunction = async ({
  Interaction_ID,
  User_Interaction_Type,
  delegate_user_id,
  Created_By,
  session,
  ...dynamicParams
}) => {
  try {
   
    if (!Interaction_ID || !Created_By || !delegate_user_id) {
      throw new Error("Interaction_ID, Created_By, and delegate_user_id are required.");
    }

  
    const mongoConnection = await db.connectMongoDB();
    if (!mongoConnection) {
      throw new Error("MongoDB connection failed.");
    }

    // Generate a ID
    const counterResult = await mongoConnection.collection("collection_sequence").findOneAndUpdate(
      { _id: "interaction_log_id" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true, session, }
    );
    const Interaction_Log_ID = counterResult.seq;
    if (!Interaction_Log_ID) {
      throw new Error("Failed to generate Interaction_Log_ID.");
    }
    const interactionData = {
      Interaction_Log_ID,
      Interaction_ID,
      User_Interaction_Type,
      parameters: dynamicParams, 
      delegate_user_id,
      Created_By,
      User_Interaction_Status: [{
        User_Interaction_Status: "Open",
        created_dtm: new Date()
      }]
    };
    // Insert into User_Interaction_Log collection
    const newInteraction = new User_Interaction_Log(interactionData);
    await newInteraction.save({ session });

    // Insert into User_Interaction_Progress_Log collection
    const newInteractionInProgress = new User_Interaction_Progress_Log(interactionData);
    await newInteractionInProgress.save({ session });
   
    return {
      status: "success",
      message: "User interaction created successfully",
      Interaction_Log_ID,
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

  
    const mongoConnection = await db.connectMongoDB();
    if (!mongoConnection) {
      throw new Error("MongoDB connection failed.");
    }

    // Generate a unique ID
    const counterResult = await mongoConnection.collection("collection_sequence").findOneAndUpdate(
      { _id: "interaction_log_id" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }
    );

    const Interaction_Log_ID = counterResult.value.seq;
    if (!Interaction_Log_ID) {
      return res.status(500).json({ message: "Failed to generate Interaction_Log_ID." });
    }

    const interactionData = {
      Interaction_Log_ID,
      Interaction_ID,
      User_Interaction_Type,
      parameters: dynamicParams, 
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
      Interaction_Log_ID,  
      data: interactionData,
    });
  } catch (error) {
    console.error("Error creating user interaction:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
