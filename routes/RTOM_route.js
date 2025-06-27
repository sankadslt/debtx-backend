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
    getAllActiveRTOMsByDRCID,
    ListAllRTOMDetails,
    CreateActiveRTOM,
    ListRTOMDetailsByRTOMID,
    UpdateRTOMDetails,
    TerminateRTOM,
    createRTOM
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
 *       This endpoint allows you to register a new RTOM by providing the necessary details such as area name, abbreviation, contact number, and fax number. 
 *       Optionally, you can include the `created_dtm` field in the format `DD/MM/YYYY`. If not provided, the current date will be used.
 *       
 *       | Version | Date       | Description              | Changed By        |
 *       |---------|------------|--------------------------|-------------------|
 *       | 01      | 2024-Dec-16| Register a new RTOM      | Sasindu Srinayaka |
 *     tags:
 *       - RTOM
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
 *                 example: 712345678
 *               rtom_fax_number:
 *                 type: integer
 *                 description: The fax number for the RTOM.
 *                 example: 712345679
 *               created_dtm:
 *                 type: string
 *                 format: date
 *                 description: The creation date of the RTOM in `DD/MM/YYYY` format. Defaults to the current date if not provided.
 *                 example: 16/12/2024
 *             required:
 *               - area_name
 *               - rtom_abbreviation
 *               - rtom_contact_number
 *               - rtom_fax_number
 *     responses:
 *       201:
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
 *                       example: 1
 *                     rtom_abbreviation:
 *                       type: string
 *                       example: MH
 *                     area_name:
 *                       type: string
 *                       example: Matara
 *                     rtom_contact_number:
 *                       type: integer
 *                       example: 712345678
 *                     rtom_fax_number:
 *                       type: integer
 *                       example: 712345679
 *                     rtom_status:
 *                       type: string
 *                       enum: [Active, Inactive]
 *                       example: Active
 *                     created_dtm:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-12-16T00:00:00.000Z
 *                     created_by:
 *                       type: string
 *                       example: System
 *       400:
 *         description: Validation error - Missing or invalid required fields.
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
 *                       example: Internal server error occurred while registering RTOM.
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
 *     summary: RTOM-1A02 Update the details of an RTOM
 *     description: |
 *       Updates the abbreviation, area name, contact number, and fax number of an RTOM.
 *       Changes are logged with the reason and updated_by fields.
 *       
 *       | Version | Date       | Description              | Changed By        |
 *       |---------|------------|--------------------------|-------------------|
 *       | 01      | 2024-Dec-21| Updated the RTOM details. | Sasindu Srinayaka |
 *     tags:
 *       - RTOM
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
 *                 example: 1
 *                 description: Unique identifier of the RTOM.
 *               rtom_status:
 *                 type: string
 *                 example: Active
 *                 description: Status of the RTOM.
 *               rtom_contact_number:
 *                 type: integer
 *                 example: 712345678
 *                 description: Contact number of the RTOM.
 *               rtom_fax_number:
 *                 type: integer
 *                 example: 712345679
 *                 description: Fax number of the RTOM.
 *               reason:
 *                 type: string
 *                 example: Updated contact details
 *                 description: Reason for the update.
 *             required:
 *               - rtom_id
 *               - rtom_status
 *               - rtom_contact_number
 *               - rtom_fax_number
 *               - reason
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
 *         description: Validation Error - missing or invalid parameters.
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
 *                       example: Missing required fields.
 * 
 *       404:
 *         description: RTOM ID not found in the database.
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
 *                   example: RTOM ID not found in the database.
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
 *     summary: RTOM-2P01 Get all active DRCs associated with an RTOM.
 *     description: |
 *       Retrieves a list of active Debt Recovery Companies (DRCs) associated with the given RTOM ID. 
 *       The system maps RTOM areas to Recovery Officers and their associated DRCs to produce the list.
 *       
 *       | Version | Date       | Description                   | Changed By         |
 *       |---------|------------|-------------------------------|--------------------|
 *       | 01      | 2024-Dec-23| List all DRCs owned by RTOM   | Sasindu Srinayaka  |
 *     tags:
 *       - RTOM
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rtom_id:
 *                 type: integer
 *                 description: Unique identifier for the RTOM.
 *                 example: 2
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       drc_id:
 *                         type: integer
 *                         example: 1
 *                       drc_name:
 *                         type: string
 *                         example: CMS
 *       400:
 *         description: Validation error - Missing or invalid RTOM ID.
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
 *                   example: RTOM ID is required.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     description:
 *                       type: string
 *                       example: Please provide a valid RTOM ID.
 *       404:
 *         description: No matching RTOM or associated DRCs found.
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
 *                   example: No RTOM record found for the ID 1.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 404
 *                     description:
 *                       type: string
 *                       example: No active DRCs found for the specified RTOM.
 *       500:
 *         description: Internal server error occurred while fetching DRC details.
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
// Route to list all active DRCs owned by a specific RTOM
router.post("/List_All_DRC_Ownned_By_RTOM", getAllActiveDRCs);

/**
 * @swagger
 * tags:
 *   - name: RTOM
 *     description: RTOM-related endpoints, allowing management and registration of RTOMs.
 * 
 * /api/RTOM/List_All_RO_Ownned_By_RTOM:
 *   post:
 *     summary: RTOM-2P02 Retrieve all Recovery Officers by RTOM ID.
 *     description: |
 *       Retrieves a list of Recovery Officers (ROs) associated with a specific RTOM based on its ID. 
 *       The endpoint identifies the RTOM area name and matches it with Recovery Officers responsible for that area.
 *       
 *       | Version | Date       | Description                     | Changed By         |
 *       |---------|------------|---------------------------------|--------------------|
 *       | 01      | 2024-Dec-24| List all ROs owned by RTOM      | Sasindu Srinayaka  |
 *     tags:
 *       - RTOM
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rtom_id:
 *                 type: integer
 *                 description: Unique identifier for the RTOM.
 *                 example: 2
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
 *                   items:
 *                     type: object
 *                     properties:
 *                       ro_id:
 *                         type: integer
 *                         example: 1
 *                       ro_name:
 *                         type: string
 *                         example: Sasindu Srinayaka
 *       400:
 *         description: Validation error - Missing or invalid RTOM ID.
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
 *                   example: RTOM ID is required.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     description:
 *                       type: string
 *                       example: Please provide a valid RTOM ID in the request body.
 *       404:
 *         description: No Recovery Officers found for the provided RTOM or area name.
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
 *                   example: No Recovery Officers found for the area or RTOM ID.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 404
 *                     description:
 *                       type: string
 *                       example: No Recovery Officers found for the area or RTOM ID.
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
 *                       example: Internal server error occurred while fetching RO details.
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
 *       This endpoint retrieves all RTOMs associated with a given Debt Recovery Company (DRC) based on its ID. 
 *       It identifies the DRC name and maps it to Recovery Officers (ROs) to determine the RTOMs they manage.
 *       
 *       | Version | Date       | Description                 | Changed By         |
 *       |---------|------------|-----------------------------|--------------------|
 *       | 01      | 2024-Dec-25| List all RTOMs owned by DRC | Sasindu Srinayaka  |
 *     tags:
 *       - RTOM
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               drc_id:
 *                 type: integer
 *                 description: The unique identifier for the DRC.
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       rtom_id:
 *                         type: integer
 *                         description: Unique identifier for the RTOM.
 *                         example: 1
 *                       area_name:
 *                         type: string
 *                         description: The name of the area managed by the RTOM.
 *                         example: Matara
 *       404:
 *         description: No RTOMs found for the given DRC ID.
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
 *                   example: No RTOMs found for this DRC ID.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 404
 *                     description:
 *                       type: string
 *                       example: No RTOM data matches the provided DRC ID.
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

/**
 * @swagger
 * tags:
 *   - name: RTOM
 *     description: RTOM-related endpoints, allowing management and registration of RTOMs.
 * 
 * /api/RTOM/List_All_Active_RTOMs:
 *   get:
 *     summary: Retrieve all active RTOMs.
 *     description: |
 *       This endpoint retrieves a list of all active RTOMs from the database. 
 *       Active RTOMs are identified by their `rtom_status` field set to "Active".
 *       
 *       | Version | Date       | Description                     | Changed By         |
 *       |---------|------------|---------------------------------|--------------------|
 *       | 01      | 2024-Dec-25| List all active RTOMs           | Sasindu Srinayaka  |
 *     tags:
 *       - RTOM
 *     responses:
 *       200:
 *         description: Successfully retrieved active RTOMs.
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
 *                   example: Count of active RTOM(s) retrieved successfully.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       rtom_id:
 *                         type: integer
 *                         description: Unique identifier of the RTOM.
 *                         example: 1
 *                       area_name:
 *                         type: string
 *                         description: Name of the RTOM's area.
 *                         example: Matara
 *                       rtom_status:
 *                         type: string
 *                         description: Status of the RTOM.
 *                         example: Active
 *                       rtom_contact_number:
 *                         type: integer
 *                         description: Contact number of the RTOM.
 *                         example: 712345678
 *                       rtom_fax_number:
 *                         type: integer
 *                         description: Fax number of the RTOM.
 *                         example: 712345679
 *       404:
 *         description: No active RTOMs found in the database.
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
 *                   example: No active RTOM(s) found.
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
 *                   example: Internal server error occurred while fetching active RTOM count.
 *                 error:
 *                   type: string
 *                   example: Detailed error message for debugging purposes.
 */
// Route to retrieve all active RTOMs
router.get('/List_All_Active_RTOMs', getActiveRTOMDetails);

/**
 * @swagger
 * tags:
 *   - name: RTOM
 *     description: RTOM-related endpoints, allowing management, suspension, and registration of RTOMs.
 * 
 * /api/RTOM/Suspend_RTOM:
 *   patch:
 *     summary: Suspend an RTOM by marking it as inactive.
 *     description: |
 *       This endpoint allows suspending an RTOM by setting its status to "Inactive" and updating the end date with a reason for suspension. 
 *       The changes are logged in the `updated_rtom` array for historical tracking.
 *       
 *       | Version | Date       | Description                | Changed By         |
 *       |---------|------------|----------------------------|--------------------|
 *       | 01      | 2024-Dec-26| Suspend an RTOM            | Sasindu Srinayaka  |
 *     tags:
 *       - RTOM
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rtom_id:
 *                 type: integer
 *                 description: Unique identifier of the RTOM to suspend.
 *                 example: 1
 *               rtom_end_date:
 *                 type: string
 *                 format: date
 *                 description: End date for the RTOM in `YYYY-MM-DD` format.
 *                 example: 2024-12-26
 *               reason:
 *                 type: string
 *                 description: Reason for suspending the RTOM.
 *                 example: "End of operations in the region."
 *     responses:
 *       200:
 *         description: RTOM successfully suspended.
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
 *                   example: The RTOM has been suspended.
 *                 data:
 *                   type: object
 *                   description: Contains details about the MongoDB update result.
 *                   example:
 *                     acknowledged: true
 *                     modifiedCount: 1
 *                     matchedCount: 1
 *       400:
 *         description: Validation error - Missing required fields or RTOM not found.
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
 *                   example: RTOM not found in Database.
 *       500:
 *         description: Internal server error occurred while suspending the RTOM.
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
 *                   example: Internal server error occurred while suspending the RTOM.
 *                 error:
 *                   type: string
 *                   example: Detailed error message for debugging purposes.
 */
// Route to suspend an RTOM
router.patch("/Suspend_RTOM", suspend_RTOM);

/**
 * @swagger
 * tags:
 *   - name: RTOM
 *     description: RTOM-related endpoints, allowing management and registration of RTOMs.
 * 
 * /api/RTOM/List_ALL_Active_RTOM_Ownned_By_DRC:
 *   post:
 *     summary: RTOM-2P04 Retrieve all active RTOMs by DRC ID.
 *     description: |
 *       This endpoint retrieves all active RTOMs associated with the given DRC ID. 
 *       The system determines the DRC name and finds Recovery Officers (ROs) assigned to that DRC. 
 *       It then identifies RTOMs managed by the ROs with their most recent status set to "Active".
 *       
 *       | Version | Date       | Description                     | Changed By         |
 *       |---------|------------|---------------------------------|--------------------|
 *       | 01      | 2025-Jan-23| List all active RTOMs by DRC    | Sasindu Srinayaka  |
 *     tags:
 *       - RTOM
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               drc_id:
 *                 type: integer
 *                 description: Unique identifier for the DRC.
 *                 example: 7
 *     parameters:
 *       - in: query
 *         name: drc_id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 7
 *         description: Unique identifier for the DRC.
 *     responses:
 *       200:
 *         description: Active RTOMs retrieved successfully.
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
 *                   example: Active RTOMs retrieved successfully.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       rtom_id:
 *                         type: integer
 *                         description: Unique identifier of the RTOM.
 *                         example: 1
 *                       area_name:
 *                         type: string
 *                         description: Name of the RTOM's area.
 *                         example: Matara
 *       404:
 *         description: No active RTOMs found for the given DRC ID or associated Recovery Officers.
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
 *                   example: No active RTOMs found for the specified Recovery Officers.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 404
 *                     description:
 *                       type: string
 *                       example: No active RTOMs found for the given DRC ID.
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
 *                       example: Internal server error occurred while retrieving RTOM details.
 */
// Route to retrieve all active RTOMs by DRC ID
router.post('/List_ALL_Active_RTOM_Ownned_By_DRC',getAllActiveRTOMsByDRCID);

router.post('/List_All_RTOM_Details' , ListAllRTOMDetails);

router.post('/Create_Active_RTOM' , CreateActiveRTOM);

router.post("/List_RTOM_Details_By_RTOM_ID", ListRTOMDetailsByRTOMID);

router.post("/Update_RTOM_Details", UpdateRTOMDetails);

router.patch("/Terminate_RTOM", TerminateRTOM);

router.post("/createRTOM", createRTOM);

export default router;
