import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsEnum,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'john_doe', description: 'Unique username' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'S3cureP@ss123', description: 'User password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Unique email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: UserRole.ADMIN,
    description: 'User role (admin or author)',
    enum: UserRole,
  })
  @IsNotEmpty()
  @IsEnum(UserRole, { message: 'Role must be either admin or author' })
  role: UserRole;
}

export class CreateUserOnlyDto {
  @ApiProperty({ example: 'john_doe', description: 'Unique username' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'S3cureP@ss123', description: 'User password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Unique email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
