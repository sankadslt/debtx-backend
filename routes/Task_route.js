import express from 'express';
import { createTask,getOpenTaskCount } from '../services/TaskService.js';

const router = express.Router();

router.post('/Create_Task', createTask);

router.post('/Open_Task_Count', getOpenTaskCount);

export default router;
