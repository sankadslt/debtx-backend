/*
    Purpose: This template is used for the DRC Routes.
    Created Date: 2024-11-21
    Created By: Lasandi Randini (randini-im20057@stu.kln.ac.lk)
    Version: Node.js v20.11.1
    Dependencies: express
    Related Files: DRC_controller.js
    Notes:  
*/

import { Router } from "express";
import {

    getDRCDetailsByDate, getDRCDetailsByTimePeriod, registerDRCWithServices, Service_to_DRC, Remove_Service_From_DRC
   ,manageDRC 

} from "../controllers/DRC_Service_controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Debt Recovery Company-Services
 *     description: Endpoints to manage DRCs and their associated services.
 *
 * /api/DRC_service/manageDRC:
 *   post:
 *     summary: Update DRC details and manage associated services
 *     description: |
 *       Manage a Debt Recovery Company (DRC) by updating its details, adding new services, or updating the status of existing services.
 *       
 *       | Version | Date       | Description       |
 *       |---------|------------|-------------------|
 *       | 01      | 2025-Jan-03| Initial creation  |
 *       
 *     tags:
 *       - Debt Recovery Company-Services
 *     parameters:
 *       - in: query
 *         name: drc_id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The unique ID of the Debt Recovery Company to update.
 *       - in: query
 *         name: drc_status
 *         required: false
 *         schema:
 *           type: string
 *           example: "Active"
 *         description: The new status for the DRC (Active, Inactive, Pending).
 *       - in: query
 *         name: teli_no
 *         required: false
 *         schema:
 *           type: string
 *           example: "+1-800-555-1234"
 *         description: The updated telephone number for the DRC.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               drc_id:
 *                 type: integer
 *                 description: The unique ID of the Debt Recovery Company.
 *                 example: 1
 *               drc_status:
 *                 type: string
 *                 description: New status of the DRC (Active, Inactive, Pending).
 *                 example: "Active"
 *               teli_no:
 *                 type: string
 *                 description: Updated telephone number for the DRC.
 *                 example: "+1-800-555-1234"
 *               services_to_add:
 *                 type: array
 *                 description: Array of new services to add to the DRC.
 *                 items:
 *                   type: object
 *                   properties:
 *                     service_id:
 *                       type: integer
 *                       description: The unique ID of the service to add.
 *                       example: 56
 *               services_to_update:
 *                 type: array
 *                 description: Array of existing services to update their statuses.
 *                 items:
 *                   type: object
 *                   properties:
 *                     service_id:
 *                       type: integer
 *                       description: The unique ID of the service to update.
 *                       example: 24
 *                     drc_service_status:
 *                       type: string
 *                       description: The new status of the service (Active, Inactive).
 *                       example: "Inactive"
 *     responses:
 *       200:
 *         description: DRC updated successfully.
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
 *                   example: DRC updated successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     drc_id:
 *                       type: integer
 *                       example: 1
 *                     drc_status:
 *                       type: string
 *                       example: Active
 *                     teli_no:
 *                       type: string
 *                       example: "+1-800-555-1234"
 *                     services_of_drc:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           service_id:
 *                             type: integer
 *                             example: 56
 *                           service_type:
 *                             type: string
 *                             example: Consulting
 *                           drc_service_status:
 *                             type: string
 *                             example: Active
 *                           status_change_dtm:
 *                             type: string
 *                             example: "2025-01-03T10:00:00.000Z"
 *                           status_changed_by:
 *                             type: string
 *                             example: Admin
 *       400:
 *         description: Missing or invalid input data.
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
 *                 errors:
 *                   type: object
 *                   additionalProperties:
 *                     type: string
 *                     example: "Validation error for service_id"
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
 *                   example: Failed to update DRC.
 *                 errors:
 *                   type: object
 *                   additionalProperties:
 *                     type: string
 *                     example: "Unexpected database error"
 */
router.post("/manageDRC", manageDRC);

router.get("/drc-details-by-date", getDRCDetailsByDate);
router.get("/drc-details-by-time-period", getDRCDetailsByTimePeriod);
/**
 * @swagger
 * tags:
 *   - name: Debt Recovery Company-Services
 *     description: Services-related endpoints, allowing management and registration of services.
 *
 * /api/DRC_service/Register_DRC_with_Services:
 *   post:
 *     summary: DRC-1P01 Register a new Debt Recovery Company (DRC)
 *     description: |
 *       Create a new Debt Recovery Company (DRC) with associated services.
 *       
 *       | Version | Date       | Description |
 *       |---------|------------|-------------|
 *       | 01      | 2024-Dec-07| Initial creation |
 *       
 *     tags:
 *       - Debt Recovery Company-Services
 *     parameters:
 *       - in: query
 *         name: DRC_Name
 *         required: true
 *         schema:
 *           type: string
 *           example: "Sample DRC"
 *         description: Full name of the Debt Recovery Company.
 *       - in: query
 *         name: DRC_Business_Registration_Number
 *         required: true
 *         schema:
 *           type: string
 *           example: "BR12345678"
 *         description: Business registration number of the DRC (must be unique).
 *       - in: query
 *         name: Contact_Number
 *         required: true
 *         schema:
 *           type: string
 *           example: "0123456789"
 *         description: Telephone number of the DRC.
 *       - in: query
 *         name: Services
 *         required: false
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Service001", "Service002"]
 *         description: List of service IDs to associate with the DRC.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               DRC_Name:
 *                 type: string
 *                 description: Full name of the Debt Recovery Company.
 *                 example: "Sample DRC"
 *               DRC_Business_Registration_Number:
 *                 type: string
 *                 description: Business registration number of the Debt Recovery Company.
 *                 example: "BR12345678"
 *               Contact_Number:
 *                 type: string
 *                 description: Contact number of the Debt Recovery Company.
 *                 example: "0123456789"
 *               Services:
 *                 type: array
 *                 description: Array of service IDs to associate with the DRC.
 *                 items:
 *                   type: string
 *                 example: ["Service001", "Service002"]
 *     responses:
 *       201:
 *         description: DRC registered successfully.
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
 *                   example: DRC registered successfully with assigned services.
 *                 data:
 *                   type: object
 *                   properties:
 *                     drc_id:
 *                       type: integer
 *                       example: 1
 *                     drc_name:
 *                       type: string
 *                       example: Sample DRC
 *                     contact_no:
 *                       type: string
 *                       example: "0123456789"
 *                     drc_business_registration_number:
 *                       type: string
 *                       example: BR12345678
 *       400:
 *         description: Missing or invalid input data.
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
 *                   example: Failed to register DRC.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     field_name:
 *                       type: string
 *                       example: "All fields are required"
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
 *                   example: Failed to register DRC.
 *                 errors:
 *                   type: object
 *                   additionalProperties:
 *                     type: string
 *                     example: "Database error occurred"
 */
router.post("/Register_DRC_with_Services", registerDRCWithServices);
/**
 * @swagger
 * tags:
 *   - name: Debt Recovery Company-Services
 *     description: Services-related endpoints, allowing management and registration of services.
 *
 * /api/DRC_service/Service_to_DRC:
 *   post:
 *     summary: DS-2PO1 Create new record in debt_reocovery_compnay_service
 *     description: |
 *       Assigns a service to a DRC with a default status of "Active." Ensures no active service exists for the specified DRC before assignment:
 *       
 *       | Version | Date       | Description            |
 *       |---------|------------|------------------------|
 *       | 01      | 2024-Dec-07|                        |
 *       
 *     tags:
 *       - Debt Recovery Company-Services
 *     parameters:
 *       - in: query
 *         name: DRC_ID
 *         required: true
 *         schema:
 *           type: integer
 *           example: 101
 *         description: The unique identifier of the DRC to which the service will be assigned.
 *       - in: query
 *         name: Service_ID
 *         required: true
 *         schema:
 *           type: integer
 *           example: 202
 *         description: The unique identifier of the service to be assigned to the DRC.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               DRC_ID:
 *                 type: integer
 *                 description: The ID of the DRC.
 *                 example: 101
 *               Service_ID:
 *                 type: integer
 *                 description: The ID of the service.
 *                 example: 202
 *     responses:
 *       201:
 *         description: Service assigned to DRC successfully.
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
 *                   example: Service assigned to DRC successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     drc_id:
 *                       type: integer
 *                       example: 101
 *                     service_id:
 *                       type: integer
 *                       example: 202
 *                     drc_service_status:
 *                       type: string
 *                       example: Active
 *                     created_by:
 *                       type: string
 *                       example: Admin
 *                     created_dtm:
 *                       type: string
 *                       example: 2024-12-07 12:00:00
 *                     service_status_changed_by:
 *                       type: string
 *                       example: Admin
 *                     service_status_changed_dtm:
 *                       type: string
 *                       example: 2024-12-07 12:00:00
 *       400:
 *         description: Validation error or active service already exists.
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
 *                   example: An active service already exists for this company.
 *       500:
 *         description: Internal server or database error occurred.
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
 *                   example: Failed to assign service to DRC.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       example: Failed to verify existing active services.
 */
router.post("/Service_to_DRC", Service_to_DRC);


/**
 * @swagger
 * tags:
 *   - name: Debt Recovery Company-Services
 *     description: Services-related endpoints, allowing management and registration of services.
 *
 * /api/DRC_service/Remove_Service_From_DRC:
 *   patch:
 *     summary: DS-2AO1 Remove Service From DRC
 *     description: |
 *       Deactivates an active service from a specific DRC by updating its status to "Inactive".
 *       
 *       | Version | Date       | Description |
 *       |---------|------------|-------------|
 *       | 01      | 2024-Dec-07|             |
 *       
 *     tags:
 *       - Debt Recovery Company-Services
 *     parameters:
 *       - in: query
 *         name: DRC_ID
 *         required: true
 *         schema:
 *           type: integer
 *           example: 101
 *         description: The unique ID of the DRC.
 *       - in: query
 *         name: Service_ID
 *         required: true
 *         schema:
 *           type: integer
 *           example: 202
 *         description: The unique ID of the service to be removed.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               DRC_ID:
 *                 type: integer
 *                 description: The unique ID of the DRC.
 *                 example: 101
 *               Service_ID:
 *                 type: integer
 *                 description: The unique ID of the service to be removed.
 *                 example: 202
 *     responses:
 *       200:
 *         description: Service removed successfully from the DRC.
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
 *                   example: Service removed successfully from DRC.
 *                 data:
 *                   type: object
 *                   properties:
 *                     DRC_ID:
 *                       type: integer
 *                       example: 101
 *                     Service_ID:
 *                       type: integer
 *                       example: 202
 *                     drc_service_status:
 *                       type: string
 *                       example: Inactive
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
 *                   example: Failed to remove service from DRC.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     field_name:
 *                       type: string
 *                       example: DRC_ID and Service_ID are required.
 *       404:
 *         description: No active service found for the specified DRC and Service ID.
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
 *                   example: No active service found for the specified DRC and Service ID.
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
 *                   example: Failed to remove service from DRC.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       example: Database error message.
 */
router.patch("/Remove_Service_From_DRC", Remove_Service_From_DRC);

export default router;

