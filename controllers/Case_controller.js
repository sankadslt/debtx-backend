/* 
    Purpose: This template is used for the Case Controllers.
    Created Date: 2025-01-08
    Created By:  Naduni Rabel (rabelnaduni2000@gmail.com)
    Last Modified Date: 2025-01-19
    Modified By: Naduni Rabel (rabelnaduni2000@gmail.com), Sasindu Srinayaka (sasindusrinayaka@gmail.com)
    Version: Node.js v20.11.1
    Dependencies: axios , mongoose
    Related Files: Case_route.js
    Notes:  
*/

import db from "../config/db.js";
import Case_details from "../models/Case_details.js";
import RecoveryOfficer from "../models/Recovery_officer.js";
import Case_transactions from "../models/Case_transactions.js";
import System_Case_User_Interaction from "../models/User_Interaction.js";
import SystemTransaction from "../models/System_transaction.js";
import DebtRecoveryCompany from "../models/Debt_recovery_company.js";
import CaseDistribution from "../models/Case_distribution_drc_transactions.js";
import moment from "moment";
import mongoose from "mongoose";
import { createTaskFunction } from "../services/TaskService.js";
import Case_distribution_drc_transactions from "../models/Case_distribution_drc_transactions.js"
import Case_distribution_drc_summary from "../models/Case_distribution_drc_summary.js"

export const getAllArrearsBands = async (req, res) => {
  try {
    const mongoConnection = await db.connectMongoDB();
    if (!mongoConnection) {
      throw new Error("MongoDB connection failed");
    }
    const counterResult = await mongoConnection
      .collection("Arrears_bands")
      .findOne({});
    return res.status(200).json({
      status: "success",
      message: "Data retrieved successfully.",
      data: counterResult,
    });
  } catch (error) {
    // Capture the error object in the catch block
    return res.status(500).json({
      status: "error",
      message: "Error retrieving Arrears bands.",
      errors: {
        code: 500,
        description: error.message, // Now correctly references the error object
      },
    });
  }
};

export const drcExtendValidityPeriod = async (req, res) => {
  const { Case_Id, DRC_Id, No_Of_Month, Extended_By } = req.body;

  if (!Case_Id || !No_Of_Month || !Extended_By || !DRC_Id) {
    return res.status(400).json({
      status: "error",
      message: "Failed to extend DRC validity period.",
      errors: {
        code: 400,
        description: "All fields are required",
      },
    });
  }

  try {
    //update expire date
    const updatedCaseDetails = await Case_details.findOneAndUpdate(
      { case_id: Case_Id, "drc.drc_id": DRC_Id },
      {
        $set: {
          "drc.$.expire_dtm": new Date(
            new Date(
              new Date(
                (
                  await Case_details.findOne({
                    case_id: Case_Id,
                    "drc.drc_id": DRC_Id,
                  })
                ).drc.find((drc) => drc.drc_id === DRC_Id).expire_dtm
              ).setMonth(
                new Date(
                  (
                    await Case_details.findOne({
                      case_id: Case_Id,
                      "drc.drc_id": DRC_Id,
                    })
                  ).drc.find((drc) => drc.drc_id === DRC_Id).expire_dtm
                ).getMonth() + No_Of_Month
              )
            )
          ),
        },
      },
      { new: true }
    );
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error updating No of Months.",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }

  //insert state change record to Case_transactions
  try {
    const newCaseTransaction = new Case_transactions({
      case_id: Case_Id,
      transaction_type_id: 1,
      created_by: Extended_By,
      parameters: {
        "No of Months": No_Of_Month,
      },
      drc_id: DRC_Id,
    });
    await newCaseTransaction.save();
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error inserting stat change record.",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }

  //Remove user interaction "Agent Time Extend"
  try {
    await System_Case_User_Interaction.findOneAndUpdate(
      { "parameters.Case_ID": Case_Id, Case_User_Interaction_id: 2 },
      {
        $set: {
          status: "close",
          status_changed_dtm: new Date(),
        },
      }
    );
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error closing Agent time extend.",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }

  //Add user interaction "Pending Approval RO Extend Period"
  try {
    const mongoConnection = await db.connectMongoDB();
    if (!mongoConnection) {
      throw new Error("MongoDB connection failed");
    }
    const counterResult = await mongoConnection
      .collection("counters")
      .findOneAndUpdate(
        { _id: "User_Interaction_Id" },
        { $inc: { seq: 1 } },
        { returnDocument: "after", upsert: true }
      );

    const user_interaction_id = counterResult.seq;

    if (!user_interaction_id) {
      throw new Error("Failed to generate a valid User_Interaction_Id");
    }

    const openPendingApprovalROExtendPeriod = new System_Case_User_Interaction({
      User_Interaction_id: user_interaction_id,
      Case_User_Interaction_id: 7,
      parameters: {
        Case_ID: Case_Id,
      },
      Created_By: Extended_By,
      Execute_By: "Admin456",
      Sys_Alert_ID: null,
      Interaction_ID_Success: null,
      Interaction_ID_Error: null,
      User_Interaction_Id_Error: null,
      created_dtm: new Date(),
      end_dtm: null,
      status: "pending",
      updatedAt: new Date(),
      status_changed_dtm: new Date(),
      status_description: "",
    });
    await openPendingApprovalROExtendPeriod.save();
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error updating System Case User Interaction.",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }

  return res.status(200).json({
    status: "success",
    message: "DRC validity period successfully extended.",
  });
};

// export const listHandlingCasesByDRC = async (req, res) => {
//     const { drc_id } = req.body;

//     try {
//         // Validate drc_id
//         if (!drc_id) {
//             return res.status(400).json({
//                 status: "error",
//                 message: "Failed to retrieve DRC details.",
//                 errors: {
//                     code: 400,
//                     description: "DRC ID is required.",
//                 },
//             });
//         }

//         // Query to find cases that meet the conditions
//         const cases = await Case_details.find({
//             $and: [
//                 // Match case_current_status
//                 {
//                     case_current_status: {
//                         $in: [
//                             "Open No Agent",
//                             "Open with Agent",
//                             "Negotiation Settle pending",
//                             "Negotiation Settle Open Pending",
//                             "Negotiation Settle Active",
//                             "FMB",
//                             "FMB Settle pending",
//                             "FMB Settle Open Pending",
//                             "FMB Settle Active",
//                         ],
//                     },
//                 },
//                 // Check if the DRC array has matching conditions
//                 {
//                     $and: [
//                         { "drc.drc_id": drc_id }, // Match the provided drc_id
//                         { "drc.status": "Open" }, // DRC status must be "Open"
//                         { "drc.expire_dtm": { $gte: new Date() } }, // expire_dtm must be in the future or now
//                         {
//                             $or: [
//                                 // recovery_officers array is empty
//                                 { "drc.recovery_officers": { $size: 0 } },
//                                 // recovery_officers has at least one entry with removed_dtm = null
//                                 { "drc.recovery_officers": { $elemMatch: { removed_dtm: null } } },
//                             ],
//                         },
//                     ],
//                 },
//             ],
//         });

//         // Check if no cases found
//         if (!cases || cases.length === 0) {
//             return res.status(404).json({
//                 status: "error",
//                 message: "No cases found for the provided DRC ID.",
//                 errors: {
//                     code: 404,
//                     description: "No matching cases in the database.",
//                 },
//             });
//         }

//         // Return success response
//         return res.status(200).json({
//             status: "success",
//             message: "Cases retrieved successfully.",
//             data: cases,
//         });
//     } catch (error) {
//         // Handle errors
//         return res.status(500).json({
//             status: "error",
//             message: "An error occurred while retrieving cases.",
//             errors: {
//                 code: 500,
//                 description: error.message,
//             },
//         });
//     }
// };

export const listAllDRCOwnedByCase = async (req, res) => {
    const { case_id } = req.body;

    try {
        // Validate case ID
        if (!case_id) {
            return res.status(400).json({
                status: "error",
                message: "Failed to retrieve DRC details.",
                errors: {
                    code: 400,
                    description: "Case with the given ID not found.",
                },
            });
        }

        // Query to find DRCs owned by the case
        const drcs = await Case_details.find({
            case_id: case_id
        });

        // Handle case where no matching DRCs are found
        if (drcs.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "No matching DRCs found for the given case ID.",
                errors: {
                    code: 404,
                    description: "No DRCs satisfy the provided criteria.",
                },
            });
        }

        // Return success response
        return res.status(200).json({
            status: "success",
            message: "DRCs retrieved successfully.",
            data: drcs,
        });
    } catch (error) {
        // Handle errors
        return res.status(500).json({
            status: "error",
            message: "An error occurred while retrieving DRCs.",
            errors: {
                code: 500,
                description: error.message,
            },
        });
    }
}

export const Open_No_Agent_Cases_Direct_LD = async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;

    const fromDateParsed = fromDate ? new Date(fromDate) : null;
    const toDateParsed = toDate ? new Date(toDate) : null;

    if (fromDate && isNaN(fromDateParsed.getTime())) {
      return res.status(400).json({ message: "Invalid 'fromDate' format." });
    }

    if (toDate && isNaN(toDateParsed.getTime())) {
      return res.status(400).json({ message: "Invalid 'toDate' format." });
    }

    const dateFilter = {};
    if (fromDateParsed) dateFilter.$gte = fromDateParsed;
    if (toDateParsed) dateFilter.$lte = toDateParsed;

    const query = {
      case_current_status: "Open No Agent",
      filtered_reason: { $in: [null, ""] },
      current_arrears_amount: { $gt: 1000, $lte: 5000 },
    };

    if (Object.keys(dateFilter).length > 0) {
      query.created_dtm = dateFilter;
    }

   
    const cases = await Case_details.find(query).select(
      "case_id account_no area rtom filtered_reason"
    );
    if (!cases.length) {
      return res.status(404).json({
        message: "No cases found matching the criteria.",
        criteria: {
          case_current_status: "Open No Agent",
          fromDate,
          toDate,
        },
      });
    }

    res.status(200).json({
      message: "Cases retrieved successfully.",
      criteria: {
        case_current_status: "Open No Agent",
        fromDate,
        toDate,
      },
      data: cases,
    });
  } catch (error) {
    console.error("Error retrieving cases:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const Open_No_Agent_Cases_ALL = async (req, res) => {
    const {
      case_current_status,
      fromDate,
      toDate,
    } = req.body;
  
    try {
      
      const fromDateParsed = fromDate ? new Date(fromDate) : null;
      const toDateParsed = toDate ? new Date(toDate) : null;
  
      if (fromDate && isNaN(fromDateParsed.getTime())) {
        return res.status(400).json({ message: "Invalid 'fromDate' format." });
      }
  
      if (toDate && isNaN(toDateParsed.getTime())) {
        return res.status(400).json({ message: "Invalid 'toDate' format." });
      }
  
      
      const dateFilter = {};
      if (fromDateParsed) dateFilter.$gte = fromDateParsed;
      if (toDateParsed) dateFilter.$lte = toDateParsed;
  
      //  `case_current_status`
      const baseQuery = {};
      if (case_current_status) {
        baseQuery.case_current_status = case_current_status;
      }
      if (Object.keys(dateFilter).length > 0) {
        baseQuery.created_dtm = dateFilter;
      }
  
      // "Open No Agent" (default for f1FilterCases and directLDCases)
      const openNoAgentQuery = {
        case_current_status: "Open No Agent",
      };
      if (Object.keys(dateFilter).length > 0) {
        openNoAgentQuery.created_dtm = dateFilter;
      }
  
      
      const noAgentCases = await Case_details.find(baseQuery).select(
        "case_id account_no area rtom filtered_reason"
      );
  
      const f1FilterCases = await Case_details.find({
        ...openNoAgentQuery,
        filtered_reason: { $exists: true, $ne: null, $ne: "" },
      }).select("case_id account_no area rtom filtered_reason");
  
      const directLDCases = await Case_details.find({
        ...openNoAgentQuery,
        filtered_reason: { $in: [null, ""] },
        current_arrears_amount: { $gt: 1000, $lte: 5000 }, 
      }).select("case_id account_no area rtom filtered_reason");
  
      
      if (
        !noAgentCases.length &&
        !f1FilterCases.length &&
        !directLDCases.length
      ) {
        return res.status(404).json({
          message: "No cases found matching the criteria.",
        });
      }
  
     
      res.status(200).json({
        message: "Cases retrieved successfully.",
        data: {
          No_Agent_Cases: noAgentCases,
          F1_Filter: f1FilterCases,
          Direct_LD: directLDCases,
        },
      });
    } catch (error) {
      console.error("Error retrieving cases:", error);
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  };
  
  export const Case_Abandant = async (req, res) => {
    const { case_id, Action, Done_By } = req.body;
  
    try {
      // Validate required fields
      if (!case_id || !Action || !Done_By) {
        return res.status(400).json({
          status: "error",
          message: "case_id, Action, and Done_By are required.",
        });
      }
  
      // Validate Action
      if (Action !== "Abandaned") {
        return res.status(400).json({
          status: "error",
          message: `Invalid action. Only 'Abandaned' is allowed.`,
        });
      }
  
      // Fetch the case to ensure it exists
      const caseRecord = await Case_details.findOne({ case_id });
  
      if (!caseRecord) {
        return res.status(404).json({
          status: "error",
          message: `Case with ID ${case_id} not found.`,
        });
      }
  
      // Check if the case is already abandoned
      if (caseRecord.case_current_status === "Abandaned") {
        return res.status(400).json({
          status: "error",
          message: `Case with ID ${case_id} is already abandoned.`,
        });
      }
  
      // Update the case details
      const updatedCase = await Case_details.findOneAndUpdate(
        { case_id },
        {
          $set: {
            case_current_status: "Abandaned",
          },
          $push: {
            abnormal_stop: {
              remark: `Case marked as ${Action}`,
              done_by: Done_By,
              done_on: moment().toDate(),
              action: Action,
            },
          },
        },
        { new: true, runValidators: true }
      );

      const mongoConnection = await mongoose.connection;
      const counterResult = await mongoConnection.collection("counters").findOneAndUpdate(
        { _id: "transaction_id" },
        { $inc: { seq: 1 } },
        { returnDocument: "after", upsert: true }
      );
      const Transaction_Id = counterResult.seq;
  
      // Log the transaction in SystemTransaction
      const transactionData = {
        Transaction_Id,
        transaction_type_id: 5,
        parameters: {
          case_id,
          action: Action,
          done_by: Done_By,
          done_on: moment().toDate(),
        },
        created_dtm: moment().toDate(),
      };
  
      const newTransaction = new SystemTransaction(transactionData);
      await newTransaction.save();
  
      return res.status(200).json({
        status: "success",
        message: "Case abandoned successfully.",
        data: {
          case_id: updatedCase.case_id,
          case_current_status: updatedCase.case_current_status,
          abnormal_stop: updatedCase.abnormal_stop,
          transaction: {
            Transaction_Id,
            transaction_type_id: transactionData.transaction_type_id,
            created_dtm: transactionData.created_dtm,
          },
        },
      });
    } catch (error) {
      console.error("Error during case abandonment:", error.message);
      return res.status(500).json({
        status: "error",
        message: "Failed to abandon case.",
        errors: {
          exception: error.message,
        },
      });
    }
  };


  export const Approve_Case_abandant = async (req, res) => {
    const { case_id, Approved_By } = req.body;
  
    try {
      // Validate required fields
      if (!case_id || !Approved_By) {
        return res.status(400).json({
          status: "error",
          message: "case_id and Approved_By are required.",
        });
      }
  
      // Fetch the case to ensure it exists and is discarded
      const caseRecord = await Case_details.findOne({ case_id });
  
      if (!caseRecord) {
        return res.status(404).json({
          status: "error",
          message: `Case with ID ${case_id} not found.`,
        });
      }
  
      if (caseRecord.case_current_status !== "Abandaned") {
        return res.status(400).json({
          status: "error",
          message: `Case with ID ${case_id} is not in 'Abandaned' status.`,
        });
      }
  
      // Update the case details to reflect approval
      const updatedCase = await Case_details.findOneAndUpdate(
        { case_id },
        {
          $set: {
            case_current_status: "Abandaned Approved",
          },
          $push: {
            approve: {
              approved_process: "Case Abandaned Approval",
              approved_by: Approved_By,
              approved_on: moment().toDate(),
              remark: "Case abandaned approved successfully.",
            },
            abnormal_stop: {
              remark: `Case marked as Abandaned Approved`,
              done_by: Approved_By,
              done_on: moment().toDate(),
              action: 'Abandaned Approved',
            },
          },
        },
        { new: true, runValidators: true } // Return the updated document and apply validation
      );
  
      return res.status(200).json({
        status: "success",
        message: "Case Abandaned approved successfully.",
        data: {
          case_id: updatedCase.case_id,
          case_current_status: updatedCase.case_current_status,
          approved_by: Approved_By,
          approved_on: moment().toDate(),
        },
      });
    } catch (error) {
      console.error("Error during case discard approval:", error.message);
      return res.status(500).json({
        status: "error",
        message: "Failed to approve case discard.",
        errors: {
          exception: error.message,
        },
      });
    }
  };

  export const Open_No_Agent_Cases_F1_Filter = async (req, res) => {
    const { from_date, to_date } = req.body;
  
    try {
      // Validate date inputs
      if (!from_date || !to_date) {
        return res.status(400).json({
          status: "error",
          message: "Both from_date and to_date are required.",
        });
      }
  
      const fromDate = new Date(from_date);
      const toDate = new Date(new Date(to_date).setHours(23, 59, 59, 999));
  
      if (isNaN(fromDate) || isNaN(toDate)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid date format. Use a valid ISO date format.",
        });
      }
  
      if (fromDate > toDate) {
        return res.status(400).json({
          status: "error",
          message: "from_date cannot be later than to_date.",
        });
      }
  
      // Fetch cases where case_current_status is 'Open No Agent' and filtered_reason is not null or empty
      // Also filter by created_dtm within the provided date range
      const cases = await Case_details.find({
        case_current_status: "Open No Agent",
        //filtered_reason: { $exists: true, $ne: null, $ne: "" },
        filtered_reason: { $type: "string", $ne: "" },
        created_dtm: { $gte: fromDate, $lte: toDate },
      })
        .select({
          case_id: 1,
          account_no: 1,
          customer_ref: 1,
          arrears_amount: 1,
          area: 1,
          rtom: 1,
          filtered_reason: 1,
          created_dtm: 1,
        })
        .sort({ created_dtm: -1 }); // Sort by creation date (most recent first)
  
      // If no cases match the criteria
      if (!cases || cases.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "No cases found matching the criteria.",
        });
      }
  
      return res.status(200).json({
        status: "success",
        message: "Filtered cases retrieved successfully.",
        data: cases,
      });
    } catch (error) {
      console.error("Error fetching filtered cases:", error.message);
      return res.status(500).json({
        status: "error",
        message: "Failed to retrieve cases.",
        errors: {
          exception: error.message,
        },
      });
    }
  };

  export const Case_Current_Status = async (req, res) => {
    const { Case_ID } = req.body;

    try {
      // Validate input
      if (!Case_ID) {
        return res.status(400).json({
          status: "error",
          message: "Case_ID is required.",
        });
      }

      // Query the database for the case by Case_ID
      const caseData = await Case_details.findOne({ case_id: Case_ID });

      // Check if the case exists
      if (!caseData) {
        return res.status(404).json({
          status: "error",
          message: `Case with ID ${Case_ID} not found.`,
        });
      }

      // Extract the current status
      const { case_current_status } = caseData;

      // Return the current status along with relevant case details
      return res.status(200).json({
        status: "success",
        message: "Case current status retrieved successfully.",
        data: {
          case_id: caseData.case_id,
          case_current_status,
        },
      });
    } catch (error) {
      console.error("Error retrieving case status:", error.message);
      return res.status(500).json({
        status: "error",
        message: "Failed to retrieve case status.",
        errors: {
          exception: error.message,
        },
      });
    }
  };

// export const assignROToCase = async (req, res) => {
//   try {
//     const { case_id, ro_id } = req.body;

//     // Validate input
//     if (!case_id || !ro_id) {
//       return res.status(400).json({
//         status: "error",
//         message: "Failed to assign Recovery Officer.",
//         errors: {
//           code: 400,
//           description: "Case ID and RO ID are required.",
//         },
//       });
//     }

//     const assigned_by = "System";

//     // Fetch the case details
//     const caseData = await Case_details.findOne({ case_id });

//     if (!caseData) {
//       return res.status(404).json({
//         status: "error",
//         message: "Case ID not found in Database.",
//       });
//     }

//     // Check if expire_dtm is null
//     if (caseData.expire_dtm !== null) {
//       return res.status(400).json({
//         status: "error",
//         message: "Cannot assign Recovery Officer. Case has expired.",
//         errors: {
//           code: 400,
//           description: "The expire_dtm field must be null.",
//         },
//       });
//     }

//     // Find the `drc` array and check the recovery_officers array
//     const drc = caseData.drc.find((d) => d.drc_id); // Assume drc_id exists; adjust logic if necessary
//     if (!drc) {
//       return res.status(404).json({
//         status: "error",
//         message: "DRC not found for the given case.",
//       });
//     }

//     // Get the recovery_officers array
//     const recoveryOfficers = drc.recovery_officers || [];
//     const lastOfficer = recoveryOfficers[recoveryOfficers.length - 1];

//     // Check if remove_dtm is null in the last officer
//     if (lastOfficer && lastOfficer.removed_dtm === null) {
//       return res.status(400).json({
//         status: "error",
//         message: "Cannot assign new Recovery Officer. Previous officer not removed.",
//         errors: {
//           code: 400,
//           description: "The remove_dtm field for the last Recovery Officer must not be null.",
//         },
//       });
//     }

//     // Prepare the new recovery officer object
//     const newOfficer = {
//       ro_id: ro_id,
//       assigned_dtm: new Date(), // Date format: day/month/year
//       assigned_by: assigned_by,
//       removed_dtm: null,
//       case_removal_remark: null,
//     };

//     // Push the new recovery officer into the array
//     const updateData = {
//       $push: { "drc.$.recovery_officers": newOfficer },
//     };

//     // Update the database
//     const updatedResult = await Case_details.updateOne(
//       { case_id, "drc.drc_id": drc.drc_id }, // Match specific drc within case
//       updateData
//     );

//     if (updatedResult.nModified === 0) {
//       return res.status(400).json({
//         status: "error",
//         message: "Failed to assign Recovery Officer. Update operation unsuccessful.",
//       });
//     }

//     // Send success response
//     res.status(200).json({
//       status: "success",
//       message: "Recovery Officer assigned successfully.",
//     });
// } catch (error) {
//     // Handle unexpected errors
//     return res.status(500).json({
//       status: "error",
//       message: "An error occurred while assigning the Recovery Officer.",
//       errors: {
//         code: 500,
//         description: error.message,
//       },
//     });
//   }
// };

  export const Case_Status = async (req, res) => {
    const { Case_ID } = req.body;

    try {
      // Validate input
      if (!Case_ID) {
        return res.status(400).json({
          status: "error",
          message: "Case_ID is required.",
        });
      }

      // Query the database for the case by Case_ID
      const caseData = await Case_details.findOne({ case_id: Case_ID });

      // Check if the case exists
      if (!caseData) {
        return res.status(404).json({
          status: "error",
          message: `Case with ID ${Case_ID} not found.`,
        });
      }

      // Extract the case_status array
      const { case_status } = caseData;

      // Check if the case_status array exists and has entries
      if (!case_status || case_status.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "No case status found for the given case.",
        });
      }

      // Find the latest case status by sorting the array by created_dtm in descending order
      const latestStatus = case_status.reduce((latest, current) =>
        new Date(current.created_dtm) > new Date(latest.created_dtm) ? current : latest
      );

      // Return the latest case status along with relevant case details
      return res.status(200).json({
        status: "success",
        message: "Latest case status retrieved successfully.",
        data: {
          case_id: caseData.case_id,
          case_status: latestStatus.case_status,
          status_reason: latestStatus.status_reason,
          created_dtm: latestStatus.created_dtm,
          created_by: latestStatus.created_by,
          notified_dtm: latestStatus.notified_dtm,
          expire_dtm: latestStatus.expire_dtm,
        },
      });
    } catch (error) {
      console.error("Error retrieving case status:", error.message);
      return res.status(500).json({
        status: "error",
        message: "Failed to retrieve case status.",
        errors: {
          exception: error.message,
        },
      });
    }
  };

  export const Case_List = async (req, res) => {
    const { account_no } = req.body;

    try {
      // Validate input
      if (!account_no) {
        return res.status(400).json({
          status: "error",
          message: "Account number is required.",
        });
      }

      // Query the database for all cases with the specified account_no
      const caseData = await Case_details.find(
        { account_no },
        {
          _id: 1,
          case_id: 1,
          incident_id: 1,
          account_no: 1,
          customer_ref: 1,
          created_dtm: 1,
          implemented_dtm: 1,
          area: 1,
          rtom: 1,
          drc_selection_rule_base: 1,
          current_selection_logic: 1,
          bss_arrears_amount: 1,
          current_arrears_amount: 1,
          action_type: 1,
          selection_rule: 1,
          last_payment_date: 1,
          monitor_months: 1,
          last_bss_reading_date: 1,
          commission: 1,
          case_current_status: 1,
          filtered_reason: 1,
          "case_status.case_status": 1,
          "case_status.status_reason": 1,
          "case_status.created_dtm": 1,
          "case_status.created_by": 1,
          "case_status.notified_dtm": 1,
          "case_status.expire_dtm": 1,
        }
      );

      // Check if any cases were found
      if (!caseData || caseData.length === 0) {
        return res.status(404).json({
          status: "error",
          message: `No cases found for account number ${account_no}.`,
        });
      }

      // Return the filtered case details
      return res.status(200).json({
        status: "success",
        message: "Cases retrieved successfully.",
        data: caseData,
      });
    } catch (error) {
      console.error("Error retrieving cases:", error.message);
      return res.status(500).json({
        status: "error",
        message: "Failed to retrieve cases.",
        errors: {
          exception: error.message,
        },
      });
    }
  };










export const openNoAgentCasesAllByServiceTypeRulebase = async (req, res) => {

  const { Rule, From_Date, To_Date , Case_Status} = req.body;
  const fromDate = new Date(`${From_Date}T00:00:00.000Z`);
  const toDate = new Date(`${To_Date}T23:59:59.999Z`);
  
  if (!Rule|| !From_Date ||!To_Date) {
    return res.status(400).json({
      status: "error",
      message: "Failed to retrieve Open no agent case details.",
      errors: {
        code: 400,
        description: "Rule, From_Date and To_Date are required fields",
      },
    });
  }
  if (isNaN(fromDate) || isNaN(toDate)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid date format",
      errors: {
        code: 400,
        description: "Invalid date format for From_Date or To_Date",
      },
    });
  }

  try {
   
    const noAgent = await Case_details.find({
      case_current_status:"Open No Agent", 
      drc_commision_rule: Rule, 
      created_dtm: {
        $gte: fromDate,
        $lte: toDate,
      }  
    }).select('case_id created_dtm account_no area rtom current_arrears_amount case_current_status filtered_reason drc_selection_rule');
    const f1Filter = noAgent.filter((caseData) => {
      return caseData.filtered_reason !== null && caseData.filtered_reason !== "";
    });
    const directLD = noAgent.filter((caseData) => {
      return caseData.current_arrears_amount<=5000 && caseData.current_arrears_amount >=1000;
    });
    return res.status(200).json({
      status: "success",
      message: `Successfully retrieved Open No Agent - ${Rule} details.`,
      data:{
        No_Agent_Cases: noAgent,
        F1_Filter: f1Filter,
        Direct_LD: directLD
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve case details.",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }
}

export const openNoAgentCountArrearsBandByServiceType = async (req, res) =>{
  const { Rule, Case_Status } = req.body;

  if (!Rule) {
    return res.status(400).json({
      status: "error",
      message: "Failed to retrieve Open no agent count.",
      errors: {
        code: 400,
        description: "Rule is a required field",
      },
    });
  }

  try {
    const details = await Case_details.find({case_current_status:"Open No Agent", drc_commision_rule: Rule})
    
    const arrearsBandCounts = details.reduce((counts, detail) => {
      const band = detail.arrears_band;
      counts[band] = (counts[band] || 0) + 1; 
      return counts;
    }, {});
    
    return res.status(200).json({
      status: "success",
      message: `Successfully retrieved arrears band counts for rule - ${Rule}.`,
      data: arrearsBandCounts
    })
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve arrears band counts.",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }
}

export const listCases = async (req, res) =>{
  try{
  const { From_Date, To_Date} = req.body;
  const fromDate = new Date(`${From_Date}T00:00:00.000Z`);
  const toDate = new Date(`${To_Date}T23:59:59.999Z`);
  
  if (!From_Date ||!To_Date) {
    return res.status(400).json({
      status: "error",
      message: "Failed to retrieve Open no agent case details.",
      errors: {
        code: 400,
        description: "From_Date and To_Date are required fields",
      },
    });
  }
  if (isNaN(fromDate) || isNaN(toDate)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid date format",
      errors: {
        code: 400,
        description: "Invalid date format for From_Date or To_Date",
      },
    })
  }

  const openNoAgent = await Case_details.find({
    case_current_status:"Open No Agent", 
    $or: [
      { filtered_reason: null }, 
      { filtered_reason: "" },    
      { filtered_reason: { $regex: /^\s*$/ } }, 
    ],
    created_dtm: {
      $gte: fromDate,
      $lte: toDate,
    }  
  }).select('case_id created_dtm account_no area rtom current_arrears_amount case_current_status filtered_reason drc_selection_rule');

  return res.status(200).json({
    status: "success",
    message: `Successfully retrieved Open No Agent cases.`,
    data:{
      mongoData: openNoAgent
  }})
   
  }catch(error){
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve Open No Agent cases.",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }
  
}


export const Acivite_Case_Details = async (req, res) => {
  const { account_no } = req.body;

  try {
    // Validate input
    if (!account_no) {
      return res.status(400).json({
        status: "error",
        message: "Account number is required.",
      });
    }

    // Query the database to find cases with the specified account_no
    const cases = await Case_details.find({ account_no });

    // Check if any cases were found
    if (!cases || cases.length === 0) {
      return res.status(404).json({
        status: "error",
        message: `No cases found for account number ${account_no}.`,
      });
    }

    // Filter cases where the latest status in `case_status` is not in the excluded statuses
    const excludedStatuses = ['Write_Off', 'Abandoned', 'Case_Close', 'Withdraw'];
    const activeCases = cases.filter((caseData) => {
      const { case_status } = caseData;

      if (!case_status || case_status.length === 0) {
        return false; // Exclude cases with no status
      }

      // Find the latest status based on created_dtm
      const latestStatus = case_status.reduce((latest, current) =>
        new Date(current.created_dtm) > new Date(latest.created_dtm) ? current : latest
      );

      // Check if the latest status is not in the excluded statuses
      return !excludedStatuses.includes(latestStatus.case_status);
    });

    // Check if any active cases remain after filtering
    if (activeCases.length === 0) {
      return res.status(404).json({
        status: "error",
        message: `No active cases found for account number ${account_no}.`,
      });
    }

    // Return the filtered cases
    return res.status(200).json({
      status: "success",
      message: "Active cases retrieved successfully.",
      data: activeCases.map((caseData) => ({
        _id: caseData._id,
        case_id: caseData.case_id,
        incident_id: caseData.incident_id,
        account_no: caseData.account_no,
        customer_ref: caseData.customer_ref,
        created_dtm: caseData.created_dtm,
        implemented_dtm: caseData.implemented_dtm,
        area: caseData.area,
        rtom: caseData.rtom,
        drc_selection_rule_base: caseData.drc_selection_rule_base,
        current_selection_logic: caseData.current_selection_logic,
        bss_arrears_amount: caseData.bss_arrears_amount,
        current_arrears_amount: caseData.current_arrears_amount,
        action_type: caseData.action_type,
        selection_rule: caseData.selection_rule,
        last_payment_date: caseData.last_payment_date,
        monitor_months: caseData.monitor_months,
        last_bss_reading_date: caseData.last_bss_reading_date,
        commission: caseData.commission,
        case_current_status: caseData.case_current_status,
        filtered_reason: caseData.filtered_reason,
        case_status: caseData.case_status, // Return full case_status array for detailed view
      })),
    });
  } catch (error) {
    console.error("Error retrieving active cases:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve active cases.",
      errors: {
        exception: error.message,
      },
    });
  }
};

export const get_count_by_drc_commision_rule = async (req, res) => {
  const case_status = "Open no agent";
    try {
      const casesCount = await Case_details.aggregate([
        {
          $match: {
            "case_current_status": case_status
          }
        },
        {
          $group: {
            _id: "$drc_commision_rule",
            case_count: { $sum: 1 }
          }
        },
        {
          $project: {
            drc_commision_rule: "$_id",
            case_count: 1,
            _id: 0
          }
        }
      ]);
      const totalRules = casesCount.length;
      return res.status(200).json({
        status: "success",
        message: "Cases count grouped by drc_commision_rule fetched successfully.",
        metadata: {
          total_rules: totalRules
        },
        data: casesCount
      });
    } catch (error) {
        return res.status(500).json({
          status: "error",
          message: "Failed to fetch cases count. Please try again later.",
          error: error.message
        });
    }
};

// export const Case_Distribution_Among_Agents = async (req, res) => {
//   const { drc_commision_rule, current_arrears_band, drc_list,created_by } = req.body;

//   if (!drc_commision_rule || !current_arrears_band || !drc_list || !created_by) {
//     return res.status(400).json({
//       status: "error",
//       message: "DRC commission rule, current arrears band, and DRC list fields are required.",
//     });
//   }

//   if (drc_list.length <= 0) {
//     return res.status(400).json({
//       status: "error",
//       message: "DRC List should not be empty.",
//     });
//   }

//   const validateDRCList = (drcList) => {
//     if (!Array.isArray(drcList)) {
//       throw new Error("DRC List must be an array.");
//     }

//     return drcList.map((item, index) => {
//       if (typeof item.DRC !== "string" || typeof item.Count !== "number") {
//         throw new Error(`Invalid structure at index ${index} in DRC List.`);
//       }

//       return {
//         DRC: item.DRC,
//         Count: item.Count,
//       };
//     });
//   };

//   try {
//     // Validate the DRC list
//     const validatedDRCList = validateDRCList(drc_list);

//     const mongo = await db.connectMongoDB();

//     // Validation for existing tasks with `task_status` and specific parameters
//     const existingTask = await mongo.collection("System_tasks").findOne({
//       task_status: { $ne: "Complete" },
//       "parameters.drc_commision_rule": drc_commision_rule,
//       "parameters.current_arrears_band": current_arrears_band,
//     });
//     // console.log(existingTask);
//     if (existingTask) {
//       return res.status(400).json({
//         status: "error",
//         message: "Already has tasks with this commision rule and arrears band ",
//       });
//     }

//     // Prepare dynamic parameters for the task
//     const dynamicParams = {
//       drc_commision_rule,
//       current_arrears_band,
//       distributed_Amounts: validatedDRCList,
//     }; 

//     // Call createTaskFunction
//     const result = await createTaskFunction({
//       Template_Task_Id: 3,
//       task_type: "Case Distribution Planning among DRC",
//       created_By: created_by,
//       ...dynamicParams,
//     });
    
//     const counter_result_of_case_distribution_batch_id = await mongo.collection("counters").findOneAndUpdate(
//       { _id: "case_distribution_batch_id" },
//       { $inc: { seq: 1 } },
//       { returnDocument: "after", upsert: true }
//     );
//     const case_distribution_batch_id = counter_result_of_case_distribution_batch_id.seq; // Use `value` to access the updated document
//     console.log("case_distribution_batch_id:", case_distribution_batch_id);

//     if (!case_distribution_batch_id) {
//       throw new Error("Failed to generate case_distribution_batch_id.");
//     }

//     // Prepare Case distribution drc transactions data
//     const Case_distribution_drc_transactions_data = {
//       case_distribution_batch_id,
//       batch_seq: 1,
//       created_dtm: new Date(),
//       created_by,
//       action_type: "distribution",
//       drc_commision_rule,
//       current_arrears_band,
//       array_of_distribution:validatedDRCList,
//       rulebase_count: 100,
//       rulebase_arrears_sum: 5000,
//       crd_distribution_status: {crd_distribution_status:"Open",created_dtm:new Date()},
//     };

//     // Insert into Case_distribution_drc_transactions collection
//     const new_Case_distribution_drc_transaction = new Case_distribution_drc_transactions(Case_distribution_drc_transactions_data);
//     await new_Case_distribution_drc_transaction.save();


//     // Return success response from createTaskFunction
//     return res.status(200).json(result);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       status: "error",
//       message: `An error occurred while storiing : ${error.message}`,
//     });
//   }
// };

export const Case_Distribution_Among_Agents = async (req, res) => {
  const { drc_commision_rule, current_arrears_band, drc_list, created_by } = req.body;

  if (!drc_commision_rule || !current_arrears_band || !drc_list || !created_by) {
    return res.status(400).json({
      status: "error",
      message: "DRC commission rule, current arrears band, created by and DRC list fields are required.",
    });
  }

  if (drc_list.length <= 0) {
    return res.status(400).json({
      status: "error",
      message: "DRC List should not be empty.",
    });
  }

  const validateDRCList = (drcList) => {
    if (!Array.isArray(drcList)) {
      throw new Error("DRC List must be an array.");
    }

    return drcList.map((item, index) => {
      if (typeof item.DRC !== "string" || typeof item.Count !== "number") {
        throw new Error(`Invalid structure at index ${index} in DRC List.`);
      }

      return {
        DRC: item.DRC,
        Count: item.Count,
      };
    });
  };

  try {
    // Validate the DRC list
    const validatedDRCList = validateDRCList(drc_list);

    const mongo = await db.connectMongoDB();

    // Validation for existing tasks with task_status and specific parameters
    const existingTask = await mongo.collection("System_tasks").findOne({
      task_status: { $ne: "Complete" },
      "parameters.drc_commision_rule": drc_commision_rule,
      "parameters.current_arrears_band": current_arrears_band,
    });
    // console.log(existingTask);
    if (existingTask) {
      return res.status(400).json({
        status: "error",
        message: "Already has tasks with this commision rule and arrears band ",
      });
    }

    // Prepare dynamic parameters for the task
    const dynamicParams = {
      drc_commision_rule,
      current_arrears_band,
      distributed_Amounts: validatedDRCList,
    };

    // Call createTaskFunction
    const result = await createTaskFunction({
      Template_Task_Id: 3,
      task_type: "Case Distribution Planning among DRC",
      Created_By: created_by,
      ...dynamicParams,
    });

    const counter_result_of_case_distribution_batch_id = await mongo.collection("counters").findOneAndUpdate(
      { _id: "case_distribution_batch_id" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }
    );
    const case_distribution_batch_id = counter_result_of_case_distribution_batch_id.seq; // Use `value` to access the updated document
    console.log("case_distribution_batch_id:", case_distribution_batch_id);

    if (!case_distribution_batch_id) {
      throw new Error("Failed to generate case_distribution_batch_id.");
    }

    // Prepare Case distribution drc transactions data
    const Case_distribution_drc_transactions_data = {
      case_distribution_batch_id,
      batch_seq: 1,
      created_dtm: new Date(),
      created_by,
      action_type: "distribution",
      drc_commision_rule,
      current_arrears_band,
      array_of_distribution:validatedDRCList,
      rulebase_count: 100,
      rulebase_arrears_sum: 5000,
      crd_distribution_status: {crd_distribution_status:"Open",created_dtm:new Date()},
    };

    // Insert into Case_distribution_drc_transactions collection
    const new_Case_distribution_drc_transaction = new Case_distribution_drc_transactions(Case_distribution_drc_transactions_data);
    await new_Case_distribution_drc_transaction.save();


    // Return success response from createTaskFunction
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: `An error occurred while creating the task: ${error.message}`,
    });
  }
};

export const listHandlingCasesByDRC = async (req, res) => {
  const { drc_id, rtom, ro_id, arrears_band, from_date, to_date } = req.body;

  try {
    // Validate the DRC ID
    if (!drc_id) {
      return res.status(400).json({
        status: "error",
        message: "Failed to retrieve DRC details.",
        errors: {
          code: 400,
          description: "DRC ID is required.",
        },
      });
    }

    // Ensure at least one optional parameter is provided
    if (!rtom && !ro_id && !arrears_band && !(from_date && to_date)) {
      return res.status(400).json({
        status: "error",
        message: "At least one filtering parameter is required.",
        errors: {
          code: 400,
          description: "Provide at least one of rtom, ro_id, arrears_band, or both from_date and to_date together.",
        },
      });
    }

    // Build query dynamically based on provided parameters
    let query = {
      $and: [
        { "drc.drc_id": drc_id },
        {
          case_current_status: {
            $in: [
              "Open No Agent",
              "Open with Agent",
              "Negotiation Settle pending",
              "Negotiation Settle Open Pending",
              "Negotiation Settle Active",
              "FMB",
              "FMB Settle pending",
              "FMB Settle Open Pending",
              "FMB Settle Active",
            ],
          },
        },
        { "drc.drc_status": "Active" },
        { "drc.removed_dtm": null },
        {
          $or: [
            { "drc.recovery_officers": { $size: 0 } },
            { "drc.recovery_officers": { $elemMatch: { "removed_dtm": null } } },
          ],
        },
      ],
    };

    // Add optional filters dynamically
    if (rtom) query.$and.push({ area: rtom });
    if (arrears_band) query.$and.push({ arrears_band });
    if (ro_id) {
      query.$and.push({
        $expr: {
          $eq: [
            ro_id,
            {
              $arrayElemAt: [ { $arrayElemAt: ["$drc.recovery_officers.ro_id", -1] }, -1, ],
            },
          ],
        },
      });
    }
    if (from_date && to_date) {
      query.$and.push({ "drc.created_dtm": { $gt: new Date(from_date) } });
      query.$and.push({ "drc.expire_dtm": { $lt: new Date(to_date) } });
    }

    const cases = await Case_details.find(query);

    // Handle case where no matching cases are found
    if (cases.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No matching cases found for the given criteria.",
        errors: {
          code: 404,
          description: "No cases satisfy the provided criteria.",
        },
      });
    }

    // Use Promise.all to handle asynchronous operations
    const formattedCases = await Promise.all(
      cases.map(async (caseData) => {
        const lastDrc = caseData.drc[caseData.drc.length - 1]; // Get the last DRC object
        const lastRecoveryOfficer =
          lastDrc.recovery_officers[lastDrc.recovery_officers.length - 1] || {};

        // Fetch matching recovery officer asynchronously
        const matchingRecoveryOfficer = await RecoveryOfficer.findOne({
          ro_id: lastRecoveryOfficer.ro_id,
        });

        return {
          case_id: caseData.case_id,
          status: caseData.case_current_status,
          created_dtm: lastDrc.created_dtm,
          current_arreas_amount: caseData.current_arrears_amount,
          area: caseData.area,
          remark: caseData.remark?.[caseData.remark.length - 1]?.remark || null,
          expire_dtm: lastDrc.expire_dtm,
          ro_name: matchingRecoveryOfficer?.ro_name || null,
        };
      })
    );

    // Return success response
    return res.status(200).json({
      status: "success",
      message: "Cases retrieved successfully.",
      data: formattedCases,
    });
  } catch (error) {
    // Handle errors
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


// export const listAllActiveRosByDRCID = async (req, res) => {
//   try {
//     const { drc_id, rtom_area } = req.body;

//     // Validate input
//     if (!drc_id || !rtom_area) {
//       return res.status(400).json({
//         status: "error",
//         message: "All fields are required.",
//       });
//     }

//     // Step 1: Find cases in the `case_details` collection matching the conditions
//     const cases = await Case_details.find({
//       "drc.drc_id": drc_id,
//       "drc.drc_status": "Active",
//       "drc.removed_dtm": null,
//     });

//     if (cases.length === 0) {
//       return res.status(404).json({
//         status: "error",
//         message: "No active cases found with the provided DRC ID.",
//       });
//     }
//     // Step 2: Extract unique `drc_name` values from the matched cases
//     const drcNames = [
//       ...new Set(
//         cases.flatMap((c) =>
//           c.drc.filter((d) => d.drc_id === drc_id).map((d) => d.drc_name)
//         )
//       ),
//     ];

//     if (drcNames.length === 0) {
//       return res.status(404).json({
//         status: "error",
//         message: "No active DRC names found for the provided DRC ID.",
//       });
//     }
//     // Step 3: Find recovery officers matching the `drc_name` and `rtom_area` conditions
//     const recoveryOfficers = await RecoveryOfficer.find({
//       $and: [
//         { drc_name: { $in: drcNames } }, // Match drc_name in recovery officer
//         { "rtoms_for_ro.name": rtom_area }, // Match rtom_area in rtoms_for_ro
//       ],
//       status: "Active", // Only Active RTOMs
//       ro_end_dtm: null, // Ensure recovery officer has no end date
//     });

//     if (recoveryOfficers.length === 0) {
//       return res.status(404).json({
//         status: "error",
//         message: "No active Recovery Officers found for the specified conditions.",
//       });
//     }
//     // Step 4: Format the result
//     const response = recoveryOfficers.map((officer) => ({
//       ro_id: officer.ro_id,
//       ro_name: officer.ro_name,
//     }));

//     // Step 4: Return the list of recovery officers
//     return res.status(200).json({
//       status: "success",
//       message: "Active Recovery Officers retrieved successfully.",
//       data: response,
//     });
//   } catch (error) {
//     console.error("Error retrieving active ROs:", error.message);
//     return res.status(500).json({
//       status: "error",
//       message: "Failed to retrieve active ROs.",
//       errors: {
//         exception: error.message,
//       },
//     });
//   }
// };
      

export const assignROToCase = async (req, res) => {
  try {
    const { case_ids, ro_id } = req.body;

    // Validate input
    if (!Array.isArray(case_ids) || case_ids.length === 0 || !ro_id) {
      return res.status(400).json({
        status: "error",
        message: "Failed to assign Recovery Officer.",
        errors: {
          code: 400,
          description: "case_ids must be a non-empty array and ro_id is required.",
        },
      });
    }

    const assigned_by = "System";

    // Fetch the recovery officer details
    const recoveryOfficer = await RecoveryOfficer.findOne({ ro_id });
    if (!recoveryOfficer) {
      return res.status(404).json({
        status: "error",
        message: "Recovery Officer not found.",
        errors: {
          code: 404,
          description: `No Recovery Officer found with ro_id: ${ro_id}.`,
        },
      });
    }

    // Extract the RTOM areas assigned to the recovery officer
    const assignedAreas = recoveryOfficer.rtoms_for_ro.map((r) => r.name);

    const errors = [];
    const updates = [];

    // Fetch all cases with the provided case IDs
    const cases = await Case_details.find({ case_id: { $in: case_ids } });

    if (cases.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No cases found for the provided case IDs.",
      });
    }

    for (const caseData of cases) {
      const { case_id, drc, area } = caseData;

      // Ensure the case area matches one of the recovery officer's assigned areas
      if (!assignedAreas.includes(area)) {
        errors.push({
          case_id,
          message: `The area "${area}" does not match any RTOM area assigned to Recovery Officer with ro_id: ${ro_id}.`,
        });
        continue;
      }

      // Ensure there's at least one DRC with expire_dtm as null
      const activeDrc = drc.find((d) => d.expire_dtm === null);
      if (!activeDrc) {
        errors.push({
          case_id,
          message: "No active DRC with expire_dtm as null found.",
        });
        continue;
      }

      // Ensure recovery_officers array exists in the active DRC
      const recoveryOfficers = activeDrc.recovery_officers || [];
      const lastOfficer = recoveryOfficers[recoveryOfficers.length - 1];

      // If there is a last officer, ensure remove_dtm is updated
      if (lastOfficer && lastOfficer.removed_dtm === null) {
        lastOfficer.removed_dtm = new Date();
      }

      // Prepare the new recovery officer object
      const newOfficer = {
        ro_id,
        assigned_dtm: new Date(),
        assigned_by,
        removed_dtm: null,
        case_removal_remark: null,
      };

      // Add the new officer to the recovery_officers array
      recoveryOfficers.push(newOfficer);

      // Update the case data
      updates.push({
        updateOne: {
          filter: { case_id, "drc.drc_id": activeDrc.drc_id },
          update: {
            $set: { "drc.$.recovery_officers": recoveryOfficers },
          },
        },
      });
    }

    // Apply updates using bulkWrite
    if (updates.length > 0) {
      await Case_details.bulkWrite(updates);
    }

    // Respond with success and error details
    res.status(200).json({
      status: "success",
      message: "Recovery Officers assigned successfully.",
      details: {
        updated_cases: updates.length,
        failed_cases: errors,
      },
    });
  } catch (error) {
    // Handle unexpected errors
    return res.status(500).json({
      status: "error",
      message: "An error occurred while assigning the Recovery Officer.",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }
};






// export const count_cases_rulebase_and_arrears_band = async (req, res) => {
//   const { drc_commision_rule } = req.body;

//   try {
//     // Validate input
//     if (!drc_commision_rule) {
//       return res.status(400).json({
//         status: "error",
//         message: "drc_commision_rule is required.",
//       });
//     }

//     // Hardcoded case_status
//     const case_status = "Open No Agent";

//     // Fetch all cases that match the hardcoded case_status and provided drc_commision_rule
//     const cases = await Case_details.find({
//       "case_status.case_status": case_status, // Hardcoded case_status
//       drc_commision_rule, // Match the provided drc_commision_rule
//     });

//     // Check if any cases were found
//     if (!cases || cases.length === 0) {
//       return res.status(404).json({
//         status: "error",
//         message: "No cases found for the provided criteria.",
//       });
//     }

//     // Filter cases where the latest case_status matches the hardcoded case_status
//     const filteredCases = cases.filter((caseData) => {
//       const { case_status: statuses } = caseData;

//       // Find the latest status by created_dtm
//       const latestStatus = statuses.reduce((latest, current) =>
//         new Date(current.created_dtm) > new Date(latest.created_dtm) ? current : latest
//       );

//       // Check if the latest status matches the hardcoded case_status
//       return latestStatus.case_status === case_status;
//     });

//     // Count total filtered cases
//     const totalCases = filteredCases.length;

//     // Prepare arrears bands as an array with structured fields and subfields
//     const arrearsBandCounts = [
//       { band: "5000-10000", count: 0, details: { description: "Arrears between 5,000 and 10,000" } },
//       { band: "10000-25000", count: 0, details: { description: "Arrears between 10,000 and 25,000" } },
//       { band: "25000-50000", count: 0, details: { description: "Arrears between 25,000 and 50,000" } },
//       { band: "50000-100000", count: 0, details: { description: "Arrears between 50,000 and 100,000" } },
//       { band: ">100000", count: 0, details: { description: "Arrears greater than 100,000" } },
//     ];

//     // Update counts in the arrearsBandCounts array based on arrears_band
//     filteredCases.forEach((caseData) => {
//       const { arrears_band } = caseData;

//       if (arrears_band === "AB-5_10") {
//         arrearsBandCounts[0].count++;
//       } else if (arrears_band === "AB-10_25") {
//         arrearsBandCounts[1].count++;
//       } else if (arrears_band === "AB-25_50") {
//         arrearsBandCounts[2].count++;
//       } else if (arrears_band === "AB-50_100") {
//         arrearsBandCounts[3].count++;
//       } else if (arrears_band === "AB-100<") {
//         arrearsBandCounts[4].count++;
//       }
//     });

//     // Respond with the structured results
//     return res.status(200).json({
//       status: "success",
//       message: "Counts retrieved successfully.",
//       data: {
//         Total: totalCases,
//         Arrears_Bands: arrearsBandCounts,
//       },
//     });
//   } catch (error) {
//     console.error("Error retrieving counts:", error.message);
//     return res.status(500).json({
//       status: "error",
//       message: "Failed to retrieve counts.",
//       errors: {
//         exception: error.message,
//       },
//     });
//   }
// };


export const count_cases_rulebase_and_arrears_band = async (req, res) => {
  const { drc_commision_rule } = req.body;

  try {
    // Validate input
    if (!drc_commision_rule) {
      return res.status(400).json({
        status: "error",
        message: "drc_commision_rule is required.",
      });
    }

    // Hardcoded case_status
    const case_status = "Open No Agent";

    // Connect to MongoDB and fetch arrears bands dynamically
    const mongoConnection = await db.connectMongoDB();
    if (!mongoConnection) {
      throw new Error("MongoDB connection failed");
    }

    const arrearsBandsData = await mongoConnection
      .collection("Arrears_bands")
      .findOne({});
    if (!arrearsBandsData) {
      return res.status(404).json({
        status: "error",
        message: "No arrears bands found.",
      });
    }

    // Convert arrears bands data into an array
    const arrearsBands = Object.entries(arrearsBandsData)
      .filter(([key]) => key !== "_id") // Exclude the MongoDB _id field
      .map(([key, value]) => ({ key, range: value, count: 0 }));

    // Fetch all cases that match the hardcoded case_status and provided drc_commision_rule
    const cases = await Case_details.find({
      "case_status.case_status": case_status, // Hardcoded case_status
      drc_commision_rule, // Match the provided drc_commision_rule
    });

    // Check if any cases were found
    if (!cases || cases.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No cases found for the provided criteria.",
      });
    }

    // Filter cases where the latest case_status matches the hardcoded case_status
    const filteredCases = cases.filter((caseData) => {
      const { case_status: statuses } = caseData;

      // Find the latest status by created_dtm
      const latestStatus = statuses.reduce((latest, current) =>
        new Date(current.created_dtm) > new Date(latest.created_dtm) ? current : latest
      );

      // Check if the latest status matches the hardcoded case_status
      return latestStatus.case_status === case_status;
    });

    // Count total filtered cases
    const totalCases = filteredCases.length;

    // Update counts dynamically based on arrears bands
    filteredCases.forEach((caseData) => {
      const { arrears_band } = caseData;

      // Find the arrears band and increment its count
      const band = arrearsBands.find((band) => band.key === arrears_band);
      if (band) {
        band.count++;
      }
    });

    // Format the response to include arrears bands dynamically
    const formattedBands = arrearsBands.map((band) => ({
      band: band.range,
      // [`count_${band.range.replace(/-/g, "_")}`]: band.count,
      count: band.count,
      details: {
        description: `Cases in the range of ${band.range}`,
      },
    }));

    // Respond with the structured results
    return res.status(200).json({
      status: "success",
      message: "Counts retrieved successfully.",
      data: {
        Total: totalCases,
        Arrears_Bands: formattedBands,
      },
    });
  } catch (error) {
    console.error("Error retrieving counts:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve counts.",
      errors: {
        exception: error.message,
      },
    });
  }
};


// export const List_Case_Distribution_DRC_Summary = async (req, res) => {
//     try {
//         const { date_from, date_to, arrears_band, drc_commision_rule } = req.body;
//         let filter = {};

//         // If date range is provided, filter created_dtm accordingly
//         if (date_from && date_to) {
//             filter.created_dtm = { $gte: new Date(date_from), $lte: new Date(date_to) };
//         } else if (date_from) {
//             filter.created_dtm = { $gte: new Date(date_from) };
//         } else if (date_to) {
//             filter.created_dtm = { $lte: new Date(date_to) };
//         }

//         // If arrears_band is provided, filter based on it
//         if (arrears_band) {
//             filter.arrears_band = arrears_band;
//         }

//         // If drc_commision_rule is provided, filter based on it
//         if (drc_commision_rule) {
//             filter.drc_commision_rule = drc_commision_rule;
//         }

//         // Fetch records based on filter
//         const caseDistributions = await CaseDistribution.find(filter);

//         // Calculate total_case_count and total_sum_of_arrears for each batch
//         const response = caseDistributions.map(doc => {
//             const total_case_count = doc.array_of_distribution.reduce((sum, entry) => sum + entry.case_count, 0);
//             const total_sum_of_arrears = doc.array_of_distribution.reduce((sum, entry) => sum + entry.sum_of_arrears, 0);
//             return {
//                 ...doc.toObject(),
//                 total_case_count,
//                 total_sum_of_arrears
//             };
//         });

//         res.status(200).json(response);
//     } catch (error) {
//         console.error("Error fetching case distributions:", error);
//         res.status(500).json({ message: "Server Error", error });
//     }
// };


export const List_Case_Distribution_DRC_Summary = async (req, res) => {
    try {
        const { date_from, date_to, current_arrears_band, drc_commision_rule } = req.body;
        let filter = {batch_seq: 1}; // Ensuring only batch_seq: 1 records are retrieved

        // If date range is provided, filter created_dtm accordingly
        if (date_from && date_to) {
            filter.created_dtm = { $gte: new Date(date_from), $lte: new Date(date_to) };
        } else if (date_from) {
            filter.created_dtm = { $gte: new Date(date_from) };
        } else if (date_to) {
            filter.created_dtm = { $lte: new Date(date_to) };
        }

        // If current_arrears_band is provided, filter based on it
        if (current_arrears_band) {
            filter.current_arrears_band = current_arrears_band;
        }

        // If drc_commision_rule is provided, filter based on it
        if (drc_commision_rule) {
            filter.drc_commision_rule = drc_commision_rule;
        }

        // Fetch records based on filter
        const caseDistributions = await CaseDistribution.find(filter);

        res.status(200).json(caseDistributions);
    } catch (error) {
        console.error("Error fetching case distributions:", error);
        res.status(500).json({ message: "Server Error", error });
    }
};

export const List_ALL_Distribution_Details_By_Batch_ID = async (req, res) => {
  try {
    const { case_distribution_batch_id } = req.body;
    
    if (!case_distribution_batch_id) {
      return res.status(400).json({
        status: "error",
        message: "case_distribution_batch_id is required.",
      });
    }

    const caseDistribution = await CaseDistribution.aggregate([
      {
        $match: { case_distribution_batch_id: case_distribution_batch_id }
      },
      {
        $lookup: {
          from: "Case_Distribution_DRC_Summary",
          localField: "case_distribution_batch_id",
          foreignField: "case_distribution_batch_id",
          as: "drc_summary"
        }
      },
      {
        $project: {
          _id: 0,
          case_distribution_batch_id: 1,
          batch_seq: 1,
          created_dtm: 1,
          drc_commision_rule: 1,
          current_arrears_band: 1,
          action_type: 1,
          rulebase_count: 1,
          rulebase_arrears_sum: 1,
          case_count: { $sum: "$drc_summary.case_count" },
          total_arrears_amount: { $sum: "$drc_summary.tot_arrease" },
          drc_summary: {
            $map: {
              input: "$drc_summary",
              as: "drc",
              in: {
                drc: "$$drc.drc",  // Use drc_id instead of drc (as per schema)
                rtom: "$$drc.rtom",
                case_count: "$$drc.case_count",
                tot_arrease: "$$drc.tot_arrease"
              }
            }
          }
        }
      }
    ]);

    if (caseDistribution.length == 0) {
      return res.status(404).json({ message: "Batch not found." });
    }
    return res.status(200).json({
      status: "success",
      message: "Batch retrieved successfully.",
      data: caseDistribution,
    });

  } catch (error) {
    console.error("Error fetching case distribution:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Error fetching case distribution.",
      errors: {
        exception: error.message,
      },
    });
  }
};

const validateTaskParameters = (parameters) => {
  const { current_arrears_band, date_from, date_to, drc_commision_rule } = parameters;

  if (!current_arrears_band || typeof current_arrears_band !== "string") {
    throw new Error("current_arrears_band is required and must be a string.");
  }

  // Only validate dates if they are not null
  if (date_from !== null && date_from !== undefined && isNaN(new Date(date_from).getTime())) {
    throw new Error("date_from must be a valid date string or null.");
  }

  if (date_to !== null && date_to !== undefined && isNaN(new Date(date_to).getTime())) {
    throw new Error("date_to must be a valid date string or null.");
  }

  if (!drc_commision_rule || typeof drc_commision_rule !== "string") {
    throw new Error("drc_commision_rule is required and must be a string.");
  }

  return true;
};

export const Create_Task_For_case_distribution = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { current_arrears_band, date_from, date_to, drc_commision_rule, Created_By } = req.body;

    if (!Created_By) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: "error",
        message: "Created_By is a required parameter.",
      });
    }

    // Flatten the parameters structure
    const parameters = {
      current_arrears_band,
      date_from: date_from && !isNaN(new Date(date_from)) ? new Date(date_from).toISOString() : null,
      date_to: date_to && !isNaN(new Date(date_to)) ? new Date(date_to).toISOString() : null,
      drc_commision_rule,
      Created_By,
      task_status: "open"
    };

    validateTaskParameters(parameters);

    // Pass parameters directly (without nesting it inside another object)
    const taskData = {
      Template_Task_Id: 13,
      task_type: "Case_distribution_task",
      ...parameters, // Spreads parameters directly into taskData
    };

    // Call createTaskFunction
    await createTaskFunction(taskData, session);

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      status: "success",
      message: "Task created successfully.",
      data: taskData,
    });
  } catch (error) {
    console.error("Error in Create_Task_For_case_distribution:", error);
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










