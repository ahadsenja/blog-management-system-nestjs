import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateUserDTO } from 'src/dto/create-user.dto';
import { PrismaService } from '../services/prisma.service';
import { User, Prisma } from '@prisma/client';
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

   // Update existing user
   async updateUser(uuid: string, data: Prisma.UserUpdateInput): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { uuid } });

    if (!user) {
      throw new NotFoundException(`User with ID ${uuid} not found`);
    }

    if (typeof data.password === 'string') {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      data.password = hashedPassword;
    }

    return this.prisma.user.update({
      where: { uuid },
      data,
    });
  }

  // Delete existing user
  async deleteUser(uuid: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { uuid } });

    if (!user) {
      throw new NotFoundException(`User with ID ${uuid} not found`);
    }

    return this.prisma.user.delete({ where: { uuid } });
  }
}
