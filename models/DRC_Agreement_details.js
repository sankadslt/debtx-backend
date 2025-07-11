import { Schema, model } from 'mongoose';

const drcAgreementDetailsSchema = new Schema({
    doc_version : {
        type:Number, 
        required: true, 
        default: 1
    },
    agreement_id: {
        type: Number,
        required: true,
        unique: true
    },
    drc_id: {
        type: Number,
        required: true
    },
    agreement_start_dtm: {
        type: Date,
        default: null,
    },
    agreement_end_dtm: {
        type: Date,
        default: null,
    },
    agreement_status: {
        type: String,
        enum: ['Approved', 'Rejected', 'Pending', 'Expired', 'Terminate'],
        required: true
    },
    agreement_remark: {
        type: String,
        maxlength: 255,
        default: null,
    },
    agreement_update_by: {
        type: String,
        maxlength: 255,
        required: true
    },
    agreement_update_dtm: {
        type: Date,
        required: true
    },
}, {
    collection: 'DRC_Agreement_Details', // Specify the collection name
    timestamps: true
});

const DRC_Agreement_Details = model('DRC_Agreement_Details', drcAgreementDetailsSchema);

export default DRC_Agreement_Details;
