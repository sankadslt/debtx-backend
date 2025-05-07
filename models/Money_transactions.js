import { Schema, model } from "mongoose";

const moneyTransactionSchema = new Schema({
  doc_version : {type:Number, required: true, default: 1},
  money_transaction_id: { type: Number, required: true, unique: true },
  case_id: { type: Number, required: true },
  account_num: { type: Number, required: true },
  created_dtm: { type: Date, default: Date.now },
  settlement_id: { type: Number, required: true },
  installment_seq: { type: Number, required: true },
  transaction_type: {
    type: String,
    enum: ["Cash", "Cheque", "Return Cheque"],
    required: true,
  },
  money_transaction_ref: {  type: String, required: true },
  money_transaction_amount: { type: Number, required: true },
  money_transaction_Reference_type: { 
    type: String, 
    enum: ["Payment", "Bill", "Adjustment", "Dispute"],
    required: true 
  },
  money_transaction_date: {
    type: Date,
    required: true,
  },
  bill_payment_status: {
    type: String,
    required: true,
  },
  settlement_phase: {
    type: String,
    enum: ["Negotiation", "Mediation Board", "LOD", "Litigation", "WRIT"]
  },
  settle_Effected_Amount : {type: Number, default:null},
  cummulative_credit: { type: Number, required: true },
  cummulative_debit: { type: Number, required: true },
  cummulative_settled_balance: { type: Number, required: true },
  commissioned_amount: { type: Number, required: true },
  commission_type: { type: String, enum: ["Commissioned", "Unresolved Commission", "Pending Commission"] },
  drc_id: { type: Number, required: true },
  ro_id: { type: Number, required: true },
  commission_issued_dtm: { type: Date, required: true },
  commission_issued_by: { type: String, required: true },
  case_distribution_batch_id: { type: Number, required: true },
  bonus_1: { type: Number, required: true },
  bonus_2: { type: Number, required: true },
},{
    collection: 'Money_transactions',
  }
);

const MoneyTransaction = model("MoneyTransaction", moneyTransactionSchema);

export default MoneyTransaction;
