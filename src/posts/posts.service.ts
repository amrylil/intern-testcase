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

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  /**
   * Membuat post baru
   * @param createPostDto Data post baru
   * @param userId ID user yang sedang login (dari token)
   */
  async create(createPostDto: CreatePostDto, userId: string): Promise<Post> {
    this.logger.log(`User ${userId} creating a new post`);

    const newPost = this.postsRepository.create({
      ...createPostDto,
      author: { id: userId }, // Menghubungkan post dengan user
    });

    return this.postsRepository.save(newPost);
  }

  /**
   * Menampilkan semua post (Publik)
   * Memuat relasi 'author' tetapi hanya memilih field yang aman
   */
  async findAll(): Promise<Post[]> {
    this.logger.log('Fetching all posts');
    return this.postsRepository.find({
      relations: ['author'],
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        author: {
          id: true,
          username: true, // Hanya tampilkan username author
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Menampilkan satu post (Publik)
   */
  async findOne(id: string): Promise<Post> {
    this.logger.log(`Fetching post ${id}`);
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['author'],
      select: {
        author: { id: true, username: true }, // Hanya tampilkan data author yg aman
      },
    });

    if (!post) {
      this.logger.warn(`Post ${id} not found`);
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  /**
   * Memperbarui post
   * @param id ID Post
   * @param updatePostDto Data update
   * @param userId ID user yang sedang login
   */
  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    userId: string,
  ): Promise<Post> {
    this.logger.log(`User ${userId} attempting to update post ${id}`);

    // Temukan post, pastikan relasi author di-load
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) {
      this.logger.warn(`Update failed: Post ${id} not found`);
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // --- LOGIKA OTORISASI ---
    // Cek apakah user yang login adalah pemilik post
    if (post.author.id !== userId) {
      this.logger.warn(
        `User ${userId} failed to update post ${id}: Not the author`,
      );
      throw new ForbiddenException('You are not allowed to update this post');
    }
    // --- AKHIR LOGIKA OTORISASI ---

    // Gabungkan data lama dengan data baru
    Object.assign(post, updatePostDto);

    return this.postsRepository.save(post);
  }

  /**
   * Menghapus post
   * @param id ID Post
   * @param userId ID user yang sedang login
   */
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

    // --- LOGIKA OTORISASI ---
    // Cek apakah user yang login adalah pemilik post
    if (post.author.id !== userId) {
      this.logger.warn(
        `User ${userId} failed to delete post ${id}: Not the author`,
      );
      throw new ForbiddenException('You are not allowed to delete this post');
    }
    // --- AKHIR LOGIKA OTORISASI ---

    await this.postsRepository.remove(post);
    this.logger.log(`Post ${id} deleted successfully by user ${userId}`);
  }
}
