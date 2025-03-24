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

// export const List_All_Commission_Cases = async (req, res) => {
//     try {
//       const { case_id, From_DAT, TO_DAT, DRC_ID } = req.body;
  
//       // If no case_id is provided, fetch the 10 latest documents
//       if (!case_id) {
//         const latestCommissions = await MoneyCommission.find({})
//           .sort({ created_on: -1 }) 
//           .limit(10) 
//           .exec();
  
//         return res.status(200).json({
//           status: "success",
//           message: "Latest 10 Money Commission details retrieved successfully.",
//           data: latestCommissions,
//         });
//       }
  
     
//       const query = {
//         case_id: case_id,
//       };
  
//       // Add date range to query if From_DAT and TO_DAT are provided
//       if (From_DAT && TO_DAT) {
//         query.created_on = {
//           $gte: new Date(From_DAT), 
//           $lte: new Date(TO_DAT),   
//         };
//       }
  
     
//       if (DRC_ID) {
//         query.drc_id = DRC_ID;
//       }
  
//       // Fetch data from MongoDB
//       const commissions = await MoneyCommission.find(query)
//         .sort({ created_on: -1 }) 
//         .exec();
  
//       if (!commissions || commissions.length === 0) {
//         return res.status(404).json({
//           status: "error",
//           message: "No Money Commission data found.",
//           errors: {
//             code: 404,
//             description: "No data matches the provided criteria.",
//           },
//         });
//       }
  
//       // Return success response
//       return res.status(200).json({
//         status: "success",
//         message: "Money Commission details retrieved successfully.",
//         data: commissions,
//       });
//     } catch (err) {
      
//       console.error("Error fetching Money Commission data:", err.message);
  
//       // Return 500 Internal Server Error response
//       return res.status(500).json({
//         status: "error",
//         message: "Failed to retrieve Money Commission details.",
//         errors: {
//           code: 500,
//           description: "Internal server error occurred while fetching data.",
//         },
//       });
//     }
//   };
  
// export const List_All_Commission_Cases = async (req, res) => {
//   try {
//     const { case_id, From_DAT, TO_DAT, DRC_ID } = req.body;

//     // If no case_id is provided, fetch the 10 latest documents
//     if (!case_id) {
//       const latestCommissions = await MoneyCommission.find({})
//         .sort({ created_on: -1 })
//         .limit(10)
//         .exec();

//       return res.status(200).json({
//         status: "success",
//         message: "Latest 10 Money Commission details retrieved successfully.",
//         data: latestCommissions,
//       });
//     }

//     const query = {
//       case_id: case_id,
//     };

//     // Add date range to query if From_DAT and TO_DAT are provided
//     if (From_DAT && TO_DAT) {
//       query.created_on = {
//         $gte: new Date(From_DAT),
//         $lte: new Date(TO_DAT),
//       };
//     }

//     if (DRC_ID) {
//       query.drc_id = DRC_ID;
//     }

//     // Aggregation to count commission types
//     const commissionCounts = await MoneyCommission.aggregate([
//       { $match: query }, // Apply filters like case_id, date range, and drc_id
//       {
//         $group: {
//           _id: "$commission_type", // Group by commission_type
//           count: { $sum: 1 }, // Count occurrences
//         },
//       },
//     ]);

//     // Extract counts for Commissioned and Unresolved Commission
//     const commissionedCount = commissionCounts.find(
//       (item) => item._id === "Commissioned"
//     )?.count || 0;
//     const unresolvedCommissionCount = commissionCounts.find(
//       (item) => item._id === "Unresolved Commission"
//     )?.count || 0;

//     // Fetch the filtered commission data
//     const commissions = await MoneyCommission.find(query)
//       .sort({ created_on: -1 })
//       .exec();

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

//     // Return success response with the counts included
//     return res.status(200).json({
//       status: "success",
//       message: "Money Commission details retrieved successfully.",
//       data: commissions,
//       counts: {
//         commissioned: commissionedCount,
//         unresolvedCommission: unresolvedCommissionCount,
//       },
//     });
//   } catch (err) {
//     console.error("Error fetching Money Commission data:", err.message);

//     // Return 500 Internal Server Error response
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
    const { case_id, From_DAT, TO_DAT, DRC_ID } = req.body;

    // Apply query filters
    const query = {};

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

    // Aggregation to count commission types
    const commissionCounts = await MoneyCommission.aggregate([
      { $match: query }, // Apply filters like case_id, date range, and drc_id
      {
        $group: {
          _id: "$commission_type", // Group by commission_type
          count: { $sum: 1 }, // Count occurrences
        },
      },
    ]);

    // Default counts if not found
    let commissionedCount = 0;
    let unresolvedCommissionCount = 0;

    // Extract counts for Commissioned and Unresolved Commission
    commissionCounts.forEach((item) => {
      if (item._id === "Commissioned") {
        commissionedCount = item.count;
      }
      if (item._id === "Unresolved Commission") {
        unresolvedCommissionCount = item.count;
      }
    });

    // Fetch the filtered commission data
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

    // Return success response with the counts included
    return res.status(200).json({
      status: "success",
      message: "Money Commission details retrieved successfully.",
      data: commissions,
      counts: {
        commissioned: commissionedCount,
        unresolvedCommission: unresolvedCommissionCount,
      },
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
