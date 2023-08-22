import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDTO } from 'src/dto/create-user.dto';
import { PrismaService } from '../services/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  // Find all users
  async findAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  // Find user by email
  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } })
  }

  // Find user by uuid
  async findUserByUUID(uuid: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { uuid } })
  }

  async createUser(data: { email: string, password: string, name?: string }): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
        where: {
            email: data.email
        }
    })

    if (existingUser) {
        throw new ConflictException('Email alrady in use')
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
        data: {
            email: data.email,
            password: data.password,
            name: data.name,
        }
    })
  }
}
