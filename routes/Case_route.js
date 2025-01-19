/* 
    Purpose: This template is used for the DRC Routes.
    Created Date: 2025-01-08
    Created By: Janendra Chamodi (apjanendra@gmail.com)
    Last Modified Date: 2024-11-24
    Modified By: Naduni Rabel (rabelnaduni2000@gmail.com)          
    Version: Node.js v20.11.1
    Dependencies: express
    Related Files: Case_controller.js
    Notes:  
*/

 
import { Router } from "express";
import { drcExtendValidityPeriod,
        listHandlingCasesByDRC, Case_Discard, Open_No_Agent_Cases_F1_Filter, Case_Current_Status,
        Open_No_Agent_Cases_ALL,
        Open_No_Agent_Cases_Direct_LD,
        assignROToCase,
        Case_Status,
        Case_List,
        openNoAgentCasesAllByServiceTypeRulebase,
        openNoAgentCountArrearsBandByServiceType,
        listCases,
        Acivite_Case_Details,
 } from "../controllers/Case_controller.js";


const router = Router();


/**
 * @swagger
 * tags:
 *   - name: Case Management
 *     description: Case-related endpoints, allowing management and updates of case details.
 *
 * /api/case/Open_No_Agent_Cases_ALL:
 *   post:
 *     summary: Retrieve all cases by status and date range
 *     description: |
 *       Fetch all cases matching the provided `case_current_status`. If not specified, retrieves all statuses. 
 *       Results are filtered by optional `fromDate` and `toDate` range and grouped into categories.
 *       
 *       | Version | Date       | Description    |
 *       |---------|------------|----------------|
 *       | 01      | 2025-Jan-09| Initial version|
 *
 *     tags:
 *      - Case Management
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         description: Request parameters for case filtering.
 *         schema:
 *           type: object
 *           properties:
 *             case_current_status:
 *               type: string
 *               example: Open Pending Approval
 *               description: The status of cases to retrieve. Defaults to "Open No Agent" for specific filters.
 *             fromDate:
 *               type: string
 *               format: date
 *               example: 2023-01-01
 *               description: Start date for filtering cases based on creation date.
 *             toDate:
 *               type: string
 *               format: date
 *               example: 2023-12-31
 *               description: End date for filtering cases based on creation date.
 *     responses:
 *       200:
 *         description: Cases retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cases retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     No_Agent_Cases:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           case_id:
 *                             type: integer
 *                             example: 1
 *                           account_no:
 *                             type: integer
 *                             example: 123456789
 *                           area:
 *                             type: string
 *                             example: North Zone
 *                           rtom:
 *                             type: string
 *                             example: RTOM-01
 *                           filtered_reason:
 *                             type: string
 *                             example: null
 *                     F1_Filter:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           case_id:
 *                             type: integer
 *                             example: 2
 *                           account_no:
 *                             type: integer
 *                             example: 987654321
 *                           area:
 *                             type: string
 *                             example: South Zone
 *                           rtom:
 *                             type: string
 *                             example: RTOM-02
 *                           filtered_reason:
 *                             type: string
 *                             example: Delayed response
 *                     Direct_LD:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           case_id:
 *                             type: integer
 *                             example: 3
 *                           account_no:
 *                             type: integer
 *                             example: 123123123
 *                           area:
 *                             type: string
 *                             example: East Zone
 *                           rtom:
 *                             type: string
 *                             example: RTOM-03
 *                           filtered_reason:
 *                             type: string
 *                             example: null
 *       404:
 *         description: No cases found with the specified criteria.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No cases found matching the criteria.
 *       500:
 *         description: Internal server error or database error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error.
 *                 error:
 *                   type: string
 *                   example: Detailed error message here.
 */
router.post("/Open_No_Agent_Cases_ALL", Open_No_Agent_Cases_ALL);

/**
 * @swagger
 * tags:
 *   - name: Case Management
 *     description: Case-related endpoints, allowing management and updates of case details.
 *
 * /api/case/Open_No_Agent_Cases_Direct_LD:
 *   post:
 *     summary: Retrieve cases with specific arrears amount, filtered reason as null, and "Open No Agent" status
 *     description: |
 *       Fetch cases where the following conditions are met:
 *       - `case_current_status` is "Open No Agent".
 *       - `filtered_reason` is null or an empty string.
 *       - `current_arrears_amount` is greater than 1000 and less than or equal to 5000.
 *       - Optionally filtered by `fromDate` and `toDate` for the `created_dtm` field.
 *       
 *       | Version | Date       | Description    |
 *       |---------|------------|----------------|
 *       | 01      | 2025-Jan-09| Initial version|
 *
 *     tags:
 *      - Case Management
 *     parameters:
 *       - in: query
 *         name: fromDate
 *         required: true
 *         schema:
 *           type: String
 *           example: 2023-01-01
 *         description: Start date for filtering cases based on creation date.
 *       - in: query
 *         name: toDate
 *         required: true
 *         schema:
 *           type: String
 *           example: 2023-12-31
 *         description: End date for filtering cases based on creation date.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fromDate:
 *                 type: string
 *                 format: date
 *                 example: 2023-01-01
 *                 description: Start date for filtering cases based on creation date.
 *               toDate:
 *                 type: string
 *                 format: date
 *                 example: 2023-12-31
 *                 description: End date for filtering cases based on creation date.
 *     responses:
 *       200:
 *         description: Cases retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cases retrieved successfully.
 *                 criteria:
 *                   type: object
 *                   properties:
 *                     case_current_status:
 *                       type: string
 *                       example: Open No Agent
 *                     fromDate:
 *                       type: string
 *                       format: date
 *                       example: 2023-01-01
 *                     toDate:
 *                       type: string
 *                       format: date
 *                       example: 2023-12-31
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       case_id:
 *                         type: integer
 *                         example: 1
 *                       account_no:
 *                         type: integer
 *                         example: 987654321
 *                       area:
 *                         type: string
 *                         example: West Zone
 *                       rtom:
 *                         type: string
 *                         example: RTOM-02
 *                       filtered_reason:
 *                         type: string
 *                         example: null
 *       404:
 *         description: No cases found matching the criteria.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No cases found matching the criteria.
 *                 criteria:
 *                   type: object
 *                   properties:
 *                     case_current_status:
 *                       type: string
 *                       example: Open No Agent
 *                     fromDate:
 *                       type: string
 *                       format: date
 *                       example: 2023-01-01
 *                     toDate:
 *                       type: string
 *                       format: date
 *                       example: 2023-12-31
 *       500:
 *         description: Internal server error or database error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error.
 *                 error:
 *                   type: string
 *                   example: Detailed error message here.
 */
router.post("/Open_No_Agent_Cases_Direct_LD", Open_No_Agent_Cases_Direct_LD);

/**
 * @swagger
 * tags:
 *   - name: Case Management
 *     description: Case-related endpoints, allowing management and updates of case details.
 *
 * /api/case/Drc_Extend_Validity_Period:
 *   patch:
 *     summary: C-1AO1 Extend the validity period of a DRC
 *     description: |
 *       Updates the validity period of a DRC by modifying the expiration date, adding a transaction record, and managing system case interactions.
 *       
 *       | Version | Date       | Description    |
 *       |---------|------------|----------------|
 *       | 01      | 2025-Jan-09| Initial version|
 *
 *     tags:
 *      - Case Management
 *     parameters:
 *       - in: query
 *         name: Case_Id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The ID of the Case to be updated.
 *       - in: query
 *         name: DRC_Id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The ID of the DRC to be updated.
 *       - in: query
 *         name: No_Of_Month
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Extend period. Should be less than or equal to 3
 *       - in: query
 *         name: Extended_By
 *         required: true
 *         schema:
 *           type: string
 *           example: Admin456
 *         description: Extended by.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Case_Id:
 *                 type: integer
 *                 description: The unique identifier for the case.
 *                 example: 1
 *               DRC_Id:
 *                 type: integer
 *                 description: The unique identifier for the DRC.
 *                 example: 1
 *               No_Of_Month:
 *                 type: integer
 *                 description: The number of months to extend the validity period.
 *                 example: 1
 *               Extended_By:
 *                 type: string
 *                 description: The username or ID of the person extending the validity period.
 *                 example: "user123"
 *     responses:
 *       200:
 *         description: DRC validity period successfully extended.
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
 *                   example: DRC validity period successfully extended.
 *       400:
 *         description: Validation error due to missing or invalid fields.
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
 *                   example: Failed to extend DRC validity period.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     description:
 *                       type: string
 *                       example: "All fields are required."
 *       500:
 *         description: Internal server error or database error.
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
 *                   oneOf:
 *                     - example: Error updating No of Months.
 *                     - example: Error inserting state change record.
 *                     - example: Error closing Agent time extend.
 *                     - example: Error updating System Case User Interaction.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: "An unexpected error occurred. Please try again later."
 */
router.patch("/Drc_Extend_Validity_Period", drcExtendValidityPeriod);

router.post("/List_Handling_Cases_By_DRC", listHandlingCasesByDRC);

/**
 * @swagger
 * /api/case/Case_Discard:
 *   patch:
 *     summary: Discard a case and update its details.
 *     tags:
 *       - Case Management
 *     parameters:
 *       - in: query
 *         name: case_id
 *         required: true
 *         schema:
 *           type: number
 *           example: 12345
 *         description: The unique identifier of the case to be discarded.
 *       - in: query
 *         name: Discard_Reason
 *         required: true
 *         schema:
 *           type: string
 *           example: "Incorrect"
 *         description: The reason for discarding the case.
 *       - in: query
 *         name: Discarded_By
 *         required: true
 *         schema:
 *           type: string
 *           example: "admin_user"
 *         description: The username or ID of the person discarding the case.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               case_id:
 *                 type: number
 *                 example: 12345
 *                 description: The unique identifier of the case to be discarded.
 *               Discard_Reason:
 *                 type: string
 *                 example: "Incorrect"
 *                 description: The reason for discarding the case.
 *               Discarded_By:
 *                 type: string
 *                 example: "admin_user"
 *                 description: The username or ID of the person discarding the case.
 *     responses:
 *       200:
 *         description: Case discarded successfully.
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
 *                   example: Case discarded successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     case_id:
 *                       type: number
 *                       example: 12345
 *                     Discard_Reason:
 *                       type: string
 *                       example: "Incorrect"
 *                     Discarded_By:
 *                       type: string
 *                       example: "admin_user"
 *                     Discarded_dtm:
 *                       type: string
 *                       example: "2024-12-31T12:00:00Z"
 *                     case_current_status:
 *                       type: string
 *                       example: "Discard"
 *       400:
 *         description: Bad request. Missing required fields.
 *       404:
 *         description: Case not found with the provided case_id.
 *       500:
 *         description: Internal server error. Failed to discard the case.
 */
router.patch("/Case_Discard", Case_Discard);

router.post("/Open_No_Agent_Cases_F1_Filter", Open_No_Agent_Cases_F1_Filter);

router.post("/Case_Current_Status", Case_Current_Status);

// router.post("/List_All_DRC_Owned_By_Case", listAllDRCOwnedByCase);

router.patch("/Assign_RO_To_Case", assignROToCase);


/**
 * @swagger
 * tags:
 *   - name: Case Management
 *     description: Case-related endpoints, allowing management and retrieval of case details.
 *
 * /api/case/Open_No_Agent_Cases_ALL_By_Rulebase:
 *   post:
 *     summary: C-1P18 Retrieve Open No Agent Cases by Rule
 *     description: |
 *       Retrieves case details based on the rule for cases with the status "Open No Agent." Provides filtered results for specific criteria.
 *
 *       | Version | Date       | Description    |
 *       |---------|------------|----------------|
 *       | 01      | 2025-Jan-15| Initial version|
 *
 *     tags:
 *      - Case Management
 *     parameters:
 *       - in: query
 *         name: rule
 *         required: true
 *         schema:
 *           type: string
 *           example: "PEO TV"
 *         description: Rule.
 *       - in: query
 *         name: Case_Status
 *         required: false
 *         schema:
 *           type: string
 *           example: "Open No Agent"
 *         description: The status of the case to filter by.
 *       - in: query
 *         name: From_Date
 *         required: true
 *         schema:
 *           type: string
 *           example: "2025-01-11"
 *         description:  From date to filter cases by.
 *       - in: query
 *         name: To_Date
 *         required: true
 *         schema:
 *           type: string
 *           example: "2025-01-12"
 *         description:  To date to filter cases by.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Rule:
 *                 type: string
 *                 description: The rule to filter cases by.
 *                 example: "PEO TV"
 *               Case_Status:
 *                 type: string
 *                 description: The rule to filter cases by.
 *                 example: "Open No Agent"
 *               From_Date:
 *                 type: string
 *                 description: From date to filter cases by.
 *                 example: "2025-01-11"
 *               To_Date:
 *                 type: string
 *                 description: To date to filter cases by.
 *                 example: "2025-01-12"
 *     responses:
 *       200:
 *         description: Successfully retrieved Open No Agent case details.
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
 *                   example: Successfully retrieved Open No Agent case details.
 *                 data:
 *                   type: object
 *                   properties:
 *                     No_Agent_Cases:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           case_id:
 *                             type: integer
 *                           created_dtm:
 *                             type: string
 *                             format: date-time
 *                           account_no:
 *                             type: integer
 *                           customer_ref:
 *                             type: string
 *                           area:
 *                             type: string
 *                           rtom:
 *                             type: string
 *                           current_arrears_amount:
 *                             type: integer
 *                           action_type:
 *                             type: string
 *                           last_payment_dtm:
 *                             type: string
 *                             format: date-time
 *                           monitor_months:
 *                             type: integer
 *                           last_bss_reading_dtm:
 *                             type: string
 *                             format: date-time
 *                           commission:
 *                             type: string
 *                             nullable: true
 *                           case_current_status:
 *                             type: string
 *                           filtered_reason:
 *                             type: string
 *                           drc_selection_rule:
 *                             type: string
 *                           remark:
 *                             type: array
 *                             items:
 *                               type: object
 *                               additionalProperties:
 *                                 type: string
 *                           approve:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 approved_by:
 *                                   type: string
 *                                   nullable: true
 *                                 approved_process:
 *                                   type: string
 *                                   nullable: true
 *                                 approve_process:
 *                                   type: string
 *                                 approve_by:
 *                                   type: string
 *                                 approve_on:
 *                                   type: string
 *                                   format: date-time
 *                                 remark:
 *                                   type: string
 *                           contact:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 mob:
 *                                   type: integer
 *                                 email:
 *                                   type: string
 *                                 lan:
 *                                   type: integer
 *                                 address:
 *                                   type: string
 *                           drc:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 drc_name:
 *                                   type: string
 *                                 order_id:
 *                                   type: integer
 *                                 created_dtm:
 *                                   type: string
 *                                   format: date-time
 *                                 status:
 *                                   type: string
 *                                 status_dtm:
 *                                   type: string
 *                                   format: date-time
 *                                 case_removal_remark:
 *                                   type: string
 *                                   nullable: true
 *                                 removed_by:
 *                                   type: string
 *                                   nullable: true
 *                                 removed_dtm:
 *                                   type: string
 *                                   format: date-time
 *                                   nullable: true
 *                                 case_transfer_dtm:
 *                                   type: string
 *                                   format: date-time
 *                                   nullable: true
 *                                 transferred_by:
 *                                   type: string
 *                                   nullable: true
 *                                 recovery_officers:
 *                                   type: array
 *                                   items:
 *                                     type: string
 *                           case_status:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 status:
 *                                   type: string
 *                                   nullable: true
 *                                 Status_Type_ID:
 *                                   type: integer
 *                                 create_dtm:
 *                                   type: string
 *                                   format: date-time
 *                                 status_reason:
 *                                   type: string
 *                                 created_by:
 *                                   type: string
 *                                 notified_dtm:
 *                                   type: string
 *                                   format: date-time
 *                                   nullable: true
 *                                 expired_dtm:
 *                                   type: string
 *                                   format: date-time
 *                     F1_Filter:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           case_id:
 *                             type: integer
 *                           created_dtm:
 *                             type: string
 *                             format: date-time
 *                           account_no:
 *                             type: integer
 *                           customer_ref:
 *                             type: string
 *                           area:
 *                             type: string
 *                           rtom:
 *                             type: string
 *                           current_arrears_amount:
 *                             type: integer
 *                           action_type:
 *                             type: string
 *                           last_payment_dtm:
 *                             type: string
 *                             format: date-time
 *                           monitor_months:
 *                             type: integer
 *                           last_bss_reading_dtm:
 *                             type: string
 *                             format: date-time
 *                           commission:
 *                             type: string
 *                             nullable: true
 *                           case_current_status:
 *                             type: string
 *                           filtered_reason:
 *                             type: string
 *                           drc_selection_rule:
 *                             type: string
 *                           remark:
 *                             type: array
 *                             items:
 *                               type: object
 *                               additionalProperties:
 *                                 type: string
 *                     Direct_LD:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           case_id:
 *                             type: integer
 *                           created_dtm:
 *                             type: string
 *                             format: date-time
 *                           account_no:
 *                             type: integer
 *                           customer_ref:
 *                             type: string
 *                           area:
 *                             type: string
 *                           rtom:
 *                             type: string
 *                           current_arrears_amount:
 *                             type: integer
 *                           action_type:
 *                             type: string
 *                           last_payment_dtm:
 *                             type: string
 *                             format: date-time
 *                           monitor_months:
 *                             type: integer
 *                           last_bss_reading_dtm:
 *                             type: string
 *                             format: date-time
 *                           commission:
 *                             type: string
 *                             nullable: true
 *                           case_current_status:
 *                             type: string
 *                           filtered_reason:
 *                             type: string
 *                           drc_selection_rule:
 *                             type: string
 *                           remark:
 *                             type: array
 *                             items:
 *                               type: object
 *                               additionalProperties:
 *                                 type: string
 *       400:
 *         description: Validation error due to missing or invalid fields.
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
 *                   example: Failed to retrieve Open no agent case details.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     description:
 *                       type: string
 *                       example: "Rule is a required field."
 *       500:
 *         description: Internal server error or database error.
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
 *                   example: Failed to retrieve case details.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: "An unexpected error occurred. Please try again later."
 */

router.post("/Open_No_Agent_Cases_ALL_By_Rulebase", openNoAgentCasesAllByServiceTypeRulebase);

/**
 * @swagger
 * tags:
 *   - name: Case Management
 *     description: Case-related endpoints, allowing management and updates of case details.
 *
 * /api/case/Open_No_Agent_Count_Arrears_Band_By_Rulebase:
 *   post:
 *     summary: C-1P19 Retrieve Open No Agent Count Arrears Bands by Rule
 *     description: |
 *       Retrieves the count of cases with current arrears amounts divided into bands based on the rule. 
 *
 *       | Version | Date       | Description    |
 *       |---------|------------|----------------|
 *       | 01      | 2025-Jan-15| Initial version|
 *
 *     tags:
 *      - Case Management
 *     parameters:
 *       - in: query
 *         name: Rule
 *         required: true
 *         schema:
 *           type: string
 *           example: "PEO TV"
 *         description: Rule to filter cases.
 *       - in: query
 *         name: Case_Status
 *         required: false
 *         schema:
 *           type: string
 *           example: "Open No Agent"
 *         description: The status of the case to filter by.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Rule:
 *                 type: string
 *                 description: The rule to filter cases by.
 *                 example: "PEO TV"
 *               Case_Status:
 *                 type: string
 *                 description: Case Status to filter cases by
 *                 example: "Open No Agent"
 *     responses:
 *       200:
 *         description: Successfully retrieved Open No Agent count by arrears bands.
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
 *                   example: Successfully retrieved arrears band counts for rule - PEO TV.
 *                 data:
 *                   type: object
 *                   properties:
 *                     "AB-5_10":
 *                       type: integer
 *                       example: 10
 *                     "AB-10_25":
 *                       type: integer
 *                       example: 5
 *                     "AB-25_50":
 *                       type: integer
 *                       example: 3
 *                     "AB-50_100":
 *                       type: integer
 *                       example: 1
 *                     "AB-100-9999":
 *                       type: integer
 *                       example: 2
 *       400:
 *         description: Validation error due to missing or invalid fields.
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
 *                   example: Failed to retrieve Open No Agent count.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     description:
 *                       type: string
 *                       example: "Rule is a required field."
 *       500:
 *         description: Internal server error or database error.
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
 *                   example: Failed to retrieve arrears band counts.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: "An unexpected error occurred. Please try again later."
 */

router.post("/Open_No_Agent_Count_Arrears_Band_By_Rulebase", openNoAgentCountArrearsBandByServiceType);

/**
 * @swagger
 * tags:
 *   - name: Case Management
 *     description: Case-related endpoints, allowing management and retrieval of case details.
 *
 * /api/case/List_Cases:
 *   post:
 *     summary: C-1G11 Retrieve Open No Agent Cases
 *     description: |
 *       Retrieves case details with the status "Open No Agent" for a specific date range where filtered reason is NULL. 
 *
 *       | Version | Date       | Description    |
 *       |---------|------------|----------------|
 *       | 01      | 2025-Jan-19| Initial version|
 *
 *     tags:
 *      - Case Management
 *     parameters:
 *       - in: query
 *         name: From_Date
 *         required: true
 *         schema:
 *           type: string
 *           example: "2025-01-11"
 *         description:  From date to filter cases by.
 *       - in: query
 *         name: To_Date
 *         required: true
 *         schema:
 *           type: string
 *           example: "2025-01-12"
 *         description:  To date to filter cases by.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - From_Date
 *               - To_Date
 *             properties:
 *               From_Date:
 *                 type: string
 *                 format: date
 *                 description: From date to filter cases by.
 *                 example: "2025-01-11"
 *               To_Date:
 *                 type: string
 *                 format: date
 *                 description: To date to filter cases by.
 *                 example: "2025-01-12"
 *     responses:
 *       200:
 *         description: Successfully retrieved Open No Agent case details.
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
 *                   example: Successfully retrieved Open No Agent case details.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       case_id:
 *                         type: integer
 *                       created_dtm:
 *                         type: string
 *                         format: date-time
 *                       account_no:
 *                         type: integer
 *                       customer_ref:
 *                         type: string
 *                       area:
 *                         type: string
 *                       rtom:
 *                         type: string
 *                       current_arrears_amount:
 *                         type: integer
 *                       action_type:
 *                         type: string
 *                       last_payment_dtm:
 *                         type: string
 *                         format: date-time
 *                       case_current_status:
 *                         type: string
 *       400:
 *         description: Validation error due to missing or invalid fields.
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
 *                   example: Failed to retrieve Open No Agent case details.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     description:
 *                       type: string
 *                       example: "From_Date and To_Date are required fields."
 *       500:
 *         description: Internal server error or database error.
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
 *                   example: Failed to retrieve case details.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: "An unexpected error occurred. Please try again later."
 */
router.post("/List_Cases", listCases);


/**
 * @swagger
 * /api/case/Case_Status:
 *   post:
 *     summary: C-1P44 Retrieve Latest Case Status by Case ID
 *     description: |
 *       Retrieve the latest status of a case by the provided `Case_ID`.
 *       Includes details such as the status reason, created date, and expiration date.
 *
 *       | Version | Date        | Description                     | Changed By       |
 *       |---------|-------------|---------------------------------|------------------|
 *       | 01      | 2025-Jan-19 | Retrieve Latest Case Status     | Dinusha Anupama        |
 *
 *     tags: [Case Management]
 *     parameters:
 *       - in: query
 *         name: Case_ID
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1005
 *         description: ID of the Case to retrieve the latest status for.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Case_ID
 *             properties:
 *               Case_ID:
 *                 type: integer
 *                 description: The ID of the Case whose latest status is to be retrieved.
 *                 example: 1005
 *     responses:
 *       200:
 *         description: Latest case status retrieved successfully.
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
 *                   example: Latest case status retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     case_id:
 *                       type: integer
 *                       example: 1005
 *                     case_status:
 *                       type: string
 *                       example: Case_Close
 *                     status_reason:
 *                       type: string
 *                       example: New case 2
 *                     created_dtm:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-13T10:00:00.000Z"
 *                     created_by:
 *                       type: string
 *                       example: System
 *                     notified_dtm:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-11T10:00:00.000Z"
 *                     expire_dtm:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-01T00:00:00.000Z"
 *       400:
 *         description: Validation error - Case_ID not provided.
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
 *                   example: Case_ID is required.
 *       404:
 *         description: Case not found or no status available.
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
 *                   example: "No case status found for the given case."
 *       500:
 *         description: Database or internal server error.
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
 *                   example: Failed to retrieve case status.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     exception:
 *                       type: string
 *                       example: Detailed error message.
 */

router.post("/Case_Status", Case_Status);


/**
 * @swagger
 * /api/case/Case_List:
 *   post:
 *     summary: C-1P43 Retrieve List of Cases by Account Number
 *     description: |
 *       Retrieve a list of cases associated with a specific account number.
 *       Includes detailed case information and status history.
 *
 *       | Version | Date        | Description                 | Changed By       |
 *       |---------|-------------|-----------------------------|------------------|
 *       | 01      | 2025-Jan-19 | Retrieve List of Cases      | Dinusha Anupama      |
 *
 *     tags: [Case Management]
 *     parameters:
 *       - in: query
 *         name: account_no
 *         required: true
 *         schema:
 *           type: integer
 *           example: 46236534
 *         description: Account number to retrieve associated cases for.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - account_no
 *             properties:
 *               account_no:
 *                 type: integer
 *                 description: The account number for which the cases are to be retrieved.
 *                 example: 46236534
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
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The unique identifier for the case.
 *                         example: a67b89c1d234e567f8901234
 *                       case_id:
 *                         type: integer
 *                         description: Unique ID of the case.
 *                         example: 200
 *                       created_dtm:
 *                         type: string
 *                         format: date-time
 *                         description: The date and time the case was created.
 *                         example: "2025-01-10T12:00:00.000Z"
 *                       account_no:
 *                         type: integer
 *                         description: Associated account number.
 *                         example: 46236534
 *                       customer_ref:
 *                         type: string
 *                         description: Customer reference.
 *                         example: CR004241061
 *                       area:
 *                         type: string
 *                         description: Area associated with the case.
 *                         example: Matara
 *                       rtom:
 *                         type: string
 *                         description: RTOM region for the case.
 *                         example: MA
 *                       current_arrears_amount:
 *                         type: number
 *                         description: Current arrears amount for the case.
 *                         example: 5500
 *                       action_type:
 *                         type: string
 *                         description: Action type associated with the case.
 *                         example: AT002
 *                       monitor_months:
 *                         type: integer
 *                         description: Number of months under monitoring.
 *                         example: 2
 *                       commission:
 *                         type: number
 *                         nullable: true
 *                         description: Commission details.
 *                         example: null
 *                       case_current_status:
 *                         type: string
 *                         description: Current status of the case.
 *                         example: Open with Agent
 *                       case_status:
 *                         type: array
 *                         description: History of status updates for the case.
 *                         items:
 *                           type: object
 *                           properties:
 *                             status_reason:
 *                               type: string
 *                               description: Reason for the status.
 *                               example: Legal team decision
 *                             created_by:
 *                               type: string
 *                               description: User who created the status.
 *                               example: Agent005
 *                             notified_dtm:
 *                               type: string
 *                               format: date-time
 *                               description: Notification timestamp for the status.
 *                               example: "2024-11-05T00:00:00.000Z"
 *       400:
 *         description: Validation error - Account number not provided.
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
 *                   example: Account number is required.
 *       404:
 *         description: No cases found for the specified account number.
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
 *                   example: No cases found for account number 46236534.
 *       500:
 *         description: Database or internal server error.
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
 *                   example: Failed to retrieve cases.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     exception:
 *                       type: string
 *                       example: Detailed error message.
 */

router.post("/Case_List", Case_List);


/**
 * @swagger
 * /api/case/Acivite_Case_Details:
 *   post:
 *     summary: C-1P42 Retrieve Active Case Details by Account Number
 *     description: |
 *       Retrieve a list of active cases associated with a specific account number.
 *       Active cases are those where the latest status is not in the excluded statuses:
 *       `Write_Off`, `Abandoned`, `Case_Close`, `Withdraw`.
 *
 *       | Version | Date        | Description                     | Changed By       |
 *       |---------|-------------|---------------------------------|------------------|
 *       | 01      | 2025-Jan-19 | Retrieve Active Case Details    | Dinusha Anupama        |
 *
 *     tags: [Case Management]
 *     parameters:
 *       - in: query
 *         name: account_no
 *         required: true
 *         schema:
 *           type: integer
 *           example: 54321
 *         description: Account number to retrieve associated active cases for.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - account_no
 *             properties:
 *               account_no:
 *                 type: integer
 *                 description: The account number for which active cases are to be retrieved.
 *                 example: 54321
 *     responses:
 *       200:
 *         description: Active cases retrieved successfully.
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
 *                   example: Active cases retrieved successfully.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The unique identifier for the case.
 *                         example: 6788b883bb5a2e0b24a12ea6
 *                       case_id:
 *                         type: integer
 *                         description: Unique ID of the case.
 *                         example: 1003
 *                       incident_id:
 *                         type: integer
 *                         description: Incident ID associated with the case.
 *                         example: 2
 *                       account_no:
 *                         type: integer
 *                         description: Associated account number.
 *                         example: 54321
 *                       customer_ref:
 *                         type: string
 *                         description: Customer reference.
 *                         example: CUST123
 *                       created_dtm:
 *                         type: string
 *                         format: date-time
 *                         description: The date and time the case was created.
 *                         example: "2025-01-16T10:00:00.000Z"
 *                       implemented_dtm:
 *                         type: string
 *                         format: date-time
 *                         description: The date and time the case was implemented.
 *                         example: "2025-01-02T15:00:00.000Z"
 *                       area:
 *                         type: string
 *                         description: Area associated with the case.
 *                         example: Central
 *                       rtom:
 *                         type: string
 *                         description: RTOM region for the case.
 *                         example: Region A
 *                       bss_arrears_amount:
 *                         type: number
 *                         description: BSS arrears amount.
 *                         example: 1500.5
 *                       current_arrears_amount:
 *                         type: number
 *                         description: Current arrears amount.
 *                         example: 1200.75
 *                       action_type:
 *                         type: string
 *                         description: Action type associated with the case.
 *                         example: Recovery
 *                       last_payment_date:
 *                         type: string
 *                         format: date-time
 *                         description: The date of the last payment.
 *                         example: "2024-12-31T00:00:00.000Z"
 *                       monitor_months:
 *                         type: integer
 *                         description: Number of months under monitoring.
 *                         example: 3
 *                       last_bss_reading_date:
 *                         type: string
 *                         format: date-time
 *                         description: Date of the last BSS reading.
 *                         example: "2024-12-30T00:00:00.000Z"
 *                       commission:
 *                         type: number
 *                         nullable: true
 *                         description: Commission details.
 *                         example: 10.5
 *                       case_current_status:
 *                         type: string
 *                         description: Current status of the case.
 *                         example: Discard Approved
 *                       filtered_reason:
 *                         type: string
 *                         nullable: true
 *                         description: Reason for filtering the case.
 *                         example: No agent available for assignment
 *                       case_status:
 *                         type: array
 *                         description: History of status updates for the case.
 *                         items:
 *                           type: object
 *                           properties:
 *                             case_status:
 *                               type: string
 *                               description: Current status of the case.
 *                               example: Open
 *                             status_reason:
 *                               type: string
 *                               description: Reason for the status.
 *                               example: New case
 *                             created_dtm:
 *                               type: string
 *                               format: date-time
 *                               description: The date the status was created.
 *                               example: "2025-01-01T10:00:00.000Z"
 *                             created_by:
 *                               type: string
 *                               description: User who created the status.
 *                               example: System
 *                             notified_dtm:
 *                               type: string
 *                               format: date-time
 *                               description: Notification timestamp for the status.
 *                               example: "2025-01-01T10:15:00.000Z"
 *                             expire_dtm:
 *                               type: string
 *                               format: date-time
 *                               nullable: true
 *                               description: Expiration timestamp for the status.
 *                               example: "2025-07-01T00:00:00.000Z"
 *       400:
 *         description: Validation error - Account number not provided.
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
 *                   example: Account number is required.
 *       404:
 *         description: No active cases found for the specified account number.
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
 *                   example: No active cases found for account number 54321.
 *       500:
 *         description: Database or internal server error.
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
 *                   example: Failed to retrieve active cases.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     exception:
 *                       type: string
 *                       example: Detailed error message.
 */

router.post("/Acivite_Case_Details", Acivite_Case_Details);

export default router;