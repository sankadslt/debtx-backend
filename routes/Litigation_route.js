/* 
    Purpose: This template is used for the Litigation Routes.
    Created Date: 2025-04-01
    Created By: Sasindu Srinayaka (sasindusrinayaka@gmail.com) 
    Last Modified Date:
    Modified By:  
    Version: Node.js v20.11.1
    Dependencies: express
    Related Files: Litigation_controller.js
    Notes:  
*/

import { Router } from "express";

import { 
    ListAllLitigationCases,
    createLitigationDocument,
 } from "../controllers/Litigation_controller.js";

const router = Router();

router.post( "/List_All_Litigation_Cases", ListAllLitigationCases );

router.patch( "/Create_Litigation_Document", createLitigationDocument );

export default router;
