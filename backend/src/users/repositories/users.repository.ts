import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../schemas/user.schema';
import { UserRecord } from '../types/user-record.type';
import { UserCreateResult } from '../types/user-create-result.type';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async createUser(name: string, email: string, passwordHash: string): Promise<UserCreateResult> {
    const result = await this.userModel
      .create({ name, email, passwordHash })
      .then((user): UserCreateResult => ({ type: 'created', user: this.toRecord(user) }))
      .catch((error: object): UserCreateResult => {
        if (this.isDuplicateKeyError(error)) {
          return { type: 'duplicate_email' };
        }

        throw error;
      });

    return result;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const user = await this.userModel.findOne({ email: email.toLowerCase() }).exec();
    return user ? this.toRecord(user) : null;
  }

  async findById(userId: string): Promise<UserRecord | null> {
    if (!Types.ObjectId.isValid(userId)) {
      return null;
    }

    const user = await this.userModel.findById(userId).exec();
    return user ? this.toRecord(user) : null;
  }

  private toRecord(user: User): UserRecord {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash
    };
  }

  private isDuplicateKeyError(error: object): boolean {
    return 'code' in error && error.code === 11000;
  }
}
