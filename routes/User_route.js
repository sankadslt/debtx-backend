/* 
    Purpose: This template is used for the User Controllers.
    Created Date: 2025-05-19
    Created By:  Sasindu Srinayaka (sasindusrinayaka@gmail.com)
    Last Modified Date: 2025-05-20
    Modified By: Sasindu Srinayaka (sasindusrinayaka@gmail.com)
    Version: Node.js v20.11.1
    Dependencies: axios , mongoose
    Related Files: User_controller.js, user.js
    Notes:  
*/

// user_route.mjs
import { Router } from "express";
import { End_User, getUserDetailsByRole, List_All_User_Details, List_All_User_Details_By_ID, Update_User_Details } from "../controllers/User_controller.js";
 
const router = Router();

router.post('/Obtain_User_List_Owned_By_User_Roles', getUserDetailsByRole);

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Endpoints related to user management and access.
 *
 * /api/Users/List_All_User_Details:
 *   post:
 *     summary: USER-1P04 Retrieve a paginated list of all user details with optional filters
 *     description: |
 *       Fetches user records with support for pagination and filters.  
 *       - Page 1 returns 10 records.  
 *       - Page 2 and onward return 30 records per page.  
 *       
 *       | Version | Date       | Description     |
 *       |---------|------------|-----------------|
 *       | 01      | 2025-Jun-05| Initial release |
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: Filter by specific user ID
 *                 example: USR12345
 *               user_roles:
 *                 type: string
 *                 description: Filter by user role
 *                 example: admin
 *               user_type:
 *                 type: string
 *                 description: Filter by user type
 *                 example: DRCuser
 *               user_status:
 *                 type: string
 *                 enum: [enabled, disabled]
 *                 description: Filter by user status
 *                 example: enabled
 *               page:
 *                 type: integer
 *                 description: Page number for pagination
 *                 example: 1
 *     responses:
 *       200:
 *         description: User details fetched successfully.
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
 *                   example: User details fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: string
 *                         example: USR12345
 *                       user_status:
 *                         type: string
 *                         example: enabled
 *                       user_type:
 *                         type: string
 *                         example: slt
 *                       user_name:
 *                         type: string
 *                         example: John Doe
 *                       user_mail:
 *                         type: string
 *                         example: john.doe@example.com
 *                       created_dtm:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-11-01T08:30:00.000Z"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 92
 *                     page:
 *                       type: integer
 *                       example: 2
 *                     perPage:
 *                       type: integer
 *                       example: 30
 *                     totalPages:
 *                       type: integer
 *                       example: 4
 *       404:
 *         description: No matching users found.
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
 *                   example: No matching user records found.
 *                 data:
 *                   type: array
 *                   example: []
 *       500:
 *         description: Internal server error while fetching user details.
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
 *                       example: Error stack message here
 */
router.post('/List_All_User_Details', List_All_User_Details);

/**
 * @swagger
 * /api/Users/List_All_User_Details_By_ID:
 *   post:
 *     summary: USER-1P05 Retrieve full user details by user ID
 *     description: |
 *       Returns detailed information for a specific user including type, login method, roles,  
 *       approval status, creation metadata, and remarks.  
 *       
 *       | Version | Date       | Description     |
 *       |---------|------------|-----------------|
 *       | 01      | 2025-Jun-05| Initial release |
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: Unique identifier of the user
 *                 example: USR12345
 *     responses:
 *       200:
 *         description: User details retrieved successfully.
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
 *                   example: User details retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     user_type:
 *                       type: string
 *                       example: DRCuser
 *                     user_mail:
 *                       type: string
 *                       example: john.doe@example.com
 *                     login_method:
 *                       type: string
 *                       example: email
 *                     user_roles:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: [admin, superadmin]
 *                     user_status:
 *                       type: string
 *                       example: enabled
 *                     created_dtm:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-11-01T08:30:00.000Z"
 *                     created_by:
 *                       type: string
 *                       example: SYSTEM
 *                     approved_dtm:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-11-02T10:00:00.000Z"
 *                     approved_by:
 *                       type: string
 *                       example: admin01
 *                     remark:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           remark:
 *                             type: string
 *                             example: Account verified
 *                           remark_dtm:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-11-02T10:05:00.000Z"
 *                           remark_by:
 *                             type: string
 *                             example: admin01
 *       400:
 *         description: Missing user ID.
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
 *                   example: User ID is required.
 *       404:
 *         description: No user found with the given user ID.
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
 *                   example: No user found with the given user ID.
 *                 data:
 *                   type: array
 *                   example: []
 *       500:
 *         description: Internal server error while fetching user data.
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
 *                       example: Error stack trace or message
 */
router.post('/List_All_User_Details_By_ID', List_All_User_Details_By_ID);

/**
 * @swagger
 * /api/Users/Update_User_Details:
 *   post:
 *     summary: USER-1A01 Update user account details
 *     description: |
 *       Updates user fields such as role, email, contact number, and status.  
 *       Also logs a remark for auditing and tracks status change metadata.  
 *       Only the fields included in the request will be updated.
 *       
 *       | Version | Date       | Description      |
 *       |---------|------------|------------------|
 *       | 01      | 2025-Jun-22| Initial release  |
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - updated_by
 *               - remark
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: Unique identifier of the user to update
 *                 example: USR12345
 *               updated_by:
 *                 type: string
 *                 description: ID or email of the user performing the update
 *                 example: admin@example.com
 *               remark:
 *                 type: string
 *                 description: Reason for the update (for audit logging)
 *                 example: "Updated contact number and role."
 *               role:
 *                 type: string
 *                 description: New role to assign
 *                 example: manager
 *               email:
 *                 type: string
 *                 description: New email address to update
 *                 example: john.doe@newmail.com
 *               contact_num:
 *                 type: string
 *                 description: New contact number to update
 *                 example: "+94712345678"
 *               user_status:
 *                 type: string
 *                 enum: [true, false]
 *                 description: Whether the user is active or inactive
 *                 example: false
 *     responses:
 *       200:
 *         description: User details updated successfully.
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
 *                   example: User details updated successfully.
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing required fields (`user_id`, `updated_by`, or `remark`)
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
 *                   example: Updated_by, and remark are required.
 *       404:
 *         description: User not found with the given ID.
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
 *                   example: User not found.
 *       500:
 *         description: Internal server error during user update.
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
 *                 error:
 *                   type: string
 *                   example: Error stack trace or message
 */
router.patch('/Update_User_Details', Update_User_Details);

/**
 * @swagger
 * /api/Users/End_User:
 *   post:
 *     summary: USER-1A02 Terminate user account
 *     description: |
 *       Terminates a user account by setting the end date, disabling the account,
 *       recording the metadata, and appending a termination remark to the user’s history.
 *       
 *       | Version | Date       | Description       |
 *       |---------|------------|-------------------|
 *       | 01      | 2025-Jun-22| Initial release   |
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - end_by
 *               - remark
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: Unique identifier of the user to terminate
 *                 example: USR12345
 *               end_by:
 *                 type: string
 *                 description: ID or email of the user performing the termination
 *                 example: admin@example.com
 *               end_dtm:
 *                 type: string
 *                 format: date-time
 *                 description: Termination date (defaults to current time if omitted)
 *                 example: "2025-06-22T10:15:00.000Z"
 *               remark:
 *                 type: string
 *                 description: Reason for terminating the user
 *                 example: "User resigned from the company."
 *     responses:
 *       200:
 *         description: User terminated successfully.
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
 *                   example: User terminated successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: string
 *                       example: USR12345
 *                     user_status:
 *                       type: string
 *                       example: false
 *                     user_end_dtm:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-22T10:15:00.000Z"
 *                     user_end_by:
 *                       type: string
 *                       example: admin@example.com
 *                     termination_remark:
 *                       type: object
 *                       properties:
 *                         remark:
 *                           type: string
 *                           example: "User resigned from the company."
 *                         remark_by:
 *                           type: string
 *                           example: admin@example.com
 *                         remark_dtm:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-06-22T10:15:00.000Z"
 *       400:
 *         description: Missing required fields or user already terminated.
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
 *                   example: user_id is required in the request body.
 *       404:
 *         description: User not found with the specified ID.
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
 *                   example: User not found.
 *       500:
 *         description: Internal server error during user termination.
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
 *                   example: Error stack trace or description.
 */
router.patch('/End_User', End_User);

export default router;