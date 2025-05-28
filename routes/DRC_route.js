/* 
    Purpose: This template is used for the DRC Routes.
    Created Date: 2024-11-21
    Created By: Janendra Chamodi (apjanendra@gmail.com)
    Last Modified Date: 2024-11-24
    Modified By: Janendra Chamodi (apjanendra@gmail.com)
                 Naduni Rabel (rabelnaduni2000@gmail.com)
                 Lasandi Randini (randini-im20057@stu.kln.ac.lk)
    Version: Node.js v20.11.1
    Dependencies: express
    Related Files: DRC_controller.js
    Notes:  
*/



// import { Router } from "express";
// import { registerDRC, getDRCDetails,updateDRCDetails, getDRCDetailsById, updateDRCStatus, addServiceToDRC,updateServiceStatusOnDRC} from "../controllers/DRC_controller.js";


// const router = Router();

// router.post("/Register_DRC", registerDRC);
// router.put("/updateDRCStatus", updateDRCStatus);
// router.get("/getDRCDetails", getDRCDetails);
// router.put("/updateDRCDetails", updateDRCDetails);
// router.get("/getDRCDetailsById/:drc_id", getDRCDetailsById);
// router.post("/addServiceToDRC", addServiceToDRC);
// router.put("/updateServiceStatusOnDRC", updateServiceStatusOnDRC);


// export default router;

import { Router } from "express"; 
import {
  registerDRC,
  getDRCWithServices,
  changeDRCStatus,
  getDRCWithServicesByDRCId,
  getDRCDetails,
  getDRCDetailsById,
  getActiveDRCDetails,

  endDRC,
  DRCRemarkDetailsById,
  getDebtCompanyByDRCID,
  terminateCompanyByDRCID,
  updateDRCInfo , 
  List_All_DRC_Details , 
  List_RTOM_Details_Owen_By_DRC_ID , 
  List_Service_Details_Owen_By_DRC_ID,

  // endDRC,
  // DRCRemarkDetailsById,


  
  getUserIdOwnedByDRCId,

} from "../controllers/DRC_controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: DRC
 *     description: Debt Recovery Company-related endpoints, allowing management and access of DRC details.
 *
 * /api/DRC/DRC_Remark_Details_By_ID:
 *   post:
 *     summary: Retrieve remarks of a specific DRC by DRC_ID
 *     description: |
 *       Obtain remarks for a specific Debt Recovery Company using its DRC_ID:
 *       
 *       | Version | Date       | Description |
 *       |---------|------------|-------------|
 *       | 01      | 2024-Dec-07| Initial release |
 *     tags:
 *       - DRC
 *     parameters:
 *       - in: query
 *         name: drc_id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 101
 *         description: The ID of the DRC to fetch remarks for.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               drc_id:
 *                 type: integer
 *                 description: Unique ID of the DRC to fetch remarks for.
 *                 example: 101
 *     responses:
 *       200:
 *         description: Remark details retrieved successfully.
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
 *                   example: Remark details fetched successfully.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       remark:
 *                         type: string
 *                         example: "Remark 1"
 *                       remark_Dtm:
 *                         type: string
 *                         example: "2024-01-10T15:30:00.000Z"
 *                       remark_edit_by:
 *                         type: string
 *                         example: "admin"
 *       400:
 *         description: Validation error due to missing or invalid DRC_ID.
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
 *                   example: DRC ID is required.
 *       404:
 *         description: No DRC record found for the provided DRC ID.
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
 *                   example: No DRC found with the given DRC ID.
 *       500:
 *         description: Internal server error while fetching remark details.
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
 *                   example: Failed to fetch remark details. Please try again later.
 */
router.post("/DRC_Remark_Details_By_ID", DRCRemarkDetailsById);

/**
 * @swagger
 * tags:
 *   - name: DRC
 *     description: Debt Recovery Company-related endpoints, allowing management and registration of DRCs.
 *
 * /api/DRC/End_DRC:
 *   patch:
 *     summary: DRC-1B01 End a DRC with remarks
 *     description: |
 *       Ends a DRC by updating its end date and adding a remark.
 *       
 *       | Version | Date       | Description |
 *       |---------|------------|-------------|
 *       | 01      | 2025-Jan-10| Initial implementation. |
 *
 *     tags:
 *       - DRC
 *     parameters:
 *       - in: query
 *         name: drc_id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 12345
 *         description: The unique ID of the DRC to end.
 *       - in: query
 *         name: drc_end_dat
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-01-10"
 *         description: The end date for the DRC in ISO 8601 format.
 *       - in: query
 *         name: remark
 *         required: true
 *         schema:
 *           type: string
 *           example: "DRC successfully completed."
 *         description: The remark explaining the reason for ending the DRC.
 *       - in: query
 *         name: remark_edit_by
 *         required: true
 *         schema:
 *           type: string
 *           example: "AdminUser"
 *         description: The user or admin making the remark.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               drc_id:
 *                 type: integer
 *                 description: The unique ID of the DRC to end.
 *                 example: 12345
 *               drc_end_dat:
 *                 type: string
 *                 format: date
 *                 description: The end date for the DRC in ISO 8601 format.
 *                 example: "2025-01-10"
 *               remark:
 *                 type: string
 *                 description: The remark explaining the reason for ending the DRC.
 *                 example: "DRC successfully completed."
 *               remark_edit_by:
 *                 type: string
 *                 description: The user or admin making the remark.
 *                 example: "AdminUser"
 *     responses:
 *       200:
 *         description: Successfully ended the DRC and added the remark.
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
 *                   example: DRC Ended.
 *                 data:
 *                   type: object
 *                   properties:
 *                     drc_id:
 *                       type: integer
 *                       example: 12345
 *                     drc_end_dat:
 *                       type: string
 *                       example: "2025-01-10"
 *                     remark:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           remark:
 *                             type: string
 *                             example: "DRC successfully completed."
 *                           remark_date:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-01-10T12:00:00.000Z"
 *                           remark_edit_by:
 *                             type: string
 *                             example: "AdminUser"
 *       400:
 *         description: Validation error due to missing required fields.
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
 *                   example: "Remark and Remark Edit By fields are required."
 *       404:
 *         description: No record found for the provided DRC ID.
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
 *                   example: "No DRC found for the given drc_id: 12345."
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
 *                   example: "An unexpected error occurred."
 */
router.patch("/End_DRC", endDRC);

router.post("/Register_DRC", registerDRC);

/**
 * @swagger
 * tags:
 *   - name: DRC
 *     description: Debt Recovery Company-related endpoints, allowing management and registration of DRCs.
 *
 * /api/DRC/Change_DRC_Status:
 *   patch:
 *     summary: DRC-1A01 Update the status of a DRC
 *     description: |
 *       changes the status of a DRC:
 *       
 *       | Version | Date       | Description |
 *       |---------|------------|-------------|
 *       | 01      | 2024-Dec-07|             |
 *
 *     tags:
 *      - DRC
 *     parameters:
 *       - in: query
 *         name: drc_id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 101
 *         description: The ID of the DRC to be updated.
 *       - in: query
 *         name: drc_status
 *         required: true
 *         schema:
 *           type: string
 *           example: Active
 *         description: The new status of the DRC (e.g., Active, Inactive).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               drc_id:
 *                 type: integer
 *                 description: The ID of the DRC to be updated.
 *                 example: 101
 *               drc_status:
 *                 type: string
 *                 description: The new status of the DRC (e.g., Active, Inactive).
 *                 example: Active
 *     responses:
 *       200:
 *         description: DRC status updated successfully.
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
 *                   example: DRC status updated successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     drc_id:
 *                       type: integer
 *                       example: 101
 *                     drc_status:
 *                       type: string
 *                       example: Active
 *       400:
 *         description: Validation error due to missing required fields.
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
 *                   example: Failed to update DRC status.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     description:
 *                       type: string
 *                       example: "DRC ID and status are required."
 *       404:
 *         description: No record found for the provided DRC ID.
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
 *                   example: Failed to update DRC status.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 404
 *                     description:
 *                       type: string
 *                       example: "No record found with the provided DRC ID."
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
 *                   example: Failed to update DRC status.
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
router.patch("/Change_DRC_Status", changeDRCStatus);

/**
 * @swagger
 * /api/DRC/DRC_with_Services:
 *   get:
 *     summary: DRC-2G01 Retrieve details of all DRCs along with Services.
 *     description: |
 *       List DRCs along with Services list:
 *       
 *       | Version | Date       | Description |
 *       |---------|------------|-------------|
 *       | 01      | 2024-Dec-07|             |
 *     tags:
 *       - DRC
 * 
 *     responses:
 *       200:
 *         description: DRC details retrieved successfully.
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
 *                   example: DRC details retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     mongoData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           __id:
 *                             type: string
 *                             example: 67533381d3b87ceffa3bfc9b
 *                           drc_id:
 *                             type: integer
 *                             example: 1
 *                           drc_abbreviation:
 *                             type: string
 *                             example: MT
 *                           drc_name:
 *                             type: string
 *                             example: MIT
 *                           drc_status:
 *                             type: string
 *                             example: Active
 *                           teli_no:
 *                             type: integer
 *                             example: 118887777
 *                           drc_end_dat:
 *                             type: string
 *                             example: "2024-12-06T03:49:02.000Z"
 *                           create_by:
 *                             type: string
 *                             example: Admin
 *                           create_dtm:
 *                             type: string
 *                             example: "2024-12-06T03:49:02.000Z"
 *                           updatedAt:
 *                             type: string
 *                             example: 2024-12-23T16:58:49.975Z
 *                           services_of_drc:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 __id:
 *                                   type: string
 *                                   example: 67533381d3b87ceffa3bfc9b
 *                                 service_id:
 *                                   type: integer
 *                                   example: 2
 *                                 service_type:
 *                                   type: string
 *                                   example: FIBRE
 *                                 drc_service_status:
 *                                   type: string
 *                                   example: Active
 *                                 status_change_dtm:
 *                                   type: string
 *                                   example: 2024-12-23T16:58:49.975Z
 *                                 status_changed_by:
 *                                   type: string
 *                                   example: Admin
 *                           
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
 *                     mysql:
 *                       type: string
 *                       example: null
 */
router.get("/DRC_with_Services", getDRCWithServices);

/**
 * @swagger
 * /api/DRC/DRC_with_Services_By_DRC_ID:
 *   post:
 *     summary: DRC-2P01 Retrieve details of a specific DRC along with Services by DRC_ID
 *     description: |
 *       Get DRC along with Services list w.r.t. DRC_ID:
 *       
 *       | Version | Date       | Description |
 *       |---------|------------|-------------|
 *       | 01      | 2024-Dec-07|             |
 *     tags:
 *       - DRC
 *     parameters:
 *       - in: query
 *         name: DRC_ID
 *         required: true
 *         schema:
 *           type: integer
 *           example: 101
 *         description: The ID of the DRC to be retrieved.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               DRC_ID:
 *                 type: integer
 *                 description: Unique ID of the DRC.
 *                 example: 1
 *     responses:
 *       200:
 *         description: DRC details retrieved successfully.
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
 *                   example: DRC details retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     mongoData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           __id:
 *                             type: string
 *                             example: 67533381d3b87ceffa3bfc9b
 *                           drc_id:
 *                             type: integer
 *                             example: 1
 *                           drc_abbreviation:
 *                             type: string
 *                             example: MT
 *                           drc_name:
 *                             type: string
 *                             example: MIT
 *                           drc_status:
 *                             type: string
 *                             example: Active
 *                           teli_no:
 *                             type: integer
 *                             example: 118887777
 *                           drc_end_dat:
 *                             type: string
 *                             example: "2024-12-06T03:49:02.000Z"
 *                           create_by:
 *                             type: string
 *                             example: Admin
 *                           create_dtm:
 *                             type: string
 *                             example: "2024-12-06T03:49:02.000Z"
 *                           updatedAt:
 *                             type: string
 *                             example: 2024-12-23T16:58:49.975Z
 *                           services_of_drc:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 __id:
 *                                   type: string
 *                                   example: 67533381d3b87ceffa3bfc9b
 *                                 service_id:
 *                                   type: integer
 *                                   example: 2
 *                                 service_type:
 *                                   type: string
 *                                   example: FIBRE
 *                                 drc_service_status:
 *                                   type: string
 *                                   example: Active
 *                                 status_change_dtm:
 *                                   type: string
 *                                   example: 2024-12-23T16:58:49.975Z
 *                                 status_changed_by:
 *                                   type: string
 *                                   example: Admin
 *       400:
 *         description: Invalid or missing DRC ID.
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
 *                       example: 404
 *                     description:
 *                       type: string
 *                       example: DRC with the given ID not found.
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
 *                   example: An unexpected error occurred.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     mysql:
 *                       type: string
 *                       example: null
 */
router.post("/DRC_with_Services_By_DRC_ID", getDRCWithServicesByDRCId);

/**
 * @swagger
 * /api/DRC/DRC_Details:
 *   get:
 *     summary: DRC-1G01 Retrieve details of all DRCs.
 *     
 *     description: |
 *       List All Debt Recovery Company Details:
 *       
 *       | Version | Date       | Description |
 *       |---------|------------|-------------|
 *       | 01      | 2024-Dec-07|             |
 *     tags:
 *       - DRC
 * 
 *     responses:
 *       200:
 *         description: DRC details retrieved successfully.
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
 *                   example: DRC details retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     mongoData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           __id:
 *                             type: string
 *                             example: 67533381d3b87ceffa3bfc9b
 *                           drc_id:
 *                             type: integer
 *                             example: 1
 *                           abbreviation:
 *                             type: string
 *                             example: abr
 *                           drc_name:
 *                             type: string
 *                             example: drc1
 *                           drc_status:
 *                             type: string
 *                             example: st
 *                           teli_no:
 *                             type: integer
 *                             example: 112964444
 *                           drc_end_dat:
 *                             type: string
 *                             example: "2024-11-29T18:30:00.000Z"
 *                           create_by:
 *                             type: string
 *                             example: user1
 *                           create_dtm:
 *                             type: string
 *                             example: "2024-11-14T11:12:09.000Z"
 *                           updatedAt:
 *                             type: string
 *                             example: 2024-12-23T16:58:49.975Z
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     mysql:
 *                       type: string
 *                       example: null
 */
router.get("/DRC_Details", getDRCDetails);

/**
 * @swagger
 * /api/DRC/DRC_Details_By_ID:
 *   post:
 *     summary: DRC-1P02 Retrieve details of a specific DRC by DRC_ID 
 *     description: |
 *       Obtain Debt Recovery Company Details w.r.t. DRC_ID:
 *       
 *       | Version | Date       | Description |
 *       |---------|------------|-------------|
 *       | 01      | 2024-Dec-07|             |
 *     tags:
 *       - DRC
 *     parameters:
 *       - in: query
 *         name: DRC_ID
 *         required: true
 *         schema:
 *           type: integer
 *           example: 101
 *         description: The ID of the DRC to be retrieved.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               DRC_ID:
 *                 type: integer
 *                 description: Unique ID of the DRC.
 *                 example: 1
 *     responses:
 *       200:
 *         description: DRC details retrieved successfully.
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
 *                   example: DRC details retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     mongoData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           __id:
 *                             type: string
 *                             example: 67533381d3b87ceffa3bfc9b
 *                           drc_id:
 *                             type: integer
 *                             example: 1
 *                           abbreviation:
 *                             type: string
 *                             example: abr
 *                           drc_name:
 *                             type: string
 *                             example: drc1
 *                           drc_status:
 *                             type: string
 *                             example: st
 *                           teli_no:
 *                             type: integer
 *                             example: 112964444
 *                           drc_end_date:
 *                             type: string
 *                             example: "2024-11-29T18:30:00.000Z"
 *                           create_by:
 *                             type: string
 *                             example: user1
 *                           create_dtm:
 *                             type: string
 *                             example: "2024-11-14T11:12:09.000Z"
 *                           updatedAt:
 *                             type: string
 *                             example: 2024-12-23T16:58:49.975Z
 *       400:
 *         description: Invalid or missing DRC ID.
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
 *                       example: 404
 *                     description:
 *                       type: string
 *                       example: DRC with the given ID not found.
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
 *                   example: An unexpected error occurred.
 *                 data:
 *                   type: object
 *                   properties:
 *                     mysql:
 *                       type: string
 *                       example: null
 */
router.post("/DRC_Details_By_ID", getDRCDetailsById);

/**
 * @swagger
 * /api/DRC/Active_DRC_Details:
 *   get:
 *     summary: DRC-1G02 Retrieve details of all active DRCs.
 *     description: |
 *       List All Active Debt Recovery Company Details:
 *       
 *       | Version | Date       | Description |
 *       |---------|------------|-------------|
 *       | 01      | 2024-Dec-07|             |
 *     tags:
 *       - DRC
 * 
 *     responses:
 *       200:
 *         description: DRC details retrieved successfully.
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
 *                   example: DRC details retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     mongoData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           __id:
 *                             type: string
 *                             example: 67533381d3b87ceffa3bfc9b
 *                           drc_id:
 *                             type: integer
 *                             example: 2
 *                           abbreviation:
 *                             type: string
 *                             example: qwe
 *                           drc_name:
 *                             type: string
 *                             example: drc2
 *                           drc_status:
 *                             type: string
 *                             example: active
 *                           teli_no:
 *                             type: integer
 *                             example: 112965555
 *                           drc_end_date:
 *                             type: string
 *                             example: "2024-11-29T18:30:00.000Z"
 *                           create_by:
 *                             type: string
 *                             example: user1
 *                           create_dtm:
 *                             type: string
 *                             example: "2024-11-30T13:12:19.000Z"
 *                           updatedAt:
 *                             type: string
 *                             example: 2024-12-23T16:58:49.975Z
 *                      
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
 *                   example: An unexpected error occurred.
 *                 data:
 *                   type: object
 *                   properties:
 *                     mysql:
 *                       type: string
 *                       example: null
 */
router.get("/Active_DRC_Details", getActiveDRCDetails);

/**
 * @swagger
 * /api/DRC/List_DRC_Details_By_DRC_ID:
 *   post:
 *     summary: DRC Retrieve detailed information of a DRC by its ID
 *     description: |
 *       Get comprehensive details of a specific Debt Recovery Company using its DRC ID:
 *       
 *       | Version | Date       | Description |
 *       |---------|------------|-------------|
 *       | 01      | 2025-May-22| Initial release |
 *     tags:
 *       - DRC
 *     parameters:
 *       - in: query
 *         name: drc_id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 101
 *         description: The unique identifier of the DRC to fetch.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               drc_id:
 *                 type: integer
 *                 description: Unique ID of the DRC to get details for.
 *                 example: 101
 *     responses:
 *       200:
 *         description: DRC details retrieved successfully.
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
 *                   example: Debt Company details retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     doc_version:
 *                       type: integer
 *                       example: 1
 *                     drc_id:
 *                       type: integer
 *                       example: 101
 *                     drc_name:
 *                       type: string
 *                       example: "ABC Recovery"
 *                     drc_business_registration_number:
 *                       type: string
 *                       example: "REG12345678"
 *                     drc_address:
 *                       type: string
 *                       example: "123 Main Street, Colombo"
 *                     drc_contact_no:
 *                       type: string
 *                       example: "0112345678"
 *                     drc_email:
 *                       type: string
 *                       example: "contact@abcrecovery.com"
 *                     drc_status:
 *                       type: string
 *                       example: "Active"
 *                     create_by:
 *                       type: string
 *                       example: "AdminUser"
 *                     create_on:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-15T08:30:00.000Z"
 *                     slt_coordinator:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           service_no:
 *                             type: integer
 *                             example: 5001
 *                           slt_coordinator_name:
 *                             type: string
 *                             example: "John Smith"
 *                           slt_coordinator_email:
 *                             type: string
 *                             example: "john.smith@slt.com"
 *                     services:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           service_type:
 *                             type: string
 *                             example: "FIBRE"
 *                           service_status:
 *                             type: string
 *                             example: "Active"
 *                     rtom:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           rtom_id:
 *                             type: integer
 *                             example: 2001
 *                           rtom_name:
 *                             type: string
 *                             example: "Central Region"
 *                           rtom_status:
 *                             type: string
 *                             example: "Active"
 *                     remark:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           remark:
 *                             type: string
 *                             example: "Initial setup completed"
 *                           remark_dtm:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-01-15T09:00:00.000Z"
 *                           remark_by:
 *                             type: string
 *                             example: "AdminUser"
 *       400:
 *         description: Validation error due to missing DRC ID.
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
 *                   example: DRC_ID is required.
 *       404:
 *         description: No DRC found with the provided ID.
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
 *                   example: No Debt Company found with DRC_ID.
 *       500:
 *         description: Internal server error while fetching DRC details.
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
 *                   example: Failed to retrieve Debt Company details.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     exception:
 *                       type: string
 *                       example: "Internal server error"
 */
router.post('/List_DRC_Details_By_DRC_ID', getDebtCompanyByDRCID);

/**
 * @swagger
 * /api/DRC/Terminate_Company_By_DRC_ID:
 *   patch:
 *     summary: DRC Terminate a Debt Recovery Company
 *     description: |
 *       Terminate a DRC by updating its status to "Terminate" and adding a termination remark:
 *       
 *       | Version | Date       | Description |
 *       |---------|------------|-------------|
 *       | 01      | 2025-May-22| Initial implementation |
 *     tags:
 *       - DRC
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               drc_id:
 *                 type: integer
 *                 description: Unique ID of the DRC to terminate.
 *                 example: 101
 *               remark:
 *                 type: string
 *                 description: Reason for termination.
 *                 example: "Contract terminated due to performance issues"
 *               remark_by:
 *                 type: string
 *                 description: User who is terminating the DRC.
 *                 example: "AdminUser"
 *               remark_dtm:
 *                 type: string
 *                 format: date-time
 *                 description: Timestamp of the termination.
 *                 example: "2025-05-22T10:30:00.000Z"
 *             required:
 *               - drc_id
 *               - remark
 *               - remark_dtm
 *     responses:
 *       200:
 *         description: DRC terminated successfully.
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
 *                   example: Company terminated successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     drc_id:
 *                       type: integer
 *                       example: 101
 *                     drc_name:
 *                       type: string
 *                       example: "ABC Recovery"
 *                     drc_status:
 *                       type: string
 *                       example: "Terminate"
 *                     drc_end_dtm:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-22T10:30:00.000Z"
 *                     drc_end_by:
 *                       type: string
 *                       example: "AdminUser"
 *                     remark:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           remark:
 *                             type: string
 *                             example: "Contract terminated due to performance issues"
 *                           remark_dtm:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-05-22T10:30:00.000Z"
 *                           remark_by:
 *                             type: string
 *                             example: "AdminUser"
 *       400:
 *         description: Validation error due to missing required fields.
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
 *                   example: DRC_ID, remark, and remark_dtm are required.
 *       404:
 *         description: No DRC found with the provided ID.
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
 *                   example: No Debt Company found with DRC_ID.
 *       500:
 *         description: Internal server error during termination.
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
 *                   example: Failed to terminate company.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     exception:
 *                       type: string
 *                       example: "Database connection error"
 */
router.patch('/Terminate_Company_By_DRC_ID', terminateCompanyByDRCID);

/**
 * @swagger
 * /api/DRC/Update_DRC_With_Services_and_SLT_Cordinator:
 *   patch:
 *     summary: DRC Update DRC information, services, and coordinator details
 *     description: |
 *       Update a Debt Recovery Company's contact information, coordinator, service status, RTOM status,
 *       and add remarks:
 *       
 *       | Version | Date       | Description |
 *       |---------|------------|-------------|
 *       | 01      | 2025-May-22| Initial implementation |
 *     tags:
 *       - DRC
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               drc_id:
 *                 type: integer
 *                 description: Unique ID of the DRC to update.
 *                 example: 101
 *               drc_contact_no:
 *                 type: string
 *                 description: Updated contact number for the DRC.
 *                 example: "0112345678"
 *               drc_email:
 *                 type: string
 *                 description: Updated email address for the DRC.
 *                 example: "contact@abcrecovery.com"
 *               coordinator:
 *                 type: object
 *                 description: New coordinator details to add.
 *                 properties:
 *                   service_no:
 *                     type: integer
 *                     example: 5002
 *                   slt_coordinator_name:
 *                     type: string
 *                     example: "Jane Smith"
 *                   slt_coordinator_email:
 *                     type: string
 *                     example: "jane.smith@slt.com"
 *               services:
 *                 type: array
 *                 description: Updated services information.
 *                 items:
 *                   type: object
 *                   properties:
 *                     service_type:
 *                       type: string
 *                       example: "FIBRE"
 *                     service_status:
 *                       type: string
 *                       enum: ["Active", "Inactive"]
 *                       example: "Active"
 *                     create_by:
 *                       type: string
 *                       example: "AdminUser"
 *                     create_on:
 *                       type: string
 *                       example: "2025-01-15T08:30:00.000Z"
 *               rtom:
 *                 type: array
 *                 description: Updated RTOM information.
 *                 items:
 *                   type: object
 *                   properties:
 *                     rtom_id:
 *                       type: integer
 *                       example: 2001
 *                     rtom_name:
 *                       type: string
 *                       example: "Central Region"
 *                     rtom_status:
 *                       type: string
 *                       enum: ["Active", "Inactive"]
 *                       example: "Active"
 *               remark:
 *                 type: string
 *                 description: Remark describing the changes.
 *                 example: "Updated contact details and service status"
 *               updated_by:
 *                 type: string
 *                 description: User who is making the updates.
 *                 example: "AdminUser"
 *             required:
 *               - drc_id
 *               - updated_by
 *     responses:
 *       200:
 *         description: DRC information updated successfully.
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
 *                   example: DRC information updated successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     drc_id:
 *                       type: integer
 *                       example: 101
 *                     drc_contact_no:
 *                       type: string
 *                       example: "0112345678"
 *                     drc_email:
 *                       type: string
 *                       example: "contact@abcrecovery.com"
 *                     services:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           service_type:
 *                             type: string
 *                             example: "FIBRE"
 *                           service_status:
 *                             type: string
 *                             example: "Active"
 *                     slt_coordinator:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           service_no:
 *                             type: integer
 *                             example: 5002
 *                           slt_coordinator_name:
 *                             type: string
 *                             example: "Jane Smith"
 *                     remark:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           remark:
 *                             type: string
 *                             example: "Updated contact details and service status"
 *                           remark_dtm:
 *                             type: string
 *                             example: "2025-05-22T14:30:00.000Z"
 *                           remark_by:
 *                             type: string
 *                             example: "AdminUser"
 *       400:
 *         description: Validation error due to missing required fields.
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
 *                   example: DRC ID and updated_by are required fields.
 *       404:
 *         description: No DRC found with the provided ID.
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
 *                   example: No Debt Company found with DRC_ID.
 *       500:
 *         description: Internal server error during update.
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
 *                   example: Failed to update DRC information.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     exception:
 *                       type: string
 *                       example: "Database error during update operation"
 */
router.patch('/Update_DRC_With_Services_and_SLT_Cordinator', updateDRCInfo);

router.post("/List_All_DRC_Details", List_All_DRC_Details);

router.post("/List_RTOM_Details_Owen_By_DRC_ID", List_RTOM_Details_Owen_By_DRC_ID);

router.post("/List_Service_Details_Owen_By_DRC_ID", List_Service_Details_Owen_By_DRC_ID);


export default router;