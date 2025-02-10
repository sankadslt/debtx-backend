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
  },
  {
    collection: 'RO_Request',
  }
);

const RORequest = model("RORequest", RORequestSchema);

export default RORequest;