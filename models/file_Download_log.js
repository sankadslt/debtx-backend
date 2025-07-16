import mongoose from "mongoose";

const fileDownloadLogSchema = new mongoose.Schema(
  {
    doc_version: {
      type: Number,
      required: true,
      default: 1,
    },
    file_download_seq: {
      type: Number,
      required: true,
      unique: true,
    },
    file_name: {
      type: String,
      required: true,
    },
    created_on: {
      type: Date,
      required: true,
    },
    // fileLocation: {
    //   type: String,
    //   required: true,
    // },
    Deligate_By: {
      type: String,
      required: true,
    },
    DownLoad_BY: {
      type: String,
       default:null,
    },
    DownLoad_ON: {
      type: Date,
      default:null,
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
