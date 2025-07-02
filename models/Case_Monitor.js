import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

const casemonitorSchema = new Schema({
  doc_version : {type:Number, required: true, default: 1},
  case_id: { type: Number, required: true },
  Case_Phase: { type: String, maxlength: 30, required: true },
  created_dtm: { type: Date, required: true },
  created_by: { type: String, maxlength: 30, required: true },
  Monitor_Expire_Dtm: { type: Date, required: true  },
  Last_Monitor_Dtm: { type: Date, required: true },
  Last_Request_On: { type: Date, required: true },
},
{
  collection: 'Case_Monitor',
  timestamps: true
});

const case_monitor = model("case_monitor", casemonitorSchema);

export default case_monitor;
