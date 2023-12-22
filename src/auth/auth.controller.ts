import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Session,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, registerDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/helper.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto, @Session() session): Promise<any> {
    const userSession = await this.authService.checkUserSession(
      body.email,
      session,
    );
    if (!userSession) {
      throw new ForbiddenException(
        'User is already logged in on another session.',
      );
    }

    const user = await this.authService.vaidateUser(body);

    this.authService.addUserToSession(user.email, session.id);

    const accessToken = await this.authService.generateToken(
      { _id: user._id.toHexString(), email: user.email },
      process.env.ACCESS_SECRET,
      '2h',
    );

    return { ...user, accessToken };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/logout')
  logout(@GetUser() user) {
    this.authService.removeUserSession(user.email);
    return 'successfully logged out';
  }

  @Post('/register')
  register(@Body() body: registerDto): Promise<any> {
    return this.authService.register(body);
  }
}
