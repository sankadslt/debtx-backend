/* 
    Purpose: This template is used for the DRC Routes.
    Created Date: 2024-12-12
    Created By: Sasindu Srinayaka (sasindusrinayaka@gmail.com)
    Last Modified Date: 2025-01-24
    Modified By: Sasindu Srinayaka (sasindusrinayaka@gmail.com)
    Version: Node.js v20.11.1
    Dependencies: express
    Related Files: RTOM_controller.js, Rtom.js
    Notes:  
*/

// RTOM_route.mjs
import { Router } from "express";
import { 
    getRTOMDetails,
    getRTOMDetailsById,
    registerRTOM,
    // updateRTOMStatus,
    updateRTOMDetails,
    getAllActiveDRCs,
    getAllROsByRTOMID,
    getAllRTOMsByDRCID,
    getActiveRTOMDetails,
    suspend_RTOM,
} from '../controllers/RTOM_controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: RTOM
 *     description: RTOM-related endpoints, allowing management and registration of RTOMs.
 * 
 * /api/RTOM/RTOM_Details:
 *   get:
 *     summary: RTOM-1P03 Retrieve details of all RTOMs. 
 *     description: |
 *       Retrieve all RTOMs and their details, including their assigned Areas and Contact information.
 *       
 *       | Version | Date       | Description                | Changed By       |
 *       |---------|------------|----------------------------|------------------|
 *       | 01      | 2024-Dec-12| Retrieve all RTOM Details | Sasindu Srinayaka |
 *     tags:
 *       - RTOM
 * 
 *     responses:
 *       200:
 *         description: RTOM(s) details retrieved successfully.
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
 *                   example: RTOM(s) details retrieved successfully.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       rtom_id:
 *                         type: integer
 *                         example: 1
 *                       rtom_abbreviation:
 *                         type: string
 *                         example: MH
 *                       area_name:
 *                         type: string
 *                         example: Matara
 *                       rtom_status:
 *                         type: string
 *                         enum: [Active, Inactive]
 *                         example: Active
 *                       rtom_contact_number:
 *                         type: string
 *                         example: 0712345678
 *                       rtom_fax_number:
 *                         type: string
 *                         example: 0712345678
 *                       updated_rtom:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             action:
 *                               type: string
 *                               example: Updated
 *                             updated_date:
 *                               type: string
 *                               format: date-time
 *                               example: 2024-12-31T00:00:00.000Z
 *                             updated_by:   
 *                               type: string
 *                               example: Sasindu Srinayaka
 *                       created_by:
 *                         type: string
 *                         example: Sasindu Srinayaka
 *                       rtom_end_date:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-07-31T00:00:00.000Z
 *                       created_dtm:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-12-12T00:00:00.000Z
 *       404:
 *         description: No RTOM(s) found.
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
 *                   example: No RTOM(s) found.
 *       500:
 *         description: Internal server error occurred while fetching RTOM details.
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
 *                   example: Internal server error occurred while fetching RTOM details.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     message:
 *                       type: string
 *                       example: Internal server error.
 */
// Route to retrieve RTOM details
router.get('/RTOM_Details', getRTOMDetails);

/**
 * @swagger
 * tags:
 *   - name: RTOM
 *     description: RTOM-related endpoints, allowing management and registration of RTOMs.
 * 
 * /api/RTOM/RTOM_Details_By_ID:
 *   post:
 *     summary: RTOM-1P02 Retrieve details of a specific RTOM by RTOM_ID 
 *     description: |
 *       Retrieve a RTOM's details by the provided `rtom_id`. Includes assigned Areas.
 *       
 *       | Version | Date       | Description               | Changed By       |
 *       |---------|------------|---------------------------|------------------|
 *       | 01      | 2024-Dec-14| Retrieve RTOM Details by ID| Sasindu Srinayaka |
 *     tags:
 *       - RTOM
 *     parameters:
 *       - in: query
 *         name: rtom_id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The ID of the RTOM to be retrieved.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rtom_id:
 *                 type: integer
 *                 description: The ID of the RTOM whose details are to be retrieved.
 *                 example: 1
 *     responses:
 *       200:
 *         description: RTOM details retrieved successfully.
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
 *                   example: RTOM(s) details retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     rtom_id:
 *                       type: integer
 *                       example: 1
 *                     rtom_abbreviation:
 *                       type: string
 *                       example: MH
 *                     area_name:
 *                       type: string
 *                       example: Matara
 *                     rtom_status:
 *                       type: string
 *                       enum: [Active, Inactive]
 *                       example: Active
 *                     rtom_contact_number:
 *                       type: integer
 *                       example: 0712345678
 *                     rtom_fax_number:
 *                       type: integer
 *                       example: 0712345678
 *                     updated_rtom:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           action: 
 *                             type: string
 *                             example: Updated
 *                           updated_date:
 *                             type: string
 *                             format: date-time
 *                             example: 2024-12-31T00:00:00.000Z
 *                           updated_by:   
 *                             type: string
 *                             example: Sasindu Srinayaka
 *                     created_by:
 *                       type: string
 *                       example: Sasindu Srinayaka
 *                     rtom_end_date:
 *                       type: string
 *                       format: date
 *                       example: 2025-07-31
 *                     created_dtm:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-12-12T00:00:00.000Z
 *       400:
 *         description: Validation Error - Invalid or missing RTOM ID.
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
 *                   example: Failed to retrieve RTOM details.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     description:
 *                       type: string
 *                       example: Invalid or missing RTOM ID.
 *       404:
 *         description: RTOM not found.
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
 *                   example: No RTOM data matches the provided ID.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 404
 *                     description:
 *                       type: string
 *                       example: RTOM not found.
 *       500:
 *         description: Internal server error occurred while fetching RTOM details.
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
 *                   example: Failed to retrieve RTOM details.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: Internal server error occurred while fetching RTOM details.
 */
// Route to retrieve RTOM details by ID
router.post("/RTOM_Details_By_ID", getRTOMDetailsById);


/**
 * @swagger
 * tags:
 *   - name: RTOM
 *     description: RTOM-related endpoints, allowing management and registration of RTOMs.
 * 
 * /api/RTOM/Register_RTOM:
 *   post:
 *     summary: RTOM-1P01 Register a new RTOM.
 *     description: |
 *       This endpoint allows you to register a new RTOM.
 *       
 *       | Version | Date       | Description | Changed By       |
 *       |---------|------------|-------------|------------------|
 *       | 01      | 2024-Dec-16| Register a new RTOM | Sasindu Srinayaka |
 *     tags:
 *       - [RTOM]
 *     parameters:
 *       - in: query
 *         name: area_name
 *         required: true
 *         schema:
 *           type: string
 *           example: Matara
 *           description: Name of the RTOM area.
 *       - in: query
 *         name: rtom_abbreviation
 *         required: true
 *         schema:
 *           type: string
 *           example: MH
 *           description: Abbreviation of the RTOM.
 *       - in: query
 *         name: rtom_contact_number
 *         required: true
 *         schema:
 *           type: integer
 *           example: 0712345678
 *         description: Contact number of the RTOM.
 *       - in: query
 *         name: rtom_fax_number
 *         required: true
 *         schema:
 *           type: integer
 *           example: 0712345678
 *         description: Fax number of the RTOM.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               area_name:
 *                 type: string
 *                 description: The name of the area where the RTOM operates.
 *                 example: Matara
 *               rtom_abbreviation:
 *                 type: string
 *                 description: The abbreviation for the RTOM.
 *                 example: MH
 *               rtom_contact_number:
 *                 type: integer
 *                 description: The contact number for the RTOM.
 *                 example: 0712345678
 *               rtom_fax_number:
 *                 type: integer
 *                 description: The fax number for the RTOM.
 *                 example: 0712345678
 *
 *     responses:
 *       200:
 *         description: RTOM registered successfully.
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
 *                   example: RTOM registered successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     rtom_id:
 *                       type: integer
 *                       example: 01
 *                     rtom_abbreviation:
 *                       type: string
 *                       example: MH
 *                     area_name:
 *                       type: string
 *                       example: Matara
 *                     rtom_status:
 *                       type: string
 *                       enum: [Active, Inactive]
 *                       example: Active
 *
 *       400:
 *         description: Failed to register RTOM due to missing fields.
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
 *                   example: Failed to register RTOM due to missing fields.
 *                 errors:
 *                   type: object
*                   properties:
*                     field_name:
*                       type: string
*                       example: All fields are required.
 *
 *
 *
 *       500:
 *         description: Internal server error occurred during registration.
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
 *                   example: Failed to register RTOM.
 *                 errors:
 *                   type: object
*                   properties:
*                     exception:
*                       type: string
*                       example: "Internal server error occurred while registering RTOM."
*
*
*/
// Route to register a new RTOM
router.post("/Register_RTOM", registerRTOM);


// /**
//  * @swagger
//  * tags:
//  *   - name: RTOM
//  *     description: RTOM-related endpoints, allowing management and registration of RTOMs.
//  * 
//  * /api/RTOM/Change_RTOM_Status:
//  *   patch:
//  *     summary: RTOM-1A01 Update the status of an RTOM.
//  *     description: |
//  *       Update the status of a RTOM using their `rtom_id`.
//  *       
//  *       | Version | Date       | Description              | Changed By       |
//  *       |---------|------------|--------------------------|-----------------|
//  *       | 01      | 2024-Dec-19| Updated the RTOM status  | Sasindu Srinayaka|
//  *     tags:
//  *       - [RTOM]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               rtom_id:
//  *                 type: integer
//  *                 example: 01
//  *                 description: Unique identifier of the RTOM.
//  *               rtom_status:
//  *                 type: string
//  *                 example: "Active"
//  *                 enum: [Active, Inactive]
//  *                 description: Updated status for the RTOM.
//  *             required:
//  *               - rtom_id
//  *               - rtom_status
//  * 
//  *     responses:
//  *       200:
//  *         description: RTOM status updated successfully.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: string
//  *                   example: success
//  *                 message:
//  *                   type: string
//  *                   example: RTOM status updated successfully.
//  * 
//  *       400:
//  *         description: Validation Error - missing required parameters.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: string
//  *                   example: error
//  *                 message:
//  *                   type: string
//  *                   example: Failed to update RTOM status.
//  *                 errors:
//  *                   type: object
//  *                   properties:
//  *                     code:
//  *                       type: integer
//  *                       example: 400
//  *                     description:
//  *                       type: string
//  *                       example: RTOM ID and status are required.
//  * 
//  *       404:
//  *         description: RTOM ID not found in Database.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: string
//  *                   example: error
//  *                 message:
//  *                   type: string
//  *                   example: RTOM ID not found in Database.
//  * 
//  *       500:
//  *         description: Internal server error occurred while updating RTOM status.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: string
//  *                   example: error
//  *                 message:
//  *                   type: string
//  *                   example: Failed to update RTOM status.
//  *                 errors:
//  *                   type: object
//  *                   properties:
//  *                     code:
//  *                       type: integer
//  *                       example: 500
//  *                     description:
//  *                       type: string
//  *                       example: Internal server error occurred while updating RTOM status.
//  */
// // Route to update the status of an RTOM
// router.patch("/Change_RTOM_Status", updateRTOMStatus);


/**
 * @swagger
 * tags:
 *   - name: RTOM
 *     description: RTOM-related endpoints, allowing management and registration of RTOMs.
 * 
 * /api/RTOM/Change_RTOM_Details:
 *   patch:
 *     summary: RTOM-1A02 Update the details of an RTOM.
 *     description: |
 *       Updates the abbreviation, area name, contact number, and fax number of an RTOM.
 *       
 *       | Version | Date       | Description              | Changed By       |
 *       |---------|------------|--------------------------|-----------------|
 *       | 01      | 2024-Dec-21| Updated the RTOM details.  | Sasindu Srinayaka |
 *     tags:
 *       - [RTOM]
 * 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rtom_id:
 *                 type: integer
 *                 example: 01
 *                 description: Unique identifier of the RTOM.
 *               rtom_contact_number:
 *                 type: integer
 *                 example: 0712345678
 *                 description: Contact number of the RTOM.
 *               rtom_fax_number:
 *                 type: integer
 *                 example: 0712345678
 *                 description: Fax number of the RTOM.
 *             required:
 *               - rtom_id
 *               - rtom_contact_number
 *               - rtom_fax_number
 * 
 *     responses:
 *       200:
 *         description: RTOM details updated successfully.
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
 *                   example: RTOM details updated successfully.
 * 
 *       400:
 *         description: Validation Error - missing required parameters.
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
 *                   example: Failed to update RTOM details.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     description:
 *                       type: string
 *                       example: RTOM ID, Contact Number and Fax Number are required.
 * 
 *       404:
 *         description: RTOM ID not found in Database.
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
 *                   example: RTOM ID not found in Database.
 * 
 *       500:
 *         description: Internal server error occurred while updating RTOM details.
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
 *                   example: Failed to update RTOM details.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: Internal server error occurred while updating RTOM details.
 */
// Route to update the details of an RTOM
router.patch("/Change_RTOM_Details", updateRTOMDetails);


/**
 * @swagger
 * tags:
 *   - name: RTOM
 *     description: RTOM-related endpoints, allowing management and registration of RTOMs.
 * 
 * /api/RTOM/List_All_DRC_Ownned_By_RTOM:
 *   post:
 *     summary: RTOM-2P01 Get all active DRCs by RTOM ID.
 *     description: |
 *       Retrieve a list of active DRCs associated with a specific RTOM.
 *       
 *       | Version | Date       | Description              | Changed By       |
 *       |---------|------------|--------------------------|-----------------|
 *       | 01      | 2024-Dec-23| List all the DRC Ownned by RTOM  | Sasindu Srinayaka |
 *     tags:
 *       - [RTOM]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rtom_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Active DRCs retrieved successfully.
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
 *                   example: Active DRCs retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     drc:
 *                       type: object
 *                       properties:
 *                         drc_id:
 *                           type: integer
 *                           example: 1
 *                         drc_name:
 *                           type: string
 *                           example: CMS
 *       404:
 *         description: No Active DRCs found for the specified RTOM.
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
 *                   example: No RTOM record found for the ID
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 404
 *                     description:
 *                       type: string
 *                       example: No Active DRCs found for the specified RTOM.
 *       500:
 *         description: Internal server error occurred while fetching Active DRC details.
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
 *                   example: Failed to retrieve DRC details.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: Internal server error occurred while fetching Active DRC details.
 */
router.post("/List_All_DRC_Ownned_By_RTOM", getAllActiveDRCs);


/**
 * @swagger
 * tags:
 *   - name: RTOM
 *     description: RTOM-related endpoints, allowing management and registration of RTOMs.
 * 
 * /api/RTOM/List_All_RO_Ownned_By_RTOM:
 *   post:
 *     summary: RTOM-2P02 Retrieve All Recovery Officers by specific RTOM ID.
 *     description: |
 *       List all Recovery Officers associated with a given RTOM.
 *       
 *       | Version | Date       | Description              | Changed By       |
 *       |---------|------------|--------------------------|------------------|
 *       | 01      | 2024-Dec-24| List All ROs Ownned by RTOM  | Sasindu Srinayaka |
 *     tags:
 *       - [RTOM]
 *     parameters:
 *       - in: path
 *         name: rtom_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rtom_id:
 *                 type: integer
 *                 example: 1
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
 *                   type: object
 *                   properties:
 *                     rtom:
 *                       type: object
 *                       properties:
 *                         ro_id:
 *                           type: integer
 *                           example: 1
 *                         ro_name:
 *                           type: string
 *                           example: Sasindu Srinayaka
 *       404:
 *         description: No RTOM found for the provided ID or Area Name.
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
 *                   example: No Recovery Officers found for the area or rtom_id.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 404
 *                     description:
 *                       type: string
 *                       example: No Recovery Officers found for the area or rtom_id.
 *       500:
 *         description: Internal server error occurred while fetching RO details.
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
 *                   example: Failed to retrieve RO details.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: Internal server error occurred while fetching RTOM details.
 */
// Route to retrieve all Recovery Officers by RTOM ID
router.post('/List_All_RO_Ownned_By_RTOM', getAllROsByRTOMID);


/**
 * @swagger
 * tags:
 *   - name: RTOM
 *     description: RTOM-related endpoints, allowing management and registration of RTOMs.
 * 
 * /api/RTOM/List_All_RTOM_Ownned_By_DRC:
 *   post:
 *     summary: RTOM-2P03 Retrieve RTOMs by DRC ID.
 *     description: |
 *       List all RTOMs associated with a given DRC.
 *       
 *       | Version | Date       | Description | Changed By       |
 *       |---------|------------|-------------|------------------|
 *       | 01      | 2024-Dec-25| List All RTOMs Ownned by DRC | Sasindu Srinayaka |
 *     tags:
 *       - [RTOM]
 *     parameters:
 *       - in: path
 *         name: drc_id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               drc_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: RTOMs retrieved successfully.
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
 *                   example: RTOMs retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     rtom:
 *                       type: object
 *                       properties:
 *                         rtom_id:
 *                           type: integer
 *                           example: 1
 *                         area_name:
 *                           type: string
 *                           example: Matara
 *       404:
 *         description: No RTOMs found.
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
 *                   example: Failed to retrieve RTOM details.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 404
 *                     description:
 *                       type: string
 *                       example: RTOM with the given ID not found.
 *       500:
 *         description: Internal server error occurred while fetching RTOM details.
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
 *                   example: Failed to retrieve RTOM details.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: Internal server error occurred while fetching RTOM details.
 */
// Route to retrieve all RTOMs by DRC ID
router.post('/List_All_RTOM_Ownned_By_DRC', getAllRTOMsByDRCID);

router.get('/List_All_Active_RTOMs', getActiveRTOMDetails);

router.patch("/Suspend_RTOM", suspend_RTOM);

export default router;
