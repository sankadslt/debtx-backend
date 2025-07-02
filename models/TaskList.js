import mongoose from "mongoose";

const taskListSchema = new mongoose.Schema(
  {
    doc_version : {type:Number, required: true, default: 1},
    task: {
      type: String,
      maxlength: 30,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    url: {
      type: String,
      maxlength: 255,
      required: true,
    },
    user_id: {
      type: String,
      maxlength: 30,
      required: true,
    },
    created_by: {
      type: String,
      maxlength: 30,
      required: true,
    },
    
  },
  { timestamps: true }
);

const TaskList = mongoose.model("TaskList", taskListSchema);

export default TaskList;
