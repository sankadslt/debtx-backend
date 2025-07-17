import { mongoose } from "mongoose";
const { Schema } = mongoose;

const Case_PhasesSchema = new Schema({
    doc_version: { type: Number, required: true, default: 1 },
    case_status: { type: String, maxlength: 30, required: true },
    case_phase: { type: String, maxlength: 30, required: true },
    end_dtm: { type: Date, default: null },
     
});

const Case_Phases = mongoose.model('Case_Phases', Case_PhasesSchema);

export default Case_Phases;
