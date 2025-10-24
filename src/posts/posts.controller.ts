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
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  private readonly logger = new Logger(PostsController.name);

  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AUTHOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @Post()
  @ResponseMessage('Post created successfully')
  @ApiOperation({ summary: 'Create a new post (Author & Admin only)' })
  @ApiResponse({ status: 201, description: 'Post created.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  create(@Body() createPostDto: CreatePostDto, @Request() req) {
    const userId = req.user.userId;
    this.logger.log(`[POST /posts] User ${userId} creating post`);
    return this.postsService.create(createPostDto, userId);
  }

  @Get()
  @ResponseMessage('Posts fetched successfully')
  @ApiOperation({ summary: 'Get all posts (Public, with pagination)' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    this.logger.log(`[GET /posts] Fetching all posts`);
    return this.postsService.findAll(paginationQuery);
  }

  @Get(':id')
  @ResponseMessage('Post fetched successfully')
  @ApiOperation({ summary: 'Get a single post by ID (Public)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`[GET /posts/${id}] Fetching post`);
    return this.postsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AUTHOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @Patch(':id')
  @ResponseMessage('Post updated successfully')
  @ApiOperation({ summary: 'Update a post (Author & Admin)' })
  @ApiResponse({ status: 403, description: 'Forbidden. Not allowed.' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    const role = req.user.role;
    this.logger.log(
      `[PATCH /posts/${id}] User ${userId} (${role}) updating post`,
    );
    return this.postsService.update(id, updatePostDto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Post deleted successfully')
  @ApiOperation({ summary: 'Delete a post (Admin only)' })
  @ApiResponse({ status: 204, description: 'Post deleted.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Admin only.' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const userId = req.user.userId;
    const role = req.user.role;
    this.logger.log(
      `[DELETE /posts/${id}] User ${userId} (${role}) deleting post`,
    );
    return this.postsService.remove(id, userId);
  }
}
