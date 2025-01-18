import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

const tasktemplateSchema = new Schema({
  task_id: { type: Number, required: true },
  task_type: { type: String, required: true },
  parameters: [{ type: String }]
},{
    collection: 'Templete_tasks', 
});

const TaskType = model('TaskType', tasktemplateSchema);

export default TaskType;
