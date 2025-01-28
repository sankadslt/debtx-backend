import mongoose from 'mongoose';


const interactionSchema = new mongoose.Schema(
  {
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
      type: Number,
      required: true,
    },
    Created_By: {
      type: String,
      required: true,
    },
    User_Transaction_Status: {
        type: String,
        enum: ['Open', 'Error', 'Complete'], 
        default: 'open',
      },
    parameters: {
        type: Map,
        of: mongoose.Schema.Types.Mixed, 
        default: {},
        default: {},
    },
    Transaction_Status_DTM: {
      type: Date,
      default:null
    },
  },
  {
    collection: 'User_Interaction_Progress_Log', 
  }
);


const User_Interaction_Progress_Log = mongoose.model('User_Interaction_Progress_Log', interactionSchema);


export default User_Interaction_Progress_Log;