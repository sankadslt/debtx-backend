import mongoose from 'mongoose';

const StatusSchema = new mongoose.Schema({
  User_Interaction_Status: {type: String, enum: ["Open", "Error", "Complete", "Seen"], default: "open"},
  created_dtm: { type: Date, required: true },
}, { _id: false });

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
        enum: ['Open', 'Error', 'Complete'], 
        default: 'open',
      },
    User_Interaction_Status: [StatusSchema],
    parameters: {
        type: Map,
        of: mongoose.Schema.Types.Mixed, 
        default: {},
        default: {},
    },
    Rejected_Reason: { type: String, default: null },
    Rejected_By: { type: String, default: null },
  },
  {
    collection: 'User_Interaction_Progress_Log', 
  }
);


const User_Interaction_Progress_Log = mongoose.model('User_Interaction_Progress_Log', interactionSchema);


export default User_Interaction_Progress_Log;