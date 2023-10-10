import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { User } from '../users/users.schema';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { HashingService } from './hashing/hashing.service';
import { UserAlreadyExists } from './exceptions/user-already-exists.exception';

@Injectable()
export class AuthenticationService {
  @InjectModel(User.name) private userModel: Model<User>;

  constructor(private readonly hashingService: HashingService) {}

  async signUp(signUpDto: SignUpDto) {
    const { name, email, password } = signUpDto;

    const userExists = await this.userModel.findOne({ email });

    if (userExists) throw new UserAlreadyExists();

    const salt = await this.hashingService.getSalt();
    const hashedPassword = await this.hashingService.hash(password, salt);

    const user = await new this.userModel({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();
  }

  async signIn(signInDto: SignInDto) {
    console.log(signInDto);
  }
}
