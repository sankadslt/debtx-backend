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
    createLegalSubmission,
    listLitigationPhaseCaseDetails,
    createLeagalDetails,
    createLeagalFail,
    listLitigationPhaseCaseSettlementAndPaymentDetails,
 } from "../controllers/Litigation_controller.js";

const router = Router();

router.post( "/List_All_Litigation_Cases", ListAllLitigationCases );

router.patch( "/Create_Litigation_Document", createLitigationDocument );

router.patch( "/Create_Legal_Submission", createLegalSubmission );

router.post( "/List_Litigation_Phase_Case_Details_By_Case_ID", listLitigationPhaseCaseDetails);

router.patch( "/Create_Legal_Details_By_Case_ID", createLeagalDetails );

router.patch( "/Create_Legal_Fail_By_case_ID", createLeagalFail );

router.post( "/List_Lit_Phase_Case_settlement_and_payment_Details_By_Case_ID", listLitigationPhaseCaseSettlementAndPaymentDetails);

export default router;
