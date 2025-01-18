import { getActiveServiceDetails } from '../controllers/Service_controller.js';
import { mysqlConnection } from '../config/db.js';

jest.mock('../config/db.js', () => ({
  mysqlConnection: {
    query: jest.fn(),
  },
}));

describe('getActiveServiceDetails Controller', () => {
  let req, res;

  const activeServicesMockData = [
    { service_id: 1, service_type: 'Type1', service_status: 'Active' },
    { service_id: 2, service_type: 'Type2', service_status: 'Active' },
  ];

  beforeEach(() => {
    req = {}; // No specific request body needed for this endpoint
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

  it('should return 200 and a list of active services when MySQL query succeeds', async () => {
    mysqlConnection.query.mockImplementation((query, callback) => {
      callback(null, activeServicesMockData); // Simulate successful MySQL query
    });

    await getActiveServiceDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Active services retrieved successfully.',
      data: activeServicesMockData,
    });
  });

  it('should return 404 if no active services are found', async () => {
    mysqlConnection.query.mockImplementation((query, callback) => {
      callback(null, []); // Simulate empty result
    });

    await getActiveServiceDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'No active services found.',
      errors: {
        code: 404,
        description: 'There are no services with active status.',
      },
    });
  });

  it('should return 500 if MySQL query fails', async () => {
    mysqlConnection.query.mockImplementation((query, callback) => {
      callback(new Error('MySQL fetch error'), null); // Simulate MySQL query failure
    });

    await getActiveServiceDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Failed to retrieve active services.',
      errors: {
        code: 500,
        description: 'An unexpected error occurred while fetching active services.',
      },
    });
    expect(console.error).toHaveBeenCalledWith(
      'Error retrieving active services:',
      expect.any(Error)
    );
  });
});
