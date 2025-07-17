/* 
    Purpose: This template is used for the DRC Controllers.
    Created Date: 2024-11-21
    Created By: Lasandi Randini (randini-im20057@stu.kln.ac.lk)
    Version: Node.js v20.11.1
    Dependencies: mysql2
    Related Files: DRC_route.js
    Notes:  
*/
import TmpForwardedApprover from "../models/Template_forwarded_approver.js";
import mongoose from "mongoose";
import db from "../config/db.js";
import DRC from "../models/Debt_recovery_company.js";
import Service from "../models/Service.js";
import RecoveryOfficer from "../models/Recovery_officer.js"
import moment from "moment"; // Import moment.js for date formatting
import user_approve_model from "../models/User_Approval.js"
import {createUserInteractionFunction} from "../services/UserInteractionService.js"
import drc_agreement from "../models/DRC_Agreement_details.js"
import {getApprovalUserIdService} from "../services/ApprovalService.js"
import {createTaskFunction} from "../services/TaskService.js"
export const getDRCDetailsByDate = async (req, res) => {
  const { creationDate } = req.query;

  try {
    // Validate input date
    if (!creationDate) {
      return res.status(400).json({
        status: "error",
        message: "Creation date is required to fetch DRC details.",
      });
    }

    // Parse date to ensure proper query filtering
    const startDate = new Date(creationDate);
    const endDate = new Date(creationDate);
    endDate.setDate(endDate.getDate() + 1); // Include all records up to the end of the day

    // Fetch DRC details created on the specified date
    const drcDetails = await DRC.find({
      create_dtm: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    if (drcDetails.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No DRC details found for the specified date.",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "DRC details fetched successfully.",
      data: drcDetails,
    });
  } catch (error) {
    console.error("Unexpected error fetching DRC details by date:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch DRC details.",
      errors: {
        exception: error.message,
      },
    });
  }
};

// Get all DRC details created between a specific time period
export const getDRCDetailsByTimePeriod = async (req, res) => {
  const { date, startTime, endTime } = req.query;

  try {
    // Validate inputs
    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        status: "error",
        message:
          "Date, start time, and end time are required to fetch DRC details.",
      });
    }

    // Parse date and times
    const baseDate = new Date(date);
    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    // Validate time range
    if (startDateTime >= endDateTime) {
      return res.status(400).json({
        status: "error",
        message: "Start time must be earlier than end time.",
      });
    }

    // Fetch DRC details created within the time range
    const drcDetails = await DRC.find({
      create_dtm: {
        $gte: startDateTime,
        $lt: endDateTime,
      },
    });

    if (drcDetails.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No DRC details found for the specified time period.",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "DRC details fetched successfully.",
      data: drcDetails,
    });
  } catch (error) {
    console.error(
      "Unexpected error fetching DRC details by time period:",
      error
    );
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch DRC details.",
      errors: {
        exception: error.message,
      },
    });
  }
};

export const registerDRCWithServices = async (req, res) => {
  const { DRC_Name, DRC_Business_Registration_Number, Contact_Number, DRC_Email,Services } = req.body;

  try {
    // Validate required fields
    if (!DRC_Name || !DRC_Business_Registration_Number || !Contact_Number || !DRC_Email) {
      return res.status(400).json({
        status: "error",
        message: "Failed to register DRC.",
        errors: {
          field_name: "All fields are required",
        },
      });
    }

    // Normalize the business registration number and email to lowercase for case-insensitive comparison
    const normalizedBusinessRegNumber = DRC_Business_Registration_Number.trim().toLowerCase();
    const normalizedEmail = DRC_Email.trim().toLowerCase();
    // Check if `drc_business_registration_number` is unique (case-insensitive)
    const existingDRC = await DRC.findOne({
      $or: [
        { drc_business_registration_number: normalizedBusinessRegNumber },
        { drc_email: normalizedEmail },
      ],
    });

    if (existingDRC) {
      return res.status(400).json({
        status: "error",
        message: "DRC Business Registration Number or Email already exists.",
      });
    }

    // Default values
    const drcStatus = "Active"; // Default to Active status
    const createdBy = "Admin"; // Default creator
    const create_dtm = moment().format("YYYY-MM-DD HH:mm:ss"); // Format date for SQL-like format

    // Generate `drc_id` from MongoDB counter
    const mongoConnection = await db.connectMongoDB();
    const counterResult = await mongoConnection
      .collection("collection_sequence")
      .findOneAndUpdate(
        { _id: "drc_id" },
        { $inc: { seq: 1 } },
        { returnDocument: "after", upsert: true }
      );

    const drc_id = counterResult.seq;

    // Save DRC details in MongoDB
    const newDRC = new DRC({
      drc_id,
      drc_business_registration_number: normalizedBusinessRegNumber, // Save normalized value
      drc_name: DRC_Name,
      drc_email: normalizedEmail, // Save normalized email
      drc_status: drcStatus,
      teli_no: Contact_Number,
      drc_end_dat: null, // Default to no end date
      create_by: createdBy,
      create_dtm: moment(create_dtm, "YYYY-MM-DD HH:mm:ss").toDate(),
      services_of_drc: [], // Initialize with empty array of services
    });

    // Assign services to the DRC
    for (const serviceId of Services) {
      const serviceData = await Service.findOne({ service_id: serviceId });
      if (serviceData) {
        newDRC.services_of_drc.push({
          service_id: serviceId,
          service_type: serviceData.service_type,
          drc_service_status: "Active",
          status_change_dtm: new Date(),
          status_changed_by: "Admin",
        });
      }
    }

    await newDRC.save();

    return res.status(201).json({
      status: "success",
      message: "DRC registered successfully with assigned services.",
      data: {
        drc_id,
        drc_name: DRC_Name,
        drc_email: normalizedEmail,
        contact_no: Contact_Number,
        drc_business_registration_number: DRC_Business_Registration_Number,
      },
    });
  } catch (error) {
    console.error("Unexpected error during DRC registration:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to register DRC.",
      errors: {
        exception: error.message,
      },
    });
  }
};

// export const Service_to_DRC = async (req, res) => {
//   const { DRC_ID, Service_ID } = req.body;

//   try {
//     // Validate required fields
//     if (!DRC_ID || !Service_ID) {
//       return res.status(400).json({
//         status: "error",
//         message: "Both DRC_ID and Service_ID are required.",
//       });
//     }

//     // Check if the service exists in MySQL for the DRC
//     const checkQuery = `
//       SELECT * FROM company_owned_services
//       WHERE drc_id = ? AND service_id = ?;
//     `;

//     db.mysqlConnection.query(checkQuery, [DRC_ID, Service_ID], async (checkErr, checkResult) => {
//       if (checkErr) {
//         console.error("Error checking service existence:", checkErr);
//         return res.status(500).json({
//           status: "error",
//           message: "Failed to verify existing services.",
//           errors: { database: checkErr.message },
//         });
//       }

//       if (checkResult.length > 0) {
//         const existingService = checkResult[0];

//         if (existingService.drc_service_status === "Active") {
//           // Active service already exists
//           return res.status(400).json({
//             status: "error",
//             message: "An active service already exists for this company.",
//           });
//         } else {
//           // Service exists but is inactive, update to active in MySQL
//           const updateQuery = `
//             UPDATE company_owned_services
//             SET drc_service_status = 'Active',
//                 service_status_changed_by = 'Admin',
//                 service_status_changed_dtm = CURRENT_TIMESTAMP
//             WHERE id = ?;
//           `;

//           db.mysqlConnection.query(updateQuery, [existingService.id], async (updateErr) => {
//             if (updateErr) {
//               console.error("Error updating service status:", updateErr);
//               return res.status(500).json({
//                 status: "error",
//                 message: "Failed to update service status.",
//                 errors: { database: updateErr.message },
//               });
//             }

//             // Update the status in MongoDB
//             await DRC.updateOne(
//               { drc_id: DRC_ID, "services_of_drc.service_id": Service_ID },
//               {
//                 $set: {
//                   "services_of_drc.$.drc_service_status": "Active",
//                   "services_of_drc.$.status_change_dtm": new Date(),
//                   "services_of_drc.$.status_changed_by": "Admin",
//                 },
//               }
//             );

//             return res.status(200).json({
//               status: "success",
//               message: "Service status updated to active in MySQL and MongoDB.",
//             });
//           });

//           return;
//         }
//       }

//       // No service found, insert a new record in MySQL
//       const insertQuery = `
//         INSERT INTO company_owned_services (
//           drc_id,
//           service_id,
//           drc_service_status,
//           created_by,
//           created_dtm,
//           service_status_changed_by,
//           service_status_changed_dtm
//         ) VALUES (?, ?, 'Active', 'Admin', CURRENT_TIMESTAMP, 'Admin', CURRENT_TIMESTAMP);
//       `;

//       db.mysqlConnection.query(insertQuery, [DRC_ID, Service_ID], async (insertErr, insertResult) => {
//         if (insertErr) {
//           console.error("Error inserting service for DRC:", insertErr);
//           return res.status(500).json({
//             status: "error",
//             message: "Failed to assign service to DRC.",
//             errors: { database: insertErr.message },
//           });
//         }

//         // Insert the service into MongoDB
//         const serviceData = await Service.findOne({ service_id: Service_ID });

//         if (!serviceData) {
//           return res.status(404).json({
//             status: "error",
//             message: "Service not found in MongoDB.",
//           });
//         }

//         await DRC.updateOne(
//           { drc_id: DRC_ID },
//           {
//             $push: {
//               services_of_drc: {
//                 service_id: Service_ID,
//                 service_type: serviceData.service_type,
//                 drc_service_status: "Active",
//                 status_change_dtm: new Date(),
//                 status_changed_by: "Admin",
//               },
//             },
//           }
//         );

//         return res.status(201).json({
//           status: "success",
//           message: "Service assigned to DRC successfully in MySQL and MongoDB.",
//           data: {
//             id: insertResult.insertId,
//             drc_id: DRC_ID,
//             service_id: Service_ID,
//             drc_service_status: "Active",
//           },
//         });
//       });
//     });
//   } catch (error) {
//     console.error("Unexpected error during Service_to_DRC:", error);
//     return res.status(500).json({
//       status: "error",
//       message: "Failed to assign service to DRC.",
//       errors: { exception: error.message },
//     });
//   }
// };

export const Service_to_DRC = async (req, res) => {
  const { DRC_ID, Service_ID } = req.body;

  try {
    // Validate required fields
    if (!DRC_ID || !Service_ID) {
      return res.status(400).json({
        status: "error",
        message: "Both DRC_ID and Service_ID are required.",
      });
    }

    // Check if the service exists for the DRC in MongoDB
    const drcRecord = await DRC.findOne({ drc_id: DRC_ID });
    const existingService = drcRecord?.services_of_drc?.find(
      (service) => service.service_id === Service_ID
    );

    if (existingService) {
      if (existingService.drc_service_status === "Active") {
        // Active service already exists
        return res.status(400).json({
          status: "error",
          message: "An active service already exists for this company.",
        });
      } else {
        // Service exists but is inactive, update to active
        await DRC.updateOne(
          { drc_id: DRC_ID, "services_of_drc.service_id": Service_ID },
          {
            $set: {
              "services_of_drc.$.drc_service_status": "Active",
              "services_of_drc.$.status_change_dtm": new Date(),
              "services_of_drc.$.status_changed_by": "Admin",
            },
          }
        );

        return res.status(200).json({
          status: "success",
          message: "Service status updated to active in MongoDB.",
        });
      }
    }

    // No service found, insert a new record
    const serviceData = await Service.findOne({ service_id: Service_ID });

    if (!serviceData) {
      return res.status(404).json({
        status: "error",
        message: "Service not found in MongoDB.",
      });
    }

    await DRC.updateOne(
      { drc_id: DRC_ID },
      {
        $push: {
          services_of_drc: {
            service_id: Service_ID,
            service_type: serviceData.service_type,
            drc_service_status: "Active",
            status_change_dtm: new Date(),
            status_changed_by: "Admin",
          },
        },
      },
      { upsert: true } // Ensure DRC record exists or create a new one
    );

    return res.status(201).json({
      status: "success",
      message: "Service assigned to DRC successfully in MongoDB.",
    });
  } catch (error) {
    console.error("Unexpected error during Service_to_DRC:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to assign service to DRC.",
      errors: { exception: error.message },
    });
  }
};

//   export const Remove_Service_From_DRC = async (req, res) => {
//   const { DRC_ID, Service_ID } = req.body;

//   const changedBy = req.user ? req.user.username : "Admin";

//   try {
//     if (!DRC_ID || !Service_ID) {
//       return res.status(400).json({
//         status: "error",
//         message: "Failed to remove service from DRC.",
//         errors: { field_name: "DRC_ID and Service_ID are required" },
//       });
//     }

//     const checkQuery = `
//       SELECT drc_service_status
//       FROM company_owned_services
//       WHERE drc_id = ? AND service_id = ? AND drc_service_status = 'Active'
//     `;

//     db.mysqlConnection.query(checkQuery, [DRC_ID, Service_ID], (err, result) => {
//       if (err) {
//         console.error("Error checking service status:", err);
//         return res.status(500).json({
//           status: "error",
//           message: "Failed to remove service from DRC.",
//           errors: { database: err.message },
//         });
//       }

//       if (result.length === 0) {
//         return res.status(404).json({
//           status: "error",
//           message: "No active service found for the specified DRC and Service ID.",
//         });
//       }

//       const updateQuery = `
//         UPDATE company_owned_services
//         SET drc_service_status = 'Inactive',
//             service_status_changed_by = ?,
//             service_status_changed_dtm = CURRENT_TIMESTAMP
//         WHERE drc_id = ? AND service_id = ?
//       `;

//       db.mysqlConnection.query(updateQuery, [changedBy, DRC_ID, Service_ID], async (err, updateResult) => {
//         if (err) {
//           console.error("Error updating service status:", err);
//           return res.status(500).json({
//             status: "error",
//             message: "Failed to update service status.",
//             errors: { database: err.message },
//           });
//         }

//         if (updateResult.affectedRows === 0) {
//           return res.status(404).json({
//             status: "error",
//             message: "No matching service found to update.",
//           });
//         }

//         const drc = await DRC.findOne({ drc_id: DRC_ID });
//         if (!drc) {
//           return res.status(404).json({
//             status: "error",
//             message: "DRC not found in MongoDB.",
//           });
//         }

//         const serviceIndex = drc.services_of_drc.findIndex(
//           (service) => service.service_id === Service_ID
//         );

//         if (serviceIndex === -1) {
//           return res.status(404).json({
//             status: "error",
//             message: "Service not found in MongoDB.",
//           });
//         }

//         drc.services_of_drc[serviceIndex].drc_service_status = "Inactive";
//         drc.services_of_drc[serviceIndex].status_changed_by = changedBy;
//         drc.services_of_drc[serviceIndex].status_change_dtm = new Date();

//         await drc.save();

//         return res.status(200).json({
//           status: "success",
//           message: "Service removed successfully from DRC.",
//           data: {
//             DRC_ID,
//             Service_ID,
//             drc_service_status: "Inactive",
//           },
//         });
//       });
//     });
//   } catch (error) {
//     console.error("Unexpected error during service removal:", error);
//     return res.status(500).json({
//       status: "error",
//       message: "Failed to remove service from DRC.",
//       errors: { exception: error.message },
//     });
//   }
// };

export const Remove_Service_From_DRC = async (req, res) => {
  const { DRC_ID, Service_ID } = req.body;

  const changedBy = req.user ? req.user.username : "Admin";

  try {
    if (!DRC_ID || !Service_ID) {
      return res.status(400).json({
        status: "error",
        message: "Failed to remove service from DRC.",
        errors: { field_name: "DRC_ID and Service_ID are required" },
      });
    }

    // Find the DRC and check if the service exists and is active
    const drcRecord = await DRC.findOne({ drc_id: DRC_ID });
    if (!drcRecord) {
      return res.status(404).json({
        status: "error",
        message: "DRC not found in MongoDB.",
      });
    }

    const serviceIndex = drcRecord.services_of_drc.findIndex(
      (service) =>
        service.service_id === Service_ID &&
        service.drc_service_status === "Active"
    );

    if (serviceIndex === -1) {
      return res.status(404).json({
        status: "error",
        message:
          "No active service found for the specified DRC and Service ID.",
      });
    }

    // Update the service status to inactive
    drcRecord.services_of_drc[serviceIndex].drc_service_status = "Inactive";
    drcRecord.services_of_drc[serviceIndex].status_changed_by = changedBy;
    drcRecord.services_of_drc[serviceIndex].status_change_dtm = new Date();

    await drcRecord.save();

    return res.status(200).json({
      status: "success",
      message: "Service removed successfully from DRC.",
      data: {
        DRC_ID,
        Service_ID,
        drc_service_status: "Inactive",
      },
    });
  } catch (error) {
    console.error("Unexpected error during service removal:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to remove service from DRC.",
      errors: { exception: error.message },
    });
  }
};

// export const manageDRC = async (req, res) => {
//   const { drc_id, drc_status, services_to_add, services_to_update, teli_no } = req.body;

//   const changedBy = req.user ? req.user.username : "Admin";

//   try {
//     // Validate DRC ID
//     if (!drc_id) {
//       return res.status(400).json({
//         status: "error",
//         message: "DRC ID is required.",
//       });
//     }

//     // Fetch the DRC document
//     const drc = await DRC.findOne({ drc_id });
//     if (!drc) {
//       return res.status(404).json({
//         status: "error",
//         message: "No DRC found for the given drc_id.",
//       });
//     }

//     // Update DRC status if provided
//     if (drc_status) {
//       drc.drc_status = drc_status;
//     }

//     // Update telephone number if provided
//     if (teli_no) {
//       drc.teli_no = teli_no;
//     }

//     // Add New Services
//     if (Array.isArray(services_to_add) && services_to_add.length > 0) {
//       const newServices = await Promise.all(
//         services_to_add.map(async (service) => {
//           const { service_id } = service;

//           if (!service_id) {
//             throw new Error("Each service to add must include a valid service_id.");
//           }

//           const serviceDetails = await Service.findOne({ service_id });
//           if (!serviceDetails) {
//             throw new Error(`Service with ID ${service_id} not found in the Service collection.`);
//           }

//           return {
//             service_id: serviceDetails.service_id,
//             service_type: serviceDetails.service_type,
//             drc_service_status: "Active",
//             status_change_dtm: new Date(),
//             status_changed_by: changedBy,
//           };
//         })
//       );

//       drc.services_of_drc.push(...newServices);
//     }

//     // Update Existing Services
//     if (Array.isArray(services_to_update) && services_to_update.length > 0) {
//       const notFoundServices = [];

//       services_to_update.forEach((service) => {
//         const { service_id, drc_service_status } = service;

//         if (!service_id) {
//           throw new Error("Each service to update must include a valid service_id.");
//         }

//         const serviceIndex = drc.services_of_drc.findIndex(
//           (s) => s.service_id === Number(service_id)
//         );

//         if (serviceIndex !== -1) {
//           drc.services_of_drc[serviceIndex].drc_service_status = drc_service_status;
//           drc.services_of_drc[serviceIndex].status_change_dtm = new Date();
//           drc.services_of_drc[serviceIndex].status_changed_by = changedBy;
//         } else {
//           notFoundServices.push(service_id);
//         }
//       });

//       if (notFoundServices.length > 0) {
//         throw new Error(
//           `The following service IDs were not found in DRC services: ${notFoundServices.join(", ")}`
//         );
//       }
//     }

//     // Save the updated DRC document
//     await drc.save();

//     // Return success response
//     return res.status(200).json({
//       status: "success",
//       message: "DRC updated successfully.",
//       data: drc,
//     });
//   } catch (error) {
//     console.error("Error in manageDRC:", error);
//     return res.status(500).json({
//       status: "error",
//       message: error.message || "An unexpected error occurred.",
//     });
//   }
// };

export const Change_DRC_Details_with_Services = async (req, res) => {
  const {
    drc_id,
    drc_status,
    services_to_add,
    services_to_update,
    drc_email,
    teli_no,
    remark,
  } = req.body;

  const changedBy = req.user ? req.user.username : "Admin";

  try {
  
    if (!drc_id) {
      return res.status(400).json({
        status: "error",
        message: "DRC ID is required.",
      });
    }

   
    const drc = await DRC.findOne({ drc_id });
    if (!drc) {
      return res.status(404).json({
        status: "error",
        message: "No DRC found for the given drc_id.",
      });
    }

    if (drc_status) {
      drc.drc_status = drc_status;
    }

    if (teli_no) {
      drc.teli_no = teli_no;
    }

    if (drc_email) {
      drc.drc_email = drc_email;
    }

    // Add New Services
    if (Array.isArray(services_to_add) && services_to_add.length > 0) {
      const newServices = await Promise.all(
        services_to_add.map(async (service) => {
          const { service_id } = service;

          if (!service_id) {
            throw new Error(
              "Each service to add must include a valid service_id."
            );
          }

          // Check if the service already exists in DRC
          const isServiceExisting = drc.services_of_drc.some(
            (existingService) =>
              existingService.service_id === Number(service_id)
          );

          if (isServiceExisting) {
            throw new Error(
              `Service with ID ${service_id} already exists in DRC.`
            );
          }

          const serviceDetails = await Service.findOne({ service_id });
          if (!serviceDetails) {
            throw new Error(
              `Service with ID ${service_id} not found in the Service collection.`
            );
          }

          return {
            service_id: serviceDetails.service_id,
            service_type: serviceDetails.service_type,
            drc_service_status: "Active",
            status_change_dtm: new Date(),
            status_changed_by: changedBy,
          };
        })
      );

      drc.services_of_drc.push(...newServices);
    }

    // Update Existing Services
    if (Array.isArray(services_to_update) && services_to_update.length > 0) {
      const notFoundServices = [];

      services_to_update.forEach((service) => {
        const { service_id, drc_service_status } = service;

        if (!service_id) {
          throw new Error(
            "Each service to update must include a valid service_id."
          );
        }

        const serviceIndex = drc.services_of_drc.findIndex(
          (s) => s.service_id === Number(service_id)
        );

        if (serviceIndex !== -1) {
          drc.services_of_drc[serviceIndex].drc_service_status =
            drc_service_status;
          drc.services_of_drc[serviceIndex].status_change_dtm = new Date();
          drc.services_of_drc[serviceIndex].status_changed_by = changedBy;
        } else {
          notFoundServices.push(service_id);
        }
      });

      if (notFoundServices.length > 0) {
        throw new Error(
          `The following service IDs were not found in DRC services: ${notFoundServices.join(
            ", "
          )}`
        );
      }
    }

    if (remark) {
      drc.remark = drc.remark || [];
      drc.remark.push({
        remark,
        remark_Dtm: new Date(),
        remark_edit_by: changedBy,
      });
    }

    // Save the updated DRC document
    await drc.save();

    // Return success response
    return res.status(200).json({
      status: "success",
      message: "DRC updated successfully.",
      data: drc,
    });
  } catch (error) {
    console.error("Error in manageDRC:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "An unexpected error occurred.",
    });
  }
};

export const Ro_detais_of_the_DRC = async (req, res) => {
  const { drc_id, drcUser_status, pages = 1 } = req.body;
  try {
    if (!drc_id) {
      return res.status(400).json({
        status: "error",
        message: "DRC id field is required",
      });
    };

    let page = Number(pages);
    if (isNaN(page) || page < 1) page = 1;
    const limit = page === 1 ? 10 : 30;
    const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

    const query = { drc_id };
    if (drcUser_status) {
      query.drcUser_status = drcUser_status;
    };

    const ro_details = await RecoveryOfficer.find(query)
      .select('create_by login_contact_no drcUser_status ro_name')
      .skip(skip)
      .limit(limit)
      .sort({ ro_id: -1 });

    return res.status(200).json({
      status: "success",
      message: "Data fetched successfully",
      data: ro_details,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error occurred",
      error: error.message,
    });
  }
};

export const Rtom_detais_of_the_DRC = async (req, res) => {
  const { drc_id, pages, handling_type } = req.body;

  try {
    if (!drc_id) {
      return res.status(400).json({
        status: "error",
        message: "DRC id field is required",
      });
    }

    let page = Number(pages);
    if (isNaN(page) || page < 1) page = 1;
    const limit = page === 1 ? 10 : 30;
    const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

    const pipeline = [
      { $match: { drc_id } },
      { $unwind: "$rtom" },
    ];

    // Conditionally add handling_type filter
    if (handling_type) {
      pipeline.push({ $match: { "rtom.handling_type": handling_type } });
    }

    pipeline.push(
      { $sort: { "rtom._id": -1 } },
      { $skip: skip },
      { $limit: limit },
      { $project: { _id: 0, rtom: 1 } }
    );

    const rtom_details = await DRC.aggregate(pipeline);

    return res.status(200).json({
      status: "success",
      message: "Data fetched successfully",
      data: rtom_details.map(item => item.rtom),
    });

  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error occurred",
      error: error.message,
    });
  }
};

export const Service_detais_of_the_DRC = async (req, res) => {
  const { drc_id, pages, service_status } = req.body;

  try {
    if (!drc_id) {
      return res.status(400).json({
        status: "error",
        message: "DRC id field is required",
      });
    }

    let page = Number(pages);
    if (isNaN(page) || page < 1) page = 1;
    const limit = page === 1 ? 10 : 30;
    const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

    const pipeline = [
      { $match: { drc_id } },
      { $unwind: "$services" },
    ];

    // Only apply service_status filter if it's provided
    if (service_status) {
      pipeline.push({ $match: { "services.service_status": service_status } });
    }

    pipeline.push(
      { $sort: { "services.created_at": -1 } }, // optional sort
      { $skip: skip },
      { $limit: limit },
      { $project: { _id: 0, service: "$services" } }
    );

    const services = await DRC.aggregate(pipeline);

    return res.status(200).json({
      status: "success",
      message: "Data fetched successfully",
      data: services,
    });

  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error occurred",
      error: error.message,
    });
  }
};

export const DRC_Agreement_details_list = async (req, res) => {
  const { drc_id } = req.body;

  try {
    if (!drc_id) {
      return res.status(400).json({
        status: "error",
        message: "DRC id field is required",
      });
    }

    const agreement_details = await drc_agreement.find({ drc_id });

    return res.status(200).json({
      status: "success",
      message: "Data fetched successfully",
      data: agreement_details,
    });

  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error occurred",
      error: error.message,
    });
  }
};

export const Assign_DRC_To_Agreement = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { drc_id, remark, assigned_by, start_date, end_date } = req.body;

    // Validate required fields
    if (!start_date || !drc_id || !end_date || !assigned_by) {
      await session.abortTransaction();
      return res.status(400).json({
        status: "error",
        message: "assigned_by, end_date, start_date and drc_id are required.",
      });
    }

    // Check if start date is after today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(start_date);
    start.setHours(0, 0, 0, 0);

    if (start <= today) {
      await session.abortTransaction();
      return res.status(400).json({
        status: "error",
        message: "Start date should be greater than today.",
      });
    };

    // Check existing DRC
    const exist_drc = await DRC.findOne(
      { drc_id },
      { drc_id: 1, _id: 0, drc_agreement_details: 1 }
    );

    if (!exist_drc) {
      await session.abortTransaction();
      return res.status(404).json({
        status: "error",
        message: "No existing DRC found for the given drc_id.",
      });
    };

    const existingAgreement = exist_drc.drc_agreement_details || {};
    const currentStatus = existingAgreement.agreement_status;
    const existing_end_date = new Date(existingAgreement.agreement_end_dtm || 0);
    existing_end_date.setHours(0, 0, 0, 0);

    // Check status is eligible
    if (!["Rejected", "Expired", "Terminate"].includes(currentStatus)) {
      await session.abortTransaction();
      return res.status(400).json({
        status: "error",
        message: `Cannot assign new agreement while current status is "${currentStatus}".`,
      });
    };

    // Ensure start date is after previous agreement's end
    if (start >= existing_end_date) {
      await session.abortTransaction();
      return res.status(400).json({
        status: "error",
        message: "Start date must be after existing agreement's end date.",
      });
    };

    // Use existing mongoose connection
    const mongoConnection = mongoose.connection;

    // Generate agreement_id
    const counterResultTwo = await mongoConnection.collection("collection_sequence").findOneAndUpdate(
      { _id: "agreement_id" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true, session }
    );
    const agreement_id = counterResultTwo?.seq;
    if (!agreement_id) {
      throw new Error("Failed to generate agreement_id.");
    }

    // Get delegated approver
    const approval_type = "DRC_Agreement";
    const approved_Deligated_by = await getApprovalUserIdService(approval_type);

    if (approved_Deligated_by === null || approved_Deligated_by === undefined) {
      await session.abortTransaction();
      return res.status(404).json({
        status: "error",
        message: "There is no valid approved_Deligated_by id.",
      });
    }

    // Generate approver_id
    const counterResult = await mongoConnection.collection("collection_sequence").findOneAndUpdate(
      { _id: "approver_id" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true, session }
    );
    const approver_id = counterResult?.seq;

    if (!approver_id) {
      throw new Error("Failed to generate approver_id.");
    }

    const parameters = {
      drc_id,
      start_date,
      end_date,
    };

    // Create entry in TmpForwardedApprover
    const approvalEntry = new TmpForwardedApprover({
      approver_id,
      approver_reference: drc_id,
      created_by: assigned_by,
      approver_type: "DRC Agreement",
      parameters,
      approve_status: [
        {
          status: "Open",
          status_date: new Date(),
          status_edit_by: assigned_by,
        },
      ],
      approved_deligated_by: approved_Deligated_by,
    });

    await approvalEntry.save({ session });

    // Create record in drc_agreement
    const drc_agreement_record = new drc_agreement({
      agreement_id,
      approver_id,
      drc_id,
      agreement_start_dtm: start_date,
      agreement_end_dtm: end_date,
      agreement_status: "Pending",
      agreement_remark: remark,
      agreement_update_dtm: new Date(),
      agreement_update_by: assigned_by,
      agreement_create_dtm: new Date(),
    });

    await drc_agreement_record.save({ session });

    // Update DRC with new agreement details
    await DRC.findOneAndUpdate(
      { drc_id },
      {
        $set: {
          drc_agreement_details: {
            agreement_start_dtm: start_date,
            agreement_update_by: assigned_by,
            agreement_remark: remark,
            agreement_end_dtm: end_date,
            agreement_status:"Pending"
          },
        },
      },
      { new: true, session }
    );
    const dynamicParams = {
      drc_id,
      start_date,
      end_date
    }
    // Log user interaction
    const interactionResult = await createUserInteractionFunction({
      Interaction_ID: 26,
      User_Interaction_Type: "Pending Approval DRC Agreement",
      delegate_user_id: approved_Deligated_by,
      Created_By: assigned_by,
      User_Interaction_Status: "Open",
      ...dynamicParams,
      session,
    });

    if (!interactionResult || interactionResult.status === "error") {
      await session.abortTransaction();
      return res.status(500).json({
        status: "error",
        message: "Failed to create user interaction.",
      });
    }

    await session.commitTransaction();

    return res.status(200).json({
      status: "success",
      message: "DRC Agreement sent for approval.",
      data: {
        agreement_id,
        approver_id,
        approval_status: "Open",
      },
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("Assign_DRC_To_Agreement Error:", error);
    return res.status(500).json({
      status: "error",
      message: "An error occurred while assigning the DRC.",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  } finally {
    session.endSession();
  }
};

export const List_User_Approval_Details = async (req, res) => {
  const { user_type, from_date, to_date, pages } = req.body;

  try {
    let page = Number(pages) || 1;
    const limit = page === 1 ? 10 : 30;
    const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

    // Build dynamic match condition
    const matchStage = {};

    if (user_type) {
      matchStage.User_Type = user_type;
    }

    if (from_date && to_date) {
      const startDate = new Date(from_date);
      const endDate = new Date(to_date);
      endDate.setHours(23, 59, 59, 999);
      matchStage.created_on = { $gte: startDate, $lte: endDate };
    }

    // Build aggregation pipeline
    const pipeline = [];

    // Apply $match only if filters exist
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Common aggregation stages
    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "User_id",
          foreignField: "user_id",
          as: "user_data"
        }
      },
      {
        $unwind: {
          path: "$user_data",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: { created_on: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      },
      {
        $project: {
          _id: 0,
          user_approver_id: 1,
          User_Type: 1,
          approve_status: 1,
          User_id:1,
          created_on: 1,
          approver_type: 1,
          DRC_id:1,
          user_data:1
        }
      }
    );

    // Execute aggregation
    const data = await user_approve_model.aggregate(pipeline);

    return res.status(200).json({
      status: "success",
      message: "User approval records fetched successfully",
      data
    });

  } catch (error) {
    return res.status(500).json({
      message: "There is a server error",
      error: error.message,
    });
  }
};

export const Approve_DRC_Agreement_Approval = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { drc_id, approved_by, user_approver_id } = req.body;

    if (!drc_id || !user_approver_id || !approved_by) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "user_approver_id, drc_id, and approved_by are required"
      });
    }

    const approvalDoc = await user_approve_model.findOne(
      {
        DRC_id: drc_id,
        user_approver_id
      }
    ).session(session);

    if (!approvalDoc) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "No matching approver reference found" });
    }

    const start_date = approvalDoc.Parameters.start_date;
    const end_date = approvalDoc.Parameters.end_date;
    const deligate_id = approvalDoc.created_by;

    const result = await user_approve_model.updateOne(
      {
        DRC_id: drc_id,
        user_approver_id
      },
      {
        $set: {
          approve_status: "Approve",
        }
      },
      { session }
    );
    const agreement_result = await drc_agreement.updateOne(
      {
        drc_id,
        user_approver_id
      },
      {
        $set: {
          agreement_status: "Approved",
        }
      },
      { session }
    );
    if(!agreement_result){
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "DRC agreement not updated" }); 
    }
    if (result.modifiedCount === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Approval update failed" });
    }

    let caseResult = { modifiedCount: 0 }; 

    if (end_date > new Date()) {
      const parameters = {
        start_date,
        end_date,
        drc_id
      };
      const taskData = {
        Template_Task_Id: 33, //python
        task_type: "python",  //python
        ...parameters,
        created_by: approved_by,
        task_status: "open",
      };

      await createTaskFunction(taskData, session);
    } else {
      caseResult = await DRC.updateOne(
        { drc_id: drc_id },
        {
          $push: {
            status: {
              drc_status: "Active",
              drc_status_dtm: new Date(),
              drc_status_by: approved_by
            }
          }
        },
        { session }
      );
    }

    // Create User Interaction Log
    const interaction_id = 16; //python
    const request_type = "python"; //python
    const created_by = approved_by;
    const dynamicParams = { start_date, end_date, drc_id };

    await createUserInteractionFunction({
      Interaction_ID: interaction_id,
      User_Interaction_Type: request_type,
      delegate_user_id: deligate_id,
      Created_By: created_by,
      User_Interaction_Status: "Open",
      User_Interaction_Status_DTM: new Date(),
      session,
      ...dynamicParams,
    });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Approval added successfully.",
      updatedCount: result.modifiedCount + caseResult.modifiedCount,
    });

  } catch (error) {

    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();

    return res.status(500).json({
      message: "Error approving DRC Assign Manager Approvals",
      error: error.message || "Internal server error.",
    });
  }
};

export const Reject_DRC_Agreement_Approval = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { drc_id, approved_by, user_approver_id } = req.body;

    if (!drc_id || !user_approver_id || !approved_by) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "user_approver_id, drc_id, and approved_by are required"
      });
    }

    const approvalDoc = await user_approve_model.findOne(
      {
        DRC_id: drc_id,
        user_approver_id
      }
    ).session(session);

    if (!approvalDoc) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "No matching approver reference found" });
    }
    const deligate_id = approvalDoc.created_by;

    const result = await user_approve_model.updateOne(
      {
        DRC_id: drc_id,
        user_approver_id
      },
      {
        $set: {
          approve_status: "Reject",
        }
      },
      { session }
    );
    const agreement_result = await drc_agreement.updateOne(
      {
        drc_id,
        user_approver_id
      },
      {
        $set: {
          agreement_status: "Rejected",
        }
      },
      { session }
    );
    if(!agreement_result){
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "DRC agreement not updated" }); 
    }
    if (result.modifiedCount === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Approval update failed" });
    }

    let caseResult = { modifiedCount: 0 }; 

    // Create User Interaction Log
    const interaction_id = 16; //python
    const request_type = "python"; //python
    const created_by = approved_by;
    const dynamicParams = { drc_id };

    await createUserInteractionFunction({
      Interaction_ID: interaction_id,
      User_Interaction_Type: request_type,
      delegate_user_id: deligate_id,
      Created_By: created_by,
      User_Interaction_Status: "Open",
      User_Interaction_Status_DTM: new Date(),
      session,
      ...dynamicParams,
    });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Rejecte added successfully.",
      updatedCount: result.modifiedCount + caseResult.modifiedCount,
    });

  } catch (error) {

    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();

    return res.status(500).json({
      message: "Error approving DRC Assign Manager Approvals",
      error: error.message || "Internal server error.",
    });
  }
};

export const Download_User_Approval_List = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { user_type, from_date, to_date,create_by} = req.body;

    if (!create_by) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Created_By is required" });
    }
    const parameters = {
      user_type,
      from_date: from_date && !isNaN(new Date(from_date)) ? new Date(from_date).toISOString() : null,
      to_date: to_date && !isNaN(new Date(to_date)) ? new Date(to_date).toISOString() : null,
    };

    const taskData = {
      Template_Task_Id: 54,
      task_type: " Download User Approval List", 
      ...parameters,
      Created_By:create_by, 
      task_status: "open",
    };

    await createTaskFunction(taskData, session);

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Task for user approval download successfully create.",
      taskData,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      message: "Internal server error.",
      error: error.message || "Internal server error.",
    });
  }
}

