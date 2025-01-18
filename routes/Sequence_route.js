import { Router } from "express";
import { getSequence } from "../controllers/Sequence_controller.js";

const router = Router();

/**
 * @swagger
 * /api/sequence/Document_Sequence:
 *   post:
 *     summary: SEQ-1PO1 Retrieve next sequence value of a collection
 *     description: |
 *       Retrieves next sequence value of a collection using the collection name:
 *
 *       | Version | Date       | Description            |
 *       |---------|------------|------------------------|
 *       | 01      | 2024-Dec-10| Initial implementation |
 *
 *     tags:
 *       - Sequence
 *     parameters:
 *       - in: query
 *         name: collection_name
 *         required: true
 *         schema:
 *           type: string
 *           example: Sample Name
 *         description: Name of the collection.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               collection_name:
 *                 type: string
 *                 example: "Services"
 *             required:
 *               - collection_name
 *             description: JSON payload containing the collection name.
 *     responses:
 *       200:
 *         description: Successfully retrieved next sequence value.
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
 *                   example: Successfully retrieved next sequence value.
 *                 data:
 *                   type: object
 *                   properties:
 *                     sequence:
 *                       type: string
 *                       example: 1
 *        
 *       400:
 *         description: Validation error due to missing collection_name.
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
 *                   example: Failed to retrieve next sequence value.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 400
 *                     description:
 *                       type: string
 *                       example: "collection_name is required."
 *       404:
 *         description: No collection found with the provided collection name.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: not found
 *                 message:
 *                   type: string
 *                   example: Unknown collection or sequence name.
 *                 data:
 *                   type: object
 *                   properties:
 *                     sequence:
 *                       type: string
 *                       example: -1
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
 *                   example: Failed to retrieve next sequence value.
 *                 errors:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 500
 *                     description:
 *                       type: string
 *                       example: "An unexpected error occurred while retrieving next sequence value."
 */
router.post("/Document_Sequence", getSequence);

export default router;