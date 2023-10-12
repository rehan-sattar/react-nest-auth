import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { ConfigModule } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Connection, Model, connect } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import jwtConfig from '../token/jwt.config';
import { SignUpDto } from '../dto/sign-up.dto';
import { SignInDto } from '../dto/sign-in.dto';
import { TokenService } from '../token/token.service';
import { User, UserSchema } from '../../users/users.schema';
import { HashingService } from '../hashing/hashing.service';
import { AuthenticationService } from '../authentication.service';
import { AuthenticationController } from '../authentication.controller';
import { RefreshToken, RefreshTokenSchema } from '../token/refresh-token.schema';

const extractRefreshTokenFromCookie = (refreshTokenCookie: string): string => {
  const cookiePairs = refreshTokenCookie.split('; ');

  let refreshToken;

  for (const cookiePair of cookiePairs) {
    const [key, value] = cookiePair.split('=');
    if (key === 'refreshToken') {
      refreshToken = value;
      break;
    }
  }

  return refreshToken;
};

const signUpUser = async (
  app: INestApplication,
  { email, password, name }: { email: string; name: string; password: string },
) => {
  const signUpDto = new SignUpDto();

  signUpDto.email = email;
  signUpDto.name = name;
  signUpDto.password = password;

  return request(app.getHttpServer()).post('/authentication/sign-up').send(signUpDto);
};

const loginUser = async (app: INestApplication, { email, password }: { email: string; password: string }) => {
  const signUpDto = new SignInDto();

  signUpDto.email = email;
  signUpDto.password = password;

  return request(app.getHttpServer()).post('/authentication/sign-in').send(signUpDto);
};

const performAuthenticatedMeCall = async (app: INestApplication) => {
  await signUpUser(app, { email: 'test@mail.com', password: 'testPass1!', name: 'test-user' });
  const loginResponse = await loginUser(app, { email: 'test@mail.com', password: 'testPass1!' });
  const cookies: string[] = loginResponse.headers['set-cookie'];

  return request(app.getHttpServer()).get('/authentication/me').set('Cookie', cookies).send();
};

const signOut = async (app: INestApplication, loginCookies: string[]) => {
  return request(app.getHttpServer()).post('/authentication/sign-out').set('Cookie', loginCookies).send();
};

describe('Authentication Service 🔒🔑', () => {
  let userModel: Model<User>;
  let refreshTokenModel: Model<RefreshToken>;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;

  let app: INestApplication;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    userModel = mongoConnection.model(User.name, UserSchema);
    refreshTokenModel = mongoConnection.model(RefreshToken.name, RefreshTokenSchema);

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forFeature(jwtConfig),
        JwtModule.registerAsync(jwtConfig.asProvider()),
        ConfigModule.forRoot({ isGlobal: true, envFilePath: `.env.test` }),
      ],
      controllers: [AuthenticationController],
      providers: [
        JwtService,
        TokenService,
        HashingService,
        AuthenticationService,
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getModelToken(RefreshToken.name), useValue: refreshTokenModel },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());

    await app.init();
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  afterEach(async () => {
    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  describe('Signup Process - Email & Password Validations', () => {
    it.each`
      email              | password        | message
      ${''}              | ${'testPass1!'} | ${'email should not be empty'}
      ${'invalidEmail'}  | ${'testPass1!'} | ${'email must be an email'}
      ${'test'}          | ${'testPass1!'} | ${'email must be an email'}
      ${'test.com'}      | ${'testPass1!'} | ${'email must be an email'}
      ${'test@mail'}     | ${'testPass1!'} | ${'email must be an email'}
      ${'test@mail.com'} | ${'short'}      | ${'password must be longer than or equal to 8 characters'}
      ${'test@mail.com'} | ${'testpass'}   | ${'Password must contain 1 letter, 1 number & 1 special character'}
      ${'test@mail.com'} | ${'12345678'}   | ${'Password must contain 1 letter, 1 number & 1 special character'}
      ${'test@mail.com'} | ${'!@#$%^&*'}   | ${'Password must contain 1 letter, 1 number & 1 special character'}
      ${'test@mail.com'} | ${'987654'}     | ${'Password must contain 1 letter, 1 number & 1 special character'}
      ${'test@mail.com'} | ${'abcdef'}     | ${'Password must contain 1 letter, 1 number & 1 special character'}
      ${'test@mail.com'} | ${'12345'}      | ${'Password must contain 1 letter, 1 number & 1 special character'}
      ${'test@mail.com'} | ${'!@#$%'}      | ${'Password must contain 1 letter, 1 number & 1 special character'}
      ${'test@mail.com'} | ${'99999999'}   | ${'Password must contain 1 letter, 1 number & 1 special character'}
      ${'test@mail.com'} | ${'87654321'}   | ${'Password must contain 1 letter, 1 number & 1 special character'}
      ${'test@mail.com'} | ${'1234'}       | ${'Password must contain 1 letter, 1 number & 1 special character'}
    `(
      'should throw "$message" when email is: "$email" and password is: "$password"',
      async ({ email, password, message }) => {
        const response = await signUpUser(app, {
          email,
          password,
          name: 'test',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toContain(message);
      },
    );

    /**
     * User name Required test cases
     */
    it('should throw "name should not be empty" when username is empty', async () => {
      const response = await signUpUser(app, {
        email: 'test@mail.com',
        password: 'testPass1!',
        name: '',
      });
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('name should not be empty');
    });
  });

  describe('SignUp Process - User & Token Mechanism', () => {
    it('should successfully sign in and return 200 with valid user details', async () => {
      const response = await signUpUser(app, {
        email: 'test@mail.com',
        password: 'testPass1!',
        name: 'test-user',
      });
      expect(response.status).toBe(200);
    });

    it('should throw "User already exists!" with status:  409 when user already exists.', async () => {
      const user = {
        email: 'test@mail.com',
        password: 'testPass1!',
        name: 'test-user',
      };
      // create the user first time!
      await signUpUser(app, user);

      // create same user again
      const response = await signUpUser(app, user);

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('User already exists!');
    });

    it('should successfully set accessToken & refreshToken in the cookies after successful signup', async () => {
      const response = await signUpUser(app, {
        email: 'test@mail.com',
        password: 'testPass1!',
        name: 'test-user',
      });
      const cookies: string[] = response.headers['set-cookie'];
      const accessTokenExist = cookies.some((c) => c.includes('accessToken'));
      const refreshTokenExists = cookies.some((c) => c.includes('refreshToken'));

      expect(accessTokenExist).toBeTruthy();
      expect(refreshTokenExists).toBeTruthy();
    });
  });

  describe('Login Process - Email & Password Validations', () => {
    it.each`
      email              | password        | message
      ${''}              | ${'testPass1!'} | ${'email should not be empty'}
      ${'invalidEmail'}  | ${'testPass1!'} | ${'email must be an email'}
      ${'test'}          | ${'testPass1!'} | ${'email must be an email'}
      ${'test.com'}      | ${'testPass1!'} | ${'email must be an email'}
      ${'test@mail'}     | ${'testPass1!'} | ${'email must be an email'}
      ${'test@mail.com'} | ${'short'}      | ${'password must be longer than or equal to 8 characters'}
      ${'test@mail.com'} | ${'testpass'}   | ${'Password must contain 1 letter, 1 number & 1 special character'}
      ${'test@mail.com'} | ${'12345678'}   | ${'Password must contain 1 letter, 1 number & 1 special character'}
      ${'test@mail.com'} | ${'!@#$%^&*'}   | ${'Password must contain 1 letter, 1 number & 1 special character'}
      ${'test@mail.com'} | ${'987654'}     | ${'Password must contain 1 letter, 1 number & 1 special character'}
      ${'test@mail.com'} | ${'abcdef'}     | ${'Password must contain 1 letter, 1 number & 1 special character'}
      ${'test@mail.com'} | ${'12345'}      | ${'Password must contain 1 letter, 1 number & 1 special character'}
      ${'test@mail.com'} | ${'!@#$%'}      | ${'Password must contain 1 letter, 1 number & 1 special character'}
      ${'test@mail.com'} | ${'99999999'}   | ${'Password must contain 1 letter, 1 number & 1 special character'}
      ${'test@mail.com'} | ${'87654321'}   | ${'Password must contain 1 letter, 1 number & 1 special character'}
      ${'test@mail.com'} | ${'1234'}       | ${'Password must contain 1 letter, 1 number & 1 special character'}
    `(
      'should throw "$message" when email is: "$email" and password is: "$password"',
      async ({ email, password, message }) => {
        const response = await loginUser(app, {
          email,
          password,
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toContain(message);
      },
    );
  });

  describe('Login Process - User & Token mechanism', () => {
    const validUser = {
      email: 'test@mail.com',
      password: 'testPass1!',
      name: 'test-user',
    };

    beforeEach(async () => {
      await signUpUser(app, validUser);
    });

    it('should successfully login in and return 200 with valid user details', async () => {
      const response = await loginUser(app, {
        email: validUser.email,
        password: validUser.password,
      });
      expect(response.status).toBe(200);
    });

    it('should throw 401 with message "User with this email or password does not exists" when login with invalid user details', async () => {
      const response = await loginUser(app, {
        email: 'invalid@mail.com',
        password: 'TestPass1!',
      });
      expect(response.status).toBe(401);
      expect(response.body.message).toContain('User with this email or password does not exists.');
    });

    it('should successfully set the accessToken & refreshToken when the user is signing in with correct details', async () => {
      const response = await loginUser(app, {
        email: validUser.email,
        password: validUser.password,
      });
      const cookies: string[] = response.headers['set-cookie'];
      const accessTokenExist = cookies.some((c) => c.includes('accessToken'));
      const refreshTokenExists = cookies.some((c) => c.includes('refreshToken'));

      expect(accessTokenExist).toBeTruthy();
      expect(refreshTokenExists).toBeTruthy();
    });
  });

  describe('Api Authorization & Sanitization', () => {
    it('should throw 403 -  Unauthorized when calling `me` route without authentication.', async () => {
      const response = await request(app.getHttpServer()).get('/authentication/me');
      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Unauthorized');
    });

    it('should return 200 when calling `me` route after successful authentication', async () => {
      const response = await performAuthenticatedMeCall(app);
      expect(response.status).toBe(200);
    });

    it('should not contain password & secret when calling `me` route after successful authentication', async () => {
      const response = await performAuthenticatedMeCall(app);
      expect(response.status).toBe(200);

      expect(response.body).not.toHaveProperty('password');
      expect(response.body).not.toHaveProperty('secret');
    });

    it('should contain email & name when calling `me` after successful authentication', async () => {
      const response = await performAuthenticatedMeCall(app);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
    });
  });

  describe('Refresh Token Mechanism', () => {
    it('should add a valid refreshToken in the database after successful authentication', async () => {
      const validUser = { email: 'test@mail.com', password: 'testPass1!', name: 'test-user' };
      const signupResponse = await signUpUser(app, validUser);
      const cookies: string[] = signupResponse.headers['set-cookie'];

      const refreshTokenCookie = cookies.find((c) => c.includes('refreshToken'));
      if (refreshTokenCookie) {
        const token = extractRefreshTokenFromCookie(refreshTokenCookie);
        const refreshTokenExists = await refreshTokenModel.findOne({ refreshToken: token });

        expect(refreshTokenExists).not.toBe(null);
      }
    });
  });

  describe('Sign Out Process', () => {
    it('should successfully clear accessToken & refreshToken after signing out', async () => {
      const validUser = {
        email: 'test@mail.com',
        password: 'testPass1!',
        name: 'test-user',
      };

      await signUpUser(app, validUser);
      const loginResponse = await loginUser(app, { email: validUser.email, password: validUser.password });
      const loginCookies: string[] = loginResponse.headers['set-cookie'];

      const response = await signOut(app, loginCookies);
      const responseCookies: string[] = response.headers['set-cookie'];
      expect(response.status).toBe(200);
      expect(responseCookies.some((c) => c.includes('accessToken=;'))).toBe(true);
      expect(responseCookies.some((c) => c.includes('refreshToken=;'))).toBe(true);
      expect(responseCookies.some((c) => c.includes('session-id=;'))).toBe(true);
    });
  });
});
