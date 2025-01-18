/* 
    Purpose: This template is used for the Service Routes.
    Created Date: 2024-11-24
    Created By: Janendra Chamodi (apjanendra@gmail.com)
    Last Modified Date: 2024-11-24
    Modified By: Janendra Chamodi (apjanendra@gmail.com)
                Lasandi Randini (randini-im20057@stu.kln.ac.lk)
    Version: Node.js v20.11.1
    Dependencies: express
    Related Files: Service_controller.js
    Notes:  
*/

import { Router } from "express";
import {
  Register_Service_Type,
  changeServiceStatus,
  getAllServices,
  getServiceDetailsById,
  getActiveServiceDetails,
} from "../controllers/Service_controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Service
 *     description: Services-related endpoints, allowing management and registration of services.
 *
 * /api/Service/Register_Service_Type:
 *   post:
 *     summary: SVC-1PO1 Create New Service Type
 *     description: |
 *       Registers a new service type with a status of "Active" by default:
 *
 *       | Version | Date       | Description |
 *       |---------|------------|-------------|
 *       | 01      | 2024-Dec-07|             |
 *
 *     tags:
 *       - Service
 *     parameters:
 *       - in: query
 *         name: service_type
 *         required: true
 *         schema:
 *           type: string
 *           example: Internet
 *         description: The name of the service type to be registered.
 *       - in: query
 *         name: service_status
 *         required: false
 *         schema:
 *           type: string
 *           example: Active
 *         description: The status of the service (defaults to "Active").
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               service_type:
 *                 type: string
 *                 description: The name of the service type to be registered.
 *                 example: Internet
 *     responses:
 *       201:
 *         description: Service type registered successfully.
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
 *                   example: Service type registered successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     service_id:
 *                       type: integer
 *                       example: 1
 *                     service_type:
 *                       type: string
 *                       example: Internet
 *                     service_status:
 *                       type: string
 *                       example: Active
 *       400:
 *         description: Validation error occurred while creating the service.
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
 *                   example: Failed to register the service type.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     description:
 *                       type: string
 *                       example: Validation error occurred while creating the service.
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
 *                   example: Database error
 *                 error:
 *                   type: object
 *                   additionalProperties:
 *                     type: string
 */
router.post("/Register_Service_Type", Register_Service_Type);

/**
 * @swagger
 * /api/Service/Change_Service_Status:
 *   patch:
 *     summary: SVC-1AO1 Update the status of a service
 *     description: |
 *       changes the status of a Service:
 *
 *       | Version | Date       | Description            |
 *       |---------|------------|------------------------|
 *       | 01      | 2024-Dec-07| Initial implementation |
 *
 *     tags:
 *       - Service
 *     parameters:
 *       - in: query
 *         name: service_id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The ID of the service to be updated.
 *       - in: query
 *         name: service_status
 *         required: true
 *         schema:
 *           type: string
 *           example: Inactive
 *         description: The new status of the service (e.g., Active, Inactive).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               service_id:
 *                 type: integer
 *                 example: 1
 *                 description: The ID of the service to be updated.
 *               service_status:
 *                 type: string
 *                 example: "Active"
 *                 description: The new status of the service (e.g., Active, Inactive).
 *     responses:
 *       200:
 *         description: Service status updated successfully.
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
 *                   example: Service status updated successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     service_id:
 *                       type: integer
 *                       example: 1
 *                     service_type:
 *                       type: string
 *                       example: Internet
 *                     service_status:
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
 *                   example: Failed to update the service status.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     description:
 *                       type: string
 *                       example: "Missing required fields: service_id or service_status."
 *       404:
 *         description: Service not found for the given service ID.
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
 *                   example: Failed to update the service status.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 404
 *                     description:
 *                       type: string
 *                       example: "Service not found for the given service_id."
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
 *                   example: Failed to update the service status.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: "An unexpected error occurred while updating the service status."
 */
router.patch("/Change_Service_Status", changeServiceStatus);

/**
 * @swagger
 * /api/Service/Service_Details:
 *   get:
 *     summary: SVC-1GO1 Retrieve details of all services
 *     description: |
 *       Retrieves details of all available services:
 *
 *       | Version | Date       | Description            |
 *       |---------|------------|------------------------|
 *       | 01      | 2024-Dec-07| Initial implementation |
 *
 *     tags:
 *       - Service
 *     responses:
 *       200:
 *         description: Successfully retrieved service details.
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
 *                   example: Successfully retrieved service details.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       service_id:
 *                         type: integer
 *                         example: 1
 *                       service_type:
 *                         type: string
 *                         example: Internet
 *                       service_status:
 *                         type: string
 *                         example: Active
 *                       created_at:
 *                         type: string
 *                         example: "2024-01-01T12:00:00Z"
 *                       updated_at:
 *                         type: string
 *                         example: "2024-01-10T15:30:00Z"
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
 *                   example: Failed to retrieve service details.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: "An unexpected error occurred while retrieving service details."
 */
router.get("/Service_Details", getAllServices);

/**
 * @swagger
 * /api/Service/Service_Details_By_Id:
 *   post:
 *     summary: SVC-1PO1 Retrieve details of a specific service by ID
 *     description: |
 *       Retrieves details of a specific service using its ID:
 *
 *       | Version | Date       | Description            |
 *       |---------|------------|------------------------|
 *       | 01      | 2024-Dec-07| Initial implementation |
 *
 *     tags:
 *       - Service
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               service_id:
 *                 type: integer
 *                 example: 1
 *             required:
 *               - service_id
 *             description: JSON payload containing the service ID.
 *     responses:
 *       200:
 *         description: Successfully retrieved service details.
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
 *                   example: Service details retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     service_id:
 *                       type: integer
 *                       example: 1
 *                     service_type:
 *                       type: string
 *                       example: Internet
 *                     service_status:
 *                       type: string
 *                       example: Active
 *       400:
 *         description: Validation error due to missing service ID.
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
 *                   example: Failed to retrieve service details.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     description:
 *                       type: string
 *                       example: "Service ID is required."
 *       404:
 *         description: No service found with the provided ID.
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
 *                   example: Service not found.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 404
 *                     description:
 *                       type: string
 *                       example: "No service found with service_id: 1."
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
 *                   example: Failed to retrieve service details.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: "An unexpected error occurred while retrieving service details."
 */
router.post("/Service_Details_By_Id", getServiceDetailsById);

/**
 * @swagger
 * /api/Service/Active_Service_Details:
 *   get:
 *     summary: SVC-1GO2 Retrieve all active services
 *     description: |
 *       Retrieves details of all services with status 'Active':
 *       
 *       | Version | Date       | Description            |
 *       |---------|------------|------------------------|
 *       | 01      | 2024-Dec-07| Initial implementation |
 *
 *     tags:
 *       - Service
 *     responses:
 *       200:
 *         description: Successfully retrieved active services.
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
 *                   example: Active services retrieved successfully.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       service_id:
 *                         type: integer
 *                         example: 1
 *                       service_type:
 *                         type: string
 *                         example: Internet
 *                       service_status:
 *                         type: string
 *                         example: Active
 *       404:
 *         description: No active services found.
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
 *                   example: No active services found.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 404
 *                     description:
 *                       type: string
 *                       example: "There are no services with active status."
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
 *                   example: Failed to retrieve active services.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: "An unexpected error occurred while fetching active services."
 */
router.get("/Active_Service_Details", getActiveServiceDetails);

export default router;