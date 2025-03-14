import MoneyCommission from "../models/Money_commission.js";
import db from "../config/db.js";


export const getMoneyCommissions = async (req, res) => {
  try {
    // Extract query parameters
    const { case_id, from_date, to_date, drc_id } = req.query;
    
    // Build filter object based on provided parameters
    const filter = {};
    
    // Add filters if parameters are provided
    if (case_id) filter.case_id = Number(case_id);
    if (drc_id) filter.drc_id = Number(drc_id);
    
    // Add date range filter if dates are provided
    if (from_date || to_date) {
      filter.created_on = {};
      if (from_date) filter.created_on.$gte = new Date(from_date);
      if (to_date) filter.created_on.$lte = new Date(to_date);
    }
    
    // Query the database with filters, sort by created_on in descending order to get latest first
    const commissions = await MoneyCommission.find(filter)
      .sort({ created_on: -1 })
      .lean();
    
    return res.status(200).json({
      status: "success",
      message: "Money commission data retrieved successfully.",
      data: commissions,
    });
    
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error retrieving money commission data.",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }
};