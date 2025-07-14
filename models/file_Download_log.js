import mongoose from "mongoose";

const fileDownloadLogSchema = new mongoose.Schema(
  {
    docVersion: {
      type: Number,
      required: true,
      default: 1,
    },
    fileDownloadSeq: {
      type: Number,
      required: true,
      unique: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    createdOn: {
      type: Date,
      required: true,
    },
    // fileLocation: {
    //   type: String,
    //   required: true,
    // },
    deligateBy: {
      type: String,
      required: true,
    },
    downloadBy: {
      type: String,
       default:null,
    },
    downloadOn: {
      type: Date,
      default:null,
    },
    fileRemoveOn: {
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
