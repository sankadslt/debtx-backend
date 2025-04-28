/* 
    Purpose: This template is used for the LOD Route.
    Created Date: 2025-04-01
    Created By:  Ravindu Pathum(ravindupathumiit@gmail.com)
    Last Modified Date: 2025-04-01
    Modified By: Ravindu Pathum (ravindupathumiit@gmail.com)
    Version: Node.js v20.11.1
    Dependencies: axios , mongoose
    Related Files: Case_route.js
    Notes:  
*/

import { Router } from "express";
const router = Router();

import { Retrive_logic,
         F2_selection_cases_count, 
         List_F2_Selection_Cases, 
         Create_Task_For_Downloard_All_Digital_Signature_LOD_Cases,
         Create_Task_For_Downloard_Each_Digital_Signature_LOD_Cases,
         Change_Document_Type,
         Create_Task_for_Proceed_LOD_OR_Final_Reminder_List,
         List_Final_Reminder_Lod_Cases,
         create_Customer_Responce,
         case_details_for_lod_final_reminder,
        } from "../controllers/LOD_controller.js";

router.post("/Retrive_logic", Retrive_logic);

/**
 * @swagger
 * /api/lod/F2_selection_cases_count:
 *   get:
 *     summary:  Count Cases by current_document_type
 *     description: |
 *       Retrieve counts of cases grouped by current_document_type.
 *       This endpoint also ensures only cases with the latest status as `LIT Prescribed` are considered.
 *
 *       | Version | Date        | Description                    | Changed By       |
 *       |---------|-------------|--------------------------------|------------------|
 *       | 01      | 2025-apr-02 | initialize                     | RAVINDU PATHUM   |
 *
 *     tags: [SLT LOD]
 *     responses:
 *       200:
 *         description: Successfully retrieved the case count grouped by `current_document_type`.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_count:
 *                       type: integer
 *                       example: 25
 *                     cases:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           document_type:
 *                             type: string
 *                             example: "Final Notice"
 *                           count:
 *                             type: integer
 *                             example: 12
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
 *                   example: "Server error while fetching case counts"
 */
router.get("/F2_selection_cases_count", F2_selection_cases_count);

/**
 * @swagger
 * /api/lod/List_F2_Selection_Cases:
 *   post:
 *     summary:  list of the cases which has the case_current_status as the LIT Prescribed
 *     description: |
 *       Retrieve cases which has the provided `current_document_type` 
 *
 *       | Version | Date        | Description                    | Changed By       |
 *       |---------|-------------|--------------------------------|------------------|
 *       | 01      | 2025-apr-02 | list lod cases                 | Ravindu          |
 *
 *     tags: [SLT LOD]
 *     parameters:
 *       - in: query
 *         name: current_document_type
 *         required: true
 *         schema:
 *           type: string
 *           example: LOD
 *         description: document type to filter cases.
 *       - in: query
 *         name: pages
 *         required: false
 *         schema:
 *           type: Number
 *           example: 1
 *         description: this is the number to limit the retrive data rows
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - current_document_type
 *             properties:
 *               current_document_type:
 *                 type: string
 *                 description: document type to filter cases.
 *                 example: LOD
 *     responses:
 *       200:
 *         description: Cases retrieved successfully.
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
 *                   example: Cases retrieved successfully.
 *                 data:
 *                   type: array
 *                   description: List of retrieved cases.
 *                   items:
 *                     type: object
 *       400:
 *         description: Validation error - Missing required parameters.
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
 *                   example: current document type is required.
 *       500:
 *         description: Database or internal server error.
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
 *                   example: Failed to retrieve cases.
 */
router.post("/List_F2_Selection_Cases", List_F2_Selection_Cases); 

/**
 * @swagger
 * /api/lod/Create_Task_For_Downloard_All_Digital_Signature_LOD_Cases:
 *   post:
 *     summary:  Create Task for download all the Lod cases
 *     description: |
 *       Creates a task for download all the Lod cases with no filtering.
 *
 *       | Version | Date        | Description                          | Changed By       |
 *       |---------|-------------|--------------------------------------|------------------|
 *       | 01      | 2025-Apr-02 | Create Task for Lod case download    | Ravindu Pathum   |
 *
 *     tags: [SLT LOD]
 *     parameters:
 *       - in: query
 *         name: Created_By
 *         schema:
 *           type: string
 *           example: "admin_user"
 *         description: User who creates the task.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Created_By:
 *                 type: string
 *                 example: "admin_user"
 *     responses:
 *       200:
 *         description: Task created successfully.
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
 *                   example: Task created successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     Template_Task_Id:
 *                       type: integer
 *                       example: 39
 *                     task_type:
 *                       type: string
 *                       example: Create Task For Downloard All Digital Signature LOD Cases
 *                     case_current_status:
 *                       type: string
 *                       example: "LIT Prescribed"
 *                     Created_By:
 *                       type: string
 *                       example: "admin_user"
 *                     task_status:
 *                       type: string
 *                       example: open
 *       400:
 *         description: Validation error - Missing required parameters.
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
 *                   example: Created_By is a required parameter.
 *       500:
 *         description: Server error occurred while creating the task.
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
 *                   example: Internal server error.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     exception:
 *                       type: string
 *                       example: Error details here.
 */
router.post("/Create_Task_For_Downloard_All_Digital_Signature_LOD_Cases", Create_Task_For_Downloard_All_Digital_Signature_LOD_Cases);

/**
 * @swagger
 * /api/lod/Create_Task_For_Downloard_Each_Digital_Signature_LOD_Cases:
 *   post:
 *     summary:  Create Task for download the Lod cases which has given current_document_type
 *     description: |
 *       Create Task for download the Lod cases which has given current_document_type
 *
 *       | Version | Date        | Description                          | Changed By       |
 *       |---------|-------------|--------------------------------------|------------------|
 *       | 01      | 2025-Apr-02 | Create Task for Lod case download    | Ravindu Pathum   |
 *
 *     tags: [SLT LOD]
 *     parameters:
 *       - in: query
 *         name: Created_By
 *         schema:
 *           type: string
 *           example: "admin_user"
 *         description: User who creates the task.
 *       - in: query
 *         name: current_document_type
 *         schema:
 *           type: string
 *           example: "LOD"
 *         description: The current_document_type of the cases thats wants to download. 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Created_By:
 *                 type: string
 *                 example: "admin_user"
 *               current_document_type:
 *                 type: string
 *                 example: "LOD"
 *     responses:
 *       200:
 *         description: Task created successfully.
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
 *                   example: Task created successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     Template_Task_Id:
 *                       type: integer
 *                       example: 39
 *                     task_type:
 *                       type: string
 *                       example: Create Task For Downloard All Digital Signature LOD Cases
 *                     case_current_status:
 *                       type: string
 *                       example: "LIT Prescribed"
 *                     Created_By:
 *                       type: string
 *                       example: "admin_user"
 *                     task_status:
 *                       type: string
 *                       example: open
 *       400:
 *         description: Validation error - Missing required parameters.
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
 *                   example: Created_By is a required parameter.
 *       500:
 *         description: Server error occurred while creating the task.
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
 *                   example: Internal server error.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     exception:
 *                       type: string
 *                       example: Error details here.
 */
router.post("/Create_Task_For_Downloard_Each_Digital_Signature_LOD_Cases", Create_Task_For_Downloard_Each_Digital_Signature_LOD_Cases);

/**
 * @swagger
 * /api/lod/Change_Document_Type:
 *   post:
 *     summary:  Change the Change_Document_Type of the Cases
 *     description: |
 *       Change the Change_Document_Type of the Cases
 *
 *       | Version | Date        | Description                    | Changed By       |
 *       |---------|-------------|--------------------------------|------------------|
 *       | 01      | 2025-apr-02 | list lod cases                 | Ravindu          |
 *
 *     tags: [SLT LOD]
 *     parameters:
 *       - in: query
 *         name: current_document_type
 *         required: true
 *         schema:
 *           type: string
 *           example: LOD
 *         description: document type to filter cases.
 *       - in: query
 *         name: case_id
 *         required: true
 *         schema:
 *           type: number
 *           example: 1
 *         description: this is the case id 
 *       - in: query
 *         name: Created_By
 *         required: true
 *         schema:
 *           type: string
 *           example: Admin
 *         description: this is one who change the Change_Document_Type 
 *       - in: query
 *         name: changed_type_remark
 *         required: true
 *         schema:
 *           type: string
 *           example: any things
 *         description: this is comment to that change 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               case_id:
 *                 type: number
 *                 example: 1
 *                 description: The ID of the case to update.
 *               current_document_type:
 *                 type: string
 *                 enum: ["LOD", "Final Reminder"]
 *                 example: "LOD"
 *                 description: The current document type of the case.
 *               Created_By:
 *                 type: string
 *                 example: "Admin"
 *                 description: The user making the change.
 *               changed_type_remark:
 *                 type: string
 *                 example: "Updated due to new regulations."
 *                 description: A remark explaining the change.
 *     responses:
 *       200:
 *         description: Case document type updated successfully.
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
 *                   example: Cases updated successfully.
 *                 data:
 *                   type: object
 *                   description: Updated case details.
 *       400:
 *         description: Validation error - Missing required parameters.
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
 *                   example: All parameters are required.
 *       404:
 *         description: Case not found.
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
 *                   example: Case is not found with that case ID.
 *       500:
 *         description: Database or internal server error.
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
 *                   example: An error occurred while updating the case.
 */
router.post("/Change_Document_Type", Change_Document_Type);

/**
 * @swagger
 * /api/lod/Create_Task_for_Proceed_LOD_OR_Final_Reminder_List:
 *   post:
 *     summary:  Create a Task to proceed the Lod or final reminder for this case with has given current_document_type
 *     description: |
 *       Create a Task to proceed the Lod or final reminder for this case with has given current_document_type
 *
 *       | Version | Date        | Description                          | Changed By       |
 *       |---------|-------------|--------------------------------------|------------------|
 *       | 01      | 2025-Apr-03 | Create Task for Lod case download    | Ravindu Pathum   |
 *
 *     tags: [SLT LOD]
 *     parameters:
 *       - in: query
 *         name: Created_By
 *         schema:
 *           type: string
 *           example: "admin_user"
 *         description: User who creates the task.
 *       - in: query
 *         name: current_document_type
 *         schema:
 *           type: string
 *           example: "LOD"
 *         description: The current_document_type of the cases thats wants to download. 
 *       - in: query
 *         name: Case_count
 *         schema:
 *           type: number
 *           example: 2500
 *         description: The case count that try to create lod or final reminder 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Created_By:
 *                 type: string
 *                 example: "admin_user"
 *               current_document_type:
 *                 type: string
 *                 example: "LOD"
 *               Case_count:
 *                 type: number
 *                 example: 5000
 *     responses:
 *       200:
 *         description: Task created successfully.
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
 *                   example: Task created successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     Template_Task_Id:
 *                       type: integer
 *                       example: 41
 *                     task_type:
 *                       type: string
 *                       example: Create Task for Proceed LOD OR Final_Reminder List
 *                     case_current_status:
 *                       type: string
 *                       example: "LIT Prescribed"
 *                     Created_By:
 *                       type: string
 *                       example: "admin_user"
 *                     task_status:
 *                       type: string
 *                       example: open
 *       400:
 *         description: Validation error - Missing required parameters or existing incomplete task.
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
 *                   example: "All parameters are required parameters or existing incomplete task."
 *       500:
 *         description: Server error occurred while creating the task.
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
 *                   example: Internal server error.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     exception:
 *                       type: string
 *                       example: Error details here.
 */
router.post("/Create_Task_for_Proceed_LOD_OR_Final_Reminder_List",Create_Task_for_Proceed_LOD_OR_Final_Reminder_List);

/**
 * @swagger
 * /api/lod/List_Final_Reminder_Lod_Cases:
 *   post:
 *     summary:  Retrive the lod and final reminder case list which has the give status
 *     description: |
 *       Change the Change_Document_Type of the Cases
 *
 *       | Version | Date        | Description                    | Changed By       |
 *       |---------|-------------|--------------------------------|------------------|
 *       | 01      | 2025-apr-09 |list lod and final reminder cases| Ravindu          |
 *
 *     tags: [SLT LOD]
 *     parameters:
 *       - in: query
 *         name: current_document_type
 *         required: true
 *         schema:
 *           type: string
 *           example: LOD
 *         description: document type to filter cases.
 *       - in: query
 *         name: case_status
 *         required: false
 *         schema:
 *           type: number
 *           example: 1
 *         description: this is the case current status 
 *       - in: query
 *         name: date_type
 *         required: false
 *         schema:
 *           type: string
 *           example: Admin
 *         description: this is the type of the date how can filter 
 *       - in: query
 *         name: date_to
 *         required: false
 *         schema:
 *           type: string
 *           example: "2025-03-31"
 *         description: the last date of the range to filter
 *       - in: query
 *         name: date_from
 *         required: false
 *         schema:
 *           type: string
 *           example: "2025-03-31"
 *         description: the first date of the range to filter 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               current_document_type:
 *                 type: string
 *                 enum: ["LOD", "Final Reminder"]
 *                 example: "LOD"
 *                 description: Document type to filter cases
 *               case_status:
 *                 type: string
 *                 enum: ["Initial LOD", "LOD Settle Pending", "LOD Settle Open-Pending", "LOD Settle Active"]
 *                 example: "Initial LOD"
 *                 description: Specific case status to filter (optional)
 *               date_type:
 *                 type: string
 *                 enum: ["created_date", "expiry_date", "last_response_date"]
 *                 example: "created_date"
 *                 description: Type of date to filter by (optional)
 *               date_from:
 *                 type: string
 *                 format: date
 *                 example: "2025-03-01"
 *                 description: Start date for filtering (YYYY-MM-DD, optional)
 *               date_to:
 *                 type: string
 *                 format: date
 *                 example: "2025-03-31"
 *                 description: End date for filtering (YYYY-MM-DD, optional)
 *               pages:
 *                 type: integer
 *                 example: 1
 *                 description: Page number for pagination (defaults to 1)
 *     responses:
 *       200:
 *         description: Cases retrieved successfully
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
 *                   example: Cases retrieved successfully.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       case_id:
 *                         type: string
 *                       case_current_status:
 *                         type: string
 *                       lod_final_reminder:
 *                         type: object
 *       400:
 *         description: Validation error
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
 *                   examples:
 *                     - "Invalid date_type. Must be one of: created_date, expiry_date, last_response_date"
 *                     - "There should be at least one parameters, date_from or date_to"
 *       500:
 *         description: Internal server error
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
 *                   example: There is an error
 */
router.post("/List_Final_Reminder_Lod_Cases",List_Final_Reminder_Lod_Cases);

/**
 * @swagger
 * /api/lod/Create_Customer_Responce:
 *   post:
 *     summary:  create the customer responce for the case
 *     description: |
 *       create the customer responce for the case for given case_id
 *
 *       | Version | Date        | Description                    | Changed By       |
 *       |---------|-------------|--------------------------------|------------------|
 *       | 01      | 2025-apr-07 | create the customer responce   | Ravindu          |
 *
 *     tags: [SLT LOD]
 *     parameters:
 *       - in: query
 *         name: case_id
 *         required: true
 *         schema:
 *           type: number
 *           example: 1
 *         description: case id to filter cases.
 *       - in: query
 *         name: customer_responce
 *         required: true
 *         schema:
 *           type: string
 *           example: "any response"
 *         description: this is the response that come from front end drop down 
 *       - in: query
 *         name: remark
 *         required: false
 *         schema:
 *           type: string
 *           example: "this is the remark"
 *         description: this is the remark to the responce
 *       - in: query
 *         name: created_by
 *         required: true
 *         schema:
 *           type: string
 *           example: "admin"
 *         description: this is the one who add the responce
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - case_id
 *               - customer_responce
 *               - created_by
 *             properties:
 *               case_id:
 *                 type: number
 *                 example: 1
 *                 description: ID of the case to add the response to.
 *               customer_responce:
 *                 type: string
 *                 enum: ["Agree to Settle", "Customer Dispute", "Request More Information"]
 *                 example: "Agree to Settle"
 *                 description: The response type from the customer.
 *               remark:
 *                 type: string
 *                 example: "Customer agrees but needs time"
 *                 description: Optional remark from the user.
 *               created_by:
 *                 type: string
 *                 example: "admin"
 *                 description: The user who is creating this response.
 *     responses:
 *       200:
 *         description: Case updated successfully
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
 *                   example: Cases updated successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     lod_final_reminder:
 *                       type: object
 *                       properties:
 *                         lod_response:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               lod_response_seq:
 *                                 type: number
 *                               response_type:
 *                                 type: string
 *                               lod_remark:
 *                                 type: string
 *                               created_by:
 *                                 type: string
 *                               created_on:
 *                                 type: string
 *                                 format: date-time
 *       400:
 *         description: Validation error
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
 *                   example: All parammeters are required.
 *       500:
 *         description: Internal server error
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
 *                   example: There is an error
 */
router.post("/Create_Customer_Responce",create_Customer_Responce); 

/**
 * @swagger
 * /api/lod/Case_details_for_lod_final_reminder:
 *   post:
 *     summary:  case details for lod final reminder pages
 *     description: |
 *       Case details for LOD final reminder pages.
 *
 *       | Version | Date        | Description                    | Changed By       |
 *       |---------|-------------|--------------------------------|------------------|
 *       | 01      | 2025-apr-07 | case details                   | Ravindu          |
 *
 *     tags: [SLT LOD]
 *     parameters:
 *       - in: query
 *         name: case_id
 *         required: true
 *         schema:
 *           type: number
 *           example: 1
 *         description: case id to filter cases.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - case_id
 *             properties:
 *               case_id:
 *                 type: number
 *                 example: 1
 *                 description: ID of the case to retrieve.
 *     responses:
 *       200:
 *         description: Case retrieved successfully
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
 *                   example: case retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     case_id:
 *                       type: number
 *                     customer_ref:
 *                       type: string
 *                     account_no:
 *                       type: string
 *                     current_arrears_amount:
 *                       type: number
 *                     last_payment_date:
 *                       type: string
 *                       format: date
 *                     lod_final_reminder:
 *                       type: object
 *       400:
 *         description: Missing required case_id
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
 *                   example: case id i required.
 *       404:
 *         description: Case not found
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
 *                   example: There is no case with this case id.
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
 *                   example: Error message
 */
router.post("/Case_details_for_lod_final_reminder",case_details_for_lod_final_reminder); 

router.post("/case_details_for_lod_final_reminder", case_details_for_lod_final_reminder);

export default router;