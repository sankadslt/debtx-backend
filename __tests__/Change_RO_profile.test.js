import { EditRO } from '../controllers/RO_controller.js';
import RecoveryOfficer from '../models/Recovery_officer.js';
import db from '../config/db.js'; // Ensure correct path

// Mocking db.js
jest.mock('../config/db.js', () => ({
  connectMongoDB: jest.fn(), // Mock the MongoDB connection
}));

// Mocking RecoveryOfficer model
jest.mock('../models/Recovery_officer.js', () => ({
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
}));

describe('EditRO Controller', () => {
  const mockReq = (body = {}) => ({ body }); // Mock request object
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res); // Mock response status
    res.json = jest.fn().mockReturnValue(res); // Mock response JSON method
    return res;
  };

  it('should return 200 and update the Recovery Officer', async () => {
    const req = mockReq({
      ro_id: 31,
      ro_contact_no: '0123456789',
      login_type: 'Facebook',
      login_user_id: '12345678',
      remark: 'Edited RO',
    });
    const res = mockRes();

    // Mocking findOne to simulate finding the Recovery Officer
    RecoveryOfficer.findOne.mockResolvedValue({
      ro_id: 31,
      ro_contact_no: '778541787',
      login_type: 'Google',
      login_user_id: '85741248',
      remark: 'Registered RO',
    });

    // Mocking findOneAndUpdate to simulate the update
    RecoveryOfficer.findOneAndUpdate.mockResolvedValue({
      _id: '67619a4afaf309d3ffd5d77c',
      ro_id: 31,
      ro_name: 'Gathsara',
      ro_contact_no: '0123456789',
      ro_status: 'Active',
      drc_name: 'Example Company',
      rtoms_for_ro: [
        { name: 'Kaluthara', status: 'Active', _id: '67619a4afaf309d3ffd5d77d' },
        { name: 'Matara', status: 'Active', _id: '67619a4afaf309d3ffd5d77e' },
      ],
      login_type: 'Facebook',
      login_user_id: '12345678',
      remark: 'Edited RO, Registered RO',
      updatedAt: new Date().toISOString(),
      createdAt: '2024-12-17T15:35:38.108Z',
      __v: 0,
    });

    // Call the controller
    await EditRO(req, res);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Recovery Officer updated successfully.',
      data: {
        _id: '67619a4afaf309d3ffd5d77c',
        ro_id: 31,
        ro_name: 'Gathsara',
        ro_contact_no: '0123456789',
        ro_status: 'Active',
        drc_name: 'Example Company',
        rtoms_for_ro: [
          { name: 'Kaluthara', status: 'Active', _id: '67619a4afaf309d3ffd5d77d' },
          { name: 'Matara', status: 'Active', _id: '67619a4afaf309d3ffd5d77e' },
        ],
        login_type: 'Facebook',
        login_user_id: '12345678',
        remark: 'Edited RO, Registered RO',
        updatedAt: expect.any(String),
        createdAt: '2024-12-17T15:35:38.108Z',
        __v: 0,
      },
    });
  });

  it('should return 404 if the Recovery Officer is not found', async () => {
    const req = mockReq({ ro_id: 99 });
    const res = mockRes();

    // Mocking findOne to simulate no Recovery Officer found
    RecoveryOfficer.findOne.mockResolvedValue(null);

    await EditRO(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Recovery Officer with ID 99 not found.',
    });
  });

  it('should return 400 if ro_id is not provided', async () => {
    const req = mockReq({});
    const res = mockRes();

    await EditRO(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Recovery Officer ID (ro_id) is required in the body.',
    });
  });

  it('should return 500 if an error occurs during update', async () => {
    const req = mockReq({ ro_id: 31 });
    const res = mockRes();

    // Mocking findOne to throw an error
    RecoveryOfficer.findOne.mockRejectedValue(new Error('Database error'));

    await EditRO(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Failed to update Recovery Officer.',
      errors: {
        exception: 'Database error',
      },
    });
  });
});
