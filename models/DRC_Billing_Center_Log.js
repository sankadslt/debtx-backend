import { Schema, model } from 'mongoose';

const drcBillingCenterLogSchema = new Schema({
    doc_version : {
        type:Number, 
        required: true, 
        default: 1
    },
    billing_center_log_id: {
        type: Number,
        required: true,
        unique: true
    },
    drc_id: {
        type: Number,
        required: true
    },
    rtom_id: {
        type: Number,
        required: true
    },
    rtom_status: {
        type: String,
        maxlength: 255,
        enum: ["Active", "Inactive"],
        default: "Active",
    },
    handling_type: {
        type: String,
        maxlength: 255,
        required: true,
        enum: ["CPE", "Arrears", "All-Type"]
    },
    status_update_by: {
        type: String,
        maxlength: 255,
        required: true
    },
    status_update_dtm: {
        type: Date,
        required: true
    },
}, {
    collection: 'DRC_Billing_Center_Log', // Specify the collection name
    timestamps: true
});

const DRC_Billing_Center_Log = model('DRC_Billing_Center_Log', drcBillingCenterLogSchema);

export default DRC_Billing_Center_Log;
