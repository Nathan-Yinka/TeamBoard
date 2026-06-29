import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({
    description: 'Display name for the account.',
    example: 'Ada Lovelace',
    minLength: 2
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: 'Unique account email address.',
    example: 'ada@example.com',
    format: 'email'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Account password.',
    example: 'correct-horse-battery-staple',
    minLength: 8,
    format: 'password'
  })
  @IsString()
  @MinLength(8)
  password: string;
}
