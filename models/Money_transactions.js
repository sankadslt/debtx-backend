import { Schema, model } from "mongoose";


const settlementDetailsSchema = new Schema({
  settlement_id: { type: Number, required: true },
  installment_seq: { type: Number, required: true },
  running_credit: { type: Number, required: true },
  running_debt: { type: Number, required: true },
  cumulative_arrears_before_calc: { type: Number, required: true },
  cumulative_settled_balance: { type: Number, required: true },
  commissionable_amount: { type: Number, required: true },
}, { _id: false });

const moneyDetailsSchema = new Schema({
  money_transaction_ref: { type: Number, required: true },
  money_transaction_amount: { type: Number, required: true },
  money_transaction_date: { type: Date, required: true },
  bill_payment_status: { type: String, maxlength: 30, required: true },
  money_transaction_status: { type: String, maxlength: 30, required: true },
}, { _id: false });

const moneyTransactionSchema = new Schema({
  doc_version: { type: Number, required: true, default: 1 },
  money_transaction_id: { type: Number, required: true, unique: true },
  case_id: { type: Number, required: true },
  order_id: { type: Number, default: null },
  process_monitor_log_id: { type: Number, default: null },
  account_num: { type: String, required: true }, // Changed to String to match "0049339849"
  billing_centre: { type: String, maxlength: 100 },
  case_phase: {
    type: String,
    maxlength: 30,
    enum: ["Negotiation", "Mediation Board", "LOD", "Litigation", "WRIT"]
  },
  created_dtm: { type: Date, default: Date.now },
  transaction_type: {
    type: String,
    maxlength: 30,
    enum: ["Cash", "Cheque", "Return Cheque"],
    required: true,
  },
  root_source: { type: String, maxlength: 30 }, // Added
  settlement_details: { type: settlementDetailsSchema, required: true },
  money_details: { type: moneyDetailsSchema, required: true },
  commission_id: { type: Number, required: true }
}, {
  collection: 'Money_transactions'
});

const MoneyTransaction = model("MoneyTransaction", moneyTransactionSchema);

export default MoneyTransaction;
