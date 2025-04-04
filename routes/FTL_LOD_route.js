/* 
    Purpose: This template is used for the FTL LOD Route.
    Created Date: 2025-04-03
    Created By:  Dinusha Anupama (dinushanupama@gmail.com)
    Last Modified Date: 2025-04-01
    Modified By: Dinusha Anupama (dinushanupama@gmail.com)
    Version: Node.js v20.11.1
    Dependencies: axios , mongoose
    Related Files: FTL_controller.js
    Notes:  
*/

import { Router } from "express";
const router = Router();

import { Retrive_logic} from "../controllers/FTL_LOD_controller.js";
import { List_FTL_LOD_Cases} from "../controllers/FTL_LOD_controller.js";


router.post("/Retrive_logic", Retrive_logic);

router.post("/List_FTL_LOD_Cases", List_FTL_LOD_Cases);


export default router;