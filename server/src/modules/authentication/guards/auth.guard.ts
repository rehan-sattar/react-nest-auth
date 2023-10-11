import { Model } from 'mongoose';
import { Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';

import { User } from '../../users/users.schema';
import { TokenService } from '../token/token.service';
import { ACCESS_TOKEN_COOKIE_KEY, REQUEST_USER_KEY } from '../authentication.constants';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  @InjectModel(User.name) private userModel: Model<User>;

  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest<Request>();
      const token = request.cookies[ACCESS_TOKEN_COOKIE_KEY];

      if (!token) {
        this.logger.error('Token not found in the request.');

        throw new UnauthorizedException();
      }

      const { sub: userId } = this.tokenService.extractTokenPayload(token);

      const user = await this.userModel.findById(userId);
      if (!user) {
        this.logger.error('User does not exists with respect to the incoming token.');

        throw new UnauthorizedException();
      }

      await this.tokenService.verifyToken(token, user.secret);

      request[REQUEST_USER_KEY] = { id: userId, email: user.email };

      return true;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
