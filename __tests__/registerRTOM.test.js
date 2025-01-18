// __tests__/registerRTOM.test.js
import { registerRTOM } from '../controllers/RTOM_controller.js'; // Adjust path as necessary
import db from '../config/db.js'; // Mock the database module
// import Rtom from '../models/Rtom';

jest.mock('../config/db.js', () => ({
  connectMongoDB: jest.fn(),
  mysqlConnection: {
    query: jest.fn(),
  },
}));

jest.mock('../models/Rtom', () => {
  return jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue(),
  }));
});

describe('registerRTOM', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} }; // Mock request object
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    }; // Mock response object

    jest.clearAllMocks(); // Reset mocks before each test
  });

  it('should return a 400 error if required fields are missing', async () => {
    await registerRTOM(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Failed to register RTOM.",
      errors: {
        field_name: "All fields are required",
      },
    });
  });

  it('should return a 500 error if MongoDB connection fails', async () => {
    req.body = { Area_Name: "Test Area", RTOM_Abbreviation: "TST" };
    db.connectMongoDB.mockResolvedValue(null); // Simulate MongoDB connection failure

    await registerRTOM(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Failed to register RTOM.",
      errors: {
        exception: "MongoDB connection failed",
      },
    });
  });

  it('should return a 500 error if generating rtom_id fails', async () => {
    req.body = { Area_Name: "Test Area", RTOM_Abbreviation: "TST" };
    db.connectMongoDB.mockResolvedValue({
      collection: jest.fn().mockReturnValue({
        findOneAndUpdate: jest.fn().mockResolvedValue(null), // Simulate failure to generate rtom_id
      }),
    });

    await registerRTOM(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Failed to register RTOM.",
      errors: {
        exception: "Failed to generate rtom_id",
      },
    });
  });

  it('should register RTOM successfully if MongoDB and MySQL operations succeed', async () => {
    req.body = { Area_Name: "Test Area", RTOM_Abbreviation: "TST" };

    db.connectMongoDB.mockResolvedValue({
      collection: jest.fn().mockReturnValue({
        findOneAndUpdate: jest.fn().mockResolvedValue({ seq: 1 }), // Simulate successful rtom_id generation
      }),
    });

    db.mysqlConnection.query.mockImplementation((query, params, callback) => {
      callback(null, { affectedRows: 1 }); // Simulate successful MySQL insertion
    });

    await registerRTOM(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "RTOM registered successfully.",
      data: {
        rtom_id: 1,
        rtom_abbreviation: "TST",
        area_name: "Test Area",
        rtom_status: "Active",
      },
    });

    expect(Rtom).toHaveBeenCalledWith({
      rtom_id: 1,
      rtom_abbreviation: "TST",
      area_name: "Test Area",
      rtom_status: "Active",
    });

    expect(Rtom.mock.instances[0].save).toHaveBeenCalled(); // Ensure the save method was called
  });

  it('should return a 500 error if MySQL insertion fails', async () => {
    req.body = { Area_Name: "Test Area", RTOM_Abbreviation: "TST" };

    db.connectMongoDB.mockResolvedValue({
      collection: jest.fn().mockReturnValue({
        findOneAndUpdate: jest.fn().mockResolvedValue({ seq: 1 }), // Simulate successful rtom_id generation
      }),
    });

    db.mysqlConnection.query.mockImplementation((query, params, callback) => {
      callback(new Error("MySQL error"), null); // Simulate MySQL insertion failure
    });

    await registerRTOM(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Failed to register RTOM.",
      errors: {
        exception: "MySQL error",
      },
    });
  });
});
