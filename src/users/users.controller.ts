import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUserDTO } from 'src/dto/create-user.dto';
import { UsersService } from './users.service';
import { User, Prisma } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAllUsers();
  }

  @Get(':uuid')
  async findByUUID(@Param('uuid') uuid: string): Promise<User> {
    const user = await this.usersService.findUserByUUID(uuid);

    if (!user) {
      throw new NotFoundException(`User with ID ${uuid} not found`);
    }

    return user;
  }

  @Post()
  async registerNewUser(@Body() createUserDTO: CreateUserDTO): Promise<User> {
    try {
      return await this.usersService.createUser(createUserDTO)
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException('Email already in use')
      }
      throw error;
    }
  }

  @Put(':uuid')
  async updateExistingUser(@Param('uuid') uuid: string, @Body() updateUserInput: Prisma.UserUpdateInput): Promise<User> {
    const user = await this.usersService.updateUser(uuid, updateUserInput);
    if (!user) {
      throw new NotFoundException(`User with ID ${uuid} not found`);
    }
    return user;
  }

  @Delete(':uuid')
  async deleteExistingUser(@Param('uuid') uuid: string): Promise<User> {
    const user = await this.usersService.deleteUser(uuid);

    if (!user) {
      throw new NotFoundException(`User with ID ${uuid} not found`);
    }

    return user;
  }
}

