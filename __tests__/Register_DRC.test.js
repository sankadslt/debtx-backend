import { registerDRC } from '../controllers/DRC_controller.js';
import moment from 'moment';

jest.mock('../config/db.js', () => ({
  connectMongoDB: jest.fn(),
  mysqlConnection: {
    query: jest.fn(),
  },
}));

jest.mock('../models/Debt_recovery_company.js', () => {
  return jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue({}),
  }));
});

describe('registerDRC Controller', () => {
  let mockReq, mockRes;

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  beforeEach(() => {
    mockReq = (body = {}) => ({ body });
    mockRes = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };
  });

  it('should register a DRC successfully', async () => {
    const req = mockReq({
      DRC_Name: 'Test DRC',
      DRC_Abbreviation: 'TDRC',
      Contact_Number: '1234567890',
    });
    const res = mockRes();

    const db = require('../config/db');
    const DRC = require('../models/Debt_recovery_company.js');

    // Mock MongoDB connection and counter update
    const mockMongoCollection = {
      findOneAndUpdate: jest.fn().mockResolvedValue({
        seq: 101,
      }),
    };
    db.connectMongoDB.mockResolvedValue({
      collection: jest.fn(() => mockMongoCollection),
    });

    // Mock MySQL query
    db.mysqlConnection.query.mockImplementation((query, values, callback) => {
      callback(null, { insertId: 1 });
    });

    await registerDRC(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'DRC registered successfully.',
      data: {
        drc_id: 101,
        drc_abbreviation: 'TDRC',
        drc_name: 'Test DRC',
        contact_no: '1234567890',
        drc_status: 'Active',
        drc_end_date: '',
        created_by: 'Admin',
        created_dtm: moment().format('YYYY-MM-DD HH:mm:ss'),
      },
    });

    // Ensure MongoDB interactions were called
    expect(mockMongoCollection.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'drc_id' },
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
    );

    // Ensure MySQL interactions were called
    expect(db.mysqlConnection.query).toHaveBeenCalled();
  });

  it('should return 400 if required fields are missing', async () => {
    const req = mockReq({});
    const res = mockRes();

    await registerDRC(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Failed to register DRC.',
      errors: {
        field_name: 'All fields are required',
      },
    });
  });

  it('should return 500 if MongoDB connection fails', async () => {
    const req = mockReq({
      DRC_Name: 'Test DRC',
      DRC_Abbreviation: 'TDRC',
      Contact_Number: '1234567890',
    });
    const res = mockRes();

    const db = require('../config/db');
    db.connectMongoDB.mockResolvedValue(null);

    await registerDRC(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Failed to register DRC.',
      errors: {
        exception: 'MongoDB connection failed',
      },
    });
  });

  it('should return 500 if MySQL insertion fails', async () => {
    const req = mockReq({
      DRC_Name: 'Test DRC',
      DRC_Abbreviation: 'TDRC',
      Contact_Number: '1234567890',
    });
    const res = mockRes();

    const db = require('../config/db');
    const DRC = require('../models/Debt_recovery_company.js');

    // Mock MongoDB connection and counter update
    const mockMongoCollection = {
      findOneAndUpdate: jest.fn().mockResolvedValue({
        seq: 101,
      }),
    };
    db.connectMongoDB.mockResolvedValue({
      collection: jest.fn(() => mockMongoCollection),
    });

    // Mock MySQL query to throw an error
    db.mysqlConnection.query.mockImplementation((query, values, callback) => {
      callback(new Error('MySQL error'), null);
    });

    await registerDRC(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Failed to register DRC.',
      errors: {
        exception: 'MySQL error',
      },
    });
  });
});
