import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

const casemonitorlogSchema = new Schema({
  doc_version : {type:Number, required: true, default: 1},
  case_id: { type: Number, required: true },
  Case_Phase: { type: String, required: true },
  created_dtm: { type: Date, required: true },
  Monitor_Expire_Dtm: { type: Date, required: true  },
  Last_Monitor_Dtm: { type: Date, required: true },
},
{
  collection: 'Case_Monitor_Log',
  timestamps: true
});

const case_monitor_log = model("case_monitor_log", casemonitorlogSchema);

export default case_monitor_log;