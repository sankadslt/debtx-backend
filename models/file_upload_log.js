// import mongoose from "mongoose";

// // Define the Schema
// const fileUploadLogSchema = new mongoose.Schema(
//   {
//     File_Id: {
//       type: Number,
//       required: true,
//       unique: true, // Ensures each file has a unique ID
//     },
//     File_Name: {
//       type: String,
//       required: true, // Name of the uploaded file
//     },
//     File_Type: {
//       type: String,
//       required: true,
//       enum: [
//         "Incident Creation",
//         "Incident Reject",
//         "Distribute to DRC",
//         "Validity Period Extend",
//         "Hold",
//         "Discard",
//       ], // Restrict File_Type to these values
//     },
//     Uploaded_By: {
//       type: String,
//       required: true, // User who uploaded the file
//     },
//     Uploaded_Dtm: {
//       type: Date,
//       required: true, // Time of upload
//     },
//     File_Path: {
//       type: String,
//       required: true, // Location of the file on the server
//     },
//   },
//   {
//     collection: "file_upload_log", // Specify the collection name
//     timestamps: true, // Automatically manage createdAt and updatedAt
//   }
// );

// // Create the Model
// const FileUploadLog = mongoose.model("FileUploadLog", fileUploadLogSchema);

// // Export the Model
// export default FileUploadLog;


import mongoose from "mongoose";

// Define the Schema
const fileUploadLogSchema = new mongoose.Schema(
  {
    file_upload_seq: {
      type: Number,
      required: true,
      unique: true, // Ensures each file has a unique ID
    },
    File_Name: {
      type: String,
      required: true, // Name of the uploaded file
    },
    File_Type: {
      type: String,
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
      required: true, // User who uploaded the file
    },
    Uploaded_Dtm: {
      type: Date,
      required: true, // Time of upload
    },
    File_Path: {
      type: String,
      required: true, // Location of the file on the server
    },
    Forwarded_File_Path: {
      type: String,
      default: null, // Path to the forwarded file (optional)
    },
    File_Status: {
      type: String,
      required: true,
      enum: ["Open", "In Progress", "Close"], // Restrict File_Status to these values
      default: "Open", // Default status is 'Open'
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

