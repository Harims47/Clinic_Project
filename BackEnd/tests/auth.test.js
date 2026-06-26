import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import bcrypt from 'bcryptjs';

vi.mock('../src/models/User.js');
vi.mock('bcryptjs');

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fail validation if username or password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin' });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toContain('Username and password are required');
  });

  it('should reject invalid usernames', async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'unknown', password: 'password123' });

    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toContain('Invalid credentials');
  });

  it('should reject incorrect passwords', async () => {
    User.findOne.mockResolvedValue({
      userId: 1,
      username: 'admin',
      passwordHash: 'hashedpassword',
      role: 'ADMIN',
      isActive: true
    });
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toContain('Invalid credentials');
  });

  it('should sign JWT upon successful authentication', async () => {
    User.findOne.mockResolvedValue({
      userId: 1,
      username: 'admin',
      passwordHash: 'hashedpassword',
      role: 'ADMIN',
      isActive: true
    });
    bcrypt.compare.mockResolvedValue(true);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.username).toBe('admin');
  });
});
