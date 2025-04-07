/* 
    Purpose: This template is used for the Settlement Routes.
    Created Date: 2025-03-23
    Created By: sasindu srinayaka (sasindusrinayaka@gmail.com)  
    Version: Node.js v20.11.1
    Dependencies: express
    Related Files: Settlement_controller.js
    Notes:  
*/

import { Router } from "express";
import {
  ListAllSettlementCases,
} from "../controllers/Settlement_controller.js";
import {
  Case_Details_Settlement_Phase,
} from "../controllers/Settlement_controller.js";
import {
  Case_Details_Settlement_LOD_FTL_LOD,
} from "../controllers/Settlement_controller.js";



const router = Router();


/**
 * @swagger
 * tags:
 *   - name: Case Settlement
 *     description: Endpoints for retrieving all settlement cases based on various filters.
 * 
 * /api/case/List_All_Settlement_Cases:
 *   post:
 *     summary: Retrieve settlement cases with filtering options.
 *     description: |
 *       This endpoint retrieves settlement cases associated with a specified case ID.
 *       Users can filter cases based on settlement phase, settlement status, and date range.
 *       The response will return the last 10 records sorted by the created date in descending order.
 *       
 *       | Version | Date       | Description                           | Changed By         |
 *       |---------|------------|---------------------------------------|--------------------|
 *       | 01      | 2025-Mar-16| Retrieve settlement cases with filters | Sasindu Srinayaka  |
 *     tags:
 *       - Case Settlement
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
 *                 example: 12
 *               settlement_phase:
 *                 type: string
 *                 description: Phase of the settlement.
 *                 example: "Negotiation"
 *               settlement_status:
 *                 type: string
 *                 description: Current status of the settlement.
 *                 example: "Open_Pending"
 *               from_date:
 *                 type: string
 *                 format: date
 *                 description: Start date for filtering settlement cases.
 *                 example: "2025-02-01"
 *               to_date:
 *                 type: string
 *                 format: date
 *                 description: End date for filtering settlement cases.
 *                 example: "2025-02-20"
  *     responses:
 *       200:
 *         description: Settlement cases retrieved successfully.
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
 *                   example: Successfully retrieved case settlements.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       case_id:
 *                         type: integer
 *                         description: Unique identifier of the case.
 *                       settlement_phase:
 *                         type: string
 *                         description: Phase of the settlement.
 *                       settlement_status:
 *                         type: string
 *                         description: Current status of the settlement.
 *                       created_dtm:
 *                         type: string
 *                         format: date-time
 *                         description: Date and time when the settlement was created.
 *                       updated_dtm:
 *                         type: string
 *                         format: date-time
 *                         description: Date and time when the settlement was last updated.
 *       400:
 *         description: Validation error - Missing required fields or no filtering parameters.
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
 *                   example: "Case Id is required."
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     description:
 *                       type: string
 *                       example: "Provide at least one of settlement_phase, settlement_status, or both from_date and to_date together."
 *       404:
 *         description: No settlement cases found for the given criteria.
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
 *                   example: "No data found for the provided parameters."
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 404
 *                     description:
 *                       type: string
 *                       example: "No cases satisfy the provided criteria."
 *       500:
 *         description: Internal server error occurred while retrieving settlement cases.
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
 *                   example: "Internal Server error. Please try again later."
 */
router.post("/List_All_Settlement_Cases", ListAllSettlementCases);

/**
 * @swagger
 * /api/settlement/Case_Details_Settlement_Phase:
 *   post:
 *     summary: Retrieve case details for settlement phase
 *     description: |
 *       Fetches case details along with settlement plans based on the given `case_id`.
 *
 *       | Version | Date        | Description                    | Changed By |
 *       |---------|------------|--------------------------------|-----------|
 *       | 01      | 2025-April-02 | Initial implementation        | Dinusha Anupama      |
 *
 *     tags: [Case Settlement]
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
 *                 example: 4
 *                 description: The unique case identifier.
 *     responses:
 *       200:
 *         description: Case details including settlement plans.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 case_id:
 *                   type: integer
 *                   example: 4
 *                 customer_ref:
 *                   type: string
 *                   example: "CUST-REF-001"
 *                   description: Customer reference number.
 *                 account_no:
 *                   type: string
 *                   example: "123456789"
 *                   description: Customer account number.
 *                 current_arrears_amount:
 *                   type: number
 *                   format: float
 *                   example: 1250.75
 *                   description: Current arrears amount for the case.
 *                 last_payment_date:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-12-20T00:00:00.000Z"
 *                   description: Last payment date.
 *                 case_current_status:
 *                   type: string
 *                   example: "LIT Prescribed"
 *                   description: Current status of the case.
 *                 settlement_count:
 *                   type: integer
 *                   example: 2
 *                   description: Number of settlements associated with the case.
 *                 settlement_plans:
 *                   type: array
 *                   description: List of settlement plans.
 *                   items:
 *                     type: object
 *                     properties:
 *                       settlement_id:
 *                         type: integer
 *                         example: 50
 *                       settlement_plan:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: "67ed0524e142ccc22bd56e8e"
 *                             installment_seq:
 *                               type: integer
 *                               example: 1
 *                               description: Installment sequence number.
 *                             Installment_Settle_Amount:
 *                               type: number
 *                               format: float
 *                               example: 10000
 *                               description: Total settlement amount for the installment.
 *                             Plan_Date:
 *                               type: string
 *                               format: date-time
 *                               example: "2024-05-01T00:00:00.000Z"
 *                               description: Planned payment date.
 *                             Payment_Seq:
 *                               type: integer
 *                               example: 101
 *                               description: Payment sequence identifier.
 *                             Installment_Paid_Amount:
 *                               type: number
 *                               format: float
 *                               example: 5000
 *                               description: Amount paid for this installment.
 *       400:
 *         description: Missing or invalid case ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "case_id is required"
 *       404:
 *         description: Case not found in the database.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Case not found"
 *       500:
 *         description: Internal server error due to application failure.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */


router.post("/Case_Details_Settlement_Phase", Case_Details_Settlement_Phase);

router.post("/Case_Details_Settlement_LOD_FTL_LOD", Case_Details_Settlement_LOD_FTL_LOD);

export default router;