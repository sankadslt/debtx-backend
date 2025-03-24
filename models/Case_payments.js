import { Schema, model } from 'mongoose';

const casePaymentSchema = new Schema({
  doc_version : {type:Number, required: true, default: 1},
  payment_id: { type: Number, required: true, unique: true },
  case_id: { type: Number, required: true },
  created_dtm: { type: Date, required: true },
  settlement_id: { type: String },
  installment_seq: { type: Number },
  bill_payment_seq: { type: Number },
  bill_paid_amount: { type: Number, required: true },
  bill_paid_date: { type: Date },
  bill_payment_status: { type: String, enum: ['Pending', 'Completed', 'Failed', 'Refunded'] },
  bill_payment_type: { type: String, enum: ['Cash', 'Cheque', 'Return Cheque'] },
  settled_balance: { type: Number },
  cumulative_settled_balance: { type: Number },
  settlement_phase: { 
    type: String, 
    enum: ['Negotiation', 'Mediation Board', 'LOD', 'Litigation', 'WRIT'] 
  }
},
{
  collection: 'Case_payments',
});

const CasePayment = model("CasePayment", casePaymentSchema);

export default CasePayment;
