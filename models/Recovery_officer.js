import { Schema, model } from 'mongoose';

const remarkSchema = new Schema({
    remark: {
        type: String,
        maxlength: 255,
        required: true,
    },
    remark_by: {
        type: String,
        maxlength: 30,
        required: true,
    },
    remark_dtm: {
        type: Date,
        required: true,
    },
});

const rtomforRoSchema = new Schema({
    rtom_id: {
        type: Number,
        required: true,
    },
    rtom_name: {
        type: String,
        maxlength: 30,
        required: true,
    },
    rtom_status: {
        type: String,
        maxlength: 30,
        enum: ['Active', 'Inactive'],
        default: "Active",
    },
    billing_center_code: {
        type: String,
        maxlength: 30,
        required: true,
    },
    rtom_update_dtm: {
        type: Date,
        required: true,
    },
    rtom_update_by: {
        type: String,
        maxlength: 30,
        required: true,
    },
    rtom_end_dtm: {
        type: Date,
        default: null,
    },
    handling_type: {
        type: String,
        maxlength: 30,
        default: null,
    },
});

const roSchema = new Schema({

        doc_version : {type: Number, required: true, default: 1},
    
        drc_id:{
            type: Number,
            required: true,
        },
        ro_id: {
            type: Number,
            unique: true,
            sparse: true,
        },
        drcUser_id: {
            type: Number,
            unique: true,
            sparse: true,
        },
        ro_name:{
            type: String,
            maxlength: 30,
            required: true,
        },
        login_email: {
            type: String,
            maxlength: 30,
            default: null,
        },
        login_contact_no: {
            type: String,
            maxlength: 30,
            required: true,
        },
        login_contact_no_two: {
            type: String,
            maxlength: 30,
            default: null,
        },
        nic: {
            type: String,
            maxlength: 30,
            required: true,
        },
        drcUser_type: {
            type: String,
            maxlength: 30,
            enum: ['RO', 'drcUser'],
            required: true,
        },
        user_role: {
            type: String,
            enum: ['DRC Coordinator', 'call center', 'user staff'],  
            default: null,
            maxlength: 30
        },
    
        drcUser_status: {
            type: String,
            maxlength: 30,
            enum: ['Active', 'Inactive', 'Terminate','Pending_approval'],
            default: "Active",
        },
        create_dtm:{
            type: Date,
            required: true,
        },
        create_by:{
            type: String,
            maxlength: 30,
            required: true,
        },
        end_dtm:{
            type: Date,
            default: null,
        },
        end_by:{
            type: String,
            maxlength: 30,
            default: null,
        },
        rtom: {
            type:[rtomforRoSchema],
            default: [],
        },
        remark: {
            type: [remarkSchema],
            default: [],
        },
    },{

         collection: 'Recovery_officer',
         timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },

});

const RecoveryOfficer = model('Recovery_officer', roSchema);

export default RecoveryOfficer;