<<<<<<< Updated upstream
import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

const RORequestSchema = new Schema(
  {
    RO_Request_Id: { type: Number, required: true, unique: true }, // Unique ID for request
    Request_Description: { type: String, required: true }, // Description of the request
    End_Dtm: { type: Date, required: true }, // Request end date/time
  },
  { timestamps: true }, // Adds createdAt & updatedAt fields
  {
    collection: 'RO_Request',
  }
);

const RORequest = model("RO_Request", RORequestSchema);
=======
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
  },
  {
    collection: 'Template_RO_Request',
  }
);

const RORequest = model("RORequest", RORequestSchema);
>>>>>>> Stashed changes

export default RORequest;