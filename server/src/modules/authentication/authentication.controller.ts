import { Response } from 'express';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';

import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { AuthGuard } from './guards/auth.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthenticationService } from './authentication.service';
import { TokenResponses } from './interfaces/token-response.interface';
import { ACCESS_TOKEN_COOKIE_KEY, REFRESH_TOKEN_COOKIE_KEY } from './authentication.constants';

@Controller('authentication')
@ApiTags('Authentication')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @ApiOkResponse()
  @Post('/sign-up')
  @HttpCode(HttpStatus.OK)
  async signUp(@Res({ passthrough: true }) response: Response, @Body() signUpDto: SignUpDto) {
    const { accessToken, refreshToken } = await this.authService.signUp(signUpDto);

    return this.setTokenInResponseCookies(response, { accessToken, refreshToken });
  }

  @ApiOkResponse()
  @Post('/sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(@Res({ passthrough: true }) response: Response, @Body() signInDto: SignInDto) {
    const tokens = await this.authService.signIn(signInDto);

    return this.setTokenInResponseCookies(response, tokens);
  }

  @ApiOkResponse()
  @Post('/refresh-tokens')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Res({ passthrough: true }) response: Response, @Body() refreshTokenDto: RefreshTokenDto) {
    const tokens = await this.authService.refreshTokens(refreshTokenDto);

    return this.setTokenInResponseCookies(response, tokens);
  }

  @Post('/me')
  @UseGuards(AuthGuard)
  async me() {
    return 'This is me!';
  }

  private setTokenInResponseCookies(response: Response, { accessToken, refreshToken }: TokenResponses) {
    const cookieOptions = {
      secure: false,
      httpOnly: true,
      sameSite: true,
    };
    response
      .cookie(ACCESS_TOKEN_COOKIE_KEY, accessToken, cookieOptions)
      .cookie(REFRESH_TOKEN_COOKIE_KEY, refreshToken, cookieOptions)
      .send();
  }
}
