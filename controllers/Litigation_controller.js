/* 
    Purpose: This template is used for the Litigation Controllers.
    Created Date: 2025-04-01
    Created By:  Sasindu Srinayaka (sasindusrinayaka@gmail.com)
    Last Modified 
    Modified By: 
    Version: Node.js v20.11.1
    Dependencies: axios , mongoose
    Related Files: Litigation_route.js
    Notes:  
*/

import LitigationDetails from "../models/Case_details.js";

export const ListAllLitigationCases = async (req, res) => {
    const { case_current_status, date_type, from_date, to_date } = req.body;
  
    try {
        // Construct base query
        const query = {};
  
        // Filter by case_current_status if provided
        if (case_current_status) {
            query.case_current_status = {
                $in: [
                    "Initial Litigation", "Pending FTL", "Forward To Litigation", "Fail from Legal Unit", "Fail Legal Action", 
                    "Litigation", "Litigation Settle Pending", "Litigation Settle Open-Pending", "Litigation Settle Active"
                ],
            };
        }
  
        // Apply date filtering based on date_type
        if (date_type && from_date && to_date) {
            const fromDateObj = new Date(from_date);
            const toDateObj = new Date(to_date);
  
            if (date_type === "Settlement created dtm") {
                query["settlement.settlement_created_dtm"] = {
                    $gte: fromDateObj,
                    $lte: toDateObj,
                };
            } else if (date_type === "legal accepted date") {
                query["litigation.legal_submission.submission_on"] = {
                    $gte: fromDateObj,
                    $lte: toDateObj,
                };
            }
        }
  
        // Fetch cases based on the constructed query
        const cases = await LitigationDetails.find(query);
  
        // Handle case where no matching cases are found
        if (!cases || cases.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "No matching cases found for the given criteria.",
                errors: {
                    code: 404,
                    description: "No cases satisfy the provided criteria.",
                },
            });
        }
  
        // Return response
        return res.status(200).json({
            status: "success",
            message: "Cases retrieved successfully.",
            data: cases,
        });
  
    } catch (error) {
        console.error("Error in function:", error);
        return res.status(500).json({
            status: "error",
            message: "An error occurred while retrieving cases.",
            errors: {
                code: 500,
                description: error.message,
            },
        });
    }
};
