
/* 
    Purpose: This template is used for the DRC Controllers.
    Created Date: 2024-11-21
    Created By: Janendra Chamodi (apjanendra@gmail.com)
    Last Modified Date: 2024-11-21
    Modified By: Janendra Chamodi (apjanendra@gmail.com)
                Naduni Rabel (rabelnaduni2000@gmail.com)
                Lasandi Randini (randini-im20057@stu.kln.ac.lk)
                Ravindu Pathum  (ravindupathumiit@gmail.com)
    Version: Node.js v20.11.1
    Dependencies: axios , mariadb , mongoose
    Related Files: DRC_route.js
    Notes:  
*/


import db from "../config/db.js";
import Service from "../models/Service.js";


export const changeServiceStatus = async (req, res) => {
  try {
    const { service_id, service_status } = req.body;

    if (!service_id || !service_status) {
      return res.status(400).json({
        status: "error",
        message: "Failed to update the service status.",
        errors: {
          code: 400,
          description: "Missing required fields: service_id or service_status.",
        },
      });
    }
    const updateServiceStatusInMongoDB = await Service.findOneAndUpdate(
      { service_id },
      { service_status },
      { new: true }
    );

    // If Mongo fails 
    if (!updateServiceStatusInMongoDB) {
      return res.status(404).json({
        status: "error",
        message: "Failed to update the service status in MongoDB.",
        errors: {
          code: 404,
          description: "Service not found in MongoDB for the given service_id.",
        },
      });
    }
    // Response
    return res.status(200).json({
      status: "success",
      message: "Service status updated successfully in MongoDB.",
      data: updateServiceStatusInMongoDB,
    });
  } catch (err) {
    console.error("Error updating service status:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to update the service status.",
      errors: {
        code: 500,
        description: "An unexpected error occurred while updating the service status.",
      },
    });
  }
};

  
  export const getAllServices = async (req, res) => {
    let mongoData = null;
    try {
      mongoData = await Service.find({});
    } catch (error) {
      console.error("MongoDB fetch error:", error.message);
    }
  
    // Handle no data returned
    if (!mongoData) { 
      return res.status(500).json({
        status: "error",
        message: "Failed to retrieve service details.",
        errors: {
          code: 500,
          description: "Internal server error occurred while fetching service details.",
        },
      });
    }
  
    return res.status(200).json({
      status: "success",
      message: "Service details retrieved successfully.",
      data: {
        mongo: mongoData,
      },
    });
  };
  
  export const getServiceDetailsById = async (req, res) => {
    const { service_id } = req.body;
    if (!service_id) {
      return res.status(400).json({
        status: "error",
        message: "Failed to retrieve service details.",
        errors: {
          code: 400,
          description: "Service ID is required.",
        },
      });
    }
    // let mysqlData = null; 
    let mongoData = null;
  
    /*
    try {
      // MySQL
      mysqlData = await new Promise((resolve, reject) => {
        const query = `SELECT * FROM service_type WHERE service_id = ?`;
        db.mysqlConnection.query(query, [service_id], (err, result) => {
          if (err) {
            return reject(new Error("Error retrieving service details from MySQL"));
          }
          resolve(result);
        });
      });
    } catch (error) {
      console.error("MySQL fetch error:", error.message);
    }
    */
  
    try {
      // MongoDB
      mongoData = await Service.findOne({ service_id });
    } catch (error) {
      console.error("MongoDB fetch error:", error.message);
    }
  
    // Handle  no data returned
    if (!mongoData) { 
      return res.status(404).json({
        status: "error",
        message: "Service not found.",
        errors: {
          code: 404,
          description: `No service found with service_id: ${service_id}.`,
        },
      });
    }
  
    return res.status(200).json({
      status: "success",
      message: "Service details retrieved successfully.",
      data: {
        // mysql: mysqlData && mysqlData[0], 
        mongo: mongoData,
      },
    });
  };
  
  

  export const getActiveServiceDetails = async (req, res) => {
    try {
      const activeServices = await Service.find({ service_status: "Active" });
  
      if (!activeServices || activeServices.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "No active services found.",
          errors: {
            code: 404,
            description: "There are no services with active status.",
          },
        });
      }
  
      return res.status(200).json({
        status: "success",
        message: "Active services retrieved successfully.",
        data: activeServices,
      });
    } catch (err) {
      console.error("Error retrieving active services:", err);
      return res.status(500).json({
        status: "error",
        message: "Failed to retrieve active services.",
        errors: {
          code: 500,
          description: "An unexpected error occurred while fetching active services.",
        },
      });
    }
  };
  

// export const Register_Service_Type = async (req, res) => {
//   try {
//     let { service_type, create_by } = req.body;

//     if (!service_type) {
//       return res.status(400).json({
//         status: "error",
//         message: "service_type is required.",
//       });
//     }

//     // Normalize input
//     service_type = service_type.trim();

//     if (!service_type) {
//       return res.status(400).json({
//         status: "error",
//         message: "service_type cannot be empty or only spaces.",
//       });
//     }

//     const existingServiceType = await Service.findOne({ service_type });
//     if (existingServiceType) {
//       return res.status(400).json({
//         status: "error",
//         message: `The service_type '${service_type}' already exists.`,
//       });
//     }

//     const mongoConnection = await db.connectMongoDB();
//     if (!mongoConnection) {
//       throw new Error('MongoDB connection failed');
//     }

//       const counterResult = await mongoConnection.collection("collection_sequence").findOneAndUpdate(
//         { _id: "service_id" },
//         { $inc: { seq: 1 } },
//         { returnDocument: "after", upsert: true }
//       );
  
//       // Correctly extract the sequence ID from the top-level structure
//       if (!counterResult || !counterResult.seq) {
//         throw new Error("Failed to generate service_id");
//       }
  
//       const seq_service_id = counterResult.seq;
  
//       const default_service_type_status = "Active";

//     const newService = new Service({
//       service_type,
//       service_status: default_service_type_status,
//       service_id: seq_service_id,
//       create_by,
//     });

//     await newService.save();

//     res.status(200).json({
//       status: "success",
//       message: "Service data stored successfully",
//       service: newService,
//     });

//   } catch (err) {
//     console.error("Error storing service data:", err);
//     res.status(500).json({
//       status: "error",
//       message: "Error storing service data",
//       error: err.message,
//     });
//   }
// };

export const Register_Service_Type = async (req, res) => {
  try {
    let { service_type, create_by } = req.body;

    if (!service_type) {
      return res.status(400).json({
        status: "error",
        message: "service_type is required.",
      });
    }

    service_type = service_type.trim();

    if (!service_type) {
      return res.status(400).json({
        status: "error",
        message: "service_type cannot be empty or only spaces.",
      });
    }

    const forbiddenCharsRegex = /[@#!$%^&*]/;
    if (forbiddenCharsRegex.test(service_type)) {
      return res.status(400).json({
        status: "error",
        message: "service_type contains invalid special characters. Not allowed: @, #, !, $, %, ^, &, *",
      });
    }

    const existingServiceType = await Service.findOne({ service_type });
    if (existingServiceType) {
      return res.status(400).json({
        status: "error",
        message: `The service_type '${service_type}' already exists.`,
      });
    }

    const mongoConnection = await db.connectMongoDB();
    if (!mongoConnection) {
      throw new Error("MongoDB connection failed");
    }

    const counterResult = await mongoConnection.collection("collection_sequence").findOneAndUpdate(
      { _id: "service_id" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }
    );

    if (!counterResult || !counterResult.seq) {
      throw new Error("Failed to generate service_id");
    }

    const seq_service_id = counterResult.seq;
    const default_service_type_status = "Active";

    const newService = new Service({
      service_type,
      service_status: default_service_type_status,
      service_id: seq_service_id,
      create_by,
    });

    await newService.save();

    res.status(200).json({
      status: "success",
      message: "Service data stored successfully",
      service: newService,
    });

  } catch (err) {
    console.error("Error storing service data:", err);
    res.status(500).json({
      status: "error",
      message: "Error storing service data",
      error: err.message,
    });
  }
};


  