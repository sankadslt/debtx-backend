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

const router = Router();


/**
 * @swagger
 * tags:
 *   - name: Case Management
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

export default router;