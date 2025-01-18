import { getActiveRODetailsByDrcID } from "../controllers/RO_controller.js";
import RecoveryOfficer from "../models/Recovery_officer.js";
import DebtRecoveryCompany from "../models/Debt_recovery_company.js";

// Mock the database connections
jest.mock("../config/db.js", () => ({
  connectMongoDB: jest.fn(() => Promise.resolve()), // Prevent MongoDB connection
  mysqlConnection: {
    query: jest.fn(), // Prevent MySQL queries
  },
}));

jest.mock("../models/Recovery_officer.js", () => ({
  find: jest.fn(),
}));

jest.mock("../models/Debt_recovery_company.js", () => ({
  findOne: jest.fn(),
}));

describe("getActiveRODetailsByDrcID Controller", () => {
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {}); // Suppress error logs
  });

  afterAll(() => {
    console.error.mockRestore(); // Restore console.error
  });

  const mockReq = (body = {}) => ({ body }); // Mock request
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res); // Mock status
    res.json = jest.fn().mockReturnValue(res); // Mock JSON response
    return res;
  };

  it("should return 200 and active Recovery Officers for the given drc_id", async () => {
    const req = mockReq({ drc_id: 1 });
    const res = mockRes();

    // Mock DRC document from MongoDB
    DebtRecoveryCompany.findOne.mockResolvedValue({
      drc_id: 1,
      drc_name: "Test DRC",
    });

    // Mock active Recovery Officers from MongoDB
    RecoveryOfficer.find.mockResolvedValue([
      {
        ro_id: 1,
        ro_name: "Jane Doe",
        ro_contact_no: "987654321",
        drc_name: "Test DRC",
        ro_status: "Active",
        login_type: "Admin",
        login_user_id: "admin123",
        remark: "Active officer remarks",
        rtoms_for_ro: [],
      },
    ]);

    await getActiveRODetailsByDrcID(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Active Recovery Officer(s) retrieved successfully.",
      data: [
        {
          ro_id: 1,
          ro_name: "Jane Doe",
          ro_contact_no: "987654321",
          drc_name: "Test DRC",
          ro_status: "Active",
          login_type: "Admin",
          login_user_id: "admin123",
          remark: "Active officer remarks",
          rtoms_for_ro: [],
        },
      ],
    });
  });

  it("should return 404 if no active Recovery Officers are found", async () => {
    const req = mockReq({ drc_id: 99 });
    const res = mockRes();

    // Mock DRC document not found
    DebtRecoveryCompany.findOne.mockResolvedValue(null);

    await getActiveRODetailsByDrcID(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "No Debt Recovery Company found for drc_id: 99.",
    });
  });

  it("should return 400 if drc_id is not provided", async () => {
    const req = mockReq({});
    const res = mockRes();

    await getActiveRODetailsByDrcID(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "drc_id is required.",
    });
  });

  it("should return 500 if an error occurs during database operations", async () => {
    const req = mockReq({ drc_id: 1 });
    const res = mockRes();

    // Mock DRC document error
    DebtRecoveryCompany.findOne.mockRejectedValue(
      new Error("Database error during DRC lookup")
    );

    await getActiveRODetailsByDrcID(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Internal server error",
      error: "Database error during DRC lookup",
    });
  });
});
