import express from 'express';
import { createTask,getOpenTaskCount,Task_for_Download_Incidents } from '../services/TaskService.js';

const router = express.Router();

router.post('/Create_Task', createTask);
router.post('/Task_for_Download_Incidents', Task_for_Download_Incidents);
router.post('/Open_Task_Count', getOpenTaskCount);

export default router;
