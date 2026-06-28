import ProductService from '../services/ProductService.js';

export class ProductController {
  constructor() {
    this.service = new ProductService();
  }

  register = async (req, res, next) => {
    try {
      const creatorId = req.user.userId;
      const newProduct = await this.service.registerProduct(req.body, creatorId);

      return res.status(201).json({
        status: 'success',
        statusCode: 201,
        message: 'Product registered successfully',
        data: newProduct
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const product = await this.service.getProductDetails(id);

      return res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: product
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const editorId = req.user.userId;
      const updatedProduct = await this.service.updateProduct(id, req.body, editorId);

      return res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Product updated successfully',
        data: updatedProduct
      });
    } catch (error) {
      next(error);
    }
  };

  list = async (req, res, next) => {
    try {
      const { search, page, limit } = req.query;
      const result = await this.service.listProducts({ search, page, limit });

      return res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  createMfr = async (req, res, next) => {
    try {
      const creatorId = req.user.userId;
      const { mfrName } = req.body;
      const mfr = await this.service.createManufacturer(mfrName, creatorId);

      return res.status(201).json({
        status: 'success',
        statusCode: 201,
        message: 'Manufacturer added successfully',
        data: mfr
      });
    } catch (error) {
      next(error);
    }
  };

  listMfrs = async (req, res, next) => {
    try {
      const list = await this.service.listManufacturers();
      return res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: list
      });
    } catch (error) {
      next(error);
    }
  };

  createHsn = async (req, res, next) => {
    try {
      const creatorId = req.user.userId;
      const hsn = await this.service.createHsnCode(req.body, creatorId);

      return res.status(201).json({
        status: 'success',
        statusCode: 201,
        message: 'HSN Code added successfully',
        data: hsn
      });
    } catch (error) {
      next(error);
    }
  };

  listHsns = async (req, res, next) => {
    try {
      const list = await this.service.listHsnCodes();
      return res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: list
      });
    } catch (error) {
      next(error);
    }
  };
}

export default ProductController;
