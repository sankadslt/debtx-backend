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
  ListALLMediationCasesownnedbyDRCRO,
  List_count_by_drc_commision_rule,
  ListAllArrearsBands,
  count_cases_rulebase_and_arrears_band,
  Case_Distribution_Among_Agents,
  List_Case_Distribution_DRC_Summary,
  Batch_Forward_for_Proceed,
  Create_Task_For_case_distribution,
  List_all_transaction_seq_of_batch_id,
  Create_Task_For_case_distribution_transaction,
  ListActiveRORequestsMediation,
  list_distribution_array_of_a_transaction,
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
  Assign_DRC_To_Case,
  List_Case_Distribution_Details,
  Create_Task_For_case_distribution_drc_summery,
  List_Case_Distribution_Details_With_Rtoms,
  List_CasesOwened_By_DRC,
  listDRCAllCases,
  ListActiveMediationResponse,
  ListActiveRORequests,
  CaseDetailsforDRC,
  // addCpeToNegotiation,
  Create_Task_For_Assigned_drc_case_list_download,
  // listAllDRCMediationBoardCases,
  // drcCaseDetails,
  Mediation_Board,
  updateDrcCaseDetails,
  AssignDRCToCaseDetails,
  Withdraw_CasesOwened_By_DRC,
  // List_All_DRCs_Mediation_Board_Cases,
  Accept_Non_Settlement_Request_from_Mediation_Board,
  ListAllRequestLogFromRecoveryOfficers,
  ListAllRequestLogFromRecoveryOfficersWithoutUserID,
  ListRequestLogFromRecoveryOfficers,
  Customer_Negotiations,
  getActiveNegotiations,
  Create_task_for_Request_log_download_when_select_more_than_one_month,
  List_Details_Of_Mediation_Board_Acceptance,
  Submit_Mediation_Board_Acceptance,
  Withdraw_Mediation_Board_Acceptance,


//   getAllPaymentCases,
  RO_CPE_Collection,
  List_Request_Response_log,
  Create_Task_For_Request_Responce_Log_Download,
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
 *     summary: xxxx Assign a Recovery Officer to cases.
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
 *                 example: [13]
 *               ro_id:
 *                 type: integer
 *                 description: Recovery Officer ID who will be assigned.
 *                 example: 15
 *               drc_id:
 *                 type: integer
 *                 description: The DRC ID to which the cases belong.
 *                 example: 7
 *               assigned_by:
 *                 type: String
 *                 description: The user assigning the Recovery Officer.
 *                 example: "AdminUser"
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
 *                 example: 7
 *               rtom:
 *                 type: string
 *                 description: Area name associated with the case.
 *                 example: Matara
 *               ro_id:
 *                 type: integer
 *                 description: Recovery Officer ID responsible for the case.
 *                 example: 15
 *               arrears_band:
 *                 type: string
 *                 description: Arrears category for filtering cases.
 *                 example: AB-10_25
 *               from_date:
 *                 type: string
 *                 format: date
 *                 description: Start date for filtering cases.
 *                 example: "2025-02-25"
 *               to_date:
 *                 type: string
 *                 format: date
 *                 description: End date for filtering cases.
 *                 example: "2025-03-15"
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
 * /api/case/List_Behaviors_of_case_during_DRC:
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
 *                 example: 13
 *               drc_id:
 *                 type: integer
 *                 description: Unique identifier of the DRC.
 *                 example: 7
 *               ro_id:
 *                 type: integer
 *                 description: (Optional) Recovery Officer ID for filtering.
 *                 example: 15
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

/**
 * @swagger
 * tags:
 *   - name: Case Management
 *     description: Endpoints for managing recovery officer details related to cases.
 * 
 * /api/case/Update_case_last_Ro_Details:
 *   patch:
 *     summary: Update the last Recovery Officer's details for a given case.
 *     description: |
 *       This endpoint updates the last Recovery Officer's `case_removal_remark` for a specific case and DRC ID.
 *       It identifies the most recent Recovery Officer entry and updates the associated remark.
 *       
 *       | Version | Date       | Description                       | Changed By         |
 *       |---------|------------|-----------------------------------|--------------------|
 *       | 01      | 2025-Feb-28| Update Recovery Officer details   | Sasindu Srinayaka  |
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
 *                 example: 13
 *               drc_id:
 *                 type: integer
 *                 description: Unique identifier of the DRC.
 *                 example: 7
 *               remark:
 *                 type: string
 *                 description: Remark for the case removal related to the last Recovery Officer.
 *                 example: "Officer resigned from handling the case."
 *     responses:
 *       200:
 *         description: Recovery Officer details updated successfully.
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
 *                   example: Recovery Officer details updated successfully.
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
 *         description: Case or Recovery Officer not found.
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
 *                   example: Case not found.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 404
 *                     description:
 *                       type: string
 *                       example: No case found with the provided case_id and drc_id.
 *       500:
 *         description: Internal server error occurred while updating Recovery Officer details.
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
 *                   example: An error occurred while updating recovery officer details.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: Internal server error while updating recovery officer details.
 */
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
router.post("/Open_No_Agent_Cases_ALL_By_Rulebase", openNoAgentCasesAllByServiceTypeRulebase);

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
router.post( "/Open_No_Agent_Count_Arrears_Band_By_Rulebase", openNoAgentCountArrearsBandByServiceType );

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

/**
 * @swagger
 * /api/case/List_count_by_drc_commision_rule:
 *   get:
 *     summary: C-1G12 Get case count grouped by DRC commission rule
 *     description: Retrieves the count of cases grouped by `drc_commision_rule` where the `case_current_status` is "Open No Agent".
 *
 *       | Version | Date        | Description                                        | Changed By       |
 *       |---------|------------|----------------------------------------------------|------------------|
 *       | 01      | 2025-mar-10 | Initial creation of API for case count retrieval | Sanjaya Perera   |
 *
 *     tags: [DRC Mediation Board Cases]
 *     responses:
 *       200:
 *         description: Successfully retrieved the case count grouped by `drc_commision_rule`.
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
 *                   example: "Cases count grouped by drc_commision_rule fetched successfully."
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     total_rules:
 *                       type: integer
 *                       example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       drc_commision_rule:
 *                         type: string
 *                         example: "RULE_001"
 *                       case_count:
 *                         type: integer
 *                         example: 12
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
 *                   example: "Failed to fetch cases count. Please try again later."
 *                 error:
 *                   type: string
 *                   example: "Error details here."
 */

router.get("/List_count_by_drc_commision_rule", List_count_by_drc_commision_rule);

/**
 * @swagger
 * /api/case/List_All_Arrears_Bands:
 *   get:
 *     summary: AR-1G01 Retrieve all arrears bands
 *     description: |
 *       Fetches arrears band details from the `Arrears_bands` collection in MongoDB.
 *
 *       | Version | Date        | Description                      | Changed By         |
 *       |---------|------------|----------------------------------|--------------------|
 *       | 01      | 2025-Mar-11 | Initial implementation          | Ravindu Pathum Madushan |
 *
 *     tags: [Case Management]
 *     responses:
 *       200:
 *         description: Successfully retrieved arrears bands data.
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
 *                   example: "Data retrieved successfully."
 *                 data:
 *                   type: object
 *                   example:
 *                     _id: "65f3c1b6e7c4b6a123456789"
 *                     band_name: "Low Arrears"
 *                     min_amount: 100
 *                     max_amount: 500
 *       500:
 *         description: Error retrieving arrears bands due to MongoDB connection failure or internal server issue.
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
 *                   example: "Error retrieving Arrears bands."
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: "MongoDB connection failed"
 */

router.get("/List_All_Arrears_Bands", ListAllArrearsBands);

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
router.post("/count_cases_rulebase_and_arrears_band", count_cases_rulebase_and_arrears_band);

/**
 * @swagger
 * /api/case/Case_Distribution_Among_Agents:
 *   post:
 *     summary: Distribute Cases Among Agents
 *     description: |
 *       This API distributes cases among agents based on the provided DRC commission rule, arrears band, and DRC list.
 *
 *       | Version | Date        | Description                                | Changed By       |
 *       |---------|------------|--------------------------------------------|------------------|
 *       | 01      | 2025-Mar-26 | Initial creation                          | Your Name       |
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
 *                 example: "BB"
 *                 description: The commission rule applied for distribution.
 *               current_arrears_band:
 *                 type: string
 *                 example: "AB-50_100"
 *                 description: The arrears band for the distribution.
 *               drc_list:
 *                 type: array
 *                 description: List of DRCs involved in the distribution.
 *                 items:
 *                   type: object
 *                   properties:
 *                     DRC:
 *                       type: string
 *                       example: "D3"
 *                     DRC_Id:
 *                       type: integer
 *                       example: 3
 *                     Count:
 *                       type: integer
 *                       example: 3
 *               created_by:
 *                 type: string
 *                 example: "admin"
 *                 description: The user who initiated the request.
 *     responses:
 *       200:
 *         description: Case distribution task created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Task created successfully."
 *                 taskData:
 *                   type: object
 *                   properties:
 *                     case_distribution_batch_id:
 *                       type: integer
 *                       example: 101
 *                     batch_seq_details:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           batch_seq:
 *                             type: integer
 *                             example: 1
 *                           action_type:
 *                             type: string
 *                             example: "distribution"
 *                     status:
 *                       type: string
 *                       example: "Open"
 *       400:
 *         description: Validation error - Missing or incorrect parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "DRC List should not be empty."
 *       500:
 *         description: Server error occurred while processing the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while creating the task."
 *                 error:
 *                   type: string
 *                   example: "Internal server error."
 */
router.post("/Case_Distribution_Among_Agents", Case_Distribution_Among_Agents);

/**
 * @swagger
 * /api/case/List_Case_Distribution_DRC_Summary:
 *   post:
 *     summary:  Retrieve Case Distribution DRC Summary
 *     description: |
 *       Retrieve case distributions based on provided filters such as date range, arrears band, and DRC commission rule.
 *
 *       | Version | Date        | Description                        | Changed By       |
 *       |---------|-------------|------------------------------------|------------------|
 *       | 01      | 2025-Mar-11 | Retrieve Case Distribution Summary | Dinusha Anupama       |
 *
 *     tags: [Case Management]
 *     parameters:
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: date
 *           example: "2025-02-01"
 *         description: Date start from.
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: date
 *           example: "2025-02-28"
 *         description: Date end from.
 *       - in: query
 *         name: current_arrears_band
 *         schema:
 *           type: string
 *           example: "AB-5_10"
 *         description: Arrears band.
 *       - in: query
 *         name: drc_commision_rule
 *         schema:
 *           type: string
 *           example: "PEO TV"
 *         description: Commision rule.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date_from:
 *                 type: string
 *                 format: date
 *                 example: "2025-02-01"
 *               date_to:
 *                 type: string
 *                 format: date
 *                 example: "2025-02-28"
 *               current_arrears_band:
 *                 type: string
 *                 example: "AB-5_10"
 *               drc_commision_rule:
 *                 type: string
 *                 example: "PEO TV"
 *     responses:
 *       200:
 *         description: Case distributions retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "67a4558fe2a88bbfa44a7f27"
 *                   case_distribution_batch_id:
 *                     type: integer
 *                     example: 1
 *                   batch_seq_details:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         batch_seq:
 *                           type: integer
 *                           example: 14
 *                         created_dtm:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-02-18T16:05:59.932Z"
 *                   status:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         crd_distribution_status:
 *                           type: string
 *                           example: "Open"
 *                         created_dtm:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-02-06T12:05:00.000Z"
 *       500:
 *         description: Server error occurred while retrieving data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server Error"
 *                 error:
 *                   type: string
 *                   example: "Database connection failed"
 */
router.post("/List_Case_Distribution_DRC_Summary", List_Case_Distribution_DRC_Summary);

/**
 * @swagger
 * /api/case/Batch_Forward_for_Proceed:
 *   post:
 *     summary: Batch Forward for Proceed
 *     description: |
 *       Forwards batches for proceeding after validating their completion status. 
 *       Also creates a task, records approval, and logs user interaction.
 *
 *       | Version | Date        | Description                          | Changed By       |
 *       |---------|-------------|--------------------------------------|------------------|
 *       | 01      | 2025-Mar-11 | Batch Forward for Proceed            | Dinusha Anupama        |
 *
 *     tags: [Case Management]
 *     parameters:
 *       - in: query
 *         name: case_distribution_batch_id
 *         schema:
 *           type: array
 *           items:
 *             type: integer
 *           example: [1]
 *         description: List of batch IDs to be forwarded for proceed.
 *       - in: query
 *         name: Proceed_by
 *         schema:
 *           type: string
 *           example: "manager_1"
 *         description: The user initiating the proceed action.
 *       - in: query
 *         name: plus_drc
 *         schema:
 *           type: string
 *           example: "Drc A"
 *         description: Plus DRC value.
 *       - in: query
 *         name: plus_drc_id
 *         schema:
 *           type: integer
 *           example: 5001
 *         description: Plus DRC ID.
 *       - in: query
 *         name: minus_drc
 *         schema:
 *           type: string
 *           example: "Drc B"
 *         description: Minus DRC value.
 *       - in: query
 *         name: minus_drc_id
 *         schema:
 *           type: integer
 *           example: 9
 *         description: Minus DRC ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               case_distribution_batch_id:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1]
 *               Proceed_by:
 *                 type: string
 *                 example: "manager_1"
 *               plus_drc:
 *                 type: string
 *                 example: "Drc A"
 *               plus_drc_id:
 *                 type: integer
 *                 example: 5001
 *               minus_drc:
 *                 type: string
 *                 example: "Drc B"
 *               minus_drc_id:
 *                 type: integer
 *                 example: 9
 *     responses:
 *       200:
 *         description: Batches successfully forwarded for proceed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Batches forwarded for proceed successfully, task created, approval recorded, and user interaction logged."
 *                 updatedCount:
 *                   type: integer
 *                   example: 1
 *                 taskData:
 *                   type: object
 *                   properties:
 *                     Template_Task_Id:
 *                       type: integer
 *                       example: 31
 *                     task_type:
 *                       type: string
 *                       example: "Create Task for Proceed Cases from Batch_ID"
 *                     case_distribution_batch_id:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [1]
 *                     Created_By:
 *                       type: string
 *                       example: "manager_1"
 *                     task_status:
 *                       type: string
 *                       example: "open"
 *                 approvalEntry:
 *                   type: object
 *                   properties:
 *                     approver_reference:
 *                       type: integer
 *                       example: 1
 *                     created_by:
 *                       type: string
 *                       example: "manager_1"
 *                     approver_type:
 *                       type: string
 *                       example: "DRC_Distribution"
 *                     approved_deligated_by:
 *                       type: integer
 *                       example: 5
 *                     parameters:
 *                       type: object
 *                       properties:
 *                         plus_drc:
 *                           type: string
 *                           example: "Drc A"
 *                         plus_drc_id:
 *                           type: integer
 *                           example: 5001
 *                         minus_drc:
 *                           type: string
 *                           example: "Drc B"
 *                         minus_drc_id:
 *                           type: integer
 *                           example: 9
 *                 interactionResult:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "success"
 *                     message:
 *                       type: string
 *                       example: "User interaction created successfully"
 *                     Interaction_Log_ID:
 *                       type: integer
 *                       example: 79
 *       400:
 *         description: Validation error - Missing or incorrect parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid input, provide an array of batch IDs"
 *       500:
 *         description: Server error occurred while forwarding batches.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error forwarding batches for proceed"
 *                 error:
 *                   type: string
 *                   example: "Internal server error."
 */
router.post("/Batch_Forward_for_Proceed", Batch_Forward_for_Proceed);

/**
 * @swagger
 * /api/case/Create_Task_For_case_distribution:
 *   post:
 *     summary: Create Task for Case Distribution
 *     description: |
 *       Creates a task for case distribution based on the given parameters.
 *
 *       | Version | Date        | Description                          | Changed By       |
 *       |---------|-------------|--------------------------------------|------------------|
 *       | 01      | 2025-Mar-11 | Create Task for Case Distribution    | Dinusha Anupama       |
 *
 *     tags: [Case Management]
 *     parameters:
 *       - in: query
 *         name: current_arrears_band
 *         schema:
 *           type: string
 *           example: "AB-5_10"
 *         description: Arrears Band.
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: date
 *           example: "2025-01-01"
 *         description: Date start from.
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: date
 *           example: "2025-02-28"
 *         description: Date end from.
 *       - in: query
 *         name: drc_commision_rule
 *         schema:
 *           type: string
 *           example: "PEO TV"
 *         description: Commision Rule.
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
 *               current_arrears_band:
 *                 type: string
 *                 example: "AB-5_10"
 *               date_from:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-01"
 *               date_to:
 *                 type: string
 *                 format: date
 *                 example: "2025-02-28"
 *               drc_commision_rule:
 *                 type: string
 *                 example: "PEO TV"
 *               Created_By:
 *                 type: string
 *                 example: "admin_user"
 *     responses:
 *       201:
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
 *                       example: 26
 *                     task_type:
 *                       type: string
 *                       example: Create Case distribution DRC Transaction List for Download
 *                     current_arrears_band:
 *                       type: string
 *                       example: "AB-5_10"
 *                     date_from:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-01T00:00:00.000Z"
 *                     date_to:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-02-28T00:00:00.000Z"
 *                     drc_commision_rule:
 *                       type: string
 *                       example: "PEO TV"
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
router.post("/Create_Task_For_case_distribution", Create_Task_For_case_distribution);

/**
 * @swagger
 * tags:
 *   - name: Case Management
 *     description: Endpoints for retrieving mediation cases owned by DRC and RO.
 * 
 * /api/case/List_All_DRC_Mediation_Board_Cases:
 *   post:
 *     summary: Retrieve mediation cases owned by a DRC and optionally filtered by RO.
 *     description: |
 *       This endpoint retrieves mediation cases associated with a specified DRC ID and optional filters.
 *       Users can filter cases based on RTOM, Recovery Officer ID, action type, case current status, and date range.
 *       
 *       | Version | Date       | Description                                     | Changed By         |
 *       |---------|------------|-------------------------------------------------|--------------------|
 *       | 01      | 2025-Feb-02| List mediation cases owned by DRC and RO         | Sasindu Srinayaka  |
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
 *                 example: 7
 *               ro_id:
 *                 type: integer
 *                 description: Recovery Officer ID responsible for the case.
 *                 example: null
 *               rtom:
 *                 type: string
 *                 description: Area name associated with the case.
 *                 example: "Matara"
 *               action_type:
 *                 type: string
 *                 description: Action type of the case.
 *                 example: "Arrears Collect"
 *               case_current_status:
 *                 type: string
 *                 description: Current status of the case.
 *                 example: "Forward_to_Mediation_Board"
 *               from_date:
 *                 type: string
 *                 format: date
 *                 description: Start date for filtering cases.
 *                 example: "2025-01-01"
 *               to_date:
 *                 type: string
 *                 format: date
 *                 description: End date for filtering cases.
 *                 example: "2025-01-31"
 *     responses:
 *       200:
 *         description: Mediation cases retrieved successfully.
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
 *                       example: Provide at least one of rtom, ro_id, action_type, case_current_status, or both from_date and to_date together.
 *       404:
 *         description: No matching mediation cases found for the given criteria.
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
 *         description: Internal server error occurred while retrieving mediation cases.
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
 *                   example: An error occurred while retrieving mediation cases.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: Internal server error while retrieving mediation cases.
 */
router.post("/List_All_DRC_Mediation_Board_Cases", ListALLMediationCasesownnedbyDRCRO);

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
router.post("/List_all_transaction_seq_of_batch_id", List_all_transaction_seq_of_batch_id);

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
router.post("/Create_Task_For_case_distribution_transaction", Create_Task_For_case_distribution_transaction ); 

router.post("/get_distribution_array_of_a_transaction", list_distribution_array_of_a_transaction);

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
router.post("/Create_Task_For_case_distribution_transaction_array", Create_Task_For_case_distribution_transaction_array);

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
 * tags:
 *   - name: Recovery Officer Requests
 *     description: Endpoints for managing Recovery Officer (RO) mediation requests.
 *
 * /api/case/List_Active_RO_Requests_Mediation:
 *   get:
 *     summary: Retrieve active RO mediation requests.
 *     description: |
 *       This endpoint retrieves all active Recovery Officer (RO) mediation requests where `end_dtm` is null.
 *       Optionally, you can filter the requests by providing a `request_mode` as a query parameter.
 *
 *       | Version | Date       | Description                             | Changed By         |
 *       |---------|------------|-----------------------------------------|--------------------|
 *       | 01      | 2025-Feb-19| List active RO mediation requests       | U.H.Nandali Linara |
 *     tags:
 *       - Recovery Officer Requests
 *     parameters:
 *       - in: query
 *         name: request_mode
 *         schema:
 *           type: string
 *         description: Optional filter for the request mode (e.g., "manual", "automatic").
 *         example: manual
 *     responses:
 *       200:
 *         description: Active RO mediation requests retrieved successfully.
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
 *                   example: Active RO request details retrieved successfully.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       ro_request_id:
 *                         type: integer
 *                         description: Unique identifier for the RO request.
 *                         example: 301
 *                       request_mode:
 *                         type: string
 *                         description: Mode of the request (e.g., "manual" or "automatic").
 *                         example: manual
 *                       created_dtm:
 *                         type: string
 *                         format: date-time
 *                         description: Timestamp when the request was created.
 *                         example: "2025-02-15T14:00:00Z"
 *                       end_dtm:
 *                         type: string
 *                         nullable: true
 *                         description: End date and time of the request (null if active).
 *                         example: null
 *                       status:
 *                         type: string
 *                         description: Current status of the request.
 *                         example: active
 *       404:
 *         description: No active RO requests found.
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
 *                   example: No active RO requests found.
 *       500:
 *         description: Internal server error occurred while fetching active RO requests.
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
 *                   example: Internal server error occurred while fetching active RO details.
 *                 error:
 *                   type: string
 *                   example: Error message describing the issue.
 *
 *   post:
 *     summary: Retrieve active RO mediation requests (via POST with body).
 *     description: |
 *       Similar to the GET endpoint, this retrieves active RO mediation requests, but allows you to pass `request_mode` in the request body.
 *     tags:
 *       - Recovery Officer Requests
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               request_mode:
 *                 type: string
 *                 description: Optional filter for request mode.
 *                 example: automatic
 *     responses:
 *       200:
 *         $ref: '#/components/responses/200'
 *       404:
 *         $ref: '#/components/responses/404'
 *       500:
 *         $ref: '#/components/responses/500'
 */
router.post("/Case_Distribution_Details_With_Drc_Rtom_ByBatchId", Case_Distribution_Details_With_Drc_Rtom_ByBatchId);

/**
 * @swagger
 * /api/case/List_All_Batch_Details:
 *   post:
 *     summary: List All Batch Details
 *     description: |
 *       Retrieves batch details for cases with an open approval status.
 *       Filters and structures batch details along with related case distribution data.
 *
 *       | Version | Date        | Description            | Changed By       |
 *       |---------|------------|------------------------|------------------|
 *       | 01      | 2025-Mar-14 | List All Batch Details | Dinusha Anupama  |
 *
 *     tags: [Case Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               approved_deligated_by:
 *                 type: string
 *                 example: "super@gmail.com"
 *     responses:
 *       200:
 *         description: Successfully retrieved batch details.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "67d3d5a668b432dd5edf8e6d"
 *                   approver_reference:
 *                     type: integer
 *                     example: 1
 *                   created_on:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-03-14T07:07:18.773Z"
 *                   created_by:
 *                     type: string
 *                     example: "manager_1"
 *                   approve_status:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: "Open"
 *                         status_date:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-03-14T07:07:18.288Z"
 *                         status_edit_by:
 *                           type: string
 *                           example: "manager_1"
 *                   approver_type:
 *                     type: string
 *                     example: "DRC_Distribution"
 *                   parameters:
 *                     type: object
 *                     properties:
 *                       plus_drc:
 *                         type: string
 *                         example: "Drc A"
 *                       plus_drc_id:
 *                         type: integer
 *                         example: 5001
 *                       minus_drc:
 *                         type: string
 *                         example: "Drc B"
 *                       minus_drc_id:
 *                         type: integer
 *                         example: 9
 *                   remark:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: []
 *                   case_distribution_details:
 *                     type: object
 *                     nullable: true
 *                     properties:
 *                       case_distribution_batch_id:
 *                         type: integer
 *                         example: 1
 *                       drc_commision_rule:
 *                         type: string
 *                         example: "PEO TV"
 *                       rulebase_count:
 *                         type: integer
 *                         example: 10
 *       400:
 *         description: Validation error - Missing or incorrect parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid input, missing required fields."
 *       500:
 *         description: Server error occurred while fetching batch details.
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
 *                   example: "Error fetching batch details."
 */


router.post("/List_All_Batch_Details", List_All_Batch_Details);

/**
 * @swagger
 * /api/case/Approve_Batch_or_Batches:
 *   post:
 *     summary: C-1P65 Approve Batch or Batches
 *     description: |
 *       Approves batches by updating their approval status and logs a user interaction.
 *       Also creates a task for tracking approved cases.
 *
 *       | Version | Date        | Description                | Changed By       |
 *       |---------|-------------|----------------------------|------------------|
 *       | 01      | 2025-Mar-11 | Approve Batch or Batches   | Dinusha Anupama       |
 *
 *     tags: [Case Management]
 *     parameters:
 *       - in: query
 *         name: approver_references
 *         schema:
 *           type: array
 *           items:
 *             type: integer
 *           example: [2]
 *         description: List of approver references to be approved.
 *       - in: query
 *         name: approved_by
 *         schema:
 *           type: string
 *           example: "Saman"
 *         description: The user approving the batch or batches.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               approver_references:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [2]
 *               approved_by:
 *                 type: string
 *                 example: "Saman"
 *     responses:
 *       200:
 *         description: Approval successfully added, and task created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Approvals added successfully, and task created."
 *                 updatedCount:
 *                   type: integer
 *                   example: 1
 *                 taskData:
 *                   type: object
 *                   properties:
 *                     Template_Task_Id:
 *                       type: integer
 *                       example: 29
 *                     task_type:
 *                       type: string
 *                       example: "Create Task for Approve Cases from Approver_Reference"
 *                     approver_references:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [2]
 *                     Created_By:
 *                       type: string
 *                       example: "Saman"
 *                     task_status:
 *                       type: string
 *                       example: "open"
 *       400:
 *         description: Validation error - Missing or incorrect parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid input, provide an array of approver references"
 *       500:
 *         description: Server error occurred while approving batches.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error approving batches"
 *                 error:
 *                   type: string
 *                   example: "Internal server error."
 */
router.post("/Approve_Batch_or_Batches", Approve_Batch_or_Batches);

/**
 * @swagger
 * /api/case/Create_task_for_batch_approval:
 *   post:
 *     summary: Create Task for Batch Approval
 *     description: |
 *       Creates a task for batch approval and stores task details.
 *
 *       | Version | Date        | Description                    | Changed By       |
 *       |---------|-------------|--------------------------------|------------------|
 *       | 01      | 2025-Mar-11 | Create Task for Batch Approval | Dinusha Anupama        |
 *
 *     tags: [Case Management]
 *     parameters:
 *       - in: query
 *         name: approver_references
 *         schema:
 *           type: array
 *           items:
 *             type: integer
 *           example: [2]
 *         description: List of approver references for batch approval.
 *       - in: query
 *         name: Created_By
 *         schema:
 *           type: string
 *           example: "manager_1"
 *         description: The user creating the batch approval task.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               approver_references:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [2]
 *               Created_By:
 *                 type: string
 *                 example: "manager_1"
 *     responses:
 *       201:
 *         description: Task for batch approval created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Task for batch approval created successfully."
 *                 taskData:
 *                   type: object
 *                   properties:
 *                     Template_Task_Id:
 *                       type: integer
 *                       example: 30
 *                     task_type:
 *                       type: string
 *                       example: "Create batch approval List for Downloard"
 *                     approver_references:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [2]
 *                     created_on:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-03-11T06:10:53.886Z"
 *                     Created_By:
 *                       type: string
 *                       example: "manager_1"
 *                     task_status:
 *                       type: string
 *                       example: "open"
 *       400:
 *         description: Validation error - Missing or incorrect parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid input, provide an array of approver references"
 *       500:
 *         description: Server error occurred while creating batch approval task.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating batch approval task"
 *                 error:
 *                   type: string
 *                   example: "Internal server error."
 */
router.post("/Create_task_for_batch_approval", Create_task_for_batch_approval);

/**
 * @swagger
 * /api/case/List_DRC_Assign_Manager_Approval:
 *   post:
 *     summary: List DRC Assign Manager Approvals
 *     description: |
 *       Retrieves approval records for various DRC assign manager actions.
 *
 *       | Version | Date        | Description                           | Changed By       |
 *       |---------|-------------|---------------------------------------|------------------|
 *       | 01      | 2025-Mar-11 | List DRC Assign Manager Approvals    | Dinusha Anupama       |
 *
 *     tags: [Case Management]
 *     parameters:
 *       - in: query
 *         name: approver_type
 *         schema:
 *           type: string
 *           example: "Case Withdrawal Approval"
 *         description: Type of approval request.
 *       - in: query
 *         name: approved_deligated_by
 *         schema:
 *           type: string
 *           example: "super@gmail.com"
 *         description: Approved Deligated Person.
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *         description: Start date for filtering approvals.
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-03-28"
 *         description: End date for filtering approvals.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               approver_type:
 *                 type: string
 *                 example: "Case Withdrawal Approval"
 *               approved_deligated_by:
 *                 type: string
 *                 example: "super@gmail.com"
 *               date_from:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-01"
 *               date_to:
 *                 type: string
 *                 format: date
 *                 example: "2025-03-28"
 *     responses:
 *       200:
 *         description: Approval records retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "67c3e763cfec115fa9af6996"
 *                   approver_reference:
 *                     type: integer
 *                     example: 444
 *                   created_by:
 *                     type: string
 *                     example: "JohnDoe"
 *                   approve_status:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: "Pending Case Withdrawal"
 *                         status_date:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-03-02T05:06:43.395Z"
 *                         status_edit_by:
 *                           type: string
 *                           example: "JohnDoe"
 *                   approver_type:
 *                     type: string
 *                     example: "Case Withdrawal Approval"
 *                   parameters:
 *                     type: object
 *                   approved_by:
 *                     type: string
 *                     example: null
 *                   remark:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         remark:
 *                           type: string
 *                           example: "Requesting case withdrawal approval"
 *                         remark_date:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-03-02T05:06:43.395Z"
 *                         remark_edit_by:
 *                           type: string
 *                           example: "AdminUser"
 *                   created_on:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-03-02T05:06:43.400Z"
 *       500:
 *         description: Server error occurred while fetching approvals.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server Error"
 *                 error:
 *                   type: string
 *                   example: "Internal server error."
 */
router.post("/List_DRC_Assign_Manager_Approval", List_DRC_Assign_Manager_Approval);

/**
 * @swagger
 * /api/case/Approve_DRC_Assign_Manager_Approval:
 *   post:
 *     summary: Approve DRC Assign Manager Approval
 *     description: |
 *       Approves a DRC assign manager approval request based on the approver reference and approved by user.
 *
 *       | Version | Date        | Description                            | Changed By        |
 *       |---------|-------------|----------------------------------------|-------------------|
 *       | 01      | 2025-Mar-11 | Approve DRC Assign Manager Approval    | Dinusha Anupama   |
 *
 *     tags: [Case Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               approver_reference:
 *                 type: integer
 *                 example: 1
 *               approved_by:
 *                 type: string
 *                 example: "Sudeera"
 *     responses:
 *       200:
 *         description: Approval successfully processed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Approval added successfully."
 *                 updatedCount:
 *                   type: integer
 *                   example: 2
 *       400:
 *         description: Invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid input, approver_reference is required"
 *       404:
 *         description: No matching approver reference found or update failed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Approval update failed"
 *       500:
 *         description: Server error occurred while processing the approval.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error approving DRC Assign Manager Approvals"
 *                 error:
 *                   type: string
 *                   example: "Internal server error."
 */
router.post("/Approve_DRC_Assign_Manager_Approval", Approve_DRC_Assign_Manager_Approval);

/**
 * @swagger
 * /api/case/Reject_DRC_Assign_Manager_Approval:
 *   post:
 *     summary: Reject DRC Assign Manager Approval
 *     description: |
 *       Rejects DRC assign manager approval requests for the specified approver references.
 *
 *       | Version | Date        | Description                            | Changed By        |
 *       |---------|-------------|----------------------------------------|-------------------|
 *       | 01      | 2025-Mar-11 | Reject DRC Assign Manager Approval     | Dinusha Anupama   |
 *
 *     tags: [Case Management]
 *     parameters:
 *       - in: query
 *         name: approver_references
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID of the rejecting Case.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               approver_references:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   example: 1
 *                 minItems: 1
 *                 maxItems: 5
 *                 description: List of approver references to be rejected.
 *               approved_by:
 *                 type: string
 *                 example: "manager_1"
 *                 description: User ID of the person rejecting the approval.
 *     responses:
 *       200:
 *         description: Rejections successfully processed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Rejections added successfully."
 *                 updatedCount:
 *                   type: integer
 *                   example: 2
 *       400:
 *         description: Invalid input data or invalid number of approver references.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid input, provide between 1 to 5 approver references"
 *       404:
 *         description: No matching approver references found or update failed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No matching approver references found"
 *       500:
 *         description: Server error occurred while processing the rejection.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error rejecting DRC Assign Manager Approvals"
 *                 error:
 *                   type: string
 *                   example: "Internal server error."
 */
router.post("/Reject_DRC_Assign_Manager_Approval", Reject_DRC_Assign_Manager_Approval);

/**
 * @swagger
 * /api/case/Create_task_for_DRC_Assign_Manager_Approval:
 *   post:
 *     summary: Create Task for DRC Assign Manager Approval
 *     description: |
 *       Creates a task for DRC Assign Manager Approval with specified approver references, dates, and creator.
 *
 *       | Version | Date        | Description                            | Changed By        |
 *       |---------|-------------|----------------------------------------|-------------------|
 *       | 01      | 2025-Mar-11 | Create task for DRC Assign Manager     | Dinusha Anupama   |
 *
 *     tags: [Case Management]
 *     parameters:
 *       - in: body
 *         name: requestBody
 *         required: true
 *         description: Task creation details.
 *         schema:
 *           type: object
 *           properties:
 *             approver_references:
 *               type: array
 *               items:
 *                 type: integer
 *               description: List of approver references.
 *               example: [1]
 *             date_from:
 *               type: string
 *               format: date
 *               description: Starting date for the task.
 *               example: "2024-01-01"
 *             date_to:
 *               type: string
 *               format: date
 *               description: Ending date for the task.
 *               example: "2025-03-28"
 *             Created_By:
 *               type: string
 *               description: User ID of the person creating the task.
 *               example: "Saman"
 *     responses:
 *       201:
 *         description: Task created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Task for batch approval created successfully."
 *                 taskData:
 *                   type: object
 *                   properties:
 *                     Template_Task_Id:
 *                       type: integer
 *                       example: 33
 *                     task_type:
 *                       type: string
 *                       example: "Create DRC Assign manager approval List for Downloard"
 *                     approver_references:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [1]
 *                     date_from:
 *                       type: string
 *                       format: date
 *                       example: "2024-01-01"
 *                     date_to:
 *                       type: string
 *                       format: date
 *                       example: "2025-03-28"
 *                     created_on:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-11T12:00:00Z"
 *                     Created_By:
 *                       type: string
 *                       example: "Saman"
 *                     task_status:
 *                       type: string
 *                       example: "open"
 *       400:
 *         description: Missing or invalid input fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Created_By is required"
 *       500:
 *         description: Server error occurred while creating the task.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating batch approval task"
 *                 error:
 *                   type: string
 *                   example: "Internal server error."
 */
router.post("/Create_task_for_DRC_Assign_Manager_Approval", Create_task_for_DRC_Assign_Manager_Approval);

/**
 * @swagger
 * /Assign_DRC_To_Case:
 *   post:
 *     summary: Assign a DRC to a case
 *     description: Assigns a Debt Recovery Coordinator (DRC) to a specific case and records the assignment details for approval.
 *
 *       | Version | Date        | Description                                | Changed By       |
 *       |---------|------------|--------------------------------------------|------------------|
 *       | 01      | 2025-Feb-25 | Initial creation of Assign DRC API       | Sanjaya Perera   |
 *
 *     tags: [Case Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               case_id:
 *                 type: string
 *                 description: The unique ID of the case to assign a DRC.
 *                 example: "CASE_12345"
 *               drc_id:
 *                 type: string
 *                 description: The unique ID of the DRC being assigned.
 *                 example: "DRC_67890"
 *               drc_name:
 *                 type: string
 *                 description: The name of the DRC being assigned.
 *                 example: "John Doe"
 *               assigned_by:
 *                 type: string
 *                 description: The user who is assigning the DRC.
 *                 example: "admin_user"
 *               remark:
 *                 type: string
 *                 description: Any additional remarks regarding the assignment.
 *                 example: "Reassigning due to workload redistribution."
 *     responses:
 *       200:
 *         description: DRC reassignment sent to the approver successfully.
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
 *                   example: "DRC Reassigning sent to the Approver."
 *                 data:
 *                   type: object
 *                   properties:
 *                     approver_reference:
 *                       type: string
 *                       example: "CASE_12345"
 *                     created_on:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-02-11T12:00:00Z"
 *                     created_by:
 *                       type: string
 *                       example: "admin_user"
 *                     approve_status:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: "Open"
 *                         status_date:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-02-11T12:00:00Z"
 *                         status_edit_by:
 *                           type: string
 *                           example: "admin_user"
 *                     approver_type:
 *                       type: string
 *                       example: "DRC_ReAssign"
 *                     parameters:
 *                       type: object
 *                       properties:
 *                         drc_id:
 *                           type: string
 *                           example: "DRC_67890"
 *                         drc_name:
 *                           type: string
 *                           example: "John Doe"
 *                     remark:
 *                       type: object
 *                       properties:
 *                         remark:
 *                           type: string
 *                           example: "Reassigning due to workload redistribution."
 *                         remark_date:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-02-11T12:00:00Z"
 *                         remark_edit_by:
 *                           type: string
 *                           example: "admin_user"
 *       400:
 *         description: Validation error - Incorrect or missing parameters.
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
 *                   example: "case_id and drc_id is required."
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     description:
 *                       type: string
 *                       example: "case_id and drc_id is required."
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
 *                   example: "An error occurred while assigning the DRC."
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: "Internal server error details."
 */
router.post("/Assign_DRC_To_Case", Assign_DRC_To_Case);

/**
 * @swagger
 * /api/case/List_Case_Distribution_Details:
 *   post:
 *     summary: List Case Distribution Details
 *     description: |
 *       Retrieves case distribution details based on the provided `case_distribution_batch_id` and optional `drc_id`.
 *
 *       | Version | Date        | Description                            | Changed By        |
 *       |---------|-------------|----------------------------------------|-------------------|
 *       | 01      | 2025-Mar-11 | List case distribution details         | Dinusha Anupama   |
 *
 *     tags: [Case Management]
 *     parameters:
 *       - in: body
 *         name: requestBody
 *         required: true
 *         description: The body contains the case distribution batch ID and optionally a drc_id.
 *         schema:
 *           type: object
 *           properties:
 *             case_distribution_batch_id:
 *               type: integer
 *               description: The ID of the case distribution batch.
 *               example: 1
 *             drc_id:
 *               type: integer
 *               description: The ID of the DRC (optional).
 *               example: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved case distribution details.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "67b7ff7ea436faf2045a375f"
 *                   case_distribution_batch_id:
 *                     type: integer
 *                     example: 1
 *                   created_dtm:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-02-21T12:00:00.000Z"
 *                   drc_id:
 *                     type: integer
 *                     example: 1
 *                   rtom:
 *                     type: string
 *                     example: "MT"
 *                   case_count:
 *                     type: integer
 *                     example: 50
 *                   tot_arrease:
 *                     type: number
 *                     format: float
 *                     example: 100000.5
 *                   month_1_sc:
 *                     type: number
 *                     format: float
 *                     example: 3000
 *                   month_2_sc:
 *                     type: number
 *                     format: float
 *                     example: 4500
 *                   month_3_sc:
 *                     type: number
 *                     format: float
 *                     example: 5000
 *                   proceed_on:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-03-11T05:53:35.446Z"
 *                   drc_name:
 *                     type: string
 *                     example: "D1"
 *       400:
 *         description: Missing required field `case_distribution_batch_id`.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing required field: case_distribution_batch_id"
 *       404:
 *         description: No records found for the given batch ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No records found for the given batch ID"
 *       500:
 *         description: Server error occurred while fetching case distribution details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 *                 error:
 *                   type: string
 *                   example: "Internal server error."
 */
router.post("/List_Case_Distribution_Details", List_Case_Distribution_Details);

/**
 * @swagger
 * /api/task/Create_Task_For_case_distribution_drc_summery:
 *   post:
 *     summary: Create Task for Case Distribution DRC Summary
 *     description: |
 *       Creates a task for the case distribution DRC summary list download based on the provided `drc_id` and `Created_By`.
 *       This task will be marked as "open" and assigned a template task ID for batch approval.
 *
 *       | Version | Date        | Description                            | Changed By        |
 *       |---------|-------------|----------------------------------------|-------------------|
 *       | 01      | 2025-Mar-11 | Create task for case distribution DRC  | Dinusha Anupama   |
 *
 *     tags: [Case Management]
 *     parameters:
 *       - in: body
 *         name: requestBody
 *         required: true
 *         description: The body contains the `drc_id` and `Created_By` values.
 *         schema:
 *           type: object
 *           properties:
 *             drc_id:
 *               type: string
 *               description: The ID of the DRC (required).
 *               example: "1"
 *             Created_By:
 *               type: string
 *               description: The name of the user who is creating the task (required).
 *               example: "User123"
 *     responses:
 *       201:
 *         description: Successfully created a task for the case distribution DRC summary.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Task for batch approval created successfully."
 *                 taskData:
 *                   type: object
 *                   properties:
 *                     Template_Task_Id:
 *                       type: integer
 *                       example: 32
 *                     task_type:
 *                       type: string
 *                       example: "Create Case Distribution DRC Summary List for Downloard"
 *                     drc_id:
 *                       type: string
 *                       example: "1"
 *                     drc_name:
 *                       type: string
 *                       example: "D1"
 *                     created_on:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-03-11T06:55:25.623Z"
 *                     Created_By:
 *                       type: string
 *                       example: "User123"
 *                     task_status:
 *                       type: string
 *                       example: "open"
 *       400:
 *         description: Missing required fields `drc_id` or `Created_By`.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing required fields: drc_id, Created_By"
 *       404:
 *         description: DRC not found for the given `drc_id`.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "DRC not found for the given drc_id"
 *       500:
 *         description: Error occurred while creating the task.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating batch approval task"
 *                 error:
 *                   type: string
 *                   example: "Internal server error."
 */
router.post("/Create_Task_For_case_distribution_drc_summery", Create_Task_For_case_distribution_drc_summery);

/**
 * @swagger
 * /api/task/List_Case_Distribution_Details_With_Rtoms:
 *   post:
 *     summary: List Case Distribution Details with Rtoms
 *     description: |
 *       Retrieves case distribution details based on the `case_distribution_batch_id` and `drc_id`. 
 *       It returns the case details along with the associated `drc_name` for the given DRC ID.
 *
 *       | Version | Date        | Description                            | Changed By        |
 *       |---------|-------------|----------------------------------------|-------------------|
 *       | 01      | 2025-Mar-11 | List case distribution details with RTOMs | Dinusha Anupama   |
 *
 *     tags: [Case Management]
 *     parameters:
 *       - in: body
 *         name: requestBody
 *         required: true
 *         description: The body contains the `case_distribution_batch_id` and `drc_id`.
 *         schema:
 *           type: object
 *           properties:
 *             case_distribution_batch_id:
 *               type: string
 *               description: The ID of the case distribution batch (required).
 *               example: "1"
 *             drc_id:
 *               type: string
 *               description: The ID of the DRC (required).
 *               example: "1"
 *     responses:
 *       200:
 *         description: Successfully retrieved the case distribution details with RTOMs.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "67b7ff7ea436faf2045a375f"
 *                   case_distribution_batch_id:
 *                     type: integer
 *                     example: 1
 *                   created_dtm:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-02-21T12:00:00.000Z"
 *                   drc_id:
 *                     type: integer
 *                     example: 1
 *                   rtom:
 *                     type: string
 *                     example: "MT"
 *                   case_count:
 *                     type: integer
 *                     example: 50
 *                   tot_arrease:
 *                     type: number
 *                     format: float
 *                     example: 100000.5
 *                   month_1_sc:
 *                     type: number
 *                     format: float
 *                     example: 3000
 *                   month_2_sc:
 *                     type: number
 *                     format: float
 *                     example: 4500
 *                   month_3_sc:
 *                     type: number
 *                     format: float
 *                     example: 5000
 *                   drc_name:
 *                     type: string
 *                     example: "D1"
 *       400:
 *         description: Missing required fields `case_distribution_batch_id` or `drc_id`.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing required fields: case_distribution_batch_id, drc_id"
 *       404:
 *         description: No records found for the given `case_distribution_batch_id` and `drc_id`.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No records found for the given batch ID and DRC ID"
 *       500:
 *         description: Error occurred while fetching the case distribution details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 *                 error:
 *                   type: string
 *                   example: "Internal server error."
 */
router.post("/List_Case_Distribution_Details_With_Rtoms", List_Case_Distribution_Details_With_Rtoms);

/**
 * @swagger
 * /api/task/List_CasesOwened_By_DRC:
 *   post:
 *     summary: List Cases Owned by DRC
 *     description: |
 *       Retrieves a list of cases owned by a DRC based on the provided parameters such as `drc_id`, `case_id`, `account_no`, and date range (`from_date`, `to_date`). Filters out cases with invalid statuses and applies date range filtering if provided.
 *       | Version | Date        | Description                            | Changed By        |
 *       |---------|-------------|----------------------------------------|-------------------|
 *       | 01      | 2025-Mar-11 | List Cases Owned by DRC | Dinusha Anupama   |
 *     tags: [Case Management]
 *     parameters:
 *       - in: body
 *         name: requestBody
 *         required: true
 *         description: The body contains the `drc_id`, `case_id`, `account_no`, and optional date range filters (`from_date`, `to_date`).
 *         schema:
 *           type: object
 *           properties:
 *             drc_id:
 *               type: integer
 *               description: The ID of the DRC (optional).
 *               example: 7
 *             case_id:
 *               type: integer
 *               description: The ID of the case (optional).
 *               example: 123
 *             account_no:
 *               type: string
 *               description: The account number associated with the case (optional).
 *               example: "101112"
 *             from_date:
 *               type: string
 *               format: date
 *               description: The start date to filter cases by creation date (optional).
 *               example: "2023-01-01"
 *             to_date:
 *               type: string
 *               format: date
 *               description: The end date to filter cases by creation date (optional).
 *               example: "2023-12-31"
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of cases owned by the DRC.
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
 *                   example: "Case details retrieved successfully."
 *                 Cases:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       case_id:
 *                         type: integer
 *                         example: 9
 *                       account_no:
 *                         type: string
 *                         example: "101112"
 *                       created_dtm:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-11-01T12:00:00Z"
 *                       current_arrears_amount:
 *                         type: number
 *                         example: 0
 *                       case_current_status:
 *                         type: string
 *                         example: "Negotiation Settle Pending"
 *                       case_status:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             case_status:
 *                               type: string
 *                               example: "Abandoned"
 *                             status_reason:
 *                               type: string
 *                               example: "No agent assigned yet."
 *                             created_dtm:
 *                               type: string
 *                               format: date-time
 *                               example: "2023-11-01T12:00:00Z"
 *                             created_by:
 *                               type: string
 *                               example: "Admin"
 *                             notified_dtm:
 *                               type: string
 *                               format: date-time
 *                               example: "2023-11-01T12:00:00Z"
 *                             expire_dtm:
 *                               type: string
 *                               format: date-time
 *                               example: "2023-11-30T23:59:59Z"
 *                       end_dtm:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-11-01T12:00:00Z"
 *       400:
 *         description: Failed to retrieve case details. At least one of `drc_id`, `case_id`, or `account_no` is required.
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
 *                   example: "Failed to retrieve case details."
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     description:
 *                       type: string
 *                       example: "At least one of drc_id, case_id, or account_no is required."
 *       404:
 *         description: No case details found for the provided parameters.
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
 *                   example: "No Case Details Found."
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 404
 *                     description:
 *                       type: string
 *                       example: "No data available for the provided parameters."
 *       500:
 *         description: Error occurred while fetching case details.
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
 *                   example: "Error Fetching Case Details."
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: "Internal server error."
 */
router.post("/List_CasesOwened_By_DRC", List_CasesOwened_By_DRC);

/**
 * @swagger
 * tags:
 *   - name: Case Management
 *     description: Endpoints for retrieving all cases handled by a specific DRC.
 * 
 * /api/case/List_All_DRC_Negotiation_Cases:
 *   post:
 *     summary: Retrieve all cases handled by a DRC with filtering options.
 *     description: |
 *       This endpoint retrieves all cases associated with a specified DRC ID. 
 *       Users can filter cases based on RTOM, Recovery Officer ID, action type, and date range.
 *       
 *       | Version | Date       | Description                         | Changed By         |
 *       |---------|------------|-------------------------------------|--------------------|
 *       | 01      | 2025-Mar-03| List all cases handled by a DRC      | Sasindu Srinayaka  |
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
 *                 example: 7
 *               ro_id:
 *                 type: integer
 *                 description: Recovery Officer ID responsible for the case.
 *                 example: 4
 *               rtom:
 *                 type: string
 *                 description: Area name associated with the case.
 *                 example: "Matara"
 *               action_type:
 *                 type: string
 *                 description: Type of action performed on the case.
 *                 example: "Arrears Collect"
 *               from_date:
 *                 type: string
 *                 format: date
 *                 description: Start date for filtering cases.
 *                 example: "2025-01-01"
 *               to_date:
 *                 type: string
 *                 format: date
 *                 description: End date for filtering cases.
 *                 example: "2025-01-31"
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
 *                       example: Provide at least one of rtom, ro_id, action_type, or both from_date and to_date together.
 *       404:
 *         description: No matching cases found for the given criteria.
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
 *         description: Internal server error occurred while retrieving cases.
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
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: Internal server error while retrieving cases.
 */
router.post("/List_All_DRC_Negotiation_Cases", listDRCAllCases);

/**
 * @swagger
 * tags:
 *   - name: Case Management
 *     description: Endpoints related to retrieving case details based on mediation board requests.
 *
 * /api/case/Case_Details_for_DRC:
 *   post:
 *     summary: C-1P35 Retrieve case details by Case ID and DRC ID.
 *     description: |
 *       This endpoint retrieves case details based on the provided Case ID and DRC ID.
 *       If a case with the specified Case ID exists and is associated with the given DRC ID,
 *       the system returns relevant case details.
 *
 *       | Version | Date       | Description                     | Changed By         |
 *       |---------|------------|---------------------------------|--------------------|
 *       | 01      | 2025-Feb-08| Retrieve case details by mediation board request | U.H.Nandali Linara  |
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
 *                 description: Unique identifier for the case.
 *                 example: 1
 *               drc_id:
 *                 type: integer
 *                 description: Unique identifier for the Debt Recovery Company (DRC).
 *                 example: 7
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
 *                 message:
 *                   type: string
 *                   example: Case details retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     case_id:
 *                       type: integer
 *                       description: Case ID.
 *                       example: 101
 *                     customer_ref:
 *                       type: string
 *                       description: Customer reference number.
 *                       example: CUST-2024-001
 *                     account_no:
 *                       type: string
 *                       description: Customer's account number.
 *                       example: ACC-56789
 *                     current_arrears_amount:
 *                       type: number
 *                       description: The amount of arrears on the case.
 *                       example: 15000.75
 *                     last_payment_date:
 *                       type: string
 *                       format: date
 *                       description: Last payment date associated with the case.
 *                       example: "2025-01-15"
 *       400:
 *         description: Validation error - Case ID and DRC ID are required.
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
 *                   example: Both Case ID and DRC ID are required.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     description:
 *                       type: string
 *                       example: Please provide both case_id and drc_id in the request body.
 *       404:
 *         description: Case not found or DRC ID doesn't match.
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
 *                   example: Case not found or DRC ID doesn't match.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 404
 *                     description:
 *                       type: string
 *                       example: No case found with the provided Case ID and DRC ID combination.
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
 *                   example: Failed to retrieve case details.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: Internal server error occurred while fetching case details.
 */

router.post("/Case_Details_for_DRC", CaseDetailsforDRC);

/**
 * @swagger
 * tags:
 *   - name: RO Requests
 *     description: Endpoints related to active RO requests.
 *
 * /api/case/List_Active_RO_Requests:
 *   post:
 *     summary: C-1P64 Retrieve all active RO requests by request_mode.
 *     description: |
 *       This endpoint retrieves all active RO requests where the end_dtm field is null,
 *       indicating that the request is still ongoing, and filters by the provided request_mode.
 *
 *       | Version | Date       | Description                         | Changed By         |
 *       |---------|------------|-------------------------------------|--------------------|
 *       | 01      | 2025-Mar-10| List all active RO requests by mode | Your Name          |
 *     tags:
 *       - RO Requests
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               request_mode:
 *                 type: string
 *                 description: The mode of the request to filter by.
 *                 example: "Negotiation"
 *     responses:
 *       200:
 *         description: Active RO requests retrieved successfully.
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
 *                   example: Active RO requests with mode 'active' retrieved successfully.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       ro_request_id:
 *                         type: integer
 *                         description: Unique identifier for the RO request.
 *                         example: 101
 *                       request_mode:
 *                         type: string
 *                         description: Mode of the request.
 *                         example: "active"
 *                       created_dtm:
 *                         type: string
 *                         format: date-time
 *                         description: The date and time the request was created.
 *                         example: "2025-03-10T09:30:00Z"
 *                       end_dtm:
 *                         type: string
 *                         nullable: true
 *                         description: The date and time the request ended, if applicable.
 *                         example: null
 *       400:
 *         description: |
 *           Missing required field: request_mode.
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
 *                   example: "Missing required fields: request_mode"
 *       404:
 *         description: |
 *           No active RO requests found for the provided request_mode.
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
 *                   example: "No active RO requests found with request_mode: active."
 *       500:
 *         description: |
 *           Internal server error occurred while fetching active RO requests.
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
 *                   example: "Internal server error occurred while fetching active RO details."
 *                 error:
 *                   type: string
 *                   example: "Internal server error message."
 */
router.post("/List_Active_RO_Requests", ListActiveRORequests);

/**
 * @swagger
 * tags:
 *   - name: Mediation
 *     description: Endpoints related to active mediation and board sessions.
 *
 * /api/case/List_Active_Mediation_Response:
 *   get:
 *     summary: Retrieve all active mediation board sessions.
 *     description: |
 *       This endpoint retrieves all active mediation board responses where the end_dtm field is null,
 *       indicating that the mediation session is still ongoing.
 *
 *       | Version | Date       | Description                         | Changed By         |
 *       |---------|------------|-------------------------------------|--------------------|
 *       | 01      | 2025-Feb-19| List all active mediation responses | U.H.Nandali Linara  |
 *     tags:
 *       - Mediation
 *     responses:
 *       200:
 *         description: Active mediation board sessions retrieved successfully.
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
 *                   example: Active mediation details retrieved successfully.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       mediation_id:
 *                         type: integer
 *                         description: Unique identifier for the mediation session.
 *                         example: 501
 *                       case_id:
 *                         type: integer
 *                         description: ID of the related case.
 *                         example: 1001
 *                       status:
 *                         type: string
 *                         description: Current status of the mediation session.
 *                         example: "Ongoing"
 *                       created_dtm:
 *                         type: string
 *                         format: date-time
 *                         description: The date and time the mediation session started.
 *                         example: "2025-02-10T09:30:00Z"
 *                       end_dtm:
 *                         type: string
 *                         nullable: true
 *                         description: The date and time the mediation session ended, if applicable.
 *                         example: null
 *       404:
 *         description: No active mediation sessions found.
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
 *                   example: No active Mediation response found.
 *       500:
 *         description: Internal server error occurred while fetching active mediation sessions.
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
 *                   example: Internal server error occurred while fetching active negotiation details.
 *                 error:
 *                   type: string
 *                   example: Internal server error message.
 */
router.get("/List_Active_Mediation_Response", ListActiveMediationResponse);

/**
 * @swagger
 * /api/task/Create_Task_For_Assigned_drc_case_list_download:
 *   post:
 *     summary: Create Task for Assigned DRC Case List Download
 *     description: |
 *       Creates a task for downloading the assigned DRC case list within a given date range, based on the provided `drc_id`, `case_id`, `account_no`, `from_date`, `to_date`, and `Created_By`.
 *       This task will be marked as "open" and assigned a template task ID for batch approval.
 *
 *       | Version | Date        | Description                                                  | Changed By      |
 *       |---------|-------------|--------------------------------------------------------------|-----------------|
 *       | 01      | 2025-Mar-11 | Create task for Assigned DRC Case List Download               | Dinusha Anupama |
 *
 *     tags: [Case Management]
 *     parameters:
 *       - in: body
 *         name: requestBody
 *         required: true
 *         description: The body contains the `drc_id`, `case_id`, `account_no`, `from_date`, `to_date`, and `Created_By` values.
 *         schema:
 *           type: object
 *           properties:
 *             drc_id:
 *               type: string
 *               description: The ID of the DRC (required).
 *               example: "1"
 *             case_id:
 *               type: string
 *               description: The ID of the case (optional).
 *               example: "1"
 *             account_no:
 *               type: string
 *               description: The account number (optional).
 *               example: "1"
 *             from_date:
 *               type: string
 *               format: date
 *               description: The start date for the case list filter (optional).
 *               example: "2025-02-28"
 *             to_date:
 *               type: string
 *               format: date
 *               description: The end date for the case list filter (optional).
 *               example: "2025-01-01"
 *             Created_By:
 *               type: string
 *               description: The name of the user who is creating the task (required).
 *               example: "admin_user"
 *     responses:
 *       201:
 *         description: Successfully created a task for the assigned DRC case list download.
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
 *                   example: "Task created successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     Template_Task_Id:
 *                       type: integer
 *                       example: 35
 *                     task_type:
 *                       type: string
 *                       example: "Create task for download the Assigned DRC's case list when selected date range is higher than one month"
 *                     drc_id:
 *                       type: string
 *                       example: "1"
 *                     case_id:
 *                       type: string
 *                       example: "1"
 *                     account_no:
 *                       type: string
 *                       example: "1"
 *                     from_date:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-02-28T00:00:00.000Z"
 *                     to_date:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-01T00:00:00.000Z"
 *                     Created_By:
 *                       type: string
 *                       example: "admin_user"
 *                     task_status:
 *                       type: string
 *                       example: "open"
 *       400:
 *         description: Missing required fields `Created_By`.
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
 *                   example: "Created_By is a required parameter."
 *       500:
 *         description: Error occurred while creating the task.
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
 *                   example: "Error creating task."
 *                 errors:
 *                   type: object
 *                   properties:
 *                     exception:
 *                       type: string
 *                       example: "Internal server error."
 */
router.post("/Create_Task_For_Assigned_drc_case_list_download", Create_Task_For_Assigned_drc_case_list_download);

router.post("/Mediation_Board", Mediation_Board);

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
// router.post("/Case_Details_for_DRC", drcCaseDetails);

/**
 * @swagger
 * tags:
 *   - name: Case Management
 *     description: Endpoints for updating case details related to DRC and RO.
 * 
 * /api/case/Update_Customer_Contacts:
 *   patch:
 *     summary: Update case details for a specific DRC or Recovery Officer.
 *     description: |
 *       This endpoint updates case details related to a specific DRC or Recovery Officer.
 *       It handles updating customer contact details, address, email, and remark.
 *       The endpoint also checks for duplicate data to avoid conflicts.
 *       
 *       | Version | Date       | Description                         | Changed By         |
 *       |---------|------------|-------------------------------------|--------------------|
 *       | 01      | 2025-Mar-16| Update DRC case details              | Sasindu Srinayaka  |
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
 *                 example: 7
 *               ro_id:
 *                 type: integer
 *                 description: Recovery Officer ID responsible for the case.
 *                 example: 2
 *               case_id:
 *                 type: integer
 *                 description: Unique identifier of the case.
 *                 example: 11
 *               customer_identification:
 *                 type: string
 *                 description: Customer identification number (e.g., NIC).
 *                 example: "987654321V"
 *               customer_identification_type:
 *                 type: string
 *                 description: Type of customer identification.
 *                 example: "NIC"
 *               contact_no:
 *                 type: string
 *                 description: Contact number of the customer.
 *                 example: "0712345678"
 *               contact_type:
 *                 type: string
 *                 description: Type of contact (e.g., Mobile, Landline).
 *                 example: "Mobile"
 *               email:
 *                 type: string
 *                 description: Email address of the customer.
 *                 example: "john.doe@example.com"
 *               address:
 *                 type: string
 *                 description: Address of the customer.
 *                 example: "123 Main St, Matara"
 *               remark:
 *                 type: string
 *                 description: Remark related to the case.
 *                 example: "Address updated with new contact number."
 *     responses:
 *       200:
 *         description: Case details updated successfully.
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
 *                   example: Case details updated successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     case_id:
 *                       type: integer
 *                       description: Updated case ID.
 *                       example: 101
 *                     updated_fields:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: List of updated fields.
 *                       example: ["contact_no", "email", "address"]
 *       400:
 *         description: Validation error - Missing required fields or duplicate data.
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
 *                   example: Failed to update case details.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     description:
 *                       type: string
 *                       example: Case ID is required.
 *       404:
 *         description: No matching cases found for the given criteria.
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
 *         description: Internal server error occurred while updating case details.
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
 *                   example: Failed to update the case.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: Internal server error while updating the case.
 */
// POST route to update customer contacts or remarks for a specific case.
router.patch("/Update_Customer_Contacts",updateDrcCaseDetails);

router.post("/AssignDRCToCaseDetails", AssignDRCToCaseDetails);

/**
 * @swagger
 * /api/task/Withdraw_CasesOwened_By_DRC:
 *   post:
 *     summary: Withdraw Cases Owned by DRC
 *     description: |
 *       Withdraws a case owned by DRC for approval based on the provided `approver_reference`, `remark`, `remark_edit_by`, and `created_by`. 
 *       The case will be marked with a "Pending Case Withdrawal" status, and an interaction log will be created for the case withdrawal approval process.
 *
 *       | Version | Date        | Description                                      | Changed By        |
 *       |---------|-------------|--------------------------------------------------|-------------------|
 *       | 01      | 2025-Mar-11 | Withdraw case owned by DRC for case withdrawal approval | Dinusha Anupama   |
 *
 *     tags: [Case Management]
 *     parameters:
 *       - in: body
 *         name: requestBody
 *         required: true
 *         description: The body contains the `approver_reference`, `remark`, `remark_edit_by`, and `created_by` values.
 *         schema:
 *           type: object
 *           properties:
 *             approver_reference:
 *               type: integer
 *               description: The unique reference ID for the approver (required).
 *               example: 444
 *             remark:
 *               type: string
 *               description: The remark for the case withdrawal request (required).
 *               example: "Requesting case withdrawal approval"
 *             remark_edit_by:
 *               type: string
 *               description: The name of the user editing the remark (required).
 *               example: "AdminUser"
 *             created_by:
 *               type: string
 *               description: The name of the user creating the withdrawal request (required).
 *               example: "JohnDoe"
 *     responses:
 *       201:
 *         description: Successfully added the case withdrawal request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Case withdrawal request added successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     approver_reference:
 *                       type: integer
 *                       example: 444
 *                     created_by:
 *                       type: string
 *                       example: "JohnDoe"
 *                     approve_status:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           status:
 *                             type: string
 *                             example: "Pending Case Withdrawal"
 *                           status_date:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-03-11T07:19:27.820Z"
 *                           status_edit_by:
 *                             type: string
 *                             example: "JohnDoe"
 *                     approver_type:
 *                       type: string
 *                       example: "Case Withdrawal Approval"
 *                     remark:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           remark:
 *                             type: string
 *                             example: "Requesting case withdrawal approval"
 *                           remark_date:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-03-11T07:19:27.820Z"
 *                           remark_edit_by:
 *                             type: string
 *                             example: "AdminUser"
 *                     _id:
 *                       type: string
 *                       example: "67cfe3ff7c54aa20f4a15998"
 *                     created_on:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-03-11T07:19:27.826Z"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-03-11T07:19:27.831Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-03-11T07:19:27.831Z"
 *       400:
 *         description: Missing required fields (`approver_reference`, `remark`, `remark_edit_by`, or `created_by`).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "All required fields must be provided."
 *       500:
 *         description: Error occurred while withdrawing the case.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 */
router.post("/Withdraw_CasesOwened_By_DRC", Withdraw_CasesOwened_By_DRC);

// router.post("/List_All_DRCs_Mediation_Board_Cases", List_All_DRCs_Mediation_Board_Cases);

/**
 * @swagger
 * /api/case/Accept_Non_Settlement_Request_from_Mediation_Board:
 *   put:
 *     summary: Accept Non-Settlement Request from Mediation Board
 *     description: Updates the case_current_status and case_status based on case_id.
 *     tags: [Case Management]
 *     parameters:
 *       - in: body
 *         name: case_id
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - case_id
 *           properties:
 *             case_id:
 *               type: integer
 *               description: The unique case ID to update the status.
 *               example: 1001
 *     responses:
 *       200:
 *         description: Case status updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Case status updated successfully.
 *                 updatedCase:
 *                   type: object
 *                   properties:
 *                     case_id:
 *                       type: integer
 *                       example: 1001
 *                     case_current_status:
 *                       type: string
 *                       example: MB Fail with Non-Settlement
 *       400:
 *         description: Validation error - Case ID not provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: case_id is required.
 *       404:
 *         description: Case not found or not eligible for update.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Case not found or not eligible for update.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error.
 */
router.put("/Accept_Non_Settlement_Request_from_Mediation_Board", Accept_Non_Settlement_Request_from_Mediation_Board);

/**
 * @swagger
 * /api/case/ListRequestLogFromRecoveryOfficers:
 *   post:
 *     summary: Retrieve request logs from recovery officers
 *     description: |
 *       Fetches request logs from the `User_Interaction_Log` collection based on filters such as delegate user ID, interaction type, and date range.
 *       It also retrieves related request records and case details.
 *
 *       | Version | Date        | Description                                | Changed By    |
 *       |---------|------------|--------------------------------------------|--------------|
 *       | 01      | 2025-Mar-17 | Initial implementation                    | Dinusha Anupama    |
 *
 *     tags: [Case Management]
  *     parameters:
 *       - in: body
 *         name: delegate_user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the delegate user to fetch interaction logs.
 *       - in: body
 *         name: User_Interaction_Type
 *         required: false
 *         schema:
 *           type: string
 *         description: Type of user interaction to filter logs.
 *       - in: body
 *         name: date_from
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering logs.
 *       - in: body
 *         name: date_to
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering logs.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               delegate_user_id:
 *                 type: string
 *                 example: "5"
 *               User_Interaction_Type:
 *                 type: string
 *                 example: "Mediation board forward request letter"
 *               date_from:
 *                 type: string
 *                 format: date
 *                 example: "2025-03-01"
 *               date_to:
 *                 type: string
 *                 format: date
 *                 example: "2025-03-31"
 *     responses:
 *       200:
 *         description: Successfully retrieved request logs from recovery officers.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   doc_version:
 *                     type: integer
 *                     example: 1
 *                   _id:
 *                     type: string
 *                     example: "67c67875737c34aa4701ce32"
 *                   Interaction_Log_ID:
 *                     type: integer
 *                     example: 100
 *                   Interaction_ID:
 *                     type: integer
 *                     example: 1
 *                   User_Interaction_Type:
 *                     type: string
 *                     example: "Mediation board forward request letter"
 *                   delegate_user_id:
 *                     type: string
 *                     example: "5"
 *                   Created_By:
 *                     type: string
 *                     example: "User123"
 *                   User_Interaction_Status:
 *                     type: string
 *                     example: "Open"
 *                   parameters:
 *                     type: object
 *                     example: {}
 *                   User_Interaction_Status_DTM:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-03-03T15:30:00.000Z"
 *                   Request_Mode:
 *                     type: string
 *                     example: "Negotiation"
 *                   CreateDTM:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-03-03T19:27:17.666Z"
 *                   case_details:
 *                     type: object
 *                     properties:
 *                       case_id:
 *                         type: integer
 *                         example: 1
 *                       case_current_status:
 *                         type: string
 *                         example: "Withdraw"
 *                       current_arrears_amount:
 *                         type: number
 *                         example: 1250.75
 *                       drc:
 *                         type: object
 *                         properties:
 *                           drc_id:
 *                             type: integer
 *                             example: 7
 *                           drc_name:
 *                             type: string
 *                             example: "DRC A"
 *                           drc_status:
 *                             type: string
 *                             example: "Active"
 *                       Validity_Period:
 *                         type: string
 *                         example: "2025-01-18T10:00:00.000Z - 2025-04-18T10:00:00.000Z"
 *                   Approve_Status:
 *                     type: string
 *                     example: "Yes"
 *       400:
 *         description: Validation error due to missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "delegate_user_id is required"
 *       404:
 *         description: No matching interactions or approved/rejected requests found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No matching interactions found."
 *       500:
 *         description: Internal server error due to database or application failure.
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
 *                   example: "Database connection failed"
 */

router.post("/ListAllRequestLogFromRecoveryOfficers", ListAllRequestLogFromRecoveryOfficers);

router.post("/ListRequestLogFromRecoveryOfficers", ListRequestLogFromRecoveryOfficers);

router.post("/ListAllRequestLogFromRecoveryOfficersWithoutUserID", ListAllRequestLogFromRecoveryOfficersWithoutUserID);

/**
 * @swagger
 * /api/case/Customer_Negotiations:
 *   post:
 *     summary: C-3P66 Add or update customer negotiations
 *     description: |
 *       This endpoint handles creating new customer negotiations or updating existing ones.
 *       It supports different negotiation scenarios including settlement agreements.
 *       
 *       ### Version History
 *       | Version | Date        | Description                                | Author            |
 *       |---------|-------------|--------------------------------------------|-------------------|
 *       | 1.0     | 2025-Mar-05 | Initial version                            | Yevin Theenura    |
 *     tags:
 *       - Customer Negotiations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - case_id
 *               - drc_id
 *               - field_reason
 *             properties:
 *               case_id:
 *                 type: integer
 *                 description: Unique identifier for the case
 *                 example: 250
 *               request_id:
 *                 type: integer
 *                 description: ID of the request (required if request_type is provided)
 *                 example: 1
 *               request_type:
 *                 type: string
 *                 description: Type of the request
 *                 example: "Settlement Request"
 *               request_comment:
 *                 type: string
 *                 description: Comments about the request
 *                 example: "Customer requested a settlement."
 *               drc_id:
 *                 type: integer
 *                 description: ID of the Debt Recovery Coordinator
 *                 example: 1
 *               ro_id:
 *                 type: integer
 *                 description: ID of the Recovery Officer
 *                 example: 2
 *               ro_name:
 *                 type: string
 *                 description: Name of the Recovery Officer
 *                 example: "John Doe"
 *               drc:
 *                 type: string
 *                 description: Information about the DRC
 *                 example: "Some DRC Info"
 *               field_reason:
 *                 type: string
 *                 description: Reason for the field negotiation
 *                 example: "Agreed To Settle"
 *               field_reason_remark:
 *                 type: string
 *                 description: Remarks about the field reason
 *                 example: "Customer wants a discount"
 *               intraction_id:
 *                 type: integer
 *                 description: Interaction ID (required if request_id is provided)
 *                 example: 1
 *               initial_amount:
 *                 type: number
 *                 description: Initial settlement amount (required if field_reason is "Agreed To Settle")
 *                 example: 5000
 *               calender_month:
 *                 type: integer
 *                 description: Number of calendar months for settlement (required if field_reason is "Agreed To Settle")
 *                 example: 3
 *               duration_from:
 *                 type: string
 *                 format: date
 *                 description: Start date of settlement duration (required if field_reason is "Agreed To Settle")
 *                 example: "2024-03-01"
 *               duration_to:
 *                 type: string
 *                 format: date
 *                 description: End date of settlement duration (required if field_reason is "Agreed To Settle")
 *                 example: "2024-06-01"
 *               settlement_remark:
 *                 type: string
 *                 description: Remarks about the settlement
 *                 example: "Agreed to settle with conditions"
 *               created_by:
 *                 type: string
 *                 description: User who created the negotiation
 *                 example: "admin"
 *     responses:
 *       200:
 *         description: Operation completed successfully
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
 *                   example: "Operation completed successfully"
 *       400:
 *         description: Missing required fields or validation error
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
 *                   example: "Missing required fields: case_id, drc_id, field_reason"
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
 *                   example: "Case not found for this case id"
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
 *                   example: "Server error"
 *                 error:
 *                   type: string
 *                   example: "Detailed error message"
 */

router.post("/Customer_Negotiations", Customer_Negotiations);

router.post("/List_Active_RO_Requests_Mediation", ListActiveRORequestsMediation);
// router.post("/add-cpecollect", addCpeToNegotiation);

/**
 * @swagger
 * /api/case/list_Active_Customer_Negotiations:
 *   post:
 *     summary: C-1P67 Retrieve all active customer negotiations.
 *     description: |
 *       This endpoint retrieves all active customer negotiations.
 *
 *       | Version | Date       | Description                         | Changed By         |
 *       |---------|------------|-------------------------------------|--------------------|
 *       | 01      | 2025-Mar-06| List all active customer negotiations | Yevin Theenura  |
 *     tags:
 *       - Customer Negotiations
 *     requestBody:
 *       required: false
 *     responses:
 *       200:
 *         description: Active customer negotiations retrieved successfully.
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
 *                   example: Active customer negotiations retrieved successfully.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       negotiation_id:
 *                         type: integer
 *                         description: Unique identifier for the negotiation.
 *                         example: 501
 *                       case_id:
 *                         type: integer
 *                         description: ID of the related case.
 *                         example: 1001
 *                       status:
 *                         type: string
 *                         description: Current status of the negotiation.
 *                         example: "Ongoing"
 *                       created_dtm:
 *                         type: string
 *                         format: date-time
 *                         description: The date and time the negotiation started.
 *                         example: "2025-02-10T09:30:00Z"
 *                       end_dtm:
 *                         type: string
 *                         nullable: true
 *                         description: The date and time the negotiation ended, if applicable.
 *                         example: null
 *       404:
 *         description: No active customer negotiations found.
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
 *                   example: No active customer negotiations found.
 *       500:
 *         description: Internal server error occurred while fetching active customer negotiations.
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
 *                   example: Internal server error occurred while fetching active customer negotiations.
 *                 error:
 *                   type: string
 *                   example: Internal server error message.
 */
router.post("/list_Active_Customer_Negotiations", getActiveNegotiations);


// router.post("/Create_task_for_Request_log_download_when_select_more_than_one_month", Create_task_for_Request_log_download_when_select_more_than_one_month);

// router.post(
//   "/List_Details_Of_Mediation_Board_Acceptance",
//   List_Details_Of_Mediation_Board_Acceptance
// );

// router.post(
//   "/Submit_Mediation_Board_Acceptance",
//   Submit_Mediation_Board_Acceptance
// );

// router.post(
//   "/Withdraw_Mediation_Board_Acceptance",
//   Withdraw_Mediation_Board_Acceptance
// );


/**
 * @swagger
 * /api/case/Create_task_for_Request_log_download_when_select_more_than_one_month:
 *   post:
 *     summary: Create Task for Request Log Download (More than One Month)
 *     description: |
 *       Creates a task for downloading request logs when the selected date range exceeds one month.
 *
 *       | Version | Date        | Description                                      | Changed By       |
 *       |---------|------------|--------------------------------------------------|------------------|
 *       | 01      | 2025-Mar-06 | Create task for request log download for >1 month | Dinusha Anupama |
 *
 *     tags: [Case Management]
 *     parameters:
 *       - in: query
 *         name: delegate_user_id
 *         schema:
 *           type: string
 *           example: "5"
 *         description: ID of the delegate user associated with the task.
 *       - in: query
 *         name: User_Interaction_Type
 *         schema:
 *           type: string
 *           example: "Download"
 *         description: Type of user interaction.
 *       - in: query
 *         name: Request Accept
 *         schema:
 *           type: string
 *           enum: [Approve, Reject]
 *           example: "Approve"
 *         description: Approval status for the request.
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-01-01"
 *         description: Start date of the request log period.
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-02-01"
 *         description: End date of the request log period.
 *       - in: query
 *         name: Created_By
 *         schema:
 *           type: string
 *           example: "admin"
 *         description: User who created the task.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               delegate_user_id:
 *                 type: string
 *                 example: "5"
 *               User_Interaction_Type:
 *                 type: string
 *                 example: "Download"
 *               Request Accept:
 *                 type: string
 *                 enum: [Approve, Reject]
 *                 example: "Approve"
 *               date_from:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-01"
 *               date_to:
 *                 type: string
 *                 format: date
 *                 example: "2025-02-01"
 *               Created_By:
 *                 type: string
 *                 example: "admin"
 *     responses:
 *       201:
 *         description: Task created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Task for request log download created successfully."
 *                 taskData:
 *                   type: object
 *                   properties:
 *                     Template_Task_Id:
 *                       type: integer
 *                       example: 37
 *                     task_type:
 *                       type: string
 *                       example: "Create Task for Request log List for Download"
 *                     delegate_user_id:
 *                       type: string
 *                       example: "5"
 *                     User_Interaction_Type:
 *                       type: string
 *                       example: "Download"
 *                     Request Accept:
 *                       type: string
 *                       example: "Approve"
 *                     date_from:
 *                       type: string
 *                       format: date
 *                       example: "2025-01-01"
 *                     date_to:
 *                       type: string
 *                       format: date
 *                       example: "2025-02-01"
 *                     created_on:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-03-06T10:30:00.000Z"
 *                     Created_By:
 *                       type: string
 *                       example: "admin"
 *                     task_status:
 *                       type: string
 *                       example: "open"
 *       400:
 *         description: Validation error - Missing or incorrect parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid input, missing Created_By field."
 *       500:
 *         description: Server error occurred while creating the task.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating task for request log download"
 *                 error:
 *                   type: string
 *                   example: "Internal server error."
 */
router.post("/Create_task_for_Request_log_download_when_select_more_than_one_month", Create_task_for_Request_log_download_when_select_more_than_one_month);

/**
 * @swagger
 * /api/case/List_Details_Of_Mediation_Board_Acceptance:
 *   post:
 *     summary: List Details of Mediation Board Acceptance
 *     description: |
 *       Fetches case details and interaction logs related to mediation board acceptance.
 *
 *       | Version | Date        | Description                                          | Changed By       |
 *       |---------|------------|------------------------------------------------------|------------------|
 *       | 01      | 2025-Mar-19 | Fetch case details and interaction logs for mediation board | Your Name       |
 *
 *     tags: [Case Management]
 *     parameters:
 *       - in: query
 *         name: delegate_user_id
 *         schema:
 *           type: string
 *           example: "5"
 *         description: ID of the delegate user.
 *       - in: query
 *         name: User_Interaction_Type
 *         schema:
 *           type: string
 *           example: "Mediation board forward request letter"
 *         description: User_Interaction_Type which we want to get documents.
 *       - in: query
 *         name: case_id
 *         schema:
 *           type: number
 *           example: 1
 *         description: ID of the case.
 *       - in: query
 *         name: Interaction_Log_ID
 *         schema:
 *           type: number
 *           example: "100"
 *         description: ID of the user interaction log.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               delegate_user_id:
 *                 type: string
 *                 example: "5"
 *               User_Interaction_Type:
 *                 type: string
 *                 example: "Mediation board forward request letter"
 *               case_id:
 *                 type: integer
 *                 example: 1
 *               Interaction_Log_ID:
 *                 type: integer
 *                 example: 100
 *     responses:
 *       200:
 *         description: Case details and request history retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 case_id:
 *                   type: integer
 *                   example: 1
 *                 customer_ref:
 *                   type: string
 *                   example: "CUST12345"
 *                 account_no:
 *                   type: string
 *                   example: "ACC56789"
 *                 current_arrears_amount:
 *                   type: number
 *                   example: 15000.75
 *                 last_payment_date:
 *                   type: string
 *                   format: date
 *                   example: "2025-02-20"
 *                 monitor_months:
 *                   type: integer
 *                   example: 6
 *                 incident_id:
 *                   type: integer
 *                   example: 3001
 *                 case_current_status:
 *                   type: string
 *                   example: "Forward to Mediation Board"
 *                 ro_negotiation:
 *                   type: object
 *                   properties:
 *                     negotiation_status:
 *                       type: string
 *                       example: "RO Negotiation Extension Pending"
 *                 mediation_board:
 *                   type: object
 *                   properties:
 *                     mediation_status:
 *                       type: string
 *                       example: "MB Settle Pending"
 *                 Customer_Type_Name:
 *                   type: string
 *                   example: "Corporate"
 *                 ACCOUNT_MANAGER:
 *                   type: string
 *                   example: "John Doe"
 *                 Request_History:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       delegate_user_id:
 *                         type: string
 *                         example: "5"
 *                       User_Interaction_Type:
 *                         type: string
 *                         example: "Previous Interaction Type"
 *                       Interaction_Log_ID:
 *                         type: integer
 *                         example: 99
 *       400:
 *         description: Validation error - Missing or incorrect parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "delegate_user_id, case_id, and Interaction_Log_ID are required"
 *       404:
 *         description: Case details or interaction logs not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No matching interaction found."
 *       500:
 *         description: Server error occurred while fetching case details.
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
 *                   example: "Error fetching case details"
 */
router.post( "/List_Details_Of_Mediation_Board_Acceptance", List_Details_Of_Mediation_Board_Acceptance);

/**
 * @swagger
 * /api/case/Submit_Mediation_Board_Acceptance:
 *   post:
 *     summary: Submit Mediation Board Acceptance Request
 *     description: |
 *       Submits a mediation board acceptance request and updates the case status and interaction log.
 *
 *       | Version | Date        | Description                                          | Changed By       |
 *       |---------|------------|------------------------------------------------------|------------------|
 *       | 01      | 2025-Mar-19 | Submit mediation board acceptance request          | Dinusha Anupama       |
 *
 *     tags: [Case Management]
 *     parameters:
 *       - in: query
 *         name: create_by
 *         schema:
 *           type: string
 *           example: "admin"
 *         description: Person who accept the request.
 *       - in: query
 *         name: Interaction_Log_ID
 *         schema:
 *           type: number
 *           example: 55
 *         description: ID of the document in User Interaction Log.
 *       - in: query
 *         name: case_id
 *         schema:
 *           type: number
 *           example: 1
 *         description: ID of the case.
 *       - in: query
 *         name: User_Interaction_Type
 *         schema:
 *           type: string
 *           example: "Mediation Board"
 *         description: User_Interaction_Type of the document in User Interaction Log.
 *       - in: query
 *         name: Request_Mode
 *         schema:
 *           type: string
 *           example: "Negotiation"
 *         description: Request_Mode of the document.
 *       - in: query
 *         name: Interaction_ID
 *         schema:
 *           type: number
 *           example: 1
 *         description: Interaction_ID of the document.
 *       - in: query
 *         name: Request Accept
 *         schema:
 *           type: string
 *           example: "Yes"
 *         description: Request Accept field in parameters section in Request collection.
 *       - in: query
 *         name: Reamrk
 *         schema:
 *           type: string
 *           example: "high"
 *         description: Remark of the document in parameters section in Request collection document.
 *       - in: query
 *         name: No_of_Calendar_Month
 *         schema:
 *           type: string
 *           example: "1"
 *         description: No_of_Calendar_Month field in parameters section in Request collection document.
 *       - in: query
 *         name: Letter_Send
 *         schema:
 *           type: string
 *           example: "Yes"
 *         description: Letter_Send field in parameters section in Request collection document.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               create_by:
 *                 type: string
 *                 example: "User456"
 *               Interaction_Log_ID:
 *                 type: integer
 *                 example: 55
 *               case_id:
 *                 type: integer
 *                 example: 1
 *               User_Interaction_Type:
 *                 type: string
 *                 example: "Mediation Board"
 *               Request_Mode:
 *                 type: string
 *                 example: "Negotiation"
 *               Interaction_ID:
 *                 type: integer
 *                 example: 1
 *               Request Accept:
 *                 type: string
 *                 example: "Yes"
 *               Reamrk:
 *                 type: string
 *                 example: "high"
 *               No_of_Calendar_Month:
 *                 type: string
 *                 example: "1"
 *               Letter_Send:
 *                 type: string
 *                 example: "Yes"
 *     responses:
 *       201:
 *         description: Mediation board acceptance request submitted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Mediation Board Acceptance Request submitted and case updated successfully."
 *                 updates:
 *                   type: object
 *                   properties:
 *                     case_id:
 *                       type: integer
 *                       example: 1
 *                     case_current_status:
 *                       type: string
 *                       example: "Accept"
 *                     monitor_months:
 *                       type: integer
 *                       example: 4
 *                     added_case_status:
 *                       type: object
 *                       properties:
 *                         case_status:
 *                           type: string
 *                           example: "Accept"
 *                         status_reason:
 *                           type: string
 *                           example: "high"
 *                         created_dtm:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-03-19T07:26:51.862Z"
 *                         created_by:
 *                           type: string
 *                           example: "User456"
 *                         notified_dtm:
 *                           type: string
 *                           nullable: true
 *                         expire_dtm:
 *                           type: string
 *                           nullable: true
 *                     interaction_log_status:
 *                       type: string
 *                       example: "Approved"
 *                     drc_expire_extended:
 *                       type: string
 *                       nullable: true
 *                       example: "2025-05-12T18:16:49.606Z"
 *                 request:
 *                   type: object
 *                   properties:
 *                     RO_Request_Id:
 *                       type: integer
 *                       example: 55
 *                     Request_Description:
 *                       type: string
 *                       example: "Mediation Board"
 *                     created_dtm:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-03-19T07:26:51.660Z"
 *                     created_by:
 *                       type: string
 *                       example: "User456"
 *                     Request_Mode:
 *                       type: string
 *                       example: "Negotiation"
 *                     Intraction_ID:
 *                       type: integer
 *                       example: 1
 *                     parameters:
 *                       type: object
 *                       properties:
 *                         Request Accept:
 *                           type: string
 *                           example: "Yes"
 *                         Reamrk:
 *                           type: string
 *                           example: "high"
 *                         No_of_Calendar_Month:
 *                           type: string
 *                           example: "1"
 *                         Letter_Send:
 *                           type: string
 *                           example: "Yes"
 *       400:
 *         description: Validation error - Incorrect or missing parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid No_of_Calendar_Month value. It must be a positive number."
 *       404:
 *         description: Case details not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Case with case_id 1 not found."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to submit Mediation Board Acceptance Request and update related records."
 *                 error:
 *                   type: string
 *                   example: "Error message details"
 */
router.post(
  "/Submit_Mediation_Board_Acceptance",
  Submit_Mediation_Board_Acceptance
);

/**
 * @swagger
 * /api/case/Withdraw_Mediation_Board_Acceptance:
 *   post:
 *     summary: Withdraw Mediation Board Acceptance Request
 *     description: |
 *       Withdraws a mediation board acceptance request and updates the case status and interaction log.
 *
 *       | Version | Date        | Description                                          | Changed By       |
 *       |---------|------------|------------------------------------------------------|------------------|
 *       | 01      | 2025-Mar-19 | Withdraw mediation board acceptance request          | Dinusha Anupama       |
 *
 *     tags: [Case Management]
 *     parameters:
 *       - in: query
 *         name: create_by
 *         schema:
 *           type: string
 *           example: "User456"
 *         description: Person who withdraws the request.
 *       - in: query
 *         name: Interaction_Log_ID
 *         schema:
 *           type: number
 *           example: 55
 *         description: ID of the document in User Interaction Log.
 *       - in: query
 *         name: case_id
 *         schema:
 *           type: number
 *           example: 1
 *         description: ID of the case.
 *       - in: query
 *         name: User_Interaction_Type
 *         schema:
 *           type: string
 *           example: "Mediation Board"
 *         description: User interaction type for the document in User Interaction Log.
 *       - in: query
 *         name: Request_Mode
 *         schema:
 *           type: string
 *           example: "Negotiation"
 *         description: Request mode for the document.
 *       - in: query
 *         name: Interaction_ID
 *         schema:
 *           type: number
 *           example: 1
 *         description: Interaction ID of the document.
 *       - in: query
 *         name: Request Accept
 *         schema:
 *           type: string
 *           example: "Yes"
 *         description: Request accept status field in parameters section in Request collection.
 *       - in: query
 *         name: Reamrk
 *         schema:
 *           type: string
 *           example: "high"
 *         description: Remark for the document in parameters section in Request collection.
 *       - in: query
 *         name: No_of_Calendar_Month
 *         schema:
 *           type: string
 *           example: "1"
 *         description: Number of calendar months for the request in parameters section in Request collection.
 *       - in: query
 *         name: Letter_Send
 *         schema:
 *           type: string
 *           example: "Yes"
 *         description: Letter send status field in parameters section in Request collection.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               create_by:
 *                 type: string
 *                 example: "User456"
 *               Interaction_Log_ID:
 *                 type: integer
 *                 example: 55
 *               case_id:
 *                 type: integer
 *                 example: 1
 *               User_Interaction_Type:
 *                 type: string
 *                 example: "Mediation Board"
 *               Request_Mode:
 *                 type: string
 *                 example: "Negotiation"
 *               Interaction_ID:
 *                 type: integer
 *                 example: 1
 *               Request Accept:
 *                 type: string
 *                 example: "Yes"
 *               Reamrk:
 *                 type: string
 *                 example: "high"
 *               No_of_Calendar_Month:
 *                 type: string
 *                 example: "1"
 *               Letter_Send:
 *                 type: string
 *                 example: "Yes"
 *     responses:
 *       201:
 *         description: Withdrawal mediation board request submitted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Withdrawal mediation board request submitted and all records updated successfully."
 *                 updates:
 *                   type: object
 *                   properties:
 *                     case_id:
 *                       type: integer
 *                       example: 1
 *                     case_current_status:
 *                       type: string
 *                       example: "Withdraw"
 *                     monitor_months:
 *                       type: integer
 *                       example: 2
 *                     added_case_status:
 *                       type: object
 *                       properties:
 *                         case_status:
 *                           type: string
 *                           example: "Withdraw"
 *                         status_reason:
 *                           type: string
 *                           example: "high"
 *                         created_dtm:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-03-19T08:00:00.203Z"
 *                         created_by:
 *                           type: string
 *                           example: "User456"
 *                         notified_dtm:
 *                           type: string
 *                           nullable: true
 *                         expire_dtm:
 *                           type: string
 *                           nullable: true
 *                     interaction_log_status:
 *                       type: string
 *                       example: "Withdraw"
 *                     forwarded_approver_id:
 *                       type: string
 *                       example: "67da798045a4635e68522f4f"
 *                     drc_expire_extended:
 *                       type: string
 *                       nullable: true
 *                       example: "2025-07-12T18:16:49.606Z"
 *                 request:
 *                   type: object
 *                   properties:
 *                     RO_Request_Id:
 *                       type: integer
 *                       example: 55
 *                     Request_Description:
 *                       type: string
 *                       example: "Mediation Board"
 *                     created_dtm:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-03-19T08:00:00.009Z"
 *                     created_by:
 *                       type: string
 *                       example: "User456"
 *                     Request_Mode:
 *                       type: string
 *                       example: "Negotiation"
 *                     Intraction_ID:
 *                       type: integer
 *                       example: 1
 *                     parameters:
 *                       type: object
 *                       properties:
 *                         Request Accept:
 *                           type: string
 *                           example: "Yes"
 *                         Reamrk:
 *                           type: string
 *                           example: "high"
 *                         No_of_Calendar_Month:
 *                           type: string
 *                           example: "1"
 *                         Letter_Send:
 *                           type: string
 *                           example: "Yes"
 *       400:
 *         description: Validation error - Incorrect or missing parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid No_of_Calendar_Month value. It must be a positive number."
 *       404:
 *         description: Case details not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Case with case_id 1 not found."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to process withdrawal mediation board acceptance."
 *                 error:
 *                   type: string
 *                   example: "Error message details"
 */

router.post(
  "/Withdraw_Mediation_Board_Acceptance",
  Withdraw_Mediation_Board_Acceptance
);
//payments
// router.post("/List_All_Payment_Cases", getAllPaymentCases);


/**
 * @swagger
 * tags:
 *   - name: RO CPE Collection
 *     description: Endpoints for managing RO CPE collection.
 *
 * /api/case/RO_CPE_Collection:
 *   post:
 *     summary: C-1P41 Collect RO CPE data.
 *     description: |
 *       This endpoint is used to collect RO CPE data and update the case details.
 *       The system increments a counter to generate a unique `ro_cpe_collect_id` and updates
 *       the specified case with the provided details.
 *       
 *       | Version | Date       | Description                        | Changed By         |
 *       |---------|------------|------------------------------------|--------------------|
 *       | 01      | 2025-Mar-19| Initial implementation of the API | H.B.R.P.Madushan   |
 *     tags:
 *       - RO CPE Collection
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
 *                 example: 1
 *               drc_id:
 *                 type: integer
 *                 description: Unique identifier of the DRC.
 *                 example: 7
 *               ro_id:
 *                 type: integer
 *                 description: Unique identifier of the RO.
 *                 example: 91011
 *               order_id:
 *                 type: string
 *                 description: Order ID related to the collection.
 *                 example: "ORD-2025-001"
 *               product_label:
 *                 type: string
 *                 description: Product label assigned to the CPE.
 *                 example: "Label-XYZ"
 *               service_type:
 *                 type: string
 *                 description: Type of service for the CPE.
 *                 example: "Broadband"
 *               cp_type:
 *                 type: string
 *                 description: Type of CP being collected.
 *                 example: "Router"
 *               cpe_model:
 *                 type: string
 *                 description: Model of the collected CPE.
 *                 example: "XYZ-Model123"
 *               serial_no:
 *                 type: string
 *                 description: Serial number of the collected CPE.
 *                 example: "SN-ABC123456"
 *               remark:
 *                 type: string
 *                 description: Additional remarks or comments.
 *                 example: "Collected successfully."
 *     responses:
 *       200:
 *         description: Case updated successfully with the collected CPE data.
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
 *                   example: "Case has been updated successfully."
 *                 data:
 *                   type: object
 *                   description: Updated case details.
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
 *                   example: "case_id, drc_id, cpe_model, serial_no and cp_type are required."
 *       404:
 *         description: Case not found for the given case_id and drc_id.
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
 *                   example: "Case not found."
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 404
 *                     data:
 *                       type: string
 *                       example: "Case is not available."
 *       500:
 *         description: Internal server error occurred while processing the request.
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
 *                   example: "Internal Server Error."
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: "An unexpected error occurred."
 */
router.post("/RO_CPE_Collection", RO_CPE_Collection);

/**
 * @swagger
 * /api/case/List_Request_Response_log:
 *   post:
 *     summary: List Request Response Log
 *     description: |
 *       Fetches request response log based on provided filters (case_current_status, date_from, and date_to).
 *
 *       | Version | Date        | Description                                          | Changed By       |
 *       |---------|------------|------------------------------------------------------|------------------|
 *       | 01      | 2025-Mar-19 | Fetches request response log data for the given filters. | Your Name       |
 *
 *     tags: [Case Management]
 *     parameters:
 *       - in: query
 *         name: case_current_status
 *         schema:
 *           type: string
 *           example: "Withdraw"
 *         description: Current status of the case.
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: date
 *           example: "2025-03-01"
 *         description: Date user wants to starting filter.
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: date
 *           example: "2025-03-05"
 *         description: Date user wants to end filter.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               case_current_status:
 *                 type: string
 *                 example: "Withdraw"
 *                 description: The current status of the case.
 *               date_from:
 *                 type: string
 *                 format: date
 *                 example: "2025-03-01"
 *                 description: The start date of the range for the request.
 *               date_to:
 *                 type: string
 *                 format: date
 *                 example: "2025-03-05"
 *                 description: The end date of the range for the request.
 *     responses:
 *       200:
 *         description: Request response log data fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   drc_id:
 *                     type: integer
 *                     example: 7
 *                   drc_name:
 *                     type: string
 *                     example: "DRC A"
 *                   case_id:
 *                     type: integer
 *                     example: 1
 *                   case_current_status:
 *                     type: string
 *                     example: "Withdraw"
 *                   Validity_Period:
 *                     type: string
 *                     example: "2025-01-18T10:00:00.000Z - 2025-04-18T10:00:00.000Z"
 *                   User_Interaction_Status:
 *                     type: string
 *                     example: "Open"
 *                   Request_Description:
 *                     type: string
 *                     example: "Mediation board forward request letter"
 *                   Letter_Issued_On:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-03-03T14:00:00.000Z"
 *                   Approved_on:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-03-03T14:00:00.000Z"
 *                   Approved_by:
 *                     type: string
 *                     example: "User456"
 *                   Remark:
 *                     type: string
 *                     example: "high"
 *       400:
 *         description: Validation error - Missing or incorrect parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "case_current_status, date_from, and date_to are required"
 *       404:
 *         description: No requests or interaction logs found for the given filters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No requests found within the given date range."
 *       500:
 *         description: Server error occurred while fetching the request response log.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 */
router.post(
  "/List_Request_Response_log",
  List_Request_Response_log
);

/**
 * @swagger
 * /api/case/Create_Task_For_Request_Responce_Log_Download:
 *   post:
 *     summary: Create Task for Request Response Log Download
 *     description: |
 *       Creates a new task for generating a request response log download.
 *
 *       | Version | Date        | Description                                          | Changed By       |
 *       |---------|------------|------------------------------------------------------|------------------|
 *       | 01      | 2025-Mar-19 | Create a task for downloading request response log data. | Your Name       |
 *
 *     tags: [Case Management]
 *     parameters:
 *       - in: query
 *         name: case_current_status
 *         schema:
 *           type: string
 *           example: "Withdraw"
 *         description: Current status of the case.
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: date
 *           example: "2025-03-01"
 *         description: Date user wants to starting filter.
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: date
 *           example: "2025-03-05"
 *         description: Date user wants to end filter.
 *       - in: query
 *         name: Created_By
 *         schema:
 *           type: string
 *           example: "admin"
 *         description: User who creats the task.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               case_current_status:
 *                 type: string
 *                 example: "Withdraw"
 *                 description: The current status of the case.
 *               date_from:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-01"
 *                 description: The start date of the range for the request.
 *               date_to:
 *                 type: string
 *                 format: date
 *                 example: "2025-02-01"
 *                 description: The end date of the range for the request.
 *               Created_By:
 *                 type: string
 *                 example: "admin"
 *                 description: The user who created the task.
 *     responses:
 *       201:
 *         description: Task created successfully.
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
 *                   example: "Task created successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     Template_Task_Id:
 *                       type: integer
 *                       example: 38
 *                     task_type:
 *                       type: string
 *                       example: "Create Request Responce Log List for Downloard"
 *                     case_current_status:
 *                       type: string
 *                       example: "Withdraw"
 *                     date_from:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-01T00:00:00.000Z"
 *                     date_to:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-02-01T00:00:00.000Z"
 *                     Created_By:
 *                       type: string
 *                       example: "admin"
 *                     task_status:
 *                       type: string
 *                       example: "open"
 *       400:
 *         description: Validation error - Missing or incorrect parameters.
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
 *                   example: "Created_By is a required parameter."
 *       500:
 *         description: Server error occurred while creating the task.
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
 *                 errors:
 *                   type: object
 *                   properties:
 *                     exception:
 *                       type: string
 *                       example: "Error message details"
 */
router.post(
  "/Create_Task_For_Request_Responce_Log_Download",
  Create_Task_For_Request_Responce_Log_Download
);

export default router;
