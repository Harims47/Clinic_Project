import Manufacturer from '../models/Manufacturer.js';

export class ManufacturerRepository {
  async create(data, transaction) {
    return await Manufacturer.create(data, { transaction });
  }

  async findAll() {
    return await Manufacturer.findAll({
      order: [['MfrName', 'ASC']]
    });
  }

  async findById(mfrId) {
    return await Manufacturer.findByPk(mfrId);
  }
}

export default ManufacturerRepository;
