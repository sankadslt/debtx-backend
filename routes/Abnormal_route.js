import { Router } from "express";
import {
  List_All_Withdrawal_Case_Logs,
  Task_for_Download_Withdrawals,
  Create_Withdraw_case,
} from "../controllers/Abnormal_controller.js";
import { Create_Abondoned_case } from "../controllers/Abnormal_controller.js";
import { Task_for_Download_Abondoned } from "../controllers/Abnormal_controller.js";
import { List_All_Abondoned_Case_Logs } from "../controllers/Abnormal_controller.js";

const router = Router();

/**
 * @swagger
 * /abnormal/List_All_Withdrawal_Case_Logs:
 *   post:
 *     summary: WD-1G01 Retrieve all withdrawal case logs
 *     description: |
 *       Returns a paginated list of withdrawal case logs with optional filtering based on `status`, `accountNumber`, and a `fromDate` to `toDate` range.
 *
 *       | Version | Date        | Description                                   | Changed By          |
 *       |---------|-------------|-----------------------------------------------|---------------------|
 *       | 01      | 2025-Jul-11 | Initial implementation of withdrawal log API  |                     |
 *
 *     tags: [Withdrawal Case Logs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: Case status filter (e.g., "approved", "pending").
 *                 example: "Pending Write Off"
 *               accountNumber:
 *                 type: string
 *                 description: Account number to filter.
 *                 example: "ACC12345"
 *               fromDate:
 *                 type: string
 *                 format: date
 *                 description: Filter start date (inclusive).
 *                 example: "2025-02-01"
 *               toDate:
 *                 type: string
 *                 format: date
 *                 description: Filter end date (inclusive).
 *                 example: "2025-07-10"
 *               page:
 *                 type: integer
 *                 description: Page number for pagination. First page returns 10 records, others return 30.
 *                 example: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved withdrawal case logs.
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
 *                   example: "Withdrawal cases retrieved successfully."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       caseId:
 *                         type: string
 *                         example: "20"
 *                       status:
 *                         type: string
 *                         example: "Pending Write Off"
 *                       accountNo:
 *                         type: string
 *                         example: "ACC12345"
 *                       amount:
 *                         type: number
 *                         example: 15000.75
 *                       remark:
 *                         type: string
 *                         example: "Manager approval granted"
 *                       withdrawBy:
 *                         type: string
 *                         example: "John Doe"
 *                       withdrawOn:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-07-09T10:30:00Z"
 *                       approvedOn:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-07-09T12:00:00Z"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 150
 *                     page:
 *                       type: integer
 *                       example: 2
 *                     pages:
 *                       type: integer
 *                       example: 5
 *                     limit:
 *                       type: integer
 *                       example: 30
 *       400:
 *         description: Invalid page number or bad request.
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
 *                   example: "Invalid page number"
 *       500:
 *         description: Internal server error while fetching data.
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
 *                       example: "Error stack trace or message"
 */

router.post("/List_All_Withdrawal_Case_Logs", List_All_Withdrawal_Case_Logs);
/**
 * @swagger
 * /api/abnormal/Task_for_Download_Withdrawals:
 *   post:
 *     summary: TSK-2P02 Create Task for Downloading Withdrawal Cases
 *     description: |
 *       Creates a background task to generate a downloadable list of withdrawal case logs based on filters like status, account number, and date range.
 *
 *       | Version | Date        | Description                                | Changed By       |
 *       |---------|-------------|--------------------------------------------|------------------|
 *       | 01      | 2025-Jul-11 | Initial implementation for download task   |                  |
 *
 *     tags: [Case Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Created_by
 *             properties:
 *               Created_by:
 *                 type: string
 *                 description: User ID who initiates the task.
 *                 example: "super@gmail.com"
 *               status:
 *                 type: string
 *                 description: Filter cases by status.
 *                 example: " "
 *               accountNumber:
 *                 type: string
 *                 description: Filter cases by account number.
 *                 example: "ACC12345"
 *               fromDate:
 *                 type: string
 *                 format: date
 *                 description: Filter cases from this date (inclusive).
 *                 example: "2025-02-01"
 *               toDate:
 *                 type: string
 *                 format: date
 *                 description: Filter cases until this date (inclusive).
 *                 example: "2025-07-10"
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
 *                       example: 100
 *                     task_type:
 *                       type: string
 *                       example: Download Withdrawal case list
 *                     Created_By:
 *                       type: string
 *                       example: "super@gmail.com"
 *                     status:
 *                       type: string
 *                       example: " "
 *                     accountNumber:
 *                       type: string
 *                       example: "ACC12345"
 *                     fromDate:
 *                       type: string
 *                       format: date
 *                       example: "2025-02-01"
 *                     toDate:
 *                       type: string
 *                       format: date
 *                       example: "2025-07-10"
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
 *                   example: Created_by is a required parameter.
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
 */

router.post("/Task_for_Download_Withdrawals", Task_for_Download_Withdrawals); 

/**
 * @swagger
 * /api/case/Withdraw_CasesOwened_By_DRC:
 *   post:
 *     summary: C-1P79 Withdraw cases owned by DRC
 *     description: |
 *       Submits a request to withdraw cases owned by the DRC, requiring approval.
 *       The request is logged and sent for manager approval.
 *
 *       | Version | Date        | Description                                      | Changed By |
 *       |---------|------------ |--------------------------------------------------|----------- |
 *       | 01      | 2025-Mar-30 | Initial implementation                           |            |
 *       | 02      | 2025-Apr-02 | Added new parameters and required validations    |            |
 *
 *     tags: [Case Management]
 *     parameters:
 *       - in: query
 *         name: approver_reference
 *         required: true
 *         schema:
 *           type: integer
 *           example: 7
 *         description: Unique reference number for approval.
 *       - in: query
 *         name: remark
 *         required: true
 *         schema:
 *           type: string
 *           example: "Withdraw"
 *         description: Remark when adding withdraw the case.
 *       - in: query
 *         name: remark_edit_by
 *         required: true
 *         schema:
 *           type: string
 *           example: "John"
 *         description: Person who added the remark.
 *       - in: query
 *         name: created_by
 *         required: true
 *         schema:
 *           type: string
 *           example: "Cena"
 *         description: Person who performed the action.
 *       - in: query
 *         name: approved_deligated_by
 *         schema:
 *           type: string
 *           example: "Manager123"
 *         description: ID of the delegated approver.
 *       - in: query
 *         name: approve_status
 *         schema:
 *           type: string
 *           example: "Pending Case Withdrawal"
 *         description: Status of the approval request.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - approver_reference
 *               - remark
 *               - remark_edit_by
 *               - created_by
 *               - approved_deligated_by
 *             properties:
 *               approver_reference:
 *                 type: integer
 *                 example: 444
 *                 description: Unique reference number for approval.
 *               remark:
 *                 type: string
 *                 example: "Requesting case withdrawal approval"
 *                 description: Remarks for the withdrawal request.
 *               remark_edit_by:
 *                 type: string
 *                 example: "AdminUser"
 *                 description: User editing the remark.
 *               created_by:
 *                 type: string
 *                 example: "JohnDoe"
 *                 description: User who created the request.
 *               approved_deligated_by:
 *                 type: string
 *                 example: "Manager123"
 *                 description: The delegated approver.
 *               approve_status:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "Pending Case Withdrawal"
 *                     status_date:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-03-30T08:02:38.990Z"
 *                     status_edit_by:
 *                       type: string
 *                       example: "JohnDoe"
 *     responses:
 *       201:
 *         description: Case withdrawal request successfully added.
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
 *                     doc_version:
 *                       type: integer
 *                       example: 1
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
 *                             example: "2025-03-30T08:02:38.990Z"
 *                           status_edit_by:
 *                             type: string
 *                             example: "JohnDoe"
 *                     approver_type:
 *                       type: string
 *                       example: "Case Withdrawal Approval"
 *                     approved_deligated_by:
 *                       type: string
 *                       example: "Manager123"
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
 *                             example: "2025-03-30T08:02:38.990Z"
 *                           remark_edit_by:
 *                             type: string
 *                             example: "AdminUser"
 *                     created_on:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-03-30T08:02:39.381Z"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-03-30T08:02:39.386Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-03-30T08:02:39.386Z"
 *       400:
 *         description: Validation error due to missing required parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "All required fields must be provided."
 *       500:
 *         description: Internal server error due to database or application failure.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 */

router.post("/Create_Withdraw_case", Create_Withdraw_case);

router.post("/List_All_Abondoned_Case_Logs", List_All_Abondoned_Case_Logs);

router.post("/Task_for_Download_Abondoned", Task_for_Download_Abondoned);

router.post("/Create_Abondoned_case", Create_Abondoned_case);
export default router;
