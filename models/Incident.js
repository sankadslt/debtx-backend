import { Schema, model } from 'mongoose';

// Contact Details Schema
const contactDetailsSchema = new Schema({
    Contact_Type: { type: String, maxlength: 30, required: true },
    Contact: { type: String, maxlength: 30, required: true },
    Create_Dtm: { type: Date, required: true },
    Create_By: { type: String, maxlength: 30, required: true },
});

const productDetailsSchema = new Schema({
    Product_Label: { type: String, maxlength: 30, required: true },
    Customer_Ref: { type: String, maxlength: 30, required: true },
    Product_Seq: { type: Number, required: true },
    Equipment_Ownership: { type: String, maxlength: 30, required: true },
    Product_Id: { type: String, maxlength: 30, required: true },
    Product_Name: { type: String, maxlength: 30, required: true },


    product_status: { 
        type: String, 
        maxlength: 30,
        enum: ['Active', 'Terminated', 'Suspended', 'Inactive'], 
        required: true, 
        default: 'Active' 
      },

    Effective_Dtm: { type: Date, required: true },
    Service_Address: { type: String, maxlength: 255, required: true },
    Cat: { type: String, maxlength: 30, required: true },
    Db_Cpe_Status: { type: String, maxlength: 30, required: true },
    Received_List_Cpe_Status: { type: String, maxlength: 30, required: true },
    Service_Type: { type: String, maxlength: 30, required: true },
    Region: { type: String, maxlength: 30, default: '' },
    Province: { type: String, maxlength: 30, default: '' },
});

// Customer Details Schema
const customerDetailsSchema = new Schema({
    Customer_Name: { type: String, maxlength: 30, required: true },
    Company_Name: { type: String, maxlength: 30, required: true },
    Company_Registry_Number: { type: String, maxlength: 30, required: true },
    Full_Address: { type: String, maxlength: 255, required: true },
    Zip_Code: { type: String, maxlength: 30, required: true },
    Customer_Type_Name: { type: String, maxlength: 30, required: true },
    Nic: { type: String, maxlength: 30, required: true },
    Customer_Type_Id: { type: String, maxlength: 30, required: true },
});

// Markerting Details Schema
const markertingDetailsSchema = new Schema({
    ACCOUNT_MANAGER: { type: String, maxlength: 30, default: null },
    CONSUMER_MARKET: { type: String, maxlength: 30, default: null },
    Informed_To: { type: String, maxlength: 30, default: null },
    Informed_On: { type: Date, default: null },
});

// Account Details Schema
const accountDetailsSchema = new Schema({
    Account_Status: { type: String, maxlength: 30, required: true },
    Acc_Effective_Dtm: { type: Date, required: true },
    Acc_Activate_Date: { type: Date, required: true },
    Credit_Class_Id: { type: String, maxlength: 30, required: true },
    Credit_Class_Name: { type: String, maxlength: 30, required: true },
    Billing_Centre: { type: String, maxlength: 30, required: true },
    Customer_Segment: { type: String, maxlength: 30, required: true },
    Mobile_Contact_Tel: { type: String, maxlength: 30, required: true },
    Daytime_Contact_Tel: { type: String, maxlength: 30, required: true },
    Email_Address: { type: String, maxlength: 30, required: true },
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
        doc_version : {type:Number, required: true, default: 1},
        Incident_Id: { type: Number, required: true },
        Account_Num: { type: String, maxlength: 30, required: true },
        Arrears_Band: {type: String, maxlength: 30, required: true},
        Arrears: { type: Number, required: true },
        Created_By: { type: String, maxlength: 30, required: true },
        Created_Dtm: { type: Date, required: true },
        Incident_Status: { type: String, maxlength: 30, enum: ['Open','Reject','Done','Forward'], required: true },
        Incident_direction:{
            type:String,
            maxlength: 30,
            enum: ['Direct LOD', 'Incident Reject','Reject Pending', 'Open No Agent','Open CPE Collect'],
        },
        Source_Type: {
            type: String,
            maxlength: 30,
            required: true,
            enum: ["Pilot Suspended", "Product Terminate", "Special"], // Enum validation
        },
        Incident_Status_Dtm: { type: Date, required: true },
        Status_Description: { type: String, maxlength: 255, required: true },
        File_Name_Dump: { type: String, maxlength: 30, required: true },
        Batch_Id: { type: String, maxlength: 30, required: true },
        Batch_Id_Tag_Dtm: { type: Date, required: true },
        External_Data_Update_On: { type: Date, required: true },
        Filtered_Reason: { type: String, maxlength: 255, required: true },
        Export_On: { type: Date, required: true },
        File_Name_Rejected: { type: String, maxlength: 30, required: null },
        Rejected_Reason: { type: String, maxlength: 255, required: null },
        Rejected_By: { type: String, maxlength: 30, required: null },
        Rejected_Dtm: { type: Date, required: null },
        Incident_Forwarded_By: { type: String, maxlength: 30, required: true },
        Incident_Forwarded_On: { type: Date, required: true },
        Actions: { 
            type: String,
            maxlength: 30,
            required: true,
            enum: ["collect arrears", "collect arrears and CPE", "collect CPE"], // Enum validation
        },
        // Incident_Remark: { type: [String] },
        Incident_Remark: [{ type: String, maxlength: 255 }],
        Validity_period:{type:Number},
        Proceed_Dtm: { type: Date, default:null },
        Proceed_By: { type: String, maxlength: 30, required: null },
        Contact_Details: { type: [contactDetailsSchema], required: true },
        Product_Details: { type: [productDetailsSchema], required: true },
        Customer_Details: { type: customerDetailsSchema, required: true },
        Account_Details: { type: accountDetailsSchema, required: true },
        Last_Actions: { type: lastActionsSchema, required: true },
        Marketing_Details: { type: markertingDetailsSchema, required: true },
        current_arrears_band: { type: String, maxlength: 30, required:true,default: "Default Band"},
        drc_commision_rule: { type: String, maxlength: 30, required: true, default: "PEO TV" },
      
        
    },
    {
        collection: 'Incident', 
        timestamps: true,
    }
);

const Incident = model('Incident', incidentSchema);

export default Incident;
