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

import {Retrive_logic, lod_customer_response} from "../controllers/FTL_LOD_controller.js";

router.post("/Retrive_logic", Retrive_logic);

router.post("/lod_customer_response", lod_customer_response);

export default router;