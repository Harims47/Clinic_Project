import ProductRepository from '../repositories/ProductRepository.js';
import ManufacturerRepository from '../repositories/ManufacturerRepository.js';
import HsnCodeRepository from '../repositories/HsnCodeRepository.js';

export class ProductService {
  constructor() {
    this.productRepo = new ProductRepository();
    this.mfrRepo = new ManufacturerRepository();
    this.hsnRepo = new HsnCodeRepository();
  }

  // ==========================================
  // Products Management
  // ==========================================

  async registerProduct(productData, creatorId) {
    const data = {
      ...productData,
      createdBy: creatorId,
      salesPrice: productData.mrp || 0.00, // Sync initial salesPrice to MRP
      isActive: true
    };
    return await this.productRepo.create(data);
  }

  async getProductDetails(productId) {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }
    return product;
  }

  async updateProduct(productId, updateData, editorId) {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    const data = {
      ...updateData,
      salesPrice: updateData.mrp !== undefined ? updateData.mrp : product.mrp,
      updatedBy: editorId
    };

    return await this.productRepo.update(productId, data);
  }

  async listProducts({ search, page = 1, limit = 10 }) {
    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    const { count, rows } = await this.productRepo.findAndCountAll({
      search,
      limit: parsedLimit,
      offset
    });

    return {
      products: rows,
      totalCount: count,
      totalPages: Math.ceil(count / parsedLimit),
      currentPage: parsedPage
    };
  }

  // ==========================================
  // Manufacturers Masters Management
  // ==========================================

  async createManufacturer(mfrName, creatorId) {
    if (!mfrName || !mfrName.trim()) {
      const error = new Error('Manufacturer name is required');
      error.statusCode = 400;
      throw error;
    }
    return await this.mfrRepo.create({
      mfrName: mfrName.trim(),
      createdBy: creatorId
    });
  }

  async listManufacturers() {
    return await this.mfrRepo.findAll();
  }

  // ==========================================
  // HsnCodes Masters Management
  // ==========================================

  async createHsnCode(hsnData, creatorId) {
    if (!hsnData.hsnCode || !hsnData.hsnCode.trim()) {
      const error = new Error('HSN Code is required');
      error.statusCode = 400;
      throw error;
    }
    return await this.hsnRepo.create({
      hsnCode: hsnData.hsnCode.trim(),
      description: hsnData.description?.trim() || null,
      createdBy: creatorId
    });
  }

  async listHsnCodes() {
    return await this.hsnRepo.findAll();
  }
}

export default ProductService;
