import QueueTokenService from '../services/QueueTokenService.js';

export class QueueTokenController {
  constructor() {
    this.service = new QueueTokenService();
  }

  issue = async (req, res, next) => {
    try {
      const creatorId = req.user.userId;
      const token = await this.service.issueToken(req.body, creatorId);

      return res.status(201).json({
        status: 'success',
        statusCode: 201,
        message: 'Token issued successfully',
        data: token
      });
    } catch (error) {
      next(error);
    }
  };

  list = async (req, res, next) => {
    try {
      const result = await this.service.listQueue(req.query);
      return res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.userId;

      const updatedToken = await this.service.updateStatus(id, status, userId);

      return res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: `Token status updated to ${status}`,
        data: updatedToken
      });
    } catch (error) {
      next(error);
    }
  };

  transfer = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { doctorId } = req.body;
      const userId = req.user.userId;

      const transferredToken = await this.service.transferToken(id, doctorId, userId);

      return res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Token transferred successfully',
        data: transferredToken
      });
    } catch (error) {
      next(error);
    }
  };

  checkFollowUp = async (req, res, next) => {
    try {
      const { patientId, doctorId } = req.query;
      if (!patientId || !doctorId) {
        return res.status(400).json({
          status: 'error',
          statusCode: 400,
          message: 'Both patientId and doctorId are required'
        });
      }

      const result = await this.service.checkFollowUp(patientId, doctorId);
      return res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  listDoctors = async (req, res, next) => {
    try {
      const list = await this.service.listActiveDoctorsWithCounts();
      return res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: list
      });
    } catch (error) {
      next(error);
    }
  };

  getStats = async (req, res, next) => {
    try {
      const stats = await this.service.getDashboardStats();
      return res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };
}

export default QueueTokenController;
