import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidEmailOrPasswordException extends HttpException {
  constructor() {
    super(
      'User with this email or password does not exists.',
      HttpStatus.UNAUTHORIZED,
    );
  }
}
