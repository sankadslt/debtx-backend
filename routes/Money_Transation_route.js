/* 
    Purpose: This template is used for the DRC Routes.
    Created Date: 2025-03-18
    Created By: K.K.C Sakumini (sakuminic@gmail.com)
    Last Modified Date: 
    Modified By:   
    Version: Node.js v20.11.1
    Dependencies: express
    Related Files: Money_Transation_controller.js
    Notes:  
*/

import { Router } from "express";
import { getAllPaymentCases,

} from "../controllers/MoneyTransation_controller.js";

const router = Router();

//payments
router.post("/List_All_Payment_Cases", getAllPaymentCases);

export default router;
