import { Schema, model } from 'mongoose';

const RORequestSchema = new Schema(
  {
    ro_request_id: { 
      type: Number, 
      required: true, 
      unique: true 
    }, // Unique ID for request
    request_description: { 
      type: String, 
      required: true 
    }, // Description of the request
    end_dtm: { 
      type: Date, 
      required: true 
    }, // Request end date/time
    request_mode: { 
      type: String, 
      enum: ['Negotiation', 'Mediation Board'],
      required: true 
    }, // Request mode
    intraction_id: { 
      type: Number, 
      required: true
    }, // ID for interaction
  },
  {
    collection: 'Template_RO_Request',
  }
);

const RORequest = model("RORequest", RORequestSchema);

export default RORequest;