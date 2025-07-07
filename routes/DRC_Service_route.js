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
   ,Change_DRC_Details_with_Services,Ro_detais_of_the_DRC,Rtom_detais_of_the_DRC,Service_detais_of_the_DRC,DRC_Agreement_details_list,Assign_DRC_To_Agreement,List_User_Approval_Details

} from "../controllers/DRC_Service_controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Debt Recovery Company-Services
 *     description: Services-related endpoints, allowing management and updates of services for a DRC.
 *
 * /api/DRC_service/Change_DRC_Details_with_Services:
 *   post:
 *     summary: DRC-1P02 Update DRC Details
 *     description: |
 *       Update details of an existing DRC, including services and remarks.
 *       
 *       | Version | Date       | Description |
 *       |---------|------------|-------------|
 *       | 01      | 2024-Dec-07| Initial creation |
 *       
 *     tags:
 *       - Debt Recovery Company-Services
 *     parameters:
 *       - in: query
 *         name: drc_id
 *         required: true
 *         schema:
 *           type: string
 *           example: "DRC12345"
 *         description: Unique identifier of the Debt Recovery Company.
 *       - in: query
 *         name: drc_status
 *         required: false
 *         schema:
 *           type: string
 *           example: "Active"
 *         description: Updated status of the DRC.
 *       - in: query
 *         name: teli_no
 *         required: false
 *         schema:
 *           type: string
 *           example: "0123456789"
 *         description: Updated telephone number of the DRC.
 *       - in: query
 *         name: remark
 *         required: false
 *         schema:
 *           type: string
 *           example: "Updated status to Active"
 *         description: Remarks related to the update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               drc_id:
 *                 type: string
 *                 description: Unique identifier of the Debt Recovery Company.
 *                 example: "DRC12345"
 *               drc_status:
 *                 type: string
 *                 description: Updated status of the DRC.
 *                 example: "Active"
 *               teli_no:
 *                 type: string
 *                 description: Updated telephone number of the DRC.
 *                 example: "0123456789"
 *               remark:
 *                 type: string
 *                 description: Remark about the changes.
 *                 example: "Status updated to Active"
 *               services_to_add:
 *                 type: array
 *                 description: Array of new services to add.
 *                 items:
 *                   type: object
 *                   properties:
 *                     service_id:
 *                       type: string
 *                       example: "Service001"
 *               services_to_update:
 *                 type: array
 *                 description: Array of services to update.
 *                 items:
 *                   type: object
 *                   properties:
 *                     service_id:
 *                       type: string
 *                       example: "Service001"
 *                     drc_service_status:
 *                       type: string
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
 *                       type: string
 *                       example: "DRC12345"
 *                     drc_status:
 *                       type: string
 *                       example: "Active"
 *                     teli_no:
 *                       type: string
 *                       example: "0123456789"
 *                     services_of_drc:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           service_id:
 *                             type: string
 *                             example: "Service001"
 *                           service_type:
 *                             type: string
 *                             example: "Debt Collection"
 *                           drc_service_status:
 *                             type: string
 *                             example: "Active"
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
 *                   example: Invalid input data provided.
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
 */
router.post("/Change_DRC_Details_with_Services", Change_DRC_Details_with_Services);

router.post("/Change_DRC_Details_with_Services", Change_DRC_Details_with_Services);

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
 *         name: DRC_Email
 *         required: true
 *         schema:
 *           type: string
 *           example: "sampledrc@gmail.com"
 *         description: Email of the Debt Recovery Company.
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
 *               DRC_Email:
 *                 type: string
 *                 description: Email of the Debt Recovery Company.
 *                 example: "sampledrc@gmail.com"
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
 *                     DRC_Email:
 *                       type: string
 *                       example: "sampledrc@gmail.com"
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

/**
 * @swagger
 * tags:
 *   - name: Debt Recovery Company-Services
 *     description: Services-related endpoints, allowing management and registration of services.
 *
 * /api/DRC_service/Ro_detais_of_the_DRC:
 *   post:
 *     summary: DS-**** Fetch the RO details of the DRC
 *     description: |
 *       Fetch Recovery Officer (RO) details for the specified DRC ID.
 *       
 *       | Version | Date        | Description            |
 *       |---------|-------------|------------------------|
 *       | 01      | 2025-06-07  | Initial Implementation |
 *       
 *     tags:
 *       - Recovery Officer
 *     parameters:
 *       - in: query
 *         name: drc_id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 101
 *         description: The unique identifier of the DRC.
 *       - in: query
 *         name: drcUser_status
 *         required: false
 *         schema:
 *           type: string
 *           example: Active
 *         description: Filter by RO status (Active, Inactive, Terminate).
 *       - in: query
 *         name: pages
 *         required: false
 *         schema:
 *           type: integer
 *           example: 2
 *         description: Page number for pagination.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               drc_id:
 *                 type: integer
 *                 example: 101
 *               drcUser_status:
 *                 type: string
 *                 example: Active
 *               pages:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: RO details fetched successfully.
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
 *                   example: Data fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       create_by:
 *                         type: string
 *                         example: admin_user
 *                       login_contact_no:
 *                         type: string
 *                         example: 0771234567
 *                       drcUser_status:
 *                         type: string
 *                         example: Active
 *                       ro_name:
 *                         type: string
 *                         example: John Doe
 *       400:
 *         description: Missing or invalid input.
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
 *                   example: DRC id field is required
 *       500:
 *         description: Server or database error.
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
 *                   example: Server error occurred
 *                 error:
 *                   type: string
 *                   example: Error message details...
 */
router.post("/Ro_detais_of_the_DRC", Ro_detais_of_the_DRC);

/**
 * @swagger
 * tags:
 *   - name: Debt Recovery Company-Services
 *     description: Services-related endpoints, allowing management and registration of services.
 *
 * /api/DRC_service/Rtom_detais_of_the_DRC:
 *   post:
 *     summary: DS-**** Fetch the RTOM details of the DRC
 *     description: |
 *       Fetch RTOM (Regional Telecom Operations Manager) details assigned to a DRC (Debt Recovery Company).
 *       
 *       | Version | Date        | Description            |
 *       |---------|-------------|------------------------|
 *       | 01      | 2025-07-03  | Initial Implementation |
 *       
 *     tags:
 *       - Debt Recovery Company-Services
 *     parameters:
 *       - in: query
 *         name: drc_id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 101
 *         description: The unique identifier of the DRC.
 *       - in: query
 *         name: handling_type
 *         required: false
 *         schema:
 *           type: string
 *           enum: [CPE, Arrears, All-Type]
 *           example: Arrears
 *         description: Optional filter by RTOM handling type.
 *       - in: query
 *         name: pages
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Optional page number for pagination.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               drc_id:
 *                 type: integer
 *                 example: 101
 *               handling_type:
 *                 type: string
 *                 enum: [CPE, Arrears, All-Type]
 *                 example: CPE
 *               pages:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: RTOM details fetched successfully.
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
 *                   example: Data fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       rtom_id:
 *                         type: integer
 *                         example: 201
 *                       rtom_name:
 *                         type: string
 *                         example: Colombo Central
 *                       rtom_status:
 *                         type: string
 *                         example: Active
 *                       rtom_billing_center_code:
 *                         type: string
 *                         example: BC-1001
 *                       handling_type:
 *                         type: string
 *                         example: Arrears
 *                       status_update_by:
 *                         type: string
 *                         example: Admin
 *                       status_update_dtm:
 *                         type: string
 *                         example: 2025-07-03T10:15:30.000Z
 *       400:
 *         description: Missing or invalid DRC ID.
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
 *                   example: DRC id field is required
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
 *                   example: Server error occurred
 *                 error:
 *                   type: string
 *                   example: Error details here
 */
router.post("/Rtom_detais_of_the_DRC", Rtom_detais_of_the_DRC);

/**
 * @swagger
 * /api/DRC_service/Service_detais_of_the_DRC:
 *   post:
 *     summary: DS-**** Fetch the Service details of the DRC
 *     description: |
 *       Fetch service details for the specified DRC ID.
 *       
 *       | Version | Date        | Description              |
 *       |---------|-------------|--------------------------|
 *       | 01      | 2025-07-03  | Initial Implementation   |
 *       
 *     tags:
 *       - Debt Recovery Company-Services
 *     parameters:
 *       - in: query
 *         name: drc_id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 101
 *         description: The unique identifier of the DRC.
 *       - in: query
 *         name: service_status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [Active, Inactive]
 *           example: Active
 *         description: Filter services by status.
 *       - in: query
 *         name: pages
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number for pagination.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               drc_id:
 *                 type: integer
 *                 example: 101
 *               service_status:
 *                 type: string
 *                 example: Active
 *               pages:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Service details fetched successfully.
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
 *                   example: Data fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       service:
 *                         type: object
 *                         properties:
 *                           service_id:
 *                             type: string
 *                             example: SVC001
 *                           service_type:
 *                             type: string
 *                             example: Legal Notice
 *                           service_status:
 *                             type: string
 *                             example: Active
 *                           create_by:
 *                             type: string
 *                             example: admin_user
 *                           create_dtm:
 *                             type: string
 *                             format: date-time
 *                             example: 2025-07-01T10:00:00Z
 *                           status_update_dtm:
 *                             type: string
 *                             format: date-time
 *                             example: 2025-07-02T12:00:00Z
 *                           status_update_by:
 *                             type: string
 *                             example: admin_user
 *       400:
 *         description: Missing required drc_id or invalid input.
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
 *                   example: DRC id field is required
 *       500:
 *         description: Server or database error occurred.
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
 *                   example: Server error occurred
 *                 error:
 *                   type: string
 *                   example: Unexpected aggregation error.
 */
router.post("/Service_detais_of_the_DRC", Service_detais_of_the_DRC);

/**
 * @swagger
 * tags:
 *   - name: Debt Recovery Company-Services
 *     description: Services-related endpoints, allowing management and registration of services.
 *
 * /api/DRC_service/DRC_Agreement_details_list:
 *   post:
 *     summary: DS-**** Fetch agreement details of the DRC
 *     description: |
 *       Fetch the list of agreement details (start/end date, remark, etc.) for the specified DRC ID.
 *       
 *       | Version | Date        | Description            |
 *       |---------|-------------|------------------------|
 *       | 01      | 2025-07-03  | Initial Implementation |
 *       
 *     tags:
 *       - Debt Recovery Company-Services
 *     parameters:
 *       - in: query
 *         name: drc_id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 101
 *         description: The unique identifier of the DRC.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               drc_id:
 *                 type: integer
 *                 example: 101
 *                 description: The ID of the Debt Recovery Company (DRC).
 *     responses:
 *       200:
 *         description: Agreement details fetched successfully.
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
 *                   example: Data fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       drc_agreement_details:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             agreement_start_dtm:
 *                               type: string
 *                               format: date-time
 *                               example: 2025-01-01T00:00:00Z
 *                             agreement_end_dtm:
 *                               type: string
 *                               format: date-time
 *                               example: 2026-01-01T00:00:00Z
 *                             agreement_remark:
 *                               type: string
 *                               example: First year agreement signed.
 *                             agreement_update_by:
 *                               type: string
 *                               example: AdminUser
 *       400:
 *         description: Missing or invalid DRC ID.
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
 *                   example: DRC id field is required
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
 *                   example: Server error occurred
 *                 error:
 *                   type: string
 *                   example: Error stack or message here
 */
router.post("/DRC_Agreement_details_list", DRC_Agreement_details_list);

router.post("/Assign_DRC_To_Agreement", Assign_DRC_To_Agreement);

router.post("/List_User_Approval_Details", List_User_Approval_Details);

export default router;

