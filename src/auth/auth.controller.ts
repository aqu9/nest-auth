import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  Session,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
// import { LoginDto } from './dto/login.dto';
import { registerDto } from './dto';
import { GetUser } from 'src/helper.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@GetUser() user, @Session() session): Promise<any> {
    // Check if the user is already logged in from another browser
    if (!this.authService.checkUserSession(user._id, session)) {
      throw new ForbiddenException(
        'User is already logged in from another session.',
      );
    }

    // Add the user to the session during login
    this.authService.addUserToSession(user._id, session.id);
    const accessToken = await this.authService.generateToken(
      { _id: user._id, email: user.email },
      process.env.ACCESS_SECRET,
      '4h',
    );

    // Continue with your login logic
    return { ...user, accessToken };
  }

  // @Post('/login')
  // login(@Body() body: LoginDto): Promise<any> {
  //   return this.authService.login(body);
  // }

  @Post('/register')
  register(@Body() body: registerDto): Promise<any> {
    return this.authService.register(body);
  }
}
