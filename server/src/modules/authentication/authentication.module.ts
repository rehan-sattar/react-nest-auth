import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule, JwtService } from '@nestjs/jwt';

import jwtConfig from './token/jwt.config';
import { TokenService } from './token/token.service';
import { User, UserSchema } from '../users/users.schema';
import { HashingService } from './hashing/hashing.service';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AuthenticationController],
  providers: [HashingService, AuthenticationService, JwtService, TokenService],
})
export class AuthenticationModule {}
