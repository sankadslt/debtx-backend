import { RegisterRO } from "../controllers/RO_controller.js";
import db from "../config/db.js"; // Mock the database connection
import DebtRecoveryCompany from "../models/Debt_recovery_company.js";
import Rtom from "../models/Rtom.js";
import RecoveryOfficer from "../models/Recovery_officer.js";

// Mock database connection and models
jest.mock("../config/db.js", () => ({
  connectMongoDB: jest.fn(() => ({
    collection: jest.fn(() => ({
      findOneAndUpdate: jest.fn().mockResolvedValue({
        value: { seq: 101 }, // Mock auto-incrementing ID
      }),
    })),
  })),
  mysqlConnection: {
    query: jest.fn(),
  },
}));

jest.mock("../models/Debt_recovery_company.js", () => ({
  findOne: jest.fn(),
}));

jest.mock("../models/Rtom.js", () => ({
  findOne: jest.fn(),
}));

jest.mock("../models/Recovery_officer.js", () => jest.fn(() => ({
  save: jest.fn().mockResolvedValue(),
})));

describe("RegisterRO Controller", () => {
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {}); // Suppress console errors
  });

  afterAll(() => {
    console.error.mockRestore(); // Restore console error logs
  });

  const mockReq = (body = {}) => ({ body }); // Mock Express request object
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res); // Mock response status
    res.json = jest.fn().mockReturnValue(res); // Mock response JSON
    return res;
  };

  it("should register a Recovery Officer successfully", async () => {
    const req = mockReq({
      ro_name: "John Doe",
      ro_contact_no: "9876543210",
      drc_id: 1,
      login_type: "Admin",
      login_user_id: "admin123",
      remark: "Initial registration",
      rtoms_for_ro: [{ rtom_id: 1 }],
    });
    const res = mockRes();

    // Mock MongoDB responses
    DebtRecoveryCompany.findOne.mockResolvedValue({ drc_id: 1, drc_name: "Test DRC" });
    Rtom.findOne.mockResolvedValue({ rtom_id: 1, area_name: "Test Area" });

    // Mock MySQL queries
    db.mysqlConnection.query.mockImplementation((query, params, callback) => {
      callback(null, { affectedRows: 1 });
    });

    await RegisterRO(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "success",
        message: "Recovery Officer registered successfully in MongoDB and MySQL.",
      })
    );
  });

  it("should return 400 if required fields are missing", async () => {
    const req = mockReq({ ro_name: "John Doe" }); // Missing fields
    const res = mockRes();

    await RegisterRO(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "All required fields must be provided, including RTOMs.",
    });
  });

  it("should return 404 if DRC is not found", async () => {
    const req = mockReq({
      ro_name: "John Doe",
      ro_contact_no: "9876543210",
      drc_id: 99,
      login_type: "Admin",
      login_user_id: "admin123",
      remark: "Initial registration",
      rtoms_for_ro: [{ rtom_id: 1 }],
    });
    const res = mockRes();

    DebtRecoveryCompany.findOne.mockResolvedValue(null); // Mock DRC not found

    await RegisterRO(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "DRC with id 99 not found.",
    });
  });

  it("should return 404 if RTOM is not found", async () => {
    const req = mockReq({
      ro_name: "John Doe",
      ro_contact_no: "9876543210",
      drc_id: 1,
      login_type: "Admin",
      login_user_id: "admin123",
      remark: "Initial registration",
      rtoms_for_ro: [{ rtom_id: 999 }],
    });
    const res = mockRes();

    DebtRecoveryCompany.findOne.mockResolvedValue({ drc_id: 1, drc_name: "Test DRC" });
    Rtom.findOne.mockResolvedValue(null); // Mock RTOM not found

    await RegisterRO(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "RTOM with id 999 not found.",
    });
  });

  it("should return 500 if an error occurs during registration", async () => {
    const req = mockReq({
      ro_name: "John Doe",
      ro_contact_no: "9876543210",
      drc_id: 1,
      login_type: "Admin",
      login_user_id: "admin123",
      remark: "Initial registration",
      rtoms_for_ro: [{ rtom_id: 1 }],
    });
    const res = mockRes();

    DebtRecoveryCompany.findOne.mockRejectedValue(new Error("Database error")); // Mock DRC error

    await RegisterRO(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Failed to register Recovery Officer.",
      errors: {
        exception: "Database error",
      },
    });
  });
});
