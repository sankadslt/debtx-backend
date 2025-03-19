import mongoose from "mongoose";

const { Schema } = mongoose;

// Define the schema for SystemTransaction
const systemTransactionSchema = new Schema(
  {
    doc_version : {type:Number, required: true, default: 1},
    Transaction_Id: {
        type: Number,
        required: true,
        unique: true, // Ensures each transaction has a unique ID
    },
    transaction_type_id: { type: Number, required: true },
    parameters: {
      type: Map,
      of: Schema.Types.Mixed, // Allows different types for the map values
      default: {},
    },
    created_dtm: { type: Date, default: Date.now },
  },
  {
    collection: "System_transaction", // Specify the collection name
    timestamps: true,
  }
);

// Create the Model
const SystemTransaction = mongoose.model("SystemTransaction", systemTransactionSchema);

export default SystemTransaction;
