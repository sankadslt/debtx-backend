/* 
    Purpose: This template is used for the FTL LOD Route.
    Created Date: 2025-04-03
    Created By:  Dinusha Anupama (dinushanupama@gmail.com)
    Last Modified Date: 2025-04-01
    Modified By: Dinusha Anupama (dinushanupama@gmail.com)
    Version: Node.js v20.11.1
    Dependencies: axios , mongoose
    Related Files: FTL_controller.js
    Notes:  
*/

import { Router } from "express";
const router = Router();

import { Retrive_logic} from "../controllers/FTL_LOD_controller.js";
import { List_FTL_LOD_Cases} from "../controllers/FTL_LOD_controller.js";
import { Create_Customer_Response} from "../controllers/FTL_LOD_controller.js";
import { FLT_LOD_Case_Details} from "../controllers/FTL_LOD_controller.js";
import { Create_FLT_LOD} from "../controllers/FTL_LOD_controller.js";
import { Case_Details_Settlement_LOD_FTL_LOD} from "../controllers/FTL_LOD_controller.js";



router.post("/Retrive_logic", Retrive_logic);

/**
 * @swagger
 * /api/ftl_lod/List_FTL_LOD_Cases:
 *   post:
 *     summary: FLT-1P01 Retrieve a paginated list of FTL LOD cases with filters
 *     description: |
 *       Fetches FTL LOD case details based on filters such as case status, arrears band, and date range.
 *       It also returns the filtered case data including relevant details such as account number, arrears amount, and FTL LOD expiry date.
 *
 *       | Version | Date        | Description                                        | Changed By       |
 *       |---------|-------------|----------------------------------------------------|------------------|
 *       | 01      | 2025-April-06 | Initial creation of API for case retrieval         | Dinusha Anupama   |
 *
 *     tags: [FTL LOD Cases]
 *     parameters:
 *       - in: query
 *         name: case_current_status
 *         schema:
 *           type: String
 *           example: "Pending FTL LOD"
 *         description: Filter by the case current status
 *       - in: query
 *         name: current_arrears_band
 *         schema:
 *           type: String
 *           example: "AB-10_25"
 *         description: Filter by current arrears band.
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: date
 *           example: "2024-03-01"
 *         description: Start date for filtering logs
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: date
 *           example: "2024-03-31"
 *         description: End date for filtering logs
 *       - in: query
 *         name: pages
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number for pagination
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               case_current_status:
 *                 type: string
 *                 enum: [Pending FTL LOD, Initial FLT LOD, FTL LOD Settle Pending, FTL LOD Settle Open-Pending, FTL LOD Settle Active]
 *                 description: Filter by the case current status
 *               current_arrears_band:
 *                 type: string
 *                 example: AB-10_25
 *                 description: Filter by current arrears band
 *               date_from:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-03-01T00:00:00Z"
 *                 description: Start date for filtering logs
 *               date_to:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-03-31T23:59:59Z"
 *                 description: End date for filtering logs
 *               pages:
 *                 type: integer
 *                 example: 1
 *                 description: Page number for pagination
 *     responses:
 *       200:
 *         description: Successfully retrieved FTL LOD cases
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
 *                   example: "FTL LOD cases retrieved successfully."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       case_id:
 *                         type: integer
 *                         example: 1524
 *                       account_no:
 *                         type: string
 *                         example: ACC123456
 *                       current_arrears_amount:
 *                         type: number
 *                         example: 5200
 *                       case_current_status:
 *                         type: string
 *                         example: "Pending FTL LOD"
 *                       ftl_lod:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             expire_date:
 *                               type: string
 *                               format: date-time
 *                               example: "2024-06-01T00:00:00Z"
 *       400:
 *         description: Invalid case_current_status or other invalid filters
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
 *                   example: "Invalid case_current_status value."
 *       500:
 *         description: Internal server error due to database or application failure
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
 *                   example: "Internal Server Error"
 */

router.post("/List_FTL_LOD_Cases", List_FTL_LOD_Cases);

/**
 * @swagger
 * /api/ftl_lod/Create_Customer_Response:
 *   post:
 *     summary:  FLT-1P04 Create a customer response for a given case
 *     description: |
 *       Adds a new customer response for the given case. The `case_id`, `created_by`, and `response` are required fields. 
 *       If the `case_id` is valid and contains an FTL LOD entry, the response will be added to the corresponding case. 
 *       The response will include a unique sequence number (`response_seq`).
 *       
 *       | Version | Date        | Description                                        | Changed By       |
 *       |---------|-------------|----------------------------------------------------|------------------|
 *       | 01      | 2025-April-06 | Initial creation of API for adding customer response | Dinusha Anupama   |
 *
 *     tags: [FTL LOD Cases]
 *     parameters:
 *       - in: query
 *         name: case_id
 *         schema:
 *           type: integer
 *           example: 1510
 *         description: The ID of the case the response is associated with.
 *       - in: query
 *         name: created_by
 *         schema:
 *           type: String
 *           example: "manager"
 *         description: The user who created the response.
 *       - in: query
 *         name: response
 *         schema:
 *           type: String
 *           example: "Acknowledged the letter"
 *         description: The actual response to the case
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - case_id
 *               - created_by
 *               - response
 *             properties:
 *               case_id:
 *                 type: integer
 *                 description: The ID of the case the response is associated with.
 *                 example: 1510
 *               created_by:
 *                 type: string
 *                 description: The user who created the response.
 *                 example: "manager1"
 *               response:
 *                 type: string
 *                 description: The actual response to the case.
 *                 example: "Acknowledged the letter"
 *     responses:
 *       200:
 *         description: Customer response added successfully
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
 *                   example: "Customer response added successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     response_seq:
 *                       type: integer
 *                       example: 3
 *                     created_by:
 *                       type: string
 *                       example: "manager1"
 *                     created_on:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-04-06T06:54:51.825Z"
 *                     response:
 *                       type: string
 *                       example: "Acknowledged the letter"
 *       400:
 *         description: Missing required fields or invalid request
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
 *                   example: "case_id, created_by, and response are required."
 *       404:
 *         description: Case not found or FTL LOD not found for the case
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
 *                   example: "FTL LOD not found for this case."
 *       500:
 *         description: Internal server error
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

router.post("/Create_Customer_Response", Create_Customer_Response);

/**
 * @swagger
 * /api/ftl_lod/FLT_LOD_Case_Details:
 *   post:
 *     summary: FLT-1P04 Retrieve full FLT LOD case details
 *     description: |
 *       Returns complete FLT LOD case details based on the provided `case_id`. 
 *       Includes customer details, arrears band, RTOM, area, and matched event sources.
 *
 *       | Version | Date         | Description                                | Changed By       |
 *       |---------|--------------|--------------------------------------------|------------------|
 *       | 01      | 2025-April-22 | Initial creation of FLT LOD case details API | Dinusha Anupama   |
 *
 *     tags: [FTL LOD Cases]
 *     parameters:
 *       - in: query
 *         name: case_id
 *         schema:
 *           type: integer
 *           example: 1510
 *         description: The ID of the case the response is associated with.
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
 *                 description: Unique case ID to fetch FLT LOD case details
 *                 example: 1510
 *     responses:
 *       200:
 *         description: Successfully retrieved case details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 account_no:
 *                   type: string
 *                   example: "ACC123456"
 *                 current_arrears_band:
 *                   type: string
 *                   example: "AB-10_25"
 *                 rtom:
 *                   type: string
 *                   example: "RTOM1"
 *                 area:
 *                   type: string
 *                   example: "AREA51"
 *                 incident_id:
 *                   type: string
 *                   example: "INC987654"
 *                 customer_name:
 *                   type: string
 *                   example: "John Doe"
 *                 full_address:
 *                   type: string
 *                   example: "1234 Galaxy Way, Milky Way"
 *                 customer_type_name:
 *                   type: string
 *                   example: "Individual"
 *                 event_source:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Internet", "TV"]
 *       400:
 *         description: Missing case_id in request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing case_id in request body"
 *       404:
 *         description: Case or related incident not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Case not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */


router.post("/FLT_LOD_Case_Details", FLT_LOD_Case_Details);

/**
 * @swagger
 * /api/ftl_lod/Create_FLT_LOD:
 *   post:
 *     summary: FLT-1P02 Create a new FTL LOD entry and update case status
 *     description: |
 *       Creates a new FTL LOD entry for a given case and updates the case status to "Initial FTL LOD".
 *       Includes details such as PDF generator, signature authority, customer info, and event source.
 *
 *       | Version | Date         | Description                                 | Changed By       |
 *       |---------|--------------|---------------------------------------------|------------------|
 *       | 01      | 2025-April-22 | Initial creation of Create FTL LOD API      | Dinusha Anupama  |
 *
 *     tags: [FTL LOD Cases]
 *     parameters:
 *       - in: query
 *         name: case_id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1510
 *         description: The ID of the case.
 *       - in: query
 *         name: created_by
 *         required: true
 *         schema:
 *           type: String
 *           example: "manager"
 *         description: The user who created the FTL LOD.
 *       - in: query
 *         name: pdf_by
 *         required: true
 *         schema:
 *           type: String
 *           example: "admin_user"
 *         description: The user who created the FTL LOD.
 *       - in: query
 *         name: signed_by
 *         required: true
 *         schema:
 *           type: String
 *           example: "John Doe"
 *         description: The user who signed the FTL LOD.
 *       - in: query
 *         name: customer_name
 *         required: true
 *         schema:
 *           type: String
 *           example: "Alice Johnson"
 *         description: Customer name of the FTL LOD.
 *       - in: query
 *         name: postal_address
 *         required: true
 *         schema:
 *           type: String
 *           example: "123 Main Street, City"
 *         description: Postal Address of the FTL LOD.
 *       - in: query
 *         name: event_source
 *         required: true
 *         schema:
 *           type: String
 *           example: "987654321"
 *         description: Event Source of the FTL LOD.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - case_id
 *               - pdf_by
 *               - signed_by
 *               - customer_name
 *               - created_by
 *               - postal_address
 *               - event_source
 *             properties:
 *               case_id:
 *                 type: integer
 *                 example: 1510
 *                 description: Case ID to update with FTL LOD entry
 *               pdf_by:
 *                 type: string
 *                 example: "John Officer"
 *                 description: Name of the person who generated the PDF
 *               signed_by:
 *                 type: string
 *                 example: "Jane Manager"
 *                 description: Name of the person who signed the document
 *               customer_name:
 *                 type: string
 *                 example: "Mr. Alex Fernando"
 *                 description: Customer's full name
 *               created_by:
 *                 type: string
 *                 example: "system_admin"
 *                 description: User who created the FTL LOD
 *               postal_address:
 *                 type: string
 *                 example: "123 Maple Street, Colombo"
 *                 description: Postal address of the customer
 *               event_source:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["TV", "Internet"]
 *                 description: Services related to the case
 *     responses:
 *       200:
 *         description: FTL LOD entry and case status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "FTL LOD entry and case status updated successfully"
 *       400:
 *         description: Missing required fields in request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required fields in request body"
 *       404:
 *         description: Case not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Case not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */


router.post("/Create_FLT_LOD", Create_FLT_LOD);

/**
 * @swagger
 * /api/ftl_lod/Case_Details_Settlement_LOD_FTL_LOD:
 *   post:
 *     summary: Get case details including settlement, LOD, and FTL LOD data
 *     description: |
 *       Fetches a case's settlement details, payment history, final LOD response, and FTL LOD information using the `case_id`.
 *
 *       | Version | Date         | Description                                               | Changed By       |
 *       |---------|--------------|-----------------------------------------------------------|------------------|
 *       | 01      | 2025-April-22 | Initial version - fetch case, settlement, and payment info | Dinusha Anupama  |
 * 
 *     tags: [FTL LOD Cases]
 *     parameters:
 *      - in: query
 *        name: case_id
 *        required: true
 *        schema:
 *          type: integer
 *          example: 4
 *        description: The Case ID.
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
 *                 example: 1510
 *                 description: Unique case identifier
 *     responses:
 *       200:
 *         description: Case details with settlement and payment data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 case_id:
 *                   type: integer
 *                   example: 1510
 *                 customer_ref:
 *                   type: string
 *                   example: "CUST-1234"
 *                 account_no:
 *                   type: string
 *                   example: "ACC-5678"
 *                 current_arrears_amount:
 *                   type: number
 *                   example: 5400.75
 *                 last_payment_date:
 *                   type: string
 *                   format: date
 *                   example: "2025-04-15"
 *                 case_current_status:
 *                   type: string
 *                   example: "FTL LOD Final Notice"
 *                 lod_response:
 *                   type: array
 *                   items:
 *                     type: object
 *                   example: []
 *                 ftl_lod_responce:
 *                   type: array
 *                   items:
 *                     type: object
 *                   example: []
 *                 settlement_count:
 *                   type: integer
 *                   example: 2
 *                 settlement_plans:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       settlement_id:
 *                         type: string
 *                         example: "SETT-7890"
 *                       settlement_plan:
 *                         type: string
 *                         example: "3-month installment plan"
 *                       last_monitoring_dtm:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-01T10:00:00Z"
 *                 payment_details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       money_transaction_id:
 *                         type: string
 *                         example: "TXN-001"
 *                       payment:
 *                         type: number
 *                         example: 1000.00
 *                       payment_Dtm:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-03-01T14:00:00Z"
 *                       cummilative_settled_balance:
 *                         type: number
 *                         example: 2000.00
 *                       installment_seq:
 *                         type: integer
 *                         example: 2
 *                       money_transaction_type:
 *                         type: string
 *                         example: "Installment"
 *                       money_transaction_amount:
 *                         type: number
 *                         example: 1000.00
 *                       money_transaction_date:
 *                         type: string
 *                         format: date
 *                         example: "2025-03-01"
 *       400:
 *         description: Missing case_id in request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "case_id is required"
 *       404:
 *         description: Case not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Case not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

router.post("/Case_Details_Settlement_LOD_FTL_LOD", Case_Details_Settlement_LOD_FTL_LOD);


export default router;