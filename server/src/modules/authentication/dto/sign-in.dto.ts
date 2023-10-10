import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class SignInDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message: 'Password must contain 1 letter, 1 number & 1 special character',
  })
  @IsNotEmpty()
  @ApiProperty()
  password: string;
}
