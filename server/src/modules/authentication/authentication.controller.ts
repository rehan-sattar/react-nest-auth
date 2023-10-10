import { Response } from 'express';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';

import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { AuthGuard } from './guards/auth.guard';
import { AuthenticationService } from './authentication.service';
import { ACCESS_TOKEN_COOKIE_KEY } from './authentication.constants';

@Controller('authentication')
@ApiTags('Authentication')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @ApiOkResponse()
  @Post('/sign-up')
  @HttpCode(HttpStatus.OK)
  async signUp(@Res({ passthrough: true }) response: Response, @Body() signUpDto: SignUpDto) {
    const accessToken = await this.authService.signUp(signUpDto);

    return this.setTokenInResponseCookies(response, accessToken);
  }

  @ApiOkResponse()
  @Post('/sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(@Res({ passthrough: true }) response: Response, @Body() signInDto: SignInDto) {
    const accessToken = await this.authService.signIn(signInDto);

    return this.setTokenInResponseCookies(response, accessToken);
  }

  @Post('/me')
  @UseGuards(AuthGuard)
  async me() {
    return 'This is me!';
  }

  private setTokenInResponseCookies(response: Response, accessToken: string) {
    response
      .cookie(ACCESS_TOKEN_COOKIE_KEY, accessToken, {
        secure: false,
        httpOnly: true,
        sameSite: true,
      })
      .send();
  }
}
