import { getRODetails } from '../controllers/RO_controller.js';
import db from '../config/db.js'; // Make sure this path is correct
import RecoveryOfficer from '../models/Recovery_officer.js'; // Corrected path

// Mocking the database connection and RecoveryOfficer model
jest.mock('../config/db.js', () => ({
  mysqlConnection: {
    query: jest.fn(),
  },
}));

jest.mock('../models/Recovery_officer.js', () => ({
  find: jest.fn(),
}));

describe('getRODetails Controller', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Mocking console.error to suppress error logs
  });

  afterAll(() => {
    console.error.mockRestore(); // Restores original console.error implementation after tests
  });

  const mockReq = (query = {}) => ({ query }); // Mocking request object
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res); // Mocking response status
    res.json = jest.fn().mockReturnValue(res); // Mocking response JSON method
    return res;
  };

  it('should return 200 and a list of all recovery officers with assigned RTOMs', async () => {
    const req = mockReq();
    const res = mockRes();

    // Mocking MySQL query to return fake data
    db.mysqlConnection.query.mockImplementation((query, callback) => {
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
          remark: null,
          rtoms_for_ro: JSON.stringify([
            { rtom_id: 1, area_name: 'Matara' },
          ]),
        },
        {
          ro_id: 2,
          ro_name: 'Jenny',
          ro_contact_no: '785552225',
          drc_id: 2,
          drc_name: 'Informatics',
          ro_status: 'Active',
          login_type: 'Facebook',
          login_user_id: '1258745896',
          remark: null,
          rtoms_for_ro: JSON.stringify([{ rtom_id: 2, area_name: 'Galle' }]),
        },
      ]);
    });

    // Mocking MongoDB query to return no data (not needed anymore)
    RecoveryOfficer.find.mockImplementation(() => Promise.resolve([]));

    await getRODetails(req, res);

    // Checking if the response has been set correctly
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Recovery Officer(s) retrieved successfully.',
      data: [
        {
          ro_id: 1,
          ro_name: 'Smith',
          ro_contact_no: '778541258',
          drc_id: 1,
          drc_name: 'MIT',
          ro_status: 'Active',
          login_type: 'Google',
          login_user_id: '12345678',
          remark: null,
          rtoms_for_ro: [
            { rtom_id: 1, area_name: 'Matara' },
          ],
        },
        {
          ro_id: 2,
          ro_name: 'Jenny',
          ro_contact_no: '785552225',
          drc_id: 2,
          drc_name: 'Informatics',
          ro_status: 'Active',
          login_type: 'Facebook',
          login_user_id: '1258745896',
          remark: null,
          rtoms_for_ro: [
            { rtom_id: 2, area_name: 'Galle' },
          ],
        },
      ],
    });
  });

  it('should return 404 if no recovery officers are found', async () => {
    const req = mockReq();
    const res = mockRes();

    // Mocking MySQL query to return no results
    db.mysqlConnection.query.mockImplementation((query, callback) => {
      callback(null, []);
    });

    // Mocking MongoDB query to return no data
    RecoveryOfficer.find.mockImplementation(() => Promise.resolve([]));

    await getRODetails(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'No Recovery Officer(s) found.',
    });
  });

  it('should return 500 if a database error occurs', async () => {
    const req = mockReq();
    const res = mockRes();

    // Mocking MySQL query to simulate an error
    db.mysqlConnection.query.mockImplementation((query, callback) => {
      callback(new Error('Database error'), null);
    });

    // Mocking MongoDB query to simulate an error
    RecoveryOfficer.find.mockImplementation(() =>
      Promise.reject(new Error('MongoDB error'))
    );

    await getRODetails(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Database error',
      error: 'Database error',
    });
  });
});
