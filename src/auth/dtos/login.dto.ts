import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'Admin User' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'password_admin_yang_aman' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
