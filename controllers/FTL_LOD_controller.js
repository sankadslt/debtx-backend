/* 
    Purpose: This template is used for the LOD Controllers.
    Created Date: 2025-04-01
    Created By:  Ravindu Pathum(ravindupathumiit@gmail.com)
    Last Modified Date: 2025-04-01
    Modified By: Ravindu Pathum (ravindupathumiit@gmail.com)
    Version: Node.js v20.11.1
    Dependencies: axios , mongoose
    Related Files: Case_route.js
    Notes:  
*/

import db from "../config/db.js";
import Case_details from "../models/Case_details.js";



/*  This is the function with the data retriving logic. first time load the 10 rows and second time load next 30 rows
    The variable named 'pages' should be maintain in the frontend and pass to the backend
    Every click of the next button should increment this variable by one and call this function
*/
export const Retrive_logic = async (req, res) => {
    try {
        let { status, pages } = req.body;
        if (!status) {
            res.status(400).json({
                status:"error",
                message: "All fields are required."
            });
        };
        let page = parseInt(pages) || 1;
        const limit = page === 1 ? 10 : 30; // 10 on first load, 30 on next clicks
        const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

        const query = status ? {case_current_status: status} : {};
        const distributions = await Case_details.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ case_id: -1 });
        res.status(200).json({
            status:"success",
            message: "Cases retrieved successfully.",
            data: distributions,
        });
    } catch (error) {
        res.status(500).json({
            status:"error",
            message: error.message,
        });
    }
};


export const lod_customer_response = async (req, res) => {
  try {
      const { case_id, remark } = req.body;
      if (!case_id) {
        res.status(400).json({
            status:"error",
            message: "case_id is required"
        });
      }
      if (!remark) {
        res.status(400).json({
            status:"error",
            message: "remark is required"
        });
      }
      const caseRecord = await Case_details.findOne({ case_id });
      
    //   if (caseRecord.case_current_status !== 'MB Fail with Pending Non-Settlement') {
    //       return res.status(400).json({ message: 'Case status does not match the required condition' });
    //   }
    //   return res.status(200).json({ message: 'Mediation board data updated successfully', caseRecord });

  }catch(error) {
    res.status(500).json({
        status:"error",
        message: error.message,
    });
  }
};