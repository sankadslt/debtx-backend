/* 
    Purpose: This template is used for the FTL LOD Route.
    Created Date: 2025-04-03
    Created By:  Dinusha Anupama (dinushanupama@gmail.com)
    Last Modified Date: 2025-04-01
    Modified By: Dinusha Anupama (dinushanupama@gmail.com)
    Version: Node.js v20.11.1
    Dependencies: axios , mongoose
    Related Files: FTL_LOD_route.js
    Notes:  
*/

import db from "../config/db.js";
import Case_details from "../models/Case_details.js";
import mongoose from "mongoose";


/*  This is the function with the data retriving logic. first time load the 10 rows and second time load next 30 rows
    The variable named 'pages' should be maintain in the frontend and pass to the backend
    Every click of the next button should increment this variable by one and call this function
*/
export const Retrive_logic = async (req, res) => {
    try {
        const { status, pages } = req.body;
        if (!status) {
            res.status(400).json({
                status:"error",
                message: "All fields are required."
            });
        };
        let page = Number(pages);
        if (isNaN(page) || page < 1) page = 1;

        const limit = page === 1 ? 10 : 30;
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


export const List_FTL_LOD_Cases = async (req, res) => {

};