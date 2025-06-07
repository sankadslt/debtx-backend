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

import User from '../models/User.js';
import User_log from '../models/User_Log.js';

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
 * Filters (user_id, user_roles, user_type, user_status) are passed through the request body.
 * Pagination is handled based on the page number:
 *   - Page 1 returns 10 records
 *   - Pages 2 and onward return 30 records per page
 *
 * Request Body Parameters:
 * @param {String} [user_id]        - Optional filter by specific user ID
 * @param {String} [user_roles]     - Optional filter by user role (e.g., "admin", "user")
 * @param {String} [user_type]      - Optional filter by user type ("slt", "DRCuser", "ro")
 * @param {String} [user_status]    - Optional filter by user status ("enabled", "disabled")
 * @param {Number} [page]           - Page number for pagination
 *
 * Responses:
 * - 200: Success with paginated user data
 * - 404: No matching users found
 * - 500: Internal server/database error
 */
export const List_All_User_Details = async (req, res) => {
  const { user_id, user_roles, user_type, user_status, page } = req.body;

  try {
    const query = {};

    if (user_id) query.user_id = user_id;
    if (user_roles) query.user_roles = { $in: [user_roles] };
    if (user_type) query.user_type = user_type;
    if (user_status) query.user_status = user_status;

    let currentPage = Number(page);
    if (isNaN(currentPage) || currentPage < 1) currentPage = 1;
    const limit = currentPage === 1 ? 10 : 30;
    const skip = currentPage === 1 ? 0 : 10 + (currentPage - 2) * 30;

    const users = await User_log.aggregate([
      { $match: query },
      {
        $project: {
          _id: 0,
          user_id: 1,
          user_status: 1,
          user_type: 1,
          user_name: 1,
          user_mail: 1,
          created_dtm: 1,
        },
      },
      { $sort: { created_dtm: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    // console.log("Users", users);
    
    if (!users || users.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No matching user records found.",
        data: [],
      });
    }

    const totalCount = await User_log.countDocuments(query);

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
    const user = await User_log.aggregate([
      { $match: { user_id: user_id } },
      {
        $project: {
          _id: 0,
          user_type: 1,
          user_mail: 1,
          login_method: 1,
          user_roles: 1,
          user_status: 1,
          created_dtm: 1,
          created_by: 1,
          approved_dtm: 1,
          approved_by: 1,
          remark: 1,
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


