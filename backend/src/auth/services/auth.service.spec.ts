import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { UsersService } from '../../users/services/users.service';
import { UserRecord } from '../../users/types/user-record.type';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const user: UserRecord = {
    id: '507f1f77bcf86cd799439011',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    passwordHash: '$2b$10$k8QhLu6bT8T0RFwkOo.b7OIGlpsGuLshI7DzX4cTxftbJp.p5O3Iu'
  };

  const usersService = {
    create: jest.fn<Promise<UserRecord>, [string, string, string]>(),
    findByEmail: jest.fn<Promise<UserRecord | null>, [string]>(),
    findById: jest.fn<Promise<UserRecord | null>, [string]>(),
    toAuthUser: jest.fn((record: UserRecord) => ({
      id: record.id,
      name: record.name,
      email: record.email
    }))
  };

  const jwtService = {
    sign: jest.fn<string, [object]>(() => 'signed-token')
  };

  let service: AuthService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService }
      ]
    }).compile();

    service = moduleRef.get(AuthService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects duplicate signup emails', async () => {
    usersService.findByEmail.mockResolvedValue(user);

    await expect(
      service.signup({ name: 'Ada', email: 'ada@example.com', password: 'password123' })
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects login with missing user', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(service.login({ email: 'ada@example.com', password: 'password123' })).rejects.toBeInstanceOf(
      UnauthorizedException
    );
  });
});
