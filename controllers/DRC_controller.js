/* 
    Purpose: This template is used for the DRC Controllers.
    Created Date: 2024-11-21
    Created By: Janendra Chamodi (apjanendra@gmail.com)
    Last Modified Date: 2024-11-24
    Modified By: Janendra Chamodi (apjanendra@gmail.com)
                Naduni Rabel (rabelnaduni2000@gmail.com)
                Lasandi Randini (randini-im20057@stu.kln.ac.lk)
                Sasindu Srinayaka (sasindusrinayaka@gmail.com)
    Version: Node.js v20.11.1
    Dependencies: mysql2
    Related Files: DRC_route.js
    Notes:  
*/

// import db from "../config/db.js";
import db from "../config/db.js";
import DRC from "../models/Debt_recovery_company.js";
import RTOM from "../models/Rtom.js";
import BillingCenter from "../models/DRC_Billing_Center_Log.js";
import case_inquiry from "../models/Case_inquiry.js";
import mongoose from "mongoose";
import { createTaskFunction } from "../services/TaskService.js";
import CaseDetails from "../models/Case_details.js";

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

    let currentPage = Number(page);
    if (isNaN(currentPage) || currentPage < 1) currentPage = 1;
    const limit = currentPage === 1 ? 10 : 30;
    const skip = currentPage === 1 ? 0 : 10 + (currentPage - 2) * 30;

    const pipeline = [
      {
        $addFields: {
          last_status: {
            $cond: {
              if: {
                $and: [
                  { $isArray: "$status" },
                  { $gt: [{ $size: "$status" }, 0] },
                ],
              },
              then: {
                $arrayElemAt: [
                  "$status",
                  { $subtract: [{ $size: "$status" }, 1] },
                ],
              },
              else: null,
            },
          },
        },
      },

      ...(status ? [{ $match: { "last_status.drc_status": status } }] : []),
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
          ro_count: { $size: "$ros" },
        },
      },
      {
        $project: {
          _id: 0,
          drc_id: 1,
          drc_name: 1,
          drc_email: 1,
          status: "$last_status.drc_status",
          drc_contact_no: "$drc_contact_no",
          drc_business_registration_number: 1,
          service_count: {
            $size: {
              $cond: {
                if: { $isArray: "$services" },
                then: "$services",
                else: [],
              },
            },
          },
          ro_count: 1,
          rtom_count: {
            $size: {
              $cond: {
                if: { $isArray: "$rtom" },
                then: "$rtom",
                else: [],
              },
            },
          },
          created_on: "$createdAt",
        },
      },
      { $sort: { drc_id: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    const drcData = await DRC.aggregate(pipeline);

    return res.status(200).json({
      status: "success",
      message:
        drcData.length === 0
          ? status
            ? `No ${status} DRCs found`
            : "No DRCs available"
          : "DRC details fetched successfully",
      data: drcData,
      pagination: {
        total: drcData.length,
        page: currentPage,
        perPage: limit,
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

/*
## Function: Create_DRC_With_Services_and_SLT_Coordinator (DRC-1C01)

### Description:
This function creates a new DRC (Debt Recovery Center) record in the MongoDB database along with its associated SLT coordinators, services, and RTOM (Regional Telecom Operations Manager) entities. It also generates corresponding billing center logs for each RTOM. All operations are performed within a MongoDB transaction to ensure data consistency.

### Collections Used:
- **DRC**: Stores the main DRC information, coordinators, services, and RTOM details.
- **BillingCenter**: Stores billing center logs for each RTOM associated with the DRC.
- **collection_sequence**: Used to generate unique sequential IDs for DRC and billing center logs.

### Request Body Parameters:
- **drc_name**: *(Required)* The name of the DRC.
- **drc_business_registration_number**: *(Required)* Business registration number of the DRC.
- **drc_address**: *(Required)* Physical address of the DRC.
- **drc_contact_no**: *(Required)* Contact phone number of the DRC.
- **drc_email**: *(Required)* Email address of the DRC.
- **create_by**: *(Required)* Identifier of the user creating the DRC.
- **slt_coordinator**: *(Required)* Array of SLT coordinator objects containing service numbers, names, and emails.
- **services**: *(Required)* Array of service objects with service IDs, types, and optional status.
- **rtom**: *(Required)* Array of RTOM objects with IDs, names, billing center codes, and handling types.

### Response:
- **HTTP 201**: Success. DRC created successfully with all associated records.
- **HTTP 400**: Missing required fields or empty arrays provided.
- **HTTP 500**: Internal server error, MongoDB connection failure, or transaction failure.

### Flow:
1. **Start MongoDB session and transaction.**
2. **Parse and validate all required input fields** from the request body, ensuring arrays are non-empty.
3. **Establish MongoDB connection** and throw an error if connection fails.
4. **Generate a unique DRC ID** using the `collection_sequence` counter with atomic increment.
5. **Validate RTOM data** by ensuring each RTOM has a required billing center code.
6. **Create the DRC document** with:
   - Basic DRC information and timestamps
   - Mapped SLT coordinators with creation timestamps
   - Mapped services with default "Active" status if not specified
   - Initial status set to "Inactive"
   - Mapped RTOM entities with "Active" status
7. **Save the DRC document** within the transaction.
8. **Create billing center logs**:
   - For each RTOM, generate a unique billing center log ID
   - Create and save a corresponding BillingCenter document
   - Collect all billing logs for the response
9. **Commit the transaction and end the session** on success.
10. **Return a success response** with the created DRC data and billing logs.
11. **Handle errors**:
    - Abort transaction and return 400 for validation errors
    - Abort transaction and return 500 for database or system errors
    - Log all errors for debugging purposes
*/
export const Create_DRC_With_Services_and_SLT_Coordinator = async (
  req,
  res
) => {
  const {
    drc_name,
    drc_business_registration_number,
    drc_address,
    drc_contact_no,
    drc_email,
    create_by,
    slt_coordinator,
    services,
    rtom,
  } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (
      !drc_name ||
      !drc_business_registration_number ||
      !drc_address ||
      !drc_contact_no ||
      !drc_email ||
      !create_by ||
      !Array.isArray(slt_coordinator) ||
      slt_coordinator.length === 0 ||
      !Array.isArray(services) ||
      services.length === 0 ||
      !Array.isArray(rtom) ||
      rtom.length === 0
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: "error",
        message: "Failed to register DRC.",
        errors: {
          field_name: "All fields are required and must be non-empty arrays.",
        },
      });
    }

    const mongoConnection = await db.connectMongoDB();
    if (!mongoConnection) throw new Error("MongoDB connection failed");

    // Generate unique DRC ID
    const drcCounterResult = await mongoConnection
      .collection("collection_sequence")
      .findOneAndUpdate(
        { _id: "drc_id" },
        { $inc: { seq: 1 } },
        { returnDocument: "after", upsert: true }
      );

    console.log("DRC Counter Result:", drcCounterResult);

    // Fix: Check if drcCounterResult has value property or seq directly
    const drc_id = drcCounterResult.value
      ? drcCounterResult.value.seq
      : drcCounterResult.seq;

    if (!drc_id) {
      throw new Error("Failed to generate DRC ID");
    }

    for (const r of rtom) {
      if (!r.rtom_billing_center_code) {
        throw new Error("RTOM billing center code is required");
      }
    }

    const newDRC = new DRC({
      doc_version: 1,
      drc_id,
      drc_name,
      drc_business_registration_number,
      drc_address,
      drc_contact_no,
      drc_email,
      drc_create_dtm: new Date(),
      drc_create_by: create_by,
      drc_terminate_dtm: null,
      drc_terminate_by: null,
      slt_coordinator: slt_coordinator.map((coord) => ({
        service_no: coord.service_no,
        slt_coordinator_name: coord.slt_coordinator_name,
        slt_coordinator_email: coord.slt_coordinator_email,
        coordinator_create_dtm: new Date(),
        coordinator_create_by: create_by,
      })),
      services: services.map((service) => ({
        service_id: service.service_id,
        service_type: service.service_type,
        service_status: service.service_status || "Active",
        create_by: create_by,
        create_dtm: new Date(),
        status_update_by: create_by,
        status_update_dtm: new Date(),
      })),
      status: [{
        drc_status: "Pending",
        drc_status_dtm: new Date(),
        drc_status_by: create_by,
      }],
      rtom: rtom.map(r => ({
        rtom_id: r.rtom_id,
        rtom_name: r.rtom_name,
        rtom_status: "Active",
        rtom_billing_center_code: r.rtom_billing_center_code,
        handling_type: r.handling_type,
        last_update_dtm: new Date(),
      })),
    });

    await newDRC.save({ session });

    const billingLogs = [];

    for (const r of rtom) {
      const billingCounter = await mongoConnection
        .collection("collection_sequence")
        .findOneAndUpdate(
          { _id: "billing_center_log_id" },
          { $inc: { seq: 1 } },
          { returnDocument: "after", upsert: true }
        );

      console.log("Billing Center Log Counter Result:", billingCounter);

      // Fix: Check if billingCounter has value property or seq directly
      const billing_center_log_id = billingCounter.value
        ? billingCounter.value.seq
        : billingCounter.seq;

      if (!billing_center_log_id) {
        throw new Error("Failed to generate billing_center_log_id");
      }

      const newBillingLog = new BillingCenter({
        doc_version: 1,
        billing_center_log_id,
        drc_id,
        rtom_id: r.rtom_id,
        rtom_status: "Active",
        handling_type: r.handling_type,
        status_update_by: create_by,
        status_update_dtm: new Date(),
      });

      await newBillingLog.save({ session });
      billingLogs.push(newBillingLog);
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      status: "success",
      message: "DRC registered successfully.",
      data: {
        drc_id,
        drc_name,
        drc_business_registration_number,
        drc_address,
        drc_contact_no,
        drc_email,
        slt_coordinator: newDRC.slt_coordinator,
        services: newDRC.services,
        rtom: newDRC.rtom,
        billing_logs: billingLogs,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
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
        $lookup: {
          from: "users",
          localField: "drc_id",
          foreignField: "drc_id",
          as: "users",
        },
      },
      {
        $addFields: {
          last_status: {
            $cond: {
              if: {
                $and: [
                  { $isArray: "$status" },
                  { $gt: [{ $size: "$status" }, 0] },
                ],
              },
              then: {
                $arrayElemAt: [
                  "$status",
                  { $subtract: [{ $size: "$status" }, 1] },
                ],
              },
              else: null,
            },
          },
        },
      },
      {
        $addFields: {
          drc_coordinator: {
            $cond: {
              if: { $isArray: "$users" },
              then: {
                $map: {
                  input: "$users",
                  as: "user",
                  in: {
                    user_id: "$$user.user_id",
                    user_nic: "$$user.user_nic",
                    user_name: "$$user.username",
                    user_email: "$$user.email",
                    user_contact_no: "$$user.contact_num",
                  },
                },
              },
              else: [],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          drc_id: 1,
          drc_name: 1,
          drc_create_dtm: 1,
          drc_business_registration_number: 1,
          drc_contact_no: 1,
          drc_email: 1,
          drc_address: 1,
          drc_terminate_dtm: 1,
          status: "$last_status.drc_status",
          drc_coordinator: 1,
          drc_agreement_details: {
            agreement_start_dtm: "$drc_agreement_details.agreement_start_dtm",
            agreement_end_dtm: "$drc_agreement_details.agreement_end_dtm",
            agreement_remark: "$drc_agreement_details.agreement_remark",
          },
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
                    slt_coordinator_email: "$$coord.slt_coordinator_email",
                  },
                },
              },
              else: [],
            },
          },
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
                  },
                },
              },
              else: [],
            },
          },
          rtom: {
            $cond: {
              if: { $isArray: "$rtom" },
              then: {
                $map: {
                  input: "$rtom",
                  as: "r",
                  in: {
                    rtom_id: "$$r.rtom_id",
                    rtom_name: "$$r.rtom_name",
                    rtom_billing_center_code: "$$r.rtom_billing_center_code",
                    status_update_dtm: "$$r.status_update_dtm",
                    handling_type: "$$r.handling_type",
                    rtom_status: "$$r.rtom_status",
                    last_update_dtm: "$$r.last_update_dtm",
                  },
                },
              },
              else: [],
            },
          },
          remark: {
            $cond: {
              if: { $isArray: "$remark" },
              then: {
                $map: {
                  input: "$remark",
                  as: "r",
                  in: {
                    remark: "$$r.remark",
                    remark_dtm: "$$r.remark_dtm",
                    remark_by: "$$r.remark_by",
                  },
                },
              },
              else: [],
            },
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
      drc_address,
      status,
      coordinator,
      services,
      rtom,
      remark,
      updated_by,
    } = req.body;

    if (!drc_id || !updated_by || !remark) {
      return res.status(400).json({
        status: "error",
        message: "drc_id, updated_by, and remark are required.",
      });
    }

    const company = await DRC.findOne({ drc_id });
    if (!company) {
      return res.status(404).json({
        status: "error",
        message: `DRC with ID ${drc_id} not found.`,
      });
    }

    // Prepare update fields
    const updateFields = {};
    if (drc_contact_no) updateFields.drc_contact_no = drc_contact_no;
    if (drc_email) updateFields.drc_email = drc_email;
    if (drc_address) updateFields.drc_address = drc_address;

    // Update contact fields
    await DRC.updateOne({ drc_id }, { $set: updateFields });

    // Push remark
    await DRC.updateOne(
      { drc_id },
      {
        $push: {
          remark: {
            remark,
            remark_dtm: new Date(),
            remark_by: updated_by,
          },
        },
      }
    );

    // Push new status
    if (status) {
      await DRC.updateOne(
        { drc_id },
        {
          $push: {
            status: {
              drc_status: status,
              drc_status_dtm: new Date(),
              drc_status_by: updated_by,
            },
          },
        }
      );
    }

    // // Update slt_coordinator
    // if (coordinator && coordinator.service_no) {
    //   const lastCoordIndex = company.slt_coordinator.length - 1;
    //   if (lastCoordIndex >= 0) {
    //     company.slt_coordinator[lastCoordIndex].coordinator_end_by = updated_by;
    //     company.slt_coordinator[lastCoordIndex].coordinator_end_dtm = new Date();
    //   }

    //   company.slt_coordinator.push({
    //     service_no: coordinator.service_no,
    //     slt_coordinator_name: coordinator.slt_coordinator_name,
    //     slt_coordinator_email: coordinator.slt_coordinator_email,
    //     coordinator_create_dtm: new Date(),
    //     coordinator_create_by: updated_by,
    //   });

    //   await company.save();
    // }

    // Add slt coordinator if it is an array
    if (Array.isArray(coordinator)) {
      const newCoordinator = coordinator[0];
      const lastCoordIndex = company.slt_coordinator.length - 1;
      if (lastCoordIndex >= 0) {
        company.slt_coordinator[lastCoordIndex].coordinator_end_by = updated_by;
        company.slt_coordinator[lastCoordIndex].coordinator_end_dtm =
          new Date();
      }

      company.slt_coordinator.push({
        service_no: newCoordinator.service_no,
        slt_coordinator_name: newCoordinator.slt_coordinator_name,
        slt_coordinator_email: newCoordinator.slt_coordinator_email,
        coordinator_create_dtm: new Date(),
        coordinator_create_by: updated_by,
      });

      await company.save();
    }

    // Update or add services
    if (Array.isArray(services)) {
      services.forEach((newService) => {
        const existing = company.services.find(
          (s) => s.service_id === newService.service_id
        );
        if (existing) {
          existing.service_status = newService.service_status;
          existing.status_update_dtm = new Date();
          existing.status_update_by = updated_by;
        } else {
          company.services.push({
            ...newService,
            service_status: newService.service_status || "Active",
            create_by: updated_by,
            create_dtm: new Date(),
            status_update_by: updated_by,
            status_update_dtm: new Date(),
          });
        }
      });
      await company.save();
    }

    // Update or add RTOM
    if (Array.isArray(rtom)) {
      rtom.forEach((newRtom) => {
        const existing = company.rtom.find(
          (r) => r.rtom_id === newRtom.rtom_id
        );
        if (existing) {
          existing.rtom_status = newRtom.rtom_status;
          existing.last_update_dtm = new Date();
        } else {
          company.rtom.push({
            rtom_id: newRtom.rtom_id,
            rtom_name: newRtom.rtom_name,
            rtom_status: newRtom.rtom_status,
            rtom_billing_center_code: newRtom.rtom_billing_center_code,
            handling_type: newRtom.handling_type,
            last_update_dtm: new Date(),
          });
        }
      });
      await company.save();
    }

    return res.status(200).json({
      status: "success",
      message: "DRC information updated successfully.",
      data: await DRC.findOne({ drc_id }),
    });
  } catch (error) {
    console.error("Error updating DRC:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to update DRC.",
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
    const { drc_id, remark, terminate_by, terminate_dtm } = req.body;

    // Validate input
    if (!drc_id || !remark || !terminate_dtm || !terminate_by) {
      return res.status(400).json({
        status: "error",
        message: "DRC_ID, remark, terminate_by and terminate_dtm are required.",
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

    const terminateDate = new Date(terminate_dtm);
    const today = new Date();
    terminateDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const updateterminates = {
      $set: {
        drc_terminate_dtm: terminate_dtm,
        drc_terminate_by: terminate_by,
      },
      $push: {
        remark: {
          remark: remark,
          remark_dtm: new Date(),
          remark_by: terminate_by,
        },
      },
    };

    if (terminateDate.getTime() === today.getTime()) {
      updateterminates.$push.status = {
        drc_status: "Terminate",
        drc_status_dtm: new Date(),
        drc_status_by: terminate_by,
      };
    } else {
      let taskCreatedResponse;
      const dynamicParams = {
        drc_id: drc_id,
        end_dtm: terminate_dtm,
      };

      // Create Task for Approved Approver
      const taskData = {
        Template_Task_Id: 55,
        task_type: "Create Task for  terminate  DRC",
        ...dynamicParams,
        Created_By: terminate_by,
        task_status: "open",
      };

      taskCreatedResponse = await createTaskFunction(taskData, session);
    }

    const updatedCompany = await DRC.findOneAndUpdate(
      { drc_id },
      updateterminates,
      taskCreatedResponse,
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

export const List_RTOM_Details_Owen_By_DRC_ID = async (req, res) => {
  try {
    const { drc_id } = req.body;

    // Step 1: Find DRC by drc_id
    const drc = await DRC.findOne(
      { drc_id: parseInt(drc_id) },
      { rtom: 1, services: 1 }
    );

    if (!drc) {
      return res.status(404).json({ message: "DRC not found" });
    }

    // Extract RTOM IDs
    const rtomIds = drc.rtom.map((r) => r.rtom_id);

    // Step 2: Query RTOM collection for full RTOM data
    const rtomDetails = await RTOM.find(
      { rtom_id: { $in: rtomIds } },
      {
        _id: 0,
        rtom_name: 1,
        rtom_mobile_no: 1,
        handling_type: 1,
        billing_center_Code: 1,
        rtom_end_date: 1,
      }
    );

    // Step 3: Add RO count to each RTOM object (assuming "RO count" means service count)
    const roCount = drc.services.length;

    const result = rtomDetails.map((rtom) => ({
      ...rtom._doc,
      ro_count: roCount,
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
      return res.status(404).json({ message: "DRC not found" });
    }

    // Extract only required fields from each service
    const servicesData = drc.services.map((service) => ({
      service_id: service.service_id,
      service_type: service.service_type,
      enable_date: service.create_on,
      status: service.service_status,
    }));

    res.status(200).json(servicesData);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const changeDRCStatus = async (req, res) => {
  const { drc_id, drc_status } = req.body;

  try {
    if (!drc_id || typeof drc_status === "undefined") {
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

export const getDRCDetails = async (req, res) => {
  let mongoData = null;

  try {
    mongoData = await DRC.find({}).select("-services_of_drc");
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve DRC details.",
      errors: {
        code: 500,
        description:
          "Internal server error occurred while fetching DRC details.",
      },
    });
  }

  return res.status(200).json({
    status: "success",
    message: "DRC details retrieved successfully.",
    data: {
      // mysql: mysqlData,
      mongoData: mongoData,
    },
  });
};

export const getDRCDetailsById = async (req, res) => {
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

  try {
    mongoData = await DRC.find({ drc_id: DRC_ID }).select("-services_of_drc");
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve DRC details.",
      errors: {
        code: 500,
        description:
          "Internal server error occurred while fetching DRC details.",
      },
    });
  }

  return res.status(200).json({
    status: "success",
    message: "DRC details retrieved successfully.",
    data: {
      //mysql: mysqlData,
      mongoData: mongoData,
    },
  });
};

export const getActiveDRCDetails = async (req, res) => {
  try {
    const mongoData = await DRC.aggregate([
      { $unwind: "$drc_status" },
      { $sort: { "drc_status.drc_status_dtm": -1 } },
      {
        $group: {
          _id: "$_id",
          latestStatus: { $first: "$drc_status" },
          drc_name: { $first: "$drc_name" },
          drc_id: { $first: "$drc_id" },
        },
      },
      { $match: { "latestStatus.drc_status": "Active" } },
      {
        $project: {
          _id: 0,
          drc_name: 1,
          drc_id: 1,
        },
      },
    ]);

    return res.status(200).json({
      status: "success",
      message: "Active DRC names and IDs retrieved successfully.",
      data: { mongoData },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
      errors: {
        code: 500,
        description:
          "Internal server error occurred while fetching DRC details.",
      },
    });
  }
};

export const getDRCWithServicesByDRCId = async (req, res) => {
  //let mysqlData = null;
  let mongoData = null;
  const { DRC_ID } = req.body;

  if (!DRC_ID) {
    return res.status(404).json({
      status: "error",
      message: "Failed to retrieve DRC details.",
      errors: {
        code: 404,
        description: "DRC with the given ID not found",
      },
    });
  }

  try {
    mongoData = await DRC.find({ drc_id: DRC_ID });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve DRC details.",
      errors: {
        code: 500,
        description:
          "Internal server error occurred while fetching DRC details.",
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
      mongoData: mongoData,
    },
  });
};

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
        description:
          "Internal server error occurred while fetching DRC details.",
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
      mongoData: mongoData,
    },
  });
};

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
    const drc = await DRC.findOne(
      { drc_id: Number(drc_id) },
      { remark: 1, _id: 0 }
    );

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

export const getUserIdOwnedByDRCId = async (drc_id) => {
  try {
    if (!drc_id) {
      throw new Error("DRC ID is required.");
    }
    const drc = await DRC.aggregate([
      { $match: { drc_id: drc_id } },
      {
        $project: {
          lastCoordinator: { $arrayElemAt: ["$slt_coordinator", -1] },
        },
      },
      {
        $match: {
          "lastCoordinator.coordinator_end_dtm": null,
        },
      },
    ]);
    if (drc.length === 0) {
      return null;
    }
    return drc[0].lastCoordinator.service_no;
  } catch (error) {
    console.error("Error fetching DRC details:", error);
    throw error;
  }
};

export const List_Pre_Negotiation_By_Case_Id = async (req, res) => {
  try {
    const { case_id, pages } = req.body;

    const pipeline = [];

    // if (case_id) {
    //   pipeline.push({
    //     $match: { "lod_final_reminder.current_document_type": String(case_id) },
    //   });
    // }

    // const dateFilter = {};
    // if (from_date) dateFilter.$gte = new Date(from_date);
    // if (to_date) {
    //   const endOfDay = new Date(to_date);
    //   endOfDay.setHours(23, 59, 59, 999);
    //   dateFilter.$lte = endOfDay;
    // }

    // pipeline.push({
    //   $addFields: {
    //     last_status: { $arrayElemAt: ["$case_status", -1] },
    //   },
    // });

    // if (Object.keys(dateFilter).length > 0) {
    //   pipeline.push({
    //     $match: { "last_status.created_dtm": dateFilter },
    //   });
    // }

    // Direct filter for case_current_status = "LD Hold"
    if (case_id) {
      pipeline.push({
        $match: { case_id: case_id },
      });
    }

    let page = Number(pages);
    if (isNaN(page) || page < 1) page = 1;
    const limit = page === 1 ? 10 : 30;
    const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

    // Pagination
    pipeline.push({ $sort: { Call_Inquiry_seq: -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const filtered_cases = await case_inquiry.aggregate(pipeline);

    const responseData = filtered_cases.map((ResponseData) => {
      return {
        case_id: ResponseData.case_id,
        seq: ResponseData.Call_Inquiry_seq,
        call_topic: ResponseData.Call_Topic,
        phase: ResponseData.Case_Phase,
        created_by: ResponseData.created_by,
        created_date: ResponseData.created_dtm,
        call_inquiry_remark: ResponseData.Call_Inquiry_Remark,
        drc_id: ResponseData.DRC_ID,
      };
    });

    return res.status(200).json({
      status: "success",
      message: "Cases retrieved successfully.",
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching Pre Negotoation:", error.message);
    return res.status(500).json({
      status: "error",
      message: "There is an error ",
    });
  }
};

export const Create_Pre_Negotiation = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { case_id, call_inquiry_remark, call_topic, created_by, drc_id } =
      req.body;

    // Validate required fields
    if (
      !case_id ||
      !call_inquiry_remark ||
      !call_topic ||
      !created_by ||
      !drc_id
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message:
          "All required fields must be provided: case_id, call_inquiry_remark, call_topic, created_by, drc_id",
      });
    }

    // Check if case_details exists for the given case_id and fetch necessary fields
    const caseDetails = await CaseDetails.findOne({ case_id })
      .select("ro_negotiation case_current_status")
      .session(session);

    if (!caseDetails) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        message: `No case details found for case_id: ${case_id}`,
      });
    }

    // Determine case_phase based on ro_negotiation
    let determinedCasePhase;
    const roNegotiationArray = caseDetails.ro_negotiation || [];
    if (roNegotiationArray.length === 0) {
      determinedCasePhase = "Pre Negotiation";
    } else {
      const case_status = caseDetails.case_current_status;

      if (!case_status) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: `case_current_status not found for case_id: ${case_id}`,
        });
      }

      // Call external API to get case_phase
      try {
        const payload = { case_status };
        const response = await axios.post(
          "http://124.43.177.52:6000/app2/get_case_phase",
          payload
        );

        if (!response.data.case_phase) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            message: "case_phase not found in API response",
          });
        }
        determinedCasePhase = response.data.case_phase;
        console.log("case_phase from API:", determinedCasePhase);
      } catch (error) {
        console.error("Error during axios call:", error.message);
        if (error.response) {
          console.error("API Error Response:", error.response.data);
        }
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({
          message: "Failed to get case_phase from external API",
          error: error.message,
        });
      }
    }

    // Generate a unique Call_Inquiry_seq
    const maxSeq = await case_inquiry
      .findOne({}, { Call_Inquiry_seq: 1 })
      .sort({ Call_Inquiry_seq: -1 })
      .session(session);
    const newSeq = maxSeq ? maxSeq.Call_Inquiry_seq + 1 : 1;

    // Create a new document for case_inquiry
    const newCaseInquiry = new case_inquiry({
      doc_version: 1,
      Call_Inquiry_seq: newSeq,
      case_id: case_id,
      Call_Topic: call_topic,
      Case_Phase: determinedCasePhase,
      created_by: created_by,
      created_dtm: new Date(),
      Call_Inquiry_Remark: call_inquiry_remark,
      DRC_ID: drc_id,
    });

    // Save the new document to the collection
    const savedInquiry = await newCaseInquiry.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      status: "success",
      message: "Case inquiry created successfully",
      data: { savedInquiry },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: error.message });
  }
};

// export const Create_Pre_Negotiation = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const {
//       case_id,
//       call_inquiry_remark,
//       call_topic,
//       case_phase,
//       created_by,
//       drc_id,
//     } = req.body;

//     // Validate required fields based on the schema
//     if (
//       !case_id ||
//       !call_inquiry_remark ||
//       !call_topic ||
//       !case_phase ||
//       !created_by ||
//       !drc_id
//     ) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({
//         message:
//           "All required fields must be provided: case_id, call_inquiry_remark, call_topic, case_phase, created_by, drc_id",
//       });
//     }

//     // Check if case_details exists for the given case_id
//     const caseDetails = await CaseDetails.findOne({ case_id }).session(session);

//     if (!caseDetails) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({
//         message: `No case details found for case_id: ${case_id}`,
//       });
//     }

//     // Determine case_phase based on ro_negotiation array
//     const roNegotiationArray = caseDetails.ro_negotiation || [];
//     const determinedCasePhase =
//       roNegotiationArray.length === 0 ? "Pre Negotiation" : case_phase;

//     // Generate a unique Call_Inquiry_seq (example: fetch the max sequence and increment)
//     const maxSeq = await case_inquiry
//       .findOne({}, { Call_Inquiry_seq: 1 })
//       .sort({ Call_Inquiry_seq: -1 })
//       .session(session);
//     const newSeq = maxSeq ? maxSeq.Call_Inquiry_seq + 1 : 1;

//     // Create a new document for case_inquiry
//     const newCaseInquiry = new case_inquiry({
//       doc_version: 1, // Default value as per schema
//       Call_Inquiry_seq: newSeq,
//       case_id: case_id,
//       Call_Topic: call_topic,
//       Case_Phase: determinedCasePhase,
//       created_by: created_by,
//       created_dtm: new Date(),
//       Call_Inquiry_Remark: call_inquiry_remark,
//       DRC_ID: drc_id,
//     });

//     // Save the new document to the collection
//     const savedInquiry = await newCaseInquiry.save({ session });

//     await session.commitTransaction();
//     session.endSession();

//     return res.status(200).json({
//       status: "success",
//       message: "Case inquiry created successfully",
//       data: { savedInquiry },
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     return res.status(500).json({ message: error.message });
//   }
// };
