/* 
    Purpose: This template is used for the Task Controllers.
    Created Date: 2025-07-02
    Created By:  Sathmi Peiris (rabelnaduni2000@gmail.com)
    Last Modified Date: 
    Modified By: 
    Version: Node.js v20.11.1
    Dependencies: axios , mongoose
    Related Files: TaskList_route.js
    Notes:  
*/

import db from "../config/db.js";
import mongoose from "mongoose";
import Task from "../models/Task.js";

export const List_All_Tasks = async (req, res) => {
  try {
    const { logged_in_user, From_DAT, TO_DAT, task_status, pages } = req.body;

    const pipeline = [];

    if (logged_in_user) {
      pipeline.push({
        $match: { Created_By: String(logged_in_user) },
      });
    }

    if (task_status) {
      pipeline.push({ $match: { task_status } });
    }

    const dateFilter = {};
    if (From_DAT) dateFilter.$gte = new Date(From_DAT);
    if (TO_DAT) {
      const endofDay = new Date(TO_DAT);
      endofDay.setHours(23, 59, 59, 999);
      dateFilter.$lte = new Date(endofDay);
    }

    if (Object.keys(dateFilter).length > 0) {
      pipeline.push({ $match: { created_dtm: dateFilter } });
    }

    // Pagination logic
    let page = Number(pages);
    if (isNaN(page) || page < 1) page = 1;
    const limit = page === 1 ? 10 : 30;
    const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

    pipeline.push({ $sort: { Task_Id: -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const filtered_cases = await Task.aggregate(pipeline);

    const responseData = filtered_cases.map((TaskData) => {
      return {
        task_id: TaskData.Task_Id,
        template_task_id: TaskData.Template_Task_Id,
        task_type: TaskData.task_type || null,
        Created_By: TaskData.Created_By || null,
        Execute_By: TaskData.Execute_By || null,
        Sys_Alert_ID: TaskData.Sys_Alert_ID || null,
        task_status: TaskData.task_status || null,
        created_dtm: TaskData.created_dtm || null,
        // drc_name: TaskData.last_drc ? TaskData.last_drc.drc_name : null,
        // drc_id: TaskData.last_drc ? TaskData.last_drc.drc_id : null,
        // last_payment_date: TaskData.last_payment_date || null,
      };
    });

    return res.status(200).json({
      status: "success",
      message: "Task List retrieved successfully.",
      data: responseData,
    });
  } catch (error) {
    console.error("Failed to fetch tasks:", error.message);
    return res.status(500).json({
      status: "error",
      message: "There is an error fetching task list.",
    });
  }
};
