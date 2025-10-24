import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { UserSession } from './user-session.entity';
import { Exclude } from 'class-transformer';
import { Post } from 'src/posts/entities/post.entity';

export enum UserRole {
  ADMIN = 'admin',
  AUTHOR = 'author',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column({ select: false })
  @Exclude()
  password: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.AUTHOR,
  })
  role: UserRole;

  @OneToMany(() => UserSession, (session) => session.user)
  sessions: UserSession[];

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];
}
