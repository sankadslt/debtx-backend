import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

const tasktemplateSchema = new Schema({
  doc_version : {type:Number, required: true, default: 1},
  task_id: { type: Number, required: true },
  task_type: { type: String, maxlength: 30, required: true },
  parameters: [{ type: String, maxlength: 30 }]
},{
    collection: 'Templete_tasks', 
});

const TaskType = model('TaskType', tasktemplateSchema);

export default TaskType;
