import { Request, Response } from 'express';
import * as crypto from 'crypto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { AuthGuard } from './guards/auth.guard';
import { ActiveUser } from './decorators/active-user.decorator';
import { AuthenticationService } from './authentication.service';
import { TokenResponses } from './interfaces/token-response.interface';
import { SanitizeMongooseModelInterceptor } from 'nestjs-mongoose-exclude';
import { ACCESS_TOKEN_COOKIE_KEY, REFRESH_TOKEN_COOKIE_KEY, SESSION_ID_COOKIE_KEY } from './authentication.constants';

@Controller('authentication')
@ApiTags('Authentication')
export class AuthenticationController {
  private readonly httpOnlyCookieOptions = {
    secure: true,
    httpOnly: true,
    sameSite: true,
  };

  constructor(private readonly authService: AuthenticationService) {}

  @ApiOkResponse()
  @Post('/sign-up')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(new SanitizeMongooseModelInterceptor())
  async signUp(@Res({ passthrough: true }) response: Response, @Body() signUpDto: SignUpDto) {
    const { accessToken, refreshToken } = await this.authService.signUp(signUpDto);

    return this.setTokenInResponseCookies(response, { accessToken, refreshToken });
  }

  @ApiOkResponse()
  @Post('/sign-in')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(new SanitizeMongooseModelInterceptor())
  async signIn(@Res({ passthrough: true }) response: Response, @Body() signInDto: SignInDto) {
    const tokens = await this.authService.signIn(signInDto);

    return this.setTokenInResponseCookies(response, tokens);
  }

  @ApiOkResponse()
  @Post('/sign-out')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(new SanitizeMongooseModelInterceptor())
  async signOut(@Res({ passthrough: true }) response: Response, @ActiveUser('id') userId: string) {
    if (userId) {
      await this.authService.signOut(userId);
    }
    return this.clearCookiesInResponse(response);
  }

  @ApiOkResponse()
  @Post('/refresh-tokens')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(new SanitizeMongooseModelInterceptor())
  async refreshTokens(@Res({ passthrough: true }) response: Response, @Req() request: Request) {
    const refreshToken = request.cookies[REFRESH_TOKEN_COOKIE_KEY];

    if (!refreshToken) throw new UnauthorizedException();

    const tokens = await this.authService.refreshTokens(refreshToken);
    return this.setTokenInResponseCookies(response, tokens);
  }

  @Post('/me')
  @UseGuards(AuthGuard)
  @UseInterceptors(new SanitizeMongooseModelInterceptor())
  async me(@ActiveUser('id') activeUserId: string) {
    return this.authService.me(activeUserId);
  }

  private clearCookiesInResponse(response: Response) {
    response
      .clearCookie(ACCESS_TOKEN_COOKIE_KEY)
      .clearCookie(REFRESH_TOKEN_COOKIE_KEY)
      .clearCookie(SESSION_ID_COOKIE_KEY)
      .send();
  }

  private setTokenInResponseCookies(response: Response, { accessToken, refreshToken }: TokenResponses) {
    response
      .cookie(ACCESS_TOKEN_COOKIE_KEY, accessToken, this.httpOnlyCookieOptions)
      .cookie(REFRESH_TOKEN_COOKIE_KEY, refreshToken, this.httpOnlyCookieOptions)
      .cookie(SESSION_ID_COOKIE_KEY, crypto.randomBytes(20).toString('hex'))
      .send();
  }
}
