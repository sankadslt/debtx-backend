/* 
    Purpose: This template is used for the Litigation Routes.
    Created Date: 2025-04-01
    Created By: Sasindu Srinayaka (sasindusrinayaka@gmail.com) 
    Last Modified Date:
    Modified By:  
    Version: Node.js v20.11.1
    Dependencies: express
    Related Files: Litigation_controller.js
    Notes:  
*/

import { Router } from "express";

import { 
    ListAllLitigationCases,
    createLitigationDocument,
    createLegalSubmission,
    listLitigationPhaseCaseDetails,
    createLegalDetails,
    createLegalFail,
    listLitigationPhaseCaseSettlementAndPaymentDetails,
 } from "../controllers/Litigation_controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Litigation
 *     description: Endpoints for retrieving litigation cases with filters and pagination.
 *
 * /api/litigation/ListAllLitigationCases:
 *   post:
 *     summary: Retrieve filtered and paginated list of litigation-phase cases.
 *     description: |
 *       This endpoint allows querying litigation cases by status, settlement date, or legal submission date.
 *       It also supports pagination: the first page returns 10 results, subsequent pages return 30.
 *
 *       | Version | Date       | Description                               | Changed By         |
 *       |---------|------------|-------------------------------------------|--------------------|
 *       | 01      | 2025-Apr-30| Paginated & filtered litigation case list | Sasindu Srinayaka  |
 *     tags:
 *       - Litigation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               case_current_status:
 *                 type: string
 *                 description: Filter by specific litigation case status.
 *                 example: "Litigation"
 *               date_type:
 *                 type: string
 *                 enum: [Settlement created dtm, legal accepted date]
 *                 description: Type of date to filter by.
 *                 example: "Settlement created dtm"
 *               from_date:
 *                 type: string
 *                 format: date
 *                 description: Start date for filtering based on date_type.
 *                 example: "2025-01-01"
 *               to_date:
 *                 type: string
 *                 format: date
 *                 description: End date for filtering based on date_type.
 *                 example: "2025-01-31"
 *               pages:
 *                 type: integer
 *                 description: Page number for pagination. First page returns 10 results, next pages return 30.
 *                 example: 1
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
 *                 current_page:
 *                   type: integer
 *                   example: 1
 *                 total_cases:
 *                   type: integer
 *                   example: 57
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       case_id:
 *                         type: integer
 *                         example: 101
 *                       status:
 *                         type: string
 *                         example: Litigation
 *                       account_no:
 *                         type: string
 *                         example: "ACC2023105"
 *                       current_arreas_amount:
 *                         type: number
 *                         example: 12450.75
 *                       legal_accepted_date:
 *                         type: string
 *                         format: date
 *                         example: "2025-01-15"
 *                       settlement_created_date:
 *                         type: string
 *                         format: date
 *                         example: "2025-02-01"
 *       400:
 *         description: Invalid input or filter conditions.
 *       404:
 *         description: No matching cases found for given criteria.
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
 *         description: Server error during case retrieval.
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
 *                       example: Internal server error.
 */
router.post( "/List_All_Litigation_Cases", ListAllLitigationCases );

/**
 * @swagger
 * tags:
 *   - name: Litigation
 *     description: Endpoints for managing litigation support documentation.
 *
 * /api/litigation/createLitigationDocument:
 *   post:
 *     summary: Create litigation support documents for RTOM and DRC.
 *     description: |
 *       This endpoint records supporting documentation details for a litigation-phase case.
 *       It stores RTOM and DRC file statuses and page counts under the case's litigation record.
 *
 *       | Version | Date       | Description                          | Changed By         |
 *       |---------|------------|--------------------------------------|--------------------|
 *       | 01      | 2025-Apr-30| Create litigation document endpoint  | Sasindu Srinayaka  |
 *     tags:
 *       - Litigation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - case_id
 *               - rtom_customer_file_status
 *               - rtom_file_status_by
 *               - drc_file_status
 *               - drc_file_status_by
 *             properties:
 *               case_id:
 *                 type: integer
 *                 description: ID of the case.
 *                 example: 101
 *               rtom_customer_file_status:
 *                 type: string
 *                 description: File status recorded by RTOM.
 *                 example: "Submitted"
 *               rtom_file_status_by:
 *                 type: string
 *                 description: User or officer who updated RTOM file status.
 *                 example: "RTOM Officer"
 *               rtom_pages_count:
 *                 type: integer
 *                 description: Number of pages in RTOM documentation.
 *                 example: 25
 *               drc_file_status:
 *                 type: string
 *                 description: File status recorded by DRC.
 *                 example: "Reviewed"
 *               drc_file_status_by:
 *                 type: string
 *                 description: User or officer who updated DRC file status.
 *                 example: "DRC Clerk"
 *               drc_pages_count:
 *                 type: integer
 *                 description: Number of pages in DRC documentation.
 *                 example: 18
 *     responses:
 *       200:
 *         description: Litigation document created successfully.
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
 *                   example: Litigation document created successfully.
 *                 data:
 *                   type: object
 *       400:
 *         description: Missing required fields in the request body.
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
 *                   example: Missing required fields.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     description:
 *                       type: string
 *                       example: case_id, rtom_customer_file_status, drc_file_status, rtom_file_status_by, drc_file_status_by are required.
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
 *                   example: Case not found.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 404
 *                     description:
 *                       type: string
 *                       example: No case found with case_id 101.
 *       500:
 *         description: Internal server error occurred.
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
 *                   example: An error occurred while creating the litigation document.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: Internal server error.
 */
router.patch( "/Create_Litigation_Document", createLitigationDocument );

/**
 * @swagger
 * tags:
 *   - name: Litigation
 *     description: Endpoints for managing legal submissions in litigation cases.
 *
 * /api/litigation/createLegalSubmission:
 *   post:
 *     summary: Create and record a legal submission for a case.
 *     description: |
 *       This endpoint allows users to submit legal documents or notes tied to a specific case. 
 *       It updates the case's litigation record and advances the case status to "Forward To Litigation".
 *
 *       | Version | Date       | Description                          | Changed By         |
 *       |---------|------------|--------------------------------------|--------------------|
 *       | 01      | 2025-Apr-30| Created legal submission endpoint    | Sasindu Srinayaka  |
 *     tags:
 *       - Litigation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - case_id
 *               - submission
 *               - submission_on
 *               - submission_by
 *               - submission_remark
 *             properties:
 *               case_id:
 *                 type: integer
 *                 description: ID of the case to which the legal submission applies.
 *                 example: 123
 *               submission:
 *                 type: string
 *                 description: The content or title of the legal submission.
 *                 example: "Initial Petition Filed"
 *               submission_on:
 *                 type: string
 *                 format: date
 *                 description: Date of submission.
 *                 example: "2025-04-30"
 *               submission_by:
 *                 type: string
 *                 description: The person or officer who submitted the document.
 *                 example: "Legal Officer A"
 *               submission_remark:
 *                 type: string
 *                 description: Additional notes or remarks regarding the submission.
 *                 example: "Attached affidavit with the petition"
 *     responses:
 *       200:
 *         description: Legal submission successfully recorded.
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
 *                   example: Litigation document updated successfully.
 *                 data:
 *                   type: object
 *       400:
 *         description: Missing required fields in the request body.
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
 *                   example: Missing required fields.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     description:
 *                       type: string
 *                       example: case_id, submission, submission_on, submission_by, submission_remark are required.
 *       404:
 *         description: Case not found for the given case_id.
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
 *                       example: No case found with case_id 123.
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
 *                   example: An error occurred while updating the litigation document.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: Internal server error.
 */
router.patch( "/Create_Legal_Submission", createLegalSubmission );

/**
 * @swagger
 * tags:
 *   - name: Litigation
 *     description: Endpoints for retrieving litigation-phase case details.
 *
 * /api/litigation/listLitigationPhaseCaseDetails:
 *   post:
 *     summary: Retrieve case details for a specific litigation-phase case.
 *     description: |
 *       This endpoint retrieves the basic case details including arrears amount, 
 *       last payment date, and associated legal records such as legal submissions and legal details.
 *
 *       | Version | Date       | Description                             | Changed By         |
 *       |---------|------------|-----------------------------------------|--------------------|
 *       | 01      | 2025-Apr-30| Retrieve litigation phase case overview | Sasindu Srinayaka  |
 *     tags:
 *       - Litigation
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
 *                 type: integer
 *                 description: Unique identifier for the case.
 *                 example: 123
 *     responses:
 *       200:
 *         description: Litigation phase case details retrieved successfully.
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
 *                   example: Litigation phase case details retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     case_id:
 *                       type: integer
 *                       example: 123
 *                     account_no:
 *                       type: string
 *                       example: "AC987654321"
 *                     customer_ref:
 *                       type: string
 *                       example: "CUST-001"
 *                     current_arrears_amount:
 *                       type: number
 *                       example: 52000.75
 *                     last_payment_date:
 *                       type: string
 *                       format: date
 *                       example: "2025-03-15"
 *                     litigation:
 *                       type: object
 *                       properties:
 *                         legal_submission:
 *                           type: array
 *                           items:
 *                             type: object
 *                             description: Historical legal submissions.
 *                         legal_details:
 *                           type: array
 *                           items:
 *                             type: object
 *                             description: Legal details associated with the case.
 *       400:
 *         description: Validation error - Missing required field.
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
 *                   example: Missing required field case_id.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     description:
 *                       type: string
 *                       example: case_id is required.
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
 *                   example: Case not found.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 404
 *                     description:
 *                       type: string
 *                       example: No case found with case_id 123.
 *       500:
 *         description: Internal server error occurred.
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
 *                   example: An error occurred while retrieving litigation phase case details.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: Internal server error.
 */
router.post( "/List_Litigation_Phase_Case_Details_By_Case_ID", listLitigationPhaseCaseDetails);

/**
 * @swagger
 * tags:
 *   - name: Litigation
 *     description: Endpoints related to legal and litigation details of cases.
 *
 * /api/litigation/createLegalDetails:
 *   post:
 *     summary: Create legal details and update case status to Litigation.
 *     description: |
 *       Adds new legal details to an existing case and updates the case's status to "Litigation".
 *
 *       | Version | Date       | Description                       | Changed By         |
 *       |---------|------------|-----------------------------------|--------------------|
 *       | 01      | 2025-Apr-30| Created legal details for a case | Sasindu Srinayaka  |
 *     tags:
 *       - Litigation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - case_id
 *               - court_no
 *               - case_handling_officer
 *               - remark
 *               - created_by
 *             properties:
 *               case_id:
 *                 type: integer
 *                 description: ID of the case to be updated.
 *                 example: 123
 *               court_no:
 *                 type: string
 *                 description: Court number where the case is filed.
 *                 example: "Court-05"
 *               case_handling_officer:
 *                 type: string
 *                 description: Name of the officer handling the case.
 *                 example: "John Doe"
 *               remark:
 *                 type: string
 *                 description: Remarks or comments regarding the case.
 *                 example: "Filed with supporting documents"
 *               created_by:
 *                 type: string
 *                 description: Username of the creator.
 *                 example: "admin_user"
 *     responses:
 *       200:
 *         description: Legal details added successfully.
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
 *                   example: Legal details added successfully.
 *                 data:
 *                   type: object
 *       400:
 *         description: Missing required fields.
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
 *                   example: Missing required fields.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     description:
 *                       type: string
 *                       example: case_id, court_no, case_handling_officer, remark, and created_by are required.
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
 *                   example: Case not found.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 404
 *                     description:
 *                       type: string
 *                       example: No case found with case_id 123.
 *       500:
 *         description: Internal server error occurred.
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
 *                   example: An error occurred while creating legal details.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: [Actual error message]
 */
router.patch( "/Create_Legal_Details_By_Case_ID", createLegalDetails );

router.patch( "/Create_Legal_Fail_By_case_ID", createLegalFail );

/**
 * @swagger
 * tags:
 *   - name: Case Management
 *     description: Endpoints for retrieving litigation-phase case details.
 *
 * /api/case/List_Litigation_Phase_Case_Details:
 *   post:
 *     summary: Retrieve settlement and payment details for a litigation-phase case.
 *     description: |
 *       This endpoint retrieves both the case settlement and case payment details 
 *       related to the litigation phase for the specified case ID.
 *
 *       | Version | Date       | Description                                 | Changed By         |
 *       |---------|------------|---------------------------------------------|--------------------|
 *       | 01      | 2025-Feb-10| Litigation phase case financial data lookup | Sasindu Srinayaka  |
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
 *                 example: 101
 *     responses:
 *       200:
 *         description: Litigation phase case details retrieved successfully.
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
 *                   example: Litigation phase case details retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     caseSettlement:
 *                       type: object
 *                       properties:
 *                         settlement_plan:
 *                           type: string
 *                           example: "Standard"
 *                         last_monitoring_dtm:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-01-31T00:00:00Z"
 *                     casePayment:
 *                       type: object
 *                       properties:
 *                         money_transaction_type:
 *                           type: string
 *                           example: "Installment"
 *                         money_transaction_amount:
 *                           type: number
 *                           example: 15000.00
 *                         money_transaction_date:
 *                           type: string
 *                           format: date
 *                           example: "2025-01-25"
 *                         installment_seq:
 *                           type: integer
 *                           example: 3
 *                         cummilative_settled_balance:
 *                           type: number
 *                           example: 45000.00
 *                         created_dtm:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-01-25T10:30:00Z"
 *       400:
 *         description: Missing required case_id.
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
 *                   example: Missing required case_id.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     description:
 *                       type: string
 *                       example: case_id is required.
 *       404:
 *         description: No settlement or payment data found for the given case_id.
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
 *                   example: Case Settlement not found.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 404
 *                     description:
 *                       type: string
 *                       example: No case found with case_id 101.
 *       500:
 *         description: Internal server error occurred while fetching details.
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
 *                   example: An error occurred while retrieving litigation phase case details.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: Internal server error.
 */
router.post( "/List_Lit_Phase_Case_settlement_and_payment_Details_By_Case_ID", listLitigationPhaseCaseSettlementAndPaymentDetails);

export default router;
