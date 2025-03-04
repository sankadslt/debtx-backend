import { Schema, model } from 'mongoose';

const requestSchema = new Schema({
  RO_Request_Id: { type: Number, required: true, unique: true },
  Request_Description: { type: String, required: true },
  created_dtm: { type: Date, required: true },
  created_by: { type: String, required: true },
  Request_Mode: {
    type: String,
    enum: ["Negotiation", "Mediation Board"],
    default: "null",
  },
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
