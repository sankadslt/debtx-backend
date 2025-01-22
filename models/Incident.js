import { Schema, model } from 'mongoose';

// Contact Details Schema
const contactDetailsSchema = new Schema({
    Contact_Type: { type: String, required: true },
    Contact: { type: String, required: true },
    Create_Dtm: { type: Date, required: true },
    Create_By: { type: String, required: true },
});

const productDetailsSchema = new Schema({
    Product_Label: { type: String, required: true },
    Customer_Ref: { type: String, required: true },
    Product_Seq: { type: Number, required: true },
    Equipment_Ownership: { type: String, required: true },
    Product_Id: { type: String, required: true },
    Product_Name: { type: String, required: true },
    Product_Status: { type: String, enum: ['Active', 'Terminated', 'Suspened'], required: true },
    Effective_Dtm: { type: Date, required: true },
    Service_Address: { type: String, required: true },
    Cat: { type: String, required: true },
    Db_Cpe_Status: { type: String, required: true },
    Received_List_Cpe_Status: { type: String, required: true },
    Service_Type: { type: String, required: true },
    Region: { type: String, default: '' },
    Province: { type: String, default: '' },
});

// Customer Details Schema
const customerDetailsSchema = new Schema({
    Customer_Name: { type: String, required: true },
    Company_Name: { type: String, required: true },
    Company_Registry_Number: { type: String, required: true },
    Full_Address: { type: String, required: true },
    Zip_Code: { type: String, required: true },
    Customer_Type_Name: { type: String, required: true },
    Nic: { type: String, required: true },
    Customer_Type_Id: { type: String, required: true },
});

// Account Details Schema
const accountDetailsSchema = new Schema({
    Account_Status: { type: String, required: true },
    Acc_Effective_Dtm: { type: Date, required: true },
    Acc_Activate_Date: { type: Date, required: true },
    Credit_Class_Id: { type: String, required: true },
    Credit_Class_Name: { type: String, required: true },
    Billing_Centre: { type: String, required: true },
    Customer_Segment: { type: String, required: true },
    Mobile_Contact_Tel: { type: String, required: true },
    Daytime_Contact_Tel: { type: String, required: true },
    Email_Address: { type: String, required: true },
    Last_Rated_Dtm: { type: Date, required: true },
});

// Last Actions Schema
const lastActionsSchema = new Schema({
    Billed_Seq: { type: Number, required: true },
    Billed_Created: { type: Date, required: true },
    Payment_Seq: { type: Number, required: true },
    Payment_Created: { type: Date, required: true },
});

// Main Incident Schema
const incidentSchema = new Schema(
    {
        Incident_Id: { type: Number, required: true },
        Account_Num: { type: String, required: true },
        Arrears: { type: Number, required: true },
        Created_By: { type: String, required: true },
        Created_Dtm: { type: Date, required: true },
        Incident_Status: { type: String, enum: ['Incident Open', 'Incident Reject'], required: true },
        Incident_Status_Dtm: { type: Date, required: true },
        Status_Description: { type: String, required: true },
        File_Name_Dump: { type: String, required: true },
        Batch_Id: { type: String, required: true },
        Batch_Id_Tag_Dtm: { type: Date, required: true },
        External_Data_Update_On: { type: Date, required: true },
        Filtered_Reason: { type: String, required: true },
        Export_On: { type: Date, required: true },
        File_Name_Rejected: { type: String, required: null },
        Rejected_Reason: { type: String, required: null },
        Rejected_By: { type: String, required: null },
        Rejected_Dtm: { type: Date, required: null },
        Incident_Forwarded_By: { type: String, required: true },
        Incident_Forwarded_On: { type: Date, required: true },
        Actions: {type: String},
        Incident_Remark: { type: [String] },
        Validity_period:{type:Number},
        Contact_Details: { type: [contactDetailsSchema], required: true },
        Product_Details: { type: [productDetailsSchema], required: true },
        Customer_Details: { type: customerDetailsSchema, required: true },
        Account_Details: { type: accountDetailsSchema, required: true },
        Last_Actions: { type: lastActionsSchema, required: true },
        current_arrears_band: { type: String, required:true },
        drc_commision_rule:{ type: String, required:true },

    },
    {
        collection: 'Incident', 
        timestamps: true,
    }
);

const Incident = model('Incident', incidentSchema);

export default Incident;
