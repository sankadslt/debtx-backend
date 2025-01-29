import express from 'express';
import { createTask } from '../services/TaskService.js';

const router = express.Router();

router.post('/Create_Task', createTask);

export default router;
