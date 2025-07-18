import mongoose from "mongoose";

const CaseSchema = new mongoose.Schema({
  doc_version : {type:Number, required: true, default: 1},
  case_id: { type: Number, required: true, unique: true },
  DRC: { type: String, maxlength: 30, required: true },
  case_details: { type: String },
  case_status: { type: String, maxlength: 30, enum: ["Open", "Closed", "Pending"], required: true },
  assigned_date: { type: Date, required: true },
});

export default mongoose.model("CaseModel", CaseSchema);
