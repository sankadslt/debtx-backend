/* 
    Purpose: This template is used for the DRC Controllers.
    Created Date: 2024-11-21
    Created By: Lasandi Randini (randini-im20057@stu.kln.ac.lk)
    Version: Node.js v20.11.1
    Dependencies: mysql2
    Related Files: DRC_route.js
    Notes:  
*/

import db from "../config/db.js";
import DRC from "../models/Debt_recovery_company.js";
import Service from "../models/Service.js";

import moment from "moment"; // Import moment.js for date formatting

// Get all DRC details created on a specific date
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
  const {
    DRC_Name,
    DRC_Business_Registration_Number,
    Contact_Number,
    Services,
  } = req.body;

  try {
    // Validate required fields
    if (!DRC_Name || !DRC_Business_Registration_Number || !Contact_Number) {
      return res.status(400).json({
        status: "error",
        message: "Failed to register DRC.",
        errors: {
          field_name: "All fields are required",
        },
      });
    }

    // Normalize the business registration number to lowercase for case-insensitive comparison
    const normalizedBusinessRegNumber =
      DRC_Business_Registration_Number.trim().toLowerCase();

    // Check if `drc_business_registration_number` is unique (case-insensitive)
    const existingDRC = await DRC.findOne({
      drc_business_registration_number: normalizedBusinessRegNumber,
    });

    if (existingDRC) {
      return res.status(400).json({
        status: "error",
        message: "DRC Business Registration Number already exists.",
      });
    }

    // Default values
    const drcStatus = "Active"; // Default to Active status
    const createdBy = "Admin"; // Default creator
    const create_dtm = moment().format("YYYY-MM-DD HH:mm:ss"); // Format date for SQL-like format

    // Generate `drc_id` from MongoDB counter
    const mongoConnection = await db.connectMongoDB();
    const counterResult = await mongoConnection
      .collection("counters")
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
