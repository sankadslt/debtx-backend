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
import { getUserDetailsByRole, List_All_User_Details } from "../controllers/User_controller.js";
 
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
 *       | Version | Date       | Description       |
 *       |---------|------------|-------------------|
 *       | 01      | 2025-Jun-05| Initial release   |
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
 *                 example: super@gmail.com
 *               role:
 *                 type: string
 *                 description: Filter by user role
 *                 example: admin
 *               user_type:
 *                 type: string
 *                 description: Filter by user type
 *                 example: drc
 *               user_status:
 *                 type: string
 *                 enum: [enable, disable]
 *                 description: Filter by user status
 *                 example: enable
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
 *                         example: enable
 *                       user_type:
 *                         type: string
 *                         example: slt
 *                       username:
 *                         type: string
 *                         example: John Doe
 *                       email:
 *                         type: string
 *                         example: john.doe@example.com
 *                       created_on:
 *                         type: string
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

export default router;