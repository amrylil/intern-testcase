// src/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import {
  PaginatedResponse,
  PaginationMeta,
} from '../common/interfaces/pagination.interface';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Attempting to create user: ${createUserDto.email}`);

    const existingUser = await this.usersRepository.findOne({
      where: [
        { email: createUserDto.email },
        { username: createUserDto.username },
      ],
    });

    if (existingUser) {
      this.logger.warn(
        `Email ${createUserDto.email} or username ${createUserDto.username} already exists.`,
      );
      throw new ConflictException('Email or username already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    try {
      const savedUser = await this.usersRepository.save(newUser);
      this.logger.log(`User created successfully with ID: ${savedUser.id}`);
      return savedUser;
    } catch (error) {
      this.logger.error('Failed to save new user to database', error.stack);
      throw error;
    }
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResponse<User>> {
    this.logger.log(
      `Fetching all users with pagination: Page ${query.page}, Limit ${query.limit}`,
    );

    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [users, total] = await this.usersRepository.findAndCount({
      take: limit,
      skip: skip,
      order: {
        username: 'ASC',
      },
    });

    const totalPages = Math.ceil(total / limit);

    const meta: PaginationMeta = {
      total: total,
      page: page,
      limit: limit,
      totalPages: totalPages,
    };

    return {
      data: users,
      meta: meta,
    };
  }

  async findOne(id: string): Promise<User> {
    this.logger.log(`Fetching user with ID: ${id}`);
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      this.logger.error(`User with ID ${id} not found`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    this.logger.log(`User with ID ${id} found`);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    this.logger.log(`Attempting to update user with ID: ${id}`);

    if (updateUserDto.password) {
      this.logger.log(`New password for user ${id} will be hashed`);
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    const user = await this.usersRepository.preload({
      id: id,
      ...updateUserDto,
    });

    if (!user) {
      this.logger.error(`Update failed: User with ID ${id} not found`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updatedUser = await this.usersRepository.save(user);
    this.logger.log(`User with ID ${id} updated successfully`);
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Attempting to delete user with ID: ${id}`);
    const result = await this.usersRepository.delete(id);

    if (result.affected === 0) {
      this.logger.error(`Delete failed: User with ID ${id} not found`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    this.logger.log(`User with ID ${id} deleted successfully`);
  }
}
