import { getDRCWithServicesByDRCId } from '../controllers/DRC_controller.js';

jest.mock('../config/db.js', () => ({
  mysqlConnection: {
    query: jest.fn(),
  },
}));

jest.mock('../models/Debt_recovery_company', () => ({
  find: jest.fn(),
}));

const DRC = require('../models/Debt_recovery_company');

describe('getDRCWithServicesByDRCId Controller', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  const mockReq = (body = {}) => ({ body });
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  it('should return 200 and DRC details with services from MySQL', async () => {
    const req = mockReq({ DRC_ID: 1 });
    const res = mockRes();

    const db = require('../config/db');
    db.mysqlConnection.query.mockImplementation((query, params, callback) => {
      callback(null, [
        {
          drc_id: 1,
          drc_abbreviation: 'ABC',
          drc_name: 'ABC Company',
          drc_status: 'Active',
          contact_number: '123456789',
          drc_end_date: null,
          create_by: 'Admin',
          create_dtm: '2024-01-01',
          services_of_drc: JSON.stringify([
            { id: 1, service_id: 101, service_type: 'Type A', service_status: 'Active' },
            { id: 2, service_id: 102, service_type: 'Type B', service_status: 'Inactive' },
          ]),
        },
      ]);
    });

    DRC.find.mockResolvedValue([]);

    await getDRCWithServicesByDRCId(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'DRC details retrieved successfully.',
      data: {
        mysql: [
          {
            drc_id: 1,
            drc_abbreviation: 'ABC',
            drc_name: 'ABC Company',
            drc_status: 'Active',
            contact_no: '123456789',
            drc_end_date: null,
            create_by: 'Admin',
            create_dtm: '2024-01-01',
            services_of_drc: [
              { id: 1, service_id: 101, service_type: 'Type A', service_status: 'Active' },
              { id: 2, service_id: 102, service_type: 'Type B', service_status: 'Inactive' },
            ],
          },
        ],
      },
    });
  });

  it('should return 404 if DRC_ID is not provided', async () => {
    const req = mockReq({});
    const res = mockRes();

    await getDRCWithServicesByDRCId(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Failed to retrieve DRC details.',
      errors: {
        code: 404,
        description: 'DRC with the given ID not found',
      },
    });
  });

  it('should return 500 if MySQL data is empty', async () => {
    const req = mockReq({ DRC_ID: 1 });
    const res = mockRes();

    const db = require('../config/db');
    db.mysqlConnection.query.mockImplementation((query, params, callback) => {
      callback(null, []);
    });

    DRC.find.mockResolvedValue([]);

    await getDRCWithServicesByDRCId(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Failed to retrieve DRC details.',
      errors: {
        code: 500,
        description: 'Internal server error occurred while fetching DRC details.',
      },
    });
  });

  it('should log MySQL errors to the console', async () => {
    const req = mockReq({ DRC_ID: 1 });
    const res = mockRes();

    const db = require('../config/db');
    db.mysqlConnection.query.mockImplementation((query, params, callback) => {
      callback(new Error('MySQL error'), []);
    });

    await getDRCWithServicesByDRCId(req, res);

    expect(console.error).toHaveBeenCalledWith('MySQL fetch error:', 'Failed to retireve DRC details');
  });

  it('should log MongoDB errors to the console', async () => {
    const req = mockReq({ DRC_ID: 1 });
    const res = mockRes();

    const db = require('../config/db');
    db.mysqlConnection.query.mockImplementation((query, params, callback) => {
      callback(null, []);
    });

    DRC.find.mockRejectedValue(new Error('MongoDB error'));

    await getDRCWithServicesByDRCId(req, res);

    expect(console.error).toHaveBeenCalledWith('Error fetching data from MongoDB:', 'MongoDB error');
  });
});
