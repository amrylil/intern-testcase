import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSession } from 'src/users/entities/user-session.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(UserSession)
    private sessionsRepo: Repository<UserSession>,
  ) {}

  async validateUser(username: string, password: string): Promise<User> {
    this.logger.log(`Validating user: ${username}`);

    const user = await this.usersService.findOneByUsernameForAuth(username);
    if (!user) {
      this.logger.warn(`Validation failed: User ${username} not found.`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      this.logger.warn(
        `Validation failed: Invalid password for user ${username}.`,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(`User ${username} validated successfully.`);
    return user;
  }

  async login(user: User) {
    this.logger.log(
      `Attempting login for user ID: ${user.id} (${user.username})`,
    );

    const payload = { sub: user.id, username: user.username, role: user.role };

    const accessExpires: string = process.env.JWT_EXPIRATION_TIME ?? '15m';
    const refreshExpires: string =
      process.env.JWT_REFRESH_EXPIRATION_TIME ?? '7d';

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: accessExpires as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: refreshExpires as any,
    });

    const hashedRefresh = await bcrypt.hash(refreshToken, 10);

    const session = this.sessionsRepo.create({
      refreshToken: hashedRefresh,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),

      user,
    });

    try {
      await this.sessionsRepo.save(session);
      this.logger.log(`Session created successfully for user ID: ${user.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to save session for user ID: ${user.id}`,
        error.stack,
      );
      throw error;
    }

    this.logger.log(
      `Login successful, tokens generated for user ID: ${user.id}`,
    );

    const { password, sessions, ...userData } = user;

    return {
      user: userData,
      access_token: accessToken,
      access_token_expires_in: accessExpires,
      refresh_token: refreshToken,
    };
  }
  async refreshToken(oldToken: string) {
    this.logger.log('Attempting to refresh token.');
    try {
      const payload = this.jwtService.verify(oldToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        this.logger.warn(
          `Refresh token failed: User ${payload.sub} not found.`,
        );
        throw new ForbiddenException('User not found');
      }

      const sessions = await this.sessionsRepo.find({
        where: { user: { id: user.id } },
      });

      let valid = false;
      for (const s of sessions) {
        const match = await bcrypt.compare(oldToken, s.refreshToken);
        if (match) {
          valid = true;
          break;
        }
      }

      if (!valid) {
        this.logger.warn(
          `Refresh token failed: Invalid session for user ${user.id}.`,
        );
        throw new ForbiddenException('Invalid session');
      }

      this.logger.log(
        `Refresh token validated. Generating new tokens for user ${user.id}.`,
      );

      return this.login(user);
    } catch (err) {
      this.logger.error(
        'Refresh token failed: Invalid or expired token.',
        err.stack,
      );
      throw new ForbiddenException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    this.logger.log(`Attempting logout for user ID: ${userId}`);

    const result = await this.sessionsRepo.delete({ user: { id: userId } });

    if (result.affected === 0) {
      this.logger.warn(
        `Logout: No active sessions found to delete for user ID: ${userId}.`,
      );
    } else {
      this.logger.log(
        `Logout successful: Deleted ${result.affected} sessions for user ID: ${userId}.`,
      );
    }

    return { message: 'Logout successful' };
  }
}
