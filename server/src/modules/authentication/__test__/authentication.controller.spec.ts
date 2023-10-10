import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, connect, Model } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { HashingService } from '../hashing/hashing.service';
import { User, UserSchema } from '../../users/users.schema';
import { AuthenticationService } from '../authentication.service';
import { AuthenticationController } from '../authentication.controller';

describe('AuthenticationController', () => {
  let userModel: Model<User>;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let controller: AuthenticationController;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    userModel = mongoConnection.model(User.name, UserSchema);

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        AuthenticationService,
        HashingService,
        { provide: getModelToken(User.name), useValue: userModel },
      ],
    }).compile();

    controller = app.get<AuthenticationController>(AuthenticationController);
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

  describe('Authentication Controller', () => {
    it('should do something!', () => {});
  });
});
