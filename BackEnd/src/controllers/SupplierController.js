import SupplierService from '../services/SupplierService.js';

export class SupplierController {
  constructor() {
    this.service = new SupplierService();
  }

  create = async (req, res, next) => {
    try {
      const creatorId = req.user.userId;
      const supplier = await this.service.createSupplier(req.body, creatorId);

      return res.status(201).json({
        status: 'success',
        statusCode: 201,
        message: 'Supplier registered successfully',
        data: supplier
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const supplier = await this.service.updateSupplier(id, req.body);

      return res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Supplier details updated successfully',
        data: supplier
      });
    } catch (error) {
      next(error);
    }
  };

  list = async (req, res, next) => {
    try {
      const result = await this.service.listSuppliers(req.query);
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
      const supplier = await this.service.getSupplierDetails(id);

      return res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: supplier
      });
    } catch (error) {
      next(error);
    }
  };
}

export default SupplierController;
