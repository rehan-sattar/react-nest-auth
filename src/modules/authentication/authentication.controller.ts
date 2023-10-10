import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post } from '@nestjs/common';

import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { AuthenticationService } from './authentication.service';

@Controller('authentication')
@ApiTags('Authentication')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Post('/sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('/sign-in')
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }
}
