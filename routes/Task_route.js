import express from 'express';
import { createTask,
    getOpenTaskCount,
    Handle_Interaction_Acknowledgement,
    List_All_Open_Requests_For_To_Do_List
} from '../services/TaskService.js';

const router = express.Router();

router.post('/Create_Task', createTask);

router.post('/Open_Task_Count', getOpenTaskCount);

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
router.post('/Handle_Interaction_Acknowledgement', Handle_Interaction_Acknowledgement);

export default router;
