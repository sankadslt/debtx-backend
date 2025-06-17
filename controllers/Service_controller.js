
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

    /*
    // MySQL
    const query = `
      UPDATE service_type
      SET service_status = ?
      WHERE service_id = ?
    `;

    const updateServiceStatusInMySQL = () =>
      new Promise((resolve, reject) => {
        db.mysqlConnection.query(
          query,
          [service_status, service_id],
          (err, result) => {
            if (err) return reject(err);
            resolve(result);
          }
        );
      });

    const result = await updateServiceStatusInMySQL();

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "Failed to update the service status.",
        errors: {
          code: 404,
          description: "Service not found for the given service_id.",
        },
      });
    }
    */

    //  Mongo
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

    /*
    const getServiceDetails = () =>
      new Promise((resolve, reject) => {
        db.mysqlConnection.query(
          "SELECT service_id, service_type, service_status FROM service_type WHERE service_id = ?",
          [service_id],
          (err, rows) => {
            if (err) return reject(err);
            resolve(rows[0]);
          }
        );
      });

    const updatedService = await getServiceDetails();
    */

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
    // Extract query parameters from GET request
    const { status, pages } = req.query;

    // Default pagination values
    let page = Number(pages);
    if (isNaN(page) || page < 1) page = 1;

    const limit = page === 1 ? 10 : 30;
    const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

    // Build MongoDB query object
    const query = status ? { service_status: status } : {};

    // Fetch total count
    const totalCount = await Service.countDocuments(query);

    // Fetch filtered + paginated data
    mongoData = await Service.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ service_id: -1 });

    return res.status(200).json({
      status: "success",
      message: "Service details retrieved successfully.",
      data: {
        mongo: mongoData,
        total_services: totalCount,
        current_page: page,
        page_size: limit,
      },
    });
  } catch (error) {
    console.error("MongoDB fetch error:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve service details.",
      errors: {
        code: 500,
        description: "Internal server error occurred while fetching service details.",
      },
    });
  }
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
      /*
      // MySQL
      const query = `
        SELECT service_id, service_type, service_status 
        FROM service_type 
        WHERE service_status = 'Active'
      `;
  
      const fetchActiveServices = () =>
        new Promise((resolve, reject) => {
          db.mysqlConnection.query(query, (err, results) => {
            if (err) return reject(err);
            resolve(results);
          });
        });
  
      const activeServices = await fetchActiveServices();
  
      if (activeServices.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "No active services found.",
          errors: {
            code: 404,
            description: "There are no services with active status.",
          },
        });
      }
      */
  
      // Mongo
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
  //   try{
      
  //     const {service_type} = req.body;
      
  //     if (!service_type) {
  //       return res.status(400).json({
  //         message: "service_type is required.",
  //       });
  //     }

  //     const mongoConnection = await db.connectMongoDB();
  //     if (!mongoConnection) {
  //       // return res.status(500).json({
  //       //   message: "Database connection failed.",
  //       // });
  //       throw new Error('MongoDB connection failed');
  //     }
  //     const counterResult = await mongoConnection.collection("counters").findOneAndUpdate(
  //       { _id: "service_id" },
  //       { $inc: { seq: 1 } },
  //       { returnDocument: "after", upsert: true }
  //     );
  //     console.log(counterResult);
  //     if (!counterResult || !counterResult.seq) {
  //       throw new Error("Failed to generate service_id");
  //     }
      
  //     const seq_service_id = counterResult.seq;

  //     if (!seq_service_id) {
  //       throw new Error('Failed to generate service_id');
  //     }
  //     const default_service_type_status = "Active";
      
  //     const newService = new Service({
  //       service_type,
  //       service_status:default_service_type_status,
  //       service_id:seq_service_id,
  //     });

  //     await newService.save();

  //     const insertServiceQuery = `
  //     INSERT INTO service_type (service_id, service_type, service_status)
  //     VALUES (?, ?, ?)
  //   `;
  //   const valuesForQuery = [seq_service_id, service_type, default_service_type_status];

  //   await new Promise((resolve, reject)=>{
  //     db.mysqlConnection.query(insertServiceQuery, valuesForQuery, (err, result) => {
  //       if (err) {
  //         console.error("Error MYSQL inserting service data:", err);
  //         reject(err);
  //       }else {
  //         resolve(result); 
  //       }
  //     });
  //   })
  //     res.status(200).json({
  //       message: "Service data stored successfully",
  //       service: newService,
  //     });

  //   }catch(err){
  //     console.error("Error storing service data:", err);
  //     res.status(500).json({
  //       message: "Error storing service data",
  //       error: err.message,
  //     });
  //   }
  // };

  export const Register_Service_Type = async (req, res) => {
    try {
      const { service_type } = req.body;
  
      if (!service_type) {
        return res.status(400).json({
          status: "error",
          message: "service_type is required.",
        });
      }
      const existingServiceType = await Service.findOne({ service_type });
      console.log(existingServiceType);
      if (existingServiceType) {
        return res.status(400).json({
          status: "error",
          message: `The service_type '${service_type}' already exists.`,
        });
      }
      const mongoConnection = await db.connectMongoDB();
      if (!mongoConnection) {
        throw new Error('MongoDB connection failed');
      }
  
      const counterResult = await mongoConnection.collection("counters").findOneAndUpdate(
        { _id: "service_id" },
        { $inc: { seq: 1 } },
        { returnDocument: "after", upsert: true }
      );
  
      // Correctly extract the sequence ID from the top-level structure
      if (!counterResult || !counterResult.seq) {
        throw new Error("Failed to generate service_id");
      }
  
      const seq_service_id = counterResult.seq;
  
      const default_service_type_status = "Active";
  
      const newService = new Service({
        service_type,
        service_status: default_service_type_status,
        service_id: seq_service_id,
      });
  
      await newService.save();
  
      // const insertServiceQuery = `
      //   INSERT INTO service_type (service_id, service_type, service_status)
      //   VALUES (?, ?, ?)
      // `;
      // const valuesForQuery = [seq_service_id, service_type, default_service_type_status];
  
      // await new Promise((resolve, reject) => {
      //   db.mysqlConnection.query(insertServiceQuery, valuesForQuery, (err, result) => {
      //     if (err) {
      //       console.error("Error MYSQL inserting service data:", err);
      //       reject(err);
      //     } else {
      //       resolve(result);
      //     }
      //   });
      // });
  
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
  