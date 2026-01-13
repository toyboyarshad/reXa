import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';

describe('Health Check', () => {
  afterAll(async () => {
      await mongoose.connection.close();
  });

  it('should return 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('healthy');
  });
});
