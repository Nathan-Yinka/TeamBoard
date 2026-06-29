import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Account email address.',
    example: 'ada@example.com',
    format: 'email'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Account password.',
    example: 'correct-horse-battery-staple',
    format: 'password'
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
