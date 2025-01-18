// __tests__/updateRTOMStatus.test.js

import { updateRTOMStatus } from '../controllers/RTOM_controller'; // Adjust the path as needed
import db from '../config/db'; // MySQL connection mock
import Rtom from '../models/Rtom'; // Mongoose model mock

jest.mock('../config/db', () => ({
  mysqlConnection: {
    query: jest.fn(),
  },
}));

jest.mock('../models/Rtom', () => ({
  updateOne: jest.fn(),
}));

describe('updateRTOMStatus', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} }; // Mock request object
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    }; // Mock response object

    jest.clearAllMocks(); // Reset all mocks before each test
  });

  it('should return a 400 error if rtom_id or rtom_status is missing', async () => {
    await updateRTOMStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Failed to update RTOM status.",
      errors: {
        code: 400,
        description: "RTOM ID and status are required.",
      },
    });
  });

  it('should return a 404 error if RTOM is not found in MongoDB', async () => {
    req.body = { rtom_id: 123, rtom_status: "Inactive" };

    Rtom.updateOne.mockResolvedValue({ nModified: 0 }); // Simulate RTOM not being updated in MongoDB

    await updateRTOMStatus(req, res);

    expect(Rtom.updateOne).toHaveBeenCalledWith(
      { rtom_id: 123 },
      { rtom_status: "Inactive" }
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "RTOM not found in MongoDB.",
    });
  });

  it('should return a 500 error if MySQL update fails', async () => {
    req.body = { rtom_id: 123, rtom_status: "Active" };

    Rtom.updateOne.mockResolvedValue({ nModified: 1 }); // Simulate MongoDB update success

    db.mysqlConnection.query.mockImplementation((query, params, callback) => {
      callback(new Error("MySQL error"), null); // Simulate MySQL query failure
    });

    await updateRTOMStatus(req, res);

    expect(Rtom.updateOne).toHaveBeenCalledWith(
      { rtom_id: 123 },
      { rtom_status: "Active" }
    );

    expect(db.mysqlConnection.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE rtom'),
      ["Active", 123],
      expect.any(Function)
    );

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Failed to update RTOM status.",
      errors: {
        code: 500,
        description: "Internal server error occurred while updating RTOM status.",
      },
    });
  });

  it('should update RTOM status successfully in MongoDB and MySQL', async () => {
    req.body = { rtom_id: 123, rtom_status: "Pending" };

    Rtom.updateOne.mockResolvedValue({ nModified: 1 }); // Simulate MongoDB update success

    db.mysqlConnection.query.mockImplementation((query, params, callback) => {
      callback(null, { affectedRows: 1 }); // Simulate MySQL query success
    });

    await updateRTOMStatus(req, res);

    expect(Rtom.updateOne).toHaveBeenCalledWith(
      { rtom_id: 123 },
      { rtom_status: "Pending" }
    );

    expect(db.mysqlConnection.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE rtom'),
      ["Pending", 123],
      expect.any(Function)
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "RTOM status updated successfully.",
    });
  });
});
