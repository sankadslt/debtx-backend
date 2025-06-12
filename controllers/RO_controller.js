/* Purpose: This template is used for the RO Controller.
Created Date: 2024-12-04
Created By: Dinusha Anupama (dinushanupama@gmail.com)
Last Modified Date: 2024-12-17
Modified By: Dinusha Anupama (dinushanupama@gmail.com)
           : Ravindu Pathum (ravindupathumiit@gmail.com)
Version: Node.js v20.11.1
Dependencies: mysql2
Related Files: RO_route.js
Notes:  */

import db from "../config/db.js";
import mongoose from 'mongoose';
import DebtRecoveryCompany from '../models/Debt_recovery_company.js';
import Rtom  from '../models/Rtom.js'; 
import moment from "moment";
import Recovery_officer from "../models/Recovery_officer.js";
import CaseDetails from "../models/CaseMode.js";
import User_log from "../models/User_Log.js";




// Update Recovery Officer Status by ID
export const Change_RO_Status = async (req, res) => {
  const ro_status_edit_by = "Admin";
  const { ro_id, ro_status } = req.body;
  if (!ro_id || !ro_status || !ro_status_edit_by) {
    return res.status(400).json({
      status: "error",
      message: "RO ID field, RO EDIT BY field and RO Status field are required",
    });
  }

  // Update MongoDB

  const newStatus = {
    status: ro_status,
    ro_status_date: new Date().toLocaleDateString("en-GB"), // Format date as dd/mm/yyyy
    ro_status_edit_by: ro_status_edit_by,
  };

  try {
    const filter = { ro_id: ro_id };
    const update = {
      $push: {
        ro_status: newStatus,
      },
    };
    const updatedResult = await Recovery_officer.updateOne(filter, update);

    if (updatedResult.matchedCount === 0) {
      console.log("Recovery Officer not found in MongoDB:", updatedResult);
      return res.status(400).json({
        status: "error",
        message: "Recovery Officer not found in MongoDB",
      });
    }
    return res.status(200).json({
      status: "success",
      message: "Recovery Officer status updated successfully.",
      data: updatedResult,
    });
  } catch (mongoError) {
    console.error("Error updating MongoDB:", mongoError.message);
  }

  // Send final response
  // return res.status(200).json({
  //   status: "success",
  //   message: "Recovery Officer status updated successfully.",
  //   data: mysqlResults,
  // });
  // } catch (error) {
  //   console.error("Error updating MySQL:", error.message);
  //   return res.status(500).json({
  //     status: "error",
  //     message: "Database updating error",
  //     error: error.message,
  //   });
  // }
};

// export const Suspend_Ro = async (req, res) =>{
//   const { ro_id, ro_remark, } = req.body;
//   const remark_edit_by = "Admin";
//   const today = new Date();
//   const year = today.getFullYear();
//   const month = String(today.getMonth() + 1).padStart(2, '0');
//   const day = String(today.getDate()).padStart(2, '0');
//   const ro_end_date = `${year}-${month}-${day}`;

//   if (!ro_id || !ro_remark || !ro_end_date) {
//     return res.status(400).json({
//       status: "error",
//       message: "All field are required",
//     });
//   };

//   try{
//     const filter = { ro_id: ro_id };
//     const update = {
//       $set: {
//         ro_end_date: ro_end_date,
//       },
//       $push: {
//         remark: {
//           remark: ro_remark,
//           remark_date: ro_end_date,
//           remark_edit_by: remark_edit_by,
//         },
//       },
//     };
//     const updatedResult = await Recovery_officer.updateOne(filter, update);
    
//     if (updatedResult.matchedCount === 0) {
//       console.log("Recovery Officer not found in MongoDB:", updatedResult);
//       return res.status(400).json({
//             status: "error",
//             message: "Recovery Officer not found in MongoDB",
//       });
//     }
//     return res.status(200).json({
//       status: "success",
//       message: "The Recovery Officer has been suspended..",
//       data: updatedResult,
//     });
//   }catch (mongoError) {
//       console.error("Error updating MongoDB:", mongoError.message);
//   }
// };

//Suspend RTOM From RO Officer Profile details
export const Suspend_Ro = async (req, res) => {
  const { ro_id, remark, remark_edit_by, ro_end_date } = req.body;
  const ro_status = "Terminate";
  // const ro_end_date = new Date();

  if (!ro_id || !remark) {
    return res.status(400).json({
      status: "error",
      message: "All fields are required",
    });
  }

  try {
    // Check if RTOM already terminated
    const existingRo = await Recovery_officer.findOne({ ro_id });

    if (existingRo && existingRo.ro_status.length > 0) {
      const lastStatus = existingRo.ro_status[existingRo.ro_status.length - 1];
      if (lastStatus.status === "Terminate") {
        return res.status(400).json({
          status: "error",
          message: "RO has already been terminated and cannot be reactivated.",
        });
      }
    }

    const filter = { ro_id: ro_id };
    const update = {
      $set: {
        ro_end_date: ro_end_date,
      },
      $push: {
        remark: {
          remark: remark,
          remark_date: ro_end_date,
          remark_edit_by: remark_edit_by || "system",
        },
        ro_status: {
          status: ro_status,
          ro_status_date: ro_end_date,
          ro_status_edit_by: remark_edit_by || "system",
        },
      },
    };

    const updatedResult = await Recovery_officer.updateOne(filter, update);

    if (updatedResult.matchedCount === 0) {
      console.log("RO not found in Database:", updatedResult);
      return res.status(400).json({
        status: "error",
        message: "RO not found in Database",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "The RO has been suspended.",
      data: updatedResult,
    });
  } catch (mongoError) {
    console.error("Error updating MongoDB:", mongoError.message);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

export const Suspend_RTOM_From_RO = async (req, res) => {
  const { ro_id, rtom_id } = req.body;
  const rtom_status = "Inactive";
  if (!ro_id || !rtom_id || !rtom_status) {
    return res.status(400).json({
      status: "error",
      message: "ro_id, rtom_name, and new_status are required.",
    });
  }

  if (!["Active", "Inactive", "Pending"].includes(rtom_status)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid status value.",
    });
  }

  // const updateStatusQue = `UPDATE recovery_officer_rtoms SET ro_for_rtom_status = ? WHERE ro_id = ? AND rtom_id = ?;`

  // try {
  // const updateStatus = () =>
  //   new Promise((resolve, reject) => {
  //     db.mysqlConnection.query(updateStatusQue, [rtom_status, ro_id, rtom_id], (err, result) => {
  //       if (err) return reject(err);
  //       resolve(result);
  //     });
  //   });

  // const result = await updateStatus();

  // if (result.affectedRows > 0) {
  //return res.status(200).json({ message: 'RTOM status updated successfully.', data: result });
  try {
    const rtomdetails = await Rtom.findOne({ rtom_id });
    if (!rtomdetails) {
      console.log(rtomdetails);
      return res.status(404).json({
        status: "error",
        message: "RTOM not found in Rtom collection.",
      });
    }
    const rtom_name = rtomdetails.area_name;
    const updatedRo = await Recovery_officer.findOneAndUpdate(
      { ro_id, "rtoms_for_ro.name": rtom_name },
      { $set: { "rtoms_for_ro.$.status": rtom_status } },
      { new: true }
    );
    if (!updatedRo) {
      return res.status(404).json({
        status: "error",
        message: "Recovery Officer or RTOM not found.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "RTOM status updated successfully.",
      data: updatedRo,
    });
  } catch (error) {
    console.error("Error updating RTOM status:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error.",
    });
  }
  // } else {
  //   return res.status(404).json({
  //     status: "error",
  //     message: 'No matching record found for the provided ro_id and rtom_id.' });
  // }

  // } catch (error) {
  //   console.error('Error updating RTOM status:', error.message);
  //   return res.status(500).json({ message: 'Internal server error.', error: error.message });
  // }
};

// Get RTOM list of RO
export const List_All_RTOM_Ownned_By_RO = async (req, res) => {
  const { ro_id } = req.body;
  if (!ro_id) {
    return res.status(400).json({
      status: "error",
      message: "ro_id is required.",
    });
  }

  // const getRtomque = `SELECT rtom.area_name FROM rtom JOIN recovery_officer_rtoms ON rtom.rtom_id = recovery_officer_rtoms.rtom_id WHERE recovery_officer_rtoms.ro_id = ?;`

  try {
    // const getRtom = () =>
    //   new Promise((resolve, reject) => {
    //     db.mysqlConnection.query(getRtomque, [ro_id], (err, result) => {
    //       if (err) return reject(err);
    //       resolve(result);
    //     });
    //   });

    // const result = await getRtom();
    // const areaNames = result.map(rtom => rtom.area_name);
    // if (result.length > 0 && areaNames.length > 0) {

    const rtom_names_with_status = await Recovery_officer.aggregate([
      { $match: { ro_id: ro_id } },
      { $unwind: "$rtoms_for_ro" },
      {
        $lookup: {
          from: "Rtom",
          localField: "rtoms_for_ro.name",
          foreignField: "rtom_abbreviation",
          as: "rtom_details",
        },
      },
      { $unwind: "$rtom_details" },
      {
        $project: {
          name: "$rtoms_for_ro.name",
          status: "$rtoms_for_ro.status",
          rtom_id: "$rtom_details.rtom_id",
        },
      },
    ]);
    console.log(rtom_names_with_status);

    return res.status(200).json({
      status: "success",
      message: "RTOM areas retrieved successfully.",
      data: rtom_names_with_status,
    });
    // } else {
    //   return res.status(404).json({
    //     status: 'error',
    //     message: 'No RTOMs found for the given ro_id.' });
    // }
  } catch (error) {
    console.error("Error retrieving RTOM areas:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
      error: error.message,
    });
  }
};

//Get active RTOM list of RO
export const List_Active_RTOM_Ownned_By_RO = async (req, res) => {
  const { ro_id } = req.body;
  if (!ro_id) {
    return res.status(400).json({
      status: "error",
      message: "ro id is required",
    });
  }
  const required_status = "Active";
  // const getActiveRtomque = `SELECT rtom.area_name FROM rtom JOIN recovery_officer_rtoms ON rtom.rtom_id = recovery_officer_rtoms.rtom_id WHERE recovery_officer_rtoms.ro_id = ? AND recovery_officer_rtoms.ro_for_rtom_status = ?;`
  try {
    // const getActiveRtom = () =>
    //   new Promise((resolve, reject) => {
    //     db.mysqlConnection.query(getActiveRtomque, [ro_id, required_status], (err, result) => {
    //       if (err) return reject(err);
    //       resolve(result);
    //     });
    //   });
    //   const result = await getActiveRtom();
    //   const actiive_area_name_in_sql =result.map(rtom => rtom.area_name);

    // if (result.length > 0 && actiive_area_name_in_sql.length > 0) {

    const active_rtom_names_list = await Recovery_officer.aggregate([
      { $match: { ro_id: ro_id } }, // Match the Recovery Officer by ro_id
      { $unwind: "$rtoms_for_ro" }, // Flatten the rtoms_for_ro array
      {
        $match: { "rtoms_for_ro.status": required_status }, // Filter by the required status
      },
      {
        $lookup: {
          from: "Rtom", // The target collection to join with
          localField: "rtoms_for_ro.name", // The local field in Recovery_officer
          foreignField: "rtom_abbreviation", // The field in Rtom to match against
          as: "rtom_details", // The field to hold the joined data
        },
      },
      { $unwind: "$rtom_details" }, // Flatten the rtom_details array
      {
        $project: {
          name: "$rtoms_for_ro.name", // Include RTOM name
          status: "$rtoms_for_ro.status", // Include RTOM status
          rtom_id: "$rtom_details.rtom_id", // Include RTOM ID from the joined data
        },
      },
    ]);
    console.log(active_rtom_names_list);
    return res.status(200).json({
      status: "success",
      message: "RTOM areas retrieved successfully.",
      data: active_rtom_names_list,
    });
    // } else {
    //   return res.status(404).json({
    //     status:"error",
    //     message: 'No RTOMs found for the given ro_id.' });
    // }
  } catch (error) {
    console.error("Error retrieving RTOM areas:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
      error: error.message,
    });
  }
};

//Add the RTOM to the RO
export const Issue_RTOM_To_RO = async (req, res) => {
  const { ro_id, rtom_id } = req.body;

  const rtoms_for_ro_status_edit_by = "Admin";

  const now = new Date();
  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear();
  const localDate = `${day}/${month}/${year}`;

  if (!ro_id || !rtom_id || !rtoms_for_ro_status_edit_by) {
    return res.status(400).json({
      status: "Error",
      message: "RO ID and RTOM ID are required",
    });
  }

  try {
    const rtomData = await Rtom.findOne(
      { rtom_id: rtom_id },
      { area_name: 1, _id: 0 }
    );

    if (!rtomData) {
      return res.status(404).json({
        status: "Error",
        message: "RTOM not found",
      });
    }

    const newRtomName = rtomData.area_name;

    const recoveryOfficer = await Recovery_officer.findOne({ ro_id: ro_id });

    if (!recoveryOfficer) {
      return res.status(404).json({
        status: "Error",
        message: "RO not found",
      });
    }

    const isDuplicate = recoveryOfficer.rtoms_for_ro.some(
      (rtom) => rtom.name === newRtomName
    );
    if (isDuplicate) {
      return res.status(400).json({
        status: "Error",
        message: "RTOM with this name already exists for this RO.",
      });
    }

    // Push the new RTOM
    const updatedRO = await Recovery_officer.findOneAndUpdate(
      { ro_id: ro_id },
      {
        $push: {
          rtoms_for_ro: {
            name: newRtomName,
            status: [
              {
                status: "Active",
                rtoms_for_ro_status_date: localDate,
                rtoms_for_ro_status_edit_by: rtoms_for_ro_status_edit_by,
              },
            ],
            rtom_id: rtom_id,
          },
        },
      },
      { new: true }
    );

    return res.status(200).json({
      status: "success",
      message: "RTOM assigned successfully",
      updatedRO,
    });
  } catch (error) {
    console.error("Error assigning RTOM to RO:", error.message);
    return res.status(500).json({
      status: "Error",
      message: "Internal server error",
    });
  }
};

// Retrieve Recovery Officers (MongoDB Only)
export const getRODetails = async (req, res) => {
  try {
    // Fetch all Recovery Officers from MongoDB
    const recoveryOfficers = await Recovery_officer.find({});

    // Check if any Recovery Officers are found
    if (recoveryOfficers.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No Recovery Officer(s) found.",
      });
    }

    // Format the results to include the necessary details
    const formattedResults = recoveryOfficers.map((ro) => ({
      ro_id: ro.ro_id,
      ro_name: ro.ro_name,
      ro_contact_no: ro.ro_contact_no,
      drc_name: ro.drc_name,
      ro_status: ro.ro_status,
      login_type: ro.login_type,
      login_user_id: ro.login_user_id,
      remark: ro.remark,
      ro_nic: ro.ro_nic,
      ro_end_date: ro.ro_end_date,
      created_by: ro.created_by,
      rtoms_for_ro: ro.rtoms_for_ro || [], // Include RTOMs if present
      createdAt: ro.createdAt,
      updatedAt: ro.updatedAt,
    }));

    // Return the formatted data
    return res.status(200).json({
      status: "success",
      message: "Recovery Officer(s) retrieved successfully.",
      data: formattedResults,
    });
  } catch (error) {
    console.error("Unexpected error:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Retrieve Recovery Officer by ID (MongoDB Only)
// export const getRODetailsByID = async (req, res) => {
//   try {
//     // Extract ro_id from the request body
//     const { ro_id } = req.body;

//     // Validate if ro_id is provided
//     if (!ro_id) {
//       return res.status(400).json({
//         status: "error",
//         message: "ro_id is required.",
//       });
//     }

//     // Fetch Recovery Officer details from MongoDB by ro_id
//     const recoveryOfficer = await Recovery_officer.findOne({ ro_id: parseInt(ro_id) });

//     // Check if a Recovery Officer is found
//     if (!recoveryOfficer) {
//       return res.status(404).json({
//         status: "error",
//         message: `No Recovery Officer found with ro_id: ${ro_id}.`,
//       });
//     }

//     // Format the response
//     const formattedResult = {
//       ro_id: recoveryOfficer.ro_id,
//       ro_name: recoveryOfficer.ro_name,
//       ro_contact_no: recoveryOfficer.ro_contact_no,
//       drc_name: recoveryOfficer.drc_name,
//       ro_status: recoveryOfficer.ro_status,
//       login_type: recoveryOfficer.login_type,
//       login_user_id: recoveryOfficer.login_user_id,
//       remark: recoveryOfficer.remark,
//       rtoms_for_ro: recoveryOfficer.rtoms_for_ro || [], // Include RTOMs if present
//       createdAt: recoveryOfficer.createdAt,
//       updatedAt: recoveryOfficer.updatedAt,
//     };

//     // Return the formatted data
//     return res.status(200).json({
//       status: "success",
//       message: "Recovery Officer retrieved successfully.",
//       data: formattedResult,
//     });
//   } catch (error) {
//     console.error("Unexpected error:", error.message);
//     return res.status(500).json({
//       status: "error",
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };


// Retrieve Recovery Officer by ID (MongoDB Only with RTOM ID lookup)
export const getRODetailsByID = async (req, res) => {
  try {
    // Extract ro_id from the request body
    const { ro_id } = req.body;

    // Validate if ro_id is provided
    if (!ro_id) {
      return res.status(400).json({
        status: "error",
        message: "ro_id is required.",
      });
    }

    // Fetch Recovery Officer details from MongoDB by ro_id
    const recoveryOfficer = await Recovery_officer.findOne({
      ro_id: parseInt(ro_id),
    });

    // Check if a Recovery Officer is found
    if (!recoveryOfficer) {
      return res.status(404).json({
        status: "error",
        message: `No Recovery Officer found with ro_id: ${ro_id}.`,
      });
    }

    // Perform lookup for RTOM IDs based on RTOM names
    const rtomsWithIDs = await Promise.all(
      recoveryOfficer.rtoms_for_ro.map(async (rtom) => {
        const rtomDetails = await Rtom.findOne({ area_name: rtom.name });

        return {
          ...rtom.toObject(), // Spread existing RTOM details from the Recovery Officer collection
          rtom_id: rtomDetails ? rtomDetails.rtom_id : null, // Add rtom_id if found, or null otherwise
        };
      })
    );

    // Format the response
    const formattedResult = {
      ro_id: recoveryOfficer.ro_id,
      ro_name: recoveryOfficer.ro_name,
      ro_contact_no: recoveryOfficer.ro_contact_no,
      drc_name: recoveryOfficer.drc_name,
      ro_status: recoveryOfficer.ro_status,
      login_type: recoveryOfficer.login_type,
      login_user_id: recoveryOfficer.login_user_id,
      remark: recoveryOfficer.remark,
      ro_nic: recoveryOfficer.ro_nic,
      ro_end_date: recoveryOfficer.ro_end_date,
      created_by: recoveryOfficer.created_by,
      rtoms_for_ro: rtomsWithIDs, // Include updated RTOMs with rtom_id
      added_date: recoveryOfficer.added_date,
      createdAt: recoveryOfficer.createdAt,
      updatedAt: recoveryOfficer.updatedAt,
    };

    // Return the formatted data
    return res.status(200).json({
      status: "success",
      message: "Recovery Officer retrieved successfully.",
      data: formattedResult,
    });
  } catch (error) {
    console.error("Unexpected error:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Retrieve Recovery Officers by DRC ID (MongoDB Only)
// export const getRODetailsByDrcID = async (req, res) => {
//   try {
//     // Extract drc_id from the request body
//     const { drc_id } = req.body;

//     // Validate if drc_id is provided
//     if (!drc_id) {
//       return res.status(400).json({
//         status: "error",
//         message: "drc_id is required.",
//       });
//     }

//     // Fetch drc_name by drc_id from MongoDB
//     const drc = await DebtRecoveryCompany.findOne({ drc_id });
//     if (!drc) {
//       return res.status(404).json({
//         status: "error",
//         message: `No Debt Recovery Company found for drc_id: ${drc_id}.`,
//       });
//     }
//     if (drc.drc_status !== "Active") {
//       return res.status(404).json({
//         status: "error",
//         message: `This Debt Recovery Company is not in Active status for this drc_id: ${drc_id}.`,
//       });
//     }
//     if (drc.drc_end_dat !== null) {
//       return res.status(404).json({
//         status: "error",
//         message: `This Debt Recovery Company has been suspended for this drc_id: ${drc_id}.`,
//       });
//     }
   

//     const drc_name = drc.drc_name;

//     // Fetch all Recovery Officers with the corresponding drc_name
//     let recoveryOfficers = [];
//     try {
//       //recoveryOfficers = await Recovery_officer.find({ drc_name });
//       recoveryOfficers = await Recovery_officer.aggregate([
//         {
//             $match: {
//                 ro_end_date: null,
//                 drc_name: drc_name
//             }
//         },
//         {
//             $project: {
//                 ro_id:1,
//                 ro_name: 1,
//                 ro_status: { $arrayElemAt: ["$ro_status", -1] }  // Get the last element of ro_status
//             }
//         },
//         {
//             $match: {
//                 "ro_status.status": "Active"  // Ensure the last element's status is 'Active'
//             }
//         }
//       ]);
//     } catch (mongoErr) {
//       console.error("Error retrieving Recovery Officers from MongoDB:", mongoErr.message);
//       return res.status(500).json({
//         status: "error",
//         message: "Error retrieving Recovery Officers.",
//         error: mongoErr.message,
//       });
//     }

//     // Check if recovery officers are found
//     if (recoveryOfficers.length === 0) {
//       return res.status(404).json({
//         status: "error",
//         message: `No Recovery Officers found for drc_name: ${drc_name}.`,
//       });
//     }

//     // Return the recovery officers data
//     return res.status(200).json({
//       status: "success",
//       message: "Recovery Officer(s) retrieved successfully.",
//       data: recoveryOfficers,
//     });
//   } catch (error) {
//     console.error("Unexpected error:", error.message);
//     return res.status(500).json({
//       status: "error",
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };


// Retrieve Recovery Officers by DRC ID (MongoDB Only)
export const getRODetailsByDrcID = async (req, res) => {
  try {
    // Extract drc_id from the request body
    const { drc_id } = req.body;

    // Validate if drc_id is provided
    if (!drc_id) {
      return res.status(400).json({
        status: "error",
        message: "drc_id is required.",
      });
    }

    // Fetch drc_name by drc_id from MongoDB
    const drc = await DebtRecoveryCompany.findOne({ drc_id });
    if (!drc) {
      return res.status(404).json({
        status: "error",
        message: `No Debt Recovery Company found for drc_id: ${drc_id}.`,
      });
    }
    if (drc.drc_status !== "Active") {
      return res.status(404).json({
        status: "error",
        message: `This Debt Recovery Company is not in Active status for this drc_id: ${drc_id}.`,
      });
    }
    if (drc.drc_end_dat !== null) {
      return res.status(404).json({
        status: "error",
        message: `This Debt Recovery Company has been suspended for this drc_id: ${drc_id}.`,
      });
    }

    const drc_name = drc.drc_name;

    // Fetch all Recovery Officers with the corresponding drc_name
    let recoveryOfficers = [];
    try {
      recoveryOfficers = await Recovery_officer.aggregate([
        {
          $match: {
            ro_end_date: null,
            drc_name: drc_name,
          },
        },
        {
          $project: {
            ro_id: 1,
            ro_name: 1,
            ro_contact_no: 1,
            drc_name: 1,
            ro_status: 1,
            login_type: 1,
            login_user_id: 1,
            remark: 1,
            ro_nic: 1,
            ro_end_date: 1,
            rtoms_for_ro: 1, // Include rtoms_for_ro directly from Recovery_officer collection
            created_by: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
        {
          $match: {
            "ro_status.status": "Active", // Ensure the last element's status is 'Active'
          },
        },
      ]);
    } catch (mongoErr) {
      console.error(
        "Error retrieving Recovery Officers from MongoDB:",
        mongoErr.message
      );
      return res.status(500).json({
        status: "error",
        message: "Error retrieving Recovery Officers.",
        error: mongoErr.message,
      });
    }

    // Check if recovery officers are found
    if (recoveryOfficers.length === 0) {
      return res.status(404).json({
        status: "error",
        message: `No Recovery Officers found for drc_name: ${drc_name}.`,
      });
    }

    // Return the recovery officers data
    return res.status(200).json({
      status: "success",
      message: "Recovery Officer(s) retrieved successfully.",
      data: recoveryOfficers,
    });
  } catch (error) {
    console.error("Unexpected error:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Retrieve Active Recovery Officers by DRC ID (MongoDB Only)
// export const getActiveRODetailsByDrcID = async (req, res) => {
//   try {
//     // Extract drc_id from the request body
//     const { drc_id } = req.body;

//     // Validate if drc_id is provided
//     if (!drc_id) {
//       return res.status(400).json({
//         status: "error",
//         message: "drc_id is required.",
//       });
//     }

//     // Fetch drc_name by drc_id from MongoDB
//     const drc = await DebtRecoveryCompany.findOne({ drc_id });
//     if (!drc) {
//       return res.status(404).json({
//         status: "error",
//         message: `No Debt Recovery Company found for drc_id: ${drc_id}.`,
//       });
//     }

//     const drc_name = drc.drc_name;

//     // Fetch all active Recovery Officers with the corresponding drc_name
//     let activeRecoveryOfficers = [];
//     try {
//       activeRecoveryOfficers = await Recovery_officer.find({ drc_name, ro_status: "Active" });
//     } catch (mongoErr) {
//       console.error("Error retrieving Active Recovery Officers from MongoDB:", mongoErr.message);
//       return res.status(500).json({
//         status: "error",
//         message: "Error retrieving Active Recovery Officers.",
//         error: mongoErr.message,
//       });
//     }

//     // Check if active recovery officers are found
//     if (activeRecoveryOfficers.length === 0) {
//       return res.status(404).json({
//         status: "error",
//         message: `No Active Recovery Officers found for drc_name: ${drc_name}.`,
//       });
//     }

//     // Return the active recovery officers data
//     return res.status(200).json({
//       status: "success",
//       message: "Active Recovery Officer(s) retrieved successfully.",
//       data: activeRecoveryOfficers,
//     });
//   } catch (error) {
//     console.error("Unexpected error:", error.message);
//     return res.status(500).json({
//       status: "error",
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };


// Purpose: Retrieve Active Recovery Officers whose last status is Active by DRC ID
// Input: drc_id (from request body)
// Collection: Recovery_officer
// Retrieve Recovery Officers whose last status is Active
export const getActiveRODetailsByDrcID = async (req, res) => {
  try {
    // Extract drc_id from the request body
    const { drc_id } = req.body;

    // Validate if drc_id is provided
    if (!drc_id) {
      return res.status(400).json({
        status: "error",
        message: "drc_id is required.",
      });
    }

    const activeRecoveryOfficers = await Recovery_officer.find({
      drc_id: drc_id,
      ro_status: "Active"
    });


    // Check if any active recovery officers were found
    if (activeRecoveryOfficers.length === 0) {
      return res.status(404).json({
        status: "error",
        message: `No Active Recovery Officers found for drc.`,
      });
    }

    // Format the response
    const formattedResults = activeRecoveryOfficers?.map((ro) => ({
      ro_id: ro.ro_id,
      ro_name: ro.ro_name,
      ro_contact_no: ro.ro_contact_no,
      // drc_name: ro.drc_name,
      ro_status: ro.ro_status,
      // ro_status_date: ro.last_status.ro_status_date,
      // ro_status_edit_by: ro.last_status.ro_status_edit_by,
      login_type: ro.login_type,
      login_user_id: ro.login_user_id,
      remark: ro.remark,
      ro_nic: ro.ro_nic,
      ro_end_date: ro.ro_end_dtm || null,
      rtoms_for_ro: ro.rtom.map((rtom) => ({
        name: rtom.rtom_name,
        status: rtom.rtom_status
      })),
      created_by: ro.ro_create_by,
      createdAt: ro.createdAt,
      updatedAt: ro.updatedAt,
    }));

    // Return the formatted data
    return res.status(200).json({
      status: "success",
      message: "Active Recovery Officer(s) retrieved successfully.",
      data: formattedResults,
    });
  } catch (error) {
    console.error("Unexpected error:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};


// Register Recovery Officer 
// export const RegisterRO = async (req, res) => {
//   const {
//     ro_name,
//     ro_contact_no,
//     drc_id, // drc_id will still come from the request
//     login_type,
//     login_user_id,
//     remark = "", // Default value
//     rtoms_for_ro,
//   } = req.body;

//   try {
//     // Step 1: Input Validation
//     if (!ro_name || !ro_contact_no || !drc_id || !rtoms_for_ro || rtoms_for_ro.length === 0) {
//       return res.status(400).json({
//         status: "error",
//         message: "All required fields must be provided, including RTOMs.",
//       });
//     }

//     // Step 2: Generate ro_id
//     const mongoConnection = await db.connectMongoDB();
//     const counterResult = await mongoConnection.collection("counters").findOneAndUpdate(
//       { _id: "ro_id" },
//       { $inc: { seq: 1 } },
//       { returnDocument: "after", upsert: true }
//     );

//     console.log("Counter Result:", counterResult);
//     const ro_id = counterResult.value?.seq || counterResult.seq;
//     if (!ro_id) {
//       throw new Error("Failed to generate ro_id.");
//     }

//     // Step 3: Fetch drc_name by drc_id
//     const drc = await DebtRecoveryCompany.findOne({ drc_id });
//     if (!drc) {
//       return res.status(404).json({
//         status: "error",
//         message: `DRC with id ${drc_id} not found.`,
//       });
//     }
//     const drc_name = drc.drc_name;

//     // Step 4: Fetch area_name for each RTOM
//     const rtoms_with_details = await Promise.all(
//       rtoms_for_ro.map(async (rtom) => {
//         const rtomDetails = await Rtom.findOne({ rtom_id: rtom.rtom_id });
//         if (!rtomDetails) {
//           return res.status(404).json({
//             status: "error",
//             message: `RTOM with id ${rtom.rtom_id} not found.`,
//           });
//         }
//         return {
//           name: rtomDetails.area_name,
//           status: "Active",
//         };
//       })
//     );

//     // Step 5: Prepare MongoDB Document
//     const roDocument = new Recovery_officer({
//       ro_id,
//       ro_name,
//       ro_contact_no,
//       ro_status: "Active",
//       drc_name, // Include drc_name only
//       login_type,
//       login_user_id,
//       remark,
//       rtoms_for_ro: rtoms_with_details,
//       updatedAt: moment().toDate(),
//     });

//     // Step 6: Save to MongoDB
//     await roDocument.save();

//     // Step 7: Save to MySQL (recovery_officer table)
//     const recoveryOfficerInsertQuery = `
//       INSERT INTO recovery_officer (
//         ro_id, ro_name, ro_contact_no, drc_id, ro_status, login_type, login_user_id, remark, end_dtm
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     await new Promise((resolve, reject) => {
//       db.mysqlConnection.query(
//         recoveryOfficerInsertQuery,
//         [
//           ro_id,
//           ro_name,
//           ro_contact_no,
//           drc_id,
//           "Active", // ro_status
//           login_type,
//           login_user_id,
//           remark,
//           null, // end_dtm
//         ],
//         (err, result) => {
//           if (err) return reject(err);
//           resolve(result);
//         }
//       );
//     });

//     // Step 8: Save RTOMs to MySQL (recovery_officer_rtoms table)
//     const rtomInsertQuery = `
//       INSERT INTO recovery_officer_rtoms (ro_id, rtom_id, ro_for_rtom_status)
//       VALUES (?, ?, ?)
//     `;

//     for (const rtom of rtoms_for_ro) { // Use rtoms_for_ro for correct rtom_id
//       await new Promise((resolve, reject) => {
//         db.mysqlConnection.query(
//           rtomInsertQuery,
//           [ro_id, rtom.rtom_id, "Active"], // Insert rtom_id instead of name
//           (err, result) => {
//             if (err) return reject(err);
//             resolve(result);
//           }
//         );
//       });
//     }

//     // Step 9: Success Response
//     return res.status(201).json({
//       status: "success",
//       message: "Recovery Officer registered successfully in MongoDB and MySQL.",
//       data: {
//         ro_id,
//         ro_name,
//         ro_contact_no,
//         drc_name,
//         rtoms_for_ro: rtoms_with_details,
//         ro_status: "Active",
//         login_type,
//         login_user_id,
//         remark,
//         updatedAt: moment().toISOString(),
//       },
//     });
//   } catch (error) {
//     console.error("Error in RegisterRO:", error.message);
//     return res.status(500).json({
//       status: "error",
//       message: "Failed to register Recovery Officer.",
//       errors: {
//         exception: error.message,
//       },
//     });
//   }
// };


// Register Recovery Officer (MongoDB Only)
// export const RegisterRO = async (req, res) => {
//   const {
//     ro_name,
//     ro_contact_no,
//     drc_id,
//     login_type,
//     login_user_id,
//     remark = "",
//     ro_nic, 
//     ro_end_date = "",
//     rtoms_for_ro,
//   } = req.body;

//   try {
//     // Step 1: Input Validation
//     if (!ro_name || !ro_contact_no || !drc_id || !ro_nic || !rtoms_for_ro || rtoms_for_ro.length === 0) {
//       return res.status(400).json({
//         status: "error",
//         message: "All required fields must be provided, including RTOMs.",
//       });
//     }

//     // Step 2: Generate ro_id
//     const mongoConnection = await db.connectMongoDB();
//     const counterResult = await mongoConnection.collection("counters").findOneAndUpdate(
//       { _id: "ro_id" },
//       { $inc: { seq: 1 } },
//       { returnDocument: "after", upsert: true }
//     );

//     console.log("Counter Result:", counterResult);
//     const ro_id = counterResult.value?.seq || counterResult.seq;
//     if (!ro_id) {
//       throw new Error("Failed to generate ro_id.");
//     }

//     // Step 3: Fetch drc_name by drc_id
//     const drc = await DebtRecoveryCompany.findOne({ drc_id });
//     if (!drc) {
//       return res.status(404).json({
//         status: "error",
//         message: `DRC with id ${drc_id} not found.`,
//       });
//     }
//     const drc_name = drc.drc_name;

//     // Step 4: Fetch area_name for each RTOM
//     const rtoms_with_details = await Promise.all(
//       rtoms_for_ro.map(async (rtom) => {
//         const rtomDetails = await Rtom.findOne({ rtom_id: rtom.rtom_id });
//         if (!rtomDetails) {
//           throw new Error(`RTOM with id ${rtom.rtom_id} not found.`);
//         }
//         return {
//           name: rtomDetails.area_name,
//           status: "Active",
//         };
//       })
//     );

//     // Step 5: Prepare MongoDB Document
//     const roDocument = new Recovery_officer({
//       ro_id,
//       ro_name,
//       ro_contact_no,
//       ro_status: "Active",
//       drc_name,
//       login_type,
//       login_user_id,
//       remark,
//       ro_nic,
//       ro_end_date,
//       rtoms_for_ro: rtoms_with_details,
//       updatedAt: moment().toDate(),
//     });

//     // Step 6: Save to MongoDB
//     await roDocument.save();

//     // Step 7: Success Response
//     return res.status(201).json({
//       status: "success",
//       message: "Recovery Officer registered successfully in MongoDB.",
//       data: {
//         ro_id,
//         ro_name,
//         ro_contact_no,
//         drc_name,
//         rtoms_for_ro: rtoms_with_details,
//         ro_status: "Active",
//         login_type,
//         login_user_id,
//         remark,
//         ro_nic,
//         ro_end_date,
//         updatedAt: moment().toISOString(),
//       },
//     });
//   } catch (error) {
//     console.error("Error in RegisterRO:", error.message);
//     return res.status(500).json({
//       status: "error",
//       message: "Failed to register Recovery Officer.",
//       errors: {
//         exception: error.message,
//       },
//     });
//   }
// };


// Register Recovery Officer (MongoDB Only with Validations)
// export const RegisterRO = async (req, res) => {
//   const {
//     ro_name,
//     ro_contact_no,
//     drc_id,
//     login_type,
//     login_user_id,
//     remark = "",
//     ro_nic,
//     ro_end_date = "",
//     rtoms_for_ro,
//     created_by,
//     createdAt, // Expect createdAt from request
//   } = req.body;

//   try {
//     // Step 1: Input Validation
//     if (!ro_name || !ro_contact_no || !drc_id || !ro_nic || !rtoms_for_ro || rtoms_for_ro.length === 0) {
//       return res.status(400).json({
//         status: "error",
//         message: "All required fields must be provided, including RTOMs.",
//       });
//     }

//     // Step 2: Parse and Validate `createdAt`
//     let formattedCreatedAt;
//     if (createdAt) {
//       // Convert `DD/MM/YYYY` to valid Date
//       const parts = createdAt.split("/");
//       if (parts.length === 3) {
//         const [day, month, year] = parts.map(Number);
//         formattedCreatedAt = new Date(year, month - 1, day); // JS months are 0-indexed
//       }
//       if (isNaN(formattedCreatedAt)) {
//         throw new Error("Invalid createdAt format. Use DD/MM/YYYY.");
//       }
//     } else {
//       // Default to current date
//       formattedCreatedAt = new Date();
//     }

//     // Step 3: Generate ro_id
//     const mongoConnection = await db.connectMongoDB();
//     const counterResult = await mongoConnection.collection("counters").findOneAndUpdate(
//       { _id: "ro_id" },
//       { $inc: { seq: 1 } },
//       { returnDocument: "after", upsert: true }
//     );

//     console.log("Counter Result:", counterResult);
//     const ro_id = counterResult.value?.seq || counterResult.seq;
//     if (!ro_id) {
//       throw new Error("Failed to generate ro_id.");
//     }

//     // Step 4: Fetch drc_name by drc_id
//     const drc = await DebtRecoveryCompany.findOne({ drc_id });
//     if (!drc) {
//       return res.status(404).json({
//         status: "error",
//         message: `DRC with id ${drc_id} not found.`,
//       });
//     }
//     const drc_name = drc.drc_name;

//     // Step 5: Fetch RTOM details for each RTOM
//     const rtoms_with_details = await Promise.all(
//       rtoms_for_ro.map(async (rtom) => {
//         const rtomDetails = await Rtom.findOne({ rtom_id: rtom.rtom_id });
//         if (!rtomDetails) {
//           throw new Error(`RTOM with id ${rtom.rtom_id} not found.`);
//         }
//         return {
//           name: rtomDetails.area_name,
//           status: [
//             {
//               status: "Active",
//               rtoms_for_ro_status_date: moment().format("DD/MM/YYYY"),
//               rtoms_for_ro_status_edit_by: created_by,
//             },
//           ],
//         };
//       })
//     );

//     // Step 6: Prepare ro_status array
//     const ro_status = [
//       {
//         status: "Active",
//         ro_status_date: moment().format("DD/MM/YYYY"),
//         ro_status_edit_by: created_by,
//       },
//     ];

//     // Step 7: Prepare remark array
//     const remark_array = remark
//       ? [
//           {
//             text: remark,
//             remark_date: moment().format("DD/MM/YYYY"),
//             remark_edit_by: created_by,
//           },
//         ]
//       : [];

//     // Step 8: Prepare MongoDB Document
//     const roDocument = new Recovery_officer({
//       ro_id,
//       ro_name,
//       ro_contact_no,
//       ro_status,
//       drc_name,
//       rtoms_for_ro: rtoms_with_details,
//       login_type,
//       login_user_id,
//       remark: remark_array,
//       ro_nic,
//       ro_end_date: ro_end_date || null,
//       created_by,
//       createdAt: formattedCreatedAt,
//       updatedAt: moment().toDate(),
//     });

//     // Step 9: Save to MongoDB
//     await roDocument.save();

//     // Step 10: Success Response
//     return res.status(201).json({
//       status: "success",
//       message: "Recovery Officer registered successfully in MongoDB.",
//       data: {
//         ro_id,
//         ro_name,
//         ro_contact_no,
//         drc_name,
//         rtoms_for_ro: rtoms_with_details,
//         ro_status,
//         login_type,
//         login_user_id,
//         remark: remark_array,
//         ro_nic,
//         ro_end_date,
//         created_by,
//         createdAt: moment(formattedCreatedAt).format("DD/MM/YYYY"),
//         updatedAt: moment().toISOString(),
//       },
//     });
//   } catch (error) {
//     console.error("Error in RegisterRO:", error.message);
//     return res.status(500).json({
//       status: "error",
//       message: "Failed to register Recovery Officer.",
//       errors: {
//         exception: error.message,
//       },
//     });
//   }
// };


// Register Recovery Officer (MongoDB Only)
// export const RegisterRO = async (req, res) => {
//   const {
//     ro_name,
//     ro_contact_no,
//     drc_id,
//     login_type,
//     login_user_id,
//     ro_nic,
//     rtoms_for_ro,
//     created_by,
//     createdAt,
//   } = req.body;

//   try {
//     // Step 1: Input Validation
//     if (!ro_name || !ro_contact_no || !drc_id || !ro_nic || !rtoms_for_ro || rtoms_for_ro.length === 0) {
//       return res.status(400).json({
//         status: "error",
//         message: "All required fields must be provided, including RTOMs.",
//       });
//     }

//     // Step 2: Parse and Validate `createdAt`
//     const formattedCreatedAt = createdAt
//       ? moment(createdAt, "DD/MM/YYYY").isValid()
//         ? moment(createdAt, "DD/MM/YYYY").toDate()
//         : (() => {
//             throw new Error("Invalid createdAt format. Use DD/MM/YYYY.");
//           })()
//       : new Date();

//     // Step 3: Generate ro_id
//     const mongoConnection = await db.connectMongoDB();
//     const counterResult = await mongoConnection.collection("counters").findOneAndUpdate(
//       { _id: "ro_id" },
//       { $inc: { seq: 1 } },
//       { returnDocument: "after", upsert: true }
//     );

//     const ro_id = counterResult.value?.seq || counterResult.seq;
//     if (!ro_id) {
//       throw new Error("Failed to generate ro_id.");
//     }

//     // Step 4: Fetch drc_name by drc_id
//     const drc = await DebtRecoveryCompany.findOne({ drc_id });
//     if (!drc) {
//       return res.status(404).json({
//         status: "error",
//         message: `DRC with id ${drc_id} not found.`,
//       });
//     }
//     const drc_name = drc.drc_name;

//     // Step 5: Fetch RTOM details for each RTOM
//     const rtoms_with_details = await Promise.all(
//       rtoms_for_ro.map(async (rtom) => {
//         const rtomDetails = await Rtom.findOne({ rtom_id: rtom.rtom_id });
//         if (!rtomDetails) {
//           throw new Error(`RTOM with id ${rtom.rtom_id} not found.`);
//         }
//         return {
//           name: rtomDetails.area_name,
//           status: [
//             {
//               status: "Active",
//               rtoms_for_ro_status_date: moment().format("DD/MM/YYYY"),
//               rtoms_for_ro_status_edit_by: created_by,
//             },
//           ],
//         };
//       })
//     );

//     // Step 6: Prepare ro_status array
//     const ro_status = [
//       {
//         status: "Active",
//         ro_status_date: moment().format("DD/MM/YYYY"),
//         ro_status_edit_by: created_by,
//       },
//     ];

//     // Step 7: Prepare MongoDB Document
//     const roDocument = new Recovery_officer({
//       ro_id,
//       ro_name,
//       ro_contact_no,
//       ro_status,
//       drc_name,
//       rtoms_for_ro: rtoms_with_details,
//       login_type,
//       login_user_id,
//       remark: [], // No initial remark
//       ro_nic,
//       ro_end_date: null, // No end date initially
//       created_by,
//       createdAt: formattedCreatedAt,
//       updatedAt: moment().toDate(),
//     });

//     // Step 8: Save to MongoDB
//     await roDocument.save();

//     // Step 9: Success Response
//     return res.status(201).json({
//       status: "success",
//       message: "Recovery Officer registered successfully in MongoDB.",
//       data: roDocument,
//     });
//   } catch (error) {
//     console.error("Error in RegisterRO:", error.message);
//     return res.status(500).json({
//       status: "error",
//       message: "Failed to register Recovery Officer.",
//       errors: {
//         exception: error.message,
//       },
//     });
//   }
// };


// Working one

// export const RegisterRO = async (req, res) => {
//   const {
//     ro_name,
//     ro_contact_no,
//     drc_id,
//     login_type,
//     login_user_id,
//     ro_nic,
//     rtoms_for_ro,
//     created_by,
//     createdAt,
//   } = req.body;

//   try {
//     // Step 1: Input Validation
//     if (!ro_name || !ro_contact_no || !drc_id || !ro_nic || !rtoms_for_ro || rtoms_for_ro.length === 0) {
//       return res.status(400).json({
//         status: "error",
//         message: "All required fields must be provided, including RTOMs.",
//       });
//     }

//     // Step 2: Parse and Validate `createdAt`
//     const formattedCreatedAt = createdAt
//       ? moment(createdAt, "DD/MM/YYYY").isValid()
//         ? moment(createdAt, "DD/MM/YYYY").format("DD/MM/YYYY")
//         : (() => {
//             throw new Error("Invalid createdAt format. Use DD/MM/YYYY.");
//           })()
//       : moment().format("DD/MM/YYYY");

//     // Step 3: Generate ro_id
//     const mongoConnection = await db.connectMongoDB();
//     const counterResult = await mongoConnection.collection("counters").findOneAndUpdate(
//       { _id: "ro_id" },
//       { $inc: { seq: 1 } },
//       { returnDocument: "after", upsert: true }
//     );

//     const ro_id = counterResult.value?.seq || counterResult.seq;
//     if (!ro_id) {
//       throw new Error("Failed to generate ro_id.");
//     }

//     // Step 4: Fetch drc_name by drc_id
//     const drc = await DebtRecoveryCompany.findOne({ drc_id });
//     if (!drc) {
//       return res.status(404).json({
//         status: "error",
//         message: `DRC with id ${drc_id} not found.`,
//       });
//     }
//     const drc_name = drc.drc_name;

//     // Step 5: Fetch RTOM details for each RTOM
//     const rtoms_with_details = await Promise.all(
//       rtoms_for_ro.map(async (rtom) => {
//         const rtomDetails = await Rtom.findOne({ rtom_id: rtom.rtom_id });
//         if (!rtomDetails) {
//           throw new Error(`RTOM with id ${rtom.rtom_id} not found.`);
//         }
//         return {
//           name: rtomDetails.area_name,
//           status: [
//             {
//               status: "Active",
//               rtoms_for_ro_status_date: moment().format("DD/MM/YYYY"),
//               rtoms_for_ro_status_edit_by: created_by,
//             },
//           ],
//           rtom_id: rtom.rtom_id, // Include rtom_id for reference
//         };
//       })
//     );

//     // Step 6: Prepare ro_status array
//     const ro_status = [
//       {
//         status: "Active",
//         ro_status_date: moment().format("DD/MM/YYYY"),
//         ro_status_edit_by: created_by,
//       },
//     ];

//     // Step 7: Prepare MongoDB Document
//     const roDocument = new Recovery_officer({
//       ro_id,
//       ro_name,
//       ro_contact_no,
//       ro_status,
//       drc_name,
//       rtoms_for_ro: rtoms_with_details,
//       login_type,
//       login_user_id,
//       remark: [], // No initial remark
//       ro_nic,
//       ro_end_date: null, // No end date initially
//       created_by,
//       createdAt: formattedCreatedAt,
//       updatedAt: moment().toISOString(), // Keep the updatedAt as ISO format for tracking updates
//     });

//     // Step 8: Save to MongoDB
//     await roDocument.save();

//     // Step 9: Success Response
//     return res.status(201).json({
//       status: "success",
//       message: "Recovery Officer registered successfully in MongoDB.",
//       data: {
//         ro_id,
//         ro_name,
//         ro_contact_no,
//         drc_name,
//         ro_status,
//         rtoms_for_ro: rtoms_with_details,
//         login_type,
//         login_user_id,
//         ro_nic,
//         ro_end_date: null,
//         created_by,
//         createdAt: formattedCreatedAt,
//         updatedAt: moment().toISOString(),
//       },
//     });
//   } catch (error) {
//     console.error("Error in RegisterRO:", error.message);
//     return res.status(500).json({
//       status: "error",
//       message: "Failed to register Recovery Officer.",
//       errors: {
//         exception: error.message,
//       },
//     });
//   }
// };

// Update with cretedAt

// export const RegisterRO = async (req, res) => {
//   const {
//     ro_name,
//     ro_contact_no,
//     drc_id,
//     login_type,
//     login_user_id,
//     ro_nic,
//     rtoms_for_ro,
//     created_by,
//     createdAt,
//   } = req.body;

//   try {
//     // Step 1: Input Validation
//     if (!ro_name || !ro_contact_no || !drc_id || !ro_nic || !rtoms_for_ro || rtoms_for_ro.length === 0) {
//       return res.status(400).json({
//         status: "error",
//         message: "All required fields must be provided, including RTOMs.",
//       });
//     }

//     // Step 2: Parse and Validate `createdAt`
//     const formattedCreatedAt = createdAt
//       ? moment(createdAt, "DD/MM/YYYY").isValid()
//         ? moment(createdAt, "DD/MM/YYYY").toDate()
//         : (() => {
//             throw new Error("Invalid createdAt format. Use DD/MM/YYYY.");
//           })()
//       : new Date(); // Default to current date

//     // Step 3: Generate ro_id
//     const mongoConnection = await db.connectMongoDB();
//     const counterResult = await mongoConnection.collection("counters").findOneAndUpdate(
//       { _id: "ro_id" },
//       { $inc: { seq: 1 } },
//       { returnDocument: "after", upsert: true }
//     );

//     const ro_id = counterResult.value?.seq || counterResult.seq;
//     if (!ro_id) {
//       throw new Error("Failed to generate ro_id.");
//     }

//     // Step 4: Fetch drc_name by drc_id
//     const drc = await DebtRecoveryCompany.findOne({ drc_id });
//     if (!drc) {
//       return res.status(404).json({
//         status: "error",
//         message: `DRC with id ${drc_id} not found.`,
//       });
//     }
//     const drc_name = drc.drc_name;

//     // Step 5: Fetch RTOM details for each RTOM
//     const rtoms_with_details = await Promise.all(
//       rtoms_for_ro.map(async (rtom) => {
//         const rtomDetails = await Rtom.findOne({ rtom_id: rtom.rtom_id });
//         if (!rtomDetails) {
//           throw new Error(`RTOM with id ${rtom.rtom_id} not found.`);
//         }
//         return {
//           name: rtomDetails.area_name,
//           status: [
//             {
//               status: "Active",
//               rtoms_for_ro_status_date: new Date(), // Save current date as a Date object
//               rtoms_for_ro_status_edit_by: created_by,
//             },
//           ],
//           rtom_id: rtom.rtom_id, // Include rtom_id for reference
//         };
//       })
//     );

//     // Step 6: Prepare ro_status array
//     const ro_status = [
//       {
//         status: "Active",
//         ro_status_date: new Date(), // Save current date as a Date object
//         ro_status_edit_by: created_by,
//       },
//     ];

//     // Step 7: Prepare MongoDB Document
//     const roDocument = new Recovery_officer({
//       ro_id,
//       ro_name,
//       ro_contact_no,
//       ro_status,
//       drc_name,
//       rtoms_for_ro: rtoms_with_details,
//       login_type,
//       login_user_id,
//       remark: [], // No initial remark
//       ro_nic,
//       ro_end_date: null, // No end date initially
//       created_by,
//       createdAt: formattedCreatedAt, // Save as Date object
//       updatedAt: new Date(), // Save current date as a Date object
//     });

//     // Step 8: Save to MongoDB
//     await roDocument.save();

//     // Step 9: Success Response
//     return res.status(201).json({
//       status: "success",
//       message: "Recovery Officer registered successfully in MongoDB.",
//       data: {
//         ro_id,
//         ro_name,
//         ro_contact_no,
//         drc_name,
//         ro_status,
//         rtoms_for_ro: rtoms_with_details,
//         login_type,
//         login_user_id,
//         ro_nic,
//         ro_end_date: null,
//         created_by,
//         createdAt: formattedCreatedAt,
//         updatedAt: new Date(),
//       },
//     });
//   } catch (error) {
//     console.error("Error in RegisterRO:", error.message);
//     return res.status(500).json({
//       status: "error",
//       message: "Failed to register Recovery Officer.",
//       errors: {
//         exception: error.message,
//       },
//     });
//   }
// };


// working code without CreatedAt form request.
export const RegisterRO = async (req, res) => {
  const {
    ro_name,
    ro_contact_no,
    drc_id,
    login_type,
    login_user_id,
    ro_nic,
    rtoms_for_ro,
    created_by,
  } = req.body;

  try {
    // Step 1: Input Validation
    if (
      !ro_name ||
      !ro_contact_no ||
      !drc_id ||
      !ro_nic ||
      !rtoms_for_ro ||
      rtoms_for_ro.length === 0
    ) {
      return res.status(400).json({
        status: "error",
        message: "All required fields must be provided, including RTOMs.",
      });
    }

    // Step 2: Generate ro_id
    const mongoConnection = await db.connectMongoDB();
    const counterResult = await mongoConnection
      .collection("counters")
      .findOneAndUpdate(
        { _id: "ro_id" },
        { $inc: { seq: 1 } },
        { returnDocument: "after", upsert: true }
      );

    const ro_id = counterResult.value?.seq || counterResult.seq;
    if (!ro_id) {
      throw new Error("Failed to generate ro_id.");
    }

    // Step 3: Fetch drc_name by drc_id
    const drc = await DebtRecoveryCompany.findOne({ drc_id });
    if (!drc) {
      return res.status(404).json({
        status: "error",
        message: `DRC with id ${drc_id} not found.`,
      });
    }
    const drc_name = drc.drc_name;

    // Step 4: Fetch RTOM details for each RTOM
    const rtoms_with_details = await Promise.all(
      rtoms_for_ro.map(async (rtom) => {
        const rtomDetails = await Rtom.findOne({ rtom_id: rtom.rtom_id });
        if (!rtomDetails) {
          throw new Error(`RTOM with id ${rtom.rtom_id} not found.`);
        }
        return {
          name: rtomDetails.area_name,
          status: [
            {
              status: "Active",
              rtoms_for_ro_status_date: new Date(), // Save current date as a Date object
              rtoms_for_ro_status_edit_by: created_by,
            },
          ],
          rtom_id: rtom.rtom_id, // Include rtom_id for reference
        };
      })
    );

    // Step 5: Prepare ro_status array
    const ro_status = [
      {
        status: "Active",
        ro_status_date: new Date(), // Save current date as a Date object
        ro_status_edit_by: created_by,
      },
    ];

    // Step 6: Prepare MongoDB Document
    const roDocument = new Recovery_officer({
      ro_id,
      ro_name,
      ro_contact_no,
      ro_status,
      drc_name,
      rtoms_for_ro: rtoms_with_details,
      login_type,
      login_user_id,
      remark: [], // No initial remark
      ro_nic,
      ro_end_date: null, // No end date initially
      created_by,
      createdAt: new Date(), // Save current date as a Date object
      updatedAt: new Date(), // Save current date as a Date object
    });

    // Step 7: Save to MongoDB
    await roDocument.save();

    // Step 8: Success Response
    return res.status(201).json({
      status: "success",
      message: "Recovery Officer registered successfully in MongoDB.",
      data: {
        ro_id,
        ro_name,
        ro_contact_no,
        drc_name,
        ro_status,
        rtoms_for_ro: rtoms_with_details,
        login_type,
        login_user_id,
        ro_nic,
        ro_end_date: null,
        created_by,
        createdAt: new Date(), // Current date as a Date object
        updatedAt: new Date(), // Current date as a Date object
      },
    });
  } catch (error) {
    console.error("Error in RegisterRO:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to register Recovery Officer.",
      errors: {
        exception: error.message,
      },
    });
  }
};

export const EditRO = async (req, res) => {
  const {
    ro_id,
    ro_contact_no,
    remark,
    ro_end_date,
    remark_edit_by,
    rtoms_for_ro,
    login_type,
    login_user_id,
    ro_status,
  } = req.body;

  try {
    // Step 1: Input Validation
    if (!ro_id) {
      return res.status(400).json({
        status: "error",
        message: "Recovery Officer ID (ro_id) is required in the body.",
      });
    }

    // Step 2: Find the Recovery Officer
    const existingRO = await Recovery_officer.findOne({ ro_id: Number(ro_id) });
    if (!existingRO) {
      return res.status(404).json({
        status: "error",
        message: `Recovery Officer with ID ${ro_id} not found.`,
      });
    }

    // Step 3: Prepare Update Fields
    const updateFields = {
      ...(ro_contact_no && { ro_contact_no }),
      ...(ro_end_date && { ro_end_date: new Date(ro_end_date) }),
      ...(login_type && { login_type }),
      ...(login_user_id && { login_user_id }),
      updatedAt: new Date(),
    };

    // Step 4: Add a New Remark (if provided)
    if (remark) {
      const newRemark = {
        remark,
        remark_date: new Date(),
        remark_edit_by: remark_edit_by || "System",
      };
      await Recovery_officer.updateOne(
        { ro_id: Number(ro_id) },
        { $push: { remark: newRemark } }
      );
    }

    // Step 5: Update or Append RTOMs
    if (rtoms_for_ro && rtoms_for_ro.length > 0) {
      // Fetch all RTOM details from the database
      const rtomIds = rtoms_for_ro.map((rtom) => rtom.rtom_id);
      const rtomDetailsList = await Rtom.find({ rtom_id: { $in: rtomIds } });

      if (rtomDetailsList.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "No matching RTOMs found in the database.",
        });
      }

      const updatedRTOMs = [...existingRO.rtoms_for_ro]; // Clone the current RTOMs array

      for (const rtom of rtoms_for_ro) {
        const { rtom_id, status } = rtom;

        // Find the RTOM details from the fetched list
        const rtomDetails = rtomDetailsList.find(
          (rtomDetail) => rtomDetail.rtom_id === rtom_id
        );

        if (!rtomDetails) {
          return res.status(404).json({
            status: "error",
            message: `RTOM with ID ${rtom_id} not found.`,
          });
        }

        // Match RTOM by area_name
        const existingRTOM = updatedRTOMs.find(
          (existingRtom) => existingRtom.name === rtomDetails.area_name
        );

        if (existingRTOM) {
          // Add the new status to the existing RTOM's status array
          existingRTOM.status.push({
            status: status || "Active",
            rtoms_for_ro_status_date: new Date(),
            rtoms_for_ro_status_edit_by: remark_edit_by || "System",
          });
        } else {
          // Add a new RTOM entry with the new status
          updatedRTOMs.push({
            name: rtomDetails.area_name,
            rtom_id,
            status: [
              {
                status: status || "Active",
                rtoms_for_ro_status_date: new Date(),
                rtoms_for_ro_status_edit_by: remark_edit_by || "System",
              },
            ],
          });
        }
      }

      // Update RTOMs in the database
      await Recovery_officer.updateOne(
        { ro_id: Number(ro_id) },
        { $set: { rtoms_for_ro: updatedRTOMs } }
      );
    }

    // Step 6: Add New Status to ro_status
    if (ro_status) {
      const newROStatus = {
        status: ro_status.status || "Active",
        ro_status_date: new Date(),
        ro_status_edit_by: remark_edit_by || "System",
      };

      await Recovery_officer.updateOne(
        { ro_id: Number(ro_id) },
        { $push: { ro_status: newROStatus } }
      );
    }

    // Step 7: Update Other Fields
    const updatedRO = await Recovery_officer.findOneAndUpdate(
      { ro_id: Number(ro_id) },
      { $set: updateFields },
      { new: true }
    );

    // Step 8: Success Response
    return res.status(200).json({
      status: "success",
      message: "Recovery Officer updated successfully.",
      data: updatedRO,
    });
  } catch (error) {
    console.error("Error in EditRO:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to update Recovery Officer.",
      errors: {
        exception: error.message,
      },
    });
  }
};

export const listDRCAllCases = async (req, res) => {
  try {
    const { drc_id, ro_id, From_DAT, TO_DAT, case_current_status } = req.body; // Correct extraction from body

    // Validate required parameters
    if (!drc_id || !ro_id || !From_DAT || !TO_DAT) {
      return res.status(400).json({
        status: "error",
        message: "DRC, From_DAT, and TO_DAT are required.",
      });
    }

    // Define the query with the required filters
    let query = {
      drc_id, // Corrected field name
      assigned_date: { $gte: new Date(From_DAT), $lte: new Date(TO_DAT) },
    };

    if (case_current_status) {
      query.case_status = case_current_status;
    }

    // Fetch cases from the database
    const cases = await CaseDetails.find(query);

    return res.status(200).json({
      status: "success",
      message: "Cases retrieved successfully.",
      data: cases,
    });
  } catch (error) {
    console.error("Error fetching cases:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve cases.",
      errors: error.message,
    });
  }
};

export const listROAllCases = async (req, res) => {
  try {
    const { status, pages, drc_id } = req.body;

    // Validate required field
    if (!drc_id) {
      return res.status(400).json({
        status: "error",
        message: "Missing required field: drc_id",
        errors: {
          code: 400,
          description: "drc_id is required to filter recovery officers.",
        },
      });
    }

    let page = Number(pages);
    if (isNaN(page) || page < 1) page = 1;

    const limit = page === 1 ? 10 : 30;
    const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

    // Build query with optional status and required drc_id
    const query = {
      drc_id,
      ...(status && { ro_status: status })
    };

    const recoveryOfficers = await Recovery_officer.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ ro_id: -1 });

    const roDetails = recoveryOfficers.map(ro => {
      const rtomArray = ro.rtoms_for_ro || [];
      const activeRtomCount = rtomArray.filter(r => {
        const lastStatus = Array.isArray(r.status) ? r.status.at(-1) : null;
        return lastStatus?.status === "Active";
      }).length;

      return {
        ro_id: ro.ro_id,
        ro_name: ro.ro_name,
        ro_contact_no: ro.ro_login_contact_no,
        ro_nic: ro.ro_nic,
        status: ro.ro_status,
        drc_id: ro.drc_id,
        rtom_counts: {
          active: activeRtomCount,
          total: rtomArray.length
        },
        created_at: ro.createdAt
      };
    });

    const totalRecords = await Recovery_officer.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / (page === 1 ? 10 : 30));

    return res.status(200).json({
      status: "success",
      message: "Recovery officers fetched successfully",
      data: {
        roDetails,
        pagination: {
          currentPage: page,
          totalPages,
          totalRecords
        }
      }
    });
  } catch (error) {
    console.error("Error in listROAllCases:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch recovery officers",
      error: error.message
    });
  }
};

// Get RO list of RO
export const List_RO_Info_Own_By_RO_Id = async (req, res) => {
  const {ro_id} = req.body;
  if (!ro_id) {
      return res.status(400).json({ 
        status: 'error',
        message: 'ro_id is required.' });
  }

  try {

      const rtom_names_with_status = await Recovery_officer.aggregate([
        { $match: { ro_id: ro_id } },
        { $unwind: "$rtoms_for_ro" },
        {
          $lookup: {
            from: "Rtom",
            localField: "rtoms_for_ro.name",
            foreignField: "rtom_abbreviation", 
            as: "rtom_details", 
          },
        },
        { $unwind: "$rtom_details" },
        {
          $project: {
            name: "$rtoms_for_ro.name",
            status: "$rtoms_for_ro.status",
            rtom_id: "$rtom_details.rtom_id",
          },
        },
      ]);
      console.log(rtom_names_with_status);

      return res.status(200).json({
        status: 'success',
        message: 'RTOM areas retrieved successfully.',
        data: rtom_names_with_status,
      });
   
  }catch (error){ 
    console.error('Error retrieving RTOM areas:', error);
    return res.status(500).json({ 
      status: 'error',
      message: 'Internal server error.', error: error.message });
  }
}

/**
 * Fetches detailed Recovery Officer or DRC User information, including DRC and RTOM data, 
 * based on a unique identifier (`ro_id` or `drcUser_id`).
 *
 * Request Body:
 * - ro_id: number (optional) – The ID of the Recovery Officer. Cannot be sent with `drcUser_id`.
 * - drcUser_id: number (optional) – The ID of the DRC User. Cannot be sent with `ro_id`.
 *
 * Logic:
 * 1. Validates the presence of either `ro_id` or `drcUser_id`, but not both. Returns 400 if validation fails.
 * 2. Constructs a MongoDB aggregation pipeline:
 *    - $match: Filters documents based on the provided ID.
 *    - $lookup: Joins with `Debt_recovery_company` collection using `drc_id` to get DRC information.
 *    - $project: Selects and formats relevant fields, including:
 *        - Basic contact info (name, NIC, phone, email)
 *        - Active status of the user
 *        - Associated DRC name
 *        - RTOM area info with status (only for Recovery Officer)
 *        - Change log history with remarks
 * 3. If no matching document is found, responds with 404.
 * 4. If successful, responds with 200 and the formatted data.
 *
 * Responses:
 * - 200: Recovery Officer or DRC User data retrieved successfully.
 * - 400: Validation error – either no ID or both IDs provided.
 * - 404: No matching Recovery Officer or DRC User found.
 * - 500: Internal server error during aggregation.
 */

export const listROInfoByROId = async (req, res) => {
    try {
        const { ro_id, drcUser_id } = req.body;

        // Validate that at least one ID is provided
        if (!ro_id && !drcUser_id) {
            return res.status(400).json({ 
                status: "error",
                message: 'Either ro_id or drcUser_id is required in the request body' 
            });
        }

        // Validate that both IDs are not provided at the same time
        if (ro_id && drcUser_id) {
            return res.status(400).json({ 
                status: "error",
                message: 'Please provide either ro_id or drcUser_id, not both' 
            });
        }

        // Build match condition based on provided ID
        let matchCondition = {};
        let projectStage = {};

        if (ro_id) {
            matchCondition = { ro_id: Number(ro_id) };
            projectStage = {
                $project: {
                    added_date: { $dateToString: { format: "%m-%d-%Y", date: "$create_dtm" } },
                    recovery_officer_name: "$ro_name",
                    nic: "$nic",
                    contact_no: "$login_contact_no",
                    email: "$login_email",
                    drcUser_status: { $eq: ["$drcUser_status", "Active"] },
                    drc_id: "$drc_id",
                    drc_name: { 
                        $ifNull: [
                            { $arrayElemAt: ["$drc_info.drc_name", 0] }, 
                            null
                        ] 
                    },
                    rtom_areas: {
                        $map: {
                            input: "$rtom",
                            as: "rtom",
                            in: {
                                name: "$$rtom.rtom_name",
                                status: { $eq: ["$$rtom.rtom_status", "Active"] }
                            }
                        }
                    },
                    log_history: {
                        $map: {
                            input: "$remark",
                            as: "rem",
                            in: {
                                edited_on: { $dateToString: { format: "%m-%d-%Y", date: "$$rem.remark_dtm" } },
                                action: "$$rem.remark",
                                edited_by: "$$rem.remark_by"
                            }
                        }
                    }
                }
            };
        } else if (drcUser_id) {
            matchCondition = { drcUser_id: Number(drcUser_id) };
            projectStage = {
                $project: {
                    added_date: { $dateToString: { format: "%m-%d-%Y", date: "$create_dtm" } },
                    drcUser_name: "$ro_name",
                    nic: "$nic",
                    contact_no: "$login_contact_no",
                    email: "$login_email",
                    drcUser_status: { $eq: ["$drcUser_status", "Active"] },
                    drc_id: "$drc_id",
                    drc_name: { 
                        $ifNull: [
                            { $arrayElemAt: ["$drc_info.drc_name", 0] }, 
                            null
                        ] 
                    },
                    log_history: {
                        $map: {
                            input: "$remark",
                            as: "rem",
                            in: {
                                edited_on: { $dateToString: { format: "%m-%d-%Y", date: "$$rem.remark_dtm" } },
                                action: "$$rem.remark",
                                edited_by: "$$rem.remark_by"
                            }
                        }
                    }
                }
            };
        }

        const pipeline = [
            { $match: matchCondition },
            {
                $lookup: {
                    from: "Debt_recovery_company", // Adjust collection name if needed
                    localField: "drc_id",
                    foreignField: "drc_id",
                    as: "drc_info"
                }
            },
            projectStage
        ];

        const result = await Recovery_officer.aggregate(pipeline);

        if (!result || result.length === 0) {
            return res.status(404).json({ 
                status: "error",
                message: ro_id ? 'Recovery Officer not found' : 'DRC User not found' 
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Data retrieved successfully",
            data: result[0]
        });

    } catch (error) {
        console.error('Error fetching recovery officer/drcUser info:', error);
        return res.status(500).json({ 
            status: "error",
            message: 'Internal server error',
            error: error.message || error.toString()
        });
    }
};


// Create Recovery Officer
export const CreateRO = async (req, res) => {
  const { drc_id, ro_name, ro_login_email, ro_login_contact_no, ro_nic, ro_create_by, rtoms_for_ro } = req.body;

  try {
    // Validate required fields
    if (!drc_id || !ro_name || !ro_login_contact_no || !ro_nic || !ro_create_by) {
      return res.status(400).json({
        status: "error",
        message: "Failed to add Recovery Officer due to missing fields.",
        errors: { field_name: "All fields are required" },
      });
    }

    // Establish MongoDB connection
    const mongoConnection = await db.connectMongoDB();
    if (!mongoConnection) {
      throw new Error("MongoDB connection failed.");
    }

    // Generate unique ro_id
    const counterResult = await mongoConnection
      .collection("counters")
      .findOneAndUpdate(
        { _id: "ro_id" },
        { $inc: { seq: 1 } },
        { returnDocument: "after", upsert: true }
      );

    if (
      !counterResult ||
      !counterResult.seq ||
      typeof counterResult.seq === "undefined"
    ) {
      throw new Error("Failed to generate ro_id.");
    }

    const ro_id = counterResult.seq;

    const rtoms = Array.isArray(rtoms_for_ro)
  ? rtoms_for_ro.map((rtom) => {
      if (!rtom.rtom_id || !rtom.rtom_name || !rtom.rtom_status) {
        throw new Error("Invalid RTOM structure in rtoms_for_ro.");
      }
      return {
        rtom_id: rtom.rtom_id,
        rtom_name: rtom.rtom_name,
        rtom_status: rtom.rtom_status,
        rtom_create_dtm: rtom.rtom_create_dtm,
        rtom_create_by: rtom.rtom_create_by,
        rtom_end_dtm: rtom.rtom_end_dtm || null,
      };
    })
  : [];



    // Create a new Recovery Officer document
    const newRO = new Recovery_officer({
      drc_id,
      ro_id,
      ro_name,
      ro_login_email,
      ro_login_contact_no,
      ro_nic,
      ro_status: "Active",
      ro_create_by,
      ro_create_dtm: new Date(),
      rtom:rtoms,
    });

    // Save the new Recovery Officer to the database
    await newRO.save();

    // Return success response
    res.status(201).json({
      status: "success",
      message: "Recovery Officer added successfully.",
      
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to add Recovery Officer.",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }
};

// RO LIST
export const List_RO_Details_Owen_By_DRC_ID = async (req, res) => {
    try {
        const { drc_id } = req.body;

        if (!drc_id) {
            return res.status(400).json({ message: 'drc_id is required' });
        }

        const roList = await Recovery_officer.find({ drc_id })
            .select('ro_name ro_status ro_end_dtm ro_login_contact_no');

        const formattedList = roList.map(ro => {
            //const latestStatus = ro.ro_status?.[ro.ro_status.length - 1]?.status || 'No Status';
            return {
                ro_name: ro.ro_name,
                status: ro.ro_status,
                ro_end_dtm: ro.ro_end_dtm,
                ro_contact_no: ro.ro_login_contact_no, 
            };
        });

        res.status(200).json(formattedList);
    } catch (error) {
        console.error('Error fetching RO list:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


/**
 * Terminates a Recovery Officer or DRC User by updating their status to "Terminate", recording
 * the termination details, appending a remark entry in the system, and updating the related
 * User_log document to reflect the termination status.
 *
 * Request Body:
 * - ro_id: number (optional) – The ID of the Recovery Officer to be terminated.
 * - drcUser_id: number (optional) – The ID of the DRC User to be terminated.
 * - end_by: string (required) – Identifier of the person initiating the termination.
 * - remark: string (required) – Reason or remark for the termination.
 *
 * Logic:
 * 1. Validates that either `ro_id` or `drcUser_id` is provided, but not both.
 * 2. Validates required fields: `end_by` and `remark`.
 * 3. Starts a MongoDB session and initiates a transaction.
 * 4. Fetches the user from Recovery_officer collection based on the provided ID. Returns 404 if not found.
 * 5. Checks if the user is already terminated. Returns 400 if so.
 * 6. Updates the Recovery_officer document by:
 *    - Setting `drcUser_status` to "Terminate"
 *    - Recording `end_dtm` and `end_by`
 *    - Appending a new entry in the `remark` array
 * 7. Updates the corresponding User_log document by:
 *    - Setting `user_status_type` to "RO_update"
 *    - Setting `user_status` to "false"
 *    - Recording `user_status_dtm` and `user_status_by`
 *    - Recording `user_end_dtm` and `user_end_by`
 *    - Appending a new entry in the `remark` array
 * 8. Commits the transaction if all operations succeed.
 * 9. Returns 200 with termination confirmation and updated user data.
 *
 * Responses:
 * - 200: Termination successful, user data returned.
 * - 400: Validation error (missing fields or already terminated).
 * - 404: Recovery Officer or DRC User not found.
 * - 500: Internal server error during transaction, update, or User_log update failure.
 */


export const Terminate_RO = async (req, res) => {
    const session = await mongoose.startSession();
    
    try {
        const { ro_id, drcUser_id, end_by, remark } = req.body;

        // Validate that at least one ID is provided
        if (!ro_id && !drcUser_id) {
            return res.status(400).json({ 
                status: "error",
                message: 'Either ro_id or drcUser_id is required in the request body' 
            });
        }

        // Validate that both IDs are not provided at the same time
        if (ro_id && drcUser_id) {
            return res.status(400).json({ 
                status: "error",
                message: 'Please provide either ro_id or drcUser_id, not both' 
            });
        }

        // Validate other required fields
        if (!end_by) {
            return res.status(400).json({ 
                status: "error",
                message: 'ro_end_by is required in the request body' 
            });
        }
        if (!remark) {
            return res.status(400).json({ 
                status: "error",
                message: 'remark is required in the request body' 
            });
        }

        let updatedRO;
        let newRemark;
        let queryCondition = {};
        let drcUser_type = '';

        // Build query condition based on provided ID
        if (ro_id) {
            queryCondition = { ro_id: Number(ro_id) };
            drcUser_type = 'RO';
        } else if (drcUser_id) {
            queryCondition = { drcUser_id: Number(drcUser_id) };
            drcUser_type = 'drcUser';
        }

        // Start transaction
        await session.withTransaction(async () => {
            // Check if user exists
            const user = await Recovery_officer.findOne(queryCondition).session(session);
            
            if (!user) {
                const error = new Error(`${drcUser_type} not found`);
                error.statusCode = 404;
                throw error;
            }

            // Check if already terminated
            if (user.drcUser_status === 'Terminate') {
                const error = new Error(`${drcUser_type} is already terminated`);
                error.statusCode = 400;
                throw error;
            }

            // Create new remark object
            newRemark = {
                remark: remark,
                remark_by: end_by,
                remark_dtm: new Date()
            };

            // Update the user
            updatedRO = await Recovery_officer.findOneAndUpdate(
                queryCondition,
                {
                    $set: {
                        drcUser_status: 'Terminate',
                        end_dtm: new Date(),
                        end_by: end_by
                    },
                    $push: {
                        remark: newRemark
                    }
                },
                { 
                    new: true, 
                    runValidators: true,
                    session: session
                }
            );

            if (!updatedRO) {
                const error = new Error(`Failed to terminate ${drcUser_type}`);
                error.statusCode = 500;
                throw error;
            }

            // Update User_log document
            const userLogQuery = ro_id ? { ro_id: Number(ro_id) } : { drcUser_id: Number(drcUser_id) };
            const userLogRemark = {
                remark: remark,
                remark_by: end_by,
                remark_dtm: new Date()
            };

            const updatedUserLog = await User_log.findOneAndUpdate(
                userLogQuery,
                {
                    $set: {
                        user_status_type: 'RO_update',
                        user_status: 'false',
                        user_status_dtm: new Date(),
                        user_status_by: end_by,
                        user_end_dtm: new Date(),
                        user_end_by: end_by
                    },
                    $push: {
                        remark: userLogRemark
                    }
                },
                {
                    new: true,
                    runValidators: true,
                    session: session
                }
            );

            if (!updatedUserLog) {
                const error = new Error('Failed to update User_log document');
                error.statusCode = 500;
                throw error;
            }
        });

        // Build response data based on user type
        let responseData = {
            ro_name: updatedRO.ro_name,
            drcUser_status: updatedRO.drcUser_status,
            end_dtm: updatedRO.end_dtm,
            end_by: updatedRO.end_by,
            termination_remark: newRemark
        };

        // Add specific ID field to response
        if (ro_id) {
            responseData.ro_id = updatedRO.ro_id;
        } else if (drcUser_id) {
            responseData.drcUser_id = updatedRO.drcUser_id;
        }

        // Transaction completed successfully
        return res.status(200).json({
            status: "success",
            message: `${drcUser_type} terminated successfully`,
            data: responseData
        });

    } catch (error) {
        console.error('Error terminating user:', error);
        
        // Handle errors with status codes
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal server error';
        
        return res.status(statusCode).json({
            status: "error",
            message: message,
            ...(statusCode === 500 && { error: error.toString() })
        });
    } finally {
        // Always end the session
        await session.endSession();
    }
};


/**
 * Lists Recovery Officers (RO) or DRC Users associated with a specific DRC ID,
 * with optional status filtering and pagination. This endpoint is used by DRCs
 * to fetch associated users along with a count of active RTOM areas (for ROs).
 *
 * Request Body:
 * - drc_id: string (required) – The unique identifier of the DRC.
 * - drcUser_type: string (required) – Must be either "RO" or "drcUser".
 * - drcUser_status: string (optional) – One of "Active", "Inactive", or "Terminate".
 * - pages: number (optional) – Page number for pagination (default: 1).
 *
 * Logic:
 * 1. Validates required fields (`drc_id`, `drcUser_type`) and accepted enum values.
 * 2. Constructs a filter object based on input parameters.
 * 3. Adds pagination using skip/limit with 10 records per page.
 * 4. Defines specific projection fields depending on the `drcUser_type`:
 *    - For "RO": Includes `ro_id`, `rtom`, and others.
 *    - For "drcUser": Includes `drcUser_id` and user info fields.
 * 5. Queries the `Recovery_officer` collection with the filters and projections.
 * 6. Maps the result to a simplified response format:
 *    - For ROs: Adds `rtom_area_count` (count of active RTOM entries).
 * 7. Returns the formatted data with metadata like total records and current page.
 *
 * Responses:
 * - 200: Data successfully retrieved.
 * - 400: Missing or invalid request fields.
 * - 404: No records found matching the filter criteria.
 * - 500: Internal server error during data retrieval.
 */

export const List_All_RO_and_DRCuser_Details_to_DRC = async (req, res) => {
    try {
        // Extract parameters from request body
        const { drc_id, drcUser_type, drcUser_status, pages } = req.body;

        // Validate required fields
        if (!drc_id || !drcUser_type) {
            return res.status(400).json({
                status: "error",
                message: 'drc_id and drcUser_type are required fields'
            });
        }

        // Validate drcUser_type enum
        if (!['RO', 'drcUser'].includes(drcUser_type)) {
            return res.status(400).json({
                status: "error",
                message: 'drcUser_type must be either "RO" or "drcUser"'
            });
        }

        // Build filter object
        const filter = {
            drc_id: drc_id,
            drcUser_type: drcUser_type
        };

        // Add drcUser_status to filter if provided
        if (drcUser_status) {
            // Validate drcUser_status enum if provided
            if (!['Active', 'Inactive', 'Terminate'].includes(drcUser_status)) {
                return res.status(400).json({
                    status: "error",
                    message: 'drcUser_status must be one of: Active, Inactive, Terminate'
                });
            }
            filter.drcUser_status = drcUser_status;
        }

        // Pagination logic
        let page = Number(pages);
        if (isNaN(page) || page < 1) page = 1;

        const limit = page === 1 ? 10 : 10;
        const skip = page === 1 ? 0 : 10 + (page - 2) * 10;

        // Define projection fields based on drcUser_type
        let projection = {};
        if (drcUser_type === 'RO') {
            projection = {
                ro_id: 1,
                drcUser_status: 1,
                nic: 1,
                ro_name: 1,
                login_contact_no: 1,
                rtom: 1 // Need rtom to calculate rtom_area_count
            };
        } else if (drcUser_type === 'drcUser') {
            projection = {
                drcUser_id: 1,
                drcUser_status: 1,
                nic: 1,
                ro_name: 1,
                login_contact_no: 1
            };
        }

        // Fetch the total count of documents that match the filter criteria (without pagination)
        const totalCount = await Recovery_officer.countDocuments(filter);

        // Find documents based on filter with pagination and projection
        const documents = await Recovery_officer.find(filter, projection)
            .skip(skip)
            .limit(limit)
            .sort({ ro_id: -1, drcUser_id: -1 }); // Sort by ro_id and drcUser_id in descending order

        if (!documents || documents.length === 0) {
            return res.status(404).json({
                status: "error",
                message: 'No matching records found'
            });
        }

        // Process documents based on drcUser_type
        const processedData = documents.map(doc => {
            if (drcUser_type === 'RO') {
                // Calculate rtom_area_count (count of rtom objects with status "Active")
                const rtom_area_count = doc.rtom ? doc.rtom.filter(rtom => rtom.rtom_status === 'Active').length : 0;

                return {
                    ro_id: doc.ro_id,
                    drcUser_status: doc.drcUser_status,
                    nic: doc.nic,
                    ro_name: doc.ro_name,
                    login_contact_no: doc.login_contact_no,
                    rtom_area_count: rtom_area_count
                };
            } else if (drcUser_type === 'drcUser') {
                return {
                    drcUser_id: doc.drcUser_id,
                    drcUser_status: doc.drcUser_status,
                    nic: doc.nic,
                    ro_name: doc.ro_name,
                    login_contact_no: doc.login_contact_no
                };
            }
        });

        // Return successful response
        return res.status(200).json({
            status: "success",
            message: 'Data retrieved successfully',
            data: processedData,
            total_records: totalCount,
            current_page: page,
            records_per_page: limit
        });

    } catch (error) {
        console.error('Error in List_All_RO_and_DRCuser_Details_to_DRC:', error);
        return res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

/**
 * Retrieves a paginated list of Recovery Officers (RO) or DRC Users for SLT,
 * based on user type and optional status filter. Useful for SLT-level overviews without filtering by DRC ID.
 *
 * Request Body:
 * - drcUser_type: string (required) – Must be either "RO" or "drcUser".
 * - drcUser_status: string (optional) – Filter by status; one of "Active", "Inactive", or "Terminate".
 * - pages: number (optional) – Page number for pagination; defaults to 1.
 *
 * Function Logic:
 * 1. Validates presence and value of `drcUser_type`.
 * 2. Optionally validates and applies `drcUser_status` to the filter.
 * 3. Constructs MongoDB filter and projection objects based on user type.
 * 4. Implements pagination using skip/limit (10 records per page).
 * 5. Sorts results by `ro_id` and `drcUser_id` in descending order.
 * 6. For each RO:
 *    - Calculates `rtom_area_count` by counting RTOM entries with status "Active".
 * 7. For each drcUser:
 *    - Returns basic user info without RTOM count.
 * 8. Responds with formatted data including pagination and total record count.
 *
 * Successful Response (HTTP 200):
 * {
 *   status: "success",
 *   message: "Data retrieved successfully",
 *   data: [...],
 *   total_records: <number>,
 *   current_page: <number>,
 *   records_per_page: 10
 * }
 *
 * Error Responses:
 * - 400: If `drcUser_type` is missing or invalid.
 * - 404: If no records match the filter.
 * - 500: If an internal error occurs.
 */

export const List_All_RO_and_DRCuser_Details_to_SLT = async (req, res) => {
    try {
        // Extract parameters from request body
        const { drcUser_type, drcUser_status, pages } = req.body;

        // Validate required fields
        if (!drcUser_type) {
            return res.status(400).json({
                status: "error",
                message: 'drcUser_type is required fields'
            });
        }

        // Validate drcUser_type enum
        if (!['RO', 'drcUser'].includes(drcUser_type)) {
            return res.status(400).json({
                status: "error",
                message: 'drcUser_type must be either "RO" or "drcUser"'
            });
        }

        // Build filter object
        const filter = {
            drcUser_type: drcUser_type
        };

        // Add drcUser_status to filter if provided
        if (drcUser_status) {
            // Validate drcUser_status enum if provided
            if (!['Active', 'Inactive', 'Terminate'].includes(drcUser_status)) {
                return res.status(400).json({
                    status: "error",
                    message: 'drcUser_status must be one of: Active, Inactive, Terminate'
                });
            }
            filter.drcUser_status = drcUser_status;
        }

        // Pagination logic
        let page = Number(pages);
        if (isNaN(page) || page < 1) page = 1;

        const limit = page === 1 ? 10 : 10;
        const skip = page === 1 ? 0 : 10 + (page - 2) * 10;

        // Define projection fields based on drcUser_type
        let projection = {};
        if (drcUser_type === 'RO') {
            projection = {
                ro_id: 1,
                drcUser_status: 1,
                nic: 1,
                ro_name: 1,
                login_contact_no: 1,
                rtom: 1 // Need rtom to calculate rtom_area_count
            };
        } else if (drcUser_type === 'drcUser') {
            projection = {
                drcUser_id: 1,
                drcUser_status: 1,
                nic: 1,
                ro_name: 1,
                login_contact_no: 1
            };
        }

        // Fetch the total count of documents that match the filter criteria (without pagination)
        const totalCount = await Recovery_officer.countDocuments(filter);

        // Find documents based on filter with pagination and projection
        const documents = await Recovery_officer.find(filter, projection)
            .skip(skip)
            .limit(limit)
            .sort({ ro_id: -1, drcUser_id: -1 }); // Sort by ro_id and drcUser_id in descending order

        if (!documents || documents.length === 0) {
            return res.status(404).json({
                status: "error",
                message: 'No matching records found'
            });
        }

        // Process documents based on drcUser_type
        const processedData = documents.map(doc => {
            if (drcUser_type === 'RO') {
                // Calculate rtom_area_count (count of rtom objects with status "Active")
                const rtom_area_count = doc.rtom ? doc.rtom.filter(rtom => rtom.rtom_status === 'Active').length : 0;

                return {
                    ro_id: doc.ro_id,
                    drcUser_status: doc.drcUser_status,
                    nic: doc.nic,
                    ro_name: doc.ro_name,
                    login_contact_no: doc.login_contact_no,
                    rtom_area_count: rtom_area_count
                };
            } else if (drcUser_type === 'drcUser') {
                return {
                    drcUser_id: doc.drcUser_id,
                    drcUser_status: doc.drcUser_status,
                    nic: doc.nic,
                    ro_name: doc.ro_name,
                    login_contact_no: doc.login_contact_no
                };
            }
        });

        // Return successful response
        return res.status(200).json({
            status: "success",
            message: 'Data retrieved successfully',
            data: processedData,
            total_records: totalCount,
            current_page: page,
            records_per_page: limit
        });

    } catch (error) {
        console.error('Error in List_All_RO_and_DRCuser_Details_to_SLT:', error);
        return res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};




