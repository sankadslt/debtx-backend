/* 
    Purpose: This template is used for the LOD Route.
    Created Date: 2025-04-01
    Created By:  Ravindu Pathum(ravindupathumiit@gmail.com)
    Last Modified Date: 2025-04-01
    Modified By: Ravindu Pathum (ravindupathumiit@gmail.com)
    Version: Node.js v20.11.1
    Dependencies: axios , mongoose
    Related Files: Case_route.js
    Notes:  
*/

import { Router } from "express";
const router = Router();

import {Retrive_logic, F2_selection_cases_count, List_F2_Selection_Cases, Create_Task_For_Downloard_All_Digital_Signature_LOD_Cases} from "../controllers/FTL_LOD_controller.js";

router.post("/Retrive_logic", Retrive_logic);

router.get("/F2_selection_cases_count", F2_selection_cases_count);

router.post("/List_F2_Selection_Cases", List_F2_Selection_Cases);

router.post("/Create_Task_For_Downloard_All_Digital_Signature_LOD_Cases", Create_Task_For_Downloard_All_Digital_Signature_LOD_Cases);

export default router;