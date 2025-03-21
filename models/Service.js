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
        enum: ['Active', 'Inactive', 'Pending'], 
        default: 'Active'
    }
}, {
    collection: 'Services', // Specify the collection name
    timestamps: true
});

const Service = model('Service', serviceSchema);

export default Service;
