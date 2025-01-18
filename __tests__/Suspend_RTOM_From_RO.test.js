import { Suspend_RTOM_From_RO } from '../controllers/RO_controller.js';
import db from '../config/db.js';
import { Rtom, Recovery_officer } from '../models';

jest.mock('../config/db.js', () => ({
  mysqlConnection: {
    query: jest.fn(),
  },
}));

jest.mock('../models/Recovery_officer.js', () => ({
  Rtom: { findOne: jest.fn() },
  Recovery_officer: { findOneAndUpdate: jest.fn() },
}));

describe('Suspend_RTOM_From_RO Controller', () => {
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

  it('should update RTOM status successfully and return 200', async () => {
    const req = mockReq({ ro_id: 1, rtom_id: 2, rtom_status: 'Active' });
    const res = mockRes();

    db.mysqlConnection.query.mockImplementation((query, values, callback) => {
      callback(null, { affectedRows: 1 });
    });

    Rtom.findOne.mockResolvedValue({ rtom_id: 2, area_name: 'Test Area' });
    Recovery_officer.findOneAndUpdate.mockResolvedValue({
      ro_id: 1,
      rtoms_for_ro: [{ name: 'Test Area', status: 'Active' }],
    });

    await Suspend_RTOM_From_RO(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'RTOM status updated successfully.',
      data: {
        ro_id: 1,
        rtoms_for_ro: [{ name: 'Test Area', status: 'Active' }],
      },
    });
  });

  it('should return 400 if required fields are missing', async () => {
    const req = mockReq({});
    const res = mockRes();

    await Suspend_RTOM_From_RO(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'ro_id, rtom_name, and new_status are required.',
    });
  });

  it('should return 400 if invalid status is provided', async () => {
    const req = mockReq({ ro_id: 1, rtom_id: 2, rtom_status: 'InvalidStatus' });
    const res = mockRes();

    await Suspend_RTOM_From_RO(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Invalid status value.',
    });
  });

  it('should return 404 if no matching RTOM is found', async () => {
    const req = mockReq({ ro_id: 1, rtom_id: 2, rtom_status: 'Active' });
    const res = mockRes();

    db.mysqlConnection.query.mockImplementation((query, values, callback) => {
      callback(null, { affectedRows: 0 });
    });

    await Suspend_RTOM_From_RO(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'No matching record found for the provided ro_id and rtom_id.',
    });
  });

  it('should return 500 if a database error occurs', async () => {
    const req = mockReq({ ro_id: 1, rtom_id: 2, rtom_status: 'Active' });
    const res = mockRes();

    db.mysqlConnection.query.mockImplementation((query, values, callback) => {
      callback(new Error('Database error'), null);
    });

    await Suspend_RTOM_From_RO(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Internal server error.',
      error: 'Database error',
    });
  });

  it('should return 404 if RTOM is not found in the Rtom collection', async () => {
    const req = mockReq({ ro_id: 1, rtom_id: 2, rtom_status: 'Active' });
    const res = mockRes();

    db.mysqlConnection.query.mockImplementation((query, values, callback) => {
      callback(null, { affectedRows: 1 });
    });

    Rtom.findOne.mockResolvedValue(null);

    await Suspend_RTOM_From_RO(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'RTOM not found in Rtom collection.',
    });
  });

  it('should return 500 if an error occurs while updating the RTOM', async () => {
    const req = mockReq({ ro_id: 1, rtom_id: 2, rtom_status: 'Active' });
    const res = mockRes();

    db.mysqlConnection.query.mockImplementation((query, values, callback) => {
      callback(null, { affectedRows: 1 });
    });

    Rtom.findOne.mockRejectedValue(new Error('MongoDB error'));

    await Suspend_RTOM_From_RO(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Internal server error.',
    });
  });
});
