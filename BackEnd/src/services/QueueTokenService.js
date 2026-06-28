import QueueTokenRepository from '../repositories/QueueTokenRepository.js';
import User from '../models/User.js';

export class QueueTokenService {
  constructor() {
    this.repo = new QueueTokenRepository();
  }

  async issueToken(tokenData, creatorId) {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Double queuing protection: check if patient has active queue token today
    const activeToken = await this.repo.findActiveTokenToday(tokenData.patientId, today);
    if (activeToken) {
      const error = new Error(`Patient is already in the queue today (Token #${activeToken.tokenNumber}).`);
      error.statusCode = 400;
      throw error;
    }

    // 2. Resolve next sequential token number for this doctor today
    const nextTokenNum = await this.repo.getNextTokenNumber(tokenData.doctorId, today);

    const data = {
      patientId: tokenData.patientId,
      doctorId: tokenData.doctorId,
      consultationType: tokenData.consultationType || 'New',
      remarks: tokenData.remarks || null,
      tokenNumber: nextTokenNum,
      tokenDate: today,
      status: 'Waiting',
      createdBy: creatorId
    };

    const token = await this.repo.create(data);
    return await this.repo.findById(token.tokenId);
  }

  async checkFollowUp(patientId, doctorId) {
    const today = new Date();
    // Default follow-up window: 7 days
    const dateLimit = new Date();
    dateLimit.setDate(today.getDate() - 7);
    const dateLimitStr = dateLimit.toISOString().split('T')[0];

    const lastToken = await this.repo.findLastCompletedToken(patientId, doctorId, dateLimitStr);
    
    if (lastToken) {
      return {
        isFollowUp: true,
        lastVisitDate: lastToken.tokenDate
      };
    }
    return {
      isFollowUp: false
    };
  }

  async updateStatus(tokenId, status, userId) {
    const token = await this.repo.findById(tokenId);
    if (!token) {
      const error = new Error('Token not found');
      error.statusCode = 404;
      throw error;
    }

    const validStatuses = ['Waiting', 'Called', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      const error = new Error('Invalid token status');
      error.statusCode = 400;
      throw error;
    }

    const updateData = { status };
    const now = new Date();

    if (status === 'Called') {
      updateData.calledAt = now;
    } else if (status === 'Completed') {
      updateData.completedAt = now;
    } else if (status === 'Cancelled') {
      updateData.cancelledAt = now;
    }

    await this.repo.update(tokenId, updateData);
    return await this.repo.findById(tokenId);
  }

  async transferToken(tokenId, targetDoctorId, userId) {
    const token = await this.repo.findById(tokenId);
    if (!token) {
      const error = new Error('Token not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if target doctor exists and is active
    const targetDoctor = await User.findOne({
      where: { userId: targetDoctorId, role: 'DOCTOR', isActive: true }
    });
    if (!targetDoctor) {
      const error = new Error('Target doctor is not active or unavailable');
      error.statusCode = 400;
      throw error;
    }

    const today = new Date().toISOString().split('T')[0];

    // Compute new token number for the target doctor
    const nextTokenNum = await this.repo.getNextTokenNumber(targetDoctorId, today);

    const updateData = {
      doctorId: targetDoctorId,
      tokenNumber: nextTokenNum,
      status: 'Waiting', // Reset to waiting queue for the target doctor
      remarks: token.remarks 
        ? `${token.remarks} (Transferred from Dr. ${token.doctor?.username})`
        : `Transferred from Dr. ${token.doctor?.username}`
    };

    await this.repo.update(tokenId, updateData);
    return await this.repo.findById(tokenId);
  }

  async listQueue({ search, status, doctorId, date, page = 1, limit = 12 }) {
    const today = new Date().toISOString().split('T')[0];
    const targetDate = date || today;

    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    const { count, rows } = await this.repo.findAndCountAll({
      search,
      status,
      doctorId,
      date: targetDate,
      limit: parsedLimit,
      offset
    });

    return {
      tokens: rows,
      totalCount: count,
      totalPages: Math.ceil(count / parsedLimit),
      currentPage: parsedPage
    };
  }

  async listActiveDoctorsWithCounts() {
    const doctors = await User.findAll({
      where: { role: 'DOCTOR', isActive: true },
      attributes: ['userId', 'username']
    });

    const today = new Date().toISOString().split('T')[0];
    const result = [];

    for (const doc of doctors) {
      const waitingCount = await this.repo.findAndCountAll({
        doctorId: doc.userId,
        status: 'Waiting',
        date: today,
        limit: 1,
        offset: 0
      });

      result.push({
        userId: doc.userId,
        username: doc.username,
        waitingCount: waitingCount.count
      });
    }

    return result;
  }

  async getDashboardStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayTokens = await this.repo.getTodayTokensCount(today);
    const todayPatients = await this.repo.getTodayPatientsCount();
    const lowStockItems = await this.repo.getLowStockCount();

    return {
      todayTokens,
      todayPatients,
      lowStockItems,
      todayPurchases: 0
    };
  }
}

export default QueueTokenService;
