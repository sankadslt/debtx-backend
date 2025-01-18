import { Service_to_DRC } from '../controllers/DRC_Service_controller.js';
import DRC from '../models/Debt_recovery_company.js';
import Service from '../models/Service.js';

jest.mock('../config/db.js', () => ({
  mysqlConnection: {
    query: jest.fn(),
  },
}));

jest.mock('../models/Debt_recovery_company.js', () => ({
  updateOne: jest.fn(),
}));

jest.mock('../models/Service.js', () => ({
  findOne: jest.fn(),
}));

describe('Service_to_DRC Controller', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = (body = {}) => ({ body });
    mockRes = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };
  });

  it('should assign a new service to DRC successfully', async () => {
    const req = mockReq({
      DRC_ID: 1,
      Service_ID: 1001,
    });
    const res = mockRes();

    const db = require('../config/db');

    // Mock MySQL SELECT query - no existing service
    db.mysqlConnection.query.mockImplementation((query, params, callback) => {
      if (query.includes('SELECT')) {
        console.log("Mock MySQL SELECT called");
        callback(null, []); // No service exists
      } else if (query.includes('INSERT')) {
        console.log("Mock MySQL INSERT called");
        callback(null, { insertId: 1 }); // Insert succeeds
      }
    });

    // Mock MongoDB service data lookup
    Service.findOne.mockResolvedValue({
      service_id: 1001,
      service_type: 'Loan Recovery',
    });

    // Mock MongoDB DRC update
    DRC.updateOne.mockResolvedValue({ acknowledged: true, modifiedCount: 1 });

    console.log("Starting Service_to_DRC controller execution");
    await Service_to_DRC(req, res);
    console.log("Finished Service_to_DRC controller execution");

    // Debug output to verify mock results
    console.log("Service.findOne Mock Output:", await Service.findOne.mock.results[0].value);
    console.log("DRC.updateOne Mock Output:", await DRC.updateOne.mock.results[0].value);

    // Assert that the response status and JSON were called correctly
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Service assigned to DRC successfully in MySQL and MongoDB.',
      data: {
        id: 1,
        drc_id: 1,
        service_id: 1001,
        drc_service_status: 'Active',
      },
    });

    // Verify that the mocks were called correctly
    expect(Service.findOne).toHaveBeenCalledWith({ service_id: 1001 });
    expect(DRC.updateOne).toHaveBeenCalledWith(
      { drc_id: 1 },
      {
        $push: {
          services_of_drc: {
            service_id: 1001,
            service_type: 'Loan Recovery',
            drc_service_status: 'Active',
            status_change_dtm: expect.any(Date),
            status_changed_by: 'Admin',
          },
        },
      }
    );
  });

  it('should return 400 if required fields are missing', async () => {
    const req = mockReq({});
    const res = mockRes();

    await Service_to_DRC(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Both DRC_ID and Service_ID are required.',
    });
  });

  it('should return 400 if an active service already exists', async () => {
    const req = mockReq({
      DRC_ID: 1,
      Service_ID: 1001,
    });
    const res = mockRes();

    const db = require('../config/db');

    // Mock MySQL service check query - service exists and is active
    db.mysqlConnection.query.mockImplementation((query, params, callback) => {
      if (query.includes('SELECT')) {
        callback(null, [
          {
            id: 1,
            drc_id: 1,
            service_id: 1001,
            drc_service_status: 'Active',
          },
        ]);
      }
    });

    await Service_to_DRC(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'An active service already exists for this company.',
    });
  });

  it('should update an inactive service to active', async () => {
    const req = mockReq({
      DRC_ID: 1,
      Service_ID: 1001,
    });
    const res = mockRes();

    const db = require('../config/db');

    // Mock MySQL service check query - service exists but is inactive
    db.mysqlConnection.query.mockImplementation((query, params, callback) => {
      if (query.includes('SELECT')) {
        callback(null, [
          {
            id: 1,
            drc_id: 1,
            service_id: 1001,
            drc_service_status: 'Inactive',
          },
        ]);
      } else if (query.includes('UPDATE')) {
        callback(null, { affectedRows: 1 });
      }
    });

    // Mock MongoDB service status update
    DRC.updateOne.mockResolvedValue({ acknowledged: true, modifiedCount: 1 });

    await Service_to_DRC(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Service status updated to active in MySQL and MongoDB.',
    });

    expect(DRC.updateOne).toHaveBeenCalledWith(
      { drc_id: 1, 'services_of_drc.service_id': 1001 },
      {
        $set: {
          'services_of_drc.$.drc_service_status': 'Active',
          'services_of_drc.$.status_change_dtm': expect.any(Date),
          'services_of_drc.$.status_changed_by': 'Admin',
        },
      }
    );
  });

  it('should return 500 if MySQL query fails', async () => {
    const req = mockReq({
      DRC_ID: 1,
      Service_ID: 1001,
    });
    const res = mockRes();

    const db = require('../config/db');

    // Mock MySQL service check query - throws error
    db.mysqlConnection.query.mockImplementation((query, params, callback) => {
      callback(new Error('MySQL error'), null);
    });

    await Service_to_DRC(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Failed to verify existing services.',
      errors: { database: 'MySQL error' },
    });
  });

  it('should return 404 if the service is not found in MongoDB', async () => {
    const req = mockReq({
      DRC_ID: 1,
      Service_ID: 1001,
    });
    const res = mockRes();

    const db = require('../config/db');

    // Mock MySQL service check query - no existing service
    db.mysqlConnection.query.mockImplementation((query, params, callback) => {
      if (query.includes('SELECT')) {
        callback(null, []); // No service exists
      } else if (query.includes('INSERT')) {
        callback(null, { insertId: 1 }); // Insert succeeds
      }
    });

    // Mock MongoDB service lookup - service not found
    Service.findOne.mockResolvedValue(null);

    await Service_to_DRC(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Service not found in MongoDB.',
    });
  });
});