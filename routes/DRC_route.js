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

import { Router } from "express";
import {
  getDRCWithServices,
  changeDRCStatus,
  getDRCWithServicesByDRCId,
  getDRCDetails,
  getDRCDetailsById,
  getActiveDRCDetails,
  endDRC,
  DRCRemarkDetailsById,
  List_All_DRC_Details,
  List_RTOM_Details_Owen_By_DRC_ID,
  List_Service_Details_Owen_By_DRC_ID,
  Create_DRC_With_Services_and_SLT_Coordinator,
  List_DRC_Details_By_DRC_ID,
  Terminate_Company_By_DRC_ID,
  Update_DRC_With_Services_and_SLT_Cordinator,
  Create_Pre_Negotiation,
  List_Pre_Negotiation_By_Case_Id,
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

router.post(
  "/Create_DRC_With_Services_and_SLT_Coordinator",
  Create_DRC_With_Services_and_SLT_Coordinator
);

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
 *     summary: Retrieve DRC information by DRC ID
 *     description: |
 *       Get selected information of a specific Debt Recovery Company using its DRC ID.
 *
 *       | Version | Date       | Description         |
 *       |---------|------------|---------------------|
 *       | 01      | 2025-06-04 | Selected fields only|
 *     tags:
 *       - DRC
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
 *                 description: Unique DRC ID to fetch.
 *                 example: 1
 *     responses:
 *       200:
 *         description: Summarized DRC details retrieved successfully.
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
 *                   example: DRC information data retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     create_on:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-28T03:44:41.000Z"
 *                     drc_business_registration_number:
 *                       type: string
 *                       example: "br123578"
 *                     drc_contact_no:
 *                       type: string
 *                       example: "0776283842"
 *                     drc_email:
 *                       type: string
 *                       example: "sampledrac@gmail.com"
 *                     drc_address:
 *                       type: string
 *                       example: "158/A, Colombo 1."
 *                     slt_coordinator:
 *                       type: object
 *                       properties:
 *                         service_no:
 *                           type: string
 *                           example: "slt@gmail.com"
 *                         slt_coordinator_name:
 *                           type: string
 *                           example: "SLT"
 *                         slt_coordinator_email:
 *                           type: string
 *                           example: "slt@gmail.com"
 *                     services:
 *                       type: array
 *                       description: List of all services linked to the DRC.
 *                       items:
 *                         type: object
 *                         properties:
 *                           service_type:
 *                             type: string
 *                             example: "PEO MOBILE"
 *                           service_status:
 *                             type: string
 *                             example: "Active"
 *                           status_update_dtm:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-05-27T09:40:41.558Z"
 *                     rtom:
 *                       type: array
 *                       description: List of RTOMs assigned to the DRC.
 *                       items:
 *                         type: object
 *                         properties:
 *                           rtom_name:
 *                             type: string
 *                             example: "Gampaha"
 *                           rtom_status:
 *                             type: string
 *                             example: "Active"
 *                           status_update_dtm:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-05-27T09:40:41.558Z"
 *       400:
 *         description: Missing or invalid DRC ID.y
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
 *         description: No DRC found for the provided ID.
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
 *         description: Internal server error occurred during the request.
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
 *                   example: Failed to retrieve Debt Company Details.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     exception:
 *                       type: string
 *                       example: "Internal server error"
 */
router.post("/List_DRC_Details_By_DRC_ID", List_DRC_Details_By_DRC_ID);

/**
 * @swagger
 * tags:
 *   - name: Debt Recovery Companies
 *     description: Endpoints for managing Debt Recovery Company (DRC) lifecycle.
 *
 * /api/drc/Terminate_Company_By_DRC_ID:
 *   post:
 *     summary: Terminate a DRC (Debt Recovery Company) by DRC ID
 *     description: |
 *       Terminates a DRC record by marking it as `"Terminate"`, logs the remark, and creates an approval entry.
 *
 *       | Version | Date       | Description                        | Changed By       |
 *       |---------|------------|------------------------------------|------------------|
 *       | 1.0     | 2025-06-26 | Initial implementation             | Nimesh Perera    |
 *     tags:
 *       - Debt Recovery Companies
 *     parameters:
 *       - in: query
 *         name: drc_id
 *         required: false
 *         schema:
 *           type: string
 *         description: The unique ID of the DRC to terminate.
 *         example: "DRC_001"
 *       - in: query
 *         name: remark
 *         required: false
 *         schema:
 *           type: string
 *         description: Reason for termination.
 *         example: "Company ceased operations."
 *       - in: query
 *         name: remark_by
 *         required: false
 *         schema:
 *           type: string
 *         description: Name or ID of the user terminating the company.
 *         example: "admin_001"
 *       - in: query
 *         name: remark_dtm
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Timestamp of the remark.
 *         example: "2025-06-26T14:00:00.000Z"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - drc_id
 *               - remark
 *               - remark_by
 *               - remark_dtm
 *             properties:
 *               drc_id:
 *                 type: string
 *                 description: Unique identifier of the DRC company.
 *                 example: "DRC_001"
 *               remark:
 *                 type: string
 *                 description: Reason for terminating the company.
 *                 example: "No longer contracted for recovery services."
 *               remark_by:
 *                 type: string
 *                 description: User who initiated the termination.
 *                 example: "admin_001"
 *               remark_dtm:
 *                 type: string
 *                 format: date-time
 *                 description: Termination date and time.
 *                 example: "2025-06-26T14:00:00.000Z"
 *     responses:
 *       200:
 *         description: DRC terminated and approval record created.
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
 *                   example: Company terminated successfully and sent for approval.
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedCompany:
 *                       type: object
 *                       description: Updated company details.
 *                     approval:
 *                       type: object
 *                       description: New approval entry.
 *       400:
 *         description: Validation error due to missing fields.
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
 *                   example: DRC ID is required in the request body.
 *       404:
 *         description: DRC not found or already terminated.
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
 *                       example: Database connection failure
 */
router.patch("/Terminate_Company_By_DRC_ID", Terminate_Company_By_DRC_ID);

/**
 * @swagger
 * tags:
 *   - name: Debt Recovery Companies
 *     description: Endpoints for updating DRC contact, services, RTOMs, and SLT coordinators.
 *
 * /api/drc/Update_DRC_With_Services_and_SLT_Cordinator:
 *   post:
 *     summary: Update DRC details (contact info, services, SLT coordinators, RTOM) and optionally trigger approval
 *     description: |
 *       Updates a DRC's contact number, email, status, coordinator list, RTOM entries, and assigned services.
 *       If the DRC status is changed, an approval record will be triggered automatically.
 *
 *       | Version | Date       | Description                        | Changed By       |
 *       |---------|------------|------------------------------------|------------------|
 *       | 1.0     | 2025-06-26 | Initial version                    | Nimesh Perera    |
 *     tags:
 *       - Debt Recovery Companies
 *     parameters:
 *       - in: query
 *         name: drc_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the DRC to update.
 *         example: "DRC_001"
 *       - in: query
 *         name: updated_by
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID of the person performing the update.
 *         example: "admin_001"
 *       - in: query
 *         name: drc_status
 *         required: false
 *         schema:
 *           type: string
 *         description: New status to assign to the DRC (e.g., Active, Terminate).
 *         example: "Active"
 *       - in: query
 *         name: drc_email
 *         required: false
 *         schema:
 *           type: string
 *         description: Updated email address for the DRC.
 *         example: "contact@drccompany.com"
 *       - in: query
 *         name: drc_contact_no
 *         required: false
 *         schema:
 *           type: string
 *         description: Updated contact number for the DRC.
 *         example: "+94771234567"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - drc_id
 *               - updated_by
 *             properties:
 *               drc_id:
 *                 type: string
 *                 example: "DRC_001"
 *               drc_contact_no:
 *                 type: string
 *                 example: "+94771234567"
 *               drc_email:
 *                 type: string
 *                 format: email
 *                 example: "contact@drccompany.com"
 *               drc_status:
 *                 type: string
 *                 example: "Active"
 *               coordinator:
 *                 type: object
 *                 properties:
 *                   service_no:
 *                     type: string
 *                     example: "SLT12345"
 *                   slt_coordinator_name:
 *                     type: string
 *                     example: "Samantha Perera"
 *                   slt_coordinator_email:
 *                     type: string
 *                     example: "samantha@slt.lk"
 *               services:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     service_code:
 *                       type: string
 *                       example: "SRV001"
 *                     service_name:
 *                       type: string
 *                       example: "Legal Advice"
 *                     status:
 *                       type: string
 *                       example: "Active"
 *               rtom:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     rtom_division:
 *                       type: string
 *                       example: "North Western"
 *                     rtom_officer:
 *                       type: string
 *                       example: "Rohan Silva"
 *               remark:
 *                 type: string
 *                 example: "Changed coordinator and services"
 *               updated_by:
 *                 type: string
 *                 example: "admin_001"
 *     responses:
 *       200:
 *         description: DRC updated successfully and approval triggered if needed.
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
 *                   example: DRC information updated successfully and sent for approval.
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedCompany:
 *                       type: object
 *                       description: Updated DRC record
 *                     approval:
 *                       type: object
 *                       nullable: true
 *                       description: Approval record if status was changed
 *       400:
 *         description: Required fields missing
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
 *         description: DRC not found
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
 *         description: Server-side failure
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
 *                       example: MongoError or transaction issue
 */
router.patch(
  "/Update_DRC_With_Services_and_SLT_Cordinator",
  Update_DRC_With_Services_and_SLT_Cordinator
);

/**
 * @swagger
 * /api/DRC/List_All_DRC_Details:
 *   post:
 *     summary: Retrieve a paginated list of DRCs with summary details
 *     description: |
 *       Returns a summary of Debt Recovery Companies (DRCs), including counts of services, RTOMs, and Recovery Officers.
 *
 *       | Version | Date       | Description                          |
 *       |---------|------------|--------------------------------------|
 *       | 01      | 2025-06-08 | Initial paginated DRC summary fetch  |
 *
 *       Pagination logic:
 *       - Page 1 returns 10 items.
 *       - Page 2 and onward return 30 items per page.
 *     tags:
 *       - DRC
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: Optional status to filter DRCs (Active, Inactive, Terminate).
 *                 example: Active
 *               page:
 *                 type: integer
 *                 description: Page number for pagination.
 *                 example: 1
 *     responses:
 *       200:
 *         description: List of DRCs retrieved successfully.
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
 *                   example: DRC details fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       drc_id:
 *                         type: integer
 *                         example: 101
 *                       drc_name:
 *                         type: string
 *                         example: "Ravindu Recovery Services"
 *                       drc_email:
 *                         type: string
 *                         example: "ravindu@example.com"
 *                       drc_status:
 *                         type: string
 *                         example: Active
 *                       drc_contact_no:
 *                         type: string
 *                         example: "0711234567"
 *                       drc_business_registration_number:
 *                         type: string
 *                         example: "BRN-452348"
 *                       service_count:
 *                         type: integer
 *                         example: 4
 *                       rtom_count:
 *                         type: integer
 *                         example: 3
 *                       ro_count:
 *                         type: integer
 *                         example: 2
 *                       created_on:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-01-15T08:23:41.000Z"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 43
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     perPage:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *       404:
 *         description: No matching DRC records found.
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
 *                   example: No matching DRC records found.
 *                 data:
 *                   type: array
 *                   example: []
 *       500:
 *         description: Internal server error occurred during the request.
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
 *                   example: Internal server error
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: Error stack or message
 */
router.post("/List_All_DRC_Details", List_All_DRC_Details);

router.post(
  "/List_RTOM_Details_Owen_By_DRC_ID",
  List_RTOM_Details_Owen_By_DRC_ID
);

router.post(
  "/List_Service_Details_Owen_By_DRC_ID",
  List_Service_Details_Owen_By_DRC_ID
);

router.post(
  "/Create_DRC_With_Services_and_SLT_Coordinator",
  Create_DRC_With_Services_and_SLT_Coordinator
);
router.post("/Create_Pre_Negotiation", Create_Pre_Negotiation);
router.post(
  "/List_Pre_Negotiation_By_Case_Id",
  List_Pre_Negotiation_By_Case_Id
);

export default router;
