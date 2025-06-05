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
 * Filters (user_id, role, user_type, user_status) are passed through the request body.
 * Pagination is handled based on the page number:
 *   - Page 1 returns 10 records
 *   - Pages 2 and onward return 30 records per page
 *
 * Request Body Parameters:
 * @param {String} [user_id]        - Optional filter by specific user ID
 * @param {String} [role]           - Optional filter by user role (e.g., "admin", "user")
 * @param {String} [user_type]      - Optional filter by user type ("slt", "drc", "ro")
 * @param {String} [user_status]    - Optional filter by status ("enable", "disable")
 * @param {Number} [page]           - Page number for pagination
 *
 * Responses:
 * - 200: Success with paginated user data
 * - 404: No matching users found
 * - 500: Internal server/database error
 */
export const List_All_User_Details = async (req, res) => {
  const { user_id, role, user_type, user_status, page } = req.body;

  try {
    const query = {};

    if (user_id) query.user_id = user_id;
    if (role) query.role = role;
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
          user_type: 1,
          username: 1,
          email: 1,
          created_on: 1
        }
      },
      { $sort: { created_on: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    if (!users || users.length === 0) {
      return res.status(404).json({
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

