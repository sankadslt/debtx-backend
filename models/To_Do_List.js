import { mongoose } from "mongoose";
const { Schema } = mongoose;

const To_Do_ListSchema = new Schema({
    doc_version: { type: Number, required: true, default: 1 },
    ToDoID: { type: Number, required: true, unique: true },
    Process: { type: String, maxlength: 200, required: true },
    created_DTM: { type: Date, default: Date.now },
    end_DTM: { type: Date, default: null },
    parameters: [{ type: String, maxlength: 50 }]
});

const To_Do_List = mongoose.model('To_Do_List', To_Do_ListSchema);

export default To_Do_List;