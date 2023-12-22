import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
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

  async checkUserSession(email: string, session: Session): Promise<boolean> {
    const existingSessionId = this.activeSessions[email];


    if (existingSessionId) {
      if (existingSessionId !== session.id) {
        return false;
      }
    }

    return true;

  }

  addUserToSession(email: string, sessionId: string): void {
    this.activeSessions[email] = sessionId;
  }


  async vaidateUser(data: LoginDto) {
    const user = await this.userModel
      .findOne({ $or: [{ email: data.email }] })
      .lean();
    if (!user) {
      throw new NotFoundException('User User not found');
      
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new NotFoundException('User User not found');
    }

    return user;
  }

  async generateToken(
    payload: { _id: string | ObjectId; email: string },
    secret?: string,
    life?: string,
  ): Promise<string> {
    const token = await this.jwtService.sign(payload, {
      secret: secret,
      expiresIn: life,
    });
    return token;
  }

  async register(data: registerDto) {
    const checkEmail = await this.userModel.findOne({
      $or: [{ email: data.email }],
    });
    if (checkEmail) {
      throw new ForbiddenException(
        'an account is already registered with this email',
      );
    }
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
