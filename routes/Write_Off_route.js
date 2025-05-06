import { Router } from "express";
import { getAllWriteOffCases } from '../controllers/Write_Off_controller.js';
import {Create_Task_For_Downloard_Write_Off_List} from '../controllers/Write_Off_controller.js';

const router = Router();

router.post('/List_All_Write_off_Cases', getAllWriteOffCases);
router.post('/Create_Task_For_Downloard_Write_Off_List',Create_Task_For_Downloard_Write_Off_List);

export default router;