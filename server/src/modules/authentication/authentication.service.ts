import * as crypto from 'crypto';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { User } from '../users/users.schema';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { TokenService } from './token/token.service';
import { HashingService } from './hashing/hashing.service';
import { UserAlreadyExists } from './exceptions/user-already-exists.exception';
import { InvalidEmailOrPasswordException } from './exceptions/invalid-email-or-password.exception';

@Injectable()
export class AuthenticationService {
  @InjectModel(User.name) private userModel: Model<User>;

  constructor(
    private readonly tokenService: TokenService,
    private readonly hashingService: HashingService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
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

    const tokenPayload = { sub: user.id, email: user.email };
    const accessToken = await this.tokenService.createToken(tokenPayload, secret);

    console.log('Access Token: ', accessToken);

    return accessToken;
  }

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

    const user = await this.userModel.findOne({ email });
    if (!user) throw new InvalidEmailOrPasswordException();

    const isEqual = await this.hashingService.compare(password, user.password);
    if (!isEqual) throw new InvalidEmailOrPasswordException();

    const tokenPayload = { sub: user.id, email: user.email };
    const accessToken = await this.tokenService.createToken(tokenPayload, user.secret);

    return accessToken;
  }

  private generateSecret() {
    const secretBytes = crypto.randomBytes(32);
    const secret = secretBytes.toString('base64');

    return secret;
  }
}
