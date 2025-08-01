import { Schema, model } from 'mongoose';

const incidentLogSchema = new Schema({
    doc_version : {type:Number, required: true, default: 1},
    Incident_Id: { type: Number, default: null },
    Incident_Log_Id: { type: Number, required: true, unique: true },
    Account_Num: { type: String, maxlength: 30, required: true },
    Incident_Status: { type: String, maxlength: 30, enum: ['Incident Open','Reject','Complete','Incident Error','Incident InProgress'], required: true },
    Incident_Status_Dtm: { type: Date, required: true }, 
    Status_Reason: { type: String, maxlength: 255, default: null },
    Actions: {
        type: String,
        maxlength: 30,
        required: true,
        enum: ["collect arrears", "collect arrears and CPE", "collect CPE"], // Enum validation
    },
    Monitor_Months: { type: Number, required: true }, // New field
    Created_By: { type: String, maxlength: 30, required: true },
    Created_Dtm: { type: Date, required: true },
    Source_Type: {
        type: String,
        maxlength: 30,
        required: true,
        enum: ["Pilot Suspended", "Product Terminate", "Special"], // Enum validation
    },
    Incident_Required_Reason:{
        type:String
    },
    Rejected_Reason: { type: String, maxlength: 255, required: null },
    Rejected_By: { type: String, maxlength: 30, required: null },
    Rejected_Dtm: { type: Date, required: null },

    // Add Contact_Number only when DRC_Action is "collect CPE"
    Contact_Number: { type: String, maxlength: 30 },
    
    file_name_dump: { type: String, maxlength: 30 }
}, {
    collection: 'Incident_log', // Specify the collection name
});

const Incident_log = model('Incident_log', incidentLogSchema);

export default Incident_log;
