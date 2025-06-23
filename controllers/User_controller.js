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

/**
 * User_Controller: List_All_User_Details
 *
 * Description:
 * Retrieves a paginated list of user details from the database using optional filters.
 * Filters (user_role, user_type, user_status) are passed through the request body.
 * Pagination is handled based on the page number:
 *   - Page 1 returns 10 records
 *   - Pages 2 and onward return 30 records per page
 *
 * Request Body Parameters:
 * @param {String} [user_role]     - Optional filter by user role (e.g., "admin", "user")
 * @param {String} [user_type]      - Optional filter by user type ("slt", "DRCuser", "ro")
 * @param {String} [user_status]    - Optional filter by user status ("enabled", "disabled")
 * @param {Number} [page]           - Page number for pagination
 *
 * Responses:
 * - 200: Success with paginated user data
 * - 500: Internal server/database error
 */
export const List_All_User_Details = async (req, res) => {
  const { user_role, user_type, user_status, page } = req.body;

  try {        
    const query = {};

    if (user_role) query.role = user_role;
    if (user_type) query.user_type = user_type;
    if (user_status) query.user_status = user_status;

    let currentPage = Number(page);
    if (isNaN(currentPage) || currentPage < 1) currentPage = 1;
    const limit = currentPage === 1 ? 10 : 30;
    const skip = currentPage === 1 ? 0 : 10 + (currentPage - 2) * 30;

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
          Created_DTM: 1,
        },
      },
      { $sort: { Created_ON: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);
    
    if (!users || users.length === 0) {
      return res.status(200).json({
        status: "error",
        message: "No matching user records found.",
        data: [],
      });
    }

    const totalCount = await User.countDocuments(query);

    return res.status(200).json({
      status: "success",
      message: "User details fetched successfully",
      data: users,
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

/**
 * User_Controller: List_All_User_Details_By_ID
 *
 * Description:
 * Retrieves detailed user information by a specific user ID. This is typically used for
 * viewing or editing a single user's data. Returns core account metadata such as type,
 * email, login method, roles, approval status, and any recorded remarks.
 *
 * Request Body Parameters:
 * @param {String} user_id          - Required: the unique identifier of the user to fetch
 *
 * Responses:
 * - 200: Success with detailed user data
 * - 400: Missing user ID in the request
 * - 404: No user found with the provided ID
 * - 500: Internal server/database error
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
      { $match: { user_id: user_id } },
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

/**
 * User_Controller: End_User
 *
 * Description:
 * Terminates a user account by marking the end date, updating the status to inactive,
 * recording the termination metadata, and appending a remark to the user's history.
 * This is a transactional operation that ensures atomicity and consistency when 
 * updating user status and logging remarks.
 *
 * Request Body Parameters:
 * @param {String} user_id   - Required: Unique identifier of the user to be terminated.
 * @param {String} end_by    - Required: Email or identifier of the person performing the termination.
 * @param {String} end_dtm   - Optional: Custom termination date/time (ISO format). Defaults to current time if not provided.
 * @param {String} remark    - Required: Explanation or note about the reason for termination.
 *
 * Database Actions:
 * - Verifies user existence and checks if already terminated.
 * - Updates the user's `user_status`, `User_End_DTM`, and metadata fields.
 * - Appends a structured remark to the `Remark` array.
 * - Runs inside a Mongoose session to ensure rollback on failure.
 *
 * Responses:
 * - 200: User successfully terminated. Returns updated user status and termination metadata.
 * - 400: Missing required fields (`user_id`, `end_by`, `remark`) or user already terminated.
 * - 404: No user found with the provided ID.
 * - 500: Internal server or database error during termination process.
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
      if (user.User_End_DTM) {
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
            user_status: "false",
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

/**
 * User_Controller: Update_User_Details
 *
 * Description:
 * Updates user information such as role, email, contact number, or status. Also records a remark
 * for audit purposes and logs status metadata when the user's status changes. This operation is
 * performed inside a MongoDB session to ensure consistency.
 *
 * Request Body Parameters:
 * @param {String} user_id       - Required: Unique identifier of the user to be updated.
 * @param {String} updated_by    - Required: Identifier (typically email) of the admin/user making the update.
 * @param {String} remark        - Required: Explanation or note for the update.
 * @param {String} [role]        - Optional: New role to assign to the user.
 * @param {String} [email]       - Optional: New email address to update.
 * @param {String} [contact_num] - Optional: New contact number to update.
 * @param {String} [user_status] - Optional: New status ("true"/"false") indicating if the user is active.
 *
 * Database Actions:
 * - Finds and verifies the user exists.
 * - Updates only the provided fields.
 * - If status is changed, logs status update metadata (`User_Status_Type`, `User_Status_DTM`, `User_Status_By`).
 * - Appends a new remark to the user's `Remark` array with the reason and timestamp.
 * - Uses Mongoose transactions for data integrity.
 *
 * Responses:
 * - 200: User details successfully updated. Returns updated user document.
 * - 400: Missing required fields (`user_id`, `updated_by`, or `remark`).
 * - 404: No user found with the specified ID.
 * - 500: Internal server or database error during update operation.
 */
export const Update_User_Details = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { user_id, updated_by, role, email, contact_num, user_status, remark } = req.body;
    
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
      if (email) updateFields.email = email;
      if (contact_num) updateFields.contact_num = contact_num;

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






