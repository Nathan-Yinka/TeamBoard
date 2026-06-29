import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthMessagePatterns, AuthUserGetByIdRequest, AuthUserGetByIdResponse } from '@teamboard/shared';
import { UsersService } from '../../users/services/users.service';

@Controller()
export class AuthMessageController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern(AuthMessagePatterns.UserGetById)
  async getUserById(@Payload() payload: AuthUserGetByIdRequest): Promise<AuthUserGetByIdResponse> {
    const user = await this.usersService.findById(payload.userId);

    return {
      user: user ? this.usersService.toAuthUser(user) : null
    };
  }
}
