
import mongoose from "mongoose";

// Define the Schema
const fileUploadLogSchema = new mongoose.Schema(
  {
    doc_version : {type:Number, required: true, default: 1},
    file_upload_seq: {
      type: Number,
      required: true,
      unique: true, // Ensures each file has a unique ID
    },
    File_Name: {
      type: String,
      maxlength: 30,
      required: true, // Name of the uploaded file
    },
    File_Type: {
      type: String,
      maxlength: 30,
      required: true,
      enum: [
        "Incident Creation",
        "Incident Reject",
        "Distribute to DRC",
        "Validity Period Extend",
        "Hold",
        "Discard",
      ], // Restrict File_Type to these values
    },
    Uploaded_By: {
      type: String,
      maxlength: 30,
      required: true, // User who uploaded the file
    },
    Uploaded_Dtm: {
      type: Date,
      required: true, // Time of upload
    },
    File_Path: {
      type: String,
      maxlength: 255,
      required: true, // Location of the file on the server
    },
    Forwarded_File_Path: {
      type: String,
      maxlength: 255,
      default: null, // Path to the forwarded file (optional)
    },
    File_Status: {
      type: String, 
      maxlength: 30,
      required: true,
      enum: ["Upload Complete", "Upload InProgress", "Upload Open","Upload Failed"], // Restrict File_Status to these values
      default: "Upload Open", // Default status is 'Open'
    },
  },
  {
    collection: "file_upload_log", // Specify the collection name
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Create the Model
const FileUploadLog = mongoose.model("FileUploadLog", fileUploadLogSchema);

// Export the Model
export default FileUploadLog;

