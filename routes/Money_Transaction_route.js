/* 
    Purpose: This template is used for the DRC Routes.
    Created Date: 2025-03-18
    Created By: K.K.C Sakumini (sakuminic@gmail.com)
    Last Modified Date: 
    Modified By:   
    Version: Node.js v20.11.1
    Dependencies: express
    Related Files: Money_Transation_controller.js
    Notes:  
*/

import { Router } from "express";
import { getAllPaymentCases,

} from "../controllers/MoneyTransaction_controller.js";

const router = Router();

//payments

/**
 * @swagger
 * tags:
 *   - name: Payments
 *     description: Endpoints related to retrieving payment transaction cases.
 * 
 * /api/money/List_All_Payment_Cases:
 *   post:
 *     summary: Retrieve all payment cases with optional filters.
 *     description: |
 *       This endpoint retrieves payment cases based on optional filters such as `case_id`, `account_num`, `settlement_phase`, 
 *       and a date range (`from_date`, `to_date`). It also supports pagination and an option to retrieve only the most recent transactions.
 *       
 *       | Version | Date       | Description                      | Changed By         |
 *       |---------|------------|----------------------------------|--------------------|
 *       | 01      | 2025-Mar-25| Retrieve all payment cases       | Buthmi Mithara  |
 *     tags:
 *       - Payments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               case_id:
 *                 type: integer
 *                 description: Filter by specific case ID.
 *                 example: 1001
 *               account_num:
 *                 type: integer
 *                 description: Filter by account number.
 *                 example: 987654321
 *               settlement_phase:
 *                 type: string
 *                 description: Filter by settlement phase.
 *                 example: "Final Settlement"
 *               from_date:
 *                 type: string
 *                 format: date
 *                 description: Start date for filtering transactions.
 *                 example: "2025-01-01"
 *               to_date:
 *                 type: string
 *                 format: date
 *                 description: End date for filtering transactions.
 *                 example: "2025-03-01"
 *               page:
 *                 type: integer
 *                 description: Page number for pagination (default is 1).
 *                 example: 1
 *               limit:
 *                 type: integer
 *                 description: Number of records per page (default is 10).
 *                 example: 10
 *               recent:
 *                 type: boolean
 *                 description: If set to true, returns the 10 most recent transactions, ignoring filters.
 *                 example: false
 *     responses:
 *       200:
 *         description: Payment cases retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Money transactions retrieved successfully.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       Money_Transaction_ID:
 *                         type: integer
 *                         example: 202301
 *                       Case_ID:
 *                         type: integer
 *                         example: 1001
 *                       Account_No:
 *                         type: integer
 *                         example: 987654321
 *                       Created_DTM:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-03-10T12:30:00Z"
 *                       Settlement_ID:
 *                         type: integer
 *                         example: 56789
 *                       Installment_Seq:
 *                         type: integer
 *                         example: 2
 *                       Transaction_Type:
 *                         type: string
 *                         example: "Credit"
 *                       Money_Transaction_Ref:
 *                         type: string
 *                         example: "TXN123456"
 *                       Money_Transaction_Amount:
 *                         type: number
 *                         example: 500.75
 *                       Money_Transaction_Date:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-03-10T12:30:00Z"
 *                       Bill_Payment_Status:
 *                         type: string
 *                         example: "Processed"
 *                       Settlement_Phase:
 *                         type: string
 *                         example: "Final Settlement"
 *                       Cummulative_Credit:
 *                         type: number
 *                         example: 1000.00
 *                       Cummulative_Debit:
 *                         type: number
 *                         example: 500.00
 *                       Cummulative_Settled_Balance:
 *                         type: number
 *                         example: 500.00
 *                       Commissioned_Amount:
 *                         type: number
 *                         example: 50.00
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     pages:
 *                       type: integer
 *                       example: 10
 *       400:
 *         description: Validation error - Incorrect or missing input fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid request parameters."
 *                 error:
 *                   type: string
 *                   example: "from_date and to_date must be provided together."
 *       500:
 *         description: Internal server error occurred while retrieving payment cases.
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
 *                   example: "Internal server error while retrieving cases."
 */

router.post("/List_All_Payment_Cases", getAllPaymentCases);



export default router;
