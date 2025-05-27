/* 
    Purpose: This template is used for the User Controllers.
    Created Date: 2025-05-19
    Created By:  Sasindu Srinayaka (sasindusrinayaka@gmail.com)
    Last Modified Date: 2025-05-20
    Modified By: Sasindu Srinayaka (sasindusrinayaka@gmail.com)
    Version: Node.js v20.11.1
    Dependencies: axios , mongoose
    Related Files: User_controller.js, user.js
    Notes:  
*/

// user_route.mjs
import { Router } from "express";
import { getUserDetailsByRole } from "../controllers/User_controller.js";
 
const router = Router();

router.post('/Obtain_User_List_Owned_By_User_Roles', getUserDetailsByRole);

export default router;