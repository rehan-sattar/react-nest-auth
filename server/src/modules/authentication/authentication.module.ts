import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from '../users/users.schema';
import { HashingService } from './hashing/hashing.service';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AuthenticationController],
  providers: [HashingService, AuthenticationService, JwtService],
})
export class AuthenticationModule {}
