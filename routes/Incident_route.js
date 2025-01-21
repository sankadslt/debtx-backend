import { Router } from "express";
import {
Reject_Case,
Create_Incident, Upload_DRS_File,
List_Incidents

} from "../controllers/Incident_controller.js";

const router = Router();

router.patch("/Reject_Case", Reject_Case);
/**
 * @swagger
 * /api/incident/List_Incidents:
 *   post:
 *     summary: INC-1P02 List incidents and create a task
 *     description: Retrieves a list of incidents based on the specified criteria and creates a task for further processing. Validates input fields and interacts with the database.
 *     tags:
 *       - Incident Management
 *     parameters:
 *       - in: query
 *         name: Actions
 *         required: true
 *         schema:
 *           type: string
 *           example: "collect arrears"
 *         description: The action associated with the incidents.
 *       - in: query
 *         name: Incident_Status
 *         required: true
 *         schema:
 *           type: string
 *           example: "Incident Open"
 *         description: The status of the incidents.
 *       - in: query
 *         name: From_Date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-01-01"
 *         description: The start date for filtering incidents (inclusive).
 *       - in: query
 *         name: To_Date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-01-31"
 *         description: The end date for filtering incidents (inclusive).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Actions:
 *                 type: string
 *                 description: The action associated with the incident.
 *                 example: "collect arrears"
 *               Incident_Status:
 *                 type: string
 *                 description: The status of the incident.
 *                 example: "Incident Open"
 *               From_Date:
 *                 type: string
 *                 format: date
 *                 description: The start date for filtering incidents (inclusive).
 *                 example: "2025-01-01"
 *               To_Date:
 *                 type: string
 *                 format: date
 *                 description: The end date for filtering incidents (inclusive).
 *                 example: "2025-01-31"
 *     responses:
 *       200:
 *         description: Incidents retrieved and task created successfully.
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
 *                   example: "Incidents retrieved and task created successfully."
 *                 incidents:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       Incident_Id:
 *                         type: integer
 *                         description: Unique identifier for the incident.
 *                         example: 102
 *                       Actions:
 *                         type: string
 *                         description: The action performed for the incident.
 *                         example: "collect arrears"
 *                       Incident_Status:
 *                         type: string
 *                         description: The status of the incident.
 *                         example: "Incident Open"
 *                       Created_Dtm:
 *                         type: string
 *                         format: date-time
 *                         description: The date and time the incident was created.
 *                         example: "2025-01-03T12:34:56.789Z"
 *                 task:
 *                   type: object
 *                   properties:
 *                     Task_Id:
 *                       type: integer
 *                       description: Unique identifier for the task.
 *                       example: 201
 *                     Template_Task_Id:
 *                       type: integer
 *                       description: The template task ID associated with the task.
 *                       example: 12
 *                     parameters:
 *                       type: object
 *                       properties:
 *                         Incident_Status:
 *                           type: string
 *                           description: Status of the incidents being processed.
 *                           example: "Incident Open"
 *                         StartDTM:
 *                           type: string
 *                           format: date-time
 *                           description: Start date of the incidents filter.
 *                           example: "2025-01-01T00:00:00Z"
 *                         EndDTM:
 *                           type: string
 *                           format: date-time
 *                           description: End date of the incidents filter.
 *                           example: "2025-01-31T23:59:59Z"
 *                         Actions:
 *                           type: string
 *                           description: Action associated with the incidents.
 *                           example: "collect arrears"
 *                     Created_By:
 *                       type: string
 *                       description: Username or system that created the task.
 *                       example: "user123"
 *                     task_status:
 *                       type: string
 *                       description: Current status of the task.
 *                       example: "pending"
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
 *                   example: "All fields are required: Actions, Incident_Status, From_Date, To_Date."
 *       404:
 *         description: No incidents found matching the criteria.
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
 *                   example: "No incidents found matching the criteria."
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
 *                   example: "Internal server error."
 */
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
 *       - in: query
 *         name: Source_Type
 *         required: true
 *         schema:
 *           type: string
 *           enum: ["Pilot Suspended", "Product Terminate", "Special"]
 *           example: "Pilot Suspended"
 *         description: The Source_Type for the incident.
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
 *               Source_Type:
 *                 type: string
 *                 description: The Source_Type for the incident.
 *                 enum: ["Pilot Suspended", "Product Terminate", "Special"]
 *                 example: "Pilot Suspended"
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
 *                     Source_Type:
 *                       type: string
 *                       description: The Source_Type for the incident.
 *                       example: "Pilot Suspended"
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