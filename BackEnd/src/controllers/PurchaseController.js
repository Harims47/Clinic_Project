import PurchaseService from '../services/PurchaseService.js';

export class PurchaseController {
  constructor() {
    this.service = new PurchaseService();
  }

  create = async (req, res, next) => {
    try {
      const creatorId = req.user.userId;
      const invoice = await this.service.createPurchase(req.body, creatorId);

      return res.status(201).json({
        status: 'success',
        statusCode: 201,
        message: 'Purchase invoice recorded successfully and stock updated',
        data: invoice
      });
    } catch (error) {
      next(error);
    }
  };

  list = async (req, res, next) => {
    try {
      const result = await this.service.listPurchases(req.query);
      return res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const invoice = await this.service.getPurchaseDetails(id);

      return res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: invoice
      });
    } catch (error) {
      next(error);
    }
  };
}

export default PurchaseController;
