/* 
    Purpose: This template is used for the File Download Log Controllers.
    Created Date: 2025-03-25
    Created By:  Naduni Rabel (rabelnaduni2000@gmail.com)
    Last Modified Date: 2025-03-25
    Modified By: Naduni Rabel (rabelnaduni2000@gmail.com)
    Version: Node.js v20.11.1
    Dependencies: axios , mongoose
    Related Files: File_Download_Log_controller.js
    Notes:  
*/

import { Router } from "express"; 
import { List_Download_Files_from_Download_Log } from "../controllers/File_Download_Log_controller.js";

const router = Router();

router.post("/List_Download_Files_from_Download_Log", List_Download_Files_from_Download_Log);

export default router;