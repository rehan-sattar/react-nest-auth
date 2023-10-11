import { Model } from 'mongoose';
import { Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

import { User } from '../../users/users.schema';
import { TokenService } from '../token/token.service';
import { ACCESS_TOKEN_COOKIE_KEY } from '../authentication.constants';

@Injectable()
export class AuthGuard implements CanActivate {
  @InjectModel(User.name) private userModel: Model<User>;

  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest<Request>();

      const token = request.cookies[ACCESS_TOKEN_COOKIE_KEY];

      if (!token) {
        throw new UnauthorizedException();
      }

      const { sub: userId } = this.tokenService.extractTokenPayload(token);

      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new UnauthorizedException();
      }

      await this.tokenService.verifyToken(token, user.secret);

      return true;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
