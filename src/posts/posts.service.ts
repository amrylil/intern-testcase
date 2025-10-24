import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import {
  PaginatedResponse,
  PaginationMeta,
} from 'src/common/interfaces/pagination.interface';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async create(createPostDto: CreatePostDto, userId: string): Promise<Post> {
    this.logger.log(`User ${userId} creating a new post`);

    const newPost = this.postsRepository.create({
      ...createPostDto,
      author: { id: userId },
    });

    return this.postsRepository.save(newPost);
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResponse<Post>> {
    this.logger.log(
      `Fetching all posts with pagination: Page ${query.page}, Limit ${query.limit}`,
    );

    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [posts, total] = await this.postsRepository.findAndCount({
      take: limit,
      skip: skip,
      relations: ['author'],
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        author: {
          id: true,
          username: true,
        },
      },
      order: { createdAt: 'DESC' },
    });

    const totalPages = Math.ceil(total / limit);

    const meta: PaginationMeta = {
      total: total,
      page: page,
      limit: limit,
      totalPages: totalPages,
    };

    return {
      data: posts,
      meta: meta,
    };
  }

  async findOne(id: string): Promise<Post> {
    this.logger.log(`Fetching post ${id}`);
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['author'],
      select: {
        author: { id: true, username: true },
      },
    });

    if (!post) {
      this.logger.warn(`Post ${id} not found`);
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    userId: string,
  ): Promise<Post> {
    this.logger.log(`User ${userId} attempting to update post ${id}`);

    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) {
      this.logger.warn(`Update failed: Post ${id} not found`);
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    if (!post.author || post.author.id !== userId) {
      this.logger.warn(
        `User ${userId} failed action on post ${id}: Not the author or post has no author`,
      );
      throw new ForbiddenException(
        'You are not allowed to perform this action',
      );
    }
    Object.assign(post, updatePostDto);

    return this.postsRepository.save(post);
  }

  async remove(id: string, userId: string): Promise<void> {
    this.logger.log(`User ${userId} attempting to delete post ${id}`);

    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) {
      this.logger.warn(`Delete failed: Post ${id} not found`);
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    if (!post.author || post.author.id !== userId) {
      this.logger.warn(
        `User ${userId} failed action on post ${id}: Not the author or post has no author`,
      );
      throw new ForbiddenException(
        'You are not allowed to perform this action',
      );
    }

    await this.postsRepository.remove(post);
    this.logger.log(`Post ${id} deleted successfully by user ${userId}`);
  }
}
