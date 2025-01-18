import { Router } from "express";
import {
Reject_Case,
Create_Incident, Upload_DRS_File,
List_Incidents

} from "../controllers/Incident_controller.js";

const router = Router();

router.patch("/Reject_Case", Reject_Case);
router.post("/List_Incidents", List_Incidents);
    
/**
 * @swagger
 * /api/incident/Create_Incident:
 *   post:
 *     summary: INC-1P01 Create a new incident
 *     description: Creates a new incident in the system and generates a task for data extraction from the data lake. Validates the input fields and interacts with external APIs.
 *     tags:
 *       - Incident Management
 *     parameters:
 *       - in: query
 *         name: Account_Num
 *         required: true
 *         schema:
 *           type: string
 *           maxLength: 10
 *           example: "1234567890"
 *         description: The account number associated with the incident (max length 10).
 *       - in: query
 *         name: DRC_Action
 *         required: true
 *         schema:
 *           type: string
 *           enum: ["collect arrears", "collect arrears and CPE", "collect CPE"]
 *           example: "collect arrears"
 *         description: The action to be performed for the incident.
 *       - in: query
 *         name: Monitor_Months
 *         required: true
 *         schema:
 *           type: integer
 *           example: 3
 *         description: The number of months to monitor the account.
 *       - in: query
 *         name: Created_By
 *         required: true
 *         schema:
 *           type: string
 *           example: "user123"
 *         description: The username or ID of the person creating the incident.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Account_Num:
 *                 type: string
 *                 description: The account number associated with the incident (max length 10).
 *                 example: "1234567890"
 *               DRC_Action:
 *                 type: string
 *                 description: The action to be performed for the incident.
 *                 enum: ["collect arrears", "collect arrears and CPE", "collect CPE"]
 *                 example: "collect arrears"
 *               Monitor_Months:
 *                 type: integer
 *                 description: The number of months to monitor the account.
 *                 example: 3
 *               Created_By:
 *                 type: string
 *                 description: The username or ID of the person creating the incident.
 *                 example: "user123"
 *     responses:
 *       201:
 *         description: Incident created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Incident created successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     Incident_Id:
 *                       type: integer
 *                       description: The unique identifier for the incident.
 *                       example: 101
 *                     Account_Num:
 *                       type: string
 *                       description: The account number associated with the incident.
 *                       example: "1234567890"
 *                     DRC_Action:
 *                       type: string
 *                       description: The action to be performed for the incident.
 *                       example: "collect arrears"
 *                     Monitor_Months:
 *                       type: integer
 *                       description: The number of months to monitor the account.
 *                       example: 6
 *                     Created_By:
 *                       type: string
 *                       description: The username or ID of the person creating the incident.
 *                       example: "user123"
 *                     Created_Dtm:
 *                       type: string
 *                       format: date-time
 *                       description: The date and time the incident was created.
 *                       example: "2025-01-03T12:34:56.789Z"
 *       400:
 *         description: Invalid input or missing fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "All fields are required."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Failed to create incident."
 */
router.post("/Create_Incident", Create_Incident);








/**
 * @swagger
 * /api/incident/Upload_DRS_File:
 *   post:
 *     summary: INC-1PF1 Upload a DRS file and create a related task.
 *     tags:
 *       - Incident Management
 *     parameters:
 *       - in: query
 *         name: File_Name
 *         required: true
 *         schema:
 *           type: string
 *           example: incident_data.csv
 *         description: Name of the file being uploaded.
 *       - in: query
 *         name: File_Type
 *         required: true
 *         schema:
 *           type: string
 *           enum: ["Incident Creation", "Incident Reject", "Distribute to DRC", "Validity Period Extend", "Hold", "Discard"]
 *           example: Incident Creation
 *         description: Type of the file. Allowed values include Incident Creation, Incident Reject, Distribute to DRC, Validity Period Extend, Hold, and Discard.
 *       - in: query
 *         name: File_Content
 *         required: true
 *         schema:
 *           type: string
 *           example: "data for the file in string format"
 *         description: Content of the file in string format.
 *       - in: query
 *         name: Created_By
 *         required: true
 *         schema:
 *           type: string
 *           example: admin_user
 *         description: The username or ID of the individual uploading the file.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               File_Name:
 *                 type: string
 *                 example: incident_data.csv
 *                 description: Name of the file being uploaded.
 *               File_Type:
 *                 type: string
 *                 example: Incident Creation
 *                 description: Type of the file.
 *               File_Content:
 *                 type: string
 *                 example: "data for the file in string format"
 *                 description: Content of the file.
 *               Created_By:
 *                 type: string
 *                 example: admin_user
 *                 description: Creator of the file.
 *     responses:
 *       201:
 *         description: File uploaded successfully, and a task was created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: File uploaded successfully, and task created.
 *                 data:
 *                   type: object
 *                   properties:
 *                     File_Id:
 *                       type: number
 *                       example: 123
 *                     Task_Id:
 *                       type: number
 *                       example: 456
 *                     File_Name:
 *                       type: string
 *                       example: incident_data.csv
 *                     File_Type:
 *                       type: string
 *                       example: Incident Creation
 *                     Created_By:
 *                       type: string
 *                       example: admin_user
 *                     Uploaded_Dtm:
 *                       type: string
 *                       example: 2024-12-31T12:00:00Z
 *       400:
 *         description: Bad request. Missing or invalid fields.
 *       500:
 *         description: Internal server error. Failed to upload file and create task.
 */
router.post("/Upload_DRS_File", Upload_DRS_File);




export default router;