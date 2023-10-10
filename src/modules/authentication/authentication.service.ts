import { Injectable } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthenticationService {
  async signUp(signUpDto: SignUpDto) {
    console.log(signUpDto);
  }

  async signIn(signInDto: SignInDto) {
    console.log(signInDto);
  }
}
