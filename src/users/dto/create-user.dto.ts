import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'john_doe', description: 'Username unik' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'S3cureP@ss123', description: 'Password user' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password minimal harus 8 karakter' })
  password: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email unik' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
