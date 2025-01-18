const { suspendRO } = require('../controllers/RO_controller');
const mysql = require('../config/db');
const mongoModel = require('../models/Recovery_officer.js');

jest.mock('../config/db.js', () => ({
  query: jest.fn(),
}));

jest.mock('../models/Recovery_officer.js', () => ({
  updateOne: jest.fn(),
}));

describe('Suspend_RO Controller Tests', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle MySQL update errors', async () => {
    mysql.query.mockImplementation((query, params, callback) => {
      callback(new Error('MySQL error'), null);
    });

    const req = { body: { ro_id: 1, ro_status: 'Suspended' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await suspendRO(req, res);

    expect(consoleSpy).toHaveBeenCalledWith('Error updating status:', 'MySQL error');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'MySQL update error',
    });
  });

  it('should handle MongoDB update errors', async () => {
    mongoModel.updateOne.mockRejectedValue(new Error('MongoDB error'));

    const req = { body: { ro_id: 1, ro_status: 'Suspended' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await suspendRO(req, res);

    expect(consoleSpy).toHaveBeenCalledWith('Error updating MongoDB:', 'MongoDB error');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'MongoDB update error',
    });
  });
});
