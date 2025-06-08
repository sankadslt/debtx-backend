/* Purpose: This template is used for the RO Routes.
Created Date: 2024-12-03
Created By: Dinusha Anupama (dinushanupama@gmail.com)
Last Modified Date: 2024-12-08
Modified By: Dinusha Anupama (dinushanupama@gmail.com)
Version: Node.js v20.11.1
Dependencies: express
Related Files: RO_controller.js
Notes:  */

// import express from "express";
import { Router } from "express";

import { 
    getRODetails, 
    getRODetailsByID, 
    Change_RO_Status, 
    getRODetailsByDrcID, 
    getActiveRODetailsByDrcID, 
    RegisterRO, Suspend_RTOM_From_RO, 
    List_All_RTOM_Ownned_By_RO, 
    List_Active_RTOM_Ownned_By_RO,
    Issue_RTOM_To_RO, 
    EditRO,
    Suspend_Ro, 
    listDRCAllCases, 
    CreateRO , 
    List_RO_Details_Owen_By_DRC_ID, 
    listROAllCases, 
    listROInfoByROId, 
    Terminate_RO,
    List_All_RO_and_DRCuser_Details_to_DRC,
    List_All_RO_and_DRCuser_Details_to_SLT  } from "../controllers/RO_controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Recovery Officer
 *   description: API endpoints for managing recovery officers
 */


/**
 * @swagger
 * /api/recovery_officer/RO_Details:
 *   get:
 *     summary: RO-2G01 Retrieve Recovery Officers
 *     description: |
 *       Retrieve all Recovery Officers and their details, including their assigned RTOMs and remarks.
 * 
 *       | Version | Date        | Description                           | Changed By       |
 *       |---------|-------------|---------------------------------------|------------------|
 *       | 01      | 2024-Dec-24 | Retrieve all Recovery Officers details | Dinusha Anupama |
 * 
 *     tags: [Recovery Officer]
 *     responses:
 *       200:
 *         description: Recovery Officer(s) retrieved successfully.
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
 *                   example: Recovery Officer(s) retrieved successfully.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       ro_id:
 *                         type: integer
 *                         example: 56
 *                       ro_name:
 *                         type: string
 *                         example: Supun
 *                       ro_contact_no:
 *                         type: string
 *                         example: 0118848588
 *                       drc_name:
 *                         type: string
 *                         example: Example Company
 *                       ro_status:
 *                         type: string
 *                         enum: [Active, Inactive]
 *                         example: Active
 *                       login_type:
 *                         type: string
 *                         example: Facebook
 *                       login_user_id:
 *                         type: string
 *                         example: fghydgf55
 *                       remark:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: "Changed login type"
 *                       ro_nic:
 *                         type: string
 *                         example: 20047788441
 *                       ro_end_date:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-12-25T00:00:00.000Z
 *                       rtoms_for_ro:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: Hambantota
 *                             status:
 *                               type: string
 *                               enum: [Active, Inactive, Pending]
 *                               example: Active
 *                             _id:
 *                               type: string
 *                               example: 676a7b3a24bbfb9bb23cd213
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-12-24T09:13:30.638Z
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-12-24T09:25:26.730Z
 *       404:
 *         description: No Recovery Officer(s) found.
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
 *                   example: No Recovery Officer(s) found.
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
 *                   example: Internal server error.
 *                 error:
 *                   type: string
 *                   example: Detailed error message here.
 */
// Route to retrieve Recovery Officer details
router.get("/RO_Details", (req, res) => { getRODetails(req, res); });

/**
 * @swagger
 * /api/recovery_officer/RO_Details_By_ID:
 *   post:
 *     summary: RO-2P02 Retrieve Recovery Officer by ID
 *     description: |
 *       Retrieve a Recovery Officer's details by the provided `ro_id`.
 *       Includes assigned RTOMs, each with an associated `rtom_id`.
 *
 *       | Version | Date        | Description                     | Changed By       |
 *       |---------|-------------|---------------------------------|------------------|
 *       | 01      | 2024-Dec-14 | Retrieve Recovery Officer by ID | Dinusha Anupama  |
 *
 *     tags: [Recovery Officer]
 *     parameters:
 *       - in: query
 *         name: ro_id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 57
 *         description: ID of the Recovery OFficer.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ro_id
 *             properties:
 *               ro_id:
 *                 type: integer
 *                 description: The ID of the Recovery Officer whose details are to be retrieved.
 *                 example: 57
 *     responses:
 *       200:
 *         description: Recovery Officer details retrieved successfully.
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
 *                   example: Recovery Officer retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     ro_id:
 *                       type: integer
 *                       example: 57
 *                     ro_name:
 *                       type: string
 *                       example: sadun
 *                     ro_contact_no:
 *                       type: string
 *                       example: "0118848589"
 *                     drc_name:
 *                       type: string
 *                       example: Example Company
 *                     ro_status:
 *                       type: string
 *                       enum: [Active, Inactive]
 *                       example: Active
 *                     login_type:
 *                       type: string
 *                       example: Google
 *                     login_user_id:
 *                       type: string
 *                       example: fghydgf55
 *                     remark:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Changed login type,", "Changed Number"]
 *                     ro_nic:
 *                       type: string
 *                       example: 20047788441
 *                     ro_end_date:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-25T00:00:00.000Z"
 *                     rtoms_for_ro:
 *                       type: array
 *                       description: List of assigned RTOMs with their IDs and details.
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: Hambantota
 *                           status:
 *                             type: string
 *                             example: Active
 *                           _id:
 *                             type: string
 *                             example: 676a807b5f47591c94e18ad9
 *                           rtom_id:
 *                             type: integer
 *                             example: 1
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-24T09:35:55.126Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-24T09:41:37.835Z"
 *       400:
 *         description: Validation error - ro_id not provided.
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
 *                   example: ro_id is required.
 *       404:
 *         description: Recovery Officer not found.
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
 *                   example: "No Recovery Officer found with ro_id: 57."
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
 *                   example: Internal server error.
 *                 error:
 *                   type: string
 *                   example: Detailed error message.
 */
// Route to retrieve Recovery Officer details by ID
router.post("/RO_Details_By_ID", getRODetailsByID);

/**
 * @swagger
 * /api/recovery_officer/Change_RO_Status:
 *   patch:
 *     summary: RO-1A01 Suspend Recovery Officer
 *     description: |
 *       Update the status of a Recovery Officer using their `ro_id`.
 * 
 *       | Version | Date        | Description                     | Change By        |
 *       |---------|-------------|---------------------------------|------------------|
 *       | 01      | 2024-Dec-24 | Suspend Recovery Officer Status | Ravindu pathum   |
 * 
 *     tags: [Recovery Officer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ro_id
 *               - ro_status
 *             properties:
 *               ro_id:
 *                 type: integer
 *                 example: 1
 *                 description: The ID of the Recovery Officer to be updated.
 *               ro_status:
 *                 type: string
 *                 example: Inactive
 *                 description: The new status of the Recovery Officer.
 *     responses:
 *       200:
 *         description: Recovery Officer status updated successfully
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
 *                   example: Recovery Officer status updated successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     matchedCount:
 *                       type: integer
 *                       example: 1
 *                     modifiedCount:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Bad Request - Missing required fields or Recovery Officer not found
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
 *                   example: Recovery Officer not found in MongoDB.
 *       500:
 *         description: Database or internal server error
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
 */
// Route to change the status of RO
router.patch("/Change_RO_Status", Change_RO_Status);

/**
 * @swagger
 * /api/recovery_officer/Suspend_Ro:
 *   patch:
 *     summary: Suspend Recovery Officer
 *     description: |
 *       Suspend a Recovery Officer by updating their status to 'Inactive', setting an end date, and adding a remark.
 * 
 *       | Version | Date        | Description                   | Change By        |
 *       |---------|-------------|-------------------------------|------------------|
 *       | 01      | 2024-Dec-24 | Suspend Recovery Officer      | Ravindu pathum   |
 * 
 *     tags: [Recovery Officer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ro_id
 *               - ro_remark
 *             properties:
 *               ro_id:
 *                 type: integer
 *                 example: 1
 *                 description: The ID of the Recovery Officer to be suspended.
 *               ro_remark:
 *                 type: string
 *                 example: "Violation of policies."
 *                 description: The remark for suspending the Recovery Officer.
 *     responses:
 *       200:
 *         description: Recovery Officer suspended successfully
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
 *                   example: The Recovery Officer has been suspended.
 *                 data:
 *                   type: object
 *                   properties:
 *                     matchedCount:
 *                       type: integer
 *                       example: 1
 *                     modifiedCount:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Bad Request - Missing required fields or Recovery Officer not found
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
 *                   example: Recovery Officer not found in MongoDB.
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
 */
router.patch("/Suspend_Ro", Suspend_Ro);

/**
 * @swagger
 * /api/recovery_officer/Suspend_RTOM_From_RO:
 *   post:
 *     summary: Suspend RTOM From Recovery Officer
 *     description: |
 *       Update the status of an RTOM for a specific Recovery Officer using `ro_id` and `rtom_id`.
 * 
 *       | Version | Date        | Description                         | Changed By        |
 *       |---------|-------------|-------------------------------------|-------------------|
 *       | 02      | 2024-Dec-16 | Enhanced validation and update logic | Ravindu Pathum    |
 * 
 *     tags: [Recovery Officer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ro_id
 *               - rtom_id
 *             properties:
 *               ro_id:
 *                 type: integer
 *                 example: 2
 *                 description: The ID of the Recovery Officer.
 *               rtom_id:
 *                 type: integer
 *                 example: 5
 *                 description: The ID of the RTOM associated with the Recovery Officer.
 *     responses:
 *       200:
 *         description: RTOM status updated successfully
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
 *                   example: RTOM status updated successfully.
 *                 data:
 *                   type: object
 *                   description: Updated Recovery Officer details.
 *       400:
 *         description: Bad Request - Missing or invalid fields
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
 *                   example: ro_id, rtom_name, and new_status are required.
 *       404:
 *         description: RTOM or Recovery Officer not found
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
 *                   example: Recovery Officer or RTOM not found.
 *       500:
 *         description: Database or internal server error
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
 */
//Route to update the profile details of recovery officer
router.post("/Suspend_RTOM_From_RO", Suspend_RTOM_From_RO);

/**
 * @swagger
 * /api/recovery_officer/List_All_RTOM_Ownned_By_RO:
 *   post:
 *     summary: RO-2P07 List All RTOM Owned By Recovery Officer
 *     description: |
 *       Retrieve all RTOM areas owned by a specific Recovery Officer using `ro_id`.
 * 
 *       | Version | Date        | Description                         | Changed By        |
 *       |---------|-------------|-------------------------------------|-------------------|
 *       | 01      | 2024-Dec-17 | List all RTOM areas for a Recovery Officer | Ravindu Pathum |
 * 
 *     tags: [Recovery Officer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ro_id
 *             properties:
 *               ro_id:
 *                 type: integer
 *                 example: 2
 *                 description: The ID of the Recovery Officer.
 *     responses:
 *       200:
 *         description: RTOM areas retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: RTOM areas retrieved successfully.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: Hambantota
 *       400:
 *         description: Bad Request - Missing or invalid `ro_id`
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: ro_id is required.
 *       404:
 *         description: No RTOMs found for the provided Recovery Officer ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No RTOMs found for the given ro_id.
 *       500:
 *         description: Database or internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error.
 *                 error:
 *                   type: string
 *                   example: Error message details here.
 */
// Route to list all RTOMs owned by a recovery officer
router.post("/List_All_RTOM_Ownned_By_RO", List_All_RTOM_Ownned_By_RO);

/**
 * @swagger
 * /api/recovery_officer/List_Active_RTOM_Ownned_By_RO:
 *   post:
 *     summary: RO-2P08 List Active RTOM Owned By Recovery Officer
 *     description: |
 *       Retrieve all active RTOM areas owned by a specific Recovery Officer using `ro_id`.
 * 
 *       | Version | Date        | Description                                  | Changed By        |
 *       |---------|-------------|----------------------------------------------|-------------------|
 *       | 01      | 2024-Dec-16 | List all active RTOM areas for a Recovery Officer | Ravindu Pathum |
 * 
 *     tags: [Recovery Officer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ro_id
 *             properties:
 *               ro_id:
 *                 type: integer
 *                 example: 2
 *                 description: The ID of the Recovery Officer.
 *     responses:
 *       200:
 *         description: Active RTOM areas retrieved successfully
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
 *                   example: RTOM areas retrieved successfully.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: Hambantota
 *                       status:
 *                         type: string
 *                         example: Active
 *                       rtom_id:
 *                         type: integer
 *                         example: 101
 *       400:
 *         description: Bad Request - Missing or invalid `ro_id`
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
 *                   example: ro id is required.
 *       404:
 *         description: No active RTOMs found for the provided Recovery Officer ID
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
 *                   example: No RTOMs found for the given ro_id.
 *       500:
 *         description: Database or internal server error
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
 *                 error:
 *                   type: string
 *                   example: Error message details here.
 */
// Route to list all active RTOMs owned by a recovery officer
router.post("/List_Active_RTOM_Ownned_By_RO",List_Active_RTOM_Ownned_By_RO);

/**
 * @swagger
 * /api/recovery_officer/List_RO_Owned_By_DRC:
 *   post:
 *     summary: RO-2P03 Retrieve Recovery Officers by DRC ID
 *     description: |
 *       Retrieve all Recovery Officers assigned to a specific Debt Recovery Company (DRC) by the provided `drc_id`.
 * 
 *       | Version | Date        | Description                        | Change By        |
 *       |---------|-------------|------------------------------------|------------------|
 *       | 01      | 2024-Dec-15 | Retrieve Recovery Officers by DRC ID | Dinusha Anupama  |
 * 
 *     tags: [Recovery Officer]
 *     parameters:
 *       - in: query
 *         name: drc_id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 10
 *         description: ID of the Debt Recovery Company.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - drc_id
 *             properties:
 *               drc_id:
 *                 type: integer
 *                 description: The ID of the Debt Recovery Company whose Recovery Officers are to be retrieved.
 *                 example: 10
 *     responses:
 *       200:
 *         description: Recovery Officers retrieved successfully.
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
 *                   example: Recovery Officers retrieved successfully.
 *                 data:
 *                   type: array
 *                   description: List of Recovery Officers.
 *                   items:
 *                     type: object
 *                     properties:
 *                       ro_id:
 *                         type: integer
 *                         example: 1
 *                       ro_name:
 *                         type: string
 *                         example: John Doe
 *                       ro_contact_no:
 *                         type: string
 *                         example: "1234567890"
 *                       drc_id:
 *                         type: integer
 *                         example: 101
 *                       ro_status:
 *                         type: string
 *                         enum: [Active, Inactive]
 *                         example: Active
 *                       login_type:
 *                         type: string
 *                         example: Admin
 *                       login_user_id:
 *                         type: string
 *                         example: "112233"
 *                       remark:
 *                         type: string
 *                         example: "Remark about the officer."
 *       400:
 *         description: Validation error - drc_id not provided.
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
 *                   example: drc_id is required.
 *       404:
 *         description: No Recovery Officers found for the given DRC ID.
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
 *                   example: "No Recovery Officers found for drc_id: 101."
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
 *                   example: Database error or internal server error.
 *                 error:
 *                   type: string
 *                   example: Detailed error message.
 */
// Route to retrieve recovery officer details by DRC ID
router.post("/List_RO_Owned_By_DRC", getRODetailsByDrcID);

/**
 * @swagger
 * /api/recovery_officer/List_Active_RO_Owned_By_DRC:
 *   post:
 *     summary: RO-2P04 Retrieve Active Recovery Officers by DRC ID
 *     description: |
 *       Retrieve all active Recovery Officers assigned to a specific Debt Recovery Company (DRC) by the provided `drc_id`.
 * 
 *       | Version | Date        | Description                               | Change By        |
 *       |---------|-------------|-------------------------------------------|------------------|
 *       | 01      | 2024-Dec-15 | Retrieve Active Recovery Officers by DRC ID | Dinusha Anupama  |
 * 
 *     tags: [Recovery Officer]
 *     parameters:
 *       - in: query
 *         name: drc_id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 7
 *         description: ID of the Debt Recovery Company.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - drc_id
 *             properties:
 *               drc_id:
 *                 type: integer
 *                 description: The ID of the Debt Recovery Company whose active Recovery Officers are to be retrieved.
 *                 example: 7
 *     responses:
 *       200:
 *         description: Active Recovery Officers retrieved successfully.
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
 *                   example: Active Recovery Officers retrieved successfully.
 *                 data:
 *                   type: array
 *                   description: List of active Recovery Officers.
 *                   items:
 *                     type: object
 *                     properties:
 *                       ro_id:
 *                         type: integer
 *                         example: 1
 *                       ro_name:
 *                         type: string
 *                         example: Jane Doe
 *                       ro_contact_no:
 *                         type: string
 *                         example: "0987654321"
 *                       drc_id:
 *                         type: integer
 *                         example: 101
 *                       ro_status:
 *                         type: string
 *                         example: Active
 *                       login_type:
 *                         type: string
 *                         example: Admin
 *                       login_user_id:
 *                         type: string
 *                         example: "223344"
 *                       remark:
 *                         type: string
 *                         example: "Remark about the active officer."
 *       400:
 *         description: Validation error - drc_id not provided.
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
 *                   example: drc_id is required.
 *       404:
 *         description: No active Recovery Officers found for the given DRC ID.
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
 *                   example: "No active Recovery Officers found for drc_id: 101."
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
 *                   example: Database error or internal server error.
 *                 error:
 *                   type: string
 *                   example: Detailed error message.
 */
// Route to retrieve active recovery officer details by DRC ID
router.post("/List_Active_RO_Owned_By_DRC", getActiveRODetailsByDrcID);

/**
 * @swagger
 * /api/recovery_officer/Issue_RTOM_To_RO:
 *   post:
 *     summary: RO-2P05 Assign RTOM to Recovery Officer
 *     description: |
 *       Assign an RTOM area to a specific Recovery Officer using their `ro_id` and `rtom_id`.
 * 
 *       | Version | Date        | Description                  | Changed By        |
 *       |---------|-------------|------------------------------|-------------------|
 *       | 01      | 2024-Dec-20 | Assign RTOM to Recovery Officer | Ravindu Pathum |
 * 
 *     tags: [Recovery Officer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ro_id
 *               - rtom_id
 *             properties:
 *               ro_id:
 *                 type: integer
 *                 example: 2
 *                 description: The ID of the Recovery Officer.
 *               rtom_id:
 *                 type: integer
 *                 example: 10
 *                 description: The ID of the RTOM to be assigned.
 *     responses:
 *       200:
 *         description: RTOM assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: RTOM assigned successfully.
 *                 updatedRO:
 *                   type: object
 *                   properties:
 *                     ro_id:
 *                       type: integer
 *                       example: 2
 *                     rtoms_for_ro:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: Hambantota
 *                           status:
 *                             type: string
 *                             example: Active
 *       400:
 *         description: |
 *           Bad Request - This status code may occur in the following cases:
 *           1. Missing or invalid `ro_id` or `rtom_id` in the request body.
 *           2. RTOM with this name already exists for the specified Recovery Officer.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: RO ID and RTOM ID are required.
 *       404:
 *         description: Recovery Officer or RTOM not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: RO not found or RTOM not found.
 *       500:
 *         description: Database or internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error.
 *                 error:
 *                   type: string
 *                   example: Error message details here.
 */
// Route to add the RTOM to recovery officer
router.post("/Issue_RTOM_To_RO",Issue_RTOM_To_RO);

/**
 * @swagger
 * /api/recovery_officer/Register_RO:
 *   post:
 *     summary: RO-1P01 Register a Recovery Officer
 *     description: |
 *       Registers a new Recovery Officer in MongoDB.
 * 
 *       | Version | Date        | Description                          | Changed By      |
 *       |---------|-------------|--------------------------------------|-----------------|
 *       | 01      | 2024-Dec-23 | Register a new Recovery Officer      | Dinusha Anupama |
 * 
 *     tags: [Recovery Officer]
  *     parameters:
 *       - in: query
 *         name: ro_name
 *         required: true
 *         schema:
 *           type: string
 *           example: Kasun
 *         description: Name of the Recovery Officer.
 *       - in: query
 *         name: ro_contact_no
 *         required: true
 *         schema:
 *           type: integer
 *           example: 0778542458
 *         description: Contact number of the Recovery Officer.
 *       - in: query
 *         name: drc_id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID of the Debt Recovery Company.
 *       - in: query
 *         name: login_type
 *         required: true
 *         schema:
 *           type: string
 *           example: Google
 *         description: Login type (e.g., Google, Facebook).
 *       - in: query
 *         name: login_user_id
 *         required: true
 *         schema:
 *           type: string
 *           example: 452145bgdf@4dfhg
 *         description: Unique identifier for the user.
 *       - in: query
 *         name: ro_nic
 *         required: true
 *         schema:
 *           type: string
 *           example: 200577884466
 *         description: NIC of the Recovery Officer.
 *       - in: query
 *         name: ro_end_date
 *         schema:
 *           type: date
 *           example: ""
 *         description: End date of the Recovery Officer's tenure. Leave empty if not applicable.
 *       - in: query
 *         name: rtoms_for_ro
 *         required: true
 *         schema:
 *           type: array
 *           example: 1
 *         description: List of RTOMs assigned to the Recovery Officer..
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ro_name
 *               - ro_contact_no
 *               - drc_id
 *               - login_type
 *               - login_user_id
 *               - ro_nic
 *               - rtoms_for_ro
 *             properties:
 *               ro_name:
 *                 type: string
 *                 description: Name of the Recovery Officer.
 *                 example: "Kaveesha"
 *               ro_contact_no:
 *                 type: string
 *                 description: Contact number of the Recovery Officer.
 *                 example: "0118848587"
 *               drc_id:
 *                 type: integer
 *                 description: The ID of the Debt Recovery Company.
 *                 example: 11
 *               login_type:
 *                 type: string
 *                 description: Login type (e.g., Google, Facebook).
 *                 example: "Google"
 *               login_user_id:
 *                 type: string
 *                 description: Unique identifier for the user.
 *                 example: "85746523"
 *               ro_nic:
 *                 type: string
 *                 description: NIC of the Recovery Officer.
 *                 example: "200122101858"
 *               ro_end_date:
 *                 type: string
 *                 format: date
 *                 description: End date of the Recovery Officer's tenure. Leave empty if not applicable.
 *                 example: ""
 *               rtoms_for_ro:
 *                 type: array
 *                 description: List of RTOMs assigned to the Recovery Officer.
 *                 items:
 *                   type: object
 *                   properties:
 *                     rtom_id:
 *                       type: integer
 *                       description: The RTOM ID.
 *                       example: 1
 *     responses:
 *       201:
 *         description: Recovery Officer registered successfully.
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
 *                   example: Recovery Officer registered successfully in MongoDB.
 *                 data:
 *                   type: object
 *                   properties:
 *                     ro_id:
 *                       type: integer
 *                       example: 58
 *                     ro_name:
 *                       type: string
 *                       example: "Kaveesha"
 *                     ro_contact_no:
 *                       type: string
 *                       example: "0118848587"
 *                     drc_name:
 *                       type: string
 *                       example: "Mobitel"
 *                     rtoms_for_ro:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Hambantota"
 *                           status:
 *                             type: string
 *                             example: "Active"
 *                     ro_status:
 *                       type: string
 *                       example: "Active"
 *                     login_type:
 *                       type: string
 *                       example: "Google"
 *                     login_user_id:
 *                       type: string
 *                       example: "85746523"
 *                     remark:
 *                       type: string
 *                       example: ""
 *                     ro_nic:
 *                       type: string
 *                       example: "200122101858"
 *                     ro_end_date:
 *                       type: string
 *                       format: date
 *                       example: ""
 *                     updatedAt:
 *                       type: string
 *                       example: "2024-12-24T09:46:56.293Z"
 *       400:
 *         description: Validation error - required fields not provided.
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
 *                   example: All required fields must be provided, including RTOMs.
 *       404:
 *         description: DRC or RTOM not found.
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
 *                   example: DRC with id 11 not found.
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
 *                   example: Failed to register Recovery Officer.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     exception:
 *                       type: string
 *                       example: Detailed error message here.
 */
// Route to register recovery officers
router.post("/Register_RO", RegisterRO);

/**
 * @swagger
 * /api/recovery_officer/Change_RO_profile:
 *   patch:
 *     summary: RO-1A02 Edit Recovery Officer Profile
 *     description: |
 *       Updates the profile of an existing Recovery Officer.
 * 
 *       | Version | Date        | Description                        | Changed By      |
 *       |---------|-------------|------------------------------------|-----------------|
 *       | 01      | 2024-Dec-20 | Update Recovery Officer details    | Dinusha Anupama |
 *       | 02      | 2024-Dec-25 | Added new fields (ro_nic, ro_end_date) and updated remark logic | Dinusha Anupama |
 * 
 *     tags: [Recovery Officer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ro_id
 *             properties:
 *               ro_id:
 *                 type: integer
 *                 description: ID of the Recovery Officer to update.
 *                 example: 57
 *               remark:
 *                 type: array
 *                 description: New remark added to the array.
 *                 example: "Edited RO"
 *     responses:
 *       200:
 *         description: Recovery Officer updated successfully.
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
 *                   example: Recovery Officer updated successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: Unique identifier for the Recovery Officer.
 *                       example: "676a807b5f47591c94e18ad8"
 *                     ro_id:
 *                       type: integer
 *                       example: 57
 *                     ro_name:
 *                       type: string
 *                       example: "sadun"
 *                     ro_contact_no:
 *                       type: string
 *                       example: "0118848589"
 *                     ro_status:
 *                       type: string
 *                       example: "Active"
 *                     drc_name:
 *                       type: string
 *                       example: "Example Company"
 *                     rtoms_for_ro:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Hambantota"
 *                           status:
 *                             type: string
 *                             example: "Active"
 *                           _id:
 *                             type: string
 *                             example: "676a807b5f47591c94e18ad9"
 *                     login_type:
 *                       type: string
 *                       example: "facebook"
 *                     login_user_id:
 *                       type: string
 *                       example: "fghydgf55"
 *                     remark:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "Changed login type"
 *                     ro_nic:
 *                       type: string
 *                       example: "20047788441"
 *                     ro_end_date:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-25T00:00:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-25T09:15:11.197Z"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-24T09:35:55.126Z"
 *                     __v:
 *                       type: integer
 *                       example: 0
 *       400:
 *         description: Validation error - required fields not provided.
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
 *                   example: Recovery Officer ID (ro_id) is required in the body.
 *       404:
 *         description: Recovery Officer not found.
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
 *                   example: Recovery Officer with ID 31 not found.
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
 *                   example: Failed to update Recovery Officer.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     exception:
 *                       type: string
 *                       example: Detailed error message here.
 */
// Route to change recovery officer profile
router.patch("/Change_RO_profile", EditRO);

/**
 * @swagger
 * /api/recovery_officer/List_All_DRC_Negotiation_Cases:
 *   post:
 *     summary: Retrieve all cases assigned to a specific DRC
 *     description: |
 *       Fetches all cases assigned to a DRC within a given date range and optional status filter.
 *
 *       | Version | Date        | Description                        | Changed By            |
 *       |---------|-------------|------------------------------------|-----------------------|
 *       | 01      | 2024-Feb-03 | Initial API for listing cases     | Vishmi Wijewardana    |
 *
 *     tags: [Recovery Officer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - drc_id
 *               - ro_id
 *               - From_DAT
 *               - TO_DAT
 *             properties:
 *               drc_id:
 *                 type: string
 *                 description: Unique ID of the DRC.
 *                 example: "DRC123"
 *               ro_id:
 *                 type: string
 *                 description: Unique ID of the Recovery Officer.
 *                 example: "RO456"
 *               From_DAT:
 *                 type: string
 *                 format: date
 *                 description: Start date for filtering cases.
 *                 example: "2024-01-01"
 *               TO_DAT:
 *                 type: string
 *                 format: date
 *                 description: End date for filtering cases.
 *                 example: "2024-01-31"
 *               case_current_status:
 *                 type: string
 *                 description: Case status filter (e.g., Open, Closed, Pending).
 *                 example: "Open"
 *     responses:
 *       200:
 *         description: List of cases owned by the DRC.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   case_id:
 *                     type: integer
 *                     example: 1001
 *                   drc_id:
 *                     type: string
 *                     example: "DRC123"
 *                   ro_id:
 *                     type: string
 *                     example: "RO456"
 *                   case_details:
 *                     type: string
 *                     example: "Loan default case"
 *                   case_status:
 *                     type: string
 *                     example: "Open"
 *                   assigned_date:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Bad request - required fields missing or invalid format.
 *       500:
 *         description: Internal server error.
 */
router.post("/List_All_DRC_Negotiation_Cases", listDRCAllCases);

router.post("/List_RO_Details_Owen_By_DRC_ID", List_RO_Details_Owen_By_DRC_ID);

router.post("/List_All_RO_Cases", listROAllCases );

router.post("/Create_RO", CreateRO);

//DRC LIST
router.post("/List_RO_Details_Owen_By_DRC_ID", List_RO_Details_Owen_By_DRC_ID);



// After Revamp

router.post('/List_RO_Info_Own_By_RO_Id', listROInfoByROId);

router.post('/Terminate_RO', Terminate_RO);

router.post('/List_All_RO_and_DRCuser_Details_to_DRC', List_All_RO_and_DRCuser_Details_to_DRC);

router.post('/List_All_RO_and_DRCuser_Details_to_SLT', List_All_RO_and_DRCuser_Details_to_SLT);

export default router;
