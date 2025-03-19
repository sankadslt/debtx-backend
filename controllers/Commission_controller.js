/* 
    Purpose: This template is used for the Case Controllers.
    Created Date: 2025-01-08
    Created By: Lasandi Randini
    Last Modified Date: 2025-03-18
    Modified By: Lasandi Randini
    Version: Node.js v20.11.1
    Dependencies: axios , mongoose
    Related Files: Case_route.js
    Notes:  
*/


import MoneyCommission from "../models/Money_commission.js";

export const List_All_Commission_Cases = async (req, res) => {
    try {
      const { case_id, From_DAT, TO_DAT, DRC_ID } = req.body;
  
      // If no case_id is provided, fetch the 10 latest documents
      if (!case_id) {
        const latestCommissions = await MoneyCommission.find({})
          .sort({ created_on: -1 }) 
          .limit(10) 
          .exec();
  
        return res.status(200).json({
          status: "success",
          message: "Latest 10 Money Commission details retrieved successfully.",
          data: latestCommissions,
        });
      }
  
     
      const query = {
        case_id: case_id,
      };
  
      // Add date range to query if From_DAT and TO_DAT are provided
      if (From_DAT && TO_DAT) {
        query.created_on = {
          $gte: new Date(From_DAT), 
          $lte: new Date(TO_DAT),   
        };
      }
  
     
      if (DRC_ID) {
        query.drc_id = DRC_ID;
      }
  
      // Fetch data from MongoDB
      const commissions = await MoneyCommission.find(query)
        .sort({ created_on: -1 }) 
        .exec();
  
      if (!commissions || commissions.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "No Money Commission data found.",
          errors: {
            code: 404,
            description: "No data matches the provided criteria.",
          },
        });
      }
  
      // Return success response
      return res.status(200).json({
        status: "success",
        message: "Money Commission details retrieved successfully.",
        data: commissions,
      });
    } catch (err) {
      
      console.error("Error fetching Money Commission data:", err.message);
  
      // Return 500 Internal Server Error response
      return res.status(500).json({
        status: "error",
        message: "Failed to retrieve Money Commission details.",
        errors: {
          code: 500,
          description: "Internal server error occurred while fetching data.",
        },
      });
    }
  };
  