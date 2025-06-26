/* 
    Purpose: This template is used for the DRC Controllers.
    Created Date: 2024-11-21
    Created By: Janendra Chamodi (apjanendra@gmail.com)
    Last Modified Date: 2024-11-24
    Modified By: Janendra Chamodi (apjanendra@gmail.com)
                Naduni Rabel (rabelnaduni2000@gmail.com)
                Lasandi Randini (randini-im20057@stu.kln.ac.lk)
    Version: Node.js v20.11.1
    Dependencies: mysql2
    Related Files: DRC_route.js
    Notes:  
*/



// import db from "../config/db.js";
import db from "../config/db.js";
import DRC from "../models/Debt_recovery_company.js";
import mongoose from "mongoose";
import RO from  "../models/Recovery_officer.js"; 
import RTOM from "../models/Rtom.js"
import moment from "moment";

// // Function to register a new Debt Recovery Company (DRC)
// export const registerDRC = async (req, res) => {
//   const { DRC_Name, DRC_Abbreviation, Contact_Number } = req.body;

//   try {
//     // Validate required fields
//     if (!DRC_Name || !DRC_Abbreviation || !Contact_Number) {
//       return res.status(400).json({
//         status: "error",
//         message: "Failed to register DRC.",
//         errors: {
//           field_name: "All fields are required",
//         },
//       });
//     }

//     // Default values
//     const drcStatus = "Active"; // Default to Active status
//     const drcEndDate = ""; // Default end date is null
//     const createdBy = "Admin"; // Default creator
//     const create_dtm = moment().format("YYYY-MM-DD HH:mm:ss"); // Format date for SQL-like format

//     // Connect to MongoDB
//     const mongoConnection = await db.connectMongoDB();
//     if (!mongoConnection) {
//       throw new Error("MongoDB connection failed");
//     }

//     const counterResult = await mongoConnection.collection("collection_sequence").findOneAndUpdate(
//       { _id: "drc_id" },
//       { $inc: { seq: 1 } },
//       { returnDocument: "after", upsert: true }
//     );

//     console.log("Counter Result:", counterResult);

//     // Correctly extract the sequence ID from the top-level structure
//     if (!counterResult || !counterResult.seq) {
//       throw new Error("Failed to generate drc_id");
//     }

//     const drc_id = counterResult.seq;

//     // Save data to MongoDB
//     const newDRC = new DRC({
//       drc_id,
//       drc_abbreviation: DRC_Abbreviation,
//       drc_name: DRC_Name,
//       drc_status: drcStatus,
//       teli_no: Contact_Number,
//       drc_end_dat: drcEndDate,
//       create_by: createdBy,
//       create_dtm: moment(create_dtm, "YYYY-MM-DD HH:mm:ss").toDate(), // Save the formatted date here
//       services_of_drc: [], // Initialize with an empty array of services
//     });

//     await newDRC.save();

//     // // Save data to MySQL
//     // const insertDRCQuery = `
//     //   INSERT INTO debt_recovery_company (
//     //     drc_id,
//     //     drc_name,
//     //     drc_abbreviation,
//     //     contact_number,
//     //     drc_status,
//     //     drc_end_dat,
//     //     create_by,
//     //     create_dtm
//     //   ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//     // `;

//     // const valuesForQuery = [
//     //   drc_id,
//     //   DRC_Name,
//     //   DRC_Abbreviation,
//     //   Contact_Number,
//     //   drcStatus,
//     //   drcEndDate,
//     //   createdBy,
//     //   create_dtm, // Save the formatted date here
//     // ];

//     // await new Promise((resolve, reject) => {
//     //   db.mysqlConnection.query(insertDRCQuery, valuesForQuery, (err, result) => {
//     //     if (err) {
//     //       console.error("Error inserting DRC into MySQL:", err);
//     //       reject(err);
//     //     } else {
//     //       resolve(result);
//     //     }
//     //   });
//     // });

//     // Return success response
//     res.status(201).json({
//       status: "success",
//       message: "DRC registered successfully.",
//       data: {
//         drc_id,
//         drc_abbreviation: DRC_Abbreviation,
//         drc_name: DRC_Name,
//         contact_no: Contact_Number,
//         drc_status: drcStatus,
//         drc_end_date: drcEndDate,
//         created_by: createdBy,
//         created_dtm: create_dtm,
//       },
//     });
//   } catch (error) {
//     console.error("Unexpected error during DRC registration:", error);
//     return res.status(500).json({
//       status: "error",
//       message: "Failed to register DRC.",
//       errors: {
//         exception: error.message,
//       },
//     });
//   }
// }; 

// export const registerDRC = async (req, res) => {
//   const { 
//     drc_name, 
//     drc_business_registration_number, 
//     drc_address, 
//     drc_contact_no, 
//     drc_email, 
//     create_by,
//     slt_coordinator,
//     services,
//     rtom
//   } = req.body;

//   try {
//     // Validate required fields
//     if (!drc_name || !drc_business_registration_number || !drc_address || 
//         !drc_contact_no || !drc_email || !create_by || 
//         !slt_coordinator || !services || !rtom) {
//       return res.status(400).json({
//         status: "error",
//         message: "Failed to register DRC.",
//         errors: {
//           field_name: "All fields are required",
//         },
//       });
//     }

//     // Default values
//     const drc_status = "Active"; // Default to Active status
//     const create_on = new Date(); // Current date and time

//     // Connect to MongoDB
//     const mongoConnection = await db.connectMongoDB();
//     if (!mongoConnection) {
//       throw new Error("MongoDB connection failed");
//     }

//     // Generate unique DRC ID
//     const counterResult = await mongoConnection.collection("collection_sequence").findOneAndUpdate(
//       { _id: "drc_id" },
//       { $inc: { seq: 1 } },
//       { returnDocument: "after", upsert: true }
//     );

//     console.log("Counter Result:", counterResult);

//     // Fix: Check if counterResult has value property or seq directly
//     const drc_id = counterResult.value ? counterResult.value.seq : counterResult.seq;
    
//     if (!drc_id) {
//       throw new Error("Failed to generate drc_id");
//     }

//     // Validate sub-documents
//     // Validate coordinator data
//     if (!Array.isArray(slt_coordinator) || slt_coordinator.length === 0) {
//       throw new Error("At least one SLT coordinator is required");
//     }

//     // Validate services data
//     if (!Array.isArray(services) || services.length === 0) {
//       throw new Error("At least one service is required");
//     }

//     // Validate RTOM data
//     if (!Array.isArray(rtom) || rtom.length === 0) {
//       throw new Error("At least one RTOM is required");
//     }

//     // Validate rtom_billing_center_code
//     for (const r of rtom) {
//       if (!r.rtom_billing_center_code) {
//         throw new Error("RTOM billing center code is required");
//       }
//     }

//     // Save data to MongoDB
//     const newDRC = new DRC({
//       doc_version: 1,
//       drc_id,
//       drc_name,
//       drc_business_registration_number,
//       drc_address,
//       drc_contact_no,
//       drc_email,
//       drc_status,
//       create_by,
//       create_on,
//       drc_end_dtm: null,
//       drc_end_by: null,
//       slt_coordinator: slt_coordinator.map(coord => ({
//         service_no: coord.service_no,
//         slt_coordinator_name: coord.slt_coordinator_name,
//         slt_coordinator_email: coord.slt_coordinator_email,
//         coordinator_create_dtm: coord.coordinator_create_dtm || new Date(),
//         coordinator_create_by: coord.coordinator_create_by || create_by,
//         coordinator_end_by: coord.coordinator_end_by || null,
//         coordinator_end_dtm: coord.coordinator_end_dtm || null
//       })),
//       services: services.map(service => ({
//         service_type: service.service_type,
//         service_status: service.service_status || "Active",
//         create_by: service.create_by || create_by,
//         create_on: service.create_on || moment().format("YYYY-MM-DD HH:mm:ss"),
//         status_update_dtm: service.status_update_dtm || new Date(),
//         status_update_by: service.status_update_by || create_by
//       })),
//       rtom: rtom.map(r => ({
//         rtom_id: r.rtom_id,
//         rtom_name: r.rtom_name,
//         rtom_status: r.rtom_status || "Active",
//         rtom_billing_center_code: r.rtom_billing_center_code,
//         create_by: r.create_by || create_by,
//         create_dtm: r.create_dtm || new Date(),
//         status_update_by: r.status_update_by || create_by,
//         status_update_dtm: r.status_update_dtm || new Date()
//       }))
//     });

//     await newDRC.save();

//     // Return success response
//     res.status(201).json({
//       status: "success",
//       message: "DRC registered successfully.",
//       data: {
//         drc_id,
//         drc_name,
//         drc_business_registration_number,
//         drc_address,
//         drc_contact_no,
//         drc_email,
//         drc_status,
//         create_by,
//         create_on,
//         slt_coordinator: newDRC.slt_coordinator,
//         services: newDRC.services,
//         rtom: newDRC.rtom
//       },
//     });
//   } catch (error) {
//     console.error("Unexpected error during DRC registration:", error);
//     return res.status(500).json({
//       status: "error",
//       message: "Failed to register DRC.",
//       errors: {
//         exception: error.message,
//       },
//     });
//   }
// };


// export const changeDRCStatus = async (req, res) => {
//   const { drc_id, drc_status } = req.body;

//   try {
//     if (!drc_id || typeof drc_status === 'undefined') {
//       return res.status(400).json({
//         status: "error",
//         message: "Failed to update DRC status.",
//         errors: {
//           code: 400,
//           description: "DRC ID and status are required.",
//         },
//       });
//     }

//     /*
//     // MySQL
//     const updateStatusInMySQL = () =>
//       new Promise((resolve, reject) => {
//         const query = `
//           UPDATE debt_recovery_company
//           SET drc_status = ?
//           WHERE drc_id = ?
//         `;
//         db.mysqlConnection.query(query, [drc_status, drc_id], (err, result) => {
//           if (err) return reject(err);
//           resolve(result);
//         });
//       });

//     const mysqlResult = await updateStatusInMySQL();

//     // Check if MySQL update affected any rows
//     if (mysqlResult.affectedRows === 0) {
//       return res.status(404).json({
//         status: "error",
//         message: "Failed to update DRC status.",
//         errors: {
//           code: 404,
//           description: "No record found with the provided DRC ID.",
//         },
//       });
//     }
//     */

//     //  Mongo
//     const updateStatusInMongoDB = await DRC.findOneAndUpdate(
//       { drc_id },
//       { drc_status },
//       { new: true }
//     );

//     // Check if MongoDB update 
//     if (!updateStatusInMongoDB) {
//       return res.status(404).json({
//         status: "error",
//         message: "Failed to update DRC status in MongoDB.",
//         errors: {
//           code: 404,
//           description: "No DRC found in MongoDB for the given drc_id.",
//         },
//       });
//     }

//     // Response
//     return res.status(200).json({
//       status: "success",
//       message: "DRC status updated successfully in MongoDB.",
//       data: updateStatusInMongoDB,
//     });

//   } catch (err) {
//     console.error("Error occurred while updating DRC status:", err);
//     return res.status(500).json({
//       status: "error",
//       message: "Failed to update DRC status.",
//       errors: {
//         code: 500,
//         description: "An unexpected error occurred. Please try again later.",
//       },
//     });
//   }
// };

export const changeDRCStatus = async (req, res) => {
  const { drc_id, drc_status } = req.body;

  try {
    if (!drc_id || typeof drc_status === 'undefined') {
      return res.status(400).json({
        status: "error",
        message: "Failed to update DRC status.",
        errors: {
          code: 400,
          description: "DRC ID and status are required.",
        },
      });
    }

    /*
    // MySQL
    const updateStatusInMySQL = () =>
      new Promise((resolve, reject) => {
        const query = `
          UPDATE debt_recovery_company
          SET drc_status = ?
          WHERE drc_id = ?
        `;
        db.mysqlConnection.query(query, [drc_status, drc_id], (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });

    const mysqlResult = await updateStatusInMySQL();

    // Check if MySQL update affected any rows
    if (mysqlResult.affectedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "Failed to update DRC status.",
        errors: {
          code: 404,
          description: "No record found with the provided DRC ID.",
        },
      });
    }
    */

    //  Mongo
    const updateStatusInMongoDB = await DRC.findOneAndUpdate(
      { drc_id },
      { drc_status },
      { new: true }
    );

    // Check if MongoDB update 
    if (!updateStatusInMongoDB) {
      return res.status(404).json({
        status: "error",
        message: "Failed to update DRC status in MongoDB.",
        errors: {
          code: 404,
          description: "No DRC found in MongoDB for the given drc_id.",
        },
      });
    }

    // Response
    return res.status(200).json({
      status: "success",
      message: "DRC status updated successfully in MongoDB.",
      data: updateStatusInMongoDB,
    });

  } catch (err) {
    console.error("Error occurred while updating DRC status:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to update DRC status.",
      errors: {
        code: 500,
        description: "An unexpected error occurred. Please try again later.",
      },
    });
  }
};

// export const getDRCDetails = async (req, res) => {
//   //let mysqlData = null;
//   let mongoData = null;

//   //try {
//   //   mysqlData = await new Promise((resolve, reject) => {
//   //     const select_query = `SELECT * FROM debt_recovery_company`;
//   //     db.mysqlConnection.query(select_query, (err, result) => {
//   //       if (err) {
//   //         return reject(new Error("Error retieving DRC details"));
//   //       }
//   //       resolve(result);
//   //     });
//   //   });
//   // } catch (error) {
//   //   console.error("MySQL fetch error:", error.message);
//   // }

  
//   try {
//     mongoData = await DRC.find({}).select('-services_of_drc');
//   } catch (error) {
//     console.error("Error fetching data from MongoDB:", error.message);
//     return res.status(500).json({
//       status: "error",
//       message: "Failed to retrieve DRC details.",
//       errors: {
//         code: 500,
//         description: "Internal server error occurred while fetching DRC details.",
//       },
//     });
//   }

//   // if (!mysqlData || mysqlData.length === 0) {
//   //   return res.status(500).json({
//   //     status: "error",
//   //     message: "Failed to retrieve DRC details.",
//   //     errors: {
//   //       code: 500,
//   //       description: "Internal server error occurred while fetching DRC details.",
//   //     },
//   //   });
//   // }

//   return res.status(200).json({
//     status: "success",
//     message: "DRC details retrieved successfully.",
//     data: {
//      // mysql: mysqlData,
//         mongoData:mongoData
      
//     },
//   });
// };

export const getDRCDetails = async (req, res) => {
  //let mysqlData = null;
  let mongoData = null;

  //try {
  //   mysqlData = await new Promise((resolve, reject) => {
  //     const select_query = `SELECT * FROM debt_recovery_company`;
  //     db.mysqlConnection.query(select_query, (err, result) => {
  //       if (err) {
  //         return reject(new Error("Error retieving DRC details"));
  //       }
  //       resolve(result);
  //     });
  //   });
  // } catch (error) {
  //   console.error("MySQL fetch error:", error.message);
  // }

  
  try {
    mongoData = await DRC.find({}).select('-services_of_drc');
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve DRC details.",
      errors: {
        code: 500,
        description: "Internal server error occurred while fetching DRC details.",
      },
    });
  }

  // if (!mysqlData || mysqlData.length === 0) {
  //   return res.status(500).json({
  //     status: "error",
  //     message: "Failed to retrieve DRC details.",
  //     errors: {
  //       code: 500,
  //       description: "Internal server error occurred while fetching DRC details.",
  //     },
  //   });
  // }

  return res.status(200).json({
    status: "success",
    message: "DRC details retrieved successfully.",
    data: {
     // mysql: mysqlData,
        mongoData:mongoData
      
    },
  });
};


// export const getDRCDetailsById = async(req, res) => {

//   //let mysqlData = null;
//   let mongoData = null;
//   const { DRC_ID } = req.body;

//   if (!DRC_ID) {
//         return res.status(400).json({
//           status: "error",
//           message: "Failed to retrieve DRC details.",
//           errors: {
//             code: 400,
//             description: "DRC ID is required.",
//           },
//         });
//   }
//   // try {

//   //   mysqlData = await new Promise((resolve, reject) => {
//   //     const select_query = `SELECT * FROM debt_recovery_company
//   //                           WHERE drc_id = ?`;
//   //     db.mysqlConnection.query(select_query, [DRC_ID],(err, result) => {
//   //       if (err) {
//   //         return reject(new Error("Error retieving DRC details"));
//   //       }
//   //       resolve(result);
//   //     });
//   //   });
//   // } catch (error) {
//   //   console.error("MySQL fetch error:", error.message);
//   // }

  
//   try {
//     mongoData = await DRC.find({drc_id:DRC_ID}).select('-services_of_drc');
//   } catch (error) {
//     return res.status(500).json({
//       status: "error",
//       message: "Failed to retrieve DRC details.",
//       errors: {
//         code: 500,
//         description: "Internal server error occurred while fetching DRC details.",
//       },
//     });
//   }

//   // if (!mysqlData || mysqlData.length === 0) {
//   //   return res.status(500).json({
//   //     status: "error",
//   //     message: "Failed to retrieve DRC details.",
//   //     errors: {
//   //       code: 500,
//   //       description: "Internal server error occurred while fetching DRC details.",
//   //     },
//   //   });
//   // }

//   return res.status(200).json({
//     status: "success",
//     message: "DRC details retrieved successfully.",
//     data: {
//       //mysql: mysqlData,
//       mongoData:mongoData
      
//     },
//   });
// };

export const getDRCDetailsById = async(req, res) => {

  //let mysqlData = null;
  let mongoData = null;
  const { DRC_ID } = req.body;

  if (!DRC_ID) {
        return res.status(400).json({
          status: "error",
          message: "Failed to retrieve DRC details.",
          errors: {
            code: 400,
            description: "DRC ID is required.",
          },
        });
  }
  // try {

  //   mysqlData = await new Promise((resolve, reject) => {
  //     const select_query = `SELECT * FROM debt_recovery_company
  //                           WHERE drc_id = ?`;
  //     db.mysqlConnection.query(select_query, [DRC_ID],(err, result) => {
  //       if (err) {
  //         return reject(new Error("Error retieving DRC details"));
  //       }
  //       resolve(result);
  //     });
  //   });
  // } catch (error) {
  //   console.error("MySQL fetch error:", error.message);
  // }

  
  try {
    mongoData = await DRC.find({drc_id:DRC_ID}).select('-services_of_drc');
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve DRC details.",
      errors: {
        code: 500,
        description: "Internal server error occurred while fetching DRC details.",
      },
    });
  }

  // if (!mysqlData || mysqlData.length === 0) {
  //   return res.status(500).json({
  //     status: "error",
  //     message: "Failed to retrieve DRC details.",
  //     errors: {
  //       code: 500,
  //       description: "Internal server error occurred while fetching DRC details.",
  //     },
  //   });
  // }

  return res.status(200).json({
    status: "success",
    message: "DRC details retrieved successfully.",
    data: {
      //mysql: mysqlData,
      mongoData:mongoData
      
    },
  });
};

// /**
//  * Inputs:
//  * - None
//  * 
//  * Success Result:
//  * - Returns a success response with the list of DRC records having drc_status equal to 'Active',
//  *   excluding the 'services_of_drc' field from each record.
//  */
export const getActiveDRCDetails= async(req, res) => {

  //let mysqlData = null;
  let mongoData = null;

  // try {
  //   mysqlData = await new Promise((resolve, reject) => {
  //     const select_query = `SELECT * FROM debt_recovery_company
  //                           WHERE drc_status='Active'`;
  //     db.mysqlConnection.query(select_query, (err, result) => {
  //       if (err) {
  //         return reject(new Error("Error retieving DRC details"));
  //       }
  //       resolve(result);
  //     });
  //   });
  // } catch (error) {
  //   console.error("MySQL fetch error:", error.message);
  // }

  
  try {
    mongoData = await DRC.find({drc_status:'Active'}).select('-services_of_drc');
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve DRC details.",
      errors: {
        code: 500,
        description: "Internal server error occurred while fetching DRC details.",
      },
    });
  }

  // if (!mysqlData || mysqlData.length === 0) {
  //   return res.status(500).json({
  //     status: "error",
  //     message: "Failed to retrieve DRC details.",
  //     errors: {
  //       code: 500,
  //       description: "Internal server error occurred while fetching DRC details.",
  //     },
  //   });
  // }

  return res.status(200).json({
    status: "success",
    message: "DRC details retrieved successfully.",
    data: {
      mongoData: mongoData,
      
    },
  });

};

// export const getDRCWithServicesByDRCId = async(req, res) => {


//   //let mysqlData = null;
//   let mongoData = null;
//   const  {DRC_ID} = req.body;   
  
//   if(!DRC_ID){
//     return res.status(404)
//     .json({ 
//       status:"error",
//       message: "Failed to retrieve DRC details.", 
//       errors:{
//         "code":404,
//         "description":"DRC with the given ID not found"
//       } 
//   });
//   }
//     // try {
//     //   mysqlData = await new Promise((resolve, reject) => {
//     //   const select_query = `
//     //       SELECT drc.*, 
//     //       CONCAT(
//     //         '[',
//     //          GROUP_CONCAT(
//     //           '{"id":', drc_s.id,
//     //           ',"service_id":', st.service_id,
//     //           ',"service_type":"', st.service_type, '"', 
//     //           ',"service_status":"', st.service_status, '"}' 
//     //           SEPARATOR ','
//     //             ),
//     //             ']'
//     //             )  AS services_of_drc            
//     //           FROM debt_recovery_company drc
//     //           LEFT JOIN company_owned_services drc_s ON drc.drc_id = drc_s.drc_id
//     //           LEFT JOIN service_type st ON drc_s.service_id = st.service_id
//     //           WHERE drc.drc_id = ?
//     //           GROUP BY drc.drc_id;
//     //           `;
                      
//     //           db.mysqlConnection.query(select_query,[DRC_ID], (err, result) => {
//     //             if (err) {
//     //               return reject(new Error("Failed to retireve DRC details"));
//     //             }
//     //             const final_result = result.map(data => ({
//     //                   drc_id: data.drc_id,
//     //                   drc_abbreviation: data.drc_abbreviation,
//     //                   drc_name: data.drc_name,
//     //                   drc_status: data.drc_status,
//     //                   contact_no: data.contact_number,
//     //                   drc_end_date: data.drc_end_date,
//     //                   create_by: data.create_by,
//     //                   create_dtm: data.create_dtm,
//     //                   services_of_drc: JSON.parse(data.services_of_drc)  
//     //             }));
//     //               resolve(final_result);
//     //           });
//     //       });
                  
//     //     } catch (error) {
//     //         console.error("MySQL fetch error:", error.message);
//     //     }
       
//       try {
//             mongoData = await DRC.find({drc_id:DRC_ID});
//       } catch (error) {
//         return res.status(500).json({
//           status: "error",
//           message: "Failed to retrieve DRC details.",
//           errors: {
//             code: 500,
//             description: "Internal server error occurred while fetching DRC details.",
//           },
//         });
//       }
                  
//           // if (!mysqlData || mysqlData.length === 0) {
//           //     return res.status(500).json({
//           //               status: "error",
//           //               message: "Failed to retrieve DRC details.",
//           //               errors: {
//           //                 code: 500,
//           //                 description: "Internal server error occurred while fetching DRC details.",
//           //               },
//           //             });
//           //           }
                  
//               return res.status(200).json({
//                       status: "success",
//                       message: "DRC details retrieved successfully.",
//                       data: {
//                         mongoData: mongoData
//                       },
//                     });
// };  

export const getDRCWithServicesByDRCId = async(req, res) => {


  //let mysqlData = null;
  let mongoData = null;
  const  {DRC_ID} = req.body;   
  
  if(!DRC_ID){
    return res.status(404)
    .json({ 
      status:"error",
      message: "Failed to retrieve DRC details.", 
      errors:{
        "code":404,
        "description":"DRC with the given ID not found"
      } 
  });
  }
    // try {
    //   mysqlData = await new Promise((resolve, reject) => {
    //   const select_query = `
    //       SELECT drc.*, 
    //       CONCAT(
    //         '[',
    //          GROUP_CONCAT(
    //           '{"id":', drc_s.id,
    //           ',"service_id":', st.service_id,
    //           ',"service_type":"', st.service_type, '"', 
    //           ',"service_status":"', st.service_status, '"}' 
    //           SEPARATOR ','
    //             ),
    //             ']'
    //             )  AS services_of_drc            
    //           FROM debt_recovery_company drc
    //           LEFT JOIN company_owned_services drc_s ON drc.drc_id = drc_s.drc_id
    //           LEFT JOIN service_type st ON drc_s.service_id = st.service_id
    //           WHERE drc.drc_id = ?
    //           GROUP BY drc.drc_id;
    //           `;
                      
    //           db.mysqlConnection.query(select_query,[DRC_ID], (err, result) => {
    //             if (err) {
    //               return reject(new Error("Failed to retireve DRC details"));
    //             }
    //             const final_result = result.map(data => ({
    //                   drc_id: data.drc_id,
    //                   drc_abbreviation: data.drc_abbreviation,
    //                   drc_name: data.drc_name,
    //                   drc_status: data.drc_status,
    //                   contact_no: data.contact_number,
    //                   drc_end_date: data.drc_end_date,
    //                   create_by: data.create_by,
    //                   create_dtm: data.create_dtm,
    //                   services_of_drc: JSON.parse(data.services_of_drc)  
    //             }));
    //               resolve(final_result);
    //           });
    //       });
                  
    //     } catch (error) {
    //         console.error("MySQL fetch error:", error.message);
    //     }
       
      try {
            mongoData = await DRC.find({drc_id:DRC_ID});
      } catch (error) {
        return res.status(500).json({
          status: "error",
          message: "Failed to retrieve DRC details.",
          errors: {
            code: 500,
            description: "Internal server error occurred while fetching DRC details.",
          },
        });
      }
                  
          // if (!mysqlData || mysqlData.length === 0) {
          //     return res.status(500).json({
          //               status: "error",
          //               message: "Failed to retrieve DRC details.",
          //               errors: {
          //                 code: 500,
          //                 description: "Internal server error occurred while fetching DRC details.",
          //               },
          //             });
          //           }
                  
              return res.status(200).json({
                      status: "success",
                      message: "DRC details retrieved successfully.",
                      data: {
                        mongoData: mongoData
                      },
                    });
};  

// export const getDRCWithServices = async (req, res) => {
 
//   //let mysqlData = null;
//   let mongoData = null;
                  
//   // try {
//   //     mysqlData = await new Promise((resolve, reject) => {
//   //     const select_query = `
//   //         SELECT drc.*, 
//   //         CONCAT(
//   //           '[',
//   //            GROUP_CONCAT(
//   //             '{"id":', drc_s.id,
//   //             ',"service_id":', st.service_id,
//   //             ',"service_type":"', st.service_type, '"', 
//   //             ',"service_status":"', st.service_status, '"}' 
//   //             SEPARATOR ','
//   //               ),
//   //               ']'
//   //               )  AS services_of_drc            
//   //             FROM debt_recovery_company drc
//   //             LEFT JOIN company_owned_services drc_s ON drc.drc_id = drc_s.drc_id
//   //             LEFT JOIN service_type st ON drc_s.service_id = st.service_id
//   //             GROUP BY drc.drc_id;
//   //             `;
                      
//   //             db.mysqlConnection.query(select_query, (err, result) => {
//   //               if (err) {
//   //                 return reject(new Error("Failed to retireve DRC details"));
//   //               }
//   //               const final_result = result.map(data => ({
//   //                     drc_id: data.drc_id,
//   //                     drc_abbreviation: data.drc_abbreviation,
//   //                     drc_name: data.drc_name,
//   //                     drc_status: data.drc_status,
//   //                     contact_no: data.contact_number,
//   //                     drc_end_date: data.drc_end_date,
//   //                     create_by: data.create_by,
//   //                     create_dtm: data.create_dtm,
//   //                     services_of_drc: JSON.parse(data.services_of_drc)  
//   //               }));
//   //                 resolve(final_result);
//   //             });
//   //         });
                  
//   //       } catch (error) {
//   //           console.error("MySQL fetch error:", error.message);
//   //       }
       
//         try {
//             mongoData = await DRC.find({});
//           } catch (error) {
//             return res.status(500).json({
//               status: "error",
//               message: "Failed to retrieve DRC details.",
//               errors: {
//                 code: 500,
//                 description: "Internal server error occurred while fetching DRC details.",
//               },
//             });
//           }
                  
//           // if (!mysqlData  || mysqlData.length === 0) {
//           //     return res.status(500).json({
//           //               status: "error",
//           //               message: "Failed to retrieve DRC details.",
//           //               errors: {
//           //                 code: 500,
//           //                 description: "Internal server error occurred while fetching DRC details.",
//           //               },
//           //             });
//           //           }
                  
//               return res.status(200).json({
//                       status: "success",
//                       message: "DRC details retrieved successfully.",
//                       data: {
//                         // mysql: mysqlData,
//                         mongoData: mongoData
//                       },
//                     });
// };  

export const getDRCWithServices = async (req, res) => {
 
  //let mysqlData = null;
  let mongoData = null;
                  
  // try {
  //     mysqlData = await new Promise((resolve, reject) => {
  //     const select_query = `
  //         SELECT drc.*, 
  //         CONCAT(
  //           '[',
  //            GROUP_CONCAT(
  //             '{"id":', drc_s.id,
  //             ',"service_id":', st.service_id,
  //             ',"service_type":"', st.service_type, '"', 
  //             ',"service_status":"', st.service_status, '"}' 
  //             SEPARATOR ','
  //               ),
  //               ']'
  //               )  AS services_of_drc            
  //             FROM debt_recovery_company drc
  //             LEFT JOIN company_owned_services drc_s ON drc.drc_id = drc_s.drc_id
  //             LEFT JOIN service_type st ON drc_s.service_id = st.service_id
  //             GROUP BY drc.drc_id;
  //             `;
                      
  //             db.mysqlConnection.query(select_query, (err, result) => {
  //               if (err) {
  //                 return reject(new Error("Failed to retireve DRC details"));
  //               }
  //               const final_result = result.map(data => ({
  //                     drc_id: data.drc_id,
  //                     drc_abbreviation: data.drc_abbreviation,
  //                     drc_name: data.drc_name,
  //                     drc_status: data.drc_status,
  //                     contact_no: data.contact_number,
  //                     drc_end_date: data.drc_end_date,
  //                     create_by: data.create_by,
  //                     create_dtm: data.create_dtm,
  //                     services_of_drc: JSON.parse(data.services_of_drc)  
  //               }));
  //                 resolve(final_result);
  //             });
  //         });
                  
  //       } catch (error) {
  //           console.error("MySQL fetch error:", error.message);
  //       }
       
        try {
            mongoData = await DRC.find({});
          } catch (error) {
            return res.status(500).json({
              status: "error",
              message: "Failed to retrieve DRC details.",
              errors: {
                code: 500,
                description: "Internal server error occurred while fetching DRC details.",
              },
            });
          }
                  
          // if (!mysqlData  || mysqlData.length === 0) {
          //     return res.status(500).json({
          //               status: "error",
          //               message: "Failed to retrieve DRC details.",
          //               errors: {
          //                 code: 500,
          //                 description: "Internal server error occurred while fetching DRC details.",
          //               },
          //             });
          //           }
                  
              return res.status(200).json({
                      status: "success",
                      message: "DRC details retrieved successfully.",
                      data: {
                        // mysql: mysqlData,
                        mongoData: mongoData
                      },
                    });
};  
                  
// export const endDRC = async (req, res) => {
//   try {
//     const { drc_id, drc_end_dat, remark, remark_edit_by } = req.body;

//     // Validate required fields
//     if (!drc_id) {
//       return res.status(400).json({
//         status: "error",
//         message: "DRC ID is required.",
//       });
//     }

//     if (!remark || !remark_edit_by) {
//       return res.status(400).json({
//         status: "error",
//         message: "Remark and Remark Edit By fields are required.",
//       });
//     }

//     // Find the DRC record
//     const drc = await DRC.findOne({ drc_id });
//     if (!drc) {
//       return res.status(404).json({
//         status: "error",
//         message: `No DRC found for the given drc_id: ${drc_id}`,
//       });
//     }

//     // Update DRC status and end date
//     drc.drc_status = "Ended";
//     if (drc_end_dat) {
//       drc.drc_end_dat = drc_end_dat;
//     }

//     // Add new remark
//     const newRemark = {
//       remark,
//       remark_Dtm: new Date(),
//       remark_edit_by,
//     };
//     drc.remark.push(newRemark);

//     // Save the updated DRC record
//     await drc.save();

//     // Respond with success message and updated DRC
//     return res.status(200).json({
//       status: "success",
//       message: "DRC ended successfully.",
//       data: drc,
//     });
//   } catch (error) {
//     console.error("Error updating DRC details:", error);
//     return res.status(500).json({
//       status: "error",
//       message: error.message || "An unexpected error occurred.",
//     });
//   }
// };

export const endDRC = async (req, res) => {
  try {
    const { drc_id, drc_end_dat, remark, remark_edit_by } = req.body;

    // Validate required fields
    if (!drc_id) {
      return res.status(400).json({
        status: "error",
        message: "DRC ID is required.",
      });
    }

    if (!remark || !remark_edit_by) {
      return res.status(400).json({
        status: "error",
        message: "Remark and Remark Edit By fields are required.",
      });
    }

    // Find the DRC record
    const drc = await DRC.findOne({ drc_id });
    if (!drc) {
      return res.status(404).json({
        status: "error",
        message: `No DRC found for the given drc_id: ${drc_id}`,
      });
    }

    // Update DRC status and end date
    drc.drc_status = "Ended";
    if (drc_end_dat) {
      drc.drc_end_dat = drc_end_dat;
    }

    // Add new remark
    const newRemark = {
      remark,
      remark_Dtm: new Date(),
      remark_edit_by,
    };
    drc.remark.push(newRemark);

    // Save the updated DRC record
    await drc.save();

    // Respond with success message and updated DRC
    return res.status(200).json({
      status: "success",
      message: "DRC ended successfully.",
      data: drc,
    });
  } catch (error) {
    console.error("Error updating DRC details:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "An unexpected error occurred.",
    });
  }
};


// export const DRCRemarkDetailsById = async (req, res) => {
//   try {
//     const { drc_id } = req.body;

//     // Validate the drc_id in the request body
//     if (!drc_id) {
//       return res.status(400).json({
//         status: "error",
//         message: "DRC ID is required.",
//       });
//     }

//     // Find the DRC document by drc_id
//     const drc = await DRC.findOne({ drc_id: Number(drc_id) }, { remark: 1, _id: 0 });

//     if (!drc) {
//       return res.status(404).json({
//         status: "error",
//         message: `No DRC found with the given drc_id: ${drc_id}`,
//       });
//     }

//     // Respond with the remarks array
//     return res.status(200).json({
//       status: "success",
//       message: "Remark details fetched successfully.",
//       data: drc.remark, // Return only the remarks array
//     });
//   } catch (error) {
//     console.error("Error fetching remark details:", error);
//     return res.status(500).json({
//       status: "error",
//       message: "Failed to fetch remark details. Please try again later.",
//     });
//   }
// };


// //List DRCs with RO & RTOM count
// export const List_All_DRC_Details = async (req, res) => {
//   try {
//     const { status } = req.body;

//     // Only add filter if status is defined and non-empty
//     const filter = status ? { drc_status: status } : {};

//     const drcList = await DRC.find(filter);

//     // // 1. Get DRCs filtered by status
//     // const drcList = await DRC.find({ drc_status: status });

//     // 2. Count ROs, RTOMs, and services for each DRC
//     const responseData = await Promise.all(
//       drcList.map(async (drc) => {
//         const roList = await RO.find({ drc_id: drc.drc_id });

//         const roCount = roList.length;

//         const rtomCount = roList.reduce((acc, ro) => {
//           return acc + (ro.rtoms_for_ro?.length || 0);
//         }, 0);

//         const serviceCount = drc.services?.length || 0;

//         return {
//           drc_id: drc.drc_id,
//           drc_name: drc.drc_name,
//           drc_email: drc.drc_email,
//           drc_status: drc.drc_status,
//           teli_no: drc.drc_contact_no,
//           ro_count: roCount,
//           rtom_count: rtomCount,
//           service_count: serviceCount,
//           drc_business_registration_number: drc.drc_business_registration_number,
//         };
//       })
//     );

//     res.status(200).json(responseData);
//   } catch (err) {
//     console.error("Error fetching DRC data with counts:", err);
//     res.status(500).json({ error: "Server Error" });
//   }
// };

/**
 * /List_All_DRC_Details
 *
 * Description:
 * This endpoint retrieves a paginated summary of all Debt Recovery Companies (DRCs) based on optional status filtering.
 * It returns key metadata for each DRC, such as business details, number of services, RTOMs, and associated Recovery Officers.
 *
 * Collections Used:
 * - Debt_recovery_company: Main collection containing debt recovery company data.
 * - Recovery_officer: Used to count the number of Recovery Officers assigned to each DRC.
 *
 * Request Body Parameters:
 * - status (Optional): Filters the results based on DRC status (e.g., "Active", "Inactive", "Terminate").
 * - page (Optional): Page number for pagination. Defaults to 1 if not provided or invalid.
 *
 * Response:
 * - HTTP 200: Success. Returns a paginated list of DRC summaries with counts.
 * - HTTP 404: No DRC records found matching the query.
 * - HTTP 500: Internal server error during aggregation or DB operations.
 *
 * Output Fields:
 * - drc_id: Unique identifier for the DRC.
 * - drc_name: Name of the DRC.
 * - drc_email: Email address of the DRC.
 * - drc_status: Current status of the DRC (Active, Inactive, or Terminate).
 * - drc_contact_no: Contact number of the DRC.
 * - drc_business_registration_number: Official BRN of the DRC.
 * - service_count: Total number of service entries associated with the DRC.
 * - rtom_count: Total number of RTOM entries listed under the DRC.
 * - ro_count: Total number of Recovery Officers associated with the DRC (via `Recovery_officer` collection).
 * - created_on: Timestamp when the DRC record was created.
 *
 * Flow:
 * 1. Parse and validate `status` and `page` from the request body.
 * 2. Construct a MongoDB aggregation pipeline:
 *    - Filter DRCs by status (if provided).
 *    - Lookup Recovery Officers and count them per DRC.
 *    - Count services and RTOMs directly from the embedded arrays in the DRC document.
 *    - Project only the necessary summary fields.
 *    - Sort by creation date (descending), then apply pagination.
 * 3. Count total matching documents for pagination metadata.
 * 4. Return results and pagination metadata in a structured JSON response.
 * 5. Catch and log errors, returning appropriate status messages.
 */
export const List_All_DRC_Details = async (req, res) => {
  try {
    const { status, page } = req.body;

    const query = {};
    if (status) query.drc_status = status;

    let currentPage = Number(page);
    if (isNaN(currentPage) || currentPage < 1) currentPage = 1;
    const limit = currentPage === 1 ? 10 : 30;
    const skip = currentPage === 1 ? 0 : 10 + (currentPage - 2) * 30;

    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: "Recovery_officer",
          localField: "drc_id",
          foreignField: "drc_id",
          as: "ros",
        },
      },
      {
        $addFields: {
          ro_count: { $size: "$ros" }
        }
      },
      {
        $project: {
          _id: 0,
          drc_id: 1,
          drc_name: 1,
          drc_email: 1,
          drc_status: 1,
          drc_contact_no: "$drc_contact_no",
          drc_business_registration_number: 1,
          service_count: { $size: { $ifNull: ["$services", []] } },
          ro_count: 1,
          rtom_count: { $size: { $ifNull: ["$rtom", []] } },
          created_on: 1,
        }
      },
      { $sort: { created_on: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    const drcData = await DRC.aggregate(pipeline);

    if (!drcData || drcData.length === 0) {
      return res.status(404).json({
        status: "success",
        message: "No matching DRC records found.",
        data: [],
      });
    }

    const totalCount = await DRC.countDocuments(query);

    return res.status(200).json({
      status: "success",
      message: "DRC details fetched successfully",
      data: drcData,
      pagination: {
        total: totalCount,
        page: currentPage,
        perPage: limit,
        totalPages: Math.ceil(
          totalCount <= 10
            ? totalCount / 10
            : (totalCount - 10) / 30 + 1
        ),
      },
    });
  } catch (error) {
    console.error("Error fetching All DRC details", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      errors: {
        code: 500,
        description: error.message,
      },
    });
  }
};

export const DRCRemarkDetailsById = async (req, res) => {
  try {
    const { drc_id } = req.body;

    // Validate the drc_id in the request body
    if (!drc_id) {
      return res.status(400).json({
        status: "error",
        message: "DRC ID is required.",
      });
    }

    // Find the DRC document by drc_id
    const drc = await DRC.findOne({ drc_id: Number(drc_id) }, { remark: 1, _id: 0 });

    if (!drc) {
      return res.status(404).json({
        status: "error",
        message: `No DRC found with the given drc_id: ${drc_id}`,
      });
    }

    // Respond with the remarks array
    return res.status(200).json({
      status: "success",
      message: "Remark details fetched successfully.",
      data: drc.remark, // Return only the remarks array
    });
  } catch (error) {
    console.error("Error fetching remark details:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch remark details. Please try again later.",
    });
  }
};

export const List_RTOM_Details_Owen_By_DRC_ID = async (req, res) => {
  try {
    const { drc_id } = req.body;

    // Step 1: Find DRC by drc_id
    const drc = await DRC.findOne({ drc_id: parseInt(drc_id) }, { rtom: 1, services: 1 });

    if (!drc) {
      return res.status(404).json({ message: "DRC not found" });
    }

    // Extract RTOM IDs
    const rtomIds = drc.rtom.map(r => r.rtom_id);

    // Step 2: Query RTOM collection for full RTOM data
    const rtomDetails = await RTOM.find(
      { rtom_id: { $in: rtomIds } },
      {
        _id: 0,
        rtom_name: 1,
        rtom_mobile_no: 1,
        handling_type: 1,
        billing_center_Code: 1,
        rtom_end_date: 1
      }
    );

    // Step 3: Add RO count to each RTOM object (assuming "RO count" means service count)
    const roCount = drc.services.length;

    const result = rtomDetails.map(rtom => ({
      ...rtom._doc,
      ro_count: roCount
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const List_Service_Details_Owen_By_DRC_ID = async (req, res) => {
  try {
    const { drc_id } = req.body;

    const drc = await DRC.findOne(
      { drc_id: parseInt(drc_id) },
      { services: 1, _id: 0 }
    );

    if (!drc) {
      return res.status(404).json({ message: 'DRC not found' });
    }

    // Extract only required fields from each service
    const servicesData = drc.services.map(service => ({
      service_id: service.service_id,
      service_type: service.service_type,
      enable_date: service.create_on,
      status: service.service_status
    }));

    res.status(200).json(servicesData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

/*
  /List_DRC_Details_By_DRC_ID

  Description:
  This endpoint retrieves a summary of DRC (Debt Recovery Company) information based on a given DRC ID. 
  The response includes metadata about the DRC, latest SLT coordinator details, all associated services, and RTOM statuses.

  Collections Used:
  - Debt_recovery_company: Main collection containing debt recovery company data, services, coordinators, and RTOM info.

  Request Body Parameters:
  - drc_id (Required): The unique identifier of the DRC. Must be a valid DRC ID already present in the database.

  Response:
  - HTTP 200: Success. Returns the summarized DRC details including metadata, coordinator, services, and RTOMs.
  - HTTP 400: DRC ID not provided in the request body.
  - HTTP 404: No DRC found with the provided ID.
  - HTTP 500: Internal server error or DB aggregation failure.

  Output Fields:
  - create_on: Timestamp when the DRC entry was created (`create_dtm` field).
  - drc_business_registration_number: Business registration number of the DRC.
  - drc_contact_no: Contact number of the DRC.
  - drc_email: Email address of the DRC.
  - drc_address: Address of the DRC.
  - slt_coordinator: The most recent SLT coordinator entry with:
    - service_no
    - slt_coordinator_name
    - slt_coordinator_email
  - services: Array of service entries, each containing:
    - service_type
    - service_status
    - status_update_dtm
  - rtom: Array of RTOM entries, each containing:
    - rtom_name
    - rtom_status
    - status_update_dtm

  Flow:
  1. Validate the presence of `drc_id` in the request.
  2. Perform an aggregation on the DRC collection:
     - Match the document using the provided `drc_id`.
     - Project only the required fields from the main DRC record.
     - Extract and format the latest SLT coordinator.
     - Transform and format the `services` and `rtom` arrays to include relevant summary fields.
  3. Return the result in a clean, structured response.
  4. Handle all errors with appropriate logging and status codes.
*/
export const List_DRC_Details_By_DRC_ID = async (req, res) => {
  try {
    const { drc_id } = req.body;

    if (!drc_id) {
      return res.status(400).json({
        status: "error",
        message: "DRC_ID is required.",
      });
    }

    const result = await DRC.aggregate([
      { $match: { drc_id } },

      {
        $project: {
          _id: 0,
          drc_id: 1,
          drc_name: 1,
          create_on: 1,
          drc_business_registration_number: 1,
          drc_contact_no: 1,
          drc_email: 1,
          drc_address: 1,
          drc_status: 1,


          slt_coordinator: {
            $cond: {
              if: { $isArray: "$slt_coordinator" },
              then: {
                $map: {
                  input: "$slt_coordinator",
                  as: "coord",
                  in: {
                    service_no: "$$coord.service_no",
                    slt_coordinator_name: "$$coord.slt_coordinator_name",
                    slt_coordinator_email: "$$coord.slt_coordinator_email"
                  }
                }
              },
              else: []
            }
          },


          // Filtered and Mapped Services
          services: {
            $cond: {
              if: { $isArray: "$services" },
              then: {
                $map: {
                  input: "$services",
                  as: "srv",
                  in: {
                    service_type: "$$srv.service_type",
                    status_update_dtm: "$$srv.status_update_dtm",
                    service_status: "$$srv.service_status",
                  }
                }
              },
              else: []
            }
          },

          // Filtered and Mapped RTOMs
          rtom: {
            $cond: {
              if: { $isArray: "$rtom" },
              then: {
                $map: {
                  input: "$rtom",
                  as: "r",
                  in: {
                    rtom_name: "$$r.rtom_name",
                    status_update_dtm: "$$r.status_update_dtm",
                    rtom_status: "$$r.rtom_status",
                  }
                }
              },
              else: []
            }
          },
        },
      },
    ]);

    if (result.length === 0) {
      return res.status(404).json({
        status: "error",
        message: `No DRC found with ID: ${drc_id}`,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "DRC summary retrieved successfully.",
      data: result[0],
    });
  } catch (error) {
    console.error("Internal Server Error", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch DRC Details.",
      errors: { exception: error.message },
    });
  }
};


/*
  /Terminate_Company_By_DRC_ID

  Description:
  This endpoint updates the status of a Debt Recovery Company (DRC) to "Terminate". It also logs a termination remark with the user who performed the termination and the timestamp.

  Collections Used:
  - DRC: Updates the `drc_status`, `drc_end_dtm`, `drc_end_by`, and appends to the `remark` array.

  Request Body Parameters:
  - drc_id:        [Required] Unique identifier of the DRC to terminate.
  - remark:        [Required] A textual reason or note describing why the DRC is being terminated.
  - remark_by:     [Required] Identifier (User Id) of the user performing the termination.
  - remark_dtm:    [Required] ISO timestamp of when the termination is recorded.

  Response:
  - HTTP 200: Success. Returns the updated DRC document with termination applied.
  - HTTP 400: Validation error. Missing required fields like drc_id, remark, or remark_dtm.
  - HTTP 404: No DRC found for the given drc_id.
  - HTTP 500: Internal server error occurred while processing the request.

  Flow:
  1. Validate required input parameters.
  2. Find the DRC by `drc_id`. Return 404 if not found.
  3. Update the DRC:
     - Set `drc_status` to "Terminate".
     - Optionally set `drc_end_dtm` and `drc_end_by`.
     - Push the `remark` into the `remark` array with timestamp and author.
  4. Return the updated DRC document in the response.
  5. Handle and log any server or DB errors.
*/
export const Terminate_Company_By_DRC_ID = async (req, res) => {
  try {
    const { drc_id, remark, remark_by, remark_dtm } = req.body;

    // Validate input
    if (!drc_id || !remark || !remark_dtm) {
      return res.status(400).json({
        status: "error",
        message: "DRC_ID, remark, and remark_dtm are required.",
      });
    }

    // Find the company first to verify it exists
    const company = await DRC.findOne({ drc_id });

    if (!company) {
      return res.status(404).json({
        status: "error",
        message: `No Debt Company found with DRC_ID: ${drc_id}.`,
      });
    }

    // Update the company with terminate status and add the new remark
    const updatedCompany = await DRC.findOneAndUpdate(
      { drc_id },
      {
        $set: {
          drc_status: "Terminate",
          drc_end_dtm: remark_dtm,
          drc_end_by: remark_by,
        },
        $push: {
          remark: {
            remark: remark,
            remark_dtm: remark_dtm,
            remark_by: remark_by,
          },
        },
      },
      { new: true }
    );

    return res.status(200).json({
      status: "success",
      message: "Company terminated successfully.",
      data: updatedCompany,
    });
  } catch (error) {
    console.error("Error terminating company:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to terminate company.",
      errors: { exception: error.message },
    });
  }
};

/*
  /Update_DRC_With_Services_and_SLT_Cordinator

  Description:
  This endpoint updates the contact details, services, RTOMs, SLT coordinators, and remarks associated with a specific Debt Recovery Company (DRC). It supports partial updates and tracks modification metadata such as update timestamps and updated_by info.

  Collections Used:
  - DRC: Main collection updated with contact info, services, RTOMs, SLT coordinator entries, and remarks.

  Request Body Parameters:
  - drc_id:            [Required] Unique identifier of the DRC to update.
  - updated_by:        [Required] User performing the update (email or username).
  - drc_contact_no:    [Required] New contact number to update.
  - drc_email:         [Optional] New email address to update.
  - coordinator:       [Required] New SLT coordinator entry with fields:
                          - service_no
                          - slt_coordinator_name
                          - slt_coordinator_email
  - services:          [Required] Array of service entries to replace the current services list.
                          Each entry should have:
                          - service_type
                          - service_status
                          - (Auto-populated) status_update_dtm, status_update_by
  - rtom:              [Required] Array of RTOM entries to replace the current RTOMs list.
                          Each entry should have:
                          - rtom_name
                          - rtom_status
                          - (Auto-populated) status_update_dtm, status_update_by
  - remark:            [Optional] A textual note to be added as a remark with a timestamp and user reference.

  Response:
  - HTTP 200: Success. Returns the updated DRC document.
  - HTTP 400: Missing required parameters like drc_id or updated_by.
  - HTTP 404: No DRC found with the provided drc_id.
  - HTTP 500: Internal server/database error occurred.

  Flow:
  1. Validate presence of `drc_id` and `updated_by`.
  2. Fetch and validate that the DRC exists.
  3. Construct an update object dynamically for contact, services, and RTOMs.
  4. For services and RTOMs, auto-attach update metadata (`status_update_dtm`, `status_update_by`).
  5. Push new SLT coordinator and remark entries if provided.
  6. Apply `$set` update for contact, services, and RTOMs.
  7. Return the updated DRC document.
  8. Catch and handle any runtime errors.
*/
export const Update_DRC_With_Services_and_SLT_Cordinator = async (req, res) => {
  try {
    const {
      drc_id,
      drc_contact_no,
      drc_email,
      coordinator,
      services,
      rtom,
      remark,
      updated_by,
    } = req.body;

    console.log("Request body:", req.body);

    // Validate required fields
    if (!drc_id || !updated_by) {
      return res.status(400).json({
        status: "error",
        message: "DRC ID and updated_by are required fields.",
      });
    }

    // Find company to verify it exists
    const company = await DRC.findOne({ drc_id });

    if (!company) {
      return res.status(404).json({
        status: "error",
        message: `No Debt Company found with DRC_ID: ${drc_id}.`,
      });
    }

    // Create update object
    const updateObject = {};
    const currentDate = new Date();

    // Update contact information if provided
    if (drc_contact_no !== undefined) {
      updateObject.drc_contact_no = drc_contact_no;
    }

    if (drc_email !== undefined) {
      updateObject.drc_email = drc_email;
    }

    // Update services status if provided
    if (services && Array.isArray(services)) {
      // Pre-process services to update status_update fields
      const updatedServices = services.map((service) => ({
        ...service,
        status_update_dtm: currentDate,
        status_update_by: updated_by,
      }));

      updateObject.services = updatedServices;
    }

    // Update RTOM status if provided
    if (rtom && Array.isArray(rtom)) {
      // Pre-process RTOM entries to update status_update fields
      const updatedRtom = rtom.map((rtomEntry) => ({
        ...rtomEntry,
        status_update_dtm: currentDate,
        status_update_by: updated_by,
      }));

      updateObject.rtom = updatedRtom;
    }

    // Add a new coordinator entry if provided
    if (coordinator && coordinator.service_no) {
      const newCoordinator = {
        ...coordinator,
        coordinator_create_dtm: currentDate,
        coordinator_create_by: updated_by,
      };

      // Use $push to add the new coordinator to the array
      await DRC.findOneAndUpdate(
        { drc_id },
        { $push: { slt_coordinator: newCoordinator } },
        { new: true }
      );
    }

    // Add remark if provided
    if (remark) {
      await DRC.findOneAndUpdate(
        { drc_id },
        {
          $push: {
            remark: {
              remark: remark,
              remark_dtm: currentDate,
              remark_by: updated_by,
            },
          },
        },
        { new: true }
      );
    }

    // Apply the main updates if there are any fields to update
    const updatedCompany = await DRC.findOneAndUpdate(
      { drc_id },
      { $set: updateObject },
      { new: true }
    );

    return res.status(200).json({
      status: "success",
      message: "DRC information updated successfully.",
      data: updatedCompany,
    });
  } catch (error) {
    console.error("Error updating DRC information:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to update DRC information.",
      errors: { exception: error.message },
    });
  }
};

export const getUserIdOwnedByDRCId = async (drc_id) => {
  try {
    if (!drc_id) {
      throw new Error("DRC ID is required.");
    }
    const drc = await DRC.aggregate([
      { $match: { drc_id: drc_id } },
      {
        $project: {
          lastCoordinator: { $arrayElemAt: ["$slt_coordinator", -1] }
        }
      },
      {
        $match: {
          "lastCoordinator.coordinator_end_dtm": null
        }
      }
    ]);
    if (drc.length === 0) {
      return null;  
    }
    return drc[0].lastCoordinator.service_no;
  } catch (error) {
    console.error("Error fetching DRC details:", error);
    throw error;
  }
}


export const Create_DRC_With_Services_and_SLT_Coordinator = async (req, res) => {
  const { 
    drc_name, 
    drc_business_registration_number, 
    drc_address, 
    drc_contact_no, 
    drc_email, 
    create_by,
    slt_coordinator,
    services,
    rtom
  } = req.body;

  try {
    // Validate required fields
    if (!drc_name || !drc_business_registration_number || !drc_address || !drc_contact_no || !drc_email || !create_by || !slt_coordinator || !services || !rtom) {
      return res.status(400).json({
        status: "error",
        message: "Failed to register DRC.",
        errors: {
          field_name: "All fields are required",
        },
      });
    }

    // Default values
    const drc_status = "Active"; // Default to Active status
    const create_on = new Date(); // Current date and time

    // Connect to MongoDB
    const mongoConnection = await db.connectMongoDB();
    if (!mongoConnection) {
      throw new Error("MongoDB connection failed");
    }

    // Generate unique DRC ID
    const counterResult = await mongoConnection.collection("collection_sequence").findOneAndUpdate(
      { _id: "drc_id" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }
    );

    console.log("Counter Result:", counterResult);

    // Fix: Check if counterResult has value property or seq directly
    const drc_id = counterResult.value ? counterResult.value.seq : counterResult.seq;
    
    if (!drc_id) {
      throw new Error("Failed to generate drc_id");
    }

    // Validate sub-documents
    // Validate coordinator data
    if (!Array.isArray(slt_coordinator) || slt_coordinator.length === 0) {
      throw new Error("At least one SLT coordinator is required");
    }

    // Validate services data
    if (!Array.isArray(services) || services.length === 0) {
      throw new Error("At least one service is required");
    }

    // Validate RTOM data
    if (!Array.isArray(rtom) || rtom.length === 0) {
      throw new Error("At least one RTOM is required");
    }

    // Validate rtom_billing_center_code
    for (const r of rtom) {
      if (!r.rtom_billing_center_code) {
        throw new Error("RTOM billing center code is required");
      }
    }

    // Save data to MongoDB
    const newDRC = new DRC({
      doc_version: 1,
      drc_id,
      drc_name,
      drc_business_registration_number,
      drc_address,
      drc_contact_no,
      drc_email,
      drc_status,
      create_by,
      create_on,
      drc_end_dtm: null,
      drc_end_by: null,
      slt_coordinator: slt_coordinator.map(coord => ({
        service_no: coord.service_no,
        slt_coordinator_name: coord.slt_coordinator_name,
        slt_coordinator_email: coord.slt_coordinator_email,
        coordinator_create_dtm: coord.coordinator_create_dtm || new Date(),
        coordinator_create_by: coord.coordinator_create_by || create_by,
        coordinator_end_by: coord.coordinator_end_by || null,
        coordinator_end_dtm: coord.coordinator_end_dtm || null
      })),
      services: services.map(service => ({
        service_id: service.service_id,
        service_type: service.service_type,
        service_status: service.service_status || "Active",
        create_by: service.create_by || create_by,
        create_on: service.create_on || moment().format("YYYY-MM-DD HH:mm:ss"),
        status_update_dtm: service.status_update_dtm || new Date(),
        status_update_by: service.status_update_by || create_by
      })),
      rtom: rtom.map(r => ({
        rtom_id: r.rtom_id,
        rtom_name: r.rtom_name,
        rtom_status: r.rtom_status || "Active",
        rtom_billing_center_code: r.rtom_billing_center_code,
        create_by: r.create_by || create_by,
        create_dtm: r.create_dtm || new Date(),
        handling_type: r.handling_type,
        status_update_by: r.status_update_by || create_by,
        status_update_dtm: r.status_update_dtm || new Date()
      }))
    });

    await newDRC.save();

    // Return success response
    res.status(201).json({
      status: "success",
      message: "DRC registered successfully.",
      data: {
        drc_id,
        drc_name,
        drc_business_registration_number,
        drc_address,
        drc_contact_no,
        drc_email,
        drc_status,
        create_by,
        create_on,
        slt_coordinator: newDRC.slt_coordinator,
        services: newDRC.services,
        rtom: newDRC.rtom
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