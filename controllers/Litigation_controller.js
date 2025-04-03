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

import db from "../config/db.js";
import LitigationDetails from "../models/Case_details.js";

export const ListAllListigationCases = async (req, res) => {
    const { case_current_status, date_type, from_date, to_date } = req.body;
  
    try {
        const query = {
          case_current_status: {
            $in: [
              "Initial Litigation",
              "Pending FTL",
              "Forward To Litigation",
              "Fail from Legal Unit",
              "Fail Legal Action",
              "Litigation",
              "Litigation Settle Pending",
              "Litigation Settle Open-Pending",
              "Litigation Settle Active",
            ],
          },
        };
    
        // Add optional filters dynamically
        if (date_type) query.$and.push({ action_type });
        if (case_current_status) query.$and.push({ case_current_status });
        if (from_date && to_date) {
            query.$and.push({ "drc.created_dtm": { $gt: new Date(from_date) } });
            query.$and.push({ "drc.created_dtm": { $lt: new Date(to_date) } });
        }

        // Fetch cases based on the query
        const cases = await Case_details.find(query);
  
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
  
        // Format cases based on drc_id or ro_id
        const formattedCases = await Promise.all(
            cases.map(async (caseData) => {
            const findDRC = Array.isArray(caseData.drc) ? caseData.drc.find((drc) => drc.drc_id === drc_id) : null;
    
            const lastRO = findDRC?.recovery_officers?.[findDRC.recovery_officers.length - 1] || null;
    
            const matchingRecoveryOfficer = await RecoveryOfficer.findOne({ ro_id: lastRO?.ro_id });
    
            const mediationBoardCount = caseData.mediation_board?.length || 0;
    
            return {
                case_id: caseData.case_id,
                status: caseData.case_current_status,
                created_dtm: findDRC?.created_dtm || null,
                ro_name: matchingRecoveryOfficer?.ro_name || null,
                area: caseData.area,
                mediation_board_count: mediationBoardCount,
                next_calling_date: caseData.mediation_board?.[mediationBoardCount - 1]?.mediation_board_calling_dtm || null,
                current_contact:caseData.current_contact || null,
                account_no: caseData.account_no || null
            };
            })
        );
  
        // Return response
        return res.status(200).json({
            status: "success",
            message: "Cases retrieved successfully.",
            data: formattedCases.filter(Boolean), // Filter out null/undefined values
        });
  
    } catch (error) {
        console.error("Error in function:", error); // Log the full error for debugging
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
