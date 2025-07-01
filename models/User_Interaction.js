
// // Require Mongoose
// import mongoose from 'mongoose';

// // Define the Schema
// const caseUserInteractionSchema = new mongoose.Schema({
//   User_Interaction_Id: {
//     type: Number,
//     required: true,
//     unique: true
//   },
//   Case_User_Interaction_id: {
//     type: Number,
//     required: true
//   },
//   parameters: {
//     type: Map,
//     of: String, // The value type for the map
//     default: {},
//   },
//   Created_By: {
//     type: String,
//     required: true
//   },
//   Execute_By: {
//     type: String,
//     default: null
//   },
//   Sys_Alert_ID: {
//     type: Number,
//     default: null
//   },
//   Interaction_ID_Success: {
//     type: Number,
//     default: null
//   },
//   Interaction_ID_Error: {
//     type: Number,
//     default: null
//   },
//   User_Interaction_Id_Error: {
//     type: Number,
//     default: null
//   },
//   created_dtm: {
//     type: Date,
//     default: Date.now
//   },
//   end_dtm: {
//     type: Date,
//     default: null
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'open', 'reject', 'close'], // Enum for task statuses
//     default: 'pending',
//   },
//   status_changed_dtm: {
//     type: Date,
//     default: null, // Updated when status changes
//   },
//   status_description: {
//     type: String,
//     default: '', // Optional field for additional status details
//   },
// },{
//     collection: 'Case_User_Interaction_template', // Specify the collection name
//     timestamps: true
// });

// // Create the Model
// const UserInteraction = mongoose.model('UserInteraction', caseUserInteractionSchema);

// // Export the Model
// export default UserInteraction;


import { Schema, model } from 'mongoose';

const caseUserInteractionSchema = new Schema({
  doc_version : {type:Number, required: true, default: 1},
  User_Interaction_id: {
    type: Number,
    required: true,
  },
  Case_User_Interaction_id: {
    type: Number,
    required: true
  },
  parameters: {
    type: Map,
    of: Number, // The value type for the map
    default: {},
  },
  Created_By: {
    type: String,
    maxlength: 30,
    required: true
  },
  Execute_By: {
    type: String,
    maxlength: 30,
    default: null
  },
  Sys_Alert_ID: {
    type: Number,
    default: null
  },
  Interaction_ID_Success: {
    type: Number,
    default: null
  },
  Interaction_ID_Error: {
    type: Number,
    default: null
  },
  User_Interaction_Id_Error: {
    type: Number,
    default: null
  },
  created_dtm: {
    type: Date,
    default: Date.now
  },
  end_dtm: {
    type: Date,
    default: null
  },
  User_Interaction_status: {
    type: String,
    maxlength: 30,
    enum: ['pending', 'open', 'reject', 'close'], 
    default: 'pending',
  },
  User_Interaction_status_changed_dtm: {
    type: Date,
    default: null, 
  },
  status_description: {
    type: String,
    maxlength: 255,
    default: '', 
  },
},{
    collection: 'System_Case_User_Interaction', 
    timestamps: true
});


const System_Case_User_Interaction = model('System_Case_User_Interaction', caseUserInteractionSchema);


export default System_Case_User_Interaction;
