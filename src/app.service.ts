import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users/entities/user.entity';
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
    const adminEmail = 'admin@example.com';

    const admin = await this.usersRepository.findOneBy({ email: adminEmail });

    if (!admin) {
      console.log('Membuat user admin default...');
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash('admin123', salt);

      const newAdmin = this.usersRepository.create({
        username: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
      });
      await this.usersRepository.save(newAdmin);
      console.log('User admin berhasil dibuat.');
    } else {
      console.log('User admin sudah ada.');
    }
  }
}
