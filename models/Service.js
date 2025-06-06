import { Schema, model } from 'mongoose';

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
        type: String, 
        enum: ['Active', 'Inactive', 'Terminate'], 
        default: 'Active'
    },
    create_by: {
        type: String, 
        required: true
    },
    create_on: {
        type: Date, 
        required: true, 
        default: Date.now
    },
    service_end_dtm: {
        type: Date, 
        default: null
    },
    service_end_by: {
        type: String, 
        default: null
    },
}, {
    collection: 'Services', // Specify the collection name
    timestamps: true
});

const Service = model('Service', serviceSchema);

export default Service;
