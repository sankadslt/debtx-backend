import { Schema, model } from "mongoose";

const installmentSchema = new Schema({
  installment_seq: { type: Number, required: true },
  Installment_Settle_Amount: Number,
  Plan_Date: Date,
  Payment_Seq: Number,
  Installment_Paid_Amount: Number
});

const casesettlementSchema = new Schema({
  settlement_id: { type: Number, required: true, unique: true },
  case_id: { type: Number, required: true },
  created_by: { type: String, required: true },
  created_dtm: { type: Date, default: Date.now },
  settlement_phase: {
    type: String,
    enum: ["Negotiation", "Mediation Board", "LOD", "Litigation", "WRIT"]
  },
  settlement_status: {
    type: String,
    enum: ["Open", "Open_Pending", "Active", "WithDraw", "Completed"]
  },
  status_dtm: { type: Date, default: Date.now },
  status_reason: { type: String },
  settlement_type: {
    type: String,
    enum: ["type A", "type B"]
  },
  settlement_amount: { type: Number, required: true },
  drc_id: { type: Number },
  ro_id: { type: Number },
  last_monitoring_dtm: { type: Date },
  settlement_plan_received: [],
  settlement_plan: [installmentSchema],
  settlement_occured: { type: Date },
  expire_date: { type: Date },
  remark: { type: String },
},{
    collection: 'Case_settlements',
  }
);

const CaseSettlement = model("CaseSettlement", casesettlementSchema);

export default CaseSettlement;
