import { Schema, model } from 'mongoose';

const casePaymentSchema = new Schema({
  doc_version : {type:Number, required: true, default: 1},
  case_payments: { type: Number, default:null },
  money_transaction_id: { type: Number, required: true},
  case_id: { type: Number, required: true },
  account_no: { type: String, required: true },
  created_dtm: { type: Date, required: true },
  settlement_id: { type: String },
  installment_seq: { type: Number },
  money_transaction_reference : { type: String, required: true },
  money_transaction_reference_type: { type: String, required: true },
  money_transaction_amount :  {type: Number, default:null },
  money_transaction_date: { type: Date, required: true },
  money_transaction_type :{ type: String, enum: ['Cash', 'Cheque', 'Return Cheque',], default:null},
  settle_Effected_Amount : {type: Number, default:null},
  cummilative_settled_balance : {type: Number, default:null},
  cummilative_credit : {type: Number, default:null},
  cummilative_debit : {type: Number, default:null},
  settlement_phase : {type: String, default:null, enum: ['Negotiation', 'WRIT', 'Mediation Board', 'LOD', 'Litigation']},
  commission_type : { type: String, default:null,enum: ['Commissioned', 'Unresolved Commission', 'Pending Commission'] },
  drc_id: {type: Number, default:null},
  ro_id : {type: Number, default:null},
  commission_amount:{type: Number, default:null},
  commision_issued_dtm : { type: Date, default:null },
  commision_issued_by : { type: String, default:null },
  case_distribution_batch_id: {type: Number, default:null},
  bonus_1 :{type: Number, default:null},
  bonus_2 : {type: Number, default:null},
},
{
  collection: 'Case_payments',
});

const CasePayment = model("CasePayment", casePaymentSchema);

export default CasePayment;
