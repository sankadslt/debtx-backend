/* 
    Purpose: This template is used for the DRC Routes.
    Created Date: 2024-12-14
    Created By: Sasindu Srinayaka (sasindusrinayaka@gmail.com)
    Last Modified Date: 
    Modified By: 
    Version: Node.js v20.11.1
    Dependencies: express
    Related Files: RTOM_controller.js, Rtom.js
    Notes:  
*/

import { getRTOMDetails } from "../controllers/RTOM_controller.js";
import db from "../config/db.js";

jest.mock("../config/db.js", () => ({
  mysqlConnection: {
    query: jest.fn(),
  },
}));

describe("getRTOMDetails Controller", () => {
  let req, res;

  const mockRTOMData = [
    {
      rtom_id: 1,
      rtom_abbreviation: "RT01",
      area_name: "Area 1",
      rtom_status: "Active",
    },
    {
      rtom_id: 2,
      rtom_abbreviation: "RT02",
      area_name: "Area 2",
      rtom_status: "Inactive",
    },
  ];

  beforeEach(() => {
    req = {}; // No specific request data is needed
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks(); // Clear mock calls
    jest.spyOn(console, "error").mockImplementation(() => {}); // Suppress console.error
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore original mocks
  });

  it("should return 200 and RTOM details when data is retrieved successfully", async () => {
    db.mysqlConnection.query.mockImplementation((query, callback) => {
      callback(null, mockRTOMData); // Simulate successful query
    });

    await getRTOMDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "RTOM(s) retrieved successfully.",
      data: mockRTOMData,
    });
  });

  it("should return 404 if no RTOM data is found", async () => {
    db.mysqlConnection.query.mockImplementation((query, callback) => {
      callback(null, []); // Simulate empty result
    });

    await getRTOMDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "No RTOM(s) found.",
    });
  });

  it("should return 500 if there is a database error", async () => {
    const errorMessage = "Database connection failed";
    db.mysqlConnection.query.mockImplementation((query, callback) => {
      callback(new Error(errorMessage), null); // Simulate database error
    });

    await getRTOMDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Database error",
      error: errorMessage,
    });
    expect(console.error).toHaveBeenCalledWith("Error retrieving RTOM:", errorMessage);
  });

  it("should return 500 if an unexpected error occurs", async () => {
    const unexpectedError = new Error("Unexpected failure");
    db.mysqlConnection.query.mockImplementation(() => {
      throw unexpectedError; // Simulate unexpected error
    });

    await getRTOMDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Internal server error",
      error: unexpectedError.message,
    });
    expect(console.error).toHaveBeenCalledWith("Unexpected error:", unexpectedError.message);
  });
});
