import { mongoose } from "mongoose";
const { Schema } = mongoose;

const disputeSchema = new Schema({
    
    case_id: { type: Number, required: true},
    customer_ref: { type: String, maxlength: 30, required: true },
    account_no: { type: String, maxlength: 30, required: true },
    arrears_amount: { type: Number, required: true  },
    last_payment_date: { type: Date, required: true },
    signature_owner: { type: String, maxlength: 100, required: true },
    template: { type: String, maxlength: 100, required: true },
    dispute_mode: { type: String, maxlength: 50, default: "Dispute", required: true },
    handover_channel: { type: String, maxlength: 50, default: "CRC", required: true },
    email: { type: String, maxlength: 100, required: true, 
            validate: {
                validator: function(v) {
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
                },
                message: props => `${props.value} is not a valid email address!`
            }
    },
  email_cc: { type: String, maxlength: 100, required: false,
            validate: {
            validator: function(v) {
                if (!v) return true; // Allow empty
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
            }
    },
  remark: { type: String, maxlength: 1000, required: false },

  created_by: { type: String, required: true },
  created_dtm: { type: Date, default: Date.now },
  updated_dtm: { type: Date, default: Date.now }

});

const Dispute_Letter_Creation = mongoose.model('Dispute_Letter_Creation', disputeSchema);

export default Dispute_Letter_Creation;
