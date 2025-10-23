import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { UserSession } from './user-session.entity';
import { Exclude } from 'class-transformer';
import { Post } from 'src/posts/entities/post.entity';

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

  @OneToMany(() => UserSession, (session) => session.user)
  sessions: UserSession[];

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];
}
