import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { Inject, Injectable, Logger } from '@nestjs/common';

import jwtConfig from './jwt.config';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { RefreshToken } from './refresh-token.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  @Inject(jwtConfig.KEY)
  private readonly jwtConfiguration: ConfigType<typeof jwtConfig>;

  @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshToken>;

  constructor(private readonly jwtService: JwtService) {}

  async createToken(payload: TokenPayload, userSecret: string, tokenType: 'access' | 'refresh'): Promise<string> {
    const { audience, issuer, secret, accessTokenTtl, refreshTokenTtl } = this.jwtConfiguration;
    const tokenOptions = {
      audience: audience,
      issuer: issuer,
      secret: secret + userSecret,
      expiresIn: tokenType === 'access' ? accessTokenTtl : refreshTokenTtl,
    };

    const token = await this.jwtService.signAsync(payload, tokenOptions);

    // If the token is a refresh token, we keep it in the database for tracking purpose and more
    // control over the token management.
    if (tokenType === 'refresh') {
      // Refresh Token Invalidation
      // Delete the previous refresh token if exists so that the user can no longer use the previous one.
      await this.refreshTokenModel.deleteOne({ userId: payload.sub });
      // Create a new refresh token
      const refreshTokenModel = await new this.refreshTokenModel({ userId: payload.sub, refreshToken: token });
      await refreshTokenModel.save();
    }

    return token;
  }

  async invalidateRefreshToken(userId: string): Promise<void> {
    await this.refreshTokenModel.deleteMany({ userId });
  }

  async isRefreshTokenValid(refreshToken: string, userId: string, userSecret: string): Promise<boolean> {
    const tokenExists = await this.refreshTokenModel.findOne({ refreshToken, userId });

    if (!tokenExists) return false;

    try {
      await this.verifyToken(refreshToken, userSecret);
    } catch (error) {
      return false;
    }

    return true;
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
      this.logger.error(error, 'Token verification - Failed');
      throw error;
    }
  }

  extractTokenPayload(token: string): TokenPayload {
    const payload = this.jwtService.decode(token) as TokenPayload;

    return payload;
  }
}
