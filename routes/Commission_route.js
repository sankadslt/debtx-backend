import { Router } from "express";
import { List_All_Commission_Cases } from "../controllers/Commission_controller.js";

const router = Router();

router.post("/List_All_Commission_Cases", List_All_Commission_Cases );

export default router;
