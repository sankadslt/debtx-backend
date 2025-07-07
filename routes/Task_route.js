import express from "express";
import {
  createTask,
  getOpenTaskCount,
  Handle_Interaction_Acknowledgement,
  List_All_Open_Requests_For_To_Do_List,
} from "../services/TaskService.js";

import { List_All_Tasks } from "../controllers/Task_List_controller.js";

const router = express.Router();

router.post("/Create_Task", createTask);

router.post("/Open_Task_Count", getOpenTaskCount);

/**
 * @swagger
 * /api/task/List_All_Open_Requests_For_To_Do_List:
 *   post:
 *     summary: Retrieve all open requests assigned to a delegate user
 *     description: |
 *       Fetches all open requests from the `User_Interaction_Progress_Log` collection for a given delegate user.
 *       It joins `Templete_User_Interaction` and `To_Do_List` collections to include associated process templates.
 *
 *       | Version | Date        | Description                   | Changed By |
 *       |---------|-------------|-------------------------------|------------|
 *       | 01      | 2025-Jun-03 | Initial implementation        | T. G. J. K. Kumarasiri  |
 *
 *     tags: [Case Management]
 *     parameters:
 *       - in: body
 *         name: delegate_user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the delegate user whose open requests should be fetched.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               delegate_user_id:
 *                 type: string
 *                 example: "super@gmail.com"
 *     responses:
 *       200:
 *         description: Successfully retrieved open requests.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "667abc123def4567890ghi12"
 *                       delegate_user_id:
 *                         type: string
 *                         example: "5"
 *                       User_Interaction_Status:
 *                         type: string
 *                         example: "Open"
 *                       Process:
 *                         type: string
 *                         example: "<case_id> <request_type> <accept>"
 *                       parameters:
 *                         type: object
 *                         additionalProperties: true
 *                         example:
 *                           case_id: "C123"
 *                           request_type: "Negotiation"
 *                           accept: "Yes"
 *       204:
 *         description: No open requests found for the provided delegate user ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No matching data found for the specified criteria."
 *       400:
 *         description: Validation error due to missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing required fields: delegate_user_id is required."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 error:
 *                   type: string
 *                   example: "Detailed error message here"
 */
router.post(
  "/List_All_Open_Requests_For_To_Do_List",
  List_All_Open_Requests_For_To_Do_List
);

/**
 * @swagger
 * /api/task/Handle_Interaction_Acknowledgement:
 *   post:
 *     summary: Acknowledge an interaction log
 *     description: |
 *       Marks an interaction as "Seen" in the `User_Interaction_Log` and either updates or removes the corresponding record in the `User_Interaction_Progress_Log`, depending on its mode (e.g., Special or Approval).
 *
 *       | Version | Date        | Description              | Changed By |
 *       |---------|-------------|--------------------------|------------|
 *       | 01      | 2025-Jun-03 | Initial implementation   | Janani Kumarasiri  |
 *
 *     tags: [Interaction Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Interaction_Log_ID
 *               - delegate_user_id
 *             properties:
 *               Interaction_Log_ID:
 *                 type: integer
 *                 example: 100
 *                 description: Unique ID of the interaction log to acknowledge.
 *               delegate_user_id:
 *                 type: string
 *                 example: "super@gmail.com"
 *                 description: ID of the delegate user acknowledging the interaction.
 *     responses:
 *       200:
 *         description: Interaction acknowledged successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Interaction acknowledged successfully."
 *       400:
 *         description: Validation error due to missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Interaction_Log_ID is required."
 *       404:
 *         description: Interaction log not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User Interaction Progress Log not found."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 error:
 *                   type: string
 *                   example: "Detailed error message here"
 */
router.post(
  "/Handle_Interaction_Acknowledgement",
  Handle_Interaction_Acknowledgement
);

/**
 * @swagger
 * /api/task/List_All_Tasks:
 *   post:
 *     summary: Retrieve a paginated list of filtered tasks
 *     description: |
 *       Retrieves a list of tasks filtered by the creator's user ID, task status, and creation date range. Tasks are sorted by `Task_Id` in descending order. Pagination is applied with 10 tasks on the first page and 30 tasks on subsequent pages.
 *
 *       | Version | Date        | Description                   | Changed By       |
 *       |---------|-------------|-------------------------------|------------------|
 *       | 1.0     | 2025-07-02  | Initial endpoint definition   | Sathmi           |
 *
 *     tags: [Task Management]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               logged_in_user:
 *                 type: string
 *                 description: The email ID of the user who created the tasks to filter by.
 *                 example: "super@gmail.com"
 *               From_DAT:
 *                 type: string
 *                 format: date
 *                 description: Start date for filtering tasks by creation date (inclusive, YYYY-MM-DD).
 *                 example: "2023-01-01"
 *               TO_DAT:
 *                 type: string
 *                 format: date
 *                 description: End date for filtering tasks by creation date (inclusive, until end of day, YYYY-MM-DD).
 *                 example: "2025-12-31"
 *               task_status:
 *                 type: string
 *                 enum: ['open', 'inprogress', 'complete', 'close']
 *                 description: Filter tasks by their current status.
 *                 example: "open"
 *               pages:
 *                 type: integer
 *                 description: Page number for pagination (minimum 1). Page 1 returns 10 tasks; subsequent pages return 30 tasks.
 *                 example: 1
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Status of the response.
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   description: Descriptive message about the response.
 *                   example: "Task List retrieved successfully."
 *                 data:
 *                   type: array
 *                   description: List of tasks matching the filter criteria.
 *                   items:
 *                     type: object
 *                     properties:
 *                       task_id:
 *                         type: integer
 *                         description: Unique identifier for the task.
 *                         example: 1001
 *                       template_task_id:
 *                         type: integer
 *                         description: Identifier for the template associated with the task.
 *                         example: 2001
 *                       task_type:
 *                         type: string
 *                         description: Type of the task (e.g., Manual, Automated).
 *                         example: "Manual"
 *                       Created_By:
 *                         type: string
 *                         description: Email ID of the user who created the task.
 *                         example: "super@gmail.com"
 *                       Execute_By:
 *                         type: string
 *                         description: Email ID of the user assigned to execute the task, if any.
 *                         example: "user456@gmail.com"
 *                         nullable: true
 *                       Sys_Alert_ID:
 *                         type: integer
 *                         description: System alert ID associated with the task, if any.
 *                         example: 789
 *                         nullable: true
 *                       task_status:
 *                         type: string
 *                         enum: ['open', 'inprogress', 'complete', 'close']
 *                         description: Current status of the task.
 *                         example: "inprogress"
 *                       created_dtm:
 *                         type: string
 *                         format: date-time
 *                         description: Date and time when the task was created (ISO 8601 format).
 *                         example: "2025-01-05T10:00:00.000Z"
 *                         nullable: true
 *       500:
 *         description: Server error while fetching task list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Status of the response.
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   description: Descriptive message about the error.
 *                   example: "There is an error fetching task list."
 */
router.post("/List_All_Tasks", List_All_Tasks);

export default router;
