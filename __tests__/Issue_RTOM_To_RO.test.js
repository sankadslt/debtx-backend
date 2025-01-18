import { Issue_RTOM_To_RO } from '../controllers/RO_controller.js';
import Rtom from '../models/Rtom.js';
import Recovery_officer from '../models/Recovery_officer.js';

jest.mock('../models/Rtom.js');
jest.mock('../models/Recovery_officer.js');

describe('Issue_RTOM_To_RO', () => {
    let req, res;
  
    beforeEach(() => {
      req = { body: {} };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      jest.clearAllMocks();
    });
  
    it('should return 400 if ro_id or rtom_id is missing', async () => {
      req.body = { ro_id: '', rtom_id: '' };
  
      await Issue_RTOM_To_RO(req, res);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'RO ID and RTOM ID are required' });
    });
  
    it('should return 404 if RTOM is not found', async () => {
      req.body = { ro_id: '1', rtom_id: '100' };
      Rtom.findOne.mockResolvedValue(null);
  
      await Issue_RTOM_To_RO(req, res);
  
      expect(Rtom.findOne).toHaveBeenCalledWith({ rtom_id: '100' }, { area_name: 1, _id: 0 });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'RTOM not found' });
    });
  
    it('should return 404 if RO is not found', async () => {
      req.body = { ro_id: '1', rtom_id: '100' };
      Rtom.findOne.mockResolvedValue({ area_name: 'Area 1' });
      Recovery_officer.findOneAndUpdate.mockResolvedValue(null);
  
      await Issue_RTOM_To_RO(req, res);
  
      expect(Recovery_officer.findOneAndUpdate).toHaveBeenCalledWith(
        { ro_id: '1' },
        { $push: { rtoms_for_ro: { name: 'Area 1', status: 'Active' } } },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'RO not found' });
    });
  
    it('should return 200 and the updated RO if successful', async () => {
      req.body = { ro_id: '1', rtom_id: '100' };
      const rtomData = { area_name: 'Area 1' };
      const updatedRO = { ro_id: '1', rtoms_for_ro: [{ name: 'Area 1', status: 'Active' }] };
  
      Rtom.findOne.mockResolvedValue(rtomData);
      Recovery_officer.findOneAndUpdate.mockResolvedValue(updatedRO);
  
      await Issue_RTOM_To_RO(req, res);
  
      expect(Rtom.findOne).toHaveBeenCalledWith({ rtom_id: '100' }, { area_name: 1, _id: 0 });
      expect(Recovery_officer.findOneAndUpdate).toHaveBeenCalledWith(
        { ro_id: '1' },
        { $push: { rtoms_for_ro: { name: 'Area 1', status: 'Active' } } },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'RTOM assigned successfully',
        updatedRO,
      });
    });
  
    it('should return 500 if an internal server error occurs', async () => {
      req.body = { ro_id: '1', rtom_id: '100' };
      Rtom.findOne.mockRejectedValue(new Error('Database error'));
  
      await Issue_RTOM_To_RO(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });