// /* Purpose: This template is used for the RTOM Controllers.
// Created Date: 2024-12-11 
// Created By: Ravindu Pathum (ravindupathumiit@gmail.com)
// Last Modified Date: 2024-12-31
// Modified By: Sasindu Srinayaka (sasindusrinayaka@gmail.com)
// Version: Node.js v20.11.1
// Dependencies: mysql2
// Related Files: RTOM_route.js and Rtom.js
// Notes:  */

// // model - Rtom.js
// import { Schema, model } from 'mongoose';

// // Sub-schema for remarks
// const updatedSchema = new Schema({
//     action: {
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

// // Main schema for RTOM
// const rtomSchema = new Schema({
//     doc_version : {type:Number, required: true, default: 1},
//     rtom_id: {
//         type: Number, 
//         required: true, 
//         unique: true
//     },
//     rtom_abbreviation: {
//         type: String, 
//         required: true 
//     },
//     area_name: {
//         type: String, 
//         required: true
//     },
//     rtom_status: {
//         type: String,
//         enum: ['Active', 'Inactive', 'Terminate'],
//         required: true
//     },
//     rtom_contact_number:{
//         type: Number,
//         required: true
//     },
//     rtom_fax_number: {
//         type: Number,
//         required: true
//     },
//     updated_rtom: {
//         type: [updatedSchema], // Remark array with date and editor
//         default: [], // Default empty array
//     },
//     created_by: {
//         type: String,
//         required: true
//     },
//     rtom_end_date: {
//         type: Date,
//         default: null
//     },
//     created_dtm: {
//         type: Date,
//         required: true
//     }
// }, 
// {
//     collection: 'Rtom', 
//     // timestamps: true
// });

// const RTOM = model('RTOM', rtomSchema);

// export default RTOM;

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

// Sub-schema for Telephone numbers
const telephoneNumberSchema = new Schema({
    telephone_number: {
        type: Number,
        required: true,
    }
});

// Sub-schema for mobile numbers
const mobileNumberSchema = new Schema({
    mobile_number: {
        type: Number,
        required: true,
    }
});

// Main schema for RTOM
const rtomSchema = new Schema({
    doc_version : {type:Number, required: true, default: 1},
    rtom_id: {
        type: Number, 
        required: true, 
        unique: true
    },
    billing_center_code: {
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
    rtom_mobile_no: {
        type: [mobileNumberSchema], // Mobile number with subfields
        default: [], // Default empty array
    },
    rtom_telephone_no: {
        type: [telephoneNumberSchema], // Telephone number with subfields
        default: [], // Default empty array
    },
    created_by: {
        type: String,
        required: true
    },
    created_on: {
        type: Date,
        required: true
    },
    rtom_status: {
        type: String,
        enum: ['Active', 'Inactive', 'Terminate'],
        required: true
    },
    rtom_end_date: {
        type: Date,
        default: null
    },
    rtom_end_by: {
        type: String,
        default: null
       
    },
    rtom_remarks: {
        type: [remarkSchema], // Remarks array with subfields
        required: true
    },
},
{
    collection: 'Rtom', 
    // timestamps: true
});

const RTOM = model('RTOM', rtomSchema);

export default RTOM;