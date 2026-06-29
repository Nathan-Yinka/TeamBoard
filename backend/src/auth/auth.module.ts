import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppEnvironment } from '../config/env.schema';
import { UsersModule } from '../users/users.module';
import { AuthController } from './controllers/auth.controller';
import { AuthMessageController } from './controllers/auth.message-controller';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppEnvironment, true>) => ({
        secret: configService.get('jwtSecret', { infer: true }),
        signOptions: {
          expiresIn: configService.get('jwtExpiresIn', { infer: true })
        }
      })
    })
  ],
  controllers: [AuthController, AuthMessageController],
  providers: [AuthService, JwtStrategy]
})
export class AuthModule {}
