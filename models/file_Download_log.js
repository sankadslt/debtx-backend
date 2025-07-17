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
    Deligate_by: {
      type: String,
      required: true,
    },
    downLoad_by: {
      type: String,
       default:null,
    },
    downLoad_on: {
      type: Date,
      default:null,
    },
    file_remove_on: {
      type: Date,
      required: true,
    },
    download_by_ip: {
      type: String,
      maxlength: 30,
      default: null,
    }
  },
  {
    collection: "file_Download_log",
    timestamps: true,
  }
);

const FileDownloadLog = mongoose.model("FileDownloadLog", fileDownloadLogSchema);

export default FileDownloadLog;
