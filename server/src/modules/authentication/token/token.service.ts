import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';

import jwtConfig from './jwt.config';
import { TokenPayload } from '../interfaces/token-payload.interface';

@Injectable()
export class TokenService {
  @Inject(jwtConfig.KEY)
  private readonly jwtConfiguration: ConfigType<typeof jwtConfig>;

  constructor(private readonly jwtService: JwtService) {}

  async createToken(payload: TokenPayload, userSecret: string): Promise<string> {
    const { audience, issuer, secret, accessTokenTtl } = this.jwtConfiguration;
    const tokenOptions = {
      audience: audience,
      issuer: issuer,
      secret: secret + userSecret,
      expiresIn: accessTokenTtl,
    };

    const token = await this.jwtService.signAsync(payload, tokenOptions);

    return token;
  }

  async verifyToken(token: string, userSecret: string): Promise<void> {
    try {
      const { audience, issuer, secret } = this.jwtConfiguration;
      await this.jwtService.verifyAsync(token, {
        secret: secret + userSecret,
        audience: audience,
        issuer: issuer,
      });
    } catch (error) {
      throw error;
    }
  }
}
