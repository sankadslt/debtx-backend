/* 
    Purpose: This template is used for the DRC Routes.
    Created Date: 2025-01-08
    Created By: Janendra Chamodi (apjanendra@gmail.com)

    Last Modified Date: 2024-02-07
    Modified By: Naduni Rabel (rabelnaduni2000@gmail.com), Sasindu Srinayaka (sasindusrinayaka@gmail.com), Ravindu Pathum (ravindupathumiit@gmail.com)    

    Version: Node.js v20.11.1
    Dependencies: express
    Related Files: Case_controller.js
    Notes:  
*/

import { Router } from "express";
import {
  drcExtendValidityPeriod,
  listHandlingCasesByDRC,
  Case_Abandant,
  Approve_Case_abandant,
  Open_No_Agent_Cases_F1_Filter,
  Case_Current_Status,
  Open_No_Agent_Cases_ALL,
  Open_No_Agent_Cases_Direct_LD,
  assignROToCase,
  listBehaviorsOfCaseDuringDRC,
  updateLastRoDetails,
  // listAllActiveRosByDRCID,
  Case_Status,
  Case_List,
  openNoAgentCasesAllByServiceTypeRulebase,
  openNoAgentCountArrearsBandByServiceType,
  listCases,
  Acivite_Case_Details,
  listAllDRCMediationBoardCases,
  get_count_by_drc_commision_rule,
  getAllArrearsBands,
  count_cases_rulebase_and_arrears_band,
  Case_Distribution_Among_Agents,
  List_Case_Distribution_DRC_Summary,
  Batch_Forward_for_Proceed,
  Create_Task_For_case_distribution,

  List_all_transaction_seq_of_batch_id,
  Create_Task_For_case_distribution_transaction,
  ListActiveRORequestsMediation,
  get_distribution_array_of_a_transaction,
  Create_Task_For_case_distribution_transaction_array,
  Exchange_DRC_RTOM_Cases,
  Case_Distribution_Details_With_Drc_Rtom_ByBatchId,
  List_All_Batch_Details,
  Approve_Batch_or_Batches,
  Create_task_for_batch_approval,
  List_DRC_Assign_Manager_Approval,
  Approve_DRC_Assign_Manager_Approval,
  Reject_DRC_Assign_Manager_Approval,
  Create_task_for_DRC_Assign_Manager_Approval,
  drcCaseDetails,
  updateDrcCaseDetails
} from "../controllers/Case_controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Case Management
 *     description: Case-related endpoints, allowing management and updates of case details.
 *
 * /api/case/Open_No_Agent_Cases_ALL:
 *   post:
 *     summary: Retrieve all cases by status and date range
 *     description: |
 *       Fetch all cases matching the provided `case_current_status`. If not specified, retrieves all statuses.
 *       Results are filtered by optional `fromDate` and `toDate` range and grouped into categories.
 *
 *       | Version | Date       | Description    |
 *       |---------|------------|----------------|
 *       | 01      | 2025-Jan-09| Initial version|
 *
 *     tags:
 *      - Case Management
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         description: Request parameters for case filtering.
 *         schema:
 *           type: object
 *           properties:
 *             case_current_status:
 *               type: string
 *               example: Open Pending Approval
 *               description: The status of cases to retrieve. Defaults to "Open No Agent" for specific filters.
 *             fromDate:
 *               type: string
 *               format: date
 *               example: 2023-01-01
 *               description: Start date for filtering cases based on creation date.
 *             toDate:
 *               type: string
 *               format: date
 *               example: 2023-12-31
 *               description: End date for filtering cases based on creation date.
 *     responses:
 *       200:
 *         description: Cases retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cases retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     No_Agent_Cases:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           case_id:
 *                             type: integer
 *                             example: 1
 *                           account_no:
 *                             type: integer
 *                             example: 123456789
 *                           area:
 *                             type: string
 *                             example: North Zone
 *                           rtom:
 *                             type: string
 *                             example: RTOM-01
 *                           filtered_reason:
 *                             type: string
 *                             example: null
 *                     F1_Filter:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           case_id:
 *                             type: integer
 *                             example: 2
 *                           account_no:
 *                             type: integer
 *                             example: 987654321
 *                           area:
 *                             type: string
 *                             example: South Zone
 *                           rtom:
 *                             type: string
 *                             example: RTOM-02
 *                           filtered_reason:
 *                             type: string
 *                             example: Delayed response
 *                     Direct_LD:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           case_id:
 *                             type: integer
 *                             example: 3
 *                           account_no:
 *                             type: integer
 *                             example: 123123123
 *                           area:
 *                             type: string
 *                             example: East Zone
 *                           rtom:
 *                             type: string
 *                             example: RTOM-03
 *                           filtered_reason:
 *                             type: string
 *                             example: null
 *       404:
 *         description: No cases found with the specified criteria.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No cases found matching the criteria.
 *       500:
 *         description: Internal server error or database error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error.
 *                 error:
 *                   type: string
 *                   example: Detailed error message here.
 */
router.post("/Open_No_Agent_Cases_ALL", Open_No_Agent_Cases_ALL);

/**
 * @swagger
 * tags:
 *   - name: Case Management
 *     description: Case-related endpoints, allowing management and updates of case details.
 *
 * /api/case/Open_No_Agent_Cases_Direct_LD:
 *   post:
 *     summary: Retrieve cases with specific arrears amount, filtered reason as null, and "Open No Agent" status
 *     description: |
 *       Fetch cases where the following conditions are met:
 *       - `case_current_status` is "Open No Agent".
 *       - `filtered_reason` is null or an empty string.
 *       - `current_arrears_amount` is greater than 1000 and less than or equal to 5000.
 *       - Optionally filtered by `fromDate` and `toDate` for the `created_dtm` field.
 *
 *       | Version | Date       | Description    |
 *       |---------|------------|----------------|
 *       | 01      | 2025-Jan-09| Initial version|
 *
 *     tags:
 *      - Case Management
 *     parameters:
 *       - in: query
 *         name: fromDate
 *         required: true
 *         schema:
 *           type: String
 *           example: 2023-01-01
 *         description: Start date for filtering cases based on creation date.
 *       - in: query
 *         name: toDate
 *         required: true
 *         schema:
 *           type: String
 *           example: 2023-12-31
 *         description: End date for filtering cases based on creation date.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fromDate:
 *                 type: string
 *                 format: date
 *                 example: 2023-01-01
 *                 description: Start date for filtering cases based on creation date.
 *               toDate:
 *                 type: string
 *                 format: date
 *                 example: 2023-12-31
 *                 description: End date for filtering cases based on creation date.
 *     responses:
 *       200:
 *         description: Cases retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cases retrieved successfully.
 *                 criteria:
 *                   type: object
 *                   properties:
 *                     case_current_status:
 *                       type: string
 *                       example: Open No Agent
 *                     fromDate:
 *                       type: string
 *                       format: date
 *                       example: 2023-01-01
 *                     toDate:
 *                       type: string
 *                       format: date
 *                       example: 2023-12-31
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       case_id:
 *                         type: integer
 *                         example: 1
 *                       account_no:
 *                         type: integer
 *                         example: 987654321
 *                       area:
 *                         type: string
 *                         example: West Zone
 *                       rtom:
 *                         type: string
 *                         example: RTOM-02
 *                       filtered_reason:
 *                         type: string
 *                         example: null
 *       404:
 *         description: No cases found matching the criteria.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No cases found matching the criteria.
 *                 criteria:
 *                   type: object
 *                   properties:
 *                     case_current_status:
 *                       type: string
 *                       example: Open No Agent
 *                     fromDate:
 *                       type: string
 *                       format: date
 *                       example: 2023-01-01
 *                     toDate:
 *                       type: string
 *                       format: date
 *                       example: 2023-12-31
 *       500:
 *         description: Internal server error or database error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error.
 *                 error:
 *                   type: string
 *                   example: Detailed error message here.
 */
router.post("/Open_No_Agent_Cases_Direct_LD", Open_No_Agent_Cases_Direct_LD);

/**
 * @swagger
 * tags:
 *   - name: Case Management
 *     description: Case-related endpoints, allowing management and updates of case details.
 *
 * /api/case/Drc_Extend_Validity_Period:
 *   patch:
 *     summary: C-1AO1 Extend the validity period of a DRC
 *     description: |
 *       Updates the validity period of a DRC by modifying the expiration date, adding a transaction record, and managing system case interactions.
 *
 *       | Version | Date       | Description    |
 *       |---------|------------|----------------|
 *       | 01      | 2025-Jan-09| Initial version|
 *
 *     tags:
 *      - Case Management
 *     parameters:
 *       - in: query
 *         name: Case_Id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The ID of the Case to be updated.
 *       - in: query
 *         name: DRC_Id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The ID of the DRC to be updated.
 *       - in: query
 *         name: No_Of_Month
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Extend period. Should be less than or equal to 3
 *       - in: query
 *         name: Extended_By
 *         required: true
 *         schema:
 *           type: string
 *           example: Admin456
 *         description: Extended by.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Case_Id:
 *                 type: integer
 *                 description: The unique identifier for the case.
 *                 example: 1
 *               DRC_Id:
 *                 type: integer
 *                 description: The unique identifier for the DRC.
 *                 example: 1
 *               No_Of_Month:
 *                 type: integer
 *                 description: The number of months to extend the validity period.
 *                 example: 1
 *               Extended_By:
 *                 type: string
 *                 description: The username or ID of the person extending the validity period.
 *                 example: "user123"
 *     responses:
 *       200:
 *         description: DRC validity period successfully extended.
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
 *                   example: DRC validity period successfully extended.
 *       400:
 *         description: Validation error due to missing or invalid fields.
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
 *                   example: Failed to extend DRC validity period.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     description:
 *                       type: string
 *                       example: "All fields are required."
 *       500:
 *         description: Internal server error or database error.
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
 *                   oneOf:
 *                     - example: Error updating No of Months.
 *                     - example: Error inserting state change record.
 *                     - example: Error closing Agent time extend.
 *                     - example: Error updating System Case User Interaction.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: "An unexpected error occurred. Please try again later."
 */
router.patch("/Drc_Extend_Validity_Period", drcExtendValidityPeriod);

/**
 * @swagger
 * /api/case/Case_Abandant:
 *   patch:
 *     summary: Mark a case as abandoned with a specific action and user.
 *     tags:
 *       - Case Management
 *     parameters:
 *       - in: query
 *         name: case_id
 *         required: true
 *         schema:
 *           type: number
 *           example: 12345
 *         description: The unique identifier of the case to be marked as abandoned.
 *       - in: query
 *         name: Action
 *         required: true
 *         schema:
 *           type: string
 *           example: "Abandaned"
 *         description: The action to perform. Must be "Abandaned."
 *       - in: query
 *         name: Done_By
 *         required: true
 *         schema:
 *           type: string
 *           example: "AdminUser"
 *         description: The user or system performing the action.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               case_id:
 *                 type: number
 *                 example: 12345
 *                 description: The unique identifier of the case.
 *               Action:
 *                 type: string
 *                 example: "Abandaned"
 *                 description: The action to perform. Must be "Abandaned."
 *               Done_By:
 *                 type: string
 *                 example: "AdminUser"
 *                 description: The user or system performing the action.
 *     responses:
 *       200:
 *         description: Case marked as abandoned successfully.
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
 *                   example: Case abandoned successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     case_id:
 *                       type: number
 *                       example: 12345
 *                     case_current_status:
 *                       type: string
 *                       example: "Abandaned"
 *                     abnormal_stop:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           remark:
 *                             type: string
 *                             example: "Case marked as Abandaned"
 *                           done_by:
 *                             type: string
 *                             example: "AdminUser"
 *                           done_on:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-15T10:00:00Z"
 *                           action:
 *                             type: string
 *                             example: "Abandaned"
 *                     transaction:
 *                       type: object
 *                       properties:
 *                         Transaction_Id:
 *                           type: integer
 *                           example: 1001
 *                         transaction_type_id:
 *                           type: integer
 *                           example: 5
 *                         created_dtm:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-15T10:00:00Z"
 *       400:
 *         description: Invalid input, such as missing required fields or invalid action.
 *       404:
 *         description: Case not found with the provided case_id.
 *       500:
 *         description: Internal server error. Failed to abandon the case.
 */
router.patch("/Case_Abandant", Case_Abandant);

/**
 * @swagger
 * /api/case/Approve_Case_abandant:
 *   patch:
 *     summary: Approve a discarded case marked as "Abandaned".
 *     tags:
 *       - Case Management
 *     parameters:
 *       - in: query
 *         name: case_id
 *         required: true
 *         schema:
 *           type: number
 *           example: 12345
 *         description: The unique identifier of the case to approve.
 *       - in: query
 *         name: Approved_By
 *         required: true
 *         schema:
 *           type: string
 *           example: "admin_user"
 *         description: The username or ID of the person approving the case.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               case_id:
 *                 type: number
 *                 example: 12345
 *                 description: The unique identifier of the case to approve.
 *               Approved_By:
 *                 type: string
 *                 example: "admin_user"
 *                 description: The username or ID of the person approving the case.
 *     responses:
 *       200:
 *         description: Case marked as "Abandaned Approved" successfully.
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
 *                   example: Case Abandaned approved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     case_id:
 *                       type: number
 *                       example: 12345
 *                     case_current_status:
 *                       type: string
 *                       example: "Abandaned Approved"
 *                     approved_by:
 *                       type: string
 *                       example: "admin_user"
 *                     approved_on:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T14:30:00Z"
 *       400:
 *         description: Bad request. Missing or invalid required fields.
 *       404:
 *         description: Case not found with the provided case_id.
 *       500:
 *         description: Internal server error. Failed to approve the case discard.
 */
router.patch("/Approve_Case_abandant", Approve_Case_abandant);

/**
 * @swagger
 * /api/case/Open_No_Agent_Cases_F1_Filter:
 *   post:
 *     summary: Retrieve cases with the status "Open No Agent" and filtered_reason "Not Null" filtered by date range.
 *     tags:
 *       - Case Management
 *     parameters:
 *       - in: query
 *         name: from_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *         description: The start date of the date range in ISO format (yyyy-mm-dd).
 *       - in: query
 *         name: to_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-31"
 *         description: The end date of the date range in ISO format (yyyy-mm-dd).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               from_date:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-01"
 *                 description: The start date of the date range in ISO format.
 *               to_date:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-31"
 *                 description: The end date of the date range in ISO format.
 *     responses:
 *       200:
 *         description: Filtered cases retrieved successfully.
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
 *                   example: Filtered cases retrieved successfully.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       case_id:
 *                         type: string
 *                         example: "12345"
 *                       account_no:
 *                         type: string
 *                         example: "1234567890"
 *                       customer_ref:
 *                         type: string
 *                         example: "Customer123"
 *                       arrears_amount:
 *                         type: number
 *                         example: 5000.75
 *                       area:
 *                         type: string
 *                         example: "North Region"
 *                       rtom:
 *                         type: string
 *                         example: "RTOM123"
 *                       filtered_reason:
 *                         type: string
 *                         example: "High arrears amount"
 *                       created_dtm:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T10:00:00Z"
 *       400:
 *         description: Invalid input, such as missing required fields or incorrect date format.
 *       404:
 *         description: No cases found matching the criteria.
 *       500:
 *         description: Internal server error. Failed to retrieve cases.
 */
router.post("/Open_No_Agent_Cases_F1_Filter", Open_No_Agent_Cases_F1_Filter);

/**
 * @swagger
 * /api/case/Case_Current_Status:
 *   post:
 *     summary: Retrieve the current status of a specific case.
 *     tags:
 *       - Case Management
 *     parameters:
 *       - in: query
 *         name: Case_ID
 *         required: true
 *         schema:
 *           type: number
 *           example: 12345
 *         description: The unique identifier of the case to retrieve the current status for.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Case_ID:
 *                 type: number
 *                 example: 12345
 *                 description: The unique identifier of the case.
 *     responses:
 *       200:
 *         description: Current status of the case retrieved successfully.
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
 *                   example: Case current status retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     case_id:
 *                       type: number
 *                       example: 12345
 *                     case_current_status:
 *                       type: string
 *                       example: "Open"
 *       400:
 *         description: Bad request. Missing required fields.
 *       404:
 *         description: Case not found with the provided Case_ID.
 *       500:
 *         description: Internal server error. Failed to retrieve case status.
 */
router.post("/Case_Current_Status", Case_Current_Status);

// router.post("/List_All_DRC_Owned_By_Case", listAllDRCOwnedByCase);

/**
 * @swagger
 * tags:
 *   - name: Case Management
 *     description: Endpoints for managing and assigning Recovery Officers to cases.
 * 
 * /api/case/Assign_RO_To_Case:
 *   patch:
 *     summary: Assign a Recovery Officer to cases.
 *     description: |
 *       This endpoint assigns a Recovery Officer (RO) to multiple cases. The RO must be assigned to at least one RTOM area 
 *       that matches the case's area. Cases that do not satisfy this condition or do not belong to the specified DRC will not be updated.
 *       
 *       | Version | Date       | Description                       | Changed By         |
 *       |---------|------------|-----------------------------------|--------------------|
 *       | 01      | 2025-Feb-02| Assign Recovery Officer to cases | Sasindu Srinayaka  |
 *     tags:
 *       - Case Management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               case_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: List of case IDs to which the Recovery Officer will be assigned.
 *                 example: [10]
 *               ro_id:
 *                 type: integer
 *                 description: Recovery Officer ID who will be assigned.
 *                 example: 46
 *               drc_id:
 *                 type: integer
 *                 description: The DRC ID to which the cases belong.
 *                 example: 11
 *     responses:
 *       200:
 *         description: Recovery Officer assigned successfully.
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
 *                   example: Recovery Officers assigned successfully.
 *                 details:
 *                   type: object
 *                   properties:
 *                     updated_cases:
 *                       type: integer
 *                       description: Number of cases successfully updated.
 *                       example: 2
 *                     failed_cases:
 *                       type: array
 *                       description: List of cases that could not be updated.
 *                       items:
 *                         type: object
 *                         properties:
 *                           case_id:
 *                             type: integer
 *                             example: 104
 *                           message:
 *                             type: string
 *                             example: "The area 'Colombo' does not match any RTOM area assigned to Recovery Officer with ro_id: 10."
 *       400:
 *         description: Validation error - Missing or invalid required fields.
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
 *                   example: Failed to assign Recovery Officer.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     description:
 *                       type: string
 *                       example: case_ids must be a non-empty array or all fields are required.
 *       404:
 *         description: Recovery Officer or cases not found.
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
 *                   example: No cases found for the provided case IDs.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 404
 *                     description:
 *                       type: string
 *                       example: No Recovery Officer found with provided ro_id.
 *       500:
 *         description: Internal server error occurred while assigning the Recovery Officer.
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
 *                   example: An error occurred while assigning the Recovery Officer.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: Internal server error while assigning the Recovery Officer.
 */
router.patch("/Assign_RO_To_Case", assignROToCase);

/**
 * @swagger
 * tags:
 *   - name: Case Management
 *     description: Endpoints for managing and retrieving cases handled by DRC.
 * 
 * /api/case/List_Handling_Cases_By_DRC:
 *   post:
 *     summary: Retrieve cases handled by a DRC with filtering options.
 *     description: |
 *       This endpoint retrieves cases handled by a specific Debt Recovery Company (DRC). 
 *       Users can filter the cases based on optional parameters such as RTOM, Recovery Officer ID, arrears band, or a date range.
 *       The cases must have a `case_current_status` in specific predefined statuses and belong to an active DRC.
 *       
 *       | Version | Date       | Description                       | Changed By         |
 *       |---------|------------|-----------------------------------|--------------------|
 *       | 01      | 2025-Feb-02| List handling cases by DRC        | Sasindu Srinayaka  |
 *     tags:
 *       - Case Management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               drc_id:
 *                 type: integer
 *                 description: Unique identifier of the DRC.
 *                 example: 11
 *               rtom:
 *                 type: string
 *                 description: Area name associated with the case.
 *                 example: Matara
 *               ro_id:
 *                 type: integer
 *                 description: Recovery Officer ID responsible for the case.
 *                 example: 46
 *               arrears_band:
 *                 type: string
 *                 description: Arrears category for filtering cases.
 *                 example: AB-10_25
 *               from_date:
 *                 type: string
 *                 format: date
 *                 description: Start date for filtering cases.
 *                 example: "2025-01-01"
 *               to_date:
 *                 type: string
 *                 format: date
 *                 description: End date for filtering cases.
 *                 example: "2025-07-01"
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
 *                   items:
 *                     type: object
 *                     properties:
 *                       case_id:
 *                         type: integer
 *                         description: Unique identifier for the case.
 *                         example: 10
 *                       status:
 *                         type: string
 *                         description: Current status of the case.
 *                         example: "Negotiation Settle Active"
 *                       created_dtm:
 *                         type: string
 *                         format: date-time
 *                         description: Case creation date.
 *                         example: 2025-01-01T12:00:00.000+00:00
 *                       current_arreas_amount:
 *                         type: double
 *                         description: Outstanding arrears amount.
 *                         example: 11000.00
 *                       area:
 *                         type: string
 *                         description: RTOM area related to the case.
 *                         example: Matara
 *                       remark:
 *                         type: string
 *                         description: Latest remark on the case.
 *                         example: "Case is in negotiation."
 *                       expire_dtm:
 *                         type: string
 *                         format: date-time
 *                         description: Case expiration date.
 *                         example: 2025-05-01T12:00:00.000+00:00
 *                       ro_name:
 *                         type: string
 *                         description: Name of the assigned Recovery Officer.
 *                         example: "Sasindu"
 *       400:
 *         description: Validation error - Missing required fields or no filter parameters provided.
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
 *                   example: At least one filtering parameter is required.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     description:
 *                       type: string
 *                       example: Provide at least one of rtom, ro_id, arrears_band, or both from_date and to_date together.
 *       404:
 *         description: No matching cases found based on the given criteria.
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
 *                   example: No matching cases found for the given criteria.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 404
 *                     description:
 *                       type: string
 *                       example: No cases satisfy the provided criteria.
 *       500:
 *         description: Internal server error occurred while fetching case details.
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
 *                   example: An error occurred while retrieving cases.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: Internal server error while retrieving cases.
 */
router.post("/List_Handling_Cases_By_DRC", listHandlingCasesByDRC);

/**
 * @swagger
 * tags:
 *   - name: Case Management
 *     description: Endpoints for retrieving case behavior details during a specific DRC period.
 * 
 * /api/case/Case_Behavior_During_DRC:
 *   post:
 *     summary: Retrieve case behavior details during a specific DRC period.
 *     description: |
 *       This endpoint retrieves detailed behavior information about a case during a specified DRC period. 
 *       It includes settlement details, payment history, and Recovery Officer information if available.
 *       
 *       | Version | Date       | Description                       | Changed By         |
 *       |---------|------------|-----------------------------------|--------------------|
 *       | 01      | 2025-Feb-02| Retrieve case behavior during DRC era | Sasindu Srinayaka  |
 *     tags:
 *       - Case Management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               case_id:
 *                 type: integer
 *                 description: Unique identifier of the case.
 *                 example: 10
 *               drc_id:
 *                 type: integer
 *                 description: Unique identifier of the DRC.
 *                 example: 11
 *               ro_id:
 *                 type: integer
 *                 description: (Optional) Recovery Officer ID for filtering.
 *                 example: 46
 *     responses:
 *       200:
 *         description: Case behavior details retrieved successfully.
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
 *                   example: Case retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     formattedCase:
 *                       type: object
 *                       properties:
 *                         case_id:
 *                           type: integer
 *                           description: Unique identifier of the case.
 *                           example: 101
 *                         customer_ref:
 *                           type: string
 *                           description: Customer reference for the case.
 *                           example: "CR123456"
 *                         account_no:
 *                           type: string
 *                           description: Account number associated with the case.
 *                           example: "ACC7890"
 *                         current_arrears_amount:
 *                           type: number
 *                           description: Current arrears amount for the case.
 *                           example: 50000.75
 *                         last_payment_date:
 *                           type: string
 *                           format: date-time
 *                           description: Date of the last payment made for the case.
 *                           example: "2024-12-15T00:00:00Z"
 *                         ref_products:
 *                           type: array
 *                           items:
 *                             type: string
 *                           description: Reference products associated with the case.
 *                           example: ["Product A", "Product B"]
 *                         ro_id:
 *                           type: integer
 *                           description: Recovery Officer ID assigned to the case.
 *                           example: 10
 *                         ro_name:
 *                           type: string
 *                           description: Name of the assigned Recovery Officer.
 *                           example: "John Doe"
 *                         ro_contact_no:
 *                           type: string
 *                           description: Contact number of the Recovery Officer.
 *                           example: "0712345678"
 *                     settlementData:
 *                       type: object
 *                       properties:
 *                         created_dtm:
 *                           type: string
 *                           format: date-time
 *                           description: Date the settlement was created.
 *                           example: "2024-01-15T00:00:00Z"
 *                         settlement_status:
 *                           type: string
 *                           description: Current status of the settlement.
 *                           example: "Active"
 *                         expire_date:
 *                           type: string
 *                           format: date-time
 *                           description: Expiration date of the settlement.
 *                           example: "2024-12-31T00:00:00Z"
 *                     paymentData:
 *                       type: object
 *                       properties:
 *                         created_dtm:
 *                           type: string
 *                           format: date-time
 *                           description: Date the payment was created.
 *                           example: "2024-02-15T00:00:00Z"
 *                         bill_paid_amount:
 *                           type: number
 *                           description: Amount paid for the bill.
 *                           example: 15000.50
 *                         settled_balance:
 *                           type: number
 *                           description: Settled balance after the payment.
 *                           example: 35000.25
 *       400:
 *         description: Validation error - Missing required fields.
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
 *                   example: All fields are required.
 *       404:
 *         description: No matching cases, settlements, or payments found for the provided criteria.
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
 *                   example: No matching cases found for the given criteria.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 404
 *                     description:
 *                       type: string
 *                       example: No settlements or payments found for the case.
 *       500:
 *         description: Internal server error occurred while retrieving case behavior details.
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
 *                   example: An error occurred while retrieving case behaviors.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: Internal server error while retrieving case behaviors.
 */
router.post("/List_Behaviors_Of_Case_During_DRC", listBehaviorsOfCaseDuringDRC);

router.patch("/Update_case_last_Ro_Details", updateLastRoDetails);

// router.post("/List_All_Active_ROs_By_DRC", listAllActiveRosByDRCID);

/**
 * @swagger
 * tags:
 *   - name: Case Management
 *     description: Case-related endpoints, allowing management and retrieval of case details.
 *
 * /api/case/Open_No_Agent_Cases_ALL_By_Rulebase:
 *   post:
 *     summary: C-1P18 Retrieve Open No Agent Cases by Rule
 *     description: |
 *       Retrieves case details based on the rule for cases with the status "Open No Agent." Provides filtered results for specific criteria.
 *
 *       | Version | Date       | Description    |
 *       |---------|------------|----------------|
 *       | 01      | 2025-Jan-15| Initial version|
 *
 *     tags:
 *      - Case Management
 *     parameters:
 *       - in: query
 *         name: rule
 *         required: true
 *         schema:
 *           type: string
 *           example: "PEO TV"
 *         description: Rule.
 *       - in: query
 *         name: Case_Status
 *         required: false
 *         schema:
 *           type: string
 *           example: "Open No Agent"
 *         description: The status of the case to filter by.
 *       - in: query
 *         name: From_Date
 *         required: true
 *         schema:
 *           type: string
 *           example: "2025-01-01"
 *         description:  From date to filter cases by.
 *       - in: query
 *         name: To_Date
 *         required: true
 *         schema:
 *           type: string
 *           example: "2025-01-31"
 *         description:  To date to filter cases by.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Rule:
 *                 type: string
 *                 description: The rule to filter cases by.
 *                 example: "PEO TV"
 *               Case_Status:
 *                 type: string
 *                 description: The rule to filter cases by.
 *                 example: "Open No Agent"
 *               From_Date:
 *                 type: string
 *                 description: From date to filter cases by.
 *                 example: "2025-01-01"
 *               To_Date:
 *                 type: string
 *                 description: To date to filter cases by.
 *                 example: "2025-01-31"
 *     responses:
 *       200:
 *         description: Successfully retrieved Open No Agent case details.
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
 *                   example: Successfully retrieved Open No Agent case details.
 *                 data:
 *                   type: object
 *                   properties:
 *                     No_Agent_Cases:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           case_id:
 *                             type: integer
 *                           created_dtm:
 *                             type: string
 *                             format: date-time
 *                           account_no:
 *                             type: integer
 *                           customer_ref:
 *                             type: string
 *                           area:
 *                             type: string
 *                           rtom:
 *                             type: string
 *                           current_arrears_amount:
 *                             type: integer
 *                           action_type:
 *                             type: string
 *                           last_payment_dtm:
 *                             type: string
 *                             format: date-time
 *                           monitor_months:
 *                             type: integer
 *                           last_bss_reading_dtm:
 *                             type: string
 *                             format: date-time
 *                           commission:
 *                             type: string
 *                             nullable: true
 *                           case_current_status:
 *                             type: string
 *                           filtered_reason:
 *                             type: string
 *                           drc_selection_rule:
 *                             type: string
 *                           remark:
 *                             type: array
 *                             items:
 *                               type: object
 *                               additionalProperties:
 *                                 type: string
 *                           approve:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 approved_by:
 *                                   type: string
 *                                   nullable: true
 *                                 approved_process:
 *                                   type: string
 *                                   nullable: true
 *                                 approve_process:
 *                                   type: string
 *                                 approve_by:
 *                                   type: string
 *                                 approve_on:
 *                                   type: string
 *                                   format: date-time
 *                                 remark:
 *                                   type: string
 *                           contact:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 mob:
 *                                   type: integer
 *                                 email:
 *                                   type: string
 *                                 lan:
 *                                   type: integer
 *                                 address:
 *                                   type: string
 *                           drc:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 drc_name:
 *                                   type: string
 *                                 order_id:
 *                                   type: integer
 *                                 created_dtm:
 *                                   type: string
 *                                   format: date-time
 *                                 status:
 *                                   type: string
 *                                 status_dtm:
 *                                   type: string
 *                                   format: date-time
 *                                 case_removal_remark:
 *                                   type: string
 *                                   nullable: true
 *                                 removed_by:
 *                                   type: string
 *                                   nullable: true
 *                                 removed_dtm:
 *                                   type: string
 *                                   format: date-time
 *                                   nullable: true
 *                                 case_transfer_dtm:
 *                                   type: string
 *                                   format: date-time
 *                                   nullable: true
 *                                 transferred_by:
 *                                   type: string
 *                                   nullable: true
 *                                 recovery_officers:
 *                                   type: array
 *                                   items:
 *                                     type: string
 *                           case_status:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 status:
 *                                   type: string
 *                                   nullable: true
 *                                 Status_Type_ID:
 *                                   type: integer
 *                                 create_dtm:
 *                                   type: string
 *                                   format: date-time
 *                                 status_reason:
 *                                   type: string
 *                                 created_by:
 *                                   type: string
 *                                 notified_dtm:
 *                                   type: string
 *                                   format: date-time
 *                                   nullable: true
 *                                 expired_dtm:
 *                                   type: string
 *                                   format: date-time
 *                     F1_Filter:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           case_id:
 *                             type: integer
 *                           created_dtm:
 *                             type: string
 *                             format: date-time
 *                           account_no:
 *                             type: integer
 *                           customer_ref:
 *                             type: string
 *                           area:
 *                             type: string
 *                           rtom:
 *                             type: string
 *                           current_arrears_amount:
 *                             type: integer
 *                           action_type:
 *                             type: string
 *                           last_payment_dtm:
 *                             type: string
 *                             format: date-time
 *                           monitor_months:
 *                             type: integer
 *                           last_bss_reading_dtm:
 *                             type: string
 *                             format: date-time
 *                           commission:
 *                             type: string
 *                             nullable: true
 *                           case_current_status:
 *                             type: string
 *                           filtered_reason:
 *                             type: string
 *                           drc_selection_rule:
 *                             type: string
 *                           remark:
 *                             type: array
 *                             items:
 *                               type: object
 *                               additionalProperties:
 *                                 type: string
 *                     Direct_LD:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           case_id:
 *                             type: integer
 *                           created_dtm:
 *                             type: string
 *                             format: date-time
 *                           account_no:
 *                             type: integer
 *                           customer_ref:
 *                             type: string
 *                           area:
 *                             type: string
 *                           rtom:
 *                             type: string
 *                           current_arrears_amount:
 *                             type: integer
 *                           action_type:
 *                             type: string
 *                           last_payment_dtm:
 *                             type: string
 *                             format: date-time
 *                           monitor_months:
 *                             type: integer
 *                           last_bss_reading_dtm:
 *                             type: string
 *                             format: date-time
 *                           commission:
 *                             type: string
 *                             nullable: true
 *                           case_current_status:
 *                             type: string
 *                           filtered_reason:
 *                             type: string
 *                           drc_selection_rule:
 *                             type: string
 *                           remark:
 *                             type: array
 *                             items:
 *                               type: object
 *                               additionalProperties:
 *                                 type: string
 *       400:
 *         description: Validation error due to missing or invalid fields.
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
 *                   example: Failed to retrieve Open no agent case details.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     description:
 *                       type: string
 *                       example: "Rule is a required field."
 *       500:
 *         description: Internal server error or database error.
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
 *                   example: Failed to retrieve case details.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: "An unexpected error occurred. Please try again later."
 */
router.post(
  "/Open_No_Agent_Cases_ALL_By_Rulebase",
  openNoAgentCasesAllByServiceTypeRulebase
);

/**
 * @swagger
 * tags:
 *   - name: Case Management
 *     description: Case-related endpoints, allowing management and updates of case details.
 *
 * /api/case/Open_No_Agent_Count_Arrears_Band_By_Rulebase:
 *   post:
 *     summary: C-1P19 Retrieve Open No Agent Count Arrears Bands by Rule
 *     description: |
 *       Retrieves the count of cases with current arrears amounts divided into bands based on the rule.
 *
 *       | Version | Date       | Description    |
 *       |---------|------------|----------------|
 *       | 01      | 2025-Jan-15| Initial version|
 *
 *     tags:
 *      - Case Management
 *     parameters:
 *       - in: query
 *         name: Rule
 *         required: true
 *         schema:
 *           type: string
 *           example: "PEO TV"
 *         description: Rule to filter cases.
 *       - in: query
 *         name: Case_Status
 *         required: false
 *         schema:
 *           type: string
 *           example: "Open No Agent"
 *         description: The status of the case to filter by.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Rule:
 *                 type: string
 *                 description: The rule to filter cases by.
 *                 example: "PEO TV"
 *               Case_Status:
 *                 type: string
 *                 description: Case Status to filter cases by
 *                 example: "Open No Agent"
 *     responses:
 *       200:
 *         description: Successfully retrieved Open No Agent count by arrears bands.
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
 *                   example: Successfully retrieved arrears band counts for rule - PEO TV.
 *                 data:
 *                   type: object
 *                   properties:
 *                     "AB-5_10":
 *                       type: integer
 *                       example: 10
 *                     "AB-10_25":
 *                       type: integer
 *                       example: 5
 *                     "AB-25_50":
 *                       type: integer
 *                       example: 3
 *                     "AB-50_100":
 *                       type: integer
 *                       example: 1
 *                     "AB-100-9999":
 *                       type: integer
 *                       example: 2
 *       400:
 *         description: Validation error due to missing or invalid fields.
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
 *                   example: Failed to retrieve Open No Agent count.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     description:
 *                       type: string
 *                       example: "Rule is a required field."
 *       500:
 *         description: Internal server error or database error.
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
 *                   example: Failed to retrieve arrears band counts.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: "An unexpected error occurred. Please try again later."
 */
router.post(
  "/Open_No_Agent_Count_Arrears_Band_By_Rulebase",
  openNoAgentCountArrearsBandByServiceType
);

/**
 * @swagger
 * tags:
 *   - name: Case Management
 *     description: Case-related endpoints, allowing management and retrieval of case details.
 *
 * /api/case/List_Cases:
 *   post:
 *     summary: C-1G11 Retrieve Open No Agent Cases
 *     description: |
 *       Retrieves case details with the status "Open No Agent" for a specific date range where filtered reason is NULL.
 *
 *       | Version | Date       | Description    |
 *       |---------|------------|----------------|
 *       | 01      | 2025-Jan-19| Initial version|
 *
 *     tags:
 *      - Case Management
 *     parameters:
 *       - in: query
 *         name: From_Date
 *         required: true
 *         schema:
 *           type: string
 *           example: "2025-01-01"
 *         description:  From date to filter cases by.
 *       - in: query
 *         name: To_Date
 *         required: true
 *         schema:
 *           type: string
 *           example: "2025-01-31"
 *         description:  To date to filter cases by.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - From_Date
 *               - To_Date
 *             properties:
 *               From_Date:
 *                 type: string
 *                 format: date
 *                 description: From date to filter cases by.
 *                 example: "2025-01-01"
 *               To_Date:
 *                 type: string
 *                 format: date
 *                 description: To date to filter cases by.
 *                 example: "2025-01-31"
 *     responses:
 *       200:
 *         description: Successfully retrieved Open No Agent case details.
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
 *                   example: Successfully retrieved Open No Agent case details.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       case_id:
 *                         type: integer
 *                       created_dtm:
 *                         type: string
 *                         format: date-time
 *                       account_no:
 *                         type: integer
 *                       customer_ref:
 *                         type: string
 *                       area:
 *                         type: string
 *                       rtom:
 *                         type: string
 *                       current_arrears_amount:
 *                         type: integer
 *                       action_type:
 *                         type: string
 *                       last_payment_dtm:
 *                         type: string
 *                         format: date-time
 *                       case_current_status:
 *                         type: string
 *       400:
 *         description: Validation error due to missing or invalid fields.
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
 *                   example: Failed to retrieve Open No Agent case details.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     description:
 *                       type: string
 *                       example: "From_Date and To_Date are required fields."
 *       500:
 *         description: Internal server error or database error.
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
 *                   example: Failed to retrieve case details.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: "An unexpected error occurred. Please try again later."
 */
router.post("/List_Cases", listCases);

/**
 * @swagger
 * /api/case/Case_Status:
 *   post:
 *     summary: C-1P44 Retrieve Latest Case Status by Case ID
 *     description: |
 *       Retrieve the latest status of a case by the provided `Case_ID`.
 *       Includes details such as the status reason, created date, and expiration date.
 *
 *       | Version | Date        | Description                     | Changed By       |
 *       |---------|-------------|---------------------------------|------------------|
 *       | 01      | 2025-Jan-19 | Retrieve Latest Case Status     | Dinusha Anupama        |
 *
 *     tags: [Case Management]
 *     parameters:
 *       - in: query
 *         name: Case_ID
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1005
 *         description: ID of the Case to retrieve the latest status for.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Case_ID
 *             properties:
 *               Case_ID:
 *                 type: integer
 *                 description: The ID of the Case whose latest status is to be retrieved.
 *                 example: 1005
 *     responses:
 *       200:
 *         description: Latest case status retrieved successfully.
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
 *                   example: Latest case status retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     case_id:
 *                       type: integer
 *                       example: 1005
 *                     case_status:
 *                       type: string
 *                       example: Case_Close
 *                     status_reason:
 *                       type: string
 *                       example: New case 2
 *                     created_dtm:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-13T10:00:00.000Z"
 *                     created_by:
 *                       type: string
 *                       example: System
 *                     notified_dtm:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-11T10:00:00.000Z"
 *                     expire_dtm:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-01T00:00:00.000Z"
 *       400:
 *         description: Validation error - Case_ID not provided.
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
 *                   example: Case_ID is required.
 *       404:
 *         description: Case not found or no status available.
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
 *                   example: "No case status found for the given case."
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
 *                   example: Failed to retrieve case status.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     exception:
 *                       type: string
 *                       example: Detailed error message.
 */
router.post("/Case_Status", Case_Status);

/**
 * @swagger
 * /api/case/Case_List:
 *   post:
 *     summary: C-1P43 Retrieve List of Cases by Account Number
 *     description: |
 *       Retrieve a list of cases associated with a specific account number.
 *       Includes detailed case information and status history.
 *
 *       | Version | Date        | Description                 | Changed By       |
 *       |---------|-------------|-----------------------------|------------------|
 *       | 01      | 2025-Jan-19 | Retrieve List of Cases      | Dinusha Anupama      |
 *
 *     tags: [Case Management]
 *     parameters:
 *       - in: query
 *         name: account_no
 *         required: true
 *         schema:
 *           type: integer
 *           example: 46236534
 *         description: Account number to retrieve associated cases for.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - account_no
 *             properties:
 *               account_no:
 *                 type: integer
 *                 description: The account number for which the cases are to be retrieved.
 *                 example: 46236534
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
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The unique identifier for the case.
 *                         example: a67b89c1d234e567f8901234
 *                       case_id:
 *                         type: integer
 *                         description: Unique ID of the case.
 *                         example: 200
 *                       created_dtm:
 *                         type: string
 *                         format: date-time
 *                         description: The date and time the case was created.
 *                         example: "2025-01-10T12:00:00.000Z"
 *                       account_no:
 *                         type: integer
 *                         description: Associated account number.
 *                         example: 46236534
 *                       customer_ref:
 *                         type: string
 *                         description: Customer reference.
 *                         example: CR004241061
 *                       area:
 *                         type: string
 *                         description: Area associated with the case.
 *                         example: Matara
 *                       rtom:
 *                         type: string
 *                         description: RTOM region for the case.
 *                         example: MA
 *                       current_arrears_amount:
 *                         type: number
 *                         description: Current arrears amount for the case.
 *                         example: 5500
 *                       action_type:
 *                         type: string
 *                         description: Action type associated with the case.
 *                         example: AT002
 *                       monitor_months:
 *                         type: integer
 *                         description: Number of months under monitoring.
 *                         example: 2
 *                       commission:
 *                         type: number
 *                         nullable: true
 *                         description: Commission details.
 *                         example: null
 *                       case_current_status:
 *                         type: string
 *                         description: Current status of the case.
 *                         example: Open with Agent
 *                       case_status:
 *                         type: array
 *                         description: History of status updates for the case.
 *                         items:
 *                           type: object
 *                           properties:
 *                             status_reason:
 *                               type: string
 *                               description: Reason for the status.
 *                               example: Legal team decision
 *                             created_by:
 *                               type: string
 *                               description: User who created the status.
 *                               example: Agent005
 *                             notified_dtm:
 *                               type: string
 *                               format: date-time
 *                               description: Notification timestamp for the status.
 *                               example: "2024-11-05T00:00:00.000Z"
 *       400:
 *         description: Validation error - Account number not provided.
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
 *                   example: Account number is required.
 *       404:
 *         description: No cases found for the specified account number.
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
 *                   example: No cases found for account number 46236534.
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
 *                 errors:
 *                   type: object
 *                   properties:
 *                     exception:
 *                       type: string
 *                       example: Detailed error message.
 */
router.post("/Case_List", Case_List);

/**
 * @swagger
 * /api/case/Acivite_Case_Details:
 *   post:
 *     summary: C-1P42 Retrieve Active Case Details by Account Number
 *     description: |
 *       Retrieve a list of active cases associated with a specific account number.
 *       Active cases are those where the latest status is not in the excluded statuses:
 *       `Write_Off`, `Abandoned`, `Case_Close`, `Withdraw`.
 *
 *       | Version | Date        | Description                     | Changed By       |
 *       |---------|-------------|---------------------------------|------------------|
 *       | 01      | 2025-Jan-19 | Retrieve Active Case Details    | Dinusha Anupama        |
 *
 *     tags: [Case Management]
 *     parameters:
 *       - in: query
 *         name: account_no
 *         required: true
 *         schema:
 *           type: integer
 *           example: 54321
 *         description: Account number to retrieve associated active cases for.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - account_no
 *             properties:
 *               account_no:
 *                 type: integer
 *                 description: The account number for which active cases are to be retrieved.
 *                 example: 54321
 *     responses:
 *       200:
 *         description: Active cases retrieved successfully.
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
 *                   example: Active cases retrieved successfully.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The unique identifier for the case.
 *                         example: 6788b883bb5a2e0b24a12ea6
 *                       case_id:
 *                         type: integer
 *                         description: Unique ID of the case.
 *                         example: 1003
 *                       incident_id:
 *                         type: integer
 *                         description: Incident ID associated with the case.
 *                         example: 2
 *                       account_no:
 *                         type: integer
 *                         description: Associated account number.
 *                         example: 54321
 *                       customer_ref:
 *                         type: string
 *                         description: Customer reference.
 *                         example: CUST123
 *                       created_dtm:
 *                         type: string
 *                         format: date-time
 *                         description: The date and time the case was created.
 *                         example: "2025-01-16T10:00:00.000Z"
 *                       implemented_dtm:
 *                         type: string
 *                         format: date-time
 *                         description: The date and time the case was implemented.
 *                         example: "2025-01-02T15:00:00.000Z"
 *                       area:
 *                         type: string
 *                         description: Area associated with the case.
 *                         example: Central
 *                       rtom:
 *                         type: string
 *                         description: RTOM region for the case.
 *                         example: Region A
 *                       bss_arrears_amount:
 *                         type: number
 *                         description: BSS arrears amount.
 *                         example: 1500.5
 *                       current_arrears_amount:
 *                         type: number
 *                         description: Current arrears amount.
 *                         example: 1200.75
 *                       action_type:
 *                         type: string
 *                         description: Action type associated with the case.
 *                         example: Recovery
 *                       last_payment_date:
 *                         type: string
 *                         format: date-time
 *                         description: The date of the last payment.
 *                         example: "2024-12-31T00:00:00.000Z"
 *                       monitor_months:
 *                         type: integer
 *                         description: Number of months under monitoring.
 *                         example: 3
 *                       last_bss_reading_date:
 *                         type: string
 *                         format: date-time
 *                         description: Date of the last BSS reading.
 *                         example: "2024-12-30T00:00:00.000Z"
 *                       commission:
 *                         type: number
 *                         nullable: true
 *                         description: Commission details.
 *                         example: 10.5
 *                       case_current_status:
 *                         type: string
 *                         description: Current status of the case.
 *                         example: Discard Approved
 *                       filtered_reason:
 *                         type: string
 *                         nullable: true
 *                         description: Reason for filtering the case.
 *                         example: No agent available for assignment
 *                       case_status:
 *                         type: array
 *                         description: History of status updates for the case.
 *                         items:
 *                           type: object
 *                           properties:
 *                             case_status:
 *                               type: string
 *                               description: Current status of the case.
 *                               example: Open
 *                             status_reason:
 *                               type: string
 *                               description: Reason for the status.
 *                               example: New case
 *                             created_dtm:
 *                               type: string
 *                               format: date-time
 *                               description: The date the status was created.
 *                               example: "2025-01-01T10:00:00.000Z"
 *                             created_by:
 *                               type: string
 *                               description: User who created the status.
 *                               example: System
 *                             notified_dtm:
 *                               type: string
 *                               format: date-time
 *                               description: Notification timestamp for the status.
 *                               example: "2025-01-01T10:15:00.000Z"
 *                             expire_dtm:
 *                               type: string
 *                               format: date-time
 *                               nullable: true
 *                               description: Expiration timestamp for the status.
 *                               example: "2025-07-01T00:00:00.000Z"
 *       400:
 *         description: Validation error - Account number not provided.
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
 *                   example: Account number is required.
 *       404:
 *         description: No active cases found for the specified account number.
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
 *                   example: No active cases found for account number 54321.
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
 *                   example: Failed to retrieve active cases.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     exception:
 *                       type: string
 *                       example: Detailed error message.
 */
router.post("/Acivite_Case_Details", Acivite_Case_Details);

router.get("/get_count_by_drc_commision_rule", get_count_by_drc_commision_rule);

router.get("/getAllArrearsBands", getAllArrearsBands);

/**
 * @swagger
 * /api/case/count_cases_rulebase_and_arrears_band:
 *   post:
 *     summary: C-1P59 Count Cases by Rulebase and Arrears Band
 *     description: |
 *       Retrieve counts of cases grouped by arrears bands and filtered by the provided `drc_commision_rule`.
 *       This endpoint also ensures only cases with the latest status as `Open No Agent` are considered.
 *
 *       | Version | Date        | Description                    | Changed By       |
 *       |---------|-------------|--------------------------------|------------------|
 *       | 01      | 2025-Jan-24 | Count Cases by Rulebase        | Dinusha Anupama        |
 *
 *     tags: [Case Management]
 *     parameters:
 *       - in: query
 *         name: drc_commision_rule
 *         required: true
 *         schema:
 *           type: string
 *           example: PEO TV
 *         description: Commission rule to filter cases.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - drc_commision_rule
 *             properties:
 *               drc_commision_rule:
 *                 type: string
 *                 description: The commission rule used to filter cases.
 *                 example: PEO TV
 *     responses:
 *       200:
 *         description: Counts retrieved successfully.
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
 *                   example: Counts retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     Total:
 *                       type: integer
 *                       description: Total number of cases matching the criteria.
 *                       example: 2
 *                     Arrears_Bands:
 *                       type: array
 *                       description: List of arrears bands with counts of matching cases.
 *                       items:
 *                         type: object
 *                         properties:
 *                           band:
 *                             type: string
 *                             description: Range of the arrears band.
 *                             example: 5000-10000
 *                           count:
 *                             type: integer
 *                             description: Count of cases in this arrears band.
 *                             example: 1
 *                           details:
 *                             type: object
 *                             description: Additional information about the arrears band.
 *                             properties:
 *                               description:
 *                                 type: string
 *                                 description: Description of the arrears band range.
 *                                 example: Cases in the range of 5000-10000
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
 *                   example: drc_commision_rule is required.
 *       404:
 *         description: No cases or arrears bands found.
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
 *                   example: No cases found for the provided criteria.
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
 *                   example: Failed to retrieve counts.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     exception:
 *                       type: string
 *                       example: Detailed error message.
 */

router.post(
  "/count_cases_rulebase_and_arrears_band",
  count_cases_rulebase_and_arrears_band
);

/**
 * @swagger
 * /api/Case_Distribution_Among_Agents:
 *   post:
 *     summary: C-1P20 Distribute Cases Among Agents
 *     description: |
 *       Distribute Cases among Agents and case_status='Open Assign Agent'
 *
 *
 *       | Version | Date        | Description                            | Changed By       |
 *       |---------|------------|----------------------------------------|------------------|
 *       | 01      | 2025-Jan-28 | Case distribution among agents        | Sanjaya Perera   |
 *
 *     tags: [Case Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - drc_commision_rule
 *               - current_arrears_band
 *               - drc_list
 *               - created_by
 *             properties:
 *               drc_commision_rule:
 *                 type: string
 *                 description: The commission rule for distributing cases.
 *                 example: "PEO TV"
 *               current_arrears_band:
 *                 type: string
 *                 description: The arrears band used for filtering cases.
 *                 example: "5000-10000"
 *               drc_list:
 *                 type: array
 *                 description: List of DRCs and their case counts.
 *                 items:
 *                   type: object
 *                   properties:
 *                     DRC:
 *                       type: string
 *                       description: The agent or DRC handling cases.
 *                       example: "Agent_001"
 *                     Count:
 *                       type: integer
 *                       description: The number of cases assigned.
 *                       example: 5
 *               created_by:
 *                 type: string
 *                 description: The user who initiated the distribution.
 *                 example: "admin_user"
 *     responses:
 *       200:
 *         description: Task successfully created for case distribution.
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
 *                   example: Task successfully created.
 *                 data:
 *                   type: object
 *                   properties:
 *                     task_id:
 *                       type: string
 *                       description: Unique identifier for the created task.
 *                       example: "task_12345"
 *                     case_distribution_batch_id:
 *                       type: integer
 *                       description: Unique batch ID for case distribution.
 *                       example: 1001
 *       400:
 *         description: Validation error - Missing or incorrect required parameters.
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
 *                   example: DRC commission rule, current arrears band, created by and DRC list fields are required.
 *       500:
 *         description: Internal server error.
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
 *                   example: An error occurred while creating the task.
 */

router.post("/Case_Distribution_Among_Agents", Case_Distribution_Among_Agents);

router.post(
  "/List_Case_Distribution_DRC_Summary",
  List_Case_Distribution_DRC_Summary
);

router.post("/Batch_Forward_for_Proceed", Batch_Forward_for_Proceed);

router.post(
  "/Create_Task_For_case_distribution",
  Create_Task_For_case_distribution
);

router.post(
  "/List_All_DRC_Mediation_Board_Cases",listAllDRCMediationBoardCases
);

/**
 * @swagger
 * /api/List_all_transaction_seq_of_batch_id:
 *   post:
 *     summary: C-1P062 List All Transactions of a Batch
 *     description: |
 *      this function for get the all the sequence data of the batch and pass the case_distribution_batch_id
 *
 *       | Version | Date        | Description                            | Changed By       |
 *       |---------|------------|----------------------------------------|------------------|
 *       | 01      | 2025-feb-06 | List all transactions by batch ID     | Sanjaya Perera   |
 *
 *     tags: [Case Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               case_distribution_batch_id:
 *                 type: string
 *                 description: The batch ID for which transactions should be retrieved.
 *                 example: "65a1b2c3d4e5f67890123456"
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully.
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
 *                   example: Successfully retrieved 5 records.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Unique identifier for the transaction.
 *                         example: "65b2c3d4e5f6789012345678"
 *                       case_distribution_batch_id:
 *                         type: string
 *                         description: Batch ID associated with the transaction.
 *                         example: "65a1b2c3d4e5f67890123456"
 *                       transaction_type:
 *                         type: string
 *                         description: Type of transaction.
 *                         example: "Allocation"
 *                       transaction_date:
 *                         type: string
 *                         format: date-time
 *                         description: Date and time of the transaction.
 *                         example: "2025-01-28T14:30:00Z"
 *                       transaction_amount:
 *                         type: number
 *                         format: float
 *                         description: Amount associated with the transaction.
 *                         example: 1000.50
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
 *                   example: case_distribution_batch_id is a required parameter.
 *       404:
 *         description: No transactions found for the given batch ID.
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
 *                   example: No data found for this batch ID.
 *       500:
 *         description: Internal server error.
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
 *                   example: Server error. Please try again later.
 */

router.post(
  "/List_all_transaction_seq_of_batch_id",
  List_all_transaction_seq_of_batch_id
);

/**
 * @swagger
 * /api/Create_Task_For_case_distribution_transaction:
 *   post:
 *     summary: xxxx Create Task for Case Distribution Transaction
 *     description: |
 *       Creates a task for case distribution transactions based on the provided batch ID.
 *
 *       | Version | Date        | Description                                          | Changed By       |
 *       |---------|------------|------------------------------------------------------|------------------|
 *       | 01      | 2025-Feb-10 | Initial creation of task for case distribution     | Sanjaya Perera   |
 *
 *     tags: [Case Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - case_distribution_batch_id
 *
 *
 *             properties:
 *               case_distribution_batch_id:
 *                 type: integer
 *                 description: Unique batch ID for case distribution.
 *                 example: 1001
 *     responses:
 *       201:
 *         description: Task successfully created for case distribution transaction.
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
 *                   example: Create Case distribution DRC Transaction_1_Batch List for Download
 *                 data:
 *                   type: object
 *                   properties:
 *                     Template_Task_Id:
 *                       type: integer
 *                       description: The template ID for the created task.
 *                       example: 27
 *                     task_type:
 *                       type: string
 *                       description: The type of task created.
 *                       example: "Create Case distribution DRC Transaction_1 _Batch List for Download"
 *                     case_distribution_batch_id:
 *                       type: integer
 *                       description: The batch ID associated with the task.
 *                       example: 1001
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
 *                   example: case_distribution_batch_id is a required parameter.
 *       500:
 *         description: Internal server error.
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
 *                       example: Error message details.
 */

router.post(
  "/Create_Task_For_case_distribution_transaction",
  Create_Task_For_case_distribution_transaction
);

router.post(
  "/get_distribution_array_of_a_transaction",
  get_distribution_array_of_a_transaction
);

/**
 * @swagger
 * /api/Create_Task_For_case_distribution_transaction_array:
 *   post:
 *     summary: xxxx Create Task for Case Distribution Transaction Array
 *     description: |
 *       Creates a task for case distribution transactions with batch sequence details.
 *
 *       | Version | Date        | Description                                                   | Changed By       |
 *       |---------|------------|---------------------------------------------------------------|------------------|
 *       | 01      | 2025-Feb-10 | Initial creation of task for batch list distribution array  | Sanjaya Perera   |
 *
 *     tags: [Case Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - case_distribution_batch_id
 *               - batch_seq
 *               - Created_By
 *             properties:
 *               case_distribution_batch_id:
 *                 type: integer
 *                 description: Unique batch ID for case distribution.
 *                 example: 1001
 *               batch_seq:
 *                 type: integer
 *                 description: The batch sequence number.
 *                 example: 1
 *               Created_By:
 *                 type: string
 *                 description: The user who created the task.
 *                 example: "admin_user"
 *     responses:
 *       201:
 *         description: Task successfully created for case distribution transaction array.
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
 *                   example: Create Case distribution DRC Transaction_1_Batch List distribution array for Download
 *                 data:
 *                   type: object
 *                   properties:
 *                     Template_Task_Id:
 *                       type: integer
 *                       description: The template ID for the created task.
 *                       example: 28
 *                     task_type:
 *                       type: string
 *                       description: The type of task created.
 *                       example: "Create Case distribution DRC Transaction_1 _Batch List distribution array for Download"
 *                     case_distribution_batch_id:
 *                       type: integer
 *                       description: The batch ID associated with the task.
 *                       example: 1001
 *                     batch_seq:
 *                       type: integer
 *                       description: The batch sequence number.
 *                       example: 1
 *                     Created_By:
 *                       type: string
 *                       description: The user who created the task.
 *                       example: "admin_user"
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
 *                   example: case_distribution_batch_id, batch_seq, and Created_By are required parameters.
 *       500:
 *         description: Internal server error.
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
 *                       example: Error message details.
 */

router.post(
  "/Create_Task_For_case_distribution_transaction_array",
  Create_Task_For_case_distribution_transaction_array
);

/**
 * @swagger
 * /Exchange_DRC_RTOM_Cases:
 *   post:
 *     summary: C-1P24 Exchange Case Distribution Planning among DRC
 *     description: |
 *       Creates a task to exchange case distribution planning among DRCs.
 *
 *       | Version | Date        | Description                                     | Changed By       |
 *       |---------|------------|-------------------------------------------------|------------------|
 *       | 01      | 2025-Feb-11 | Initial creation of Exchange DRC cases API     | Sanjaya Perera   |
 *
 *     tags: [Case Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - case_distribution_batch_id
 *               - drc_list
 *               - created_by
 *             properties:
 *               case_distribution_batch_id:
 *                 type: integer
 *                 description: Unique batch ID for case distribution.
 *                 example: 1001
 *               drc_list:
 *                 type: array
 *                 description: List of DRC exchange details.
 *                 items:
 *                   type: object
 *                   required:
 *                     - plus_drc_id
 *                     - plus_drc
 *                     - plus_rulebase_count
 *                     - minus_drc_id
 *                     - minus_drc
 *                     - minus_rulebase_count
 *                   properties:
 *                     plus_drc_id:
 *                       type: integer
 *                       description: ID of the DRC gaining cases.
 *                       example: 2
 *                     plus_drc:
 *                       type: string
 *                       description: Name of the DRC gaining cases.
 *                       example: "DRC A"
 *                     plus_rulebase_count:
 *                       type: integer
 *                       description: Number of cases added to the DRC.
 *                       example: 50
 *                     minus_drc_id:
 *                       type: integer
 *                       description: ID of the DRC losing cases.
 *                       example: 3
 *                     minus_drc:
 *                       type: string
 *                       description: Name of the DRC losing cases.
 *                       example: "DRC B"
 *                     minus_rulebase_count:
 *                       type: integer
 *                       description: Number of cases removed from the DRC.
 *                       example: 50
 *                     rtom:
 *                       type: string
 *                       description: Additional RTOM information.
 *                       example: "RTOM1234"
 *               created_by:
 *                 type: string
 *                 description: User who initiated the request.
 *                 example: "admin_user"
 *     responses:
 *       200:
 *         description: Successfully exchanged case distributions among DRCs.
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
 *                   example: "New batch sequence 2 added successfully."
 *       400:
 *         description: Validation error - Missing required parameters or invalid data.
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
 *                   example: "case distribution batch id, created by, and DRC list fields are required."
 *       500:
 *         description: Internal server error.
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
 *                   example: "An error occurred while creating the task."
 */

router.post("/Exchange_DRC_RTOM_Cases", Exchange_DRC_RTOM_Cases);

/**
 * @swagger
 * /Case_Distribution_Details_With_Drc_Rtom_ByBatchId:
 *   post:
 *     summary: xxxx Retrieve Case Distribution Details by Batch ID
 *     description: |
 *       Fetches case distribution details including DRC and RTOM information for a given batch ID.
 *
 *       | Version | Date        | Description                                    | Changed By       |
 *       |---------|------------|------------------------------------------------|------------------|
 *       | 01      | 2025-Feb-11 | Initial creation of Case Distribution API     | Sanjaya Perera   |
 *
 *     tags: [Case Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - case_distribution_batch_id
 *             properties:
 *               case_distribution_batch_id:
 *                 type: integer
 *                 description: Unique batch ID for case distribution.
 *                 example: 1001
 *     responses:
 *       200:
 *         description: Successfully retrieved case distribution details.
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
 *                   example: "Case distribution details retrieved successfully."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       case_distribution_batch_id:
 *                         type: integer
 *                         example: 1001
 *                       drc_id:
 *                         type: integer
 *                         example: 2
 *                       rtom:
 *                         type: string
 *                         example: "RTOM1234"
 *                       case_count:
 *                         type: integer
 *                         example: 50
 *                       drc_name:
 *                         type: string
 *                         example: "Debt Recovery Corp"
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
 *                   example: "Case_Distribution_Batch_ID is required."
 *       404:
 *         description: No records found for the provided batch ID.
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
 *                   example: "No case distribution details found for the given batch ID."
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 404
 *                     description:
 *                       type: string
 *                       example: "No records match the provided Case_Distribution_Batch_ID."
 *       500:
 *         description: Internal server error.
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
 *                   example: "An error occurred while retrieving case distribution details."
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: "Error message details."
 */

router.post(
  "/Case_Distribution_Details_With_Drc_Rtom_ByBatchId",
  Case_Distribution_Details_With_Drc_Rtom_ByBatchId
);

router.get(
  "/List_All_Batch_Details",
  List_All_Batch_Details
);

router.post(
  "/Approve_Batch_or_Batches",
  Approve_Batch_or_Batches
);

router.post(
  "/Create_task_for_batch_approval",
  Create_task_for_batch_approval
);

router.post(
  "/List_DRC_Assign_Manager_Approval",
  List_DRC_Assign_Manager_Approval
);

router.post(
  "/Approve_DRC_Assign_Manager_Approval",
  Approve_DRC_Assign_Manager_Approval
);

router.post(
  "/Reject_DRC_Assign_Manager_Approval",
  Reject_DRC_Assign_Manager_Approval
);

router.post(
  "/Create_task_for_DRC_Assign_Manager_Approval",
  Create_task_for_DRC_Assign_Manager_Approval
);


/**
 * @swagger
 * /api/Case_Details_for_DRC:
 *   post:
 *     summary: Fetch and Edit Case Details for DRC
 *     description: |
 *       Fetches or displays case details including Case ID, Customer Reference, Account Number, Arrears Amount, Last Payment Date, and the most recently added customer details such as Contact number, NIC/PP/Driving License, Email, and Address for editing on the customer profile page.
 *
 *       | Version | Date        | Description                                                                                      | Changed By             |
 *       |---------|-------------|--------------------------------------------------------------------------------------------------|------------------------|
 *       | 01      | 2025-Feb-13 | Fetch and display detailed case and customer information for editing in the DRC profile page.   | Susinidu Sachinthana  |
 *
 *     tags: [Case Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - case_id
 *               - account_no
 *               - customer_ref
 *               - current_arrears_amount
 *               - last_payment_date
 *               - current_contact
 *             properties:
 *               case_id:
 *                 type: number
 *                 description: Unique identifier for the case.
 *                 example: 123
 *               account_no:
 *                 type: string
 *                 description: The account number associated with the case.
 *                 example: "456"
 *               customer_ref:
 *                 type: string
 *                 description: Reference name of the customer.
 *                 example: "John Doe"
 *               current_arrears_amount:
 *                 type: number
 *                 description: Current arrears amount for the case.
 *                 example: 27000
 *               last_payment_date:
 *                 type: string
 *                 format: date
 *                 description: Date of the last payment made by the customer.
 *                 example: "2024-12-03"
 *               current_contact:
 *                 type: array
 *                 description: A list of customer contact details.
 *                 items:
 *                   type: object
 *                   properties:
 *                     mob:
 *                       type: string
 *                       description: Mobile number of the customer.
 *                       example: "0743564765"
 *                     email:
 *                       type: string
 *                       description: Email address of the customer.
 *                       example: "example@gmail.com"
 *                     nic:
 *                       type: string
 *                       description: NIC or identification number of the customer.
 *                       example: "200546376548"
 *                     lan:
 *                       type: string
 *                       description: Landline phone number of the customer.
 *                       example: "0378564356"
 *                     address:
 *                       type: string
 *                       description: Address of the customer.
 *                       example: "Koswatta, Kiribathgoda"
 *     responses:
 *       200:
 *         description: Case details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     case_id:
 *                       type: number
 *                       example: 123
 *                     account_no:
 *                       type: string
 *                       example: "456"
 *                     customer_ref:
 *                       type: string
 *                       example: "John Doe"
 *                     current_arrears_amount:
 *                       type: number
 *                       example: 27000
 *                     last_payment_date:
 *                       type: string
 *                       format: date
 *                       example: "2024-12-03"
 *                     current_contact:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           mob:
 *                             type: string
 *                             example: "0743564765"
 *                           email:
 *                             type: string
 *                             example: "example@gmail.com"
 *                           nic:
 *                             type: string
 *                             example: "200546376548"
 *                           lan:
 *                             type: string
 *                             example: "0378564356"
 *                           address:
 *                             type: string
 *                             example: "Koswatta, Kiribathgoda"
 *       400:
 *         description: Validation error - Missing required parameters or invalid input.
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
 *                   example: Invalid input data provided.
 *       404:
 *         description: Case details not found.
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
 *                   example: No case details found matching the provided criteria.
 *       500:
 *         description: Internal server error.
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
 *                   example: An unexpected error occurred while fetching case details.
 */

// Define the POST route for fetching case details
router.post("/Case_Details_for_DRC", drcCaseDetails);


/**
 * @swagger
 * /api/Update_Customer_Contacts:
 *   post:
 *     summary: Updates specific customer profile details
 *     description: |
 *       Updates specific customer profile details, including Contact Numbers, NIC/PP/Driving License, Email, Address, and Remark.
 *
 *       | Version | Date        | Description                                | Changed By             |
 *       |---------|-------------|--------------------------------------------|------------------------|
 *       | 01      | 2025-Feb-13 | Updates specific customer profile details  | Susinidu Sachinthana   |
 *
 *     tags: [Customer Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ro_edited_customer_details
 *               - current_contact
 *             properties:
 *               current_contact:
 *                 type: array
 *                 description: A list of current contact details of the customer.
 *                 items:
 *                   type: object
 *                   properties:
 *                     mob:
 *                       type: string
 *                       description: Mobile number of the customer.
 *                       example: "0743564765"
 *                     email:
 *                       type: string
 *                       description: Email of the customer.
 *                       example: "example@gmail.com"
 *                     nic:
 *                       type: string
 *                       description: NIC of the customer.
 *                       example: "200546376548"
 *                     lan:
 *                       type: string
 *                       description: Land phone number of the customer.
 *                       example: "0378564356"
 *                     address:
 *                       type: string
 *                       description: Address of the customer.
 *                       example: "Koswatta, Kiribathgoda"
 *               ro_edited_customer_details:
 *                 type: array
 *                 description: Details edited by the logged-in RO.
 *                 items:
 *                   type: object
 *                   properties:
 *                     ro_id:
 *                       type: number
 *                       description: Logged-in RO's ID.
 *                       example: 123
 *                     drc_id:
 *                       type: number
 *                       description: Logged-in RO's DRC.
 *                       example: 123
 *                     mob:
 *                       type: string
 *                       description: Mobile number of the customer.
 *                       example: "0743564765"
 *                     email:
 *                       type: string
 *                       description: Email of the customer.
 *                       example: "example@gmail.com"
 *                     nic:
 *                       type: string
 *                       description: NIC of the customer.
 *                       example: "200546376548"
 *                     lan:
 *                       type: string
 *                       description: Land phone number of the customer.
 *                       example: "0378564356"
 *                     address:
 *                       type: string
 *                       description: Address of the customer.
 *                       example: "Koswatta, Kiribathgoda"
 *                     geo_location:
 *                       type: string
 *                       description: The location where customer details are edited (not required - NULL).
 *                       example: ""
 *                     remarks:
 *                       type: string
 *                       description: Remarks regarding the customer.
 *                       example: ""
 *     responses:
 *       200:
 *         description: Customer details updated successfully.
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
 *                   example: Customer details updated successfully.
 *       400:
 *         description: Validation error - Missing or invalid input.
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
 *                   example: Validation error - Invalid input.
 *       500:
 *         description: Internal server error.
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
 *                       example: Detailed server error message.
 */

// POST route to update customer contacts or remarks for a specific case.
router.post("/Update_Customer_Contacts",updateDrcCaseDetails);

export default router;
