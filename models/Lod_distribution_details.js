import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

const lodDistributionDetailsSchema = new Schema({
    lod_distribution_id: {type: Number,required: true,},
    // distribution_dtm: {type: Date,required: true,},
    case_id:   {type: Number,required: true,},
    // created_by:   {type: String,required: true,},
    // dowloaded_by: {type: String,required: true,},
    // dowloaded_on: {type: Date,required: true,},
},
{
    collection: 'Lod_distribution_details', 
    timestamps: true,
}
);

const LOD_distribution_details = model('Lod_distribution_details', lodDistributionDetailsSchema);

module.exports = LOD_distribution_details;
