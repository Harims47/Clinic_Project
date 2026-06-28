import HsnCode from '../models/HsnCode.js';

export class HsnCodeRepository {
  async create(data, transaction) {
    return await HsnCode.create(data, { transaction });
  }

  async findAll() {
    return await HsnCode.findAll({
      order: [['HsnCode', 'ASC']]
    });
  }

  async findById(hsnId) {
    return await HsnCode.findByPk(hsnId);
  }
}

export default HsnCodeRepository;
