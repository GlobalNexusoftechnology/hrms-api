import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('EmployeesController (Integration)', () => {
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

  describe('/api/employees (GET)', () => {
    it('should return 401 Unauthorized when requesting without token', async () => {
      await request(app.getHttpServer())
        .get('/api/employees')
        .expect(401);
    });
  });

  describe('/api/employees (POST)', () => {
    it('should return 401 Unauthorized when creating without token', async () => {
      await request(app.getHttpServer())
        .post('/api/employees')
        .send({ firstName: 'Test' })
        .expect(401);
    });
  });

  describe('/api/employees/:id/profile-photo (PATCH)', () => {
    it('should return 401 Unauthorized when requesting without token', async () => {
      await request(app.getHttpServer())
        .patch('/api/employees/invalid-uuid/profile-photo')
        .expect(401);
    });
  });
});
