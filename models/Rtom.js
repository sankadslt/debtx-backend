/* Purpose: This template is used for the RTOM Controllers.
Created Date: 2024-12-11 
Created By: Ravindu Pathum (ravindupathumiit@gmail.com)
Last Modified Date: 2024-12-31
Modified By: Sasindu Srinayaka (sasindusrinayaka@gmail.com)
Version: Node.js v20.11.1
Dependencies: mysql2
Related Files: RTOM_route.js and Rtom.js
Notes:  */

// model - Rtom.js
import { Schema, model } from 'mongoose';

// // Sub-schema for remarks
// const updatedSchema = new Schema({
//     updated_remark: {
//         type: String,
//         required: true,
//     },
//     updated_date: {
//         type: Date, // Save date in day/month/year format
//         required: true,
//     },
//     updated_by: {
//         type: String,
//         required: true,
//     },
// });


// Sub-schema for remarks
const remarkSchema = new Schema({
    remark: {
        type: String,
        required: true,
    },
    remark_date: {
        type: Date, // Save date in day/month/year format
        required: true,
    },
    remark_by: {
        type: String,
        required: true,
    },
});

// Sub-schema for status updates
const statusSchema = new Schema({
    status: {
        type: String, 
        enum: ['Active', 'Inactive', 'Pending'], 
        default: 'Active',
        required: true,
    },
    status_on: {
        type: Date, // Save date in day/month/year format
        required: true,
    },
    status_by: {
        type: String,
        required: true,
    },
});

// Main schema for RTOM
const rtomSchema = new Schema({
    doc_version : {type:Number, required: true, default: 1},
    rtom_id: {
        type: Number, 
        required: true, 
        unique: true
    },
    billing_center_Code: {
        type: String, 
        required: true 
    },
    rtom_name: {
        type: String, 
        required: true
    },
    area_code: {
        type: String, 
        required: true
    },
    rtom_email: {
        type: String, 
        required: true
    },
    rtom_contact_type: {
        type: String,
        enum: ['Telephone', 'Mobile'],
        required: true
    },
    rtom_contact_no:{
        type: Number,
        required: true
    },
    created_by: {
        type: String,
        required: true
    },
    created_on: {
        type: Date,
        required: true
    },
    rtom_end_date: {
        type: Date,
        default: null
    },
    rtom_end_by: {
        type: String,
        required: true
    },
    rtom_status: {
        type: [statusSchema], // Status array with subfields
        required: true
    },
    rtom_remarks: {
        type: [remarkSchema], // Remarks array with subfields
        required: true
    },
    // updated_rtom: {
    //     type: [updatedSchema], // Remark array with date and editor
    //     default: [], // Default empty array
    // },
}, 
{
    collection: 'Rtom', 
    // timestamps: true
});

const RTOM = model('RTOM', rtomSchema);

export default RTOM;
