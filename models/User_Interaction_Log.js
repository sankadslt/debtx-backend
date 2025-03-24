import mongoose from "mongoose";

const interactionSchema = new mongoose.Schema(
  {
    doc_version : {type:Number, required: true, default: 1},
    Interaction_Log_ID: {
      type: Number,
      required: true,
      unique: true,
    },
    Interaction_ID: {
      type: Number,
      required: true,
    },
    User_Interaction_Type: {
      type: String,
      required: true,
    },
    CreateDTM: {
      type: Date,
      default: Date.now,
    },
    delegate_user_id: {
      type: String,
      required: true,
    },
    Created_By: {
      type: String,
      required: true,
    },
    User_Interaction_Status: {
      type: String,
      enum: ["Open", "Error", "Complete"],
      default: "open",
    },
    parameters: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
      default: {},
    },
    User_Interaction_Status_DTM: {
      type: Date,
      default: null,
    },
    Rejected_Reason: { type: String, default: null },
    Rejected_By: { type: String, default: null },
    // Request_Mode: {
    //   type: String,
    //   enum: ["Negotiation", "Mediation Board"],
    //   default: "null",
    // },
  },
  {
    collection: "User_Interaction_Log",
  }
);

const User_Interaction_Log = mongoose.model(
  "User_Interaction_Log",
  interactionSchema
);

export default User_Interaction_Log;
