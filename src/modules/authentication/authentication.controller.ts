import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthenticationService } from './authentication.service';

@Controller('authentication')
@ApiTags('Authentication')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Post('/sign-up')
  async signUp() {
    return this.authService.signUp();
  }

  @Post('/sign-in')
  async signIn() {
    return this.authService.signIn();
  }
}
