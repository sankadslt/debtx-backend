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

const serviceSchema = new Schema({
    doc_version : {type:Number, required: true, default: 1},
    service_id: {
        type: Number, 
        required: true, 
        unique: true 
    },
    service_type: {
        type: String, 
        required: true,
        unique: true 
    },
    service_status: {
        type: [statusSchema], // Status array with subfields
        required: true,
    },
    created_by: {
        type: String,
        require: true
    },
    created_on: {
        type: Date,
        required: true,
        default: Date.now
    },
    service_end_date: {
        type: Date,
        default: null
    },
    service_end_by: {
        type: String,
        default: null
    },
    // updated_service: {
    //     type: [updatedSchema], // Remark array with date and editor
    //     default: [], // Default empty array
    // },
}, {
    collection: 'Services', // Specify the collection name
    timestamps: true
});

const Service = model('Service', serviceSchema);

export default Service;
