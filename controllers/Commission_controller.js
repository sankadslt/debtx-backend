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
import mongoose from "mongoose";
import { createTaskFunction } from "../services/TaskService.js";


// export const List_All_Commission_Cases = async (req, res) => {
//   try {
//     const { case_id, From_DAT, TO_DAT, DRC_ID, Account_Num, Commission_Type, page = 1 } = req.body;

//     // Validate required fields
//     if (!case_id && !DRC_ID && !Account_Num && !Commission_Type && !From_DAT && !TO_DAT) {
//       return res.status(400).json({
//         status: "error",
//         message: "At least one of case_id, drc_id, Account_numb, Commission_Type, from_date or to_date is required."
//       });
//     }

//     const query = {};

//     let pageNum = Number(page);
//     let limitNum = Number(page) === 1 ? 10 : 30;

//     if (Account_Num) {
//       const matchedCases = await Case_details.find({ Account_Num }, 'case_id');
//       const caseIds = matchedCases.map(c => c.case_id);
//       query.case_id = { $in: caseIds };
//     }

//     if (case_id) {
//       query.case_id = case_id;
//     }

//     if (From_DAT && TO_DAT) {
//       query.created_on = {
//         $gte: new Date(From_DAT),
//         $lte: new Date(TO_DAT),
//       };
//     }

//     if (DRC_ID) {
//       query.drc_id = DRC_ID;
//     }

//     if (Account_Num) {
//       query.account_number = Account_Num;
//     }

//     const commissionCounts = await MoneyCommission.aggregate([
//       { $match: query },
//       {
//         $group: {
//           _id: "$commission_type", // Group by commission_type
//           count: { $sum: 1 },
//         },
//       },
//     ]);


//     let commissionedCount = 0;
//     let unresolvedCommissionCount = 0;


//     commissionCounts.forEach((item) => {
//       if (item._id === "Commissioned") {
//         commissionedCount = item.count;
//       }
//       if (item._id === "Unresolved Commission") {
//         unresolvedCommissionCount = item.count;
//       }
//     });

//     const skip = pageNum === 1 ? 0 : 10 + (pageNum - 2) * 30;

//     const commissions = await MoneyCommission.find(query)
//       .sort({ created_on: -1 })
//       .skip(skip)
//       // .exec();
//       .limit(limitNum);

//     const total = await MoneyCommission.countDocuments(query);
//     const pagination = {
//       total,
//       page: pageNum,
//       limit: limitNum,
//       pages: total <= 10 ? 1 : Math.ceil((total - 10) / 30) + 1
//     };

//     if (!commissions || commissions.length === 0) {
//       return res.status(404).json({
//         status: "error",
//         message: "No Money Commission data found.",
//         errors: {
//           code: 404,
//           description: "No data matches the provided criteria.",
//         },
//       });
//     }


//     return res.status(200).json({
//       status: "success",
//       message: "Money Commission details retrieved successfully.",
//       data: commissions,
//       counts: {
//         commissioned: commissionedCount,
//         unresolvedCommission: unresolvedCommissionCount,
//       },
//       pagination: pagination,
//     });
//   } catch (err) {
//     console.error("Error fetching Money Commission data:", err.message);


//     return res.status(500).json({
//       status: "error",
//       message: "Failed to retrieve Money Commission details.",
//       errors: {
//         code: 500,
//         description: "Internal server error occurred while fetching data.",
//       },
//     });
//   }
// };

export const List_All_Commission_Cases = async (req, res) => {
  try {
    const { case_id, From_DAT, TO_DAT, DRC_ID, Account_Num, Commission_Type, pages } = req.body;

    // if (!case_id && !DRC_ID && !Account_Num && !Commission_Type && !From_DAT && !TO_DAT) {
    //   return res.status(400).json({
    //     status: "error",
    //     message: "At least one of case_id, DRC_ID, Account_Num, Commission_Type, From_DAT, TO_DAT is required."
    //   });
    // }

    let page = Number(pages);
    if (isNaN(page) || page < 1) page = 1;
    const limit = page === 1 ? 10 : 30;
    const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

    const query = {};

    if (Account_Num) query.account_num = Account_Num;
    if (case_id) query.case_id = Number(case_id);
    if (DRC_ID) query.drc_id = Number(DRC_ID);
    if (Commission_Type) query.commission_type = Commission_Type;

    const dateFilter = {};
    if (From_DAT) dateFilter.$gte = new Date(From_DAT);
    if (TO_DAT) dateFilter.$lte = new Date(TO_DAT);
    if (Object.keys(dateFilter).length > 0) {
      query.created_on = dateFilter;
    }

    // const filtered_cases = await MoneyCommission.find(query)
    //   .skip(skip)
    //   .limit(limit)
    //   .sort({ commission_id: -1 });

    const filtered_cases = await MoneyCommission.aggregate([
      { $match: query },
      { $sort: { commission_id: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "Debt_recovery_company", // Collection name in MongoDB
          localField: "drc_id",
          foreignField: "drc_id",
          as: "drcData"
        }
      }
    ]);

    const responseData = filtered_cases.map((caseData) => {
      return {
        Commission_ID: caseData.commission_id,
        Case_ID: caseData.case_id,
        DRC_Name: caseData.drcData.length > 0 ? caseData.drcData[0].drc_name : null,
        Created_On: caseData.created_on,
        Commission_Amount: caseData.commission_amount,
        Commission_Status: caseData.commission_status,
        Commission_Type: caseData.commission_type,
        Commission_Action: caseData.commission_action,
      };
    })

    return res.status(200).json({
      status: "success",
      message: "Cases retrieved successfully.",
      data: responseData,
    });

  } catch (error) {
    console.error("Error fetching Commission Cases:", error.message);
    return res.status(500).json({
      status: "error",
      message: "There is an error "
    });
  }
};

export const commission_type_cases_count = async (req, res) => {
  try {
    const commission_counts = await MoneyCommission.aggregate([
      // {
      //     $match: { case_current_status: "LIT Prescribed" }
      // },
      {
        $group: {
          _id: "$commission_type", // No need for $arrayElemAt
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          total_count: { $sum: "$count" },
          commissions: { $push: { commission_type: "$_id", count: "$count" } }
        }
      },
      {
        $project: {
          _id: 0,
          total_count: 1,
          commissions: 1
        }
      }
    ]).exec();
    return res.status(200).json({
      status: "success",
      data: commission_counts.length > 0 ? commission_counts[0] : { total_count: 0, cases: [] }
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error while fetching case counts"
    });
  }
};

export const Create_task_for_Download_Commision_Case_List = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { Created_By, DRC_ID, Commission_Type, from_date, to_date, Case_ID, Account_Number } = req.body;

    if (!Created_By) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: "error",
        message: "created by is a required parameter.",
      });
    }

    // Flatten the parameters structure
    const parameters = {  
      Account_Number,
      Case_ID,
      DRC_ID,
      Commission_Type,
      from_date,
      to_date,
    };

    // Pass parameters directly (without nesting it inside another object)
    const taskData = {
      Template_Task_Id: 45,
      task_type: "Create task for Download Commision Case List",
      ...parameters,
      Created_By,
      task_status: "open",
    };

    // Call createTaskFunction
    await createTaskFunction(taskData, session);

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      status: "success",
      message: "Task created successfully.",
      data: taskData,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error.",
      errors: {
        exception: error.message,
      },
    });
  }
};

export const Commission_Details_By_Commission_ID = async (req, res) => {
  try {
    const { commission_id } = req.body;

    if (!commission_id) {
      return res.status(400).json({ message: "commission_id is required" });
    }

    const commissionDetails = await MoneyCommission.findOne({ commission_id });
    if (!commissionDetails) {
      return res.status(404).json({ message: "Commission not found" });
    }

    const response = {
      case_id: commissionDetails.case_id,
      account_num: commissionDetails.account_num,
      drc_id: commissionDetails.drc_id,
      ro_id: commissionDetails.ro_id,
      created_on: commissionDetails.created_on,
      commission_amount: commissionDetails.commission_amount,
      commission_type: commissionDetails.commission_type,
      commission_action: commissionDetails.commission_action,
      commission_status: commissionDetails.commission_status,
      commission_status_on: commissionDetails.commission_status_on,
      commission_status_reason: commissionDetails.commission_status_reason,
      check_by: commissionDetails.check_by,
      check_on: commissionDetails.check_on, 
      approved_by: commissionDetails.approved_by,
      approved_on: commissionDetails.approved_on,
      caterlog_id: commissionDetails.caterlog_id,
      commission_pay_rate_id: commissionDetails.commission_pay_rate_id,
      commission_ref: commissionDetails.commission_ref,
      transaction_ref: commissionDetails.transaction_ref,
    };

    return res.status(200).json({
      message: "Case details retrieved successfully",
      status: "success",
      data: response,
    });
  } catch (error) {
    console.error("Error fetching case details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};