import SupplierRepository from '../repositories/SupplierRepository.js';

export class SupplierService {
  constructor() {
    this.repo = new SupplierRepository();
  }

  async createSupplier(supplierData, creatorId) {
    const { supplierName } = supplierData;
    
    // Check if supplier name already registered
    const existing = await this.repo.findByName(supplierName);
    if (existing) {
      const err = new Error(`Supplier "${supplierName}" is already registered`);
      err.statusCode = 400;
      throw err;
    }

    return await this.repo.create({
      ...supplierData,
      createdBy: creatorId
    });
  }

  async updateSupplier(supplierId, updateData) {
    const supplier = await this.repo.findById(supplierId);
    if (!supplier) {
      const err = new Error('Supplier not found');
      err.statusCode = 404;
      throw err;
    }

    if (updateData.supplierName && updateData.supplierName !== supplier.supplierName) {
      const existing = await this.repo.findByName(updateData.supplierName);
      if (existing) {
        const err = new Error(`Supplier "${updateData.supplierName}" is already registered`);
        err.statusCode = 400;
        throw err;
      }
    }

    return await this.repo.update(supplierId, updateData);
  }

  async listSuppliers(query) {
    return await this.repo.findAndCountAll(query);
  }

  async getSupplierDetails(supplierId) {
    const supplier = await this.repo.findById(supplierId);
    if (!supplier) {
      const err = new Error('Supplier not found');
      err.statusCode = 404;
      throw err;
    }
    return supplier;
  }
}

export default SupplierService;
