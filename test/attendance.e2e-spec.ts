import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AttendanceController (Integration)', () => {
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

  describe('/api/attendance/check-in (POST)', () => {
    it('should return 401 Unauthorized when requesting without token', async () => {
      await request(app.getHttpServer())
        .post('/api/attendance/check-in')
        .expect(401);
    });
  });

  describe('/api/attendance/check-out (POST)', () => {
    it('should return 401 Unauthorized when requesting without token', async () => {
      await request(app.getHttpServer())
        .post('/api/attendance/check-out')
        .expect(401);
    });
  });

  describe('/api/hr/attendance/correction/:id/approve (PATCH)', () => {
    it('should return 401 Unauthorized when requesting without token', async () => {
      await request(app.getHttpServer())
        .patch('/api/hr/attendance/correction/invalid-uuid/approve')
        .expect(401);
    });
  });
});
