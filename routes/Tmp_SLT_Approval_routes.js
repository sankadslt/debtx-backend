import express from "express";
import { getApprovalUserId, getBatchApprovalUserId } from "../controllers/Tmp_SLT_Approval_Controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/Obtain_Nominee:
 *   post:
 *     summary: Get approval user ID
 *     description: |
 *       Retrieve the user_id based on the provided case_phase, approval_type, and billing_center.
 *
 *       | Version | Date        | Description                        | Changed By            |
 *       |---------|-------------|------------------------------------|-----------------------|
 *       | 01      | 2025-Mar-09 | Get approval user id               | Shyamal Warnakula     |
 *
 *     tags: [Approval Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - case_phase
 *               - approval_type
 *             properties:
 *               case_phase:
 *                 type: string
 *                 description: The case phase for which the approval user ID is needed.
 *                 example: Phase_1
 *               approval_type:
 *                 type: string
 *                 description: The approval type for which the approval user ID is needed.
 *                 example: Type_A
 *               billing_center:
 *                 type: string
 *                 description: The billing center for which the approval is required (optional).
 *                 example: Center_X
 *     responses:
 *       200:
 *         description: Approval user ID retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: integer
 *                   description: The ID of the user assigned for approval.
 *                   example: 123
 *       400:
 *         description: Validation error - Missing required parameters.
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
 *                   example: case_phase and approval_type are required.
 *       404:
 *         description: No matching record found.
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
 *                   example: No matching record found.
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
 *                   example: Internal Server Error.
 */

router.post("/Obtain_Nominee", getApprovalUserId);

/**
 * @swagger
  * /api/Obtain_Batch_Nominee:
 *    post:
 *     summary: Get approval user ID for a batch
 *     description: |
 *       Retrieve a single user_id from a batch request containing multiple case_phase and approval_type pairs.
 *
 *       | Version | Date        | Description                        | Changed By            |
 *       |---------|-------------|------------------------------------|-----------------------|
 *       | 01      | 2025-Mar-09 | Get approval user id for a batch     | Shyamal Warnakula    |
 *
 *     tags: [Approval Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - case_phase
 *               - approval_type
 *             properties:
 *               case_phase:
 *                 type: string
 *                 description: The case phase for which the approval user ID is needed.
 *                 example: Phase_1
 *               approval_type:
 *                 type: string
 *                 description: The approval type for which the approval user ID is needed.
 *                 example: Type_A
 *     responses:
 *       200:
 *         description: Approval user ID retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: integer
 *                   description: The ID of the user assigned for approval.
 *                   example: 123
 *       400:
 *         description: Validation error - Missing required parameters.
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
 *                   example: case_phase and approval_type are required.
 *       404:
 *         description: No matching record found.
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
 *                   example: No matching record found.
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
 *                   example: Internal Server Error.
 */

router.post("/Obtain_Batch_Nominee", getBatchApprovalUserId);

export default router;