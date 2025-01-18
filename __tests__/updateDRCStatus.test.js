import { updateDRCStatus } from '../controllers/DRC_controller.js';
import { mysqlConnection } from '../config/db.js';
import DRC from '../models/Debt_recovery_company.js';

jest.mock('../config/db.js', () => ({
  mysqlConnection: {
    query: jest.fn(),
  },
}));

jest.mock('../models/Debt_recovery_company.js', () => ({
  findOneAndUpdate: jest.fn(),
}));

describe('updateDRCStatus Controller', () => {
  let req, res;

  const drcId = 1;
  const drcStatus = 'Active';

  beforeEach(() => {
    req = {
      body: { drc_id: drcId, drc_status: drcStatus },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks(); // Clear mock calls
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore original mocks
  });

  it('should return 200 and success message when both MySQL and MongoDB updates succeed', async () => {
    mysqlConnection.query.mockImplementation((query, params, callback) => {
      callback(null, { affectedRows: 1 }); // Simulate successful MySQL update
    });
    DRC.findOneAndUpdate.mockResolvedValue({
      drc_id: drcId,
      drc_status: drcStatus,
    }); // Simulate successful MongoDB update

    await updateDRCStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'DRC status updated successfully.',
      data: {
        drc_id: drcId,
        drc_status: drcStatus,
      },
    });
  });

  it('should return 400 if drc_id or drc_status is missing', async () => {
    req.body = { drc_id: null, drc_status: drcStatus }; // Missing drc_id

    await updateDRCStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Failed to update DRC status.',
      errors: {
        code: 400,
        description: 'DRC ID and status are required.',
      },
    });
  });

  it('should return 404 if MySQL update affects no rows', async () => {
    mysqlConnection.query.mockImplementation((query, params, callback) => {
      callback(null, { affectedRows: 0 }); // Simulate MySQL no rows affected
    });

    await updateDRCStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Failed to update DRC status.',
      errors: {
        code: 404,
        description: 'No record found with the provided DRC ID.',
      },
    });
  });

  it('should return 404 if MongoDB update finds no matching record', async () => {
    mysqlConnection.query.mockImplementation((query, params, callback) => {
      callback(null, { affectedRows: 1 }); // Simulate successful MySQL update
    });
    DRC.findOneAndUpdate.mockResolvedValue(null); // Simulate MongoDB no record found

    await updateDRCStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Failed to update DRC status in MongoDB.',
      errors: {
        code: 404,
        description: 'No DRC found in MongoDB for the given drc_id.',
      },
    });
  });

  it('should return 500 if MySQL update fails', async () => {
    mysqlConnection.query.mockImplementation((query, params, callback) => {
      callback(new Error('MySQL update error'), null); // Simulate MySQL failure
    });

    await updateDRCStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Failed to update DRC status.',
      errors: {
        code: 500,
        description: 'An unexpected error occurred. Please try again later.',
      },
    });
    expect(console.error).toHaveBeenCalledWith(
      'Error occurred while updating DRC status:',
      expect.any(Error)
    );
  });

  it('should return 500 if MongoDB update fails', async () => {
    mysqlConnection.query.mockImplementation((query, params, callback) => {
      callback(null, { affectedRows: 1 }); // Simulate successful MySQL update
    });
    DRC.findOneAndUpdate.mockRejectedValue(new Error('MongoDB update error')); // Simulate MongoDB failure

    await updateDRCStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Failed to update DRC status.',
      errors: {
        code: 500,
        description: 'An unexpected error occurred. Please try again later.',
      },
    });
    expect(console.error).toHaveBeenCalledWith(
      'Error occurred while updating DRC status:',
      expect.any(Error)
    );
  });
});
