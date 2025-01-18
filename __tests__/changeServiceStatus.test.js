import { changeServiceStatus } from '../controllers/Service_controller.js'; // Update the path as needed
import { mysqlConnection } from '../config/db.js';
import Service from '../models/Service.js'; // Update the path as needed

jest.mock('../config/db.js', () => ({
  mysqlConnection: {
    query: jest.fn(),
  },
}));

jest.mock('../models/Service.js', () => ({
  findOneAndUpdate: jest.fn(),
}));

describe('changeServiceStatus Controller', () => {
  let req, res;
  const validRequestBody = { service_id: 1, service_status: 'Active' };
  const updatedServiceData = {
    service_id: 1,
    service_type: 'Sample Service',
    service_status: 'Active',
  };

  beforeEach(() => {
    req = { body: { ...validRequestBody } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore original console.error
  });

  it('should return 400 if service_id or service_status is missing', async () => {
    req.body = {}; // Missing required fields

    await changeServiceStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Failed to update the service status.',
      errors: {
        code: 400,
        description: 'Missing required fields: service_id or service_status.',
      },
    });
  });

  it('should return 404 if the service is not found in MySQL', async () => {
    mysqlConnection.query.mockImplementation((query, params, callback) => {
      callback(null, { affectedRows: 0 }); // No rows updated
    });

    await changeServiceStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Failed to update the service status.',
      errors: {
        code: 404,
        description: 'Service not found for the given service_id.',
      },
    });
  });

  it('should return 404 if the service is not found in MongoDB', async () => {
    mysqlConnection.query.mockImplementation((query, params, callback) => {
      callback(null, { affectedRows: 1 }); // MySQL update successful
    });
    Service.findOneAndUpdate.mockResolvedValue(null); // MongoDB record not found

    await changeServiceStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Failed to update the service status in MongoDB.',
      errors: {
        code: 404,
        description: 'Service not found in MongoDB for the given service_id.',
      },
    });
  });

  it('should return 200 if service status is updated successfully in both MySQL and MongoDB', async () => {
    mysqlConnection.query.mockImplementation((query, params, callback) => {
      if (query.includes('UPDATE service_type')) {
        callback(null, { affectedRows: 1 }); // MySQL update successful
      } else if (query.includes('SELECT service_id')) {
        callback(null, [updatedServiceData]); // Fetch updated data
      }
    });
    Service.findOneAndUpdate.mockResolvedValue({
      service_id: 1,
      service_status: 'Active',
    }); // MongoDB update successful

    await changeServiceStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Service status updated successfully in both MySQL and MongoDB.',
      data: updatedServiceData,
    });
  });

  it('should return 500 if there is an unexpected error', async () => {
    mysqlConnection.query.mockImplementation(() => {
      throw new Error('Unexpected error'); // Simulated error
    });

    await changeServiceStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Failed to update the service status.',
      errors: {
        code: 500,
        description:
          'An unexpected error occurred while updating the service status.',
      },
    });
  });
});
