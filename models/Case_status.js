import { mongoose } from "mongoose";
const { Schema } = mongoose;

const Case_statusSchema = new Schema({
    doc_version: { type: Number, required: true, default: 1 },
    ToDoID: { type: Number, required: true, unique: true },
    case_status: { type: String, required: true },
    case_phase: { type: String, required: true },
    end_DTM: { type: Date, default: null },
     
});

const Case_status = mongoose.model('Case_status', Case_statusSchema);

export default Case_status;
