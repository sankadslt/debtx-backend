import { getAllServices } from '../controllers/Service_controller.js';
import { mysqlConnection } from '../config/db.js';
import Service from '../models/Service.js';

// Mocking MySQL connection and MongoDB Service model
jest.mock('../config/db.js', () => ({
  mysqlConnection: {
    query: jest.fn(),
  },
}));

jest.mock('../models/Service.js', () => ({
  find: jest.fn().mockImplementation(() => ({
    select: jest.fn(),
  })),
}));

describe('getAllServices Controller', () => {
  let req, res;

  // Mock data
  const mysqlMockData = [
    { service_id: 1, service_type: 'Type1', service_status: 'Active' },
  ];
  const mongoMockData = [
    { service_id: 1, service_type: 'Type1', service_status: 'Active' },
  ];

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks(); // Clear mock calls
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return 200 and combined data when both MySQL and MongoDB return results', async () => {
    mysqlConnection.query.mockImplementation((query, callback) => {
      callback(null, mysqlMockData); // Mock MySQL success
    });
    Service.find.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(mongoMockData), // Mock MongoDB success
    }));

    await getAllServices(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Service details retrieved successfully.',
      data: {
        mysql: mysqlMockData,
        mongo: mongoMockData,
      },
    });
  });

  it('should return 500 if both MySQL and MongoDB fail', async () => {
    mysqlConnection.query.mockImplementation((query, callback) => {
      callback(new Error('MySQL fetch error'), null); // Simulate MySQL error
    });
    Service.find.mockImplementation(() => ({
      select: jest.fn().mockRejectedValue(new Error('MongoDB fetch error')), // Mock MongoDB error
    }));

    await getAllServices(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Failed to retrieve service details.',
      errors: {
        code: 500,
        description: 'Internal server error occurred while fetching service details.',
      },
    });
  });

  it('should handle MongoDB errors gracefully and still return MySQL data', async () => {
    mysqlConnection.query.mockImplementation((query, callback) => {
      callback(null, mysqlMockData); // Mock MySQL success
    });
    Service.find.mockImplementation(() => ({
      select: jest.fn().mockRejectedValue(new Error('MongoDB fetch error')), // Mock MongoDB error
    }));

    await getAllServices(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Service details retrieved successfully.',
      data: {
        mysql: mysqlMockData,
        mongo: null,
      },
    });
  });
});
