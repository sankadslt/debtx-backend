import { Schema, model } from 'mongoose';

const incidentLogSchema = new Schema({
    doc_version : {type:Number, required: true, default: 1},
    Incident_Id: { type: Number, required: true, unique: true },
    Account_Num: { type: String, required: true },
    Incident_Status: { type: String, enum: ['Incident Open','Reject','Incident Done','incident Error','Incident In progress'], required: true },
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

    // Add Contact_Number only when DRC_Action is "collect CPE"
    Contact_Number: { type: String},
    
    file_name_dump: { type: String }
}, {
    collection: 'Incident_log', // Specify the collection name
});

const Incident_log = model('Incident_log', incidentLogSchema);

export default Incident_log;
