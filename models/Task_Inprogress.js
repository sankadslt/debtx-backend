
// // Require Mongoose
// import mongoose from 'mongoose';

// // Define the Schema
// const taskSchema = new mongoose.Schema({
//   Task_Id: {
//     type: Number,
//     required: true,
//     unique: true
//   },
//   Template_Task_Id: {
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
//   Task_Id_Error: {
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
//   }
// },{
//     collection: 'System_tasks', // Specify the collection name
//     timestamps: true
// });

// // Create the Model
// const Task = mongoose.model('Task', taskSchema);

// // Export the Model
// export default Task;



// Require Mongoose
import mongoose from 'mongoose';

// Define the Schema
const task_inprogress_Schema = new mongoose.Schema({
  doc_version : {type:Number, required: true, default: 1},
  Task_Id: {
    type: Number,
    required: true,
    unique: true,
  },
  Template_Task_Id: {
    type: Number,
    required: true,
  },
  task_type: {
    type: String,
    maxlength: 255,
    required: true,
  },
  parameters: {
      type: Map,
      of: mongoose.Schema.Types.Mixed, // Allow different types for the map values (String, Number, Array, etc.)
      default: {},
      default: {},
    },
  Created_By: {
    type: String,
    maxlength: 30,
    required: true,
  },
  Execute_By: {
    type: String,
    maxlength: 30,
    default: null,
  },
  Sys_Alert_ID: {
    type: Number,
    default: null,
  },
  Interaction_ID_Success: {
    type: Number,
    default: null,
  },
  Interaction_ID_Error: {
    type: Number,
    default: null,
  },
  Task_Id_Error: {
    type: Number,
    default: null,
  },
  created_dtm: {
    type: Date,
    default: Date.now,
  },
  end_dtm: {
    type: Date,
    default: null,
  },
  task_status: {
    type: String,
    maxlength: 30,
    enum: ['open', 'inprogress', 'complete', 'close'], // Enum for task statuses
    default: 'open',
  },
  status_changed_dtm: {
    type: Date,
    default: null, // Updated when status changes
  },
  status_description: {
    type: String,
    maxlength: 255,
    default: '', // Optional field for additional status details
  },
}, {
  collection: 'System_tasks_Inprogress', // Specify the collection name
});

// Create the Model
const Task_Inprogress = mongoose.model('Task_Inprogress', task_inprogress_Schema);

// Export the Model
export default Task_Inprogress;

