import { ConfigType } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';

import jwtConfig from './jwt.config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  @Inject(jwtConfig.KEY)
  private readonly jwtConfiguration: ConfigType<typeof jwtConfig>;

  constructor(private readonly jwtService: JwtService) {}

  createToken() {}

  verifyToken() {}

  isTokenExpired() {}

  extractTokenFromRequest() {}
}
