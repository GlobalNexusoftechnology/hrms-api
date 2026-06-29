import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('PayrollController (Integration)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/payroll/me (GET)', () => {
    it('should return 401 Unauthorized when requesting without token', async () => {
      await request(app.getHttpServer())
        .get('/api/payroll/me')
        .expect(401);
    });
  });

  describe('/api/hr/payroll/generate (POST)', () => {
    it('should return 401 Unauthorized when requesting without token', async () => {
      await request(app.getHttpServer())
        .post('/api/hr/payroll/generate')
        .expect(401);
    });
  });
});
