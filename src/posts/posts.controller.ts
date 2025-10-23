import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  private readonly logger = new Logger(PostsController.name);

  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ResponseMessage('Post created successfully')
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  create(@Body() createPostDto: CreatePostDto, @Request() req) {
    const userId = req.user.sub;
    this.logger.log(`[POST /posts] User ${userId} creating post`);
    return this.postsService.create(createPostDto, userId);
  }

  @Get()
  @ResponseMessage('Posts fetched successfully')
  @ApiOperation({ summary: 'Get all posts' })
  findAll() {
    this.logger.log(`[GET /posts] Fetching all posts`);
    return this.postsService.findAll();
  }

  @Get(':id')
  @ResponseMessage('Post fetched successfully')
  @ApiOperation({ summary: 'Get a single post by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`[GET /posts/${id}] Fetching post`);
    return this.postsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ResponseMessage('Post updated successfully')
  @ApiOperation({ summary: 'Update a post (Owner only)' })
  @ApiResponse({ status: 403, description: 'Forbidden. Not the owner.' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req,
  ) {
    const userId = req.user.sub;
    this.logger.log(`[PATCH /posts/${id}] User ${userId} updating post`);
    return this.postsService.update(id, updatePostDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Post deleted successfully')
  @ApiOperation({ summary: 'Delete a post (Owner only)' })
  @ApiResponse({ status: 204, description: 'Post deleted.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Not the owner.' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const userId = req.user.sub;
    this.logger.log(`[DELETE /posts/${id}] User ${userId} deleting post`);
    return this.postsService.remove(id, userId);
  }
}
