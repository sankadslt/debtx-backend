import { Schema, model } from 'mongoose';

const incidentLogSchema = new Schema({
    Incident_Id: { type: Number, required: true, unique: true },
    Account_Num: { type: String, required: true },
    Incident_Status: { type: String, enum: ['Incident Open', 'Incident Reject'], required: true },
    Actions: {
        type: String,
        required: true,
        enum: ["collect arrears", "collect arrears and CPE", "collect CPE"], // Enum validation
    },
    Monitor_Months: { type: Number, required: true }, // New field
    Created_By: { type: String, required: true },
    Created_Dtm: { type: Date, required: true },
    Source_Type: {
        type: String,
        required: true,
        enum: ["Pilot Suspended", "Product Terminate", "Special"], // Enum validation
      },    
    Rejected_Reason: { type: String, required: null },
        Rejected_By: { type: String, required: null },
        Rejected_Dtm: { type: Date, required: null },
},{
    collection: 'Incident_log', // Specify the collection name
});

const Incident_log = model('Incident_log', incidentLogSchema);

export default Incident_log;
