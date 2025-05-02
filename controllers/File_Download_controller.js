/* 
    Purpose: This template is used for the File Download Log Controllers.
    Created Date: 2025-03-25
    Created By:  Naduni Rabel (rabelnaduni2000@gmail.com)
    Last Modified Date: 2025-03-25
    Modified By: Naduni Rabel (rabelnaduni2000@gmail.com)
    Version: Node.js v20.11.1
    Dependencies: axios , mongoose
    Related Files: File_Download_Log_route.js
    Notes:  
*/

import db from "../config/db.js";
import FileDownloadLog from "../models/file_Download_log.js";

/**
 * Inputs:
 * - Deligate_By: String (required)
 * 
 * Success Result:
 * - Returns a success response with the list of file download logs filtered by Deligate_By.
 */
export const List_Download_Files_from_Download_Log = async (req, res) => {
    const { Deligate_By } = req.body;
    if (!Deligate_By) {
        return res.status(400).json({
          status: "error",
          message: "Field Deligate_By is required.",
        });
    }
    const today = new Date();
    try {
        const logs = await FileDownloadLog.find({
          Deligate_By: Deligate_By,
          File_Remove_On: { $gt: today } // Only include files that will be removed in the future
        });
    
        return res.status(200).json({
          status: "success",
          message: "File download logs retrieved successfully.",
          data: logs,
        });
      } catch (error) {
        console.error("Error fetching File download logs:", error);
        return res.status(500).json({
          status: "error",
          message: error.message || "An unexpected error occurred.",
        });
      }
}