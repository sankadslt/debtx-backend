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
        maxlength: 30,
        required: true,
        unique: true 
    },
    service_status: {
        type: String, 
        maxlength: 30,
        enum: ['Active', 'Inactive'], 
        default: 'Active'
    },
    create_by: {
        type: String, 
        maxlength: 30,
        required: true
    },
    create_on: {
        type: Date, 
        required: true, 
        default: Date.now
    }
}, {
    collection: 'Services', // Specify the collection name
    timestamps: true
});

const Service = model('Service', serviceSchema);

export default Service;
