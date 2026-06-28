import SalesInvoiceService from '../services/SalesInvoiceService.js';

export class SalesInvoiceController {
  constructor() {
    this.service = new SalesInvoiceService();
  }

  create = async (req, res, next) => {
    try {
      const creatorId = req.user.userId;
      const invoice = await this.service.createInvoice(req.body, creatorId);

      return res.status(201).json({
        status: 'success',
        statusCode: 201,
        message: 'Sales invoice created successfully',
        data: invoice
      });
    } catch (error) {
      next(error);
    }
  };

  list = async (req, res, next) => {
    try {
      const result = await this.service.listInvoices(req.query);
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
      const invoice = await this.service.getInvoiceDetails(id);

      return res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: invoice
      });
    } catch (error) {
      next(error);
    }
  };

  cancel = async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const cancelledInvoice = await this.service.cancelInvoice(id, userId);

      return res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Invoice cancelled and stock restored successfully',
        data: cancelledInvoice
      });
    } catch (error) {
      next(error);
    }
  };
}

export default SalesInvoiceController;
