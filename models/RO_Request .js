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

export default RORequest;