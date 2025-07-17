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
 * Controller: List_Download_Files_from_Download_Log
 * 
 * Description:
 * Fetches file download log entries based on the provided user (Deligate_By) and optional date range.
 * Supports pagination and future-expiry filtering by default if no date range is specified.
 *
 * Inputs:
 * - Deligate_By: String (required) - The ID of the user who delegated the download task.
 * - from_date: String (optional, ISO format) - Start of the date range for File_Remove_On.
 * - to_date: String (optional, ISO format) - End of the date range for File_Remove_On.
 * - pages: Number (optional) - Pagination page number. Defaults to 1.
 *
 * Success Response:
 * - status: "success"
 * - message: "File download logs retrieved successfully."
 * - data: Array of file log objects (transformed for frontend)
 * - hasMore: Boolean - Indicates if more data is available for pagination.
 */
 
export const List_Download_Files_from_Download_Log = async (req, res) => {
  try {
    const { Deligate_By, from_date, to_date, pages } = req.body;

    // Input validation
    if (!Deligate_By) {
      return res.status(400).json({
        status: "error",
        message: "Field Deligate_By is required."
      });
    }

    
    let page = Number(pages);
    if (isNaN(page) || page < 1) page = 1;
    const limit = page === 1 ? 10 : 30;
    const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

   
    let query = {
      deligate_by: Deligate_By
    };

     
    const dateFilter = {};
    if (from_date) dateFilter.$gte = new Date(from_date);
    if (to_date) {
      const endOfDay = new Date(to_date);
      endOfDay.setHours(23, 59, 59, 999);
      dateFilter.$lte = endOfDay;
    }

    if (Object.keys(dateFilter).length > 0) {
      query.file_remove_on = dateFilter;
    } else {
      query.file_remove_on = { $gt: new Date() };  
    }

     
    const logs = await FileDownloadLog.find(query)
      .sort({ created_on: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const responseData = logs.map((log) => {
      return {
        file_download_seq: log.file_download_seq,
        Deligate_By: log.deligate_by,
        Created_On: log.created_on,
        File_Remove_On: log.file_remove_on,
        File_Name: log.file_name,
      };
    });

    return res.status(200).json({
      status: "success",
      message: "File download logs retrieved successfully.",
      data: responseData,
     
    });
  } catch (error) {
    console.error("Error fetching File download logs:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "An unexpected error occurred."
    });
  }
};
