import { Schema, model } from 'mongoose';

const incidentLogSchema = new Schema(
  {
    Incident_Id: { type: Number, required: true, unique: true },
    Account_Num: { type: String, required: true },
    Incident_Status: {
      type: String,
      enum: ['Incident Open', 'Incident Reject'],
      required: true,
    },
    Actions: {
      type: String,
      required: true,
      enum: ['collect arrears', 'collect arrears and CPE', 'collect CPE'],
    },
    Monitor_Months: { type: Number, required: true },
    Created_By: { type: String, required: true },
    Created_Dtm: { type: Date, required: true, default: Date.now }, // Default to current timestamp
    Source_Type: {
      type: String,
      required: true,
      enum: ['Pilot Suspended', 'Product Terminate', 'Special'],
    },
    Rejected_Reason: { type: String, default: null }, // Optional field, null by default
    Rejected_By: { type: String, default: null },
    Rejected_Dtm: { type: Date, default: null },
  },
  {
    collection: 'Incident_log',
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const Incident_log = model('Incident_log', incidentLogSchema);

export default Incident_log;
