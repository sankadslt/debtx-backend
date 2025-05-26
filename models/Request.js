import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

const requestSchema = new Schema({
  doc_version : {type:Number, required: true, default: 1},
  Interaction_Log_ID: { type: Number, required: true, unique: true },
  Request_Description: { type: String, required: true },
  created_dtm: { type: Date, required: true },
  created_by: { type: String, required: true },
  case_id: { type: Number, required: true },
  Intraction_ID: { type: Number, required: true },
  parameters: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
    default: {},
  },
},
{
  collection: 'Request',
  timestamps: true
});

const request = model("request", requestSchema);

export default request;
