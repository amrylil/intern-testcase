import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Logger,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { JwtAuthGuard, JwtRefreshGuard } from './jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { UsersService } from 'src/users/users.service';
import {
  CreateUserDto,
  CreateUserOnlyDto,
} from 'src/users/dto/create-user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @Post('login')
  @ResponseMessage('Login successful')
  @ApiOperation({ summary: 'Log in a user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 201,
    description: 'Login successful, returns access and refresh tokens.',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() body: LoginDto) {
    this.logger.log(
      `[POST /auth/login] Request received for user: ${body.username}`,
    );
    const user = await this.authService.validateUser(
      body.username,
      body.password,
    );
    return this.authService.login(user);
  }

  @Post('register')
  @ResponseMessage('User created successfully')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserOnlyDto })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({
    status: 409,
    description: 'Email or username already exists.',
  })
  create(@Body() createUserDto: CreateUserOnlyDto) {
    this.logger.log(
      `[POST /users] Request received to create user: ${createUserDto.email}`,
    );
    return this.userService.createUserOnly(createUserDto);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Token refreshed successfully')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'New tokens generated.' })
  @ApiResponse({
    status: 403,
    description: 'Invalid or expired refresh token.',
  })
  async refresh(@Request() req) {
    this.logger.log(`[POST /auth/refresh] Request received to refresh token`);
    return this.authService.refreshToken(
      req.headers.authorization.split(' ')[1],
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Logout successful')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Log out a user' })
  @ApiResponse({ status: 204, description: 'Logout successful.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async logout(@Request() req) {
    this.logger.log(
      `[POST /auth/logout] Request received for user ID: ${req.user.userId}`,
    );
    return this.authService.logout(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ResponseMessage('Profile fetched successfully')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getProfile(@Request() req) {
    this.logger.log(
      `[GET /auth/profile] Request received for user ID: ${req.user.userId}`,
    );
    return this.userService.findOne(req.user.userId);
  }
}
