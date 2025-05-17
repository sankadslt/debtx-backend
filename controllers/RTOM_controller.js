/* Purpose: This template is used for the RTOM Controllers.
Created Date: 2024-12-03 
Created By: Sasindu Srinayaka (sasindusrinayaka@gmail.com)
Last Modified Date: 2025-01-04
Modified By: Sasindu Srinayaka (sasindusrinayaka@gmail.com)
Version: Node.js v20.11.1
Related Files: RTOM_route.js and Rtom.js
Notes:  */

// RTOM_controller.js
import db from "../config/db.js"; // Import the database connection
import Rtom from "../models/Rtom.js";
import DRC from "../models/Debt_recovery_company.js";
import RO from "../models/Recovery_officer.js";

import moment from 'moment'; // Ensure moment is imported at the top
 
// getRTOMDetails from Database
export const getRTOMDetails = async (req, res) => {
  try {
    // Fetch all RTOM details from MongoDB
    const rtoms = await Rtom.find();

    // Check if any data is found in databases
    if (rtoms.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No RTOM(s) found.",
      });
    }

    // Return the retrieved data
    return res.status(200).json({
      status: "success",
      message: "RTOM(s) details retrieved successfully.",
      data: rtoms,
    });
  } catch (error) {
    console.error("Unexpected error:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Internal server error occurred while fetching RTOM details.",
      error: error.message,
    });
  }
};

// getRTOMDetailsById from Database
export const getRTOMDetailsById = async (req, res) => {
  try {
    const { rtom_id } = req.body;

    // Validate RTOM ID
    if (!rtom_id) {
      return res.status(400).json({
        status: "error",
        message: "Failed to retrieve RTOM details.",
        errors: {
          code: 400,
          description: "RTOM with the given ID not found.",
        },
      });
    }

    // Fetch RTOM details from MongoDB
    const rtom = await Rtom.findOne({ rtom_id: rtom_id });

    if (!rtom) {
      return res.status(404).json({
        status: "error",
        message: "RTOM not found.",
        errors: {
          code: 404,
          description: "No RTOM data matches the provided ID.",
        },
      });
    }

    // Return success response
    return res.status(200).json({
      status: "success",
      message: "RTOM details retrieved successfully.",
      data: rtom,
    });
  } catch (err) {
    // Log the error for debugging
    console.error("Error fetching RTOM data:", err.message);

    // Return 500 Internal Server Error response
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve RTOM details.",
      errors: {
        code: 500,
        description: "Internal server error occurred while fetching RTOM details.",
      },
    });
  }
};


// Function to register a new RTOM
export const registerRTOM = async (req, res) => {
  const { area_name, rtom_abbreviation, rtom_contact_number, rtom_fax_number, created_dtm } = req.body; // Extract created_dtm from the request body

  try {
    // Validate required fields
    if (!area_name || !rtom_abbreviation || !rtom_contact_number || !rtom_fax_number  ) {
      return res.status(400).json({
        status: "error",
        message: "Failed to register RTOM due to missing fields.",
        errors: {
          field_name: "All fields are required",
        },
      });
    }

    // Step 2: Parse and Validate `created_dtm`
    const formattedCreatedDate = created_dtm
      ? moment(created_dtm, "DD/MM/YYYY").isValid()
        ? moment(created_dtm, "DD/MM/YYYY").toISOString() // Convert to ISO format
        : (() => {
            throw new Error("Invalid Created Date format. Use DD/MM/YYYY.");
          })()
      : moment().toISOString(); // Use current date if not provided

    const rtom_status = "Active"; // Set default status to "Active"
    const created_by = "System"; // Set default created_by to "System" if not provided

    const mongoConnection = await db.connectMongoDB();
    if (!mongoConnection) {
      throw new Error("MongoDB connection failed");
    }

    const counterResult = await mongoConnection.collection("counters").findOneAndUpdate(
      { _id: "rtom_id" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }
    );

    // Correctly extract the sequence ID from the top-level structure
    if (!counterResult || !counterResult.seq) {
      throw new Error("Failed to generate rtom_id");
    }

    const rtom_id = counterResult.seq;

    const newRTOM = new Rtom({
      rtom_id,
      rtom_abbreviation,
      area_name,
      rtom_contact_number,
      rtom_fax_number,
      rtom_status,
      updated_rtom: [],
      rtom_end_date: null,
      created_by, 
      created_dtm: formattedCreatedDate, // Use formatted date
    });

    await newRTOM.save();

    res.status(201).json({
      status: "success",
      message: "RTOM registered successfully.",
      data: {
        rtom_id,
        rtom_abbreviation,
        area_name,
        rtom_contact_number,
        rtom_fax_number,
        rtom_status,
        rtom_end_date: null,
        created_dtm,
        created_by,
      },
    });
  } catch (error) {
    console.error("Unexpected error during RTOM registration:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to register RTOM.",
      errors: {
        code: 500,
        description: "Internal server error occurred while registering RTOM.",
        exception: error.message,
      },
    });
  }
};


// // Function to update the status of an RTOM
// export const updateRTOMStatus = async (req, res) => {
//   const { rtom_id, rtom_status, updated_by, reason } = req.body; // Extract reason from request body

//   try {
//     // Validate input
//     if (!rtom_id || !rtom_status || !updated_by || !reason) {
//       return res.status(400).json({
//         status: "error",
//         message: "Failed to update RTOM status.",
//         errors: {
//           code: 400,
//           description: "RTOM ID, status, updated_by, and reason are required.",
//         },
//       });
//     }

//     // Build the update object for the rtom_status field and the updated_rtom array
//     const updateData = {
//       rtom_status, // Update the RTOM status
//       $push: {
//         updated_rtom: {
//           action: reason,
//           updated_date: moment().format("DD/MM/YYYY"), // Format date as day/month/year
//           updated_by: updated_by,
//         },
//       },
//     };

//     // Update RTOM status and push the new object into the updated_rtom array
//     const updatedResult = await Rtom.updateOne(
//       { rtom_id }, // Filter by rtom_id
//       updateData
//     );

//     if (updatedResult.modifiedCount === 0) { // Use `modifiedCount` to check if the document was updated
//       return res.status(404).json({
//         status: "error",
//         message: "RTOM ID not found in the database.",
//       });
//     }

//     res.status(200).json({
//       status: "success",
//       message: "RTOM status updated successfully.",
//     });

//   } catch (error) {
//     console.error("Unexpected error during RTOM status update:", error);
//     return res.status(500).json({
//       status: "error",
//       message: "Failed to update RTOM status.",
//       errors: {
//         code: 500,
//         description: "Internal server error occurred while updating RTOM status.",
//       },
//     });
//   }
// };

// Function to update the details of a RTOM
export const updateRTOMDetails = async (req, res) => {
  const { rtom_id, rtom_status, rtom_contact_number, rtom_fax_number, reason } = req.body;

  try {
    // Validate input
    if (!rtom_id || !rtom_status || !rtom_contact_number || !rtom_fax_number || !reason) {
      return res.status(400).json({
        status: "error",
        message: "Failed to update RTOM details.",
        errors: {
          code: 400,
          description: "RTOM ID, Status, Contact Number, Fax Number and updated_by with reason are required.",
        },
      });
    }

    const updated_by = "System"; // Set default updated_by to "System" if not provided

    // Build the update object for the rtom_status field and the updated_rtom array
    const updateData = {
      rtom_contact_number, rtom_fax_number, rtom_status,
      $push: {
        updated_rtom: {
          action: reason,
          updated_date: new Date(),
          updated_by: updated_by,
        },
      },
    };

    // Update RTOM status and push the new object into the updated_rtom array
    const updatedResult = await Rtom.updateOne(
      { rtom_id }, // Filter by rtom_id
      updateData
    );

    if (updatedResult.nModified === 0) {
      return res.status(404).json({
        status: "error",
        message: "RTOM ID not found in Database.",
      });
    }

    // Send response
    res.status(200).json({
      status: "success",
      message: "RTOM details updated successfully.",
    });
  } catch (error) {
    console.error("Unexpected error during RTOM details update:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to update RTOM Details.",
      errors: {
        code: 500,
        description: error.message || "Internal server error occurred while updating RTOM details.",
      },
    });
  }
};

// // Function to update the details of a RTOM
// export const updateRTOMDetails = async (req, res) => {
//   const { rtom_id, rtom_contact_number, rtom_fax_number, updated_by, reason } = req.body;

//   try {
//     // Validate input
//     if (!rtom_id || !rtom_contact_number || !rtom_fax_number || !updated_by || !reason) {
//       return res.status(400).json({
//         status: "error",
//         message: "Failed to update RTOM details.",
//         errors: {
//           code: 400,
//           description: "RTOM ID, Contact Number, Fax Number and updated_by with reason are required.",
//         },
//       });
//     }


//     // Build the update object for the rtom_status field and the updated_rtom array
//     const updateData = {
//       rtom_contact_number, rtom_fax_number,
//       $push: {
//         updated_rtom: {
//           action: reason,
//           updated_date: moment().format("DD/MM/YYYY"), // Format date as day/month/year
//           updated_by: updated_by,
//         },
//       },
//     };

//     // Update RTOM status and push the new object into the updated_rtom array
//     const updatedResult = await Rtom.updateOne(
//       { rtom_id }, // Filter by rtom_id
//       updateData
//     );

//     if (updatedResult.nModified === 0) {
//       return res.status(404).json({
//         status: "error",
//         message: "RTOM ID not found in Database.",
//       });
//     }

//     // Send response
//     res.status(200).json({
//       status: "success",
//       message: "RTOM details updated successfully.",
//     });
//   } catch (error) {
//     console.error("Unexpected error during RTOM details update:", error);
//     return res.status(500).json({
//       status: "error",
//       message: "Failed to update RTOM details.",
//       errors: {
//         code: 500,
//         description: error.message || "Internal server error occurred while updating RTOM details.",
//       },
//     });
//   }
// };

// Function to get all debt recovery companys for a given RTOM ID
export const getAllActiveDRCs = async (req, res) => {
  const { rtom_id } = req.body; // Get RTOM ID from request body

  try {
    // Validate RTOM ID
    if (!rtom_id) {
      return res.status(400).json({
        status: "error",
        message: "RTOM ID is required.",
        errors: {
          code: 400,
          description: "Please provide a valid RTOM ID.",
        },
      });
    }

    // Step 1: Find RTOM record
    const rtom = await Rtom.findOne({ rtom_id });

    if (!rtom) {
      return res.status(404).json({
        status: "error",
        message: "RTOM not found.",
        errors: {
          code: 404,
          description: `No RTOM record found for the ID ${rtom_id}.`,
        },
      });
    }

    const area_name = rtom.area_name;

    // Step 2: Find Recovery Officers for the area
    const recoveryOfficers = await RO.find({
      'rtoms_for_ro.name': area_name, // Match area_name in Recovery Officers
    });

    if (recoveryOfficers.length === 0) {
      return res.status(404).json({
        status: "error",
        message: `No Recovery Officers found for the area ${area_name}.`,
      });
    }

    // Step 3: Extract DRC names from Recovery Officers
    const drcNames = [...new Set(recoveryOfficers.map((ro) => ro.drc_name))];

    // Step 4: Find DRC records with matching DRC names and select only drc_id and drc_name
    const drcs = await DRC.find({
      drc_name: { $in: drcNames }, // Match drc_name in DRC collection
    }).select('drc_id drc_name'); // Select only drc_id and drc_name

    if (drcs.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No DRCs found for the specified Recovery Officers.",
      });
    }

    // Return the DRC IDs
    return res.status(200).json({
      status: "success",
      message: "Active DRCs retrieved successfully.",
      data: drcs,
    });
  } catch (error) {
    // Log error details for debugging
    console.error("Error retrieving DRC IDs:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve DRC details.",
      errors: {
        code: 500,
        description: error.message || "Internal server error occurred while updating RTOM details.",
      },
    });
  }
};


// Function to get all Recovery Officers for a given RTOM ID
export const getAllROsByRTOMID = async (req, res) => {
  const { rtom_id } = req.body; // Use req.body instead of req.params

  try {
    // Validate if rtom_id is provided
    if (!rtom_id) {
      return res.status(400).json({
        status: "error",
        message: "RTOM ID is required.",
        errors: {
          code: 400,
          description: "Please provide a valid RTOM ID in the request body.",
        },
      });
    }

    // Step 1: Find the RTOM record by rtom_id
    const rtom = await Rtom.findOne({ rtom_id });
    if (!rtom) {
      return res.status(404).json({
        status: "error",
        message: `No RTOM found for the provided ID: ${rtom_id}.`,
        errors: {
          code: 404,
          description: "The RTOM record does not exist in the database.",
        },
      });
    }

    const area_name = rtom.area_name;

    // Step 2: Find all Recovery Officers for the given area_name
    const recoveryOfficers = await RO.find({
      'rtoms_for_ro.name': area_name, // Check if area_name matches in rtoms_for_ro
    }).select('ro_id ro_name'); // Only select ro_id and ro_name fields

    if (recoveryOfficers.length === 0) {
      return res.status(404).json({
        status: "error",
        message: `No Recovery Officers found for the area: ${area_name}.`,
      });
    }

    // Step 3: Return the list of Recovery Officers
    return res.status(200).json({
      status: "success",
      message: "Recovery Officers retrieved successfully.",
      data: recoveryOfficers,
    });
  } catch (error) {
    console.error("Error retrieving Recovery Officers:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve RO details.",
      error: error.message,errors: {
        code: 500,
        description: error.message || "Internal server error occurred while updating RTOM details.",
      },
    });
  }
};


// Function to get all RTOMs using their DRC ID
export const getAllRTOMsByDRCID = async (req, res) => {
  const { drc_id } = req.body; // Extract drc_id from the request body

  try {
      // Find drc_name for the given drc_id
      const drc = await DRC.findOne({ drc_id });
      if (!drc) {
          return res.status(404).json({
              status: "error",
              message: "DRC not found.",
              errors: {
                  code: 404,
                  description: "No DRC data matches the provided DRC ID.",
              },
          });
      }

      const drc_name = drc.drc_name;

      // Find all Recovery Officers with assigned the drc_name
      const recoveryOfficers = await RO.find({ drc_name });

      if (recoveryOfficers.length === 0) {
          return res.status(404).json({
              status: "error",
              message: "No RTOMs found for this DRC name.",
          });
      }

      // Step 1: Extract unique RTOM names and their IDs
      const rtomDetails = await Promise.all(
          recoveryOfficers.flatMap(async (ro) => {
              const rtomNames = await Promise.all(
                  ro.rtoms_for_ro.map(async (r) => {
                      const rtom = await Rtom.findOne({ area_name: r.name });
                      return rtom ? { rtom_id: rtom.rtom_id, area_name: r.name } : null;
                  })
              );
              return rtomNames.filter(r => r !== null); // Filter out any null values
          })
      );

      // Flatten the array and ensure uniqueness
      const uniqueRTOMs = [...new Set(rtomDetails.flat().map(r => JSON.stringify(r)))].map(e => JSON.parse(e));

      if (uniqueRTOMs.length === 0) {
          return res.status(404).json({
              status: "error",
              message: "No unique RTOMs found for the specified Recovery Officers.",
          });
      }

      return res.status(200).json({
          status: "success",
          message: "RTOMs retrieved successfully.",
          data: uniqueRTOMs,
      });
  } catch (error) {
      console.error("Error retrieving RTOM names:", error);
      return res.status(500).json({
          status: "error",
          message: "Failed to retrieve RTOM details.",
          errors: {
            code: 500,
            description: error.message || "Internal server error occurred while updating RTOM details.",
          },
      });
  }
};

// Function to get all active RTOMs from the Database
export const getActiveRTOMDetails = async (req, res) => {
  try {
    // Fetch all active RTOM details from MongoDB
    const activeRTOMs = await Rtom.find({ rtom_status: "Active" });

    // Check if any active RTOMs are found
    if (activeRTOMs.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No active RTOM(s) found.",
      });
    }

    // Return the count of active RTOMs
    return res.status(200).json({
      status: "success",
      message: "Count of active RTOM(s) retrieved successfully.",
      data: activeRTOMs, // Return the count in an object
    });
  } catch (error) {
    console.error("Unexpected error:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Internal server error occurred while fetching active RTOM count.",
      error: error.message,
    });
  }
};


// Function to remove the specific RTOM (terminate) from the Active RTOM list
// export const suspend_RTOM = async (req, res) =>{
//   const { rtom_id, rtom_end_date, reason} = req.body;

//   const rtom_status = "Terminate";
//   const updated_by = "System"; // Set default updated_by to "System" if not provided
//   // const rtom_end_date = moment().toISOString(); // Use current date if not provided

//   if (!rtom_id || !reason || !rtom_end_date || !rtom_status) {
//     return res.status(400).json({
//       status: "error",
//       message: "All field are required",
//     });
//   };

//   try{
//     const filter = { rtom_id: rtom_id };
//     const update = {
//       $set: {
//         rtom_status: rtom_status,
//         rtom_end_date: rtom_end_date,
//       },
//       $push: {
//         updated_rtom: {
//           action: reason,
//           updated_date: rtom_end_date, // Format date as day/month/year
//           updated_by: updated_by,
//         },
//       },
//     };
//     const updatedResult = await Rtom.updateOne(filter, update);
    
//     if (updatedResult.matchedCount === 0) {
//       console.log("RTOM not found in Database:", updatedResult);
//       return res.status(400).json({
//             status: "error",
//             message: "RRTOM not found in Database",
//       });
//     }
//     return res.status(200).json({
//       status: "success",
//       message: "The RTOM has been suspended..",
//       data: updatedResult,
//     });
//   }catch (mongoError) {
//       console.error("Error updating MongoDB:", mongoError.message);
//   }
// };

export const suspend_RTOM = async (req, res) => {
  const { rtom_id, rtom_end_date, reason } = req.body;
  const rtom_status = "Terminate";
  const updated_by = "System"; // Set default updated_by to "System" if not provided

  if (!rtom_id || !reason || !rtom_end_date || !rtom_status) {
    return res.status(400).json({ 
      status: "error",
      message: "All fields are required",
    });
  }

  try {
    // Check if RTOM already terminated
    const existingRtom = await Rtom.findOne({ rtom_id });
    if (existingRtom && existingRtom.rtom_status === "Terminate") {
      return res.status(400).json({
        status: "error",
        message: "RTOM has already been terminated and cannot be reactivated.",
      });
    }

    const filter = { rtom_id: rtom_id };
    const update = {
      $set: {
        rtom_status: rtom_status,
        rtom_end_date: rtom_end_date,
      },
      $push: {
        updated_rtom: {
          action: reason,
          updated_date: rtom_end_date, // Format date as day/month/year
          updated_by: updated_by,
        },
      },
    };

    const updatedResult = await Rtom.updateOne(filter, update);

    if (updatedResult.matchedCount === 0) {
      console.log("RTOM not found in Database:", updatedResult);
      return res.status(400).json({
        status: "error",
        message: "RTOM not found in Database",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "The RTOM has been suspended.",
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


// get all active RTOMs by DRC ID
export const getAllActiveRTOMsByDRCID = async (req, res) => {
  const { drc_id } = req.body;

  try {
    // Step 1: Find all Recovery Officers assigned to the drc_id
    const recoveryOfficers = await RO.find({ drc_id });
    if (recoveryOfficers.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No Recovery Officers found for this DRC ID.",
      });
    }

    // Step 2: Extract unique RTOMs whose last status is "Active"
    const activeRTOMs = await Promise.all(
      recoveryOfficers.flatMap(async (ro) => {
        // Filter `rtoms_for_ro` by the last status being "Active"
        const activeRTOMDetails = ro.rtoms_for_ro
          .filter((r) => {
            const lastStatus = r.status?.[r.status.length - 1];
            return lastStatus && lastStatus.status === "Active"; // Check if the last status is "Active"
          })
          .map((r) => ({ area_name: r.name }));

        // Fetch RTOM details from the Rtom collection
        return await Promise.all(
          activeRTOMDetails.map(async (r) => {
            const rtom = await Rtom.findOne({ area_name: r.area_name });
            return rtom ? { rtom_id: rtom.rtom_id, area_name: r.area_name } : null;
          })
        );
      })
    );

    // Flatten the array, filter out nulls, and ensure uniqueness
    const uniqueActiveRTOMs = [
      ...new Set(activeRTOMs.flat().filter((r) => r !== null).map((r) => JSON.stringify(r))),
    ].map((e) => JSON.parse(e));

    if (uniqueActiveRTOMs.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No active RTOMs found for the specified Recovery Officers.",
      });
    }

    // Return the filtered RTOMs
    return res.status(200).json({
      status: "success",
      message: "Active RTOMs retrieved successfully.",
      data: uniqueActiveRTOMs,
    });
    
  } catch (error) {
    console.error("Error retrieving RTOM names:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve RTOM details.",
      errors: {
        code: 500,
        description: error.message || "Internal server error occurred while retrieving RTOM details.",
      },
    });
  }
};

