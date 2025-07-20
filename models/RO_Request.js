import { Schema, model } from 'mongoose';

const RORequestSchema = new Schema(
  {
    doc_version : {type:Number, required: true, default: 1},
    ro_request_id: { 
      type: Number, 
      required: true, 
      unique: true 
    }, 
    request_description: { 
      type: String, 
      maxlength: 255,
      required: true 
    },
    end_dtm: { 
      type: Date, 
      required: true 
    },
    request_mode: { 
      type: String, 
      maxlength: 30,
      enum: ['Negotiation', 'Mediation Board'],
      required: true 
    },
    Intraction_ID: {
      type:Number,
      required:true,
    }
  },
  {
    collection: 'Template_RO_Request',
  }
);

const RORequest = model("RORequest", RORequestSchema);

export default RORequest;