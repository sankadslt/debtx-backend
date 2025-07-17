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
import { End_User, getUserDetailsByRole, List_All_User_Details, List_All_User_Details_By_ID, Update_User_Details, List_User_Approval_Details } from "../controllers/User_controller.js";
 
const router = Router();

router.post('/Obtain_User_List_Owned_By_User_Roles', getUserDetailsByRole);

/**
 * @swagger
 * tags:
 *   - name: User Management
 *     description: Endpoints for retrieving and managing user accounts.
 *
 * /api/users/List_All_User_Details:
 *   post:
 *     summary: List filtered user records with pagination
 *     description: |
 *       Retrieves a paginated list of user accounts, filtered by optional parameters:
 *       - `user_role`
 *       - `user_type`
 *       - `user_status`
 *       - `page` (for pagination)
 *       
 *       Filtering can be applied through either query parameters or request body (priority depends on backend logic).
 *
 *       | Version | Date       | Description              | Changed By         |
 *       |---------|------------|--------------------------|--------------------|
 *       | 1.0     | 2025-06-24 | Initial version          | Nimesh Perera      |
 *     tags:
 *       - User Management
 *     parameters:
 *       - in: query
 *         name: user_role
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter users by their role.
 *         example: "Admin"
 *       - in: query
 *         name: user_type
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter users by their type.
 *         example: "Internal"
 *       - in: query
 *         name: user_status
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter users by their active status.
 *         example: "true"
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *         description: Page number for pagination. Page 1 returns 10 users, subsequent pages return 30.
 *         example: 1
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_role:
 *                 type: string
 *                 description: Filter users by their role.
 *                 example: "Admin"
 *               user_type:
 *                 type: string
 *                 description: Filter users by type (e.g., Internal, External).
 *                 example: "Internal"
 *               user_status:
 *                 type: string
 *                 description: Filter users by status ("true","false","terminate").
 *                 example: "true"
 *               page:
 *                 type: integer
 *                 description: Page number for pagination.
 *                 example: 1
 *     responses:
 *       200:
 *         description: Matching user records retrieved successfully.
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
 *                         example: "user_001"
 *                       user_status:
 *                         type: string
 *                         example: "true"
 *                       role:
 *                         type: string
 *                         example: "Manager"
 *                       user_type:
 *                         type: string
 *                         example: "External"
 *                       username:
 *                         type: string
 *                         example: "John Doe"
 *                       email:
 *                         type: string
 *                         example: "john.doe@example.com"
 *                       Created_DTM:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-05-12T08:00:00.000Z"
 *       500:
 *         description: Server error during user retrieval.
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
 *                       example: Error message from the server
 */
router.post('/List_All_User_Details', List_All_User_Details);

/**
 * @swagger
 * tags:
 *   - name: User Management
 *     description: Endpoints for retrieving and managing user accounts.
 *
 * /api/users/List_All_User_Details_By_ID:
 *   post:
 *     summary: Retrieve full user details by user ID
 *     description: |
 *       Retrieves complete account details for a specific user by their user ID.
 *
 *       | Version | Date       | Description              | Changed By         |
 *       |---------|------------|--------------------------|--------------------|
 *       | 1.0     | 2025-06-24 | Initial version          | Nimesh Perera      |
 *     tags:
 *       - User Management
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: false
 *         schema:
 *           type: string
 *         description: Unique identifier of the user to retrieve (alternative to requestBody).
 *         example: "user_001"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: Unique identifier of the user to retrieve.
 *                 example: "user_001"
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
 *                     username:
 *                       type: string
 *                       example: "John Doe"
 *                     user_type:
 *                       type: string
 *                       example: "Internal"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     contact_num:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["0712345678"]
 *                     login_method:
 *                       type: string
 *                       example: "email"
 *                     role:
 *                       type: string
 *                       example: "Admin"
 *                     user_status:
 *                       type: string
 *                       example: "true"
 *                     Created_DTM:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-08-01T09:00:00.000Z"
 *                     Created_BY:
 *                       type: string
 *                       example: "admin_user"
 *                     Approved_DTM:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-08-02T10:30:00.000Z"
 *                     Approved_By:
 *                       type: string
 *                       example: "manager_user"
 *                     User_End_DTM:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-31T16:00:00.000Z"
 *                     Remark:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           remark:
 *                             type: string
 *                             example: "User promoted to Admin"
 *                           remark_by:
 *                             type: string
 *                             example: "gm_user"
 *                           remark_dtm:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-06-01T12:00:00.000Z"
 *       400:
 *         description: Missing required user_id in request.
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
 *         description: No user found with the given ID.
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
 *         description: Server error while retrieving user.
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
 *                       example: Error message from the server
 */
router.post('/List_All_User_Details_By_ID', List_All_User_Details_By_ID);

/**
 * @swagger
 * tags:
 *   - name: User Management
 *     description: Endpoints for retrieving and managing user accounts.
 *
 * /api/users/Update_User_Details:
 *   post:
 *     summary: Update user details with remarks
 *     description: |
 *       Updates user details such as role and status, and appends a remark.
 *       Requires `user_id`, `updated_by`, and `remark`. Optional updates for `role` and `user_status`.
 *
 *       | Version | Date       | Description              | Changed By         |
 *       |---------|------------|--------------------------|--------------------|
 *       | 1.0     | 2025-06-24 | Initial version          | Nimesh Perera      |
 *     tags:
 *       - User Management
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: false
 *         schema:
 *           type: string
 *         description: Unique identifier of the user to update (alternative to requestBody).
 *         example: "user_001"
 *       - in: query
 *         name: updated_by
 *         required: false
 *         schema:
 *           type: string
 *         description: User performing the update.
 *         example: "admin_user"
 *       - in: query
 *         name: role
 *         required: false
 *         schema:
 *           type: string
 *         description: New role to assign to the user.
 *         example: "Manager"
 *       - in: query
 *         name: user_status
 *         required: false
 *         schema:
 *           type: string
 *         description: New user status ("true" or "false").
 *         example: "true"
 *       - in: query
 *         name: remark
 *         required: false
 *         schema:
 *           type: string
 *         description: Remark describing the update.
 *         example: "Promoted to Manager"
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
 *                 description: Unique identifier of the user to update.
 *                 example: "user_001"
 *               updated_by:
 *                 type: string
 *                 description: User performing the update.
 *                 example: "admin_user"
 *               role:
 *                 type: string
 *                 description: New role to assign to the user.
 *                 example: "Manager"
 *               user_status:
 *                 type: string
 *                 description: New user status ("true" or "false").
 *                 example: "true"
 *               remark:
 *                 type: string
 *                 description: Remark describing the update.
 *                 example: "Promoted to Manager"
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
 *                   type: object
 *                   description: Updated user document.
 *       400:
 *         description: Missing required fields.
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
 *         description: User not found.
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
 *         description: Server error while updating user.
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
 *                   example: Error message from the server
 */
router.patch('/Update_User_Details', Update_User_Details);

/**
 * @swagger
 * tags:
 *   - name: User Management
 *     description: Endpoints for retrieving and managing user accounts.
 *
 * /api/users/End_User:
 *   post:
 *     summary: Terminate a user account
 *     description: |
 *       Terminates a user account by setting termination details and appending a remark.
 *       Requires `user_id`, `end_by`, and `remark`. Optional `end_dtm` to specify termination datetime.
 *
 *       | Version | Date       | Description              | Changed By         |
 *       |---------|------------|--------------------------|--------------------|
 *       | 1.0     | 2025-06-24 | Initial version          | Nimesh Perera      |
 *     tags:
 *       - User Management
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: false
 *         schema:
 *           type: string
 *         description: Unique identifier of the user to terminate (alternative to requestBody).
 *         example: "user_001"
 *       - in: query
 *         name: end_by
 *         required: false
 *         schema:
 *           type: string
 *         description: User performing the termination.
 *         example: "admin_user"
 *       - in: query
 *         name: end_dtm
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date and time of termination. Defaults to current date-time if omitted.
 *         example: "2025-06-24T15:30:00.000Z"
 *       - in: query
 *         name: remark
 *         required: false
 *         schema:
 *           type: string
 *         description: Remark describing the termination.
 *         example: "User terminated due to policy violation"
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
 *                 description: Unique identifier of the user to terminate.
 *                 example: "user_001"
 *               end_by:
 *                 type: string
 *                 description: User performing the termination.
 *                 example: "admin_user"
 *               end_dtm:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time of termination. Defaults to current datetime if omitted.
 *                 example: "2025-06-24T15:30:00.000Z"
 *               remark:
 *                 type: string
 *                 description: Remark describing the termination.
 *                 example: "User terminated due to policy violation"
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
 *                       example: "user_001"
 *                     user_status:
 *                       type: string
 *                       example: "terminate"
 *                     user_end_dtm:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-24T15:30:00.000Z"
 *                     user_end_by:
 *                       type: string
 *                       example: "admin_user"
 *                     termination_remark:
 *                       type: object
 *                       properties:
 *                         remark:
 *                           type: string
 *                           example: "User terminated due to policy violation"
 *                         remark_by:
 *                           type: string
 *                           example: "admin_user"
 *                         remark_dtm:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-06-24T15:30:00.000Z"
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
 *         description: User not found.
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
 *         description: Server error during termination.
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
 *                   example: Error message from the server
 */
router.patch('/End_User', End_User);

// router.post('/Create_User', Create_User);

router.post('/List_User_Approval_Details', List_User_Approval_Details);

export default router;