import mongoose, { model } from "mongoose";
const { Schema } = mongoose;

const caseinquirySchema = new Schema(
  {
    doc_version: { type: Number, required: true, default: 1 },
    Call_Inquiry_seq: { type: Number, required: true },
    case_id: { type: Number, required: true },
    Call_Topic: { type: String, maxlength: 50, required: true },
    Case_Phase: { type: String, maxlength: 30, required: true },
    created_by: { type: String, maxlength: 30, required: true },
    created_dtm: { type: Date, required: true },
    Call_Inquiry_Remark: { type: String, maxlength: 225, required: true },
    DRC_ID: { type: Number, required: true },
  },
  {
    collection: "Case_Inquiry",
    timestamps: true,
  }
);

const case_inquiry = model("Case_Inquiry", caseinquirySchema);

export default case_inquiry;
