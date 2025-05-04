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
    const { case_id, From_DAT, TO_DAT, DRC_ID, Account_Num, Commission_Type, page = 1 } = req.body;

    // Validate required fields
    if (!case_id && !DRC_ID && !Account_Num && !Commission_Type && !From_DAT && !TO_DAT) {
      return res.status(400).json({
        status: "error",
        message: "At least one of case_id, drc_id, Account_numb, Commission_Type, from_date or to_date is required."
      });
    }

    const query = {};

    let pageNum = Number(page);
    let limitNum = Number(page) === 1 ? 10 : 30;

    if (Account_Num) {
      const matchedCases = await Case_details.find({ Account_Num }, 'case_id');
      const caseIds = matchedCases.map(c => c.case_id);
      query.case_id = { $in: caseIds };
    }

    if (case_id) {
      query.case_id = case_id;
    }

    if (From_DAT && TO_DAT) {
      query.created_on = {
        $gte: new Date(From_DAT),
        $lte: new Date(TO_DAT),
      };
    }

    if (DRC_ID) {
      query.drc_id = DRC_ID;
    }

    if (Account_Num) {
      query.account_number = Account_Num;
    }

    const commissionCounts = await MoneyCommission.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$commission_type", // Group by commission_type
          count: { $sum: 1 },
        },
      },
    ]);


    let commissionedCount = 0;
    let unresolvedCommissionCount = 0;


    commissionCounts.forEach((item) => {
      if (item._id === "Commissioned") {
        commissionedCount = item.count;
      }
      if (item._id === "Unresolved Commission") {
        unresolvedCommissionCount = item.count;
      }
    });

    const skip = pageNum === 1 ? 0 : 10 + (pageNum - 2) * 30;

    const commissions = await MoneyCommission.find(query)
      .sort({ created_on: -1 })
      .skip(skip)
      // .exec();
      .limit(limitNum);

    const total = await MoneyCommission.countDocuments(query);
    const pagination = {
      total,
      page: pageNum,
      limit: limitNum,
      pages: total <= 10 ? 1 : Math.ceil((total - 10) / 30) + 1
    };

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


    return res.status(200).json({
      status: "success",
      message: "Money Commission details retrieved successfully.",
      data: commissions,
      counts: {
        commissioned: commissionedCount,
        unresolvedCommission: unresolvedCommissionCount,
      },
      pagination: pagination,
    });
  } catch (err) {
    console.error("Error fetching Money Commission data:", err.message);


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

export const commission_type_cases_count = async (req, res) => {
    try {
        const case_counts = await Case_details.aggregate([
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
                    cases: { $push: { document_type: "$_id", count: "$count" } }
                }
            },
            {
                $project: {
                    _id: 0,
                    total_count: 1,
                    cases: 1
                }
            }
        ]).exec();
        return res.status(200).json({
            status: "success",
            data: case_counts.length > 0 ? case_counts[0] : { total_count: 0, cases: [] }
        });
    }catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Server error while fetching case counts"
        });
    }
};