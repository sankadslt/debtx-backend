import mongoose from "mongoose";

const fileDownloadLogSchema = new mongoose.Schema(
  {
    doc_version : {type:Number, required: true, default: 1},
    file_download_seq: {
      type: Number,
      required: true,
      unique: true, 
    },
    File_Name: {
      type: String,
      required: true, 
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
      ],
    },
    Created_On: {
      type: Date,
      required: true,
    },
    File_Location: {
      type: String,
      required: true, 
    },
    Deligate_By: {
        type: String,
        required: true, 
    },
    Download_By: {
        type: String,
        required: true, 
    },
    Download_On: {
        type: Date,
        required: true, 
    },
    File_Remove_On: {
        type: Date,
        required: true, 
    },
  },
  {
    collection: "file_Download_log", 
    timestamps: true,
  }
);


const FileDownloadLog = mongoose.model("FileDownloadLog", fileDownloadLogSchema);


export default FileDownloadLog;
