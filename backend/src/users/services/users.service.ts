import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { AuthUser } from '@teamboard/shared';
import { UsersRepository } from '../repositories/users.repository';
import { UserRecord } from '../types/user-record.type';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly usersRepository: UsersRepository) {}

  async create(name: string, email: string, passwordHash: string): Promise<UserRecord> {
    const result = await this.usersRepository.createUser(name, email, passwordHash);

    if (result.type === 'duplicate_email') {
      throw new ConflictException('Email is already registered');
    }

    const user = result.user;
    this.logger.log(`User record ${user.id} created`);
    return user;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findById(userId: string): Promise<UserRecord | null> {
    return this.usersRepository.findById(userId);
  }

  async completeTour(userId: string): Promise<UserRecord | null> {
    return this.usersRepository.completeTour(userId);
  }

  toAuthUser(user: UserRecord): AuthUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      hasCompletedTour: user.hasCompletedTour
    };
  }
}
