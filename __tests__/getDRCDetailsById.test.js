import { getDRCDetailsById } from '../controllers/DRC_controller.js';
import { mysqlConnection } from '../config/db.js';
import DRC from '../models/Debt_recovery_company.js';

jest.mock('../config/db.js', () => ({
  mysqlConnection: {
    query: jest.fn(),
  },
}));

jest.mock('../models/Debt_recovery_company.js', () => ({
  find: jest.fn(),
}));

describe('getDRCDetailsById Controller', () => {
  let req, res;

  const mysqlMockData = [
    {
      drc_id: 1,
      drc_abbreviation: 'ABC',
      drc_name: 'ABC Company',
      drc_status: 'Active',
      contact_number: '123456789',
      drc_end_date: null,
      create_by: 'Admin',
      create_dtm: '2024-01-01',
    },
  ];

  const mongoMockData = [
    {
      drc_id: 1,
      drc_abbreviation: 'ABC',
      drc_name: 'ABC Company',
      drc_status: 'Active',
      contact_number: '123456789',
      drc_end_date: null,
      create_by: 'Admin',
      create_dtm: '2024-01-01',
    },
  ];

  beforeEach(() => {
    req = { body: { DRC_ID: 1 } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return 200 and DRC details with data from MySQL and MongoDB', async () => {
    mysqlConnection.query.mockImplementation((query, params, callback) => {
      callback(null, mysqlMockData);
    });

    DRC.find.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(mongoMockData),
    }));

    await getDRCDetailsById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'DRC details retrieved successfully.',
      data: {
        mysql: mysqlMockData,
      },
    });
  });

  it('should return 400 if DRC_ID is not provided in the request body', async () => {
    req.body = {}; 

    await getDRCDetailsById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Failed to retrieve DRC details.',
      errors: {
        code: 400,
        description: 'DRC ID is required.',
      },
    });
  });

  it('should return 500 if MySQL data is empty', async () => {
    mysqlConnection.query.mockImplementation((query, params, callback) => {
      callback(null, []);
    });

    DRC.find.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(mongoMockData),
    }));

    await getDRCDetailsById(req, res);

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

  it('should console MySQL query errors', async () => {
    mysqlConnection.query.mockImplementation((query, params, callback) => {
      callback(new Error('MySQL fetch error'), null);
    });

    await getDRCDetailsById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Failed to retrieve DRC details.',
      errors: {
        code: 500,
        description: 'Internal server error occurred while fetching DRC details.',
      },
    });
    expect(console.error).toHaveBeenCalledWith('MySQL fetch error:', 'Error retieving DRC details');
  });

  it('should console MongoDB query errors', async () => {
    mysqlConnection.query.mockImplementation((query, params, callback) => {
      callback(null, mysqlMockData);
    });

    DRC.find.mockImplementation(() => ({
      select: jest.fn().mockRejectedValue(new Error('MongoDB fetch error')),
    }));

    await getDRCDetailsById(req, res);

    expect(res.status).toHaveBeenCalledWith(200); 
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'DRC details retrieved successfully.',
      data: {
        mysql: mysqlMockData,
      },
    });
    expect(console.error).toHaveBeenCalledWith('Error fetching data from MongoDB:', 'MongoDB fetch error');
  });
});
