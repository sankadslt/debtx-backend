import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

const transactionTypeSchema = new Schema({
  transaction_type_id: { type: Number, required: true },
  transaction_type: { type: String, required: true },
  parameters: [{ type: String }]
},{
    collection: 'Template_transaction_type', 
});

const TransactionType = model('TransactionType', transactionTypeSchema);

export default TransactionType;
