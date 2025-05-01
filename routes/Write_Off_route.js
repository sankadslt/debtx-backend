import { Router } from "express";
import { getAllWriteOffCases } from '../controllers/Write_Off_controller.js';

const router = Router();

router.post('/List_All_Write_off_Cases', getAllWriteOffCases);

export default router;