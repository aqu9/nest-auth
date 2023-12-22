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
import { LoginDto, registerDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto, @Session() session): Promise<any> {
    const userSession = await this.authService.checkUserSession(body.email, session)
    if (!userSession) {
      throw new ForbiddenException(
        'User is already logged in on another session.',
      );
    }


    const user = await this.authService.vaidateUser(body)

    this.authService.addUserToSession(user.email, session.id);

    const accessToken = await this.authService.generateToken(
      { _id: user._id.toHexString(), email: user.email },
      process.env.ACCESS_SECRET,
      '2h',
    );

    return { ...user, accessToken };
  }


  @Post('/register')
  register(@Body() body: registerDto): Promise<any> {
    return this.authService.register(body);
  }
}
