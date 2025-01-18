// Remove_Service_From_DRC.test.js
import { Remove_Service_From_DRC } from '../controllers/DRC_Service_controller.js';
import moment from 'moment';

jest.mock('../config/db.js', () => ({
  connectMongoDB: jest.fn(),
  mysqlConnection: {
    query: jest.fn(),
  },
}));

jest.mock('../models/Debt_recovery_company.js', () => {
  const mockDRC = jest.fn();
  mockDRC.findOne = jest.fn(); // Mock the findOne method
  return mockDRC;
});

describe('Remove_Service_From_DRC Controller', () => {
  let mockReq, mockRes;

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  beforeEach(() => {
    mockReq = (body = {}, user = {}) => ({
      body,
      user,
    });
    mockRes = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };
  });

  it('should successfully remove a service from DRC', async () => {
    const req = mockReq(
      {
        DRC_ID: 1,
        Service_ID: 101,
      },
      { username: 'TestUser' }
    );
    const res = mockRes();
  
    const db = require('../config/db');
    const DRC = require('../models/Debt_recovery_company.js');
  
    // Mock MySQL check query
    db.mysqlConnection.query.mockImplementationOnce((query, values, callback) => {
      callback(null, [{ drc_service_status: 'Active' }]);
    });
  
    // Mock MySQL update query
    db.mysqlConnection.query.mockImplementationOnce((query, values, callback) => {
      callback(null, { affectedRows: 1 });
    });
  
    // Mock MongoDB findOne and save
    const mockDRC = {
      drc_id: 1,
      services_of_drc: [
        {
          service_id: 101,
          drc_service_status: 'Active',
        },
      ],
      save: jest.fn().mockResolvedValue({}),
    };
    DRC.findOne.mockResolvedValue(mockDRC);
  
    await Remove_Service_From_DRC(req, res);
  
    // Assertions
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Service removed successfully from DRC.',
      data: {
        DRC_ID: 1,
        Service_ID: 101,
        drc_service_status: 'Inactive',
      },
    });
  
    expect(db.mysqlConnection.query).toHaveBeenCalledTimes(2);
    expect(DRC.findOne).toHaveBeenCalledWith({ drc_id: 1 });
    expect(mockDRC.save).toHaveBeenCalled();
  });  

  it('should return 400 if required fields are missing', async () => {
    const req = mockReq({});
    const res = mockRes();

    await Remove_Service_From_DRC(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Failed to remove service from DRC.',
      errors: {
        field_name: 'DRC_ID and Service_ID are required',
      },
    });
  });

  it('should return 404 if the service is not active in MySQL', async () => {
    const req = mockReq({
      DRC_ID: 1,
      Service_ID: 101,
    });
    const res = mockRes();

    const db = require('../config/db');

    // Mock MySQL check query returning no active service
    db.mysqlConnection.query.mockImplementationOnce((query, values, callback) => {
      callback(null, []);
    });

    await Remove_Service_From_DRC(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'No active service found for the specified DRC and Service ID.',
    });
  });

  it('should return 500 if MySQL update fails', async () => {
    const req = mockReq({
      DRC_ID: 1,
      Service_ID: 101,
    });
    const res = mockRes();

    const db = require('../config/db');

    // Mock MySQL check query
    db.mysqlConnection.query.mockImplementationOnce((query, values, callback) => {
      callback(null, [{ drc_service_status: 'Active' }]);
    });

    // Mock MySQL update query to throw an error
    db.mysqlConnection.query.mockImplementationOnce((query, values, callback) => {
      callback(new Error('MySQL update error'), null);
    });

    await Remove_Service_From_DRC(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Failed to update service status.',
      errors: { database: 'MySQL update error' },
    });
  });

  it('should return 404 if DRC is not found in MongoDB', async () => {
    const req = mockReq({
      DRC_ID: 1,
      Service_ID: 101,
    });
    const res = mockRes();

    const db = require('../config/db');
    const DRC = require('../models/Debt_recovery_company.js');

    // Mock MySQL queries
    db.mysqlConnection.query.mockImplementationOnce((query, values, callback) => {
      callback(null, [{ drc_service_status: 'Active' }]);
    });
    db.mysqlConnection.query.mockImplementationOnce((query, values, callback) => {
      callback(null, { affectedRows: 1 });
    });

    // Mock MongoDB to return null
    DRC.findOne.mockResolvedValue(null);

    await Remove_Service_From_DRC(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'DRC not found in MongoDB.',
    });
  });
});
