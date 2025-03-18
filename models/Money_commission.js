import { Schema, model } from "mongoose";

const moneyCommissionSchema = new Schema({
  doc_version : {type:Number, required: true, default: 1},
  commission_id: { type: Number, required: true, unique: true },
  case_id: { type: Number, required: true },
  created_on: { type: Date, default: Date.now },
  commission_action: {
    type: String,
    enum: ["Payment", "CPE"]
  },
  caterlog_id: { type: Number, required: true },
  commission_pay_rate_id: { type: Number, required: true },
  commission_ref: {
    type: String,
    enum: ["DRC Commission Rule", "CPE_Model"]
  },
  transaction_ref: {
    type: String,
    enum: ["money_transaction_id", "rcmp_transaction_id"]
  },
  drc_id: { type: Number },
  ro_id: { type: Number },
  commission_amount: { type: Number, required: true },
  commission_type: {
    type: String,
    enum: ["Commissioned", "Unresolved Commission", "Pending Commission"]
  },
  commission_status: {
    type: String,
    required: true,
  },
  commission_status_on: { type: Date, default: Date.now },
  commission_status_reason: { type: String },
  check_by: { type: String },
  check_on: { type: Date, default: Date.now },
  approved_by: { type: String },
  approved_on: { type: Date, default: Date.now },
},{
    collection: 'Money_commission',
  }
);

const MoneyCommission = model("MoneyCommission", moneyCommissionSchema);

export default MoneyCommission;
