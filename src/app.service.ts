import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    console.log('🌱 Menjalankan proses Seeding...');
    await this.seedAdminUser();
  }

  getHello(): string {
    return 'Hello World!';
  }

  private async seedAdminUser() {
    const adminEmail = 'admin@gmail.com';

    const admin = await this.usersRepository.findOneBy({ email: adminEmail });

    if (!admin) {
      console.log('Creating default admin user...');
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash('admin123', salt);

      const newAdmin = this.usersRepository.create({
        username: 'admin',
        email: adminEmail,
        password: hashedPassword,
        role: UserRole.ADMIN,
      });

      await this.usersRepository.save(newAdmin);
      console.log('Admin user successfully created.');
    } else {
      console.log('Admin user already exists.');
    }
  }
}
