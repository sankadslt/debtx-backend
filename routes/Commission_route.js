import { Router } from "express";
import { List_All_Commission_Cases,
    commission_type_cases_count
 } from "../controllers/Commission_controller.js";

const router = Router();

router.post("/List_All_Commission_Cases", List_All_Commission_Cases );

router.get("/commission_type_cases_count", commission_type_cases_count)


export default router;
