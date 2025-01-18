import { getServiceDetailsById } from '../controllers/Service_controller.js';
import { mysqlConnection } from '../config/db.js';
import Service from '../models/Service.js';

jest.mock('../config/db.js', () => ({
  mysqlConnection: {
    query: jest.fn(),
  },
}));

jest.mock('../models/Service.js', () => ({
  findOne: jest.fn(),
}));

describe('getServiceDetailsById Controller', () => {
  let req, res;

  const serviceId = 1;
  const mysqlMockData = [{ service_id: serviceId, service_type: 'Type1', service_status: 'Active' }];
  const mongoMockData = { service_id: serviceId, service_type: 'Type1', service_status: 'Active' };

  beforeEach(() => {
    req = {
      body: { service_id: serviceId },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return 200 and combined data when both MySQL and MongoDB return results', async () => {
    mysqlConnection.query.mockImplementation((query, params, callback) => {
      callback(null, mysqlMockData); // Mock MySQL success
    });
    Service.findOne.mockResolvedValue(mongoMockData); // Mock MongoDB success

    await getServiceDetailsById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Service details retrieved successfully.',
      data: {
        mysql: mysqlMockData[0],
        mongo: mongoMockData,
      },
    });
  });

  it('should return 400 if service_id is not provided', async () => {
    req.body = {}; // No service_id in request body

    await getServiceDetailsById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Failed to retrieve service details.',
      errors: {
        code: 400,
        description: 'Service ID is required.',
      },
    });
  });

  it('should return 404 if no data is found in both MySQL and MongoDB', async () => {
    mysqlConnection.query.mockImplementation((query, params, callback) => {
      callback(null, []); // Empty MySQL result
    });
    Service.findOne.mockResolvedValue(null); // No MongoDB result

    await getServiceDetailsById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Service not found.',
      errors: {
        code: 404,
        description: `No service found with service_id: ${serviceId}.`,
      },
    });
  });

  it('should handle MySQL errors and still return MongoDB data', async () => {
    mysqlConnection.query.mockImplementation((query, params, callback) => {
      callback(new Error('MySQL fetch error'), null); // Mock MySQL error
    });
    Service.findOne.mockResolvedValue(mongoMockData); // MongoDB success

    await getServiceDetailsById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Service details retrieved successfully.',
      data: {
        mysql: null,
        mongo: mongoMockData,
      },
    });
  });

  it('should handle MongoDB errors and still return MySQL data', async () => {
    mysqlConnection.query.mockImplementation((query, params, callback) => {
      callback(null, mysqlMockData); // Mock MySQL success
    });
    Service.findOne.mockRejectedValue(new Error('MongoDB fetch error')); // MongoDB error

    await getServiceDetailsById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Service details retrieved successfully.',
      data: {
        mysql: mysqlMockData[0],
        mongo: null,
      },
    });
  });

  it('should handle both MySQL and MongoDB errors', async () => {
    mysqlConnection.query.mockImplementation((query, params, callback) => {
      callback(new Error('MySQL fetch error'), null); // MySQL error
    });
    Service.findOne.mockRejectedValue(new Error('MongoDB fetch error')); // MongoDB error

    await getServiceDetailsById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Service not found.',
      errors: {
        code: 404,
        description: `No service found with service_id: ${serviceId}.`,
      },
    });
  });
});
