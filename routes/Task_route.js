import express from 'express';
import { createTask,
    getOpenTaskCount,
    Handle_Interaction_Acknowledgement 
} from '../services/TaskService.js';

const router = express.Router();

router.post('/Create_Task', createTask);

router.post('/Open_Task_Count', getOpenTaskCount);

router.post('/Handle_Interaction_Acknowledgement', Handle_Interaction_Acknowledgement);

export default router;
