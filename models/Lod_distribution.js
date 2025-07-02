import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

const lodDistributionSchema = new Schema({
    lod_distribution_id: {type: Number,required: true,},
    distribution_dtm: {type: Date,required: true,},
    case_count:   {type: Number,required: true,},
    created_by:   {type: String, maxlength: 30, required: true,},
    dowloaded_by: {type: String, maxlength: 30, required: true,},
    dowloaded_on: {type: Date,required: true,},
},
{
    collection: 'Lod_distribution', 
    timestamps: true,
}
);

const LODDistribution = model('LOD_Distribution', lodDistributionSchema);

module.exports = LODDistribution;
