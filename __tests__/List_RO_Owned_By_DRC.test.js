import { getRODetailsByDrcID } from '../controllers/RO_controller.js';
import db from '../config/db.js';
import RecoveryOfficer from '../models/Recovery_officer.js';
import DebtRecoveryCompany from '../models/Debt_recovery_company.js';

jest.mock('../config/db.js', () => ({
  mysqlConnection: {
    query: jest.fn(),
  },
  connectMongoDB: jest.fn().mockResolvedValue({}), 
}));

jest.mock('../models/Recovery_officer.js', () => ({
  find: jest.fn(),
}));

jest.mock('../models/Debt_recovery_company.js', () => ({
  findOne: jest.fn(),
}));

describe('getRODetailsByDrcID Controller', () => {
  const mockReq = (body = {}) => ({ body });
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  afterEach(() => {
    jest.clearAllMocks(); 
  });

  it('should return 200 and Recovery Officer(s) details', async () => {
    const req = mockReq({ drc_id: 1 });
    const res = mockRes();

    // Mocking DebtRecoveryCompany.findOne to return a fake DRC
    DebtRecoveryCompany.findOne.mockResolvedValue({ drc_id: 1, drc_name: 'Test DRC' });

    // Mocking RecoveryOfficer.find to return fake Recovery Officers
    RecoveryOfficer.find.mockResolvedValue([
      {
        ro_id: 1,
        ro_name: 'John Doe',
        ro_contact_no: '123456789',
        drc_name: 'Test DRC',
        ro_status: 'Active',
        login_type: 'Admin',
        login_user_id: 'admin123',
        remark: 'Some remarks',
        rtoms_for_ro: [],
      },
    ]);

    await getRODetailsByDrcID(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Recovery Officer(s) retrieved successfully.',
      data: [
        {
          ro_id: 1,
          ro_name: 'John Doe',
          ro_contact_no: '123456789',
          drc_name: 'Test DRC',
          ro_status: 'Active',
          login_type: 'Admin',
          login_user_id: 'admin123',
          remark: 'Some remarks',
          rtoms_for_ro: [],
        },
      ],
    });
  });

  it('should return 404 if no Recovery Officers are found', async () => {
    const req = mockReq({ drc_id: 99 });
    const res = mockRes();

    // Mocking DebtRecoveryCompany.findOne to return a fake DRC
    DebtRecoveryCompany.findOne.mockResolvedValue({ drc_id: 99, drc_name: 'Test DRC' });

    // Mocking RecoveryOfficer.find to return no data
    RecoveryOfficer.find.mockResolvedValue([]);

    await getRODetailsByDrcID(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'No Recovery Officers found for drc_name: Test DRC.',
    });
  });

  it('should return 400 if drc_id is not provided', async () => {
    const req = mockReq({});
    const res = mockRes();

    await getRODetailsByDrcID(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'drc_id is required.',
    });
  });

  it('should return 500 if a MongoDB error occurs', async () => {
    const req = mockReq({ drc_id: 1 });
    const res = mockRes();

    // Mocking DebtRecoveryCompany.findOne to simulate an error
    DebtRecoveryCompany.findOne.mockRejectedValue(new Error('MongoDB error'));

    await getRODetailsByDrcID(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Internal server error',
      error: 'MongoDB error',
    });
  });
});
