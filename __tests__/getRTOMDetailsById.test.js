// __tests__/getRTOMDetailsById.test.js
import { getRTOMDetailsById } from '../controllers/RTOM_controller.js'; // Adjust path as necessary
import db from '../config/db'; // Assuming you have a `db` module for MySQL connection

jest.mock('../config/db.js', () => ({
  mysqlConnection: {
    query: jest.fn(), // Mock the query function
  },
}));

describe('getRTOMDetailsById', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} }; // Mock request object
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    }; // Mock response object
  });

  it('should return a 400 error if rtom_id is missing', async () => {
    await getRTOMDetailsById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Failed to retrieve RTOM details.",
      errors: {
        code: 400,
        description: "RTOM ID is required.",
      },
    });
  });

  it('should return RTOM details on successful database query', async () => {
    req.body.rtom_id = 123;
    const mockResult = [{ rtom_id: 123, rtom_abbreviation: "Test", area_name: "Area1", rtom_status: "Active" }];

    db.mysqlConnection.query.mockImplementation((query, params, callback) => {
      callback(null, mockResult); // Simulate successful query
    });

    await getRTOMDetailsById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "All RTOM details retrieved successfully.",
      data: mockResult,
    });
  });

  it('should return a 500 error on database query failure', async () => {
    req.body.rtom_id = 123;

    db.mysqlConnection.query.mockImplementation((query, params, callback) => {
      callback(new Error('Database error'), null); // Simulate query failure
    });

    await getRTOMDetailsById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Failed to retrieve RTOM details.",
      errors: {
        code: 500,
        description: "Internal server error occurred while fetching RTOM details.",
      },
    });
  });
});
