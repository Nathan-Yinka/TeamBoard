import { Body, Controller, Get, Logger, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCode, AuthResponse, AuthUser } from '@teamboard/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-request.interface';
import {
  ApiEnvelopeBadRequest,
  ApiEnvelopeConflict,
  ApiEnvelopeOk,
  ApiEnvelopeUnauthorized
} from '../../common/swagger/api-envelope.decorators';
import { AuthResponseDto, AuthUserResponseDto } from '../../common/swagger/response-models.dto';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { SignupDto } from '../dto/signup.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Create an account', description: 'Registers a user and returns a JWT access token.' })
  @ApiBody({ type: SignupDto })
  @ApiEnvelopeOk({
    description: 'Account created successfully.',
    model: AuthResponseDto,
    example: {
      success: true,
      code: ApiCode.Success,
      message: 'Request completed successfully',
      data: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '665f1c5c8a0f0f0012ab34cd',
          name: 'Ada Lovelace',
          email: 'ada@example.com'
        }
      },
      path: '/auth/signup',
      timestamp: '2026-06-28T12:00:00.000Z'
    }
  })
  @ApiEnvelopeBadRequest()
  @ApiEnvelopeConflict()
  signup(@Body() dto: SignupDto): Promise<AuthResponse> {
    this.logger.log(`Signup request received for ${dto.email}`);
    return this.authService.signup(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Log in', description: 'Authenticates a user and returns a JWT access token.' })
  @ApiBody({ type: LoginDto })
  @ApiEnvelopeOk({
    description: 'Login completed successfully.',
    model: AuthResponseDto,
    example: {
      success: true,
      code: ApiCode.Success,
      message: 'Request completed successfully',
      data: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '665f1c5c8a0f0f0012ab34cd',
          name: 'Ada Lovelace',
          email: 'ada@example.com'
        }
      },
      path: '/auth/login',
      timestamp: '2026-06-28T12:00:00.000Z'
    }
  })
  @ApiEnvelopeBadRequest()
  @ApiEnvelopeUnauthorized()
  login(@Body() dto: LoginDto): Promise<AuthResponse> {
    this.logger.log(`Login request received for ${dto.email}`);
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user', description: 'Returns the authenticated user profile for the bearer token.' })
  @ApiEnvelopeOk({
    description: 'Current user returned successfully.',
    model: AuthUserResponseDto,
    example: {
      success: true,
      code: ApiCode.Success,
      message: 'Request completed successfully',
      data: {
        id: '665f1c5c8a0f0f0012ab34cd',
        name: 'Ada Lovelace',
        email: 'ada@example.com'
      },
      path: '/auth/me',
      timestamp: '2026-06-28T12:00:00.000Z'
    }
  })
  @ApiEnvelopeUnauthorized()
  me(@CurrentUser() user: AuthenticatedUser): Promise<AuthUser> {
    this.logger.debug(`Current user request received for ${user.id}`);
    return this.authService.getCurrentUser(user.id);
  }

  @Patch('me/tour')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete tour', description: 'Marks the interactive tour as completed for the current user.' })
  @ApiEnvelopeOk({
    description: 'Tour completed successfully.',
    model: AuthUserResponseDto,
    example: {
      success: true,
      code: ApiCode.Success,
      message: 'Request completed successfully',
      data: {
        id: '665f1c5c8a0f0f0012ab34cd',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        hasCompletedTour: true
      },
      path: '/auth/me/tour',
      timestamp: '2026-06-28T12:00:00.000Z'
    }
  })
  @ApiEnvelopeUnauthorized()
  completeTour(@CurrentUser() user: AuthenticatedUser): Promise<AuthUser> {
    this.logger.debug(`Tour completion request received for ${user.id}`);
    return this.authService.completeTour(user.id);
  }
}
