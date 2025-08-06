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
  Create_Task_For_Downloard_Settlement_List,
  ListAllSettlementCases,
  Create_Task_For_Downloard_Settlement_Details_By_Case_ID,
} from "../controllers/Settlement_controller.js";
import {
  Case_Details_Settlement_Phase,
} from "../controllers/Settlement_controller.js";
import {
  Case_Details_Settlement_LOD_FTL_LOD,
} from "../controllers/Settlement_controller.js";
import { Settlement_Details_By_Settlement_ID_Case_ID } from "../controllers/Settlement_controller.js";


const router = Router();


/**
 * @swagger
 * tags:
 *   - name: Case Settlement
 *     description: Endpoints for retrieving all settlement cases based on various filters.
 * 
 * /api/settlement/List_All_Settlement_Cases:
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
 *       | 02      | 2025-May- 14| Added paging logic                    | Janani Kumarasiri  |
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
 *                 example: ""
 *               settlement_phase:
 *                 type: string
 *                 description: Phase of the settlement.
 *                 example: "Negotiation"
 *               settlement_status:
 *                 type: string
 *                 description: Current status of the settlement.
 *                 example: ""
 *               from_date:
 *                 type: string
 *                 format: date
 *                 description: Start date for filtering settlement cases.
 *                 example: ""
 *               to_date:
 *                 type: string
 *                 format: date
 *                 description: End date for filtering settlement cases.
 *                 example: ""
 *               pages:
 *                 type: integer
 *                 description: Page number for pagination.
 *                 example: 1
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

/**
 * @swagger
 * /api/settlement/Case_Details_Settlement_LOD_FTL_LOD:
 *   post:
 *     summary: Get case details including settlement, LOD, and FTL LOD data
 *     description: |
 *       Fetches a case's settlement details, payment history, final LOD response, and FTL LOD information using the `case_id`.
 *
 *       | Version | Date         | Description                                               | Changed By       |
 *       |---------|--------------|-----------------------------------------------------------|------------------|
 *       | 01      | 2025-April-22 | Initial version - fetch case, settlement, and payment info | Dinusha Anupama  |
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

/**
 * @swagger
 * /api/settlement/Create_Task_For_Downloard_Settlement_List:
 *   post:
 *     summary: Create task to download settlement case list
 *     description: |
 *       Creates a background task to generate and download a list of settlement cases filtered by multiple criteria such as date range, case ID, account number, and more.
 *
 *       | Version | Date         | Description                                    | Changed By      |
 *       |---------|--------------|------------------------------------------------|-----------------|
 *       | 01      | 2025-May-14  | Initial version for task creation              | Janani Kumarasiri |
 *
 *     tags: [Case Settlement]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Created_By
 *             properties:
 *               Created_By:
 *                 type: string
 *                 example: "super@gmail.com"
 *                 description: The user creating the task
 *               Phase:
 *                 type: string
 *                 example: ""
 *                 description: Task phase (optional)
 *               Case_Status:
 *                 type: string
 *                 example: ""
 *                 description: Filter by case status
 *               from_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-01"
 *                 description: Start date filter
 *               to_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-31"
 *                 description: End date filter
 *               Case_ID:
 *                 type: integer
 *                 example: 4
 *                 description: Optional specific case ID
 *               Account_Number:
 *                 type: integer
 *                 example: ""
 *                 description: Optional specific account number
 *     responses:
 *       200:
 *         description: Task created successfully
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
 *                   example:
 *                     Template_Task_Id: 42
 *                     task_type: Create task for Download Settlement Case List
 *                     Created_By: "admin_user"
 *                     task_status: "open"
 *                     Account_No: 123456789
 *                     case_ID: 2005
 *                     Phase: "Recovery"
 *                     Case_Status: "Open"
 *                     from_date: "2025-01-01"
 *                     to_date: "2025-01-31"
 *       400:
 *         description: Missing required parameter (Created_By)
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
 *                   example: created by is a required parameter.
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
 *                   example: Internal server error.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     exception:
 *                       type: string
 *                       example: Some exception message
 */


router.post("/Create_Task_For_Downloard_Settlement_List", Create_Task_For_Downloard_Settlement_List);
 
/**
 * @swagger
 * /api/settlement/Settlement_Details_By_Settlement_ID_Case_ID:
 *   post:
 *     summary: Get settlement details by settlement ID and case ID
 *     description: |
 *       Retrieves detailed settlement information using both `case_id` and `settlement_id`. 
 *       Includes arrears, status, phase, type, and plan information.
 *
 *       | Version | Date         | Description                          | Changed By      |
 *       |---------|--------------|--------------------------------------|-----------------|
 *       | 01      | 2025-May-14  | Initial version for settlement lookup | Janani Kumarasiri |
 *
 *     tags: [Case Settlement]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - case_id
 *               - settlement_id
 *             properties:
 *               case_id:
 *                 type: integer
 *                 example: 4
 *                 description: Unique case identifier
 *               settlement_id:
 *                 type: integer
 *                 example: 50
 *                 description: Unique settlement identifier
 *     responses:
 *       200:
 *         description: Settlement details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Settlement details retrieved successfully
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     settlement_id:
 *                       type: string
 *                       example: "SETT-2345"
 *                     case_id:
 *                       type: integer
 *                       example: 1501
 *                     account_no:
 *                       type: string
 *                       example: "ACC-1010"
 *                     arrears_amount:
 *                       type: number
 *                       example: 8200.50
 *                     last_monitoring_dtm:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-04-20T10:00:00Z"
 *                     settlement_status:
 *                       type: string
 *                       example: "Pending"
 *                     status_dtm:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-04-21T12:00:00Z"
 *                     status_reason:
 *                       type: string
 *                       example: "Awaiting documents"
 *                     settlement_phase:
 *                       type: string
 *                       example: "Initial Review"
 *                     settlement_type:
 *                       type: string
 *                       example: "Lump Sum"
 *                     created_by:
 *                       type: string
 *                       example: "user_admin"
 *                     created_dtm:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-04-15T09:00:00Z"
 *                     drc_id:
 *                       type: string
 *                       example: "DRC-999"
 *                     ro_id:
 *                       type: string
 *                       example: "RO-888"
 *                     settlement_plans:
 *                       type: array
 *                       items:
 *                         type: object
 *                       example: []
 *                     settlement_plan_received:
 *                       type: boolean
 *                       example: true
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
 *         description: Case or settlement not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Settlement not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */


router.post("/Settlement_Details_By_Settlement_ID_Case_ID", Settlement_Details_By_Settlement_ID_Case_ID);

/**
 * @swagger
 * /api/settlement/Create_Task_For_Downloard_Settlement_Details_By_Case_ID:
 *   post:
 *     summary: Create a task to download settlement details by Case ID
 *     description: |
 *       This endpoint creates a task to download settlement details associated with a specific Case ID and Settlement ID.
 *       
 *       | Version | Date         | Description                                            | Changed By    |
 *       |---------|--------------|--------------------------------------------------------|---------------|
 *       | 01      | 2025-May-14  | Initial version for task creation                      | Janani Kumarasiri |
 *
 *     tags: [Settlement Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Created_By
 *               - Case_ID
 *               - Settlement_ID
 *             properties:
 *               Created_By:
 *                 type: string
 *                 example: "super@gmail.com"
 *                 description: User who initiated the task
 *               Case_ID:
 *                 type: integer
 *                 example: 4
 *                 description: Unique identifier for the case
 *               Settlement_ID:
 *                 type: integer
 *                 example: 50
 *                 description: Unique identifier for the settlement
 *     responses:
 *       200:
 *         description: Task created successfully
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
 *                       example: 43
 *                     task_type:
 *                       type: string
 *                       example: Create task for Download Settlement Details By Case_Id
 *                     Created_By:
 *                       type: string
 *                       example: admin_user
 *                     task_status:
 *                       type: string
 *                       example: open
 *                     case_ID:
 *                       type: integer
 *                       example: 1510
 *                     settlement_id:
 *                       type: string
 *                       example: SETT-7890
 *       400:
 *         description: Missing required parameters
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
 *                   example: Case_ID and Settlement_ID are required parameter.
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
 *                   example: Internal server error.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     exception:
 *                       type: string
 *                       example: "Some unexpected error occurred"
 */

router.post("/Create_Task_For_Downloard_Settlement_Details_By_Case_ID", Create_Task_For_Downloard_Settlement_Details_By_Case_ID);

export default router;