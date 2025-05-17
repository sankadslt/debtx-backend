/* Purpose: This template is used for the RTOM Controllers.
Created Date: 2025-05-17
Created By: Sasindu Srinayaka (sasindusrinayaka@gmail.com)
Version: Node.js v20.11.1
Related Files: 
Notes:  */

// model - Rtom.js
import { Schema, model } from 'mongoose';

// Main schema for RTOM
const userApprovalSchema = new Schema({
    doc_version : {type:Number, required: true, default: 1},
    approval_id: {
        type: Number, 
        required: true, 
        unique: true
    },
    user_type: {
        type: String, 
        enum: ['RO', 'DRC'], 
        required: true
    },
    drc_id: {
        type: Number, 
        required: true
    },
    ro_id: {
        type: Number, 
        required: true
    },
    user_id: {
        type: Number, 
        enum: ['Email', 'Phone'],
        required: true
    },
    user_name: {
        type: String, 
        required: true
    }
}, 
{
    collection: 'User_Approval', // Specify the collection name
    // timestamps: true
});

const User_Approval = model('User_Approval', userApprovalSchema);

export default User_Approval;
