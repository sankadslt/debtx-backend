/* 
    Purpose: This template is used for the File Download Log Controllers.
    Created Date: 2025-03-25
    Created By:  Naduni Rabel (rabelnaduni2000@gmail.com)
    Last Modified Date: 2025-03-25
    Modified By: Naduni Rabel (rabelnaduni2000@gmail.com)
    Version: Node.js v20.11.1
    Dependencies: axios , mongoose
    Related Files: File_Download_controller.js
    Notes:  
*/

import { Router } from "express"; 
import { List_Download_Files_from_Download_Log } from "../controllers/File_Download_controller.js";

const router = Router();

/**
 * @swagger
 * /api/file/List_Download_Files_from_Download_Log:
 *   post:
 *     summary: FDL-1P01 Retrieve file download logs
 *     description: |
 *       Fetches a list of file download logs filtered by the delegate.
 *
 *       | Version | Date       | Description    |
 *       |---------|------------|----------------|
 *       | 01      | 2025-Mar-25| Initial version|
 *     tags:
 *       - File Management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Deligate_By:
 *                 type: string
 *                 example: "Admin"
 *                 description: The user who delegated the file download.
 *     responses:
 *       200:
 *         description: File download logs retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "File download logs retrieved successfully."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       File_Id:
 *                         type: string
 *                         example: "FILE12345"
 *                       File_Name:
 *                         type: string
 *                         example: "report.pdf"
 *                       Deligate_By:
 *                         type: string
 *                         example: "Admin"
 *                       Download_Timestamp:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-03-10T12:00:00Z"
 *       400:
 *         description: Bad request due to missing required field.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Field Deligate_By is required."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred."
 */
router.post("/List_Download_Files_from_Download_Log", List_Download_Files_from_Download_Log);

export default router;