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
    Create_task_for_Download_Payment_Case_List,
    Case_Details_Payment_By_Case_ID
} from "../controllers/MoneyTransaction_controller.js";

const router = Router();

//payments

/**
 * @swagger
 * /api/money/List_All_Payment_Cases:
 *   post:
 *     summary: Retrieve payment-related settlement cases
 *     description: |
 *       Fetches settlement case payment data based on various filters such as case ID, account number, settlement phase, and date range. Supports pagination.
 *
 *       | Version | Date         | Description                                             | Changed By    |
 *       |---------|--------------|---------------------------------------------------------|---------------|
 *       | 01      | 2025-May-14  | Initial version to fetch filtered payment case details  | Janani Kumarasiri |
 *
 *     tags: [Settlement Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               case_id:
 *                 type: integer
 *                 example: ""
 *                 description: Filter by Case ID
 *               account_num:
 *                 type: string
 *                 example: ""
 *                 description: Filter by Account Number
 *               settlement_phase:
 *                 type: string
 *                 example: "Negotiation"
 *                 description: Filter by Settlement Phase
 *               from_date:
 *                 type: string
 *                 format: date
 *                 example: ""
 *                 description: Filter from this transaction date
 *               to_date:
 *                 type: string
 *                 format: date
 *                 example: ""
 *                 description: Filter to this transaction date
 *               pages:
 *                 type: integer
 *                 example: 1
 *                 description: Page number for pagination
 *     responses:
 *       200:
 *         description: Settlement cases fetched successfully
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
 *                       Money_Transaction_ID:
 *                         type: integer
 *                         example: 4567
 *                       Case_ID:
 *                         type: integer
 *                         example: 1010
 *                       Account_No:
 *                         type: string
 *                         example: "ACC-7890"
 *                       Settlement_ID:
 *                         type: string
 *                         example: "SETT-4567"
 *                       Installment_Seq:
 *                         type: integer
 *                         example: 2
 *                       Transaction_Type:
 *                         type: string
 *                         example: "Installment"
 *                       Money_Transaction_Amount:
 *                         type: number
 *                         example: 1000.00
 *                       Money_Transaction_Date:
 *                         type: string
 *                         format: date
 *                         example: "2025-03-15"
 *                       Settlement_Phase:
 *                         type: string
 *                         example: "Installment"
 *                       Cummulative_Settled_Balance:
 *                         type: number
 *                         example: 3000.00
 *       400:
 *         description: Missing all required filter parameters
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
 *                   example: At least one of case_id, settlement_phase, account_num, from_date or to_date is required.
 *       500:
 *         description: Server error while retrieving payment cases
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
 *                   example: There is an error
 */

router.post("/List_All_Payment_Cases", getAllPaymentCases);

router.post("/Create_task_for_Download_Payment_Case_List", Create_task_for_Download_Payment_Case_List);

/**
 * @swagger
 * /api/money/Case_Details_Payment_By_Case_ID:
 *   post:
 *     summary: Get case payment details by case ID and transaction ID
 *     description: |
 *       Retrieves a case's payment details, including a selected money transaction, cumulative balance, and all associated transaction records by case ID and money transaction ID.
 *
 *       | Version | Date         | Description                                       | Changed By   |
 *       |---------|--------------|---------------------------------------------------|--------------|
 *       | 01      | 2025-May-14  | Initial version to return detailed payment info   | Janani Kumarasiri |
 *
 *     tags: [Case Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - case_id
 *               - money_transaction_id
 *             properties:
 *               case_id:
 *                 type: integer
 *                 example: 4
 *                 description: Unique identifier of the case
 *               money_transaction_id:
 *                 type: integer
 *                 example: 47
 *                 description: Unique identifier for the money transaction
 *     responses:
 *       200:
 *         description: Case and transaction details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Case details retrieved successfully
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     case_id:
 *                       type: integer
 *                       example: 1510
 *                     account_no:
 *                       type: string
 *                       example: "ACC-12345"
 *                     money_transaction_id:
 *                       type: integer
 *                       example: 7890
 *                     created_dtm:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-01T12:00:00Z"
 *                     cummulative_settled_balance:
 *                       type: number
 *                       example: 2500.00
 *                     settlement_id:
 *                       type: string
 *                       example: "SETT-56789"
 *                     installment_seq:
 *                       type: integer
 *                       example: 3
 *                     settlement_phase:
 *                       type: string
 *                       example: "Final"
 *                     settle_Effected_Amount:
 *                       type: number
 *                       example: 1000.00
 *                     commission_type:
 *                       type: string
 *                       example: "Service Fee"
 *                     commission_amount:
 *                       type: number
 *                       example: 150.00
 *                     drc_id:
 *                       type: string
 *                       example: "DRC-001"
 *                     ro_id:
 *                       type: string
 *                       example: "RO-002"
 *                     commision_issued_by:
 *                       type: string
 *                       example: "Agent001"
 *                     commision_issued_dtm:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-01T14:00:00Z"
 *                     payment_details:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           money_transaction_id:
 *                             type: integer
 *                             example: 7890
 *                           money_transaction_ref:
 *                             type: string
 *                             example: "REF-456"
 *                           money_transaction_reference_type:
 *                             type: string
 *                             example: "Bank Transfer"
 *                           money_transaction_amount:
 *                             type: number
 *                             example: 1000.00
 *                           money_transaction_date:
 *                             type: string
 *                             format: date
 *                             example: "2025-04-30"
 *                           money_transaction_type:
 *                             type: string
 *                             example: "Installment"
 *       400:
 *         description: Missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: case_id is required
 *       404:
 *         description: Case or transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Case not found
 *       500:
 *         description: Server error during case retrieval
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

router.post('/Case_Details_Payment_By_Case_ID', Case_Details_Payment_By_Case_ID);

export default router;
