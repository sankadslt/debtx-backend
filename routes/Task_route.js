import express from 'express';
import { createTask,getOpenTaskCount } from '../services/TaskService.js';
import {Task_for_Download_Incidents } from '../controllers/Incident_controller.js';
const router = express.Router();

router.post('/Create_Task', createTask);

/**
 * @swagger
 * /api/task/Task_for_Download_Incidents:
 *   post:
 *     summary: Create a task to download incident list
 *     description: |
 *       Create a system task for downloading incidents based on specified filters.
 *
 *       | Version | Date        | Description                          | Changed By |
 *       |---------|-------------|--------------------------------------|------------|
 *       | 01      | 2025-apr-27  | Create task for incident download    | Ravindu    |
 *     tags: [System Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - DRC_Action
 *               - Incident_Status
 *               - From_Date
 *               - To_Date
 *               - Created_By
 *             properties:
 *               DRC_Action:
 *                 type: string
 *                 example: "DRC Open"
 *                 description: Action related to DRC (e.g., Open, Closed).
 *               Incident_Status:
 *                 type: string
 *                 example: "Pending"
 *                 description: Status of the incident.
 *               From_Date:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-01"
 *                 description: Start date for incident filtering.
 *               To_Date:
 *                 type: string
 *                 format: date
 *                 example: "2025-04-26"
 *                 description: End date for incident filtering.
 *               Created_By:
 *                 type: string
 *                 example: "admin_user"
 *                 description: User creating the task.
 *     responses:
 *       200:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     Task_Id:
 *                       type: number
 *                       example: 101
 *                     Template_Task_Id:
 *                       type: number
 *                       example: 20
 *                     task_type:
 *                       type: string
 *                       example: Create Incident list for download
 *                     parameters:
 *                       type: object
 *                       properties:
 *                         DRC_Action:
 *                           type: string
 *                         Incident_Status:
 *                           type: string
 *                         From_Date:
 *                           type: string
 *                           format: date
 *                         To_Date:
 *                           type: string
 *                           format: date
 *                     Created_By:
 *                       type: string
 *       400:
 *         description: Missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Missing required parameters
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Failed to create task
 */
router.post('/Task_for_Download_Incidents', Task_for_Download_Incidents);

router.post('/Open_Task_Count', getOpenTaskCount);

export default router;
