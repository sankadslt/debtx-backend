import { getRODetailsByID } from '../controllers/RO_controller.js';
import db from '../config/db.js'; // Ensure the path is correct
import RecoveryOfficer from '../models/Recovery_officer.js'; // Ensure the path is correct

// Mocking the database connection and RecoveryOfficer model
jest.mock('../config/db.js', () => ({
  mysqlConnection: {
    query: jest.fn(),
  },
}));

jest.mock('../models/Recovery_officer.js', () => ({
  findOne: jest.fn(),
}));

describe('getRODetailsByID Controller', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Mocking console.error to suppress error logs
  });

  afterAll(() => {
    console.error.mockRestore(); // Restores original console.error implementation after tests
  });

  const mockReq = (body = {}) => ({ body }); // Mocking request object
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res); // Mocking response status
    res.json = jest.fn().mockReturnValue(res); // Mocking response JSON method
    return res;
  };

  it('should return 200 and Recovery Officer details with assigned RTOMs', async () => {
    const req = mockReq({ ro_id: 1 });
    const res = mockRes();

    // Mocking MySQL query to return fake data
    db.mysqlConnection.query.mockImplementation((query, params, callback) => {
      callback(null, [
        {
          ro_id: 1,
          ro_name: 'Smith',
          ro_contact_no: '778541258',
          drc_id: 1,
          drc_name: 'MIT',
          ro_status: 'Active',
          login_type: 'Google',
          login_user_id: '12345678',
          remark: 'Some remark',
          rtoms_for_ro: JSON.stringify([
            { rtom_id: 1, area_name: 'Matara' },
          ]),
        },
      ]);
    });

    // Mocking MongoDB query to return additional data
    RecoveryOfficer.findOne.mockImplementation(() =>
      Promise.resolve({ additional_info: 'Mock MongoDB data' })
    );

    await getRODetailsByID(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Recovery Officer retrieved successfully.',
      data: {
        ro_id: 1,
        ro_name: 'Smith',
        ro_contact_no: '778541258',
        drc_id: 1,
        drc_name: 'MIT',
        ro_status: 'Active',
        login_type: 'Google',
        login_user_id: '12345678',
        remark: 'Some remark',
        rtoms_for_ro: [{ rtom_id: 1, area_name: 'Matara' }],
        // Uncomment if MongoDB data is merged
        // mongo_data: { additional_info: 'Mock MongoDB data' },
      },
    });
  });

  it('should return 404 if no Recovery Officer is found', async () => {
    const req = mockReq({ ro_id: 99 });
    const res = mockRes();

    // Mocking MySQL query to return no results
    db.mysqlConnection.query.mockImplementation((query, params, callback) => {
      callback(null, []);
    });

    // Mocking MongoDB query to return no data
    RecoveryOfficer.findOne.mockImplementation(() => Promise.resolve(null));

    await getRODetailsByID(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'No Recovery Officer found with ro_id: 99.',
    });
  });

  it('should return 500 if a database error occurs', async () => {
    const req = mockReq({ ro_id: 1 });
    const res = mockRes();

    // Mocking MySQL query to simulate an error
    db.mysqlConnection.query.mockImplementation((query, params, callback) => {
      callback(new Error('Database error'), null);
    });

    // Mocking MongoDB query to simulate an error
    RecoveryOfficer.findOne.mockImplementation(() =>
      Promise.reject(new Error('MongoDB error'))
    );

    await getRODetailsByID(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Database error',
      error: 'Database error',
    });
  });

  it('should return 400 if ro_id is not provided', async () => {
    const req = mockReq({});
    const res = mockRes();

    await getRODetailsByID(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'ro_id is required.',
    });
  });
});
