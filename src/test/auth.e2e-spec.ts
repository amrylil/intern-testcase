import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Auth API (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/v1/auth/login -> should SUCCEED (201) if credentials are correct', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ username: 'admin', password: 'admin123' })
      .expect(201);

    expect(response.body).toHaveProperty('data.access_token');
    accessToken = response.body.data.access_token;
  });

  it('POST /api/v1/auth/login -> should FAIL (401) if credentials are WRONG', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ username: 'admin', password: 'wrongpassword' })
      .expect(401);

    expect(response.body).toHaveProperty('statusCode', 401);
    expect(response.body).toHaveProperty('message', 'Invalid credentials');
  });

  it('GET /api/v1/auth/profile -> should SUCCEED (200) if USING a token', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('data.username', 'admin');
  });

  it('GET /api/v1/auth/profile -> should FAIL (401) if WITHOUT a token', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/auth/profile')
      .expect(401);

    expect(response.body).toHaveProperty('statusCode', 401);
    expect(response.body).toHaveProperty('message', 'Unauthorized');
  });

  it('POST /api/v1/posts -> should SUCCEED (201) if USING a token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Test Post', content: 'Test content' })
      .expect(201);
  });

  it('POST /api/v1/posts -> should FAIL (401) if WITHOUT a token', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/posts')
      .send({ title: 'Post without token', content: 'Should fail' })
      .expect(401);

    expect(response.body).toHaveProperty('statusCode', 401);
    expect(response.body).toHaveProperty('message', 'Unauthorized');
  });
});
