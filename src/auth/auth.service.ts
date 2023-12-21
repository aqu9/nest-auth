import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from 'schema';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { registerDto } from './dto';
import { Session } from 'express-session';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private activeSessions: Record<string, string> = {}; // Map userId to session ID

  constructor(
    @InjectModel('users') private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async checkUserSession(userId: string, session: Session): Promise<boolean> {
    console.log(this.activeSessions);
    const existingSessionId = this.activeSessions[userId];

    console.log(existingSessionId, session.id);

    if (existingSessionId) {
      if (existingSessionId !== session.id) {
        return false;
      }
      return true;
    }

    this.activeSessions[userId] = session.id;
    return true;
  }

  addUserToSession(userId: string, sessionId: string): void {
    this.activeSessions[userId] = sessionId;
  }

  async login(data: LoginDto, byPassWord: boolean = false) {
    const user = await this.userModel.findOne({ $or: [{ email: data.email }] });
    if (!user) {
      throw new NotFoundException('User User not found');
    }

    if (!byPassWord) {
      const isMatch = await bcrypt.compare(data.password, user.password);
      if (!isMatch) {
        console.log('passowrd not match');
        throw new NotFoundException('User User not found');
      }
    }

    return {
      isVerified: true,
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
      user: {
        email: user.email,
      },
    };
  }

  async vaidateUser(data: LoginDto) {
    const user = await this.userModel
      .findOne({ $or: [{ email: data.email }] })
      .lean();
    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      console.log('passowrd not match');
      return null;
    }

    return user;
  }

  async generateToken(
    payload: { _id: string; email: string },
    secret?: string,
    life?: string,
  ): Promise<any> {
    const token = await this.jwtService.sign(payload, {
      secret: secret,
      expiresIn: life,
    });
    return token;
  }

  async register(data: registerDto) {
    console.log('data=>', data);
    const checkEmail = await this.userModel.findOne({
      $or: [{ email: data.email }],
    });
    if (checkEmail) {
      throw new ForbiddenException(
        'an account is already registered with this email',
      );
    }
    console.log(process.env.SALT);
    data.password = await bcrypt.hash(
      data.password,
      parseInt(process.env.SALT),
    );
    const user = new this.userModel(data);

    user.save();
    delete user.password;

    const response = {
      message: 'user created successfully',
      email: user.email,
    };

    return response;
  }
}
