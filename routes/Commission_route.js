import { Router } from "express";
import { List_All_Commission_Cases,
    commission_type_cases_count,
    Create_task_for_Download_Commision_Case_List,
    Commission_Details_By_Commission_ID
 } from "../controllers/Commission_controller.js";

const router = Router();

router.post("/List_All_Commission_Cases", List_All_Commission_Cases );

router.get("/commission_type_cases_count", commission_type_cases_count);

router.post("/Create_task_for_Download_Commision_Case_List", Create_task_for_Download_Commision_Case_List );

router.post("/Commission_Details_By_Commission_ID", Commission_Details_By_Commission_ID );

export default router;
