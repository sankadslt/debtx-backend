import { Router } from "express";
import {
Reject_Case,
Create_Incident, Upload_DRS_File,

List_Incidents,
Create_Task_For_Incident_Details,

total_F1_filtered_Incidents,
total_distribution_ready_incidents,
total_incidents_CPE_Collect,
total_incidents_Direct_LOD,
incidents_CPE_Collect_group_by_arrears_band,
incidents_Direct_LOD_group_by_arrears_band,


List_All_Incident_Case_Pending,
List_Incidents_CPE_Collect,
List_F1_filted_Incidents,
List_incidents_Direct_LOD,
List_distribution_ready_incidents,
F1_filtered_Incidents_group_by_arrears_band,
distribution_ready_incidents_group_by_arrears_band,

Forward_F1_filtered_incident,
Create_Case_for_incident,
Forward_CPE_Collect,
getOpenTaskCountforCPECollect
} from "../controllers/Incident_controller.js";

const router = Router();

/**
 * @swagger
 * /api/incident/Forward_F1_filtered_incident:
 *   post:
 *     summary: Update incident status to "Open No Agent"
 *     description: Updates the status of an incident with the specified ID if its current status is "Reject Pending".
 *     tags:
 *       - Incident Management
 *     parameters:
 *       - in: query
 *         name: incidentId
 *         required: true
 *         schema:
 *           type: string
 *           example: "12345"
 *         description: The unique identifier of the incident to be updated.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               incidentId:
 *                 type: string
 *                 description: The ID of the incident to be updated.
 *                 example: "12345"
 *     responses:
 *       200:
 *         description: Incident status updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Incident status updated successfully."
 *       400:
 *         description: Invalid input or business rule violation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Incident status must be 'Reject Pending' to update."
 *       404:
 *         description: Incident not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Incident not found."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 */
router.post("/Forward_F1_filtered_incident", Forward_F1_filtered_incident);


router.post("/Create_Task_For_Incident_Details", Create_Task_For_Incident_Details);

/**
 * @swagger
 * /api/incident/Reject_Case:
 *   patch:
 *     summary: INC-1P05 Reject an incident and update the status
 *     description: Updates the status of an incident to "Incident Reject" along with the rejection reason and other details. Logs the action and deletes progress logs from the database.
 *     tags:
 *       - Incident Management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Incident_Id:
 *                 type: integer
 *                 description: Unique identifier of the incident.
 *                 example: 102
 *               Reject_Reason:
 *                 type: string
 *                 description: Reason for rejecting the incident.
 *                 example: "Invalid incident details provided."
 *               Rejected_By:
 *                 type: string
 *                 description: Username of the person rejecting the incident.
 *                 example: "user123"
 *     responses:
 *       200:
 *         description: Incident rejected and status updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Incident rejected and status updated successfully."
 *                 updatedLog:
 *                   type: object
 *                   properties:
 *                     User_Interaction_Status:
 *                       type: string
 *                       description: Status of the user interaction.
 *                       example: "close"
 *                     User_Interaction_Status_DTM:
 *                       type: string
 *                       format: date-time
 *                       description: Date and time the interaction status was changed.
 *                       example: "2025-02-04T12:00:00.000Z"
 *                     Rejected_Reason:
 *                       type: string
 *                       description: Reason for rejecting the incident.
 *                       example: "Invalid incident details provided."
 *                     Rejected_By:
 *                       type: string
 *                       description: Username of the person rejecting the incident.
 *                       example: "user123"
 *       400:
 *         description: Invalid input or missing fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Incident_Id, Reject_Reason, and Rejected_By are required fields."
 *       404:
 *         description: Incident or log not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Incident not found or failed to update."
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
 *                   example: "Detailed error message."
 */
router.patch("/Reject_Case", Reject_Case);


/**
 * @swagger
 * /api/incident/List_Incidents:
 *   post:
 *     summary: INC-1P04 List incidents and create a task
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

/**
 * @swagger
 * /api/incident/total_F1_filtered_Incidents:
 *   post:
 *     summary: INC-1P53 Retrieve the total number of F1 filtered incidents.
 *     description: |
 *       Retrieve the total count of F1 filtered incidents.
 * 
 *       | Version | Date       | Description |
 *       |---------|------------|-------------|
 *       | 01      | 2025-Jan-24| Initial version |
 *     tags:
 *       - Incident Management
 * 
 *     responses:
 *       200:
 *         description: Successfully retrieved the total count of F1 filtered incidents.
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
 *                   example: Successfully retrieved the total of F1 filtered incidents.
 *                 data:
 *                   type: object
 *                   properties:
 *                     F1_filtered_incident_total:
 *                       type: integer
 *                       example: 25
 * 
 *       500:
 *         description: Internal server error occurred while fetching F1 filtered incident count.
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
 *                   example: Failed to retrieve the F1 filtered incident count.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: "An unexpected error occurred while processing the request."
 */

router.post("/total_F1_filtered_Incidents", total_F1_filtered_Incidents);

/**
 * @swagger
 * /api/incident/total_distribution_ready_incidents:
 *   post:
 *     summary: INC-1P54 Retrieve the total number of distribution-ready incidents.
 *     description: |
 *       Retrieve the total count of incidents with the status "Distribution Ready".
 * 
 *       | Version | Date       | Description |
 *       |---------|------------|-------------|
 *       | 01      | 2025-Jan-24| Initial version |
 *     tags:
 *       - Incident Management
 * 
 *     responses:
 *       200:
 *         description: Successfully retrieved the total count of distribution-ready incidents.
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
 *                   example: Successfully retrieved the total of distribution-ready incidents.
 *                 data:
 *                   type: object
 *                   properties:
 *                     Distribution_ready_total:
 *                       type: integer
 *                       example: 25
 * 
 *       500:
 *         description: Internal server error occurred while fetching the distribution-ready incident count.
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
 *                   example: Failed to retrieve the distribution-ready incident count.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: "An unexpected error occurred while processing the request."
 */

router.post("/total_distribution_ready_incidents", total_distribution_ready_incidents);

/**
 * @swagger
 * /api/incident/incidents_CPE_Collect_group_by_arrears_band:
 *   post:
 *     summary: INC-1P55 Retrieve CPE collect incident counts grouped by arrears bands.
 *     description: |
 *       Retrieve the total count of incidents with the status "Open CPE Collect", grouped by arrears bands.
 * 
 *       Arrears bands represent specific ranges, such as "AB-5_10" for arrears between 5000 and 10000.
 * 
 *       | Version | Date       | Description |
 *       |---------|------------|-------------|
 *       | 01      | 2025-Jan-24| Initial version |
 *     tags:
 *       - Incident Management
 * 
 *     responses:
 *       200:
 *         description: Successfully retrieved CPE collect incident counts grouped by arrears bands.
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
 *                   example: Successfully retrieved CPE collect incident counts by arrears bands.
 *                 data:
 *                   type: object
 *                   properties:
 *                     CPE_collect_incidents_by_AB:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *                       example:
 *                         AB-5_10: 15
 *                         AB-10_20: 7
 *                         AB-20_30: 3
 * 
 *       500:
 *         description: Internal server error occurred while fetching CPE collect incident counts.
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
 *                   example: Failed to retrieve CPE collect incident counts by arrears bands.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: "An unexpected error occurred while processing the request."
 */

router.post("/incidents_CPE_Collect_group_by_arrears_band", incidents_CPE_Collect_group_by_arrears_band);

/**
 * @swagger
 * /api/incident/incidents_Direct_LOD_group_by_arrears_band:
 *   post:
 *     summary: INC-1P56 Retrieve Direct LOD incident counts grouped by arrears bands.
 *     description: |
 *       Retrieve the total count of incidents with the status "Direct LOD", grouped by arrears bands.
 * 
 *       Arrears bands represent specific ranges, such as "AB-5_10" for arrears between 5000 and 10000.
 * 
 *       | Version | Date       | Description |
 *       |---------|------------|-------------|
 *       | 01      | 2025-Jan-24| Initial version |
 *     tags:
 *       - Incident Management
 * 
 *     responses:
 *       200:
 *         description: Successfully retrieved Direct LOD incident counts grouped by arrears bands.
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
 *                   example: Successfully retrieved Direct LOD incident counts by arrears bands.
 *                 data:
 *                   type: object
 *                   properties:
 *                     Direct_LOD_incidents_by_AB:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *                       example:
 *                         AB-5_10: 10
 *                         AB-10_20: 5
 *                         AB-20_30: 8
 * 
 *       500:
 *         description: Internal server error occurred while fetching Direct LOD incident counts.
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
 *                   example: Failed to retrieve Direct LOD incident counts by arrears bands.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: "An unexpected error occurred while processing the request."
 */


router.post("/incidents_Direct_LOD_group_by_arrears_band", incidents_Direct_LOD_group_by_arrears_band);

/**
 * @swagger
 * /api/incident/List_All_Incident_Case_Pending:
 *   post:
 *     summary: INC-1P46 List all pending incidents
 *     description: Retrieves all incidents with a status indicating they are pending, such as "Open CPE Collect" or "Direct LOD."
 *     tags:
 *       - Incident Management
 *     parameters:
 *       - in: query
 *         name: pendingStatuses
 *         required: false
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Open CPE Collect", "Direct LOD", "Reject Pending", "Open No Agent"]
 *         description: The statuses to filter pending incidents.
 *     responses:
 *       200:
 *         description: Pending incidents retrieved successfully.
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
 *                   example: "Pending incidents retrieved successfully."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       Incident_Id:
 *                         type: string
 *                         example: "INC12345"
 *                       Account_Num:
 *                         type: string
 *                         example: "1234567890"
 *                       Incident_Status:
 *                         type: string
 *                         example: "Open CPE Collect"
 *                       Created_Dtm:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-01-03T12:34:56.789Z"
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
 *                   example: "An unexpected error occurred."
 */
router.post("/List_All_Incident_Case_Pending",List_All_Incident_Case_Pending);


/**
 * @swagger
 * /api/incident/List_Incidents_CPE_Collect:
 *   post:
 *     summary: INC-1P47 List incidents with "Open CPE Collect" status
 *     description: Retrieves all incidents where the status is "Open CPE Collect."
 *     tags:
 *       - Incident Management
 *     parameters:
 *       - in: query
 *         name: cpeCollectStatuses
 *         required: false
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Open CPE Collect"]
 *         description: The statuses to filter incidents for CPE collection.
 *     responses:
 *       200:
 *         description: Incidents with "Open CPE Collect" status retrieved successfully.
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
 *                   example: "CPE Collect incidents retrieved successfully."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       Incident_Id:
 *                         type: string
 *                         example: "INC54321"
 *                       Account_Num:
 *                         type: string
 *                         example: "9876543210"
 *                       Incident_Status:
 *                         type: string
 *                         example: "Open CPE Collect"
 *                       Created_Dtm:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-01-04T15:45:30.123Z"
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
 *                   example: "An unexpected error occurred."
 */
router.post("/List_Incidents_CPE_Collect",List_Incidents_CPE_Collect);


/**
 * @swagger
 * /api/incident/List_incidents_Direct_LOD:
 *   post:
 *     summary: INC-1P48 List incidents with "Direct LOD" status
 *     description: Retrieves all incidents where the status is "Direct LOD."
 *     tags:
 *       - Incident Management
 *     parameters:
 *       - in: query
 *         name: directLODStatuses
 *         required: false
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Direct LOD"]
 *         description: The statuses to filter Direct LOD incidents.
 *     responses:
 *       200:
 *         description: Incidents with "Direct LOD" status retrieved successfully.
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
 *                   example: "Direct LOD incidents retrieved successfully."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       Incident_Id:
 *                         type: string
 *                         example: "INC98765"
 *                       Account_Num:
 *                         type: string
 *                         example: "1234567800"
 *                       Incident_Status:
 *                         type: string
 *                         example: "Direct LOD"
 *                       Created_Dtm:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-01-05T16:00:45.987Z"
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
 *                   example: "An unexpected error occurred."
 */
router.post("/List_incidents_Direct_LOD",List_incidents_Direct_LOD);

/**
 * @swagger
 * /api/incident/List_F1_filted_Incidents:
 *   post:
 *     summary: INC-1P49 List "Reject Pending" incidents
 *     description: Retrieves a list of incidents with the status "Reject Pending".
 *     tags:
 *       - Incident Management
 *     parameters:
 *       - in: query
 *         name: Incident_Status
 *         required: false
 *         schema:
 *           type: string
 *           example: "Reject Pending"
 *         description: The status of incidents to filter by (default is "Reject Pending").
 *     responses:
 *       200:
 *         description: List of "Reject Pending" incidents retrieved successfully.
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
 *                   example: "Pending incidents retrieved successfully."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       Incident_Id:
 *                         type: string
 *                         example: "INC12345"
 *                       Account_Num:
 *                         type: string
 *                         example: "AC987654321"
 *                       Incident_Status:
 *                         type: string
 *                         example: "Reject Pending"
 *                       Created_Dtm:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-01-01T12:00:00Z"
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
 *                   example: "An unexpected error occurred."
 */
router.post("/List_F1_filted_Incidents",List_F1_filted_Incidents);


/**
 * @swagger
 * /api/incident/List_distribution_ready_incidents:
 *   post:
 *     summary: INC-1P50 List "Open No Agent" incidents
 *     description: Retrieves a list of incidents with the status "Open No Agent".
 *     tags:
 *       - Incident Management
 *     parameters:
 *       - in: query
 *         name: Incident_Status
 *         required: false
 *         schema:
 *           type: string
 *           example: "Open No Agent"
 *         description: The status of incidents to filter by (default is "Open No Agent").
 *     responses:
 *       200:
 *         description: List of "Open No Agent" incidents retrieved successfully.
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
 *                   example: "Pending incidents retrieved successfully."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       Incident_Id:
 *                         type: string
 *                         example: "INC54321"
 *                       Account_Num:
 *                         type: string
 *                         example: "AC123456789"
 *                       Incident_Status:
 *                         type: string
 *                         example: "Open No Agent"
 *                       Created_Dtm:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-01-02T08:00:00Z"
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
 *                   example: "An unexpected error occurred."
 */
router.post("/List_distribution_ready_incidents",List_distribution_ready_incidents);

/**
 * @swagger
 * /api/incident/total_incidents_CPE_Collect:
 *   post:
 *     summary: INC-1P51 Retrieve the total number of CPE Collect incidents.
 *     description: |
 *       Retrieve the total count of incidents with status "Open CPE Collect".
 * 
 *       | Version | Date       | Description |
 *       |---------|------------|-------------|
 *       | 01      | 2025-Jan-24| Initial version |
 *     tags:
 *       - Incident Management
 * 
 *     responses:
 *       200:
 *         description: Successfully retrieved the total count of CPE Collect incidents.
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
 *                   example: Successfully retrieved the total of CPE collect incidents.
 *                 data:
 *                   type: object
 *                   properties:
 *                     Distribution_ready_total:
 *                       type: integer
 *                       example: 42
 * 
 *       500:
 *         description: Internal server error occurred while fetching CPE Collect incident count.
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
 *                   example: Failed to retrieve the CPE collect incident count.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: "An unexpected error occurred while processing the request."
 */
router.post("/total_incidents_CPE_Collect", total_incidents_CPE_Collect);

/**
 * @swagger
 * /api/incident/total_incidents_Direct_LOD:
 *   post:
 *     summary: INC-1P52 Retrieve the total number of Direct LOD incidents.
 *     description: |
 *       Retrieve the total count of incidents with status "Direct LOD".
 * 
 *       | Version | Date       | Description |
 *       |---------|------------|-------------|
 *       | 01      | 2025-Jan-24| Initial version |
 *     tags:
 *       - Incident Management
 * 
 *     responses:
 *       200:
 *         description: Successfully retrieved the total count of Direct LOD incidents.
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
 *                   example: Successfully retrieved the total of Direct LOD incidents.
 *                 data:
 *                   type: object
 *                   properties:
 *                     Distribution_ready_total:
 *                       type: integer
 *                       example: 30
 * 
 *       500:
 *         description: Internal server error occurred while fetching Direct LOD incident count.
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
 *                   example: Failed to retrieve the Direct LOD incident count.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: "An unexpected error occurred while processing the request."
 */
router.post("/total_incidents_Direct_LOD", total_incidents_Direct_LOD);

/**
 * @swagger
 * /api/incident/F1_filtered_Incidents_group_by_arrears_band:
 *   post:
 *     summary: INC-1P57 Retrieve F1 filtered incident counts grouped by arrears bands.
 *     description: |
 *       Retrieve the total count of incidents with the status "Reject Pending", grouped by arrears bands.
 * 
 *       Arrears bands represent specific ranges, such as "AB-5_10" for arrears between 5000 and 10000.
 * 
 *       | Version | Date       | Description |
 *       |---------|------------|-------------|
 *       | 01      | 2025-Jan-24| Initial version |
 *     tags:
 *       - Incident Management
 * 
 *     responses:
 *       200:
 *         description: Successfully retrieved F1 filtered incident counts grouped by arrears bands.
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
 *                   example: Successfully retrieved F1 filtered incident counts by arrears bands.
 *                 data:
 *                   type: object
 *                   properties:
 *                     F1_Filtered_incidents_by_AB:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *                       example:
 *                         AB-5_10: 12
 *                         AB-10_20: 7
 *                         AB-20_30: 4
 * 
 *       500:
 *         description: Internal server error occurred while fetching F1 filtered incident counts.
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
 *                   example: Failed to retrieve F1 filtered incident counts by arrears bands.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: "An unexpected error occurred while processing the request."
 */
router.post("/F1_filtered_Incidents_group_by_arrears_band",F1_filtered_Incidents_group_by_arrears_band);

/**
 * @swagger
 * /api/incident/distribution_ready_incidents_group_by_arrears_band:
 *   post:
 *     summary: INC-1P58 Retrieve distribution-ready incident counts grouped by arrears bands.
 *     description: |
 *       Retrieve the total count of incidents with the status "Open No Agent", grouped by arrears bands.
 * 
 *       Arrears bands represent specific ranges, such as "AB-5_10" for arrears between 5000 and 10000.
 * 
 *       | Version | Date       | Description |
 *       |---------|------------|-------------|
 *       | 01      | 2025-Jan-24| Initial version |
 *     tags:
 *       - Incident Management
 * 
 *     responses:
 *       200:
 *         description: Successfully retrieved distribution-ready incident counts grouped by arrears bands.
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
 *                   example: Successfully retrieved distribution-ready incident counts by arrears bands.
 *                 data:
 *                   type: object
 *                   properties:
 *                     Distribution_ready_incidents_by_AB:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *                       example:
 *                         AB-5_10: 15
 *                         AB-10_20: 8
 *                         AB-20_30: 6
 * 
 *       500:
 *         description: Internal server error occurred while fetching distribution-ready incident counts.
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
 *                   example: Failed to retrieve distribution-ready incident counts by arrears bands.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: "An unexpected error occurred while processing the request."
 */
router.post("/distribution_ready_incidents_group_by_arrears_band",distribution_ready_incidents_group_by_arrears_band);

router.post("/Create_Case_for_incident",Create_Case_for_incident);
router.post("/Forward_CPE_Collect",Forward_CPE_Collect);
router.get('/Open_Task_Count_for_CPE_Collect', getOpenTaskCountforCPECollect);

export default router;