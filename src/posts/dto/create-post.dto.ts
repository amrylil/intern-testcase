import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    example: 'Learning NestJS',
    description: 'Title of the post (max 255 characters)',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example:
      'NestJS is a progressive Node.js framework for building efficient and scalable server-side applications.',
    description: 'Content of the post',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
