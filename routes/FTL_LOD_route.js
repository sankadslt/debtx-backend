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



router.post("/Retrive_logic", Retrive_logic);

/**
 * @swagger
 * /api/ftl_lod/List_FTL_LOD_Cases:
 *   post:
 *     summary: Retrieve a paginated list of FTL LOD cases with filters
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
 *     summary: Create a customer response for a given case
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


export default router;