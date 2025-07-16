/* 
    Purpose: This template is used for the User Controllers.
    Created Date: 2025-05-19
    Created By:  Sasindu Srinayaka (sasindusrinayaka@gmail.com)
    Last Modified Date: 2025-06-05
    Modified By: Sasindu Srinayaka (sasindusrinayaka@gmail.com), Nimesh Perera (nimeshmathew999@gmail.com)
    Version: Node.js v20.11.1
    Dependencies: axios , mongoose
    Related Files: User_route.js, user.js
    Notes:  
*/

import mongoose from 'mongoose';
import User from '../models/User.js';
import db from '../config/db.js';
import User_Approval from '../models/User_Approval.js';

// Function to Get user details by user roles
export const getUserDetailsByRole = async (req, res) => {
    const { role } = req.body; // Extracting role from request body

    try {
        const validRoles = ["user", "admin", "superadmin", "drc_admin", "drc_user", "slt_coordinator"];

        if (!validRoles.includes(role)) {
          return res.status(400).json({
            status: "error",
            message: "Invalid user role",
            errors: {
              code: 400,
              description: "The specified role is not recognized.",
            },
          });
        }

        const users = await User.find({ role, user_status: true }).select("user_id username email");

        if (!users || users.length === 0) {
        return res.status(200).json({
            status: "error",
            message: "No users found for the specified role",
        });
        }

        return res.status(200).json({
        status: "success",
        message: "Users retrieved successfully.",
        data: users,
        });
    } catch (error) {
        console.error("Error fetching user details:", error);
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
    Function: 
        - List_All_User_Details (USER - 1P04)

    Description:
        - This function retrieves a paginated list of users from the MongoDB database, filtered by user role, type, and/or status. It returns summarized user account data for display or administrative use.

    Collections Used:
        - User: Stores all registered user records, including account metadata, roles, and status flags.

    Request Body Parameters:
        - user_role: (Optional) Filter by specific role(s). If omitted, all roles are included.
        - user_type: (Optional) Filter by user type (e.g., internal, external).
        - user_status: (Optional) Filter by current user status (e.g., active, inactive).
        - page: (Optional) Integer for page number. Page 1 returns 10 results; pages >1 return 30 results each.

    Response:
        - HTTP 200: Returns an array of user records that match the filters.
        - HTTP 500: Internal server error or database failure.

    Flow:
        - Parse and validate optional filter parameters and page number from the request body.
        - Setup pagination:
            * Page 1 → 10 results
            * Page 2 and onward → 30 results
        - Construct a dynamic query object based on provided filters:
            * If user_role is specified → filter by role
            * If user_type is specified → filter by user type
            * If user_status is specified → filter by status
        - Use MongoDB aggregation pipeline to:
            * Match users based on the constructed query
            * Project relevant fields:
                - user_id
                - user_status
                - role
                - user_type
                - username
                - email
                - Created_DTM
            * Sort by descending Created_DTM
            * Apply pagination using $skip and $limit
        - Return the result set in the response.
        - Handle errors:
            * Return 500 for any exceptions encountered during query or processing.
*/
export const List_All_User_Details = async (req, res) => {
  try {        
    const { user_role, user_type, user_status, page } = req.body;

    let currentPage = Number(page);
    if (isNaN(currentPage) || currentPage < 1) currentPage = 1;
    const limit = currentPage === 1 ? 10 : 30;
    const skip = currentPage === 1 ? 0 : 10 + (currentPage - 2) * 30;
    
    const query = {};

    if (user_role) query.role = user_role;
    if (user_type) query.user_type = user_type;
    if (user_status) query.user_status = user_status;

    const users = await User.aggregate([
      { $match: query },
      {
        $project: {
          _id: 0,
          user_id: 1,
          user_status: 1,
          role: 1,
          user_type: 1,
          username: 1,
          email: 1,
          contact_num: 1,
          Created_DTM: 1,
        },
      },
      { $sort: { Created_DTM: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);
    
    // if (!users || users.length === 0) {
    //   return res.status(200).json({
    //     status: "error",
    //     message: "No matching user records found.",
    //     data: [],
    //   });
    // }

    return res.status(200).json({
      status: "success",
      message: "User details fetched successfully",
      data: users,
    });

  } catch (error) {
    console.error("Error fetching user details", error);
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
    Function: 
        - List_All_User_Details_By_ID (USER - 1P05)

    Description:
        - This function retrieves full user details from the MongoDB database based on a given user ID. It returns a detailed profile including role, contact info, account status, login method, and creation/approval metadata.

    Collections Used:
        - User: Stores all user accounts, credentials, roles, and related metadata.

    Request Body Parameters:
        - user_id: (Required) The unique identifier for the user whose details need to be retrieved.

    Response:
        - HTTP 200: Success. Returns a detailed object containing the user's account information.
        - HTTP 400: Missing required user ID in request body.
        - HTTP 404: No user found with the provided user ID.
        - HTTP 500: Internal server error or database failure.

    Flow:
        - Validate presence of user_id in the request body.
        - Use MongoDB aggregation to:
            * Match the provided user_id.
            * Project relevant fields such as:
                - username
                - user_type
                - email
                - contact_num
                - login_method
                - role
                - user_status
                - Created_DTM, Created_BY
                - Approved_DTM, Approved_By
                - User_End_DTM
                - Remark
        - Return 404 if no user matches the provided ID.
        - Return a success response with the extracted user details.
        - Handle errors:
            Return 400 if user_id is missing.
            Return 404 if no matching user is found.
            Return 500 for internal or database-related errors.
*/
export const List_All_User_Details_By_ID = async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({
      status: "error",
      message: "User ID is required.",
    });
  }

  try {
    const user = await User.aggregate([
      { $match: { user_id: user_id, user_type: "Slt" } },
      {
        $project: {
          _id: 0,
          username: 1,
          user_type: 1,
          email: 1,
          contact_num: 1,
          login_method: 1,
          role: 1,
          user_status: 1,
          Created_DTM: 1,
          Created_BY: 1,
          Approved_DTM: 1,
          Approved_By: 1,
          User_End_DTM: 1,
          Remark: 1,
        },
      },
    ]);

    if (!user || user.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No user found with the given user ID.",
        data: [],
      });
    }

    return res.status(200).json({
      status: "success",
      message: "User details retrieved successfully.",
      data: user[0],
    });

  } catch (error) {
    console.error("Error fetching user by ID:", error);
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
    Function: 
        - End_User (USER - 1A02)

    Description:
        - This function marks a user account as terminated in the MongoDB database. It sets termination metadata such as who ended the account, when it was terminated, and logs a remark. The user status is also updated to inactive.

    Collections Used:
        - User: Stores all user-related information including lifecycle and status metadata.

    Request Body Parameters:
        - user_id: (Required) The unique ID of the user to terminate.
        - end_by: (Required) The user ID of the administrator or system that is terminating the account.
        - end_dtm: (Optional) The date and time of termination. If not provided, defaults to the current date and time.
        - remark: (Required) A reason or comment explaining why the user was terminated.

    Response:
        - HTTP 200: Success. Returns a summary of the terminated user and termination metadata.
        - HTTP 400: Missing required fields or user already terminated.
        - HTTP 404: No user found matching the given user ID.
        - HTTP 500: Internal server error or failed to update user status.

    Flow:
        - Validate required fields (`user_id`, `end_by`, `remark`) from the request body.
        - Default to current date/time if `end_dtm` is not provided.
        - Start a MongoDB session and transaction.
        - Find the user document using `user_id`.
            * If not found, return 404.
            * If already terminated (`User_End_DTM` exists), return 400.
        - Construct a new remark object containing:
            - remark, remark_by, and remark_dtm
        - Use `findOneAndUpdate` to:
            * Set termination fields: 
                - `User_End_DTM`, `User_End_By`, `user_status` ("false"), `User_Status_Type`, `User_Status_DTM`, `User_Status_By`
            * Push the new remark to the `Remark` array
        - Commit transaction and return a success response.
        - Handle errors:
            * Return appropriate HTTP status codes and messages for known issues.
            * Return 500 with error details on unexpected failures.
*/
export const End_User = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { user_id, end_by, end_dtm, remark } = req.body;

    // Validate User ID
    if (!user_id) {
      return res.status(400).json({
        status: "error",
        message: "user_id is required in the request body.",
      });
    }

    // Validate other required fields
    if (!end_by) {
        return res.status(400).json({ 
            status: "error",
            message: 'end_by is required in the request body.' 
        });
    }
    if (!remark) {
        return res.status(400).json({ 
            status: "error",
            message: 'remark is required in the request body.' 
        });
    }

    //Default to current date if end_dtm is not provided
    const terminationDate = end_dtm ? new Date(end_dtm) : new Date();

    let updatedUser;
    const newRemark = {
      remark: remark,
      remark_by: end_by,
      remark_dtm: terminationDate,
    };

    await session.withTransaction(async () => {
      // Find the user
      const user = await User.findOne({ user_id }).session(session);
      if (!user) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
      }

      // Check if already terminated
      if (user.user_status === "Terminate") {
        const error = new Error("User is already terminated.");
        error.statusCode = 400;
        throw error;
      }

      // Update user document
      updatedUser = await User.findOneAndUpdate(
        { user_id },
        {
          $set: {
            User_End_DTM: terminationDate,
            User_End_By: end_by,
            user_status: "Terminate",
            User_Status_Type: "user_update",
            User_Status_DTM: terminationDate,
            User_Status_By: end_by,
          },
          $push: {
            Remark: newRemark,
          },
        },
        {
          new: true,
          session,
          runValidators: true,
        }
      );

      if (!updatedUser) {
        const error = new Error("Failed to terminate user.");
        error.statusCode = 500;
        throw error;
      }
    });

    return res.status(200).json({
      status: "success",
      message: "User terminated successfully.",
      data: {
        user_id: updatedUser.user_id,
        user_status: updatedUser.user_status,
        user_end_dtm: updatedUser.User_End_DTM,
        user_end_by: updatedUser.User_End_By,
        termination_remark: newRemark,
      },
    });
  } catch (error) {
    console.error("Error terminating user:", error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message || "Internal server error.",
      ...(statusCode === 500 && { error: error.toString() }),
    });
  } finally {
    await session.endSession();
  }
};

/*
    Function: 
        - Update_User_Details (USER - 1A01)

    Description:
        - This function updates user account details in the MongoDB database. It allows changes to the user's role and/or status, and logs a remark with metadata about who performed the update and when.

    Collections Used:
        - User: Stores all user records, including roles, statuses, and remark history.

    Request Body Parameters:
        - user_id: (Required) The unique ID of the user to be updated.
        - updated_by: (Required) The user ID of the administrator or system performing the update.
        - role: (Optional) New role to assign to the user.
        - user_status: (Optional) New status to set (e.g., "true" or "false"). If it differs from the current status, related status metadata is also updated.
        - remark: (Required) A remark describing the reason or purpose for the update.

    Response:
        - HTTP 200: Success. Returns the updated user document.
        - HTTP 400: Missing required fields.
        - HTTP 404: No user found with the provided user_id.
        - HTTP 500: Internal server error or update failure.

    Flow:
        - Validate required parameters: `user_id`, `updated_by`, and `remark`.
        - Start a MongoDB session and transaction.
        - Find the user by `user_id`. If not found, return 404.
        - Construct an update object:
            * If `role` is provided → update role.
            * If `user_status` is provided and differs from the current → update status and set:
                - `User_Status_Type` to "user_update"
                - `User_Status_DTM` to current date/time
                - `User_Status_By` to `updated_by`
        - Append a new remark with `remark`, `remark_by`, and timestamp to the Remark array.
        - Perform the update using `findOneAndUpdate`.
        - Commit the transaction and return the updated document.
        - Handle errors:
            * Return appropriate error codes and messages based on the error type.
*/
export const Update_User_Details = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { user_id, updated_by, role, user_status, remark } = req.body;
    
    // Validate User ID
    if (!user_id) {
      return res.status(400).json({
        status: "error",
        message: "user_id is required in the request body.",
      });
    }

    if (!updated_by || !remark) {
      return res.status(400).json({
        status: "error",
        message: "Updated_by, and remark are required.",
      });
    }

    await session.withTransaction(async () => {
      // Find the existing user
      const user = await User.findOne({ user_id }).session(session);
      if (!user) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
      }

      const updateFields = {};
      const newRemark = {
        remark,
        remark_by: updated_by,
        remark_dtm: new Date(),
      };

      if (role) updateFields.role = role;

      if (user_status && user_status !== user.user_status) {
        updateFields.user_status = user_status;
        updateFields.User_Status_Type = "user_update";
        updateFields.User_Status_DTM = new Date();
        updateFields.User_Status_By = updated_by;
      }

      const updatedUser = await User.findOneAndUpdate(
        { user_id },
        {
          $set: updateFields,
          $push: { Remark: newRemark }
        },
        { new: true, runValidators: true, session }
      );

      if (!updatedUser) {
        throw new Error("Failed to update user.");
      }

      res.status(200).json({
        status: "success",
        message: "User details updated successfully.",
        data: updatedUser,
      });
    });

  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error",
      error: error.toString(),
    });
  } finally {
    await session.endSession();
  }
};

// export const Create_User = async (req, res) => {
//   const {
//     user_id,
//     user_type,
//     username,
//     email,
//     contact_no,
//     login_method,
//     role,
//     drc_id,
//     ro_id,
//     created_by,
//   } = req.body;

//   try {
//     if (
//       !user_id ||
//       !user_type ||
//       !username ||
//       !email ||
//       !contact_no ||
//       !login_method ||
//       !role ||
//       drc_id === undefined
//     ) {
//       return res.status(400).json({
//         status: "error",
//         message: "All required fields must be provided.",
//       });
//     }

//     const mongoConnection = await db.connectMongoDB();

//     const formattedContactNumbers = Array.isArray(contact_no)
//       ? contact_no.map((num) => ({ contact_number: Number(num) }))
//       : [{ contact_number: Number(contact_no) }];

//     // Generate sequence
//     const counterResult = await mongoConnection
//       .collection("collection_sequence")
//       .findOneAndUpdate(
//         { _id: "user_sequence" },
//         { $inc: { seq: 1 } },
//         { returnDocument: "after", upsert: true }
//       );

//     const User_Sequence = counterResult.value?.seq || counterResult.seq;
//     if (!User_Sequence) {
//       throw new Error("Failed to generate User_Sequence.");
//     }

//     const newUser = new User({
//       User_Sequence,
//       user_id,
//       user_type,
//       username,
//       email,
//       contact_num: formattedContactNumbers,
//       login_method,
//       role,
//       drc_id,
//       ro_id: ro_id || null,
//       drcUser_id: drc_id,
//       User_Status_Type: "user_update",
//       user_status: "Active",
//       User_Status_DTM: new Date(),
//       User_Status_By: created_by,
//       User_End_DTM: null,
//       User_End_By: null,
//       Created_BY: created_by,
//       Created_DTM: new Date(),
//       Approved_By: null,
//       Approved_DTM: null,
//       Remark: [
//         {
//           remark: "User Created",
//           remark_dtm: new Date(),
//           remark_by: created_by,
//         },
//       ],
//     });

//     await newUser.save();

//     return res.status(201).json({
//       status: "success",
//       message: "User registered successfully.",
//       data: {
//         newUser
//       },
//     });
//   } catch (error) {
//     console.error("Error in RegisterUser:", error.message);
//     return res.status(500).json({
//       status: "error",
//       message: "Failed to register user.",
//       errors: {
//         exception: error.message,
//       },
//     });
//   }
// };

export const List_User_Approval_Details = async (req, res) => {
  try {
    const { user_type, from_date, to_date, page } = req.body;

    console.log("Payload:" ,req.body);
    
    // Pagination logic
    let currentPage = Number(page);
    if (isNaN(currentPage) || currentPage < 1) currentPage = 1;
    const limit = currentPage === 1 ? 10 : 30;
    const skip = currentPage === 1 ? 0 : 10 + (currentPage - 2) * 30;

    const query = {};

    if (user_type) {
      query.user_type = user_type;
    }

    if (from_date || to_date) {
      const dateFilter = {};
      if (from_date) dateFilter.$gte = new Date(from_date);
      if (to_date) {
        const endOfDay = new Date(to_date);
        endOfDay.setHours(23, 59, 59, 999);
        dateFilter.$lte = endOfDay;
      }
      query.created_dtm = dateFilter;
    }

    const result = await User_Approval.aggregate([
      { $match: query },
      { $sort: { created_dtm: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          approval_id: 1,
          user_name: 1,
          user_type: 1,
          login_email: 1,
          login_method: "$parameters.login_method",
          created_dtm: 1
        }
      }
    ]);

    return res.status(200).json({
      status: "success",
      message: "User approval details retrieved successfully.",
      data: result
    });

  } catch (error) {
    console.error("Error fetching User Approval Details:", error.message);
    return res.status(500).json({
      status: "error",
      message: "There was an error retrieving user approval details."
    });
  }
};

export const List_User_Details_By_Service = async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({
      status: "error",
      message: "User ID is required.",
    });
  }

  try {
    const user = await User.aggregate([
      { $match: { user_id: user_id } },
      {
        $project: {
          _id: 0,
          username: 1,
          email: 1,
        },
      },
    ]);

    if (!user || user.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No user found with the given user ID.",
        data: [],
      });
    }

    return res.status(200).json({
      status: "success",
      message: "User details retrieved successfully.",
      data: user[0],
    });

  } catch (error) {
    console.error("Error fetching user by ID:", error);
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

export const Create_User = async (req, res) => {
  const {
    user_id,
    user_type,
    username,
    email,
    contact_no,
    login_method,
    role,
    drc_id,
    nic,
    created_by,
  } = req.body;

  try {
    if (!user_type || !username || !email || !contact_no || !login_method || !role) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields.",
      });
    }

    if (user_type === "Slt") {
      if (!user_id) {
        return res.status(400).json({
          status: "error",
          message: "user_id is required for SLT users.",
        });
      }
    } else if (user_type === "Drcuser") {
      if (!drc_id || !nic) {
        return res.status(400).json({
          status: "error",
          message: "drc_id and nic are required for DRC users.",
        });
      }
    } else {
      return res.status(400).json({
        status: "error",
        message: "Invalid user_type. Must be either 'slt' or 'drc'.",
      });
    }

    const mongoConnection = await db.connectMongoDB();

    const formattedContactNumbers = Array.isArray(contact_no)
      ? contact_no.map((num) => ({ contact_number: Number(num) }))
      : [{ contact_number: Number(contact_no) }];

    const counterResult = await mongoConnection
      .collection("collection_sequence")
      .findOneAndUpdate(
        { _id: "user_sequence" },
        { $inc: { seq: 1 } },
        { returnDocument: "after", upsert: true }
      );

    const User_Sequence = counterResult.value?.seq || counterResult.seq;
    if (!User_Sequence) {
      throw new Error("Failed to generate User_Sequence.");
    }

    const newUser = new User({
      User_Sequence,
      user_type,
      username,
      email,
      contact_num: formattedContactNumbers,
      login_method,
      role,
      user_status: "Active",
      User_Status_Type: "user_update",
      User_Status_DTM: new Date(),
      User_Status_By: created_by,
      User_End_DTM: null,
      User_End_By: null,
      Created_BY: created_by,
      Created_DTM: new Date(),
      Approved_By: null,
      Approved_DTM: null,
      Remark: [
        {
          remark: "User Created",
          remark_dtm: new Date(),
          remark_by: created_by,
        },
      ],
    });

    if (user_type === "Slt") {
      newUser.user_id = user_id;
    }

    if (user_type === "Drcuser") {
      newUser.drc_id = drc_id;
      newUser.nic = nic;
      newUser.drcUser_id = drc_id;
    }

    await newUser.save();

    return res.status(201).json({
      status: "success",
      message: "User registered successfully.",
      data: { newUser },
    });

  } catch (error) {
    console.error("Error in Create_User:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to register user.",
      errors: { exception: error.message },
    });
  }
};








