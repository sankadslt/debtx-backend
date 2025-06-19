import { Router } from "express";
import { List_All_Commission_Cases,
    commission_type_cases_count,
    Create_task_for_Download_Commision_Case_List,
    Commission_Details_By_Commission_ID,
    forwardToApprovals
 } from "../controllers/Commission_controller.js";

const router = Router();

router.post("/List_All_Commission_Cases", List_All_Commission_Cases );

router.get("/commission_type_cases_count", commission_type_cases_count);

router.post("/Create_task_for_Download_Commision_Case_List", Create_task_for_Download_Commision_Case_List );

router.post("/Commission_Details_By_Commission_ID", Commission_Details_By_Commission_ID );

/**
 * @swagger
 * /api/commission/forward-to-approvals:
 *   post:
 *     summary: Forward DRC case for Commission Approval.
 *     tags:
 *       - Case Approvals
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - drcId
 *               - Created_By
 *             properties:
 *               drcId:
 *                 type: string
 *                 example: "8"
 *               Created_By:
 *                 type: string
 *                 example: "super@gmail.com"
 *     responses:
 *       200:
 *         description: Case forwarded successfully.
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
 *                   example: Cases forwarded for approval successfully.
 *                 data:
 *                   type: object
 *                 task:
 *                   type: object
 *       400:
 *         description: Missing required fields (drcId, Created_By).
 *       500:
 *         description: Internal server error.
 */


router.post("/forward-to-approvals", forwardToApprovals);

export default router;
