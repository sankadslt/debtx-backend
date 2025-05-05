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


router.post( "/List_All_Litigation_Cases", ListAllLitigationCases );

/**
 * @swagger
 * tags:
 *   - name: Case Litigation
 *     description: Endpoints for managing litigation documents.
 *
 * /api/litigation/Create_Litigation_Document:
 *   patch:
 *     summary: Create litigation documents for RTOM and DRC
 *     description: |
 *       Adds RTOM and DRC document status entries to an existing litigation case. 
 *       Updates the case status to `Pending FTL` if required statuses are met.
 *
 *       | Version | Date       | Description                                | Changed By         |
 *       |---------|------------|--------------------------------------------|--------------------|
 *       | 1.0     | 2025-04-30 | Initial version of litigation doc API      | Sasindu Srinayaka  |
 *     tags:
 *       - Case Litigation
 *     parameters:
 *      - in: query
 *        name: case_id
 *        required: true
 *        schema:
 *          type: integer
 *          example: 1
 *          description: Unique identifier for the case.
 *      - in: query
 *        name: rtom_customer_file_status
 *        required: true
 *        schema:
 *         type: string
 *         enum: [Collected, Without Agreement, Not Collected]
 *         example: Collected
 *         description: Status of the RTOM customer file.
 *      - in: query
 *        name: rtom_file_status_by
 *        required: true
 *        schema:
 *         type: string
 *         example: "admin123"
 *         description: User who collected the RTOM customer file.
 *      - in: query
 *        name: rtom_pages_count
 *        required: false
 *        schema:
 *          type: integer
 *          example: 12
 *          description: Number of pages in the RTOM customer file.
 *      - in: query
 *        name: drc_file_status
 *        required: true
 *        schema:
 *         type: string
 *         enum: [Collected, Not Collected]
 *         example: Collected
 *         description: Status of the DRC file.
 *      - in: query
 *        name: drc_file_status_by
 *        required: true
 *        schema:
 *         type: string
 *         example: "admin456"
 *         description: User who collected the DRC file.
 *      - in: query
 *        name: drc_pages_count
 *        required: false
 *        schema:
 *          type: integer
 *          example: 8
 *          description: Number of pages in the DRC file.
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
 *                 example: 103
 *               rtom_customer_file_status:
 *                 type: string
 *                 enum: [Collected, Without Agreement, Not Collected]
 *                 example: Collected
 *               rtom_file_status_by:
 *                 type: string
 *                 example: "admin123"
 *               rtom_pages_count:
 *                 type: integer
 *                 example: 12
 *               drc_file_status:
 *                 type: string
 *                 enum: [Collected, Not Collected]
 *                 example: Collected
 *               drc_file_status_by:
 *                 type: string
 *                 example: "admin456"
 *               drc_pages_count:
 *                 type: integer
 *                 example: 8
 *     responses:
 *       200:
 *         description: Documents created and case updated successfully.
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
 *                   description: Updated case object
 *       400:
 *         description: Required fields missing or malformed input.
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
 *         description: Case not found with the given case_id.
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
 *                       example: No case found with case_id 103.
 *       500:
 *         description: Internal error during litigation document creation.
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
 *                       example: Internal server error message.
 */
router.patch( "/Create_Litigation_Document", createLitigationDocument );

/**
 * @swagger
 * tags:
 *   - name: Case Litigation
 *     description: Endpoints for managing litigation submissions.
 *
 * /api/litigation/Create_Legal_Submission:
 *   post:
 *     summary: Add a new legal submission to an existing litigation case
 *     description: |
 *       Records a new legal submission for a case and updates its current status based on the outcome.
 *
 *       | Version | Date       | Description                                | Changed By         |
 *       |---------|------------|--------------------------------------------|--------------------|
 *       | 1.0     | 2025-04-30 | Initial version for legal submission API   | Sasindu Srinayaka  |
 *     tags:
 *       - Case Litigation
 *     parameters:
 *       - in: query
 *         name: case_id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *           description: Unique identifier for the case. 
 *       - in: query
 *         name: submission
 *         required: true
 *         schema:
 *           type: string
 *           enum: [legal Accepted, legal Rejected]
 *           example: legal Accepted
 *           description: Outcome of the legal review.
 *       - in: query
 *         name: submission_by
 *         required: true
 *         schema:
 *           type: string
 *           example: "adminUser123"
 *           description: Identifier of the user making the submission.
 *       - in: query
 *         name: submission_remark
 *         required: true
 *         schema:
 *           type: string
 *           example: "Document reviewed and accepted"
 *           description: Remarks or comments regarding the submission.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - case_id
 *               - submission
 *               - submission_by
 *               - submission_remark
 *             properties:
 *               case_id:
 *                 type: integer
 *                 example: 103
 *               submission:
 *                 type: string
 *                 enum: [legal Accepted, legal Rejected]
 *                 example: legal Accepted
 *               submission_by:
 *                 type: string
 *                 example: "adminUser123"
 *               submission_remark:
 *                 type: string
 *                 example: "Document reviewed and accepted"
 *     responses:
 *       200:
 *         description: Submission added and case status updated successfully.
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
 *                   description: Updated litigation case object
 *       400:
 *         description: Missing or invalid input fields.
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
 *                       example: case_id, submission, submission_by, submission_remark are required.
 *       404:
 *         description: No case found with the provided case_id.
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
 *                       example: No case found with case_id 103.
 *       500:
 *         description: Internal error while processing the submission.
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
 *                       example: Internal server error message.
 */
router.patch( "/Create_Legal_Submission", createLegalSubmission );

/**
 * @swagger
 * tags:
 *   - name: Case Litigation
 *     description: Endpoints for retrieving litigation-phase legal case details.
 *
 * /api/litigation/List_Litigation_Phase_Case_Details_By_Case_ID:
 *   post:
 *     summary: Retrieve details of a case in litigation phase.
 *     description: |
 *       Fetches case information and legal records under the litigation phase.
 *
 *       | Version | Date       | Description                               | Changed By         |
 *       |---------|------------|-------------------------------------------|--------------------|
 *       | 1.0     | 2025-04-30 | Initial version for case details listing  | Sasindu Srinayaka  |
 *     tags:
 *       - Case Litigation
 *     parameters:
 *       - in: query
 *         name: case_id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *           description: Unique identifier for the case.
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
 *                 example: 1
 *                 description: Unique ID of the litigation case.
 *     responses:
 *       200:
 *         description: Case details found and returned successfully.
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
 *                       example: 103
 *                     account_no:
 *                       type: string
 *                       example: "ACCT-2023-7765"
 *                     customer_ref:
 *                       type: string
 *                       example: "CUS-REF-9876"
 *                     current_arrears_amount:
 *                       type: number
 *                       format: float
 *                       example: 45000.75
 *                     last_payment_date:
 *                       type: string
 *                       format: date
 *                       example: "2025-03-20"
 *                     litigation:
 *                       type: object
 *                       properties:
 *                         legal_submission:
 *                           type: array
 *                           items:
 *                             type: object
 *                         legal_details:
 *                           type: array
 *                           items:
 *                             type: object
 *       400:
 *         description: Request is missing the case_id.
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
 *                   example: Missing required field.
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
 *         description: No case found for the given case_id.
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
 *                       example: No case found with case_id 103.
 *       500:
 *         description: Internal error during data fetch.
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
 *                       example: Internal server error message.
 */
router.post( "/List_Litigation_Phase_Case_Details_By_Case_ID", listLitigationPhaseCaseDetails);

/**
 * @swagger
 * tags:
 *   - name: Case Litigation
 *     description: Endpoints for managing litigation legal details.
 *
 * /api/litigation/Create_Legal_Details_By_Case_ID:
 *   patch:
 *     summary: Add legal registration details to a case.
 *     description: |
 *       Adds court and litigation legal detail to a case, including court number, registration date, 
 *       officer handling, and logs it under case_status and legal_details.
 *
 *       | Version | Date       | Description                      | Changed By         |
 *       |---------|------------|----------------------------------|--------------------|
 *       | 1.0     | 2025-05-03 | Initial creation of legal entry  | Sasindu Srinayaka  |
 *     tags:
 *       - Case Litigation
 *     parameters:
 *       - in: query
 *         name: case_id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *           description: Unique identifier for the case.
 *       - in: query
 *         name: court_no
 *         required: true
 *         schema:
 *          type: string
 *          example: "CIVIL-4567"
 *          description: Official court number.
 *       - in: query
 *         name: court_register_dtm
 *         required: true
 *         schema:
 *          type: string
 *          format: date-time
 *          example: "2025-04-29T10:00:00Z"
 *          description: Court registration datetime.
 *       - in: query
 *         name: case_handling_officer
 *         required: true
 *         schema:
 *          type: string
 *          example: "Officer Jayasinghe"
 *          description: Officer assigned to the case.
 *       - in: query
 *         name: remark
 *         required: false
 *         schema:
 *          type: string
 *          example: "Court registered successfully."
 *          description: Remark describing current status or reason.
 *       - in: query
 *         name: created_by
 *         required: true
 *         schema:
 *          type: integer
 *          example: 7
 *          description: ID of user creating the entry.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - case_id
 *               - court_no
 *               - court_register_dtm
 *               - case_handling_officer
 *               - remark
 *               - created_by
 *             properties:
 *               case_id:
 *                 type: integer
 *                 example: 102
 *                 description: Unique identifier for the case.
 *               court_no:
 *                 type: string
 *                 example: "CIVIL-4567"
 *                 description: Official court number.
 *               court_register_dtm:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-04-29T10:00:00Z"
 *                 description: Court registration datetime.
 *               case_handling_officer:
 *                 type: string
 *                 example: "Officer Jayasinghe"
 *                 description: Officer assigned to the case.
 *               remark:
 *                 type: string
 *                 example: "Court registered successfully."
 *                 description: Remark describing current status or reason.
 *               created_by:
 *                 type: integer
 *                 example: 7
 *                 description: ID of user creating the entry.
 *     responses:
 *       200:
 *         description: Legal details added successfully to case.
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
 *                   description: The updated case document.
 *       400:
 *         description: Required fields missing in request.
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
 *                       example: case_id, court_no, court_register_dtm, etc. are required.
 *       404:
 *         description: Case not found in the database.
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
 *                       example: No case found with case_id 102.
 *       500:
 *         description: Internal server error while saving details.
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
 *                       example: Internal DB transaction error.
 */
router.patch( "/Create_Legal_Details_By_Case_ID", createLegalDetails );

/**
 * @swagger
 * tags:
 *   - name: Case Litigation
 *     description: Endpoints for handling legal status changes.
 *
 * /api/litigation/Create_Legal_Fail_By_case_ID:
 *   patch:
 *     summary: Create legal failure and trigger write-off approval.
 *     description: |
 *       Records a legal fail action, updates case litigation details, initiates a write-off approval flow, 
 *       and logs user interaction.
 *
 *       | Version | Date       | Description                          | Changed By         |
 *       |---------|------------|--------------------------------------|--------------------|
 *       | 1.0     | 2025-05-03 | Initial legal fail and approval flow | Sasindu Srinayaka  |
 *     tags:
 *       - Case Litigation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - case_id
 *               - remark
 *               - created_by
 *             properties:
 *               case_id:
 *                 type: integer
 *                 example: 1
 *                 description: Unique identifier for the case.
 *               remark:
 *                 type: string
 *                 example: "Debtor unreachable after repeated attempts."
 *                 description: Legal action remark.
 *               created_by:
 *                 type: integer
 *                 example: 5
 *                 description: User ID of the creator.
 *     parameters:
 *       - in: query
 *         name: case_id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *           description: Unique identifier for the case.
 *       - in: query
 *         name: remark
 *         required: true
 *         schema:
 *          type: string
 *          example: "Debtor unreachable after repeated attempts."
 *          description: Legal action remark.
 *       - in: query
 *         name: created_by
 *         required: true
 *         schema:
 *          type: integer
 *          example: 5
 *          description: User ID of the creator.
 *     responses:
 *       200:
 *         description: Legal fail recorded and write-off approval initiated.
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
 *                   properties:
 *                     updatedCase:
 *                       type: object
 *                       description: Case document after litigation status update.
 *                     newTempApprover:
 *                       type: object
 *                       description: New TemplateForwardedApprover document created.
 *                     interactionResult:
 *                       type: object
 *                       description: User interaction log result.
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
 *                       example: case_id, remark are required.
 *       404:
 *         description: Case or user not found.
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
 *                   example: Failed to update temporary approver.
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
 *         description: Server error while updating legal status.
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
 *                       example: Failed to resolve delegated user_id.
 */
router.patch( "/Create_Legal_Fail_By_case_ID", createLegalFail );

/**
 * @swagger
 * tags:
 *   - name: Case Litigation
 *     description: Endpoints for litigation-phase case financial details.
 *
 * /api/litigation/List_Lit_Phase_Case_settlement_and_payment_Details_By_Case_ID:
 *   post:
 *     summary: Get litigation-phase settlement and payment details.
 *     description: |
 *       Returns settlement and payment data (if available) for a given case ID 
 *       during the litigation phase.
 *
 *       | Version | Date       | Description                                 | Changed By         |
 *       |---------|------------|---------------------------------------------|--------------------|
 *       | 01      | 2025-05-03 | Parallel fetch of settlement & payment data | Sasindu Srinayaka  |
 *     tags:
 *       - Case Litigation
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
 *                 example: 1
 *                 description: Unique identifier for the case.
 *     parameters:
 *     - name: case_id
 *       in: query
 *       required: true
 *       description: Unique identifier for the case.
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
 *                   example: Litigation phase case details retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     settlementData:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         settlement_plan:
 *                           type: string
 *                           example: "Standard Plan"
 *                         last_monitoring_dtm:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-01-31T00:00:00Z"
 *                     paymentData:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         transaction_type:
 *                           type: string
 *                           example: "Installment"
 *                         money_transaction_amount:
 *                           type: number
 *                           format: float
 *                           example: 25000.00
 *                         money_transaction_date:
 *                           type: string
 *                           format: date
 *                           example: "2025-04-01"
 *                         installment_seq:
 *                           type: integer
 *                           example: 2
 *                         cummulative_settled_balance:
 *                           type: number
 *                           format: float
 *                           example: 50000.00
 *                         created_dtm:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-04-01T14:45:00Z"
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
 *                   example: Missing required field.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     description:
 *                       type: string
 *                       example: case_id is required.
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
