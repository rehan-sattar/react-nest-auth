import * as crypto from 'crypto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';

import { User } from '../users/users.schema';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { TokenService } from './token/token.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { HashingService } from './hashing/hashing.service';
import { TokenResponses } from './interfaces/token-response.interface';
import { UserAlreadyExists } from './exceptions/user-already-exists.exception';
import { InvalidEmailOrPasswordException } from './exceptions/invalid-email-or-password.exception';

@Injectable()
export class AuthenticationService {
  @InjectModel(User.name) private userModel: Model<User>;

  constructor(
    private readonly tokenService: TokenService,
    private readonly hashingService: HashingService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<TokenResponses> {
    const { name, email, password } = signUpDto;

    const userExists = await this.userModel.findOne({ email });
    if (userExists) {
      throw new UserAlreadyExists();
    }

    const secret = this.generateSecret();
    const salt = await this.hashingService.getSalt();
    const hashedPassword = await this.hashingService.hash(password, salt);
    const user = await new this.userModel({
      name,
      email,
      secret,
      password: hashedPassword,
    });

    await user.save();

    return this.generateTokensForUser(user.id, user.email, user.secret);
  }

  async signIn(signInDto: SignInDto): Promise<TokenResponses> {
    const { email, password } = signInDto;

    const user = await this.userModel.findOne({ email });
    if (!user) throw new InvalidEmailOrPasswordException();

    const isEqual = await this.hashingService.compare(password, user.password);
    if (!isEqual) throw new InvalidEmailOrPasswordException();

    return this.generateTokensForUser(user.id, user.email, user.secret);
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<TokenResponses> {
    const { refreshToken } = refreshTokenDto;
    const { sub } = this.tokenService.extractTokenPayload(refreshToken);

    const user = await this.userModel.findById(sub);

    if (!user) {
      throw new BadRequestException();
    }

    const isValid = await this.tokenService.isRefreshTokenValid(refreshToken, user.id, user.secret);

    if (!isValid) throw new BadRequestException();

    return this.generateTokensForUser(user.id, user.email, user.secret);
  }

  private async generateTokensForUser(userId: string, email: string, secret: string): Promise<TokenResponses> {
    const tokenPayload = { sub: userId, email };
    const accessToken = await this.tokenService.createToken(tokenPayload, secret, 'access');
    const refreshToken = await this.tokenService.createToken(tokenPayload, secret, 'refresh');

    return { accessToken, refreshToken };
  }

  private generateSecret() {
    const secretBytes = crypto.randomBytes(32);
    const secret = secretBytes.toString('base64');

    return secret;
  }
}
