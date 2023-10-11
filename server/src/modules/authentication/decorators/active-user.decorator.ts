import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { REQUEST_USER_KEY } from '../authentication.constants';
import { ActiveUserData } from '../interfaces/active-user.interface';

export const ActiveUser = createParamDecorator((field: keyof ActiveUserData, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  const user: ActiveUserData | undefined = request[REQUEST_USER_KEY];
  return field ? user?.[field] : user;
});
