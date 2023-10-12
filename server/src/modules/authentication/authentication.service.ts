import * as crypto from 'crypto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { User } from '../users/users.schema';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { TokenService } from './token/token.service';
import { HashingService } from './hashing/hashing.service';
import { TokenResponses } from './interfaces/token-response.interface';
import { UserAlreadyExists } from './exceptions/user-already-exists.exception';
import { InvalidEmailOrPasswordException } from './exceptions/invalid-email-or-password.exception';

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);

  @InjectModel(User.name) private userModel: Model<User>;

  constructor(
    private readonly tokenService: TokenService,
    private readonly hashingService: HashingService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<TokenResponses> {
    this.logger.log('Signup process started.');
    const { name, email, password } = signUpDto;

    const userExists = await this.userModel.findOne({ email });
    if (userExists) {
      this.logger.error('User already exists.');
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

    this.logger.log(`User successfully created with id: ${user.id}.`);

    return this.generateTokensForUser(user.id, user.email, user.secret);
  }

  async signIn(signInDto: SignInDto): Promise<TokenResponses> {
    this.logger.log('Sign In process started.');

    const { email, password } = signInDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      this.logger.error('Email verification - Failed.');

      throw new InvalidEmailOrPasswordException();
    }

    const isEqual = await this.hashingService.compare(password, user.password);
    if (!isEqual) {
      this.logger.error('Password verification - Failed.');

      throw new InvalidEmailOrPasswordException();
    }

    this.logger.log(`User successfully sign in with id: ${user.id}.`);

    return this.generateTokensForUser(user.id, user.email, user.secret);
  }

  async signOut(userId: string) {
    await this.tokenService.invalidateRefreshToken(userId);
  }

  async refreshTokens(refreshToken: string): Promise<TokenResponses> {
    this.logger.log('Refresh Token process started.');
    const { sub } = this.tokenService.extractTokenPayload(refreshToken);

    const user = await this.userModel.findById(sub);

    if (!user) {
      this.logger.error('User verification - Failed.');

      throw new BadRequestException();
    }

    const isValid = await this.tokenService.isRefreshTokenValid(refreshToken, user.id, user.secret);

    if (!isValid) {
      this.logger.error('Existing Refresh Token verification - Failed.');

      throw new BadRequestException();
    }

    this.logger.log(`Tokens successfully created.`);

    return this.generateTokensForUser(user.id, user.email, user.secret);
  }

  me(activeUserId: string) {
    return this.userModel.findById(activeUserId);
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
