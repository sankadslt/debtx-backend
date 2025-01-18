import { Register_Service_Type } from '../controllers/Service_controller.js';
import db from '../config/db.js'; 

jest.mock('../config/db.js', () => ({
  connectMongoDB: jest.fn(),
  mysqlConnection: {
    query: jest.fn(),
  },
}));

describe('Register_Service_Type Controller', () => {
  const mockReq = (body) => ({ body });
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); 
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks(); 
  });

  it('should return 400 if service_type is missing', async () => {
    const req = mockReq({});
    const res = mockRes();

    await Register_Service_Type(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'service_type is required.' });
  });

  it('should return 500 if MongoDB connection fails', async () => {
    db.connectMongoDB.mockRejectedValue(new Error('MongoDB connection failed'));

    const req = mockReq({ service_type: 'Internet' });
    const res = mockRes();

    await Register_Service_Type(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
        message: 'Error storing service data',
        error: 'MongoDB connection failed',
    });
  });

  it('should return 500 if MySQL query fails', async () => {
    db.connectMongoDB.mockResolvedValue({
      collection: () => ({
        findOneAndUpdate: jest.fn().mockResolvedValue({ _id: 'service_id', __v: 0, seq: 22, sequence_value: 2 }),
      }),
    });

    db.mysqlConnection.query.mockImplementation((query, values, callback) => {
      callback(new Error('MySQL query failed'), null);
    });

    const req = mockReq({ service_type: 'Internet' });
    const res = mockRes();

    await Register_Service_Type(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error storing service data',
      error: 'Failed to generate service_id',
    });
  });

  it('should return 200 if service is registered successfully', async () => {
    db.connectMongoDB.mockResolvedValue({
      collection: () => ({
        findOneAndUpdate: jest.fn().mockResolvedValue({ value: { seq: 1 } }),
      }),
    });

    db.mysqlConnection.query.mockImplementation((query, values, callback) => {
      callback(null, { affectedRows: 1 });
    });

    const req = mockReq({ service_type: 'Internet' });
    const res = mockRes();

    await Register_Service_Type(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Service data stored successfully',
      service: expect.objectContaining({ service_type: 'Internet' }),
    });
  });
});
